"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextArea, TextInput, fmtTrim } from "../ui";

const DEFAULT_ENTRIES = `alphabet, 14, 42, 88
alignment, optical, 61–63, 74
baseline grid, 29, 30, 52
— harmony, 55
— rhythm, 52, 58
colour, of type, 96–101
kerning, 47, 112
letterspacing, 44, 58
measure, 27, 68, 71`;

/**
 * Index Page Layout Preview — sets a book or document index as it is actually
 * read: a two-alphabet-column page with hanging indents, runover indents for
 * continuation lines, sub-entries under their parent, and a page-number column
 * that aligns by digit. The indents and the number of columns are the two
 * decisions that determine whether an index is scannable.
 */
export default function IndexPageLayoutPreview() {
  const [raw, setRaw] = useState(DEFAULT_ENTRIES);
  const [title, setTitle] = useState("Index");
  const [columns, setColumns] = useState("2");
  const [size, setSize] = useState("9.5");
  const [leading, setLeading] = useState("11.5");
  const [indent, setIndent] = useState("1.2");
  const [runover, setRunover] = useState("2");
  const [subIndent, setSubIndent] = useState("1.1");

  const entries = raw
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const [head, ...rest] = line.split(",");
      const isSub = head.trim().startsWith("—");
      return {
        head: head.trim().replace(/^—\s*/, ""),
        pages: rest.join(",").trim(),
        sub: isSub,
      };
    });

  const n = Math.min(3, Math.max(1, Math.round(parseFloat(columns) || 2)));
  const pt = Math.max(6, parseFloat(size) || 9.5);
  const lead = Math.max(8, parseFloat(leading) || 11.5);
  const ind = Math.max(0, parseFloat(indent) || 1.2);
  const run = Math.max(0, parseFloat(runover) || 2);
  const subInd = Math.max(0, parseFloat(subIndent) || 1.1);
  const entriesPerColumn = Math.ceil(entries.length / n);

  const css = `.index {
  font-size: ${pt}pt;
  line-height: ${lead}pt;
  column-count: ${n};
  column-gap: 6mm;
  hyphens: none;
}

.index li {
  padding-left: ${fmtTrim(run, 2)}em;   /* runover indent for continuation lines */
  text-indent: -${fmtTrim(run, 2)}em;
  margin-bottom: ${fmtTrim(lead * 0.15, 2)}pt;
}

.index li.sub { padding-left: ${fmtTrim(run + subInd, 2)}em; }

.index .pages { font-variant-numeric: tabular-nums; }
.index .head { padding-right: 0.5em; }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Index settings</PanelTitle>
        <TextInput name="title" label="Heading" value={title} onChange={setTitle} />
        <div className="mt-3 space-y-3">
          <SliderNum name="columns" label="Columns" value={columns} onChange={setColumns} min={1} max={3} step={1} />
          <SliderNum name="size" label="Entry size" unit="pt" value={size} onChange={setSize} min={6} max={14} step={0.25} />
          <SliderNum name="leading" label="Leading" unit="pt" value={leading} onChange={setLeading} min={8} max={20} step={0.25} />
          <SliderNum name="indent" label="Runover indent" unit="em" value={runover} onChange={setRunover} min={0} max={4} step={0.1} />
          <SliderNum name="sub" label="Sub-entry indent" unit="em" value={subIndent} onChange={setSubIndent} min={0} max={4} step={0.1} />
          <SliderNum name="hang" label="Hanging indent" unit="em" value={indent} onChange={setIndent} min={0} max={4} step={0.1} />
          <TextArea name="entries" label="Entries (term, pages — prefix sub-entries with “—”)" value={raw} onChange={setRaw} rows={9} />
        </div>
        <ResBox>
          <Res name="entries" label="Entries" value={String(entries.length)} />
          <Res name="per" label="Entries per column" value={String(entriesPerColumn)} />
          <Res name="subs" label="Sub-entries" value={String(entries.filter((e) => e.sub).length)} />
          <Res name="height" label="Column height" value={`${fmtTrim(lead * (entriesPerColumn + 1), 1)}pt`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Typeset index</PanelTitle>
          <div className="rounded-lg border border-border bg-white p-6 text-neutral-900">
            <h3 className="mb-3 text-center font-semibold">{title}</h3>
            <ul
              data-testid="index-preview"
              style={{ fontSize: `${pt}pt`, lineHeight: `${lead}pt`, columnCount: n, columnGap: "6mm", hyphens: "none" }}
              className="space-y-0.5"
            >
              {entries.map((e, i) => (
                <li key={i} style={{ paddingLeft: `${run + (e.sub ? subInd : 0)}em`, textIndent: `-${run}em` }}>
                  <span className="pr-2">{e.head}</span>
                  {e.pages && <span style={{ fontVariantNumeric: "tabular-nums" }}>{e.pages}</span>}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center text-[9pt] text-neutral-500">{n} column(s) · {fmtTrim(pt, 2)}pt on {fmtTrim(lead, 2)}pt</p>
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Index conventions</PanelTitle>
          <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>· Page numbers are set with tabular figures and are never tracked; the reader scans the column, not the line.</li>
            <li>· The runover indent marks continuation lines, so a long entry is visually one entry rather than two.</li>
            <li>· Sub-entries sit under their parent with a smaller indent than the parent's own start — hierarchy by position, not by size.</li>
            <li>· Two or three columns are the norm for print; a single-column index is only justified on very narrow pages.</li>
            <li>· Hyphenation is disabled: hyphenating a term would make it unfindable.</li>
          </ul>
        </Panel>

        <CodeOut code={css} title="Index CSS" testid="index-css" />
      </div>
    </CalcLayout>
  );
}
