# Finance Domain — Supabase Setup Guide

Manual steps to bring the Finance blog/admin live once **you** create the
Supabase project. Nothing here is automated — Supabase auth users cannot be
created via raw SQL (`auth.users` is managed by the Auth API), so the admin
account is created through the dashboard.

> 🔑 **This is where real credentials get plugged in.** Fill
> `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
> `SUPABASE_SERVICE_ROLE_KEY` (values from Project Settings → API) into your
> local `.env` / hosting env vars. Never commit real values.

---

## Step 1 — Create the project

1. Create a project in the Supabase dashboard (any region close to your users).
2. Save the database password somewhere safe.
3. From **Project Settings → API**, copy the three values listed above into
   your environment (`.env` locally; keep `.env.example` as the placeholder
   template).

## Step 2 — Apply the schema

1. Open **SQL Editor** in the dashboard.
2. Paste the full contents of `supabase/schema.sql` and run it.
   This creates the `post_status` enum, the seven tables
   (`authors`, `categories`, `tags`, `posts`, `post_tags`, `media`,
   `newsletter_subscribers`), indexes, `updated_at` triggers, and all RLS
   policies (public read = `status='published' AND published_at <= now()` for
   posts; writes = authenticated only; subscribers have no public policies).
3. Verify: **Table Editor** should list all seven tables, and every table
   should show RLS enabled.

## Step 3 — Set up Storage

1. Still in the SQL Editor, paste and run `supabase/storage.sql`.
   This creates the public `media` bucket plus its policies
   (public read, authenticated-only writes) that
   `src/domains/finance/data/media.ts` uploads into.

## Step 4 — Create the admin user (dashboard, NOT SQL)

1. Go to **Authentication → Users → Add User → Create new user**.
2. Enter the admin's email and a strong password. Choose **Auto Confirm User: ON**
   (this account signs in with email+password only; there is no self-signup
   and no email confirmation flow in the app).
3. That's the whole account. There is exactly one admin by design; add
   editors later the same way. RLS policies in `schema.sql` grant full
   read/write to **any** `authenticated` user, so each account created here
   is effectively an admin — do not share these credentials.

## Step 5 — Verify the app against the live project

1. Start the app with the real env values loaded.
2. `GET /finance` should render (no posts yet — empty state).
3. Sign in at `/finance/admin/login` with the dashboard-created account.
4. Create a category, a tag, and a draft post (seed data below gives you a
   shortcut), confirm the post appears in the admin list, and that
   `/finance/blog` still shows nothing (drafts are not public).
5. Publish a test post and confirm it appears publicly within the ISR window
   (home/blog re-render every 5 min, post pages every 10 min).

## Seed data (optional)

`supabase/seed.sql` inserts one draft post (plus 2 categories, 2 tags, 1
author) — enough to exercise the admin CRUD flow with zero fake-content risk.
Run it in the SQL Editor **after** `schema.sql`. It intentionally contains no
published or scheduled posts, so nothing becomes publicly visible until you
publish from the admin.

## Notes

- All scripts are idempotent-ish for re-runs of the *docs*: `schema.sql` uses
  `create type/table` without `if not exists` in places — run each script
  **once** against a fresh project; re-running may error on existing objects.
- Service-role key is used only inside server-side code
  (`src/domains/finance/lib/supabase/server.ts`, guarded by `server-only`).
  It is never exposed to the browser bundle.
- Future option (not implemented): on-demand revalidation
  (`revalidatePath('/finance')` etc. from admin save actions) to make new
  posts visible instantly instead of waiting out the ISR window. The timed
  windows are sufficient for now.
