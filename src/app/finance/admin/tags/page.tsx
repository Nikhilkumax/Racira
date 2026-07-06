"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/domains/finance/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listTags, createTag, deleteTag } from "@/domains/finance/data/taxonomy";

export default function TagsPage() {
  const router = useRouter();
  const [, force] = useState(0);
  const [name, setName] = useState("");
  const tags = listTags();
  function add() {
    if (!name) return;
    createTag({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
    setName(""); force((n) => n + 1); router.refresh();
    toast.success("Tag added");
  }
  return (
    <AdminShell>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">Tags</h1>
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex gap-2">
          <Input placeholder="New tag…" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <Button onClick={add}><Plus className="mr-2 h-4 w-4" /> Add</Button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-sm">
              {t.name}
              <button onClick={() => { deleteTag(t.id); force((n) => n + 1); router.refresh(); }} className="text-muted-foreground hover:text-destructive" aria-label="Remove tag">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}