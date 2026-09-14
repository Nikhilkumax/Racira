/**
 * GD&T teaching diagrams — original inline-SVG illustrations for the
 * /cad/gdt/[symbol] guide pages. Same convention as the symbol pictograms in
 * gdnt-shared.tsx: pure JSX + data, no assets, no "use client", so they
 * compile into whichever context imports them.
 *
 * Each diagram is a REUSABLE, data-driven component: the drawn geometry is
 * schematic, but numeric annotations (tolerance value, offsets, feature
 * sizes) come from props, and the drawn proportions scale with those numbers
 * (e.g. the bonus diagram's zone radius grows 1:1 with the tolerance). Future
 * symbol pages attach a diagram to any guide section via the `diagram` field
 * on GdntGuideSection and pass their own values — no per-symbol artwork.
 *
 * Figures are deliberately not-to-scale teaching aids (the tolerance zone is
 * exaggerated relative to the feature), which is standard GD&T pedagogy —
 * every caption says so explicitly.
 */

/** One compartment of a feature control frame, e.g. { content: "⌖", label: "Geometric characteristic" }. */
export type GdntFcfCompartment = {
  content: string;
  label: string;
};

/**
 * Discriminated union of the diagram kinds the template knows how to render.
 * Extend with new kinds (and a renderer below) as future symbols need them.
 */
export type GdntDiagram =
  | {
      kind: "position-zone";
      /** Zone diameter, e.g. "Ø0.5". */
      tolerance: string;
      /** Example actual-axis offset from true position, e.g. "0.15". */
      offset: string;
      /** Basic-dimension values from the datum edges, e.g. "180" / "120". */
      basicX?: string;
      basicY?: string;
    }
  | {
      kind: "fcf";
      /** Frame compartments, left to right, e.g. ⌖ Ø0.5 Ⓜ A B C. */
      compartments: GdntFcfCompartment[];
      /**
       * Optional figure caption. Defaults to a generic frame description;
       * pass it when the frame's structure deserves a symbol-specific note
       * (e.g. "no datum references — a Form control").
       */
      note?: string;
    }
  | {
      kind: "bonus";
      /** Base tolerance (zone at the referenced material condition), e.g. "Ø0.5". */
      tolerance: string;
      /** Feature size at the referenced material condition, e.g. "Ø6.0". */
      mmcSize: string;
      /** Example produced size, e.g. "Ø6.4". */
      actualSize: string;
      /** Resulting zone at the produced size, e.g. "Ø0.9". */
      zoneSize: string;
      /** Internal (hole) or external (pin) feature. Defaults to hole. */
      feature?: "hole" | "pin";
      /**
       * Which material condition the base size refers to. "mmc" (default)
       * shows the zone growing as the feature departs from MMC; "lmc" shows
       * the same mechanism departing from LMC — the hole shrinks / the pin
       * grows, and the drawn radius follows the real direction.
       */
      mode?: "mmc" | "lmc";
    }
  | {
      kind: "straightness-line";
      /** Zone width (two parallel lines), e.g. "0.1". */
      tolerance: string;
    }
  | {
      kind: "straightness-axis";
      /** Zone diameter (cylinder around the derived median line), e.g. "Ø0.05". */
      tolerance: string;
    }
  | {
      kind: "flatness";
      /** Zone width (two parallel planes), e.g. "0.2". */
      tolerance: string;
    }
  | {
      kind: "circularity";
      /** Radial zone width (two concentric circles), e.g. "0.1". */
      tolerance: string;
    }
  | {
      kind: "cylindricity";
      /** Radial zone width (two coaxial cylinders), e.g. "0.1". */
      tolerance: string;
    }
  | {
      kind: "profile-line";
      /** Zone width (two offset curves), e.g. "0.2". */
      tolerance: string;
      /**
       * "equal" (default): the zone is bisected by the true profile.
       * "unequal": the zone is shifted with the Ⓤ modifier — `outside` of
       * the total tolerance lies outside the material, the rest inside.
       */
      mode?: "equal" | "unequal";
      /** Unequal mode: amount of the total tolerance outside the material, e.g. "0.05". */
      outside?: string;
    }
  | {
      kind: "profile-surface";
      /** Zone width (two offset surfaces), e.g. "0.5". */
      tolerance: string;
      /** See profile-line: "equal" (default) or "unequal" with `outside`. */
      mode?: "equal" | "unequal";
      /** Unequal mode: amount of the total tolerance outside the material, e.g. "0.4". */
      outside?: string;
    }
  | {
      kind: "fcf-pair";
      /** The frame without datum references, e.g. profile used as form only. */
      without: GdntFcfCompartment[];
      /** The same frame with datum references, e.g. profile controlling orientation/location too. */
      with: GdntFcfCompartment[];
      /** Optional symbol-specific caption note (see `fcf`). */
      note?: string;
    }
  | {
      kind: "orientation-zone";
      /**
       * Angle of the tolerance zone relative to the datum surface, in
       * degrees: 90 = perpendicularity, 0 = parallelism, anything else =
       * angularity (drawn with its basic-angle dimension).
       */
      angle: 0 | 90 | number;
      /** Zone width (two parallel planes), e.g. "0.05". */
      tolerance: string;
      /** Label for the datum surface, defaults to "A". */
      datum?: string;
    }
  | {
      kind: "median-points";
      /**
       * Which derived-median control to draw: concentricity (median points
       * inside a cylinder around the datum axis) or symmetry (median points
       * between two planes about the datum center plane).
       */
      variant: "concentricity" | "symmetry";
      /** Zone size, e.g. "Ø0.1" (concentricity) or "0.1" (symmetry). */
      tolerance: string;
      /** Label for the datum, defaults to "A". */
      datum?: string;
    }
  | {
      kind: "runout";
      /**
       * Circular runout reads one cross-section at a time as the part
       * rotates; total runout evaluates the entire surface while the
       * indicator also traverses along it.
       */
      variant: "circular" | "total";
      /** Allowed full indicator movement (FIM), e.g. "0.05". */
      tolerance: string;
      /** Label for the datum axis, defaults to "A". */
      datum?: string;
    }
  | {
      kind: "datum-feature";
      /** Datum letter of the feature, defaults to "A". */
      label?: string;
    }
  | {
      kind: "datum-target";
      /** Datum letter established by the targets, defaults to "A". */
      label?: string;
    }
  | {
      kind: "envelope";
      /**
       * "rule1": the ASME default — perfect form at MMC, form error allowed
       * to grow as size departs toward LMC. "independency": the envelope
       * removed — form may exceed the MMC boundary while size stays within
       * limits (ASME Ⓘ; also the ISO default without Ⓔ).
       */
      variant: "rule1" | "independency";
      /** Optional caption override (e.g. ISO envelope-requirement Ⓔ language). */
      note?: string;
    }
  | {
      kind: "projected-zone";
      /** Zone width, e.g. "Ø0.2". */
      tolerance: string;
      /** Projected height above the surface, e.g. "10". */
      height: string;
      /** Label for the datum axis, defaults to "A". */
      datum?: string;
    }
  | {
      kind: "continuous-feature";
      /**
       * "boss": the 2009 features-of-size case — one cylindrical feature
       * interrupted by grooves, held by one size dimension carrying the CF
       * symbol. "slot": the 2018 extension — two separated planar surfaces
       * whose flatness frame carries CF, so both faces are one surface.
       */
      variant: "boss" | "slot";
      /** Size / tolerance value shown with the callout, e.g. "Ø30" or "0.05". */
      tolerance: string;
    }
  | {
      kind: "free-state";
      /**
       * One contrast figure, always both panels: the part's natural shape in
       * its free state (Ⓕ) beside the same part restrained to datum
       * simulators per the restrained-condition note. No variant — the
       * contrast IS the content.
       */
    }
  | {
      kind: "tangent-plane";
      /** Zone width applied to the tangent plane, e.g. "0.1". */
      tolerance: string;
      /** Label for the datum surface, defaults to "A". */
      datum?: string;
    }
  | {
      kind: "dimension-callout";
      /**
       * A general-dimensioning callout, drawn as the drawing shows it, with
       * the geometry it labels beside it:
       * - "basic": the boxed value over a feature located by it
       * - "reference": the parenthesized overall value above a chain
       * - "not-to-scale": the underlined value beside mismatched geometry
       * - "diameter" / "radius" / "controlled-radius": the size symbol with
       *   its contour, zone arcs and leader convention
       * - "square": the □ callout beside a four-sided feature
       * - "origin": the circle-origin dimension with its measurement start
       * - "depth" / "counterbore" / "spotface" / "countersink": hole callouts
       *   drawn in section with the symbol carrying the dimensions
       * - "conical-taper" / "slope": the ratio symbol over the surface it
       *   qualifies, with the ratio's geometry labeled
       * - "arc-length": the arc-over-dimension beside chord-vs-arc geometry
       * - "parting-line": the diamond-marked phantom line on a molded part
       * - "multiple-identical-features": the nX prefix multiplying one
       *   callout across a pattern of identical features
       */
      variant:
        | "basic"
        | "reference"
        | "not-to-scale"
        | "diameter"
        | "radius"
        | "controlled-radius"
        | "square"
        | "origin"
        | "depth"
        | "counterbore"
        | "spotface"
        | "countersink"
        | "conical-taper"
        | "slope"
        | "arc-length"
        | "parting-line"
        | "multiple-identical-features";
      /** The displayed value, e.g. "50", "(100)", "⌀30", "R70", "CR10", "□20". */
      value: string;
    };

const ARIA_LABELS: Record<GdntDiagram["kind"], string> = {
  "position-zone":
    "Position tolerance zone diagram: the true position established by basic dimensions, the cylindrical tolerance zone around it, and an example actual axis offset inside the zone",
  fcf: "Feature control frame diagram: each compartment of the frame labeled with its meaning",
  bonus:
    "Bonus tolerance diagram: the tolerance zone grows as the produced feature size departs from the referenced material condition (MMC or LMC)",
  "straightness-line":
    "Straightness diagram, surface application: a surface line element must lie between two parallel lines the tolerance apart, checked one section at a time",
  "straightness-axis":
    "Straightness diagram, axis application: the derived median line of a cylindrical feature must lie inside a cylindrical tolerance zone around the nominal axis",
  flatness:
    "Flatness diagram: the entire surface must lie between two parallel planes the tolerance apart",
  circularity:
    "Circularity diagram: one circular cross-section must lie between two concentric circles the tolerance apart in radial width",
  cylindricity:
    "Cylindricity diagram: the entire cylindrical surface must lie between two coaxial cylinders the tolerance apart in radial width",
  "profile-line":
    "Profile of a line diagram: one cross-section's curved profile must lie between two curves offset equally on either side of the true profile",
  "profile-surface":
    "Profile of a surface diagram: an entire freeform surface must lie between two offset surfaces the tolerance apart",
  "fcf-pair":
    "Feature control frame comparison diagram: the same profile control specified without datum references and with datum references",
  "orientation-zone":
    "Orientation tolerance zone diagram: the surface must lie between two parallel planes held at the specified angle to the datum surface",
  "median-points":
    "Derived median points diagram: the midpoints of opposed point pairs on the feature must fall inside the tolerance zone centered on the datum axis or datum center plane",
  runout:
    "Runout diagram: the part rotates about the datum axis while a dial indicator reads the surface — one section at a time for circular runout, the entire surface for total runout",
  "datum-feature":
    "Datum feature diagram: the actual imperfect surface labeled as the datum feature, and the perfect theoretical datum plane derived from it",
  "datum-target":
    "Datum target diagram: three target points on an irregular surface collectively establishing the datum plane",
  envelope:
    "Envelope principle diagram: a feature of size inside its boundary of perfect form at MMC, with form error growing as the size departs from MMC",
  "projected-zone":
    "Projected tolerance zone diagram: the tolerance zone extending above the surface of a threaded hole to the projected height, with the fastener inside it",
  "continuous-feature":
    "Continuous feature diagram: separated features called out with the CF symbol so they are evaluated geometrically as one single continuous feature",
  "free-state":
    "Free state versus restrained condition diagram: a flexible part in its natural unrestrained shape with the free state symbol, beside the same part held in a fixture simulating its mounted condition per the restrained condition note",
  "tangent-plane":
    "Tangent plane diagram: an imperfect wavy surface whose tangent plane touches only the high points — the tolerance applies to that plane, not the surface itself",
  "dimension-callout":
    "General dimensioning callout diagram: the dimension or size symbol exactly as it appears on the drawing, beside the feature geometry it governs",
};

/** Pull the number out of a display string like "Ø0.5" -> 0.5. */
const num = (s: string | undefined) => {
  const n = parseFloat((s ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/* ------------------------------------------------------------------ */
/* Diagram 1 — tolerance zone around true position                    */
/* ------------------------------------------------------------------ */

/**
 * Cross-section through a position tolerance zone: part with datum edges
 * A/B, basic dimensions locating true position, the cylindrical zone as a
 * dashed circle, and the feature (hole) whose actual axis sits at the given
 * offset — inside the zone, so it passes. Zone radius is drawn at 64 units
 * (= half the tolerance value); the offset is scaled proportionally.
 */
function PositionZoneDiagram({
  tolerance,
  offset,
  basicX = "180",
  basicY = "120",
}: {
  tolerance: string;
  offset: string;
  basicX?: string;
  basicY?: string;
}) {
  const tol = num(tolerance) || 0.5;
  const off = num(offset) || 0.15;
  // 64 units of drawing = half the tolerance value; offset scales with it.
  const offsetPx = 64 * (off / (tol / 2));
  const dx = offsetPx / Math.SQRT2;
  const holeCx = 220 + dx;
  const holeCy = 188 - dx;
  const zoneEdge = 220 + 64 / Math.SQRT2; // zone circle point toward the hole (45°)
  return (
    <svg viewBox="0 0 440 380" role="img" aria-label={ARIA_LABELS["position-zone"]} className="h-auto w-full">
      {/* Part outline (cross-section) */}
      <rect x="48" y="60" width="336" height="256" fill="none" className="stroke-border" strokeWidth="1.5" />

      {/* Datum feature symbols on the A (bottom) and B (left) faces */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.5" fill="none">
        <rect x="22" y="110" width="26" height="26" />
        <rect x="320" y="316" width="26" height="26" />
      </g>
      <text x="35" y="127" textAnchor="middle" fontSize="14" className="text-foreground">B</text>
      <text x="333" y="333" textAnchor="middle" fontSize="14" className="text-foreground">A</text>

      {/* Basic dimensions from the datum faces to true position (boxed = basic) */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="48" y1="292" x2="220" y2="292" />
        <line x1="48" y1="292" x2="58" y2="286" />
        <line x1="48" y1="292" x2="58" y2="298" />
        <line x1="220" y1="292" x2="210" y2="286" />
        <line x1="220" y1="292" x2="210" y2="298" />
        <line x1="90" y1="316" x2="90" y2="188" />
        <line x1="90" y1="316" x2="84" y2="306" />
        <line x1="90" y1="316" x2="96" y2="306" />
        <line x1="90" y1="188" x2="84" y2="198" />
        <line x1="90" y1="188" x2="96" y2="198" />
      </g>
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <rect x="118" y="283" width="32" height="18" />
        <rect x="77" y="244" width="26" height="18" />
      </g>
      <text x="134" y="296" textAnchor="middle" fontSize="12" className="text-foreground">{basicX}</text>
      <text x="90" y="257" textAnchor="middle" fontSize="12" className="text-foreground">{basicY}</text>

      {/* True position marker */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.5" fill="none">
        <line x1="220" y1="180" x2="220" y2="196" />
        <line x1="213" y1="188" x2="227" y2="188" />
      </g>
      <circle stroke="currentColor" cx="220" cy="188" r="3.5" fill="currentColor" className="text-primary" />

      {/* Tolerance zone (cylinder cross-section) */}
      <circle cx="220" cy="188" r="64" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 6" className="text-primary" />

      {/* Feature (hole) with its actual axis offset inside the zone */}
      <circle cx={holeCx} cy={holeCy} r="22" className="fill-background stroke-foreground" strokeWidth="2" />
      <g className="text-foreground" stroke="currentColor" strokeWidth="1" fill="none">
        <line x1={holeCx - 3.5} y1={holeCy} x2={holeCx + 3.5} y2={holeCy} />
        <line x1={holeCx} y1={holeCy - 3.5} x2={holeCx} y2={holeCy + 3.5} />
      </g>

      {/* Actual offset from true position */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="220" y1="188" x2={holeCx} y2={holeCy} />
      </g>
      <circle cx="220" cy="188" r="2.5" className="fill-muted-foreground" />
      <circle cx={holeCx} cy={holeCy} r="2.5" className="fill-muted-foreground" />
      <text x="255" y="196" fontSize="12" className="text-muted-foreground">
        actual offset {offset}
      </text>

      {/* Leaders */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="300" y1="88" x2="222" y2="186" />
        <line x1="310" y1="60" x2={zoneEdge} y2={188 - 64 / Math.SQRT2} />
        <line x1="310" y1="300" x2={holeCx} y2={holeCy} />
      </g>
      <circle cx="222" cy="186" r="2" className="fill-muted-foreground" />
      <circle cx={zoneEdge} cy={188 - 64 / Math.SQRT2} r="2" className="fill-muted-foreground" />
      <circle cx={holeCx} cy={holeCy} r="2" className="fill-muted-foreground" />
      <text x="250" y="84" fontSize="14" className="text-foreground">True position (TP)</text>
      <text x="400" y="56" textAnchor="end" fontSize="14" className="text-primary">
        {tolerance} tolerance zone (cylinder)
      </text>
      <text x="400" y="304" textAnchor="end" fontSize="14" className="text-foreground">
        Actual axis — hole center
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 2 — feature control frame breakdown                         */
/* ------------------------------------------------------------------ */

/** The position (⌖) symbol drawn as vectors — no font dependency. */
function PositionGlyph({ cx, cy, r = 8.5 }: { cx: number; cy: number; r?: number }) {
  return (
    <g className="text-foreground" stroke="currentColor" strokeWidth="1.6" fill="none">
      <circle cx={cx} cy={cy} r={r} />
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />
    </g>
  );
}

/** One FCF compartment drawn as vectors: ⌖, form symbols, Ⓜ, else text. */
function FcfCompartmentContent({ content, cx, cy }: { content: string; cx: number; cy: number }) {
  if (content === "⌖") return <PositionGlyph cx={cx} cy={cy} />;
  // Form-characteristic glyphs drawn as vectors so the frame reads correctly
  // regardless of the reader's font coverage.
  if (content === "—") {
    return <line x1={cx - 9} y1={cy} x2={cx + 9} y2={cy} stroke="currentColor" strokeWidth="2" className="text-foreground" />;
  }
  if (content === "⏥") {
    return (
      <path
        d={`M ${cx - 9} ${cy - 7} L ${cx + 9} ${cy - 7} L ${cx + 13} ${cy + 7} L ${cx - 5} ${cy + 7} Z`}
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        className="text-foreground"
      />
    );
  }
  if (content === "○") {
    return <circle cx={cx} cy={cy} r="8" stroke="currentColor" strokeWidth="1.8" fill="none" className="text-foreground" />;
  }
  if (content === "⌭") {
    return (
      <g stroke="currentColor" strokeWidth="1.8" fill="none" className="text-foreground">
        <circle cx={cx - 4} cy={cy} r="8" />
        <circle cx={cx + 4} cy={cy} r="8" />
      </g>
    );
  }
  // Profile glyphs drawn as vectors: surface profile = open arc closed by
  // two short end lines; line profile = the open arc alone.
  if (content === "⌓") {
    return (
      <g stroke="currentColor" strokeWidth="1.6" fill="none" className="text-foreground">
        <path d={`M ${cx - 9} ${cy - 3} A 9 9 0 0 0 ${cx + 9} ${cy - 3}`} />
        <line x1={cx - 13} y1={cy - 3} x2={cx - 5} y2={cy - 3} />
        <line x1={cx + 5} y1={cy - 3} x2={cx + 13} y2={cy - 3} />
      </g>
    );
  }
  if (content === "⌒") {
    return <path d={`M ${cx - 9} ${cy + 2} A 10 10 0 0 1 ${cx + 9} ${cy + 2}`} stroke="currentColor" strokeWidth="1.6" fill="none" className="text-foreground" />;
  }
  // Orientation glyphs drawn as vectors: the angle symbol, perpendicular,
  // and parallel.
  if (content === "∠") {
    return (
      <g stroke="currentColor" strokeWidth="1.6" fill="none" className="text-foreground">
        <path d={`M ${cx - 8} ${cy + 7} L ${cx + 9} ${cy + 7}`} />
        <path d={`M ${cx - 8} ${cy + 7} L ${cx + 6} ${cy - 8}`} />
        <path d={`M ${cx - 1} ${cy + 7} A 8 8 0 0 0 ${cx + 3.2} ${cy + 0.8}`} strokeWidth="1.2" />
      </g>
    );
  }
  if (content === "⟂") {
    return (
      <g stroke="currentColor" strokeWidth="1.8" fill="none" className="text-foreground">
        <path d={`M ${cx - 8} ${cy + 8} L ${cx + 8} ${cy + 8}`} />
        <path d={`M ${cx} ${cy + 8} L ${cx} ${cy - 9}`} />
      </g>
    );
  }
  if (content === "∥") {
    return (
      <g stroke="currentColor" strokeWidth="1.8" fill="none" className="text-foreground">
        <path d={`M ${cx - 5} ${cy - 8} L ${cx - 5} ${cy + 8}`} />
        <path d={`M ${cx + 5} ${cy - 8} L ${cx + 5} ${cy + 8}`} />
      </g>
    );
  }
  // Location/runout glyphs as vectors: symmetry (⌯ — the dashed centerline
  // between two lines), concentricity (⌔ — two circles on a common center).
  if (content === "⌯") {
    return (
      <g stroke="currentColor" strokeWidth="1.6" fill="none" className="text-foreground">
        <line x1={cx - 9} y1={cy - 7} x2={cx - 9} y2={cy + 7} />
        <line x1={cx + 9} y1={cy - 7} x2={cx + 9} y2={cy + 7} />
        <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8} strokeDasharray="3 2.5" strokeWidth="1.3" />
      </g>
    );
  }
  if (content === "⌔") {
    return (
      <g stroke="currentColor" strokeWidth="1.6" fill="none" className="text-foreground">
        <circle cx={cx} cy={cy} r="5" />
        <circle cx={cx} cy={cy} r="9" />
      </g>
    );
  }
  // Runout glyphs: circular runout = one arrow over a circle; total runout
  // = the same plus a second arrow (the traverse).
  if (content === "↗") {
    return (
      <g stroke="currentColor" strokeWidth="1.6" fill="none" className="text-foreground">
        <circle cx={cx} cy={cy + 3} r="7" />
        <path d={`M ${cx - 7} ${cy - 7} l 10 10 M ${cx + 3} ${cy - 5} l 4 4 l -6 1`} />
      </g>
    );
  }
  if (content === "↻") {
    return (
      <g stroke="currentColor" strokeWidth="1.6" fill="none" className="text-foreground">
        <circle cx={cx} cy={cy + 3} r="7" />
        <path d={`M ${cx - 7} ${cy - 7} l 10 10 M ${cx + 3} ${cy - 5} l 4 4 l -6 1`} />
        <path d={`M ${cx - 11} ${cy - 10} l 12 12 M ${cx + 1} ${cy - 8} l 4 4 l -6 1`} strokeWidth="1.2" />
      </g>
    );
  }
  if (content === "Ⓜ") {
    return (
      <g>
        <circle cx={cx} cy={cy} r="9.5" fill="none" className="stroke-foreground" strokeWidth="1.6" />
        <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize="12" className="text-foreground">M</text>
      </g>
    );
  }
  if (content === "Ⓟ") {
    return (
      <g>
        <circle cx={cx} cy={cy} r="9.5" fill="none" className="stroke-foreground" strokeWidth="1.6" />
        <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize="12" className="text-foreground">P</text>
      </g>
    );
  }
  return (
    <text x={cx} y={cy + 6} textAnchor="middle" fontSize="16" className="text-foreground">
      {content}
    </text>
  );
}

/**
 * Feature control frame, compartment by compartment: each row shows one
 * frame box with its meaning beside it. Fully data-driven via the
 * `compartments` prop, so any future symbol's frame renders unchanged.
 */
function FcfDiagram({ compartments }: { compartments: GdntFcfCompartment[] }) {
  const rows = compartments.slice(0, 6);
  return (
    <svg viewBox="0 0 520 330" role="img" aria-label={ARIA_LABELS.fcf} className="h-auto w-full">
      {/* Left bracket: this is one frame, read left to right */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.5" fill="none">
        <line x1="26" y1="12" x2="26" y2="306" />
        <line x1="20" y1="12" x2="32" y2="12" />
        <line x1="20" y1="306" x2="32" y2="306" />
      </g>
      {rows.map((compartment, i) => {
        const center = 34 + i * 50;
        return (
          <g key={i}>
            <rect x="40" y={center - 22} width="76" height="44" fill="none" className="stroke-foreground" strokeWidth="1.5" />
            <FcfCompartmentContent content={compartment.content} cx={78} cy={center} />
            <text x="140" y={center + 6} fontSize="13" className="text-muted-foreground">
              {compartment.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 3 — bonus tolerance (zone grows with departure from MMC)    */
/* ------------------------------------------------------------------ */

/**
 * Two-panel schematic: feature at MMC with the base zone (left), and the
 * same feature produced larger with a proportionally grown zone (right).
 * Zone radii and hole radii are derived from the numeric props, so the
 * "zone grew by exactly the bonus" relationship stays true for any values.
 */
function BonusToleranceDiagram({
  tolerance,
  mmcSize,
  actualSize,
  zoneSize,
  feature = "hole",
  mode = "mmc",
}: {
  tolerance: string;
  mmcSize: string;
  actualSize: string;
  zoneSize: string;
  feature?: "hole" | "pin";
  mode?: "mmc" | "lmc";
}) {
  const tol = num(tolerance) || 0.5;
  const zone = num(zoneSize) || 0.9;
  const baseSize = num(mmcSize) || 6.0;
  const actual = num(actualSize) || 6.4;
  const bonus = zone - tol;
  // Zone radius scales 1:1 with the tolerance; clamped so extreme value
  // ratios (tiny base tolerance) can't push the circle past the viewBox.
  const rRight = Math.min(45 * (zone / tol), 105);
  const holeR = feature === "hole" ? 32 : 26;
  // A hole departs from MMC by growing (or from LMC by shrinking); a pin
  // departs from MMC by shrinking (or from LMC by growing). The produced
  // feature is drawn at actual/baseSize of the base radius, so the drawn
  // departure follows the real direction for either feature type and mode.
  const holeRRight = holeR * (actual / baseSize);
  const label = feature === "hole" ? "Hole" : "Pin";
  const atMmc = mode === "mmc";
  // MMC: hole is smallest / pin is largest. LMC: the mirror image.
  const baseSizeLabel =
    feature === "hole" ? (atMmc ? "smallest" : "largest") : atMmc ? "largest" : "smallest";
  const producedLabel =
    feature === "hole" ? (atMmc ? "produced larger" : "produced smaller") : atMmc ? "produced smaller" : "produced larger";
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label={ARIA_LABELS.bonus} className="h-auto w-full">
      {/* Left panel — feature at the referenced material condition, base zone */}
      <text x="110" y="40" textAnchor="middle" fontSize="14" fontWeight="700" className="text-foreground">
        {label} at {mode.toUpperCase()} ({baseSizeLabel})
      </text>
      <circle cx="110" cy="150" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 6" className="text-primary" />
      <circle cx="110" cy="150" r={holeR} className="fill-background stroke-foreground" strokeWidth="2" />
      <text x="110" y="146" textAnchor="middle" fontSize="13" className="text-foreground">{mmcSize}</text>
      <text x="110" y="225" textAnchor="middle" fontSize="13" className="text-muted-foreground">
        {tolerance} zone
      </text>
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="105" y1="150" x2="115" y2="150" />
        <line x1="110" y1="145" x2="110" y2="155" />
      </g>

      {/* Bonus arrow between panels */}
      <g className="text-primary" stroke="currentColor" strokeWidth="2" fill="none">
        <line x1="158" y1="150" x2="247" y2="150" />
        <line x1="237" y1="144" x2="247" y2="150" />
        <line x1="237" y1="156" x2="247" y2="150" />
      </g>
      <text x="202" y="140" textAnchor="middle" fontSize="14" fontWeight="700" className="text-primary">
        +{Number(bonus.toFixed(3))} bonus
      </text>

      {/* Right panel — feature produced away from MMC, zone grows by the bonus */}
      <text x="330" y="40" textAnchor="middle" fontSize="14" fontWeight="700" className="text-foreground">
        {label} {producedLabel}
      </text>
      <circle cx="330" cy="150" r={rRight} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 6" className="text-primary" />
      <circle cx="330" cy="150" r={holeRRight} className="fill-background stroke-foreground" strokeWidth="2" />
      <text x="330" y="146" textAnchor="middle" fontSize="13" className="text-foreground">{actualSize}</text>
      <text x="330" y={150 + rRight + 20} textAnchor="middle" fontSize="13" className="text-muted-foreground">
        {zoneSize} zone
      </text>
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="325" y1="150" x2="335" y2="150" />
        <line x1="330" y1="145" x2="330" y2="155" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 4 — straightness, surface application (line elements)      */
/* ------------------------------------------------------------------ */

/**
 * Surface straightness: side view of one surface line element. The zone is
 * two parallel lines the tolerance apart; the actual element (wavy) must lie
 * between them. The vertical ticks below mark that each element along the
 * surface is evaluated one section at a time.
 */
function StraightnessLineDiagram({ tolerance }: { tolerance: string }) {
  return (
    <svg viewBox="0 0 440 250" role="img" aria-label={ARIA_LABELS["straightness-line"]} className="h-auto w-full">
      {/* Zone: two parallel lines (exaggerated separation) with end ticks */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.8" fill="none">
        <line x1="50" y1="122" x2="390" y2="122" strokeDasharray="8 6" />
        <line x1="50" y1="178" x2="390" y2="178" strokeDasharray="8 6" />
        <line x1="50" y1="122" x2="50" y2="178" />
        <line x1="390" y1="122" x2="390" y2="178" />
      </g>

      {/* Nominal (perfect) line element, dashed */}
      <line stroke="currentColor" x1="50" y1="150" x2="390" y2="150" strokeDasharray="2 4" className="text-muted-foreground" strokeWidth="1.2" />

      {/* Actual surface line element — wavy, inside the zone */}
      <path
        d="M60 146 L 120 156 L 180 142 L 240 158 L 300 146 L 360 154 L 390 148"
        className="text-foreground"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Sections evaluated one at a time */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="110" y1="192" x2="110" y2="200" />
        <line x1="170" y1="192" x2="170" y2="200" />
        <line x1="230" y1="192" x2="230" y2="200" />
        <line x1="290" y1="192" x2="290" y2="200" />
        <line x1="350" y1="192" x2="350" y2="200" />
      </g>
      <text x="230" y="218" textAnchor="middle" fontSize="12" className="text-muted-foreground">
        line elements checked one section at a time
      </text>

      {/* Leaders */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="400" y1="96" x2="392" y2="138" />
        <line x1="310" y1="240" x2="242" y2="152" />
      </g>
      <circle cx="392" cy="140" r="2" className="fill-muted-foreground" />
      <circle cx="242" cy="154" r="2" className="fill-muted-foreground" />
      <text x="404" y="92" textAnchor="end" fontSize="14" className="text-primary">
        zone: two parallel lines, {tolerance} apart
      </text>
      <text x="316" y="240" textAnchor="end" fontSize="14" className="text-foreground">
        actual line element
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 5 — straightness, axis application (cylindrical zone)      */
/* ------------------------------------------------------------------ */

/**
 * Axis straightness: side view of a shaft with its derived median line
 * (slightly bowed) inside the cylindrical zone — drawn as the two dashed
 * envelope lines, with a cross-section circle at the right end showing the
 * circular zone in section. The zone is a true 3D requirement.
 */
function StraightnessAxisDiagram({ tolerance }: { tolerance: string }) {
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label={ARIA_LABELS["straightness-axis"]} className="h-auto w-full">
      {/* Shaft (side view) with its end cross-section */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.6" fill="none">
        <rect x="60" y="128" width="280" height="44" />
        <ellipse cx="340" cy="150" rx="10" ry="22" />
        <line x1="60" y1="128" x2="60" y2="172" />
      </g>

      {/* Cylindrical zone envelope (exaggerated diameter) */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.8" fill="none">
        <line x1="60" y1="130" x2="340" y2="130" strokeDasharray="8 6" />
        <line x1="60" y1="170" x2="340" y2="170" strokeDasharray="8 6" />
        <line x1="60" y1="130" x2="60" y2="170" />
        {/* Cross-section of the zone at the end: median line must stay inside */}
        <circle cx="352" cy="150" r="20" strokeDasharray="8 6" />
      </g>

      {/* Nominal axis (dashed) */}
      <line stroke="currentColor" x1="60" y1="150" x2="340" y2="150" strokeDasharray="2 4" className="text-muted-foreground" strokeWidth="1.2" />

      {/* Derived median line — bowed but inside the zone */}
      <path d="M60 149 Q 200 163, 340 152" className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="60" cy="149" r="2.5" className="fill-foreground" />
      <circle cx="340" cy="152" r="2.5" className="fill-foreground" />

      {/* End cross-section detail: center point + actual median-line point */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="345" y1="150" x2="359" y2="150" />
        <line x1="352" y1="143" x2="352" y2="157" />
      </g>
      <circle cx="352" cy="150" r="2" className="fill-muted-foreground" />
      <circle cx="352" cy="156" r="2" className="fill-muted-foreground" />

      {/* Leaders */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="392" y1="96" x2="376" y2="148" />
        <line x1="410" y1="240" x2="300" y2="158" />
      </g>
      <circle cx="376" cy="150" r="2" className="fill-muted-foreground" />
      <circle cx="300" cy="158" r="2" className="fill-muted-foreground" />
      <text x="396" y="92" textAnchor="end" fontSize="14" className="text-primary">
        cylindrical zone {tolerance} (dashed)
      </text>
      <text x="414" y="244" textAnchor="end" fontSize="14" className="text-foreground">
        derived median line
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 6 — flatness (two parallel planes)                         */
/* ------------------------------------------------------------------ */

/**
 * Flatness: cross-section through a plate. The zone is two parallel planes
 * (drawn as the dashed lines) the tolerance apart; the wavy actual surface
 * must fit between them over its full extent — one simultaneous evaluation,
 * no per-section pass/fail.
 */
function FlatnessDiagram({ tolerance }: { tolerance: string }) {
  return (
    <svg viewBox="0 0 440 250" role="img" aria-label={ARIA_LABELS.flatness} className="h-auto w-full">
      {/* Plate in section */}
      <rect x="50" y="170" width="340" height="56" className="fill-background stroke-foreground" strokeWidth="1.6" />

      {/* Zone: two parallel planes (exaggerated separation) with end ticks */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.8" fill="none">
        <line x1="50" y1="142" x2="390" y2="142" strokeDasharray="8 6" />
        <line x1="50" y1="198" x2="390" y2="198" strokeDasharray="8 6" />
        <line x1="50" y1="142" x2="50" y2="198" />
        <line x1="390" y1="142" x2="390" y2="198" />
      </g>

      {/* Nominal plane (dashed) through the zone */}
      <line stroke="currentColor" x1="50" y1="170" x2="390" y2="170" strokeDasharray="2 4" className="text-muted-foreground" strokeWidth="1.2" />

      {/* Actual surface — wavy, entirely between the planes */}
      <path
        d="M60 172 L 120 158 L 180 176 L 240 162 L 300 178 L 360 168 L 390 170"
        className="text-foreground"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Leaders */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="400" y1="116" x2="392" y2="140" />
        <line x1="330" y1="242" x2="238" y2="170" />
      </g>
      <circle cx="392" cy="142" r="2" className="fill-muted-foreground" />
      <circle cx="238" cy="172" r="2" className="fill-muted-foreground" />
      <text x="404" y="112" textAnchor="end" fontSize="14" className="text-primary">
        zone: two parallel planes, {tolerance} apart
      </text>
      <text x="336" y="242" textAnchor="end" fontSize="14" className="text-foreground">
        entire surface must fit between them
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 7 — circularity (two concentric circles, one section)      */
/* ------------------------------------------------------------------ */

/**
 * Circularity: a cylinder with a section plane on the left, and that one
 * cross-section on the right — the actual (slightly irregular) profile must
 * lie between two concentric circles of radial separation t. Each section is
 * evaluated independently.
 */
function CircularityDiagram({ tolerance }: { tolerance: string }) {
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label={ARIA_LABELS.circularity} className="h-auto w-full">
      {/* Cylinder with the section plane */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.6" fill="none">
        <rect x="40" y="80" width="80" height="140" />
        <ellipse cx="120" cy="80" rx="10" ry="20" />
        <ellipse cx="120" cy="220" rx="10" ry="20" />
      </g>
      <line stroke="currentColor" x1="80" y1="80" x2="80" y2="220" strokeDasharray="6 5" className="text-muted-foreground" strokeWidth="1.2" />
      <text x="80" y="250" textAnchor="middle" fontSize="12" className="text-muted-foreground">
        section taken here
      </text>

      {/* The one cross-section: zone circles + actual profile between them */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.8" fill="none">
        <circle cx="300" cy="150" r="84" strokeDasharray="8 6" />
        <circle cx="300" cy="150" r="58" strokeDasharray="8 6" />
      </g>
      <path
        d="M373 152 C 362 190, 352 203, 342 213 C 320 224, 297 224, 280 219 C 262 212, 248 197, 242 182 C 232 160, 226 148, 231 132 C 240 108, 253 97, 268 90 C 282 82, 303 76, 322 82 C 342 90, 353 102, 360 116 C 370 134, 373 140, 373 152 Z"
        className="text-foreground"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Leaders */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="404" y1="90" x2="384" y2="128" />
        <line x1="398" y1="250" x2="340" y2="210" />
      </g>
      <circle cx="384" cy="130" r="2" className="fill-muted-foreground" />
      <circle cx="340" cy="212" r="2" className="fill-muted-foreground" />
      <text x="408" y="86" textAnchor="end" fontSize="14" className="text-primary">
        zone: two concentric circles, radial width {tolerance}
      </text>
      <text x="402" y="254" textAnchor="end" fontSize="14" className="text-foreground">
        actual profile of this section
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 8 — cylindricity (two coaxial cylinders, full surface)     */
/* ------------------------------------------------------------------ */

/**
 * Cylindricity: side view of a cylindrical surface between two coaxial
 * cylindrical envelopes (the dashed pairs of lines), with the actual surface
 * wandering between them over the full length — roundness, straightness and
 * taper are all inside this one simultaneous evaluation.
 */
function CylindricityDiagram({ tolerance }: { tolerance: string }) {
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label={ARIA_LABELS.cylindricity} className="h-auto w-full">
      {/* Coaxial cylinder envelopes (exaggerated radial separation) */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.8" fill="none">
        <line x1="54" y1="104" x2="366" y2="104" strokeDasharray="8 6" />
        <line x1="54" y1="196" x2="366" y2="196" strokeDasharray="8 6" />
        <line x1="54" y1="104" x2="54" y2="196" />
        <line x1="366" y1="104" x2="366" y2="196" />
        <line x1="86" y1="104" x2="334" y2="104" strokeDasharray="8 6" />
        <line x1="86" y1="196" x2="334" y2="196" strokeDasharray="8 6" />
        <line x1="86" y1="104" x2="86" y2="196" />
        <line x1="334" y1="104" x2="334" y2="196" />
      </g>

      {/* Nominal cylindrical surface (dashed) */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="70" y1="104" x2="350" y2="104" strokeDasharray="2 4" />
        <line x1="70" y1="196" x2="350" y2="196" strokeDasharray="2 4" />
        <ellipse cx="350" cy="150" rx="12" ry="46" strokeDasharray="2 4" />
      </g>

      {/* Actual surface — wavy, between the envelopes, over the full length */}
      <path
        d="M72 108 C 64 116, 64 128, 74 136 C 82 142, 82 154, 70 162 C 62 168, 62 180, 74 190"
        className="text-foreground"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M348 108 C 356 116, 356 128, 346 136 C 338 142, 338 154, 350 162 C 358 168, 358 180, 346 190"
        className="text-foreground"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path d="M74 190 C 160 184, 260 186, 346 190" className="text-foreground" stroke="currentColor" strokeWidth="1.2" fill="none" />

      {/* Leaders */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="404" y1="80" x2="370" y2="100" />
        <line x1="404" y1="240" x2="352" y2="162" />
      </g>
      <circle cx="370" cy="102" r="2" className="fill-muted-foreground" />
      <circle cx="352" cy="164" r="2" className="fill-muted-foreground" />
      <text x="408" y="76" textAnchor="end" fontSize="14" className="text-primary">
        zone: two coaxial cylinders, radial width {tolerance}
      </text>
      <text x="408" y="244" textAnchor="end" fontSize="14" className="text-foreground">
        actual surface (full length, one evaluation)
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 9 — profile of a line (2D offset curves)                   */
/* ------------------------------------------------------------------ */

/**
 * Profile of a line: one cross-section through a part with an arbitrary
 * curved face. The zone is bounded by two curves offset from the true
 * (basic) profile; the actual profile of this section must fall between
 * them. Sections are evaluated one at a time.
 */
function ProfileLineDiagram({ tolerance }: { tolerance: string }) {
  return (
    <svg viewBox="0 0 440 280" role="img" aria-label={ARIA_LABELS["profile-line"]} className="h-auto w-full">
      {/* Zone: two curves offset on either side of the true profile */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.8" fill="none">
        <path d="M 60 154 C 120 94, 180 94, 240 124 C 300 154, 340 134, 380 104" strokeDasharray="8 6" />
        <path d="M 60 206 C 120 146, 180 146, 240 176 C 300 206, 340 186, 380 156" strokeDasharray="8 6" />
        <line x1="60" y1="154" x2="60" y2="206" />
        <line x1="380" y1="104" x2="380" y2="156" />
      </g>

      {/* True (basic) profile, dashed */}
      <path stroke="currentColor" d="M 60 180 C 120 120, 180 120, 240 150 C 300 180, 340 160, 380 130" strokeDasharray="2 4" className="text-muted-foreground" strokeWidth="1.2" fill="none" />

      {/* Actual profile of this section — inside the band */}
      <path d="M 62 178 C 122 128, 178 126, 238 152 C 298 182, 338 158, 378 132" className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none" />

      {/* Leaders */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="398" y1="84" x2="366" y2="108" />
        <line x1="410" y1="250" x2="310" y2="170" />
      </g>
      <circle cx="366" cy="110" r="2" className="fill-muted-foreground" />
      <circle cx="310" cy="172" r="2" className="fill-muted-foreground" />
      <text x="402" y="80" textAnchor="end" fontSize="14" className="text-primary">
        zone: two offset curves, {tolerance} apart
      </text>
      <text x="414" y="254" textAnchor="end" fontSize="14" className="text-foreground">
        actual profile of this section
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 10 — profile of a surface (3D offset envelopes)            */
/* ------------------------------------------------------------------ */

/** Mesh rows of the schematic freeform patch (front to back). */
const PROFILE_SURFACE_ROWS: [number, number][][] = [
  [[52, 212], [120, 200], [188, 194], [256, 202], [324, 218]],
  [[82, 178], [150, 166], [218, 160], [286, 168], [354, 184]],
  [[112, 144], [180, 132], [248, 126], [316, 134], [384, 150]],
  [[142, 110], [210, 98], [278, 92], [346, 100], [414, 116]],
];

const toPath = (pts: [number, number][]) =>
  `M ${pts.map(([x, y]) => `${x} ${y}`).join(" L ")}`;

/**
 * Profile of a surface, drawn as an isometric wireframe patch: the freeform
 * true surface sits between two offset envelopes (dashed), and the whole
 * actual surface must fit between them in one evaluation. Schematic.
 */
function ProfileSurfaceDiagram({ tolerance }: { tolerance: string }) {
  const rows = PROFILE_SURFACE_ROWS;
  const boundary = (dy: number) =>
    `${toPath(rows[0].map(([x, y]) => [x, y + dy] as [number, number]))} L ${rows[rows.length - 1]
      .map(([x, y]) => [x, y + dy] as [number, number])
      .reverse()
      .map(([x, y]) => `${x} ${y}`)
      .join(" L ")} Z`;
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label={ARIA_LABELS["profile-surface"]} className="h-auto w-full">
      {/* Zone envelopes: the patch boundary offset up and down (dashed) */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.8" fill="none">
        <path d={boundary(-22)} strokeDasharray="8 6" />
        <path d={boundary(22)} strokeDasharray="8 6" />
      </g>

      {/* True (basic) surface: filled patch + wireframe */}
      <path d={boundary(0)} className="fill-background stroke-foreground" strokeWidth="1.6" />
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.1" fill="none">
        {rows.map((pts, i) => <path key={`r${i}`} d={toPath(pts)} />)}
        {[0, 1, 2, 3, 4].map((c) => (
          <path key={`c${c}`} d={toPath(rows.map((pts) => pts[c]))} />
        ))}
      </g>

      {/* Leaders */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="360" y1="44" x2="330" y2="70" />
        <line x1="90" y1="280" x2="150" y2="212" />
      </g>
      <circle cx="330" cy="72" r="2" className="fill-muted-foreground" />
      <circle cx="152" cy="214" r="2" className="fill-muted-foreground" />
      <text x="364" y="40" textAnchor="end" fontSize="14" className="text-primary">
        zone: two offset surfaces, {tolerance} apart
      </text>
      <text x="20" y="284" fontSize="13" className="text-foreground">
        true surface (basic) — actual surface fits between the envelopes
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 11 — FCF pair: the same control with and without datums    */
/* ------------------------------------------------------------------ */

/**
 * Two frames stacked: the control specified without datum references
 * (form only) and with datum references (form + orientation/location).
 * Used for Profile — the library's first control where that distinction
 * genuinely matters.
 */
function FcfPairDiagram({ without, with: withDatums }: { without: GdntFcfCompartment[]; with: GdntFcfCompartment[] }) {
  const renderRow = (comps: GdntFcfCompartment[], center: number) =>
    comps.slice(0, 5).map((compartment, i) => {
      const x = 40 + i * 84;
      return (
        <g key={`${center}-${i}`}>
          <rect x={x} y={center - 22} width="76" height="44" fill="none" className="stroke-foreground" strokeWidth="1.5" />
          <FcfCompartmentContent content={compartment.content} cx={x + 38} cy={center} />
        </g>
      );
    });
  const bracket = (top: number, bottom: number) => (
    <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.5" fill="none">
      <line x1="26" y1={top} x2="26" y2={bottom} />
      <line x1="20" y1={top} x2="32" y2={top} />
      <line x1="20" y1={bottom} x2="32" y2={bottom} />
    </g>
  );
  return (
    <svg viewBox="0 0 460 220" role="img" aria-label={ARIA_LABELS["fcf-pair"]} className="h-auto w-full">
      <text x="40" y="30" fontSize="13" className="text-muted-foreground">
        Without datums — form only
      </text>
      {bracket(42, 86)}
      {renderRow(without, 64)}
      <text x="40" y="140" fontSize="13" className="text-muted-foreground">
        With datums — form + orientation/location
      </text>
      {bracket(152, 196)}
      {renderRow(withDatums, 174)}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 12 — orientation zone (one kind, parameterized by angle)   */
/* ------------------------------------------------------------------ */

/**
 * The shared orientation picture: a surface held between two parallel
 * planes at a fixed angle to a datum. One renderer covers the whole
 * family — angle 0 draws parallelism, 90 draws perpendicularity, and any
 * other angle draws angularity with its basic-angle dimension. Only the
 * part silhouette and the angle callout differ; the zone/datum/labels
 * are identical, which is the point: these are one control at three
 * special-case angles.
 */
function OrientationZoneDiagram({ angle, tolerance, datum = "A" }: { angle: number; tolerance: string; datum?: string }) {
  const rad = (angle * Math.PI) / 180;
  const pt = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  // Controlled-face direction (y down): 0° horizontal, 90° straight up.
  const ux = Math.cos(rad);
  const uy = -Math.sin(rad);
  // In-part perpendicular (positive side points into the part body).
  const nx = Math.sin(rad);
  const ny = Math.cos(rad);
  const OFF = 40; // half the drawn zone separation (exaggerated)
  const EXT = 28; // zone lines extend past the face ends

  // Face anchor + part silhouette + angle callout vary by case.
  let faceStart: [number, number];
  const FACE_LEN = 210;
  let partPath = "";
  let angleCallout: React.ReactNode = null;

  if (angle === 0) {
    // Parallel case: rectangular part, controlled face is its top edge.
    faceStart = [90, 150];
    partPath = "M 90 150 L 330 150 L 330 280 L 90 280 Z";
  } else if (angle === 90) {
    // Perpendicular case: block on the datum, controlled face is its left edge.
    faceStart = [90, 280];
    partPath = "M 90 280 L 90 80 L 180 80 L 180 280 Z";
  } else {
    // General case: block on the datum whose top face rises at the basic angle.
    faceStart = [90, 240];
    const ex = 90 + FACE_LEN * Math.cos(rad);
    const ey = 240 - FACE_LEN * Math.sin(rad);
    partPath = `M 90 240 L ${pt(ex, ey)} L 330 280 L 90 280 Z`;
    // Basic-angle dimension: arc from the datum direction to the face.
    const r = 58;
    const arcEnd = [90 + r * Math.cos(rad), 240 - r * Math.sin(rad)];
    angleCallout = (
      <g>
        <path
          d={`M ${90 + r} 240 A ${r} ${r} 0 0 0 ${pt(arcEnd[0], arcEnd[1])}`}
          className="text-muted-foreground"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
        <rect
          x={90 + 86 * Math.cos(rad / 2) - 21}
          y={240 - 86 * Math.sin(rad / 2) - 11}
          width="42"
          height="22"
          fill="none"
          className="stroke-foreground"
          strokeWidth="1.2"
        />
        <text
          x={90 + 86 * Math.cos(rad / 2)}
          y={240 - 86 * Math.sin(rad / 2) + 4}
          textAnchor="middle"
          fontSize="12"
          className="text-foreground"
        >
          {angle}°
        </text>
      </g>
    );
  }

  const [ax, ay] = faceStart;
  // Zone lines never extend backward past the datum plane the part sits on.
  const backExt = angle === 90 ? 0 : EXT;
  const zoneLine = (side: 1 | -1) => {
    const cx = ax + side * OFF * nx;
    const cy = ay + side * OFF * ny;
    return `M ${pt(cx - backExt * ux, cy - backExt * uy)} L ${pt(cx + (FACE_LEN + EXT) * ux, cy + (FACE_LEN + EXT) * uy)}`;
  };
  const cap = (s: number) => {
    const x1 = ax + OFF * nx - backExt * ux + s * 0;
    const y1 = ay + OFF * ny - backExt * uy;
    const x2 = ax - OFF * nx - backExt * ux;
    const y2 = ay - OFF * ny - backExt * uy;
    return `M ${pt(x1, y1)} L ${pt(x2, y2)}`;
  };
  const capEnd = () => {
    const x1 = ax + OFF * nx + (FACE_LEN + EXT) * ux;
    const y1 = ay + OFF * ny + (FACE_LEN + EXT) * uy;
    const x2 = ax - OFF * nx + (FACE_LEN + EXT) * ux;
    const y2 = ay - OFF * ny + (FACE_LEN + EXT) * uy;
    return `M ${pt(x1, y1)} L ${pt(x2, y2)}`;
  };
  // Actual surface: wavy along the face, endpoints true.
  const wave = Array.from({ length: 9 }, (_, i) => {
    const s = (FACE_LEN * i) / 8;
    const wob = i === 0 || i === 8 ? 0 : (i % 2 === 0 ? -1 : 1) * 14;
    return [ax + s * ux + wob * nx, ay + s * uy + wob * ny] as [number, number];
  });
  const wavePath = `M ${wave.map(([x, y]) => pt(x, y)).join(" L ")}`;

  const angleWord = angle === 0 ? "parallel to" : angle === 90 ? "perpendicular to" : `at ${angle}° basic to`;
  return (
    <svg viewBox="0 0 440 340" role="img" aria-label={ARIA_LABELS["orientation-zone"]} className="h-auto w-full">
      {/* Zone: two parallel planes (dashed), held at the angle to the datum */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.8" fill="none">
        <path d={zoneLine(1)} strokeDasharray="8 6" />
        <path d={zoneLine(-1)} strokeDasharray="8 6" />
        <path d={cap(0)} />
        <path d={capEnd()} />
      </g>

      {/* Part in section, sitting on the datum surface */}
      <path d={partPath} className="fill-background stroke-foreground" strokeWidth="1.6" />

      {/* Nominal face (dashed) */}
      <line
        x1={ax}
        y1={ay}
        x2={ax + FACE_LEN * ux}
        y2={ay + FACE_LEN * uy}
        stroke="currentColor"
        strokeDasharray="2 4"
        className="text-muted-foreground"
        strokeWidth="1.2"
      />

      {/* Actual surface — wavy, inside the zone */}
      <path d={wavePath} className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none" />

      {/* Datum surface + datum feature symbol */}
      <line x1="40" y1="280" x2="400" y2="280" className="text-foreground" stroke="currentColor" strokeWidth="2.2" />
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.4" fill="none">
        <path d="M 242 296 L 258 296 L 250 281 Z" />
        <line x1="250" y1="296" x2="250" y2="306" />
        <rect x="237" y="306" width="26" height="22" />
      </g>
      <text x="250" y="322" textAnchor="middle" fontSize="13" className="text-foreground">
        {datum}
      </text>

      {/* Basic-angle dimension (angularity only) */}
      {angleCallout}

      {/* Leaders */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="404" y1={angle === 0 ? 96 : 56} x2={ax - OFF * nx + FACE_LEN * 0.3 * ux} y2={ay - OFF * ny + FACE_LEN * 0.3 * uy} />
        <line x1="370" y1="336" x2={ax + FACE_LEN * 0.62 * ux + 10 * nx} y2={ay + FACE_LEN * 0.62 * uy + 10 * ny} />
      </g>
      <circle cx={ax - OFF * nx + FACE_LEN * 0.3 * ux} cy={ay - OFF * ny + FACE_LEN * 0.3 * uy} r="2" className="fill-muted-foreground" />
      <circle cx={ax + FACE_LEN * 0.62 * ux + 10 * nx} cy={ay + FACE_LEN * 0.62 * uy + 10 * ny} r="2" className="fill-muted-foreground" />
      <text x="408" y={angle === 0 ? 92 : 52} textAnchor="end" fontSize="14" className="text-primary">
        zone: two parallel planes, {tolerance} apart
      </text>
      <text x="374" y="336" textAnchor="end" fontSize="14" className="text-foreground">
        surface {angleWord} datum {datum}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 13 — derived median points (concentricity / symmetry)      */
/* ------------------------------------------------------------------ */

/**
 * The derived-median picture, which is what makes these two controls
 * different from everything before them: the tolerance zone contains the
 * MIDPOINTS of diametrically opposed point pairs on the feature — not the
 * surface itself. A surface that wobbles can still pass if its median
 * points stay in the zone, and a surface that looks fine can fail if its
 * median points wander. variant "concentricity" draws the axis case (shaft
 * cross-section, cylindrical zone around the datum axis); "symmetry" draws
 * the plane case (two parallel planes about the datum center plane).
 */
function MedianPointsDiagram({ variant, tolerance, datum = "A" }: { variant: "concentricity" | "symmetry"; tolerance: string; datum?: string }) {
  if (variant === "concentricity") {
    // Cross-section of a stepped shaft: outer cylinder = datum axis A;
    // inner bore's actual surface (irregular) with opposed point pairs
    // whose midpoints (filled dots) must fall inside the zone circle.
    const cx = 220, cy = 150;
    return (
      <svg viewBox="0 0 440 300" role="img" aria-label={ARIA_LABELS["median-points"]} className="h-auto w-full">
        {/* Datum cylinder (the outer feature establishing axis A) */}
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.6" fill="none">
          <circle cx={cx} cy={cy} r="118" />
          <circle cx={cx} cy={cy} r="8" />
        </g>
        <line stroke="currentColor" x1={cx - 140} y1={cy} x2={cx - 118} y2={cy} strokeDasharray="6 4" className="text-muted-foreground" strokeWidth="1.2" />
        <text x={cx - 132} y={cy - 12} textAnchor="end" fontSize="13" className="text-foreground">
          datum axis {datum}
        </text>

        {/* Median-point zone: circle centered on the datum axis (dashed) */}
        <g className="text-primary" stroke="currentColor" strokeWidth="1.8" fill="none">
          <circle cx={cx} cy={cy} r="42" strokeDasharray="8 6" />
        </g>

        {/* Actual bore surface (exaggerated irregularity) */}
        <path
          d={`M ${cx + 74} ${cy - 6} C ${cx + 70} ${cy - 26}, ${cx + 52} ${cy - 34}, ${cx + 30} ${cy - 30} C ${cx + 2} ${cy - 26}, ${cx - 22} ${cy - 38}, ${cx - 44} ${cy - 28} C ${cx - 66} ${cy - 18}, ${cx - 74} ${cy + 4}, ${cx - 62} ${cy + 22} C ${cx - 50} ${cy + 40}, ${cx - 26} ${cy + 40}, ${cx - 6} ${cy + 32} C ${cx + 16} ${cy + 24}, ${cx + 40} ${cy + 30}, ${cx + 58} ${cy + 20} C ${cx + 72} ${cy + 12}, ${cx + 78} ${cy + 2}, ${cx + 74} ${cy - 6} Z`}
          className="text-foreground"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />

        {/* Opposed point pairs (thin ties) and their midpoints (filled dots) */}
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.1" fill="none">
          <line x1={cx + 71} y1={cy - 14} x2={cx - 66} y2={cy + 10} />
          <line x1={cx + 52} y1={cy - 31} x2={cx - 47} y2={cy + 31} />
          <line x1={cx + 8} y1={cy - 28} x2={cx - 10} y2={cy + 34} />
          <line x1={cx + 56} y1={cy + 24} x2={cx - 58} y2={cy - 20} />
        </g>
        <g className="fill-foreground">
          <circle cx={cx + 2} cy={cy - 2} r="3" />
          <circle cx={cx + 2} cy={cy} r="3" />
          <circle cx={cx - 1} cy={cy + 3} r="3" />
          <circle cx={cx - 1} cy={cy + 2} r="3" />
        </g>

        {/* Leaders */}
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
          <line x1="398" y1="84" x2="262" y2={cy - 34} />
          <line x1="398" y1="236" x2={cx + 40} y2={cy + 30} />
        </g>
        <circle cx="262" cy={cy - 34} r="2" className="fill-muted-foreground" />
        <circle cx={cx + 40} cy={cy + 30} r="2" className="fill-muted-foreground" />
        <text x="402" y="80" textAnchor="end" fontSize="14" className="text-primary">
          median-point zone {tolerance} around the datum axis
        </text>
        <text x="402" y="240" textAnchor="end" fontSize="14" className="text-foreground">
          midpoints of opposed point pairs — not the surface
        </text>
      </svg>
    );
  }
  // Symmetry: side section of a slot/surface about the datum center plane.
  // The median points of opposed surface points must fall between two
  // planes t apart, centered on datum plane A.
  return (
    <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["median-points"]} className="h-auto w-full">
      {/* Zone: two parallel planes about the datum center plane (dashed) */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.8" fill="none">
        <line x1="60" y1="108" x2="380" y2="108" strokeDasharray="8 6" />
        <line x1="60" y1="152" x2="380" y2="152" strokeDasharray="8 6" />
      </g>
      {/* Datum center plane */}
      <line stroke="currentColor" x1="40" y1="130" x2="400" y2="130" strokeDasharray="2 4" className="text-muted-foreground" strokeWidth="1.2" />
      <text x="40" y="88" fontSize="13" className="text-foreground">
        datum center plane {datum}
      </text>

      {/* Opposed surface pairs: left/right walls of a feature, with the
          actual wavy surfaces and the midpoints between them */}
      <path d="M100 96 L 116 108 L 100 122 L 118 134 L 102 148 L 116 162" className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M340 100 L 324 112 L 342 124 L 326 138 L 340 150 L 326 160" className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none" />
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.1" fill="none">
        <line x1="116" y1="108" x2="324" y2="112" />
        <line x1="100" y1="122" x2="342" y2="124" />
        <line x1="118" y1="134" x2="326" y2="138" />
        <line x1="102" y1="148" x2="340" y2="150" />
      </g>
      <g className="fill-foreground">
        <circle cx="220" cy="110" r="3" />
        <circle cx="221" cy="123" r="3" />
        <circle cx="222" cy="136" r="3" />
        <circle cx="221" cy="149" r="3" />
      </g>

      {/* Leaders */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="404" y1="70" x2="368" y2="106" />
        <line x1="404" y1="196" x2="240" y2="136" />
      </g>
      <circle cx="368" cy="108" r="2" className="fill-muted-foreground" />
      <circle cx="240" cy="136" r="2" className="fill-muted-foreground" />
      <text x="408" y="66" textAnchor="end" fontSize="14" className="text-primary">
        zone: two planes {tolerance} apart, centered on datum {datum}
      </text>
      <text x="408" y="200" textAnchor="end" fontSize="14" className="text-foreground">
        midpoints of opposed surface points
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram 14 — runout (rotation-based inspection)                    */
/* ------------------------------------------------------------------ */

/**
 * The runout picture is a measurement SETUP, not a static zone: the part
 * rotates about the datum axis while a dial indicator rests on the
 * controlled surface. Circular runout: one section, indicator fixed, part
 * spun 360°, read the FIM. Total runout: the same rotation plus the
 * indicator traversing along the surface — the full surface in one pass.
 * variant selects which; the geometry and labels differ accordingly.
 */
function RunoutDiagram({ variant, tolerance, datum = "A" }: { variant: "circular" | "total"; tolerance: string; datum?: string }) {
  const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
    const p0 = [cx + r * Math.cos((a0 * Math.PI) / 180), cy - r * Math.sin((a0 * Math.PI) / 180)];
    const p1 = [cx + r * Math.cos((a1 * Math.PI) / 180), cy - r * Math.sin((a1 * Math.PI) / 180)];
    return `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A ${r} ${r} 0 0 0 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
  };
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label={ARIA_LABELS.runout} className="h-auto w-full">
      {/* Datum journal (left) + controlled surface (right), on the rotation axis */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.6" fill="none">
        <rect x="56" y="122" width="96" height="56" />
        <rect x="152" y="110" width="204" height="80" />
      </g>
      {/* Rotation axis (centerline) */}
      <line stroke="currentColor" x1="36" y1="150" x2="404" y2="150" strokeDasharray="10 5 2 5" className="text-muted-foreground" strokeWidth="1.2" />

      {/* Datum symbol on the journal */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.4" fill="none">
        <path d="M 96 178 L 112 178 L 104 193 Z" />
        <line x1="104" y1="193" x2="104" y2="203" />
        <rect x="91" y="203" width="26" height="22" />
      </g>
      <text x="104" y="219" textAnchor="middle" fontSize="13" className="text-foreground">
        {datum}
      </text>

      {/* Rotation arrow around the axis at the left end */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.4" fill="none">
        <path d={arc(64, 150, 26, 300, 220)} />
        <path d="M 78 133 l 8 4 l -9 4" fill="none" />
      </g>
      <text x="64" y="112" textAnchor="middle" fontSize="12" className="text-muted-foreground">
        rotate 360°
      </text>

      {/* Dial indicator on the controlled surface */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.5" fill="none">
        <line x1="254" y1="110" x2="254" y2="66" />
        <circle cx="254" cy="52" r="14" />
        <line x1="254" y1="52" x2="262" y2="44" strokeWidth="1.2" />
      </g>

      {/* FIM readout between the two readings */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="292" y1="110" x2="292" y2="96" />
        <line x1="292" y1="96" x2="330" y2="96" />
      </g>
      <text x="336" y="100" fontSize="13" className="text-foreground">
        FIM ≤ {tolerance}
      </text>

      {variant === "circular" ? (
        <>
          {/* One measured section highlighted */}
          <line stroke="currentColor" x1="254" y1="110" x2="254" y2="190" strokeDasharray="4 4" className="text-primary" strokeWidth="1.4" />
          <text x="254" y="248" textAnchor="middle" fontSize="13" className="text-foreground">
            one cross-section at a time — indicator fixed, part spins
          </text>
        </>
      ) : (
        <>
          {/* Traversal arrows: the indicator also moves along the surface */}
          <g className="text-primary" stroke="currentColor" strokeWidth="1.6" fill="none">
            <line x1="186" y1="98" x2="322" y2="98" />
            <path d="M 322 98 l -9 -4 v 8 Z" className="fill-primary" stroke="none" />
          </g>
          <text x="254" y="248" textAnchor="middle" fontSize="13" className="text-foreground">
            entire surface in one pass — rotation + indicator traverse
          </text>
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Concept diagrams — datum feature / datum targets / envelope /      */
/* projected zone (concept pages, /cad/gdt/[slug] second content type) */
/* ------------------------------------------------------------------ */

/**
 * Datum feature vs. datum: the actual (imperfect) surface labeled with the
 * datum letter, and the perfect theoretical datum plane derived from it.
 * The plane is drawn tangent to the high points, the way a surface plate
 * simulates a primary datum.
 */
function DatumFeatureDiagram({ label = "A" }: { label?: string }) {
  const planeY = 100;
  return (
    <svg viewBox="0 0 440 280" role="img" aria-label={ARIA_LABELS["datum-feature"]} className="h-auto w-full">
      {/* Theoretical datum plane, extending past the part */}
      <line stroke="currentColor" x1="40" y1={planeY} x2="400" y2={planeY} strokeDasharray="8 6" className="text-primary" strokeWidth="1.8" />
      <text x="220" y="82" textAnchor="middle" fontSize="13" className="text-muted-foreground">
        datum plane {label} — perfect, theoretical
      </text>

      {/* Contact tick: the high point establishes the plane */}
      <line stroke="currentColor" x1="200" y1="138" x2="200" y2={planeY} strokeDasharray="3 3" className="text-muted-foreground" strokeWidth="1" />

      {/* Part: block with a wavy (imperfect) top surface */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M90 250 L90 150 L110 138 L140 158 L170 142 L200 162 L230 146 L260 156 L290 140 L320 160 L350 148 L350 250 Z" />
      </g>
      <text x="220" y="236" textAnchor="middle" fontSize="13" className="text-foreground">
        datum feature {label} — the actual (imperfect) surface
      </text>

      {/* Datum feature symbol: triangle on the surface with the letter */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.8" fill="none">
        <path d="M288 120 L312 120 L300 140 Z" />
      </g>
      <text x="300" y="108" textAnchor="middle" fontSize="14" fontWeight="700" className="text-foreground">
        {label}
      </text>
    </svg>
  );
}

/**
 * Datum targets: three target points on a rough (casting-like) surface,
 * each with the standard target symbol, collectively establishing the
 * datum plane through the points they contact.
 */
function DatumTargetDiagram({ label = "A" }: { label?: string }) {
  // Contact points are collinear — they lie on the plane the targets
  // establish (y = 178 - 0.1 * (x - 120)), and the jagged surface passes
  // through each of them.
  const targets = [
    { x: 120, y: 178, n: "1" },
    { x: 230, y: 167, n: "2" },
    { x: 340, y: 156, n: "3" },
  ] as const;
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label={ARIA_LABELS["datum-target"]} className="h-auto w-full">
      <text x="220" y="64" textAnchor="middle" fontSize="13" className="text-muted-foreground">
        rough surface — too irregular to reference in full
      </text>

      {/* Datum plane established by the three targets */}
      <line stroke="currentColor" x1="40" y1="186" x2="400" y2="150" strokeDasharray="8 6" className="text-primary" strokeWidth="1.8" />
      <text x="285" y="132" textAnchor="middle" fontSize="13" className="text-muted-foreground">
        plane {label} established by the three targets
      </text>

      {/* Cast part: jagged top, block body */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M60 260 L60 205 L100 190 L120 178 L150 186 L180 175 L230 167 L260 180 L300 168 L340 156 L380 172 L380 260 Z" />
      </g>

      {/* Target symbols: circle with a horizontal line + A1/A2/A3 */}
      {targets.map((t) => (
        <g key={t.n} className="text-foreground" stroke="currentColor" strokeWidth="1.6" fill="none">
          <line stroke="currentColor" x1={t.x} y1={t.y - 20} x2={t.x} y2={t.y} strokeDasharray="2 2" className="text-muted-foreground" />
          <circle cx={t.x} cy={t.y - 33} r="11" />
          <line x1={t.x - 8} y1={t.y - 33} x2={t.x + 8} y2={t.y - 33} />
        </g>
      ))}
      {targets.map((t) => (
        <text key={t.n} x={t.x} y={t.y - 29} textAnchor="middle" fontSize="10" fontWeight="700" className="text-foreground">
          {label}{t.n}
        </text>
      ))}
    </svg>
  );
}

/**
 * Rule #1 / independency: a shaft in section against its MMC boundary of
 * perfect form (dashed envelope). rule1: the wavy surface stays inside the
 * envelope — form error is bounded by it. independency: the surface pokes
 * through — size and form are independent requirements.
 */
function EnvelopeDiagram({ variant }: { variant: "rule1" | "independency" }) {
  return (
    <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS.envelope} className="h-auto w-full">
      {/* MMC boundary of perfect form (the envelope) */}
      <rect stroke="currentColor" x="70" y="90" width="300" height="80" fill="none" strokeDasharray="8 6" className="text-primary" strokeWidth="1.8" />
      <text x="220" y="78" textAnchor="middle" fontSize="13" className="text-muted-foreground">
        MMC boundary — perfect form
      </text>

      {/* Actual shaft surface: wavy, inside the envelope (rule1) or
          poking through it (independency) */}
      {variant === "rule1" ? (
        <g className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M75 92 L110 96 L145 91 L180 97 L215 92 L250 95 L285 91 L320 96 L365 92" />
          <path d="M75 166 L110 170 L145 165 L180 169 L215 166 L250 169 L285 165 L320 168 L365 167" />
        </g>
      ) : (
        <g className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M75 90 L110 84 L145 96 L180 86 L215 94 L250 83 L285 95 L320 88 L365 92" />
          <path d="M75 168 L110 174 L145 164 L180 172 L215 166 L250 175 L285 165 L320 170 L365 168" />
        </g>
      )}

      <text x="220" y="198" textAnchor="middle" fontSize="13" className="text-foreground">
        {variant === "rule1"
          ? "form error grows as size departs from MMC toward LMC"
          : "form may exceed the envelope — size and form independent"}
      </text>
    </svg>
  );
}

/**
 * Projected tolerance zone: a threaded hole in a plate, the tolerance zone
 * projected H above the surface, and the fastener whose shank must lie
 * inside the zone over the full projected height.
 */
function ProjectedZoneDiagram({
  tolerance,
  height,
  datum = "A",
}: {
  tolerance: string;
  height: string;
  datum?: string;
}) {
  return (
    <svg viewBox="0 0 440 320" role="img" aria-label={ARIA_LABELS["projected-zone"]} className="h-auto w-full">
      <text x="220" y="62" textAnchor="middle" fontSize="13" className="text-muted-foreground">
        fastener must stay inside the zone above the surface
      </text>

      {/* Projected tolerance zone (dashed), H above the plate top */}
      <rect stroke="currentColor" x="205" y="110" width="30" height="100" fill="none" strokeDasharray="8 6" className="text-primary" strokeWidth="1.8" />
      <text x="242" y="148" fontSize="13" className="text-foreground">projected zone</text>
      <text x="242" y="166" fontSize="13" className="text-foreground">H = {height} (Ⓟ)</text>

      {/* Height bracket at the left of the zone */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="192" y1="110" x2="192" y2="210" />
        <line x1="187" y1="110" x2="197" y2="110" />
        <line x1="187" y1="210" x2="197" y2="210" />
      </g>

      {/* Fastener shank projecting into the zone */}
      <rect x="213" y="130" width="14" height="80" className="fill-background stroke-foreground" strokeWidth="2" />
      <line stroke="currentColor" x1="213" y1="142" x2="227" y2="142" className="text-muted-foreground" strokeWidth="1" />
      <line stroke="currentColor" x1="213" y1="152" x2="227" y2="152" className="text-muted-foreground" strokeWidth="1" />

      {/* Plate with a threaded hole below */}
      <rect x="100" y="210" width="240" height="50" className="fill-background stroke-foreground" strokeWidth="2" />
      <g className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none">
        <line x1="205" y1="210" x2="205" y2="260" />
        <line x1="235" y1="210" x2="235" y2="260" />
      </g>
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="200" y1="222" x2="212" y2="214" />
        <line x1="200" y1="238" x2="212" y2="230" />
        <line x1="200" y1="254" x2="212" y2="246" />
        <line x1="228" y1="214" x2="240" y2="222" />
        <line x1="228" y1="230" x2="240" y2="238" />
        <line x1="228" y1="246" x2="240" y2="254" />
      </g>
      <text x="220" y="288" textAnchor="middle" fontSize="13" className="text-foreground">
        threaded hole — zone extends from datum {datum}'s plane by H
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Batch 4 — profile unequal disposition (Ⓤ)                           */
/* ------------------------------------------------------------------ */

/** The unequally-disposed-profile modifier drawn as vectors: Ⓤ. */
function UnequalDispositionGlyph({ cx, cy, r = 9 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" className="stroke-foreground" strokeWidth="1.6" />
      <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize="12" className="text-foreground">U</text>
    </g>
  );
}

/**
 * Extend the profile picture with an off-center zone mode, the way the bonus
 * diagram grew an LMC mode: mode "equal" draws the classic bisected band;
 * mode "unequal" shifts the band so `outside` of the total tolerance sits
 * outside the material (the Ⓤ modifier's meaning), with the callout frame
 * and disposition arithmetic annotated. The drawn proportions follow the
 * real split — outside/total of the band is on the outside side.
 */
function ProfileUnequalDiagram({
  tolerance,
  outside = "0",
  variant = "line",
}: {
  tolerance: string;
  outside?: string;
  variant?: "line" | "surface";
}) {
  const tol = num(tolerance) || 0.2;
  const out = num(outside);
  const outFrac = Math.min(Math.max(out / tol, 0), 1); // clamp to [0,1] for drawing
  // Band geometry: 56 units total separation, centered on the true profile
  // at y=180, shifted so outFrac of the band sits ABOVE the true profile
  // (outside the material — the part body lies below).
  const BAND = 56;
  const center = 180;
  const upper = center - BAND * outFrac; // outside-side boundary
  const lower = upper + BAND; // inside-side boundary
  const isLine = variant === "line";
  const curve = (dy: number) =>
    isLine
      ? `M 60 ${180 + dy} C 120 ${120 + dy}, 180 ${120 + dy}, 240 ${150 + dy} C 300 ${180 + dy}, 340 ${160 + dy}, 380 ${130 + dy}`
      : `M 60 ${170 + dy} C 120 ${110 + dy}, 180 ${110 + dy}, 240 ${140 + dy} C 300 ${170 + dy}, 340 ${150 + dy}, 380 ${120 + dy}`;
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label={ARIA_LABELS[isLine ? "profile-line" : "profile-surface"]} className="h-auto w-full">
      {/* Callout frame: profile | total | Ⓤ | outside */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.5" fill="none">
        <rect x="60" y="30" width="30" height="26" />
        <rect x="90" y="30" width="44" height="26" />
        <rect x="134" y="30" width="30" height="26" />
        <rect x="164" y="30" width="40" height="26" />
      </g>
      <path d={`M 68 46 A 8 8 0 0 0 84 46`} stroke="currentColor" strokeWidth="1.5" fill="none" className="text-foreground" />
      <text x="112" y="48" textAnchor="middle" fontSize="13" className="text-foreground">{tolerance}</text>
      <UnequalDispositionGlyph cx={149} cy={43} r={9} />
      <text x="184" y="48" textAnchor="middle" fontSize="13" className="text-foreground">{outside}</text>

      {/* Zone boundaries (dashed) */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.8" fill="none">
        <path d={curve(center - upper)} strokeDasharray="8 6" />
        <path d={curve(center - lower)} strokeDasharray="8 6" />
      </g>

      {/* True (basic) profile, dashed — sits `outside` below the upper boundary */}
      <path stroke="currentColor" d={curve(0)} strokeDasharray="2 4" className="text-muted-foreground" strokeWidth="1.2" fill="none" />

      {/* Part body hanging from the true profile (surface variant) */}
      {!isLine && <path d={`${curve(0)} L 380 240 L 60 240 Z`} className="fill-background stroke-foreground" strokeWidth="1.6" />}

      {/* Actual profile of this section — inside the shifted band */}
      <path
        d={isLine
          ? "M 62 176 C 122 124, 178 124, 238 152 C 298 180, 338 156, 378 128"
          : "M 62 172 C 122 118, 178 118, 238 148 C 298 176, 338 152, 378 124"}
        className="text-foreground"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Disposition annotations */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="300" y1={upper + 4} x2="300" y2={180} />
        <line x1="296" y1={upper + 4} x2="304" y2={upper + 4} />
        <line x1="296" y1="180" x2="304" y2="180" />
      </g>
      <text x="308" y={(upper + 180) / 2 + 4} fontSize="12" className="text-primary">
        {outside} outside
      </text>
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="300" y1="180" x2="300" y2={lower - 4} />
        <line x1="296" y1={lower - 4} x2="304" y2={lower - 4} />
      </g>
      <text x="308" y={(180 + lower) / 2 + 4} fontSize="12" className="text-primary">
        {Number((tol - out).toFixed(3))} inside
      </text>

      {/* Leaders + labels */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="398" y1="84" x2="366" y2="108" />
      </g>
      <circle cx="366" cy="110" r="2" className="fill-muted-foreground" />
      <text x="402" y="80" textAnchor="end" fontSize="14" className="text-primary">
        zone {tolerance} wide — shifted off-center
      </text>
      <text x="60" y="284" fontSize="13" className="text-foreground">
        true profile — {outside} outside, {Number((tol - out).toFixed(3))} inside the material
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Batch 4 — continuous feature (CF)                                   */
/* ------------------------------------------------------------------ */

/** The continuous-feature symbol: the letters CF in an irregular hexagon. */
function ContinuousFeatureGlyph({ cx, cy, r = 11 }: { cx: number; cy: number; r?: number }) {
  // Irregular hexagon — flat top/bottom, angled sides (the standard CF shape).
  const pts = [
    [cx - r * 0.75, cy - r * 0.62],
    [cx + r * 0.75, cy - r * 0.62],
    [cx + r, cy],
    [cx + r * 0.75, cy + r * 0.62],
    [cx - r * 0.75, cy + r * 0.62],
    [cx - r, cy],
  ];
  return (
    <g>
      <polygon points={pts.map(([x, y]) => `${x} ${y}`).join(", ")} fill="none" className="stroke-foreground" strokeWidth="1.5" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="700" className="text-foreground">CF</text>
    </g>
  );
}

/**
 * Continuous feature: separated segments treated as ONE feature. variant
 * "boss" = the 2009 features-of-size case: a cylindrical boss interrupted
 * by grooves, one size dimension carrying the CF symbol. variant "slot" =
 * the 2018 extension: two planar faces separated by a gap, flatness frames
 * with CF over each — both surfaces evaluated as one.
 */
function ContinuousFeatureDiagram({ variant, tolerance }: { variant: "boss" | "slot"; tolerance: string }) {
  if (variant === "boss") {
    return (
      <svg viewBox="0 0 440 300" role="img" aria-label={ARIA_LABELS["continuous-feature"]} className="h-auto w-full">
        {/* The interrupted boss: three cylindrical segments, two grooves */}
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.8" fill="none">
          <rect x="90" y="110" width="70" height="90" />
          <rect x="185" y="110" width="70" height="90" />
          <rect x="280" y="110" width="70" height="90" />
        </g>
        {/* The interruptions (grooves down to the base) */}
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.5" fill="none">
          <line x1="160" y1="110" x2="160" y2="230" />
          <line x1="185" y1="110" x2="185" y2="230" />
          <line x1="255" y1="110" x2="255" y2="230" />
          <line x1="280" y1="110" x2="280" y2="230" />
        </g>
        {/* Base the boss stands on */}
        <line x1="60" y1="230" x2="380" y2="230" className="text-foreground" stroke="currentColor" strokeWidth="2" />

        {/* One size dimension spanning ALL three segments, with the CF symbol */}
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
          <line x1="90" y1="100" x2="90" y2="64" />
          <line x1="350" y1="100" x2="350" y2="64" />
          <line x1="90" y1="70" x2="278" y2="70" />
          <line x1="90" y1="64" x2="100" y2="74" />
          <line x1="90" y1="76" x2="100" y2="66" />
          <line x1="350" y1="64" x2="340" y2="74" />
          <line x1="350" y1="76" x2="340" y2="66" />
        </g>
        <text x="150" y="58" fontSize="13" className="text-foreground">{tolerance}</text>
        <ContinuousFeatureGlyph cx={300} cy={54} />

        {/* Phantom-line envelope tying the segments together (offset outward
            so it reads as its own object, not a re-trace of the segments) */}
        <rect stroke="currentColor" x="82" y="102" width="276" height="106" fill="none" strokeDasharray="12 4 3 4" className="text-primary" strokeWidth="1.4" />

        <text x="220" y="262" textAnchor="middle" fontSize="13" className="text-foreground">
          one dimension + CF — the three segments are one feature of size
        </text>
        <text x="220" y="284" textAnchor="middle" fontSize="12" className="text-muted-foreground">
          Rule #1 and any geometric controls apply as if the grooves were not there
        </text>
      </svg>
    );
  }
  // Slot variant: two planar faces separated by a gap, each covered by a
  // flatness frame carrying CF — the 2018 extension to surfaces.
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label={ARIA_LABELS["continuous-feature"]} className="h-auto w-full">
      {/* Two coplanar faces (side view: short horizontal lines) with a gap */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="2.4" fill="none">
        <line x1="80" y1="120" x2="180" y2="120" />
        <line x1="260" y1="120" x2="360" y2="120" />
      </g>
      {/* Bodies under the faces */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.6" fill="none">
        <path d="M80 120 L80 210 L180 210 L180 120" />
        <path d="M260 120 L260 210 L360 210 L360 120" />
      </g>
      {/* The slot between them */}
      <text x="220" y="140" textAnchor="middle" fontSize="12" className="text-muted-foreground">
        slot
      </text>

      {/* Flatness frames with CF attached, leaders to each face */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.4" fill="none">
        <rect x="70" y="40" width="26" height="24" />
        <rect x="96" y="40" width="34" height="24" />
        <rect x="296" y="40" width="26" height="24" />
        <rect x="322" y="40" width="34" height="24" />
      </g>
      <path d={`M 76 52 A 8 8 0 0 0 92 52`} stroke="currentColor" strokeWidth="1.4" fill="none" className="text-foreground" />
      <path d={`M 302 52 A 8 8 0 0 0 318 52`} stroke="currentColor" strokeWidth="1.4" fill="none" className="text-foreground" />
      <text x="113" y="57" textAnchor="middle" fontSize="12" className="text-foreground">{tolerance}</text>
      <text x="339" y="57" textAnchor="middle" fontSize="12" className="text-foreground">{tolerance}</text>
      <ContinuousFeatureGlyph cx={150} cy={52} r={10} />
      <ContinuousFeatureGlyph cx={276} cy={52} r={10} />
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="128" y1="64" x2="120" y2="112" />
        <line x1="300" y1="64" x2="320" y2="112" />
      </g>

      {/* One phantom envelope across both faces */}
      <line stroke="currentColor" x1="80" y1="100" x2="360" y2="100" strokeDasharray="12 4 3 4" className="text-primary" strokeWidth="1.4" />

      <text x="220" y="250" textAnchor="middle" fontSize="13" className="text-foreground">
        flatness + CF on each frame — both faces are one continuous surface
      </text>
      <text x="220" y="272" textAnchor="middle" fontSize="12" className="text-muted-foreground">
        Y14.5-2018 extends CF to surfaces and datum features too
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Batch 4 — free state (Ⓕ) vs. restrained condition                   */
/* ------------------------------------------------------------------ */

/** The free-state modifier drawn as vectors: Ⓕ. */
function FreeStateGlyph({ cx, cy, r = 9 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" className="stroke-foreground" strokeWidth="1.6" />
      <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize="12" className="text-foreground">F</text>
    </g>
  );
}

/**
 * One contrast figure, always both panels: LEFT — the non-rigid part in its
 * free state, unrestrained, drawn in its natural deflected shape with the Ⓕ
 * modifier on the frame. RIGHT — the same part restrained against datum
 * simulators per the restrained-condition note, forced toward its mounted
 * shape. The whole point is that the two shapes differ.
 */
function FreeStateDiagram() {
  // Deflected (free) and true (restrained) top-edge shapes for the panel.
  const deflected = "M 70 96 L 110 118 L 150 100 L 190 122 L 230 104 L 270 116";
  const straight = "M 290 110 L 410 110";
  return (
    <svg viewBox="0 0 440 320" role="img" aria-label={ARIA_LABELS["free-state"]} className="h-auto w-full">
      {/* LEFT: free state */}
      <text x="150" y="42" textAnchor="middle" fontSize="14" fontWeight="700" className="text-foreground">
        Free state (Ⓕ)
      </text>
      <text x="150" y="62" textAnchor="middle" fontSize="12" className="text-muted-foreground">
        no clamping — natural shape
      </text>
      {/* The flexible flange: deflected top edge + body */}
      <path d={deflected} className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M 70 96 L 70 150 L 270 150 L 270 116" className="text-foreground" stroke="currentColor" strokeWidth="1.6" fill="none" />
      {/* Frame with the Ⓕ modifier */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.4" fill="none">
        <rect x="100" y="180" width="30" height="24" />
        <rect x="130" y="180" width="34" height="24" />
        <rect x="164" y="180" width="26" height="24" />
      </g>
      <path d={`M 106 192 A 8 8 0 0 0 122 192`} stroke="currentColor" strokeWidth="1.4" fill="none" className="text-foreground" />
      <text x="147" y="197" textAnchor="middle" fontSize="12" className="text-foreground">0.5</text>
      <FreeStateGlyph cx={177} cy={192} r={9} />
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.1" fill="none">
        <line x1="150" y1="170" x2="160" y2="124" />
      </g>

      {/* RIGHT: restrained condition */}
      <text x="350" y="42" textAnchor="middle" fontSize="14" fontWeight="700" className="text-foreground">
        Restrained (note)
      </text>
      <text x="350" y="62" textAnchor="middle" fontSize="12" className="text-muted-foreground">
        clamped to datum simulators
      </text>
      {/* The same part, now forced straight against the fixture */}
      <path d={straight} className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M 290 110 L 290 150 L 410 150 L 410 110" className="text-foreground" stroke="currentColor" strokeWidth="1.6" fill="none" />
      {/* Datum simulators: hatched fixture blocks under the flange ends */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="300" y1="150" x2="290" y2="160" />
        <line x1="316" y1="150" x2="306" y2="160" />
        <line x1="332" y1="150" x2="322" y2="160" />
        <line x1="384" y1="150" x2="374" y2="160" />
        <line x1="400" y1="150" x2="390" y2="160" />
        <line x1="416" y1="150" x2="406" y2="160" />
        <line x1="290" y1="164" x2="410" y2="164" />
      </g>
      <text x="350" y="184" textAnchor="middle" fontSize="12" className="text-muted-foreground">
        datum simulators (fixture)
      </text>
      {/* The restrained-condition note, as text — there is no symbol */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.3" fill="none">
        <path d="M 288 216 C 288 210, 292 206, 298 206 L 402 206 C 408 206, 412 210, 412 216 L 412 240 C 412 246, 408 250, 402 250 L 318 250 L 300 264 L 302 250 C 296 250, 288 246, 288 240 Z" />
      </g>
      <text x="350" y="224" textAnchor="middle" fontSize="10" className="text-foreground">
        MEASURE FLATNESS WHILE
      </text>
      <text x="350" y="240" textAnchor="middle" fontSize="10" className="text-foreground">
        RESTRAINED TO DATUM A
      </text>

      {/* Divider between the panels */}
      <line stroke="currentColor" x1="280" y1="80" x2="280" y2="268" strokeDasharray="4 4" className="text-muted-foreground" strokeWidth="1" />

      <text x="220" y="300" textAnchor="middle" fontSize="13" className="text-foreground">
        two states, two shapes — the note decides which
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Batch 4 — tangent plane (Ⓣ)                                         */
/* ------------------------------------------------------------------ */

/** The tangent-plane modifier drawn as vectors: Ⓣ. */
function TangentPlaneGlyph({ cx, cy, r = 9 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" className="stroke-foreground" strokeWidth="1.6" />
      <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize="12" className="text-foreground">T</text>
    </g>
  );
}

/**
 * The whole concept in one picture: an actually wavy surface (solid), and
 * the flat tangent plane (dashed) touching only its HIGH POINTS. The Ⓣ
 * callout applies the tolerance to that plane, not to the surface itself —
 * so the surface's local waviness is unconstrained as long as the contact
 * plane stays inside the zone. Contact ticks mark where the plane touches.
 */
function TangentPlaneDiagram({ tolerance, datum = "A" }: { tolerance: string; datum?: string }) {
  // Wavy surface across x=70..370; the tangent plane sits CLEARLY above it,
  // touching the three high points via dashed contact ticks. The vertical
  // separation between plane and surface is exaggerated — the concept is
  // "flat contact plane vs. wavy surface", and it must read at a glance.
  const highs: [number, number][] = [
    [110, 148],
    [220, 138],
    [340, 146],
  ];
  const planeY = (x: number) => 104 - ((x - 60) / 320) * 8; // slight tilt
  return (
    <svg viewBox="0 0 440 320" role="img" aria-label={ARIA_LABELS["tangent-plane"]} className="h-auto w-full">
      {/* Callout frame: parallelism | t | Ⓣ | A */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.4" fill="none">
        <rect x="120" y="30" width="30" height="26" />
        <rect x="150" y="30" width="36" height="26" />
        <rect x="186" y="30" width="26" height="26" />
        <rect x="212" y="30" width="26" height="26" />
      </g>
      <path d={`M 126 37 L 146 37 M 136 37 L 136 51`} stroke="currentColor" strokeWidth="1.5" fill="none" className="text-foreground" />
      <text x="168" y="48" textAnchor="middle" fontSize="13" className="text-foreground">{tolerance}</text>
      <TangentPlaneGlyph cx={199} cy={43} r={9} />
      <text x="225" y="48" textAnchor="middle" fontSize="13" className="text-foreground">{datum}</text>

      {/* Tangent plane: flat, well clear of the surface (dashed) */}
      <line x1="60" y1={planeY(60)} x2="380" y2={planeY(380)} stroke="currentColor" strokeDasharray="10 5 2 5" className="text-primary" strokeWidth="2" />

      {/* Contact ticks: the plane touches the surface ONLY at the high points */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.4" fill="none">
        {highs.map(([hx, hy]) => (
          <g key={hx}>
            <line x1={hx} y1={hy} x2={hx} y2={planeY(hx)} strokeDasharray="3 3" />
            <circle cx={hx} cy={hy} r="3" className="fill-primary" stroke="none" />
          </g>
        ))}
      </g>

      {/* The actual surface: deliberately wavy between the high points */}
      <path
        d="M 70 160 L 90 166 L 110 148 L 130 168 L 150 162 L 170 172 L 190 158 L 210 146 L 220 138 L 240 158 L 260 168 L 280 156 L 300 166 L 320 154 L 340 146 L 360 162 L 370 156"
        className="text-foreground"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Part body under the surface */}
      <path
        d="M 70 160 L 90 166 L 110 148 L 130 168 L 150 162 L 170 172 L 190 158 L 210 146 L 220 138 L 240 158 L 260 168 L 280 156 L 300 166 L 320 154 L 340 146 L 360 162 L 370 156 L 370 246 L 70 246 Z"
        className="fill-background stroke-foreground"
        strokeWidth="1.4"
      />

      {/* Labels */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="396" y1="86" x2="330" y2={planeY(330)} />
        <line x1="396" y1="206" x2="262" y2="164" />
      </g>
      <circle cx="330" cy={planeY(330)} r="2" className="fill-muted-foreground" />
      <circle cx="262" cy="164" r="2" className="fill-muted-foreground" />
      <text x="400" y="82" textAnchor="end" fontSize="14" className="text-primary">
        tangent plane — touches only the high points
      </text>
      <text x="400" y="210" textAnchor="end" fontSize="14" className="text-foreground">
        actual surface — waviness unconstrained
      </text>
      <text x="220" y="284" textAnchor="middle" fontSize="13" className="text-foreground">
        {tolerance} applies to the contact plane, not the surface itself
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Public renderer + figure shell                                      */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Batch 5 — general dimensioning notation callouts                    */
/* ------------------------------------------------------------------ */

type DimensionCalloutVariant = Extract<GdntDiagram, { kind: "dimension-callout" }> ["variant"];

/**
 * General-dimensioning callouts drawn as the drawing shows them: the
 * dimension or size symbol exactly as written, beside the geometry it
 * governs. One renderer, eight variants — the dimension conventions share
 * the same leader/extension-line/arrowhead vocabulary, so they stay one
 * teaching figure type rather than eight unrelated pictures.
 */
function DimensionCalloutDiagram({ variant, value }: { variant: DimensionCalloutVariant; value: string }) {
  if (variant === "basic") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* Position frame for context: ⌖ | Ø0.5 | Ⓜ | A | B | C */}
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.5" fill="none">
          <rect x="40" y="22" width="28" height="24" />
          <rect x="68" y="22" width="44" height="24" />
          <rect x="112" y="22" width="28" height="24" />
          <rect x="140" y="22" width="24" height="24" />
          <rect x="164" y="22" width="24" height="24" />
          <rect x="188" y="22" width="24" height="24" />
        </g>
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.3" fill="none">
          <circle cx="54" cy="34" r="8" />
          <line x1="54" y1="24" x2="54" y2="44" />
          <line x1="44" y1="34" x2="64" y2="34" />
          <circle cx="126" cy="34" r="8.5" />
        </g>
        <text x="126" y="38" textAnchor="middle" fontSize="11" fontWeight="700" className="text-foreground">M</text>
        <text x="90" y="39" textAnchor="middle" fontSize="12" className="text-foreground">Ø0.5</text>
        <text x="152" y="39" textAnchor="middle" fontSize="12" className="text-foreground">A</text>
        <text x="176" y="39" textAnchor="middle" fontSize="12" className="text-foreground">B</text>
        <text x="200" y="39" textAnchor="middle" fontSize="12" className="text-foreground">C</text>
        {/* The basic dimension: boxed, spanning the two hole centers */}
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
          <line x1="150" y1="62" x2="150" y2="152" />
          <line x1="290" y1="62" x2="290" y2="152" />
        </g>
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.3" fill="none">
          <line x1="150" y1="78" x2="290" y2="78" />
        </g>
        <polygon points="150,78 159,74.5 159,81.5" fill="currentColor" className="text-foreground" />
        <polygon points="290,78 281,74.5 281,81.5" fill="currentColor" className="text-foreground" />
        <rect x="196" y="64" width="48" height="28" className="text-foreground" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <text x="220" y="83" textAnchor="middle" fontSize="14" className="text-foreground">{value}</text>
        {/* The plate with the two located holes */}
        <rect x="100" y="152" width="240" height="78" className="fill-background stroke-foreground" strokeWidth="2" />
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.8" fill="none">
          <circle cx="150" cy="191" r="11" />
          <circle cx="290" cy="191" r="11" />
        </g>
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
          <line x1="141" y1="191" x2="159" y2="191" />
          <line x1="150" y1="182" x2="150" y2="200" />
          <line x1="281" y1="191" x2="299" y2="191" />
          <line x1="290" y1="182" x2="290" y2="200" />
        </g>
      </svg>
    );
  }
  if (variant === "reference") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* Chain of three toleranced segments along the bar */}
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
          <line x1="100" y1="40" x2="100" y2="140" />
          <line x1="200" y1="40" x2="200" y2="140" />
          <line x1="300" y1="40" x2="300" y2="140" />
          <line x1="400" y1="40" x2="400" y2="140" />
        </g>
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.3" fill="none">
          <line x1="100" y1="56" x2="400" y2="56" />
        </g>
        <polygon points="100,56 109,52.5 109,59.5" fill="currentColor" className="text-foreground" />
        <polygon points="200,56 191,52.5 191,59.5" fill="currentColor" className="text-foreground" />
        <polygon points="200,56 209,52.5 209,59.5" fill="currentColor" className="text-foreground" />
        <polygon points="300,56 291,52.5 291,59.5" fill="currentColor" className="text-foreground" />
        <polygon points="300,56 309,52.5 309,59.5" fill="currentColor" className="text-foreground" />
        <polygon points="400,56 391,52.5 391,59.5" fill="currentColor" className="text-foreground" />
        <text x="150" y="49" textAnchor="middle" fontSize="13" className="text-foreground">25</text>
        <text x="250" y="49" textAnchor="middle" fontSize="13" className="text-foreground">40</text>
        <text x="350" y="49" textAnchor="middle" fontSize="13" className="text-foreground">35</text>
        {/* The overall dimension — parenthesized: reference only */}
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.3" fill="none">
          <line x1="100" y1="118" x2="400" y2="118" />
        </g>
        <polygon points="100,118 109,114.5 109,121.5" fill="currentColor" className="text-foreground" />
        <polygon points="400,118 391,114.5 391,121.5" fill="currentColor" className="text-foreground" />
        <text x="250" y="111" textAnchor="middle" fontSize="14" className="text-foreground">{value}</text>
        {/* The bar with its two segment divisions */}
        <rect x="100" y="150" width="300" height="70" className="fill-background stroke-foreground" strokeWidth="2" />
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.5" fill="none">
          <line x1="200" y1="150" x2="200" y2="220" />
          <line x1="300" y1="150" x2="300" y2="220" />
        </g>
      </svg>
    );
  }
  if (variant === "not-to-scale") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* A revised bracket: the arm's value was changed without redrawing */}
        <path d="M 70 230 L 70 110 L 200 110 L 200 150 L 330 150 L 330 230 Z" className="fill-background stroke-foreground" strokeWidth="2" />
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
          <line x1="70" y1="58" x2="70" y2="104" />
          <line x1="200" y1="58" x2="200" y2="104" />
        </g>
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.3" fill="none">
          <line x1="70" y1="92" x2="200" y2="92" />
        </g>
        <polygon points="70,92 79,88.5 79,95.5" fill="currentColor" className="text-foreground" />
        <polygon points="200,92 191,88.5 191,95.5" fill="currentColor" className="text-foreground" />
        <text x="135" y="72" textAnchor="middle" fontSize="15" fontWeight="600" className="text-foreground">{value}</text>
        {/* THE convention: the thick straight underline directly under the value */}
        <line x1="100" y1="77" x2="170" y2="77" stroke="currentColor" strokeWidth="2.6" className="text-foreground" />
        <text x="300" y="135" textAnchor="middle" fontSize="11" className="text-muted-foreground">
          drawn narrower than the stated {value}
        </text>
      </svg>
    );
  }
  if (variant === "diameter") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        <circle cx="150" cy="140" r="66" className="text-foreground" stroke="currentColor" strokeWidth="2" fill="none" />
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
          <line x1="84" y1="140" x2="216" y2="140" strokeDasharray="3 4" />
          <line x1="144" y1="140" x2="156" y2="140" />
          <line x1="150" y1="134" x2="150" y2="146" />
        </g>
        {/* Leader: arrowhead ON the circle, shelf carrying the value */}
        <line x1="196" y1="94" x2="252" y2="58" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <polygon points="196,94 208,91 204,84" fill="currentColor" className="text-foreground" />
        <line x1="252" y1="58" x2="330" y2="58" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <text x="258" y="52" fontSize="15" className="text-foreground">{value}</text>
        <text x="150" y="235" textAnchor="middle" fontSize="12" className="text-muted-foreground">
          the full width through the center
        </text>
      </svg>
    );
  }
  if (variant === "radius" || variant === "controlled-radius") {
    // Shared geometry: center (85,190), R=120, zone arcs at R±20, arc
    // spanning 15°–75°. CR adds the crossed reversal contour.
    const isCR = variant === "controlled-radius";
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* Zone arcs (dashed) — the band the contour must stay inside */}
        <g className="text-primary" stroke="currentColor" strokeWidth="1.6" fill="none">
          <path d="M 181.6 164.1 A 100 100 0 0 0 110.9 93.4" strokeDasharray="7 5" />
          <path d="M 220.2 153.8 A 140 140 0 0 0 121.2 54.8" strokeDasharray="7 5" />
        </g>
        {/* The nominal radius arc */}
        <path d="M 200.9 158.9 A 120 120 0 0 0 116.1 74.1" stroke="currentColor" strokeWidth="2.2" fill="none" className="text-foreground" />
        {/* Center mark */}
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
          <line x1="77" y1="190" x2="93" y2="190" />
          <line x1="85" y1="182" x2="85" y2="198" />
        </g>
        {/* Radius leader: straight from the center, one arrowhead on the arc */}
        <line x1="85" y1="190" x2="176.9" y2="112.9" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <polygon points="176.9,112.9 168.6,120.6 175.2,124.9" fill="currentColor" className="text-foreground" />
        <line x1="176.9" y1="112.9" x2="250" y2="112.9" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <text x="256" y="118" fontSize="15" className="text-foreground">{value}</text>
        {/* CR only: a contour that fits the zone yet reverses — not allowed */}
        {isCR && (
          <>
            <path
              d="M 191 161 C 185 135, 165 120, 150 118 C 135 116, 128 100, 122 88"
              stroke="currentColor" strokeWidth="1.4" fill="none" className="text-muted-foreground"
            />
            <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.8" fill="none">
              <line x1="145" y1="113" x2="155" y2="123" />
              <line x1="145" y1="123" x2="155" y2="113" />
            </g>
            <text x="255" y="150" fontSize="11" className="text-muted-foreground">
              reversals — not allowed
            </text>
          </>
        )}
      </svg>
    );
  }
  if (variant === "square") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        <rect x="140" y="75" width="110" height="110" className="fill-background stroke-foreground" strokeWidth="2" />
        {/* Leader to one side; one callout governs all four */}
        <line x1="250" y1="130" x2="290" y2="95" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <polygon points="250,130 262,129 257,121" fill="currentColor" className="text-foreground" />
        <line x1="290" y1="95" x2="350" y2="95" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <text x="296" y="89" fontSize="15" className="text-foreground">{value}</text>
        {/* Equal-side ticks: the value applies at every side */}
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
          <line x1="195" y1="69" x2="195" y2="81" />
          <line x1="134" y1="130" x2="146" y2="130" />
          <line x1="195" y1="179" x2="195" y2="191" />
          <line x1="244" y1="130" x2="256" y2="130" />
        </g>
        <text x="195" y="225" textAnchor="middle" fontSize="12" className="text-muted-foreground">
          the value and its tolerance apply to every side
        </text>
      </svg>
    );
  }
  if (variant === "depth") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* Part in section, blind hole with drill point */}
        <rect x="110" y="95" width="220" height="110" className="fill-background stroke-foreground" strokeWidth="2" />
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.8" fill="none">
          <line x1="185" y1="95" x2="185" y2="185" />
          <line x1="215" y1="95" x2="215" y2="185" />
          <path d="M 185 185 L 200 203 L 215 185" />
        </g>
        {/* Depth dimension: full-diameter depth from the outer surface */}
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
          <line x1="320" y1="95" x2="350" y2="95" />
          <line x1="320" y1="185" x2="350" y2="185" />
        </g>
        <line x1="336" y1="95" x2="336" y2="185" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <polygon points="336,95 332.5,104 339.5,104" fill="currentColor" className="text-foreground" />
        <polygon points="336,185 332.5,176 339.5,176" fill="currentColor" className="text-foreground" />
        {/* Callout leader */}
        <line x1="215" y1="102" x2="255" y2="60" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <line x1="255" y1="60" x2="345" y2="60" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <text x="261" y="54" fontSize="14" className="text-foreground">{value}</text>
        <text x="220" y="244" textAnchor="middle" fontSize="11" className="text-muted-foreground">
          depth of the full diameter, from the outer surface
        </text>
      </svg>
    );
  }
  if (variant === "counterbore") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* Part in section: counterbore over a through hole */}
        <rect x="110" y="75" width="220" height="130" className="fill-background stroke-foreground" strokeWidth="2" />
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.8" fill="none">
          <line x1="170" y1="75" x2="170" y2="115" />
          <line x1="250" y1="75" x2="250" y2="115" />
          <line x1="170" y1="115" x2="250" y2="115" />
          <line x1="185" y1="75" x2="185" y2="205" />
          <line x1="215" y1="75" x2="215" y2="205" />
        </g>
        {/* Callout leader */}
        <line x1="250" y1="95" x2="285" y2="52" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <line x1="285" y1="52" x2="375" y2="52" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <text x="291" y="46" fontSize="14" className="text-foreground">{value}</text>
        <text x="220" y="244" textAnchor="middle" fontSize="11" className="text-muted-foreground">
          flat-bottomed recess, coaxial with the through hole
        </text>
      </svg>
    );
  }
  if (variant === "spotface") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* Part with a rough curved top face */}
        <path d="M 110 105 Q 220 75 330 105 L 330 205 L 110 205 Z" className="fill-background stroke-foreground" strokeWidth="2" />
        {/* The spotface seat, cut flat; the removed skin dashed above it */}
        <line x1="170" y1="90" x2="250" y2="90" stroke="currentColor" strokeWidth="2" className="text-foreground" />
        <path d="M 170 90 Q 220 66 250 90" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="3 4" className="text-muted-foreground" />
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.8" fill="none">
          <line x1="185" y1="90" x2="185" y2="205" />
          <line x1="215" y1="90" x2="215" y2="205" />
        </g>
        {/* Callout leader */}
        <line x1="250" y1="88" x2="283" y2="48" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <line x1="283" y1="48" x2="370" y2="48" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <text x="289" y="42" fontSize="14" className="text-foreground">{value}</text>
        <text x="220" y="244" textAnchor="middle" fontSize="11" className="text-muted-foreground">
          minimum depth necessary to clean up the surface
        </text>
      </svg>
    );
  }
  if (variant === "countersink") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* Part in section: conical entry over a through hole */}
        <rect x="110" y="75" width="220" height="130" className="fill-background stroke-foreground" strokeWidth="2" />
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.8" fill="none">
          <line x1="175" y1="75" x2="185" y2="105" />
          <line x1="225" y1="75" x2="215" y2="105" />
          <line x1="185" y1="105" x2="185" y2="205" />
          <line x1="215" y1="105" x2="215" y2="205" />
        </g>
        {/* Callout leader */}
        <line x1="225" y1="80" x2="258" y2="46" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <line x1="258" y1="46" x2="372" y2="46" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <text x="264" y="40" fontSize="14" className="text-foreground">{value}</text>
        {/* Included-angle label */}
        <line x1="250" y1="98" x2="230" y2="90" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
        <text x="254" y="102" fontSize="11" className="text-muted-foreground">included angle</text>
        <text x="220" y="244" textAnchor="middle" fontSize="11" className="text-muted-foreground">
          diameter and included angle together define the cone
        </text>
      </svg>
    );
  }
  if (variant === "conical-taper") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* Conical surface in side view */}
        <path d="M 180 70 L 200 70 L 245 195 L 155 195 Z" className="fill-background stroke-foreground" strokeWidth="2" />
        <line x1="200" y1="58" x2="200" y2="207" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" className="text-muted-foreground" />
        {/* L: the axial distance between the two measuring sections */}
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
          <line x1="204" y1="70" x2="280" y2="70" />
          <line x1="249" y1="195" x2="280" y2="195" />
        </g>
        <line x1="272" y1="70" x2="272" y2="195" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <polygon points="272,70 268.5,79 275.5,79" fill="currentColor" className="text-foreground" />
        <polygon points="272,195 268.5,186 275.5,186" fill="currentColor" className="text-foreground" />
        <text x="264" y="136" textAnchor="end" fontSize="12" className="text-muted-foreground">L</text>
        <text x="200" y="215" textAnchor="middle" fontSize="12" className="text-muted-foreground">D</text>
        <text x="190" y="62" textAnchor="middle" fontSize="12" className="text-muted-foreground">d</text>
        {/* Callout leader from the conical surface */}
        <line x1="166" y1="132" x2="150" y2="42" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <line x1="150" y1="42" x2="240" y2="42" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <text x="156" y="36" fontSize="14" className="text-foreground">{value}</text>
        <text x="220" y="248" textAnchor="middle" fontSize="12" className="text-muted-foreground">
          taper = (D − d) / L
        </text>
      </svg>
    );
  }
  if (variant === "slope") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* Flat taper (wedge) with its baseline */}
        <path d="M 130 190 L 310 190 L 310 130 Z" className="fill-background stroke-foreground" strokeWidth="2" />
        <line x1="100" y1="190" x2="340" y2="190" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
        {/* H: height of the tall end above the baseline */}
        <line x1="310" y1="130" x2="350" y2="130" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
        <line x1="342" y1="130" x2="342" y2="190" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <polygon points="342,130 338.5,139 345.5,139" fill="currentColor" className="text-foreground" />
        <polygon points="342,190 338.5,181 345.5,181" fill="currentColor" className="text-foreground" />
        <text x="334" y="163" textAnchor="end" fontSize="12" className="text-muted-foreground">H</text>
        {/* L: baseline distance between the height stations */}
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
          <line x1="130" y1="190" x2="130" y2="225" />
          <line x1="310" y1="190" x2="310" y2="225" />
        </g>
        <line x1="130" y1="218" x2="310" y2="218" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <polygon points="130,218 139,214.5 139,221.5" fill="currentColor" className="text-foreground" />
        <polygon points="310,218 301,214.5 301,221.5" fill="currentColor" className="text-foreground" />
        <text x="220" y="210" textAnchor="middle" fontSize="12" className="text-muted-foreground">L</text>
        {/* Callout leader from the inclined face */}
        <line x1="220" y1="160" x2="165" y2="52" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <line x1="165" y1="52" x2="255" y2="52" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <text x="171" y="46" fontSize="14" className="text-foreground">{value}</text>
        <text x="220" y="252" textAnchor="middle" fontSize="12" className="text-muted-foreground">
          slope = (H − h) / L
        </text>
      </svg>
    );
  }
  if (variant === "arc-length") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* The curved outline */}
        <path d="M 120 180 A 90 90 0 0 1 300 180" stroke="currentColor" strokeWidth="2" fill="none" className="text-foreground" />
        {/* Center and radius construction */}
        <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.2" fill="none">
          <line x1="202" y1="180" x2="218" y2="180" />
          <line x1="210" y1="172" x2="210" y2="188" />
          <line x1="210" y1="180" x2="210" y2="90" />
        </g>
        {/* The chord an ordinary dimension would report */}
        <line x1="120" y1="180" x2="300" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-muted-foreground" />
        <text x="210" y="197" textAnchor="middle" fontSize="11" className="text-muted-foreground">
          chord — the straight distance
        </text>
        {/* Arc-length dimension: measured along the curve, inside the outline */}
        <path d="M 143 180 A 67 67 0 0 1 277 180" stroke="currentColor" strokeWidth="1.3" fill="none" className="text-foreground" />
        <polygon points="143,180 153,176 151,184" fill="currentColor" className="text-foreground" />
        <polygon points="277,180 267,176 269,184" fill="currentColor" className="text-foreground" />
        {/* Value sits inside the arc, right of the center line, clear of both */}
        <text x="238" y="142" textAnchor="middle" fontSize="14" className="text-foreground">{value}</text>
        <path d="M 229 132 Q 238 125 247 132" stroke="currentColor" strokeWidth="1.4" fill="none" className="text-foreground" />
        <text x="210" y="244" textAnchor="middle" fontSize="11" className="text-muted-foreground">
          arc length — along the curve
        </text>
      </svg>
    );
  }
  if (variant === "parting-line") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* The molded part */}
        <rect x="120" y="80" width="200" height="120" rx="14" className="fill-background stroke-foreground" strokeWidth="2" />
        {/* The parting line: a phantom line extending beyond the part */}
        <line x1="95" y1="140" x2="345" y2="140" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 4 3 4" className="text-foreground" />
        {/* The diamond-shaped parting line symbol, on the line */}
        <polygon points="220,131 229,140 220,149 211,140" stroke="currentColor" strokeWidth="1.6" fill="none" className="text-foreground" />
        {/* Mold-opening direction arrows */}
        <line x1="95" y1="140" x2="66" y2="140" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <polygon points="62,140 72,136 72,144" fill="currentColor" className="text-foreground" />
        <line x1="345" y1="140" x2="374" y2="140" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <polygon points="378,140 368,136 368,144" fill="currentColor" className="text-foreground" />
        <text x="350" y="130" fontSize="12" className="text-foreground">PL</text>
        <text x="220" y="64" textAnchor="middle" fontSize="11" className="text-muted-foreground">
          cavity half (upper tool)
        </text>
        <text x="220" y="228" textAnchor="middle" fontSize="11" className="text-muted-foreground">
          core half (lower tool)
        </text>
        <text x="220" y="250" textAnchor="middle" fontSize="11" className="text-muted-foreground">
          flash and the witness mark land on this trace
        </text>
      </svg>
    );
  }
  if (variant === "multiple-identical-features") {
    return (
      <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
        {/* Plate with six identical holes */}
        <rect x="100" y="70" width="240" height="140" className="fill-background stroke-foreground" strokeWidth="2" />
        <g className="text-foreground" stroke="currentColor" strokeWidth="1.8" fill="none">
          <circle cx="140" cy="110" r="10" />
          <circle cx="220" cy="110" r="10" />
          <circle cx="300" cy="110" r="10" />
          <circle cx="140" cy="170" r="10" />
          <circle cx="220" cy="170" r="10" />
          <circle cx="300" cy="170" r="10" />
        </g>
        {/* One callout, prefixed nX, leadered to the pattern */}
        <line x1="307" y1="103" x2="332" y2="55" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <line x1="332" y1="55" x2="400" y2="55" stroke="currentColor" strokeWidth="1.3" className="text-foreground" />
        <text x="338" y="49" fontSize="14" className="text-foreground">{value}</text>
        <text x="220" y="242" textAnchor="middle" fontSize="11" className="text-muted-foreground">
          one callout, six features, one tolerance authority
        </text>
      </svg>
    );
  }
  // variant === "origin"
  return (
    <svg viewBox="0 0 440 260" role="img" aria-label={ARIA_LABELS["dimension-callout"]} className="h-auto w-full">
      {/* The part: bottom face is the origin face */}
      <rect x="120" y="80" width="200" height="120" className="fill-background stroke-foreground" strokeWidth="2" />
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="120" y1="200" x2="80" y2="200" />
        <line x1="120" y1="80" x2="80" y2="80" />
      </g>
      {/* Dimension line: origin circle at the bottom end, arrow at the top */}
      <g className="text-foreground" stroke="currentColor" strokeWidth="1.4" fill="none">
        <line x1="90" y1="80" x2="90" y2="200" />
        <circle cx="90" cy="200" r="7" strokeWidth="1.6" />
      </g>
      <polygon points="90,80 86.5,89 93.5,89" fill="currentColor" className="text-foreground" />
      <text x="72" y="144" textAnchor="end" fontSize="14" className="text-foreground">{value}</text>
      {/* Origin-face annotation */}
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="220" y1="204" x2="220" y2="218" />
      </g>
      <text x="220" y="232" textAnchor="middle" fontSize="11" className="text-muted-foreground">
        measurement starts from this face
      </text>
    </svg>
  );
}

function DiagramBody({ diagram }: { diagram: GdntDiagram }) {
  switch (diagram.kind) {
    case "position-zone":
      return <PositionZoneDiagram tolerance={diagram.tolerance} offset={diagram.offset} basicX={diagram.basicX} basicY={diagram.basicY} />;
    case "fcf":
      return <FcfDiagram compartments={diagram.compartments} />;
    case "bonus":
      return (
        <BonusToleranceDiagram
          tolerance={diagram.tolerance}
          mmcSize={diagram.mmcSize}
          actualSize={diagram.actualSize}
          zoneSize={diagram.zoneSize}
          feature={diagram.feature}
          mode={diagram.mode}
        />
      );
    case "straightness-line":
      return <StraightnessLineDiagram tolerance={diagram.tolerance} />;
    case "straightness-axis":
      return <StraightnessAxisDiagram tolerance={diagram.tolerance} />;
    case "flatness":
      return <FlatnessDiagram tolerance={diagram.tolerance} />;
    case "circularity":
      return <CircularityDiagram tolerance={diagram.tolerance} />;
    case "cylindricity":
      return <CylindricityDiagram tolerance={diagram.tolerance} />;
    case "profile-line":
      return diagram.mode === "unequal" ? (
        <ProfileUnequalDiagram tolerance={diagram.tolerance} outside={diagram.outside} variant="line" />
      ) : (
        <ProfileLineDiagram tolerance={diagram.tolerance} />
      );
    case "profile-surface":
      return diagram.mode === "unequal" ? (
        <ProfileUnequalDiagram tolerance={diagram.tolerance} outside={diagram.outside} variant="surface" />
      ) : (
        <ProfileSurfaceDiagram tolerance={diagram.tolerance} />);
    case "continuous-feature":
      return <ContinuousFeatureDiagram variant={diagram.variant} tolerance={diagram.tolerance} />;
    case "free-state":
      return <FreeStateDiagram />;
    case "tangent-plane":
      return <TangentPlaneDiagram tolerance={diagram.tolerance} datum={diagram.datum} />;
    case "fcf-pair":
      return <FcfPairDiagram without={diagram.without} with={diagram.with} />;
    case "orientation-zone":
      return <OrientationZoneDiagram angle={diagram.angle} tolerance={diagram.tolerance} datum={diagram.datum} />;
    case "median-points":
      return <MedianPointsDiagram variant={diagram.variant} tolerance={diagram.tolerance} datum={diagram.datum} />;
    case "runout":
      return <RunoutDiagram variant={diagram.variant} tolerance={diagram.tolerance} datum={diagram.datum} />;
    case "datum-feature":
      return <DatumFeatureDiagram label={diagram.label} />;
    case "datum-target":
      return <DatumTargetDiagram label={diagram.label} />;
    case "envelope":
      return <EnvelopeDiagram variant={diagram.variant} />;
    case "projected-zone":
      return <ProjectedZoneDiagram tolerance={diagram.tolerance} height={diagram.height} datum={diagram.datum} />;
    case "dimension-callout":
      return <DimensionCalloutDiagram variant={diagram.variant} value={diagram.value} />;
  }
}

function DiagramCaption({ diagram }: { diagram: GdntDiagram }) {
  switch (diagram.kind) {
    case "position-zone":
      return (
        <>
          Cross-section through the {diagram.tolerance} tolerance zone (dashed), centered on true
          position and located by the basic dimensions from datums A and B. The solid circle is the
          feature itself — its actual axis sits {diagram.offset} from true position, inside the zone,
          so the feature passes. Schematic, not to scale.
        </>
      );
    case "fcf":
      return (
        <>
          {diagram.note ??
            "The feature control frame, compartment by compartment. The material-condition modifier (compartment 3) is what grants bonus tolerance; datums A, B and C define the reference frame the zone is located from."}
        </>
      );
    case "bonus": {
      const departure = Math.abs(num(diagram.actualSize) - num(diagram.mmcSize));
      const atMmc = (diagram.mode ?? "mmc") === "mmc";
      const mc = atMmc ? "MMC" : "LMC";
      const direction =
        diagram.feature === "pin"
          ? atMmc
            ? "under MMC — a pin departs from its largest size by getting smaller"
            : "over LMC — a pin departs from its smallest size by getting larger"
          : atMmc
            ? "over MMC — a hole departs from its smallest size by getting larger"
            : "under LMC — a hole departs from its largest size by getting smaller";
      return (
        <>
          Schematic example: the feature at {mc} ({diagram.mmcSize}) carries the {diagram.tolerance}{" "}
          zone. Produced at {diagram.actualSize} — {Number(departure.toFixed(3))} {direction} — the zone
          grows by exactly that bonus, to {diagram.zoneSize}. Feature and zone are not drawn to the
          same scale.
        </>
      );
    }
    case "straightness-line":
      return (
        <>
          Side view of one surface line element: the zone is two parallel lines {diagram.tolerance}{" "}
          apart, and the actual element must lie between them. Every element along the surface is
          checked the same way, one section at a time — surface straightness says nothing about how
          the elements relate to each other. Schematic, exaggerated.
        </>
      );
    case "straightness-axis":
      return (
        <>
          Side view of a shaft: the axis-straightness zone is a cylinder of diameter {diagram.tolerance}{" "}
          around the nominal axis, and the entire derived median line — the line through the centers of
          the shaft's cross-sections — must lie inside it. The dashed circle at the right end is that
          cylinder in section, with the median line's actual point offset inside it. Schematic,
          exaggerated.
        </>
      );
    case "flatness":
      return (
        <>
          Cross-section through a plate: the zone is two parallel planes {diagram.tolerance} apart, and
          the entire surface — every point, over the full area — must lie between them in one
          simultaneous evaluation. Unlike surface straightness, there is no per-section pass or fail.
          Schematic, exaggerated.
        </>
      );
    case "circularity":
      return (
        <>
          A section taken perpendicular to the axis: the zone is two concentric circles whose radial
          separation is {diagram.tolerance}, and the profile of this one section must fall between
          them. The next section is evaluated independently — taper or bow along the length is
          outside circularity's control. Schematic, exaggerated.
        </>
      );
    case "cylindricity":
      return (
        <>
          Side view of a cylindrical surface: the zone is two coaxial cylinders whose radial
          separation is {diagram.tolerance}, and every point of the surface must lie between them in
          a single evaluation. Roundness, straightness and taper are all inside this one envelope.
          Compare circularity, which checks one slice at a time. Schematic, exaggerated.
        </>
      );
    case "profile-line":
      return diagram.mode === "unequal" ? (
        <>
          The Ⓤ disposition callout — `⌒ {diagram.tolerance} Ⓤ {diagram.outside}`: the zone stays
          {diagram.tolerance} wide but is shifted so {diagram.outside} of it lies outside the
          material and {Number((num(diagram.tolerance) - num(diagram.outside ?? "0")).toFixed(3))}
          inside. The value after Ⓤ is always the portion outside, never inside. Schematic,
          exaggerated.
        </>
      ) : (
        <>
          One cross-section through a part with a curved face: the zone is bounded by two curves
          offset from the true (basic) profile, {diagram.tolerance} apart, and the actual profile of
          this section must fall between them. The next section is evaluated independently.
          Schematic, exaggerated.
        </>
      );
    case "profile-surface":
      return diagram.mode === "unequal" ? (
        <>
          The same Ⓤ disposition on a surface profile: `⌓ {diagram.tolerance} Ⓤ {diagram.outside}`
          shifts the offset-surface zone so {diagram.outside} lies outside the material. The classic
          use is guaranteeing machining stock: every point of the rough surface carries material
          the finish pass can remove. Schematic, exaggerated.
        </>
      ) : (
        <>
          A freeform surface in isometric wireframe: the zone is the space between two surfaces
          offset {diagram.tolerance} on either side of the true (basic) surface, and the entire
          actual surface must fit between the envelopes in one evaluation. Schematic, exaggerated.
        </>
      );
    case "continuous-feature":
      return diagram.variant === "boss" ? (
        <>
          The interrupted feature of size: one `{diagram.tolerance} CF` dimension spans all three
          segments of the boss, so Rule #1 and any geometric controls treat them as a single
          continuous feature — the grooves do not reset form or location between segments. The
          symbol is the letters CF in an irregular hexagon; the note CONTINUOUS FEATURE is the
          text equivalent. Without CF, each segment would be its own feature of size, free to
          tip and bow independently within its limits. Schematic, exaggerated.
        </>
      ) : (
        <>
          The 2018 extension to surfaces: flatness frames over two faces separated by a slot,
          each carrying the CF symbol, so both faces are evaluated as one continuous surface —
          the flatness zone must hold across the gap as if the slot were not there. Before
          Y14.5-2018 this needed a profile-with-nX workaround. Schematic, exaggerated.
        </>
      );
    case "free-state":
      return (
        <>
          Left: the part in its free state — no forces applied beyond gravity, drawn in its
          natural deflected shape; a tolerance carrying Ⓕ is verified in this state. Right: the
          same part restrained to datum simulators per a restrained-condition note — forced
          toward the shape it assumes mounted in service. The note is text (there is no
          standardized restrained symbol); Ⓕ exists to opt individual tolerances back out of a
          drawing-wide restrained requirement. Schematic, exaggerated.
        </>
      );
    case "tangent-plane":
      return (
        <>
          The Ⓣ modifier: the tolerance applies to the tangent plane — the theoretical flat plane
          contacting the surface's high points (dashed, contact ticks marked) — not to the actual
          surface itself. The mating part only ever touches the high points, so local waviness
          between them is unconstrained as long as the contact plane stays within {diagram.tolerance}
          {" "}
          of perfect orientation to datum {diagram.datum ?? "A"}. Schematic, exaggerated.
        </>
      );
    case "fcf-pair":
      return (
        <>
          {diagram.note ??
            "The same control specified two ways. Without datum references the profile zone is free to float — the control limits form only. With datum references the zone is anchored to the datum reference frame, so orientation and location are controlled as well."}
        </>
      );
    case "orientation-zone": {
      const angleWord = diagram.angle === 0 ? "parallel to" : diagram.angle === 90 ? "perpendicular to" : `at ${diagram.angle}° basic to`;
      return (
        <>
          Side view of a surface {angleWord} datum {diagram.datum ?? "A"}: the zone is two parallel
          planes {diagram.tolerance} apart, held at that exact angle to the datum surface, and the
          entire actual surface must lie between them. The planes are oriented by the datum — they
          are not free to float the way a Form-control zone is. Schematic, exaggerated.
        </>
      );
    }
    case "median-points":
      return diagram.variant === "concentricity" ? (
        <>
          Cross-section through a bore in a part whose outer cylinder establishes datum axis {diagram.datum ?? "A"}:
          the zone is a {diagram.tolerance} circle centered on that axis, and what must fall inside it is
          the set of midpoints of diametrically opposed point pairs on the bore — not the bore's surface.
          The surface itself can wander well outside the zone as long as its median points stay inside,
          which is exactly why these controls do not limit the surface the way position or runout do.
          Schematic, exaggerated.
        </>
      ) : (
        <>
          Side section of a feature about datum center plane {diagram.datum ?? "A"}: the zone is two
          parallel planes {diagram.tolerance} apart, centered on that plane, and what must fall between
          them is the midpoints of opposed surface point pairs — not the surfaces themselves. Schematic,
          exaggerated.
        </>
      );
    case "runout":
      return diagram.variant === "circular" ? (
        <>
          The runout inspection setup: the part rotates 360° about datum axis {diagram.datum ?? "A"} while a
          dial indicator rests on the controlled surface at one fixed section. The full indicator
          movement (FIM) over one revolution must not exceed {diagram.tolerance}. Each section is checked
          separately — move the indicator, spin again. Schematic.
        </>
      ) : (
        <>
          The total-runout setup adds a traverse: the part rotates about datum axis {diagram.datum ?? "A"} while the indicator both reads the surface and moves along it, so the entire surface is
          evaluated in one pass against {diagram.tolerance}. Schematic.
        </>
      );
    case "datum-feature":
      return (
        <>
          A datum feature is the actual physical surface the callout references — here the wavy top
          face, labeled {diagram.label ?? "A"}. The datum itself is the perfect theoretical plane
          (dashed) derived from that surface, in this schematic established by the high points the
          way a surface plate would simulate it. The datum feature is real; the datum is an idea.
          Schematic, exaggerated.
        </>
      );
    case "datum-target":
      return (
        <>
          Three datum target points ({diagram.label ?? "A"}1–{diagram.label ?? "A"}3) on a rough surface too
          irregular to reference in full. Each target is a specific point the datum simulator contacts,
          and the three points together establish datum plane {diagram.label ?? "A"}. Targets come as
          points, lines, or small areas; each carries the datum letter plus a number inside the target
          symbol. Schematic, exaggerated.
        </>
      );
    case "envelope":
      return (
        <>
          {diagram.note ??
            (diagram.variant === "rule1"
              ? "The dashed boundary is the envelope of perfect form at MMC — Rule #1's requirement. The actual shaft may depart from perfect form, but never outside the envelope, and the allowed form error grows exactly as the size departs from MMC toward LMC. Schematic, exaggerated."
              : "With independency the envelope is removed: the actual shaft's form error may exceed the MMC boundary while its size stays within limits — size and form are checked as independent requirements. Schematic, exaggerated.")}
        </>
      );
    case "projected-zone":
      return (
        <>
          The dashed rectangle is the projected tolerance zone: the position zone extended{" "}
          {diagram.height} above the surface of the threaded hole. The fastener that threads in must
          lie within the zone over that whole height — not just at the surface — which is what
          actually controls clearance into the mating part. The frame reads `⌖ {diagram.tolerance} Ⓟ{" "}
          {diagram.height} {diagram.datum ?? "A"} B C` with the Ⓟ and the height in the tolerance
          compartment. Schematic, exaggerated.
        </>
      );
    case "dimension-callout": {
      const byVariant: Record<Extract<GdntDiagram, { kind: "dimension-callout" }> ["variant"], string> = {
        basic:
          "The boxed 50 is a basic dimension: theoretically exact, carrying no tolerance of its own — the ⌖ ⌀0.5 Ⓜ A B C frame above it supplies all allowable variation for the hole positions it locates. The box is exactness, not emphasis.",
        reference:
          "The parenthesized (100) is a reference dimension: the three toleranced chain segments (25, 40, 35) already govern the overall length, so the (100) only informs. It is never inspected, and appending a tolerance to it would re-govern what is already governed.",
        "not-to-scale":
          "The thick straight underline beneath the value is the not-to-scale convention: the arm was re-valued without redrawing, so the geometry no longer matches the stated dimension. The value governs; measure nothing off the print. The underline changes no tolerance.",
        diameter:
          "⌀ precedes every diameter value — here as a leadered size dimension on the full contour through the center. Inside a feature control frame the same rule decides the zone shape: ⌖ ⌀0.5 A is a cylindrical zone, ⌖ 0.5 A two parallel planes.",
        radius:
          "The radius leader is drawn from the actual center with one arrowhead on the arc — the leader itself points out the center. The tolerance creates a band between two concentric arcs (dashed) about the same center; the entire contour must lie between them.",
        "controlled-radius":
          "CR keeps R's two-arc tolerance zone and adds one requirement: the surface must be a fair curve. The gray contour fits inside the zone yet reverses back and forth — legal under plain R, not allowed under CR. ASME-only; ISO reaches the same result with profile of a surface.",
        square:
          "□ before the value applies it — with one shared tolerance — to all four sides of the feature. Two identical ± dimensions would not be equivalent: each side could vary independently, legally producing a rhombus. □ says one size value, four sides.",
        origin:
          "The small circle replaces one arrowhead: the dimension originates from the face the circle sits on, and the high points of that face define the measurement's start plane. It fixes the reading order of the one dimension it touches — heavier than nothing, lighter than a datum feature.",
        depth:
          "↧ precedes the depth value with no space: the dimension applies to the depth of the feature — the full-diameter depth measured from the outer surface. The drill point's cone below it is not part of the value; where the depth would not be clear, as from a curved surface, it is dimensioned with dimension and extension lines instead.",
        counterbore:
          "⌴ precedes, with no space, the counterbore's diameter — here ⌴⌀15 ↧8 over a ⌀8 THRU hole. The enlargement is flat-bottomed to seat the fastener's head or washer; where the remaining material thickness matters more than the depth, that thickness is dimensioned instead, and the counterbore-to-hole relationship is specified by a positional tolerance.",
        spotface:
          "The spotface is the minimum-depth flat seat: where no depth is specified, it is cut just deep enough to clean the surface up to the specified diameter. The standard's own example writes the symbol with the letters SF shown alongside — the same glyph as counterbore, distinguished by intent. Its diameter is the distance across the flat and excludes any edge fillet.",
        countersink:
          "⌵ precedes the diameter and the included angle — the pair that fully defines the cone a flat-head fastener seats against. Alternate methods (a gage diameter, or a depth with other parameters) are permitted, and on a curved surface the specified diameter applies at the minor diameter, where the true cone meets the true hole.",
        "conical-taper":
          "The closed right triangle precedes the taper ratio — the difference in two section diameters divided by the distance between them, (D − d)/L. Standard machine tapers are named by series instead; the symbol itself is always drawn with the vertical leg to the left, whatever direction the cone runs.",
        slope:
          "The open right triangle precedes the slope ratio for a flat surface — the height difference between the ends divided by their separation, (H − h)/L. A flat taper is specified by a toleranced slope and a toleranced height at one end; the value is commonly basic, with a profile or angularity control governing the surface.",
        "arc-length":
          "The small arc over the value states the dimension is measured along the curve — the surface nearest the dimension — not the straight chord (dashed) an ordinary linear dimension would report. On a 90° arc of radius 50 the two differ by nearly 8: the chord is 70.7, the arc 78.5.",
        "parting-line":
          "The parting line is drawn as a phantom line extending beyond the part, marked with the diamond-shaped parting line symbol — the Y14.8 convention for casting, forging and molded-part drawings. Everything above the line is one tool half, everything below the other; flash and the witness mark land on this trace. Unmarked, the split location is the manufacturer's choice.",
        "multiple-identical-features":
          "6X before the callout states the number of places it governs: no space between the count and the X, one space after it. The notation multiplies the entire callout — size, tolerance and any geometric control — across six identical features. With basic dimensions the X may sit inside or outside the frame; and between coordinate dimensions the same letter means by (40 X 30), surrounded by single spaces.",
      };
      return <>{byVariant[diagram.variant]}</>;
    }
  }
}

/**
 * Render any GdntDiagram inside the standard figure shell. Used by the
 * /cad/gdt/[symbol] page template — every guide section may carry one
 * `diagram`, so future symbols get the same visual treatment for free.
 */
export function GdntDiagram({ diagram }: { diagram: GdntDiagram }) {
  return (
    <figure className="mt-5 rounded-xl border border-border bg-card/40 p-4 sm:p-5">
      <div className="mx-auto w-full max-w-lg">
        <DiagramBody diagram={diagram} />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">
        <DiagramCaption diagram={diagram} />
      </figcaption>
    </figure>
  );
}