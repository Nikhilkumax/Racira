"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, Res, ResBox, Sel, SliderNum } from "../ui";
import { FONTS, PANGRAMS, WEIGHTS } from "../fonts";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

/**
 * Pangram Font Tester — every pangram contains all 26 letters, so one sample
 * exercises the whole lowercase alphabet. The coverage panel counts which
 * letters actually appear, making a truncated or mistyped sample obvious.
 */
export default function PangramFontTester() {
  const [fontName, setFontName] = useState("Inter");
  const [pangram, setPangram] = useState(PANGRAMS[0].text);
  const [size, setSize] = useState("28");
  const [weight, setWeight] = useState("400");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(120, Math.max(10, parseFloat(size) || 28));
  const w = parseFloat(weight) || 400;
  const lower = pangram.toLowerCase();
  const present = ALPHABET.filter((c) => lower.includes(c));
  const missing = ALPHABET.filter((c) => !lower.includes(c));

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Sample</PanelTitle>
        <Sel
          name="pangram"
          label="Pangram"
          value={pangram}
          onChange={setPangram}
          options={PANGRAMS.map((p) => ({ value: p.text, label: p.label }))}
        />
        <div className="mt-3 space-y-3">
          <Sel
            name="font"
            label="Font family"
            value={fontName}
            onChange={setFontName}
            options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
          />
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={10} max={96} step={1} />
          <Sel
            name="weight"
            label="Weight"
            value={weight}
            onChange={setWeight}
            options={WEIGHTS.map((n) => ({ value: String(n), label: String(n) }))}
          />
        </div>
        <ResBox>
          <Res name="letters" label="Alphabet coverage" value={`${present.length} / 26`} />
          <Res name="missing" label="Missing letters" value={missing.length ? missing.join(" ") : "none"} />
          <Res name="count" label="Characters in sample" value={String(pangram.length)} />
        </ResBox>
      </Panel>

      <Panel>
        <PanelTitle>Rendered sample</PanelTitle>
        <p
          data-testid="pangram-preview"
          style={{ fontFamily: font.stack, fontSize: `${px}px`, fontWeight: w, lineHeight: 1.4 }}
          className="break-words text-foreground"
        >
          {pangram}
        </p>
        <p className="mt-4 break-words text-sm text-muted-foreground" style={{ fontFamily: font.stack, fontWeight: w }}>
          {"0123456789 .,;:!?—–“”‘’()[]{}@#$%&*/\\+='\""}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Coverage uses the lowercase alphabet only — digits, punctuation and capitals are not counted, which is what makes
          the classic pangram a fair test of a text face.
        </p>
      </Panel>
    </CalcLayout>
  );
}
