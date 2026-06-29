import Link from "next/link";
import { FileText, FolderTree, Tag, Image, Plus } from "lucide-react";
import { AdminShell } from "@/components/finance/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { listPosts } from "@/lib/finance/data/posts";
import { listCategories, listTags } from "@/lib/finance/data/taxonomy";
import { listMedia } from "@/lib/finance/data/media";

export default function Dashboard() {
  const all = listPosts();
  const published = all.filter((p) => p.status === "published");
  const drafts = all.filter((p) => p.status === "draft");
  const stats = [
    { label: "Published", value: published.length, icon: FileText, to: "/admin/posts" as const },
    { label: "Drafts", value: drafts.length, icon: FileText, to: "/admin/posts" as const },
    { label: "Categories", value: listCategories().length, icon: FolderTree, to: "/admin/categories" as const },
    { label: "Tags", value: listTags().length, icon: Tag, to: "/admin/tags" as const },
    { label: "Media", value: listMedia().length, icon: Image, to: "/admin/media" as const },
  ];
  return (
    <AdminShell>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back. Here's what's in the system.</p>
        </div>
        <Link href="/admin/posts/new"><Button><Plus className="mr-2 h-4 w-4" /> New post</Button></Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.to} className="rounded-xl border border-border/60 bg-card p-5 transition-shadow hover:shadow-[var(--shadow-soft)]">
            <s.icon className="h-5 w-5 text-primary" />
            <div className="mt-4 font-display text-3xl font-semibold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold">Recent posts</h2>
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Updated</th></tr>
            </thead>
            <tbody>
              {all.slice(0, 6).map((p) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="px-4 py-3"><Link href={`/admin/posts/${p.id}/edit`} className="font-medium hover:text-primary">{p.title}</Link></td>
                  <td className="px-4 py-3"><span className={"rounded-full px-2 py-0.5 text-xs " + (p.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{p.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-10 rounded-xl border border-dashed border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
        Heads up — this admin is running on in-memory mock data. Changes reset on page reload.
        Enable Lovable Cloud (see <code>supabase/README.md</code>) to persist everything.
      </p>
    </AdminShell>
  );
}