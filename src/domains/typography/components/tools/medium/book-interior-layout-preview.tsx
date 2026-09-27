"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const BODY =
  "A book page is a rectangle divided deliberately. The text block is smaller than the page so the margins can do their work: the inner margin protects the text from the gutter, the outer margin holds the reader's thumbs, and the top and bottom margins carry the running head and the folio. Every one of those decisions is measured in millimetres in production.";

/**
 * Book Interior Layout Preview — lays out a page with the five regions a book
 * page actually has (head margin, text block, running head, folio, foot margin)
 * and reports the proportions between them. The measurements are the ones a
 * print production sheet asks for: text block size, margin ratios and the
 * resulting characters per line.
 */
export default function BookInteriorLayoutPreview() {
  const [text, setText] = useState(BODY);
  const [fontName, setFontName] = useState("Source Serif 4");
  const [pageW, setPageW] = useState("148");
  const [pageH, setPageH] = useState("210");
  const [bodyPt, setBodyPt] = useState("10.5");
  const [leading, setLeading] = useState("14");
  const [inner, setInner] = useState("18");
  const [outer, setOuter] = useState("16");
  const [top, setTop] = useState("20");
  const [bottom, setBottom] = useState("24");
  const [folio, setFolio] = useState("24");
  const [headText, setHeadText] = useState("The Shape of Type");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[3];
  const pw = Math.max(100, parseFloat(pageW) || 148);
  const ph = Math.max(140, parseFloat(pageH) || 210);
  const bp = Math.max(6, parseFloat(bodyPt) || 10.5);
  const lead = Math.max(8, parseFloat(leading) || 14);
  const mi = Math.max(6, parseFloat(inner) || 18);
  const mo = Math.max(6, parseFloat(outer) || 16);
  const mt = Math.max(4, parseFloat(top) || 20);
  const mb = Math.max(4, parseFloat(bottom) || 24);

  const folioMm = Math.max(4, parseFloat(folio) || 24);
  const blockW = pw - mi - mo;
  const blockH = ph - mt - mb;
  const lines = Math.floor((blockH - 6) / (lead * 0.3528));
  const chars = Math.round(((blockW / 25.4) * 72) / (bp * 0.5));
  const textAreaShare = ((blockW * blockH) / (pw * ph)) * 100;

  const css = `@page {
  size: ${pw}mm ${ph}mm;
  margin: ${mt}mm ${mo}mm ${mb}mm ${mi}mm;
}

.book-page {
  font-family: ${font.stack};
  font-size: ${bp}pt;
  line-height: ${lead}pt;
  text-align: justify;
  hyphens: auto;
  widows: 2;
  orphans: 2;
}

.book-page .folio { font-size: ${fmtTrim(bp * 0.85, 2)}pt; letter-spacing: 0.04em; }`;

  const rows = [
    ["Page", `${fmtTrim(pw, 0)} × ${fmtTrim(ph, 0)}mm`],
    ["Text block", `${fmtTrim(blockW, 0)} × ${fmtTrim(blockH, 0)}mm (${fmtTrim(textAreaShare, 0)}% of the page)`],
    ["Inner / outer margins", `${fmtTrim(mi, 0)} / ${fmtTrim(mo, 0)}mm — inner ≥ outer by ${fmtTrim(mi - mo, 0)}mm`],
    ["Head / foot margins", `${fmtTrim(mt, 0)} / ${fmtTrim(mb, 0)}mm — foot ≥ head for the folio`],
    ["Lines per page", String(lines)],
    ["Characters per line", `${chars} (${chars < 45 ? "narrow — hyphenation essential" : chars > 75 ? "wide — increase leading" : "in the 45–75 band"})`],
  ];

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Page geometry</PanelTitle>
        <Sel name="font" label="Text face" value={fontName} onChange={setFontName} options={FONTS.filter((f) => f.kind !== "mono").map((f) => ({ value: f.name, label: f.name }))} />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SliderNum name="pw" label="Page width" unit="mm" value={pageW} onChange={setPageW} min={100} max={230} step={1} />
          <SliderNum name="ph" label="Page height" unit="mm" value={pageH} onChange={setPageH} min={140} max={330} step={1} />
          <SliderNum name="bp" label="Body size" unit="pt" value={bodyPt} onChange={setBodyPt} min={6} max={14} step={0.25} />
          <SliderNum name="lead" label="Leading" unit="pt" value={leading} onChange={setLeading} min={8} max={22} step={0.25} />
          <SliderNum name="mi" label="Inner margin" unit="mm" value={inner} onChange={setInner} min={6} max={50} step={1} />
          <SliderNum name="mo" label="Outer margin" unit="mm" value={outer} onChange={setOuter} min={6} max={50} step={1} />
          <SliderNum name="mt" label="Head margin" unit="mm" value={top} onChange={setTop} min={4} max={50} step={1} />
          <SliderNum name="mb" label="Foot margin" unit="mm" value={bottom} onChange={setBottom} min={4} max={60} step={1} />
          <SliderNum name="folio" label="Folio position" unit="mm from trim" value={folio} onChange={setFolio} min={4} max={60} step={1} />
        </div>
        <div className="mt-3">
          <TextArea name="text" label="Body copy" value={text} onChange={setText} rows={3} />
        </div>
        <ResBox>
          <Res name="block" label="Text block" value={`${fmtTrim(blockW, 0)} × ${fmtTrim(blockH, 0)}mm`} />
          <Res name="lines" label="Lines per page" value={String(lines)} />
          <Res name="chars" label="Characters per line" value={String(chars)} />
          <Res name="share" label="Ink-on-page share" value={`${fmtTrim(textAreaShare, 0)}%`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Page preview</PanelTitle>
          <div className="flex justify-center rounded-lg border border-border bg-muted/30 p-4">
            <div
              className="relative bg-white shadow-sm"
              style={{
                width: `${Math.min(320, pw * 1.6)}px`,
                height: `${Math.min(440, ph * 1.6)}px`,
                paddingTop: `${(mt / ph) * 100}%`,
                paddingBottom: `${(mb / ph) * 100}%`,
                paddingLeft: `${(mi / pw) * 100}%`,
                paddingRight: `${(mo / pw) * 100}%`,
                boxSizing: "border-box",
              }}
            >
              <div className="absolute left-0 right-0 text-center text-neutral-500" style={{ top: `-${(folioMm / ph) * 100}%` }}>
                <span style={{ fontSize: "10px", letterSpacing: "0.04em" }}>{headText}</span>
              </div>
              <p
                data-testid="book-page"
                className="overflow-hidden text-neutral-900"
                style={{ fontFamily: font.stack, fontSize: `${Math.max(7, bp * 1.05)}px`, lineHeight: 1.55, textAlign: "justify", hyphens: "auto" }}
              >
                {text || BODY}
              </p>
              <div className="absolute bottom-1 left-0 right-0 text-center text-neutral-500" style={{ fontSize: "10px" }}>
                {folio}
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Production measurements</PanelTitle>
          <RefTable cols={["Measure", "Value"]} rows={rows} minWidth={520} />
        </Panel>

        <CodeOut code={css} title="Print CSS" testid="book-css" />
      </div>
    </CalcLayout>
  );
}
