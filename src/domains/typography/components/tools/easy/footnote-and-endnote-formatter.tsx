"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Row, Sel, SliderNum, TextArea } from "../ui";

const NOTES = [
  "Bringhurst, R. The Elements of Typographic Style, 4th ed., p. 71.",
  "Tschichold, J. The Form of the Book, chapter 3.",
  "Oxford Style Manual, section 12.4 (notes and references).",
  "Kindersley, D. Optical letter spacing, Journal of Typography 2(1).",
];

type Marker = "superscript" | "bracket" | "symbol" | "inline";

/**
 * Footnote & Endnote Formatter — sets the notes area that runs under a column
 * rule at the foot of a page, and the reference marks that connect it to the
 * text. The marker style is the decision with the most downstream effect:
 * superscript figures are conventional, bracketed numerals survive in plain
 * text, symbols are used when a page carries only a handful of notes, and
 * inline markers avoid the split entirely.
 */
export default function FootnoteAndEndnoteFormatter() {
  const [notes, setNotes] = useState(NOTES.join("\n"));
  const [marker, setMarker] = useState<Marker>("superscript");
  const [size, setSize] = useState("8.5");
  const [bodySize, setBodySize] = useState("10");
  const [leading, setLeading] = useState("11");
  const [rule, setRule] = useState("30");
  const [start, setStart] = useState("1");

  const noteList = notes.split("\n").filter((n) => n.trim());
  const n = Math.max(4, parseFloat(size) || 8.5);
  const b = Math.max(8, parseFloat(bodySize) || 10);
  const l = Math.max(8, parseFloat(leading) || 11);
  const r = Math.min(100, Math.max(10, parseFloat(rule) || 30));
  const startAt = Math.max(1, Math.round(parseFloat(start) || 1));
  const symbols = ["*", "†", "‡", "§", "¶"];

  const markerFor = (i: number) => {
    const num = startAt + i;
    if (marker === "bracket") return `[${num}]`;
    if (marker === "symbol") return symbols[i % symbols.length];
    if (marker === "inline") return `(note ${num})`;
    return String(num);
  };

  const css = `.footnotes {
  font-size: ${n}pt;
  line-height: ${l}pt;
  border-top: 1px solid currentColor;
  width: ${r}%;
  padding-top: 0.6em;
  margin-top: 1.5em;
}

.footnotes ol { list-style: none; margin: 0; padding: 0; }
.footnotes li { padding-left: 1.4em; text-indent: -1.4em; }

/* in-text reference mark */
.fn-ref {
  font-size: 0.65em;
  line-height: 0;
  vertical-align: super;
  /* the mark hangs outside the measure, like optical punctuation */
  margin-left: -0.12em;
  padding-left: 0.12em;
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Notes</PanelTitle>
        <TextArea name="notes" label="Note text (one per line)" value={notes} onChange={setNotes} rows={6} />
        <div className="mt-3 space-y-3">
          <Sel
            name="marker"
            label="Reference marker"
            value={marker}
            onChange={(v) => setMarker(v as Marker)}
            options={[
              { value: "superscript", label: "Superscript numerals 1" },
              { value: "bracket", label: "Bracketed numerals [1]" },
              { value: "symbol", label: "Symbols * † ‡" },
              { value: "inline", label: "Inline parenthetical (note 1)" },
            ]}
          />
          <Row label="Numbering starts at">
            <SliderNum name="start" label="" value={start} onChange={setStart} min={1} max={99} step={1} />
          </Row>
          <div className="grid grid-cols-3 gap-3">
            <SliderNum name="size" label="Note size" unit="pt" value={size} onChange={setSize} min={6} max={12} step={0.25} />
            <SliderNum name="body" label="Body size" unit="pt" value={bodySize} onChange={setBodySize} min={8} max={14} step={0.25} />
            <SliderNum name="lead" label="Note leading" unit="pt" value={leading} onChange={setLeading} min={8} max={18} step={0.25} />
          </div>
          <SliderNum name="rule" label="Rule width" unit="% of column" value={rule} onChange={setRule} min={10} max={100} step={5} />
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Reference markers</PanelTitle>
          <RefTable
            cols={["Note", "Marker", "Closed-up form", "Used when"]}
            rows={noteList.map((note, i) => [
              String(startAt + i),
              markerFor(i),
              `${markerFor(i)} — ${note.slice(0, 46)}${note.length > 46 ? "…" : ""}`,
              i === 0
                ? { superscript: "default for text with figures", bracket: "plain-text output", symbol: "few notes on the page", inline: "no reference marks wanted" }[marker]
                : "—",
            ])}
            minWidth={600}
          />
        </Panel>

        <Panel>
          <PanelTitle>Notes block preview</PanelTitle>
          <div className="rounded-lg border border-border bg-white p-4 text-neutral-900">
            <p style={{ fontSize: `${b}pt`, lineHeight: 1.5 }}>
              The argument in the text carries a reference
              <sup style={{ fontSize: "0.65em", verticalAlign: "super" }}>{markerFor(0)}</sup>, and a second note follows
              shortly after
              <sup style={{ fontSize: "0.65em", verticalAlign: "super" }}>{markerFor(1)}</sup>.
            </p>
            <div style={{ width: `${r}%`, borderTop: "1px solid currentColor", marginTop: "1.2em", paddingTop: "0.5em" }}>
              <ol className="list-none space-y-1" style={{ fontSize: `${n}pt`, lineHeight: `${l}pt` }}>
                {noteList.map((note, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="w-4 shrink-0 text-right">{markerFor(i)}</span>
                    <span className="min-w-0 flex-1">{note}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Panel>
        <CodeOut code={css} testid="footnote-css" />
      </div>
    </CalcLayout>
  );
}
