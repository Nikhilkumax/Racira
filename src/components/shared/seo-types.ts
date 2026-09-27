/**
 * Shared editorial-SEO data shape for tool pages.
 *
 * Kept separate from the renderer so registry/type modules can import the shape
 * without pulling in a React client component. Any domain can attach this to its
 * tool definition and render it with `@/components/shared/SeoContent`.
 *
 * Body copy is plain prose. Any inline `**emphasis**` markers in the source are
 * unwrapped when rendered rather than turned into <strong> (see `plain` in
 * SeoContent), and are always stripped from the JSON-LD payloads — so the schema
 * stays plain text. Only the FAQ question line may still render bold.
 */
export interface ToolSeoFaq {
  q: string;
  a: string;
}

export interface ToolSeoHowTo {
  step: string;
}

/**
 * Privacy & Security body for tool pages.
 *
 * Byte-identical to the text used across the PDF and Developer Tools domains
 * (`PRIVACY_SECURITY_BLOCK`), and rendered by `SeoContent` for every authored
 * tool so the wording can never diverge tool by tool. Do not paraphrase it per
 * tool; the convention is one shared block reused verbatim across the domain.
 */
export const PRIVACY_SECURITY_BLOCK =
  "This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.";

export interface ToolSeo {
  /** Target search terms. Each entry must appear verbatim in `content` (build-gated). */
  keywords: string[];
  /** 1-2 sentence opening using the primary keyword. */
  intro: string;
  /**
   * Main body, 500-1000 words (build-gated). Blank-line separated paragraphs of
   * 2-4 sentences, direct language, no marketing flourish.
   */
  content: string;
  /** 4-6 tool-specific questions. Each must be unique across the domain. */
  faqs: ToolSeoFaq[];
  /** Ordered steps for tools with a genuine multi-step workflow. */
  howTo?: ToolSeoHowTo[];
  /** Body for the "When to use X vs related tools" section. */
  whenToUse?: string;
}
