"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "./rich-text-editor";
import { listAuthors, listCategories, listTags } from "@/domains/finance/data/taxonomy";
import { createPost, updatePost, deletePost } from "@/domains/finance/data/posts";
import type { Author, Category, Post, PostStatus, PostWithRelations, Tag } from "@/types/finance/db";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function PostForm({ initial }: { initial?: PostWithRelations }) {
  const router = useRouter();

  // Taxonomy loads asynchronously from Supabase now (previously sync mock).
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [cover, setCover] = useState(initial?.cover_url ?? "");
  const [authorId, setAuthorId] = useState(initial?.author_id ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [tagIds, setTagIds] = useState<string[]>(initial?.tag_ids ?? []);
  const [status, setStatus] = useState<PostStatus>(initial?.status ?? "draft");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listAuthors(), listCategories(), listTags()])
      .then(([a, c, t]) => {
        if (cancelled) return;
        setAuthors(a);
        setCategories(c);
        setTags(t);
        // Default selections once taxonomy arrives (create mode only).
        setAuthorId((cur) => cur || a[0]?.id || "");
        setCategoryId((cur) => cur || c[0]?.id || "");
      })
      .catch((err) => {
        console.error("Failed to load taxonomy", err);
        toast.error("Could not load authors/categories/tags.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(nextStatus?: PostStatus) {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!authorId || !categoryId) {
      toast.error("Author and category are required");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Post> & { title: string } = {
        title,
        slug: slug || slugify(title),
        excerpt,
        content,
        cover_url: cover,
        author_id: authorId,
        category_id: categoryId,
        tag_ids: tagIds,
        status: nextStatus ?? status,
        featured,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
      };
      if (initial) {
        const updated = await updatePost(initial.id, payload);
        if (!updated) throw new Error("Post no longer exists");
        toast.success("Post updated");
      } else {
        await createPost(payload);
        toast.success("Post created");
      }
      router.push("/finance/admin/posts");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error && err.message === "Unauthorized"
        ? "Your session expired — sign in again."
        : "Save failed. Check the server logs.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!initial) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deletePost(initial.id);
      toast.success("Post deleted");
      router.push("/finance/admin/posts");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
          <Input
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (!initial && !slug) setSlug(slugify(e.target.value)); }}
            className="mt-1.5 h-12 text-xl font-display"
            placeholder="Article title"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Excerpt</Label>
          <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="mt-1.5" placeholder="One-sentence summary." />
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content</Label>
          <div className="mt-1.5">
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Publishing</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Status</Label>
              <Select value={status} onValueChange={(v: string) => setStatus(v as PostStatus)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Featured</Label>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => save("published")} disabled={saving}>
                {saving ? "Saving…" : status === "published" ? "Update" : "Publish"}
              </Button>
              <Button variant="outline" onClick={() => save("draft")} disabled={saving}>Save draft</Button>
              {initial && <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={remove} disabled={saving}>Delete</Button>}
              <Link href="/finance/admin/posts" className="mt-1 text-center text-xs text-muted-foreground hover:text-foreground">Cancel</Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Taxonomy</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Author</Label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={authors.length ? "Select author" : "Loading…"} /></SelectTrigger>
                <SelectContent>{authors.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={categories.length ? "Select category" : "Loading…"} /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tags</Label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tags.map((t) => {
                  const on = tagIds.includes(t.id);
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTagIds(on ? tagIds.filter((x) => x !== t.id) : [...tagIds, t.id])}
                      className={"rounded-full border px-2.5 py-1 text-xs " + (on ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground")}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">SEO & URL</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Cover image URL</Label>
              <Input value={cover} onChange={(e) => setCover(e.target.value)} className="mt-1 text-sm" placeholder="https://…" />
              {cover && <img src={cover} alt="" className="mt-2 aspect-video w-full rounded-md object-cover" />}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Meta title</Label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="mt-1 text-sm" placeholder="defaults to title" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Meta description</Label>
              <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} className="mt-1 text-sm" placeholder="defaults to excerpt" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
