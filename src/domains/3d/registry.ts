import { ToolResult } from "@/components/CategorySearch";
import { Tool as BaseTool, Category as BaseCategory, ToolStatus } from "@/domains/_types";
import { inferIcon } from "@/components/shared/icon-map";

export type Tool = BaseTool;
export type Category = BaseCategory;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Mark active (fully functional) tools
const ACTIVE_SLUGS = new Set([
  "3d-model-viewer-gltf-obj-stl",
  "gltf-inspector",
  "obj-inspector",
  "stl-viewer",
  "fbx-viewer-via-conversion",
  "3d-mesh-stats-tool",
  "3d-scene-explorer",
  "3d-bounding-box-inspector",
  "3d-normal-map-viewer",
  "uv-map-inspector",
  "3d-wireframe-viewer",
  "3d-vertex-count-analyzer"
]);

const def = (name: string, description: string): Omit<Tool, "category"> => {
  const slug = slugify(name);
  return {
    slug,
    name,
    description,
    status: ACTIVE_SLUGS.has(slug) ? "live" : "soon",
    icon: inferIcon(name, slug)
  };
};

const buildCat = (name: string, items: Omit<Tool, "category">[]): Category => ({
  title: name,
  key: slugify(name),
  tools: items.map(t => ({ ...t, category: name } as Tool))
});

export const CATEGORIES: Category[] = [
  buildCat("3D Viewing & Inspection", [
    def("3D Model Viewer (GLTF/OBJ/STL)", "Load and rotate GLTF, OBJ, or STL files in your browser"),
    def("GLTF Inspector", "Parse a GLTF/GLB file and explore its JSON structure"),
    def("OBJ Inspector", "Inspect OBJ geometry, groups, and materials"),
    def("STL Viewer", "View binary or ASCII STL meshes in 3D"),
    def("FBX Viewer (via conversion)", "View FBX models after converting to GLTF"),
    def("3D Mesh Stats Tool", "Vertex, face, edge, and material counts for any mesh"),
    def("3D Scene Explorer", "Walk the scene graph of any 3D file"),
    def("3D Bounding Box Inspector", "Compute and visualize bounding box dimensions"),
    def("3D Normal Map Viewer", "Preview a normal map applied to a sphere"),
    def("UV Map Inspector", "Render the UV layout of a 3D model"),
    def("3D Wireframe Viewer", "Toggle wireframe rendering for any model"),
    def("3D Vertex Count Analyzer", "Per-mesh vertex counts for performance budgeting"),
  ]),
  buildCat("3D Modeling Utilities", [
    def("3D Model Scale Calculator", "Calculate scaling factors between units"),
    def("3D Print Volume Estimator", "Estimate the printable volume of a model"),
    def("Mesh Simplification Preview", "Preview decimated meshes"),
    def("3D Booleans Concept Tool", "Plan boolean operations between meshes"),
    def("Surface Area Calculator (3D)", "Compute surface area of a mesh"),
    def("3D Model Unit Converter", "Convert between mm, cm, inch, m"),
    def("Voxel Art Builder", "Build voxel-based scenes"),
    def("3D Isometric Builder", "Compose isometric scenes in browser"),
    def("Mesh Smoothing Viewer", "Preview subdivision surfaces"),
    def("3D Mirror/Symmetry Tool", "Preview mirrored geometries"),
    def("Model Hollower (Shell) Concept", "Plan wall thickness for hollowing"),
    def("3D Pivot Point Adjuster", "Re-center model origins"),
    def("Poly Count Reducer Helper", "Target poly counts for LODs"),
    def("3D Model Bounding Sphere Calc", "Calculate bounding spheres"),
  ]),
  buildCat("3D Print Preparation", [
    def("G-Code Viewer", "Preview G-Code paths layer by layer"),
    def("3D Print Time Estimator", "Estimate print time from parameters"),
    def("Overhang Angle Checker", "Identify faces needing supports"),
    def("Wall Thickness Analyzer", "Check minimum wall thickness"),
    def("Support Material Estimator", "Estimate support material usage"),
    def("Infill Density Visualizer", "Visualize different infill patterns"),
    def("Bed Leveling Test Generator", "Generate bed leveling test prints"),
    def("3D Print Shrinkage Calculator", "Calculate material shrinkage compensation"),
    def("Resin Exposure Time Finder", "Calculate ideal resin exposure"),
    def("FEP Film Tension Guide", "Guide to tuning FEP film"),
    def("Nozzle Size vs Layer Height", "Calculate optimal layer heights"),
    def("Extrusion Multiplier Calc", "Calibrate flow rate/extrusion"),
  ]),
  buildCat("FDM 3D Printing", [
    def("Filament Spool Cost Calculator", "Cost per gram/meter of filament"),
    def("Filament Runout Predictor", "Predict if a spool has enough left"),
    def("Retraction Calibration Test", "Generate stringing tests"),
    def("Temperature Tower Generator", "Generate temp tower STLs"),
    def("Vase Mode Planner", "Plan continuous spiral vases"),
    def("First Layer Squish Visualizer", "First layer height reference"),
    def("PID Autotune Helper", "Marlin PID autotune reference"),
    def("Stepper Motor Steps/mm Calc", "Calibrate e-steps and axis steps"),
    def("Print Speed vs Quality Guide", "Speed and acceleration reference"),
    def("Dual Extrusion Prime Tower Calc", "Size prime towers"),
  ]),
  buildCat("SLA & Resin Printing", [
    def("Resin Cost Calculator", "Cost per mL of resin"),
    def("Resin Lift Speed Reference", "Optimal lift speeds for SLA"),
    def("Hollowing Resin Drain Planner", "Plan drain holes for hollow prints"),
    def("Resin Print Orientation Guide", "Guide to minimizing peel forces"),
    def("Anti-Aliasing Preview", "Preview AA settings for resin"),
    def("LCD Screen Life Tracker", "Track hours on SLA screens"),
    def("Resin Toxicity & Safety Ref", "Material safety guide"),
    def("Wash & Cure Time Guide", "Optimal washing and curing times"),
  ]),
  buildCat("Print Materials & Costs", [
    def("PLA vs PETG vs ABS Guide", "Compare common FDM filaments"),
    def("TPU/Flexible Print Settings", "Reference for printing flexibles"),
    def("Nylon & PC Enclosure Ref", "Requirements for engineering materials"),
    def("3D Print Pricing Calculator", "Quote jobs by time, weight, and wear"),
    def("Electricity Cost of Printing", "Calculate power usage of printers"),
    def("Spool Weight Tare Database", "Empty spool weights by brand"),
  ]),
  buildCat("3D Texturing & Materials", [
    def("PBR Material Viewer", "View physically based materials"),
    def("Albedo/Color Map Viewer", "View base color maps"),
    def("Roughness/Gloss Map Viewer", "View roughness maps"),
    def("Metalness Map Viewer", "View metallic maps"),
    def("Ambient Occlusion Viewer", "View AO maps"),
    def("Displacement Map Visualizer", "Preview height/displacement"),
    def("Texture Tiling Checker", "Check for seamless tiling"),
    def("Normal Map Inverter (DirectX/OpenGL)", "Flip green channels on normals"),
    def("Texture Resolution Resizer", "Scale textures to power-of-two"),
    def("Color Palette to 3D Gradient", "Map palettes to 3D ramps"),
  ]),
  buildCat("3D Animation (Concept Tools)", [
    def("Bone Weight Visualizer", "Preview vertex weights"),
    def("Rigging Hierarchy Viewer", "View armature tree structures"),
    def("Keyframe Interpolation Curve", "Bezier curve editor for animation"),
    def("FK/IK Joint Simulator", "Simulate forward and inverse kinematics"),
    def("Motion Capture Data Viewer", "Preview BVH files"),
    def("Frame Rate Converter", "Calculate frame counts across FPS"),
    def("Lip Sync Viseme Reference", "Reference chart for mouth shapes"),
    def("Walk Cycle Timing Guide", "Timing charts for standard walk cycles"),
  ]),
  buildCat("Web 3D & Real-Time", [
    def("Three.js Scene Builder", "Compose basic Three.js scenes"),
    def("WebGL Capabilities Checker", "Check device WebGL limits"),
    def("HDRI Environment Viewer", "View equirectangular HDRI maps"),
    def("GLTF Compression (Draco) Planner", "Estimate Draco compression savings"),
    def("Three.js Camera Planner", "Plan FOV and near/far planes"),
    def("WebXR Device Support Checker", "Check for VR/AR support"),
    def("Three.js Geometry Gallery", "Gallery of geometries"),
    def("WebGPU Feature Checker", "Check WebGPU support"),
    def("Three.js Material Preview", "Preview Three.js materials"),
    def("3D Performance Budget Estimator", "Budget polys and draw calls"),
  ]),
  buildCat("Print Design (Print-on-Paper)", [
    def("Print Bleed & Safe Zone Calculator", "Bleed and safe zones for print"),
    def("Print DPI Checker", "Check image DPI for print"),
    def("CMYK Print Preview Simulator", "Preview CMYK output"),
    def("Print Template Builder", "Build print templates"),
    def("Tiling Print Layout", "Lay out tiled prints"),
    def("Large Format Print Calculator", "Calculate large format prints"),
    def("Print Crop Marks Generator", "Generate crop marks"),
    def("Color Bar Reference", "Reference color bars"),
    def("Registration Mark Generator", "Generate registration marks"),
    def("Print Proof Checklist", "Pre-press proof checklist"),
    def("Printer Color Profile Selector", "Pick the right ICC profile"),
    def("Cardstock Weight Reference", "Paper weight reference"),
    def("Binding Type Selector", "Pick a binding method"),
    def("Print Run Cost Estimator", "Estimate print run cost"),
  ]),
  buildCat("Specialized 3D", [
    def("Point Cloud Viewer", "View point clouds"),
    def("Photogrammetry Checklist", "Photogrammetry workflow checklist"),
    def("LiDAR Data Reference", "LiDAR data reference"),
    def("3D Scanning Guide", "Guide to 3D scanning"),
    def("Digital Fabrication Reference", "Digital fab reference"),
    def("CNC Path Concept Planner", "Plan CNC toolpaths"),
    def("Laser Cutter Material Guide", "Materials for laser cutting"),
    def("Embossing Pattern Builder", "Build emboss patterns"),
    def("3D Map Terrain Viewer", "View 3D terrain maps"),
    def("Procedural Terrain Generator", "Generate procedural terrain"),
  ])
];

export const ALL_TOOLS: Tool[] = CATEGORIES.flatMap((c) => c.tools);
export const TOOLS_BY_SLUG = new Map(ALL_TOOLS.map((t) => [t.slug, t]));
export const TOTAL_TOOLS = ALL_TOOLS.length;

export const SEARCH_REGISTRY: ToolResult[] = ALL_TOOLS.map((tool) => ({
  name: tool.name,
  description: tool.description,
  slug: tool.slug,
  href: `/3d/tool/${tool.slug}`,
  category: tool.category,
  isBuilt: tool.status === "live",
}));
