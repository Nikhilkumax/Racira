import React, { Fragment } from "react";
import type { GdntDiagram } from "./gdnt-diagrams";

/**
 * Shared GD&T symbol data + pictograms, used by BOTH the Measurement-domain
 * "GD&T Symbol Reference" and the Standards-domain "GD&T Symbol Reference
 * (Standards)" tools, and by the /cad/gdt symbol-library pages (server
 * components) and the CAD sitemap source. Deliberately a plain shared module
 * (no "use client"): it holds only pure JSX + data, so it compiles into
 * whichever context imports it — client tools bundle it, server routes read
 * GDNT_SYMBOLS directly. Symbols are simplified reference pictograms (not
 * scale drawings) consistent with ASME Y14.5 / ISO 1101 presentation.
 */

const stroke = { stroke: "currentColor", strokeWidth: 1.6, fill: "none", strokeLinecap: "round" as const };

function Glyph({ kind, className = "text-foreground" }: { kind: string; className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" className={className}>
      <g {...stroke}>
        {kind === "straightness" && <line x1="4" y1="13" x2="22" y2="13" />}
        {kind === "flatness" && (
          <>
            <line x1="4" y1="9" x2="22" y2="9" />
            <line x1="4" y1="17" x2="22" y2="17" />
          </>
        )}
        {kind === "circularity" && <circle cx="13" cy="13" r="8" />}
        {kind === "cylindricity" && (
          <>
            <circle cx="13" cy="13" r="8" />
            <circle cx="17" cy="13" r="8" />
          </>
        )}
        {kind === "profile-line" && (
          <path d="M4 16 Q 10 9, 14 14 T 22 10" />
        )}
        {kind === "profile-surface" && (
          <>
            <path d="M4 15 Q 10 8, 14 13 T 22 9" />
            <path d="M4 19 Q 10 12, 14 17 T 22 13" />
          </>
        )}
        {kind === "angularity" && <path d="M5 19 L 16 7 M 5 19 L 21 19 M 10 13 L 13 10" />}
        {kind === "perpendicularity" && <path d="M13 5 L13 21 M 5 21 L 21 21" />}
        {kind === "parallelism" && (
          <>
            <path d="M6 7 L 14 19" />
            <path d="M13 7 L 21 19" />
          </>
        )}
        {kind === "position" && (
          <>
            <circle cx="13" cy="13" r="7.5" />
            <line x1="13" y1="2" x2="13" y2="24" />
            <line x1="2" y1="13" x2="24" y2="13" />
          </>
        )}
        {kind === "concentricity" && (
          <>
            <circle cx="13" cy="13" r="5" />
            <circle cx="13" cy="13" r="9" />
          </>
        )}
        {kind === "symmetry" && (
          <>
            <line x1="13" y1="3" x2="13" y2="23" strokeDasharray="2 2" />
            <line x1="5" y1="7" x2="5" y2="19" />
            <line x1="21" y1="7" x2="21" y2="19" />
          </>
        )}
        {kind === "runout" && (
          <>
            <circle cx="13" cy="14" r="8" />
            <path d="M 5 6 l 3 3 M 3 7 l 3 2" />
          </>
        )}
        {kind === "total-runout" && (
          <>
            <line x1="3" y1="6" x2="23" y2="6" />
            <circle cx="13" cy="15" r="6.5" />
            <line x1="3" y1="22" x2="23" y2="22" />
          </>
        )}
        {/* Concept-page glyphs: circled letters for the modifier symbols, and
            pictograms for the concepts that have no symbol of their own. */}
        {(kind === "mmc" || kind === "lmc" || kind === "independency" || kind === "envelope-requirement" || kind === "projected-zone") && (
          <>
            <circle cx="13" cy="13" r="9" />
            <text
              x="13"
              y="13.5"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight="700"
              fill="currentColor"
              stroke="none"
              className="font-sans"
            >
              {kind === "mmc" && "M"}
              {kind === "lmc" && "L"}
              {kind === "independency" && "I"}
              {kind === "envelope-requirement" && "E"}
              {kind === "projected-zone" && "P"}
            </text>
          </>
        )}
        {kind === "rfs" && (
          <>
            <rect x="7" y="8" width="12" height="10" />
            <line x1="13" y1="8" x2="13" y2="18" />
          </>
        )}
        {kind === "feature-control-frame" && (
          <>
            <rect x="4" y="8" width="18" height="10" />
            <line x1="10.5" y1="8" x2="10.5" y2="18" />
            <line x1="15.5" y1="8" x2="15.5" y2="18" />
          </>
        )}
        {kind === "datum-feature" && (
          <>
            <line x1="4" y1="20" x2="22" y2="20" />
            <path d="M 9 13 L 13 20 L 17 13 Z" />
          </>
        )}
        {kind === "datum-target" && (
          <>
            <circle cx="13" cy="13" r="8" />
            <line x1="8.5" y1="13" x2="17.5" y2="13" />
          </>
        )}
        {kind === "rule-1" && (
          <>
            <rect x="5" y="8" width="16" height="10" strokeDasharray="3 2" />
            <rect x="9" y="10.5" width="8" height="5" />
          </>
        )}
        {kind === "unequally-disposed-profile" && (
          <>
            <circle cx="13" cy="13" r="9" />
            <text
              x="13"
              y="13.5"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight="700"
              fill="currentColor"
              stroke="none"
              className="font-sans"
            >
              U
            </text>
          </>
        )}
        {kind === "continuous-feature" && (
          <>
            <polygon points="6.5,7.5 19.5,7.5 22,13 19.5,18.5 6.5,18.5 4,13" />
            <text
              x="13"
              y="13.5"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="7"
              fontWeight="700"
              fill="currentColor"
              stroke="none"
              className="font-sans"
            >
              CF
            </text>
          </>
        )}
        {kind === "free-state" && (
          <>
            <circle cx="13" cy="13" r="9" />
            <text
              x="13"
              y="13.5"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight="700"
              fill="currentColor"
              stroke="none"
              className="font-sans"
            >
              F
            </text>
          </>
        )}
        {kind === "restrained-condition" && (
          <>
            <rect x="7" y="5" width="12" height="14" />
            <line x1="10" y1="9" x2="16" y2="9" />
            <line x1="10" y1="12" x2="16" y2="12" />
            <line x1="10" y1="15" x2="14" y2="15" />
          </>
        )}
        {kind === "tangent-plane" && (
          <>
            <circle cx="13" cy="13" r="9" />
            <text
              x="13"
              y="13.5"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight="700"
              fill="currentColor"
              stroke="none"
              className="font-sans"
            >
              T
            </text>
          </>
        )}
        {/* General dimensioning notation glyphs (batch 5): the dimension-type
            conventions drawn as their callout appearance, and the size
            symbols drawn as themselves. */}
        {kind === "basic-dimension" && (
          <>
            <rect x="4.5" y="8" width="17" height="10" />
            <text
              x="13"
              y="13.5"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="7.5"
              fontWeight="600"
              fill="currentColor"
              stroke="none"
              className="font-sans"
            >
              50
            </text>
          </>
        )}
        {kind === "reference-dimension" && (
          <text
            x="13"
            y="13.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="8.5"
            fontWeight="600"
            fill="currentColor"
            stroke="none"
            className="font-sans"
          >
            (100)
          </text>
        )}
        {kind === "dimension-not-to-scale" && (
          <>
            <text
              x="13"
              y="11.5"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="9"
              fontWeight="600"
              fill="currentColor"
              stroke="none"
              className="font-sans"
            >
              215
            </text>
            {/* The convention IS the thick straight underline. */}
            <line x1="4" y1="19" x2="22" y2="19" strokeWidth="2.2" />
          </>
        )}
        {kind === "diameter" && (
          <>
            <circle cx="13" cy="13" r="8" />
            <line x1="7" y1="19" x2="19" y2="7" />
          </>
        )}
        {kind === "radius" && (
          <>
            <path d="M 7 21 A 12 12 0 0 1 22 12" />
            <line x1="7" y1="21" x2="16" y2="15.2" />
          </>
        )}
        {kind === "controlled-radius" && (
          <>
            <path d="M 6 21 A 12 12 0 0 1 21 12" />
            <line x1="6" y1="21" x2="15" y2="15.4" />
            <text
              x="16.5"
              y="7.5"
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="700"
              fill="currentColor"
              stroke="none"
              className="font-sans"
            >
              CR
            </text>
          </>
        )}
        {kind === "square" && <rect x="8" y="8" width="10" height="10" />}
        {kind === "dimension-origin" && (
          <>
            <circle cx="7" cy="13" r="3.5" />
            <line x1="10.5" y1="13" x2="21" y2="13" />
            <path d="M 18 11 L 22 13 L 18 15 Z" fill="currentColor" stroke="none" />
          </>
        )}
        {/* General dimensioning notation glyphs (batch 5 tranche 2): hole
            callout symbols drawn as themselves, arrow-like symbols drawn as
            their standard appearance, and text notations as lettering. The
            Y14.5 symbols carry the dimension they apply to; per 6.3.12-6.3.15
            and 6.3.18 they precede it with no space, and the taper/slope
            symbols are shown with the vertical leg to the left. */}
        {kind === "depth" && (
          <>
            <path d="M 5 6 L 13 6 L 9 13 Z" fill="currentColor" stroke="none" />
            <line x1="9" y1="13" x2="9" y2="21" />
          </>
        )}
        {kind === "counterbore" && (
          <path d="M 5 8 H 21 V 18 H 5 Z M 21 13 H 17" />
        )}
        {kind === "spotface" && (
          <path d="M 5 8 H 21 V 18 H 5 Z M 5 13 H 9" />
        )}
        {kind === "countersink" && (
          <path d="M 5 7 L 21 7 L 15 19 L 11 19 Z" />
        )}
        {kind === "conical-taper" && (
          <path d="M 8 5 L 8 21 L 19 21 Z" />
        )}
        {kind === "slope" && (
          <path d="M 8 5 L 8 21 L 19 21" />
        )}
        {kind === "arc-length" && (
          <path d="M 4 19 Q 13 4, 22 19" />
        )}
        {kind === "parting-line" && (
          <path d="M 13 4.5 L 20.5 13 L 13 21.5 L 5.5 13 Z" />
        )}
        {kind === "multiple-identical-features" && (
          <text
            x="13"
            y="13.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10.5"
            fontWeight="700"
            fill="currentColor"
            stroke="none"
            className="font-sans"
          >
            X
          </text>
        )}
      </g>
    </svg>
  );
}

/** One heading + prose block of a long-form (plain-language) symbol entry. */
export type GdntGuideSection = {
  heading: string;
  /** Paragraphs; backtick `spans` render as inline code, `**spans**` as bold. */
  text: string[];
  /**
   * Optional bullet list rendered after the section's paragraphs (proper
   * <ul>/<li> markup, styled by the shared .seo-prose typography). Used for
   * enumerations of parallel items — e.g. when-to-use lists. Items support
   * the same backtick/`**bold**` inline syntax as paragraphs.
   */
  list?: string[];
  /**
   * Optional teaching diagram (inline SVG, see gdnt-diagrams.tsx) rendered
   * after the section's paragraphs on the /cad/gdt/[symbol] page. Diagrams
   * are data-driven, so every future symbol page can attach one per section
   * with its own values — nothing is hardcoded to Position.
   */
  diagram?: GdntDiagram;
};

/** A companion tool worth linking from a symbol's long-form entry. */
export type GdntSeeAlso = { name: string; href: string };

/**
 * Optional long-form plain-language entry (the "library depth" of the GD&T
 * symbol library). Only symbols with a written entry have one — the batch
 * cadence is: Position (pilot), then the four Form tolerances, then more as
 * the library grows. Each entry renders on its own reference page at
 * /cad/gdt/[symbol] (non-tool content, outside the tool registry), linked
 * from both reference tools.
 */
export type GdntGuide = {
  /** Entry headline, e.g. "True Position — Position Tolerance". */
  title: string;
  /** One-line page summary; doubles as the symbol page's meta description. */
  summary: string;
  sections: GdntGuideSection[];
  /** Cross-tool references, e.g. the True Position Calculator. */
  seeAlso?: GdntSeeAlso[];
  /** SEO: <title> tag of the individual symbol page (falls back to title). */
  seoTitle?: string;
};

export type GdntSymbol = {
  kind: string;
  name: string;
  category: "Form" | "Profile" | "Orientation" | "Location" | "Runout";
  meaning: string;
  rule: string;
  /** Long-form entry — see GdntGuide. Authored per batch: Position, then Form tolerances. */
  guide?: GdntGuide;
};

export const GDNT_SYMBOLS: GdntSymbol[] = [
  {
    kind: "straightness", name: "Straightness", category: "Form",
    meaning: "Controls how straight a line element of a surface or an axis must be.",
    rule: "Form control — no datum required. Zone: two parallel lines (2D) or a cylinder (axis), width/Ø t.",
    guide: {
      title: "Straightness — Form Tolerance",
      summary:
        "How the GD&T straightness tolerance works: surface-line straightness between two parallel lines, axis straightness inside a cylindrical zone, and the MMC modifier that only the axis application can take.",
      seoTitle: "Straightness (GD&T) — Surface & Axis Applications, MMC Modifier | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Straightness is a Form control: it limits how far a single line element of a surface — or the axis of a feature of size — may depart from a perfectly straight line. Like all Form tolerances it is self-referencing: the zone is established from the feature itself, with no datum reference frame and no basic dimensions. What makes straightness unusual is that it has two genuinely different applications. On a surface it controls line elements in two dimensions; on a feature of size (a pin, shaft, or bore) it controls the derived median line in three. The two cases have different zones, different rules, and — in the axis case — a material-condition option no other Form control gets.`,
          ],
        },
        {
          heading: "Surface straightness: line elements",
          text: [
            `Applied to a surface, straightness controls individual line elements, not the surface as a whole. The tolerance zone is the space between two parallel lines a distance t apart, and the requirement is applied one cross-section at a time: each line element of the surface, taken in the direction the callout points, must lie between those lines. Elements are independent — a wavy surface still passes as long as every individual element does. Surface straightness says nothing about how the elements relate to each other, so it is the right tool when only the straightness of a line matters, not the overall form of the surface.`,
          ],
          diagram: { kind: "straightness-line", tolerance: "0.1" },
        },
        {
          heading: "Axis straightness: a cylindrical zone",
          text: [
            `Applied to a feature of size — a pin, shaft, or bore — straightness controls the derived median line: the line through the centers of the feature's cross-sections. The tolerance zone is a cylinder of diameter t centered on the feature's nominal axis, and the entire median line must lie within it, evaluated in three dimensions. This is a fundamentally different and generally stricter requirement than the two-dimensional surface case — a shaft can have perfectly round cross-sections everywhere and still fail axis straightness because its centerline bows.`,
          ],
          diagram: { kind: "straightness-axis", tolerance: "Ø0.05" },
        },
        {
          heading: "MMC and bonus tolerance (axis only)",
          text: [
            `Axis straightness is the one Form control that may be applied at Maximum Material Condition — a commonly missed nuance, since the other Form controls (flatness, circularity, cylindricity) never take a material modifier. At Ⓜ, the stated tolerance applies when the feature is at MMC, and every departure from MMC adds a bonus equal to that departure. For a shaft, MMC is the largest size, so a shaft produced smaller gains bonus; for a bore, MMC is the smallest size, so a bore produced larger gains it too. The guarantee that matters — a shaft still fits through its mating bore — holds even as the bow increases, because the bonus is bought by clearance.`,
          ],
          diagram: { kind: "bonus", tolerance: "Ø0.05", mmcSize: "Ø6.0", actualSize: "Ø5.6", zoneSize: "Ø0.45", feature: "pin" },
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "A straightness frame is simpler than a position frame: no datum references, no basic dimensions. `— 0.1` reads as a straightness tolerance of 0.1 width applied to surface line elements. The axis application adds the diameter symbol — the zone is a cylinder, not a width — and may add the MMC modifier: `Ø 0.05 Ⓜ` reads as a straightness tolerance of 0.05 diameter on the derived median line, evaluated at MMC. The contrast with the position frame `⌖ ⌀0.5 Ⓜ A B C` is exactly this: position locates a feature from datums, while straightness references only the feature itself.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "—", label: "Geometric characteristic — straightness" },
              { content: "Ø0.05", label: "Tolerance value — zone diameter (axis case)" },
              { content: "Ⓜ", label: "Material condition — MMC, bonus (axis only)" },
            ],
            note: "The feature control frame, compartment by compartment. Only the axis application adds the diameter symbol and the Ⓜ modifier — and note the absence of any datum reference: straightness, like all Form controls, is self-referencing.",
          },
        },
        {
          heading: "Measurement",
          text: [
            `**Surface straightness — indicator sweep** — run a dial indicator along the surface in the controlled direction; the total indicator reading across the traverse must stay within t. Simple and adequate for most rails, ways, and long flat elements.`,
            `**Axis straightness — CMM or precision spindle** — measure cross-sections along the length, derive the median line, and check it against the cylinder around the nominal axis. Rotary-table and V-block setups approximate this but sample only the sections they take; a bow between samples can hide.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Long guides and rails where a straight line element carries the function — linear bearing ways, gibs, carriage edges`,
            `Shafts and bores that must assemble through a length — a bowed shaft jams even when every cross-section is perfectly round`,
            `Features of size where the axis application's MMC modifier buys bonus tolerance while still guaranteeing assembly`,
            `Cases where only one direction of form needs control, and a full surface or cylindricity callout would be overkill`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "flatness", name: "Flatness", category: "Form",
    meaning: "Limits the deviation of a surface from a perfect plane.",
    rule: "Form control — no datum required. Zone: two parallel planes, distance t.",
    guide: {
      title: "Flatness — Form Tolerance",
      summary:
        "How the GD&T flatness tolerance works: the two-parallel-planes zone, the no-datum self-referencing rule, and when flatness is the right callout.",
      seoTitle: "Flatness (GD&T) — Tolerance Zone, No-Datum Rule & Measurement | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Flatness controls how far a surface may depart from a perfect plane. It is a Form control — self-referencing, with no datum reference frame — and the entire surface must satisfy the requirement at once, not line by line. Because the zone is established from the surface itself, flatness says nothing about where the surface sits: a surface can be perfectly flat and still be tilted, offset, or poorly oriented relative to the rest of the part. Flatness controls form only, which is exactly what a gasket face or mounting pad needs.`,
          ],
        },
        {
          heading: "The zone: two parallel planes",
          text: [
            `The flatness tolerance zone is the space between two parallel planes separated by the tolerance t. Every point of the actual surface must fall between the two planes in a single simultaneous evaluation. The planes are not anchored to the nominal surface direction — any pair of parallel planes t apart that contains the whole surface satisfies the requirement, so a uniformly tilted or slightly shifted surface can still pass. A surface that bows, dishes, or warps within the band passes; anything that needs more than t of separation anywhere fails.`,
          ],
          diagram: { kind: "flatness", tolerance: "0.2" },
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "A flatness frame has no datum references and no diameter symbol — the zone is a width between planes, not a cylinder. `⏥ 0.2` reads as a flatness tolerance of 0.2 width. Compare the position frame `⌖ ⌀0.5 Ⓜ A B C`: position locates the feature relative to datums and may take material modifiers, while flatness references only the surface itself and never carries a material condition. The frame says nothing about where the surface is — only how flat it must be.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⏥", label: "Geometric characteristic — flatness" },
              { content: "0.2", label: "Tolerance value — zone width (two parallel planes)" },
            ],
            note: "The feature control frame, compartment by compartment. There is no datum reference and no diameter symbol — the zone is a width between planes — and, like all Form controls, no material modifier is possible.",
          },
        },
        {
          heading: "Measurement",
          text: [
            `**Surface plate + height gauge / dial indicator** — the classic method: sweep the indicator over the surface and read the total range of travel; it must stay within t. Fast and adequate for most plates, pads, and seal faces.`,
            `**CMM point sampling** — probe a grid of points over the surface and fit the tightest pair of parallel planes that bounds them. Used for larger or flexible parts, and whenever measured flatness feeds a statistical process.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Gasket and seal faces, where a full-surface contact band is what prevents leaks`,
            `Base plates and mounting pads, where the part must sit without rocking on its mating surface`,
            `Datum features that other controls will reference — the datum feature's own form must be good enough to establish a stable reference plane`,
            `Any surface that must contact another over its full area rather than at a few high spots`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "circularity", name: "Circularity (roundness)", category: "Form",
    meaning: "Controls roundness of a cross-section of a cylinder, cone or sphere.",
    rule: "Form control — no datum required. Zone: two concentric circles, radial width t.",
    guide: {
      title: "Circularity (Roundness) — Form Tolerance",
      summary:
        "How the GD&T circularity tolerance works: the two-concentric-circles zone evaluated one cross-section at a time, what it does not control, and how roundness is actually measured.",
      seoTitle: "Circularity (GD&T Roundness) — Zone, Per-Section Rule & Measurement | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Circularity — also called roundness — controls how far a single circular cross-section may depart from a perfect circle. It is a Form control: no datum, evaluated one section at a time. Each cross-section taken perpendicular to the feature's axis must be round within the tolerance, but circularity places no constraint on how the sections relate to each other along the length. A part can be perfectly circular at every section and still be tapered or bowed — that is outside circularity's job. Applied to a cylinder, cone, or sphere, it limits only the shape of each individual section.`,
          ],
        },
        {
          heading: "The zone: two concentric circles",
          text: [
            `The tolerance zone is the space between two concentric circles whose radial separation is the tolerance t. The actual profile of the one cross-section under evaluation must fall entirely between the circles. The zone is established from the section itself, so circularity tolerates a uniform change of size from section to section — the circles are free to shrink or grow, and their center is not tied to any datum or to the part axis. That is what makes circularity a pure form control: it measures shape alone.`,
          ],
          diagram: { kind: "circularity", tolerance: "0.1" },
        },
        {
          heading: "What circularity does not control",
          text: [
            `Because each cross-section is evaluated independently, circularity accumulates nothing along the length. Taper, bow, and surface straightness are all outside its reach — those are the job of cylindricity, the composite Form control, or of axis straightness on a feature of size. A hydraulic cylinder bore needs roundness at every section, but it also needs the bore to be straight; calling out circularity alone would let a bowed bore pass. Specify circularity when roundness of sections is the requirement, and pair it with other controls when the length-wise form matters too.`,
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "A circularity frame is minimal: no datum references, no diameter symbol — the tolerance is a radial width, not a diameter — and no material modifier. `○ 0.1` reads as a circularity tolerance of 0.1 radial width on each cross-section. Compare the position frame `⌖ ⌀0.5 Ⓜ A B C`: position locates from datums and may take MMC; circularity references only the section itself and never carries a material condition.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "○", label: "Geometric characteristic — circularity" },
              { content: "0.1", label: "Tolerance value — radial width (concentric circles)" },
            ],
            note: "The feature control frame, compartment by compartment. No datum reference, no diameter symbol — the value is a radial width — and no material modifier: circularity is a pure Form control.",
          },
        },
        {
          heading: "Measurement",
          text: [
            `**Roundness machine / precision spindle** — the part or probe rotates on a precise spindle while a plot records radial deviation; the only method that reliably catches lobing, because lobed forms (a tri-lobed shape, for example) can read acceptably between two points and hide in two-point measurement.`,
            `**CMM circular scan** — sample a dense set of points around the section and fit the two concentric circles that bound them; the natural choice when the part is already on the CMM.`,
            `**V-block + dial indicator (shop approximation)** — quick screening only: two-point contact can miss odd-numbered lobes entirely, so treat the reading as a check, not a circularity measurement.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Cylindrical surfaces that mate or seal radially — bearing seats, hydraulic cylinder bores, O-ring grooves`,
            `Shaft journals where an out-of-round condition shows up as vibration, uneven wear, or leakage`,
            `Spherical or conical features where only the roundness of each section matters`,
            `Where length-wise form is controlled separately (or not at all), and circularity alone states the real requirement`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "cylindricity", name: "Cylindricity", category: "Form",
    meaning: "Simultaneously controls roundness and straightness of a cylindrical surface.",
    rule: "Form control — no datum required. Zone: two coaxial cylinders, radial distance t.",
    guide: {
      title: "Cylindricity — Form Tolerance",
      summary:
        "How the GD&T cylindricity tolerance works: the composite Form control — roundness, straightness, and taper in one two-coaxial-cylinders zone — and why it is expensive to inspect.",
      seoTitle: "Cylindricity (GD&T) — Composite Form Zone & Measurement | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Cylindricity is the composite Form control: it simultaneously limits roundness, straightness, and taper of a cylindrical surface. The entire surface — not individual cross-sections — must fall between two coaxial cylinders separated by the tolerance t, in one simultaneous evaluation. It is the strictest of the Form controls and the hardest to inspect, precisely because the requirement applies to the whole surface at once rather than slice by slice.`,
          ],
        },
        {
          heading: "The zone: two coaxial cylinders",
          text: [
            `The tolerance zone is the space between two coaxial cylinders whose radial separation is the tolerance t. Every point of the actual cylindrical surface must lie between them over the full length. Unlike circularity — which passes or fails each slice on its own — cylindricity evaluates the whole surface as a single shape: a local bulge here and a slight taper there must both fit inside the same pair of envelopes. The zone is established from the surface itself, so like all Form controls it references no datum and tolerates a uniform change in size along the length.`,
          ],
          diagram: { kind: "cylindricity", tolerance: "0.1" },
        },
        {
          heading: "Circularity vs. cylindricity",
          text: [
            `The two controls answer different questions. Circularity asks: is each cross-section round? Cylindricity asks: is the whole surface cylindrical? A part can pass circularity at every section and still fail cylindricity — a tapered or bowed bore is round everywhere but not contained between two coaxial cylinders. Cylindricity is therefore always at least as strict, and it costs more to verify. When only roundness matters, circularity is the cheaper, honest callout; when roundness and straightness must hold together — a seal running the length of a bore, a journal carrying load along its whole length — cylindricity is the control that states the real requirement.`,
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "A cylindricity frame is minimal: no datum references, no diameter symbol — the tolerance is a radial width between coaxial cylinders — and no material modifier. `⌭ 0.1` reads as a cylindricity tolerance of 0.1 radial width over the entire surface. Compare the position frame `⌖ ⌀0.5 Ⓜ A B C`: position locates from datums and may take MMC; cylindricity references only the surface itself and never carries a material condition.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⌭", label: "Geometric characteristic — cylindricity" },
              { content: "0.1", label: "Tolerance value — radial width (coaxial cylinders)" },
            ],
            note: "The feature control frame, compartment by compartment. No datum reference, no diameter symbol — the value is a radial width between coaxial cylinders — and no material modifier is possible.",
          },
        },
        {
          heading: "Measurement",
          text: [
            `**Roundness machine with axial traverse** — the definitive method: spindle roundness plus a straight traverse produces a three-dimensional map of the surface, checked against the two coaxial cylinders. Expensive and slow; reserved for critical features.`,
            `**CMM helical scan** — a dense helix of points around and along the surface, bounded by the two coaxial cylinders. The usual production compromise between cost and coverage.`,
            `**Decomposition (shop practice)** — because direct cylindricity inspection is costly, production often controls circularity and straightness separately and relies on the process to keep them inside the implied envelope. Only sound when the process is stable enough to guarantee it.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Precision bores where piston or seal function depends on roundness and straightness together — engine cylinders, hydraulic actuators`,
            `Long bearing journals where a taper alone would concentrate load at one end`,
            `Features whose mating surface slides or seals along the entire length, not just at a cross-section`,
            `Use it sparingly elsewhere: when only roundness matters, circularity (plus a straightness or position control if needed) costs far less to verify`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "profile-line", name: "Profile of a line", category: "Profile",
    meaning: "Controls the form of a line element of a surface along a specified section.",
    rule: "Can be form-only or datum-referenced (location). Zone: two offset curves, width t.",
    guide: {
      title: "Profile of a Line — Profile Tolerance",
      summary:
        "How the GD&T profile of a line tolerance works: the two-offset-curves zone on any cross-section, the datum-optional rule that sets Profile apart from the Form group, and how the control is measured.",
      seoTitle: "Profile of a Line (GD&T) — Offset-Curve Zone, Datum-Optional Rule | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Profile of a line controls how far a single cross-section of a surface — almost always a curved one — may depart from its true profile. It is the first control in this library that is architecturally different from the Form group: where straightness or flatness are always self-referencing, profile can be specified with no datum reference at all (controlling form only) or with datum references, in which case it simultaneously controls orientation and location of the section's profile as well. That flexibility is Profile's defining trait, and it is worth stating plainly: Profile does not live in one fixed category the way the Form controls do.`,
          ],
        },
        {
          heading: "The zone: two offset curves",
          text: [
            `The tolerance zone is bounded by two curves offset on either side of the true profile — the theoretically exact curve established by basic dimensions (or by a basic angle and radius in the drawing view where the profile appears). By default the tolerance is split evenly: half the tolerance outside the true profile, half inside. The actual profile of the one cross-section under evaluation must fall entirely between the two offset curves. Like circularity, sections are evaluated one at a time — profile of a line places no constraint on how adjacent sections relate to each other along the surface; that is the job of profile of a surface.`,
          ],
          diagram: { kind: "profile-line", tolerance: "0.2" },
        },
        {
          heading: "Datum-optional: two ways to specify it",
          text: [
            `Specified without datum references, the profile zone is free to float — the control limits only the shape of the section's profile, much like a Form control. Specified with datum references, the zone is anchored to the datum reference frame: the section's profile must now sit correctly relative to the datums, so orientation and location are controlled at the same time as form. This dual nature is why profile tolerances appear both on unfinished surfaces (form control) and on fully defined features (form + orientation + location), and why the frame must be read carefully — the same symbol means different things depending on what follows the tolerance value. As a frame, \`⌒ 0.2 A B C\` reads as: profile of a line, zone 0.2 wide, referenced to primary datum A, secondary datum B, and tertiary datum C — while \`⌒ 0.2\` alone controls form only.`,
          ],
          diagram: {
            kind: "fcf-pair",
            without: [
              { content: "⌒", label: "Profile of a line — form only" },
              { content: "0.2", label: "Tolerance value — zone width" },
            ],
            with: [
              { content: "⌒", label: "Profile of a line" },
              { content: "0.2", label: "Tolerance value — zone width" },
              { content: "A", label: "Primary datum reference" },
              { content: "B", label: "Secondary datum reference" },
              { content: "C", label: "Tertiary datum reference" },
            ],
            note: "The same symbol specified two ways. Without datums, the offset-curve zone floats and the control limits form only. With datums A, B, C, the zone is anchored to the datum reference frame — form, orientation and location of the section's profile are controlled simultaneously.",
          },
        },
        {
          heading: "Unequal disposition of the zone",
          text: [
            `By default the zone is bisected by the true profile. When stock removal, coating thickness, or a sharp edge matters, the zone can be shifted so most of it falls on one side — the drawing states the offset explicitly (for example with the unequal-profile symbol and a value). This is an aside rather than a separate control: the zone width stays t either way; only its disposition relative to the true profile changes. Most profile callouts never need it, but coating-heavy or machined-stock features often do. For the full Ⓤ notation and worked disposition arithmetic, see Unequally Disposed Profile in the concepts section.`,
          ],
        },
        {
          heading: "Measurement",
          text: [
            `**Optical comparator / contour tracer (2D sections)** — the natural method: project or trace the cross-section and compare against the true profile magnified; the band between the two offset curves is checked directly. Standard for stampings, extrusion dies, and cam profiles.`,
            `**CMM section scan** — probe along the cross-section, best-fit against the basic profile, and report the deviation band; used when the profile lives on a part too large or too irregular for an optical setup.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Curved cross-sections with no simpler geometry to fall back on — cam lobes, airfoil sections, formed sheet-metal ribs`,
            `Sections whose shape matters but whose location is controlled elsewhere (or not yet) — the no-datum form-only callout`,
            `Sections that must sit correctly relative to datums — the with-datum callout, controlling form and location in one frame`,
            `Complex 2D contours that a radius-plus-tolerance scheme cannot describe honestly`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "profile-surface", name: "Profile of a surface", category: "Profile",
    meaning: "Controls form, size, orientation and/or location of a surface.",
    rule: "With datum refs it can locate; without, it is form only. Zone: two offset surfaces, width t.",
    guide: {
      title: "Profile of a Surface — Profile Tolerance",
      summary:
        "How the GD&T profile of a surface tolerance works: the two-offset-surfaces zone around any freeform surface, the datum-optional rule, and why it is one of the most versatile controls in GD&T.",
      seoTitle: "Profile of a Surface (GD&T) — Offset-Surface Zone & Datum-Optional Rule | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Profile of a surface controls how far an entire surface — freeform or otherwise — may depart from its true profile. It is the three-dimensional generalization of profile of a line, and like that control it is datum-optional: without datums it limits form only, with datums it simultaneously controls orientation and location of the whole surface. This makes it one of the most versatile controls in GD&T — the only callout that can fully define a complex molded, cast, or aero-dynamic surface where no cylinder, plane, or cone exists to tolerate instead.`,
          ],
        },
        {
          heading: "The zone: two offset surfaces",
          text: [
            `The tolerance zone is the space between two surfaces offset on either side of the true profile — imagine the basic surface thickened by the tolerance, half outside and half inside by default. Every point of the actual surface must fall between the two offset surfaces in one simultaneous evaluation; there is no per-section pass or fail as with profile of a line. The true profile is established by basic dimensions in the drawing views where the surface appears, so the control reaches shape, direction, and position of the surface at once when datums are referenced.`,
          ],
          diagram: { kind: "profile-surface", tolerance: "0.5" },
        },
        {
          heading: "Datum-optional: two ways to specify it",
          text: [
            `The no-datum callout is a Form control in all but name: the offset-surface zone floats, and only the surface's own shape is limited. The with-datum callout anchors that zone to the datum reference frame — the surface must now be correctly oriented and located relative to the datums, with form, orientation, and location all inside a single tolerance. As a frame, \`⌓ 0.5 A B C\` reads as: profile of a surface, zone 0.5 wide, referenced to primary datum A, secondary datum B, and tertiary datum C — one frame doing the work that would otherwise take several controls. That is a genuine modeling decision for the designer: a complex mating surface often cannot be toleranced honestly by any combination of flatness, angularity, and position, and a single with-datum profile callout states the real requirement.`,
          ],
          diagram: {
            kind: "fcf-pair",
            without: [
              { content: "⌓", label: "Profile of a surface — form only" },
              { content: "0.5", label: "Tolerance value — zone width" },
            ],
            with: [
              { content: "⌓", label: "Profile of a surface" },
              { content: "0.5", label: "Tolerance value — zone width" },
              { content: "A", label: "Primary datum reference" },
              { content: "B", label: "Secondary datum reference" },
              { content: "C", label: "Tertiary datum reference" },
            ],
            note: "The same symbol specified two ways. Without datums, the offset-surface zone floats and the control limits form only. With datums A, B, C, form, orientation and location of the entire surface are controlled simultaneously — a single frame replacing what would otherwise take several controls.",
          },
        },
        {
          heading: "Line vs. surface profile",
          text: [
            `The two profile controls differ in scope, not in kind. Profile of a line evaluates one cross-section at a time — adjacent sections are independent, so a surface can pass line profile everywhere and still be twisted or wavy along its length. Profile of a surface evaluates the whole surface at once; any twist, waviness, or variation between sections must fit inside the same pair of envelopes. Surface profile is therefore always at least as strict, and it is the control that states the real requirement when the surface works as a surface — a sealing face, a flowing airfoil, a mold cavity — rather than as a stack of independent sections.`,
          ],
        },
        {
          heading: "Measurement",
          text: [
            `**CMM surface scan** — the standard method: probe a grid or scan lines across the surface, best-fit against the basic mathematical definition, and report the deviation of every point; the entire point cloud must sit between the two offset surfaces.`,
            `**Optical scanning / structured light** — capture the whole surface as a dense point cloud and register it against the CAD model; increasingly the default for freeform surfaces with hundreds of profile points, where touch-probe sampling is too slow.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Freeform surfaces with no simpler underlying geometry — mold cavities, cast housings, aerodynamic and hydrodynamic faces`,
            `Complex mating surfaces where form, orientation, and location must hold together — one with-datum frame instead of several weaker controls`,
            `Sheet-metal and formed parts where the whole skin's shape is the functional requirement`,
            `As a line-profile companion: specify surface profile for the 3D requirement, and line profile only where a single critical section needs a tighter band`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "angularity", name: "Angularity", category: "Orientation",
    meaning: "Controls the angle of a surface or axis relative to a datum (other than 90°).",
    rule: "Orientation control — datum required. Zone: two parallel planes/lines at the basic angle, width t.",
    guide: {
      title: "Angularity — Orientation Tolerance",
      summary:
        "How the GD&T angularity tolerance works: the two-parallel-planes zone held at a basic angle to a datum, why the basic angle dimension is mandatory, and how angularity completes the orientation family.",
      seoTitle: "Angularity (GD&T) — Basic Angle, Datum Zone & Measurement | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Angularity controls the angle of a surface or an axis relative to a datum — at any angle other than 0° or 90°, which belong to parallelism and perpendicularity respectively. It is an Orientation control, and orientation controls always require a datum reference frame; there is no self-referencing orientation. This is the cleanest contrast in the library: Form controls (straightness, flatness, circularity, cylindricity) never use a datum, Profile can be specified either way, and Orientation always does. The datum is what the angle is measured from — without it, "this surface at 30°" has no meaning, because 30° from what?`,
          ],
        },
        {
          heading: "The zone: two parallel planes at the basic angle",
          text: [
            `The angularity tolerance zone is the space between two parallel planes separated by the tolerance t, held at the basic angle relative to the datum surface. The entire actual surface must lie between the planes. Unlike parallelism (0°, implied) and perpendicularity (90°, implied), the angle is not built into the symbol — angularity is the general case, so the basic angle must always be stated as a dimension in the drawing. A surface that is too steep, too shallow, or warped across the band fails; a uniformly tilted surface that stays inside the band passes, because angularity limits the angle, not the location. For an axis, the zone is a cylinder of diameter Øt around the true axis, and the axis itself is a derived feature rather than a surface.`,
          ],
          diagram: { kind: "orientation-zone", angle: 30, tolerance: "0.2", datum: "A" },
        },
        {
          heading: "One family, three symbols",
          text: [
            `Perpendicularity, parallelism, and angularity are not three unrelated controls — they are one orientation family, and the difference between them is only the angle. Perpendicularity is angularity at exactly 90°, and parallelism is angularity at exactly 0°; both angles are implied by the symbol itself, so neither frame needs an angle dimension. Angularity is the general case, used for any angle other than 0° or 90°, and it is the only one of the three that requires a basic angle dimension, because nothing about the symbol tells the reader what the angle is. When in doubt, pick the specific member: if the requirement is literally "square to A", write perpendicularity, not angularity with a 90° dimension — the symbol alone already says it.`,
          ],
          list: [
            `**Parallelism** — angularity at exactly 0°: the zone is parallel to the datum, and the frame needs no angle dimension.`,
            `**Perpendicularity** — angularity at exactly 90°: the zone is square to the datum, and the frame needs no angle dimension.`,
            `**Angularity** — the general case: any other angle, and the basic angle dimension is mandatory because the symbol cannot imply it.`,
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`∠ 0.2 A` reads as: an angularity tolerance of 0.2 zone width, referenced to primary datum A. The 30° basic angle does not live in the frame — it is a dimension on the drawing, because the frame carries the tolerance and the datum, not the angle itself. Compare the position frame `⌖ ⌀0.5 Ⓜ A B C`: position locates the feature and may carry material modifiers, while angularity only orients it and never carries a material condition — a surface angularity has no MMC.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "∠", label: "Geometric characteristic — angularity" },
              { content: "0.2", label: "Tolerance value — zone width (two parallel planes)" },
              { content: "A", label: "Datum reference — the plane the angle is measured from" },
            ],
            note: "The feature control frame, compartment by compartment. The basic angle (here 30°) is dimensioned on the drawing, not written in the frame — the frame carries the tolerance and the datum. Orientation controls always require the datum reference; unlike Form controls, there is no self-referencing angularity.",
          },
        },
        {
          heading: "Measurement",
          text: [
            `**Sine bar or angle plate + height gauge** — set the part on a sine bar at the basic angle, sweep an indicator over the controlled face, and read the total range; it must stay within t. The classic production method for wedge faces and chamfered seats.`,
            `**CMM point sampling** — probe a grid over the surface and fit the tightest pair of parallel planes at the nominal angle that bounds the points. Used for complex parts and whenever the measured angle feeds a statistical process.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Angled mating faces — wedge seats, dovetail faces, chamfered register surfaces — where the angle itself is the functional requirement`,
            `Angled guide or slide surfaces that must hold a consistent angle to a datum for the life of the assembly`,
            `Angled mounting faces on cast or machined housings, where a loose angle tolerance would let the assembled unit sit visibly off`,
            `Any orientation requirement at a non-90° angle — if the angle is 0° or 90°, parallelism or perpendicularity is the more direct symbol`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "perpendicularity", name: "Perpendicularity", category: "Orientation",
    meaning: "Controls squareness of a surface, axis or line to a datum.",
    rule: "Orientation control — datum required. Zone: two parallel planes/lines at 90° to the datum, width t.",
    guide: {
      title: "Perpendicularity — Orientation Tolerance",
      summary:
        "How the GD&T perpendicularity tolerance works: the 90° orientation case, the two-parallel-planes zone square to a datum, and how perpendicularity differs from the rest of the orientation family.",
      seoTitle: "Perpendicularity (GD&T) — Square to Datum, Zone & Measurement | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Perpendicularity controls how square a surface, axis, or line is relative to a datum. It is an Orientation control, and orientation controls always require a datum reference frame — there is no self-referencing perpendicularity. The angle is exactly 90°, and it is implied by the symbol itself, so no basic angle dimension is needed: the frame carries the tolerance and the datum, and the drawing does not need to state that the requirement is a right angle. Perpendicularity is the 90° member of the orientation family — angularity at any other angle, parallelism at 0° — and it is the one most often confused with position, which is a separate concern: perpendicularity controls orientation only, and says nothing about where the feature is located.`,
          ],
        },
        {
          heading: "The zone: two parallel planes at 90° to the datum",
          text: [
            `The perpendicularity tolerance zone is the space between two parallel planes separated by the tolerance t, held at exactly 90° to the datum surface. The entire actual surface must lie between the planes. A face that leans over or under the right angle by more than the zone fails; a face that is square but shifted along the datum passes, because perpendicularity limits the orientation, not the location. For an axis — a bore, a pin, a stud — the zone is a cylinder of diameter Øt around the true axis, and an axis control may carry a material-condition modifier, because a feature of size has a size to depart from. A perpendicularity frame therefore reads differently depending on what it controls: a surface frame has no Ø and no Ⓜ, while an axis frame may have both.`,
          ],
          diagram: { kind: "orientation-zone", angle: 90, tolerance: "0.1", datum: "A" },
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`⟂ 0.1 A` reads as: a perpendicularity tolerance of 0.1 zone width, referenced to primary datum A. No angle dimension appears — 90° is implied by the symbol. For an axis, the same frame takes a diameter: `⟂ Ø0.1 A`, and a feature of size may add a material-condition modifier. Compare the position frame `⌖ ⌀0.5 Ⓜ A B C`: position locates the feature with basic dimensions, while perpendicularity only orients it — a bore can be perfectly perpendicular to its mounting face and still be drilled in the wrong place.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⟂", label: "Geometric characteristic — perpendicularity" },
              { content: "0.1", label: "Tolerance value — zone width (two parallel planes)" },
              { content: "A", label: "Datum reference — the plane the zone is square to" },
            ],
            note: "The feature control frame, compartment by compartment. No basic angle dimension is needed — 90° is implied by the symbol. Orientation controls always require the datum reference; unlike Form controls, there is no self-referencing perpendicularity.",
          },
        },
        {
          heading: "Measurement",
          text: [
            `**Cylinder square + height gauge** — hold a precision square against the datum, sweep an indicator over the controlled face, and read the total range; it must stay within t. The standard shop method for faces and bosses.`,
            `**CMM point sampling** — probe the surface and fit the tightest pair of planes at 90° to the datum that bounds the points. Used for bores, where an internal square cannot reach, and for parts with several perpendicularity callouts at once.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Mounting faces that must seat square against a datum — flanges, motor pads, fixture registers — where a lean would concentrate load at one edge`,
            `Bores perpendicular to their mounting face: bearing fits and bushing seats, where tilt at depth shows up as apparent location error at the far end of the hole`,
            `Pressed or coined holes, where the punch and die naturally produce a lean that must be bounded`,
            `Stacked assemblies, where each part's squareness compounds into a visible lean by the top of the stack`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "parallelism", name: "Parallelism", category: "Orientation",
    meaning: "Controls how parallel a surface or axis is to a datum.",
    rule: "Orientation control — datum required. Zone: two parallel planes/lines parallel to the datum, width t.",
    guide: {
      title: "Parallelism — Orientation Tolerance",
      summary:
        "How the GD&T parallelism tolerance works: the 0° orientation case, the two-parallel-planes zone held parallel to a datum, and how parallelism differs from flatness and the rest of the family.",
      seoTitle: "Parallelism (GD&T) — Parallel to Datum, Zone & Measurement | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Parallelism controls how parallel a surface or an axis is to a datum. It is an Orientation control, and orientation controls always require a datum reference frame — there is no self-referencing parallelism. The angle is exactly 0°, implied by the symbol, so no basic angle dimension is needed. Parallelism is the 0° member of the orientation family — perpendicularity at 90°, angularity at any other angle — and it is the member most often confused with flatness. The distinction is the datum: flatness is self-referencing and says nothing about the surface's direction, while parallelism is measured from the datum and would fail a surface that is perfectly flat but tilted. The same surface can pass flatness and fail parallelism, or pass both — they answer different questions.`,
          ],
        },
        {
          heading: "The zone: two parallel planes parallel to the datum",
          text: [
            `The parallelism tolerance zone is the space between two parallel planes separated by the tolerance t, held parallel to the datum surface. The entire actual surface must lie between the planes. A surface that is perfectly flat but leans relative to the datum fails — parallelism is an orientation control, and the datum is what it is measured from. For an axis — a shaft, a bore, a slide rod — the zone is a cylinder of diameter Øt around the true axis, and an axis control may carry a material-condition modifier, because a feature of size has a size to depart from. The zone itself is the same shape as flatness's; the difference is entirely in what anchors it.`,
          ],
          diagram: { kind: "orientation-zone", angle: 0, tolerance: "0.1", datum: "A" },
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`∥ 0.1 A` reads as: a parallelism tolerance of 0.1 zone width, referenced to primary datum A. No angle dimension appears — 0° is implied by the symbol. Compare the flatness frame `⏥ 0.2`: flatness references only the surface itself and never carries a datum, while parallelism always carries one. The two frames look similar, and the presence or absence of the datum reference is exactly what separates an orientation control from a Form control.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "∥", label: "Geometric characteristic — parallelism" },
              { content: "0.1", label: "Tolerance value — zone width (two parallel planes)" },
              { content: "A", label: "Datum reference — the plane the zone is parallel to" },
            ],
            note: "The feature control frame, compartment by compartment. No basic angle dimension is needed — 0° is implied by the symbol. Orientation controls always require the datum reference; the same zone without the datum is flatness, a Form control.",
          },
        },
        {
          heading: "Measurement",
          text: [
            `**Surface plate + height gauge** — rest the part on the datum surface (or on a fixture that reproduces it), sweep an indicator over the controlled face, and read the total range; it must stay within t. The classic method for faces that must ride parallel to a reference.`,
            `**CMM point sampling** — probe the surface and fit the tightest pair of planes parallel to the datum that bounds the points. Used for axes and bores, and whenever several parallel faces are checked against the same datum in one setup.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Sliding and riding surfaces — slide ways, guide rails, carriage faces — where the moving part must stay parallel to its reference over the full travel`,
            `Mating faces that must hold a consistent gap: a cover plate parallel to its housing face, where a wedge gap would leak or rattle`,
            `Datum-to-datum parallelism for stack-up control, where each part's lean compounds into an unacceptable total`,
            `Two faces that must be parallel to each other for uniform wall thickness or uniform bearing contact, referenced to a common datum`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "position", name: "Position", category: "Location",
    meaning: "Locates a feature (hole, pin, slot) relative to datum features at a basic location.",
    rule: "Location control — datum frame + basic dims. Zone: cylinder (Ø t) or parallelepiped around true position; MMC modifiers give bonus tolerance.",
    guide: {
      title: "True Position — Position Tolerance",
      summary:
        "How the GD&T position tolerance works: the circular zone, MMC bonus tolerance, reading a feature control frame, and how position is measured and gauged.",
      seoTitle: "True Position (GD&T Position Tolerance) — Zone, MMC Bonus & FCF | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Position tolerance controls where a feature of size — a hole, boss, slot, or similar — is allowed to be located, relative to specified datums. It defines a tolerance zone (a cylinder, for a round hole) centered on the feature's true position: the theoretically exact location established by basic dimensions from the referenced datums. The feature's actual axis or center plane must fall entirely within that zone. It's the most widely used GD&T control because it maps directly onto real function — bolt patterns, dowel holes, mating bosses — rather than an arbitrary drafting convention.`,
          ],
          diagram: { kind: "position-zone", tolerance: "Ø0.5", offset: "0.15", basicX: "180", basicY: "120" },
        },
        {
          heading: "Why a circular zone instead of ± coordinates",
          text: [
            `Tolerancing a hole's location with plus/minus X and Y dimensions creates a square tolerance zone. A hole at the corner of that square is off-location by more than either the X or Y tolerance alone (the diagonal), which is looser than intended in some directions and tighter than necessary in others. Position's circular zone matches the way a round pin actually behaves in a round hole. It is also more generous than coordinate tolerancing at the same worst-case error: a Ø1.0 circular zone allows essentially the same maximum offset as a ±0.354 coordinate zone (the square's corner), yet covers about 57% more usable area — parts that would fail under ± dimensioning often pass legitimately under position.`,
          ],
          list: [
            `**Square zone (± X/Y dimensioning):** tighter than intended along the diagonal, looser than intended along the axes — inconsistent by direction.`,
            `**Circular zone (position):** matches how a round pin actually sits in a round hole — equal protection in every direction, and about 57% more usable area than the square it replaces, at the same worst-case offset.`,
          ],
        },
        {
          heading: "MMC and bonus tolerance",
          text: [
            `When a position tolerance is applied at Maximum Material Condition (Ⓜ), the stated value applies only when the hole is at its smallest allowed size. As the actual hole is produced larger than MMC, the position tolerance gets a bonus equal to that difference — a bigger hole is allowed to be located less precisely and still function, because it still clears the fastener. This is where position tolerancing earns its reputation as a cost-saver: it lets real, imperfect parts pass that a fixed tolerance would reject.`,
          ],
          diagram: { kind: "bonus", tolerance: "Ø0.5", mmcSize: "Ø6.0", actualSize: "Ø6.4", zoneSize: "Ø0.9", feature: "hole" },
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`⌖ ⌀0.5 Ⓜ A B C` reads as: a position tolerance of 0.5 mm diameter, evaluated at MMC, referenced to primary datum A, secondary datum B, tertiary datum C.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⌖", label: "Geometric characteristic — position" },
              { content: "Ø0.5", label: "Tolerance value — zone diameter" },
              { content: "Ⓜ", label: "Material condition — MMC (bonus)" },
              { content: "A", label: "Primary datum reference" },
              { content: "B", label: "Secondary datum reference" },
              { content: "C", label: "Tertiary datum reference" },
            ],
          },
        },
        {
          heading: "Measurement",
          text: [
            `**Functional gauging** — a pin sized at virtual condition (MMC minus the tolerance, for an internal feature). Fast and repeatable; standard for high-volume production.`,
            `**CMM coordinate measurement** — measures actual location against the basic dimensions. Used for lower-volume runs, complex patterns, or when a dedicated gauge isn't practical.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Bolt circles and mounting patterns, where the hole needs to clear a fastener despite real-world location error`,
            `Dowel and pin locations, where two parts must align without over-constraining the fit`,
            `Any hole pattern currently toleranced with ± X/Y coordinates — position almost always permits more real variation for the same functional requirement`,
            `Features where MMC bonus tolerance can meaningfully cut scrap on hard-to-hold locations`,
          ],
        },
      ],
      seeAlso: [
        { name: "True Position Calculator", href: "/cad/true-position-calculator" },
        { name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" },
      ],
    },
  },
  {
    kind: "concentricity", name: "Concentricity", category: "Location",
    meaning: "Controls the coaxiality of median points of a feature with a datum axis.",
    rule: "Location control — datum required. Zone: cylinder Ø t around datum axis. Hard to inspect; often replaced by position + runout.",
    guide: {
      title: "Concentricity — Location Tolerance",
      summary:
        "How the GD&T concentricity tolerance works: the derived-median-points zone, why it is expensive to inspect, and why position or runout is usually the better callout.",
      seoTitle: "Concentricity (GD&T) — Median Points, Inspection Cost & Alternatives | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Concentricity controls the median points of a feature — the midpoints of diametrically opposed point pairs taken across its surface — relative to a datum axis. It is a Location control, so it always requires a datum reference. The zone is a cylinder of diameter Øt centered on the datum axis, and every median point must fall inside it. The critical nuance is what is being controlled: not the surface itself, and not the feature's axis as a whole, but the cloud of individual median points. This is the symbol most often miscalled on drawings — many drafters write concentricity when the functional requirement they have in mind is actually coaxiality of the surface, which is what runout or position controls directly.`,
          ],
          diagram: { kind: "median-points", variant: "concentricity", tolerance: "Ø0.1", datum: "A" },
        },
        {
          heading: "Why the professional consensus is to avoid it",
          text: [
            `Concentricity is legal in the standard and occasionally the honest callout, but the working consensus among metrologists and designers is to reach for it last. The reason is the median points themselves: they are derived data, not something a gauge or probe reads directly. Establishing them means measuring many diametrically opposed point pairs around the feature and computing each pair's midpoint — a slow, expensive CMM analysis with no functional gauge possible, because a physical gauge contacts surfaces, not derived midpoints. And because the median points are averages, the control is surprisingly insensitive where it matters: a surface with lobed out-of-roundness can have perfectly centered median points and pass concentricity while it would rattle on a shaft seat.`,
          ],
        },
        {
          heading: "The alternatives that do the same job",
          text: [
            `Almost every functional intent behind a concentricity callout is served better by another control. If the requirement is that the surface runs true relative to the datum — the usual case for rotating parts — circular runout controls it directly and is checked with a dial indicator in seconds. If the requirement is assembly clearance or location of a feature of size, position with a diameter zone does that, takes material modifiers, and is gaugeable. If the requirement is genuinely about the derived axis — rare — coaxiality language or a position callout at RFS is the closer match. The honest framing: concentricity survives on drawings mostly by habit, and each surviving instance deserves a challenge.`,
          ],
          list: [
            `**Surface must run true:** circular runout — fast dial-indicator check, controls the surface directly`,
            `**Feature must assemble in the right place:** position — gaugeable, MMC bonus available`,
            `**Derived axis genuinely matters:** position at RFS, which controls the actual axis without the midpoint averaging`,
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`⌔ Ø0.1 A` reads as: a concentricity tolerance of 0.1 mm diameter, referenced to datum axis A. Two things to notice in the frame: the diameter symbol is required, because the zone is a cylinder, and there is no material-condition modifier — concentricity never takes Ⓜ or Ⓛ, because it controls derived median points rather than a feature of size. That exclusion is the detail most often gotten wrong; a frame with ⌔ and Ⓜ together is simply not a valid callout.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⌔", label: "Geometric characteristic — concentricity" },
              { content: "Ø0.1", label: "Tolerance value — zone diameter" },
              { content: "A", label: "Datum reference — the axis the median points relate to" },
            ],
            note: "The feature control frame, compartment by compartment. Concentricity never carries a material-condition modifier — it controls derived median points, not a feature of size — and it always requires the datum reference.",
          },
        },
        {
          heading: "Measurement",
          text: [
            `**CMM median-point analysis** — the only real method: probe many points around the feature in diametrically opposed pairs, compute each pair's midpoint, and fit the tightest cylinder about the datum axis that contains them. Slow, operator-sensitive, and the result depends on how many pairs were taken.`,
            `**There is no functional gauge** — a physical gauge cannot contact derived midpoints. If a drawing shows concentricity with a proposed ring or plug gauge, the callout is being measured as something else — almost always runout — and should be redrawn as that control.`,
          ],
        },
        {
          heading: "When to use it",
          text: [
            `Honestly: almost never, and the default answer is to reach for runout or position instead. The narrow remaining cases are balance-critical rotating components — crankshaft and camshaft journals in some specifications, high-speed rotating assemblies — where a standard or customer explicitly requires control of mass centroid distribution about the datum axis, and where the median-point semantics are actually what the balance calculation consumes. Even there, modern practice increasingly substitutes position at RFS or a runout pair. If you write concentricity, be prepared to explain why runout does not already cover the function — and expect the shop to measure it as runout anyway.`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "symmetry", name: "Symmetry", category: "Location",
    meaning: "Controls balance of median points of a feature about a datum center plane.",
    rule: "Location control — datum required. Zone: two parallel planes, distance 2t, about the datum plane.",
    guide: {
      title: "Symmetry — Location Tolerance",
      summary:
        "How the GD&T symmetry tolerance works: median points balanced about a datum center plane, why inspection is expensive, and why position with a midplane zone is the modern replacement.",
      seoTitle: "Symmetry (GD&T) — Median Points, Datum Plane & Modern Practice | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Symmetry controls the median points of opposed surface elements of a feature relative to a datum center plane. It is a Location control, so it always requires a datum reference. The zone is the space between two parallel planes separated by the tolerance t, centered on the datum center plane, and every median point must fall between them. Symmetry is the plane-based sibling of concentricity — same derived-median-point mechanics, same inspection cost, same professional reluctance — with the axis replaced by a center plane. Where concentricity asks "are the median points coaxial with the datum axis?", symmetry asks "are the median points evenly disposed about the datum plane?".`,
          ],
          diagram: { kind: "median-points", variant: "symmetry", tolerance: "0.1", datum: "A" },
        },
        {
          heading: "Why the professional consensus is to avoid it",
          text: [
            `Everything expensive about concentricity is expensive here too, and the specifics are the same specifics: the median points are computed, not measured — each one is the midpoint of two opposed surface points — so inspection is a many-point CMM analysis with no possible functional gauge, and the result shifts with point density. The control is also insensitive to exactly the errors that matter functionally: opposed surfaces can both be lobed, so long as their midpoints sit near the datum plane, and symmetry will pass a feature that visibly rocks in assembly. The ISO world removed the symbol entirely — ISO 1101 deleted symmetry as a separate characteristic — and ASME Y14.5 has flagged it for future withdrawal; new drawings should not be introducing it.`,
          ],
        },
        {
          heading: "The modern replacement",
          text: [
            `The functional intent behind nearly every symmetry callout is served by position with the tolerance applied to a width — position controls the feature's center plane to the datum plane with a zone between two parallel planes, is gaugeable, accepts material modifiers where the feature is one of size, and is the callout the standards community itself points to as the replacement. Where the requirement is really about the surfaces' orientation rather than their balance, perpendicularity or profile of a surface to the datum plane is the honest control. The one genuinely irreplaceable use — true mass balance about a plane, for spinning or oscillating parts — is better handled by a balance specification than by a geometric tolerance.`,
          ],
          list: [
            `**Center plane located to the datum plane:** position on the feature's width — gaugeable, MMC-capable, the standard community's designated replacement`,
            `**Surfaces must sit square to the datum plane:** perpendicularity — orientation, not balance`,
            `**Surfaces must conform about the plane:** profile of a surface referenced to the datum — controls the surfaces themselves`,
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`⌯ 0.1 A` reads as: a symmetry tolerance of 0.1 zone width, referenced to datum center plane A. No diameter symbol appears — the zone is a width between planes, not a cylinder. And like concentricity, symmetry never carries a material-condition modifier: it controls derived median points, not a feature of size, so a frame pairing ⌯ with Ⓜ is not a valid callout. The datum reference is mandatory — there is no self-referencing symmetry, because “evenly disposed” is meaningless without something to be even about.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⌯", label: "Geometric characteristic — symmetry" },
              { content: "0.1", label: "Tolerance value — zone width (two parallel planes)" },
              { content: "A", label: "Datum reference — the center plane for the medians" },
            ],
            note: "The feature control frame, compartment by compartment. Symmetry never carries a material-condition modifier — derived median points are not a feature of size — and the datum center plane reference is mandatory.",
          },
        },
        {
          heading: "Measurement",
          text: [
            `**CMM median-point analysis** — probe opposed point pairs across the feature's surfaces, compute each pair's midpoint, and fit the tightest pair of planes about the datum center plane that contains them. The same expensive, point-density-sensitive analysis concentricity requires, rotated 90°.`,
            `**There is no functional gauge** — as with concentricity, a physical gauge cannot reach derived midpoints. Any shop "checking symmetry with a gauge" is measuring position or profile and calling it symmetry.`,
          ],
        },
        {
          heading: "When to use it",
          text: [
            `Almost never on new work. The legitimate remaining cases are narrow: legacy drawings that must be interpreted as written, and the rare balance-driven specification where median-point distribution about a plane is explicitly the requirement and a balance spec is not available. For anything else — a slot that must sit centered on a part, a tab that must align with a groove — position on the width is the correct, gaugeable, modern callout, and the standards bodies themselves have signaled that this symbol is on its way out. If a drawing in front of you specifies symmetry, the useful question is not "how do I inspect this?" but "which control did the designer actually mean?" — and the answer is almost always position.`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "runout", name: "Circular runout", category: "Runout",
    meaning: "Limits composite variation (roundness + concentricity) in one circular cross-section.",
    rule: "Datum required. Zone: two concentric circles, radial width t, per measured section.",
    guide: {
      title: "Circular Runout — Runout Tolerance",
      summary:
        "How the GD&T circular runout tolerance works: the rotation-based inspection, what one FIM reading combines, and how circular runout relates to total runout the way circularity relates to cylindricity.",
      seoTitle: "Circular Runout (GD&T) — FIM, Rotation Check & Total Runout | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Circular runout limits how much a surface may vary from its nominal position relative to a datum axis, as the part is rotated about that axis — one cross-section at a time. It is a composite control: a single dial-indicator reading over one revolution bundles together the section's roundness error and its coaxiality to the datum, without separating them, and that bundling is exactly why the control is so practical. Every prior symbol in this library is verified by static measurement; runout's defining characteristic is that the inspection itself involves physically spinning the part. The datum reference is mandatory — rotation about the datum axis is the whole method.`,
          ],
          diagram: { kind: "runout", variant: "circular", tolerance: "0.05", datum: "A" },
        },
        {
          heading: "What one FIM reading combines",
          text: [
            `The full indicator movement (FIM) over one revolution at a fixed section is a single number that includes everything that moved the stylus: out-of-roundness of that section, any offset of the section's center from the datum axis, and any wobble of the surface. It does not attempt to decompose them — a section that is perfectly round but mounted 0.03 off-center and a section that is centered but 0.03 lobed read identically, and both fail a 0.05 callout only if their combined excursion exceeds it. That compositeness is a feature for rotating parts, because what the function experiences — a bearing journal under a load, a seal seat under a lip — is precisely the combined effect. It also makes runout the fastest honest check in the whole GD&T toolbox: one indicator, one revolution, one number.`,
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`↗ 0.05 A–B` reads as: a circular runout tolerance of 0.05 FIM, evaluated as the part rotates about the common datum axis established by datums A and B. Runout never carries a material-condition modifier — it controls a surface, not a feature of size — and the arrow symbol takes no diameter symbol: the zone is a radial separation between concentric circles in one section, not a cylinder. Note the common datum A–B: runout is usually checked between two journal datums so the part spins on its functional axis rather than on one end.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "↗", label: "Geometric characteristic — circular runout" },
              { content: "0.05", label: "Tolerance value — allowed FIM (full indicator movement)" },
              { content: "A–B", label: "Datum references — the axis the part rotates about" },
            ],
            note: "The feature control frame, compartment by compartment. Runout never carries a material-condition modifier — it controls a surface — and the datum reference is mandatory because rotation about the datum axis is the inspection itself.",
          },
        },
        {
          heading: "Measurement",
          text: [
            `**Bench center + dial indicator** — mount the part on centers or in a V-block that reproduces the datum axis, zero the indicator on the controlled surface, rotate the part one full revolution, and read the total indicator movement; it must not exceed t. Move the indicator to the next section and repeat. This is the classic, fastest, cheapest geometric inspection there is.`,
            `**CMM rotation analysis** — probe each section and evaluate the radial variation in the rotated coordinate system. Used when the part cannot be spun (large or asymmetric geometry) or when the reading must be decomposed into roundness and offset components for process diagnosis.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Bearing journals and seal seats, where the combined round-and-concentric excursion is what the mating part actually feels`,
            `Rotating surfaces with a functional surface relationship to a datum axis — pulleys, gear blanks, rotor laminations`,
            `Any drawing where concentricity was about to be called out — runout is the surface-based, gaugeable control that does the intended job`,
            `First-article and incoming inspection, where a one-revolution dial check gives a pass/fail answer in seconds`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
  {
    kind: "total-runout", name: "Total runout", category: "Runout",
    meaning: "Limits composite variation over the entire surface in one measurement pass.",
    rule: "Datum required. Zone: two coaxial cylinders (or parallel planes for faces), radial width t over the full surface.",
    guide: {
      title: "Total Runout — Runout Tolerance",
      summary:
        "How the GD&T total runout tolerance works: rotation plus indicator traverse over the whole surface, the composite zone it enforces, and the deliberate parallel to cylindricity.",
      seoTitle: "Total Runout (GD&T) — Full-Surface Rotation Check & Zone | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            `Total runout limits how much an entire surface may vary relative to a datum axis, evaluated simultaneously as the part rotates and the indicator traverses along the surface. It is the whole-surface member of the runout family: where circular runout reads one section at a time, total runout's single pass covers every section at once, so it additionally controls the surface's straightness and taper along the length — variations that circular runout, checking section by section, never sees. Like its sibling, it is composite (roundness, coaxiality, straightness and taper all in one number), it requires a datum reference because rotation about the datum axis is the method, and it never takes a material-condition modifier because it controls a surface.`,
          ],
          diagram: { kind: "runout", variant: "total", tolerance: "0.05", datum: "A" },
        },
        {
          heading: "The zone, and the cylindricity parallel",
          text: [
            `The total runout zone is the space between two coaxial cylinders of radial separation t, centered on the datum axis, and the entire actual surface must fit between them in the single combined rotation-and-traverse evaluation. On a face perpendicular to the axis, the zone is instead two parallel planes t apart. The structure repeats a relationship this library has already seen: circular runout is to total runout what circularity is to cylindricity — the per-section control and the whole-surface control of the same family, with the whole-surface member additionally bounding the along-the-length errors. The difference is what the zone is anchored to: cylindricity's envelopes are self-referencing (no datum), while total runout's are centered on the datum axis — cylindricity controls form only, total runout controls form and location together, which is what makes it the stronger and more functional callout on rotating parts.`,
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`↻ 0.05 A–B` reads as: a total runout tolerance of 0.05, evaluated over the entire controlled surface as the part rotates about the common datum axis A–B. The double-arrow symbol is the only difference from circular runout's frame — same no-modifier rule (a surface, not a feature of size), same mandatory datum reference — but the two arrows change the meaning of the tolerance: not one section's FIM, but the whole surface's excursion in one pass. A drawing that needs both controls on the same surface calls them out in stacked frames, circular above total, tightening the per-section requirement inside the whole-surface one.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "↻", label: "Geometric characteristic — total runout" },
              { content: "0.05", label: "Tolerance value — whole-surface FIM in one pass" },
              { content: "A–B", label: "Datum references — the axis the part rotates about" },
            ],
            note: "The feature control frame, compartment by compartment. The double arrow is the whole distinction from circular runout: same surface-controlled, no-modifier, datum-required rules — but the tolerance now applies to the entire surface in one rotation-plus-traverse pass.",
          },
        },
        {
          heading: "Measurement",
          text: [
            `**Bench center + dial indicator with traverse** — mount the part on the datum axis, zero the indicator, then rotate the part continuously while sweeping the indicator along the full length of the controlled surface; the total indicator movement over the entire pass must not exceed t. Same bench setup as circular runout, one added motion.`,
            `**CMM surface scan** — probe the surface along helical or raster paths and evaluate the tightest pair of coaxial cylinders about the datum axis that contains the points. Used where the part cannot be rotated, or where the along-the-length components (taper, bow) must be separated for process work.`,
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            `Long rotating surfaces where taper or bow would matter as much as local roundness — lead screws, spindle surfaces, long shaft seats`,
            `Faces that must run square to the datum axis (total runout on a face uses a planar zone) — flange faces, bearing shoulders`,
            `Surfaces needing both a per-section and a whole-surface requirement — the stacked circular-over-total callout`,
            `Any location-plus-form requirement on a rotating surface where cylindricity alone would leave the surface free to sit anywhere relative to the datum`,
          ],
        },
      ],
      seeAlso: [{ name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" }],
    },
  },
];

/**
 * Second content type of the GD&T library: concept pages — the modifiers,
 * rules, datums, and the frame itself that the 14 symbol pages reference in
 * passing but never explain in depth. Deliberately NOT shaped like GdntSymbol:
 * concepts have no category, no rule string, and no zone shape — forcing them
 * into the symbol shape would misrepresent them. Each concept renders at the
 * same /cad/gdt/[slug] route via a combined lookup (see gdtEntry below), so
 * browsing stays continuous between symbols and concepts; the index groups
 * them under their own section.
 */
export type GdntConcept = {
  kind: string;
  name: string;
  /** Index grouping label, e.g. "Material condition". */
  tag: "Material condition" | "Rule" | "Datum" | "Frame & zone";
  /** One-line card description; doubles as the page's intro paragraph. */
  meaning: string;
  /** Long-form entry — same GdntGuide shape the symbol pages use. */
  guide: GdntGuide;
};

export const GDNT_CONCEPTS: GdntConcept[] = [
  {
    kind: "mmc", name: "Maximum Material Condition (MMC)", tag: "Material condition",
    meaning:
      "The Ⓜ modifier: the tolerance applies at maximum material, and departing from MMC grants bonus tolerance.",
    guide: {
      title: "Maximum Material Condition (MMC)",
      summary:
        "What maximum material condition means, when the Ⓜ modifier appears in a feature control frame, and how departing from MMC grants bonus tolerance equal to the departure.",
      seoTitle: "Maximum Material Condition (MMC) in GD&T — Ⓜ Modifier & Bonus Tolerance | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "A feature of size is at its maximum material condition (MMC) when it contains the maximum amount of material: a shaft at its largest allowed size, a hole at its smallest. The Ⓜ modifier in a feature control frame means the stated tolerance applies when the feature is produced exactly at MMC — and as the produced size departs from MMC, the tolerance zone grows by exactly that departure. That growth is the bonus tolerance. The same idea applies in both directions: departing from MMC means a shaft is produced smaller or a hole larger — always toward more clearance and less material.",
          ],
        },
        {
          heading: "The MMC boundary: virtual condition",
          text: [
            "At MMC the tolerance zone defines the worst-case boundary for assembly — the virtual condition. For an external feature (a pin) the virtual condition is the MMC size plus the position tolerance; for an internal feature (a hole) it is the MMC size minus the tolerance. Whatever assembles against the part must clear that boundary, and the boundary never moves: as the feature departs from MMC, the zone grows, but the guaranteed clearance boundary stays put. That is why MMC callouts can be checked with a fixed functional gauge — the gauge is built to the virtual condition.",
          ],
        },
        {
          heading: "Bonus tolerance in practice",
          text: [
            "The arithmetic is a straight subtraction. A hole with `⌖ ⌀0.5 Ⓜ` toleranced at Ø6.0 minimum is produced at Ø6.4: the departure from MMC is 6.4 − 6.0 = 0.4, so the position zone grows from 0.5 to 0.9 diameter. The part is easier to make than the frame first appears — which is the point of the modifier. The zone only ever grows; it never shrinks below the stated value.",
          ],
          diagram: { kind: "bonus", tolerance: "Ø0.5", mmcSize: "Ø6.0", actualSize: "Ø6.4", zoneSize: "Ø0.9" },
        },
        {
          heading: "Where Ⓜ applies — and where it can't",
          text: [
            "MMC exists only for features of size — a cylinder or a width between two parallel planes. The common applications: position (by far the most frequent), axis straightness (the one Form control that accepts it), and profile of a feature of size on later ASME revisions. Never: flatness, circularity, cylindricity, runout, concentricity, symmetry, or any surface-applied orientation control — those reference the surface directly, not a size-derived boundary, so there is nothing for the modifier to act on.",
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`⌖ ⌀0.5 Ⓜ A B C` reads as a position tolerance of 0.5 diameter at MMC, located from datums A, B and C in precedence order. The Ⓜ sits in the tolerance compartment immediately after the value — everything before the first datum letter is part of the tolerance unit. Without Ⓜ (or Ⓛ) the frame means the plain default, regardless of feature size.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⌖", label: "Geometric characteristic — position" },
              { content: "Ø0.5", label: "Tolerance value — zone diameter" },
              { content: "Ⓜ", label: "Material condition — applies at MMC, bonus on departure" },
              { content: "A", label: "Primary datum" },
              { content: "B", label: "Secondary datum" },
              { content: "C", label: "Tertiary datum" },
            ],
            note: "The Ⓜ sits right after the tolerance value, inside the same compartment. The frame applies the 0.5 zone when the feature is at MMC and grows it by the departure from MMC — which is exactly the boundary a functional gauge checks.",
          },
        },
        {
          heading: "Measurement",
          text: [
            "**Functional gauging** — a gauge built to the virtual condition. Fast and repeatable, the standard for high-volume production; the gauge passes every part whose boundary clears the virtual condition regardless of how the tolerance was consumed.",
            "**CMM coordinate measurement** — measure the feature's size and location, compute the departure from MMC, and add it to the base tolerance before judging the measured location error. Slower, but it reports exactly how much of the tolerance was used.",
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            "Clearance-hole patterns for fasteners, where the worst case is the smallest hole — the MMC boundary is the assembly guarantee",
            "Mating shafts and hubs where the fit is decided at maximum material",
            "Hard-to-hold locations where bonus tolerance can meaningfully cut scrap without relaxing the guaranteed fit",
            "Any callout a functional gauge must verify — gauges only make sense against the MMC boundary",
          ],
        },
      ],
      seeAlso: [
        { name: "Rule #1 — Envelope Principle", href: "/cad/gdt/rule-1" },
        { name: "True Position Calculator", href: "/cad/true-position-calculator" },
      ],
    },
  },
  {
    kind: "lmc", name: "Least Material Condition (LMC)", tag: "Material condition",
    meaning:
      "The Ⓛ modifier: the tolerance applies at least material — for walls, coatings and material retention.",
    guide: {
      title: "Least Material Condition (LMC)",
      summary:
        "What least material condition means, why wall thickness and material retention drive it, and the bonus tolerance granted as the feature departs from LMC toward MMC.",
      seoTitle: "Least Material Condition (LMC) in GD&T — Ⓛ Modifier & Material Retention | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "A feature of size is at its least material condition (LMC) when it contains the minimum amount of material: a shaft at its smallest allowed size, a hole at its largest. The Ⓛ modifier means the stated tolerance applies when the feature is produced exactly at LMC, and as the produced size departs from LMC — toward MMC — the tolerance zone grows by exactly that departure. The mechanism is identical to MMC; only the end of the size range is different, and with it the thing the callout protects.",
          ],
        },
        {
          heading: "Why LMC exists: material, not fit",
          text: [
            "MMC protects assembly — the clearance between mating features. LMC protects the material itself: the wall between a hole and an edge, the stock left for a plating or coating, the meat around a press-fit hub. A thin-walled boss with a large hole is at LMC exactly when the wall is thinnest, so that is the worst case for the wall — and therefore where the tolerance must be tightest. `⌖ ⌀0.5 Ⓛ` says: at the worst wall condition the location may be off by 0.5, and as the wall thickens (the feature departs from LMC) the allowed error grows. Function is protected at its weakest point, and manufacturability improves everywhere else.",
          ],
        },
        {
          heading: "Bonus tolerance from LMC",
          text: [
            "The arithmetic mirrors MMC. A hole toleranced at Ø6.4 maximum with `⌖ ⌀0.5 Ⓛ` is produced at Ø6.0: the departure from LMC is 6.4 − 6.0 = 0.4, so the position zone grows from 0.5 to 0.9 diameter. Note the direction — departing from LMC means moving toward MMC, the opposite of the MMC case, where the hole grows. Getting the direction wrong is the classic LMC error: the bonus always comes from departing the referenced condition, whichever end it sits on.",
          ],
          diagram: { kind: "bonus", mode: "lmc", tolerance: "Ø0.5", mmcSize: "Ø6.4", actualSize: "Ø6.0", zoneSize: "Ø0.9" },
        },
        {
          heading: "MMC vs. LMC: which end do you want?",
          text: [],
          list: [
            "Fit and clearance drive the design → MMC: the smallest hole / largest pin is the assembly worst case",
            "Wall thickness, coatings, or retained material drive the design → LMC: the largest hole / smallest pin is the functional worst case",
            "Neither — the tolerance must hold at every size → RFS, the plain default",
            "A casting or machined feature where a thin wall is both critical and hard to hold → LMC is the modifier that gives the wall the tolerance it needs exactly where it matters",
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`⌖ ⌀0.5 Ⓛ A B C` reads as a position tolerance of 0.5 diameter at LMC, located from datums A, B and C. The Ⓛ occupies the same slot as Ⓜ — right after the tolerance value — and the frame is read the same way; only the referenced end of the size range differs. Like Ⓜ, Ⓛ can only appear on features of size.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⌖", label: "Geometric characteristic — position" },
              { content: "Ø0.5", label: "Tolerance value — zone diameter" },
              { content: "Ⓛ", label: "Material condition — applies at LMC, bonus on departure" },
              { content: "A", label: "Primary datum" },
              { content: "B", label: "Secondary datum" },
              { content: "C", label: "Tertiary datum" },
            ],
            note: "Ⓛ after the tolerance value: the 0.5 zone applies at least material and grows as the feature departs from LMC toward MMC. The same frame with Ⓜ instead of Ⓛ protects fit instead of material — the worst cases sit at opposite ends of the size range.",
          },
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            "Thin walls whose minimum thickness is the functional requirement — the hole's worst location error must not thin the wall further",
            "Features that must retain material for plating, coating, or heat-treat stock removal",
            "Press-fit hubs and bosses where the material around the hole carries the load",
            "Castings with core shifts, where LMC concentrates the tolerance where the wall is weakest",
          ],
        },
      ],
      seeAlso: [
        { name: "Maximum Material Condition (MMC)", href: "/cad/gdt/mmc" },
        { name: "Regardless of Feature Size (RFS)", href: "/cad/gdt/rfs" },
      ],
    },
  },
  {
    kind: "rfs", name: "Regardless of Feature Size (RFS)", tag: "Material condition",
    meaning:
      "The default: the tolerance applies as stated at any produced size — no bonus, no symbol in the frame.",
    guide: {
      title: "Regardless of Feature Size (RFS)",
      summary:
        "The default material condition in modern ASME Y14.5 and ISO: the tolerance applies as stated at any produced size, with no bonus tolerance and no symbol in the frame.",
      seoTitle: "Regardless of Feature Size (RFS) in GD&T — the Default Material Condition | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "Regardless of feature size (RFS) means the geometric tolerance applies at its stated value no matter what size the feature is produced at. A `⌖ ⌀0.5 A B C` frame without any material modifier keeps its 0.5 zone whether the hole comes out at its minimum, its maximum, or anywhere between — the produced size has no effect on the tolerance. There is no bonus, ever: the zone is what the frame says it is.",
          ],
        },
        {
          heading: "RFS is the default — that's the part people miss",
          text: [
            "Since the 1994 revision of ASME Y14.5, RFS is the implied default for every tolerance that could otherwise take a material modifier. The old Ⓢ symbol was deleted; its absence in a modern frame does not mean anything special — it means RFS. ISO works the same way. The common confusion runs the other direction: a frame that does not show Ⓜ or Ⓛ is often assumed to be an MMC callout, when it is in fact the plain default. If a designer wants MMC they must write Ⓜ; nothing is implied by silence except RFS.",
          ],
        },
        {
          heading: "No bonus — and no functional gauge",
          text: [
            "Because the zone never grows, there is no MMC boundary to build a gauge to. A fixed functional gauge checks the virtual condition — an MMC concept — so an RFS callout cannot be functionally gauged. Verification needs variable measurement: the feature's location is measured against the tolerance at its actual size. For runout, concentricity, symmetry, and surface-applied orientation or form controls, RFS is not just the default but the only possibility — those controls never take a material modifier at all.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⌖", label: "Geometric characteristic — position" },
              { content: "Ø0.5", label: "Tolerance value — applies as stated" },
              { content: "A", label: "Primary datum" },
              { content: "B", label: "Secondary datum" },
              { content: "C", label: "Tertiary datum" },
            ],
            note: "The empty modifier slot IS the statement: no Ⓜ, no Ⓛ — the 0.5 zone applies at every produced size. Since Y14.5-1994 this is the default, so the frame is simply written without a modifier symbol.",
          },
        },
        {
          heading: "RFS vs. MMC vs. LMC",
          text: [],
          list: [
            "Assembly clearance drives the design → MMC: the worst case sits at maximum material and the zone grows from there",
            "Material retention drives the design → LMC: the worst case sits at least material",
            "The tolerance must hold at every size — or the size dependence is itself unwanted → RFS, the plain default",
            "The control cannot take a modifier at all (runout, concentricity, symmetry, surface form/orientation) → RFS, automatically",
          ],
        },
        {
          heading: "Measurement",
          text: [
            "**CMM coordinate measurement** — measure the location at the feature's actual size and judge it directly against the stated tolerance. The standard approach, and the only one for RFS callouts.",
            "**Indicator setups** — for runout and similar rotation-based checks, the RFS requirement is inherent to the measurement: the indicator reads the surface directly, with no size-dependent adjustment possible.",
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            "Features whose location must hold at any produced size — where bonus tolerance would let function degrade",
            "Runout, concentricity, symmetry, and surface-applied controls, where a modifier is not permitted",
            "Low-volume work verified by CMM, where the MMC boundary buys nothing and a gauge would never be built anyway",
            "Mating pairs where the size and location are functionally independent",
          ],
        },
      ],
      seeAlso: [
        { name: "Maximum Material Condition (MMC)", href: "/cad/gdt/mmc" },
        { name: "Least Material Condition (LMC)", href: "/cad/gdt/lmc" },
      ],
    },
  },
  {
    kind: "feature-control-frame", name: "Feature Control Frame", tag: "Frame & zone",
    meaning:
      "The box that carries a geometric requirement: characteristic symbol, tolerance value, modifiers, and datum references.",
    guide: {
      title: "Feature Control Frame — Anatomy & Reading",
      summary:
        "The complete anatomy of the GD&T feature control frame: characteristic symbol, tolerance value, modifiers, and datum references in precedence order — with how to read one.",
      seoTitle: "Feature Control Frame (FCF) in GD&T — Anatomy, Compartments & How to Read | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The feature control frame is the box that carries a geometric requirement on a drawing. Every control in this library — position, flatness, profile, runout, all of them — is written inside one: the characteristic symbol, the tolerance, and the datums that locate the zone. The frame is a complete requirement in itself: nothing about the geometric control lives anywhere else on the drawing. The dimension lines give the geometry; the frame gives the geometric requirement on that geometry.",
          ],
        },
        {
          heading: "The compartments",
          text: [
            "A frame is read left to right, exactly as written. Compartment 1 holds the geometric characteristic symbol — which control applies. Compartment 2 holds the tolerance value: a Ø prefix means a diameter zone (a cylinder around an axis), no prefix means a width between two lines or planes; a material condition modifier (Ⓜ, Ⓛ, or Ⓘ) may follow the value in the same compartment. The remaining compartments hold datum references in precedence order — primary first, then secondary, then tertiary — and each datum letter may carry its own modifier.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⌖", label: "Compartment 1 — characteristic symbol" },
              { content: "Ø0.5", label: "Compartment 2 — tolerance value (Ø = diameter zone)" },
              { content: "Ⓜ", label: "Modifier — Ⓜ/Ⓛ/Ⓘ, part of the tolerance unit" },
              { content: "A", label: "Primary datum — establishes the first reference" },
              { content: "B", label: "Secondary datum" },
              { content: "C", label: "Tertiary datum — completes the reference frame" },
            ],
            note: "The anatomy frame, compartment by compartment. Everything before the first datum letter — value, Ø, material modifier — is one tolerance unit; the datum compartments that follow list the reference frame in precedence order.",
          },
        },
        {
          heading: "How to read one",
          text: [
            "`⌖ ⌀0.5 Ⓜ A B C` reads: position control, 0.5 diameter zone at MMC, located from datum A first, then B, then C. Read the tolerance unit as one piece — `Ø0.5 Ⓜ` — then the datums as the reference frame. A frame with no datum compartments at all (e.g. `⏥ 0.2`) is self-referencing: the zone is established from the feature itself, which is what makes a control a Form tolerance. The number of datum compartments is itself information: none = form only, one or more = the zone is anchored to the datum reference frame.",
          ],
        },
        {
          heading: "Common variations",
          text: [],
          list: [
            "No datum compartment — a Form control, self-referencing (`⏥ 0.2`)",
            "One datum — surface-applied orientation controls like `⟂ 0.1 A`",
            "Two or three datums — location controls and anchored profile, e.g. `⌖ ⌀0.5 Ⓜ A B C`",
            "A Ø prefix — the zone is a cylinder, not a width: axis features and features of size",
            "Modifiers in the tolerance compartment — Ⓜ/Ⓛ for bonus tolerance, Ⓟ for a projected zone, Ⓘ for independency",
            "Modifiers after datum letters — a datum referenced at its MMC boundary, e.g. `A Ⓜ`",
            "Stacked frames — the same feature with several requirements, like composite position: each row is a separate requirement",
          ],
        },
        {
          heading: "Common mistakes",
          text: [],
          list: [
            "Reading Ⓜ as if it modified the datums — it modifies the tolerance unless a modifier appears after a datum letter",
            "Assuming an absent modifier means MMC — it means RFS, the default",
            "Confusing Ø and no-Ø: Ø makes the zone a cylinder, never a width",
            "Reordering datums — A B C is a precedence order, not a list; swapping them changes the reference frame and the part's meaning",
            "Attaching the frame to the wrong element — a frame on a surface controls the surface; the same frame below a size dimension controls the axis",
          ],
        },
      ],
      seeAlso: [
        { name: "Projected Tolerance Zone (Ⓟ)", href: "/cad/gdt/projected-zone" },
        { name: "Maximum Material Condition (MMC)", href: "/cad/gdt/mmc" },
        { name: "True Position Calculator", href: "/cad/true-position-calculator" },
      ],
    },
  },
  {
    kind: "datum-feature", name: "Datum Feature", tag: "Datum",
    meaning:
      "The actual surface labeled A/B/C on the part — and the perfect theoretical datum derived from it.",
    guide: {
      title: "Datum Feature — Feature vs. Datum",
      summary:
        "The distinction between a datum feature — the actual physical surface on the part — and the perfect theoretical datum derived from it, plus datum selection and precedence.",
      seoTitle: "Datum Feature vs. Datum in GD&T — Selection, Simulation & Precedence | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "A datum feature is an actual, physical feature of the part — a face, a bore, a shoulder — labeled with a datum letter (A, B, C) and selected to serve as the origin for measurements. The datum itself is something else entirely: the perfect theoretical plane, axis, or point derived from that feature. Every symbol page in this library that references datums — position, profile with datums, orientation, runout — is really saying: measure from the datum, which is established by the datum feature.",
          ],
        },
        {
          heading: "The feature vs. the datum",
          text: [
            "No real surface is perfectly flat, and no real bore is perfectly round. The datum feature is what you can touch; the datum is the perfect reference the feature simulates against — a surface plate, a chuck, a V-block, a mandrel. The drawing's datum triangle attaches to the feature; the measurements attach to the datum. Blurring the two is the most common conceptual error in GD&T, and it is exactly what causes mislabeled drawings: a callout referencing datum A means the derived datum plane, not the wavy surface that produced it.",
          ],
          diagram: { kind: "datum-feature" },
        },
        {
          heading: "Selecting datum features",
          text: [],
          list: [
            "Choose the surfaces the part actually assembles against — mounting faces, mating bores, bearing shoulders — not convenient flats on the drawing",
            "Prefer the largest, most stable surface as the primary datum: three widely spaced contact points make the most repeatable plane",
            "Make sure the feature can be simulated in inspection — a surface plate, a mandrel, or a CMM fixture must be able to reproduce the datum",
            "Prefer machined features over cast or forged surfaces when the datum must be repeatable",
            "Keep the datum chain short: every datum is itself located from the previous one, so each addition stacks error",
          ],
        },
        {
          heading: "Precedence: primary, secondary, tertiary",
          text: [
            "Datums are established in the order they appear in the feature control frame. The primary datum is established first — a plane, simulated by three points of contact. The secondary datum is then established relative to the primary — typically two points, a line or an axis. The tertiary datum completes the reference frame with a single point. This is the 3-2-1 rule, and it is why the order in the frame matters: A B C is a precedence order, not a menu. Each datum removes degrees of freedom, and the frame lists them in the order the part is physically constrained.",
          ],
        },
        {
          heading: "When the surface can't be a datum feature",
          text: [
            "A datum feature must be repeatable. When the actual surface is too rough or irregular to establish a stable reference — rough castings, forgings, weldments — the drawing calls out specific points, lines, or areas instead: datum targets. The targets are contacted by the simulator and collectively establish the datum. See the Datum Target page for that mechanism; the distinction to keep here is that the datum feature is the whole physical feature, and the datum target is the alternative when the feature can't be referenced in full.",
          ],
        },
        {
          heading: "Measurement",
          text: [
            "**Simulation** — the classic method: the part is placed against a physical simulator (surface plate for a plane datum, mandrel for a bore axis, V-block for a cylinder) and everything is measured from the simulator, never from the imperfect surface directly.",
            "**CMM** — the datum feature is measured, then the perfect datum (plane, axis, point) is fitted to the measured data exactly as the simulator would establish it, and the controlled features are evaluated relative to that derived datum.",
          ],
        },
      ],
      seeAlso: [
        { name: "Datum Target", href: "/cad/gdt/datum-target" },
        { name: "Rule #1 — Envelope Principle", href: "/cad/gdt/rule-1" },
      ],
    },
  },
  {
    kind: "datum-target", name: "Datum Target", tag: "Datum",
    meaning:
      "Points, lines and areas on rough surfaces that collectively establish a datum.",
    guide: {
      title: "Datum Target — Points, Lines & Areas",
      summary:
        "How datum targets establish datums on surfaces too rough or irregular to reference in full — the point, line, and area callouts and how they work together.",
      seoTitle: "Datum Targets in GD&T — Points, Lines & Areas (A1, A2, …) | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "A datum target is a specific point, line, or small area on a datum feature, called out individually when the feature's actual surface is too rough or irregular to reference in full. The datum simulator contacts those specific targets — and only those targets — and the datum is established through them. Rough castings, forgings, and weldments are the classic cases: a wavy as-cast surface touches a surface plate at unpredictable high spots, so the drawing makes the contact points deliberate instead of accidental.",
          ],
        },
        {
          heading: "Why targets exist",
          text: [
            "A machined face references a surface plate the way it was made — everywhere, repeatably. A rough casting does not: its high spots are wherever the mold happened to leave them, so two copies of the same part establish different datums if the whole surface is referenced. Targets fix the datum in space: the drawing says the simulator contacts A1, A2 and A3 — no more, no less — so the datum plane is the same on every copy. The functional contact the part will actually make in service is often point-like too, which makes targets the honest way to reference sheet metal and large thin castings.",
          ],
        },
        {
          heading: "How targets are called out",
          text: [
            "Each target is marked with the target symbol — a circle divided by a horizontal line — carrying the datum letter plus a number: A1, A2, A3 for datum A's targets. A point target is the plain symbol. A line target adds a leader showing the line's length and orientation. An area target encloses the area in phantom boundary lines, with the symbol and a size. Whatever the type, the letter says which datum the target helps establish and the number tells the inspector which target it is.",
          ],
          diagram: { kind: "datum-target" },
        },
        {
          heading: "Establishing the datum from targets",
          text: [
            "Targets establish a datum exactly the way surfaces do, through the same 3-2-1 logic: three point targets on the primary datum feature establish the primary plane; two more (or a line target) establish the secondary; one completes the frame. The simulator contacts each target — fixed points, adjustable tooling points, or rest buttons on a fixture — and the plane through the three primary contacts is the datum plane. For thin sheet metal, area targets spread the contact so the part doesn't deform at the points.",
          ],
        },
        {
          heading: "When to use them",
          text: [],
          list: [
            "Rough castings and forgings whose surface cannot be referenced in full",
            "Sheet-metal parts where the real functional contact is point-like and full-surface contact would deform the part",
            "Large weldments where referencing the whole surface would over-constrain the datum",
            "Parts that will be located in a fixture by specific pads or tooling points anyway — targets document the fixture contact",
          ],
        },
        {
          heading: "When not to",
          text: [
            "A machined surface that can be referenced in full should be referenced in full. Putting targets on a flat, repeatable face adds nothing but fixture complexity, and it throws away the datum quality the machined surface already provides. Targets are the tool for irregular surfaces, not a decoration on good ones.",
          ],
        },
      ],
      seeAlso: [
        { name: "Datum Feature", href: "/cad/gdt/datum-feature" },
      ],
    },
  },
  {
    kind: "rule-1", name: "Rule #1 — Envelope Principle", tag: "Rule",
    meaning:
      "The envelope principle: perfect form at MMC, with form error bounded as the size departs from MMC.",
    guide: {
      title: "Rule #1 — The Envelope Principle",
      summary:
        "Rule #1, the ASME envelope principle: a feature of size must have perfect form at MMC, and form error is allowed only as the size departs from MMC toward LMC.",
      seoTitle: "Rule #1 (Envelope Principle) in GD&T — Perfect Form at MMC | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "Rule #1 — the envelope principle — is the ASME Y14.5 default that ties a feature of size's form to its size: the surface must not extend beyond the boundary (envelope) of perfect form at MMC. A pin at its largest allowed size must be perfectly straight, round, and cylindrical — there is no room left for form error inside its own boundary. As the produced size departs from MMC toward LMC, form error is allowed to grow, up to the amount of the size departure. The size tolerance therefore carries a built-in form tolerance, and that form tolerance is exactly zero at MMC.",
          ],
        },
        {
          heading: "The envelope",
          text: [
            "The envelope is the boundary of perfect form at the MMC size — the ideal cylinder or width pair the feature would have if it were perfect at its worst size. The rule says the actual surface may bow, taper, or go out of round, but never so far that it breaks through that boundary. A Ø10 ±0.1 pin produced at Ø9.95 may bend by up to 0.05 — the distance from its size back to the Ø10 envelope — and no more. The form error is paid for out of the size departure, one for one.",
          ],
          diagram: { kind: "envelope", variant: "rule1" },
        },
        {
          heading: "What Rule #1 controls — and what it doesn't",
          text: [
            "Rule #1 bounds the form of features of size: cylinders and widths between parallel planes. Straightness, roundness, and cylindricity of such a feature are already limited by size plus Rule #1 — which is why a separate form callout is only added when the function needs tighter form than the size-derived envelope provides, and why such a callout layers on top of the envelope rather than replacing it. Rule #1 does not control flatness of a surface (a flat face is not a feature of size), and it says nothing about orientation or location: a perfectly cylindrical pin can lean, and Rule #1 will not complain.",
          ],
        },
        {
          heading: "Rule #1 and MMC are the same boundary",
          text: [
            "The envelope is exactly the boundary the Ⓜ modifier builds on: the MMC boundary of a position callout is the virtual condition, and a functional gauge checks that boundary. This is why MMC and the envelope belong together — when a feature fits a gauge built to virtual condition, Rule #1 is what made its form acceptable along the way. Axis straightness at MMC is the one Form control that engages this boundary directly: its zone is the cylindrical envelope around the derived median line, measured from the same MMC logic. See the Maximum Material Condition and Straightness pages for those mechanisms.",
          ],
        },
        {
          heading: "When Rule #1 does not apply",
          text: [],
          list: [
            "When the drawing explicitly invokes independency Ⓘ — the ASME opt-out that removes the envelope (see the Independency page)",
            "Under ISO drawings, where independence — not the envelope — is the default, and Ⓔ restores envelope behavior (see the Envelope Requirement page)",
            "For non-rigid parts, which are handled with their own special rules when flexibility is part of the function",
            "For features that are not features of size — surfaces, and any control that does not involve a size-derived boundary",
          ],
        },
        {
          heading: "What it means for your design",
          text: [],
          list: [
            "You usually do not need to add straightness or cylindricity to a plain pin or bore — size plus Rule #1 already bounds form",
            "When the envelope is not what you want — waviness must be tolerated, or form is controlled separately — say so explicitly with Ⓘ",
            "When you need tighter form than size provides, add a form tolerance: it stacks on top of the envelope instead of replacing it",
            "For ISO work, remember the default is flipped — without Ⓔ there is no envelope at all",
          ],
        },
      ],
      seeAlso: [
        { name: "Maximum Material Condition (MMC)", href: "/cad/gdt/mmc" },
        { name: "Independency (Ⓘ)", href: "/cad/gdt/independency" },
        { name: "Envelope Requirement (Ⓔ) — ISO", href: "/cad/gdt/envelope-requirement" },
        { name: "Straightness — axis application", href: "/cad/gdt/straightness" },
      ],
    },
  },
  {
    kind: "independency", name: "Independency (Ⓘ)", tag: "Rule",
    meaning:
      "The Ⓘ modifier that removes Rule #1's envelope — size and form become independent requirements.",
    guide: {
      title: "Independency (Ⓘ) — Opting Out of Rule #1",
      summary:
        "The ASME independency modifier: it removes Rule #1's envelope from a feature of size, making size and form independent requirements.",
      seoTitle: "Independency (Ⓘ) in GD&T — Removing Rule #1's Envelope | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "Independency (Ⓘ) explicitly removes Rule #1's envelope requirement from a feature of size. Size and form become independent requirements: the size must stay within its stated limits, and the form is whatever the actual surface happens to be — the MMC envelope imposes nothing. Under ASME Y14.5 the Ⓘ symbol is placed in the tolerance compartment of the feature control frame, right where Ⓜ or Ⓛ would go; earlier revisions invoked the same principle by drawing note.",
          ],
        },
        {
          heading: "The envelope removed",
          text: [
            "With the envelope gone, a feature can be at or near its MMC size and still carry form error: a Ø10 ±0.1 pin produced at Ø9.95 may bow by more than the 0.05 that Rule #1 would have allowed — even past the Ø10 boundary — as long as its measured size stays within limits and its form does not violate any form tolerance the drawing adds. The surface is allowed to poke through the MMC boundary because there is no boundary; the only requirements are the ones explicitly written.",
          ],
          diagram: { kind: "envelope", variant: "independency" },
        },
        {
          heading: "The default inversion, ASME vs. ISO",
          text: [
            "This is the mirror image at the heart of the ASME/ISO difference. ASME defaults to Rule #1 — the envelope is in force unless Ⓘ says otherwise. ISO defaults to independence — form and size vary freely unless Ⓔ (the envelope requirement) says otherwise. Same two ideas, opposite defaults: ASME draws the opt-out, ISO draws the opt-in. A drawing interpreted under the wrong standard silently gains or loses its envelope, which changes what parts pass inspection.",
          ],
        },
        {
          heading: "When independency is used",
          text: [],
          list: [
            "Flexible parts — stampings, seals, thin sheet — where an envelope would be impossible or meaningless to hold",
            "Features whose form is controlled separately with a real form tolerance, so the envelope would be redundant and double-counted",
            "Long, slender parts where Rule #1 would force a straightness the function does not need",
            "Parts that run with deliberate waviness — bearing and seal surfaces where the texture is part of the design",
          ],
        },
        {
          heading: "The cost of opting out",
          text: [
            "Rule #1 is usually free: it guarantees the assembly fit that MMC callouts and functional gauges rely on, at no extra inspection cost — the size check already implies the form check. Independency removes that guarantee, so mating clearances must be re-verified directly and gauges built to virtual condition no longer imply form acceptability. Opt out when the envelope genuinely is not wanted; do not opt out for the sake of it.",
          ],
        },
      ],
      seeAlso: [
        { name: "Rule #1 — Envelope Principle", href: "/cad/gdt/rule-1" },
        { name: "Envelope Requirement (Ⓔ) — ISO", href: "/cad/gdt/envelope-requirement" },
      ],
    },
  },
  {
    kind: "envelope-requirement", name: "Envelope Requirement (Ⓔ) — ISO Only", tag: "Rule",
    meaning:
      "ISO's opt-in envelope: Ⓔ restores the MMC boundary that ISO leaves off by default.",
    guide: {
      title: "Envelope Requirement (Ⓔ) — ISO Only",
      summary:
        "The ISO 8015 / ISO 14405-1 envelope requirement: Ⓔ restores the perfect-form-at-MMC boundary that ISO leaves off by default — the mirror of ASME's Rule #1.",
      seoTitle: "Envelope Requirement (Ⓔ) in ISO GD&T — the ASME vs. ISO Default Inversion | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The envelope requirement (Ⓔ) is the ISO symbol that requires a feature of size to stay within its envelope of perfect form at MMC — the same behavior ASME gets by default from Rule #1. Under ISO 8015 and ISO 14405-1 that behavior is not the default: ISO specifies independence by default, so Ⓔ must be explicitly written when the envelope is wanted. The symbol is placed in the tolerance compartment, after the tolerance value it qualifies.",
          ],
        },
        {
          heading: "The default inversion",
          text: [
            "The two standards are exact mirror images, and this is the most confused cross-standard point in GD&T. ASME: the envelope is in force unless Ⓘ is shown. ISO: independence is in force unless Ⓔ is shown. The same drawing intent is expressed by different defaults in each system, and a bare size tolerance means opposite things: under ASME it carries an envelope, under ISO it does not. Inspecting an ASME drawing to ISO defaults silently drops the envelope requirement — parts with wavy but in-limit sizes pass when they should fail, or the reverse when the standards are mixed the other way.",
          ],
        },
        {
          heading: "What Ⓔ requires",
          text: [
            "A size tolerance with Ⓔ — `Ø10 ±0.1 Ⓔ` — carries two requirements at once: the feature's size must stay within limits, and its surface must not extend beyond the envelope of perfect form at the MMC size. Form error is bounded exactly the way Rule #1 bounds it under ASME: none at MMC, growing as the size departs toward LMC.",
          ],
          diagram: {
            kind: "envelope",
            variant: "rule1",
            note: "The dashed boundary is the envelope of perfect form at MMC that Ⓔ restores. Without Ⓔ the ISO default is independence — size and form vary freely; with Ⓔ the feature must stay inside the envelope, the same behavior Rule #1 gives ASME drawings by default. Schematic, exaggerated.",
          },
        },
        {
          heading: "Working across standards",
          text: [],
          list: [
            "Know which standard the drawing is made to — the title block usually states it; never guess between ASME and ISO defaults",
            "On ASME drawings, do not write Ⓔ — it is not an ASME symbol; the envelope is already the default and Ⓘ is the only opt-out",
            "On ISO drawings, write Ⓔ only where the envelope is genuinely required — otherwise you pay for form control the function does not need",
            "In mixed supply chains, state the governing standard explicitly in the contract or the drawing header; the default difference is real and changes what passes inspection",
            "When a bare size tolerance arrives from a shop using the other standard, ask — the envelope question is a specification question, not an inspection judgment call",
          ],
        },
      ],
      seeAlso: [
        { name: "Rule #1 — Envelope Principle", href: "/cad/gdt/rule-1" },
        { name: "Independency (Ⓘ)", href: "/cad/gdt/independency" },
      ],
    },
  },
  {
    kind: "projected-zone", name: "Projected Tolerance Zone (Ⓟ)", tag: "Frame & zone",
    meaning:
      "The Ⓟ modifier that projects the zone above a threaded hole, to control the fastener itself.",
    guide: {
      title: "Projected Tolerance Zone (Ⓟ)",
      summary:
        "The Ⓟ modifier that extends a position tolerance zone beyond the feature itself — most commonly above a threaded or press-fit hole, to the height the fastener projects.",
      seoTitle: "Projected Tolerance Zone (Ⓟ) in GD&T — Threaded Holes & Fasteners | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The projected tolerance zone (Ⓟ) extends the tolerance zone beyond the feature itself — most commonly above a threaded or press-fit hole, to the height the mating fastener will project. The zone starts at the surface and runs out to a specified height H, and the fastener must lie within it over that entire height, not just where the hole is. The symbol sits in the tolerance compartment after the tolerance value, with the projected height following it: `⌖ ⌀0.2 Ⓟ 10 A B`.",
          ],
        },
        {
          heading: "Why the zone needs projecting",
          text: [
            "A position tolerance on a threaded hole controls the hole's location at the surface of the part — but the stud or bolt projecting from that hole can lean, and a small angular error grows with distance. The mating part clears the fastener over its whole thickness, not at the hole mouth, so the tolerance that matters is the fastener's location at the top of the projection. A surface-only callout can pass a leaning stud that jams the assembly; the projected zone states the requirement where the function actually happens.",
          ],
          diagram: { kind: "projected-zone", tolerance: "Ø0.2", height: "10" },
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`⌖ ⌀0.2 Ⓟ 10 A B` reads as a position tolerance of 0.2 diameter, projected 10 beyond the surface, located from datums A and B. The Ⓟ and the height both live in the tolerance compartment, after the value. The zone is oriented and located from the datums exactly like an ordinary position zone — the projection only changes where it applies, not how it is anchored.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⌖", label: "Geometric characteristic — position" },
              { content: "Ø0.2", label: "Tolerance value — zone diameter" },
              { content: "Ⓟ", label: "Projected tolerance zone modifier" },
              { content: "10", label: "Projected height — H = 10" },
              { content: "A", label: "Primary datum" },
              { content: "B", label: "Secondary datum" },
            ],
            note: "The Ⓟ and the projected height follow the tolerance value in the tolerance compartment. The zone extends H = 10 above the surface, and the fastener must stay inside it over that whole height.",
          },
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            "Threaded holes for bolted assemblies where the bolt projects into a mating part — the classic case",
            "Press-fit studs and posts that must clear a cover plate or second part above",
            "Any stack-up where the fastener's far end, not the hole mouth, is the functional point",
            "Not for short projections or thin mating parts where the surface tolerance already dominates — the added inspection cost buys nothing",
          ],
        },
        {
          heading: "Measurement",
          text: [
            "**Functional gauge with an extended pin** — a pin longer than the projected height, threaded or pressed into the hole; the part passes when the pin clears the gauge over its full projection. The classic high-volume check.",
            "**CMM at the projected height** — measure the hole axis at the surface, extend it to H above, and evaluate the axis against the zone at that height. Accurate, and it reports how the error breaks down between translation and lean.",
            "**Indicator setups** — with the part mounted to its datums, an indicator at height H reads the fastener or a tight-fitting plug as the part rotates; FIM stays within the zone diameter.",
          ],
        },
      ],
      seeAlso: [
        { name: "Feature Control Frame", href: "/cad/gdt/feature-control-frame" },
        { name: "True Position Calculator", href: "/cad/true-position-calculator" },
      ],
    },
  },
  {
    kind: "unequally-disposed-profile", name: "Unequally Disposed Profile (Ⓤ)", tag: "Frame & zone",
    meaning:
      "The Ⓤ modifier that shifts a profile zone off-center — more of the tolerance on one side of the true profile than the other.",
    guide: {
      title: "Unequally Disposed Profile (Ⓤ)",
      summary:
        "The Ⓤ modifier for profile tolerances: how `0.2 Ⓤ 0.05` shifts the zone so 0.05 lies outside the material and 0.15 inside — and when an off-center zone beats the default 50/50 split.",
      seoTitle: "Unequally Disposed Profile (Ⓤ) in GD&T — Off-Center Profile Zones | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "By default, a profile tolerance zone is bisected by the true profile: half the tolerance outside the material, half inside — an equal bilateral zone. The Ⓤ modifier (unequally disposed profile) shifts that split. It is written directly after the profile tolerance value as `t Ⓤ u`, where u is the amount of the total tolerance t that lies OUTSIDE the material; the remainder, t − u, lies inside. The zone width never changes — only its position relative to the true profile does. `0.2 Ⓤ 0.05` is a 0.2-wide zone with 0.05 outside and 0.15 inside.",
          ],
          diagram: { kind: "profile-surface", mode: "unequal", tolerance: "0.4", outside: "0.3" },
        },
        {
          heading: "The two limiting cases: unilateral zones",
          text: [
            "Set u equal to t and the entire zone lies outside the material — unilateral outside. Set u to zero and the entire zone lies inside — unilateral inside. Both appear constantly on castings and forgings: a casting's profile callout placed fully outside guarantees machining stock on every surface, because the as-cast surface may only err in the direction that leaves material for the finish pass. Without Ⓤ the same callout would let the casting run thin, scrapping the part at machining.",
          ],
        },
        {
          heading: "Why shift the zone?",
          text: [],
          list: [
            "Machining stock on castings and forgings — the whole zone goes outside so every part carries material to clean up",
            "Coating and plating allowance — keep most of the zone on the side the coating will occupy, so the post-plate surface lands in tolerance",
            "Edge and wall protection — concentrate the tolerance away from the thin wall or sharp edge that actually matters",
            "Functional offset — the mating condition genuinely sits closer to one side of the nominal surface than the other",
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`⌓ 0.4 Ⓤ 0.3 A B` reads as: profile of a surface, total zone 0.4 wide, unequally disposed with 0.3 outside the material (0.1 inside), referenced to datums A and B. The Ⓤ and its value live in the tolerance compartment, immediately after the total value — exactly the slot Ⓜ, Ⓛ and Ⓟ occupy on other controls. The value after Ⓤ is always the OUTSIDE portion; writing the inside portion there is the classic misread, and it produces a mirrored zone.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⌓", label: "Geometric characteristic — profile of a surface" },
              { content: "0.4", label: "Tolerance value — TOTAL zone width (never re-split)" },
              { content: "Ⓤ", label: "Unequally disposed profile modifier" },
              { content: "0.3", label: "Portion of the zone OUTSIDE the material" },
              { content: "A", label: "Primary datum" },
              { content: "B", label: "Secondary datum" },
            ],
            note: "The value after Ⓤ is the portion of the total tolerance outside the material — 0.3 of the 0.4 here, leaving 0.1 inside. The zone width stays 0.4; Ⓤ moves it, it never widens it.",
          },
        },
        {
          heading: "ISO difference",
          text: [
            "ISO 1101 writes the same intent differently: the UZ modifier followed by a signed offset of the zone CENTER — `0.4 UZ +0.1` puts the zone's midplane 0.1 outside the true profile, which equals `0.4 Ⓤ 0.3` under ASME. The offset direction and the reference point both differ (ASME counts from the outside surface inward; ISO locates the center), so converting between the systems is arithmetic worth double-checking, not a symbol swap.",
          ],
        },
        {
          heading: "Measurement",
          text: [
            "**CMM / scanning** — best-fit or datum-aligned against the true profile, then report each point's deviation with its sign; the outside-direction deviations must stay within u, the inside-direction deviations within t − u. The only change from an ordinary profile evaluation is that the acceptance band is no longer symmetric.",
            "**Optical comparator** — overlay the shifted tolerance band, not the symmetric one: the band's centerline sits u − t/2 from the true profile on the drawing's overlay, so off-the-shelf equal-band templates misjudge parts near the limits.",
          ],
        },
      ],
      seeAlso: [
        { name: "Profile of a Surface", href: "/cad/gdt/profile-surface" },
        { name: "Profile of a Line", href: "/cad/gdt/profile-line" },
        { name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" },
      ],
    },
  },
  {
    kind: "continuous-feature", name: "Continuous Feature (CF)", tag: "Rule",
    meaning:
      "The CF symbol that makes separated, interrupted features evaluate as one single continuous feature.",
    guide: {
      title: "Continuous Feature (CF)",
      summary:
        "The CF symbol: two or more separated features — or surfaces — that the drawing requires to be treated as one continuous feature for size, Rule #1 and every geometric control.",
      seoTitle: "Continuous Feature (CF) Symbol in GD&T — Interrupted Features as One | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The continuous feature symbol — the letters CF in an irregular hexagon, or the note CONTINUOUS FEATURE — declares that two or more physically separate features are to be evaluated as one single continuous feature. The separation can be grooves turning one cylinder into three segments, or slots splitting one face into two. Without CF, each segment is its own feature: its own size limits, its own Rule #1 envelope, its own geometric zone. With CF, one dimension and one set of controls governs them all, exactly as if the interruption were not there.",
          ],
          diagram: { kind: "continuous-feature", variant: "boss", tolerance: "Ø30" },
        },
        {
          heading: "What changes when CF is applied",
          text: [
            "On a feature of size, CF unifies the size and the form boundary: a boss interrupted by O-ring grooves becomes one Ø30 feature of size, so Rule #1 applies a single perfect-form-at-MMC envelope over all segments, and any geometric control — perpendicularity, position — applies to the unified feature rather than per segment. That is usually the point: the mating O-ring or seal rides across the interruption and only a single continuous envelope describes what it actually feels.",
          ],
        },
        {
          heading: "The 2018 extension: surfaces and datums",
          text: [
            "ASME Y14.5-2009 introduced CF for features of size only. The 2018 edition extends it: the symbol may now follow a feature control frame controlling surfaces — so a flatness callout with CF over two faces separated by a slot evaluates both faces as one continuous surface — and may accompany a datum feature symbol, treating separated datum features as one datum. An optional nX (e.g. 2X) beside the symbol states how many features are being united; it is clarification, not requirement.",
          ],
          diagram: { kind: "continuous-feature", variant: "slot", tolerance: "0.05" },
        },
        {
          heading: "CF vs. nX",
          text: [
            "The distinction matters and the two are often confused. `4X` on a callout means four INDEPENDENT features, each held separately. CF means the features are NOT independent — they are one. A position callout `⌖ Ø0.5 Ⓜ A B C` with 4X gives each hole its own zone; adding CF would fuse them into one requirement evaluated across all four, which is rarely intended. CF exists for the rarer case where separation is physical (grooves, slots, clearance reliefs) but function is continuous.",
          ],
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            "Sealing and bearing surfaces interrupted by grooves — the seal sees one surface, so specify one",
            "Mating ways and slides split by relief gaps, where the mating part bridges the gap",
            "Clamping or bolted faces separated by slots that must stay coplanar as one surface",
            "Interrupted threads or splines where the envelope must span the interruptions",
          ],
        },
      ],
      seeAlso: [
        { name: "Rule #1 — Envelope Principle", href: "/cad/gdt/rule-1" },
        { name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" },
      ],
    },
  },
  {
    kind: "free-state", name: "Free State (Ⓕ)", tag: "Rule",
    meaning:
      "The Ⓕ modifier: the tolerance applies to the part unrestrained — no clamping, no fixturing, natural shape.",
    guide: {
      title: "Free State (Ⓕ) — Non-Rigid Parts",
      summary:
        "The Ⓕ free-state modifier: when a tolerance is checked with the part unrestrained, why non-rigid parts need it, and how it interacts with the restrained-condition note.",
      seoTitle: "Free State (Ⓕ) Symbol in GD&T — Non-Rigid Parts & Natural Shape | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The free-state modifier Ⓕ — the letter F in a circle, placed in the tolerance compartment after the tolerance value — states that the tolerance applies with the part completely unrestrained: no clamps, no fixtures, no fasteners, nothing but gravity. Free state means the condition where forces other than gravity are not applied; the part shows its natural shape. For rigid parts the distinction is academic — clamping does not meaningfully move a steel block. For non-rigid parts it is everything: thin sheet metal, gaskets, seals, and plastic parts deflect visibly under their own weight, and clamping them flat during inspection measures the fixture as much as the part.",
          ],
        },
        {
          heading: "The default, and why Ⓕ exists at all",
          text: [
            "Under ASME Y14.5, dimensions and tolerances are verified in the free state by default — no symbol is needed for that to be true. Ⓕ exists because of its interaction with the restrained-condition note: when a drawing requires a part to be restrained for inspection, Ⓕ attached to a specific tolerance opts that tolerance back out, requiring it in the free state while everything else is checked restrained. It is a per-tolerance override on a drawing-level requirement, and its most common home is exactly there — a restrained drawing with a few tolerances that only make sense unrestrained.",
          ],
          diagram: { kind: "free-state" },
        },
        {
          heading: "Average diameter: a special application",
          text: [
            "Circularity of a flexible cylinder — a rolled sheet-metal ring, a seal — carries a subtlety: the part can be out-of-round yet still function, because it will be forced round when installed. Y14.5 therefore allows circularity of a non-rigid part to be applied to the AVERAGE diameter: enough measurements are taken around the feature to establish an average, and circularity is evaluated about that. The Ⓕ symbol marks the tolerance as applying in this unrestrained, averaged condition — the part is judged on how round it naturally is, not on how round the fixture can make it.",
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`⌓ 0.5 Ⓕ A` reads as: profile of a surface, zone 0.5 wide, evaluated in the free state, referenced to datum A. The Ⓕ occupies the usual modifier slot after the tolerance value. Its presence on a drawing that carries a restrained-condition note is the signal: this particular tolerance is exempt from the restraint — measure the part loose.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "⌓", label: "Geometric characteristic — profile of a surface" },
              { content: "0.5", label: "Tolerance value — zone width" },
              { content: "Ⓕ", label: "Free state — apply unrestrained, natural shape" },
              { content: "A", label: "Primary datum" },
            ],
            note: "Ⓕ after the tolerance value: this zone is verified with the part unrestrained — no clamping, no fixturing, natural shape under gravity alone.",
          },
        },
        {
          heading: "When to use it",
          text: [],
          list: [
            "Non-rigid parts generally: sheet metal, gaskets, seals, springs, thin-walled plastic housings",
            "Any tolerance on a drawing that carries a restrained-condition note, where this tolerance must still be verified unrestrained",
            "Circularity of average diameter on flexible cylindrical parts",
            "Never on a genuinely rigid part — the modifier adds nothing where clamping cannot move the feature",
          ],
        },
      ],
      seeAlso: [
        { name: "Restrained Condition Note", href: "/cad/gdt/restrained-condition" },
        { name: "Independency (Ⓘ)", href: "/cad/gdt/independency" },
        { name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" },
      ],
    },
  },
  {
    kind: "restrained-condition", name: "Restrained Condition Note", tag: "Rule",
    meaning:
      "A text note requiring the part to be measured while restrained — held the way it will be held in service.",
    guide: {
      title: "Restrained Condition Note",
      summary:
        "The restrained condition note: requiring a flexible part to be inspected while restrained in a defined way that simulates its in-service mounting — and why it is a note, not a symbol.",
      seoTitle: "Restrained Condition Note in GD&T — Inspecting Flexible Parts As Installed | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "A restrained condition note directs the inspector to restrain the part — hold it against specified datum features or in a defined fixture, applying specified forces or fastener torques — before verifying the tolerances the note applies to. The restraint simulates how the part is actually held in service: a gasket measured clamped between flanges, a cover measured with its mounting screws torqued. The tolerances are then verified in that restrained state, because that is the state in which the part must function.",
          ],
        },
        {
          heading: "There is no symbol — and that is the point",
          text: [
            "Unlike Ⓕ, independency, or Ⓜ, the restrained condition has no standardized symbol and appears nowhere inside a feature control frame. It is a text note — typically NUMBERED NOTES on the drawing: NOTE 2: FLATNESS SHALL BE VERIFIED WHILE THE PART IS RESTRAINED TO DATUM FEATURES A AND B WITH FOUR M6 FASTENERS TORQUED TO 10 Nm. Every restraint that changes the measurement must be spelled out: which datum features, what contact sequence, what forces. Two inspectors restraining the same part differently produce different parts — so the note is only complete when another shop could reproduce the restraint exactly.",
          ],
        },
        {
          heading: "Free state vs. restrained: which state for which tolerance",
          text: [
            "The two mechanisms are complements, and drawings that need one often need both. The restrained condition note establishes the drawing-wide requirement: this part is verified restrained. The Ⓕ symbol then carves out exceptions: tolerances marked Ⓕ are verified unrestrained. A typical sheet-metal cover: hole positions verified restrained (the holes must align with the mating part's holes once bolted), while the flatness of the unsupported panel face is verified free (it is a visible surface, not a sealing one — how it lies loose is how the customer sees it).",
          ],
          diagram: { kind: "free-state" },
        },
        {
          heading: "When to restrain — and when not to",
          text: [],
          list: [
            "Parts whose function only appears once installed: gaskets, covers, bonded panels — restrain to the mounting datums and verify there",
            "Parts so flexible that a free-state check cannot distinguish good from bad — restraint makes inspection repeatable",
            "Parts whose function IS the free-state shape — leave them unrestrained and specify realistic free-state tolerances instead",
            "Never restrain a feature whose tolerance carries Ⓕ — the note and the modifier must not contradict",
          ],
        },
        {
          heading: "Writing a usable note",
          text: [
            "A restrained condition note carries three things: the datum features the part is restrained to (in precedence order), the restraining method (fixture elements, fastener count and torque, clamping sequence), and the tolerances it applies to (all of them, or the listed ones). Understating any of the three turns the note into an argument at inspection. The 2018 edition of Y14.5 added explicit guidance for non-rigid parts: the restraint should simulate the functional assembly, use the datum features the function uses, and apply only the forces the installation applies.",
          ],
        },
      ],
      seeAlso: [
        { name: "Free State (Ⓕ)", href: "/cad/gdt/free-state" },
        { name: "Datum Feature", href: "/cad/gdt/datum-feature" },
        { name: "Datum Target", href: "/cad/gdt/datum-target" },
      ],
    },
  },
  {
    kind: "tangent-plane", name: "Tangent Plane (Ⓣ)", tag: "Frame & zone",
    meaning:
      "The Ⓣ modifier: apply the tolerance to the plane contacting the surface's high points — the contact plane, not the surface itself.",
    guide: {
      title: "Tangent Plane (Ⓣ)",
      summary:
        "The Ⓣ tangent-plane modifier: orienting the theoretical plane that touches a surface's high points, letting the surface itself wander between the high points.",
      seoTitle: "Tangent Plane (Ⓣ) Modifier in GD&T — Contact-Plane Orientation | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The tangent-plane modifier Ⓣ — the letter T in a circle, placed after the tolerance value — changes what a tolerance applies to: not the actual surface, but its tangent plane, the theoretically perfect plane contacting the surface at its high points. The mating part never touches the whole surface anyway; it touches the high points. So a parallelism `0.1 Ⓣ A` callout requires the contact plane to be parallel to datum A within 0.1, while the surface's local waviness between the high points is unconstrained by that callout.",
          ],
          diagram: { kind: "tangent-plane", tolerance: "0.1", datum: "A" },
        },
        {
          heading: "Why the contact plane is what matters",
          text: [
            "Fixtures, machine tables, and mounting faces all meet the part the same way: at a few high spots. If a cover plate bolts against a housing face, the leak path and the load path run through the contact plane — the surface's fine waviness changes little. An ordinary parallelism callout spends tolerance limiting that waviness, which the function does not care about, and thereby forces the surface to be better than it needs to be. Ⓣ redirects the tolerance to the effective geometry: keep the plane the part actually presents to the world within limits, and let the texture between the high points take whatever form the process produces.",
          ],
        },
        {
          heading: "Where Ⓣ may appear",
          text: [
            "The modifier belongs to the orientation family — parallelism, perpendicularity, angularity applied to a planar surface — and Y14.5-2018 also clarifies its use with profile and total runout where a tangent-plane interpretation is meaningful. It presumes a surface whose high points define a plane, so it applies to nominally flat surfaces; it is not a tool for cylindrical features (where the analogous concept is a tangent cylinder pair, handled by other means). ASME Y14.5-2009 introduced Ⓣ as a formal symbol and 2018 retains it — this is a long-standing modifier, not an experimental one, though it sees far less use than Ⓜ or Ⓛ.",
          ],
        },
        {
          heading: "Reading a feature control frame",
          text: [
            "`∥ 0.1 Ⓣ A` reads as: parallelism of the TANGENT PLANE, zone 0.1 wide, relative to datum A. The Ⓣ sits after the tolerance value in the usual modifier slot. Read the frame with the modifier in mind: without Ⓣ the callout bounds the entire surface; with Ⓣ it bounds only the plane through the high points, and the surface itself may wave beyond 0.1 between them.",
          ],
          diagram: {
            kind: "fcf",
            compartments: [
              { content: "∥", label: "Geometric characteristic — parallelism" },
              { content: "0.1", label: "Tolerance value — zone width for the tangent plane" },
              { content: "Ⓣ", label: "Tangent plane — apply to the contact plane, not the surface" },
              { content: "A", label: "Primary datum" },
            ],
            note: "Ⓣ after the tolerance value: the 0.1 zone applies to the plane touching the surface's high points. The surface's local variation between the high points is not constrained by this callout.",
          },
        },
        {
          heading: "The trade-off",
          text: [],
          list: [
            "Mating behavior is contact — when the function lives at the high points, tolerancing the plane is the honest specification",
            "The surface gains freedom — expect more visible waviness; unacceptable for appearance surfaces regardless of function",
            "Inspection is subtler — the evaluator must establish the actual tangent plane, not average the surface",
            "Rule #1 still applies to features of size — Ⓣ modifies a geometric control, it does not remove the size envelope",
          ],
        },
      ],
      seeAlso: [
        { name: "Parallelism", href: "/cad/gdt/parallelism" },
        { name: "Perpendicularity", href: "/cad/gdt/perpendicularity" },
        { name: "Angularity", href: "/cad/gdt/angularity" },
        { name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" },
      ],
    },
  },
];

/* ---------------------------------------------------------------------- */
/* General dimensioning notation (ASME Y14.5 Table 1-1 "general dimension
   symbols" family): the dimension-type conventions and size symbols that
   precede or wrap dimension VALUES, as opposed to the geometric controls
   above. Same route, same guide depth, third content type — 17 entries
   after tranche 2: 8 tranche-1 conventions/symbols (Square and Dimension
   Origin included there) + 3 hole callouts (⌴ SF ⌵) + depth ↧ + 4 value
   qualifiers (taper, slope, arc length, nX) + 1 process notation
   (parting line, per ASME Y14.8). Library total: 14 + 15 + 17 = 46. */
/* ---------------------------------------------------------------------- */

/**
 * A general-dimensioning notation entry — dimension-type conventions (basic,
 * reference, not-to-scale, origin), size symbols (⌀, R, CR, □) that live on
 * the dimension itself, hole callout symbols (⌴ ⌵ ⌤ ↧), and the remaining
 * value qualifiers (taper, slope, arc length, nX). Deliberately NOT shaped
 * like GdntSymbol (no tolerance-zone rule column) and not GdntConcept (not
 * frame modifiers): notation entries carry no geometric control at all.
 */
export type GdntNotation = {
  kind: string;
  name: string;
  /** Card grouping on the hub: "Dimension type" or "Size symbol". */
  tag: string;
  meaning: string;
  /** Long-form entry — same GdntGuide shape the symbol/concept pages use. */
  guide: GdntGuide;
};

export const GDNT_NOTATION: GdntNotation[] = [
  {
    kind: "basic-dimension", name: "Basic Dimension", tag: "Dimension type",
    meaning:
      "A theoretically exact dimension, boxed on the drawing: it carries no tolerance of its own — the geometric controls applied to the same features supply all allowable variation.",
    guide: {
      title: "Basic Dimension — The Boxed, Theoretically Exact Value",
      summary:
        "Why a boxed dimension has no tolerance: basic values locate the theoretically perfect geometry, and the feature control frames applied to it carry the entire allowance.",
      seoTitle: "Basic Dimension in GD&T — The Boxed, Theoretically Exact Value | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "A basic dimension is a numerically exact value — the number the feature is intended to be — enclosed in a rectangular box: `50`. The box is the whole symbol. It means this dimension carries no tolerance of its own: no ±, no general title-block tolerance, nothing. Whatever variation the part is allowed is stated somewhere else, explicitly — in the feature control frames applied to the features the basic dimension locates.",
          ],
          diagram: { kind: "dimension-callout", variant: "basic", value: "50" },
        },
        {
          heading: "Where the tolerance actually lives",
          text: [
            "A basic dimension is only half a specification; the geometric callout is the other half. `⌖ ⌀0.5 A B C` with basic offsets of 50 and 25 from the datums does not need a ± on those 50 and 25 — the Ø0.5 zone already says how far the actual axis may stray from the theoretically exact point those basics define. Adding a ± to a basic value would double-govern the same deviation: two independent authorities over one error, a contradiction the drawing cannot resolve. Where a dimension needs no geometric control, it is not basic — it is a directly toleranced ± dimension.",
          ],
        },
        {
          heading: "Where basic dimensions appear",
          text: [],
          list: [
            "True position — the basic offsets from the datums define the true axis or center plane the position zone is centered on",
            "Profile of a surface — basic dimensions define the true profile the zone straddles",
            "Angularity — the basic angle is exact; the orientation control supplies the tolerance",
            "Conical taper and slope on standard series — the ratio is basic, with a profile or size control governing the surface",
            "Locating datum targets — each target position is theoretically exact",
          ],
        },
        {
          heading: "Basic vs. reference: two boxes, two reasons",
          text: [
            "Both are written without tolerances, for opposite reasons. A basic dimension is exact by definition and its tolerance lives in the geometric controls. A reference dimension is derived or repeated information — parenthesized, not boxed — and has no tolerance because nothing is being controlled by it. The mistake to avoid is treating the box as emphasis: a boxed 50 is not an important 50, it is an exact 50.",
          ],
        },
        {
          heading: "Measurement",
          text: [
            "**CMM** — the basic values build the nominal model; deviations are reported from it. The basics themselves are never inspected — there is nothing to accept or reject.",
            "**Functional gauging** — the gauge embodies the basic geometry directly; a pass/fail pin at the basic location is the basic dimension made physical.",
          ],
        },
      ],
      seeAlso: [
        { name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" },
        { name: "Position", href: "/cad/gdt/position" },
        { name: "Profile of a Surface", href: "/cad/gdt/profile-surface" },
        { name: "True Position Calculator", href: "/cad/true-position-calculator" },
      ],
    },
  },
  {
    kind: "reference-dimension", name: "Reference Dimension", tag: "Dimension type",
    meaning:
      "A dimension repeated for information only, shown in parentheses: it contributes nothing to production or inspection because other dimensions already govern its value.",
    guide: {
      title: "Reference Dimension — Parenthetical, Information-Only Values",
      summary:
        "Parentheses mark a reference dimension — a repeated or derived value that is never inspected directly, because other toleranced dimensions already govern the feature.",
      seoTitle: "Reference Dimension in GD&T — Parenthetical, Information-Only Values | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "`(100)` — the parentheses are the entire symbol. A reference dimension either repeats a dimension stated elsewhere on the drawing or is derivable by adding and subtracting other dimensions. It exists for the reader, not for the part: production and inspection must take the value from the governing dimensions, never from the parenthetical.",
          ],
          diagram: { kind: "dimension-callout", variant: "reference", value: "(100)" },
        },
        {
          heading: "Why drawings need them",
          text: [
            "Chain and overall dimensions are the classic case. Three segments dimensioned 25, 40 and 35 already fix the overall length — dimensioning it again as a normal 100 would add a second, independent tolerance over the same distance, and the two authorities could disagree: all three segments in tolerance yet the total out of tolerance, or the reverse. Written as (100), the overall length informs without governing, and the chain dimensions stay the single source of truth.",
          ],
        },
        {
          heading: "Never add a tolerance to one",
          text: [],
          list: [
            "A reference dimension with a tolerance appended is a drawing error — it re-governs what is already governed",
            "Inspectors do not accept or reject parts against a reference value",
            "If the value actually needs to govern, remove the parentheses and delete whichever dimension made it redundant",
            "On dual-dimensioned drawings the alternate-unit value in brackets is likewise non-governing",
          ],
        },
        {
          heading: "Reference vs. basic, once more",
          text: [
            "Both appear without tolerances, and both get misread as important. Basic (boxed) is theoretically exact and its tolerance lives in the geometric controls. Reference (parenthesized) is derived information with no tolerance anywhere. One anchors the geometry; the other only annotates it.",
          ],
        },
        {
          heading: "Measurement",
          text: [
            "**Inspection reports** — reference values are excluded from ballooned characteristic lists; raising a characteristic on a parenthetical dimension is a planning error.",
            "**Layout checks** — a layout may record the overall length for information, but acceptance criteria cite the chain dimensions that govern it.",
          ],
        },
      ],
      seeAlso: [
        { name: "Basic Dimension", href: "/cad/gdt/basic-dimension" },
        { name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" },
      ],
    },
  },
  {
    kind: "dimension-not-to-scale", name: "Dimension Not to Scale", tag: "Dimension type",
    meaning:
      "A straight thick underline beneath a dimension value, stating the drawn geometry is not at the stated scale — the printed value governs, the picture does not.",
    guide: {
      title: "Dimension Not to Scale — The Underline Convention",
      summary:
        "When a drawing's proportions contradict a dimension's value, the underline says the value is right and the picture is wrong — measure nothing off the print.",
      seoTitle: "Dimension Not to Scale — The Underline Convention on Drawings | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "Agreement should exist between the drawing's pictorial proportions and its stated values. When a change breaks that agreement — a dimension re-valued without the geometry being redrawn — the remedy is a straight, thick, solid underline beneath the value: `215` is deliberate at its stated size, even though the picture no longer matches it.",
          ],
          diagram: { kind: "dimension-callout", variant: "not-to-scale", value: "215" },
        },
        {
          heading: "Why the convention survives CAD",
          text: [
            "Scaled dimensions off a print were once routine — and dangerous; the underline is the drawing's formal warning that scaling will mislead. Even in model-driven workflows it marks the exact revision where geometry and values diverged, which is often the clue that a redraw or a changed part number is pending.",
          ],
        },
        {
          heading: "What the underline does not do",
          text: [],
          list: [
            "It changes no tolerance — the underlined value carries exactly the tolerance it would carry ununderlined",
            "It is not a flag for inspection — the value is inspected normally",
            "It applies to that dimension only; the rest of the view stays to scale",
            "A whole view drawn distorted carries a NOT TO SCALE note rather than underlining every value",
          ],
        },
        {
          heading: "Related honesty conventions",
          text: [
            "Long features broken with a zigzag break line, foreshortened dimensions shown shorter than true, and features too small to draw at scale all share the underline's logic: the value is authoritative, the geometry is a sketch of it. None of these conventions change a single tolerance.",
          ],
        },
      ],
      seeAlso: [
        { name: "Reference Dimension", href: "/cad/gdt/reference-dimension" },
        { name: "Basic Dimension", href: "/cad/gdt/basic-dimension" },
      ],
    },
  },
  {
    kind: "diameter", name: "Diameter (⌀)", tag: "Size symbol",
    meaning:
      "The ⌀ symbol placed before a value states it is a diameter — the width of a circular feature through its center — and it must precede every diameter value, in dimensions and in feature control frames alike.",
    guide: {
      title: "Diameter (⌀) — Before Every Diameter Value",
      summary:
        "⌀ before every diameter value: what the symbol requires, where omitting it changes a tolerance zone's shape (Ø0.5 vs 0.5), and how spherical diameters are written.",
      seoTitle: "Diameter Symbol (⌀) on Drawings — When and Why It's Required | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The diameter symbol ⌀ precedes all diameter values without exception: size dimensions (`⌀30`), tolerance values inside frames, and datum features of size. A diameter is a straight distance across a circular feature passing through its center — the symbol tells the reader the feature is round and the value spans its full width, not a radius, not a side, not an offset.",
          ],
          diagram: { kind: "dimension-callout", variant: "diameter", value: "⌀30" },
        },
        {
          heading: "Where omitting it changes the meaning",
          text: [
            "The costliest place to drop ⌀ is a feature control frame. `⌖ 0.5 A` states a tolerance zone 0.5 wide — two parallel planes. `⌖ ⌀0.5 A` states a cylindrical zone 0.5 across. Same number, different geometry, different inspection. The same rule governs straightness of an axis (a Ø zone versus a width) and position at MMC on holes and bosses.",
          ],
        },
        {
          heading: "⌀ vs. R",
          text: [
            "A full or near-full circular contour is dimensioned with ⌀; a partial contour — a fillet, a corner round, an arc that never closes — is dimensioned with R from its center. The dividing test is whether the feature closes around its center: if it does, ⌀.",
          ],
          list: [
            "`⌀` — a full contour closing around its center: cylinders, holes, bosses",
            "`R` — a partial arc dimensioned from its center: fillets, rounds, corners",
            "`SR` / `S⌀` — the same two measurements taken to a sphere instead of a cylinder",
            "`CR` — R plus one added requirement: a fair curve with no reversals",
          ],
        },
        {
          heading: "Spherical diameter: S⌀",
          text: [
            "When the round feature is a ball rather than a cylinder — a ball-end probe tip, a spherical valve seat — the symbol becomes S⌀: a diameter measured across a sphere in any direction, not a cylinder's single-axis width. Spherical radius (SR) is its partial-contour counterpart.",
          ],
        },
      ],
      seeAlso: [
        { name: "Radius (R)", href: "/cad/gdt/radius" },
        { name: "Feature Control Frame — anatomy & reading", href: "/cad/gdt/feature-control-frame" },
        { name: "Position", href: "/cad/gdt/position" },
      ],
    },
  },
  {
    kind: "radius", name: "Radius (R)", tag: "Size symbol",
    meaning:
      "R placed before a value states a radius: the distance from a feature's center to its surface, controlling the partial circular contours — fillets, rounds, arcs — that a diameter cannot describe.",
    guide: {
      title: "Radius (R) — Partial Contours, From the Center",
      summary:
        "The R symbol: how a radius is drawn, what zone its tolerance produces, why full circles should be ⌀ instead, and when the drawing needs CR instead of plain R.",
      seoTitle: "Radius Symbol (R) on Drawings — Zones, Leaders and the CR Upgrade | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "A radius is a straight line from a center to the feature's surface; the symbol R before the value (`R10`) states the surface lies that distance from the center. On the drawing, the leader is drawn from the actual center with a single arrowhead touching the arc — the leader itself points out the center, so no separate center mark is required.",
          ],
          diagram: { kind: "dimension-callout", variant: "radius", value: "R70" },
        },
        {
          heading: "What the tolerance produces",
          text: [
            "A radius size tolerance `R10 ±0.2` defines a zone between two concentric arcs — R9.8 and R10.2 — and the entire produced contour must lie between them about the same center. It is the arc-shaped cousin of the circularity zone, except these arcs are fixed by size rather than centered by a datum axis. Where wiggle inside that zone would matter, the drawing upgrades to CR.",
          ],
        },
        {
          heading: "R vs. ⌀, and the full-radius case",
          text: [],
          list: [
            "A contour that closes around its center takes ⌀; a partial arc takes R",
            "A radius that must be an uninterrupted sweep without flats is noted FULL R (or ALL R when every fillet on the part is included)",
            "Where a leader would be unclear on a small radius, a dot replaces the arrowhead on the surface",
            "Spherical radii take SR — a radius measured to a sphere, not a cylinder",
          ],
        },
        {
          heading: "When plain R is not enough",
          text: [
            "Plain R lets the produced surface wander anywhere inside the two limiting arcs — including back-and-forth reversals that still measure in tolerance. On a seal track or bearing seat those reversals are the failure mode, which is why the standard offers controlled radius: CR adds one requirement — the surface must be a fair curve, continuous, with no reversals.",
          ],
        },
      ],
      seeAlso: [
        { name: "Controlled Radius (CR)", href: "/cad/gdt/controlled-radius" },
        { name: "Circularity (roundness)", href: "/cad/gdt/circularity" },
        { name: "Diameter (⌀)", href: "/cad/gdt/diameter" },
      ],
    },
  },
  {
    kind: "controlled-radius", name: "Controlled Radius (CR)", tag: "Size symbol",
    meaning:
      "The CR variant of a radius: the surface must both stay inside the radius tolerance zone and form a fair curve — continuous, without reversals — so the contour cannot wiggle its way through a zone it technically fits.",
    guide: {
      title: "Controlled Radius (CR) — Fair Curves, No Reversals",
      summary:
        "CR before a radius value: the same tolerance zone as R plus one extra requirement — the surface must be a fair, continuous curve with no reversals. ASME-only; ISO reaches the same result with profile.",
      seoTitle: "Controlled Radius (CR) in GD&T — Fair Curves, No Reversals | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "CR is placed before the value exactly where R would be (`CR10`). It does everything R10 does — same two-arc tolerance zone, same size control — and adds one sentence: the produced surface must be a fair curve without reversals. Points along the surface may not oscillate within the zone; the contour reads as one continuous arc, not a legal-looking wiggle.",
          ],
          diagram: { kind: "dimension-callout", variant: "controlled-radius", value: "CR10" },
        },
        {
          heading: "The failure mode it prevents",
          text: [
            "A plain radius in tolerance can still be a mess: an S-shaped contour whose extremes both sit inside the R9.8–R10.2 zone passes inspection and still chatters a seal, rocks a bearing seat, or hunts a cam follower. CR closes that gap — the geometry that matters at contact is continuity, and continuity is now a requirement, not a hope.",
          ],
        },
        {
          heading: "Where it earns its keep",
          text: [],
          list: [
            "Bearing and bushing seats, where reversals concentrate load at the peaks",
            "Dynamic seal tracks, where a wavy contour scours the seal lip",
            "Cam and follower contours, where the follower must track without hunting",
            "Machining note: CR surfaces are produced by slowing feed to prevent chatter reversals — a real process constraint, not just notation",
          ],
        },
        {
          heading: "Standards note: ASME only",
          text: [
            "ISO 1101 has no CR symbol. The same functional intent is specified in ISO by controlling the contour with profile of a surface, whose zone both bounds and smooths the result. Drawings that must work in both systems either state the requirement in a note or convert the callout to a profile control.",
          ],
        },
      ],
      seeAlso: [
        { name: "Radius (R)", href: "/cad/gdt/radius" },
        { name: "Profile of a Surface", href: "/cad/gdt/profile-surface" },
      ],
    },
  },
  {
    kind: "square", name: "Square (□)", tag: "Size symbol",
    meaning:
      "The □ symbol before a value states a square shape: the value and its tolerance apply to every side of the feature from one callout — one dimension governing two.",
    guide: {
      title: "Square (□) — One Dimension, All Four Sides",
      summary:
        "□ before a value: one dimension that controls all four equal sides of a square feature, why two identical dimensions are not equivalent, and what □ does not control.",
      seoTitle: "Square Symbol (□) on Drawings — One Dimension, All Four Sides | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "`□10` states a square feature whose every side is 10: the value applies to each of the four sides with the same tolerance. One dimension governs what would otherwise take two — and, the part that matters, the governed sides carry one shared tolerance authority instead of two independent ones.",
          ],
          diagram: { kind: "dimension-callout", variant: "square", value: "□20" },
        },
        {
          heading: "Why two dimensions are not equivalent",
          text: [
            "Dimensioning the same feature `10` twice creates two separately toleranced sizes. With a general tolerance of ±0.2, one side could legally measure 10.2 and the adjacent side 9.8 — a rhombus, and both callouts pass. □10 declares one size value for all sides, so the sides stay equal as they vary. Where squareness of the corners must also be bounded, a geometric control takes over from there.",
          ],
        },
        {
          heading: "Where it appears",
          text: [],
          list: [
            "Square shanks, keys and drive flats where wrench faces must stay equal and parallel",
            "Square bosses and pockets on cast and machined parts",
            "Combined with perpendicularity on the sides when the feature must also stand square to a datum",
            "Rarely on rectangular features — a rectangle needs each dimension stated plainly",
          ],
        },
        {
          heading: "What □ does not control",
          text: [
            "The symbol equalizes the sides; it says nothing about the feature's orientation or location. A perfectly-sized square can sit tilted or misplaced on the part. Orientation to a datum takes a perpendicularity or angularity callout on the square's faces; location takes position — with the size expressed □ so the zone math keeps treating it as one size.",
          ],
        },
      ],
      seeAlso: [
        { name: "Perpendicularity", href: "/cad/gdt/perpendicularity" },
        { name: "Position", href: "/cad/gdt/position" },
        { name: "Diameter (⌀)", href: "/cad/gdt/diameter" },
      ],
    },
  },
  {
    kind: "dimension-origin", name: "Dimension Origin", tag: "Dimension type",
    meaning:
      "A small circle replacing one arrowhead of a dimension: the dimension originates from the surface the circle sits on — fixing where the measurement starts without creating a datum feature.",
    guide: {
      title: "Dimension Origin Symbol — Where the Measurement Starts",
      summary:
        "The origin symbol: one dimension, one stated start. When two faces could both plausibly begin the measurement, the circle removes the ambiguity — and inspection fixtures up from that face.",
      seoTitle: "Dimension Origin Symbol on Drawings — Where the Measurement Starts | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The symbol is a small circle drawn on the dimension line at the end where measurement begins, replacing what would be an arrowhead. The dimension runs FROM the indicated feature TO the other end. For a surface origin, the high points of the indicated surface define the plane from which the dimension is measured — the same simulator logic a surface plate applies.",
          ],
          diagram: { kind: "dimension-callout", variant: "origin", value: "50" },
        },
        {
          heading: "The ambiguity it removes",
          text: [
            "A step block with faces at heights 30 and 50 has two plausible reading orders: measure each step from the base, or stack one step off the other. Both are legal dimensioning; they produce different parts. Placing the origin symbol on the base face states the part is inspected from the base — every other height runs from it. Without the symbol, the drawing reads as either interpretation until the first dispute.",
          ],
        },
        {
          heading: "Origin vs. datum feature",
          text: [],
          list: [
            "A datum feature symbol names a surface and invites geometric controls to reference it — a heavier, part-wide statement",
            "The origin symbol only fixes the start of the one dimension it touches — a per-dimension statement",
            "Both use the indicated surface's high points (for plane surfaces) as the practical measuring reference",
            "A face can carry a datum symbol and an origin symbol independently; neither implies the other",
          ],
        },
        {
          heading: "Measurement",
          text: [
            "**Setup** — fixture or rest the part on the origin face; every dimension called from it is read directly from that seating, the way the drawing intends.",
            "**CMM** — align the primary axis from the origin surface, then report each dimensioned feature from that alignment; the origin symbol is effectively a one-dimension alignment instruction.",
          ],
        },
      ],
      seeAlso: [
        { name: "Datum Feature — feature vs. datum", href: "/cad/gdt/datum-feature" },
        { name: "Basic Dimension", href: "/cad/gdt/basic-dimension" },
      ],
    },
  },
  {
    kind: "depth", name: "Depth Symbol (Depth/Deep)", tag: "Hole callout",
    meaning:
      "The ↧ symbol before a value states it is a depth measured from the surface: how far a hole, slot or counterbore extends below the surface it starts from.",
    guide: {
      title: "Depth Symbol (↧) — How Far the Feature Goes",
      summary:
        "↧ before a depth value: what it measures, where the measurement starts on curved or angled surfaces, and how the depth of a blind hole is defined.",
      seoTitle: "Depth Symbol (↧) on Drawings — Blind Holes, Slots and Counterbores | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The depth symbol ↧ precedes the depth dimension with no space (`↧12`), stating that the value applies to the depth of the feature — how far it extends below the surface it starts from. It replaces the word DEEP that older notes spelled out: `⌀8 ↧12` reads as an 8 mm hole, 12 mm deep, in half the characters and with no ambiguity about which value is the depth.",
          ],
          diagram: { kind: "dimension-callout", variant: "depth", value: "⌀8 ↧12" },
        },
        {
          heading: "Where the measurement starts",
          text: [
            "A depth is measured from the outer surface of the part — specifically, the depth of a blind hole is the depth of the full diameter from that surface. On a flat face this is a single unambiguous reading; where the depth would not be clear, as from a curved or angled surface, the standard directs the drawing to dimension the depth with dimension and extension lines rather than notation, so the start and end of the measurement are drawn rather than implied.",
          ],
        },
        {
          heading: "Where ↧ appears",
          text: [],
          list: [
            "Blind holes — `⌀8 ↧12` is the full-diameter depth from the outer surface",
            "Counterbores — `⌴⌀15 ↧8` fixes the counterbore depth; where remaining material thickness matters, that thickness is dimensioned instead",
            "Slots, pockets and milled recesses whose depth is not carried by another view",
            "Not for through features — a through hole has no depth value; THRU (or the break lines of a section view) carries that meaning",
          ],
        },
        {
          heading: "Measurement",
          text: [
            "**Inspection** — depth is verified with a depth micrometer or depth gauge seated on the outer surface, or on a CMM by probing the surface and the feature's flat bottom. The full-diameter depth is what the callout governs: a drill point's cone below the measured depth is not part of the value.",
            "**Chamfered or countersunk entries** — the depth starts where the full diameter begins, below the entry chamfer, not at the outer face.",
          ],
        },
      ],
      seeAlso: [
        { name: "Counterbore (⌴)", href: "/cad/gdt/counterbore" },
        { name: "Countersink (⌵)", href: "/cad/gdt/countersink" },
      ],
    },
  },
  {
    kind: "counterbore", name: "Counterbore (⌴)", tag: "Hole callout",
    meaning:
      "The ⌴ symbol before a diameter (and optional ↧ depth) specifies a flat-bottomed enlarged hole — the recess that lets a fastener head sit flush below the surface.",
    guide: {
      title: "Counterbore (⌴) — The Fastener's Flat-Bottomed Recess",
      summary:
        "⌴ before the counterbore diameter: the flat-bottomed enlargement that seats a fastener head flush, how depth is stated, and how the counterbore is located coaxial to its hole.",
      seoTitle: "Counterbore Symbol (⌴) on Drawings — Fastener Recesses Explained | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The counterbore symbol ⌴ precedes, with no space, the dimension of the counterbore: `⌴⌀15 ↧8` over a `⌀8 THRU` hole specifies a flat-bottomed cylindrical enlargement, 15 across, 8 deep, coaxial with the through hole. The recess is what lets a socket-head cap screw sit below the surface — its function defines everything about it: flat bottom for the washer or head face, generous diameter for the tool, depth for flush or sub-flush seating.",
          ],
          diagram: { kind: "dimension-callout", variant: "counterbore", value: "⌴⌀15 ↧8" },
        },
        {
          heading: "Depth, or remaining material instead",
          text: [
            "The counterbore's depth follows the depth symbol after the diameter. Where the thickness of the material remaining under the counterbore has significance — wall strength, thread engagement, a seal land — that thickness is dimensioned in place of the depth. One or the other governs; dimensioning both over-constrains the same wall. A fillet radius at the counterbore's base may be specified where the transition needs one.",
          ],
        },
        {
          heading: "Location: the coaxiality question",
          text: [
            "A counterbore is useless if its hole wanders out from under it, so the drawing must state how the two relate. Three patterns cover the practice — the standard's own figures use all three:",
          ],
          list: [
            "One positional tolerance governing both the hole and the counterbore — the tightest, simplest statement when they serve one fastener",
            "Separate positional tolerances with the same datum references — when the two features need different tolerances but share a location basis",
            "Separate positional tolerances with different datum references — when the counterbore serves a different fit or a different mating part than the hole",
          ],
        },
        {
          heading: "Counterbore vs. spotface",
          text: [
            "Both are flat-bottomed enlargements cut by similar tools, and the symbols are near twins. The difference is depth of intent: a counterbore has a functional depth that seats the fastener; a spotface has only whatever minimal depth clears the surface to a clean flat seat. See the spotface page for the shallow case and its `[SF]`-marked symbol.",
          ],
        },
      ],
      seeAlso: [
        { name: "Spotface (SF)", href: "/cad/gdt/spotface" },
        { name: "Depth Symbol (↧)", href: "/cad/gdt/depth" },
        { name: "Countersink (⌵)", href: "/cad/gdt/countersink" },
      ],
    },
  },
  {
    kind: "spotface", name: "Spotface", tag: "Hole callout",
    meaning:
      "A spotface is the minimum-depth flat seat machined onto a rough or curved surface so a fastener head or washer bears on clean, flat material — dimensioned ⌴ with the SF note where the entry needs clarifying.",
    guide: {
      title: "Spotface — The Minimum-Depth Flat Seat",
      summary:
        "The spotface callout: minimum depth to clean up the surface, when depth or remaining thickness is stated instead, and how the SF note clarifies the symbol on cast and curved surfaces.",
      seoTitle: "Spotface on Drawings — Minimum-Depth Seats and the SF Notation | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "A spotface is a shallow, flat-bottomed seat machined onto a surface so a fastener bears on flat, clean material. Where no depth is specified, the spotface is by definition the minimum depth necessary to clean up the surface to the specified diameter — cut just deep enough that the rough skin, scale or curvature is gone and the bearing area is flat. Its diameter is the distance across the flat and does not include any fillet that may be specified at its edge.",
          ],
          diagram: { kind: "dimension-callout", variant: "spotface", value: "⌴⌀20 SF" },
        },
        {
          heading: "When depth or remaining thickness is stated",
          text: [
            "The minimum-to-clean-up default covers cast and forged faces, but two cases need more: where machining allowance must be guaranteed, a depth (⌴⌀20 ↧2) or a remaining thickness of material is specified; and where the entry is ambiguous — a through hole on a curved face, or a spotface on the far side — a notation may be necessary to indicate the surface to be spotfaced. A spotface may also be specified entirely by a note, without being shown pictorially.",
          ],
        },
        {
          heading: "Reading the symbol: ⌴ plus SF",
          text: [
            "The spotface symbol and the counterbore symbol are the same flat-bottomed glyph; the standard's own example writes the spotface as the symbol with the letters SF shown with the callout. Read them apart by intent, not by glyph: the counterbore's depth seats a fastener head and is stated; the spotface's depth is whatever minimum produces a clean flat. Where a drawing relies on the distinction, the SF note removes it — and the two pages should be read as a pair.",
          ],
        },
        {
          heading: "Where it earns its keep",
          text: [],
          list: [
            "Bolt seats on cast, forged or molded faces where the as-cast skin will not carry a load flatly",
            "Curved entries — a hole meeting a cylinder or a fillet needs a spotface to give the head a plane to bear on",
            "Washer seats on rough fabrications, where the washer must not bridge scale or mismatch",
            "Anywhere a torque-critical joint needs flatness under the head without a functional recess depth",
          ],
        },
      ],
      seeAlso: [
        { name: "Counterbore (⌴)", href: "/cad/gdt/counterbore" },
        { name: "Depth Symbol (↧)", href: "/cad/gdt/depth" },
      ],
    },
  },
  {
    kind: "countersink", name: "Countersink (⌵)", tag: "Hole callout",
    meaning:
      "The ⌵ symbol before a diameter and an included angle specifies the conical entry that lets a flat-head fastener sit flush — the only hole callout whose angle is part of the specification.",
    guide: {
      title: "Countersink (⌵) — Diameter and Included Angle",
      summary:
        "⌵ before the countersink diameter and included angle: the conical seat for flat-head fasteners, the alternate gage-diameter method, and how curved surfaces change the callout.",
      seoTitle: "Countersink Symbol (⌵) on Drawings — Angles, Gage Diameters and Flush Fit | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The countersink symbol ⌵ precedes, with no space, the dimensions of the countersink. For countersunk holes, the diameter and included angle of the countersink are specified: `⌵⌀10 X 90°` over a `⌀5 THRU` hole is a 90° conical entry, 10 across at the surface. The included angle is not optional information — it is half the specification, because the cone's slope is what a flat-head screw's seat contacts.",
          ],
          diagram: { kind: "dimension-callout", variant: "countersink", value: "⌵⌀10 X 90°" },
        },
        {
          heading: "Alternate specification methods",
          text: [
            "The diameter-and-angle pair is the default, but the standard permits other methods. What never changes is that the cone must be fully defined — diameter and angle together, or an equivalent that fixes both:",
          ],
          list: [
            "Diameter and included angle — the default pair, e.g. ⌵⌀10 X 90°",
            "A gage diameter — the diameter the cone reaches at a defined depth, verified with a plug gage",
            "A depth in combination with other parameters — where production measures depth more naturally than a surface diameter",
            "The nX prefix multiplies identical countersinks the same way it multiplies holes",
          ],
        },
        {
          heading: "Countersink vs. counterdrill",
          text: [
            "A counterdrill is the same idea stepped: a cylindrical enlargement with diameter and depth specified, its included angle optional — it typically transitions from one diameter to another or clears a fastener shank at an angle. The depth dimension of a counterdrill is the depth of its full diameter from the outer surface, the same rule a blind hole follows.",
          ],
        },
        {
          heading: "On curved surfaces, and what flush means",
          text: [
            "Where a hole is chamfered or countersunk on a curved surface, the diameter specified applies at the minor diameter of the chamfer or countersink — the true cone meets the true hole, not the outer skin. That definition matters because the purpose is flushness: the flat-head fastener's cone seats against the callout's cone, and any mismatch shows up as a head proud of or below the surface. Where flushness must be guaranteed rather than hoped for, a profile or perpendicularity control on the countersink's face takes over from the notation.",
          ],
        },
      ],
      seeAlso: [
        { name: "Counterbore (⌴)", href: "/cad/gdt/counterbore" },
        { name: "Depth Symbol (↧)", href: "/cad/gdt/depth" },
      ],
    },
  },
  {
    kind: "conical-taper", name: "Conical Taper", tag: "Value qualifier",
    meaning:
      "The conical taper symbol before a ratio states the rate of diameter change along a cone — (D − d)/L — replacing two end diameters with a single controlled value.",
    guide: {
      title: "Conical Taper — The Ratio Callout for Conical Surfaces",
      summary:
        "The conical taper symbol: the ratio (D − d)/L, the standard-taper series it names, the basic-value methods Y14.5 permits, and why the vertical leg always points left.",
      seoTitle: "Conical Taper Symbol on Drawings — Ratios, Standard Series and Basic Methods | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "Conical taper is the ratio of the difference in the diameters of two sections perpendicular to the axis of a cone to the distance between those sections — taper = (D − d)/L. The symbol precedes that ratio as the dimension, e.g. `0.125` written after the taper glyph. One value controls the whole conical surface: the slope the tool must hold, stated independently of how long the cone is.",
          ],
          diagram: { kind: "dimension-callout", variant: "conical-taper", value: "0.125" },
        },
        {
          heading: "Standard tapers: name the series",
          text: [
            "Standard machine tapers — the American Standard Self-Holding and Steep Taper series — are usually dimensioned by specifying the taper name and number (a Morse or B5.10 designation) rather than computing a ratio. The diameter at the gage line and the length may also be specified; the taper in inches per foot and the small-end diameter may be shown as reference. The symbol-and-ratio callout is for tapers that are not a named standard series.",
          ],
        },
        {
          heading: "The four ways Y14.5 permits",
          text: [],
          list: [
            "A basic taper and a basic diameter — the geometric method; a profile of a surface tolerance then controls the surface",
            "A size tolerance combined with a profile of a surface tolerance applied to the taper",
            "A toleranced diameter at both ends plus a toleranced length — applicable for noncritical tapers, such as the transition between diameters of a shaft",
            "A composite profile tolerance",
          ],
        },
        {
          heading: "Reading and drawing the symbol",
          text: [
            "The symbol is a right triangle — closed for taper, open for slope — and the standard requires it be shown with the vertical leg to the left, regardless of which way the actual cone runs on the drawing. The orientation is fixed so the symbol reads as a symbol, not as a sketch of the part. Taper on the drawing may run either direction; the symbol never changes.",
          ],
        },
      ],
      seeAlso: [
        { name: "Slope", href: "/cad/gdt/slope" },
        { name: "Profile of a Surface", href: "/cad/gdt/profile-surface" },
      ],
    },
  },
  {
    kind: "slope", name: "Slope", tag: "Value qualifier",
    meaning:
      "The slope symbol before a ratio states the inclination of a flat surface — the height difference between its ends divided by their separation — the flat-taper counterpart of the conical taper callout.",
    guide: {
      title: "Slope — The Flat-Taper Ratio Callout",
      summary:
        "The slope symbol: inclination as (H − h)/L, why the value is commonly basic, and how a flat taper is specified with a toleranced slope and height.",
      seoTitle: "Slope Symbol on Drawings — Flat-Taper Ratios and Basic Values | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "Slope is the inclination of a surface expressed as the ratio of the difference in the heights at each end — measured above and at right angles to a baseline — to the distance between those heights: slope = (H − h)/L. The symbol precedes that ratio as the dimension. Where conical taper controls a surface of revolution, slope controls a flat surface: a wedge, a ramp pad, a tapered keyway seat.",
          ],
          diagram: { kind: "dimension-callout", variant: "slope", value: "1:10" },
        },
        {
          heading: "Why the slope value is commonly basic",
          text: [
            "The slope value depends on the height and length dimensions from which it is calculated — it is derived geometry. Box the slope ratio as a basic dimension and let a geometric control (profile or angularity) govern the surface; that keeps one authority over the inclination. If the slope is directly toleranced instead, the standard's angular-surface rule applies: a linear dimension combined with the angular dimension produces a zone of two nonparallel planes that widens with distance from the apex — legal, but a profile or angularity control is the way to get parallel boundaries.",
          ],
        },
        {
          heading: "Specifying a flat taper",
          text: [
            "A flat taper may be specified by a toleranced slope and a toleranced height at one end: the slope ratio fixes the inclination, the height fixes where the surface sits, and together they locate and orient the plane. The geometric alternative trades the pair of size tolerances for a basic slope plus a profile or angularity control. The symbol is the open right triangle, vertical leg to the left — the closed triangle belongs to conical taper. Read them as a pair: same grammar, one for cones, one for flats.",
          ],
          list: [
            "Toleranced slope + toleranced height at one end — the standard's direct method (Figure 5-23)",
            "Basic slope + profile of a surface — parallel zone boundaries, one geometric authority",
            "Basic slope + angularity — when orientation to a datum matters more than the surface's exact form",
            "Directly toleranced slope + height alone — legal, but the zone becomes two nonparallel planes that widen away from the apex",
          ],
        },
      ],
      seeAlso: [
        { name: "Conical Taper", href: "/cad/gdt/conical-taper" },
        { name: "Angularity", href: "/cad/gdt/angularity" },
        { name: "Profile of a Surface", href: "/cad/gdt/profile-surface" },
      ],
    },
  },
  {
    kind: "arc-length", name: "Arc Length", tag: "Value qualifier",
    meaning:
      "A small arc drawn over a dimension value states the value is the distance measured along the curve — the arc's true length — not the straight chord between its endpoints.",
    guide: {
      title: "Arc Length — Dimensioning Along the Curve",
      summary:
        "The arc symbol above a dimension: chord vs. arc length, why the difference grows with curvature, and which surface the value applies to when several are near.",
      seoTitle: "Arc Length Symbol on Drawings — Dimensioning Along the Curve | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "The arc length symbol — a small arc — is placed above the dimension value, stating the value is an arc length measured on a curved outline: the distance along the curve itself, not the straight chord an ordinary linear dimension would report. The symbol applies to the surface nearest the dimension, which matters on multi-surface parts where two candidates sit within sight of one leader.",
          ],
          diagram: { kind: "dimension-callout", variant: "arc-length", value: "65" },
        },
        {
          heading: "Chord vs. arc: why the symbol exists",
          text: [
            "A linear dimension across a curved outline reads as a chord — the straight-line distance between endpoints. The chord is always shorter than the arc, and the gap widens as curvature increases; on a 90° arc of radius 50 the chord is 70.7 but the arc is 78.5 — nearly 8 mm of unexplained difference that a shop discovering it mid-process will not thank the drawing for. The arc over the value removes the ambiguity with one stroke: the length along the curve is the specification.",
          ],
        },
        {
          heading: "Where it earns its keep",
          text: [],
          list: [
            "Curved slot paths and wear surfaces whose developed length drives the mating part",
            "Trim and flange edges on formed parts, where the bent length differs from the flat-pattern length",
            "Roll-formed or wrapped features whose material consumption is computed from developed length",
            "Anywhere the curved outline is dimensioned and the chord value would be ambiguous with it",
          ],
        },
        {
          heading: "Measurement",
          text: [
            "**Layout verification** — the arc length is checked along the curve: a flexible rule, a radius-and-angle computation from a probed center, or a CMM curve fit. It is never verified with calipers across the endpoints — that measures the chord.",
            "**Drawing hygiene** — if the value's meaning is chord, dimension it as an ordinary linear dimension and let the geometry show it; the arc symbol is only for lengths measured along the curve.",
          ],
        },
      ],
      seeAlso: [
        { name: "Radius (R)", href: "/cad/gdt/radius" },
        { name: "Basic Dimension", href: "/cad/gdt/basic-dimension" },
      ],
    },
  },
  {
    kind: "parting-line", name: "Parting Line", tag: "Process notation",
    meaning:
      "A diamond-marked phantom line on casting, forging and molded-part drawings showing where the mold or die halves meet — the seam the process will leave on every part unless the drawing says otherwise.",
    guide: {
      title: "Parting Line — Where the Mold Halves Meet",
      summary:
        "The parting line: the Y14.8 convention for marking the mold/die split on casting and molded-part drawings, what the diamond-marked phantom line commits the toolmaker to, and the requirements that reference it.",
      seoTitle: "Parting Line on Drawings — The Mold/Die Split Line Convention | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "A parting line is the separation between mold or die segments — the trace left on the part where the halves of the mold, die or forge tooling came together. It is depicted on casting, forging and molded-part drawings as a phantom line extending beyond the part in the applicable views, with the parting line symbol added. The convention is governed by ASME Y14.8, the castings/forgings/molded-parts companion to Y14.5; Y14.5 itself delegates all such requirements to Y14.8.",
          ],
          diagram: { kind: "dimension-callout", variant: "parting-line", value: "PL" },
        },
        {
          heading: "Why the drawing marks it",
          text: [
            "The tooling will part somewhere; unmarked, the location is the toolmaker's discretion and it moves with every design iteration. Marking the line commits the split to a known seam — ideally a corner or flange edge where flash is trimmed away and the witness mark disappears into the geometry. If the parting line is not dimensioned on the drawing, its location is up to the manufacturer — which is precisely why drawings that care mark it explicitly.",
          ],
        },
        {
          heading: "What the line commits",
          text: [],
          list: [
            "Flash and witness-mark location — the seam, and the trim operation that cleans it, land where the line is drawn",
            "Draft direction — faces drafted away from the split on each side; relocating the line flips the draft on the affected faces",
            "Tolerance authority — tolerances are held more easily on the same side of a split than across it, so the line placement is a tolerancing decision, not just a tooling one",
            "Profile controls — Y14.8's all-around-this-side / all-over-this-side-of-parting-line symbols extend a profile control to only one side of the marked seam",
          ],
        },
        {
          heading: "Reading the notation",
          text: [
            "The line itself is a phantom line — long dash, alternating short dashes — drawn past the part outline, with the diamond-shaped parting line symbol placed on it. Drawings often abbreviate the label as PL; on molded parts the abbreviation is common where the symbol is impractical at drawing scale. Either way the meaning is identical: the mold opens along this trace, everything above is tool half one, everything below is tool half two.",
          ],
        },
      ],
      seeAlso: [
        { name: "Profile of a Surface", href: "/cad/gdt/profile-surface" },
        { name: "Dimension Not to Scale — the phantom-line convention", href: "/cad/gdt/dimension-not-to-scale" },
      ],
    },
  },
  {
    kind: "multiple-identical-features", name: "Multiple Identical Features (#X)", tag: "Value qualifier",
    meaning:
      "A numeral followed by X before a dimension — `6X ⌀8` — states how many identical features that callout governs: one note, six holes, one tolerance authority.",
    guide: {
      title: "Multiple Identical Features (nX) — One Note, Every Match",
      summary:
        "The X notation: how nX multiplies a callout across identical features, the no-space/space rule, the basic-dimension frame exception, and the trap where X means 'by' instead.",
      seoTitle: "Multiple Identical Features (nX) on Drawings — The Number-of-Places Notation | Racira",
      sections: [
        {
          heading: "Definition",
          text: [
            "Repetitive features or dimensions are specified by an X used with a numeral indicating the number of places required: `6X ⌀8 THRU` states the callout applies to six identical features. The notation multiplies the entire callout it prefixes — size, tolerance, and any geometric control attached — so all six holes carry one tolerance authority rather than six separate ones. No space is used between the number of occurrences and the X; a space is used between the X and the dimension.",
          ],
          diagram: { kind: "dimension-callout", variant: "multiple-identical-features", value: "6X ⌀8" },
        },
        {
          heading: "Series, patterns, and spacing",
          text: [
            "Features repeated in a series or pattern take the feature count with the size: `4X ⌀6`. Equal spacing takes the space count with the spacing dimension: `5X 20` means four intervals of 20 between five features. When it is difficult to distinguish between the dimension and the number of spaces, one space may be dimensioned and identified as reference. The distinction matters because the two counts are different claims: one says how many features, the other how many gaps.",
          ],
        },
        {
          heading: "The basic-dimension frame exception",
          text: [
            "Where X is used with a basic dimension, it may be placed either inside or outside the basic dimension frame — the one place the notation tolerates variation, since the box already marks the value as exact. Patterns located by position follow the same grammar — `2X M20 X 2.5` in the standard's own datum examples — with the pattern's location tolerance applied once to the whole pattern, not per hole. The spacing rules in full:",
          ],
          list: [
            "No space between the number of occurrences and the X: `6X`, never `6 X`",
            "One space between the X and the dimension: `6X ⌀8`",
            "With a basic dimension, the X may sit inside or outside the frame",
            "Between coordinate dimensions, X means by and takes one space on each side: `40 X 30`",
            "When feature count and space count are hard to tell apart, one space may be dimensioned and identified as reference",
          ],
        },
        {
          heading: "The trap: X meaning “by”",
          text: [
            "The same letter does other jobs on the same drawings. Between coordinate dimensions, X means by — 40 X 30 is forty by thirty — and in that usage it shall be preceded and followed by one character space. Thread notes carry their own X (`M20 X 2.5` is a thread pitch, not two features). When the number-of-places and by usages appear on the same drawing, the standard's note is to take care that each usage is clear — the drawing reads nX as multiplication, and everything else as words.",
          ],
        },
      ],
      seeAlso: [
        { name: "Continuous Feature (CF)", href: "/cad/gdt/continuous-feature" },
        { name: "Position", href: "/cad/gdt/position" },
        { name: "Basic Dimension", href: "/cad/gdt/basic-dimension" },
      ],
    },
  },
];

/**
 * Combined lookup for the /cad/gdt/[slug] route: symbols first, then
 * concepts, then the general-dimensioning notation entries. All content
 * types share the route so browsing stays continuous between them; the type
 * discriminator drives the page's eyebrow label.
 * Only symbols with a written guide resolve — guide-less symbols 404.
 */
export type GdtEntry =
  | { type: "symbol"; entry: GdntSymbol; guide: GdntGuide }
  | { type: "concept"; entry: GdntConcept; guide: GdntGuide }
  | { type: "notation"; entry: GdntNotation; guide: GdntGuide };

export function gdtEntry(slug: string): GdtEntry | undefined {
  const symbol = GDNT_SYMBOLS.find((s) => s.kind === slug && s.guide);
  if (symbol && symbol.guide) return { type: "symbol", entry: symbol, guide: symbol.guide };
  const concept = GDNT_CONCEPTS.find((c) => c.kind === slug);
  if (concept) return { type: "concept", entry: concept, guide: concept.guide };
  const notation = GDNT_NOTATION.find((n) => n.kind === slug);
  if (notation) return { type: "notation", entry: notation, guide: notation.guide };
  return undefined;
}

export function GdntTable({ rows }: { rows: React.ReactNode[][] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-border bg-card/40 p-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-background">
            {r[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{r[1]}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{r[2]}</p>
            {r[3] ? <div className="mt-1.5">{r[3]}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export const glyph = (kind: string, className?: string) => <Glyph kind={kind} className={className} />;

/**
 * Inline text renderer for guide paragraphs and list items: backtick `spans`
 * become inline code so feature-control-frame strings (e.g. `⌖ ⌀0.5 Ⓜ A B C`)
 * read in monospace, and `**spans**` become bold lead-ins (e.g. measurement
 * method names). Styling of both comes from the shared .seo-prose typography
 * on the guide content wrapper; the minimal classes here keep them sane when
 * rendered outside it. Used by the individual symbol pages.
 */
export function GuideText({ text }: { text: string }) {
  const parts = text.split("`");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="font-mono">
            {part}
          </code>
        ) : (
          <Fragment key={i}>{renderBold(part)}</Fragment>
        )
      )}
    </>
  );
}

/** Renders `**bold**` spans as <strong> (the rest of the string as-is). */
function renderBold(text: string) {
  const parts = text.split("**");
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>
  );
}

/**
 * URL of a symbol's individual reference page under the GD&T symbol library
 * (/cad/gdt). The library is non-tool content — like /finance/blog — and sits
 * outside the /cad/[slug] tool registry on purpose (symbol kinds are already
 * kebab-case slugs).
 */
export const gdtSymbolPath = (kind: string) => `/cad/gdt/${kind}`;
