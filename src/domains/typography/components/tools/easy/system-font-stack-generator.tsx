"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel } from "../ui";

/**
 * System Font Stack Generator — zero-download stacks built from fonts already
 * installed on macOS/iOS, Windows, Android and Linux. Every non-generic entry
 * is a real shipped system face; the terminal generic keeps the stack working
 * on anything not covered.
 */
const PRESETS: Record<string, { label: string; stack: string; note: string }> = {
  "modern-ui": {
    label: "Modern UI (default)",
    stack:
      "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    note: "Best all-round: each OS gets its own UI face, no request, no FOUT.",
  },
  humanist: {
    label: "Humanist",
    stack: "'Segoe UI', 'Helvetica Neue', 'Lucida Grande', Tahoma, Verdana, sans-serif",
    note: "Open apertures and a warmer voice than the default UI face.",
  },
  grotesque: {
    label: "Neo-grotesque",
    stack: "'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', sans-serif",
    note: "Tight, neutral, and predictable metrics — good for dense UI.",
  },
  transitional: {
    label: "Transitional serif",
    stack: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, Georgia, serif",
    note: "Readable serif body text with a classic feel and no webfont.",
  },
  slab: {
    label: "Slab serif",
    stack: "'Roboto Slab', Rockwell, 'Courier New', monospace",
    note: "Display-flavoured but still local-only on most platforms.",
  },
  mono: {
    label: "Monospace",
    stack: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
    note: "Code blocks and tabular data — integer metrics where available.",
  },
};

export default function SystemFontStackGenerator() {
  const [choice, setChoice] = useState("modern-ui");
  const [sample, setSample] = useState("System fonts load instantly — no network, no flash.");
  const preset = PRESETS[choice];
  const css = `font-family: ${preset.stack};`;

  const faces = preset.stack.split(", ");

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Preset</PanelTitle>
        <Sel
          name="preset"
          label="Stack family"
          value={choice}
          onChange={setChoice}
          options={Object.entries(PRESETS).map(([value, p]) => ({ value, label: p.label }))}
        />
        <div className="mt-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Preview text</span>
            <input
              type="text"
              value={sample}
              onChange={(e) => setSample(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
        </div>
        <ResBox>
          <Res name="faces" label="Faces in stack" value={String(faces.length)} />
          <Res name="requests" label="Network requests" value="0" />
          <Res name="terminal" label="Terminal family" value={faces[faces.length - 1]?.trim() ?? "—"} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{preset.note}</p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <p style={{ fontFamily: preset.stack, fontSize: 26, lineHeight: 1.4 }} className="text-foreground">
            {sample}
          </p>
          <p style={{ fontFamily: preset.stack, fontSize: 14, lineHeight: 1.7 }} className="mt-3 text-muted-foreground">
            Grumpy wizards make toxic brew for the evil Queen and Jack. 0123456789 — the actual face you see depends on
            the operating system, which is exactly what a system stack is for.
          </p>
        </Panel>
        <CodeOut code={css} title="CSS" testid="system-stack-css" />
      </div>
    </CalcLayout>
  );
}
