"use client";

/**
 * Podcast Chapter Marker Tool — writes real ID3v2 CHAP frames.
 *
 * Drop an MP3, add chapters (start + title; ends follow automatically),
 * download the file with the tag written via replaceId3Tag() — byte-verified
 * round-trip in scratch/test-batch17.cjs. Existing CHAP frames in the file
 * are loaded into the editor for editing.
 */

import { useCallback, useRef, useState } from "react";

import { formatTimestamp } from "@/domains/audio/lib/calc";
import type { Id3Chapter } from "@/domains/audio/lib/id3";
import { readId3, replaceId3Tag } from "@/domains/audio/lib/id3";
import { decodeFileToChannels } from "@/domains/audio/lib/edit";

interface ChapterDraft {
  id: number;
  title: string;
  startMs: number;
}

export default function PodcastChapterMarkerTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [chapters, setChapters] = useState<ChapterDraft[]>([]);
  const [title, setTitle] = useState("");
  const [startSec, setStartSec] = useState("0");
  const [done, setDone] = useState(false);
  const nextId = useRef(1);

  const onFile = useCallback(async (file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    setFileBytes(bytes);
    setFileName(file.name);
    setDone(false);
    const tags = readId3(bytes);
    if (tags && tags.chapters.length > 0) {
      setChapters(
        tags.chapters.map((c, i) => ({
          id: nextId.current++,
          title: c.title ?? `Chapter ${i + 1}`,
          startMs: c.startMs,
        })),
      );
    } else {
      setChapters([]);
    }
    try {
      const decoded = await decodeFileToChannels(file);
      setDurationSec(decoded.length / decoded.sampleRate);
    } catch {
      setDurationSec(null);
    }
  }, []);

  const addChapter = () => {
    const startMs = Math.round((Number(startSec) || 0) * 1000);
    setChapters((prev) => [
      ...prev,
      {
        id: nextId.current++,
        title: title.trim() || `Chapter ${prev.length + 1}`,
        startMs,
      },
    ]);
    setTitle("");
    setStartSec(String((Number(startSec) || 0) + 60));
  };

  const download = () => {
    if (!fileBytes || chapters.length === 0 || !fileName) return;
    const sorted = [...chapters].sort((a, b) => a.startMs - b.startMs);
    const built: Id3Chapter[] = sorted.map((c, i) => ({
      id: `ch${i + 1}`,
      title: c.title,
      startMs: c.startMs,
      endMs:
        i + 1 < sorted.length ? sorted[i + 1].startMs : Math.round((durationSec ?? 0) * 1000),
    }));
    const out = replaceId3Tag(fileBytes, { version: 3, chapters: built });
    const blob = new Blob([out as unknown as BlobPart], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.[^.]+$/, "") + ".chaptered.mp3";
    a.click();
    setDone(true);
  };

  return (
    <div className="space-y-4">
      {!fileBytes ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) void onFile(f);
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "audio/mpeg,.mp3";
            input.onchange = () => {
              const f = input.files?.[0];
              if (f) void onFile(f);
            };
            input.click();
          }}
          className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center"
        >
          <p className="font-medium">Drop an MP3 here or click to choose</p>
          <p className="text-sm text-muted-foreground">
            Chapters are written as standard ID3v2 CHAP frames (Apple-compatible)
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Loaded <span className="font-medium text-foreground">{fileName}</span>
            {durationSec !== null && <> · {durationSec.toFixed(1)} s</>}
            {chapters.length > 0 && <> · {chapters.length} existing chapter(s) loaded</>}
          </p>

          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
            <div>
              <label className="mb-1 block text-sm font-medium">Chapter title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Intro"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Start (s)</label>
              <input
                type="number"
                value={startSec}
                onChange={(e) => setStartSec(e.target.value)}
                min={0}
                step="0.1"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addChapter}
                className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Add
              </button>
            </div>
          </div>

          {chapters.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-3 py-2">Start</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {[...chapters]
                    .sort((a, b) => a.startMs - b.startMs)
                    .map((c) => (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="px-3 py-1.5 font-mono text-muted-foreground">
                          {formatTimestamp(c.startMs / 1000, true)}
                        </td>
                        <td className="px-3 py-1.5">
                          <input
                            value={c.title}
                            onChange={(e) =>
                              setChapters((prev) =>
                                prev.map((p) =>
                                  p.id === c.id ? { ...p, title: e.target.value } : p,
                                ),
                              )
                            }
                            className="w-full bg-transparent outline-none"
                          />
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <button
                            onClick={() =>
                              setChapters((prev) => prev.filter((p) => p.id !== c.id))
                            }
                            className="text-xs text-red-500 hover:underline"
                          >
                            remove
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No chapters yet — add the first one above.
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={download}
              disabled={chapters.length === 0}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Write chapters &amp; download
            </button>
            <button
              onClick={() =>
                void onFile(
                  new File([fileBytes as unknown as BlobPart], fileName ?? "audio.mp3", {
                    type: "audio/mpeg",
                  }),
                )
              }
              className="text-sm text-muted-foreground hover:underline"
            >
              Choose another file
            </button>
          </div>
          {done && (
            <p className="text-sm text-green-600">
              Downloaded with {chapters.length} chapter frame(s) written.
            </p>
          )}
        </>
      )}
    </div>
  );
}
