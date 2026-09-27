-- ============================================================================
-- Racira Finance — Supabase Storage setup
-- Run once in the Supabase SQL Editor (after schema.sql).
--
-- Creates the public `media` bucket used by src/domains/finance/data/media.ts
-- and locks it down: public read, writes only for authenticated admins
-- (the same RLS posture as the media table).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public read of media objects.
create policy "Public can read media objects"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

-- Uploads / updates / deletes: authenticated users only (the admin).
create policy "Admins can upload media objects"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

create policy "Admins can update media objects"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

create policy "Admins can delete media objects"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
