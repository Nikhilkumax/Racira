/**
 * CAD SEO content — batch 3.
 * GENERATED — do not edit by hand. Regenerate from the JSON source:
 *   npx tsx scripts/json-to-seo.ts scratch/cad-seo-batch3.json
 *   node _scripts/cad-seo-assemble.mjs scratch/cad-seo-batch3.json src/domains/cad/registry/seo/batch3.ts
 */
import type { ToolSeo } from "../tool-seo";

const gdandt_symbol_reference_standardsSeo: ToolSeo = {
  sections: [
    { heading: "What is GD&T Symbol Reference (Standards)", content: [
      { type: "paragraph", text: `GD&T Symbol Reference (Standards) is the full geometric tolerancing symbol set with the governing rule for each control — the tolerance zone shape and the datum requirement — annotated from ASME Y14.5-2018. Where the plain GD&T Symbol Reference tells you what each characteristic means, this table tells you how each one is applied: what zone the tolerance creates, whether the control needs a datum, and how material condition modifiers change the picture.` },
      { type: "paragraph", text: `The table covers all fourteen symbols across the five characteristic families — form, profile, orientation, location and runout. Each row pairs the symbol with its zone rule, written in the shorthand of the standard: “t” stands for the tolerance value in the feature control frame, so a flatness entry of “two parallel planes, distance t” means the whole surface must fit between two planes separated by the number written in the frame. The companion note reminds you that ISO 1101 uses the same symbols, with differences concentrated in zone definitions and modifiers rather than in the pictograms themselves.` },
    ]},
    { heading: "How to Use GD&T Symbol Reference (Standards)", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Find the characteristic you intend to call out in the table, either by scrolling the single grouped table or by using the search box to filter to one symbol such as Cylindricity.`,
        `<strong>Step 2:</strong> Read the rule column for that symbol before writing the frame. It tells you the two things that determine whether your callout is legal: the zone shape (two planes, a cylinder, two concentric circles) and whether a datum reference is required.`,
        `<strong>Step 3:</strong> Apply the datum rule to your frame. Form controls — straightness, flatness, circularity, cylindricity — take no datum, because they measure the feature against itself. Orientation and location controls require datums, because they measure the feature against something else.`,
        `<strong>Step 4:</strong> Check the material condition note. MMC and LMC modifiers apply only to size-related controls such as position; applying an MMC modifier to flatness is a classic error this table is designed to catch.`,
        `<strong>Step 5:</strong> If the drawing must work under ISO rules rather than ASME, treat the zone and modifier differences flagged in the note — ISO 1101 marks regardless-of-feature-size differently and has its own modifier conventions — as the areas to double-check against the governing standard.`,
      ]},
    ]},
    { heading: "Why Use GD&T Symbol Reference (Standards)", content: [
      { type: "paragraph", text: `Most GD&T errors are not symbol mix-ups but rule violations: a datum written on a form control that cannot take one, an MMC modifier on a control where it has no meaning, or a zone described as if it were a size limit. A reference that states the zone and datum rule next to each symbol makes those violations visible before the drawing goes to the shop — cheaper by orders of magnitude than discovering them on a nonconforming part.` },
      { type: "paragraph", text: `The same table serves the reader side of the drawing. When you inherit a part with an unfamiliar control frame, looking up the symbol here tells you what zone the machinist must produce and what datum the inspector will set up on, which is exactly the information needed to judge whether the callout is achievable and how it will be verified.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Which controls require a datum and which do not?", content: [
      { type: "paragraph", text: `The form controls — straightness, flatness, circularity and cylindricity — take no datum because each measures a feature against an idealised version of itself. Every other family does: profile controls can be datum-referenced when they locate a surface, and orientation, location and runout controls always require at least one datum because they relate the feature to something else. If a control needs a datum and your frame has none, the callout is incomplete; if it forbids one and your frame has one, it is invalid.` },
    ]},
    { heading: "", subHeading: "What does the encircled t mean in the zone descriptions?", content: [
      { type: "paragraph", text: `The “t” is a placeholder for the tolerance value written in the feature control frame — the table describes zones generically because the same symbol serves every tolerance size. A flatness callout with t equal to 0.05 means two parallel planes 0.05 apart; the identical callout with 0.005 means two planes 0.005 apart. The symbol never changes, only the zone width, which is why the standard defines each control by its zone shape rather than by any particular number.` },
    ]},
    { heading: "", subHeading: "Why can position use MMC when flatness cannot?", content: [
      { type: "paragraph", text: `Material condition modifiers grant bonus tolerance as a feature departs from its maximum or least material condition, and that bonus only makes sense when size and location interact — the classic case of a hole at maximum material condition having the least room for positional error. Flatness and the other form controls measure shape alone and never trade against size, so a modifier has nothing to act on. Applying one there is meaningless and will be read as an error by anyone checking the drawing against Y14.5.` },
    ]},
    { heading: "", subHeading: "How does ISO 1101 differ from what this table shows?", content: [
      { type: "paragraph", text: `The symbols are identical between ASME Y14.5 and ISO 1101; the differences sit in the rules. ISO treats regardless-of-feature-size differently — the encircled S symbol is marked explicitly rather than being the default assumption the way it is under ASME for position — and ISO's GPS system spreads related rules across more documents. If a drawing must be manufactured and inspected under ISO, confirm zone and modifier conventions against ISO 1101 and its companion GPS standards rather than assuming the ASME reading carries over.` },
    ]},
  ],
};

const cylindricity_referenceSeo: ToolSeo = {
  sections: [
    { heading: "What is Cylindricity Reference", content: [
      { type: "paragraph", text: `Cylindricity Reference explains the cylindricity form control: what it limits, what its tolerance zone looks like, how it is measured, when to use it, and the mistakes that show up most often in real drawings. Cylindricity is the form control that limits the combined out-of-roundness and out-of-straightness of a cylindrical surface in a single tolerance value — the whole surface evaluated at once rather than slice by slice.` },
      { type: "paragraph", text: `The tolerance zone is the space between two coaxial cylinders a radial distance apart, containing the entire surface. Because the zone follows the actual axis of the feature rather than a datum axis, cylindricity takes no datum reference, and because it measures form rather than size, it does not control the diameter — a part can be perfectly cylindrical and still out of its size tolerance, or within size and badly bowed. A component can even be round in every cross-section yet curved along its length, and only a whole-surface control like cylindricity would catch that.` },
    ]},
    { heading: "How to Use Cylindricity Reference", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Read the four panels in order. The control panel defines what cylindricity does and its zone; the zone and verification panel explains how it is inspected; the practical guidance panel gives selection guidance and typical values; the common mistakes panel lists the errors to avoid.`,
        `<strong>Step 2:</strong> Decide whether cylindricity is the right control by comparing it with the alternatives. If only the roundness of each slice matters, circularity is cheaper to inspect. If the feature must run true to a datum axis — a rotating part — circular or total runout is the functional control, because runout also catches coaxiality errors that cylindricity ignores by design.`,
        `<strong>Step 3:</strong> Set the tolerance from function, using the typical ranges only as a starting point: 0.01 to 0.05 mm for precision fits, 0.05 to 0.1 mm for general sealing surfaces. Derive the final value from what the surface actually does, not from habit.`,
        `<strong>Step 4:</strong> Write the callout as the cylindricity symbol followed by the tolerance — with no datum reference, since form controls take none.`,
        `<strong>Step 5:</strong> Before issuing, run the checklist in the common mistakes panel: no datum in the frame, size toleranced separately, and the cylindricity value looser than a circularity callout on the same feature, because a whole-surface control cannot realistically be tighter than a per-section one.`,
      ]},
    ]},
    { heading: "Why Use Cylindricity Reference", content: [
      { type: "paragraph", text: `Cylindricity is one of the most misused GD&T controls because its failure mode is invisible to the tools people reach for first. A two-point micrometer measures diameter in one orientation — it cannot see a bowed axis or a lobed cross-section, and it certainly cannot verify a three-dimensional zone. Specifying cylindricity commits the shop to a CMM or a roundness machine with a straightness traverse, so the reference exists to make sure that commitment is justified by the function of the part.` },
      { type: "paragraph", text: `It also settles the sizing question that trips up reviewers: cylindricity and diameter size are independent. The zone floats on the actual axis, so the callout adds no size constraint — which means the drawing needs both a size tolerance and the cylindricity control, and neither substitutes for the other. Getting that separation right is what keeps a sealing surface callout honest.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why can cylindricity not have a datum reference?", content: [
      { type: "paragraph", text: `Because cylindricity is a form control: it measures the surface against an idealised cylinder fitted to itself, not against any external reference. A datum would imply the zone is oriented or located to something else, which would make it an orientation or location control instead. If the functional requirement involves a datum axis — a shaft running in bearings, a bore locating a spool — use runout, which combines form with coaxiality to that axis.` },
    ]},
    { heading: "", subHeading: "How is cylindricity actually measured?", content: [
      { type: "paragraph", text: `With a coordinate measuring machine taking many points around and along the surface, or with a roundness machine equipped with a straightness traverse that sweeps the probe along the axis as the part rotates. A two-point micrometer alone cannot verify cylindricity: it measures only one diameter at one position and cannot detect lobing, taper or bow along the length. The measurement cost is the main reason cylindricity is reserved for surfaces where the whole form genuinely matters.` },
    ]},
    { heading: "", subHeading: "What is the difference between cylindricity and circularity?", content: [
      { type: "paragraph", text: `Circularity controls one cross-section at a time — each circle of the surface must lie between two concentric circles. Cylindricity controls the entire surface at once, combining roundness with straightness along the axis between two coaxial cylinders. A part can satisfy circularity in every slice yet fail cylindricity if it bows along its length. In practice, a cylindricity callout should be looser than a circularity callout on the same feature, because controlling the whole surface is harder than controlling any one slice.` },
    ]},
    { heading: "", subHeading: "Does cylindricity control the diameter size of the feature?", content: [
      { type: "paragraph", text: `No. The tolerance zone follows the actual axis of the surface, so it constrains how far the surface may depart from a perfect cylinder around that axis — not where the axis sits or how big the cylinder is. Diameter size is toleranced separately by the size dimension. Expecting cylindricity to act as a size limit is one of the most common misunderstandings of the control and produces parts that pass the GD&T callout while failing the fit requirement, or vice versa.` },
    ]},
  ],
};

const parallelism_and_perpendicularity_guideSeo: ToolSeo = {
  sections: [
    { heading: "What is Parallelism & Perpendicularity Guide", content: [
      { type: "paragraph", text: `Parallelism & Perpendicularity Guide is a reference for the two most common orientation tolerances: parallelism, which limits how far a surface or axis may tilt away from parallel to a datum, and perpendicularity, which limits tilt away from 90 degrees to the datum. Both are orientation controls under ASME Y14.5 and ISO 1101, and both always require a datum — without one, parallelism degenerates into flatness or straightness, because there is nothing to orient to.` },
      { type: "paragraph", text: `The guide distinguishes the two ways each control is applied. On a surface application the tolerance zone is two parallel planes (for a flat surface) a distance apart, oriented to the datum. On an axis application — written beneath a size dimension for a hole or pin — the zone is a cylinder of diameter equal to the tolerance, parallel or perpendicular to the datum. A feature control frame reading ∥ 0.05 A means the surface or axis must stay parallel to datum A within 0.05 millimetres.` },
    ]},
    { heading: "How to Use Parallelism & Perpendicularity Guide", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Identify which control the feature needs. A face that must sit square to its mounting datum takes perpendicularity; a slide or a face that must stay level with a datum takes parallelism.`,
        `<strong>Step 2:</strong> Decide between surface and axis application. For a flat face, the zone is two planes. For a hole or pin whose axis must be oriented, the frame goes under the size callout and the zone is a cylinder of the tolerance diameter.`,
        `<strong>Step 3:</strong> Read the frame correctly: symbol first, then tolerance value, then the datum reference — ∥ 0.05 A is parallel to datum A within 0.05. A material-condition modifier such as M on the tolerance grants extra freedom as the feature departs from MMC; rare for parallelism, common for perpendicularity of pressed holes.`,
        `<strong>Step 4:</strong> Size the value against the process, using the guide's typical ranges as a starting point: parallelism of a milled face to a datum 0.02 to 0.05 mm, ground faces 0.005 to 0.01 mm, and perpendicularity of a bearing bore 0.01 to 0.02 mm per 25 mm of depth.`,
        `<strong>Step 5:</strong> Consider whether location is also required. If a bolt pattern must be both square and in place, a single position callout with a composite frame beats stacking separate position and perpendicularity frames.`,
      ]},
    ]},
    { heading: "Why Use Parallelism & Perpendicularity Guide", content: [
      { type: "paragraph", text: `Orientation errors are the quiet killers of assemblies: a face that is parallel to within drawing tolerance but drifts along its length, or a bore that leans a fraction of a degree, produces binding, uneven wear or misalignment that size tolerances alone never catch. Orientation controls exist precisely to bound those errors relative to a datum, and the guide exists to make sure the frame is written the way the shop will read it — with the correct zone shape and a datum that actually exists.` },
      { type: "paragraph", text: `The guide also carries the interaction knowledge that separates competent callouts from copybook ones. Perpendicularity error on a hole translates into apparent position error at depth — a tilt that is invisible at the mouth of the hole grows as you go deeper — so a deep bore with a tight mating pin may need an orientation control that a shallow hole does not. Understanding that relationship is how you decide between a perpendicularity frame and a position frame, and when you need both.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why does parallelism always need a datum when flatness does not?", content: [
      { type: "paragraph", text: `Flatness measures a surface against an idealised plane of its own — it bounds waviness with no external reference. Parallelism measures the orientation of a surface or axis relative to something else, and that something else must be named: the datum. Without a datum reference the parallelism callout has no meaning, because “parallel to what?” has no answer. The moment you find yourself wanting to control parallelism without a datum, the control you actually want is flatness or straightness.` },
    ]},
    { heading: "", subHeading: "How much position error does a tilted hole create at depth?", content: [
      { type: "paragraph", text: `The apparent drift grows linearly with depth: at a 10 mm deep hole, 0.1 degrees of tilt moves the far end by roughly 10 times the tangent of 0.1 degrees, which is about 0.017 mm. At 50 mm deep the same tilt moves the far end about 0.087 mm — five times the error for the same angular defect. That is why deep holes and bores pair with perpendicularity callouts while shallow features often get away with position alone: the orientation error only becomes visible as the feature gets longer.` },
    ]},
    { heading: "", subHeading: "When do I use position instead of perpendicularity?", content: [
      { type: "paragraph", text: `Position locates the axis at a basic location relative to datums and, when written with a composite frame, can also control orientation. Perpendicularity controls only the angle of the axis to the datum — it says nothing about where along that angle the feature sits. If the feature must be at a specific location, use position; if it only needs to be square regardless of exact location, perpendicularity may suffice. For a bolt pattern that must be both located and square, a single composite position frame is usually cleaner than stacking both controls.` },
    ]},
    { heading: "", subHeading: "What does the M modifier after the tolerance do?", content: [
      { type: "paragraph", text: `A material condition modifier on the tolerance, written as something like Ø0.1 M, allows the orientation zone to grow as the feature departs from maximum material condition — a pressed hole that is larger than its MMC size earns bonus orientation tolerance. The modifier is rarely used for parallelism but appears on perpendicularity callouts for pressed or cast holes, where the process naturally produces a range of sizes and the bonus keeps the callout achievable. It only applies to size-related axis applications, never to a flat surface.` },
    ]},
  ],
};

const surface_roughness_ra_referenceSeo: ToolSeo = {
  sections: [
    { heading: "What is Surface Roughness Ra Reference", content: [
      { type: "paragraph", text: `Surface Roughness Ra Reference is a two-table lookup for Ra, the most common surface roughness parameter on engineering drawings. Ra — the arithmetic mean deviation of the assessed profile under ISO 4287 — is the average distance of the surface profile from its centre line over the sampling length. The first table maps the Ra ranges each manufacturing process actually achieves, from lapping and honing at 0.025 to 0.1 micrometres down to as-cast and as-forged surfaces at 6.3 to 25 micrometres. The second maps typical applications to the Ra a working part usually needs.` },
      { type: "paragraph", text: `The tool is built around the callout convention as well as the numbers: Ra is written with the ISO 1302 basic symbol plus a value, as in Ra 0.8 or the check-mark symbol with 0.8. The reference carries the caveats that matter when a surface is functional — Ra is insensitive to isolated scratches and waviness, so seal and wear surfaces may need Rz or Rmax, and the sampling (cut-off) length should always be stated with the callout. A rule of thumb places Ra at roughly 0.2 to 0.25 times Rz for turned surfaces.` },
    ]},
    { heading: "How to Use Surface Roughness Ra Reference", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Find the process you intend to use in the Ra ranges by process table. The left column gives the Ra band the process reliably produces; the middle column names the processes; the right column lists the typical uses that band serves.`,
        `<strong>Step 2:</strong> Work the other direction when you have a surface requirement: look up the application in the Application guidance table. A rotating shaft seal lip track wants Ra 0.2 to 0.8 micrometres, a plain bearing journal 0.2 to 0.4, gear tooth flanks 0.8 to 1.6.`,
        `<strong>Step 3:</strong> Match the required Ra to an achievable process. If the callout needs Ra 0.4, grinding or reaming lands in the 0.1 to 0.4 band; specifying lapping for a part that will be turned is a process mismatch the first table exposes immediately.`,
        `<strong>Step 4:</strong> Type into the search box to filter either table when you are checking a single material, process or application.`,
        `<strong>Step 5:</strong> Write the callout with the sampling length included and check the fine print: for sealing or wear surfaces where peaks matter, consider whether Ra alone is the right parameter or whether Rz or Rmax should accompany it.`,
      ]},
    ]},
    { heading: "Why Use Surface Roughness Ra Reference", content: [
      { type: "paragraph", text: `Surface roughness callouts fail in two common ways: the value is tighter than the process can deliver, forcing the shop into an expensive secondary operation nobody planned, or the value is too loose for the function, and the surface leaks, wears or frets in service. A process-to-Ra table settles the first question at the drawing stage, and an application-to-Ra table settles the second — together they turn a number picked from habit into a number with a manufacturing path behind it.` },
      { type: "paragraph", text: `The application values here are the ones that recur across real machines: an O-ring gland at Ra 0.4 micrometres, hydraulic spools at 0.05 to 0.2, sliding guide ways at 0.4 to 0.8, and painted surfaces deliberately rougher at 3.2 to 6.3 to give the coating something to grip. Keeping those anchors in one place makes it faster to write a defensible callout and faster to challenge an inherited one.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What is the difference between Ra and Rz?", content: [
      { type: "paragraph", text: `Ra is the arithmetic average of the profile's deviation from its centre line, which smooths over isolated features — a single deep scratch barely moves it. Rz is the average of the tallest profile peaks and deepest valleys over the sampling length, so it responds to the extremes that affect sealing and wear. For a dynamic O-ring gland or a shaft seal lip, the peaks are what leak, which is why Rz or Rmax is often specified alongside Ra for those surfaces. As a rough conversion for turned surfaces, Ra runs about 0.2 to 0.25 times Rz.` },
    ]},
    { heading: "", subHeading: "Why does the drawing need a cut-off length with the Ra value?", content: [
      { type: "paragraph", text: `Ra is measured over a finite sampling length, and the value changes with that length because longer samples include longer-wavelength waviness that a short sample filters out. Without a stated cut-off, the machinist and the inspector may measure the same surface with different sampling lengths and get different Ra numbers. The standard practice is to write the cut-off with the callout — commonly 0.8 mm for general machined surfaces — so the measurement is reproducible.` },
    ]},
    { heading: "", subHeading: "Can turning achieve the same Ra as grinding?", content: [
      { type: "paragraph", text: `Fine turning and milling with modern inserts reach about 0.4 to 1.6 micrometres — good enough for general machine fits and unmated surfaces. Grinding and reaming reach 0.1 to 0.4, and lapping, honing and superfinishing reach 0.025 to 0.1. The bands overlap at the edges, so a process choice near a boundary should be confirmed against the shop's own capability data, but the ordering is reliable: if a callout demands Ra 0.1, plan on grinding or better, not on turning.` },
    ]},
    { heading: "", subHeading: "Is a rougher surface ever the right callout?", content: [
      { type: "paragraph", text: `Yes — deliberately. Painted and coated surfaces are often specified at Ra 3.2 to 6.3 micrometres so the coating has an anchor profile to bond to, and a ground-smooth surface under paint can actually reduce adhesion. Clearance and non-functional faces sit comfortably at 1.6 to 6.3, and as-cast or as-forged surfaces are left at 6.3 to 25 with no machining at all. Specifying roughness only where function demands it is cheaper than polishing everything.` },
    ]},
  ],
};

const drawing_standards_comparator_ansi_vs_isoSeo: ToolSeo = {
  sections: [
    { heading: "What is Drawing Standards Comparator (ANSI vs ISO)", content: [
      { type: "paragraph", text: `Drawing Standards Comparator (ANSI vs ISO) is a side-by-side table of the fourteen conventions that most often trip up a drawing office working across the US and international systems. It pairs each topic — projection, units, dimensioning, GD&T, hatching, welding symbols, scales — with what the ANSI/ASME world expects and what the ISO world expects, so the difference is visible in one row instead of buried across two standards libraries.` },
      { type: "paragraph", text: `Some rows are the famous ones: third-angle projection under ASME Y14.3 versus first-angle under ISO 128-30; inches by default versus millimetres by default; the decimal period versus the comma used in many countries; ASME Y14.5-2018 versus the ISO 1101 GPS family. Others are the quiet traps: the regardless-of-feature-size convention, which is the unmarked default for position under ASME but an explicitly encircled-S modifier under ISO, or surface texture symbols from Y14.36 versus the ISO 1302 check-mark.` },
    ]},
    { heading: "How to Use Drawing Standards Comparator (ANSI vs ISO)", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Open the table and find the row for the convention you are about to use — projection, decimal point, GD&T, welding symbols, or whichever applies to the current sheet.`,
        `<strong>Step 2:</strong> Read the two columns to confirm which system your drawing is being produced under, then apply that column's convention. If the file is going to a US fabricator, third-angle views, period decimals and ASME Y14.5 apply; if it is going to Europe or Asia, check first-angle, comma or period per the country, and the ISO frame rules.`,
        `<strong>Step 3:</strong> Use the search box to filter the table when you are checking one specific topic, such as how sections are hatched or which symbol a projected tolerance zone takes in each system.`,
        `<strong>Step 4:</strong> Pay special attention to the GD&T rows when the drawing carries feature control frames — the RFS row is where a frame that is perfectly legal under ASME gets misread under ISO rules, and vice versa.`,
        `<strong>Step 5:</strong> State the governing standard in the title block, as the table's note urges. A drawing that names ASME Y14.5-2018 and ISO 128-30 in the same title block is telling the shop it may need to ask which one governs.`,
      ]},
    ]},
    { heading: "Why Use Drawing Standards Comparator (ANSI vs ISO)", content: [
      { type: "paragraph", text: `The single most expensive drawing error across international work is not a wrong dimension — it is a mixed-standard drawing. A file drawn in inches with ISO first-angle views, or an ASME position tolerance interpreted under ISO rules where RFS is not the default, sends contradictory instructions to the shop, and the contradiction is usually discovered only when parts arrive. A comparator that lays the two systems side by side makes the decision to pick one and state it a conscious act.` },
      { type: "paragraph", text: `The table is equally useful for the reverse direction: reading drawings made under the other system. A European drawing arriving in a US shop carries first-angle views, possibly comma decimals and ISO hatching — all of which look like errors to an eye trained only on ASME. Rows like the projection and decimal-point entries defuse those false alarms in seconds, which keeps review time focused on geometry rather than convention.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why does ANSI use third-angle projection and ISO first-angle?", content: [
      { type: "paragraph", text: `Both are correct ways to unfold a three-dimensional part into views; the systems just place the views differently. In third-angle projection, used in the US under ASME Y14.3, the view of the right side of the part is drawn to the right of the front view — as if the part were a pane of glass and you look through it. In first-angle projection, used across most of Europe and Asia under ISO 128-30, the right-side view is drawn to the left, as if the part rolls away from you. The standard projection symbol in the title block tells the reader which convention applies, which is why the symbol must never be omitted on international work.` },
    ]},
    { heading: "", subHeading: "What is the RFS difference and why does it matter?", content: [
      { type: "paragraph", text: `Regardless of feature size (RFS) means the positional tolerance does not grow as the feature departs from its maximum material condition. Under ASME Y14.5, RFS has no symbol and is the default for position tolerances. Under ISO 1101, RFS must be marked explicitly with the encircled S modifier; the unmarked default is different. A position frame moved between systems without checking this row can gain or lose bonus tolerance the designer never intended, which is exactly the kind of silent change that surfaces as a nonconforming part.` },
    ]},
    { heading: "", subHeading: "Can one drawing use ANSI dimensioning and ISO views?", content: [
      { type: "paragraph", text: `Technically yes, but it should not — mixing conventions is precisely the failure this comparator exists to prevent. Every convention on the sheet is read through the governing standard, and once a reader has to hold two standards in their head, ambiguity creeps in at exactly the places where it is most expensive: whether a view is first- or third-angle, whether a comma is a decimal or a thousands separator, whether a tolerance has an implicit bonus. Choose the system that governs the contract and apply it to the whole sheet.` },
    ]},
    { heading: "", subHeading: "Are the scale conventions really different between the systems?", content: [
      { type: "paragraph", text: `Yes, in the preferred series. The US convention favours civil scales such as 1:2, 1:4, 1:8 and 1:16 for architectural and civil work, alongside SI scales like 1:20 and 1:50 when the project is metric. The ISO preferred series runs 1:2, 1:5, 1:10, 1:20, 1:50, 1:100 and so on in decade steps. The practical difference is small but real: a 1:8 detail is immediately recognised in the US system and is non-standard under ISO, where 1:10 would be the expected choice.` },
    ]},
  ],
};

const fluid_flow_rate_calculatorSeo: ToolSeo = {
  sections: [
    { heading: "What is Fluid Flow Rate Calculator", content: [
      { type: "paragraph", text: `Fluid Flow Rate Calculator converts pipe internal diameter and mean flow velocity into the volumetric flow rate, in the four units a piping job actually speaks: cubic metres per second, cubic metres per hour, litres per minute and litres per second. The relationship is the continuity equation — flow rate equals velocity times cross-section area — where the area of a circular pipe is pi times the diameter squared over four, with the millimetre diameter converted to metres before the area is computed.` },
      { type: "paragraph", text: `The tool carries the design-velocity guidance that makes the result usable: water systems typically run 1 to 3 metres per second, open drains need about 0.6 metres per second minimum to stay self-cleaning, and compressed air lines run 6 to 15 metres per second. Those bands are where the calculator earns its keep — given a target flow rate, the velocity range tells you the pipe size window, and given a pipe size, the velocity tells you whether the flow is reasonable or the line is undersized.` },
    ]},
    { heading: "How to Use Fluid Flow Rate Calculator", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Enter the Internal diameter of the pipe in millimetres — the bore, not the outside diameter or the nominal size, since flow sees the inside.`,
        `<strong>Step 2:</strong> Enter the Mean velocity of the fluid in metres per second. For design work, start from the guidance band appropriate to your service: 1 to 3 m/s for water, around 0.6 m/s minimum for gravity drains, 6 to 15 m/s for compressed air.`,
        `<strong>Step 3:</strong> Read the Result panel. Cross-section area is the pipe bore area in square metres; Flow rate is the volumetric rate in cubic metres per second; the three Volumetric flow rows restate it as m³/h, L/min and L/s so you can quote the number in whatever unit the pump schedule or the code uses.`,
        `<strong>Step 4:</strong> Sanity-check the arithmetic with a known case: a 50 mm pipe at 2 m/s gives a flow of about 0.0039 m³/s, or 14.14 m³/h, or 235.6 L/min. If your result is off by a factor of a thousand, the diameter was probably entered in metres instead of millimetres.`,
        `<strong>Step 5:</strong> Reverse the tool for sizing: decide the flow you need, pick a velocity from the guidance band, and find the diameter that puts the velocity inside the band.`,
      ]},
    ]},
    { heading: "Why Use Fluid Flow Rate Calculator", content: [
      { type: "paragraph", text: `Volumetric flow is the common currency between the disciplines on a project: the process engineer specifies litres per minute, the pump vendor quotes cubic metres per hour, and the instrument engineer reads litres per second. Converting between those units by hand while also converting the pipe diameter to metres is exactly the multi-step arithmetic where a misplaced decimal point produces a pump that is ten times too small. Computing the area once and deriving every flow unit from it keeps all four answers consistent.` },
      { type: "paragraph", text: `The tool also makes the velocity guidance actionable. Velocity is the design variable that balances economy against erosion and noise — too slow and lines silt up or run oversized, too fast and fittings erode and water hammer worsens. With the flow rate and the guidance band side by side, the diameter that lands the velocity in the right range is a quick iteration rather than a lookup into a fading memory of a nomograph.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How is the cross-section area computed from the diameter?", content: [
      { type: "paragraph", text: `The area of a circular bore is pi times the diameter squared, divided by four. The diameter you enter in millimetres is first divided by 1000 to metres, then squared and multiplied by pi over four to give the area in square metres. A 50 mm bore therefore has an area of about 0.00196 m² — which is why a 2 m/s flow through it is only about 0.0039 m³/s; the cubic-metre-per-second numbers for pipe flow are always small, and the L/min and m³/h rows exist to keep them legible.` },
    ]},
    { heading: "", subHeading: "Which diameter should I enter — nominal or internal?", content: [
      { type: "paragraph", text: `Always the internal diameter. Flow passes through the bore, and the nominal pipe size is a label, not a dimension — a 50 mm nominal pipe has a bore that depends on its schedule, with thicker walls leaving a smaller inside diameter. For sizing from a schedule table, use the actual bore for the wall thickness you intend. Entering the nominal size overstates the area and the flow, usually by enough to matter on a pump selection.` },
    ]},
    { heading: "", subHeading: "What velocity should I design to?", content: [
      { type: "paragraph", text: `It depends on the service. Water in closed systems is typically designed at 1 to 3 m/s — below about 0.6 m/s in gravity drains the flow can fail to keep the line self-cleaning, while above about 3 m/s erosion, noise and water-hammer risk climb. Compressed air is deliberately faster at 6 to 15 m/s because the fluid is light. These bands come from the tool's built-in guidance; the final value also depends on the material and the code, so treat the band as the starting window, not the last word.` },
    ]},
    { heading: "", subHeading: "Does the tool handle non-circular pipes or partially full flow?", content: [
      { type: "paragraph", text: `No — it assumes a circular bore running full, which is the correct model for pumped closed systems. Gravity drains flowing partially full, rectangular ducts and open channels have different geometry, and the velocity-area approach still applies but the wetted area and velocity profile must be computed for the actual shape and fill level. For those cases use a calculator built for the specific geometry rather than this circular-full-bore tool.` },
    ]},
  ],
};

const pipe_material_referenceSeo: ToolSeo = {
  sections: [
    { heading: "What is Pipe Material Reference", content: [
      { type: "paragraph", text: `Pipe Material Reference is a comparison table of ten common piping materials — carbon steel, stainless steel, copper, PVC, CPVC, PEX, HDPE, ductile iron, cast iron and galvanized steel — with each one's common schedule or type, typical service, nominal temperature limit and joining method. It is a concept-stage tool: enough to narrow a material family before the code work begins, with the values labelled as indicative rather than as code ratings.` },
      { type: "paragraph", text: `The temperature limits capture the real selection boundaries: PVC is done at 60 degrees Celsius, CPVC stretches to about 93, PEX to about 82, carbon steel to roughly 425 depending on grade, and stainless derates above 400. The service column does the heavier lifting — carbon steel is the default industrial pipe for water, steam, oil and gas; stainless takes corrosive, food, pharma and ultrapure duty; copper owns potable water and HVAC refrigerant; and the plastics are split by temperature into cold-water PVC, hot-water CPVC, and PEX for distribution and radiant heat.` },
    ]},
    { heading: "How to Use Pipe Material Reference", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Start from the Typical service column: name the fluid and the service, and the table narrows the field. Potable water distribution points to copper, PEX or CPVC; steam and high-pressure industrial service points to carbon steel; corrosive or ultrapure chemical duty points to stainless.`,
        `<strong>Step 2:</strong> Check the temperature limit column against your maximum operating temperature. The table's nominal limits are where most material eliminations happen — a hot-water line above 60 °C rules out PVC before any other comparison is needed.`,
        `<strong>Step 3:</strong> Read the Joining column with your installation in mind. Solvent-welded PVC and CPVC need the right cement; PEX uses crimp, expansion or press fittings with none buried; HDPE is butt- or electrofusion-welded; ductile iron is push-on with restrained joints where thrust demands.`,
        `<strong>Step 4:</strong> Use the search box to filter to one material or one service when comparing two candidates side by side.`,
        `<strong>Step 5:</strong> Take the surviving candidate to the governing code — ASME B31.1, B31.3 or B31.9 for industrial, IPC for plumbing, NFPA 13 for sprinkler — and to the manufacturer's published ratings for the real pressure-temperature envelope. The table is the shortlist, not the approval.`,
      ]},
    ]},
    { heading: "Why Use Pipe Material Reference", content: [
      { type: "paragraph", text: `Material selection mistakes in piping are expensive twice: once when the wrong material is bought and installed, and again when it fails in service or fails inspection. Most of those mistakes come from the boundaries between materials, not from the materials themselves — reaching for PVC on a line that will see hot water, or specifying galvanized for new potable work where scale build-up makes it the wrong answer. A table that puts the temperature limits and service niches next to each other catches those boundary errors at the concept stage.` },
      { type: "paragraph", text: `The reference is deliberately honest about its own scope: temperature values are nominal, pressure ratings are absent, and the note points to the codes that actually govern. That framing matters because piping reference data pulled from memory or a vendor snippet is how plausible-looking but wrong ratings get onto drawings. Knowing which material family is right is the table's job; confirming the code rating is the engineer's.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why is PVC never used for hot water or compressed air?", content: [
      { type: "paragraph", text: `PVC's maximum service temperature is about 60 degrees Celsius, which hot water systems routinely exceed, and above that the material softens and loses pressure capability. Compressed air is a different failure mode: PVC is brittle, and a rupture under compressed air can shatter into flying fragments, so most codes and industry practices prohibit PVC for compressed air regardless of pressure. CPVC is the hot-water plastic — rated to about 93 °C — and metal or HDPE serves compressed air duty.` },
    ]},
    { heading: "", subHeading: "What is the difference between copper K, L and M?", content: [
      { type: "paragraph", text: `They are wall-thickness grades of the same ASTM B88 copper tubing. Type M has the thinnest wall and the lowest pressure rating, used for most residential water distribution; type L is the middle grade and the default for most plumbing as well as many commercial systems; type K has the thickest wall and is specified for buried and underground service where corrosion allowance matters. The grade is printed along the tube, so the reference table's note — L for most plumbing, K for buried — is the shorthand for a selection that the local code ultimately governs.` },
    ]},
    { heading: "", subHeading: "When should I choose HDPE over ductile iron for a water main?", content: [
      { type: "paragraph", text: `Both serve water mains, but they suit different conditions. HDPE is fusion-welded, corrosion-resistant and forgiving of ground movement, which makes it strong for trenchless installation and aggressive soils — but it has a lower pressure-temperature envelope and needs special handling for thrust restraint. Ductile iron carries higher working pressures, is the traditional choice where mechanical joints and tapping are routine, and needs corrosion protection in some soils plus restrained joints where thrust could separate push-on joints. Soil corrosivity, installation method and pressure drive the choice, and the utility's own standard usually settles it.` },
    ]},
    { heading: "", subHeading: "What does schedule mean and why does it matter?", content: [
      { type: "paragraph", text: `Schedule is the wall-thickness designation — Sch 40 and Sch 80 are the common ones, with 80 having a thicker wall and higher pressure rating for the same nominal size. The table lists the schedules each material is commonly made in: carbon steel in Sch 40 and 80, stainless in Sch 10S through 40S, PVC in Sch 40 and 80 under ASTM D1785. Because the internal bore shrinks as the wall thickens, the schedule also changes the flow area, which is why a flow calculation needs the actual bore for the chosen schedule rather than the nominal size.` },
    ]},
  ],
};

const valve_type_referenceSeo: ToolSeo = {
  sections: [
    { heading: "What is Valve Type Reference", content: [
      { type: "paragraph", text: `Valve Type Reference is a selection table of the ten valve families a piping designer meets most: gate, globe, ball, butterfly, check, needle, diaphragm, plug, pressure-reducing, and relief or safety valves. Each row names the valve's primary function, its flow behaviour, and the applications it suits, so the difference between an isolation valve and a throttling valve — and the cost of confusing them — is explicit rather than assumed.` },
      { type: "paragraph", text: `The table's spine is the function split. Gate, ball, butterfly and plug valves are on/off devices: they isolate with low pressure drop when fully open and throttle poorly. Globe, needle and diaphragm valves modulate: they control flow at partial opening at the price of a higher drop. Check valves act automatically to prevent reverse flow, pressure-reducing valves regulate downstream pressure, and relief or safety valves protect the system by opening at a set pressure. The applications column grounds each family — ball valves for isolation in most services including gas, butterflies for large water and HVAC mains, needles for instrumentation, diaphragms for slurry and corrosive duty.` },
    ]},
    { heading: "How to Use Valve Type Reference", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Name the duty first: is the valve isolating a line, modulating a flow, preventing reverse flow, regulating pressure, or protecting the system? The Primary function column maps each family to one of those jobs.`,
        `<strong>Step 2:</strong> For isolation duty, compare the on/off families. A ball valve gives near-zero drop, tight shut-off and fast quarter-turn action for most services including gas; a gate valve suits large mains where slow operation is acceptable; a butterfly wins on compactness and cost at big diameters.`,
        `<strong>Step 3:</strong> For throttling duty, pick a modulating family — globe for steam and control bypasses, needle for fine small-flow metering, diaphragm where the fluid must stay away from the mechanism. Do not throttle with a ball or butterfly valve: the note warns that seat erosion and poor control follow.`,
        `<strong>Step 4:</strong> For the automatic duties, match the mechanism: swing check for low drop on pump discharge, lift or spring checks where the higher drop is acceptable, a PRV where downstream pressure must stay regulated, and a relief valve where overpressure protection is the requirement.`,
        `<strong>Step 5:</strong> Use the search box to filter the table while comparing two candidates, then take the shortlist to the project specification — the reference selects the family; the spec and the process data select the size and trim.`,
      ]},
    ]},
    { heading: "Why Use Valve Type Reference", content: [
      { type: "paragraph", text: `Valve mis-selection usually is not a sizing error — it is a function error: an isolation valve pressed into throttling duty, or a check valve where the system needed a relief valve. Those mistakes fail slowly and expensively, through eroded seats, surging lines or an overpressure event the system had no protection for. A table that leads with each family's primary function makes the duty-versus-device match the first thing checked rather than an afterthought.` },
      { type: "paragraph", text: `The table also carries the operational knowledge that drawings rarely state: a gate valve left partly open chatters and erodes, a butterfly throttled at small openings cavitates, and a swing check needs gravity to close, so its orientation on the line matters. Knowing the behaviour behind each family — not just its name — is what turns a valve schedule into a system that survives contact with the process.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why should I not throttle with a ball or butterfly valve?", content: [
      { type: "paragraph", text: `Ball and butterfly valves are isolation devices: their seats and seals are designed for fully open or fully closed service. Held at a partial opening, the high-velocity flow across the partially exposed seat erodes it and the flow control is coarse and unstable — the valve neither isolates well later nor modulates well now. Globe, needle and diaphragm valves have trim geometry built for sustained partial opening, which is why they carry the higher pressure drop that makes them poor isolation choices but good control choices.` },
    ]},
    { heading: "", subHeading: "What is the difference between a relief valve and a safety valve?", content: [
      { type: "paragraph", text: `Both open at a set pressure to protect a system, but the service differs. A relief valve opens gradually and proportionally as pressure rises, used on liquid systems where overpressure builds slowly. A safety valve pops fully open almost instantly, used on compressible services like steam and air where pressure can spike explosively — full discharge is the only adequate response. The combined term safety relief valve covers both. Selecting the wrong opening characteristic can leave a system protected on paper but not in the transient it actually faces.` },
    ]},
    { heading: "", subHeading: "When does a check valve need to be a specific type?", content: [
      { type: "paragraph", text: `When the flow conditions demand it. A swing check has a low pressure drop and suits clean fluids in horizontal or upward flow, but its disc needs gravity and time to close — in a pulsating flow it slams. Lift and spring-loaded checks close faster and suit vertical or pulsating service at the cost of a higher drop. For pump discharge, the check must also be sized so the disc fully lifts at normal flow; an oversized check that never opens fully flutters and wears out its seat prematurely.` },
    ]},
    { heading: "", subHeading: "Why is a gate valve a poor choice for frequent operation?", content: [
      { type: "paragraph", text: `A gate valve's sealing element is a wedge or disc that travels a long distance from fully closed to fully open — often several turns of a rising stem — so frequent operation is slow, and a gate cycled often wears its seats and stem packing faster than a quarter-turn valve would. Gate valves earn their place on large mains and block valves that open and close rarely, where their low pressure drop when fully open matters more than speed. For frequent isolation, a quarter-turn ball or butterfly valve is the faster, longer-lived choice.` },
    ]},
  ],
};

const hvac_equipment_selector_guideSeo: ToolSeo = {
  sections: [
    { heading: "What is HVAC Equipment Selector Guide", content: [
      { type: "paragraph", text: `HVAC Equipment Selector Guide matches eight building and zone types to the equipment family that usually serves them, with the typical capacity range and the selection notes that matter early in design. It covers the spread of commercial HVAC: packaged rooftop units for one-zone retail, VAV with a central air handler for multi-zone buildings, VRF for retrofit and part-load diversity, CRAC and CRAH units for server rooms, split heat pumps for residential suites, make-up air for industrial plants, DOAS for schools and assembly halls, exhaust hoods for kitchens, and hundred-percent-outdoor-air units for laboratories.` },
      { type: "paragraph", text: `It is deliberately a concept-stage tool. Each row pairs an application with the equipment family and its capacity band — AHUs 5 to 100-plus tons, VRF 1 to 60 tons, rooftop units 2 to 50 tons — and the notes carry the design rules that shape the real selection: chilled-water VAV is the workhorse above 50,000 square feet, server rooms are sensible-only loads with tight supply ranges, kitchen make-up air must track the hood exhaust, and fume-hood labs stay net negative against corridors. The tool's own disclaimer is the operative one: final selection follows the load calculation and the ventilation and energy codes, not the application alone.` },
    ]},
    { heading: "How to Use HVAC Equipment Selector Guide", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Pick the building or zone type from the Application selector — the eight options cover small commercial, multi-zone commercial, server rooms, residential, industrial, schools, kitchens and laboratories.`,
        `<strong>Step 2:</strong> Read the Suggested equipment panel. The equipment family appears first, the Typical capacity band gives the working range to sanity-check against the rough load, and the Selection notes carry the rule that most shapes the design — from matching EER and SEER to code minimums to keeping a lab net negative.`,
        `<strong>Step 3:</strong> Use the capacity band to test the early arithmetic. A 30,000-square-foot office with a plausible load of 300 tons is already outside the single-AHU band on the chart and points to a chilled-water plant rather than a rooftop — the guide catches that mismatch before the load model is built.`,
        `<strong>Step 4:</strong> Note the code hooks each row names: ACCA Manual J for residential sizing, ASHRAE 62.1 for ventilation air in schools and assembly halls, ASHRAE classes for server-room conditions, Type I hood requirements for cooking.`,
        `<strong>Step 5:</strong> Treat the result as the starting family, then size with a real load calculation and verify the equipment against the governing energy and ventilation codes before it reaches the schedule.`,
      ]},
    ]},
    { heading: "Why Use HVAC Equipment Selector Guide", content: [
      { type: "paragraph", text: `The equipment family decision shapes everything downstream — the shaft space for ductwork, the plant room footprint, the refrigerant choice, the controls strategy — and it is usually made from experience and habit rather than from the load. A guide that forces the application to be named and then states the conventional family, capacity band and governing rule makes the early decision explicit, which is exactly where a wrong family choice is still cheap to reverse.` },
      { type: "paragraph", text: `The notes also carry the non-obvious rules that separate a workable concept from a rework: laboratory systems need energy recovery as effectively mandatory because hundred-percent outdoor air is ruinously expensive without it; kitchen make-up air must be tempered and tracked to the exhaust; server-room cooling is a sensible-load problem where humidity and supply temperature matter more than total tonnage. Having those rules attached to the application row keeps them in front of the designer at the moment of choice.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "When is VRF a better choice than chilled-water VAV?", content: [
      { type: "paragraph", text: `Chilled-water VAV with a central air handler is the workhorse for new buildings above about 50,000 square feet, where its plant efficiency, ventilation control and service life pay off. VRF suits retrofit projects and buildings with strong part-load diversity — many zones running at different loads at once — where its inverter-driven refrigerant flow and small pipe risers beat a full hydronic plant. The crossover depends on climate, energy code and first-cost goals, which is why the guide frames the choice by application and leaves the final call to the load and life-cycle analysis.` },
    ]},
    { heading: "", subHeading: "Why do server rooms need special cooling rather than comfort AC?", content: [
      { type: "paragraph", text: `Server loads are almost entirely sensible heat — the equipment does not add moisture — and the room needs tight control of both temperature and humidity to protect the electronics. Comfort equipment is sized for mixed sensible and latent loads and runs poorly at the steady high-sensible fraction a server room presents. CRAC and CRAH units are built for that duty, with supply temperatures in the 19 to 25 degrees Celsius range and humidity held within the ASHRAE A1 to A4 classes, typically 20 to 80 percent relative humidity depending on the class.` },
    ]},
    { heading: "", subHeading: "How much make-up air does a commercial kitchen need?", content: [
      { type: "paragraph", text: `The exhaust hood sets the number: hood exhaust runs roughly 250 to 600 CFM per linear foot of hood, and the make-up air system should temper and supply 80 to 100 percent of that exhaust to keep the room from going negative. A Type I hood is required over cooking equipment that produces grease, and the make-up air should be introduced so it does not short-circuit across the hood opening — typically keeping 15 to 20 percent of the supply from ambient or un-tempered sources to balance first cost against comfort.` },
    ]},
    { heading: "", subHeading: "What makes laboratory HVAC different from office HVAC?", content: [
      { type: "paragraph", text: `Laboratories ventilate for safety, not comfort: fume-hood labs run 6 to 15 air changes per hour depending on hazard class and must stay net negative against corridors so contaminants never flow out. That means hundred-percent outdoor-air systems with no recirculation, which makes energy recovery effectively mandatory — the exhaust and supply streams exchange heat before the air is thrown away. The result is a very different plant from a recirculating office system, which is why the guide lists lab equipment as its own family rather than as a variant of the commercial one.` },
    ]},
  ],
};

const refrigerant_properties_referenceSeo: ToolSeo = {
  sections: [
    { heading: "What is Refrigerant Properties Reference", content: [
      { type: "paragraph", text: `Refrigerant Properties Reference is a lookup of the key physical and environmental properties of ten common refrigerants: boiling point at one atmosphere, critical temperature, 100-year global warming potential, ozone depletion potential, ASHRAE 34 class, and the service each one currently serves. The table spans the transition now underway in the industry — legacy HCFC and high-GWP HFC refrigerants alongside the A2L and natural refrigerants replacing them.` },
      { type: "paragraph", text: `The rows tell the transition story directly: R-22 and R-134a as legacy fluids being phased out and down, R-410A still dominant in residential DX but transitioning to A2L, R-32 as the mildly flammable new residential choice, R-404A and R-507A as high-GWP supermarket fluids under pressure, and the naturals — R-290 propane at a GWP of 3, R-744 carbon dioxide at 1, R-717 ammonia at zero — plus R-1234yf for automotive. The safety classes carry their own weight: A2L is mildly flammable, A3 is highly flammable with charge limits, and ammonia is toxic, confining it to machine rooms.` },
    ]},
    { heading: "How to Use Refrigerant Properties Reference", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Identify the service — residential AC, supermarket low-temp, automotive, industrial — and find the candidate refrigerants in the Typical use column of the table.`,
        `<strong>Step 2:</strong> Read the environmental columns for the candidates. GWP (100-yr) is the number driving regulation: R-404A at 3922 is under the most pressure from F-Gas phase-downs, while R-32 at 675 and the naturals below 10 are the direction of travel. ODP is zero for everything except the legacy R-22, which still shows 0.05.`,
        `<strong>Step 3:</strong> Check the ASHRAE 34 safety class in the notes column. An A2L like R-32 needs different handling, charge limits and leak-detection rules than the A1 fluids it replaces; R-290 at A3 carries strict charge limits; R-717 at B2L is toxic and confined to machine rooms.`,
        `<strong>Step 4:</strong> Use the boiling-point and critical-temperature columns for the system questions — a low-temperature freezer application wants a refrigerant whose boiling point suits the evaporator temperature, and transcritical CO₂ systems live above R-744's critical temperature of 31.1 °C.`,
        `<strong>Step 5:</strong> Treat the numbers as typical published values and confirm against the current standard edition and the manufacturer's data before final selection, since GWP values shift with the reporting period (AR4 versus AR5) and regulations move quickly.`,
      ]},
    ]},
    { heading: "Why Use Refrigerant Properties Reference", content: [
      { type: "paragraph", text: `Refrigerant selection is now driven as much by regulation as by thermodynamics, and the two can point in opposite directions: a high-GWP fluid with excellent performance may be scheduled for phase-down before the equipment it fills reaches end of life. A table that puts GWP, ODP and phase-out status next to the physical properties makes the regulatory dimension visible at the same moment as the engineering one, which is where a defensible selection starts.` },
      { type: "paragraph", text: `The safety-class information is the part that keeps a concept from becoming a compliance problem. Choosing an A2L or A3 refrigerant changes the equipment room, the charge limits and the ventilation and leak-detection provisions — decisions that are cheap at concept stage and expensive after the plant room is built. Knowing the class before the selection is made is the difference between a design that passes review and one that gets sent back.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What do the ASHRAE 34 safety classes mean?", content: [
      { type: "paragraph", text: `ASHRAE 34 classes combine a toxicity letter and a flammability digit. A is lower toxicity, B is higher toxicity; 1 is no flame propagation, 2 is lower flammability, 2L is lower flammability with a low burning velocity, and 3 is higher flammability. R-410A is A1 — non-flammable, the historical comfort default. R-32 and R-1234yf are A2L, mildly flammable with handling rules. R-290 propane is A3, highly flammable with strict charge limits. R-717 ammonia is B2L — toxic and flammable in concentration, which is why it lives in machine rooms.` },
    ]},
    { heading: "", subHeading: "What is the difference between GWP and ODP?", content: [
      { type: "paragraph", text: `ODP — ozone depletion potential — measures how much a substance damages the stratospheric ozone layer, and it is essentially solved: the Montreal Protocol phased out the CFCs and HCFCs, leaving only legacy R-22 with a small ODP of 0.05 in this table. GWP — global warming potential — measures how much a substance warms the climate over a 100-year horizon relative to CO₂, and it is the current regulatory battleground. A refrigerant can have zero ODP and a very high GWP — R-404A at 3922 — which is why the phase-downs target GWP rather than ODP.` },
    ]},
    { heading: "", subHeading: "Why is CO₂ a refrigerant if its critical temperature is only 31 degrees?", content: [
      { type: "paragraph", text: `Because R-744 works transcritically: above its critical temperature of 31.1 degrees Celsius, the refrigerant never condenses into a liquid at any pressure, and the system rejects heat in a supercritical gas cooler instead of a condenser. That makes the cycle different to design but very effective in cold climates and for heat pumps, where the large temperature glide is an advantage. CO₂ also brings a GWP of 1 and no phase-down pressure, which is why supermarket and heat-pump systems are adopting it despite the higher operating pressures.` },
    ]},
    { heading: "", subHeading: "Which refrigerants are being phased out and on what timeline?", content: [
      { type: "paragraph", text: `R-22 is being phased out under the Montreal Protocol — production for new equipment has ended and servicing supply is shrinking. The HFCs are being phased down, not out, under the Kigali Amendment and regional rules like the EU F-Gas regulation: high-GWP fluids such as R-404A and R-507A face the steepest cuts, while lower-GWP HFCs like R-32 and the HFOs and naturals gain share. The exact dates vary by jurisdiction and by sector, and the table's note points to the current regulation edition because the timeline moves faster than reference material reliably tracks.` },
    ]},
  ],
};

const air_change_rate_calculatorSeo: ToolSeo = {
  sections: [
    { heading: "What is Air Change Rate Calculator", content: [
      { type: "paragraph", text: `Air Change Rate Calculator computes the air changes per hour of a ventilated room from its airflow and volume, in either unit system — imperial, where ACH equals the CFM times 60 divided by the room volume in cubic feet, or metric, where ACH equals the cubic-metres-per-hour flow divided by the volume in cubic metres. It also runs the calculation in reverse, reporting the airflow needed to hit a target ACH for the same room.` },
      { type: "paragraph", text: `The room volume comes from three dimensions — length, width and height — so a 10-by-12-by-8-foot room has a volume of 960 cubic feet, and 100 CFM of supply through it produces 6.25 air changes per hour: one hundred times sixty divided by nine hundred and sixty. The result panel reports the volume, the ACH to two decimal places, the minutes per air change — the reciprocal of ACH — and the flow required for the target rate you enter.` },
    ]},
    { heading: "How to Use Air Change Rate Calculator", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Pick the Unit system — Imperial (CFM and feet) or Metric (cubic metres per hour and metres). All fields relabel to match.`,
        `<strong>Step 2:</strong> Enter the Ventilation rate — the supply airflow in CFM or m³/h — followed by the room Length, Width and Height in the selected unit.`,
        `<strong>Step 3:</strong> Read the Result panel. Room volume is the product of the three dimensions; Air changes per hour is the headline number; Time per air change is how often the room volume turns over completely.`,
        `<strong>Step 4:</strong> Enter the Target ACH in its field to see the reverse direction: Flow for the target shows the supply rate the room needs to reach that turnover, which is the number a ventilation designer actually sizes ductwork from.`,
        `<strong>Step 5:</strong> Verify with the classic case: a 10 × 12 × 8 ft room (960 ft³) with 100 CFM must read 6.25 ACH and about 9.6 minutes per change. The tool's default values are exactly this case, so they should match before you change anything.`,
      ]},
    ]},
    { heading: "Why Use Air Change Rate Calculator", content: [
      { type: "paragraph", text: `Air changes per hour is the shorthand every ventilation code and guideline speaks — bathrooms at 8 ACH intermittent, kitchens at 7.5, laboratories at 6 to 15 depending on hazard, cleanrooms from 20 to 600 — but the number is rarely given directly; it is derived from an airflow and a room volume. Doing that division and unit juggling by hand on every room of a project is where errors creep in, and an ACH error at the low end is a ventilation deficiency that only shows up in indoor air quality.` },
      { type: "paragraph", text: `The reverse calculation is the more useful direction in practice. Codes set ACH targets; the designer must find the CFM that achieves them. Because the tool computes the required flow from the target in the same pass as the achieved ACH, a designer can check an existing system against its code target and size a new one from the same inputs — two questions, one room model.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How is ACH calculated in imperial units?", content: [
      { type: "paragraph", text: `Air changes per hour equals the airflow in CFM multiplied by 60 — to convert the per-minute flow into per-hour — and divided by the room volume in cubic feet. The 60 is the only unit conversion: CFM is per minute, ACH is per hour. For a 960 cubic foot room with 100 CFM, that is 100 times 60 divided by 960, which gives 6.25 air changes per hour. In metric the 60 disappears because the flow is already entered per hour.` },
    ]},
    { heading: "", subHeading: "What is the difference between minutes per change and ACH?", content: [
      { type: "paragraph", text: `They are reciprocals: minutes per air change is 60 divided by the ACH, so a room at 6 ACH turns its volume over every 10 minutes, and one at 12 ACH every 5 minutes. ACH answers how many times the room volume is replaced in an hour; minutes per change answers how long the air in the room has been there on average. Both are shown because codes quote ACH while practical questions — how long after a contaminant release — are easier to answer in minutes.` },
    ]},
    { heading: "", subHeading: "Does the tool handle rooms with sloped ceilings or irregular shapes?", content: [
      { type: "paragraph", text: `No — it models the room as a rectangular prism from three dimensions, which is the standard approximation for code-level ventilation work and accurate for most rooms. A sloped ceiling or an irregular footprint changes the true volume, and the ACH moves inversely with it. For those cases, compute the actual volume first and adjust the height input so that length times width times the entered height equals the true volume, which keeps the ACH result correct.` },
    ]},
    { heading: "", subHeading: "What ACH should a room actually target?", content: [
      { type: "paragraph", text: `It depends on the space and the code. Residences typically run 0.35 to 1 ACH from natural and mechanical ventilation combined; bathrooms are ventilated at about 8 ACH when occupied, kitchens at about 7.5; laboratories run 6 to 15 ACH depending on the hazard class and whether fume hoods are present; cleanrooms span 20 to 600 ACH by cleanliness class. The tool's guidance note carries these bands, and the governing ventilation code — ASHRAE 62.1 for commercial, the residential code for homes — supplies the binding number.` },
    ]},
  ],
};

export const cadSeoBatch3: Record<string, ToolSeo> = {
  "gdandt-symbol-reference-standards": gdandt_symbol_reference_standardsSeo,
  "cylindricity-reference": cylindricity_referenceSeo,
  "parallelism-and-perpendicularity-guide": parallelism_and_perpendicularity_guideSeo,
  "surface-roughness-ra-reference": surface_roughness_ra_referenceSeo,
  "drawing-standards-comparator-ansi-vs-iso": drawing_standards_comparator_ansi_vs_isoSeo,
  "fluid-flow-rate-calculator": fluid_flow_rate_calculatorSeo,
  "pipe-material-reference": pipe_material_referenceSeo,
  "valve-type-reference": valve_type_referenceSeo,
  "hvac-equipment-selector-guide": hvac_equipment_selector_guideSeo,
  "refrigerant-properties-reference": refrigerant_properties_referenceSeo,
  "air-change-rate-calculator": air_change_rate_calculatorSeo,
};
