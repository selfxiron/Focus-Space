# Focus Space

Self-hosted study tracker. Each account is isolated (single-user, multi-tenant via Supabase Auth + RLS). Track study hours, tasks, goals, and Pomodoro sessions from one dashboard.

## Features

| Area | Status |
|------|--------|
| **Auth** | Email/password sign up and sign in |
| **Dashboard** | Live stats, weekly chart, recent sessions, subject hours, tasks preview |
| **Tracker** | Live timer, manual entries, session log with delete |
| **Todos** | Kanban + table, filters, priority, due dates |
| **Subjects** | CRUD, default subjects on first visit, weekly/monthly goals with progress rings |
| **Pomodoro** | Floating widget; logs accurate duration to session log |
| **Notes** | Markdown editor with preview, auto-save, subject filter |
| **Command palette** | ⌘K / Ctrl+K navigation and quick actions |
| **Settings** | Timezone, Pomodoro defaults, JSON export, sign out |

On first load, three default subjects are seeded automatically: Study, Coursework, Projects.

## Requirements

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project (free tier works)

## Quick start

```bash
git clone https://github.com/selfxiron/Focus-Space.git
cd Focus-Space
npm install
cp .env.example .env.local   # fill in values — see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, then run the database migration (below).

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Required | Source |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Project Settings → API → **Project URL** (`https://<ref>.supabase.co`). Not the dashboard browser URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | API Keys → **Publishable** key (`sb_publishable_...`) or legacy **anon** key |
| `DATABASE_HOST` | For `db:setup` | Connect → Transaction pooler host |
| `DATABASE_PORT` | For `db:setup` | Usually `6543` (pooler) |
| `DATABASE_USER` | For `db:setup` | `postgres.<project-ref>` |
| `DATABASE_PASSWORD` | For `db:setup` | Database password (quotes if special chars) |
| `DATABASE_NAME` | For `db:setup` | `postgres` |

Alternatively, set `DATABASE_URL` instead of the discrete `DATABASE_*` vars.

**Never** commit `.env.local` or expose the service_role key or database password in client code.

## Database

Run the full migration in the Supabase SQL Editor (schema, RLS, indexes):

```text
supabase/migrations/0000_initial.sql
supabase/migrations/0001_user_settings.sql
```

Or, with database env vars set:

```bash
npm run db:setup
```

`db:setup` applies every file in `supabase/migrations/` in order.

Validate tables and RLS locally:

```bash
npm run validate:schema
```

`npm run db:push` syncs the Drizzle schema to Postgres but **does not** apply RLS policies — always run the SQL migration for a fresh project.

## Auth redirects

Supabase → Authentication → URL configuration:

| Environment | Site URL | Redirect URL |
|-------------|----------|--------------|
| Local | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Production | `https://your-domain.com` | `https://your-domain.com/auth/callback` |

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production + Preview).
4. Deploy.
5. Add your Vercel URL to Supabase auth redirects (see above).
6. Run `0000_initial.sql` on your Supabase project if not already done.

No extra build config required — Next.js is detected automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run validate:schema` | Check migration defines all tables + RLS |
| `npm run db:setup` | Apply migration via `scripts/setup-db.mjs` |
| `npm run db:push` | Push Drizzle schema (no RLS) |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Run Drizzle migrations |
| `npm run db:studio` | Drizzle Studio |

## Project structure

```text
app/
  (auth)/login, signup
  (app)/           dashboard, tracker, todos, notes, subjects, settings
  auth/callback/   OAuth / email confirmation handler
components/        UI, dashboard, tracker, todos, notes, goals, pomodoro, layout
lib/
  actions/         Server actions (mutations)
  data/            Supabase read helpers (RLS-scoped)
  supabase/        Auth clients and middleware
  db/              Drizzle schema (migrations tooling)
supabase/migrations/   SQL migrations + RLS
```

Runtime data access uses the **Supabase JS client** with the user session (RLS enforced). Drizzle is used for schema management and optional `db:push` / `db:studio`.

## Stack

Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase (Auth, Postgres, RLS), Drizzle ORM, Recharts.

Design tokens: `lib/design-tokens.css`.

## Security

- Use the publishable/anon key in client code only.
- All tables use Row Level Security (`user_id = auth.uid()`).
- Auth callback redirects are sanitized to same-origin paths only.
- Server actions validate ownership before mutations.

## License

MIT — see [LICENSE](LICENSE).
