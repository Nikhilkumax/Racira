"use server";

/**
 * Posts data access — Supabase.
 *
 * Replaces the in-memory mock store (store.ts, now deleted). Function
 * signatures match the previous mock implementation; everything is now async.
 *
 * Clients:
 *  - Reads use the cookie-scoped anon client (createClient). RLS exposes
 *    published posts to everyone and everything to authenticated admins, so
 *    the same functions serve both the public blog and the admin panel.
 *  - Writes use the service-role admin client (createAdminClient) behind an
 *    explicit authenticated-user guard (requireUser), so a server action can
 *    never be invoked anonymously.
 *
 * Publish model: NO cron flip. "Published" means
 *   status = 'published' AND published_at is not null AND published_at <= now()
 * Public read paths enforce the same condition in the query (belt) and RLS
 * (braces) — see supabase/schema.sql.
 */
import {
  createAdminClient,
  // Read client for ISR-cached public pages (no cookies() access — that
  // would force dynamic rendering and disable the revalidate windows).
  createReadClient,
  // Session client for auth checks and session-aware reads.
  createClient,
  UnconfiguredSupabaseError,
} from "@/domains/finance/lib/supabase/server";
import type { Author, Category, Post, PostStatus, PostWithRelations, Tag } from "@/types/finance/db";

type DbPost = Omit<Post, "tag_ids">;

/** Nested row shape returned by the POST_SELECT embed. */
type PostRow = DbPost & {
  author: Author;
  category: Category;
  tags: { tags: Tag }[] | null;
};

const POST_SELECT = `*, author:authors(*), category:categories(*), tags:post_tags(tags(*))`;

const NOW_ISO = () => new Date().toISOString();

/** Guard for every write: must hold a valid Supabase Auth session. */
async function requireUser() {
  const { data } = await createClient().auth.getUser();
  if (!data.user) throw new Error("Unauthorized");
  return data.user;
}

function hydrate(row: PostRow): PostWithRelations {
  const tags = (row.tags ?? []).map((t) => t.tags);
  return { ...row, tags, tag_ids: tags.map((t) => t.id) };
}

/** The published-now condition used by every public read. */
function publishedNowFilter(q: any) {
  return q
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", NOW_ISO());
}

function baseListQuery() {
  let q = createReadClient().from("posts").select(POST_SELECT);
  // Default sort mirrors the mock: newest first.
  q = q.order("published_at", { ascending: false, nullsFirst: false });
  return q;
}

/**
 * Graceful degradation: an unconfigured Supabase (placeholder .env values)
 * renders public pages empty instead of 500-ing. Writes remain fail-closed.
 */
function emptyOnUnconfigured(err: unknown): never | void {
  if (err instanceof UnconfiguredSupabaseError) return;
  throw err;
}

export async function listPosts(
  opts: { status?: PostStatus; categorySlug?: string; tagSlug?: string; authorSlug?: string; search?: string } = {},
): Promise<PostWithRelations[]> {
  try {
    return await listPostsInner(opts);
  } catch (err) {
    emptyOnUnconfigured(err);
    return [];
  }
}

async function listPostsInner(
  opts: { status?: PostStatus; categorySlug?: string; tagSlug?: string; authorSlug?: string; search?: string } = {},
): Promise<PostWithRelations[]> {
  let q = baseListQuery();

  if (opts.status === "published") {
    q = publishedNowFilter(q);
  } else if (opts.status) {
    q = q.eq("status", opts.status);
  }

  if (opts.categorySlug) {
    const c = await getCategoryBySlug(opts.categorySlug);
    if (!c) return [];
    q = q.eq("category_id", c.id);
  }
  if (opts.authorSlug) {
    const a = await getAuthorBySlug(opts.authorSlug);
    if (!a) return [];
    q = q.eq("author_id", a.id);
  }
  if (opts.tagSlug) {
    const t = await getTagBySlug(opts.tagSlug);
    if (!t) return [];
    // Filter through the post_tags embed (alias "tags").
    q = q.eq("tags.tag_id", t.id);
  }
  if (opts.search) {
    // Sanitize for the .or() filter syntax (commas/parens are delimiters).
    const term = opts.search.replace(/[,()]/g, " ").trim();
    if (term) {
      const like = `%${term}%`;
      q = q.or(`title.ilike.${like},excerpt.ilike.${like},content.ilike.${like}`);
    }
  }

  const { data, error } = await q;
  if (error) throw new Error(`listPosts failed: ${error.message}`);
  return (data as unknown as PostRow[]).map(hydrate);
}

export async function getFeaturedPost(): Promise<PostWithRelations | null> {
  const published = await listPosts({ status: "published" });
  return published.find((p) => p.featured) ?? published[0] ?? null;
}

export async function getPostBySlug(slug: string): Promise<PostWithRelations | null> {
  try {
    return await getPostBySlugInner(slug);
  } catch (err) {
    emptyOnUnconfigured(err);
    return null;
  }
}

async function getPostBySlugInner(slug: string): Promise<PostWithRelations | null> {
  const { data, error } = await publishedNowFilter(baseListQuery())
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getPostBySlug failed: ${error.message}`);
  return data ? hydrate(data as unknown as PostRow) : null;
}

export async function getPostById(id: string): Promise<PostWithRelations | null> {
  try {
    return await getPostByIdInner(id);
  } catch (err) {
    emptyOnUnconfigured(err);
    return null;
  }
}

async function getPostByIdInner(id: string): Promise<PostWithRelations | null> {
  // No status filter — the admin edit screen must open drafts/scheduled too.
  const { data, error } = await baseListQuery().eq("id", id).maybeSingle();
  if (error) throw new Error(`getPostById failed: ${error.message}`);
  return data ? hydrate(data as unknown as PostRow) : null;
}

export async function getRelated(post: PostWithRelations, limit = 3): Promise<PostWithRelations[]> {
  const published = await listPosts({ status: "published" });
  return published
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      p,
      score:
        (p.category_id === post.category_id ? 2 : 0) +
        p.tag_ids.filter((t) => post.tag_ids.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function readingTimeOf(content: string) {
  return Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / 220));
}

export async function createPost(input: Partial<Post> & { title: string }): Promise<PostWithRelations> {
  await requireUser();
  const db = createAdminClient();

  const now = NOW_ISO();
  const slug = input.slug ?? slugify(input.title);
  const content = input.content ?? "";
  const status: PostStatus = input.status ?? "draft";
  // Publish model: published_at is set when publishing (unless explicitly
  // provided, which is how a future-dated "scheduled" post is expressed).
  const published_at =
    input.published_at ?? (status === "draft" ? null : now);

  const { data: inserted, error } = await db
    .from("posts")
    .insert({
      slug,
      title: input.title,
      excerpt: input.excerpt ?? "",
      content,
      cover_url: input.cover_url ?? "",
      author_id: input.author_id,
      category_id: input.category_id,
      status,
      meta_title: input.meta_title ?? input.title,
      meta_description: input.meta_description ?? input.excerpt ?? "",
      reading_time: readingTimeOf(content),
      published_at,
      featured: input.featured ?? false,
    })
    .select("id")
    .single();
  if (error) throw new Error(`createPost failed: ${error.message}`);

  const tagIds = input.tag_ids ?? [];
  if (tagIds.length > 0) {
    const { error: tagError } = await db
      .from("post_tags")
      .insert(tagIds.map((tag_id) => ({ post_id: inserted.id, tag_id })));
    if (tagError) throw new Error(`createPost tag link failed: ${tagError.message}`);
  }

  const post = await getPostById(inserted.id);
  if (!post) throw new Error("createPost: inserted row not readable");
  return post;
}

export async function updatePost(id: string, patch: Partial<Post>): Promise<PostWithRelations | null> {
  await requireUser();
  const db = createAdminClient();

  const update: Record<string, unknown> = {};
  if (patch.slug !== undefined) update.slug = patch.slug;
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.excerpt !== undefined) update.excerpt = patch.excerpt;
  if (patch.cover_url !== undefined) update.cover_url = patch.cover_url;
  if (patch.author_id !== undefined) update.author_id = patch.author_id;
  if (patch.category_id !== undefined) update.category_id = patch.category_id;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.meta_title !== undefined) update.meta_title = patch.meta_title;
  if (patch.meta_description !== undefined) update.meta_description = patch.meta_description;
  if (patch.featured !== undefined) update.featured = patch.featured;
  if (patch.published_at !== undefined) update.published_at = patch.published_at;
  if (patch.content !== undefined) {
    update.content = patch.content;
    update.reading_time = readingTimeOf(patch.content);
  }
  // Transitioning to published with no date yet → stamp now (no cron flip).
  if (patch.status === "published" && update.published_at === undefined) {
    const { data: existing } = await db.from("posts").select("published_at").eq("id", id).maybeSingle();
    if (existing && !existing.published_at) update.published_at = NOW_ISO();
  }

  const { data: updated, error } = await db
    .from("posts")
    .update(update)
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`updatePost failed: ${error.message}`);
  if (!updated || updated.length === 0) return null;

  if (patch.tag_ids !== undefined) {
    const { error: clearError } = await db.from("post_tags").delete().eq("post_id", id);
    if (clearError) throw new Error(`updatePost tag clear failed: ${clearError.message}`);
    if (patch.tag_ids.length > 0) {
      const { error: tagError } = await db
        .from("post_tags")
        .insert(patch.tag_ids.map((tag_id) => ({ post_id: id, tag_id })));
      if (tagError) throw new Error(`updatePost tag link failed: ${tagError.message}`);
    }
  }

  return getPostById(id);
}

export async function deletePost(id: string): Promise<boolean> {
  await requireUser();
  // post_tags rows cascade on delete (see schema.sql); the FK on
  // category/author is restrict, so taxonomy is not destroyed with a post.
  const { data, error } = await createAdminClient()
    .from("posts")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`deletePost failed: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/* ── local slug→id lookups used by the filters above ──────────────────────
   Kept local (instead of importing taxonomy.ts) to avoid a circular import
   between the two "use server" modules. */

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data } = await createReadClient().from("categories").select("*").eq("slug", slug).maybeSingle();
  return (data as Category) ?? null;
}
async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const { data } = await createReadClient().from("authors").select("*").eq("slug", slug).maybeSingle();
  return (data as Author) ?? null;
}
async function getTagBySlug(slug: string): Promise<Tag | null> {
  const { data } = await createReadClient().from("tags").select("*").eq("slug", slug).maybeSingle();
  return (data as Tag) ?? null;
}
