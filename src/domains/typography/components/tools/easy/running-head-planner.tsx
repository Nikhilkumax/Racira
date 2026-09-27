"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Row, Sel, SliderNum, TextInput } from "../ui";

interface PageHead {
  page: number;
  side: "recto" | "verso" | "single";
  head: string;
  number: string;
}

/**
 * Running Head Planner — plans the head content of a whole signature rather
 * than previewing one page. The plan table answers the questions a book
 * designer has to settle before typesetting: which pages get no head (chapter
 * openings and blanks), which head goes on which side, and where the page
 * number sits relative to the head text.
 */
export default function RunningHeadPlanner() {
  const [book, setBook] = useState("The Shape of Type");
  const [chapters, setChapters] = useState("1, 33, 65, 97");
  const [openingPages, setOpeningPages] = useState("include");
  const [numbers, setNumbers] = useState("outer");
  const [count, setCount] = useState("8");
  const [start, setStart] = useState("1");
  const [signature, setSignature] = useState("16");

  const chapterStarts = chapters
    .split(/[,\s]+/)
    .map((c) => parseInt(c, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  const n = Math.min(32, Math.max(4, Math.round(parseFloat(count) || 8)));
  const s = Math.max(1, Math.round(parseFloat(start) || 1));
  const sig = Math.min(64, Math.max(4, Math.round(parseFloat(signature) || 16)));

  const pages: PageHead[] = Array.from({ length: n }, (_, i) => {
    const page = s + i;
    const side: PageHead["side"] = page % 2 === 0 ? "verso" : "recto";
    const isChapterStart = chapterStarts.includes(page);
    const chapterAtOrBefore = [...chapterStarts].filter((c) => c < page).pop();
    const head =
      isChapterStart && openingPages === "suppress"
        ? "(no head — chapter opening)"
        : side === "verso"
          ? chapterAtOrBefore
            ? `Chapter starting p.${chapterAtOrBefore} — short title`
            : "front matter head"
          : book;
    const number = numbers === "none" ? "—" : numbers === "outer" ? (side === "verso" ? `left · ${page}` : `${page} · right`) : numbers === "center" ? `centred ${page}` : `inner ${page}`;
    return { page, side, head, number };
  });

  const css = `.running-head {
  position: running(head);
}
@page :left  { @top-left  { content: string(head); } @top-right { content: counter(page); } }
@page :right { @top-right { content: string(head); } @top-left  { content: counter(page); } }
@page :blank { @top-left { content: none; } @top-right { content: none; } }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Plan</PanelTitle>
        <div className="space-y-3">
          <TextInput name="book" label="Book title (recto head)" value={book} onChange={setBook} />
          <TextInput name="chapters" label="Chapter start pages" value={chapters} onChange={setChapters} placeholder="1, 33, 65" />
          <Row label="Chapter opening pages">
            <Sel
              name="openings"
              label=""
              value={openingPages}
              onChange={setOpeningPages}
              options={[
                { value: "suppress", label: "Suppress the head" },
                { value: "include", label: "Keep the head" },
              ]}
            />
          </Row>
          <Row label="Page numbers">
            <Sel
              name="numbers"
              label=""
              value={numbers}
              onChange={setNumbers}
              options={[
                { value: "outer", label: "Outer edge (both sides)" },
                { value: "inner", label: "Inner edge (gutter)" },
                { value: "center", label: "Centred" },
                { value: "none", label: "No numbers" },
              ]}
            />
          </Row>
          <SliderNum name="start" label="First page number" value={start} onChange={setStart} min={1} max={400} step={1} />
          <SliderNum name="count" label="Pages in plan" value={count} onChange={setCount} min={4} max={32} step={1} />
          <SliderNum name="sig" label="Signature size" unit="pages" value={signature} onChange={setSignature} min={4} max={64} step={4} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Signature of {sig} pages → {Math.ceil(n / sig)} sheet(s) for this plan. Printers impose in signatures; a plan
          that spills one page past a signature boundary adds a whole sheet.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Page-by-page heads</PanelTitle>
          <RefTable
            cols={["Page", "Side", "Head content", "Page number"]}
            rows={pages.map((p) => [String(p.page), p.side, p.head, p.number])}
            minWidth={560}
          />
        </Panel>
        <CodeOut code={css} title="CSS Paged Media equivalent" testid="runninghead-css" />
      </div>
    </CalcLayout>
  );
}
