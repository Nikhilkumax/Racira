-- ============================================================================
-- Racira Finance — Supabase schema
-- Mirrors the row shapes in src/types/finance/db.ts (id columns are uuid with
-- defaults; the TS types type them as `string`, which uuid satisfies).
--
-- Publish model: NO cron-based status flip. Readers must filter
--   status = 'published' AND published_at <= now()
-- which is enforced by the public RLS read policy below and by the query
-- layer in src/domains/finance/data/*.ts.
--
-- SETUP: see supabase/README-setup.md for the full manual walkthrough.
--   1. Run THIS file first (SQL Editor → paste → Run).
--   2. Then run supabase/storage.sql (media bucket + policies).
--   3. Then optionally run supabase/seed.sql (1 draft post + taxonomy).
--   4. Create the admin user via Authentication → Users → Add User —
--      auth users CANNOT be created via raw SQL.
-- ============================================================================

-- ── Enum ───────────────────────────────────────────────────────────────────
create type post_status as enum ('draft', 'scheduled', 'published');

-- ── authors ────────────────────────────────────────────────────────────────
-- TS: interface Author (src/types/finance/db.ts)
create table authors (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  bio        text not null default '',
  avatar_url text not null default '',
  role       text not null default '',
  twitter    text,
  linkedin   text,
  created_at timestamptz not null default now()
);

-- ── categories ─────────────────────────────────────────────────────────────
-- TS: interface Category
create table categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text not null default '',
  color       text not null default '#059669',
  created_at  timestamptz not null default now()
);

-- ── tags ───────────────────────────────────────────────────────────────────
-- TS: interface Tag
create table tags (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  created_at timestamptz not null default now()
);

-- ── posts ──────────────────────────────────────────────────────────────────
-- TS: interface Post. Note: tag_ids in TS is DERIVED (via the post_tags join
-- table below), not a stored column.
create table posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  excerpt          text not null default '',
  content          text not null default '',           -- markdown
  cover_url        text not null default '',
  author_id        uuid not null references authors(id)   on delete restrict,
  category_id      uuid not null references categories(id) on delete restrict,
  status           post_status not null default 'draft',
  meta_title       text not null default '',
  meta_description text not null default '',
  reading_time     integer not null default 1,
  featured         boolean not null default false,
  published_at     timestamptz,                        -- REQUIRED by spec
  updated_at       timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  constraint posts_published_requires_date
    check (status <> 'published' or published_at is not null)
);

create index posts_status_published_at_idx on posts (status, published_at);
create index posts_category_idx on posts (category_id);
create index posts_author_idx   on posts (author_id);

-- ── post_tags (join) ───────────────────────────────────────────────────────
create table post_tags (
  post_id uuid not null references posts(id) on delete cascade,
  tag_id  uuid not null references tags(id)  on delete cascade,
  primary key (post_id, tag_id)
);

create index post_tags_tag_idx on post_tags (tag_id);

-- ── media ──────────────────────────────────────────────────────────────────
-- TS: interface MediaItem
create table media (
  id         uuid primary key default gen_random_uuid(),
  url        text not null,
  alt        text not null default '',
  width      integer not null default 1600,
  height     integer not null default 1067,
  created_at timestamptz not null default now()
);

-- ── newsletter_subscribers ─────────────────────────────────────────────────
-- TS: interface Subscriber. Unique email makes subscribe() idempotent via
-- on_conflict handling in the query layer.
create table newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- ── updated_at trigger ─────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
  before update on posts
  for each row execute function set_updated_at();

create trigger categories_set_updated_at
  before update on categories
  for each row execute function set_updated_at();

create trigger tags_set_updated_at
  before update on tags
  for each row execute function set_updated_at();

-- ============================================================================
-- Row Level Security
--   PUBLIC (anon): read published posts only —
--     status = 'published' AND published_at is not null AND published_at <= now()
--   ADMIN (authenticated Supabase Auth users): full read/write.
--   Subscribers: never publicly readable; inserts happen server-side via the
--   service-role client (bypasses RLS), so no anon policies exist here.
-- ============================================================================

alter table authors                enable row level security;
alter table categories             enable row level security;
alter table tags                   enable row level security;
alter table posts                  enable row level security;
alter table post_tags              enable row level security;
alter table media                  enable row level security;
alter table newsletter_subscribers enable row level security;

-- ── posts ──────────────────────────────────────────────────────────────────
create policy "Public can read published posts"
  on posts for select
  to anon, authenticated
  using (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  );

create policy "Admins have full access to posts"
  on posts for all
  to authenticated
  using (true)
  with check (true);

-- ── categories ─────────────────────────────────────────────────────────────
create policy "Public can read categories"
  on categories for select
  to anon, authenticated
  using (true);

create policy "Admins have full access to categories"
  on categories for all
  to authenticated
  using (true)
  with check (true);

-- ── tags ───────────────────────────────────────────────────────────────────
create policy "Public can read tags"
  on tags for select
  to anon, authenticated
  using (true);

create policy "Admins have full access to tags"
  on tags for all
  to authenticated
  using (true)
  with check (true);

-- ── post_tags ──────────────────────────────────────────────────────────────
create policy "Public can read post_tags"
  on post_tags for select
  to anon, authenticated
  using (true);

create policy "Admins have full access to post_tags"
  on post_tags for all
  to authenticated
  using (true)
  with check (true);

-- ── authors ────────────────────────────────────────────────────────────────
create policy "Public can read authors"
  on authors for select
  to anon, authenticated
  using (true);

create policy "Admins have full access to authors"
  on authors for all
  to authenticated
  using (true)
  with check (true);

-- ── media ──────────────────────────────────────────────────────────────────
create policy "Public can read media"
  on media for select
  to anon, authenticated
  using (true);

create policy "Admins have full access to media"
  on media for all
  to authenticated
  using (true)
  with check (true);

-- ── newsletter_subscribers (no public policies at all) ─────────────────────
create policy "Admins have full access to subscribers"
  on newsletter_subscribers for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================================
-- sieve_runs — durable records for sieve scrape runs
--   POST /api/scrapes has no idempotency key and an accepted call spends
--   credits, so the session_id must be written the moment the 202 arrives:
--   a later resume polls that run instead of starting a duplicate.
--
--   status (local lifecycle, not sieve's):
--     starting  — intent recorded, the POST may be in flight
--     queued    — 202 received, session_id stored
--     running   — a poll reported running
--     done      — terminal success
--     refused   — terminal refusal from sieve (the run never started)
--     ambiguous — the start POST timed out; the outcome is UNKNOWN and it must
--                 never be retried automatically
--     error     — terminal local error
--
--   No public policy: every read/write goes through the service-role client
--   in the server-only route handlers (src/app/api/seo/sieve/*).
-- ============================================================================
create table sieve_runs (
  id              uuid primary key default gen_random_uuid(),
  session_id      text unique,
  status          text not null default 'starting',
  instruction     text not null,
  request         jsonb not null default '{}'::jsonb,
  snapshot        jsonb,
  baseline_turns  integer,
  last_error      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint sieve_runs_status_check check (
    status in ('starting', 'queued', 'running', 'done', 'refused', 'ambiguous', 'error')
  )
);

create index sieve_runs_status_idx on sieve_runs (status);
create index sieve_runs_created_at_idx on sieve_runs (created_at);

alter table sieve_runs enable row level security;

create policy "Admins have full access to sieve runs"
  on sieve_runs for all
  to authenticated
  using (true)
  with check (true);

create trigger sieve_runs_set_updated_at
  before update on sieve_runs
  for each row execute function set_updated_at();
