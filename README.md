# Focus Space

Self-hosted study tracker. Each account is isolated (single-user, multi-tenant via Supabase Auth + RLS). Tracks study hours, tasks, notes, goals, and Pomodoro sessions.

## Requirements

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project (free tier works)

## Quick start (local)

```bash
npm install
cp .env.example .env.local   # fill in values — see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → **Project URL** (`https://<ref>.supabase.co`). Not the dashboard browser URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API Keys → **Publishable** key (`sb_publishable_...`) or legacy **anon** key |
| `DATABASE_URL` | Optional for `npm run db:push` only — Connect → transaction pooler, port **6543** |

## Database

Run `supabase/migrations/0000_initial.sql` in the Supabase SQL Editor (schema + RLS).

Alternatively, with `DATABASE_URL` set:

```bash
npm run db:push
```

`db:push` syncs the Drizzle schema but does not apply RLS policies. Run the SQL migration for RLS.

## Auth redirects

Supabase → Authentication → URL configuration:

| Environment | Site URL | Redirect URL |
|-------------|----------|--------------|
| Local | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Production | `https://your-domain.com` | `https://your-domain.com/auth/callback` |

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add the three environment variables from `.env.example` (Production + Preview).
4. Deploy.
5. Add your Vercel URL to Supabase auth redirects (see above).

No extra build config required — Next.js is detected automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Drizzle schema to Postgres |
| `npm run db:studio` | Drizzle Studio |

## Structure

```
app/
  (auth)/          login, signup
  (app)/           dashboard, tracker, todos, notes, subjects, settings
  auth/callback/   auth callback handler
components/        UI, dashboard widgets, layout
lib/supabase/      Auth clients and middleware helpers
lib/db/            Drizzle schema and client
supabase/migrations/   SQL migrations
```

## Stack

Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase (Auth, Postgres, RLS), Drizzle ORM, Recharts.

Design tokens: `lib/design-tokens.css`.

## Security

- Never commit `.env.local` or secrets.
- Use the publishable/anon key in client code only.
- Never expose secret/service_role keys or `DATABASE_URL` to the browser.
- Server-side Drizzle queries must filter by `user_id`; the Postgres connection bypasses RLS.

## License

MIT — see [LICENSE](LICENSE).
