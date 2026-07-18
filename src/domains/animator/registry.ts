import { ToolResult } from "@/components/CategorySearch";
import { Tool as BaseTool, Category as BaseCategory } from "@/domains/_types";
import { inferIcon } from "@/components/shared/icon-map";

export type Tool = BaseTool;
export type Category = BaseCategory;

import { toSlug } from "@/lib/utils/slug";

const ACTIVE_SLUGS = new Set<string>([
  // No tools built yet
]);

const def = (name: string, description: string): Omit<Tool, "category"> => {
  const slug = toSlug(name);
  return {
    slug,
    name,
    description,
    status: ACTIVE_SLUGS.has(slug) ? "live" : "soon",
    icon: inferIcon(name, slug)
  };
};

const buildCat = (name: string, items: Omit<Tool, "category">[]): Category => ({
  name,
  tools: items.map(t => ({ ...t, category: name } as Tool))
});

export const categories: Category[] = [
  buildCat("CSS Animation", [
    def("CSS Keyframe Builder", "Compose @keyframes visually"),
    def("CSS Transition Builder", "Design CSS transitions"),
    def("CSS Animation Preview", "Live preview any CSS animation"),
    def("CSS Timing Function Editor", "Cubic bezier curve editor"),
    def("CSS Animation Delay Planner", "Plan delays across elements"),
    def("CSS Transform Animator", "Animate translate, rotate, scale"),
    def("CSS Animation Chaining Tool", "Chain multiple animations"),
    def("CSS Scroll Animation Builder", "Scroll-driven CSS animations"),
    def("CSS Parallax Effect Builder", "Layered parallax effects"),
    def("CSS 3D Transform Animator", "Animate in 3D space"),
    def("CSS Animation Library Browser", "Browse ready-made animations"),
    def("CSS Text Animation Builder", "Text-specific animations"),
    def("CSS Loading Spinner Maker", "Design loading spinners"),
    def("CSS Animation Code Exporter", "Export clean CSS code"),
  ]),
  buildCat("SVG Animation", [
    def("SVG Animation Editor", "Edit SVG animations visually"),
    def("SMIL Animation Builder", "Build SMIL-based animation"),
    def("SVG Path Animation Tool", "Animate paths over time"),
    def("SVG Morph Animator", "Morph between SVG shapes"),
    def("SVG Stroke Dash Animator", "Animate stroke-dasharray"),
    def("SVG Animate Transform Tool", "Animate SVG transforms"),
    def("SVG Motion Path Builder", "Move along motion paths"),
    def("SVG Clip Path Animator", "Animate SVG clip-paths"),
    def("SVG Mask Animator", "Animate SVG masks"),
    def("SVG Gradient Animator", "Animate SVG gradients"),
    def("SVG Lottie Builder", "Build Lottie from SVG"),
    def("SVG Animation Optimizer", "Optimize SVG animations"),
  ]),
  buildCat("Lottie & JSON Animation", [
    def("Lottie File Previewer", "Preview any .lottie / .json"),
    def("Lottie Speed Controller", "Tune playback speed"),
    def("Lottie Color Editor", "Recolor Lottie layers"),
    def("Lottie Frame Inspector", "Inspect individual frames"),
    def("Lottie Loop Planner", "Plan loop ranges"),
    def("Lottie to GIF Converter", "Convert Lottie to GIF"),
    def("Lottie to MP4 Converter", "Convert Lottie to MP4"),
    def("Lottie Asset Manager", "Manage Lottie assets"),
  ]),
  buildCat("Sprite & Frame Animation", [
    def("Sprite Sheet Animator", "Animate from a sprite sheet"),
    def("Sprite Sheet Slicer", "Slice sheets into frames"),
    def("Flipbook Animator", "Old-school flipbook animations"),
    def("Frame-by-Frame Animator", "Hand-keyed frame animation"),
    def("Pixel Art Animator", "Animate pixel art"),
    def("GIF Maker", "Compose GIFs from frames"),
    def("GIF Editor", "Edit GIF frames and timing"),
    def("GIF Optimizer", "Shrink GIF size"),
    def("GIF Speed Controller", "Change GIF playback speed"),
    def("GIF Frame Extractor", "Extract frames from GIF"),
  ]),
  buildCat("Canvas & WebGL Animation", [
    def("Canvas Particle System", "Particle systems on canvas"),
    def("Canvas Wave Animator", "Wave & sine animations"),
    def("Canvas Fireworks Generator", "Fireworks on canvas"),
    def("Canvas Physics Simulator", "Simple physics playground"),
    def("Canvas Cloth Simulator", "Cloth-style mesh simulation"),
    def("Canvas Ripple Effect", "Interactive ripples"),
    def("WebGL Shader Preview", "Preview GLSL shaders"),
    def("WebGL Geometry Animator", "Animate 3D geometry"),
    def("WebGL Terrain Animator", "Animated terrain"),
    def("WebGL Fluid Simulator", "Fluid dynamics demo"),
    def("Canvas Confetti Animator", "Confetti bursts"),
    def("Canvas Spirograph Maker", "Generate spirograph art"),
  ]),
  buildCat("Motion Design", [
    def("Easing Curve Visualizer", "Visualize easing curves"),
    def("Motion Blur Preview", "Preview motion blur"),
    def("Squash & Stretch Animator", "Classic squash and stretch"),
    def("Anticipation & Follow Through Preview", "Preview anticipation"),
    def("Timing Chart Builder", "Animator's timing charts"),
    def("Motion Path Visualizer", "Visualize complex motion paths"),
    def("Keyframe Timeline Builder", "Build keyframe timelines"),
    def("Stagger Animation Builder", "Staggered reveal builder"),
    def("Spring Physics Animator", "Spring-based motion"),
    def("Bounce Animation Builder", "Bounce effect presets"),
    def("Overshoot Animator", "Overshoot motion preview"),
    def("Inertia Effect Preview", "Friction and inertia demo"),
  ]),
  buildCat("UI & Microinteractions", [
    def("Button Hover Animation Builder", "Hover effects for buttons"),
    def("Toggle Animation Designer", "Animated switch/toggles"),
    def("Checkbox Animation Maker", "Custom checkbox states"),
    def("Like Button Animation", "Heart/like burst animations"),
    def("Loading State Animator", "Skeleton loaders & spinners"),
    def("Progress Animation Builder", "Progress bar transitions"),
    def("Notification Bounce Animator", "Notification toasts"),
    def("Card Flip Animator", "3D card flip effects"),
    def("Drawer Slide Animator", "Off-canvas menus"),
    def("Tab Transition Builder", "Tab switching effects"),
  ]),
  buildCat("Typography & Text", [
    def("Typewriter Effect Builder", "Classic typewriter text"),
    def("Text Fade-in Animator", "Smooth text reveals"),
    def("Word Shuffle Animator", "Random character decode"),
    def("Letter Scramble Animator", "Hacker-style scramble"),
    def("Text Glitch Animator", "Cyberpunk glitch effects"),
    def("Kinetic Typography Builder", "Kinetic text layouts"),
    def("Scroll-Triggered Text Revealer", "Reveal on scroll"),
    def("Word-by-Word Animator", "Staggered word reveal"),
    def("Text Path Animator", "Text along SVG path"),
    def("Countdown Timer Animator", "Animated countdowns"),
  ]),
  buildCat("Export & Conversion", [
    def("Animation to GIF Exporter", "Export web animations to GIF"),
    def("Animation to MP4 Exporter", "Export to video"),
    def("Animation to Lottie Exporter", "Convert to JSON"),
    def("Animation to APNG Exporter", "Export as APNG"),
    def("Animation to WebP Exporter", "Export as animated WebP"),
    def("Animation Frame Exporter", "Extract PNG sequence"),
    def("Animation Speed Validator", "Validate playback performance"),
    def("Animation File Size Optimizer", "Optimize file sizes"),
  ]),
  buildCat("Specialized & Creative", [
    def("Generative Art Animator", "Generative animated art"),
    def("Wave Function Collapse Animator", "WFC visualizations"),
    def("Procedural Tree Animator", "Grow procedural trees"),
    def("Fractal Zoom Animator", "Zoom into fractals"),
    def("Noise Field Animator", "Perlin/simplex noise fields"),
    def("Voronoi Diagram Animator", "Animated Voronoi"),
    def("Reaction-Diffusion Simulator", "Reaction-diffusion patterns"),
    def("Cellular Automata Animator", "Cellular automata"),
    def("L-System Plant Animator", "L-system plant growth"),
    def("Mandelbrot Zoom Tool", "Zoom into the Mandelbrot set"),
  ]),
  buildCat("Accessibility & QA", [
    def("Animation Reduced Motion Checker", "Check reduced-motion support"),
    def("Animation Speed Accessibility Tester", "Test speed accessibility"),
    def("Flicker Frequency Checker", "Seizure safety check"),
    def("Animation Contrast Checker", "Check contrast during motion"),
    def("Animation Duration Auditor", "Audit animation durations"),
    def("CSS Prefers-Reduced-Motion Preview", "Preview reduced motion"),
    def("Animation Complexity Grader", "Grade animation complexity"),
    def("Frame Rate Drop Simulator", "Simulate FPS drops"),
    def("Animation Performance Estimator", "Estimate runtime cost"),
    def("Animation A11y Documentation Tool", "Generate a11y docs"),
  ])
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools as Tool[]);
export const totalCount = allTools.length;
export const TOOLS_BY_SLUG = new Map(allTools.map(t => [t.slug, t]));

export function findTool(s: string): { tool: Tool; category: string } | null {
  for (const c of categories) {
    const t = c.tools.find((t) => t.slug === s);
    if (t) return { tool: t as Tool, category: c.name };
  }
  return null;
}

export const SEARCH_REGISTRY: ToolResult[] = categories.flatMap((cat) =>
  cat.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    slug: tool.slug,
    href: `/animator/${tool.slug}`,
    category: cat.name,
    isBuilt: tool.status === "live",
  }))
);
