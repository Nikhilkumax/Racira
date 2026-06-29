export type ToolCategory = {
  slug: string;
  name: string;
  description: string;
  tools: Tool[];
};

export type Tool = {
  slug: string;
  name: string;
  description: string;
  built?: boolean;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const cat = (name: string, description: string, items: Array<[string, string, boolean?]>): ToolCategory => ({
  slug: slugify(name),
  name,
  description,
  tools: items.map(([n, d, built]) => ({ slug: slugify(n), name: n, description: d, built })),
});

export const CATEGORIES: ToolCategory[] = [
  cat("RAW Processing", "Process and prepare RAW files for editing", [
    ["RAW File Viewer", "Inspect RAW file headers and previews"],
    ["RAW to JPEG Converter", "Convert RAW captures to JPEG"],
    ["RAW Exposure Adjuster", "Non-destructive exposure preview"],
    ["RAW White Balance Tool", "Tune temperature and tint"],
    ["RAW Highlights & Shadows Recovery", "Recover blown highlights and shadows"],
    ["RAW Noise Reduction Preview", "Preview luminance/chroma noise reduction"],
    ["RAW Color Grading Tool", "Grade colors before export"],
    ["RAW Lens Correction", "Apply lens profile corrections"],
    ["RAW Chromatic Aberration Fixer", "Remove fringing from edges"],
    ["RAW Sharpening Tool", "Capture sharpening preview"],
    ["RAW Batch Processor", "Process RAW files in bulk"],
    ["RAW Metadata Extractor", "Extract embedded RAW metadata"],
  ]),
  cat("Exposure & Tone", "Sculpt exposure, contrast and tonal range", [
    ["Exposure Corrector", "Fix under/over exposed images"],
    ["Histogram Editor", "Visualize the luminance histogram", true],
    ["Levels Tool", "Adjust black, white and gamma"],
    ["Curves Editor", "Tone curve adjustments"],
    ["Dodge & Burn Tool", "Lighten and darken regions"],
    ["Shadows & Highlights Adjuster", "Selective tonal control"],
    ["HDR Tone Mapper", "Map HDR data to display"],
    ["Graduated Filter Simulator", "Simulate a grad ND filter"],
    ["Radial Filter Tool", "Local radial adjustments"],
    ["Tonal Range Separator", "Split shadows / mids / highlights"],
    ["Luminosity Mask Simulator", "Preview luminosity masks"],
    ["Zone System Mapper", "Map zones I–IX on your image"],
  ]),
  cat("Color Grading & Correction", "Move color around like a pro colorist", [
    ["Color Grader", "Three-way color grading"],
    ["LUT Previewer (local)", "Preview 3D LUTs locally"],
    ["LUT Creator", "Build a LUT from adjustments"],
    ["HSL Color Editor", "Tune hue, saturation, luminance"],
    ["Split Toning Tool", "Tint highlights and shadows"],
    ["Color Wheels Grader", "Lift / Gamma / Gain wheels"],
    ["Film Emulation Color Grader", "Emulate classic film stocks"],
    ["Cross-Process Simulator", "Cross-processed film look"],
    ["Faded Film Look Tool", "Lift blacks for faded film"],
    ["Matte Shadows Creator", "Add matte to shadows"],
    ["Color Harmony Grader", "Grade with color theory"],
    ["Skin Tone Corrector", "Lock natural skin tones"],
    ["Green Screen Color Matcher", "Match keyed subject to plate"],
    ["Color Story Builder", "Define a film's color story"],
  ]),
  cat("Portrait & People", "Tools for retouching and analyzing portraits", [
    ["Portrait Retouching Guide", "Guided portrait retouch checklist"],
    ["Skin Tone Analyzer", "Analyze skin tone hue values"],
    ["Eye Enhancement Preview", "Brighten and sharpen eyes"],
    ["Catch Light Analyzer", "Inspect eye catch lights"],
    ["Portrait Lighting Pattern Identifier", "Detect Rembrandt, loop, etc."],
    ["Face Symmetry Visualizer", "Mirror halves of a face"],
    ["Blemish Removal Guide", "Guide for healing blemishes"],
    ["Hair Detail Enhancer Preview", "Boost hair micro-detail"],
    ["Dodge & Burn Portrait Map", "Plan portrait dodge & burn"],
    ["Portrait Crop Rule Checker", "Check headroom and crop"],
  ]),
  cat("Landscape & Nature", "Plan and time your outdoor shoots", [
    ["Landscape Exposure Planner", "Plan exposures for landscapes"],
    ["Golden Hour Calculator", "Find golden hour for any date/place", true],
    ["Blue Hour Calculator", "Find blue hour for any date/place", true],
    ["Milky Way Position Planner", "Estimate Milky Way visibility"],
    ["Star Trail Preview", "Visualize star trail length"],
    ["ND Filter Calculator", "Shutter speed with ND filters", true],
    ["Hyperfocal Distance Calculator", "Maximize depth of field", true],
    ["Sunrise & Sunset Exposure Guide", "Exposure tips for golden hours"],
  ]),
  cat("Composition Tools", "Refine framing with classic composition rules", [
    ["Rule of Thirds Overlay", "Overlay thirds grid on an image", true],
    ["Golden Ratio Overlay", "Overlay phi spiral / ratio grid", true],
    ["Phi Grid Overlay", "Overlay phi grid on an image", true],
    ["Diagonal Method Overlay", "Overlay diagonal method lines", true],
    ["Dynamic Symmetry Grid", "Overlay dynamic symmetry"],
    ["Leading Lines Detector", "Detect leading lines"],
    ["Negative Space Analyzer", "Measure negative space"],
    ["Frame within Frame Checker", "Spot framing elements"],
    ["Color Balance Composition Checker", "Check color weight balance"],
    ["Visual Weight Mapper", "Map visual weight"],
    ["Horizontal Level Guide", "Level the horizon"],
    ["Crop Composition Advisor", "Suggest stronger crops"],
  ]),
  cat("Lens & Optics", "Solve every lens math question", [
    ["Depth of Field Calculator", "Compute near, far and DoF", true],
    ["Bokeh Preview Simulator", "Estimate bokeh quality"],
    ["Lens Distortion Corrector", "Correct barrel / pincushion"],
    ["Perspective Corrector", "Fix converging verticals"],
    ["Tilt-Shift Effect Simulator", "Simulate miniature effect"],
    ["Focal Length Equivalent Calculator", "Crop factor equivalence", true],
    ["Magnification Calculator", "Compute lens magnification", true],
    ["Subject Separation Estimator", "Estimate subject pop"],
    ["Lens Breathing Simulator", "Preview focus breathing"],
    ["Focus Stacking Planner", "Plan focus stack steps"],
    ["Field of View Calculator", "Horizontal/vertical FoV", true],
    ["Circle of Confusion Calculator", "Compute CoC for a sensor", true],
  ]),
  cat("EXIF & Metadata", "Read, edit, and clean up image metadata", [
    ["EXIF Viewer", "View EXIF metadata in any photo", true],
    ["EXIF Editor", "Edit EXIF fields"],
    ["EXIF Stripper", "Strip metadata from photos", true],
    ["GPS Location Extractor from EXIF", "Pull GPS from EXIF"],
    ["Camera Settings Decoder", "Decode camera maker notes"],
    ["Lens Profile Identifier", "Identify the lens used"],
    ["Copyright Metadata Embedder", "Embed copyright fields"],
    ["IPTC Field Editor", "Edit IPTC metadata"],
    ["XMP Metadata Editor", "Edit XMP sidecar metadata"],
    ["EXIF Comparison Tool", "Compare two photos' EXIF"],
  ]),
  cat("Photo Organization & Workflow", "Cull, rate and organize your library", [
    ["Photo Batch Renamer", "Rename photos in bulk", true],
    ["Photo Culling Grid", "Cull keepers fast"],
    ["Photo Rating Organizer", "Star-rate photos"],
    ["Photo Tagging Tool", "Tag photos with keywords"],
    ["Duplicate Photo Detector", "Detect duplicate captures"],
    ["Photo Date Sorter", "Sort photos by capture date"],
    ["Photo Album Layout Planner", "Plan album spreads"],
    ["Photo Import Organizer", "Organize imports into folders"],
    ["Photo Contact Sheet", "Generate a contact sheet"],
    ["Photo Proof Sheet Maker", "Build client proof sheets"],
  ]),
  cat("Printing & Output", "Get pixel-perfect prints every time", [
    ["Print Size Calculator", "Pixels ↔ inches at a DPI", true],
    ["Photo Print DPI Checker", "Check effective print DPI", true],
    ["Color Profile Converter for Print", "Convert sRGB / Adobe / ProPhoto"],
    ["Soft Proof Simulator", "Simulate paper soft-proof"],
    ["Photo Lab Spec Formatter", "Match lab spec sheets"],
    ["Border & Bleed Calculator", "Compute border and bleed"],
    ["Canvas Art Size Estimator", "Estimate canvas wrap size"],
    ["Large Format Print Checker", "Check large-format viability"],
    ["Photo Paper Size Guide", "Reference paper sizes"],
    ["Print Sharpening Planner", "Plan output sharpening"],
  ]),
  cat("Forensic & Technical", "Inspect, verify and dig into the bits", [
    ["Photo Authenticity Analyzer", "Estimate authenticity signals"],
    ["Clone Detection Map", "Map cloned regions"],
    ["Noise Fingerprint Analyzer", "Analyze sensor noise fingerprint"],
    ["JPEG Artifact Revealer", "Reveal compression artifacts"],
    ["Metadata Tampering Detector", "Detect altered metadata"],
    ["Steganography Inspector", "Inspect hidden data"],
    ["Lighting Inconsistency Checker", "Spot lighting mismatches"],
    ["Shadow Direction Analyzer", "Analyze shadow directions"],
    ["Error Level Analysis (ELA) Tool", "ELA visualization"],
    ["Chroma Sub-Sampling Checker", "Detect chroma subsampling"],
    ["JPEG Quality Estimator", "Estimate JPEG quality factor"],
    ["Color Gamut Out-of-Range Mapper", "Map out-of-gamut pixels"],
  ]),
];

export const ALL_TOOLS: Array<Tool & { category: string; categorySlug: string }> = CATEGORIES.flatMap((c) =>
  c.tools.map((t) => ({ ...t, category: c.name, categorySlug: c.slug })),
);

export const findTool = (slug: string) => ALL_TOOLS.find((t) => t.slug === slug);
