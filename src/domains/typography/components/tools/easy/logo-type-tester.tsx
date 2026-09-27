"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const SMALL_SIZES = [12, 16, 20, 24];

/**
 * Logo Type Tester — a wordmark has to survive sizes the designer never
 * previews: 16px in a browser tab, 12px in a footer, and a favicon. The tool
 * sets the same wordmark at logo size and at a ladder of small sizes, and
 * reports the letterform features that break first when a face is scaled down
 * (hairlines, tight counters, fine serifs).
 */
export default function LogoTypeTester() {
  const [word, setWord] = useState("RACIRA");
  const [fontName, setFontName] = useState("Space Grotesk");
  const [tracking, setTracking] = useState("0.04");
  const [weight, setWeight] = useState("700");
  const [size, setSize] = useState("96");
  const [caseMode, setCaseMode] = useState("upper");
  const [mark, setMark] = useState("none");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const tr = Math.min(0.3, Math.max(-0.05, parseFloat(tracking) || 0));
  const w = parseFloat(weight) || 700;
  const px = Math.min(200, Math.max(24, parseFloat(size) || 96));
  const text = caseMode === "upper" ? word.toUpperCase() : caseMode === "lower" ? word.toLowerCase() : word;
  const hairlineRisk = font.kind === "serif" ? "high — serifs thin out first" : font.kind === "display" ? "low" : "moderate";
  const counterRisk = w < 500 ? "high — light strokes vanish below 20px" : "low — strokes hold";

  const css = `.wordmark {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  font-weight: ${w};
  letter-spacing: ${fmtTrim(tr, 4)}em;
  text-transform: ${caseMode === "upper" ? "uppercase" : caseMode === "lower" ? "lowercase" : "none"};
  line-height: 1;
  /* a wordmark should not wrap: */
  white-space: nowrap;
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Wordmark</PanelTitle>
        <div className="space-y-3">
          <TextInput name="word" label="Word or name" value={word} onChange={setWord} />
          <Sel name="font" label="Face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
          <SliderNum name="size" label="Logo size" unit="px" value={size} onChange={setSize} min={24} max={200} step={2} />
          <SliderNum name="tracking" label="Tracking" unit="em" value={tracking} onChange={setTracking} min={-0.05} max={0.3} step={0.005} />
          <SliderNum name="weight" label="Weight" value={weight} onChange={setWeight} min={300} max={800} step={100} />
          <Sel
            name="case"
            label="Case"
            value={caseMode}
            onChange={setCaseMode}
            options={[
              { value: "upper", label: "UPPERCASE" },
              { value: "lower", label: "lowercase" },
              { value: "title", label: "Title Case" },
            ]}
          />
          <Sel
            name="mark"
            label="Mark lockup"
            value={mark}
            onChange={setMark}
            options={[
              { value: "none", label: "Wordmark only" },
              { value: "left", label: "Mark left of word" },
              { value: "above", label: "Mark above word" },
            ]}
          />
        </div>
        <ResBox>
          <Res name="hairline" label="Hairline risk when scaled down" value={hairlineRisk} />
          <Res name="counter" label="Counter survival" value={counterRisk} />
          <Res name="width" label="Approx wordmark width" value={`${fmtTrim(text.length * px * (0.55 + tr), 0)}px`} />
          <Res name="favicon" label="Favicon check" value={text.length > 2 ? "use the mark, not the wordmark" : "wordmark may survive at 16px"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Logo lockup</PanelTitle>
          <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-border bg-white p-6">
            <div className={mark === "above" ? "flex flex-col items-center gap-3" : "flex items-center gap-3"}>
              {mark !== "none" && (
                <span
                  className="inline-block h-10 w-10 shrink-0 rounded-lg"
                  style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)" }}
                  aria-hidden
                />
              )}
              <span
                data-testid="wordmark"
                className="whitespace-nowrap"
                style={{
                  fontFamily: font.stack,
                  fontSize: `${px}px`,
                  fontWeight: w,
                  letterSpacing: `${tr}em`,
                  textTransform: caseMode === "upper" ? "uppercase" : caseMode === "lower" ? "lowercase" : "none",
                  lineHeight: 1,
                  color: "#111827",
                }}
              >
                {text || "Wordmark"}
              </span>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Small-size ladder</PanelTitle>
          <div className="space-y-3">
            {SMALL_SIZES.map((s) => (
              <div key={s} className="flex items-center gap-4 border-b border-border/40 pb-3 last:border-0">
                <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">{s}px</span>
                <span
                  className="whitespace-nowrap text-foreground"
                  style={{
                    fontFamily: font.stack,
                    fontSize: `${s}px`,
                    fontWeight: w,
                    letterSpacing: `${tr}em`,
                    textTransform: caseMode === "upper" ? "uppercase" : caseMode === "lower" ? "lowercase" : "none",
                    lineHeight: 1.2,
                  }}
                >
                  {text || "Wordmark"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Below about 20px a wordmark usually needs a dedicated cut: heavier weight, wider tracking, and often a
            simplified shape (the padded, spaced caps). Testing the same settings at both sizes shows the gap.
          </p>
        </Panel>

        <Panel>
          <PanelTitle>Scaling checks</PanelTitle>
          <RefTable
            cols={["Check", "What to look for"]}
            rows={[
              ["Stroke weight at 16px", "Any stroke that thins to a single pixel has to be thickened or dropped."],
              ["Counter openings", "Counters in e, a, o must keep a visible hole at the smallest size."],
              ["Tracking at small sizes", "Add ~0.02em per step down to keep capitals from touching."],
              ["Lockup alignment", "The cap-height of the type should align to the optical centre of the mark, not its box centre."],
              ["Monochrome test", "The mark and wordmark must survive pure black, pure white and one flat colour."],
            ]}
            minWidth={540}
          />
        </Panel>
        <CodeOut code={css} testid="logo-css" />
      </div>
    </CalcLayout>
  );
}
