"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Row, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";
import { FONTS } from "../fonts";

const MONOS = FONTS.filter((f) => f.kind === "mono");
const PARTNERS = FONTS.filter((f) => f.kind !== "mono");

/**
 * Monospace Pairing Tool — monospace is used for code, tabular data and
 * metadata, where character alignment matters more than rhythm. The tool pairs
 * a mono face with a proportional partner and previews the two together (code
 * block + prose), plus the ligature/alignment checks that decide whether the
 * pair is viable in an editor or a table.
 */
export default function MonospacePairingTool() {
  const [monoName, setMonoName] = useState("JetBrains Mono");
  const [partnerName, setPartnerName] = useState("Inter");
  const [code, setCode] = useState("function pair(mono, sans) {\n  return `${mono} + ${sans}`;\n}");
  const [monoSize, setMonoSize] = useState("13");

  const mono = MONOS.find((f) => f.name === monoName) ?? MONOS[0];
  const partner = PARTNERS.find((f) => f.name === partnerName) ?? PARTNERS[0];
  const ms = Math.min(28, Math.max(9, parseFloat(monoSize) || 13));
  const monoAdvance = ms * 0.6; // typical monospace advance width
  const rows = [
    { label: "1", key: "1i", alt: "i" },
    { label: "0", key: "0O", alt: "O" },
    { label: "()", key: "()[]{}", alt: "" },
    { label: "table", key: "||||", alt: "" },
  ];

  const css = `code, pre, kbd, samp {
  font-family: ${mono.stack};
  font-size: ${(ms / 16).toFixed(4)}rem;
  font-variant-ligatures: none; /* keep code characters unambiguous */
}

p, li, td {
  font-family: ${partner.stack};
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Pair</PanelTitle>
        <Sel
          name="mono"
          label="Monospace face"
          value={monoName}
          onChange={setMonoName}
          options={MONOS.map((f) => ({ value: f.name, label: f.name }))}
        />
        <div className="mt-3 space-y-3">
          <Sel
            name="partner"
            label="Proportional partner"
            value={partnerName}
            onChange={setPartnerName}
            options={PARTNERS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))}
          />
          <TextInput name="code" label="Code sample" value={code} onChange={setCode} />
          <SliderNum name="msize" label="Code size" unit="px" value={monoSize} onChange={setMonoSize} min={9} max={28} step={1} />
        </div>
        <ResBox>
          <Res name="advance" label="Estimated advance width" value={`${monoAdvance.toFixed(2)}px / char`} />
          <Res name="cols" label="Characters in 640px" value={String(Math.floor(640 / monoAdvance))} />
          <Res name="pair" label="Pair" value={`${mono.name} + ${partner.name}`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Mixed preview</PanelTitle>
          <p className="text-sm leading-relaxed text-foreground/90" style={{ fontFamily: partner.stack }}>
            Prose and code share almost every technical document. The partner face carries description, while{" "}
            <code
              style={{ fontFamily: mono.stack, fontSize: `${ms}px` }}
              className="rounded border border-border bg-muted/40 px-1 py-0.5"
            >
              inline_code()
            </code>{" "}
            carries the literals.
          </p>
          <pre
            data-testid="mono-code"
            className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/30 p-3 leading-relaxed text-foreground"
            style={{ fontFamily: mono.stack, fontSize: `${ms}px`, fontVariantLigatures: "none" }}
          >
            <code>{code}</code>
          </pre>
        </Panel>

        <Panel>
          <PanelTitle>Alignment & ambiguity checks</PanelTitle>
          {rows.map((r) => (
            <Row key={r.label} label={r.label}>
              <span
                className="block text-right text-foreground"
                style={{ fontFamily: mono.stack, fontSize: `${ms + 4}px` }}
              >
                {r.key}
                {r.alt && <span className="ml-3 text-muted-foreground">{r.alt}</span>}
              </span>
            </Row>
          ))}
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Check that 0/O and 1/l/I are distinguishable and that `|||` characters touch — a slashed zero or a dotted zero
            is the usual fix. Disable ligatures in code contexts so `!=` never renders as a single glyph.
          </p>
        </Panel>
        <CodeOut code={css} testid="mono-pair-css" />
      </div>
    </CalcLayout>
  );
}
