"use client";

import { Panel, PanelTitle } from "./ui";

/**
 * Parallelism & Perpendicularity Guide — orientation tolerances: what the
 * controls do, zones, datum requirements, and the difference between surface
 * and axis applications.
 */
export default function ParallelismAndPerpendicularityGuide() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <PanelTitle>Parallelism</PanelTitle>
        <ul className="space-y-2 text-sm leading-relaxed text-foreground">
          <li>An <strong>orientation</strong> control (ASME Y14.5 / ISO 1101) that limits how far a surface or axis can tilt away from parallel to a datum.</li>
          <li>Surface application: zone is two planes (or lines) parallel to the datum, distance t apart, containing the whole surface.</li>
          <li>Axis application (feature control frame under a size dimension): zone is a cylinder Øt parallel to the datum axis.</li>
          <li>A datum is always required — without it you only have flatness/straightness.</li>
        </ul>
      </Panel>
      <Panel>
        <PanelTitle>Perpendicularity</PanelTitle>
        <ul className="space-y-2 text-sm leading-relaxed text-foreground">
          <li>Orientation control limiting tilt away from 90° to the datum.</li>
          <li>Surface application: two planes at 90° to the datum, distance t apart.</li>
          <li>Axis application: Øt cylinder at 90° to the datum plane/axis; commonly written under the hole or pin size callout.</li>
          <li>Often stacked with position: perpendicularity controls orientation only, position controls location.</li>
        </ul>
      </Panel>
      <Panel>
        <PanelTitle>Reading the frame</PanelTitle>
        <ul className="space-y-2 text-sm leading-relaxed text-foreground">
          <li>Frame shape: [∥ or ⊥ symbol] [t] [datum]. Example: <code className="rounded bg-muted px-1 font-mono text-xs">∥ 0.05 A</code> = parallel to datum A within 0.05 mm.</li>
          <li>A material-condition modifier on the tolerance (e.g. Ø0.1 M) lets a feature that departs from MMC get extra orientation freedom — rarely used for parallelism, common for perpendicularity of pressed holes.</li>
          <li>For a hole, perpendicularity error creates apparent position error at depth: at a 10 mm deep hole, 0.1° of tilt moves the far end ≈ 10·tan(0.1°) ≈ 0.017 mm.</li>
        </ul>
      </Panel>
      <Panel>
        <PanelTitle>Choosing values</PanelTitle>
        <ul className="space-y-2 text-sm leading-relaxed text-foreground">
          <li>Parallelism of a face to a milled datum: 0.02–0.05 mm typical; ground faces 0.005–0.01 mm.</li>
          <li>Perpendicularity of a bore to its mounting face (bearing fits): 0.01–0.02 mm per 25 mm of bore depth.</li>
          <li>Rule of thumb: an orientation tolerance should be smaller than the size tolerance but larger than what the process noise would produce for free.</li>
          <li>If a feature must also be located (e.g. bolt pattern), consider one position callout with a composite frame instead of separate position + perpendicularity.</li>
        </ul>
      </Panel>
    </div>
  );
}
