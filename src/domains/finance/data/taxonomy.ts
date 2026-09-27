"use server";

/**
 * Categories, tags, authors data access — Supabase.
 *
 * Replaces the in-memory mock store. Same function names and parameter
 * shapes as the mock implementation; everything is now async.
 *
 * Public reads use the cookie-free read client (ISR-cacheable, RLS-scoped).
 * Writes use the service-role admin client behind an explicit
 * authenticated-user guard.
 *
 * NOTE: taxonomy writes are NOT tenant-guarded beyond authentication — any
 * authenticated user (i.e. the single admin) can modify them, matching the
 * RLS policy "Admins have full access" in supabase/schema.sql.
 */
import {
  createAdminClient,
  // Public RLS reads (ISR-cacheable — no cookies() access).
  createReadClient,
  // Session client for the write guard.
  createClient,
  UnconfiguredSupabaseError,
} from "@/domains/finance/lib/supabase/server";

/**
 * Graceful degradation for public reads: an unconfigured Supabase (placeholder
 * .env values) renders public pages with empty states instead of 500-ing.
 * Writes remain fail-closed via requireUser().
 */
function emptyOnUnconfigured(err: unknown): void {
  if (err instanceof UnconfiguredSupabaseError) return;
  throw err;
}
import type { Author, Category, Tag } from "@/types/finance/db";

/** Guard for every write: must hold a valid Supabase Auth session. */
async function requireUser() {
  const { data } = await createClient().auth.getUser();
  if (!data.user) throw new Error("Unauthorized");
  return data.user;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* ── Categories ────────────────────────────────────────────────────────── */

export async function listCategories(): Promise<Category[]> {
  try {
    const { data, error } = await createReadClient()
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(`listCategories failed: ${error.message}`);
    return (data ?? []) as Category[];
  } catch (err) {
    emptyOnUnconfigured(err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const { data } = await createReadClient().from("categories").select("*").eq("slug", slug).maybeSingle();
    return (data as Category) ?? null;
  } catch (err) {
    emptyOnUnconfigured(err);
    return null;
  }
}

export async function createCategory(input: Omit<Category, "id">): Promise<Category> {
  await requireUser();
  const { data, error } = await createAdminClient()
    .from("categories")
    .insert({ slug: input.slug, name: input.name, description: input.description, color: input.color })
    .select("*")
    .single();
  if (error) throw new Error(`createCategory failed: ${error.message}`);
  return data as Category;
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<Category | null> {
  await requireUser();
  const update: Record<string, unknown> = {};
  if (patch.slug !== undefined) update.slug = patch.slug;
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.color !== undefined) update.color = patch.color;

  const { data, error } = await createAdminClient()
    .from("categories")
    .update(update)
    .eq("id", id)
    .select("*");
  if (error) throw new Error(`updateCategory failed: ${error.message}`);
  return (data?.[0] as Category) ?? null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  await requireUser();
  // FK on posts.category_id is ON DELETE RESTRICT (schema.sql): deleting a
  // category still in use fails loudly instead of orphaning posts.
  const { data, error } = await createAdminClient()
    .from("categories")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`deleteCategory failed: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/* ── Tags ──────────────────────────────────────────────────────────────── */

export async function listTags(): Promise<Tag[]> {
  try {
    const { data, error } = await createReadClient()
      .from("tags")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(`listTags failed: ${error.message}`);
    return (data ?? []) as Tag[];
  } catch (err) {
    emptyOnUnconfigured(err);
    return [];
  }
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  try {
    const { data } = await createReadClient().from("tags").select("*").eq("slug", slug).maybeSingle();
    return (data as Tag) ?? null;
  } catch (err) {
    emptyOnUnconfigured(err);
    return null;
  }
}

export async function createTag(input: Omit<Tag, "id">): Promise<Tag> {
  await requireUser();
  const { data, error } = await createAdminClient()
    .from("tags")
    .insert({ slug: input.slug, name: input.name })
    .select("*")
    .single();
  if (error) throw new Error(`createTag failed: ${error.message}`);
  return data as Tag;
}

export async function deleteTag(id: string): Promise<boolean> {
  await requireUser();
  // post_tags rows referencing this tag cascade (schema.sql).
  const { data, error } = await createAdminClient()
    .from("tags")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`deleteTag failed: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/* ── Authors ───────────────────────────────────────────────────────────── */

export async function listAuthors(): Promise<Author[]> {
  try {
    const { data, error } = await createReadClient()
      .from("authors")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(`listAuthors failed: ${error.message}`);
    return (data ?? []) as Author[];
  } catch (err) {
    emptyOnUnconfigured(err);
    return [];
  }
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  try {
    const { data } = await createReadClient().from("authors").select("*").eq("slug", slug).maybeSingle();
    return (data as Author) ?? null;
  } catch (err) {
    emptyOnUnconfigured(err);
    return null;
  }
}

export async function getAuthorById(id: string): Promise<Author | null> {
  try {
    const { data } = await createReadClient().from("authors").select("*").eq("id", id).maybeSingle();
    return (data as Author) ?? null;
  } catch (err) {
    emptyOnUnconfigured(err);
    return null;
  }
}
