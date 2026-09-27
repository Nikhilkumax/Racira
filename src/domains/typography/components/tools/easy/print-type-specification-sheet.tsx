"use client";

import { useState } from "react";
import { Btn, CalcLayout, CodeOut, Panel, PanelTitle, RefTable, TextInput, fmtTrim } from "../ui";

/**
 * Print Type Specification Sheet — the handoff document a print job needs:
 * sizes in points, leading in points, measure in picas, column grid counts and
 * the matching CSS equivalents. Web sizes are typically quoted in px; a print
 * spec has to state pt explicitly, and the conversions here are the reason:
 * 1pt = 1/72in, 1pc = 12pt, and 1in = 6pc = 72pt.
 */
export default function PrintTypeSpecificationSheet() {
  const [job, setJob] = useState("Racira Annual Report");
  const [page, setPage] = useState("A4");
  const [bodyPt, setBodyPt] = useState("10.5");
  const [leading, setLeading] = useState("14");
  const [captions, setCaptions] = useState("8.5");
  const [heads, setHeads] = useState("24");
  const [measureMm, setMeasureMm] = useState("120");
  const [columns, setColumns] = useState("2");

  const bp = Math.max(4, parseFloat(bodyPt) || 10.5);
  const lead = Math.max(6, parseFloat(leading) || 14);
  const cp = Math.max(4, parseFloat(captions) || 8.5);
  const hp = Math.max(8, parseFloat(heads) || 24);
  const mm = Math.max(30, parseFloat(measureMm) || 120);
  const cols = Math.max(1, Math.round(parseFloat(columns) || 2));

  const ptToPx = (pt: number) => pt * (96 / 72);
  const mmToPc = (v: number) => (v / 25.4) * 6;
  const mmToPt = (v: number) => (v / 25.4) * 72;

  const rows = [
    ["Body", `${fmtTrim(bp, 2)}pt`, `${fmtTrim(lead, 2)}pt`, `${fmtTrim(lead / bp, 3)}×`, `${fmtTrim(ptToPx(bp), 2)}px`],
    ["Captions / footnotes", `${fmtTrim(cp, 2)}pt`, `${fmtTrim(cp * 1.35, 2)}pt`, "1.35×", `${fmtTrim(ptToPx(cp), 2)}px`],
    ["Headings", `${fmtTrim(hp, 2)}pt`, `${fmtTrim(hp * 1.15, 2)}pt`, "1.15×", `${fmtTrim(ptToPx(hp), 2)}px`],
    ["Sub-headings", `${fmtTrim(hp * 0.62, 2)}pt`, `${fmtTrim(hp * 1.2, 2)}pt`, "1.2×", `${fmtTrim(ptToPx(hp * 0.62), 2)}px`],
    ["Measure", `${fmtTrim(mm, 1)}mm`, "—", "—", `${fmtTrim(mmToPc(mm), 2)}pc (${fmtTrim(mmToPt(mm), 1)}pt)`],
  ];

  const colWidth = (mm - (cols - 1) * 4) / cols;
  const charsPerLine = Math.round(mmToPt(colWidth) / (bp * 0.5));

  const css = `/* print stylesheet equivalents for the spec above */
:root {
  --print-body: ${fmtTrim(bp, 2)}pt;       /* ${fmtTrim(ptToPx(bp), 2)}px on screen */
  --print-leading: ${fmtTrim(lead, 2)}pt;
  --print-caption: ${fmtTrim(cp, 2)}pt;
  --print-heading: ${fmtTrim(hp, 2)}pt;
}

@media print {
  body { font-size: var(--print-body); line-height: var(--print-leading); }
  .caption { font-size: var(--print-caption); }
  h1 { font-size: var(--print-heading); }
  .measure { max-width: ${fmtTrim(mm, 1)}mm; }
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Specification</PanelTitle>
        <div className="space-y-3">
          <TextInput name="job" label="Job name" value={job} onChange={setJob} />
          <TextInput name="page" label="Page size" value={page} onChange={setPage} />
          <div className="grid grid-cols-2 gap-3">
            <TextInput name="body" label="Body size (pt)" value={bodyPt} onChange={setBodyPt} />
            <TextInput name="lead" label="Leading (pt)" value={leading} onChange={setLeading} />
            <TextInput name="caption" label="Caption size (pt)" value={captions} onChange={setCaptions} />
            <TextInput name="head" label="Heading size (pt)" value={heads} onChange={setHeads} />
            <TextInput name="measure" label="Measure (mm)" value={measureMm} onChange={setMeasureMm} />
            <TextInput name="cols" label="Columns" value={columns} onChange={setColumns} />
          </div>
        </div>
        <div className="mt-4 print:hidden">
          <Btn onClick={() => window.print()}>Print spec sheet</Btn>
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Type spec — {job}</PanelTitle>
          <RefTable
            cols={["Role", "Size", "Leading", "Ratio", "Screen equivalent"]}
            rows={rows}
            minWidth={520}
            note={`Page ${page} · measure ${fmtTrim(mm, 1)}mm split into ${cols} column(s) of ${fmtTrim(colWidth, 1)}mm ≈ ${charsPerLine} characters.`}
          />
        </Panel>
        <CodeOut code={css} title="Print stylesheet" testid="print-type-css" />
      </div>
    </CalcLayout>
  );
}
