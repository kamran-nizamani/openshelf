-- Storage buckets
-- books: PRIVATE (PDFs). Access only through short-lived signed URLs generated server-side.
-- covers: public (cover thumbnails only).
-- avatars: public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('books', 'books', false, 52428800, array['application/pdf']),
  ('covers', 'covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- No client policies on the books bucket: uploads and reads go through server routes
-- (service role) after validation, so no direct client access to PDFs is possible.

-- covers/avatars: public read; users write only inside their own folder (<uid>/...)
create policy "covers public read" on storage.objects for select using (bucket_id = 'covers');
create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars own write" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars own update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars own delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Licence reference data
insert into public.book_licenses (type, label, description, evidence_hint, allows_download) values
  ('public_domain', 'Public Domain', 'Copyright has expired or been waived.', 'Link to the source (e.g. Project Gutenberg) or the author''s death year.', true),
  ('creative_commons', 'Creative Commons', 'Published under a Creative Commons licence that permits redistribution.', 'State the exact licence (e.g. CC BY 4.0) and link to it.', true),
  ('author_owned', 'Author-owned', 'You are the author and own the rights.', 'Describe your authorship (name, publication, website).', true),
  ('explicit_permission', 'Explicit permission', 'The copyright holder allowed redistribution.', 'Name the rights holder and describe or link to the written permission.', true)
on conflict (type) do nothing;

-- Categories
insert into public.categories (name, slug, sort_order) values
  ('Technology', 'technology', 1), ('Artificial Intelligence', 'artificial-intelligence', 2),
  ('Machine Learning', 'machine-learning', 3), ('Computer Science', 'computer-science', 4),
  ('Programming', 'programming', 5), ('Science', 'science', 6), ('Mathematics', 'mathematics', 7),
  ('Business', 'business', 8), ('Entrepreneurship', 'entrepreneurship', 9), ('Education', 'education', 10),
  ('History', 'history', 11), ('Literature', 'literature', 12), ('Novels', 'novels', 13),
  ('Psychology', 'psychology', 14), ('Engineering', 'engineering', 15), ('Self Development', 'self-development', 16)
on conflict (slug) do nothing;

-- To create the first admin, after signing up run (replace the email):
-- insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = 'you@example.com' on conflict do nothing;
