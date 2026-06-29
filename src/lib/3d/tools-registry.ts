export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: string;
  built?: boolean;
};

export type Category = {
  name: string;
  tools: Tool[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const def = (name: string, description: string, built = false): Omit<Tool, "category"> => ({
  slug: slugify(name),
  name,
  description,
  built,
});

export const CATEGORIES: Category[] = [
  {
    name: "3D Viewing & Inspection",
    tools: [
      def("3D Model Viewer (GLTF/OBJ/STL)", "Load and rotate GLTF, OBJ, or STL files in your browser", true),
      def("GLTF Inspector", "Parse a GLTF/GLB file and explore its JSON structure", true),
      def("OBJ Inspector", "Inspect OBJ geometry, groups, and materials", true),
      def("STL Viewer", "View binary or ASCII STL meshes in 3D", true),
      def("FBX Viewer (via conversion)", "View FBX models after converting to GLTF", true),
      def("3D Mesh Stats Tool", "Vertex, face, edge, and material counts for any mesh", true),
      def("3D Scene Explorer", "Walk the scene graph of any 3D file", true),
      def("3D Bounding Box Inspector", "Compute and visualize bounding box dimensions", true),
      def("3D Normal Map Viewer", "Preview a normal map applied to a sphere", true),
      def("UV Map Inspector", "Render the UV layout of a 3D model", true),
      def("3D Wireframe Viewer", "Toggle wireframe rendering for any model", true),
      def("3D Vertex Count Analyzer", "Per-mesh vertex counts for performance budgeting", true),
    ],
  },
  {
    name: "3D Modeling Utilities",
    tools: [
      def("3D Model Scale Calculator", "Calculate scaling factors between units"),
      def("3D Print Volume Estimator", "Estimate the printable volume of a model"),
      def("Mesh Simplification Preview", "Preview decimated meshes"),
      def("3D Booleans Concept Tool", "Plan boolean operations between meshes"),
      def("Surface Area Calculator (3D)", "Compute surface area of a mesh"),
      def("3D Model Unit Converter", "Convert between mm, cm, inch, m"),
      def("Voxel Art Builder", "Build voxel-based scenes"),
      def("3D Isometric Builder", "Compose isometric scenes in browser"),
      def("Low-Poly Shape Generator", "Generate low-poly primitives"),
      def("3D Model Dimension Inspector", "Inspect width, height, and depth"),
      def("3D Coordinate System Tool", "Reference for 3D coordinate systems"),
      def("Mesh Density Checker", "Check polygon density per area"),
      def("3D Transform Tool", "Translate, rotate, scale meshes"),
      def("3D Model Repair Checklist", "Checklist of common mesh repairs"),
    ],
  },
  {
    name: "3D Print Preparation",
    tools: [
      def("3D Print Slicer Preview (browser)", "Preview slicing in browser"),
      def("Layer Height Calculator", "Find ideal layer heights for nozzles"),
      def("Infill Density Estimator", "Estimate infill weight and strength"),
      def("Support Structure Planner", "Plan supports for overhangs"),
      def("Print Time Estimator", "Estimate total print time"),
      def("Material Weight Calculator", "Calculate filament/resin weight"),
      def("Filament Usage Calculator", "Estimate filament length used"),
      def("Wall Thickness Checker", "Check minimum wall thickness"),
      def("Overhangs Analyzer", "Find risky overhang angles"),
      def("Bridge Length Estimator", "Estimate bridge spans"),
      def("Bed Adhesion Planner", "Plan adhesion strategy"),
      def("Cooling Strategy Planner", "Plan cooling per material"),
      def("G-Code Viewer", "Preview G-code in browser"),
      def("Print Settings Reference Tool", "Reference common slicer settings"),
      def("Build Plate Layout Planner", "Lay out parts on build plate"),
      def("First Layer Calibration Guide", "Calibrate first layer adhesion"),
    ],
  },
  {
    name: "FDM 3D Printing",
    tools: [
      def("FDM Material Comparator", "Compare FDM filament types"),
      def("PLA vs PETG vs ABS Chooser", "Pick the right filament"),
      def("Nozzle Size Guide", "Nozzle size to detail reference"),
      def("Printer Spec Comparator", "Compare printer specifications"),
      def("Hotend Temperature Reference", "Temperature ranges per material"),
      def("Retraction Settings Guide", "Tune retraction"),
      def("Speed vs Quality Trade-Off Tool", "Balance speed and quality"),
      def("Stringing Troubleshooting Tool", "Fix stringing issues"),
      def("Layer Adhesion Guide", "Improve layer bonding"),
      def("Warping Prevention Checklist", "Prevent warped prints"),
      def("FDM Color Management Tool", "Manage multi-color prints"),
      def("Enclosure Requirement Estimator", "Decide if you need an enclosure"),
    ],
  },
  {
    name: "SLA & Resin Printing",
    tools: [
      def("Resin Exposure Calculator", "Calculate exposure times"),
      def("Resin Material Comparator", "Compare resin types"),
      def("Support Density Planner (SLA)", "Plan SLA support density"),
      def("Hollow Shell Wall Thickness Tool", "Set hollow shell thickness"),
      def("Drain Hole Placement Guide", "Place drain holes correctly"),
      def("UV Curing Time Calculator", "Compute post-cure time"),
      def("Resin Safety Checklist", "Resin handling safety"),
      def("SLA Print Cost Estimator", "Estimate resin print cost"),
    ],
  },
  {
    name: "Print Materials & Costs",
    tools: [
      def("Filament Cost Calculator", "Cost per print by filament"),
      def("Resin Cost Calculator", "Cost per print by resin"),
      def("Print Material Budget Planner", "Plan your material budget"),
      def("Material Density Reference", "Densities for common materials"),
      def("Spool Weight Tracker", "Track remaining spool weight"),
      def("Multi-Material Print Planner", "Plan multi-material jobs"),
      def("Recycled Filament Comparator", "Compare recycled filaments"),
      def("Material Data Sheet Reference", "Lookup material datasheets"),
    ],
  },
  {
    name: "3D Texturing & Materials",
    tools: [
      def("Texture Map Builder", "Build texture maps in browser"),
      def("UV Unwrap Guide", "Guide to UV unwrapping"),
      def("PBR Material Reference", "Reference PBR materials"),
      def("Normal Map Generator", "Generate normal maps from images"),
      def("Roughness Map Builder", "Build roughness maps"),
      def("Metallic Map Maker", "Make metallic maps"),
      def("Ambient Occlusion Map Preview", "Preview AO maps"),
      def("Displacement Map Viewer", "View displacement maps"),
      def("Material Library Builder", "Build your material library"),
      def("Substance Parameter Reference", "Substance parameter cheatsheet"),
    ],
  },
  {
    name: "3D Animation (Concept Tools)",
    tools: [
      def("3D Rig Concept Builder", "Concept rigs for characters"),
      def("Animation Curve Visualizer", "Visualize ease curves"),
      def("Bone Hierarchy Planner", "Plan bone hierarchy"),
      def("Morph Target Reference", "Reference morph targets"),
      def("3D Path Animation Planner", "Plan path animations"),
      def("Blend Shape Concept Tool", "Concept blend shapes"),
      def("IK Chain Visualizer", "Visualize IK chains"),
      def("Keyframe Timing Reference", "Timing chart for keyframes"),
    ],
  },
  {
    name: "Web 3D & Real-Time",
    tools: [
      def("Three.js Playground", "Live Three.js sandbox"),
      def("WebGL Shader Editor", "Edit shaders live"),
      def("WebXR Scene Builder", "Build basic WebXR scenes"),
      def("AR Marker Generator", "Generate AR markers"),
      def("3D CSS Transform Builder", "Build 3D CSS transforms"),
      def("GLTF Optimizer", "Optimize GLTF files"),
      def("Three.js Geometry Gallery", "Gallery of geometries"),
      def("WebGPU Feature Checker", "Check WebGPU support"),
      def("Three.js Material Preview", "Preview Three.js materials"),
      def("3D Performance Budget Estimator", "Budget polys and draw calls"),
    ],
  },
  {
    name: "Print Design (Print-on-Paper)",
    tools: [
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
    ],
  },
  {
    name: "Specialized 3D",
    tools: [
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
    ],
  },
].map((c) => ({
  name: c.name,
  tools: c.tools.map((t) => ({ ...t, category: c.name })),
}));

export const ALL_TOOLS: Tool[] = CATEGORIES.flatMap((c) => c.tools);
export const TOOLS_BY_SLUG = new Map(ALL_TOOLS.map((t) => [t.slug, t]));
export const TOTAL_TOOLS = ALL_TOOLS.length;
