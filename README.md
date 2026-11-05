# OpenShelf

OpenShelf is a full-stack online digital library focused on legally distributable educational and informational content. The project is designed to run as a Next.js application with Supabase for database, auth, storage, and row-level security.

## Tech stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage

## Features implemented in this codebase

- Public landing page with search and featured content
- Book catalogue and detail pages
- Upload form for legal submissions
- User dashboard shell
- Admin moderation shell
- API routes for books and upload requests
- Supabase schema and security policy scaffolding
- README and environment template for deployment

## Important note

The current UI still uses sample book data and preview-only auth, upload, and report forms. Supabase is not yet wired into those screens. Create and configure a Supabase project using the [step-by-step Supabase setup guide](./SUPABASE_SETUP.md) before connecting the app features.

## Local setup

1. Install dependencies:

   npm install

2. Create a local environment file (PowerShell):

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Add your Supabase project URL and public anon/publishable key to `.env.local`:

   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=

4. Start the application:

   npm run dev

5. Visit http://localhost:3000

## Supabase setup

Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for project creation, schema, Auth settings, local environment, verification, and the next integration steps.

## Production and security checklist

- Use RLS policies and server-side authorization.
- Never expose a service-role/secret key in a `NEXT_PUBLIC_*` variable or client-side code.
- Validate upload file types and signatures before storage.
- Use signed URLs for private PDFs.
- Monitor moderation reports and repeated infringements.
- Review copyright policy before public launch.

## External configuration needed

The project expects the following external services and credentials before launch:

- Supabase project URL and anon key
- Supabase database and storage access
- Optional Vercel deployment environment variables
- External malware scanning or document validation service for production uploads
