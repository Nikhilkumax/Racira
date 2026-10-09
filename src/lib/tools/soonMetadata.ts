import type { Metadata } from "next";

/**
 * Shared "coming soon" metadata for tool pages whose registry status is not
 * "live" — used by every domain that renders a Coming Soon page.
 *
 * Everything here is derived from registry fields (name, description,
 * category/subcategory) plus a small set of shared template sentences, so no
 * per-page copy is ever hand-written.
 *
 * The contract each soon page must satisfy:
 *  - unique <title>: `<label> — Coming Soon — <site name>`
 *  - unique meta description, 120-160 characters (decoded)
 *  - self-referencing flat canonical `/<domain>/<slug>`
 *  - no robots meta while the domain's INDEX_SOON_PAGES switch is true
 *
 * Uniqueness is structural, not accidental: descriptions always carry the
 * tool's own label and the domain's site name, so the handful of tool names
 * that repeat across domains (e.g. "SVG to PNG" in design and image) can never
 * produce the same string twice.
 */

const MIN_LENGTH = 120;
const MAX_LENGTH = 160;
const TARGET_LENGTH = 145;

export interface SoonToolFields {
  slug: string;
  name: string;
  description?: string;
  desc?: string;
  subCategory?: string;
  subcategory?: string;
  category?: string;
}

export interface SoonMetaInput {
  tool: SoonToolFields;
  /** URL route segment, e.g. "photo" — the canonical path is `/<domainKey>/<slug>`. */
  domainKey: string;
  /** Domain brand string from that domain's site identity, e.g. "Racira Photography". */
  siteName: string;
  /** Display name of the tool's category/subcategory when the registry has one. */
  categoryName?: string;
  /** Counts of soon-tool names inside the same domain (repeated-name qualifier). */
  soonNameCounts?: Map<string, number>;
}

/** Slug words that must stay uppercase when a slug is humanised. */
const SLUG_ACRONYMS = new Set([
  "3d", "ai", "api", "avif", "bmp", "cad", "cmyk", "css", "csv", "dpi", "dsp",
  "eq", "exif", "flac", "gif", "gps", "hdr", "heic", "html", "hsl", "ide",
  "jpeg", "jpg", "json", "lut", "midi", "mocap", "mp3", "mp4", "ocr", "pdf",
  "png", "rgb", "rtf", "seo", "svg", "tiff", "tts", "ui", "url", "ux", "wav",
  "webp", "xml", "xps", "zip",
]);

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => (SLUG_ACRONYMS.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

function clean(text?: string): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

/** Display label for a soon tool — its registry name, qualified when the domain repeats it. */
export function soonLabel(tool: SoonToolFields, soonNameCounts?: Map<string, number>): string {
  const name = clean(tool.name) || humanizeSlug(tool.slug);
  if (!soonNameCounts || (soonNameCounts.get(name) ?? 0) < 2) return name;
  const group = [tool.subCategory, tool.subcategory, tool.category].map(clean).find(Boolean);
  return `${name} (${group ?? humanizeSlug(tool.slug)})`;
}

/** Unique <title> for a soon page. */
export function soonTitle(input: SoonMetaInput): string {
  return `${soonLabel(input.tool, input.soonNameCounts)} — Coming Soon — ${input.siteName}`;
}

/**
 * Unique meta description, 120-160 characters: the registry description when it
 * fits, padded with shared template sentences, trimmed at a word boundary when
 * the registry description is too long for the window.
 */
export function soonDescription(input: SoonMetaInput): string {
  const label = soonLabel(input.tool, input.soonNameCounts);
  const category = clean(input.categoryName ?? input.tool.subCategory ?? input.tool.subcategory ?? input.tool.category);
  const group = category ? category.toLowerCase() : "";
  const action = clean(input.tool.description ?? input.tool.desc).replace(/\.+$/, "");
  const tail = `Coming soon to ${input.siteName}.`;
  const genericHead = group
    ? `${label} is a free browser-based ${group} tool`
    : `${label} is a free browser-based tool`;

  const optional = [
    "Free to use, private, and runs entirely in your browser.",
    group ? `Part of our ${group} toolkit.` : "Part of the Racira toolkit.",
    "No signup and no install.",
    group ? `Browse the rest of our ${group} tools while you wait.` : "Browse our other free tools while you wait.",
    "Check back soon for the release.",
  ];

  // Prefer keeping the registry description intact; only shorten it (whole
  // words at a time) when no candidate using the full text fits the window.
  const actionWords = action.split(" ").filter(Boolean);
  for (let words = actionWords.length; words >= 0; words--) {
    const trimmed = actionWords.slice(0, words).join(" ");
    const head = trimmed ? `${label}: ${trimmed}` : genericHead;
    let best = "";
    for (let mask = (1 << optional.length) - 1; mask >= 0; mask--) {
      const parts = [head, tail];
      for (let i = 0; i < optional.length; i++) if (mask & (1 << i)) parts.push(optional[i]);
      const candidate = parts.join(" ");
      if (candidate.length < MIN_LENGTH || candidate.length > MAX_LENGTH) continue;
      if (!best || Math.abs(candidate.length - TARGET_LENGTH) < Math.abs(best.length - TARGET_LENGTH)) {
        best = candidate;
      }
    }
    if (best) return best;
  }

  // Not reachable for the current registries (verified by scratch/verify-soon-meta.cjs);
  // kept as a bounded fallback so a future registry entry can never emit an
  // out-of-range or over-length description.
  const fallback = `${genericHead}. ${tail} Free to use, private, and runs entirely in your browser.`;
  if (fallback.length <= MAX_LENGTH) return fallback;
  return `${fallback.slice(0, MAX_LENGTH - 1).replace(/\s+\S*$/, "")}.`;
}

/**
 * Metadata for a soon tool page. `indexSoonPages` is the domain's
 * INDEX_SOON_PAGES switch (see src/domains/<domain>/indexing.ts): while it is
 * true the page is indexable and carries no robots meta.
 */
export function buildSoonMetadata(input: SoonMetaInput, indexSoonPages: boolean): Metadata {
  const meta: Metadata = {
    title: soonTitle(input),
    description: soonDescription(input),
    alternates: { canonical: `/${input.domainKey}/${input.tool.slug}` },
  };
  if (!indexSoonPages) meta.robots = { index: false, follow: true };
  return meta;
}
