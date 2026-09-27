"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Row, Sel, SliderNum, TextArea, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

type Pattern = "classic" | "number-only" | "centred" | "side";

/**
 * Chapter Header Designer — the opening page of a chapter is the one page in a
 * book with no running head and generous top space. The patterns here are the
 * four in common use: number above title, number alone, centred epigraph-style,
 * and the modern side-aligned number. The decisions that matter are where the
 * first line of text starts and how the header block relates to the text
 * column's top margin.
 */
export default function ChapterHeaderDesigner() {
  const [chapterNo, setChapterNo] = useState("3");
  const [title, setTitle] = useState("Rhythm");
  const [epigraph, setEpigraph] = useState("A page is a measure, not a container.");
  const [pattern, setPattern] = useState<Pattern>("classic");
  const [fontName, setFontName] = useState("Fraunces");
  const [titlePt, setTitlePt] = useState("32");
  const [numberPt, setNumberPt] = useState("14");
  const [drop, setDrop] = useState("70");
  const [text, setText] = useState(
    "The chapter opening establishes the rhythm the rest of the book inherits: the top margin, the position of the first baseline, and the relationship between the header block and the text.",
  );

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const tp = Math.max(14, parseFloat(titlePt) || 32);
  const np = Math.max(8, parseFloat(numberPt) || 14);
  const d = Math.min(180, Math.max(0, parseFloat(drop) || 70));

  const css = `.chapter-opening {
  font-family: ${font.stack};
  padding-top: ${fmtTrim(d, 1)}px;   /* ${fmtTrim(d / 16, 2)}rem — the "drop" */
}

.chapter-opening .number {
  font-size: ${np}pt;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  ${pattern === "side" ? "writing-mode: vertical-rl;\n  float: left;\n  margin-right: 1.5rem;" : ""}
}

.chapter-opening h1 {
  font-size: ${tp}pt;
  line-height: 1.1;
  font-weight: 600;
  ${pattern === "centred" ? "text-align: center;" : ""}
}

.chapter-opening .rule { width: 4rem; border-top: 2px solid currentColor; margin: 1.25rem 0; }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Chapter opening</PanelTitle>
        <div className="space-y-3">
          <Sel
            name="pattern"
            label="Pattern"
            value={pattern}
            onChange={(v) => setPattern(v as Pattern)}
            options={[
              { value: "classic", label: "Number above title, rule, text" },
              { value: "number-only", label: "Large number only" },
              { value: "centred", label: "Centred title with epigraph" },
              { value: "side", label: "Side-aligned vertical number" },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput name="no" label="Chapter number" value={chapterNo} onChange={setChapterNo} />
            <TextInput name="title" label="Chapter title" value={title} onChange={setTitle} />
          </div>
          <TextInput name="epigraph" label="Epigraph / subtitle" value={epigraph} onChange={setEpigraph} />
          <Sel name="font" label="Face" value={fontName} onChange={setFontName} options={FONTS.filter((f) => f.kind !== "mono").map((f) => ({ value: f.name, label: f.name }))} />
          <div className="grid grid-cols-3 gap-3">
            <SliderNum name="tp" label="Title" unit="pt" value={titlePt} onChange={setTitlePt} min={14} max={72} step={1} />
            <SliderNum name="np" label="Number" unit="pt" value={numberPt} onChange={setNumberPt} min={8} max={40} step={1} />
            <SliderNum name="drop" label="Top drop" unit="px" value={drop} onChange={setDrop} min={0} max={180} step={2} />
          </div>
          <TextArea name="text" label="First paragraph" value={text} onChange={setText} rows={4} />
        </div>
        <ResBox>
          <Res name="drop" label="Drop in lines" value={`≈ ${fmtTrim(d / (16 * 1.5), 1)} line boxes`} />
          <Res name="title" label="Title size in px" value={`${fmtTrim(tp * (96 / 72), 1)}px`} />
          <Res name="head" label="Running head on this page" value="suppressed (chapter opening)" />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="rounded-lg border border-border bg-white p-6 text-neutral-900" style={{ paddingTop: `${d}px`, fontFamily: font.stack }}>
            {pattern === "side" ? (
              <div className="flex gap-6">
                <span style={{ fontSize: `${np}pt`, writingMode: "vertical-rl", letterSpacing: "0.24em", textTransform: "uppercase" }}>
                  Chapter {chapterNo}
                </span>
                <div>
                  <h3 style={{ fontSize: `${tp}pt`, lineHeight: 1.1, fontWeight: 600 }}>{title}</h3>
                </div>
              </div>
            ) : (
              <>
                {pattern !== "number-only" && (
                  <span style={{ fontSize: `${np}pt`, letterSpacing: "0.24em", textTransform: "uppercase" }}>
                    Chapter {chapterNo}
                  </span>
                )}
                <h3
                  style={{
                    fontSize: pattern === "number-only" ? `${tp * 1.6}pt` : `${tp}pt`,
                    lineHeight: 1.1,
                    fontWeight: 600,
                    textAlign: pattern === "centred" ? "center" : "left",
                    marginTop: pattern === "number-only" ? 0 : "0.4em",
                  }}
                >
                  {pattern === "number-only" ? chapterNo : title}
                </h3>
                {pattern === "centred" && epigraph && (
                  <p className="mt-3 italic" style={{ textAlign: "center", fontSize: "11pt" }}>
                    {epigraph}
                  </p>
                )}
              </>
            )}
            {pattern !== "number-only" && <div style={{ width: "4rem", borderTop: "2px solid currentColor", margin: "1.25rem 0" }} />}
            <p data-testid="chapter-text" style={{ fontSize: "10.5pt", lineHeight: "15pt" }}>
              {text}
            </p>
          </div>
        </Panel>
        <CodeOut code={css} testid="chapter-css" />
      </div>
    </CalcLayout>
  );
}
