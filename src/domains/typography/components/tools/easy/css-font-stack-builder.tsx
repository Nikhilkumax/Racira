"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, TextInput } from "../ui";
import { FONTS } from "../fonts";

/**
 * CSS Font Stack Builder — assembles a resilient font-family declaration:
 * primary face → category fallback → generic family → emoji/symbol tail, and
 * previews the resolved stack on real text.
 */
const EMPTY = "(none)";

export default function CssFontStackBuilder() {
  const [primary, setPrimary] = useState("Inter");
  const [secondary, setSecondary] = useState(EMPTY);
  const [generic, setGeneric] = useState("sans-serif");
  const [tail, setTail] = useState(true);
  const [sample, setSample] = useState("Racira Fonts — stack preview");

  const primaryFont = FONTS.find((f) => f.name === primary);
  const parts = [
    primaryFont ? primaryFont.stack : `'${primary}', ${generic}`,
    secondary !== EMPTY ? FONTS.find((f) => f.name === secondary)?.stack.replace(/, .*$/, "") : null,
    generic,
  ].filter(Boolean) as string[];
  if (tail) parts.push("'Apple Color Emoji'", "'Segoe UI Emoji'", "'Noto Color Emoji'");

  const stack = parts.join(", ");
  const css = `font-family: ${stack};`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Stack</PanelTitle>
        <div className="space-y-3">
          <Sel
            name="primary"
            label="Primary face"
            value={primary}
            onChange={setPrimary}
            options={FONTS.map((f) => ({ value: f.name, label: `${f.name} (${f.kind})` }))}
          />
          <Sel
            name="secondary"
            label="Fallback face (optional)"
            value={secondary}
            onChange={setSecondary}
            options={[EMPTY, ...FONTS.map((f) => f.name)].map((n) => ({ value: n, label: n }))}
          />
          <Sel
            name="generic"
            label="Generic family"
            value={generic}
            onChange={setGeneric}
            options={[
              { value: "sans-serif", label: "sans-serif" },
              { value: "serif", label: "serif" },
              { value: "monospace", label: "monospace" },
              { value: "system-ui", label: "system-ui" },
              { value: "cursive", label: "cursive" },
            ]}
          />
          <TextInput name="sample" label="Preview text" value={sample} onChange={setSample} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={tail} onChange={(e) => setTail(e.target.checked)} className="accent-primary" />
            Append emoji fallbacks
          </label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Quoted family names, comma-separated, generic family last, emoji tail optional.
          </p>
        </div>
        <ResBox>
          <Res name="count" label="Faces in stack" value={String(parts.length)} />
          <Res name="generic" label="Terminal family" value={generic} />
          <Res name="primary" label="Primary kind" value={primaryFont?.kind ?? "custom"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <p style={{ fontFamily: stack, fontSize: 28, lineHeight: 1.4 }} className="text-foreground">
            {sample}
          </p>
          <p style={{ fontFamily: stack, fontSize: 15, lineHeight: 1.6 }} className="mt-3 text-muted-foreground">
            The quick brown fox jumps over the lazy dog — 0123456789 — the fallback chain only shows through when the
            primary face is missing a glyph or fails to load.
          </p>
        </Panel>
        <CodeOut code={css} title="font-family" testid="font-stack-css" />
      </div>
    </CalcLayout>
  );
}
