/**
 * cad-gdt-library.test.ts — verification of the GD&T symbol library's
 * non-tool content routes (/cad/gdt index + /cad/gdt/[symbol] pages).
 * Reference content, not tools: outside the tool registry by design.
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("GD&T symbol library (non-tool content)", () => {
  test.setTimeout(60_000);

  test("index: groups all 14 symbols by category, links only symbols with pages", async ({ page }) => {
    await page.goto(`${BASE}/cad/gdt`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "GD&T Symbol Library" })).toBeVisible();

    for (const cat of ["Form tolerances", "Profile tolerances", "Orientation tolerances", "Location tolerances", "Runout tolerances"]) {
      await expect(page.getByRole("heading", { name: cat, exact: true })).toBeVisible();
    }
    // All 14 characteristic symbols listed by name (Pilot Position + 13 others).
    for (const name of ["Straightness", "Flatness", "Circularity (roundness)", "Cylindricity", "Profile of a line", "Profile of a surface", "Angularity", "Perpendicularity", "Parallelism", "Position", "Concentricity", "Symmetry", "Circular runout", "Total runout"]) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
    // Long-form pages: all 14 symbols now have guides (pilot + 4 batches).
    const learn = page.getByRole("link", { name: /Learn Symbol/ });
    await expect(learn).toHaveCount(14);
    for (const href of [
      "/cad/gdt/position",
      "/cad/gdt/straightness",
      "/cad/gdt/flatness",
      "/cad/gdt/circularity",
      "/cad/gdt/cylindricity",
      "/cad/gdt/profile-line",
      "/cad/gdt/profile-surface",
      "/cad/gdt/angularity",
      "/cad/gdt/perpendicularity",
      "/cad/gdt/parallelism",
      "/cad/gdt/concentricity",
      "/cad/gdt/symmetry",
      "/cad/gdt/runout",
      "/cad/gdt/total-runout",
    ]) {
      const link = page.locator(`a[href="${href}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toContainText("Learn Symbol");
    }
  });

  test("index: concept section lists all 15 modifiers/rules/datums with pages", async ({ page }) => {
    await page.goto(`${BASE}/cad/gdt`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Modifiers, rules & datums", exact: true })).toBeVisible();
    for (const name of [
      "Maximum Material Condition (MMC)",
      "Least Material Condition (LMC)",
      "Regardless of Feature Size (RFS)",
      "Feature Control Frame",
      "Projected Tolerance Zone (Ⓟ)",
      "Datum Feature",
      "Datum Target",
      "Rule #1 — Envelope Principle",
      "Independency (Ⓘ)",
      "Envelope Requirement (Ⓔ) — ISO Only",
      "Unequally Disposed Profile (Ⓤ)",
      "Continuous Feature (CF)",
      "Free State (Ⓕ)",
      "Restrained Condition Note",
      "Tangent Plane (Ⓣ)",
    ]) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
    // All 15 concept pages + 17 notation pages exist and are linked from the
    // index (batch 5 added the general-dimensioning section, which also uses
    // the "Learn More" link label; tranche 2 added 9 hole-callout/value
    // qualifiers to tranche 1's 8 — Square and Dimension Origin were already
    // in tranche 1, so the library totals 14 + 15 + 17 = 46 pages).
    const more = page.getByRole("link", { name: /Learn More/ });
    await expect(more).toHaveCount(32);
    for (const href of [
      "/cad/gdt/mmc",
      "/cad/gdt/lmc",
      "/cad/gdt/rfs",
      "/cad/gdt/feature-control-frame",
      "/cad/gdt/projected-zone",
      "/cad/gdt/datum-feature",
      "/cad/gdt/datum-target",
      "/cad/gdt/rule-1",
      "/cad/gdt/independency",
      "/cad/gdt/envelope-requirement",
      "/cad/gdt/unequally-disposed-profile",
      "/cad/gdt/continuous-feature",
      "/cad/gdt/free-state",
      "/cad/gdt/restrained-condition",
      "/cad/gdt/tangent-plane",
    ]) {
      const link = page.locator(`a[href="${href}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toContainText("Learn More");
    }
  });

  test("index: general dimensioning notation section lists all 17 entries", async ({ page }) => {
    await page.goto(`${BASE}/cad/gdt`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "General dimensioning notation", exact: true })).toBeVisible();
    for (const name of [
      "Basic Dimension",
      "Reference Dimension",
      "Dimension Not to Scale",
      "Diameter (⌀)",
      "Radius (R)",
      "Controlled Radius (CR)",
      "Square (□)",
      "Dimension Origin",
      "Depth Symbol (Depth/Deep)",
      "Counterbore (⌴)",
      "Spotface",
      "Countersink (⌵)",
      "Conical Taper",
      "Slope",
      "Arc Length",
      "Parting Line",
      "Multiple Identical Features (#X)",
    ]) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
    for (const href of [
      "/cad/gdt/basic-dimension",
      "/cad/gdt/reference-dimension",
      "/cad/gdt/dimension-not-to-scale",
      "/cad/gdt/diameter",
      "/cad/gdt/radius",
      "/cad/gdt/controlled-radius",
      "/cad/gdt/square",
      "/cad/gdt/dimension-origin",
      "/cad/gdt/depth",
      "/cad/gdt/counterbore",
      "/cad/gdt/spotface",
      "/cad/gdt/countersink",
      "/cad/gdt/conical-taper",
      "/cad/gdt/slope",
      "/cad/gdt/arc-length",
      "/cad/gdt/parting-line",
      "/cad/gdt/multiple-identical-features",
    ]) {
      const link = page.locator(`a[href="${href}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toContainText("Learn More");
    }
  });

  test("position page: full six-section guide renders", async ({ page }) => {
    await page.goto(`${BASE}/cad/gdt/position`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "True Position — Position Tolerance" })).toBeVisible();
    for (const h of ["Definition", "Why a circular zone instead of ± coordinates", "MMC and bonus tolerance", "Reading a feature control frame", "Measurement", "When to use it"]) {
      await expect(page.getByRole("heading", { name: h, exact: true })).toBeVisible();
    }
    // Feature-control-frame reading renders as inline code.
    await expect(page.locator("code", { hasText: "⌖ ⌀0.5 Ⓜ A B C" })).toBeVisible();
    // All three teaching diagrams render (zone, FCF breakdown, bonus tolerance).
    await expect(page.getByRole("img", { name: /Position tolerance zone diagram/ })).toBeVisible();
    await expect(page.getByRole("img", { name: /Feature control frame diagram/ })).toBeVisible();
    await expect(page.getByRole("img", { name: /Bonus tolerance diagram/ })).toBeVisible();
    // Restructured sections use real list markup (comparison + when-to-use).
    await expect(page.locator("article ul")).toHaveCount(2);
    await expect(page.locator("article li")).toHaveCount(6);
    // Measurement section is two bold-led paragraphs.
    await expect(page.getByText("Functional gauging")).toBeVisible();
    await expect(page.getByText("CMM coordinate measurement")).toBeVisible();
    // Companion tool link, not a duplicated calculator.
    await expect(page.getByRole("link", { name: "True Position Calculator" })).toHaveAttribute("href", "/cad/true-position-calculator");
    // Link back to the library index.
    await expect(page.getByRole("link", { name: "GD&T symbol library" })).toHaveAttribute("href", "/cad/gdt");
  });

  test("position page: SEO metadata (title, description, canonical)", async ({ page }) => {
    await page.goto(`${BASE}/cad/gdt/position`, { waitUntil: "networkidle" });
    await expect(page).toHaveTitle(/True Position.*Racira/);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(50);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/cad\/gdt\/position$/);
  });

  test("unknown symbol slug 404s (every table symbol now has a guide)", async ({ page }) => {
    const res = await page.goto(`${BASE}/cad/gdt/not-a-symbol`, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(404);
  });

  const PAGES = [
    { slug: "position", title: "True Position — Position Tolerance" },
    { slug: "straightness", title: "Straightness — Form Tolerance" },
    { slug: "flatness", title: "Flatness — Form Tolerance" },
    { slug: "circularity", title: "Circularity (Roundness) — Form Tolerance" },
    { slug: "cylindricity", title: "Cylindricity — Form Tolerance" },
    { slug: "profile-line", title: "Profile of a Line — Profile Tolerance" },
    { slug: "profile-surface", title: "Profile of a Surface — Profile Tolerance" },
    { slug: "angularity", title: "Angularity — Orientation Tolerance" },
    { slug: "perpendicularity", title: "Perpendicularity — Orientation Tolerance" },
    { slug: "parallelism", title: "Parallelism — Orientation Tolerance" },
    { slug: "concentricity", title: "Concentricity — Location Tolerance" },
    { slug: "symmetry", title: "Symmetry — Location Tolerance" },
    { slug: "runout", title: "Circular Runout — Runout Tolerance" },
    { slug: "total-runout", title: "Total Runout — Runout Tolerance" },
  ] as const;

  const CONCEPT_PAGES = [
    { slug: "mmc", title: "Maximum Material Condition (MMC)" },
    { slug: "lmc", title: "Least Material Condition (LMC)" },
    { slug: "rfs", title: "Regardless of Feature Size (RFS)" },
    { slug: "feature-control-frame", title: "Feature Control Frame — Anatomy & Reading" },
    { slug: "projected-zone", title: "Projected Tolerance Zone (Ⓟ)" },
    { slug: "datum-feature", title: "Datum Feature — Feature vs. Datum" },
    { slug: "datum-target", title: "Datum Target — Points, Lines & Areas" },      { slug: "rule-1", title: "Rule #1 — The Envelope Principle" },
      { slug: "independency", title: "Independency (Ⓘ) — Opting Out of Rule #1" },
      { slug: "envelope-requirement", title: "Envelope Requirement (Ⓔ) — ISO Only" },
      { slug: "unequally-disposed-profile", title: "Unequally Disposed Profile (Ⓤ)" },
      { slug: "continuous-feature", title: "Continuous Feature (CF)" },
      { slug: "free-state", title: "Free State (Ⓕ) — Non-Rigid Parts" },
      { slug: "restrained-condition", title: "Restrained Condition Note" },
      { slug: "tangent-plane", title: "Tangent Plane (Ⓣ)" },
    ] as const;

  test("all batches: every page renders its full guide with diagrams", async ({ page }) => {
    const expectations: Record<string, { sections: string[]; diagrams: RegExp[]; fcf: string }> = {
      straightness: {
        sections: [
          "Definition",
          "Surface straightness: line elements",
          "Axis straightness: a cylindrical zone",
          "MMC and bonus tolerance (axis only)",
          "Reading a feature control frame",
          "Measurement",
          "When to use it",
        ],
        diagrams: [
          /Straightness diagram, surface application/,
          /Straightness diagram, axis application/,
          /Bonus tolerance diagram/,
          /Feature control frame diagram/,
        ],
        fcf: "Ø 0.05 Ⓜ",
      },
      flatness: {
        sections: ["Definition", "The zone: two parallel planes", "Reading a feature control frame", "Measurement", "When to use it"],
        diagrams: [/Flatness diagram/, /Feature control frame diagram/],
        fcf: "⏥ 0.2",
      },
      circularity: {
        sections: [
          "Definition",
          "The zone: two concentric circles",
          "What circularity does not control",
          "Reading a feature control frame",
          "Measurement",
          "When to use it",
        ],
        diagrams: [/Circularity diagram/, /Feature control frame diagram/],
        fcf: "○ 0.1",
      },
      cylindricity: {
        sections: [
          "Definition",
          "The zone: two coaxial cylinders",
          "Circularity vs. cylindricity",
          "Reading a feature control frame",
          "Measurement",
          "When to use it",
        ],
        diagrams: [/Cylindricity diagram/, /Feature control frame diagram/],
        fcf: "⌭ 0.1",
      },
      "profile-line": {
        sections: [
          "Definition",
          "The zone: two offset curves",
          "Datum-optional: two ways to specify it",
          "Unequal disposition of the zone",
          "Measurement",
          "When to use it",
        ],
        diagrams: [/Profile of a line diagram/, /Feature control frame comparison diagram/],
        fcf: "⌒ 0.2",
      },
      "profile-surface": {
        sections: [
          "Definition",
          "The zone: two offset surfaces",
          "Datum-optional: two ways to specify it",
          "Line vs. surface profile",
          "Measurement",
          "When to use it",
        ],
        diagrams: [/Profile of a surface diagram/, /Feature control frame comparison diagram/],
        fcf: "⌓ 0.5",
      },
      concentricity: {
        sections: [
          "Definition",
          "Why the professional consensus is to avoid it",
          "The alternatives that do the same job",
          "Reading a feature control frame",
          "Measurement",
          "When to use it",
        ],
        diagrams: [/Derived median points diagram/, /Feature control frame diagram/],
        fcf: "⌔ Ø0.1 A",
      },
      symmetry: {
        sections: [
          "Definition",
          "Why the professional consensus is to avoid it",
          "The modern replacement",
          "Reading a feature control frame",
          "Measurement",
          "When to use it",
        ],
        diagrams: [/Derived median points diagram/, /Feature control frame diagram/],
        fcf: "⌯ 0.1 A",
      },
      runout: {
        sections: [
          "Definition",
          "What one FIM reading combines",
          "Reading a feature control frame",
          "Measurement",
          "When to use it",
        ],
        diagrams: [/Runout diagram/, /Feature control frame diagram/],
        fcf: "↗ 0.05 A–B",
      },
      "total-runout": {
        sections: [
          "Definition",
          "The zone, and the cylindricity parallel",
          "Reading a feature control frame",
          "Measurement",
          "When to use it",
        ],
        diagrams: [/Runout diagram/, /Feature control frame diagram/],
        fcf: "↻ 0.05 A–B",
      },
      angularity: {
        sections: [
          "Definition",
          "The zone: two parallel planes at the basic angle",
          "One family, three symbols",
          "Reading a feature control frame",
          "Measurement",
          "When to use it",
        ],
        diagrams: [/Orientation tolerance zone diagram/, /Feature control frame diagram/],
        fcf: "∠ 0.2 A",
      },
      perpendicularity: {
        sections: [
          "Definition",
          "The zone: two parallel planes at 90° to the datum",
          "Reading a feature control frame",
          "Measurement",
          "When to use it",
        ],
        diagrams: [/Orientation tolerance zone diagram/, /Feature control frame diagram/],
        fcf: "⟂ 0.1 A",
      },
      parallelism: {
        sections: [
          "Definition",
          "The zone: two parallel planes parallel to the datum",
          "Reading a feature control frame",
          "Measurement",
          "When to use it",
        ],
        diagrams: [/Orientation tolerance zone diagram/, /Feature control frame diagram/],
        fcf: "∥ 0.1 A",
      },
    };
    for (const { slug, title } of PAGES.slice(1)) {
      await page.goto(`${BASE}/cad/gdt/${slug}`, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
      const exp = expectations[slug];
      for (const h of exp.sections) {
        await expect(page.getByRole("heading", { name: h, exact: true })).toBeVisible();
      }
      for (const name of exp.diagrams) {
        await expect(page.getByRole("img", { name })).toBeVisible();
      }
      // The feature-control-frame string renders as inline code. Profile
      // pages legitimately carry two spans (with-datum and bare), hence .first().
      await expect(page.locator("code", { hasText: exp.fcf }).first()).toBeVisible();
      // All guide pages carry real list markup in "When to use it".
      await expect(page.locator("article li").first()).toBeVisible();
    }
  });

  test("concept pages: every page renders its guide with the expected diagrams", async ({ page }) => {
    const expectations: Record<string, { sections: string[]; diagrams: RegExp[]; fcf: string }> = {
      mmc: {
        sections: ["Definition", "The MMC boundary: virtual condition", "Bonus tolerance in practice", "Where Ⓜ applies — and where it can't", "Reading a feature control frame", "Measurement", "When to use it"],
        diagrams: [/Bonus tolerance diagram/, /Feature control frame diagram/],
        fcf: "⌖ ⌀0.5 Ⓜ A B C",
      },
      lmc: {
        sections: ["Definition", "Why LMC exists: material, not fit", "Bonus tolerance from LMC", "MMC vs. LMC: which end do you want?", "Reading a feature control frame", "When to use it"],
        diagrams: [/Bonus tolerance diagram/, /Feature control frame diagram/],
        fcf: "⌖ ⌀0.5 Ⓛ A B C",
      },
      rfs: {
        sections: ["Definition", "RFS is the default — that's the part people miss", "No bonus — and no functional gauge", "RFS vs. MMC vs. LMC", "Measurement", "When to use it"],
        diagrams: [/Feature control frame diagram/],
        fcf: "⌖ ⌀0.5 A B C",
      },
      "feature-control-frame": {
        sections: ["Definition", "The compartments", "How to read one", "Common variations", "Common mistakes"],
        diagrams: [/Feature control frame diagram/],
        fcf: "⌖ ⌀0.5 Ⓜ A B C",
      },
      "projected-zone": {
        sections: ["Definition", "Why the zone needs projecting", "Reading a feature control frame", "When to use it", "Measurement"],
        diagrams: [/Projected tolerance zone diagram/, /Feature control frame diagram/],
        fcf: "⌖ ⌀0.2 Ⓟ 10 A B",
      },
      "datum-feature": {
        sections: ["Definition", "The feature vs. the datum", "Selecting datum features", "Precedence: primary, secondary, tertiary", "When the surface can't be a datum feature", "Measurement"],
        diagrams: [/Datum feature diagram/],
        fcf: "datum feature A",
      },
      "datum-target": {
        sections: ["Definition", "Why targets exist", "How targets are called out", "Establishing the datum from targets", "When to use them", "When not to"],
        diagrams: [/Datum target diagram/],
        fcf: "A1",
      },
      "rule-1": {
        sections: ["Definition", "The envelope", "What Rule #1 controls — and what it doesn't", "Rule #1 and MMC are the same boundary", "When Rule #1 does not apply", "What it means for your design"],
        diagrams: [/Envelope principle diagram/],
        fcf: "Ø10 ±0.1",
      },
      independency: {
        sections: ["Definition", "The envelope removed", "The default inversion, ASME vs. ISO", "When independency is used", "The cost of opting out"],
        diagrams: [/Envelope principle diagram/],
        fcf: "Ø10 ±0.1",
      },
      "envelope-requirement": {
        sections: ["Definition", "The default inversion", "What Ⓔ requires", "Working across standards"],
        diagrams: [/Envelope principle diagram/],
        fcf: "Ø10 ±0.1 Ⓔ",
      },
      "unequally-disposed-profile": {
        sections: ["Definition", "The two limiting cases: unilateral zones", "Why shift the zone?", "Reading a feature control frame", "ISO difference", "Measurement"],
        diagrams: [/Profile of a surface diagram/, /Feature control frame diagram/],
        fcf: "0.4 Ⓤ 0.3",
      },
      "continuous-feature": {
        sections: ["Definition", "What changes when CF is applied", "The 2018 extension: surfaces and datums", "CF vs. nX", "When to use it"],
        diagrams: [/Continuous feature diagram/],
        fcf: "Ø30",
      },
      "free-state": {
        sections: ["Definition", "The default, and why Ⓕ exists at all", "Average diameter: a special application", "Reading a feature control frame", "When to use it"],
        diagrams: [/Free state versus restrained condition diagram/, /Feature control frame diagram/],
        fcf: "0.5 Ⓕ",
      },
      "restrained-condition": {
        sections: ["Definition", "There is no symbol — and that is the point", "Free state vs. restrained: which state for which tolerance", "When to restrain — and when not to", "Writing a usable note"],
        diagrams: [/Free state versus restrained condition diagram/],
        fcf: "NOTE",
      },
      "tangent-plane": {
        sections: ["Definition", "Why the contact plane is what matters", "Where Ⓣ may appear", "Reading a feature control frame", "The trade-off"],
        diagrams: [/Tangent plane diagram/, /Feature control frame diagram/],
        fcf: "0.1 Ⓣ",
      },
    };
    for (const { slug, title } of CONCEPT_PAGES) {
      await page.goto(`${BASE}/cad/gdt/${slug}`, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
      // Concept pages carry the concept eyebrow, not the symbol one.
      await expect(page.getByText("GD&T concept ·", { exact: false })).toBeVisible();
      const exp = expectations[slug];
      for (const h of exp.sections) {
        await expect(page.getByRole("heading", { name: h, exact: true })).toBeVisible();
      }
      for (const name of exp.diagrams) {
        // .first(): pages legitimately carrying a diagram type twice (e.g.
        // the continuous-feature page's two variants) must not trip strict mode.
        await expect(page.getByRole("img", { name }).first()).toBeVisible();
      }
      // Key frame/prose string renders (code span where the guide used
      // backticks, plain text otherwise).
      await expect(page.getByText(exp.fcf).first()).toBeVisible();
      // Concept pages carry real list markup too.
      await expect(page.locator("article li").first()).toBeVisible();
    }
  });

  // Batch 5 — general dimensioning notation (third content type on the
  // same route): dimension-type conventions, size symbols, hole callouts
  // and value qualifiers. Tranche 1 shipped 8; tranche 2 adds 9 (17 total).
  // Note: the tranche-2 request listed 11 items, but Square and Dimension
  // Origin were already shipped in tranche 1 — hence 9 new, 17 total.
  const NOTATION_PAGES = [
    { slug: "basic-dimension", title: "Basic Dimension — The Boxed, Theoretically Exact Value" },
    { slug: "reference-dimension", title: "Reference Dimension — Parenthetical, Information-Only Values" },
    { slug: "dimension-not-to-scale", title: "Dimension Not to Scale — The Underline Convention" },
    { slug: "diameter", title: "Diameter (⌀) — Before Every Diameter Value" },
    { slug: "radius", title: "Radius (R) — Partial Contours, From the Center" },
    { slug: "controlled-radius", title: "Controlled Radius (CR) — Fair Curves, No Reversals" },
    { slug: "square", title: "Square (□) — One Dimension, All Four Sides" },
    { slug: "dimension-origin", title: "Dimension Origin Symbol — Where the Measurement Starts" },
    { slug: "depth", title: "Depth Symbol (↧) — How Far the Feature Goes" },
    { slug: "counterbore", title: "Counterbore (⌴) — The Fastener's Flat-Bottomed Recess" },
    { slug: "spotface", title: "Spotface — The Minimum-Depth Flat Seat" },
    { slug: "countersink", title: "Countersink (⌵) — Diameter and Included Angle" },
    { slug: "conical-taper", title: "Conical Taper — The Ratio Callout for Conical Surfaces" },
    { slug: "slope", title: "Slope — The Flat-Taper Ratio Callout" },
    { slug: "arc-length", title: "Arc Length — Dimensioning Along the Curve" },
    { slug: "parting-line", title: "Parting Line — Where the Mold Halves Meet" },
    { slug: "multiple-identical-features", title: "Multiple Identical Features (nX) — One Note, Every Match" },
  ] as const;

  test("notation pages: every page renders its guide with the expected diagrams", async ({ page }) => {
    const expectations: Record<string, { sections: string[]; diagrams: RegExp[]; text: string }> = {
      "basic-dimension": {
        sections: ["Definition", "Where the tolerance actually lives", "Where basic dimensions appear", "Basic vs. reference: two boxes, two reasons", "Measurement"],
        diagrams: [/General dimensioning callout diagram/],
        text: "theoretically exact",
      },
      "reference-dimension": {
        sections: ["Definition", "Why drawings need them", "Never add a tolerance to one", "Reference vs. basic, once more", "Measurement"],
        diagrams: [/General dimensioning callout diagram/],
        text: "never from the parenthetical",
      },
      "dimension-not-to-scale": {
        sections: ["Definition", "Why the convention survives CAD", "What the underline does not do", "Related honesty conventions"],
        diagrams: [/General dimensioning callout diagram/],
        text: "measure nothing off the print",
      },
      diameter: {
        sections: ["Definition", "Where omitting it changes the meaning", "⌀ vs. R", "Spherical diameter: S⌀"],
        diagrams: [/General dimensioning callout diagram/],
        text: "Same number, different geometry, different inspection",
      },
      radius: {
        sections: ["Definition", "What the tolerance produces", "R vs. ⌀, and the full-radius case", "When plain R is not enough"],
        diagrams: [/General dimensioning callout diagram/],
        text: "the leader itself points out the center",
      },
      "controlled-radius": {
        sections: ["Definition", "The failure mode it prevents", "Where it earns its keep", "Standards note: ASME only"],
        diagrams: [/General dimensioning callout diagram/],
        text: "without reversals",
      },
      square: {
        sections: ["Definition", "Why two dimensions are not equivalent", "Where it appears", "What □ does not control"],
        diagrams: [/General dimensioning callout diagram/],
        text: "one size value, four sides",
      },
      "dimension-origin": {
        sections: ["Definition", "The ambiguity it removes", "Origin vs. datum feature", "Measurement"],
        diagrams: [/General dimensioning callout diagram/],
        text: "define the plane from which the dimension is measured",
      },
      depth: {
        sections: ["Definition", "Where the measurement starts", "Where ↧ appears", "Measurement"],
        diagrams: [/General dimensioning callout diagram/],
        text: "depth of the full diameter",
      },
      counterbore: {
        sections: ["Definition", "Depth, or remaining material instead", "Location: the coaxiality question", "Counterbore vs. spotface"],
        diagrams: [/General dimensioning callout diagram/],
        text: "flat-bottomed cylindrical enlargement",
      },
      spotface: {
        sections: ["Definition", "When depth or remaining thickness is stated", "Reading the symbol: ⌴ plus SF", "Where it earns its keep"],
        diagrams: [/General dimensioning callout diagram/],
        text: "minimum depth necessary to clean up",
      },
      countersink: {
        sections: ["Definition", "Alternate specification methods", "Countersink vs. counterdrill", "On curved surfaces, and what flush means"],
        diagrams: [/General dimensioning callout diagram/],
        text: "diameter and included angle",
      },
      "conical-taper": {
        sections: ["Definition", "Standard tapers: name the series", "The four ways Y14.5 permits", "Reading and drawing the symbol"],
        diagrams: [/General dimensioning callout diagram/],
        text: "the vertical leg to the left",
      },
      slope: {
        sections: ["Definition", "Why the slope value is commonly basic", "Specifying a flat taper"],
        diagrams: [/General dimensioning callout diagram/],
        text: "toleranced slope and a toleranced height",
      },
      "arc-length": {
        sections: ["Definition", "Chord vs. arc: why the symbol exists", "Where it earns its keep", "Measurement"],
        diagrams: [/General dimensioning callout diagram/],
        text: "applies to the surface nearest the dimension",
      },
      "parting-line": {
        sections: ["Definition", "Why the drawing marks it", "What the line commits", "Reading the notation"],
        diagrams: [/General dimensioning callout diagram/],
        text: "a phantom line extending beyond the part",
      },
      "multiple-identical-features": {
        sections: ["Definition", "Series, patterns, and spacing", "The basic-dimension frame exception", "The trap: X meaning “by”"],
        diagrams: [/General dimensioning callout diagram/],
        text: "No space is used between the number of occurrences and the X",
      },
    };
    for (const { slug, title } of NOTATION_PAGES) {
      await page.goto(`${BASE}/cad/gdt/${slug}`, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
      // Notation pages carry the notation eyebrow, not the concept one.
      await expect(page.getByText("Dimensioning notation ·", { exact: false })).toBeVisible();
      const exp = expectations[slug];
      for (const h of exp.sections) {
        await expect(page.getByRole("heading", { name: h, exact: true })).toBeVisible();
      }
      for (const name of exp.diagrams) {
        await expect(page.getByRole("img", { name }).first()).toBeVisible();
      }
      await expect(page.getByText(exp.text).first()).toBeVisible();
      await expect(page.locator("article li").first()).toBeVisible();
    }
  });

  test("guide pages: SEO metadata on each non-pilot page", async ({ page }) => {
    for (const slug of [
      "straightness", "flatness", "circularity", "cylindricity", "profile-line", "profile-surface",
      "angularity", "perpendicularity", "parallelism", "concentricity", "symmetry", "runout", "total-runout",
      "mmc", "lmc", "rfs", "feature-control-frame", "projected-zone", "datum-feature", "datum-target",
      "rule-1", "independency", "envelope-requirement",
      "unequally-disposed-profile", "continuous-feature", "free-state", "restrained-condition", "tangent-plane",
      "basic-dimension", "reference-dimension", "dimension-not-to-scale", "diameter",
      "radius", "controlled-radius", "square", "dimension-origin",
      "depth", "counterbore", "spotface", "countersink", "conical-taper", "slope",
      "arc-length", "parting-line", "multiple-identical-features",
    ]) {
      await page.goto(`${BASE}/cad/gdt/${slug}`, { waitUntil: "networkidle" });
      const title = await page.title();
      expect(title).toMatch(/Racira/);
      const desc = await page.locator('meta[name="description"]').getAttribute("content");
      expect(desc).toBeTruthy();
      expect(desc!.length).toBeGreaterThan(50);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/cad/gdt/${slug}$`));
    }
  });

  // Phase 1 — every symbol page cross-links the canonical FCF anatomy page
  // from its seeAlso block, instead of re-explaining frame anatomy in full.
  test("phase 1: every symbol page links the feature-control-frame deep-dive", async ({ page }) => {
    test.setTimeout(180_000);
    for (const { slug } of PAGES) {
      await page.goto(`${BASE}/cad/gdt/${slug}`, { waitUntil: "networkidle" });
      const link = page.locator('a[href="/cad/gdt/feature-control-frame"]');
      await expect(link, `${slug} missing the FCF cross-link`).toHaveCount(1);
    }
  });

  // -------------------------------------------------------------------
  // Phase 0 — automated label-clipping pre-check. Seven instances of text
  // clipping past a diagram's viewBox were caught on this project, every
  // time by manual visual inspection. This check makes that defect class
  // impossible to miss: for every rendered GD&T page, walk every diagram
  // SVG's <text> elements, measure each with getBBox(), and assert the box
  // stays inside the SVG's own viewBox (2px tolerance). This targets ONLY
  // clipping — it does not replace the mandatory visual-inspection policy
  // (does a diagram communicate the right concept, are high points vs.
  // surface drawn correctly, etc.), which stays in force.
  //
  // Diagram SVGs are identified by role="img" with an aria-label — the
  // convention every GdntDiagram renderer follows — so page furniture
  // (glyphs, icons, logos) is never swept.
  // -------------------------------------------------------------------
  test("diagram label pre-check: every <text> bbox stays inside its SVG viewBox (all pages)", async ({ page }) => {
    test.setTimeout(180_000);
    const violations: string[] = [];
    for (const route of [
      "/cad/gdt",
      ...PAGES.map((p) => `/cad/gdt/${p.slug}`),
      ...CONCEPT_PAGES.map((p) => `/cad/gdt/${p.slug}`),
      ...NOTATION_PAGES.map((p) => `/cad/gdt/${p.slug}`),
    ]) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      const found = await page.evaluate(() => {
        const out: string[] = [];
        const TOL = 2; // px of slack for stroke centers / descenders
        document.querySelectorAll("svg[role='img'][aria-label]").forEach((svg) => {
          const label = svg.getAttribute("aria-label") ?? "";
          const vb = (svg as SVGSVGElement).viewBox.baseVal;
          if (!vb || !vb.width || !vb.height) return; // no viewBox to clip against
          svg.querySelectorAll("text").forEach((t) => {
            let b: DOMRect;
            try {
              b = (t as SVGTextElement).getBBox();
            } catch {
              return; // element not rendered (e.g. display:none) — nothing to check
            }
            if (b.width === 0 && b.height === 0) return; // empty text node
            const clips: string[] = [];
            if (b.x < vb.x - TOL) clips.push(`left ${b.x.toFixed(1)} < ${vb.x}`);
            if (b.x + b.width > vb.x + vb.width + TOL) clips.push(`right ${(b.x + b.width).toFixed(1)} > ${vb.x + vb.width}`);
            if (b.y < vb.y - TOL) clips.push(`top ${b.y.toFixed(1)} < ${vb.y}`);
            if (b.y + b.height > vb.y + vb.height + TOL) clips.push(`bottom ${(b.y + b.height).toFixed(1)} > ${vb.y + vb.height}`);
            if (clips.length) {
              out.push(`${t.textContent?.slice(0, 40) ?? ""} → ${clips.join("; ")} [${label.slice(0, 60)}]`);
            }
          });
        });
        return out;
      });
      for (const v of found ?? []) violations.push(`${route}: ${v}`);
    }
    expect(violations, `clipped diagram text:\n${violations.join("\n")}`).toEqual([]);
  });

  // Second automated pre-check, born from the batch-4 visual pass: shapes
  // whose paint resolves to NOTHING (stroke:none AND fill:none) are invisible
  // geometry — e.g. a dashed zone rect with className="text-primary" but no
  // stroke= attribute (Tailwind generates .stroke-* rules only for classes
  // actually used; text-* sets color, which SVG shapes do not stroke with).
  // The rule-1 envelope shipped this way — the figure's entire point was
  // invisible. A shape with no stroke and no fill paints nothing, ever.
  test("diagram render pre-check: no shape computes to stroke:none AND fill:none (all pages)", async ({ page }) => {
    test.setTimeout(180_000);
    const violations: string[] = [];
    for (const route of [
      "/cad/gdt",
      ...PAGES.map((p) => `/cad/gdt/${p.slug}`),
      ...CONCEPT_PAGES.map((p) => `/cad/gdt/${p.slug}`),
      ...NOTATION_PAGES.map((p) => `/cad/gdt/${p.slug}`),
    ]) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      const found = await page.evaluate(() => {
        const out: string[] = [];
        document.querySelectorAll("svg[role='img'][aria-label]").forEach((svg) => {
          const label = svg.getAttribute("aria-label") ?? "";
          svg.querySelectorAll("line, rect, path, circle, ellipse, polygon").forEach((el) => {
            const cs = getComputedStyle(el as Element);
            const stroke = cs.stroke;
            const fill = cs.fill;
            const paintsStroke = stroke && stroke !== "none";
            const paintsFill = fill && fill !== "none" && fill !== "transparent";
            // <line> paints only via stroke.
            const isLine = el.tagName.toLowerCase() === "line";
            const invisible = isLine ? !paintsStroke : !paintsStroke && !paintsFill;
            if (invisible) {
              out.push(`${el.tagName.toLowerCase()} [${(el.getAttribute("class") ?? "").slice(0, 40)}] [${label.slice(0, 60)}]`);
            }
          });
        });
        return out;
      });
      for (const v of found ?? []) violations.push(`${route}: ${v}`);
    }
    expect(violations, `invisible shapes (no stroke, no fill):\n${violations.join("\n")}`).toEqual([]);
  });

  for (const width of [375, 768, 1440]) {
    test(`no horizontal overflow at ${width}px (index + all guide pages)`, async ({ page }) => {
      for (const route of [
        "/cad/gdt",
        ...PAGES.map((p) => `/cad/gdt/${p.slug}`),
        ...CONCEPT_PAGES.map((p) => `/cad/gdt/${p.slug}`),
        ...NOTATION_PAGES.map((p) => `/cad/gdt/${p.slug}`),
      ]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow, `${route} at ${width}px`).toBeLessThanOrEqual(1);
      }
    });
  }
});
