"use client";

import { Panel, RefTable } from "./ui";

/**
 * Stress Concentration Factor Reference — representative Kt values for common
 * features, and the guidance that goes with them. Kt multiplies the nominal
 * stress: σ_max = Kt · σ_nom. Exact values come from charts (Peterson /
 * Pilkey), not from this summary.
 */

const ROWS: [string, string, string, string][] = [
  ["Hole in plate under tension", "d/W = 0.2", "≈ 2.5", "Kt falls toward 3 as the hole gets small relative to width; rises with d/W → ~2.2 at 0.5"],
  ["Hole in plate under tension", "d/W = 0.5", "≈ 2.2", "—"],
  ["Circular groove (shaft, bending)", "r/d = 0.1", "≈ 2.0–2.4", "Kt climbs fast as r/d shrinks below 0.05 — radius is the cheapest fix"],
  ["Shoulder fillet (shaft, bending)", "r/d = 0.1", "≈ 1.7–1.9", "Bigger fillet radius + smaller diameter step reduces Kt"],
  ["Shoulder fillet (shaft, torsion)", "r/d = 0.1", "≈ 1.4–1.5", "Torsion Kt is lower than bending for the same geometry"],
  ["Thread root (steel bolt)", "—", "≈ 2.1–3.0", "Fatigue cracks start at the thread root; rolled threads are stronger than cut"],
  ["Keyway (shaft, torsion)", "—", "≈ 1.6 (profile) / 2.0 (sled-runner)", "Keyway also adds a local stress raiser at the corner"],
  ["Sharp internal corner", "r → 0", "→∞ (theoretically)", "Never design a zero-radius corner on a load path"],
];

export default function StressConcentrationFactorReference() {
  return (
    <div className="space-y-5">
      <Panel>
        <div className="space-y-2 text-sm leading-relaxed text-foreground">
          <p>
            <strong>Kt</strong> is the elastic stress concentration factor: σ_max = Kt × σ_nom. It depends only on
            geometry (not material); for fatigue, notch sensitivity q reduces its effect: Kf = 1 + q(Kt − 1), and
            cast iron / ductile metals with high q behave differently from brittle ones.
          </p>
          <p className="text-xs text-muted-foreground">
            Values below are representative magnitudes for quick estimates — for real design use the charts in
            Peterson’s Stress Concentration Factors or Pilkey’s handbook with your exact d/D and r/d ratios.
          </p>
        </div>
      </Panel>
      <RefTable
        title="Representative Kt values"
        search
        cols={["Feature", "Geometry parameter", "Typical Kt", "Notes"]}
        rows={ROWS.map((r) => r)}
      />
    </div>
  );
}
