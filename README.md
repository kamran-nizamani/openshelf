# OpenShelf — Global Online Digital Library

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Supabase (Postgres, Auth, Storage) · Vercel.
Only legally distributable books are allowed: every upload declares a licence + evidence and is moderated before it is public.

## 1. Setup

1. `npm install`
2. Create a Supabase project. In **SQL Editor** run, in order:
   `supabase/migrations/0001_schema.sql`, `0002_rls.sql`, `0003_storage_seed.sql`
3. `cp .env.example .env.local` and fill in the URL, anon key and **service-role key** (Project Settings → API).
4. Supabase → Authentication → URL Configuration: set Site URL to `NEXT_PUBLIC_SITE_URL` and add `<site>/auth/callback` to Redirect URLs. Keep **Confirm email** enabled.
5. `npm run dev`, sign up, then make yourself admin (SQL Editor):
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'you@example.com' on conflict do nothing;
   ```
   Add `'moderator'` the same way for reviewers (can moderate; cannot manage admins).

## 2. Architecture and security

| Concern | Implementation |
|---|---|
| Public catalogue | `public_books` view: approved books only, never exposes `file_path`, evidence or uploader id |
| PDFs | Private `books` bucket, no client policies; served via 10-min (read) / 60-s (download) signed URLs from `/api/books/[id]/file` |
| Roles | `user_roles` table, checked server-side (`src/lib/auth.ts`, `src/lib/staff.ts`); no client admin flag |
| RLS | Enabled on all 11 tables (`0002_rls.sql`); triggers stop users editing status/scan/strikes |
| Service-role key | Only in `src/lib/supabase/admin.ts` (`server-only`; build fails if imported client-side) |
| Uploads | `/api/upload`: auth, suspension check, rate limits, size limit, `%PDF` signature + parse, cover magic-byte check, SHA-256 duplicate detection, scan hook, status always `pending` |
| Moderation | `/admin`: approve / reject / restrict / remove / restore, edit metadata, reports, user suspension; all writes go to append-only `moderation_logs` |
| Repeat infringers | Upheld copyright removal = strike; 3 strikes auto-suspends |
| Search | Title/author/ISBN/category/full-text over `public_books`; suggestions via `search_suggestions()` |
| Ratings / downloads | Computed from real `reviews` and `downloads` rows; one review per user per book |

## 3. Needs configuration or external decisions

- **Malware scanning**: ships with a VirusTotal *hash lookup* (`MALWARE_SCAN_PROVIDER=virustotal` + `VIRUSTOTAL_API_KEY`). A hash VirusTotal has never seen is recorded as `skipped`, **not** clean; the moderator sees the status. For real scanning of unknown files, add ClamAV or a paid scan API in `scanFile()` (`src/lib/files.ts`).
- **Rate limits**: the per-minute limiter is in-memory (per serverless instance). The 24-hour upload cap is database-backed. For strict global limits use Upstash/Redis.
- **Email**: Supabase's built-in mailer is rate-limited; configure custom SMTP for production.
- **Database backups**: enable daily backups / PITR in the Supabase dashboard (paid plans).
- **Legal pages**: Privacy, Terms and Copyright pages are templates — have a lawyer review them. Set `NEXT_PUBLIC_CONTACT_EMAIL` so a real takedown contact is shown.
- **Not built yet** (architecture allows it): Urdu/English UI, author profiles, reading lists, recommendations, AI search, discussions.
- **Upload size on Vercel**: serverless request bodies are capped (~4.5 MB on Hobby/Pro for Functions). For PDFs larger than that, switch the upload to Supabase signed upload URLs (client → storage) and have the API validate the stored object afterwards.

## 4. Deploy to Vercel

1. Push to GitHub, import in Vercel.
2. Add every variable from `.env.example` (mark `SUPABASE_SERVICE_ROLE_KEY` as server-only; never prefix it `NEXT_PUBLIC_`).
3. Set `NEXT_PUBLIC_SITE_URL` to the production URL and update Supabase redirect URLs.
4. Deploy, then walk the checklist below.

## 5. Pre-launch test checklist

1. Register → verify email → log in → log out → reset password.
2. Upload a PDF as user A (status `pending`; not visible in `/explore`).
3. As admin: open `/admin/books`, review the PDF and licence, approve. It appears in `/explore` and the homepage.
4. As user B: read online, download (if allowed), save, rate, review, report.
5. As admin: restrict via a report → book disappears publicly, decision logged.
6. Confirm user B cannot open `/admin`, cannot fetch a pending book's file, and cannot see user A's library (RLS).
7. Delete account → rows and files removed.
