/**
 * Posts data access.
 *
 * TODO(Cloud): When Lovable Cloud is enabled, replace the mock branch with
 *   const { data } = await supabase.from('posts').select('*, author:authors(*), category:categories(*), tags(*)')
 * URL + publishable key are injected automatically into @/integrations/supabase/client.
 */
import { getStore, uid } from "./store";
import type { Post, PostStatus, PostWithRelations } from "@/types/finance/db";

function hydrate(p: Post): PostWithRelations {
  const s = getStore();
  return {
    ...p,
    author: s.authors.find((a) => a.id === p.author_id)!,
    category: s.categories.find((c) => c.id === p.category_id)!,
    tags: s.tags.filter((t) => p.tag_ids.includes(t.id)),
  };
}

export function listPosts(opts: { status?: PostStatus; categorySlug?: string; tagSlug?: string; authorSlug?: string; search?: string } = {}): PostWithRelations[] {
  const s = getStore();
  let rows = s.posts.slice();
  if (opts.status) rows = rows.filter((p) => p.status === opts.status);
  if (opts.categorySlug) {
    const c = s.categories.find((x) => x.slug === opts.categorySlug);
    if (c) rows = rows.filter((p) => p.category_id === c.id);
    else rows = [];
  }
  if (opts.tagSlug) {
    const t = s.tags.find((x) => x.slug === opts.tagSlug);
    if (t) rows = rows.filter((p) => p.tag_ids.includes(t.id));
    else rows = [];
  }
  if (opts.authorSlug) {
    const a = s.authors.find((x) => x.slug === opts.authorSlug);
    if (a) rows = rows.filter((p) => p.author_id === a.id);
    else rows = [];
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    rows = rows.filter(
      (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.content.toLowerCase().includes(q),
    );
  }
  rows.sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at));
  return rows.map(hydrate);
}

export function getFeaturedPost(): PostWithRelations | null {
  const published = listPosts({ status: "published" });
  return published.find((p) => p.featured) ?? published[0] ?? null;
}

export function getPostBySlug(slug: string): PostWithRelations | null {
  const s = getStore();
  const p = s.posts.find((x) => x.slug === slug);
  return p ? hydrate(p) : null;
}

export function getPostById(id: string): PostWithRelations | null {
  const s = getStore();
  const p = s.posts.find((x) => x.id === id);
  return p ? hydrate(p) : null;
}

export function getRelated(post: PostWithRelations, limit = 3): PostWithRelations[] {
  return listPosts({ status: "published" })
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

export function createPost(input: Partial<Post> & { title: string }): PostWithRelations {
  const s = getStore();
  const now = new Date().toISOString();
  const slug = input.slug ?? input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const wordCount = (input.content ?? "").split(/\s+/).filter(Boolean).length;
  const post: Post = {
    id: uid("p"),
    slug,
    title: input.title,
    excerpt: input.excerpt ?? "",
    content: input.content ?? "",
    cover_url: input.cover_url ?? "",
    author_id: input.author_id ?? s.authors[0].id,
    category_id: input.category_id ?? s.categories[0].id,
    tag_ids: input.tag_ids ?? [],
    status: input.status ?? "draft",
    meta_title: input.meta_title ?? input.title,
    meta_description: input.meta_description ?? input.excerpt ?? "",
    reading_time: Math.max(1, Math.round(wordCount / 220)),
    published_at: now,
    updated_at: now,
    featured: input.featured ?? false,
  };
  s.posts.unshift(post);
  return hydrate(post);
}

export function updatePost(id: string, patch: Partial<Post>): PostWithRelations | null {
  const s = getStore();
  const idx = s.posts.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const next = { ...s.posts[idx], ...patch, updated_at: new Date().toISOString() };
  if (patch.content) {
    const wc = patch.content.split(/\s+/).filter(Boolean).length;
    next.reading_time = Math.max(1, Math.round(wc / 220));
  }
  s.posts[idx] = next;
  return hydrate(next);
}

export function deletePost(id: string): boolean {
  const s = getStore();
  const before = s.posts.length;
  s.posts = s.posts.filter((p) => p.id !== id);
  return s.posts.length < before;
}