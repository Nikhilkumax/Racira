"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/domains/finance/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTag, deleteTag } from "@/domains/finance/data/taxonomy";
import type { Tag } from "@/types/finance/db";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function TagsClient({ initialTags }: { initialTags: Tag[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");

  function add() {
    if (!name) return;
    startTransition(async () => {
      try {
        await createTag({ name, slug: slugify(name) });
        setName("");
        toast.success("Tag added");
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
        await deleteTag(id);
        toast.success("Removed");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Delete failed.");
      }
    });
  }

  return (
    <AdminShell>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">Tags</h1>
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex gap-2">
          <Input
            placeholder="New tag…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button onClick={add} disabled={pending}><Plus className="mr-2 h-4 w-4" /> Add</Button>
        </div>
        <div className={"mt-5 flex flex-wrap gap-2 " + (pending ? "opacity-60" : "")}>
          {initialTags.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-sm">
              {t.name}
              <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove tag">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {initialTags.length === 0 && <span className="text-sm text-muted-foreground">No tags yet.</span>}
        </div>
      </div>
    </AdminShell>
  );
}
