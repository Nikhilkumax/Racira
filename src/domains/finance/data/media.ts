/**
 * Media library.
 * TODO(Cloud): replace with Supabase Storage uploads + a `media` table row.
 */
import { getStore, uid } from "./store";
import type { MediaItem } from "@/types/finance/db";

export const listMedia = (): MediaItem[] => getStore().media.slice();

export function addMedia(url: string, alt = ""): MediaItem {
  const m: MediaItem = { id: uid("m"), url, alt, width: 1600, height: 1067, created_at: new Date().toISOString() };
  getStore().media.unshift(m);
  return m;
}

export function deleteMedia(id: string): boolean {
  const s = getStore();
  const before = s.media.length;
  s.media = s.media.filter((m) => m.id !== id);
  return s.media.length < before;
}