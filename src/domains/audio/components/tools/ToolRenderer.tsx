"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

import { FORMAT_ORDER, FORMATS } from "@/domains/audio/lib/audioFormats";

function ToolSkeleton() {
  return (
    <div className="h-[420px] animate-pulse rounded-2xl border border-border bg-card" />
  );
}

/**
 * Slug → component map for Audio tools with a real implementation.
 *
 * Every audio tool touches the Web Audio API (AudioContext, decodeAudioData),
 * which does not exist during SSR, so all entries load client-side only.
 *
 * Every format converter is the same shared component; the slug only decides
 * which output format it opens on. ffmpeg.wasm is *not* pulled in by this
 * import — UniversalAudioConverter imports it dynamically at convert time.
 *
 * Keep in sync with IMPLEMENTED_TOOL_SLUGS in ./implemented.ts.
 */
const UniversalAudioConverter = dynamic(() => import("./UniversalAudioConverter"), {
  ssr: false,
  loading: () => <ToolSkeleton />,
});

export const TOOL_COMPONENTS: Record<string, ComponentType<any>> = Object.fromEntries(
  FORMAT_ORDER.map((id) => [FORMATS[id].slug, UniversalAudioConverter]),
);

/** Per-slug props, so /audio/flac-converter opens on FLAC rather than MP3. */
export const TOOL_PROPS: Record<string, Record<string, unknown>> = Object.fromEntries(
  FORMAT_ORDER.map((id) => [FORMATS[id].slug, { defaultFormat: id }]),
);

export function ToolRenderer({ slug }: { slug: string }) {
  const Component = TOOL_COMPONENTS[slug];
  if (!Component) return null;
  return <Component {...(TOOL_PROPS[slug] ?? {})} />;
}
