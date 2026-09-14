"use client";

import { Panel, RefTable } from "./ui";

/**
 * Shaft Design Reference — the formulas, preferred sizes and keyway notes a
 * designer reaches for when starting a shaft layout.
 */

const MIN_DIAMETER: [string, string, string][] = [
  ["Torsion only (solid round)", "d = ∛(16·T / (π·τ_allow))", "τ_allow = shear yield / n (typical 40–60 MPa for mild steel shafts)"],
  ["Bending + torsion (ASME elliptic)", "d = ∛((32/π)·√((Kb·M)² + ¾(Kt·T)²) / σ_allow)", "Use when moment M and torque T act together; Kb/Kt combine fatigue + shock"],
  ["Stiffness-limited (deflection)", "θ = T·L / (G·J), J = π·d⁴/32", "Often deflection/twist, not stress, sets the diameter"],
];

const SIZES: string[] = [
  "6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32, 36, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120, 125, 140, 160, 180, 200, 220, 250 mm",
];

export default function ShaftDesignReference() {
  return (
    <div className="space-y-5">
      <RefTable
        title="Sizing formulas"
        cols={["Condition", "Formula", "Notes"]}
        rows={MIN_DIAMETER.map((r) => r)}
      />
      <RefTable
        title="Preferred metric shaft sizes (mm)"
        cols={["Standard series (normalized)"]}
        rows={[SIZES]}
        note="Round the calculated diameter UP to a standard size, then re-check the step shoulders (fillets) for stress concentration and the bearing/bore availability at that diameter."
      />
      <Panel>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Keyway & step notes</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground">
          <li>Keyway depth reduces the effective section: for fatigue, analyze the shaft at the keyway root with Kt ≈ 1.6 (profile key) rather than the plain diameter.</li>
          <li>Step changes in diameter are stress raisers — keep fillet radii ≥ 0.1 × the smaller diameter where fatigue matters.</li>
          <li>Match diameters to bearing bores and seal bores from supplier catalogues before finalizing steps.</li>
          <li>Prefer one key over two on the same shaft section — two keys don’t double the capacity (load sharing is unreliable).</li>
        </ul>
      </Panel>
    </div>
  );
}
