"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/domains/finance/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCategory, deleteCategory } from "@/domains/finance/data/taxonomy";
import type { Category } from "@/types/finance/db";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  function add() {
    if (!name) {
      toast.error("Name required");
      return;
    }
    startTransition(async () => {
      try {
        await createCategory({
          name,
          slug: slug || slugify(name),
          description,
          color: "#059669",
        });
        setName("");
        setSlug("");
        setDescription("");
        toast.success("Category added");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Create failed.");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      try {
        await deleteCategory(id);
        toast.success("Removed");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error(
          err instanceof Error && err.message.includes("foreign key")
            ? "Category is still used by posts."
            : "Delete failed.",
        );
      }
    });
  }

  return (
    <AdminShell>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">Categories</h1>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className={"overflow-hidden rounded-xl border border-border/60 bg-card " + (pending ? "opacity-60" : "")}>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {initialCategories.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-medium">{c.name}<div className="text-xs text-muted-foreground">{c.description}</div></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">/{c.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(c.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete category"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {initialCategories.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No categories yet — add the first one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">New category</h3>
          <div className="space-y-3">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="slug (optional)" value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono text-sm" />
            <Textarea placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button onClick={add} className="w-full" disabled={pending}><Plus className="mr-2 h-4 w-4" /> Add</Button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
