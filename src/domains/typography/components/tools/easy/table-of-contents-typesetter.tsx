"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Row, Sel, SliderNum, TextArea, TextInput, fmtTrim } from "../ui";

const DEFAULT_ENTRIES = `1 · Openings|9
2 · Scales|31
3 · Rhythm|57
4 · Colour of type|83
Appendix A · Conversions|111
Index|127`;

interface Entry {
  title: string;
  page: string;
  level: number;
}

/**
 * Table of Contents Typesetter — builds a TOC with real leader dots. The
 * technique matters: leaders are a repeating fill between the title and the
 * page number, and the two portable ways to make them are a flex row with a
 * dotted border (uniform dots) or a repeating-linear-gradient background (exact
 * dot spacing). Print stylesheets can use `leader('.')` in CSS Paged Media.
 */
export default function TableOfContentsTypesetter() {
  const [raw, setRaw] = useState(DEFAULT_ENTRIES);
  const [title, setTitle] = useState("Contents");
  const [leader, setLeader] = useState("dots");
  const [gap, setGap] = useState("6");
  const [dotSize, setDotSize] = useState("2");
  const [indent, setIndent] = useState("1.25");
  const [numbers, setNumbers] = useState("right");
  const [showSubs, setShowSubs] = useState("no");

  const entries: Entry[] = raw
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const [t, p] = line.split("|");
      return { title: (t ?? "").trim(), page: (p ?? "").trim(), level: /^[\s·-]/.test(t ?? "") ? 1 : 0 };
    });

  const g = Math.max(2, parseFloat(gap) || 6);
  const ds = Math.max(1, parseFloat(dotSize) || 2);
  const ind = Math.max(0, parseFloat(indent) || 1.25);

  const rows = entries.map((e) => [
    e.title,
    e.page,
    e.level === 0 ? "top level" : "sub-entry",
    numbers === "right" ? "aligned right with leaders" : numbers === "left" ? "before the title" : "no page numbers",
  ]);

  const css = `.toc { --toc-dot: ${fmtTrim(ds, 1)}px; }

.toc li {
  display: flex;
  align-items: baseline;
  gap: ${fmtTrim(g, 1)}px;
  font-variant-numeric: tabular-nums;
}

.toc .title { flex: 0 1 auto; }

${leader === "dots"
      ? `.toc .leader {
  flex: 1 1 auto;
  border-bottom: ${fmtTrim(ds, 1)}px dotted currentColor;
  transform: translateY(-0.3em); /* sit the dots on the baseline rhythm */
}`
      : leader === "gradient"
        ? `.toc .leader {
  flex: 1 1 auto;
  height: 0.75em;
  background-image: radial-gradient(circle, currentColor ${fmtTrim(ds / 2, 1)}px, transparent ${fmtTrim(ds / 2 + 0.5, 2)}px);
  background-size: ${fmtTrim(g + ds, 1)}px 100%;
  background-position: 0 60%;
  background-repeat: repeat-x;
}`
        : `.toc .leader { flex: 1 1 auto; }`}

.toc .page { flex: 0 0 auto; }

.toc .sub { padding-left: ${fmtTrim(ind, 2)}rem; opacity: 0.85; }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Entries</PanelTitle>
        <div className="space-y-3">
          <TextInput name="title" label="Heading" value={title} onChange={setTitle} />
          <TextArea
            name="entries"
            label="Entries (Title | Page, one per line)"
            value={raw}
            onChange={setRaw}
            rows={8}
            placeholder={"1 · Openings|9"}
          />
          <Sel
            name="leader"
            label="Leader style"
            value={leader}
            onChange={setLeader}
            options={[
              { value: "dots", label: "Dotted border (uniform)" },
              { value: "gradient", label: "Gradient dots (controllable spacing)" },
              { value: "none", label: "No leaders" },
            ]}
          />
          <Sel
            name="numbers"
            label="Page numbers"
            value={numbers}
            onChange={setNumbers}
            options={[
              { value: "right", label: "Right-aligned with leaders" },
              { value: "left", label: "Before the title" },
              { value: "none", label: "Omitted" },
            ]}
          />
          <Sel
            name="subs"
            label="Sub-entries"
            value={showSubs}
            onChange={setShowSubs}
            options={[
              { value: "no", label: "Top level only" },
              { value: "yes", label: "Indent sub-entries" },
            ]}
          />
          <div className="grid grid-cols-3 gap-3">
            <SliderNum name="gap" label="Leader gap" unit="px" value={gap} onChange={setGap} min={2} max={16} step={0.5} />
            <SliderNum name="dot" label="Dot size" unit="px" value={dotSize} onChange={setDotSize} min={1} max={4} step={0.5} />
            <SliderNum name="indent" label="Sub indent" unit="rem" value={indent} onChange={setIndent} min={0} max={4} step={0.25} />
          </div>
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Typeset contents</PanelTitle>
          <div className="rounded-lg border border-border bg-white p-6 text-neutral-900">
            <h3 className="mb-4 text-center text-lg font-semibold tracking-wide">{title}</h3>
            <ul className="space-y-2 text-[13px]">
              {entries.map((e, i) => (
                <li
                  key={i}
                  className={`flex items-baseline gap-2 ${e.level === 1 && showSubs === "yes" ? "opacity-85" : ""}`}
                  style={{ paddingLeft: e.level === 1 && showSubs === "yes" ? `${ind}rem` : 0 }}
                >
                  {numbers === "left" && <span className="font-mono tabular-nums">{e.page}</span>}
                  <span className="shrink-0">{e.title}</span>
                  {leader === "dots" && <span className="flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-current" />}
                  {leader === "gradient" && (
                    <span
                      className="flex-1"
                      style={{
                        height: "0.75em",
                        backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                        backgroundSize: `${g + ds}px 100%`,
                        backgroundRepeat: "repeat-x",
                        backgroundPosition: "0 60%",
                      }}
                    />
                  )}
                  {leader === "none" && <span className="flex-1" />}
                  {numbers === "right" && <span className="font-mono tabular-nums">{e.page}</span>}
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Entry table</PanelTitle>
          <RefTable cols={["Title", "Page", "Level", "Numbering"]} rows={rows} minWidth={520} />
          <Row label="Entries" className="mt-3">
            <span className="font-mono text-xs text-muted-foreground">{entries.length} entries</span>
          </Row>
        </Panel>
        <CodeOut code={css} testid="toc-css" />
      </div>
    </CalcLayout>
  );
}
