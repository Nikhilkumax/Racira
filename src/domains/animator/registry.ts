import { ToolResult } from "@/components/CategorySearch";

export type Tool = { name: string; slug: string; desc: string };
export type Category = { name: string; tools: Tool[] };

const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const mk = (name: string, desc: string): Tool => ({ name, slug: slug(name), desc });

export const categories: Category[] = [
  {
    name: "CSS Animation",
    tools: [
      mk("CSS Keyframe Builder", "Compose @keyframes visually"),
      mk("CSS Transition Builder", "Design CSS transitions"),
      mk("CSS Animation Preview", "Live preview any CSS animation"),
      mk("CSS Timing Function Editor", "Cubic bezier curve editor"),
      mk("CSS Animation Delay Planner", "Plan delays across elements"),
      mk("CSS Transform Animator", "Animate translate, rotate, scale"),
      mk("CSS Animation Chaining Tool", "Chain multiple animations"),
      mk("CSS Scroll Animation Builder", "Scroll-driven CSS animations"),
      mk("CSS Parallax Effect Builder", "Layered parallax effects"),
      mk("CSS 3D Transform Animator", "Animate in 3D space"),
      mk("CSS Animation Library Browser", "Browse ready-made animations"),
      mk("CSS Text Animation Builder", "Text-specific animations"),
      mk("CSS Loading Spinner Maker", "Design loading spinners"),
      mk("CSS Animation Code Exporter", "Export clean CSS code"),
    ],
  },
  {
    name: "SVG Animation",
    tools: [
      mk("SVG Animation Editor", "Edit SVG animations visually"),
      mk("SMIL Animation Builder", "Build SMIL-based animation"),
      mk("SVG Path Animation Tool", "Animate paths over time"),
      mk("SVG Morph Animator", "Morph between SVG shapes"),
      mk("SVG Stroke Dash Animator", "Animate stroke-dasharray"),
      mk("SVG Animate Transform Tool", "Animate SVG transforms"),
      mk("SVG Motion Path Builder", "Move along motion paths"),
      mk("SVG Clip Path Animator", "Animate SVG clip-paths"),
      mk("SVG Mask Animator", "Animate SVG masks"),
      mk("SVG Gradient Animator", "Animate SVG gradients"),
      mk("SVG Lottie Builder", "Build Lottie from SVG"),
      mk("SVG Animation Optimizer", "Optimize SVG animations"),
    ],
  },
  {
    name: "Lottie & JSON Animation",
    tools: [
      mk("Lottie File Previewer", "Preview any .lottie / .json"),
      mk("Lottie Speed Controller", "Tune playback speed"),
      mk("Lottie Color Editor", "Recolor Lottie layers"),
      mk("Lottie Frame Inspector", "Inspect individual frames"),
      mk("Lottie Loop Planner", "Plan loop ranges"),
      mk("Lottie to GIF Converter", "Convert Lottie to GIF"),
      mk("Lottie to MP4 Converter", "Convert Lottie to MP4"),
      mk("Lottie Asset Manager", "Manage Lottie assets"),
    ],
  },
  {
    name: "Sprite & Frame Animation",
    tools: [
      mk("Sprite Sheet Animator", "Animate from a sprite sheet"),
      mk("Sprite Sheet Slicer", "Slice sheets into frames"),
      mk("Flipbook Animator", "Old-school flipbook animations"),
      mk("Frame-by-Frame Animator", "Hand-keyed frame animation"),
      mk("Pixel Art Animator", "Animate pixel art"),
      mk("GIF Maker", "Compose GIFs from frames"),
      mk("GIF Editor", "Edit GIF frames and timing"),
      mk("GIF Optimizer", "Shrink GIF size"),
      mk("GIF Speed Controller", "Change GIF playback speed"),
      mk("GIF Frame Extractor", "Extract frames from GIF"),
    ],
  },
  {
    name: "Canvas & WebGL Animation",
    tools: [
      mk("Canvas Particle System", "Particle systems on canvas"),
      mk("Canvas Wave Animator", "Wave & sine animations"),
      mk("Canvas Fireworks Generator", "Fireworks on canvas"),
      mk("Canvas Physics Simulator", "Simple physics playground"),
      mk("Canvas Cloth Simulator", "Cloth-style mesh simulation"),
      mk("Canvas Ripple Effect", "Interactive ripples"),
      mk("WebGL Shader Preview", "Preview GLSL shaders"),
      mk("WebGL Geometry Animator", "Animate 3D geometry"),
      mk("WebGL Terrain Animator", "Animated terrain"),
      mk("WebGL Fluid Simulator", "Fluid dynamics demo"),
      mk("Canvas Confetti Animator", "Confetti bursts"),
      mk("Canvas Spirograph Maker", "Generate spirograph art"),
    ],
  },
  {
    name: "Motion Design",
    tools: [
      mk("Easing Curve Visualizer", "Visualize easing curves"),
      mk("Motion Blur Preview", "Preview motion blur"),
      mk("Squash & Stretch Animator", "Classic squash and stretch"),
      mk("Anticipation & Follow Through Preview", "Preview anticipation"),
      mk("Timing Chart Builder", "Animator's timing charts"),
      mk("Motion Path Visualizer", "Visualize motion paths"),
      mk("Keyframe Timeline Builder", "Multi-track keyframe timeline"),
      mk("Stagger Animation Builder", "Stagger many elements"),
      mk("Spring Physics Animator", "Spring-driven motion"),
      mk("Bounce Animation Builder", "Bounce easing curves"),
      mk("Overshoot Animator", "Overshoot and settle"),
      mk("Inertia Effect Preview", "Inertial scroll preview"),
    ],
  },
  {
    name: "UI Micro-Interactions",
    tools: [
      mk("Button Hover Animation Builder", "Design button hover states"),
      mk("Toggle Animation Designer", "Animated toggle switches"),
      mk("Checkbox Animation Maker", "Custom checkbox motion"),
      mk("Like Button Animation", "Like button bursts"),
      mk("Loading State Animator", "Loading indicators"),
      mk("Progress Animation Builder", "Animated progress bars"),
      mk("Notification Bounce Animator", "Toast/notification motion"),
      mk("Card Flip Animator", "3D card flips"),
      mk("Drawer Slide Animator", "Animated drawers/sheets"),
      mk("Tab Transition Builder", "Animated tab switches"),
    ],
  },
  {
    name: "Text Animation",
    tools: [
      mk("Typewriter Effect Builder", "Typewriter text reveal"),
      mk("Text Fade In Animator", "Fade in text smoothly"),
      mk("Word Shuffle Animator", "Shuffle words"),
      mk("Letter Scramble Animator", "Scramble individual letters"),
      mk("Text Glitch Animator", "Glitchy text effects"),
      mk("Kinetic Typography Builder", "Motion typography"),
      mk("Scroll-Triggered Text Revealer", "Reveal text on scroll"),
      mk("Word-by-Word Animator", "Animate one word at a time"),
      mk("Text Path Animator", "Animate text along a path"),
      mk("Countdown Timer Animator", "Animated countdowns"),
    ],
  },
  {
    name: "Export & Production",
    tools: [
      mk("Animation to GIF Exporter", "Export animations to GIF"),
      mk("Animation to MP4 Exporter", "Export animations to MP4"),
      mk("Animation to Lottie Exporter", "Export to Lottie JSON"),
      mk("Animation to APNG Exporter", "Export to APNG"),
      mk("Animation to WebP Exporter", "Export to animated WebP"),
      mk("Animation Frame Exporter", "Export frame sequences"),
      mk("Animation Speed Validator", "Validate playback speeds"),
      mk("Animation File Size Optimizer", "Optimize file sizes"),
    ],
  },
  {
    name: "Specialized & Creative",
    tools: [
      mk("Generative Art Animator", "Generative animated art"),
      mk("Wave Function Collapse Animator", "WFC visualizations"),
      mk("Procedural Tree Animator", "Grow procedural trees"),
      mk("Fractal Zoom Animator", "Zoom into fractals"),
      mk("Noise Field Animator", "Perlin/simplex noise fields"),
      mk("Voronoi Diagram Animator", "Animated Voronoi"),
      mk("Reaction-Diffusion Simulator", "Reaction-diffusion patterns"),
      mk("Cellular Automata Animator", "Cellular automata"),
      mk("L-System Plant Animator", "L-system plant growth"),
      mk("Mandelbrot Zoom Tool", "Zoom into the Mandelbrot set"),
    ],
  },
  {
    name: "Accessibility & QA",
    tools: [
      mk("Animation Reduced Motion Checker", "Check reduced-motion support"),
      mk("Animation Speed Accessibility Tester", "Test speed accessibility"),
      mk("Flicker Frequency Checker", "Seizure safety check"),
      mk("Animation Contrast Checker", "Check contrast during motion"),
      mk("Animation Duration Auditor", "Audit animation durations"),
      mk("CSS Prefers-Reduced-Motion Preview", "Preview reduced motion"),
      mk("Animation Complexity Grader", "Grade animation complexity"),
      mk("Frame Rate Drop Simulator", "Simulate FPS drops"),
      mk("Animation Performance Estimator", "Estimate runtime cost"),
      mk("Animation A11y Documentation Tool", "Generate a11y docs"),
    ],
  },
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools);
export const totalCount = allTools.length;

export function findTool(s: string): { tool: Tool; category: string } | null {
  for (const c of categories) {
    const t = c.tools.find((t) => (t as any).slug === s);
    if (t) return { tool: t, category: c.name };
  }
  return null;
}

export const SEARCH_REGISTRY: ToolResult[] = categories.flatMap((cat) =>
  cat.tools.map((tool) => ({
    name: tool.name,
    description: tool.desc,
    slug: tool.slug,
    href: `/animator/tool/${tool.slug}`,
    category: cat.name,
    isBuilt: false,
  }))
);
