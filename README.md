# GymFlow

GymFlow is a multi-tenant gym management SaaS MVP built with React, Vite, Tailwind CSS, Lucide React, Recharts, React Router, and Supabase-ready PostgreSQL policies.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app starts in a clearly labeled demo mode when Supabase is not configured. Demo mode keeps member, payment, and attendance changes in memory only.

## Supabase setup

1. Create a free Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Add the project URL and browser-safe anon key:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Apply `supabase/migrations/001_gymflow_schema.sql` using the Supabase SQL editor or Supabase CLI.
5. Enable email authentication in Supabase Auth.
6. Restart the Vite server.

The migration creates the signup trigger that creates a profile, gym, and owner staff row from signup metadata. It also enables RLS on every gym-owned table. Never put a service-role key in `.env.local` or frontend code.

## Available routes

- `/` landing page
- `/login`, `/signup`, `/forgot-password`
- `/dashboard`
- `/members`, `/members/:id`, `/add-member`
- `/attendance`, `/plans`, `/subscriptions`, `/payments`
- `/reports`, `/staff`, `/settings`, `/gym-profile`, `/billing`

## Verification

```bash
npm run build
```

The build currently succeeds. The bundle-size warning is from the Recharts/Lucide client bundle and does not prevent deployment. Supabase-backed CRUD, cross-gym isolation, and real authentication require a configured Supabase project and should be verified against two test gym accounts before production launch.

## Security notes

- Database RLS is the authorization boundary; frontend role checks are only presentation logic.
- Every business table has `gym_id` and policies use owner/staff membership checks.
- Active duplicate check-ins are blocked with a partial unique index.
- Payments store metadata only (`amount`, method, status, source); card numbers are never collected.
- `.env`, `.env.local`, and other local environment files are ignored.
