"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Row, Sel, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const SAMPLE =
  "Justification without hyphenation produces rivers of white; justification with hyphenation pulls the same text tight. Hyphenation is language-aware: a browser needs a dictionary for the declared language, and the hyphenation points come from that dictionary, not from the word's spelling.";

/**
 * Hyphenation Tester — exercises the CSS hyphenation controls that actually
 * change output: `hyphens`, `hyphenate-limit-chars`, `hyphenate-limit-lines`
 * and the container's measure. Soft hyphens (U+00AD) are shown as an
 * alternative for precise control over a headline, where automatic hyphenation
 * cannot be trusted with a brand term.
 */
export default function HyphenationTester() {
  const [fontName, setFontName] = useState("Lora");
  const [text, setText] = useState(SAMPLE);
  const [hyphens, setHyphens] = useState("auto");
  const [charLimit, setCharLimit] = useState("6 3 3");
  const [lineLimit, setLineLimit] = useState("2");
  const [measure, setMeasure] = useState("34");
  const [justify, setJustify] = useState("no");
  const [lang, setLang] = useState("en-US");
  const [soft, setSoft] = useState("");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const cm = Math.max(16, parseFloat(measure) || 34);
  const softRendered = soft.split("-").join("\u00AD");
  const [minBefore, minAfter] = charLimit.split(/\s+/);

  const css = `.hyphenated {
  font-family: ${font.stack};
  lang: "${lang}";
  hyphens: ${hyphens};
  -webkit-hyphens: ${hyphens};
  hyphenate-limit-chars: ${charLimit};\n  hyphenate-limit-lines: ${lineLimit};
  text-align: ${justify === "yes" ? "justify" : "left"};
  max-width: ${cm}ch;
  max-width: min(100%, ${cm}ch);
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Hyphenation settings</PanelTitle>
        <div className="space-y-3">
          <Sel
            name="font"
            label="Font family"
            value={fontName}
            onChange={setFontName}
            options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
          />
          <Sel
            name="lang"
            label="Language"
            value={lang}
            onChange={setLang}
            options={[
              { value: "en-US", label: "en-US" },
              { value: "en-GB", label: "en-GB" },
              { value: "de-DE", label: "de-DE (long compounds)" },
              { value: "fr-FR", label: "fr-FR" },
              { value: "es-ES", label: "es-ES" },
              { value: "pt-BR", label: "pt-BR" },
            ]}
          />
          <Sel
            name="hyphens"
            label="hyphens"
            value={hyphens}
            onChange={setHyphens}
            options={[
              { value: "auto", label: "auto — browser dictionary" },
              { value: "manual", label: "manual — only soft hyphens (U+00AD)" },
              { value: "none", label: "none — never hyphenate" },
            ]}
          />
          <Row label="hyphenate-limit-chars" controlWidth="sm:w-56">
            <Sel
              name="charLimit"
              label=""
              value={charLimit}
              onChange={setCharLimit}
              options={[
                { value: "5 2 2", label: "5 2 2 — aggressive" },
                { value: "6 3 3", label: "6 3 3 — balanced" },
                { value: "8 4 4", label: "8 4 4 — conservative" },
                { value: "10 5 5", label: "10 5 5 — minimal" },
              ]}
            />
          </Row>
          <SliderNum name="lineLimit" label="Consecutive hyphenated lines" value={lineLimit} onChange={setLineLimit} min={1} max={5} step={1} />
          <SliderNum name="measure" label="Measure" unit="ch" value={measure} onChange={setMeasure} min={16} max={90} step={1} />
          <Row label="Justify">
            <Sel
              name="justify"
              label=""
              value={justify}
              onChange={setJustify}
              options={[
                { value: "no", label: "no — ragged right" },
                { value: "yes", label: "yes — text-align: justify" },
              ]}
            />
          </Row>
          <TextArea name="text" label="Paragraph" value={text} onChange={setText} rows={3} />
        </div>
        <ResBox>
          <Res name="limit" label="Limit chars" value={`${minBefore} before / ${minAfter} after`} />
          <Res name="lang" label="Dictionary needed" value={`${lang} hyphenation dictionary`} />
          <Res name="measure" label="Measure" value={`${fmtTrim(cm, 0)}ch — ${cm < 30 ? "hyphenation essential" : "hyphenation optional"}`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Rendered paragraph</PanelTitle>
          <p
            data-testid="hyphen-preview"
            className="text-foreground"
            style={{
              fontFamily: font.stack,
              fontSize: "16px",
              lineHeight: 1.65,
              hyphens: hyphens as "auto",
              WebkitHyphens: hyphens as "auto",
              textAlign: justify === "yes" ? "justify" : "left",
              maxWidth: `${cm}ch`,
              wordBreak: "break-word",
            }}
          >
            {text || SAMPLE}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            With <code className="font-mono">hyphens: manual</code>, nothing here hyphenates until a soft hyphen is added —
            browsers do not infer word breaks without a dictionary.
          </p>
        </Panel>

        <Panel>
          <PanelTitle>Manual soft hyphen (U+00AD)</PanelTitle>
          <TextArea
            name="soft"
            label="Word with hyphens marking allowed break points"
            value={soft}
            onChange={setSoft}
            rows={2}
            placeholder="trans-contin-ental"
          />
          <p className="mt-3 text-sm text-foreground" style={{ fontFamily: font.stack, maxWidth: `${cm}ch`, hyphens: "manual" }}>
            {softRendered || "Type a word with hyphens above to convert them to soft hyphens."}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Soft hyphens are invisible and uncopyable-as-text in most editors; they are the right tool for a headline or a
            brand term where automatic rules would break the word badly.
          </p>
        </Panel>
        <CodeOut code={css} testid="hyphen-css" />
      </div>
    </CalcLayout>
  );
}
