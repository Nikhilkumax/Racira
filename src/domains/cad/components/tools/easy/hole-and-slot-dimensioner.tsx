"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "./ui";

/**
 * Hole & Slot Dimensioner — produce the standard dimension callout and key
 * geometry for a hole pattern or a slot feature.
 *   Hole:   n× Ød × depth DEEP  /  n× Ød THRU
 *   Slot:   n× w × L SLOT  — end radius w/2, straight length L − w
 */
export default function HoleAndSlotDimensioner() {
  const [kind, setKind] = useState<"hole" | "slot">("hole");
  const [count, setCount] = useState("1");
  const [dia, setDia] = useState("10");
  const [depth, setDepth] = useState("20");
  const [blind, setBlind] = useState(true);
  const [slotW, setSlotW] = useState("10");
  const [slotL, setSlotL] = useState("30");

  const n = parseInt(count, 10);
  const countOk = Number.isFinite(n) && n > 0;

  let callout = "—";
  let rows: { label: string; value: string; name?: string }[] = [];

  if (kind === "hole") {
    const d = parseFloat(dia);
    if (countOk && Number.isFinite(d) && d > 0) {
      const deep = blind ? parseFloat(depth) : NaN;
      if (blind && Number.isFinite(deep) && deep > 0) {
        callout = `${n}× Ø${fmt(d, 1)} × ${fmt(deep, 1)} DEEP`;
      } else if (!blind) {
        callout = `${n}× Ø${fmt(d, 1)} THRU`;
      }
      rows = [
        { label: "Diameter", value: `Ø${fmt(d, 1)}`, name: "dia" },
        { label: "Section area (each)", value: `${fmt((Math.PI * d * d) / 4)} mm²`, name: "area" },
        { label: "Quantity", value: `${n} off`, name: "count" },
      ];
      if (blind && Number.isFinite(deep) && deep > 0) {
        rows.push({ label: "Drill depth", value: `${fmt(deep, 1)} mm`, name: "depth" });
      }
    }
  } else {
    const wv = parseFloat(slotW);
    const lv = parseFloat(slotL);
    if (countOk && Number.isFinite(wv) && Number.isFinite(lv) && wv > 0 && lv >= wv) {
      callout = `${n}× ${fmt(wv, 1)} × ${fmt(lv, 1)} SLOT`;
      const straight = lv - wv;
      rows = [
        { label: "End radius", value: `R${fmt(wv / 2, 1)}`, name: "radius" },
        { label: "Straight (parallel) length", value: `${fmt(straight, 1)} mm`, name: "straight" },
        { label: "Overall area (each)", value: `${fmt(wv * straight + (Math.PI * wv * wv) / 4, 2)} mm²`, name: "area" },
      ];
    }
  }

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Feature</PanelTitle>
        <FormGrid>
          <Sel
            name="kind"
            label="Type"
            value={kind}
            onChange={(v) => setKind(v as "hole" | "slot")}
            options={[
              { value: "hole", label: "Hole" },
              { value: "slot", label: "Slot" },
            ]}
          />
          <Num name="count" label="Quantity" value={count} onChange={setCount} />
        </FormGrid>
        {kind === "hole" ? (
          <div className="mt-3 space-y-3">
            <Num name="dia" label="Nominal diameter" unit="mm" value={dia} onChange={setDia} />
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input
                type="checkbox"
                checked={blind}
                onChange={(e) => setBlind(e.target.checked)}
                className="h-3.5 w-3.5 accent-primary"
                data-testid="in-blind"
              />
              Blind hole (has a depth)
            </label>
            {blind && <Num name="depth" label="Depth" unit="mm" value={depth} onChange={setDepth} />}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <Num name="slotw" label="Slot width" unit="mm" value={slotW} onChange={setSlotW} />
            <Num name="slotl" label="Overall length" unit="mm" value={slotL} onChange={setSlotL} />
          </div>
        )}
      </Panel>
      <Panel>
        <PanelTitle>Dimension callout</PanelTitle>
        <p
          data-testid="res-callout"
          className="rounded-lg border border-border bg-background px-4 py-3 font-mono text-base font-semibold text-primary"
        >
          {callout}
        </p>
        <div className="mt-4">
          <ResBox>
            {rows.map((r) => (
              <Res key={r.label} label={r.label} value={r.value} name={r.name} />
            ))}
          </ResBox>
        </div>
      </Panel>
    </CalcLayout>
  );
}
