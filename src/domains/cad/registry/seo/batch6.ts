/**
 * CAD SEO content — batch 6.
 * GENERATED — do not edit by hand. Regenerate from the JSON source:
 *   npx tsx scripts/json-to-seo.ts scratch/cad-seo-batch6.json
 *   node _scripts/cad-seo-assemble.mjs scratch/cad-seo-batch6.json src/domains/cad/registry/seo/batch6.ts
 */
import type { ToolSeo } from "../tool-seo";

const cad_grid_plannerSeo: ToolSeo = {
  sections: [
    { heading: "What is CAD Grid Planner", content: [
      { type: "paragraph", text: `CAD Grid Planner plans the construction grid for a drawing space before you build it: you enter the space dimensions, the major grid spacing, and how finely the snap sub-divides each major cell, and the tool returns the exact line counts, the number of intersections, the minor snap step, and a preview of the grid drawn to the space. The idea is to decide the grid once, numerically, so the same layout can be reproduced exactly in any CAD package instead of eyeballed.` },
      { type: "paragraph", text: `The numbers it reports are the ones you need when building the grid: the major vertical and horizontal line counts, the major cells in X by Y, and the minor grid line totals that the snap subdivisions imply. The preview renders the major grid as solid lines and the minor subdivision detail as dashed lines inside the first cell, so you can see the relationship between the snap step and the major spacing before committing to it.` },
    ]},
    { heading: "How to Use CAD Grid Planner", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Enter the drawing space width and height in millimetres — the defaults are 297 by 210, an A4 sheet, but any space works, including an A0 sheet or a fixed-size viewport.`,
        `<strong>Step 2:</strong> Enter the major spacing — the distance between the heavy reference grid lines, typically 10 or 20 millimetres on a drawing sheet.`,
        `<strong>Step 3:</strong> Choose the snap sub-divisions per cell: 2, 4, 5 or 10. The tool shows the resulting minor step next to each choice, so you can pick the one that gives a clean snap value.`,
        `<strong>Step 4:</strong> Read the grid totals: the minor snap step, the major vertical and horizontal line counts, the total intersections, the cell grid, and the minor line totals.`,
        `<strong>Step 5:</strong> Build the grid in your CAD tool using those exact counts, and keep features on major-grid intersections where possible so reference lines land cleanly.`,
      ]},
      { type: "paragraph", text: `The core relationship is that the minor step is the snap resolution: major spacing divided by the sub-divisions. A 10 millimetre grid divided by 4 snaps to 2.5 millimetres — the drafting default that keeps ordinate dimensions tidy. The line counts follow from division too: a space of 297 millimetres at 10 millimetre spacing holds 29 full cells, so the grid needs 30 vertical lines to close it.` },
    ]},
    { heading: "Why Use CAD Grid Planner", content: [
      { type: "paragraph", text: `Grid discipline is what makes ordinate dimensions clean. When features sit on the major grid, reference lines and dimension chains line up on whole coordinates; when they sit on snap steps, the minor grid gives them consistent quarter or fifth positions. Planning the grid before drafting means the snap resolution is a decision, not an accident, and every coordinate placed against it stays consistent for the life of the drawing.` },
      { type: "paragraph", text: `The tool also catches the arithmetic mistakes that are easy to make on paper: forgetting that a grid with 29 cells needs 30 lines, or that a 2.5 millimetre minor step across 297 millimetres gives 119 minor lines rather than a rounder number. Knowing the exact totals up front means the grid builds correctly the first time, in whatever CAD tool the drawing lives in.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why does a 297 by 210 space at 10 millimetre spacing give 30 by 22 lines?", content: [
      { type: "paragraph", text: `Because the line count is the number of cells plus one: 297 millimetres holds 29 full 10 millimetre cells, so the grid needs 30 vertical lines to bound them, and 210 millimetres holds 21 cells, needing 22 horizontal lines. The intersections are the product — 30 times 22 gives 660 major grid points — and the cell count is 29 by 21, the interior rectangles between the lines.` },
    ]},
    { heading: "", subHeading: "What does the minor snap step mean and how is it set?", content: [
      { type: "paragraph", text: `The minor step is the snap resolution of the grid: major spacing divided by the number of sub-divisions. A 10 millimetre major grid with 4 sub-divisions snaps to 2.5 millimetres; with 5 sub-divisions it snaps to 2 millimetres. The sub-division choice is shown live next to each option so you can see the snap value before selecting it — pick the division that makes the snap step a clean number for the ordinates you expect to dimension.` },
    ]},
    { heading: "", subHeading: "Should features sit on major or minor grid intersections?", content: [
      { type: "paragraph", text: `Reference lines, title-block geometry and anything you expect to align across sheets should sit on major-grid intersections, because those are the coordinates every reader can predict. Minor intersections are for snap-level detail within a cell — the small moves that keep a feature at a consistent quarter or fifth position without cluttering the reference grid. The general rule the tool's note states: keep features on major coordinates where possible, and let the minor step handle the detail inside cells.` },
    ]},
    { heading: "", subHeading: "Why are the minor line totals so much larger than the major ones?", content: [
      { type: "paragraph", text: `Because the minor step is the major spacing divided by the sub-divisions, the minor grid has that many more intervals in each direction: at a 2.5 millimetre step across 297 millimetres the minor grid needs 119 vertical lines, and across 210 millimetres it needs 85 horizontal ones. Those totals are useful for planning how much geometry a snap grid will actually produce before you build it — and for deciding whether the minor lines should be drawn at all or simply used as an invisible snap layer.` },
    ]},
  ],
};

const chip_load_calculatorSeo: ToolSeo = {
  sections: [
    { heading: "What is Chip Load Calculator", content: [
      { type: "paragraph", text: `Chip Load Calculator works out the chip load per tooth for a milling cut — the thickness of the chip each cutting edge takes — from the feed rate, spindle speed and flute count, using the relation chip load equals feed divided by the product of speed and flutes. It also derives the material removal rate from the radial and axial engagement, and compares the chip load against typical ranges for common cutter diameters and materials.` },
      { type: "paragraph", text: `The typical-range table covers four cutter diameters — 3, 6, 10 and 12 millimetres — across aluminium, steel, stainless and plastic, with each combination giving a low and high band in millimetres per tooth. The tool then reports where the programmed cut sits: within the typical band, below it, or above it, which is the shop-floor distinction between a conservative feed and a tool-breakage risk.` },
    ]},
    { heading: "How to Use Chip Load Calculator", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Enter the feed rate in millimetres per minute as programmed in the CAM system.`,
        `<strong>Step 2:</strong> Enter the spindle speed in revolutions per minute and the flute count of the cutter.`,
        `<strong>Step 3:</strong> Select the tool diameter and material — these pick the typical chip-load band the result is compared against.`,
        `<strong>Step 4:</strong> Enter the radial engagement and axial depth in millimetres to get the material removal rate.`,
        `<strong>Step 5:</strong> Read the result: the chip load per tooth, the typical band for the tool and material, the status — within, below or above range — and the removal rate.`,
      ]},
      { type: "paragraph", text: `Most CAM feeds are set by choosing a target chip load and working backwards; this tool checks in the direction that matters — whether the programmed feed actually cuts the chip the tool was designed for. The working example is built in: the default cut of 600 millimetres per minute at 8000 revolutions with a 2-flute cutter gives 0.0375 millimetres per tooth.` },
    ]},
    { heading: "Why Use Chip Load Calculator", content: [
      { type: "paragraph", text: `Chip load is the single number that explains both failure modes of a milling feed. Too low and the tool rubs instead of cutting — generating heat and work-hardening the surface without removing material. Too high and the flute overloads and snaps. Checking the programmed feed against a typical band converts 'it sounded bad' into a specific diagnosis: below range, above range, or within.` },
      { type: "paragraph", text: `The tool also makes the trade visible across the table: the same 6 millimetre cutter in aluminium carries a 0.04 to 0.08 millimetre band while in stainless it drops to 0.02 to 0.04, and smaller cutters take proportionally less chip load. Material and diameter are not optional inputs here — they are the whole reason the band exists.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How is chip load per tooth calculated?", content: [
      { type: "paragraph", text: `Chip load per tooth is the feed rate divided by the product of spindle speed and flute count: 600 millimetres per minute divided by 8000 revolutions per minute times 2 flutes gives 0.0375 millimetres per tooth. The result is the thickness of the chip each flute takes on each revolution — the number the toolmaker's feed-per-tooth recommendations are quoted in. Raising the feed raises the chip load proportionally; raising the speed or flute count lowers it.` },
    ]},
    { heading: "", subHeading: "What does a below-range status actually mean?", content: [
      { type: "paragraph", text: `Below range means the chip is thinner than the tool is designed for, so the cutting edge tends to rub rather than bite — heat builds up in the edge, the surface can work-harden, and finish suffers, while very little material is removed. The tool labels it a conservative feed, which is the safe direction: it will not break the tool, but it is not the efficient operating point. Ramping the feed up toward the band's low edge is usually the right next move.` },
    ]},
    { heading: "", subHeading: "What does an above-range status risk?", content: [
      { type: "paragraph", text: `Above range means each flute is being asked to take a thicker chip than the tool size and material are typically run at — the risk is tool breakage, especially with smaller cutters and harder materials. The status text says it plainly: above range is a risk of tool breakage, not a marginal suggestion. Bring the feed down into the band or use a larger cutter before running the cut.` },
    ]},
    { heading: "", subHeading: "Why does the typical range change with tool diameter and material?", content: [
      { type: "paragraph", text: `A bigger cutter has a stronger body and a longer cutting edge, so it can take a thicker chip: the 6 millimetre aluminium band is 0.04 to 0.08 millimetres per tooth while the 12 millimetre band is 0.08 to 0.15. Material changes the band because hardness and chip behaviour differ — steel and stainless take thinner chips than aluminium at the same diameter, with stainless the thinnest of the four. The tool's range table encodes both effects, which is why both selectors exist.` },
    ]},
  ],
};

const cnc_material_thickness_guideSeo: ToolSeo = {
  sections: [
    { heading: "What is CNC Material Thickness Guide", content: [
      { type: "paragraph", text: `CNC Material Thickness Guide is a per-process reference for how thick a part can practically be cut, across the six cutting processes that dominate fabrication: fibre laser, CO₂ laser, plasma, abrasive waterjet, CNC router and wire EDM. For each process it lists the materials it can handle with their practical maximum thickness, the kerf to expect, and the note that explains why the process behaves that way — fibre's sweet spot under 10 millimetres of steel, plasma's wide kerf and heat-affected zone, waterjet's thickness limited by speed rather than physics.` },
      { type: "paragraph", text: `The tool is built around the decision that happens before quoting: which process can physically cut this part at this thickness, and what will the edge look like. The rows are not exhaustive material lists — they are the representative thickness ceilings, with the kerf column feeding directly into the CAD model's compensation.` },
    ]},
    { heading: "How to Use CNC Material Thickness Guide", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Select the cutting process under consideration — fibre laser, CO₂ laser, plasma, abrasive waterjet, CNC router or wire EDM.`,
        `<strong>Step 2:</strong> Find the material in that process's table and compare the part thickness against the practical maximum.`,
        `<strong>Step 3:</strong> Read the kerf column for the edge width to budget in the CAD model — laser kerfs are fractions of a millimetre, plasma kerfs are millimetres wide.`,
        `<strong>Step 4:</strong> Read the notes column for the process-specific caveat: nitrogen assist for clean steel edges, flame-polished acrylic, no heat-affected zone on waterjet and EDM parts.`,
        `<strong>Step 5:</strong> Repeat for the alternative processes when a part is near a ceiling — the reference is designed to compare processes side by side before committing.`,
      ]},
      { type: "paragraph", text: `The per-process notes carry the physics that decides the pick: fibre sources cut thin sheet fast and handle reflective metals; the CO₂ wavelength suits organics and thin steel but is a poor match for aluminium; plasma beats laser on cost per metre above 20 millimetres but its kerf rules out fine features; wire EDM cuts hardened tooling with no cutting force at all.` },
    ]},
    { heading: "Why Use CNC Material Thickness Guide", content: [
      { type: "paragraph", text: `Thickness ceilings are the first filter in fabrication quoting, and they are easy to get wrong by extrapolating one process's behaviour to another. The same 20 millimetre steel part is routine for fibre, plasma and waterjet but beyond a CO₂ laser's practical range — and a 150 millimetre plate is waterjet or EDM territory entirely. Having the ceilings per process, side by side, turns the process choice into a lookup before any quote maths starts.` },
      { type: "paragraph", text: `The kerf column does real work for the designer: a plasma-cut part's model has to allow 1.5 to 3 millimetres of kerf, which changes fillet radii and hole sizes, while a laser kerf of 0.1 to 0.2 millimetres is often within drawing tolerance. Knowing the kerf band up front is what lets the CAD model be drawn for the actual process rather than reworked after quoting.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why is copper and brass only cut with a fibre laser?", content: [
      { type: "paragraph", text: `Because copper and brass reflect the 10.6 micrometre wavelength of a CO₂ laser — the beam bounces off the surface instead of being absorbed, so a CO₂ source simply cannot couple energy into the material. Fibre lasers run at 1.06 micrometres, which these metals absorb readily, making fibre the only laser option for them. The same reflectivity reasoning appears in the laser power reference: the source selection is decided by the material's absorption, not by available power.` },
    ]},
    { heading: "", subHeading: "Why is acrylic the classic CO₂ material?", content: [
      { type: "paragraph", text: `The CO₂ wavelength of 10.6 micrometres is absorbed strongly by organic materials, which is why acrylic — an organic polymer — cuts cleanly with edges that come out flame-polished below about 10 millimetres. That absorption is also why the table lists acrylic at 30 millimetres, the thickest ceiling in the CO₂ table: for organics, the CO₂ source is the natural match. The same reason works in reverse for metals, where the wavelength couples far less efficiently.` },
    ]},
    { heading: "", subHeading: "What sets a waterjet's thickness limit, and why is it so different from a laser's?", content: [
      { type: "paragraph", text: `A waterjet cuts by abrasion and has no heat-affected zone, so nothing about the process physically stops it at a thickness — the limit is set by speed: cutting 200 millimetres of steel is possible, it just gets slow enough that the process stops being economical. The table's note states it directly: thickness limits are set by speed, not physics. That is why waterjet ceilings (150 to 200 millimetres of metal) dwarf laser ceilings — a laser's limit is beam and gas physics, a waterjet's is time.` },
    ]},
    { heading: "", subHeading: "Why does plasma have a millimetre-scale kerf?", content: [
      { type: "paragraph", text: `Plasma cuts with a hot gas jet that is physically wide — the kerf runs 1.5 to 3.0 millimetres on common plate, and the heat-affected zone and edge taper go with it. That wide kerf is what rules plasma out for fine features and tight tolerances; the table's ±0.5 millimetre figure for high-definition plasma is the accuracy class you get with the premium variant. For heavy plate above 20 millimetres it is often the right process anyway, because laser cutting there gets slow and expensive while plasma's cost per metre of cut stays low.` },
    ]},
  ],
};

const g_code_reference_viewerSeo: ToolSeo = {
  sections: [
    { heading: "What is G-Code Reference Viewer", content: [
      { type: "paragraph", text: `G-Code Reference Viewer is a searchable table of the twenty-one everyday G and M codes a milling-centre user actually sees in posted CAM output — the ISO 6983 / Fanuc-style dialect that dominates the industry. Each row gives the code, its group, its meaning, a worked example line, and the note that keeps people out of trouble: never position with G00, confirm G21 before running, always cancel a canned cycle with G80.` },
      { type: "paragraph", text: `The table is deliberately the common core rather than the full control's vocabulary — rapid and feed motion, arcs, dwell, plane and unit selection, home return, cutter compensation, tool length, work offsets, the drill cycles, positioning and feed modes, spindle and coolant commands, stops and program end. The note reminds the reader that this is a Fanuc-style summary: dialects differ, and the control's own manual is the final authority.` },
    ]},
    { heading: "How to Use G-Code Reference Viewer", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Search by code (G83, M06) or by keyword (peck, coolant, offset) — the search filters the whole table including the meaning and notes columns.`,
        `<strong>Step 2:</strong> Read the group column to see what kind of thing the code controls: motion, units, offsets, cycles, spindle, coolant, program flow.`,
        `<strong>Step 3:</strong> Study the example line for the codes you are proving out — the argument structure of G81, the I/J offsets of G02, the Q peck of G83.`,
        `<strong>Step 4:</strong> Heed the notes column when posting or editing: they carry the failure modes — no G00 to a feature, no cut without G43, cancel cycles after the last use.`,
        `<strong>Step 5:</strong> Confirm the modal state of the whole program before running: an early G21 or G90 without a later switch applies to every line that follows.`,
      ]},
      { type: "paragraph", text: `Modal codes are the table's underlying theme: G00 and G01, G90 and G91, G21, cutter compensation and the work offsets all stay active until changed. Because a program is read top-down, a single G21 early in the file sets units for the entire program — which is why the units row carries the table's most repeated warning.` },
    ]},
    { heading: "Why Use G-Code Reference Viewer", content: [
      { type: "paragraph", text: `A CAM user's relationship with G-code is mostly reading, not writing: posted output has to be checked before it runs, and the check is only as good as the reader's command of the codes that appear in it. A reference that names each code's group, shows its argument structure in a real line, and states its failure mode turns the prove-out pass from decoding into verification.` },
      { type: "paragraph", text: `The table also settles the disagreements that waste shop time — I/J versus R for arcs, when G95 is standard, what G28 actually does with G91 Z0 — by stating the convention and the reason for it in the same row. That makes it a useful teaching reference as well as a lookup: the example lines are written the way posted code actually reads.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What does it mean for a code to be modal?", content: [
      { type: "paragraph", text: `A modal code stays active until another code in its group replaces it, rather than applying to only the line it appears on. The motion group is the clearest example: once G01 is commanded, every subsequent coordinate move cuts at feed rate until G00 or G02 or G03 appears. The same applies to positioning mode (G90 absolute versus G91 incremental), units (G20 inch versus G21 metric), cutter compensation and the work offsets. Reading a program means tracking modal state line by line, because an early modal setting governs the whole rest of the file.` },
    ]},
    { heading: "", subHeading: "When should an arc use I/J offsets instead of the R format?", content: [
      { type: "paragraph", text: `I and J specify the arc centre as offsets from the start point, which is unambiguous: the centre is exactly one position. The R format (G02 X.. Y.. R..) lets the control compute the centre from the radius, but a given radius and endpoint admit two arcs — one going one way, one the other — and past 180 degrees the ambiguity becomes a real problem. Posted CAM output for milling normally uses I/J, and the R format is best reserved for simple, small arcs where the direction is obvious.` },
    ]},
    { heading: "", subHeading: "Why must a canned cycle be cancelled with G80?", content: [
      { type: "paragraph", text: `The drill cycles G81, G83 and G84 are modal — once commanded, the control repeats the cycle at every subsequent position block until something cancels it. G80 cancels the cycle so the next motion block behaves as a normal move. Leaving a cycle active is a classic source of surprise holes: a positioning block after the cycle gets drilled instead of moved to. The table's rule is to cancel immediately after the cycle's last use.` },
    ]},
    { heading: "", subHeading: "Why is a missing G21 the most common unit mistake?", content: [
      { type: "paragraph", text: `Because units are modal and inherited from program state, not from the drawing. If a program never issues G21, the control keeps whatever unit mode was active from the previous program or from setup — often inch. A 10-millimetre hole posted without G21 machines as a 10-inch feature, or vice versa. The table's warning to confirm G21 before running is the cheapest possible insurance against a unit error that would otherwise scrap the first part.` },
    ]},
  ],
};

const laser_cutter_power_referenceSeo: ToolSeo = {
  sections: [
    { heading: "What is Laser Cutter Power Reference", content: [
      { type: "paragraph", text: `Laser Cutter Power Reference returns indicative laser cutting settings for a material and thickness on either a CO₂ or a fibre machine: the machine power in kilowatts, the cut speed in metres per minute at that power, the kerf to budget in the CAD model, and the assist gas. The settings tables cover five materials on CO₂ — mild steel, stainless steel, aluminium, acrylic and wood — and five on fibre, where mild steel, stainless, aluminium and the reflective copper and brass all cut.` },
      { type: "paragraph", text: `The tool is explicit that these are indicative settings for a modern flatbed cutter at best-cut quality with nitrogen assist on metals, and that real machines vary with optics, nozzle and gas pressure — the guidance is to run a corner trial before nesting a full sheet. The kerf quoted is the top-surface value, with the note that the bottom edge can run about 30 percent narrower on thick plate.` },
    ]},
    { heading: "How to Use Laser Cutter Power Reference", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Choose the laser source: CO₂ at 10.6 micrometres or fibre at 1.06 micrometres — the wavelength decides which materials can be cut at all.`,
        `<strong>Step 2:</strong> Choose the material. Materials that cannot be cut with the selected source are labelled as such; copper and brass, for example, are fibre-only because they reflect the CO₂ beam.`,
        `<strong>Step 3:</strong> Choose the thickness from the options available for that material and source — switching source or material may reset the thickness to the first available row.`,
        `<strong>Step 4:</strong> Read the indicative settings: machine power, cut speed, kerf to budget in CAD, and the assist gas (nitrogen for clean metal edges, air or none for organics).`,
        `<strong>Step 5:</strong> Dial the speed plus or minus about 20 percent on the machine during the trial cut, and verify the kerf against the model before nesting.`,
      ]},
      { type: "paragraph", text: `The tool also enforces the physics of the source: when you switch to CO₂ while copper is selected, the material resets to a cuttable one, and the selector is labelled to show which materials the current source cannot cut. That behaviour mirrors the shop-floor rule — the source is chosen for the material, not the other way around.` },
    ]},
    { heading: "Why Use Laser Cutter Power Reference", content: [
      { type: "paragraph", text: `Laser settings are where quoting and programming meet, and the two common errors are both expensive: quoting a reflective material on the wrong source, and nesting a sheet with a kerf that was never allowed for in the model. The tool removes the first error by labelling uncuttable materials and resetting the selection, and the second by returning the kerf explicitly with instructions to budget it in CAD.` },
      { type: "paragraph", text: `The indicative bands are also the sanity check between the power a machine has and the power a job needs: a 3 millimetre mild steel part needs 1.5 kilowatts on CO₂, while 20 millimetre needs 6 — a job that will simply not fit a 2 kilowatt machine. Checking the settings before quoting is the cheapest way to learn a part is outside the shop's capability.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why can copper and brass only be cut with a fibre laser?", content: [
      { type: "paragraph", text: `Because the CO₂ wavelength of 10.6 micrometres is reflected by copper and brass rather than absorbed — the beam bounces off the surface and the material barely heats. Fibre lasers run at 1.06 micrometres, which these metals absorb, so the reflective metals are fibre-only. This is why the tool labels copper and brass as not cut with a CO₂ source and resets the material if you switch to CO₂ while one is selected.` },
    ]},
    { heading: "", subHeading: "Why does acrylic cut at such low power on CO₂?", content: [
      { type: "paragraph", text: `Acrylic absorbs the 10.6 micrometre CO₂ wavelength strongly, so the beam couples almost fully into the material instead of reflecting or passing through — 3 millimetre acrylic needs only about 0.12 kilowatts, and its edges come out flame-polished. The contrast with metals is the whole story of source selection: an organic material that absorbs the wavelength needs a fraction of the power a reflective metal does.` },
    ]},
    { heading: "", subHeading: "Why does a fibre laser cut aluminium so much faster than CO₂?", content: [
      { type: "paragraph", text: `At 1.06 micrometres aluminium absorbs the beam far more efficiently than at 10.6 micrometres, so more of the fibre laser's energy goes into cutting rather than bouncing off. The tables make it concrete: 3 millimetre aluminium cuts at about 5 metres per minute on fibre versus about 2 on CO₂ — and the tool's own note adds that CO₂ on aluminium is inefficient above 3 millimetres, where fibre or waterjet becomes the right choice.` },
    ]},
    { heading: "", subHeading: "Why does the kerf need to be budgeted in the CAD model?", content: [
      { type: "paragraph", text: `The kerf is material the beam removes — typically 0.1 to 0.3 millimetres — so a part drawn to nominal size comes out undersized by the kerf unless the model compensates. For a sheet with many parts, the kerf also decides whether the spacing between parts closes up during nesting. The tool quotes the kerf explicitly for this reason, and notes that it is a top-surface value: the bottom edge runs about 30 percent narrower on thick plate, so the through-thickness cut is slightly tapered.` },
    ]},
  ],
};

const line_weight_managerSeo: ToolSeo = {
  sections: [
    { heading: "What is Line Weight Manager", content: [
      { type: "paragraph", text: `Line Weight Manager assigns every standard line type a concrete pen width drawn from the ISO 128 pen series — 0.13, 0.18, 0.25, 0.35, 0.5, 0.7, 1.0, 1.4 and 2.0 millimetres, where consecutive pens differ by a factor of the square root of two. Instead of leaving line weight to whatever a plotter driver happens to do, the tool makes the mapping explicit: visible outlines and cutting-plane lines get the thick pen, hidden lines get either the thin or a medium pen depending on the policy chosen, and center lines, dimensions, extension lines, leaders, section hatching, phantom lines and long break lines all share the thin pen.` },
      { type: "paragraph", text: `Two width policies are offered. The plain rule is the 1:2 convention of ISO 128 and ASME Y14.2, where the thin pen is exactly the thick pen divided by two and every non-visible line shares it. The second is the square-root-of-two, three-width practice used in drafting rooms, where hidden lines receive a middle pen between thick and thin. Computed widths snap onto the ISO series, so the result maps cleanly onto real CAD pen tables rather than producing awkward widths like 0.495 millimetres.` },
    ]},
    { heading: "How to Use Line Weight Manager", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Choose the width policy. The 1:2 rule (thin = thick ÷ 2, ISO 128 / ASME Y14.2) is the common default; the √2 three-width policy is the drafting-room practice that gives hidden lines a middle pen.`,
        `<strong>Step 2:</strong> Pick the thick-line pen from 0.35, 0.5, 0.7 or 1.0 millimetres. This is the pen used for the visible outline and the cutting-plane line — the boldest ink on the sheet.`,
        `<strong>Step 3:</strong> Read the assigned widths panel. It shows the effective thick pen (snapped down to the series), the medium pen when the √2 policy is active, and the thin pen that every remaining line type shares.`,
        `<strong>Step 4:</strong> Consult the line-type map table, which lists all eight standard line types with their group and the exact width assigned — use this table as the pen assignment when building your CAD layer standards.`,
        `<strong>Step 5:</strong> Keep colours out of the weight decision. A layer-naming convention maps each layer to one of the three pens at plot time; colour stays a layer-identity attribute so the same file can plot with different pen tables.`,
      ]},
      { type: "paragraph", text: `The tool's note explains the reading of the ratios: adjacent ISO pens give about 1.4:1 contrast, which reads as the same family, while skipping a pen gives the crisp 2:1 contrast used to separate visible geometry from everything else. That is why the 1:2 policy collapses all non-visible lines onto one pen and the √2 policy splits them.` },
    ]},
    { heading: "Why Use Line Weight Manager", content: [
      { type: "paragraph", text: `Line weight is how a drawing tells the reader what matters. The visible outline is the strongest signal on the sheet, and everything else must be visibly subordinate to it; a drawing where dimensions, hatching and hidden lines all print at the same weight as the outline is hard to read and slower to check. Standardising the assignment once, in one place, means every sheet in the set plots consistently instead of each drafter guessing.` },
      { type: "paragraph", text: `The √2 policy exists because drawings are often plotted at reduced scale, where a hidden line printed at a very thin weight can vanish or close up. A middle pen keeps the hidden geometry legible while still reading clearly as subordinate to the outline — the reason the three-width practice is common in shops that plot reduced-size check sets.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why does the thin pen sometimes not come out to exactly half the thick pen?", content: [
      { type: "paragraph", text: `Because the result is snapped onto the ISO 128 pen series rather than left as a raw division. A 0.7 millimetre thick pen divides to exactly 0.35, which is a series pen, but a 0.35 millimetre thick pen divides to 0.175, which is not in the series — the tool takes the largest series pen no heavier than the computed value, so it snaps down to the 0.13 pen. Snapping is deliberate: the final assignment has to be a pen that actually exists, and snapping down for the thin lines keeps them visibly lighter than the outline rather than drifting toward it.` },
    ]},
    { heading: "", subHeading: "What is the square-root-of-two series and why would a hidden line need a middle pen?", content: [
      { type: "paragraph", text: `ISO 128 standardises the pen series from 0.13 to 2.0 millimetres where each step multiplies the width by the square root of two, about 1.41. Adjacent pens give a subtle 1.4:1 contrast that reads as the same family; skipping one pen gives the 2:1 contrast used to separate the visible outline from everything else. Under the three-width policy the hidden line sits between the outline and the thinnest pen, so it stays legible when the drawing is plotted at reduced scale instead of collapsing to a hairline.` },
    ]},
    { heading: "", subHeading: "Why keep colour out of the line-weight decision?", content: [
      { type: "paragraph", text: `Colour is a layer-identity attribute, while weight is a plot-time mapping. A layer naming convention — like the one in the CAD layer naming builder — assigns each layer a pen (thick, medium or thin) and each layer a colour; the two are independent. Keeping them separate means the same drawing file can be plotted with different pen tables, and a layer's colour can change without silently changing the printed weight of every line on it.` },
    ]},
    { heading: "", subHeading: "How do I know which ratio my drawing needs?", content: [
      { type: "paragraph", text: `The 2:1 ratio between the thick and thin pens is the crisp separation used to distinguish visible geometry from dimension, hatching and hidden detail — the default under the 1:2 policy. The 1.4:1 ratio of adjacent series pens reads as one family and is what separates the medium hidden line from both the outline and the thinnest lines under the √2 policy. If your plotting process or reduced-size check sets make the thin line vanish, move to the three-width policy; otherwise the 1:2 rule is the standard default.` },
    ]},
  ],
};

const machining_operation_selectorSeo: ToolSeo = {
  sections: [
    { heading: "What is Machining Operation Selector", content: [
      { type: "paragraph", text: `Machining Operation Selector plans the operation sequence for a milled feature. You choose the feature type — flat face, pocket, slot or keyway, through hole, blind hole, or external profile — the material, and the tolerance class, and the tool returns the recommended sequence of operations with the parameter detail for each step, plus the tooling note for that material.` },
      { type: "paragraph", text: `The governing idea is that tolerance class decides whether a separate finish pass is added, and nothing else: roughing parameters stay the same whether the part is a rough envelope or a tight-tolerance feature, because the finish pass — not the roughing pass — sets the final size. Rough classes get a single operation set; general and tight classes add the finishing step that carries the accuracy.` },
    ]},
    { heading: "How to Use Machining Operation Selector", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Choose the feature type from the six options — the sequence logic is keyed to feature geometry first.`,
        `<strong>Step 2:</strong> Choose the material — the tooling note changes with it, from climb milling for stainless and aluminium to high-pressure coolant for titanium.`,
        `<strong>Step 3:</strong> Choose the tolerance class: rough (±0.2 millimetres or looser), general (±0.1 millimetres), or tight (±0.03 millimetres).`,
        `<strong>Step 4:</strong> Read the recommended sequence — the ordered steps with their parameter detail, such as ramp or helical entry for a pocket and spot-before-drill for a hole.`,
        `<strong>Step 5:</strong> Read the tooling-for-material note and the finish-pass result to confirm the operation family and whether a separate finish pass is part of the plan.`,
      ]},
      { type: "paragraph", text: `The sequences encode conventional shop practice: a tight through-hole is spot, drill, then ream or interpolate; a pocket with a finish requirement is a rough pocket with ramp or helical entry, then a 0.1 to 0.3 millimetre radial finish pass around the wall; a slot roughs at axial engagement no more than half the tool diameter per pass before its finish pass.` },
    ]},
    { heading: "Why Use Machining Operation Selector", content: [
      { type: "paragraph", text: `The sequence is where machining plans are decided, and it is easy to get the middle steps wrong — drilling a tight hole without a spot, or finishing a pocket wall without cutter compensation. The selector makes the conventional sequence explicit per feature, so the plan starts from known-good practice and the parameter detail gives the numbers that matter: engagement, depth, stock, and the drill-point allowance for a blind hole.` },
      { type: "paragraph", text: `It also separates the two decisions people conflate: how to rough and whether to finish. Roughing parameters stay constant across tolerance classes — a deliberate design — because the finish pass sets the final size. That single rule removes a whole class of planning errors where a tighter tolerance is 'handled' by slowing the roughing pass, which does nothing for size accuracy and wastes machine time.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why does the tolerance class only add or remove a finish pass?", content: [
      { type: "paragraph", text: `Because roughing and finishing have different jobs. The roughing pass removes the bulk of the material and its parameters are set by tool strength and machine power; the finish pass removes the last 0.1 to 0.3 millimetres and it is that pass that sets the final size and surface. Tightening the tolerance therefore never means cutting the roughing pass differently — it means adding the finish step that carries the accuracy. That is why the tool keeps roughing identical across the rough, general and tight classes.` },
    ]},
    { heading: "", subHeading: "What are the three tolerance classes based on?", content: [
      { type: "paragraph", text: `They are the standard shop categories of feature accuracy: rough, at ±0.2 millimetres or looser, where a single operation set suffices; general, at ±0.1 millimetres, the everyday default for machined parts; and tight, at ±0.03 millimetres, where the finish pass is mandatory and processes like reaming or interpolation carry the accuracy. The class selection drives whether the plan adds a finish face, finish walls, a finish profile or a ream-and-interpolate step.` },
    ]},
    { heading: "", subHeading: "Why does a tight through-hole get spot, drill, then ream or interpolate?", content: [
      { type: "paragraph", text: `Each step exists because the one before it cannot do its job alone. The spot drill starts the hole on location — a twist drill walking off the mark ruins position before size matters. The drill then opens the hole through the part, and because a twist drill is not a size-accurate tool, the final step either reams with 0.2 to 0.4 millimetres of stock at two-thirds drill speed, or interpolates the bore with an end mill for position accuracy. Rough classes stop after the drill; tight classes add the last step.` },
    ]},
    { heading: "", subHeading: "When does a slot need a finish pass on both walls?", content: [
      { type: "paragraph", text: `Whenever the slot width is a functional dimension, which is most of the time — a keyway or a bearing seat is sized by its width. The rough slot at axial engagement up to half the tool diameter per pass leaves both walls slightly off, so the finish pass takes 0.1 to 0.2 millimetres off each wall in the same climb direction. Cutting both walls in the same direction is the point: alternating direction produces a width error equal to the tool's deflection, while a consistent climb direction makes both walls share the same deflection and the width comes out correct.` },
    ]},
  ],
};

const material_cutting_referenceSeo: ToolSeo = {
  sections: [
    { heading: "What is Material Cutting Reference", content: [
      { type: "paragraph", text: `Material Cutting Reference is a starting-parameters table for end milling twelve common materials. For each material it lists the condition the values assume (annealed, T6, as cast, free-cutting), the surface speed band in metres per minute for both HSS and carbide tooling, the feed per tooth in millimetres, and the note that actually matters on the shop floor — climb milling for stainless, no dwell on titanium, dry cutting with air blast on cast iron.` },
      { type: "paragraph", text: `The values assume a 3 to 6 millimetre diameter cutter, and the tool says so plainly: these are conservative starting points, not recommendations for a specific machine. Real parameters depend on tool diameter, flute count, machine rigidity, toolholder run-out and coolant. The note also gives the two rules of thumb that rescue most first attempts: halve the speed for HSS at diameters under 3 millimetres and for long-reach tooling, and if in doubt, cut a test slot and listen to the tool.` },
    ]},
    { heading: "How to Use Material Cutting Reference", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Find the material you are cutting in the table — the twelve rows span low-carbon and alloy steels, tool steel, stainless, two aluminiums, brass, copper, cast iron, titanium, plastics and hardwoods.`,
        `<strong>Step 2:</strong> Read the surface speed band for the tool grade you are using: HSS numbers are the low band, carbide the high band, in metres per minute.`,
        `<strong>Step 3:</strong> Read the feed per tooth in millimetres and multiply by the flute count to get the feed rate for your spindle speed.`,
        `<strong>Step 4:</strong> Apply the row's note before anything else: climb mill the stainless, never let titanium dwell or rub, start A356 at 75% speed to break through its oxide skin.`,
        `<strong>Step 5:</strong> Treat the numbers as entry points. Halve the speed for HSS under 3 millimetres diameter and long-reach tooling, then run a test slot and tune from the sound and the chips.`,
      ]},
      { type: "paragraph", text: `The table pairs each material with its characteristic failure mode: gummy copper wants sharp edges and steady feed to avoid smearing, free-cutting brass wants a sharp rake so it does not grab, and grey cast iron turns into abrasive powder, so dry cutting with air blast or MQL protects the tool and the machine.` },
    ]},
    { heading: "Why Use Material Cutting Reference", content: [
      { type: "paragraph", text: `Starting parameters are where most cutting problems are born. Feed a titanium part at steel speeds and the edge fails immediately; feed 304 stainless with dwell and the surface work-hardens into something no tool wants to touch. A reference that lists both the numbers and the behaviour each material demands converts those one-off lessons into a starting point you can use before you have them.` },
      { type: "paragraph", text: `The speed bands also encode the tool-grade decision: the same material at very different surface speeds depending on whether the cutter is HSS or carbide, and carbide's wider band reflecting that it needs a rigid setup and climb cutting to avoid edge chipping. Choosing the row is therefore also choosing the tooling strategy, which is why each row's note reads like a setup instruction rather than a footnote.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why are there two speed bands for every material?", content: [
      { type: "paragraph", text: `Because the tool material and the cutting-tool material are different decisions: HSS tooling runs at roughly a third to a quarter of the surface speed of carbide in the same workpiece. Carbide keeps its edge at much higher temperatures, which is what the high band reflects — but only if the setup is rigid enough to avoid chipping it. If the machine is light or the reach is long, run the HSS band even with a carbide cutter.` },
    ]},
    { heading: "", subHeading: "Why does titanium want low speed but high feed per tooth?", content: [
      { type: "paragraph", text: `Titanium conducts heat poorly and work-hardens aggressively, so the cutting edge must be kept moving through fresh material — dwell or rubbing raises the local temperature until the edge fails almost instantly. The prescription is the opposite of intuition: a low surface speed to control heat, a feed per tooth kept high enough relative to that slow speed to keep the cut moving, and lots of coolant. The table pairs titanium's slowest-in-the-table speed band with a 0.02 to 0.05 millimetre feed band — modest in absolute terms, but the chip must never thin out enough to rub, which is why the note says never dwell.` },
    ]},
    { heading: "", subHeading: "Why must 304 stainless never be allowed to rub?", content: [
      { type: "paragraph", text: `Austenitic stainless work-hardens extremely fast — a moment of rubbing or a light cut that stops cutting and starts burnishing turns the surface into a hard skin that blunts the next pass and can stall the machine. The row's rule is constant feed, a sharp tool, and climb milling, which keeps the chip load steady. This is also why the note says never let it rub rather than suggesting a speed adjustment: the failure is a behaviour, not a number.` },
    ]},
    { heading: "", subHeading: "Why start aluminium castings at 75 percent of the normal speed?", content: [
      { type: "paragraph", text: `Because as-cast A356 carries an abrasive oxide skin from the casting process. The first pass has to break through that skin before it reaches the sound metal underneath, and doing so at full speed wears the edge prematurely. Starting the first pass at about 75 percent of the row's surface speed gets through the skin, after which the second pass can run at the normal band for the material.` },
    ]},
  ],
};

const scale_bar_toolSeo: ToolSeo = {
  sections: [
    { heading: "Scale, Distance, and Why Drawings Carry Their Own Ruler", content: [
      { type: "paragraph", text: `A scale bar is the graduated ruler printed directly onto a drawing sheet — the divided line that lets anyone reading a plotted floor plan, site survey, or engineering detail measure real-world distance without needing to know the drawing's original scale, the paper size it was printed on, or whether it was reduced to fit a smaller plotter. It does the same job as a numeric scale note like "1:100," but with one critical difference: it stays correct even when the drawing doesn't. A representative fraction printed in the title block is only accurate at the exact size the sheet was plotted. Scan that page, photocopy it, or shrink it to 75% to fit a smaller format, and the numeric ratio silently becomes wrong while nothing on the page tells you so. A graphical scale bar, because it is drawn as geometry on the same sheet, shrinks and grows in exact proportion with everything else — the line stays accurate no matter what happens to the paper around it.` },
      { type: "paragraph", text: `Scale ratios themselves split into two families depending on which direction the drawing moves relative to the real object. A reduction scale, written 1:X — 1:50, 1:100, 1:200, and so on — represents something larger than the paper it's drawn on, which covers nearly everything in architecture and civil engineering: floor plans, site plans, building elevations, and regional site surveys. An enlargement scale, written X:1 — 2:1, 5:1, 10:1 — does the opposite, blowing a small physical object up larger than life so its detail is visible on paper. This convention shows up constantly in PCB layout, watchmaking, jewelry design, and any micro-fabrication drawing where the real part is too small to annotate at true size.` },
    ]},
    { heading: "Three Ways to Describe the Same Ratio", content: [
      { type: "paragraph", text: `Different disciplines express drawing scale differently, even when the underlying math is identical, which is why a scale bar tool needs to accept all three conventions rather than forcing every user into one notation.` },
      { type: "list", items: [
        `<strong>One-to-X (metric ratio scale).</strong> The standard notation for site plans, civil drawings, and most of the world outside North America — 1:50, 1:100, 1:200, 1:500. A "Toggle X:1" control flips the same ratio into its enlargement form, which matters the moment you're dimensioning a PCB trace or a micro-fabricated part rather than a building.`,
        `<strong>Inches-to-the-foot (US architectural scale).</strong> North American architectural drawings state scale as a fraction of an inch representing one foot — ¼" = 1'-0", ⅛" = 1'-0", ½" = 1'-0" — the exact convention printed on an architect's scale ruler. It's mathematically the same 1:X ratio underneath (¼" = 1'-0" is 1:48), just expressed the way drafters actually read it off a physical scale.`,
        `<strong>Scale factor (direct multiplier).</strong> A plain numeric multiplier — 1.2×, 0.5×, 2× — used when a drawing is being enlarged or reduced without reference to a standard sheet scale, common for detail callouts blown up from a parent drawing or model-scale conversions.`,
      ]},
    ]},
    { heading: "Bar Geometry, Segment Length, and Style", content: [
      { type: "paragraph", text: `Once the scale is set, the remaining decisions are about how the bar itself reads on paper. Segment length is the real-world distance each division of the bar represents — 1 m, 5 ft, 500 mm — and it should be chosen so the resulting bar spans a sensible physical width once scaled: 80–120 mm is typical for an A1 or A0 title block, with the tool computing the paper length of each segment automatically from the scale you've entered. Bar height and line weight matter more than they might seem, since a scale bar plotted too thin can disappear at small reduction, and one drawn too heavy competes visually with the drawing's own linework.` },
      { type: "paragraph", text: `Three bar styles cover essentially every drafting convention in use:` },
      { type: "list", items: [
        `<strong>Double row.</strong> Alternating filled and unfilled blocks across the top and bottom half of the bar — the "zebra" style most widely recognized in architectural and civil drafting, and the default most reviewers expect to see in a title block.`,
        `<strong>Single row.</strong> A cleaner, unbroken bar with tick divisions, better suited to small-scale inserts or drawings where a full double-row bar would crowd the sheet.`,
        `<strong>Line with ticks.</strong> A ruled line with perpendicular tick marks at each division — the convention more common in engineering drawings and topographic or survey mapping than in architectural work.`,
      ]},
    ]},
    { heading: "Why the Bar Survives What the Paper Doesn't", content: [
      { type: "paragraph", text: `This is the property that makes a graphical scale bar effectively mandatory on any drawing that might get reproduced, and it comes straight from how the bar is constructed: paper length in millimetres equals real distance in millimetres divided by the scale — a single division, computed once and then drawn as geometry. A one-metre segment on a 1:50 drawing works out to 1000 ÷ 50 = 20 mm on paper, and that 20 mm line is what actually gets drawn — not the number "1:50." Print that sheet at a different size, photocopy it, or scan and rescale it digitally, and the 20 mm bar shrinks or grows right along with the rest of the drawing, staying correct at any size. A numeric scale note has no such protection: it's just text, and text doesn't know or care that the page around it changed size. That's the reason drawing standards built around ISO 5455 and construction-document conventions like ASME Y14.1 expect a graphical scale in the title block of anything likely to be plotted, copied, or submitted for permit review — a numeric scale note alone isn't considered reliable once a sheet leaves the original plotter.` },
    ]},
    { heading: "Exporting a Scale Bar Into Any CAD or Design Workflow", content: [
      { type: "paragraph", text: `A scale bar only earns its keep once it's actually inserted into the drawing it belongs to, which is why export format matters as much as the geometry itself. SVG output is fully vector and editable in Illustrator, Inkscape, or any application that reads SVG paths directly, making it the right choice when the bar needs to be recolored or resized after export. PNG rasterizes at high resolution for print-ready placement into a report or presentation. PDF embeds the bar as a page-ready image, useful when the destination is Word or InDesign rather than a CAD application. DXF export — built as real SOLID and LINE entities in the widely compatible DXF R12 format — is the one that matters most to working CAD users, since it can be inserted directly into AutoCAD, QCAD, BricsCAD, or LibreCAD as an actual drawing block at the correct scale, not as a flattened image pasted onto the sheet.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why does the DXF use SOLID entities instead of filled rectangles?", content: [
      { type: "paragraph", text: `DXF R12 SOLID entities are the native filled quadrilateral in the DXF standard — they are rendered as solid fill by every CAD application that reads R12, including AutoCAD 2000 through current, QCAD, LibreCAD, BricsCAD, and Vectorworks. Using SOLID entities means the fill is a real CAD entity, not a raster image, and can be recoloured, frozen, or plotted to a specific pen weight by layer. Drawing filled rectangles as four LINE entities (as some tools do) produces outlines only; the interior is unfilled and the bar looks wrong when plotted.` },
    ]},
    { heading: "", subHeading: "What does the inch-to-foot mode compute?", content: [
      { type: "paragraph", text: `It computes scale = total real inches ÷ paper inches. For ¼″ = 1′-0″, the real side is 1 foot = 12 inches and the paper side is 0.25 inches, giving scale = 12 ÷ 0.25 = 48. All subsequent bar geometry uses that scale: a 1-foot segment on paper is 12 × 25.4 ÷ 48 = 6.35 mm. The optional extra real inches field handles non-zero-inch real sides such as ½″ = 1′-6″, where the real side is 18 inches and the scale is 18 ÷ 0.5 = 36.` },
    ]},
    { heading: "", subHeading: "Why are the two row styles (double and single) recommended over the line style for most drawings?", content: [
      { type: "paragraph", text: `Filled bar styles survive printing noise better than a ruled line. On a heavily reproduced or faxed drawing, a line-style bar can look like a dimension line and be misread. The alternating black-white blocks of a double-row bar are unmistakeable as a scale bar from across a room. The line style is appropriate for topographic and engineering drawings that use the scale bar inside a dense annotation block where a thinner element is preferred, or where the convention specifies it explicitly.` },
    ]},
  ],
};

const tooling_library_browserSeo: ToolSeo = {
  sections: [
    { heading: "What is Tooling Library Browser", content: [
      { type: "paragraph", text: `Tooling Library Browser is a reference of the twelve rotating cutting tools that dominate a milling shop's tooling drawer: square and ball nose end mills, corner-radius and roughing cutters, face mills, three kinds of drills, spot drills, reamers, taps and slitting saws. Each row describes the tool's geometry, what it is best at, the note that decides when to reach for it, and the common sizes it comes in.` },
      { type: "paragraph", text: `The distinction the table keeps front and centre is geometry's job: flute count is chosen by material — two flutes for chip clearing in aluminium, three or four for stiffness and finish in steel — not by preference. A 4-flute cutter in aluminium packs chips into the flutes and overheats; a 2-flute cutter in steel flexes and chatters. Reading the geometry column first is how the table is meant to be used.` },
    ]},
    { heading: "How to Use Tooling Library Browser", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Identify the feature you are producing — a square corner, a fillet, a flat surface wider than the part, a tolerance hole, a blind thread.`,
        `<strong>Step 2:</strong> Find the tool whose best-for column matches that feature: ball nose for 3D surfacing and fillets, face mill for wide flats, reamer for H7 holes.`,
        `<strong>Step 3:</strong> Read the geometry column to confirm the tool matches your material — 2-flute for aluminium, 3 to 4-flute for steel, spiral-flute tap for blind holes.`,
        `<strong>Step 4:</strong> Check the notes column for the operating rule: ball-nose stepover around 5 to 10 percent of tool diameter for smooth scallops, reamers need 0.2 to 0.4 millimetres of stock and two-thirds drill speed.`,
        `<strong>Step 5:</strong> Use the sizes column to confirm the tool exists in the diameter you need before writing the CAM toolpath.`,
      ]},
      { type: "paragraph", text: `The tool's note carries the decision rule in one sentence: tool geometry decides everything downstream, so when in doubt between a 3- and 4-flute cutter in steel, take the 4-flute — it gives better finish and longer edge life at the same feed rate.` },
    ]},
    { heading: "Why Use Tooling Library Browser", content: [
      { type: "paragraph", text: `Most tooling mistakes are category mistakes — using a drill where the operation needs a reamer, or a square end mill where a ball nose is the only shape that produces the feature. A table that names each tool's job alongside its geometry turns the selection into a lookup instead of an experiment, which matters because the cost of the wrong tool shows up not in the tool itself but in the scrapped part and the re-cut.` },
      { type: "paragraph", text: `The notes column is where the real knowledge sits: the U-drill that drills 12 to 50 millimetre holes at feed rates a twist drill cannot reach, the spot drill whose point angle must match the drill that follows it, the slitting saw that is fragile in torsion and needs a stiff arbor. Those are the details that separate a working toolpath from one that breaks tools on the first pass.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why do aluminium end mills have two flutes?", content: [
      { type: "paragraph", text: `Chip clearing. Aluminium produces long, sticky chips at high removal rates, and a 2-flute cutter leaves the flute space wide open so the chips evacuate instead of packing in and welding onto the edge. Steel is the opposite problem: its chips are short, and the priority is stiffness and edge finish, which is why steel cutters run three or four flutes. The flute-count decision is material-driven, which is why the table's geometry column names the material next to each flute count.` },
    ]},
    { heading: "", subHeading: "When is a ball nose the right tool?", content: [
      { type: "paragraph", text: `Whenever the feature is three-dimensional — a sculpted surface, a fillet, a concave pocket floor. The ball nose's spherical end lets it cut in any direction, which is what 3D surfacing needs, at the price of a scalloped finish whose smoothness depends on stepover: keep the stepover around 5 to 10 percent of the tool diameter for a smooth result. If the feature is flat or has square corners, a square end mill is the faster, more accurate choice.` },
    ]},
    { heading: "", subHeading: "Why does a reamer need stock left and two-thirds drill speed?", content: [
      { type: "paragraph", text: `A reamer does not cut its way in like a drill; it trims a small amount of material from an existing hole to size it to H7 tolerance — typically within 0.01 to 0.02 millimetres. It needs 0.2 to 0.4 millimetres of stock to work on, and it must run at about two-thirds of drill speed with a constant feed and no dwell, because dwell lets the reamer rub and size the hole wrong or break the edge. Leave no stock and the reamer rides on a hard surface; leave too much and the edge overloads.` },
    ]},
    { heading: "", subHeading: "What does a corncob roughing mill actually do?", content: [
      { type: "paragraph", text: `The serrated edge of a roughing end mill breaks the chip into small segments as it cuts, so it can remove material 30 to 50 percent faster than a plain end mill at heavier depth. The trade is surface finish: the segmented chips leave a rough wall, which is exactly what roughing is for — the finish pass that follows with a square end mill cleans up the wall. Reaching for the corncob first is how you hog material out without burning up a finishing cutter.` },
    ]},
  ],
};

const waterjet_cutting_referenceSeo: ToolSeo = {
  sections: [
    { heading: "What is Waterjet Cutting Reference", content: [
      { type: "paragraph", text: `Waterjet Cutting Reference estimates traverse speeds for abrasive waterjet cutting. You choose the material, thickness, pump pressure, abrasive flow and edge quality, and the tool returns the traverse speed in millimetres per minute, the top kerf of about one millimetre, and the abrasive consumption — plus the material note that matters, like glass needing an entry pierce outside the part.` },
      { type: "paragraph", text: `The speed model is stated in the tool itself: traverse speed scales with a reference speed at 10 millimetres and 4100 bar, times the thickness ratio to the power of 0.75, times the pressure ratio to the power of 1.15, times the abrasive flow factor. The reference speeds cover six materials — mild steel at 120 millimetres per minute, stainless at 100, aluminium at 210, titanium at 65, granite at 55 and glass at 90 — all at 10 millimetres, 4100 bar and 340 grams per minute of 80-mesh garnet.` },
    ]},
    { heading: "How to Use Waterjet Cutting Reference", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Choose the material — the six options carry very different reference speeds, from aluminium at 210 millimetres per minute down to granite at 55.`,
        `<strong>Step 2:</strong> Enter the part thickness in millimetres. Halving the thickness speeds the cut by roughly 1.68 times; doubling it slows it by the same factor.`,
        `<strong>Step 3:</strong> Choose the pump pressure — 3000 bar or 4100 bar — and the abrasive flow, which scales the speed: 240, 340 or 450 grams per minute.`,
        `<strong>Step 4:</strong> Choose the edge quality: fast and rough, standard, or premium, which halves the traverse speed to control taper.`,
        `<strong>Step 5:</strong> Read the traverse speed, budget the roughly one millimetre top kerf in the CAD model, and apply the material note — start glass cuts outside the part, keep titanium's jet moving.`,
      ]},
      { type: "paragraph", text: `The quality selector also carries the taper story: a standard cut has a top kerf roughly 0.1 to 0.3 millimetres wider than the bottom depending on thickness; premium slows the cut to about half speed to control it; fast opens the taper tolerance up for edges that will be machined or hidden.` },
    ]},
    { heading: "Why Use Waterjet Cutting Reference", content: [
      { type: "paragraph", text: `Waterjet quoting needs a traverse speed before it needs anything else, and the model behind this tool is the one shops actually use: start from a known reference speed for the material, then scale by thickness, pressure, abrasive flow and quality. The tool makes those scalings explicit instead of leaving them to guesswork, which matters because a 20 percent error in traverse speed is a 20 percent error in quoted hours.` },
      { type: "paragraph", text: `It also documents the property that makes waterjet the right process call in the first place: no heat-affected zone, so the CAD model needs no allowance for distortion — only for the kerf and taper. That single property is why waterjet wins on hardened, heat-sensitive and thick plate, and the material notes reinforce when to choose it.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why does halving the thickness speed the cut by about 1.68 times?", content: [
      { type: "paragraph", text: `Because the model scales traverse speed by the thickness ratio raised to the power of 0.75: for 5 millimetres from the 10 millimetre reference, the factor is 2 raised to 0.75, which is about 1.682. A 120 millimetres per minute mild steel reference at 10 millimetres becomes about 202 millimetres per minute at 5. The 0.75 power is the empirical fit for how jet energy is consumed through the kerf — thicker parts need the jet to spend more of its energy per millimetre of travel.` },
    ]},
    { heading: "", subHeading: "What does premium edge quality change?", content: [
      { type: "paragraph", text: `Premium finish halves the traverse speed — the factor is 0.5 — in exchange for a taper-controlled, fine edge. The tool's note ties the mechanism to practice: taper is controlled by slowing the cut or by stack cutting, and a second pass cleans the edge. Fast and rough does the opposite, opening the taper tolerance up at 1.4 times the standard speed for edges that will be machined, welded or hidden anyway.` },
    ]},
    { heading: "", subHeading: "Why does aluminium cut nearly twice as fast as mild steel?", content: [
      { type: "paragraph", text: `The reference speeds reflect how easily the abrasive jet erodes each material: aluminium at 210 millimetres per minute at 10 millimetres versus mild steel at 120. The material note summarises it as aluminium cutting nearly twice as fast as steel at the same thickness. Stainless sits slower than mild at 100 because work hardening resists the jet, and titanium slower still at 65 with a warning to keep fresh abrasive and never stall the jet.` },
    ]},
    { heading: "", subHeading: "Why does the CAD model need no allowance for waterjet distortion?", content: [
      { type: "paragraph", text: `Because waterjet cutting introduces no heat-affected zone — the material is eroded by the abrasive jet, not melted, so there is no thermal distortion to compensate for in the model. The allowances that do exist are the kerf, about one millimetre at the top surface, and the taper, roughly 0.1 to 0.3 millimetres between the top and bottom edges on a standard cut. Model the kerf, plan for the taper, and the cut part matches the drawing — which is exactly why the tool reports both numbers.` },
    ]},
  ],
};

/**
 * Catalog claims used verbatim in the scale-paper-tool prose below. They are
 * exported so e2e/scale-paper-tool.catalog.test.ts can pin them to the live
 * PAPER_SIZES / PAPER_GROUPS / DISPLAY_UNITS arrays in scale-paper-tool.tsx —
 * these numbers drifted out of sync once before (the prose said A0–A10 while
 * the catalog had grown), so a test now fails loudly on any divergence.
 */
export const SCALE_PAPER_CATALOG_CLAIM = 141;
export const SCALE_PAPER_SERIES_CLAIM = 12;
export const SCALE_PAPER_UNIT_CLAIM = 12;

const scale_paper_toolSeo: ToolSeo = {
  sections: [
    { heading: "What is Scale Paper Tool", content: [
      { type: "paragraph", text: `Scale Paper Tool is a visual paper-size comparison utility for designers, architects, engineers, and print professionals. You pick two paper sizes from a ${SCALE_PAPER_CATALOG_CLAIM}-entry catalog spanning ${SCALE_PAPER_SERIES_CLAIM} series — ISO 216 A (4A0–A13), ISO B (B0–B13), ISO C envelopes (C0–C10), Traditional/Imperial sheets, ANSI/US (Letter, Legal, Tabloid/Ledger, Government Letter, ANSI A–E), ARCH, JIS B (JIS-B0–B10), the photo R-series, RA and SRA raw formats as two separate groups, and the PA and F transitional series — set the display unit to any of ${SCALE_PAPER_UNIT_CLAIM} options (micrometres, millimetres, centimetres, decimetres, thou, inches, links, feet, PostScript points, picas, pixels, or HP-GL plotter units), choose portrait or landscape orientation, and the tool draws a proportional visual overlay of both sheets and computes the exact percentage difference and multiplier factor between them — separately for width, height, diagonal, and area.` },
      { type: "paragraph", text: `The two magnification percentages the tool reports for width and diagonal are intentionally different and both correct. A sheet that is 141% wider than another is not 141% larger diagonally — the diagonal scales by the square root of 2 for perfectly proportional sheets (ISO A-series), giving a 41.4% diagonal increase for every doubling of area. In practice width, height, and diagonal percentages all diverge for non-proportional sizes like ANSI Letter versus A4. Both figures are shown explicitly so you can choose the right one for your use case.` },
    ]},
    { heading: "How to Use Scale Paper Tool", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Choose the display unit — any of ${SCALE_PAPER_UNIT_CLAIM} options from micrometres to feet, including thou (mil), links, PostScript points and picas, 96-DPI pixels, and HP-GL plotter units. All dimensions on screen update immediately.`,
        `<strong>Step 2:</strong> Click Portrait or Landscape to set the orientation. Both sheets switch together, which is the correct behaviour: a landscape A3 compared to a landscape A4 is a meaningful comparison; mixing orientations is not.`,
        `<strong>Step 3:</strong> Select the baseline paper from the left dropdown. The baseline is the "from" size — what you currently have or what your drawing is drawn on. Sizes are grouped by series: ISO A, ISO B, ISO C, Traditional/Imperial, ANSI/US, ARCH, JIS B, Photo, RA, SRA, PA, and F.`,
        `<strong>Step 4:</strong> Select the comparison paper from the right dropdown. This is the "to" size — what you want to scale to, or what the recipient's printer accepts.`,
        `<strong>Step 5:</strong> Read the overlay and the four stat rows: width %, height %, diagonal %, and area %. The overlay draws the two sheets to scale from a shared top-left corner so the size relationship is immediately visible. Use the Download SVG or PNG buttons to export the overlay for insertion into a presentation or document.`,
      ]},
      { type: "paragraph", text: `A common use case: a structural engineer draws on A1 sheets and wants to know the print reduction needed to fit A3 for a client handout. The tool reports width −50%, height −50%, diagonal −50%, area −75% — A3 is exactly half the linear dimensions of A1 (two halves in the ISO series) and one-quarter of the area. The overlay confirms it visually.` },
    ]},
    { heading: "Why Use Scale Paper Tool", content: [
      { type: "paragraph", text: `Paper size decisions cascade through an entire project. Choosing the wrong sheet for a drawing forces a scale change when the drawing is printed, which means a new scale bar, new dimension check, and a new title block entry. Checking the size relationship before starting the drawing — or before submitting to a printer — takes ten seconds with this tool and avoids that cascade.` },
      { type: "paragraph", text: `The JIS B-series is included because Japanese drawing practice frequently mixes ISO A and JIS B sheets: a JIS-B4 sheet (257 × 364 mm) is slightly larger than ISO A4 (210 × 297 mm) but fits in the same drawer, and the difference is often invisible until the drawing is plotted and clipped. The tool makes that 22% width difference explicit.` },
      { type: "paragraph", text: `The diagonal scaling factor is the number that matters for optical scaling and reduction photocopying: a photocopier set to 70.7% (1 ÷ √2) takes an A3 original to A4. That factor appears directly in the diagonal multiplier row for A3 → A4, confirming it is the correct setting. Width and height factors are used for directional scaling in vector software, where width and height can be scaled independently.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why are the width percentage and diagonal percentage different?", content: [
      { type: "paragraph", text: `Because width and diagonal are different measurements. Width is purely horizontal; diagonal is the hypotenuse of width and height. For a sheet that is 100 mm wide and 141 mm tall, the diagonal is 173 mm. A sheet that is 50 mm wide and 70.7 mm tall has a diagonal of 86.5 mm — half the diagonal, but the width ratio is also 50%. In that perfectly proportional case width, height, and diagonal are all 50%, so the difference only appears when the two sheets are not proportional to each other, as with ANSI Letter (216 × 279 mm) versus ISO A4 (210 × 297 mm). The tool shows both figures explicitly rather than hiding one.` },
    ]},
    { heading: "", subHeading: "What is the ISO 216 A-series formula?", content: [
      { type: "paragraph", text: `ISO 216 defines A0 as 1 square metre with sides in the ratio 1 : √2 (approximately 841 × 1189 mm). Each subsequent size is half the previous one cut across the long dimension: A1 is half of A0 (594 × 841 mm), A2 is half of A1, and so on. The √2 ratio is chosen so that halving always produces the same ratio — a useful property for scaling because the same image can be placed on either sheet and the proportions are preserved. The ISO B and C series follow the same geometric progression but start from different base dimensions.` },
    ]},
    { heading: "", subHeading: "Why is JIS B slightly larger than ISO B?", content: [
      { type: "paragraph", text: `The JIS B-series predates the ISO standard and was defined independently by Japan from a different geometric base. JIS-B0 is 1030 × 1456 mm while ISO-B0 is 1000 × 1414 mm — JIS is about 3% wider and 3% taller at each size, which means JIS and ISO B sheets are not interchangeable for printing. The tool includes both series, clearly labelled, so the difference is visible in the overlay rather than discovered at the printer.` },
    ]},
  ],
};

export const cadSeoBatch6: Record<string, ToolSeo> = {
  "cad-grid-planner": cad_grid_plannerSeo,
  "chip-load-calculator": chip_load_calculatorSeo,
  "cnc-material-thickness-guide": cnc_material_thickness_guideSeo,
  "g-code-reference-viewer": g_code_reference_viewerSeo,
  "laser-cutter-power-reference": laser_cutter_power_referenceSeo,
  "line-weight-manager": line_weight_managerSeo,
  "machining-operation-selector": machining_operation_selectorSeo,
  "material-cutting-reference": material_cutting_referenceSeo,
  "scale-bar-tool": scale_bar_toolSeo,
  "scale-paper-tool": scale_paper_toolSeo,
  "tooling-library-browser": tooling_library_browserSeo,
  "waterjet-cutting-reference": waterjet_cutting_referenceSeo,
};
