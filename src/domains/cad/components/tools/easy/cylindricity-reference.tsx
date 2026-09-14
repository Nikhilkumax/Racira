"use client";

import { Panel, PanelTitle } from "./ui";

/**
 * Cylindricity Reference — what the cylindricity control does, its tolerance
 * zone, how it is verified, and when it beats roundness + straightness.
 */
export default function CylindricityReference() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <PanelTitle>The control</PanelTitle>
        <ul className="space-y-2 text-sm leading-relaxed text-foreground">
          <li><strong>Cylindricity</strong> is a form control that limits the combined out-of-roundness and out-of-straightness of a cylindrical surface in one tolerance value.</li>
          <li>Symbol: the two-circle “cylindricity” pictogram, no datum reference.</li>
          <li>The tolerance zone is the space between two coaxial cylinders, a radial distance t apart, that contains the entire surface.</li>
          <li>Unlike circularity (per cross-section) or straightness (per line), it evaluates the surface as a whole — a part can be round in every slice yet bowed overall, and cylindricity would catch that.</li>
        </ul>
      </Panel>
      <Panel>
        <PanelTitle>Zone & verification</PanelTitle>
        <ul className="space-y-2 text-sm leading-relaxed text-foreground">
          <li>Zone: two coaxial cylinders, radial separation = t. Every point on the surface must fall between them.</li>
          <li>Measured with a CMM (many points around and along the surface) or a roundness machine with a straightness traverse; a two-point micrometer alone cannot verify cylindricity.</li>
          <li>It applies regardless of size: the zone follows the actual (not nominal) axis, so it does not control diameter size.</li>
        </ul>
      </Panel>
      <Panel>
        <PanelTitle>Practical guidance</PanelTitle>
        <ul className="space-y-2 text-sm leading-relaxed text-foreground">
          <li>Use it for sealing surfaces, bearing journals or bores where both roundness and straightness along the axis matter (e.g. O-ring glands, hydraulic cylinders).</li>
          <li>If only roundness matters slice-by-slice, circularity is cheaper to inspect.</li>
          <li>Where runout relative to a datum axis is the functional requirement, use circular/total runout instead — they also catch coaxiality errors that cylindricity ignores.</li>
          <li>Typical values on machined parts: 0.01–0.05 mm for precision fits; 0.05–0.1 mm for general sealing surfaces. Always derive from the function, not habit.</li>
        </ul>
      </Panel>
      <Panel>
        <PanelTitle>Common mistakes</PanelTitle>
        <ul className="space-y-2 text-sm leading-relaxed text-foreground">
          <li>Calling cylindricity with a datum — form controls take no datum reference.</li>
          <li>Expecting it to control size (max/min diameter) — size is separately toleranced.</li>
          <li>Setting t tighter than the achievable roundness of the process; cylindricity of turned parts is typically no better than ~1/3 the tolerance of the size that generated them.</li>
          <li>Writing a cylindricity callout larger than the circularity callout on the same feature — the whole-surface control should be the looser one.</li>
        </ul>
      </Panel>
    </div>
  );
}
