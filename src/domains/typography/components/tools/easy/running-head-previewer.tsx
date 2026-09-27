"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

/**
 * Running Head Previewer — a running head is the small line at the top of every
 * page carrying the book title, chapter and page number. The one rule that
 * matters in a two-sided layout is that the outer edge is the page number
 * (recto right, verso left); this tool renders both pages so the alternation is
 * visible rather than described.
 */
export default function RunningHeadPreviewer() {
  const [book, setBook] = useState("The Shape of Type");
  const [chapter, setChapter] = useState("Chapter 3 · Rhythm");
  const [pageSize, setPageSize] = useState("16");
  const [margin, setMargin] = useState("12");
  const [weight, setWeight] = useState("400");
  const [fontName, setFontName] = useState("Source Serif 4");
  const [mode, setMode] = useState("alternating");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(20, Math.max(8, parseFloat(pageSize) || 16));
  const m = Math.min(40, Math.max(2, parseFloat(margin) || 12));
  const w = parseFloat(weight) || 400;

  const pages =
    mode === "alternating"
      ? [
          { side: "verso (even)", number: "42", align: "left" as const, head: chapter },
          { side: "recto (odd)", number: "43", align: "right" as const, head: book },
        ]
      : [
          { side: "single-sided", number: "42", align: "right" as const, head: book },
        ];

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Head content</PanelTitle>
        <div className="space-y-3">
          <TextInput name="book" label="Book title (recto head)" value={book} onChange={setBook} />
          <TextInput name="chapter" label="Chapter (verso head)" value={chapter} onChange={setChapter} />
          <Sel
            name="mode"
            label="Page layout"
            value={mode}
            onChange={setMode}
            options={[
              { value: "alternating", label: "Two-sided (recto/verso)" },
              { value: "single", label: "Single-sided" },
            ]}
          />
          <Sel
            name="font"
            label="Head face"
            value={fontName}
            onChange={setFontName}
            options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
          />
          <SliderNum name="size" label="Head size" unit="px" value={pageSize} onChange={setPageSize} min={8} max={20} step={1} />
          <SliderNum name="margin" label="Outside margin" unit="mm" value={margin} onChange={setMargin} min={2} max={40} step={1} />
          <SliderNum name="weight" label="Head weight" value={weight} onChange={setWeight} min={300} max={700} step={100} />
        </div>
        <ResBox>
          <Res name="size" label="Head size in pt" value={`${fmtTrim(px * 0.75, 2)}pt`} />
          <Res name="margin" label="Margin in in" value={`${fmtTrim(m / 25.4, 3)}in`} />
          <Res name="pages" label="Pages rendered" value={String(pages.length)} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        {pages.map((p) => (
          <Panel key={p.side}>
            <PanelTitle>{p.side}</PanelTitle>
            <div className="rounded-lg border border-border bg-white p-4 text-black">
              <div
                className="flex items-baseline justify-between gap-4 border-b border-black/15 pb-2"
                style={{ fontFamily: font.stack, fontSize: `${px}px`, fontWeight: w }}
              >
                <span className={p.align === "right" ? "order-2" : ""}>{p.number}</span>
                <span className={`min-w-0 flex-1 truncate ${p.align === "right" ? "order-1 text-right" : "text-left"}`}>
                  {p.head}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-[12px] leading-relaxed text-black/70">
                <p>
                  Body text of the {p.side.split(" ")[0]} page. The running head sits above the text block, its baseline on
                  the top margin, and is separated from the text by the margin itself rather than by a rule.
                </p>
                <p>
                  Head size {fmtTrim(px, 0)}px ({fmtTrim(px * 0.75, 1)}pt) at weight {w} — typically 1–2px smaller than the
                  body size, and often small-caps or letterspaced rather than bold.
                </p>
              </div>
              <div
                className="mt-4 flex justify-between border-t border-black/15 pt-2 text-[10px] text-black/50"
                style={{ fontFamily: font.stack }}
              >
                <span>outer margin {fmtTrim(m, 0)}mm</span>
                <span>{p.number}</span>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </CalcLayout>
  );
}
