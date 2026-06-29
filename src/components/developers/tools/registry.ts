import type { ComponentType, ReactNode } from "react";

/**
 * The tool engine is registry-driven. Each tool slug maps to a ToolDefinition
 * that describes how to render it and how to compute its output.
 *
 * Everything runs 100% client-side. No network calls, no login.
 */

export type ToolMode = "text" | "dual" | "generator" | "table" | "custom";

/** Result returned by a tool transform. */
export interface ToolResult {
  /** Primary text output (shown in the output panel / copyable). */
  output: string;
  /** Optional secondary structured data (e.g. table rows, parsed JSON). */
  data?: unknown;
  /** Optional HTML to render instead of plain text (e.g. preview, markdown). */
  html?: string;
  /** Optional error message — shown inline, not as a thrown error. */
  error?: string;
  /** Optional info line shown under output (e.g. "12 keys, 340 bytes"). */
  info?: string;
}

/** Context handed to a transform / run function. */
export interface ToolContext {
  input: string;
  secondInput?: string;
  options: Record<string, unknown>;
  /** Signal that a long-running op should abort (not yet wired). */
}

/** A pure function from input+options to a ToolResult. Throw to surface errors. */
export type TransformFn = (ctx: ToolContext) => ToolResult | Promise<ToolResult>;

/** Options panel: a React component rendered above the input. */
export type OptionsComponent = ComponentType<{
  options: Record<string, unknown>;
  setOptions: (next: Record<string, unknown>) => void;
}>;

export interface ToolDefinition {
  /** Matches a tool slug from src/data/tools.ts. */
  slug: string;
  /** Visual layout to use. */
  mode: ToolMode;
  /** Compute the result. Required for text/dual/table; optional for generator/custom. */
  transform?: TransformFn;
  /** Options panel component (knobs, format pickers, etc). */
  options?: OptionsComponent;
  /** Default option values. */
  defaultOptions?: Record<string, unknown>;
  /**
   * If true, output updates live as the user types (debounced). Otherwise a
   * manual "Run" click is required. Default: true.
   */
  live?: boolean;
  /** Hide the input panel entirely (e.g. pure generators). */
  hideInput?: boolean;
  /** Custom renderer for mode === "custom". */
  customRenderer?: ComponentType<CustomRendererProps>;
  /** Labels for input fields (defaults to "Input" / "Output"). */
  inputLabel?: string;
  outputLabel?: string;
  /** Placeholder shown when input is empty. */
  placeholder?: string;
  /** File extensions accepted by the Upload button. */
  accept?: string;
  /** Allowed input file types for upload parsing. */
  readAs?: "text" | "dataurl";
  /** Extra primary actions shown next to Run (rendered by the shell). */
  note?: ReactNode;
}

export interface CustomRendererProps {
  input: string;
  setInput: (v: string) => void;
  options: Record<string, unknown>;
  setOptions: (next: Record<string, unknown>) => void;
}

const registry = new Map<string, ToolDefinition>();

export function registerTool(def: ToolDefinition) {
  registry.set(def.slug, def);
}

export function registerMany(defs: ToolDefinition[]) {
  for (const d of defs) registerTool(d);
}

export function getTool(slug: string): ToolDefinition | undefined {
  return registry.get(slug);
}
