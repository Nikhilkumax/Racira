"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/domains/finance/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listCategories, createCategory, deleteCategory } from "@/domains/finance/data/taxonomy";

export default function CategoriesPage() {
  const router = useRouter();
  const [, force] = useState(0);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const cats = listCategories();

  function add() {
    if (!name) { toast.error("Name required"); return; }
    createCategory({ name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), description, color: "#059669" });
    setName(""); setSlug(""); setDescription("");
    toast.success("Category added");
    force((n) => n + 1);
    router.refresh();
  }

  return (
    <AdminShell>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">Categories</h1>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-medium">{c.name}<div className="text-xs text-muted-foreground">{c.description}</div></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">/{c.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { deleteCategory(c.id); force((n) => n + 1); router.refresh(); toast.success("Removed"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">New category</h3>
          <div className="space-y-3">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono text-sm" />
            <Textarea placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button onClick={add} className="w-full"><Plus className="mr-2 h-4 w-4" /> Add</Button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}