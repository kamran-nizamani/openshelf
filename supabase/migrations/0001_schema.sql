-- OpenShelf schema. Run in order: 0001_schema.sql, 0002_rls.sql, 0003_storage_seed.sql

create extension if not exists "pgcrypto";
create extension if not exists pg_trgm;

-- ENUMS -------------------------------------------------------------------
create type book_status as enum ('pending', 'approved', 'rejected', 'removed', 'restricted');
create type license_kind as enum ('public_domain', 'creative_commons', 'author_owned', 'explicit_permission');
create type app_role as enum ('user', 'moderator', 'admin');
create type report_status as enum ('open', 'investigating', 'resolved', 'dismissed');
create type report_kind as enum ('copyright', 'inappropriate', 'broken_file', 'wrong_metadata', 'other');
create type scan_status as enum ('pending', 'clean', 'infected', 'skipped', 'error');

-- profiles ----------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  avatar_url text,
  country text check (country is null or char_length(country) <= 80),
  bio text check (bio is null or char_length(bio) <= 500),
  is_public boolean not null default true,
  suspended boolean not null default false,
  suspended_reason text,
  strikes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- user_roles --------------------------------------------------------------
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- categories --------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0
);

-- books -------------------------------------------------------------------
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 300),
  author text not null check (char_length(author) between 1 and 200),
  description text not null check (char_length(description) between 20 and 5000),
  category_id uuid not null references public.categories(id),
  language text not null check (char_length(language) between 2 and 10),
  publication_year integer check (publication_year is null or publication_year between 1000 and 2100),
  isbn text check (isbn is null or isbn ~ '^[0-9Xx-]{10,17}$'),
  publisher text check (publisher is null or char_length(publisher) <= 200),
  page_count integer check (page_count is null or page_count > 0),
  cover_url text,            -- public path in the covers bucket
  file_path text not null,   -- PRIVATE path in the books bucket; never sent to clients
  file_size bigint,
  file_sha256 text,
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  license_type license_kind not null,
  license_evidence text not null check (char_length(license_evidence) >= 10),
  allow_download boolean not null default true,
  rights_confirmed boolean not null check (rights_confirmed = true),
  status book_status not null default 'pending',
  scan scan_status not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  search tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index books_file_sha256_unique on public.books (file_sha256)
  where file_sha256 is not null and status in ('pending', 'approved', 'restricted');
create index books_status_created_idx on public.books (status, created_at desc);
create index books_category_idx on public.books (category_id);
create index books_uploader_idx on public.books (uploader_id);
create index books_language_idx on public.books (language);
create index books_isbn_idx on public.books (isbn);
create index books_search_idx on public.books using gin (search);
create index books_title_trgm_idx on public.books using gin (title gin_trgm_ops);
create index books_author_trgm_idx on public.books using gin (author gin_trgm_ops);

-- book_licenses: reference list of supported licence options -------------
create table public.book_licenses (
  type license_kind primary key,
  label text not null,
  description text not null,
  evidence_hint text not null,
  allows_download boolean not null default true
);

-- saved_books -------------------------------------------------------------
create table public.saved_books (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- reviews -----------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text check (body is null or char_length(body) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, user_id)
);
create index reviews_book_idx on public.reviews (book_id, created_at desc);

-- downloads ---------------------------------------------------------------
create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index downloads_book_idx on public.downloads (book_id);
create index downloads_user_idx on public.downloads (user_id, created_at desc);

-- reading_history ---------------------------------------------------------
create table public.reading_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  last_page integer not null default 1 check (last_page > 0),
  last_read_at timestamptz not null default now(),
  primary key (user_id, book_id)
);
create index reading_history_user_idx on public.reading_history (user_id, last_read_at desc);

-- reports -----------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id) on delete set null,
  reported_user_id uuid references auth.users(id) on delete set null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reporter_email text,
  kind report_kind not null,
  details text not null check (char_length(details) between 10 and 4000),
  claimant_name text,
  claimant_contact text,
  status report_status not null default 'open',
  resolution_note text,
  handled_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (book_id is not null or reported_user_id is not null)
);
create index reports_status_idx on public.reports (status, created_at desc);
create index reports_book_idx on public.reports (book_id);

-- moderation_logs (append-only audit trail) -------------------------------
create table public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  book_id uuid,
  target_user_id uuid,
  report_id uuid,
  note text,
  created_at timestamptz not null default now()
);
create index moderation_logs_created_idx on public.moderation_logs (created_at desc);

-- FUNCTIONS & TRIGGERS ----------------------------------------------------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger books_touch before update on public.books
  for each row execute function public.touch_updated_at();
create trigger reviews_touch before update on public.reviews
  for each row execute function public.touch_updated_at();

create or replace function public.books_search_update() returns trigger
language plpgsql as $$
declare cat_name text;
begin
  select name into cat_name from public.categories where id = new.category_id;
  new.search :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.author, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(cat_name, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.isbn, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'D');
  return new;
end $$;
create trigger books_search_trg before insert or update of title, author, description, category_id, isbn
  on public.books for each row execute function public.books_search_update();

-- Role helpers (SECURITY DEFINER so RLS policies can call them safely)
create or replace function public.has_role(uid uuid, r app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = uid and role = r)
$$;

create or replace function public.is_staff(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = uid and role in ('admin','moderator'))
$$;

create or replace function public.is_suspended(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select suspended from public.profiles where id = uid), false)
$$;

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent users changing moderation-controlled fields on their own books
create or replace function public.books_guard_owner_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff(auth.uid()) or auth.uid() is null then
    return new;  -- staff or service role (auth.uid() is null)
  end if;
  if new.status is distinct from old.status
     or new.scan is distinct from old.scan
     or new.file_path is distinct from old.file_path
     or new.uploader_id is distinct from old.uploader_id
     or new.reviewed_by is distinct from old.reviewed_by
     or new.rejection_reason is distinct from old.rejection_reason then
    raise exception 'Not allowed to change moderation fields';
  end if;
  -- Editing metadata of a published book sends it back to review
  if old.status = 'approved' then
    new.status := 'pending';
  end if;
  return new;
end $$;
create trigger books_guard before update on public.books
  for each row execute function public.books_guard_owner_update();

-- Prevent users self-editing suspension / strikes
create or replace function public.profiles_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff(auth.uid()) or auth.uid() is null then return new; end if;
  if new.suspended is distinct from old.suspended
     or new.suspended_reason is distinct from old.suspended_reason
     or new.strikes is distinct from old.strikes then
    raise exception 'Not allowed to change account status';
  end if;
  return new;
end $$;
create trigger profiles_guard_trg before update on public.profiles
  for each row execute function public.profiles_guard();

-- Public rating aggregates + verified download counts (no fake numbers)
create or replace view public.book_stats with (security_invoker = false) as
select b.id as book_id,
       coalesce(round(avg(r.rating)::numeric, 2), 0) as avg_rating,
       count(distinct r.id) as review_count,
       (select count(*) from public.downloads d where d.book_id = b.id) as download_count
from public.books b
left join public.reviews r on r.book_id = b.id
where b.status = 'approved'
group by b.id;

-- Public-safe books view: never exposes file_path, evidence, or uploader id
create or replace view public.public_books with (security_invoker = false) as
select b.id, b.title, b.author, b.description, b.category_id, c.name as category_name, c.slug as category_slug,
       b.language, b.publication_year, b.isbn, b.publisher, b.page_count, b.cover_url, b.file_size,
       b.license_type, b.allow_download, b.created_at, b.search,
       p.full_name as uploader_name,
       coalesce(s.avg_rating, 0) as avg_rating,
       coalesce(s.review_count, 0) as review_count,
       coalesce(s.download_count, 0) as download_count
from public.books b
join public.categories c on c.id = b.category_id
join public.profiles p on p.id = b.uploader_id
left join public.book_stats s on s.book_id = b.id
where b.status = 'approved';

grant select on public.public_books to anon, authenticated;
grant select on public.book_stats to anon, authenticated;

-- Search suggestions (title/author prefix + trigram)
create or replace function public.search_suggestions(q text, lim int default 6)
returns table (id uuid, title text, author text)
language sql stable security definer set search_path = public as $$
  select id, title, author from public.public_books
  where title ilike '%' || q || '%' or author ilike '%' || q || '%'
  order by similarity(title, q) desc, created_at desc
  limit least(lim, 10)
$$;
grant execute on function public.search_suggestions(text, int) to anon, authenticated;


-- Storage usage for the admin dashboard (service role only)
create or replace function public.admin_storage_bytes() returns bigint
language sql stable security definer set search_path = public as $$
  select coalesce(sum(file_size), 0)::bigint from public.books
$$;
revoke all on function public.admin_storage_bytes() from public, anon, authenticated;
grant execute on function public.admin_storage_bytes() to service_role;
