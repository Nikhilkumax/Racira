"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, Radios, RefTable, Res, ResBox, Row, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";
import { contrastRatio, parseHex, ratioVerdict } from "../color";

/**
 * Contrast Pairing Checker — pairs two type treatments and evaluates the two
 * kinds of contrast that decide whether they can be told apart: colour contrast
 * (measured by the WCAG formula) and typographic contrast (family class, weight
 * and size). Two faces at the same weight and size in similar greys may pass
 * WCAG and still read as a mistake.
 */
export default function ContrastPairingChecker() {
  const [aFont, setAFont] = useState("Inter");
  const [bFont, setBFont] = useState("Lora");
  const [aColor, setAColor] = useState("#111827");
  const [bColor, setBColor] = useState("#6b7280");
  const [bg, setBg] = useState("#ffffff");
  const [aWeight, setAWeight] = useState("700");
  const [bWeight, setBWeight] = useState("400");
  const [aSize, setASize] = useState("32");
  const [bSize, setBSize] = useState("32");
  const [text, setText] = useState("Contrast is two problems at once");
  const [large, setLarge] = useState("no");

  const fa = FONTS.find((f) => f.name === aFont) ?? FONTS[0];
  const fb = FONTS.find((f) => f.name === bFont) ?? FONTS[3];
  const ca = parseHex(aColor);
  const cb = parseHex(bColor);
  const cbg = parseHex(bg);
  const isLarge = large === "yes";
  const ratioA = ca && cbg ? contrastRatio(ca, cbg) : 0;
  const ratioB = cb && cbg ? contrastRatio(cb, cbg) : 0;
  const judges = [
    { name: "A · AA", pass: ratioVerdict(ratioA, isLarge)[0].pass },
    { name: "A · AAA", pass: ratioVerdict(ratioA, isLarge)[1].pass },
    { name: "B · AA", pass: ratioVerdict(ratioB, isLarge)[0].pass },
    { name: "B · AAA", pass: ratioVerdict(ratioB, isLarge)[1].pass },
  ];

  const styleAxes = [
    { axis: "Family class", a: fa.kind, b: fb.kind, differ: fa.kind !== fb.kind },
    { axis: "Weight", a: aWeight, b: bWeight, differ: aWeight !== bWeight },
    { axis: "Size", a: `${aSize}px`, b: `${bSize}px`, differ: aSize !== bSize },
    { axis: "Colour", a: aColor, b: bColor, differ: aColor.toLowerCase() !== bColor.toLowerCase() },
  ];
  const styleScore = styleAxes.filter((s) => s.differ).length;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Treatment A / B</PanelTitle>
        <div className="space-y-3">
          <TextInput name="text" label="Sample" value={text} onChange={setText} />
          <Sel name="aFont" label="A family" value={aFont} onChange={setAFont} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <Sel name="bFont" label="B family" value={bFont} onChange={setBFont} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "A colour", value: aColor, set: setAColor },
              { label: "B colour", value: bColor, set: setBColor },
              { label: "Background", value: bg, set: setBg },
            ].map((c) => (
              <label key={c.label} className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </span>
                <input
                  type="color"
                  value={c.value}
                  onChange={(e) => c.set(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background"
                />
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SliderNum name="aw" label="A weight" value={aWeight} onChange={setAWeight} min={300} max={800} step={100} />
            <SliderNum name="bw" label="B weight" value={bWeight} onChange={setBWeight} min={300} max={800} step={100} />
            <SliderNum name="as" label="A size" unit="px" value={aSize} onChange={setASize} min={10} max={96} step={1} />
            <SliderNum name="bs" label="B size" unit="px" value={bSize} onChange={setBSize} min={10} max={96} step={1} />
          </div>
          <Row label="Text size">
            <Radios
              name="large"
              value={large}
              onChange={setLarge}
              ariaLabel="text size class"
              options={[
                { value: "no", label: "Body (4.5:1)" },
                { value: "yes", label: "Large (3:1)" },
              ]}
            />
          </Row>
        </div>
        <ResBox>
          <Res name="ratioA" label="A contrast ratio" value={`${fmtTrim(ratioA, 2)}:1`} />
          <Res name="ratioB" label="B contrast ratio" value={`${fmtTrim(ratioB, 2)}:1`} />
          <Res name="style" label="Style axes that differ" value={`${styleScore} / 4`} />
          <Res
            name="verdict"
            label="Pairing verdict"
            value={styleScore >= 2 ? "distinguishable — hierarchy reads" : "too similar — differentiate weight, size or colour"}
          />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="rounded-lg border border-border p-5" style={{ background: bg }}>
            <p style={{ fontFamily: fa.stack, fontSize: `${aSize}px`, fontWeight: parseFloat(aWeight) || 400, color: aColor, lineHeight: 1.25 }}>
              {text || "Treatment A"}
            </p>
            <p style={{ fontFamily: fb.stack, fontSize: `${bSize}px`, fontWeight: parseFloat(bWeight) || 400, color: bColor, lineHeight: 1.4 }}>
              {text || "Treatment B"}
            </p>
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Measurements</PanelTitle>
          <RefTable
            cols={["Check", "A", "B", "Pass"]}
            rows={[
              ...judges.map((j) => [j.name, fmtTrim(j.name.startsWith("A") ? ratioA : ratioB, 2), "—", j.pass ? "pass" : "fail"]),
              ...styleAxes.map((s) => [s.axis, s.a, s.b, s.differ ? "differs" : "identical"]),
            ]}
            minWidth={480}
            note="WCAG contrast is measured from the hex values with the WCAG 2.x relative-luminance formula. Typographic contrast is not a ratio — it is the count of axes on which the two treatments actually differ."
          />
        </Panel>
      </div>
    </CalcLayout>
  );
}
