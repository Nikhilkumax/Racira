"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const QUOTE =
  "Typography is the craft of endowing human language with a durable visual form, and thus with an independent existence.";

/**
 * Pull Quote Designer — a pull quote is a quotation lifted out of the flow at a
 * larger size, and its design decisions are the ones that keep it from reading
 * as body text: the quotation mark hangs outside the measure, the size jump
 * gives it authority, the attribution drops to small caps or a lighter weight,
 * and the rule (if any) is a weight contrast rather than a decoration.
 */
export default function PullQuoteDesigner() {
  const [fontName, setFontName] = useState("Fraunces");
  const [quote, setQuote] = useState(QUOTE);
  const [author, setAuthor] = useState("Robert Bringhurst");
  const [source, setSource] = useState("The Elements of Typographic Style");
  const [size, setSize] = useState("28");
  const [bodySize, setBodySize] = useState("16");
  const [markStyle, setMarkStyle] = useState("hang");
  const [rule, setRule] = useState("left");
  const [italic, setItalic] = useState("no");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(64, Math.max(18, parseFloat(size) || 28));
  const bp = Math.max(12, parseFloat(bodySize) || 16);
  const ratio = px / bp;

  const css = `blockquote.pull-quote {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  line-height: 1.25;
  font-style: ${italic === "yes" ? "italic" : "normal"};
  ${rule === "left" ? "border-left: 3px solid var(--foreground);\n  padding-left: 1.25rem;" : rule === "top" ? "border-top: 2px solid var(--foreground);\n  padding-top: 1rem;" : "margin-inline: 0;"}
  text-indent: ${markStyle === "hang" ? "-0.45em" : "0"};
  quotes: "“" "”";
}

blockquote.pull-quote::before {
  content: open-quote;
  ${markStyle === "inline" ? "display: inline;" : ""}
}

blockquote.pull-quote footer,
blockquote.pull-quote cite {
  display: block;
  margin-top: 0.75rem;
  font-size: ${(bp * 0.8 / 16).toFixed(4)}rem;
  font-style: normal;
  font-variant: small-caps;
  letter-spacing: 0.04em;
  color: var(--muted-foreground);
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Quote</PanelTitle>
        <div className="space-y-3">
          <TextArea name="quote" label="Quotation" value={quote} onChange={setQuote} rows={4} />
          <Sel name="font" label="Quote face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
          <div className="grid grid-cols-2 gap-3">
            <SliderNum name="qs" label="Quote size" unit="px" value={size} onChange={setSize} min={18} max={64} step={1} />
            <SliderNum name="bs" label="Body size" unit="px" value={bodySize} onChange={setBodySize} min={12} max={24} step={1} />
          </div>
          <Sel
            name="mark"
            label="Quotation mark"
            value={markStyle}
            onChange={setMarkStyle}
            options={[
              { value: "hang", label: "Hanging outside the measure" },
              { value: "inline", label: "Inline in the flow" },
              { value: "none", label: "Omitted (attribution implies it)" },
            ]}
          />
          <Sel
            name="rule"
            label="Rule"
            value={rule}
            onChange={setRule}
            options={[
              { value: "left", label: "Left rule (3px)" },
              { value: "top", label: "Top rule (2px)" },
              { value: "none", label: "No rule — spacing only" },
            ]}
          />
          <Sel
            name="italic"
            label="Italic"
            value={italic}
            onChange={setItalic}
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes — uses italic cut if available" },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextArea name="author" label="Attribution" value={author} onChange={setAuthor} rows={1} />
            <TextArea name="source" label="Source" value={source} onChange={setSource} rows={1} />
          </div>
        </div>
        <ResBox>
          <Res name="ratio" label="Quote ÷ body" value={`${fmtTrim(ratio, 2)}×`} />
          <Res
            name="hierarchy"
            label="Hierarchy check"
            value={ratio < 1.4 ? "too close to body — raise it" : ratio > 3 ? "very large; may dominate" : "clearly larger than body"}
          />
          <Res name="attribution" label="Attribution size" value={`${fmtTrim(bp * 0.8, 1)}px small-caps`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <blockquote
            data-testid="pullquote-preview"
            className="text-foreground"
            style={{
              fontFamily: font.stack,
              fontSize: `${px}px`,
              lineHeight: 1.25,
              fontStyle: italic === "yes" ? "italic" : "normal",
              borderLeft: rule === "left" ? "3px solid currentColor" : undefined,
              borderTop: rule === "top" ? "2px solid currentColor" : undefined,
              paddingLeft: rule === "left" ? "1.25rem" : undefined,
              paddingTop: rule === "top" ? "1rem" : undefined,
              textIndent: markStyle === "hang" ? "-0.45em" : undefined,
            }}
          >
            {markStyle === "none" ? "" : "“"}
            {quote || QUOTE}
            {markStyle === "none" ? "" : "”"}
            <footer
              className="mt-3 block font-normal text-muted-foreground"
              style={{ fontSize: `${bp * 0.8}px`, fontVariant: "small-caps", letterSpacing: "0.04em" }}
            >
              {author}
              {source ? ` — ${source}` : ""}
            </footer>
          </blockquote>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground" style={{ fontSize: `${bp}px` }}>
            Body copy resumes at {fmtTrim(bp, 0)}px so the size jump is visible in context — the quote should read as a
            different voice, not a louder paragraph.
          </p>
        </Panel>
        <CodeOut code={css} testid="pullquote-css" />
      </div>
    </CalcLayout>
  );
}
