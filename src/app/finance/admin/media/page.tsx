"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/domains/finance/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listMedia, addMedia, deleteMedia } from "@/domains/finance/data/media";

export default function MediaPage() {
  const router = useRouter();
  const [, force] = useState(0);
  const [url, setUrl] = useState("");
  const media = listMedia();
  return (
    <AdminShell>
      <h1 className="mb-2 font-display text-3xl font-semibold tracking-tight">Media library</h1>
      <p className="mb-6 text-sm text-muted-foreground">Add images by URL. File upload connects when Lovable Cloud is enabled (Supabase Storage).</p>
      <div className="mb-6 flex gap-2 rounded-xl border border-border/60 bg-card p-4">
        <Input placeholder="https://image-url.jpg" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button
          onClick={() => {
            if (!url) return;
            addMedia(url);
            setUrl(""); force((n) => n + 1); router.refresh();
            toast.success("Added");
          }}
        >
          <Upload className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {media.map((m) => (
          <div key={m.id} className="group relative overflow-hidden rounded-lg border border-border/60 bg-card">
            <img src={m.url} alt={m.alt} className="aspect-square w-full object-cover" />
            <button
              onClick={() => { deleteMedia(m.id); force((n) => n + 1); router.refresh(); }}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md bg-background/90 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}