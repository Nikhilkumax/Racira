"use server";

/**
 * Media library — Supabase Storage + `media` table.
 *
 * Replaces the URL-only mock stub. Files upload to the `media` Storage
 * bucket; every upload gets a matching row in the media table. The bucket is
 * created once via supabase/storage.sql (public read, admin-only write).
 *
 * Signatures preserved from the mock (listMedia, addMedia, deleteMedia) with
 * one disclosed change: addMedia now accepts an optional File and is async —
 * see the flag in the phase report.
 */
import { createClient, createAdminClient } from "@/domains/finance/lib/supabase/server";
import type { MediaItem } from "@/types/finance/db";

const BUCKET = "media";
const BUCKET_URL_PATH = `/storage/v1/object/public/${BUCKET}/`;

/** Guard for every write: must hold a valid Supabase Auth session. */
async function requireUser() {
  const { data } = await createClient().auth.getUser();
  if (!data.user) throw new Error("Unauthorized");
  return data.user;
}

function publicUrlFrom(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}${BUCKET_URL_PATH}${path}`;
}

function imageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    // Node/SSR context without Image → keep the schema defaults.
    if (typeof Image === "undefined") {
      resolve({ width: 1600, height: 1067 });
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth || 1600, height: img.naturalHeight || 1067 });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 1600, height: 1067 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export async function listMedia(): Promise<MediaItem[]> {
  const { data, error } = await createClient()
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listMedia failed: ${error.message}`);
  return (data ?? []) as MediaItem[];
}

/**
 * Two supported forms:
 *  - addMedia(file: File)                       → Storage upload (admin only)
 *  - addMedia(url: string, alt?: string)        → register an external URL (admin only)
 */
export async function addMedia(source: File | string, alt = ""): Promise<MediaItem> {
  await requireUser();
  const db = createAdminClient();

  if (typeof source === "string") {
    const { data, error } = await db
      .from("media")
      .insert({ url: source, alt })
      .select("*")
      .single();
    if (error) throw new Error(`addMedia failed: ${error.message}`);
    return data as MediaItem;
  }

  const file = source;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (uploadError) throw new Error(`media upload failed: ${uploadError.message}`);

  const dims = await imageDimensions(file);
  const { data, error } = await db
    .from("media")
    .insert({
      url: publicUrlFrom(path),
      alt: alt || file.name,
      width: dims.width,
      height: dims.height,
    })
    .select("*")
    .single();
  if (error) throw new Error(`addMedia row insert failed: ${error.message}`);
  return data as MediaItem;
}

export async function deleteMedia(id: string): Promise<boolean> {
  await requireUser();
  const db = createAdminClient();

  const { data: row, error: fetchError } = await db
    .from("media")
    .select("url")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) throw new Error(`deleteMedia lookup failed: ${fetchError.message}`);
  if (!row) return false;

  const { error: delError } = await db.from("media").delete().eq("id", id);
  if (delError) throw new Error(`deleteMedia failed: ${delError.message}`);

  // Best-effort Storage cleanup; only for URLs that point at our own bucket.
  if (row.url.includes(BUCKET_URL_PATH)) {
    const path = row.url.split(BUCKET_URL_PATH)[1];
    if (path) {
      const { error: rmError } = await db.storage.from(BUCKET).remove([path]);
      if (rmError) {
        // Row is already gone; orphaned object is acceptable but note it.
        console.warn(`media object cleanup failed for ${path}: ${rmError.message}`);
      }
    }
  }
  return true;
}
