-- ============================================================================
-- Racira Finance — Seed data
-- Run in the Supabase SQL Editor AFTER schema.sql (see README-setup.md).
--
-- Purpose: the minimum rows needed to exercise the admin CRUD flow —
-- 2 categories, 2 tags, 1 author, and ONE post with status='draft'.
--
-- There is deliberately NO 'published' and NO 'scheduled' post here, so the
-- public blog stays empty until a human publishes through the admin UI.
-- (Even if the post below were flipped to published, RLS would expose it —
-- publish only when the content is real.)
-- ============================================================================

-- ── Categories ─────────────────────────────────────────────────────────────
insert into categories (slug, name, description, color) values
  ('investing', 'Investing', 'Markets, portfolios, and long-term capital allocation.', '#059669'),
  ('personal-finance', 'Personal Finance', 'Budgeting, saving, debt, and household money.', '#0ea5e9')
on conflict (slug) do nothing;

-- ── Tags ───────────────────────────────────────────────────────────────────
insert into tags (slug, name) values
  ('etfs', 'ETFs'),
  ('risk-management', 'Risk Management')
on conflict (slug) do nothing;

-- ── Author ─────────────────────────────────────────────────────────────────
insert into authors (slug, name, bio, avatar_url, role, twitter, linkedin) values
  (
    'seed-editor',
    'Seed Editor',
    'Placeholder author row created by seed.sql. Replace the name, bio, and links with the real editorial team — this row exists only so draft posts can be created through the admin.',
    'https://i.pravatar.cc/200?img=13',
    'Editor',
    null,
    null
  )
on conflict (slug) do nothing;

-- ── Post (DRAFT — not publicly visible; RLS hides everything unpublished) ──
insert into posts (
  slug, title, excerpt, content, cover_url,
  author_id, category_id,
  status,
  meta_title, meta_description,
  reading_time, featured,
  published_at
)
select
  'seed-first-draft',
  'Seed: First Draft',
  'A single draft post for testing the admin CRUD flow. Never appears on the public blog while in draft.',
  E'# Seed: First Draft\n\nThis post exists so you can open the admin, edit the markdown, flip its status, and delete it — the full CRUD path — without touching real content.\n\nWhen you are done testing, delete it from the admin (Posts → Delete) or leave it as a sandbox draft.\n',
  '',
  a.id,
  c.id,
  'draft',
  'Seed: First Draft',
  'A single draft post for testing the admin CRUD flow.',
  1,
  false,
  null
from authors a, categories c
where a.slug = 'seed-editor'
  and c.slug = 'personal-finance'
on conflict (slug) do nothing;

-- ── Optional: link the seed post to both seed tags ─────────────────────────
insert into post_tags (post_id, tag_id)
select p.id, t.id
from posts p, tags t
where p.slug = 'seed-first-draft'
  and t.slug in ('etfs', 'risk-management')
on conflict do nothing;
