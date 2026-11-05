-- Row Level Security. Server routes using the service-role key bypass RLS,
-- so every API route must perform its own authorization (see src/lib/auth.ts).

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.books enable row level security;
alter table public.book_licenses enable row level security;
alter table public.saved_books enable row level security;
alter table public.reviews enable row level security;
alter table public.downloads enable row level security;
alter table public.reading_history enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_logs enable row level security;

-- profiles: public profiles are readable; owners edit their own; staff read all
create policy profiles_select on public.profiles for select
  using (is_public or id = auth.uid() or public.is_staff(auth.uid()));
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_staff_update on public.profiles for update
  using (public.is_staff(auth.uid()));

-- user_roles: users see their own roles; only admins manage roles
create policy roles_select_own on public.user_roles for select
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy roles_admin_write on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- categories & licences: world-readable, admin-managed
create policy categories_read on public.categories for select using (true);
create policy categories_admin on public.categories for all
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy licenses_read on public.book_licenses for select using (true);
create policy licenses_admin on public.book_licenses for all
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- books: base table is NOT public. Visitors use the public_books view.
create policy books_select_own on public.books for select using (uploader_id = auth.uid());
create policy books_select_staff on public.books for select using (public.is_staff(auth.uid()));
create policy books_insert_own on public.books for insert
  with check (
    uploader_id = auth.uid()
    and status = 'pending'
    and rights_confirmed = true
    and not public.is_suspended(auth.uid())
  );
create policy books_update_own on public.books for update
  using (uploader_id = auth.uid() and status in ('pending', 'approved', 'rejected'))
  with check (uploader_id = auth.uid());
create policy books_update_staff on public.books for update
  using (public.is_staff(auth.uid()));
create policy books_delete_own on public.books for delete
  using (uploader_id = auth.uid() and status in ('pending', 'approved', 'rejected'));
create policy books_delete_admin on public.books for delete
  using (public.has_role(auth.uid(), 'admin'));

-- saved_books / reading_history: strictly private
create policy saved_own on public.saved_books for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy history_own on public.reading_history for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reviews: readable for approved books; authors manage their own
create policy reviews_read on public.reviews for select
  using (exists (select 1 from public.books b where b.id = book_id and b.status = 'approved')
         or user_id = auth.uid() or public.is_staff(auth.uid()));
create policy reviews_insert on public.reviews for insert
  with check (user_id = auth.uid() and not public.is_suspended(auth.uid())
              and exists (select 1 from public.books b where b.id = book_id and b.status = 'approved'));
create policy reviews_update_own on public.reviews for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reviews_delete_own on public.reviews for delete using (user_id = auth.uid());
create policy reviews_staff_delete on public.reviews for delete using (public.is_staff(auth.uid()));

-- downloads: users see own; staff see all. Inserts happen server-side only.
create policy downloads_select_own on public.downloads for select using (user_id = auth.uid());
create policy downloads_select_staff on public.downloads for select using (public.is_staff(auth.uid()));

-- reports: anyone signed in can file; reporters see their own; staff manage
create policy reports_insert on public.reports for insert
  with check (reporter_id = auth.uid() and not public.is_suspended(auth.uid()));
create policy reports_select_own on public.reports for select using (reporter_id = auth.uid());
create policy reports_staff_select on public.reports for select using (public.is_staff(auth.uid()));
create policy reports_staff_update on public.reports for update using (public.is_staff(auth.uid()));

-- moderation_logs: staff read; inserted by staff; no update/delete policies => append-only
create policy modlogs_staff_select on public.moderation_logs for select using (public.is_staff(auth.uid()));
create policy modlogs_staff_insert on public.moderation_logs for insert
  with check (public.is_staff(auth.uid()) and actor_id = auth.uid());
