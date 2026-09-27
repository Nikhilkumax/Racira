/**
 * Privacy & Security boilerplate — byte-identical to the text used across the
 * other domains' SEO content.
 *
 * Lives in its own module (not tool-seo.ts) because the per-batch content
 * modules import it; putting it in tool-seo.ts would create an import cycle
 * (tool-seo → batch → tool-seo) that evaluates the constant as undefined.
 */
export const PRIVACY_SECURITY_TEXT =
  "This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.";
