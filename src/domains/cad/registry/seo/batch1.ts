/**
 * CAD SEO content — batch 1.
 * GENERATED — do not edit by hand. Regenerate from the JSON source:
 *   npx tsx scripts/json-to-seo.ts scratch/cad-seo-batch1.json
 *   node _scripts/cad-seo-assemble.mjs scratch/cad-seo-batch1.json src/domains/cad/registry/seo/batch1.ts
 */
import type { ToolSeo } from "../tool-seo";

const scale_factor_calculatorSeo: ToolSeo = {
  sections: [
    { heading: "What is Scale Factor Calculator", content: [
      { type: "paragraph", text: `The Scale Factor Calculator converts between a length as drawn and the same length in the real world, producing the three numbers every scaled drawing needs: the scale factor, the architect scale ratio, and the percentage of full size. You enter any two lengths in the same unit and the tool does the rest, so there is no mental arithmetic about whether to multiply or divide. A wall drawn 50 mm long that represents 2.5 m of real wall gives a scale factor of 0.02 and an architect scale of 1:50 — the ratio you actually write in the title block.` },
      { type: "paragraph", text: `The relationship the tool uses is simple but worth stating precisely: the scale factor is drawn length divided by real-world length, the 1:X scale is real-world length divided by drawn length, and the percentage is the factor expressed as a percent. A factor below 1 is a reduction scale, which covers almost everything from site plans down to component details. A factor above 1 is an enlargement — the tool handles both directions, including the awkward case of enlarging a small part that is already drawn at 2:1 up to 5:1 for a detail view.` },
    ]},
    { heading: "How to Use Scale Factor Calculator", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Pick the unit from the Unit selector — millimetres, centimetres, metres, inches or feet. Both lengths are interpreted in that unit, and the unit never affects the math, only what the numbers mean.`,
        `<strong>Step 2:</strong> Enter the Length on drawing field. This is the dimension you measured off the paper, PDF or model — for example 50 for a wall that spans 50 mm on the sheet.`,
        `<strong>Step 3:</strong> Enter the Real-world length field. This is the true size of the object — for example 2500 if the wall is really 2.5 m and you are working in millimetres.`,
        `<strong>Step 4:</strong> Read the results panel. Scale factor shows drawn divided by real, 1:X shows the architect scale rounded to three places, and Percent of full size shows the factor as a percentage.`,
        `<strong>Step 5:</strong> Check your work against a known case: 50 drawn over 2500 real must produce exactly 1:50. If it does not, one of the two lengths is in the wrong unit — the most common mistake is mixing millimetres with metres.`,
      ]},
    ]},
    { heading: "Why Use Scale Factor Calculator", content: [
      { type: "paragraph", text: `Scale errors are one of the most expensive mistakes in drawing production because they propagate through every dimension and every downstream fabrication step. A detail drawn at the wrong factor produces parts that do not fit, or a sheet that has to be redone entirely. This tool removes the arithmetic from the two directions that cause the most confusion — deciding whether to divide or multiply, and expressing the result as 1:X rather than as a bare decimal.` },
      { type: "paragraph", text: `It is also a fast sanity check when you inherit drawings from another office or export from a tool with an unexpected scale. Measure one known feature, type the real dimension, and you instantly know what factor the file is actually at. Because everything runs in the browser, there is no upload step and no delay — useful when you are mid-task and need the answer now.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What is the difference between scale factor and the 1:X ratio?", content: [
      { type: "paragraph", text: `They are reciprocals of each other. The scale factor is drawn length divided by real length, so a 1:50 drawing has a factor of 0.02. The 1:X notation used in title blocks is the real length divided by the drawn length — the X in 1:50. The tool shows both because drawings are described either way depending on the discipline: architects and structural engineers usually say 1:50, while detailers comparing a part to full size often think in factors.` },
    ]},
    { heading: "", subHeading: "Can the calculator handle enlargement scales like 2:1 or 5:1?", content: [
      { type: "paragraph", text: `Yes. Enter a drawn length that is longer than the real length and the factor comes out above 1, with the 1:X result shown as a ratio below one (for example 1:0.5 for a 2:1 detail). Small-part details and thread callouts are commonly drawn enlarged so that the geometry is legible, and the same formula applies in both directions.` },
    ]},
    { heading: "", subHeading: "Why does the scale factor stay the same whatever unit I pick?", content: [
      { type: "paragraph", text: `Because the tool divides one length by another, and as long as both lengths share a unit the unit cancels out. Switching from millimetres to inches only changes what you type into the fields. The unit selector is there for convenience and clarity, not because it changes the result — the same reason you can mix feet and inches by converting to a single unit first.` },
    ]},
    { heading: "", subHeading: "How accurate is the 1:X result?", content: [
      { type: "paragraph", text: `The ratio is computed from your exact inputs and rounded to three decimal places for display, which is far more precision than a scale can be read on paper. The percentage and factor are trimmed rather than arbitrarily padded, so 1:50 shows as 0.02 factor and 2% — no trailing-noise decimals. If you need a non-standard scale for a specific ruler, the three-place ratio is enough to reproduce it on a plot.` },
    ]},
  ],
};

const revision_history_tableSeo: ToolSeo = {
  sections: [
    { heading: "What is Revision History Table", content: [
      { type: "paragraph", text: `The Revision History Table builds the revision block that belongs in every drawing title block — the small table that records who changed a drawing, when, and why. You add rows with a revision letter, date, description and author initials, and the tool renders them as a clean table with the exact columns a checker or manufacturer expects to read: Rev, Date, Description, By. Because revisions are typically lettered A, B, C and so on, the tool suggests the next letter automatically after every row you add.` },
      { type: "paragraph", text: `A revision history is more than housekeeping. When a drawing is issued for construction, the revision block is the only place that proves a given change has been incorporated, which is why contracts and quality systems treat it as part of the deliverable. This tool keeps the discipline painless: the lettering rule is handled for you, the table format is consistent, and you can remove a mis-entered row before you paste the block into your title block or drawing management system.` },
    ]},
    { heading: "How to Use Revision History Table", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Leave or edit the Revision field. It starts at A and advances alphabetically — B, C, D and so on — after each row you add. Revisions past Z are shown as Z+ rather than continuing into double letters.`,
        `<strong>Step 2:</strong> Set the Date. It defaults to today, and you can change it with the date picker to match the issue date of that revision rather than the day you are typing.`,
        `<strong>Step 3:</strong> Describe the change in the Description field — for example Preliminary issue, or Window schedule updated. A description is required before the Add revision button enables.`,
        `<strong>Step 4:</strong> Enter the author or checker initials in the By field. Initials are optional but recommended, because the table is only auditable if each row can be traced to a person.`,
        `<strong>Step 5:</strong> Click Add revision. The row appears in the title-block table, and the revision field advances to the next letter with the description and initials cleared, ready for the next change.`,
        `<strong>Step 6:</strong> Remove a mistaken row with its Remove button, then copy or screenshot the table into your title block. The table is fully client-side — nothing is uploaded while you assemble it.`,
      ]},
    ]},
    { heading: "Why Use Revision History Table", content: [
      { type: "paragraph", text: `Manually maintained revision blocks drift. Letters get skipped or repeated, dates fall out of order, and two people editing the same drawing invent conflicting histories. A tool that letter-sequences rows and shows them in a fixed column layout prevents the most common errors before they reach the title block.` },
      { type: "paragraph", text: `It is equally useful when you are converting an old paper drawing into CAD and need to transcribe years of revisions cleanly, or when you are standardising several projects onto one title-block format. Because the output is a plain table, it pastes into AutoCAD, Revit or Word-based title blocks without reformatting.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why do revisions start at A rather than 1?", content: [
      { type: "paragraph", text: `Letter-based revisioning is the convention in most drawing standards and CAD systems: the first issue is usually a preliminary or for-review issue marked A, and every subsequent change advances the letter. Numeric revisioning is used in some manufacturing and document-control systems, but the title-block convention this tool follows is alphabetic. If your project uses numbers instead, type the revision code you want into the Revision field — the field is editable.` },
    ]},
    { heading: "", subHeading: "What happens after revision Z?", content: [
      { type: "paragraph", text: `The tool displays Z+ once the alphabet is exhausted. In practice a drawing that reaches Z has been through 25 revisions, which is a signal that the drawing itself should be re-issued or split rather than revised again. When that happens, document controllers typically create a new drawing number and start its history at A.` },
    ]},
    { heading: "", subHeading: "Is the description really required?", content: [
      { type: "paragraph", text: `Yes — the Add revision button stays disabled until you type something in the Description field. An empty revision row is useless to anyone reading the history later, because it records that a change happened without recording what changed. This is one of the few places the tool is deliberately strict.` },
    ]},
    { heading: "", subHeading: "Can I use this table for issued-for-construction records?", content: [
      { type: "paragraph", text: `Yes, with the caveat that the table documents the changes — it does not replace your document-management system's approval trail. Paste the completed block into the title block of the drawing, and keep the signed approvals in your transmittal records. The date and initials columns give readers the who-and-when, which is what a revision block is for.` },
    ]},
  ],
};

const cad_layer_naming_convention_builderSeo: ToolSeo = {
  sections: [
    { heading: "What is CAD Layer Naming Convention Builder", content: [
      { type: "paragraph", text: `The CAD Layer Naming Convention Builder composes a standard layer name from its four conventional parts: a discipline code, a major group, an optional minor group and an optional status suffix. The result follows the NCS/AIA style that most CAD systems understand — for example A-WALL for an architectural wall layer, or S-COLS-NEW for a new-work structural column layer. You pick the parts from selectors and text fields, and the tool joins them with dashes into a single upper-case name you can type into your layer manager.` },
      { type: "paragraph", text: `Consistent layer names are the foundation of drawing discipline. When every office in a project names walls A-WALL and columns S-COLS, consultants can reference each other's files without a translation table, filters behave predictably, and plot styles can assign line weights by layer rather than by colour. The builder enforces the shape of the name — discipline first, elements second, status last — while leaving the actual words in your control, because only your office can decide whether the second wall layer is A-WALL-PART or A-WALL-INT.` },
    ]},
    { heading: "How to Use CAD Layer Naming Convention Builder", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Choose the Discipline from the list — A Architectural, S Structural, M Mechanical, E Electrical, P Plumbing, C Civil, L Landscape or G General. The discipline code is the first character of every layer name.`,
        `<strong>Step 2:</strong> Enter the Major group in the field labelled Major group. This is the element itself, such as WALL, COLS or DOOR. The tool upper-cases it, converts spaces to dashes and strips any character outside A-Z, 0-9, dash and underscore.`,
        `<strong>Step 3:</strong> Add a Minor group only if your convention needs one — for example EXIST to split existing walls from new walls, or a second descriptor for a sub-element. Leave it blank to keep the name to the discipline and major group.`,
        `<strong>Step 4:</strong> Choose a Status suffix when the layer describes work state: EXST for existing, DEMO for demolition, NEW for new work, PRCH for purchased items, or PH1 for phase one. Choose the empty option when no suffix applies.`,
        `<strong>Step 5:</strong> Read the assembled Layer name in the results panel. A major group is required — until you type one, the tool shows a dash instead of a name, preventing you from exporting a malformed layer.`,
      ]},
    ]},
    { heading: "Why Use CAD Layer Naming Convention Builder", content: [
      { type: "paragraph", text: `The painful part of layer naming is not knowing the words — it is keeping every layer in a 200-layer model consistent. Layer names typed freehand drift into A-WALL, A-WALLS, WALL-A and awall within a single file, and then every filter and plot style quietly stops working for the odd ones out. A builder that constructs the name from parts enforces the grammar of the convention at the moment of creation.` },
      { type: "paragraph", text: `It is also a quick translator when you inherit files from a firm with a different convention. Rebuild the foreign layers with your office's codes, and reference files, xrefs and export maps line up without a lookup table. The NCS-style shape it produces is recognised by AutoCAD, Revit, MicroStation and most export tools, so names built here carry across the CAD ecosystem.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What do the discipline letters stand for?", content: [
      { type: "paragraph", text: `They follow the widely used NCS/AIA codes: A for architectural, S for structural, M for mechanical, E for electrical, P for plumbing, C for civil, L for landscape and G for general. Some firms add disciplines such as I for interiors or F for fire protection; if yours does, type the letter into the workflow that fits your standard — the builder's structure still applies.` },
    ]},
    { heading: "", subHeading: "When do I actually need a minor group or a status suffix?", content: [
      { type: "paragraph", text: `Only when the major group alone cannot tell two layers apart. Renovation projects are the classic case: you need existing walls, demolished walls and new walls on the same drawing, so you add EXIST, DEMO and NEW suffixes to A-WALL. If a building has only one wall layer, adding suffixes is unnecessary complexity — the shortest unambiguous name is the best name.` },
    ]},
    { heading: "", subHeading: "Why does the tool clean up the characters I type?", content: [
      { type: "paragraph", text: `Layer names are compared exactly, so a space or a lowercase letter is enough to make two otherwise identical names behave as different layers. The builder upper-cases everything, converts internal spaces to dashes and removes punctuation that layer managers treat inconsistently. That cleaning is deliberate: it stops the small typos that later break filters, overrides and sheet exports.` },
    ]},
    { heading: "", subHeading: "Does this match the layer names AutoCAD uses?", content: [
      { type: "paragraph", text: `Yes for the shape — discipline code, major and minor groups separated by dashes is the structure AutoCAD's own tools and most template files expect. The specific words (WALL versus A-WALL-PART versus A-WALL-FULL) are a per-office decision; what matters is that every layer in your file follows one structure, which is the property this builder enforces. The most common mistake, colour-based layer naming, is structurally prevented here.` },
    ]},
  ],
};

const hatch_pattern_referenceSeo: ToolSeo = {
  sections: [
    { heading: "What is Hatch Pattern Reference", content: [
      { type: "paragraph", text: `The Hatch Pattern Reference is a searchable library of the hatch patterns used to represent materials in section views and material callouts. Twelve patterns are covered: the ANSI series that dominates North American drawings — ANSI31 for general section lines, ANSI32 for steel, ANSI33 for brass and bronze, ANSI34 for rubber and plastic, ANSI35 for firebrick, ANSI37 for cork and felt, ANSI38 for marble and glass — plus the common generic patterns BRICK, CONCRETE, EARTH, SAND and WOOD used across ISO-style and international practice.` },
      { type: "paragraph", text: `Each row shows the pattern code, the standard it belongs to, the material it typically represents, and a live drawn sample of the actual line geometry. The samples are generated from the same line families that define the pattern — angle and spacing per family — so what you see is the real hatching, not a stylised icon. Because the pattern codes match the names used in AutoCAD and most CAD packages, a drawing hatched with these names exports and maps cleanly onto standard libraries.` },
    ]},
    { heading: "How to Use Hatch Pattern Reference", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Scan the table of twelve patterns, or type into the search box to filter — searching steel finds ANSI32, while plastic finds ANSI34.`,
        `<strong>Step 2:</strong> Read the Pattern column for the code to type into your CAD hatch command, and the Standard column to know whether the pattern is ANSI Y14.2 or the generic ISO-style set.`,
        `<strong>Step 3:</strong> Match the Typical use column to the material in your section: ANSI31 for general cast or wrought sections, ANSI32 for steel members, BRICK or CONCRETE for masonry and concrete in buildings.`,
        `<strong>Step 4:</strong> Look at the live Sample column to confirm the appearance before you apply it — a 45-degree single family for ANSI31, a crossed pair for steel, or the distinctive large-scale CONCRETE mix of diagonals plus horizontal lines.`,
        `<strong>Step 5:</strong> Apply the code in your drawing software. Keep the pattern name in the layer or entity so anyone opening the file can re-derive the material without asking.`,
      ]},
    ]},
    { heading: "Why Use Hatch Pattern Reference", content: [
      { type: "paragraph", text: `Picking a hatch pattern is easy; picking the one everyone else will understand is not. A section drawn with the wrong code still looks like a section — until a fabricator or a reviewer asks what material it is. The reference exists so the material-to-pattern mapping is decided once, consistently, instead of being improvised per drawing.` },
      { type: "paragraph", text: `It also settles the ANSI-versus-generic question that trips up mixed teams. North American drawings commonly use the ANSI31 family for ferrous metals and reserve ANSI32 for steel, while international practice leans on named patterns like CONCRETE and WOOD. Seeing both sets side by side, with samples, makes the convention visible instead of requiring everyone to remember a code table.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What is the difference between ANSI31 and ANSI32?", content: [
      { type: "paragraph", text: `Both are 45-degree families, but ANSI32 is a crossed pattern: two families at 45 degrees and minus 45 degrees, one at twice the spacing of the other. That denser, crossed appearance is what convention assigns to steel, while the single-family ANSI31 is the general-purpose section line for iron and unspecified materials. When in doubt, many offices default to ANSI31 and note the material in a callout.` },
    ]},
    { heading: "", subHeading: "Are these the same codes I type into AutoCAD's hatch command?", content: [
      { type: "paragraph", text: `Yes. ANSI31 through ANSI38 are shipped as built-in patterns by AutoCAD and most CAD packages under exactly those names, and BRICK, CONCRETE, EARTH, SAND and WOOD are standard library patterns as well. Choosing a code from this table means the pattern will resolve on any machine that opens the file, without custom pattern files.` },
    ]},
    { heading: "", subHeading: "Why do some patterns belong to ANSI Y14.2 and others not?", content: [
      { type: "paragraph", text: `ANSI Y14.2 defines the North American conventions for line conventions and lettering, and the ANSI31-family material hatch codes are part of that ecosystem. BRICK, CONCRETE, EARTH, SAND and WOOD are not Y14.2 codes — they are widely used patterns from the generic libraries that ISO-style and building practice adopted. Both families appear here because real projects use both, and the Standard column tells you which tradition a code belongs to.` },
    ]},
    { heading: "", subHeading: "Does the pattern spacing matter when I scale it into a drawing?", content: [
      { type: "paragraph", text: `Yes. The line spacings shown are typical drafting scales — too fine to read when a 1:200 site section is plotted small, and coarse when a detail is enlarged. CAD hatch commands apply a scale factor on top of the pattern definition, so you adjust the hatch scale to the drawing scale and paper size. The pattern identity stays the same; only its plotted density changes.` },
    ]},
  ],
};

const line_type_referenceSeo: ToolSeo = {
  sections: [
    { heading: "What is Line Type Reference", content: [
      { type: "paragraph", text: `Line Type Reference is a searchable table of the seven standard line types used on technical drawings, with each one's alias, its typical use, and a scaled sample of its dash pattern. The conventions follow ISO 128 and ASME Y14.2, the two standards families most drawing offices work to, so the same vocabulary applies whether the drawing was produced in Europe or North America.` },
      { type: "paragraph", text: `The table covers continuous lines for visible outlines, dashed lines for hidden edges, center lines for symmetry axes and pitch circles, phantom lines for adjacent or alternative parts, cutting-plane lines for section views, thin continuous lines for dimensions and leaders, and break lines for shortening long parts. Each row also shows the actual dash geometry — a center line is a long dash followed by a short dash, while a phantom line uses a long dash followed by two short dashes — which is exactly the pattern you would type into a linetype definition file.` },
    ]},
    { heading: "How to Use Line Type Reference", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Open the tool page and read across any row you need. The Line type column names the linetype as it appears in the CAD layer or property palette; the Also called column lists the synonym used by the other standard — Dashed is Hidden in the US, Center is Centre under ISO spelling.`,
        `<strong>Step 2:</strong> Match the Typical use column to the geometry you are about to draw. Visible edges get the continuous line; edges you cannot see from the current view direction get the dashed hidden line; symmetry axes, pitch circle diameters and bolt circles get center lines.`,
        `<strong>Step 3:</strong> Type into the search box to filter the table when you are checking one specific case, such as which linetype a cutting-plane line should be. The filter matches as you type, and clearing it restores the full list.`,
        `<strong>Step 4:</strong> Look at the Sample column to confirm the dash rhythm. The samples are drawn to scale from the same segment lengths listed in the Dash pattern column, so a center line visibly alternates long and short dashes rather than reading as a generic dotted line.`,
        `<strong>Step 5:</strong> Apply the note at the bottom of the table to your own drawing setup: assign line weights by line type — visible outlines thickest; hidden, center, dimension and leader lines thin — rather than by color, which is the layer-convention approach modern CAD standards recommend.`,
      ]},
    ]},
    { heading: "Why Use Line Type Reference", content: [
      { type: "paragraph", text: `Line types carry meaning on a drawing — a dashed edge tells the reader the feature is hidden behind the part, and a phantom outline tells them it is an alternative position or a mating part drawn for reference. Misusing them produces drawings that fabricators and inspectors must second-guess, which is where expensive errors start. Keeping a one-page reference next to the CAD session is the cheapest way to stay consistent across a whole sheet set.` },
      { type: "paragraph", text: `The tool is equally useful when you inherit a drawing from another office or another country. If the layer list uses names like Hidden while your own standard says Dashed, the alias column resolves the mismatch in seconds. Because every pattern is listed with its segment lengths, you can also reproduce the linetype in software that stores dash definitions as numbers instead of named styles.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What is the difference between ANSI31 and ANSI32?", content: [
      { type: "paragraph", text: `This tool covers line types rather than hatch patterns, but the naming question points at the same standards split: ANSI31 and ANSI32 are hatch pattern codes, not line types. If you came here looking for them, the companion Hatch Pattern Reference lists those codes with their angles and spacing. For line types, the equivalent split is between the US names in ASME Y14.2 — where the hidden line is called Dashed — and the ISO 128 names that use Centre and Break with the relevant suffix.` },
    ]},
    { heading: "", subHeading: "When should I use a phantom line instead of a dashed line?", content: [
      { type: "paragraph", text: `Dashed lines show hidden edges of the part itself — geometry that exists but is out of view. Phantom lines show things that are not part of the part at all: the adjacent part it assembles against, an alternative position of a moving component such as a valve handle, or the repeated position of a feature such as bolt holes on a pitch circle. If the outline does not belong to the object being dimensioned, it is phantom, not dashed.` },
    ]},
    { heading: "", subHeading: "Why is the center line pattern long dash, short dash?", content: [
      { type: "paragraph", text: `A center line needs to be read as an axis, not as an edge, so its pattern is deliberately distinct from a hidden line's even dashes: a long dash, a short dash, then a repeat. At the center of a circle the two short dashes cross. In practice the pattern should start and end with the long dash and should extend a consistent small distance past the feature it locates, typically around 2 to 5 mm beyond the outline depending on the office standard.` },
    ]},
    { heading: "", subHeading: "Can I use these patterns to build custom linetypes in my CAD software?", content: [
      { type: "paragraph", text: `Yes. The Dash pattern column gives the segment lengths in millimetres in drawing order, which maps directly to the dash, gap sequence in a linetype definition file — a center line as 10 on, 3 off, 2 on, 3 off is the classic AutoCAD definition expressed the same way. Copy the segment list into your software's linetype editor and the on-screen result will match the Sample column, since both are driven by the same numbers.` },
    ]},
  ],
};

const drawing_number_generatorSeo: ToolSeo = {
  sections: [
    { heading: "What is Drawing Number Generator", content: [
      { type: "paragraph", text: `Drawing Number Generator composes a document number from four parts — project prefix, discipline, document type and sequence — in the form PREFIX-DISC-TYPE-SEQ, so ACME-M-DRG-007 means the seventh mechanical drawing issued by the ACME project. It is the same convention many studios encode in their title blocks, but expressed as a form you can fill in without remembering the rule or counting digits by hand.` },
      { type: "paragraph", text: `The tool normalizes what you type: the project prefix is trimmed, forced to upper case, stripped of anything that is not a letter, digit or dash, and cleaned of stray or doubled dashes, so accidental punctuation never sneaks into a number that has to match a filing system. The discipline and document type come from fixed pick-lists covering the six common disciplines — architectural, structural, mechanical, electrical, plumbing and civil — and six document types from drawings and sketches through schematics, details, layouts and general arrangements.` },
    ]},
    { heading: "How to Use Drawing Number Generator", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Enter the project prefix in the Project prefix field — usually the client or project code, such as ACME. Anything you type is cleaned automatically, so lowercase letters are uppercased and spaces or stray characters are removed.`,
        `<strong>Step 2:</strong> Pick the Discipline from its selector. The options are A for Architectural, S for Structural, M for Mechanical, E for Electrical, P for Plumbing and C for Civil — choose the discipline that owns the document, not the discipline the drawing happens to show.`,
        `<strong>Step 3:</strong> Pick the Document type from its selector: DRG for drawing, SK for sketch, SCH for schematic, DET for detail, LAY for layout or GRA for general arrangement. A general arrangement sheet and a detail sheet from the same discipline intentionally get different type codes.`,
        `<strong>Step 4:</strong> Enter the Sequence number, which is the count within that prefix-discipline-type series. If Pad to 3 digits is checked — it is by default — the sequence is printed as 007 rather than 7, which keeps every number the same width when it sorts as text.`,
        `<strong>Step 5:</strong> Read the Generated number panel. The main number is the assembled document identifier, the Pattern row restates the rule, and the Example (next sheet) row shows what the following document in the series would be — useful when you are issuing several sheets at once.`,
      ]},
    ]},
    { heading: "Why Use Drawing Number Generator", content: [
      { type: "paragraph", text: `Drawing numbers are the key that links a sheet to its model, its revision history and its entry in the document register, and the key only works if every document is numbered by the same rule. When numbers are hand-typed, the same drawing can end up logged under two different numbers — one with a leading zero, one without — and the register quietly stops matching reality. Generating the number from structured parts removes the transcription errors at the source.` },
      { type: "paragraph", text: `A consistent prefix-discipline-type-sequence scheme also makes numbers self-describing: anyone in the project can look at M-DRG-012 and know it is a mechanical drawing without opening the file. That readability pays off in transmittals, submittal logs and RFIs, where documents are referenced by number alone. Because the tool runs in the browser and needs no account, it works for a one-person studio with a spreadsheet register just as well as for a team pushing numbers into a document management system.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What if my office uses a sheet-stage suffix after the sequence?", content: [
      { type: "paragraph", text: `Many studios extend the base pattern with a suffix for the sheet stage — commonly a digit from 0 to 9 where 0 marks preliminary and higher digits mark issued-for-construction stages — or with a revision tag such as -A. This tool produces the core PREFIX-DISC-TYPE-SEQ portion of the number. Add your stage or revision suffix after the sequence to match your office rule, and keep the full rule written in the title block so the number can be regenerated from the drawing properties later.` },
    ]},
    { heading: "", subHeading: "Why does the tool strip characters from my project prefix?", content: [
      { type: "paragraph", text: `Drawing numbers end up in file names, document registers and references inside other drawings, all of which are fragile when a number contains spaces, lowercase letters or characters like slashes that some systems treat specially. The tool therefore keeps only letters, digits and dashes, uppercases everything, and collapses doubled dashes — so ACME / NW-02 and acme nw 02 both normalize to ACME-NW-02 and can never produce two different numbers for the same project.` },
    ]},
    { heading: "", subHeading: "Should the sequence restart at 1 for every discipline?", content: [
      { type: "paragraph", text: `Under the prefix-discipline-type scheme, each discipline runs its own sequence, so M-DRG-001 and E-DRG-001 can both exist and are different documents — the discipline code disambiguates them. The sequence should be continuous within a discipline-type series and should not be reused after a document is superseded or cancelled, because reusing a number creates a gap in audit history and can mislead anyone tracing old transmittals.` },
    ]},
    { heading: "", subHeading: "What does the pad-to-3-digits option actually change?", content: [
      { type: "paragraph", text: `With padding on, sequence 7 renders as 007 so that every number in the series has the same width and sorts correctly in plain text. With padding off, the number renders exactly as typed — useful when your register stores sequence as a number and would otherwise show leading zeros, or when you are adopting numbers from a legacy series that never padded. The underlying sequence value is unaffected either way; only the display width changes.` },
    ]},
  ],
};

const tolerance_notation_formatterSeo: ToolSeo = {
  sections: [
    { heading: "What is Tolerance Notation Formatter", content: [
      { type: "paragraph", text: `Tolerance Notation Formatter takes a nominal size and its plus and minus tolerances and renders the dimension callout the way a drawing should show it: decimals aligned to a common precision, an explicit sign on each tolerance, and equal tolerances collapsed into a clean symmetrical ±. You type 25.4 with a plus of 0.05 and a minus of 0.05 and the tool writes 25.40 ± 0.05 — not a hand-built string where the decimal places drift between the nominal and the tolerance.` },
      { type: "paragraph", text: `Beyond the callout itself, the tool computes the two limit sizes — the maximum size with the plus tolerance applied and the minimum size with the minus tolerance applied — and the total tolerance band, which is the sum of the plus and minus values. Units are selectable between millimetres, centimetres and inches; the notation logic is identical for each, because the rules for aligning decimals and signing tolerances are the same regardless of the unit system.` },
    ]},
    { heading: "How to Use Tolerance Notation Formatter", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Pick the Unit from the selector — millimetres, centimetres or inches. The unit is appended to the limit sizes so the result reads as a complete dimension, but it does not change the arithmetic.`,
        `<strong>Step 2:</strong> Enter the Nominal size — the basic dimension the tolerance applies to, such as 25.4 for a one-inch feature in millimetres.`,
        `<strong>Step 3:</strong> Enter the Plus tolerance and the Minus tolerance as positive numbers. A hole with a unilateral tolerance above the nominal gets a plus value and a zero minus; a shaft with tolerance only below the nominal is the reverse.`,
        `<strong>Step 4:</strong> Read the Dimension callout panel. Equal plus and minus values are detected automatically and rendered as a single ± symbol — 25.40 ± 0.05 — while unequal values render as stacked-style +0.10 / -0.00 notation with both tolerances shown to the same number of decimal places.`,
        `<strong>Step 5:</strong> Check the computed rows below the callout: Maximum size adds the plus tolerance to the nominal, Minimum size subtracts the minus tolerance, and Total tolerance band sums the two — the width of the acceptable range the machinist actually works to.`,
      ]},
    ]},
    { heading: "Why Use Tolerance Notation Formatter", content: [
      { type: "paragraph", text: `Tolerance callouts are read by machinists, inspectors and assemblers, and the notation is governed by convention: decimals must be aligned so a reader can compare limit sizes at a glance, signs must be explicit so there is no ambiguity about which direction the tolerance runs, and the precision of the tolerance must match the precision the shop can measure. A callout that renders 25.4 +0.1 -0.05 with ragged decimals is harder to read and easier to misread than 25.40 +0.10 / -0.05, even though the numbers mean the same thing.` },
      { type: "paragraph", text: `The tool also catches a class of error that is easy to make by hand: entering the minus tolerance as a negative number, or mixing precisions so that a 0.05 tolerance is written next to a three-decimal nominal. Because it treats both tolerances as positive magnitudes and derives the limits for you, the callout and the limit sizes always agree — the number on the drawing and the number the inspector checks against are computed from the same inputs.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "When is a ± callout preferred over a + / - callout?", content: [
      { type: "paragraph", text: `A symmetrical ± callout is used when the acceptable variation is the same in both directions — a 25.40 ± 0.05 hole accepts 25.35 to 25.45. A + / - callout is used when the tolerance is unilateral or asymmetric, such as a press-fit where the acceptable range sits mostly or entirely on one side of the nominal. This tool detects equal tolerances and collapses them to ± automatically, so you do not have to decide which notation to type — the values decide it.` },
    ]},
    { heading: "", subHeading: "How is the maximum size calculated for a hole versus a shaft?", content: [
      { type: "paragraph", text: `The arithmetic is the same for both: maximum size is the nominal plus the plus tolerance, and minimum size is the nominal minus the minus tolerance. What differs between holes and shafts is which direction the tolerance usually runs. Internal features like holes conventionally take a positive tolerance — a reamed hole is allowed to come out larger than nominal — while external features like shafts conventionally take a negative tolerance, which is why the fit between a shaft and a hole can be controlled by choosing the two tolerances deliberately.` },
    ]},
    { heading: "", subHeading: "How many decimal places does the tool keep?", content: [
      { type: "paragraph", text: `The callout aligns to the finer of the two tolerance values: enter 0.05 and 0.1 and both render to two places; enter 0.05 and 0.005 and both render to three. The nominal is shown to at least the same precision as the tolerances so the decimals align down the drawing column. Limit sizes and the tolerance band are computed from your exact values and rounded only for display, at the same precision, so what you see matches what the shop measures.` },
    ]},
    { heading: "", subHeading: "What does a unilateral tolerance of +0.10 / -0.00 actually mean?", content: [
      { type: "paragraph", text: `It means the feature may be larger than nominal but never smaller: a 25.40 +0.10 / -0.00 feature is acceptable anywhere from 25.40 to 25.50. Unilateral tolerances are common where the functional requirement only constrains one side of the feature — a clearance hole, for example, can be any size larger than the fastener, so the tolerance runs only upward. Enter plus 0.10 and minus 0 for this case and the tool renders the explicit +0.10 / -0.00 form rather than collapsing it, since the values are unequal.` },
    ]},
  ],
};

const engineering_change_order_templateSeo: ToolSeo = {
  sections: [
    { heading: "What is Engineering Change Order Template", content: [
      { type: "paragraph", text: `Engineering Change Order Template assembles a structured change order document from form fields — ECO number, date, title, originator, reason, change description and affected documents — and previews it exactly as it would appear when issued. An engineering change order (ECO) is the formal record that a design is being altered after release, who asked for it, why, and which drawings or documents it touches. Having the fields forced into a fixed structure is what makes the record auditable rather than just an email thread.` },
      { type: "paragraph", text: `The reason field is not free text but a closed list of six categories: design change, error correction, manufacturing or fabrication issue, client or owner request, code or standard update, and field or site change. Choosing from the list keeps the change register consistent enough to report on — the project manager can see at a glance whether a spike in ECOs is coming from design changes or from field issues. The document closes with an approvals block for engineering, manufacturing and quality sign-off.` },
    ]},
    { heading: "How to Use Engineering Change Order Template", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Confirm the ECO number and Date. The number defaults to a year-prefixed series such as ECO-2026-001 — change it to match your register — and the date defaults to today, so the record is time-stamped the moment you start it.`,
        `<strong>Step 2:</strong> Enter a Title that names the change in one line, such as "Bracket thickness revision", and the Originator — the name or department raising the change, not necessarily the person who will implement it.`,
        `<strong>Step 3:</strong> Choose the Reason from the six-category list. If the change is driven by a revised code edition, pick Code / standard update; if a part cannot be made as dimensioned, pick Manufacturing / fabrication issue — the category will drive how the ECO is triaged.`,
        `<strong>Step 4:</strong> Describe the change in the Change description field: what changes, why, and what it affects. List the affected documents — drawings, models, specifications — in the Affected documents field, one reference per line or separated by commas.`,
        `<strong>Step 5:</strong> Press Generate ECO once the title or description is filled in. The Document preview panel assembles everything into the final layout with the ECO header, the details block, and the signature lines for Engineering, Manufacturing and Quality approval, ready to copy into your PLM system or issue as-is.`,
      ]},
    ]},
    { heading: "Why Use Engineering Change Order Template", content: [
      { type: "paragraph", text: `An uncontrolled change is how drawings and the parts made from them quietly diverge: someone updates a dimension in the model, the fabrication drawing is never touched, and the discrepancy surfaces in the shop. The ECO exists to force the loop closed — every change gets a number, a reason and a list of affected documents before it is implemented. Starting from a template means the discipline is in the document itself, so the first draft of a change record already has the structure a quality system requires.` },
      { type: "paragraph", text: `The tool is deliberately lightweight: it produces the document text in your browser with no upload and no account, so a small shop or a single engineer can run a proper change process without standing up a full PLM system. When the organization later moves to a PLM, the fields here map directly onto the standard ECO workflow — number, reason category, description, affected items, approvals — so records created this way transfer cleanly.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What is the difference between an ECO and an ECN or an ECR?", content: [
      { type: "paragraph", text: `The letters differ by company, but the usual distinction is between the request, the order and the notice. A change request (ECR) proposes the change and asks for evaluation; the change order (ECO) is the approved instruction to implement it; and the change notice (ECN) is the document that announces the change to everyone affected once it is released. This tool produces the ECO itself — the implementation record with the approved description and affected documents — and its fields carry over naturally into an ECN when the change is issued.` },
    ]},
    { heading: "", subHeading: "Why does the reason have to come from a fixed list?", content: [
      { type: "paragraph", text: `Free-text reasons cannot be counted, and change management lives on counts: how many changes this quarter came from client requests versus manufacturing issues tells you where your design process is leaking. The six categories here — design change, error correction, manufacturing issue, client request, code or standard update, and field change — are coarse enough to fill in without agonizing and fine enough to drive that reporting. If a change genuinely spans two categories, pick the dominant one and explain the rest in the description.` },
    ]},
    { heading: "", subHeading: "When should an ECO be raised versus fixing the drawing directly?", content: [
      { type: "paragraph", text: `Once a drawing has been issued — sent for fabrication, permit, pricing or construction — it must not be changed silently, because other people are making decisions from the version they hold. Any alteration to an issued document needs an ECO so the change is traceable and every holder of the old version knows to update. Before first issue, during internal review, you can fix the drawing directly; the ECO clock starts when the document leaves your control.` },
    ]},
    { heading: "", subHeading: "What should go in the affected documents field?", content: [
      { type: "paragraph", text: `Every document that must change as a result of this ECO — the drawing the change is on, but also the sibling sheets it references, the bill of materials, the model file, and any specification or standard that describes the affected feature. Use the drawing numbers from your register so the list matches how documents are actually filed. If a change touches an assembly drawing, the part drawings of every changed component belong on the list too, because each one needs its own revision.` },
    ]},
  ],
};

export const cadSeoBatch1: Record<string, ToolSeo> = {
  "scale-factor-calculator": scale_factor_calculatorSeo,
  "revision-history-table": revision_history_tableSeo,
  "cad-layer-naming-convention-builder": cad_layer_naming_convention_builderSeo,
  "hatch-pattern-reference": hatch_pattern_referenceSeo,
  "line-type-reference": line_type_referenceSeo,
  "drawing-number-generator": drawing_number_generatorSeo,
  "tolerance-notation-formatter": tolerance_notation_formatterSeo,
  "engineering-change-order-template": engineering_change_order_templateSeo,
};
