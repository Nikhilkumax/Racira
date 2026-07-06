"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/domains/finance/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { listPosts, deletePost } from "@/domains/finance/data/posts";
import type { PostStatus } from "@/types/finance/db";

export default function PostsList() {
  const router = useRouter();
  const [filter, setFilter] = useState<PostStatus | "all">("all");
  const [, force] = useState(0);
  const posts = listPosts(filter === "all" ? {} : { status: filter });

  function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    deletePost(id);
    toast.success("Deleted");
    force((n) => n + 1);
    router.refresh();
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">{posts.length} total</p>
        </div>
        <Link href="/admin/posts/new"><Button><Plus className="mr-2 h-4 w-4" /> New post</Button></Link>
      </div>
      <div className="mb-4 flex gap-2">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={"rounded-full border px-3 py-1 text-xs font-medium capitalize " + (filter === f ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground")}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-border/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/posts/${p.id}/edit`} className="font-medium hover:text-primary">{p.title}</Link>
                  <div className="text-xs text-muted-foreground">/{p.slug}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category.name}</td>
                <td className="px-4 py-3"><span className={"rounded-full px-2 py-0.5 text-xs " + (p.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{p.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/posts/${p.id}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
                  <button onClick={() => remove(p.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}