-- OpenShelf Supabase starter schema.
-- Run only against a new project or review as a migration before applying to an existing database.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'OpenShelf reader',
  email text not null unique,
  avatar_url text,
  bio text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author text not null,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  language text not null default 'English',
  publication_year integer check (publication_year is null or publication_year between 1000 and 3000),
  isbn text,
  publisher text,
  cover_url text,
  file_path text not null unique,
  uploader_id uuid not null references public.profiles (id) on delete cascade,
  license_type text not null check (
    license_type in ('Public Domain', 'Creative Commons', 'Author-owned', 'Explicit permission')
  ),
  license_evidence text not null,
  rights_confirmed boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  featured boolean not null default false,
  tags text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_licenses (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  license_type text not null,
  evidence_url text,
  rights_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (book_id, user_id)
);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  downloaded_at timestamptz not null default now()
);

create table if not exists public.reading_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  last_page integer not null default 1 check (last_page >= 1),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books (id) on delete set null,
  book_url text,
  user_id uuid references public.profiles (id) on delete set null,
  reporter_email text,
  report_type text not null,
  details text not null,
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('admin', 'moderator', 'member')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books (id) on delete set null,
  moderator_id uuid references public.profiles (id) on delete set null,
  action text not null,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists idx_books_status on public.books (status);
create index if not exists idx_books_category_id on public.books (category_id);
create index if not exists idx_books_author on public.books (author);
create index if not exists idx_books_title on public.books (title);
create index if not exists idx_reviews_book_id on public.reviews (book_id);
create index if not exists idx_reports_status on public.reports (status);
create index if not exists idx_reading_history_user_updated on public.reading_history (user_id, updated_at desc);

insert into public.categories (name, description) values
  ('Technology', 'Software, hardware, and digital innovation'),
  ('Artificial Intelligence', 'Machine intelligence, ethics, and practical applications'),
  ('Machine Learning', 'Algorithms, models, and predictive systems'),
  ('Computer Science', 'Core theory and systems design'),
  ('Programming', 'Applied coding skills and software craft'),
  ('Science', 'Research, experiments, and scientific literacy'),
  ('Mathematics', 'Logic, reasoning, and quantitative methods'),
  ('Business', 'Operations, leadership, and strategy'),
  ('Entrepreneurship', 'Startup strategy and business building'),
  ('Education', 'Learning theory and instruction'),
  ('History', 'Civilizations, change, and legacy'),
  ('Literature', 'Stories, voices, and cultural memory'),
  ('Novels', 'Long-form fiction and imaginative worlds'),
  ('Psychology', 'Mind, behavior, and human flourishing'),
  ('Engineering', 'Structures, systems, and design'),
  ('Self Development', 'Growth, habits, and personal mastery')
on conflict (name) do update set description = excluded.description;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
before update on public.books
for each row execute function public.set_updated_at();

drop trigger if exists reading_history_set_updated_at on public.reading_history;
create trigger reading_history_set_updated_at
before update on public.reading_history
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'OpenShelf reader'),
    coalesce(new.email, '')
  )
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.has_role(target_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = target_role
  );
$$;

revoke all on function public.has_role(text) from public, anon;
grant execute on function public.has_role(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.books enable row level security;
alter table public.book_licenses enable row level security;
alter table public.saved_books enable row level security;
alter table public.reviews enable row level security;
alter table public.downloads enable row level security;
alter table public.reading_history enable row level security;
alter table public.reports enable row level security;
alter table public.user_roles enable row level security;
alter table public.moderation_logs enable row level security;

drop policy if exists "Profiles are visible to their owner" on public.profiles;
create policy "Profiles are visible to their owner"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, bio, country) on public.profiles to authenticated;

drop policy if exists "Categories are public" on public.categories;
create policy "Categories are public"
on public.categories for select to anon, authenticated
using (true);

drop policy if exists "Anyone can read approved books" on public.books;
create policy "Anyone can read approved books"
on public.books for select to anon
using (status = 'approved');

drop policy if exists "Authenticated users can read approved and permitted books" on public.books;
create policy "Authenticated users can read approved and permitted books"
on public.books for select to authenticated
using (
  status = 'approved'
  or uploader_id = (select auth.uid())
  or (select public.has_role('admin'))
  or (select public.has_role('moderator'))
);

drop policy if exists "Users can submit pending books with rights confirmed" on public.books;
drop policy if exists "Users can create their own books" on public.books;
create policy "Users can submit pending books with rights confirmed"
on public.books for insert to authenticated
with check (
  uploader_id = (select auth.uid())
  and status = 'pending'
  and rights_confirmed = true
);

drop policy if exists "Moderators can update books" on public.books;
drop policy if exists "Users can update their own books" on public.books;
create policy "Moderators can update books"
on public.books for update to authenticated
using (
  (select public.has_role('admin'))
  or (select public.has_role('moderator'))
)
with check (
  (select public.has_role('admin'))
  or (select public.has_role('moderator'))
);

drop policy if exists "Uploaders can delete their pending books" on public.books;
create policy "Uploaders can delete their pending books"
on public.books for delete to authenticated
using (uploader_id = (select auth.uid()) and status = 'pending');

drop policy if exists "Uploaders and moderators can view license evidence" on public.book_licenses;
create policy "Uploaders and moderators can view license evidence"
on public.book_licenses for select to authenticated
using (
  exists (
    select 1 from public.books
    where books.id = book_licenses.book_id
      and (
        books.uploader_id = (select auth.uid())
        or (select public.has_role('admin'))
        or (select public.has_role('moderator'))
      )
  )
);

drop policy if exists "Users can view their saved books" on public.saved_books;
drop policy if exists "Users can view their own saved books" on public.saved_books;
create policy "Users can view their saved books"
on public.saved_books for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can save books" on public.saved_books;
drop policy if exists "Users can manage their own saved books" on public.saved_books;
create policy "Users can save books"
on public.saved_books for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can remove their saved books" on public.saved_books;
create policy "Users can remove their saved books"
on public.saved_books for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Approved book reviews are public" on public.reviews;
create policy "Approved book reviews are public"
on public.reviews for select to anon, authenticated
using (
  exists (
    select 1 from public.books
    where books.id = reviews.book_id and books.status = 'approved'
  )
);

drop policy if exists "Users can write reviews for approved books" on public.reviews;
create policy "Users can write reviews for approved books"
on public.reviews for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.books
    where books.id = reviews.book_id and books.status = 'approved'
  )
);

drop policy if exists "Users can update their own reviews" on public.reviews;
drop policy if exists "Users can manage their own reviews" on public.reviews;
create policy "Users can update their own reviews"
on public.reviews for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete their own reviews" on public.reviews;
create policy "Users can delete their own reviews"
on public.reviews for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can view their own download records" on public.downloads;
create policy "Users can view their own download records"
on public.downloads for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can record their own downloads" on public.downloads;
create policy "Users can record their own downloads"
on public.downloads for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can manage their reading history" on public.reading_history;
drop policy if exists "Users can read their own history" on public.reading_history;
create policy "Users can manage their reading history"
on public.reading_history for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users can view their own reports" on public.reports;
create policy "Users can view their own reports"
on public.reports for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Signed-in users can submit reports" on public.reports;
drop policy if exists "Users can manage their own reports" on public.reports;
create policy "Signed-in users can submit reports"
on public.reports for insert to authenticated
with check (user_id = (select auth.uid()) and status = 'open');

drop policy if exists "Moderators can view all reports" on public.reports;
create policy "Moderators can view all reports"
on public.reports for select to authenticated
using (
  (select public.has_role('admin'))
  or (select public.has_role('moderator'))
);

drop policy if exists "Users can view their own role rows" on public.user_roles;
drop policy if exists "Admins can view all roles" on public.user_roles;
create policy "Users can view their own role rows"
on public.user_roles for select to authenticated
using (
  user_id = (select auth.uid())
  or (select public.has_role('admin'))
);

drop policy if exists "Moderators can view moderation logs" on public.moderation_logs;
create policy "Moderators can view moderation logs"
on public.moderation_logs for select to authenticated
using (
  (select public.has_role('admin'))
  or (select public.has_role('moderator'))
);

drop policy if exists "Moderators can add moderation logs" on public.moderation_logs;
drop policy if exists "Admins can moderate content" on public.moderation_logs;
create policy "Moderators can add moderation logs"
on public.moderation_logs for insert to authenticated
with check (
  moderator_id = (select auth.uid())
  and (
    (select public.has_role('admin'))
    or (select public.has_role('moderator'))
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('book-covers', 'book-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('book-files', 'book-files', false, 20971520, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view book covers" on storage.objects;
create policy "Public can view book covers"
on storage.objects for select to anon, authenticated
using (bucket_id = 'book-covers');

drop policy if exists "Users can upload covers to their own folder" on storage.objects;
create policy "Users can upload covers to their own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'book-covers'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can upload book PDFs to their own folder" on storage.objects;
create policy "Users can upload book PDFs to their own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'book-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Owners and approved books can read book PDFs" on storage.objects;
create policy "Owners and approved books can read book PDFs"
on storage.objects for select to anon
using (
  bucket_id = 'book-files'
  and exists (
    select 1 from public.books
    where books.file_path = storage.objects.name
      and books.status = 'approved'
  )
);

drop policy if exists "Authenticated users can read permitted book PDFs" on storage.objects;
create policy "Authenticated users can read permitted book PDFs"
on storage.objects for select to authenticated
using (
  bucket_id = 'book-files'
  and (
    exists (
      select 1 from public.books
      where books.file_path = storage.objects.name
        and books.status = 'approved'
    )
    or (storage.foldername(name))[1] = (select auth.uid())::text
    or (select public.has_role('admin'))
    or (select public.has_role('moderator'))
  )
);
