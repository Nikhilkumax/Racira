import type { ComponentType } from "react";
import { FontPreviewer } from "../impl/FontPreviewer";
import { EASY_TOOL_COMPONENTS } from "./easy/registry";
import { MEDIUM_TOOL_COMPONENTS } from "./medium/registry";

/**
 * THE component registry for /typography/[slug].
 *
 * A slug may only be marked "live" in src/domains/typography/registry.ts when
 * it has an entry here — the domain registry spreads this map into its
 * COMP_MAP, and the [slug] page refuses to render a live tool without a wired
 * component. Adding an Easy-tier tool means: component in ./easy/, entry in
 * ./easy/registry.tsx, status flip in the domain registry, SEO entry.
 */
export const TOOL_COMPONENTS: Record<string, ComponentType<any>> = {
  "font-previewer": FontPreviewer,
  ...EASY_TOOL_COMPONENTS,
  ...MEDIUM_TOOL_COMPONENTS,
};
