import { Activity, ActivitySquare, AlertTriangle, AlignHorizontalSpaceAround, AlignVerticalSpaceAround, AlignVerticalSpaceBetween, Aperture, Asterisk, Bandage, BarChart3, Baseline, Blend, BookImage, BookOpen, Box, Brush, CalendarDays, Camera, Circle, CircleDot, ClipboardList, CloudFog, Copy, CopyPlus, Copyright, Crop, Cylinder, DownloadCloud, Eraser, Eye, FileCheck, FileCode2, FileImage, FileSignature, FileText, Film, Filter, Fingerprint, FlaskConical, FlipVertical, Frame, GitCompare, Grid, Grid2x2, Grid3x3, HelpCircle, Hexagon, Infinity, Info, Layers, Layers3, LayoutDashboard, LayoutGrid, Lightbulb, LightbulbOff, ListOrdered, Map, MapPin, MapPinOff, Maximize, Maximize2, MonitorDot, Moon, MoonStar, Mountain, MoveDownRight, MoveHorizontal, Orbit, PaintRoller, Palette, Pencil, Percent, PictureInPicture, Printer, Projector, RectangleHorizontal, RefreshCcw, Ruler, Scale, Scaling, Scan, ScanFace, Scissors, ScissorsSquare, ScrollText, Search, Shell, ShieldCheck, Shuffle, SlidersHorizontal, Sparkle, Sparkles, Spline, SplitSquareHorizontal, SplitSquareVertical, Stamp, Star, StarHalf, Sun, SunDim, Sunrise, Sunset, Tags, Target, TextCursorInput, Thermometer, TrendingUp, UserCheck, Users, VenetianMask, Wand2, Weight, Wind, Zap, ZoomIn } from "lucide-react";
import { ToolResult } from "@/components/CategorySearch";
import { toSlug } from "@/lib/utils/slug";

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

const cat = (name: string, description: string, items: Array<[string, string, any, boolean?]>): ToolCategory => ({
  slug: toSlug(name),
  name,
  description,
  tools: items.map(([n, d, icon, built]) => ({ slug: toSlug(n), name: n, description: d, icon, status: built ? "live" : "soon" })),
});

export const CATEGORIES: ToolCategory[] = [
  cat("RAW Processing", "Process and prepare RAW files for editing", [
    ["RAW File Viewer", "Inspect RAW file headers and previews", FileImage],
    ["RAW to JPEG Converter", "Convert RAW captures to JPEG", RefreshCcw],
    ["RAW Exposure Adjuster", "Non-destructive exposure preview", Sun],
    ["RAW White Balance Tool", "Tune temperature and tint", Thermometer],
    ["RAW Highlights & Shadows Recovery", "Recover blown highlights and shadows", SunDim],
    ["RAW Noise Reduction Preview", "Preview luminance/chroma noise reduction", Sparkles],
    ["RAW Color Grading Tool", "Grade colors before export", Palette],
    ["RAW Lens Correction", "Apply lens profile corrections", Aperture],
    ["RAW Chromatic Aberration Fixer", "Remove fringing from edges", AlignHorizontalSpaceAround],
    ["RAW Sharpening Tool", "Capture sharpening preview", Activity],
    ["RAW Batch Processor", "Process RAW files in bulk", Layers],
    ["RAW Metadata Extractor", "Extract embedded RAW metadata", FileText],
  ]),
  cat("Exposure & Tone", "Sculpt exposure, contrast and tonal range", [
    ["Exposure Corrector", "Fix under/over exposed images", Sun],
    ["Histogram Editor", "Visualize the luminance histogram", BarChart3, true],
    ["Levels Tool", "Adjust black, white and gamma", MoveHorizontal],
    ["Curves Editor", "Tone curve adjustments", Spline],
    ["Dodge & Burn Tool", "Lighten and darken regions", Brush],
    ["Shadows & Highlights Adjuster", "Selective tonal control", Moon],
    ["HDR Tone Mapper", "Map HDR data to display", Layers3],
    ["Graduated Filter Simulator", "Simulate a grad ND filter", AlignVerticalSpaceAround],
    ["Radial Filter Tool", "Local radial adjustments", CircleDot],
    ["Tonal Range Separator", "Split shadows / mids / highlights", SplitSquareHorizontal],
    ["Luminosity Mask Simulator", "Preview luminosity masks", Sun],
    ["Zone System Mapper", "Map zones I–IX on your image", ListOrdered],
  ]),
  cat("Color Grading & Correction", "Move color around like a pro colorist", [
    ["Color Grader", "Three-way color grading", PaintRoller],
    ["LUT Previewer (local)", "Preview 3D LUTs locally", Wand2],
    ["LUT Creator", "Build a LUT from adjustments", FlaskConical],
    ["HSL Color Editor", "Tune hue, saturation, luminance", SlidersHorizontal],
    ["Split Toning Tool", "Tint highlights and shadows", SplitSquareVertical],
    ["Color Wheels Grader", "Lift / Gamma / Gain wheels", Circle],
    ["Film Emulation Color Grader", "Emulate classic film stocks", Film],
    ["Cross-Process Simulator", "Cross-processed film look", Shuffle],
    ["Faded Film Look Tool", "Lift blacks for faded film", CloudFog],
    ["Matte Shadows Creator", "Add matte to shadows", Box],
    ["Color Harmony Grader", "Grade with color theory", Infinity],
    ["Skin Tone Corrector", "Lock natural skin tones", UserCheck],
    ["Green Screen Color Matcher", "Match keyed subject to plate", Blend],
    ["Color Story Builder", "Define a film's color story", BookImage],
  ]),
  cat("Portrait & People", "Tools for retouching and analyzing portraits", [
    ["Portrait Retouching Guide", "Guided portrait retouch checklist", ClipboardList],
    ["Skin Tone Analyzer", "Analyze skin tone hue values", Search],
    ["Eye Enhancement Preview", "Brighten and sharpen eyes", Eye],
    ["Catch Light Analyzer", "Inspect eye catch lights", Sparkle],
    ["Portrait Lighting Pattern Identifier", "Detect Rembrandt, loop, etc.", Lightbulb],
    ["Face Symmetry Visualizer", "Mirror halves of a face", ScanFace],
    ["Blemish Removal Guide", "Guide for healing blemishes", Bandage],
    ["Hair Detail Enhancer Preview", "Boost hair micro-detail", Scissors],
    ["Dodge & Burn Portrait Map", "Plan portrait dodge & burn", Map],
    ["Portrait Crop Rule Checker", "Check headroom and crop", Crop],
  ]),
  cat("Landscape & Nature", "Plan and time your outdoor shoots", [
    ["Landscape Exposure Planner", "Plan exposures for landscapes", Mountain],
    ["Golden Hour Calculator", "Find golden hour for any date/place", Sunset, true],
    ["Blue Hour Calculator", "Find blue hour for any date/place", MoonStar, true],
    ["Milky Way Position Planner", "Estimate Milky Way visibility", Star],
    ["Star Trail Preview", "Visualize star trail length", Orbit],
    ["ND Filter Calculator", "Shutter speed with ND filters", Filter, true],
    ["Hyperfocal Distance Calculator", "Maximize depth of field", Ruler, true],
    ["Sunrise & Sunset Exposure Guide", "Exposure tips for golden hours", Sunrise],
  ]),
  cat("Composition Tools", "Refine framing with classic composition rules", [
    ["Rule of Thirds Overlay", "Overlay thirds grid on an image", Grid3x3, true],
    ["Golden Ratio Overlay", "Overlay phi spiral / ratio grid", Shell, true],
    ["Phi Grid Overlay", "Overlay phi grid on an image", LayoutGrid, true],
    ["Diagonal Method Overlay", "Overlay diagonal method lines", Scaling, true],
    ["Dynamic Symmetry Grid", "Overlay dynamic symmetry", Asterisk],
    ["Leading Lines Detector", "Detect leading lines", TrendingUp],
    ["Negative Space Analyzer", "Measure negative space", Maximize],
    ["Frame within Frame Checker", "Spot framing elements", PictureInPicture],
    ["Color Balance Composition Checker", "Check color weight balance", Scale],
    ["Visual Weight Mapper", "Map visual weight", Weight],
    ["Horizontal Level Guide", "Level the horizon", Baseline],
    ["Crop Composition Advisor", "Suggest stronger crops", ScissorsSquare],
  ]),
  cat("Lens & Optics", "Solve every lens math question", [
    ["Depth of Field Calculator", "Compute near, far and DoF", Target, true],
    ["Bokeh Preview Simulator", "Estimate bokeh quality", Hexagon],
    ["Lens Distortion Corrector", "Correct barrel / pincushion", Cylinder],
    ["Perspective Corrector", "Fix converging verticals", FlipVertical],
    ["Tilt-Shift Effect Simulator", "Simulate miniature effect", AlignVerticalSpaceBetween],
    ["Focal Length Equivalent Calculator", "Crop factor equivalence", ZoomIn, true],
    ["Magnification Calculator", "Compute lens magnification", Search, true],
    ["Subject Separation Estimator", "Estimate subject pop", Users],
    ["Lens Breathing Simulator", "Preview focus breathing", Wind],
    ["Focus Stacking Planner", "Plan focus stack steps", Layers],
    ["Field of View Calculator", "Horizontal/vertical FoV", Maximize2, true],
    ["Circle of Confusion Calculator", "Compute CoC for a sensor", HelpCircle, true],
  ]),
  cat("EXIF & Metadata", "Read, edit, and clean up image metadata", [
    ["EXIF Viewer", "View EXIF metadata in any photo", Info, true],
    ["EXIF Editor", "Edit EXIF fields", Pencil],
    ["EXIF Stripper", "Strip metadata from photos", Eraser, true],
    ["GPS Location Extractor from EXIF", "Pull GPS from EXIF", MapPin],
    ["Camera Settings Decoder", "Decode camera maker notes", Camera],
    ["Lens Profile Identifier", "Identify the lens used", Aperture],
    ["Copyright Metadata Embedder", "Embed copyright fields", Copyright],
    ["IPTC Field Editor", "Edit IPTC metadata", FileSignature],
    ["XMP Metadata Editor", "Edit XMP sidecar metadata", FileCode2],
    ["EXIF Comparison Tool", "Compare two photos' EXIF", GitCompare],
  ]),
  cat("Photo Organization & Workflow", "Cull, rate and organize your library", [
    ["Photo Batch Renamer", "Rename photos in bulk", TextCursorInput, true],
    ["Photo Culling Grid", "Cull keepers fast", LayoutDashboard],
    ["Photo Rating Organizer", "Star-rate photos", StarHalf],
    ["Photo Tagging Tool", "Tag photos with keywords", Tags],
    ["Duplicate Photo Detector", "Detect duplicate captures", Copy],
    ["Photo Date Sorter", "Sort photos by capture date", CalendarDays],
    ["Photo Album Layout Planner", "Plan album spreads", BookOpen],
    ["Photo Import Organizer", "Organize imports into folders", DownloadCloud],
    ["Photo Contact Sheet", "Generate a contact sheet", Grid2x2],
    ["Photo Proof Sheet Maker", "Build client proof sheets", Stamp],
  ]),
  cat("Printing & Output", "Get pixel-perfect prints every time", [
    ["Print Size Calculator", "Pixels ↔ inches at a DPI", Printer, true],
    ["Photo Print DPI Checker", "Check effective print DPI", Scan, true],
    ["Color Profile Converter for Print", "Convert sRGB / Adobe / ProPhoto", Palette],
    ["Soft Proof Simulator", "Simulate paper soft-proof", MonitorDot],
    ["Photo Lab Spec Formatter", "Match lab spec sheets", FileCheck],
    ["Border & Bleed Calculator", "Compute border and bleed", Frame],
    ["Canvas Art Size Estimator", "Estimate canvas wrap size", RectangleHorizontal],
    ["Large Format Print Checker", "Check large-format viability", Projector],
    ["Photo Paper Size Guide", "Reference paper sizes", ScrollText],
    ["Print Sharpening Planner", "Plan output sharpening", Zap],
  ]),
  cat("Forensic & Technical", "Inspect, verify and dig into the bits", [
    ["Photo Authenticity Analyzer", "Estimate authenticity signals", ShieldCheck],
    ["Clone Detection Map", "Map cloned regions", CopyPlus],
    ["Noise Fingerprint Analyzer", "Analyze sensor noise fingerprint", Fingerprint],
    ["JPEG Artifact Revealer", "Reveal compression artifacts", ZoomIn],
    ["Metadata Tampering Detector", "Detect altered metadata", AlertTriangle],
    ["Steganography Inspector", "Inspect hidden data", VenetianMask],
    ["Lighting Inconsistency Checker", "Spot lighting mismatches", LightbulbOff],
    ["Shadow Direction Analyzer", "Analyze shadow directions", MoveDownRight],
    ["Error Level Analysis (ELA) Tool", "ELA visualization", ActivitySquare],
    ["Chroma Sub-Sampling Checker", "Detect chroma subsampling", Grid],
    ["JPEG Quality Estimator", "Estimate JPEG quality factor", Percent],
    ["Color Gamut Out-of-Range Mapper", "Map out-of-gamut pixels", MapPinOff],
  ]),
];

export const ALL_TOOLS: Array<Tool & { category: string; categorySlug: string }> = CATEGORIES.flatMap((c) =>
  c.tools.map((t) => ({ ...t, category: c.name, categorySlug: c.slug })),
);

export const findTool = (slug: string) => ALL_TOOLS.find((t) => (t as any).slug === slug);

export const SEARCH_REGISTRY: ToolResult[] = CATEGORIES.flatMap((cat) =>
  cat.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    slug: tool.slug,
    href: `/photo/tool/${tool.slug}`,
    category: cat.name,
    isBuilt: tool.status === "live",
  }))
);
