"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/domains/finance/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addMedia, deleteMedia } from "@/domains/finance/data/media";
import type { MediaItem } from "@/types/finance/db";

export function MediaClient({ initialMedia }: { initialMedia: MediaItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function uploadFile(file: File) {
    startTransition(async () => {
      try {
        await addMedia(file);
        toast.success("Uploaded");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Upload failed.");
      }
    });
  }

  function addUrl() {
    if (!url) return;
    startTransition(async () => {
      try {
        await addMedia(url);
        setUrl("");
        toast.success("Added");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Add failed.");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      try {
        await deleteMedia(id);
        toast.success("Deleted");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Delete failed.");
      }
    });
  }

  return (
    <AdminShell>
      <h1 className="mb-2 font-display text-3xl font-semibold tracking-tight">Media library</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Upload files to Supabase Storage or register an external image URL.
      </p>

      <div className="mb-6 grid gap-3 rounded-xl border border-border/60 bg-card p-4 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
            disabled={pending}
          />
          <Button variant="outline" disabled={pending} onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="https://external-image-url.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={pending}
          />
          <Button onClick={addUrl} disabled={pending}>Add URL</Button>
        </div>
      </div>

      <div className={"grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 " + (pending ? "opacity-60" : "")}>
        {initialMedia.map((m) => (
          <div key={m.id} className="group relative overflow-hidden rounded-lg border border-border/60 bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.alt} className="aspect-square w-full object-cover" />
            <button
              onClick={() => remove(m.id)}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md bg-background/90 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {initialMedia.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No media yet.</p>
        )}
      </div>
    </AdminShell>
  );
}
