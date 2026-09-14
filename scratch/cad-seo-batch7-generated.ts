const area_calculator_polygonSeo: ToolSeo = {
  sections: [
    { heading: "What is Area Calculator (polygon)", content: [
      { type: "paragraph", text: `Area Calculator (polygon) computes the enclosed area of any closed polygon from its vertex coordinates using the shoelace formula: area equals half the absolute value of the sum over every edge of x-sub-i times y-sub-i-plus-1 minus x-sub-i-plus-1 times y-sub-i. You type the X and Y coordinates of each corner, the polygon is closed automatically back to the first vertex, and the tool returns the area, the perimeter, the winding direction and the vertex count.` },
      { type: "paragraph", text: `The winding direction is the sign of the raw shoelace sum before the absolute value: a positive sum means the vertices were entered counter-clockwise, which is the standard CAD convention, and a negative sum means clockwise. The unit selector covers millimetres, centimetres, metres, inches and feet and only changes how the area is labelled — a 600 square millimetre answer simply becomes the same number in whatever unit you picked, squared. The polygon can be convex or concave; the formula handles both without special cases.` },
    ]},
    { heading: "How to Use Area Calculator (polygon)", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Pick the Unit — millimetres, centimetres, metres, inches or feet. All vertex coordinates are interpreted in that unit.`,
        `<strong>Step 2:</strong> Enter the X and Y coordinates of each polygon corner in the vertex list. The default example is the triangle (0,0), (30,0), (0,40).`,
        `<strong>Step 3:</strong> Press + Add vertex for every corner beyond the starting three, and − Remove to take one back off if you added too many.`,
        `<strong>Step 4:</strong> Read the Result panel: Area, Perimeter, Winding and Vertices. The winding tells you whether your vertex order is clockwise or counter-clockwise.`,
        `<strong>Step 5:</strong> Sanity-check a known case: the default triangle must return an area of 600 and a perimeter of 120, and a rectangle with corners (0,0), (100,0), (100,50), (0,50) must return 5000.`,
      ]},
      { type: "paragraph", text: `Vertex order matters only for the winding sign, never for the area or perimeter. Entering the same four corners clockwise gives the identical area with a CW reading, so you never have to re-type a shape because you walked it the wrong way round.` },
    ]},
    { heading: "Why Use Area Calculator (polygon)", content: [
      { type: "paragraph", text: `Irregular outlines are everywhere in fabrication — laser-cut profiles, gaskets, site ponds, concrete slabs with notches — and none of them answer to a rectangle formula. The shoelace method is the same arithmetic a CAD system uses to report a closed region's area, so the number this tool returns matches the model rather than an approximation from counting grid squares or splitting the shape into trapezoids by hand.` },
      { type: "paragraph", text: `The perimeter and winding outputs make the tool useful beyond the area itself. The perimeter feeds edge-rolling, trim and weld-length quantities, and the winding direction matters when you are checking the vertex order of a boundary you exported from another program — most CAM and GIS workflows require counter-clockwise ordering for outer boundaries. Because everything runs locally in the browser, you can check a quantity without exporting the model or licensing another package.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Do I need to repeat the first vertex at the end of the list?", content: [
      { type: "paragraph", text: `No. The polygon is closed automatically — the last vertex connects back to the first, exactly as it does in the perimeter tool. A triangle needs three vertices, not four. Repeating the first vertex creates a zero-length closing edge, which leaves the area unchanged but makes the vertex count misleading.` },
    ]},
    { heading: "", subHeading: "Why does the default triangle return 600?", content: [
      { type: "paragraph", text: `The shoelace sum for (0,0), (30,0), (0,40) is 0 times 0 minus 30 times 0, plus 30 times 40 minus 0 times 0, plus 0 times 0 minus 0 times 40, which works out to 1200. Half of that is 600, and because the sum is positive the winding reads CCW. This is the classic right-triangle check: the same shape as a 30 by 40 rectangle split on its diagonal, which has half the rectangle's 2400 square units.` },
    ]},
    { heading: "", subHeading: "Does the order of the vertices change the area?", content: [
      { type: "paragraph", text: `No — only the winding sign flips. Entering the same boundary clockwise produces the same area and perimeter with a CW reading. If your winding comes out opposite to what your drawing convention expects, the vertices are simply entered in the reverse order, and the numbers you care about have not changed.` },
    ]},
    { heading: "", subHeading: "Does the formula work for concave polygons?", content: [
      { type: "paragraph", text: `Yes. The shoelace formula sums signed edge contributions, so a notch subtracts exactly the region it encloses — concave and convex shapes both give the true enclosed area with no special handling. This is the same reason the perimeter behaves independently: a deep notch removes area but keeps its full boundary length.` },
    ]},
    { heading: "", subHeading: "What units is the area reported in?", content: [
      { type: "paragraph", text: `The area is the square of the selected unit — millimetres squared, metres squared, inches squared and so on. If you need to compare quantities measured in different units, convert the coordinates first using the CAD Unit Converter, then run the area check, because squaring makes unit errors twice as costly: a 25.4 factor becomes a 645 factor in the area.` },
    ]},
  ],
};

const angle_bisector_toolSeo: ToolSeo = {
  sections: [
    { heading: "What is Angle Bisector Tool", content: [
      { type: "paragraph", text: `Angle Bisector Tool finds the bisector of an angle two ways. In Angle value mode you type the angle and it returns the bisector at half that angle, plus the bisector of the reflex sector, which sits 180 degrees opposite. In Three points mode you enter two points and a vertex — A, B and C with B as the corner — and the tool computes the interior angle at B from the two arm vectors, the half-angle, and the direction of the bisector measured counter-clockwise from the positive X axis.` },
      { type: "paragraph", text: `The three-point bisector direction comes from adding the two unit vectors along the arms: the bisector of an angle is the ray that makes equal angles with both sides, and the normalised sum of two unit vectors points exactly along it. The default example — A at (1,0), B at (0,0), C at (0,1) — is a 90 degree corner whose bisector runs at 45 degrees, the classic half-of-a-right-angle check.` },
    ]},
    { heading: "How to Use Angle Bisector Tool", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Choose the Mode — Three points for angles defined by geometry, or Angle value for a plain angle you already know.`,
        `<strong>Step 2:</strong> In three-point mode, enter the X and Y coordinates of A, B and C. B is the vertex — the corner of the angle — and A and C are any point on each arm.`,
        `<strong>Step 3:</strong> In angle-value mode, enter the angle in degrees, from 0 to 360. Values above 360 are normalised onto the circle.`,
        `<strong>Step 4:</strong> Read the Result panel: the interior angle at the vertex, the half-angle, the bisector direction from the +X axis, and the reflex-sector bisector.`,
        `<strong>Step 5:</strong> Verify the default: A(1,0), B(0,0), C(0,1) must give a 90 degree angle, a 45 degree half-angle and a 45 degree bisector.`,
      ]},
      { type: "paragraph", text: `Angles are measured counter-clockwise from the positive X axis and normalised to 0–360 degrees, so a point straight above the vertex reads 90 degrees rather than a negative number. The reflex-sector bisector is the ray that splits the large sector — for a 90 degree corner it lies at 225 degrees, half of the 270 degree sector that wraps from the second arm back through 180 to the first.` },
    ]},
    { heading: "Why Use Angle Bisector Tool", content: [
      { type: "paragraph", text: `Bisectors are constant drawing chores: centrelines for tapped-hole patterns, the mid-line of a chamfer or roof valley, angular dimension placement, and the angle at which a feature must be rotated to face between two reference edges. Working from coordinates removes the protractor entirely — the direction is exact, not read off a printed drawing at the precision a scale can manage.` },
      { type: "paragraph", text: `The three-point mode is what makes it a CAD tool rather than a calculator: coordinates come straight from the model, and the answer is an angle from the drawing's own X axis, which is exactly the rotation value a CAD command asks for. When you only need to halve a known angle, angle-value mode answers in one field, and the reflex output covers the other side of the corner without a second calculation.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why is the bisector direction measured from the +X axis instead of north?", content: [
      { type: "paragraph", text: `CAD and Cartesian coordinate systems treat the positive X axis as zero and measure counter-clockwise, which is the convention this tool follows. Survey bearings are measured clockwise from north instead. If you are converting a result to a survey bearing, subtract the reported angle from 90 degrees for the first quadrant, then adjust per quadrant — the value here is the drawing angle, not a compass angle.` },
    ]},
    { heading: "", subHeading: "What happens if I enter the two points in the reverse order?", content: [
      { type: "paragraph", text: `Swapping A and C leaves the interior angle exactly the same — the angle between two lines is symmetric — and the bisector direction is unchanged too, because the bisector ray is the same line either way. The angle at B is computed from both arms, so neither endpoint is special beyond defining the two directions.` },
    ]},
    { heading: "", subHeading: "Can the tool bisect an angle larger than 180 degrees?", content: [
      { type: "paragraph", text: `The interior angle at a vertex is always the smaller angle between the two arms, from 0 to 180 degrees, so the bisector it reports is always within that sector. The reflex-sector bisector covers the large side: it is exactly 180 degrees opposite the interior bisector, splitting the reflex sector in half. Use the reflex output whenever your feature lies on the outside of the corner.` },
    ]},
    { heading: "", subHeading: "What does the angle-value mode do with an angle like 450 degrees?", content: [
      { type: "paragraph", text: `It normalises the input onto the 0 to 360 degree circle before bisecting, so 450 degrees is treated as 90 degrees and reports a 45 degree bisector. This keeps the tool forgiving of inputs that came from wrapped angle arithmetic, such as a rotation that accumulated past a full turn.` },
    ]},
  ],
};

const coordinate_input_toolSeo: ToolSeo = {
  sections: [
    { heading: "What is Coordinate Input Tool", content: [
      { type: "paragraph", text: `Coordinate Input Tool converts between the two coordinate systems a CAD user meets daily: Cartesian (X and Y) and polar (radius and angle). In Cartesian mode you enter X and Y and it returns the radius — the square root of X squared plus Y squared — and the angle from the positive X axis computed with the two-argument arctangent, normalised to a full 0 to 360 degree circle, plus the equivalent signed angle in the minus 180 to 180 range and the quadrant.` },
      { type: "paragraph", text: `In polar mode the conversion runs the other way: X is the radius times the cosine of the angle and Y is the radius times the sine, with the angle interpreted in degrees. The unit selector covers millimetres, centimetres, metres, inches and feet and labels the linear outputs — the radius in Cartesian mode and X and Y in polar mode — while angles are always in degrees.` },
    ]},
    { heading: "How to Use Coordinate Input Tool", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Choose the Conversion direction — Cartesian to Polar, or Polar to Cartesian. The input fields switch to match.`,
        `<strong>Step 2:</strong> In Cartesian mode enter X and Y; in polar mode enter the radius and the angle in degrees. The angle can be negative or above 360 — it is normalised automatically.`,
        `<strong>Step 3:</strong> Pick the Unit so the linear result is labelled correctly. Angles are always degrees.`,
        `<strong>Step 4:</strong> Read the Result panel: in Cartesian mode the radius, the 0–360 angle, the signed −180 to 180 angle and the quadrant; in polar mode the X and Y values.`,
        `<strong>Step 5:</strong> Check the classic case: (30, 40) must return r = 50 and θ = 53.13 degrees, and entering r = 50 with θ = 53.13 must return (30, 40).`,
      ]},
      { type: "paragraph", text: `The quadrant row is the fastest sanity check: a point in the third quadrant — both coordinates negative — must report an angle between 180 and 270 degrees, so if your answer comes out near 53 degrees for (−30, −40) something is wrong with the input order. The signed angle output covers users whose workflow expects bearings expressed in the minus 180 to plus 180 convention.` },
    ]},
    { heading: "Why Use Coordinate Input Tool", content: [
      { type: "paragraph", text: `CAD tools mix the two systems constantly: hole tables and point arrays are Cartesian, while rotation, polar array spacing, and features placed by radius and angle are polar. Converting by hand means remembering which quadrant flips the sign of the sine and cosine, which is exactly where 180-degree errors are born — a point that should land at (−30, 40) lands at (30, 40) and the part is mirrored.` },
      { type: "paragraph", text: `The tool also earns its keep reversing the other way: reading a radius-and-angle callout off a drawing and typing it into a Cartesian-based parametric model, or turning a measured X/Y deviation into the radius that a dial indicator or a true-position check expects. Because it runs in the browser with no upload, you can convert dimensions for proprietary parts without sending geometry anywhere.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why does (−30, −40) give 233.13 degrees and not 53.13?", content: [
      { type: "paragraph", text: `Because the point is in the third quadrant, where both coordinates are negative. The two-argument arctangent places the angle by the signs of both inputs: 53.13 degrees describes the first quadrant, and the third-quadrant point is exactly 180 degrees around the circle, at 233.13 degrees. This is the quadrant mistake the signed-angle output exists to catch.` },
    ]},
    { heading: "", subHeading: "What is the difference between the 0–360 and the −180 to 180 angle?", content: [
      { type: "paragraph", text: `They are the same direction written two ways. An angle of 300 degrees equals minus 60 degrees — both point to the same ray. Some CAD commands and inspection reports expect the wrapped form and others the signed form, so the tool shows both rather than making you convert mentally. Choose the row that matches what your downstream consumer accepts.` },
    ]},
    { heading: "", subHeading: "Can the tool convert an angle given in radians?", content: [
      { type: "paragraph", text: `Not directly — the angle fields are in degrees. To convert, multiply the radian value by 180 divided by pi before entering it: 1 radian is about 57.2958 degrees, so a common quarter-turn of pi over 2 radians becomes 90 degrees. The tool then treats the result like any other degree input.` },
    ]},
    { heading: "", subHeading: "What happens if I enter a negative radius in polar mode?", content: [
      { type: "paragraph", text: `The conversion still runs, and the math works: a negative radius points in the opposite direction, which is the same as adding 180 degrees to a positive radius of the same magnitude. If you did not intend that, flip the sign of the angle instead — the tool accepts either, so check the X and Y signs in the result before using them.` },
    ]},
  ],
};

const tolerance_stack_up_analyzerSeo: ToolSeo = {
  sections: [
    { heading: "What is Tolerance Stack-Up Analyzer", content: [
      { type: "paragraph", text: `Tolerance Stack-Up Analyzer adds up a linear chain of dimensions along one axis and reports the two ways a stack can be evaluated. The worst-case method adds every tolerance to the nominal sum, giving the absolute minimum and maximum the stack can reach when every part is at its extreme. The statistical method — root sum of squares, or RSS — takes the square root of the sum of the squared tolerances, which is the realistic spread when the part variations are independent.` },
      { type: "paragraph", text: `Each row holds a part name, a nominal dimension and a symmetric plus-or-minus tolerance. The tool reports the stack nominal, the worst-case minimum and maximum with the total spread, the RSS minimum and maximum with its spread, and the RSS saving — how much narrower the statistical prediction is than the worst case, in units and as a percentage. The default example stacks a 50 millimetre housing, a 10 millimetre spacer and a 25 millimetre shaft.` },
    ]},
    { heading: "How to Use Tolerance Stack-Up Analyzer", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Enter each dimension in the chain as a row: a part name, a nominal value and a symmetric ± tolerance. All values are in the same unit — the tool does not label units, so keep them consistent.`,
        `<strong>Step 2:</strong> Press + Add dimension for every link in the chain, and remove a row with its ✕ button or − Remove last when the list is too long.`,
        `<strong>Step 3:</strong> Read the worst-case block: the nominal stack, the minimum and maximum, and the ± spread.`,
        `<strong>Step 4:</strong> Read the RSS block: the statistical minimum and maximum and its spread.`,
        `<strong>Step 5:</strong> Compare the two spreads with the RSS saving row — the default stack of 50±0.3, 10±0.1 and 25±0.2 must show a nominal of 85, worst case 84.4 to 85.6, and RSS 84.626 to 85.374.`,
      ]},
      { type: "paragraph", text: `The worst case is the conservative answer: if the assembly must close under every possible combination of parts, design to it. The RSS answer is the economic one — it is what quality departments actually observe when parts come from stable processes — and the saving row tells you how much tolerance budget the statistical view frees up.` },
    ]},
    { heading: "Why Use Tolerance Stack-Up Analyzer", content: [
      { type: "paragraph", text: `Every assembly that closes on paper only because the paper added the nominal dimensions is one field failure away from being wrong. Stack analysis is how a designer knows whether a bearing fits, a cover seals, or a pin engages over the full production range — and doing it by hand is exactly the kind of repeated arithmetic where a single transposed tolerance poisons the answer with no error message.` },
      { type: "paragraph", text: `The tool's real value is the comparison it forces: worst-case spread versus RSS spread tells you whether you are over-constraining the parts. When the worst case fails the requirement but the RSS case passes comfortably, that is the classic signal for a statistical tolerance — parts are cheap, the assembly is safe, and only the combination of every worst-case part at once would break it.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why does the default stack give RSS limits of 84.626 and 85.374?", content: [
      { type: "paragraph", text: `The nominal sum of 50, 10 and 25 is 85. The RSS spread is the square root of 0.3 squared plus 0.1 squared plus 0.2 squared, which works out to the square root of 0.14, or about 0.374. Adding and subtracting that from 85 gives 84.626 and 85.374 — noticeably tighter than the worst-case spread of 0.6, which is the whole point of the statistical method.` },
    ]},
    { heading: "", subHeading: "When is the RSS method safe to use?", content: [
      { type: "paragraph", text: `RSS assumes the part dimensions are statistically independent — that a long housing is no more likely to appear with a long spacer. That holds for parts from different processes or different suppliers, and breaks when parts share a cause, like one batch cut from the same bar or a single fixture drifting. When in doubt, or when a failure means scrapping the assembly, design to the worst case instead.` },
    ]},
    { heading: "", subHeading: "Does the tool handle asymmetric tolerances?", content: [
      { type: "paragraph", text: `No — each row takes a symmetric plus-or-minus value. An asymmetric tolerance such as plus 0.2 minus 0.1 must first be converted to its symmetric equivalent: shift the nominal by the mean shift and keep the half-width. For a tolerance of plus 0.2 minus 0.1, use the nominal plus 0.05 with a tolerance of 0.15. That conversion is exact for both the worst-case and RSS sums.` },
    ]},
    { heading: "", subHeading: "How do I include a dimension that acts in the opposite direction?", content: [
      { type: "paragraph", text: `Enter its nominal as negative — the sum handles direction by sign. A clearance that subtracts 2 millimetres from the stack is entered as a nominal of minus 2 with its positive tolerance. The tolerance itself is always taken as absolute, so a minus 2 plus-or-minus 0.1 row contributes minus 2 to the nominal and 0.1 to both spread calculations.` },
    ]},
  ],
};

const thread_fit_calculatorSeo: ToolSeo = {
  sections: [
    { heading: "What is Thread Fit Calculator", content: [
      { type: "paragraph", text: `Thread Fit Calculator works out the limit dimensions and the resulting fit of an ISO metric screw thread pair from its tolerance classes. You enter the nominal diameter, the pitch, the internal class such as 6H and the external class such as 6g, and the tool computes the basic pitch and minor diameters, the allowance, the tolerance widths, and the full set of limit diameters: external major and pitch, internal pitch and minor, plus the minimum and maximum pitch-diameter clearance of the fit.` },
      { type: "paragraph", text: `The arithmetic follows ISO 965-1: the basic pitch diameter is the nominal minus 0.6495 times the pitch, the basic minor diameter is the nominal minus 1.0825 times the pitch, grade-six tolerance widths come from the standard's formulae in micrometres — 90 times pitch to the 0.4 power times the diameter-range mean to the 0.1 for the pitch diameter, 180 times pitch to the two-thirds minus 3.15 over the square root of pitch for the external major, and 230 times pitch to the 0.7 for the internal minor — scaled by the standard grade multipliers. Fundamental deviations follow the position letters: h and H at zero, g per the standard's table, and f and e from the 30-plus-11-pitch and 50-plus-11-pitch formulae.` },
    ]},
    { heading: "How to Use Thread Fit Calculator", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Enter the nominal diameter in millimetres — 12 for an M12 thread.`,
        `<strong>Step 2:</strong> Pick the Pitch from the standard series, from 0.8 to 3 millimetres. The coarse pitch for M12 is 1.75.`,
        `<strong>Step 3:</strong> Pick the internal class — 4H through 8H, with 6H the commercial default for tapped holes.`,
        `<strong>Step 4:</strong> Pick the external class — grades 4 through 8 in positions h, g, f and e, with 6g the commercial default for bolts.`,
        `<strong>Step 5:</strong> Read the result: the allowance, the external major and pitch limits, the internal pitch and minor limits, and the minimum and maximum clearance of the fit.`,
      ]},
      { type: "paragraph", text: `The default combination — M12 by 1.75 with a 6H internal and 6g external class — is the most common commercial fit in the world: an uncoated metric bolt in a tapped hole. The fit row reports whether the pair is a clearance fit, and the two clearance rows give the pitch-diameter play at best and worst material condition.` },
    ]},
    { heading: "Why Use Thread Fit Calculator", content: [
      { type: "paragraph", text: `Thread fits decide whether a bolt drops into a tapped hole, whether a coating still assembles after plating, and whether a thread-milling cutter can hold the tolerance a drawing calls out. The default 6H/6g is right for general commercial use, but plating, heat treatment and precision work all move the classes — 6e and 6f exist to absorb coating thickness, and grades 4 and 5 exist for gauge-quality threads.` },
      { type: "paragraph", text: `The tool is equally useful reading a drawing backwards: a callout such as M16 by 2, 6H/6g, gives you the exact material limits the machinist and the inspection department are working to, and the clearance rows tell you how loose the pair actually is — the number behind every thread-fit judgement you will make on the shop floor.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What does 6H/6g actually mean?", content: [
      { type: "paragraph", text: `Two tolerance classes separated by a slash: 6H for the internal thread and 6g for the external. The 6 is the tolerance grade — the width of the permitted variation — and the letter is the position, the allowance side. H and h sit at the basic profile with zero allowance, and g, f and e move the external thread smaller to guarantee clearance. For M12 by 1.75, the g position carries a 34 micrometre allowance, so the external pitch diameter tops out at 10.829 millimetres against a basic value of 10.863.` },
    ]},
    { heading: "", subHeading: "Why is the external pitch diameter maximum smaller than the basic value?", content: [
      { type: "paragraph", text: `Because the position letter g applies a fundamental deviation that shrinks the external thread to guarantee clearance against an H internal thread. For M12 by 1.75 the allowance is 34 micrometres, so the pitch diameter can never exceed 10.829 millimetres even at maximum material condition. The internal thread starts exactly at the basic 10.863, which is what guarantees the pair always has at least a small clearance rather than an interference fit.` },
    ]},
    { heading: "", subHeading: "What is the difference between 6g and 6h?", content: [
      { type: "paragraph", text: `Only the allowance. Both use grade 6 widths, but h has a zero fundamental deviation — the thread can reach the full basic size — while g sits below it. The h position is used for precision fits and maximum strength, and g is the general-purpose commercial position that gives plating and assembly clearance. Everything else about the two classes computes identically.` },
    ]},
    { heading: "", subHeading: "How do I allow for plating on a thread?", content: [
      { type: "paragraph", text: `Pick an external position with a larger allowance than g: f and e exist exactly for coatings. A typical zinc plating of 5 to 15 micrometres fits a 6f or 6e thread, and thicker hot-dip galvanizing needs the special allowances of ISO 965-4. The rule is that tolerances apply before coating, and the plated thread must still stay inside the basic profile after coating — which is what the extra allowance buys.` },
    ]},
    { heading: "", subHeading: "Why might the numbers differ slightly from my handbook table?", content: [
      { type: "paragraph", text: `The tool computes the limits from the ISO 965-1 tolerance formulae directly, while printed handbooks and ISO 965-2 publish the rounded results of those formulae. The differences are a few micrometres at most. If the number is feeding a gauge design or a thread-limit inspection, cross-check the computed limits against a published table for the exact size and class first.` },
    ]},
  ],
};

const drawing_title_block_generatorSeo: ToolSeo = {
  sections: [
    { heading: "What is Drawing Title Block Generator", content: [
      { type: "paragraph", text: `Drawing Title Block Generator composes the bottom-right title block of a technical drawing from its metadata. You enter the company, drawing title, drawing number, draughtsperson, date, scale, sheet and sheet count, units and material, and the tool renders a preview block in the ISO 7200 spirit — identification fields on the left, administrative fields on the right — plus a copyable plain-text block you can paste into a CAD text entity or a PDM notes field.` },
      { type: "paragraph", text: `The preview is drawn at screen scale, not sheet scale: it is a layout check, not a plot. Every field updates live as you type, so the block can be iterated until the title fits, the drawing number reads cleanly and the sheet count is right, before a single entity is placed in the CAD file.` },
    ]},
    { heading: "How to Use Drawing Title Block Generator", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Enter the company or organisation name — the identification field that anchors the block.`,
        `<strong>Step 2:</strong> Enter the drawing title, the drawing number, and the draughtsperson's name.`,
        `<strong>Step 3:</strong> Set the date, material, and the scale from the standard series 1:1 through 1:100, or keep the defaults.`,
        `<strong>Step 4:</strong> Enter the sheet number and the total sheet count, and pick the drawing units.`,
        `<strong>Step 5:</strong> Review the live preview, then press Copy text block to place the same fields into your CAD title block as text.`,
      ]},
      { type: "paragraph", text: `The sheet row renders as sheet of total — for example 2 of 5 — which is the form most drawing registers expect, so the fields are entered separately and joined in the block. Empty fields render as an em dash in the preview, which keeps the layout honest during drafting.` },
    ]},
    { heading: "Why Use Drawing Title Block Generator", content: [
      { type: "paragraph", text: `The title block is the most-edited part of a drawing set: every revision bumps the date, every new sheet changes the count, and every drawing carries the same company block. Generating the metadata once, in one place, removes the typos that inspection and manufacturing teams actually chase — a wrong drawing number on a released sheet is a quality finding, not a cosmetic one.` },
      { type: "paragraph", text: `The ISO 7200-style split between identification and administrative fields is also a PDM convention: company, title and number are the fields that route the document, while scale, sheet, units and material describe the content. Keeping them visually separate in the block matches how document-management systems index drawings, which makes the block easier to map when you are setting up a new CAD template or a PDM import.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does the preview match a real ISO 7200 title block?", content: [
      { type: "paragraph", text: `It follows the ISO 7200 idea rather than the letter: identification fields on the left, administrative fields on the right, with the company block spanning the top. The exact layout, cell sizes and border widths in the standard depend on sheet size and are usually redefined by company templates anyway. Use this tool to settle the content, then lay the fields out to your own template's geometry in CAD.` },
    ]},
    { heading: "", subHeading: "What does the copy button actually copy?", content: [
      { type: "paragraph", text: `A plain-text block with one field per line — Company, Title, Drawing number, Drawn by, Date, Scale, Sheet, Units and Material. It is meant for pasting into a CAD text entity, an Excel register, or a PDM description field. The status line confirms how many fields were copied; if the browser blocks clipboard access, select the text manually from the status message.` },
    ]},
    { heading: "", subHeading: "How should sheet numbering work on a multi-sheet set?", content: [
      { type: "paragraph", text: `Enter the current sheet as the sheet number and the total set size as the sheets count. The block renders sheet of total, so sheet 3 of 7 tells a reader exactly where they are in the set. Keep the drawing number identical across the set and vary only the sheet fields — that is the convention registers and PDM systems expect.` },
    ]},
    { heading: "", subHeading: "Can I save the generated block for reuse?", content: [
      { type: "paragraph", text: `The tool keeps nothing between visits — it runs entirely in your browser and state is lost when you close the tab, by design. For reuse, keep the copy button's text block in your CAD title block template, where the fields are already placed, and only type values into the template's attributes on each new drawing.` },
    ]},
  ],
};

const parts_list_bom_builderSeo: ToolSeo = {
  sections: [
    { heading: "What is Parts List (BOM) Builder", content: [
      { type: "paragraph", text: `Parts List (BOM) Builder composes a bill of materials as an editable table: part name, material, quantity, unit and notes per row, with item numbers assigned automatically in row order. It reports the line-item count and the total quantity across all rows, and produces a copyable CSV export in the standard Item, Part, Material, Qty, Unit, Notes format that spreadsheet and PDM import tools accept.` },
      { type: "paragraph", text: `Rows with an empty part name are excluded from the totals and the export, so a row you started but did not finish never corrupts the count. The CSV preview updates live and handles the quoting rules properly — fields containing commas, quotes or newlines are wrapped in quotes with embedded quotes doubled, so the export survives round-tripping through any spreadsheet.` },
    ]},
    { heading: "How to Use Parts List (BOM) Builder", content: [
      { type: "list", items: [
        `<strong>Step 1:</strong> Enter the part name, material, quantity, unit and notes for each line item. Three example rows are pre-filled.`,
        `<strong>Step 2:</strong> Press + Add row for every part beyond the current rows, and remove a row with its ✕ button or − Remove last.`,
        `<strong>Step 3:</strong> Read the Totals panel: the line-item count and the total quantity across all rows.`,
        `<strong>Step 4:</strong> Review the CSV preview — it updates with every keystroke and shows exactly what will be exported.`,
        `<strong>Step 5:</strong> Press Copy CSV to put the export on the clipboard, then paste it into Excel, your PDM system or an email.`,
      ]},
      { type: "paragraph", text: `Item numbers are assigned automatically as 1, 2, 3 in row order and are never stored in the rows themselves, so deleting a middle row renumbers cleanly with no gaps. The default rows — a machined bracket with two pieces and its two fastener rows with eight pieces each — demonstrate the classic fastener-plus-part structure most small assemblies follow.` },
    ]},
    { heading: "Why Use Parts List (BOM) Builder", content: [
      { type: "paragraph", text: `A bill of materials is the document every other downstream process reads: purchasing orders from it, the machine shop kites material from it, and assembly counts from it. Building it in a spreadsheet is fine until someone sorts a column and the quantities stop matching their rows — the classic silent BOM failure. This tool keeps the structure fixed and produces the same export format every time.` },
      { type: "paragraph", text: `The total quantity row is the part that is usually missing from hand-built lists — the sum that tells you at a glance whether you have ordered enough fasteners. And because the tool runs in the browser with no upload, you can build a BOM for a proprietary assembly without the parts list leaving your machine.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why does the default BOM show a total quantity of 18?", content: [
      { type: "paragraph", text: `The three pre-filled rows carry quantities of 2, 8 and 8: one machined bracket and two fastener rows of eight pieces each. Two plus eight plus eight works out to 18 pieces in total across three line items. Change any quantity and both the total and the CSV update immediately.` },
    ]},
    { heading: "", subHeading: "What happens to rows with an empty part name?", content: [
      { type: "paragraph", text: `They are ignored by the line count, the total quantity and the CSV export. A blank row is treated as an unused slot rather than an empty line in your BOM. As soon as you type a part name, the row joins the totals — so you can leave a row open while you look up a part number without corrupting the export.` },
    ]},
    { heading: "", subHeading: "Will the CSV survive being opened in Excel?", content: [
      { type: "paragraph", text: `Yes. The export is plain comma-separated text with standard quoting: any field containing a comma, a quote or a newline is wrapped in double quotes with embedded quotes doubled, which is exactly what Excel and every other spreadsheet expects. The header row names the columns, so a straight paste or open assigns them correctly.` },
    ]},
    { heading: "", subHeading: "Can I include the same part on multiple rows?", content: [
      { type: "paragraph", text: `Yes — there is no uniqueness check, because real BOMs often list the same part twice, for example when one row tracks parts issued to assembly and another tracks spares. The total quantity simply adds both rows. If you want one row per part, keep the part name identical and the quantities will still sum correctly in the total.` },
    ]},
  ],
};
