import { Pipette, Palette, Image as ImageIcon, Droplet, Shuffle, Hash, ListChecks, Repeat, Sun, Moon, Sparkles, Eye, EyeOff, Wand2, Layers, SlidersHorizontal, Contrast, Type as TypeIcon, Accessibility, Brush, Grid3x3, FlaskConical, Blend, RotateCcw, Replace, Crosshair, MousePointer2, Target, ScanLine, BarChart3, Circle, Triangle, Square, Hexagon, PaintBucket, Gauge, Code2, Compass, ArrowLeftRight, Lightbulb, Ruler, FileJson, Braces, Boxes, Star, Leaf, Flower2, Flame, Award, Aperture, Tag, Sigma, Heart, Music, Gamepad2, Sunrise, Cpu, Globe, Smile, Calendar, Snowflake, TreePine, Mountain, Rocket, Atom, Waves, Crown, Sword, Skull, Zap, Smartphone, Pencil, Clock, Camera, Bookmark, Layers3, Image, FileImage, FileCode, FileText, History } from "lucide-react"; import type { ToolDef } from "./types";




// ---- Themed palette presets ----




































































export const TOOLS: ToolDef[] = [
  // ===== Color Pickers (12) =====
  { slug: "color-picker", name: "Color Picker", description: "Pick any color visually", category: "pickers", icon: Pipette, status: "live" },
  { slug: "eyedropper-tool", name: "Eyedropper Tool", description: "Sample a color from anywhere on screen", category: "pickers", icon: Crosshair, status: "live" },
  { slug: "screen-color-picker", name: "Screen Color Picker", description: "Pick a color from your screen", category: "pickers", icon: MousePointer2, status: "live" },
  { slug: "pixel-color-picker", name: "Pixel Color Picker", description: "Read the exact color of any pixel", category: "pickers", icon: Target, status: "live" },
  { slug: "multi-color-picker", name: "Multi-Color Picker", description: "Pick several colors at once", category: "pickers", icon: Layers, status: "live" },
  { slug: "color-picker-with-history", name: "Color Picker with History", description: "Pick colors and keep a recent history", category: "pickers", icon: History, status: "live" },
  { slug: "color-picker-with-favorites", name: "Color Picker with Favorites", description: "Save your favorite colors as you pick", category: "pickers", icon: Bookmark, status: "live" },
  { slug: "color-comparison-tool", name: "Color Comparison Tool", description: "Compare two colors side-by-side", category: "pickers", icon: ArrowLeftRight, status: "live" },
  { slug: "color-stack-viewer", name: "Color Stack Viewer", description: "Stack colors and inspect them together", category: "pickers", icon: Layers3, status: "live" },
  { slug: "image-color-picker", name: "Image Color Picker", description: "Pick colors directly from an image", category: "pickers", icon: ImageIcon, status: "live" },
  { slug: "webcam-color-picker", name: "Webcam Color Picker", description: "Pick colors from a webcam snapshot", category: "pickers", icon: Camera, status: "live" },
  { slug: "color-preview-on-background", name: "Color Preview on Background", description: "Preview a color on any background", category: "pickers", icon: PaintBucket, status: "live" },

  // ===== Palette Tools (32) =====
  { slug: "monochromatic-palette-generator", name: "Monochromatic Palette Generator", description: "Variations on a single hue", category: "palettes", icon: Droplet, status: "live" },
  { slug: "analogous-palette-generator", name: "Analogous Palette Generator", description: "Three neighbouring hues", category: "palettes", icon: Hexagon, status: "live" },
  { slug: "complementary-palette-generator", name: "Complementary Palette Generator", description: "Base color and its complement", category: "palettes", icon: Circle, status: "live" },
  { slug: "split-complementary-palette-generator", name: "Split-Complementary Palette Generator", description: "Base + two neighbours of its complement", category: "palettes", icon: Compass, status: "live" },
  { slug: "triadic-palette-generator", name: "Triadic Palette Generator", description: "Three evenly spaced hues", category: "palettes", icon: Triangle, status: "live" },
  { slug: "tetradic-palette-generator", name: "Tetradic Palette Generator", description: "Four colors in a rectangular harmony", category: "palettes", icon: Square, status: "live" },
  { slug: "square-harmony-palette", name: "Square Harmony Palette", description: "Four colors evenly spaced (90°)", category: "palettes", icon: Square, status: "live" },
  { slug: "rectangle-harmony-palette", name: "Rectangle Harmony Palette", description: "Two complementary pairs in a rectangle", category: "palettes", icon: Square, status: "live" },
  { slug: "random-palette-generator", name: "Random Palette Generator", description: "Roll a fresh random palette", category: "palettes", icon: Shuffle, status: "live" },
  { slug: "palette-locker", name: "Palette Locker", description: "Lock colors and shuffle the rest", category: "palettes", icon: Bookmark, status: "live" },
  { slug: "single-color-to-full-palette", name: "Single Color to Full Palette", description: "Derive a complete palette from one color", category: "palettes", icon: Droplet, status: "live" },
  { slug: "5-color-palette-generator", name: "5-Color Palette Generator", description: "Generate a 5-color palette", category: "palettes", icon: Palette, status: "live" },
  { slug: "8-color-palette-generator", name: "8-Color Palette Generator", description: "Generate an 8-color palette", category: "palettes", icon: Palette, status: "live" },
  { slug: "10-color-palette-generator", name: "10-Color Palette Generator", description: "Generate a 10-color palette", category: "palettes", icon: Palette, status: "live" },
  { slug: "pastel-palette-generator", name: "Pastel Palette Generator", description: "Generate soft pastel palettes", category: "palettes", icon: Flower2, status: "live" },
  { slug: "neon-palette-generator", name: "Neon Palette Generator", description: "Generate vibrant neon palettes", category: "palettes", icon: Flame, status: "live" },
  { slug: "earth-tone-palette-generator", name: "Earth Tone Palette Generator", description: "Generate warm earth-tone palettes", category: "palettes", icon: Mountain, status: "live" },
  { slug: "ocean-beach-palette-generator", name: "Ocean & Beach Palette Generator", description: "Cool ocean and beach palettes", category: "palettes", icon: Waves, status: "live" },
  { slug: "forest-nature-palette-generator", name: "Forest & Nature Palette Generator", description: "Lush forest and nature palettes", category: "palettes", icon: TreePine, status: "live" },
  { slug: "sunset-palette-generator", name: "Sunset Palette Generator", description: "Generate warm sunset palettes", category: "palettes", icon: Sunrise, status: "live" },
  { slug: "vintage-retro-palette-generator", name: "Vintage & Retro Palette Generator", description: "Generate vintage retro palettes", category: "palettes", icon: Music, status: "live" },
  { slug: "dark-mode-palette-generator", name: "Dark Mode Palette Generator", description: "Generate palettes tuned for dark UIs", category: "palettes", icon: Moon, status: "live" },
  { slug: "light-mode-palette-generator", name: "Light Mode Palette Generator", description: "Generate palettes tuned for light UIs", category: "palettes", icon: Sun, status: "live" },
  { slug: "corporate-palette-generator", name: "Corporate Palette Generator", description: "Generate calm, professional palettes", category: "palettes", icon: Award, status: "live" },
  { slug: "seasonal-palette-generator", name: "Seasonal Palette Generator", description: "Spring, summer, autumn or winter palettes", category: "palettes", icon: Leaf, status: "live" },
  { slug: "material-palette-generator", name: "Material Palette Generator", description: "Generate Material Design palettes", category: "palettes", icon: Palette, status: "live" },
  { slug: "tailwind-palette-generator", name: "Tailwind Palette Generator", description: "Generate Tailwind-style 50→900 palettes", category: "palettes", icon: Palette, status: "live" },
  { slug: "brand-palette-generator", name: "Brand Palette Generator", description: "Generate a brand-ready palette", category: "palettes", icon: Award, status: "live" },
  { slug: "accessible-palette-generator", name: "Accessible Palette Generator", description: "Generate WCAG-AA palettes", category: "palettes", icon: Accessibility, status: "live" },
  { slug: "color-palette-extractor", name: "Color Palette Extractor", description: "Extract a palette from any image", category: "palettes", icon: ImageIcon, status: "live" },
  { slug: "daily-color-palette-generator", name: "Daily Color Palette Generator", description: "Get a fresh palette every day", category: "palettes", icon: Calendar, status: "live" },
  { slug: "wes-anderson-style-palette", name: "Wes Anderson Style Palette", description: "Pastel cinematic Wes Anderson palettes", category: "palettes", icon: Aperture, status: "live" },

  // ===== Accessibility (20) =====
  { slug: "contrast-checker", name: "Contrast Checker", description: "Check contrast ratio between two colors", category: "accessibility", icon: Contrast, status: "live" },
  { slug: "wcag-21-aa-checker", name: "WCAG 2.1 AA Checker", description: "Pass/fail WCAG 2.1 AA contrast", category: "accessibility", icon: Accessibility, status: "live" },
  { slug: "wcag-21-aaa-checker", name: "WCAG 2.1 AAA Checker", description: "Pass/fail WCAG 2.1 AAA contrast", category: "accessibility", icon: Accessibility, status: "live" },
  { slug: "wcag-30-apca-checker", name: "WCAG 3.0 APCA Checker", description: "Preview APCA-style perceptual contrast", category: "accessibility", icon: Accessibility, status: "live" },
  { slug: "large-text-contrast-checker", name: "Large Text Contrast Checker", description: "Contrast threshold for headings & large text", category: "accessibility", icon: TypeIcon, status: "live" },
  { slug: "ui-component-contrast-checker", name: "UI Component Contrast Checker", description: "Non-text contrast for UI elements (3:1)", category: "accessibility", icon: Boxes, status: "live" },
  { slug: "focus-indicator-contrast-checker", name: "Focus Indicator Contrast Checker", description: "Check focus ring contrast (3:1)", category: "accessibility", icon: Target, status: "live" },
  { slug: "accessible-color-pair-finder", name: "Accessible Color Pair Finder", description: "Find readable pairs for any base color", category: "accessibility", icon: Lightbulb, status: "live" },
  { slug: "contrast-ratio-calculator", name: "Contrast Ratio Calculator", description: "Compute the contrast ratio between two colors", category: "accessibility", icon: Gauge, status: "live" },
  { slug: "minimum-contrast-auto-fixer", name: "Minimum Contrast Auto-Fixer", description: "Auto-adjust a color to meet a target contrast", category: "accessibility", icon: Wand2, status: "live" },
  { slug: "color-blindness-simulator", name: "Color Blindness Simulator", description: "Simulate common color vision deficiencies", category: "accessibility", icon: Eye, status: "live" },
  { slug: "deuteranopia-simulator", name: "Deuteranopia Simulator", description: "Preview a color as a deuteranopic viewer sees it", category: "accessibility", icon: Eye, status: "live" },
  { slug: "protanopia-simulator", name: "Protanopia Simulator", description: "Preview a color as a protanopic viewer sees it", category: "accessibility", icon: Eye, status: "live" },
  { slug: "tritanopia-simulator", name: "Tritanopia Simulator", description: "Preview a color as a tritanopic viewer sees it", category: "accessibility", icon: Eye, status: "live" },
  { slug: "deuteranomaly-simulator", name: "Deuteranomaly Simulator", description: "Simulate partial deuteranomaly", category: "accessibility", icon: Eye, status: "live" },
  { slug: "protanomaly-simulator", name: "Protanomaly Simulator", description: "Simulate partial protanomaly", category: "accessibility", icon: Eye, status: "live" },
  { slug: "achromatopsia-simulator", name: "Achromatopsia Simulator", description: "Preview a color as a fully color-blind viewer sees it", category: "accessibility", icon: EyeOff, status: "live" },
  { slug: "color-blind-friendly-color-picker", name: "Color Blind Friendly Color Picker", description: "Pick colors that work for color-blind viewers", category: "accessibility", icon: Pipette, status: "live" },
  { slug: "color-blindness-test", name: "Color Blindness Test", description: "Take a quick color blindness test", category: "accessibility", icon: Eye, status: "live" },
  { slug: "text-readability-checker", name: "Text Readability Checker", description: "Check text readability over any color", category: "accessibility", icon: TypeIcon, status: "live" },

  // ===== Color Analysis (20) =====
  { slug: "color-name-lookup", name: "Color Name Lookup", description: "Look up the name of any color", category: "analysis", icon: Tag, status: "live" },
  { slug: "nearest-named-color-finder", name: "Nearest Named Color Finder", description: "Snap any color to the closest CSS name", category: "analysis", icon: Target, status: "live" },
  { slug: "color-mood-analyzer", name: "Color Mood Analyzer", description: "Analyze the mood of any color", category: "analysis", icon: Smile, status: "live" },
  { slug: "color-psychology-reference", name: "Color Psychology Reference", description: "Explore the psychology of any color", category: "analysis", icon: Lightbulb, status: "live" },
  { slug: "seasonal-color-finder", name: "Seasonal Color Finder", description: "Find the season a color belongs to", category: "analysis", icon: Leaf, status: "live" },
  { slug: "skin-tone-color-finder", name: "Skin Tone Color Finder", description: "Match a color to a skin tone scale", category: "analysis", icon: Heart, status: "live" },
  { slug: "relative-luminance-calculator", name: "Relative Luminance Calculator", description: "Compute relative luminance of any color", category: "analysis", icon: Sun, status: "live" },
  { slug: "perceptual-lightness-calculator", name: "Perceptual Lightness Calculator", description: "Compute OKLCH perceptual lightness", category: "analysis", icon: Sun, status: "live" },
  { slug: "color-distance-calculator", name: "Color Distance Calculator", description: "Compute perceptual distance between two colors", category: "analysis", icon: Ruler, status: "live" },
  { slug: "color-gamut-checker", name: "Color Gamut Checker", description: "Check if a color sits inside common gamuts", category: "analysis", icon: ScanLine, status: "live" },
  { slug: "color-temperature-analyzer", name: "Color Temperature Analyzer", description: "Estimate a Kelvin temperature from any color", category: "analysis", icon: Flame, status: "live" },
  { slug: "color-hierarchy-analyzer", name: "Color Hierarchy Analyzer", description: "Analyze the hierarchy of a palette", category: "analysis", icon: Layers, status: "live" },
  { slug: "color-swatch-generator", name: "Color Swatch Generator", description: "Generate a printable color swatch", category: "analysis", icon: Grid3x3, status: "live" },
  { slug: "color-wheel-interactive", name: "Color Wheel Interactive", description: "Interactive 24-hue color wheel with lightness", category: "analysis", icon: Aperture, status: "live" },
  { slug: "brand-color-extractor", name: "Brand Color Extractor", description: "Pull brand colors out of a logo or screenshot", category: "analysis", icon: Award, status: "live" },
  { slug: "print-color-accuracy-checker", name: "Print Color Accuracy Checker", description: "Estimate how a screen color prints", category: "analysis", icon: PaintBucket, status: "live" },
  { slug: "color-theory-reference-tool", name: "Color Theory Reference Tool", description: "Quick reference for color theory", category: "analysis", icon: Compass, status: "live" },
  { slug: "pantone-approximation-tool", name: "Pantone Approximation Tool", description: "Approximate Pantone matches for any color", category: "analysis", icon: Target, status: "live" },
  { slug: "color-naming-challenge", name: "Color Naming Challenge", description: "Guess the name of random colors", category: "analysis", icon: Gamepad2, status: "live" },
  { slug: "color-memory-test", name: "Color Memory Test", description: "Test how well you remember colors", category: "analysis", icon: Gamepad2, status: "live" },

  // ===== Color Manipulation (26) =====
  { slug: "color-shades-generator", name: "Color Shades Generator", description: "Generate darker shades of a color", category: "manipulation", icon: Moon, status: "live" },
  { slug: "color-tints-generator", name: "Color Tints Generator", description: "Generate lighter tints of a color", category: "manipulation", icon: Sun, status: "live" },
  { slug: "color-tones-generator", name: "Color Tones Generator", description: "Generate desaturated tones of a color", category: "manipulation", icon: SlidersHorizontal, status: "live" },
  { slug: "color-lighten-tool", name: "Color Lighten Tool", description: "Lighten any color by a percentage", category: "manipulation", icon: Sun, status: "live" },
  { slug: "color-darken-tool", name: "Color Darken Tool", description: "Darken any color by a percentage", category: "manipulation", icon: Moon, status: "live" },
  { slug: "saturation-booster", name: "Saturation Booster", description: "Increase color saturation", category: "manipulation", icon: SlidersHorizontal, status: "live" },
  { slug: "saturation-reducer", name: "Saturation Reducer", description: "Decrease color saturation", category: "manipulation", icon: SlidersHorizontal, status: "live" },
  { slug: "vibrance-adjuster", name: "Vibrance Adjuster", description: "Adjust the vibrance of any color", category: "manipulation", icon: Sparkles, status: "live" },
  { slug: "exposure-adjuster", name: "Exposure Adjuster", description: "Adjust the exposure of any color", category: "manipulation", icon: Sun, status: "live" },
  { slug: "color-mixer-2", name: "Color Mixer (2 colors)", description: "Mix two colors visually", category: "manipulation", icon: Blend, status: "live" },
  { slug: "color-mixer-3plus", name: "Color Mixer (3+ colors)", description: "Mix three or more colors together", category: "manipulation", icon: Blend, status: "live" },
  { slug: "color-blend-tool", name: "Color Blend Tool", description: "Blend two colors with adjustable ratio", category: "manipulation", icon: Blend, status: "live" },
  { slug: "color-temperature-adjuster", name: "Color Temperature Adjuster", description: "Shift a color toward warm or cool", category: "manipulation", icon: Flame, status: "live" },
  { slug: "warm-to-cool-color-shifter", name: "Warm to Cool Color Shifter", description: "Shift between warm and cool versions of a color", category: "manipulation", icon: Snowflake, status: "live" },
  { slug: "rgb-channel-adjuster", name: "RGB Channel Adjuster", description: "Adjust R, G, B channels independently", category: "manipulation", icon: SlidersHorizontal, status: "live" },
  { slug: "hsl-channel-adjuster", name: "HSL Channel Adjuster", description: "Adjust H, S, L channels independently", category: "manipulation", icon: SlidersHorizontal, status: "live" },
  { slug: "hue-rotator", name: "Hue Rotator", description: "Rotate the hue of any color", category: "manipulation", icon: RotateCcw, status: "live" },
  { slug: "opacity-calculator", name: "Opacity Calculator", description: "Calculate alpha blending values", category: "manipulation", icon: EyeOff, status: "live" },
  { slug: "opacity-layering-calculator", name: "Opacity Layering Calculator", description: "Stack semi-transparent colors", category: "manipulation", icon: Layers, status: "live" },
  { slug: "color-inverter", name: "Color Inverter", description: "Invert a color to its complementary RGB", category: "manipulation", icon: ArrowLeftRight, status: "live" },
  { slug: "color-replacer", name: "Color Replacer", description: "Replace one color with another in an image", category: "manipulation", icon: Replace, status: "live" },
  { slug: "color-complement-finder", name: "Color Complement Finder", description: "Find the complementary color (180° hue)", category: "manipulation", icon: Circle, status: "live" },
  { slug: "color-analogous-finder", name: "Color Analogous Finder", description: "Three neighbouring hues for harmony", category: "manipulation", icon: Hexagon, status: "live" },
  { slug: "color-triadic-finder", name: "Color Triadic Finder", description: "Three evenly spaced hues", category: "manipulation", icon: Triangle, status: "live" },
  { slug: "color-tetradic-finder", name: "Color Tetradic Finder", description: "Four colors in a rectangular harmony", category: "manipulation", icon: Square, status: "live" },
  { slug: "color-monochromatic-finder", name: "Color Monochromatic Finder", description: "Variations on a single hue", category: "manipulation", icon: Droplet, status: "live" },

  // ===== Gradient Tools (20) =====
  { slug: "linear-gradient-generator", name: "Linear Gradient Generator", description: "Build linear gradients with control over angle", category: "gradients", icon: ArrowLeftRight, status: "live" },
  { slug: "radial-gradient-generator", name: "Radial Gradient Generator", description: "Build radial gradients with shape & position", category: "gradients", icon: Circle, status: "live" },
  { slug: "conic-gradient-generator", name: "Conic Gradient Generator", description: "Build conic gradients with center & angle", category: "gradients", icon: RotateCcw, status: "live" },
  { slug: "hard-stop-gradient-generator", name: "Hard-Stop Gradient Generator", description: "Build sharp hard-stop gradients", category: "gradients", icon: SlidersHorizontal, status: "live" },
  { slug: "multi-stop-gradient-builder", name: "Multi-Stop Gradient Builder", description: "Stack many color stops in one gradient", category: "gradients", icon: Layers, status: "live" },
  { slug: "gradient-angle-adjuster", name: "Gradient Angle Adjuster", description: "Adjust the angle of a linear gradient", category: "gradients", icon: Compass, status: "live" },
  { slug: "gradient-color-stop-editor", name: "Gradient Color Stop Editor", description: "Add, move and tune individual gradient stops", category: "gradients", icon: SlidersHorizontal, status: "live" },
  { slug: "css-gradient-animation-generator", name: "CSS Gradient Animation Generator", description: "Generate animated CSS gradients", category: "gradients", icon: Sparkles, status: "live" },
  { slug: "mesh-gradient-generator", name: "Mesh Gradient Generator", description: "Generate multi-blob mesh gradients", category: "gradients", icon: Aperture, status: "live" },
  { slug: "svg-gradient-generator", name: "SVG Gradient Generator", description: "Generate SVG <linearGradient> markup", category: "gradients", icon: FileCode, status: "live" },
  { slug: "canvas-gradient-generator", name: "Canvas Gradient Generator", description: "Generate gradient code for HTML5 canvas", category: "gradients", icon: FileCode, status: "live" },
  { slug: "gradient-previewer", name: "Gradient Previewer", description: "Preview any CSS gradient instantly", category: "gradients", icon: Eye, status: "live" },
  { slug: "noise-grain-texture-generator", name: "Noise & Grain Texture Generator", description: "Add a noise or grain texture to a gradient", category: "gradients", icon: Wand2, status: "live" },
  { slug: "gradient-to-css-exporter", name: "Gradient to CSS Exporter", description: "Export a gradient as ready-to-paste CSS", category: "gradients", icon: Code2, status: "live" },
  { slug: "gradient-palette-mixer", name: "Gradient Palette Mixer", description: "Generate a discrete palette from a gradient", category: "gradients", icon: Palette, status: "live" },
  { slug: "gradient-collection-browser", name: "Gradient Collection Browser", description: "Browse an embedded collection of gradients", category: "gradients", icon: Grid3x3, status: "live" },
  { slug: "gradient-angle-calculator", name: "Gradient Angle Calculator", description: "Convert between angles and gradient directions", category: "gradients", icon: Compass, status: "live" },
  { slug: "css-gradient-to-image-exporter", name: "CSS Gradient to Image Exporter", description: "Render a CSS gradient as a downloadable image", category: "gradients", icon: FileImage, status: "live" },
  { slug: "gradient-from-image", name: "Gradient from Image", description: "Extract a gradient from any image", category: "gradients", icon: ImageIcon, status: "live" },
  { slug: "image-theme-generator", name: "Image Theme Generator", description: "Generate a UI theme from an image", category: "gradients", icon: ImageIcon, status: "live" },

  // ===== Design Effects (12) =====
  { slug: "glassmorphism-generator", name: "Glassmorphism Generator", description: "Design frosted-glass CSS surfaces", category: "effects", icon: Aperture, status: "live" },
  { slug: "neumorphism-generator", name: "Neumorphism Generator", description: "Design soft-UI dual-shadow CSS", category: "effects", icon: Boxes, status: "live" },
  { slug: "shadow-color-generator", name: "Shadow Color Generator", description: "Generate harmonious shadow colors", category: "effects", icon: Moon, status: "live" },
  { slug: "box-shadow-color-tool", name: "Box Shadow Color Tool", description: "Design CSS box-shadows with custom colors", category: "effects", icon: Square, status: "live" },
  { slug: "text-shadow-color-tool", name: "Text Shadow Color Tool", description: "Design CSS text-shadows with custom colors", category: "effects", icon: TypeIcon, status: "live" },
  { slug: "overlay-color-generator", name: "Overlay Color Generator", description: "Generate overlay colors for images and video", category: "effects", icon: Layers, status: "live" },
  { slug: "duotone-generator", name: "Duotone Generator", description: "Apply a duotone effect to any image", category: "effects", icon: Blend, status: "live" },
  { slug: "color-overlay-generator", name: "Color Overlay Generator", description: "Generate CSS color overlays with blend modes", category: "effects", icon: Layers, status: "live" },
  { slug: "frosted-glass-generator", name: "Frosted Glass Generator", description: "Design frosted-glass surfaces", category: "effects", icon: Aperture, status: "live" },
  { slug: "gradient-overlay-generator", name: "Gradient Overlay Generator", description: "Layer a gradient over an image", category: "effects", icon: Layers, status: "live" },
  { slug: "brand-style-guide-generator", name: "Brand Style Guide Generator", description: "Generate a mini brand style guide", category: "effects", icon: Award, status: "live" },
  { slug: "color-swatch-png-generator", name: "Color Swatch PNG Generator", description: "Export a palette as a PNG swatch sheet", category: "effects", icon: FileImage, status: "live" },

  // ===== CSS & Developer Output (22) =====
  { slug: "css-hsl-color-generator", name: "CSS HSL Color Generator", description: "Generate CSS hsl() values", category: "css", icon: Code2, status: "live" },
  { slug: "css-rgb-color-generator", name: "CSS RGB Color Generator", description: "Generate CSS rgb() values", category: "css", icon: Code2, status: "live" },
  { slug: "css-hex-color-generator", name: "CSS HEX Color Generator", description: "Generate CSS HEX color values", category: "css", icon: Code2, status: "live" },
  { slug: "css-color-formatter", name: "CSS Color Formatter", description: "Format any color into a CSS-ready string", category: "css", icon: Code2, status: "live" },
  { slug: "css-background-color-preview", name: "CSS Background Color Preview", description: "Preview a background color in CSS", category: "css", icon: PaintBucket, status: "live" },
  { slug: "css-text-color-preview", name: "CSS Text Color Preview", description: "Preview a text color in CSS", category: "css", icon: TypeIcon, status: "live" },
  { slug: "css-color-variables-generator", name: "CSS Color Variables Generator", description: "Generate CSS custom property color variables", category: "css", icon: Code2, status: "live" },
  { slug: "css-custom-properties-exporter", name: "CSS Custom Properties Exporter", description: "Export a palette as CSS custom properties", category: "css", icon: Code2, status: "live" },
  { slug: "scss-variable-generator", name: "SCSS Variable Generator", description: "Generate SCSS $color variables", category: "css", icon: Code2, status: "live" },
  { slug: "less-variable-generator", name: "LESS Variable Generator", description: "Generate LESS @color variables", category: "css", icon: Code2, status: "live" },
  { slug: "css-in-js-color-object-generator", name: "CSS-in-JS Color Object Generator", description: "Generate a colors object for styled-components", category: "css", icon: Code2, status: "live" },
  { slug: "design-token-generator", name: "Design Token Generator", description: "Export a palette as W3C design tokens", category: "css", icon: Braces, status: "live" },
  { slug: "figma-token-generator", name: "Figma Token Generator", description: "Export design tokens for Figma plugins", category: "css", icon: Pencil, status: "live" },
  { slug: "style-dictionary-format-generator", name: "Style Dictionary Format Generator", description: "Export tokens in Style Dictionary format", category: "css", icon: Braces, status: "live" },
  { slug: "tailwind-css-color-exporter", name: "Tailwind CSS Color Exporter", description: "Export a palette as Tailwind config", category: "css", icon: Code2, status: "live" },
  { slug: "material-ui-color-exporter", name: "Material UI Color Exporter", description: "Export a palette in Material UI format", category: "css", icon: Code2, status: "live" },
  { slug: "chakra-ui-color-exporter", name: "Chakra UI Color Exporter", description: "Export a palette for Chakra UI", category: "css", icon: Code2, status: "live" },
  { slug: "shadcn-ui-color-exporter", name: "Shadcn/ui Color Exporter", description: "Export shadcn/ui CSS variables", category: "css", icon: Code2, status: "live" },
  { slug: "bootstrap-color-exporter", name: "Bootstrap Color Exporter", description: "Export a palette as Bootstrap colors", category: "css", icon: Code2, status: "live" },
  { slug: "android-xml-color-generator", name: "Android XML Color Generator", description: "Generate Android colors.xml entries", category: "css", icon: Smartphone, status: "live" },
  { slug: "ios-swift-color-generator", name: "iOS Swift Color Generator", description: "Generate Swift UIColor declarations", category: "css", icon: Smartphone, status: "live" },
  { slug: "flutter-color-generator", name: "Flutter Color Generator", description: "Generate Dart Color() declarations", category: "css", icon: Smartphone, status: "live" },

  // ===== Design System References (12) =====
  { slug: "tailwind-color-reference", name: "Tailwind Color Reference", description: "Browse the full Tailwind palette", category: "designsys", icon: Grid3x3, status: "live" },
  { slug: "material-design-color-reference", name: "Material Design Color Reference", description: "Browse the Material Design palette", category: "designsys", icon: Grid3x3, status: "live" },
  { slug: "bootstrap-color-reference", name: "Bootstrap Color Reference", description: "Browse the Bootstrap theme palette", category: "designsys", icon: Grid3x3, status: "live" },
  { slug: "ant-design-color-reference", name: "Ant Design Color Reference", description: "Browse the Ant Design palette", category: "designsys", icon: Grid3x3, status: "live" },
  { slug: "fluent-ui-color-reference", name: "Fluent UI Color Reference", description: "Browse the Microsoft Fluent palette", category: "designsys", icon: Grid3x3, status: "live" },
  { slug: "chakra-ui-color-reference", name: "Chakra UI Color Reference", description: "Browse the Chakra UI palette", category: "designsys", icon: Grid3x3, status: "live" },
  { slug: "radix-color-reference", name: "Radix Color Reference", description: "Browse the Radix UI palette", category: "designsys", icon: Grid3x3, status: "live" },
  { slug: "open-color-reference", name: "Open Color Reference", description: "Browse the Open Color palette", category: "designsys", icon: Grid3x3, status: "live" },
  { slug: "ibm-carbon-color-reference", name: "IBM Carbon Color Reference", description: "Browse the IBM Carbon palette", category: "designsys", icon: Grid3x3, status: "live" },
  { slug: "adobe-spectrum-color-reference", name: "Adobe Spectrum Color Reference", description: "Browse Adobe Spectrum colors", category: "designsys", icon: Grid3x3, status: "live" },
  { slug: "github-primer-color-reference", name: "GitHub Primer Color Reference", description: "Browse GitHub Primer colors", category: "designsys", icon: Grid3x3, status: "live" },
  { slug: "atlassian-design-color-reference", name: "Atlassian Design Color Reference", description: "Browse Atlassian Design colors", category: "designsys", icon: Grid3x3, status: "live" },

  // ===== Color Data & Export (10) =====
  { slug: "color-json-generator", name: "Color JSON Generator", description: "Generate JSON for any color", category: "data", icon: FileJson, status: "live" },
  { slug: "color-token-generator", name: "Color Token Generator", description: "Generate design tokens for any color", category: "data", icon: Braces, status: "live" },
  { slug: "color-format-converter", name: "Color Format Converter", description: "Convert a color into every common format", category: "data", icon: Repeat, status: "live" },
  { slug: "color-csv-exporter", name: "Color CSV Exporter", description: "Export a palette as CSV", category: "data", icon: FileText, status: "live" },
  { slug: "color-array-generator", name: "Color Array Generator", description: "Generate a JavaScript color array", category: "data", icon: Code2, status: "live" },
  { slug: "color-object-generator", name: "Color Object Generator", description: "Generate a JavaScript color object", category: "data", icon: Braces, status: "live" },
  { slug: "color-palette-json-exporter", name: "Color Palette JSON Exporter", description: "Export a palette as JSON", category: "data", icon: FileJson, status: "live" },
  { slug: "color-palette-css-exporter", name: "Color Palette CSS Exporter", description: "Export a palette as CSS", category: "data", icon: FileCode, status: "live" },
  { slug: "color-palette-svg-exporter", name: "Color Palette SVG Exporter", description: "Export a palette as an SVG swatch", category: "data", icon: FileCode, status: "live" },
  { slug: "color-palette-png-generator", name: "Color Palette PNG Generator", description: "Export a palette as a PNG swatch sheet", category: "data", icon: FileImage, status: "live" },

  // ===== Fun & Creative (22) =====
  { slug: "random-color-generator", name: "Random Color Generator", description: "Generate beautiful random colors", category: "fun", icon: Shuffle, status: "live" },
  { slug: "random-accessible-color-generator", name: "Random Accessible Color Generator", description: "Generate accessible random colors", category: "fun", icon: Accessibility, status: "live" },
  { slug: "lucky-color-generator", name: "Lucky Color Generator", description: "Roll a single lucky color", category: "fun", icon: Star, status: "live" },
  { slug: "daily-color-generator", name: "Daily Color Generator", description: "Get a fresh color every day", category: "fun", icon: Calendar, status: "live" },
  { slug: "color-of-the-year-browser", name: "Color of the Year Browser", description: "Browse colors of the year by year", category: "fun", icon: Crown, status: "live" },
  { slug: "color-name-generator", name: "Color Name Generator", description: "Generate a fun name for any color", category: "fun", icon: Smile, status: "live" },
  { slug: "flag-color-extractor", name: "Flag Color Extractor", description: "Browse the colors of world flags", category: "fun", icon: Globe, status: "live" },
  { slug: "brand-color-library", name: "Brand Color Library", description: "Browse the colors of famous brands", category: "fun", icon: Award, status: "live" },
  { slug: "hair-color-reference", name: "Hair Color Reference", description: "Browse a reference of hair colors", category: "fun", icon: Heart, status: "live" },
  { slug: "eye-color-reference", name: "Eye Color Reference", description: "Browse a reference of eye colors", category: "fun", icon: Eye, status: "live" },
  { slug: "cultural-color-palettes", name: "Cultural Color Palettes", description: "Browse palettes from world cultures", category: "fun", icon: Globe, status: "live" },
  { slug: "rgb-cube-visualizer", name: "RGB Cube Visualizer", description: "Visualize colors in an RGB cube", category: "fun", icon: Boxes, status: "live" },
  { slug: "hue-circle-interactive", name: "Hue Circle Interactive", description: "Interactive circular hue picker", category: "fun", icon: Circle, status: "live" },
  { slug: "color-blending-art-tool", name: "Color Blending Art Tool", description: "Blend colors to create art", category: "fun", icon: Brush, status: "live" },
  { slug: "color-memory-game", name: "Color Memory Game", description: "Memorize and match colors", category: "fun", icon: Gamepad2, status: "live" },
  { slug: "pastel-color-generator", name: "Pastel Color Generator", description: "Generate soft pastel colors", category: "fun", icon: Flower2, status: "live" },
  { slug: "neon-color-generator", name: "Neon Color Generator", description: "Generate vibrant neon colors", category: "fun", icon: Flame, status: "live" },
  { slug: "muted-color-generator", name: "Muted Color Generator", description: "Generate muted, low-saturation colors", category: "fun", icon: Droplet, status: "live" },
  { slug: "warm-color-generator", name: "Warm Color Generator", description: "Generate warm-tone colors", category: "fun", icon: Flame, status: "live" },
  { slug: "cool-color-generator", name: "Cool Color Generator", description: "Generate cool-tone colors", category: "fun", icon: Snowflake, status: "live" },
  { slug: "earth-tone-color-generator", name: "Earth Tone Color Generator", description: "Generate earth-tone colors", category: "fun", icon: Mountain, status: "live" },
  { slug: "color-matching-game", name: "Color Matching Game", description: "Match colors to test your eye", category: "fun", icon: Gamepad2, status: "live" },

  // ===== Color Theory (18) =====
  { slug: "color-harmony-generator", name: "Color Harmony Generator", description: "Generate harmonies from any base color", category: "theory", icon: Compass, status: "live" },
  { slug: "color-wheel-theory-guide", name: "Color Wheel Theory Guide", description: "Learn the color wheel visually", category: "theory", icon: Circle, status: "live" },
  { slug: "simultaneous-contrast-visualizer", name: "Simultaneous Contrast Visualizer", description: "See how surrounding colors shift perception", category: "theory", icon: Contrast, status: "live" },
  { slug: "bezold-effect-visualizer", name: "Bezold Effect Visualizer", description: "Visualize the Bezold spreading effect", category: "theory", icon: Layers, status: "live" },
  { slug: "color-afterimage-tool", name: "Color Afterimage Tool", description: "Visualize the afterimage of staring at a color", category: "theory", icon: Eye, status: "live" },
  { slug: "color-context-simulator", name: "Color Context Simulator", description: "See the same color on different backgrounds", category: "theory", icon: Layers, status: "live" },
  { slug: "just-noticeable-difference-calculator", name: "Just Noticeable Difference Calculator", description: "Compute perceptual JND between two colors", category: "theory", icon: Ruler, status: "live" },
  { slug: "color-rendering-index-reference", name: "Color Rendering Index Reference", description: "Reference for CRI lighting scores", category: "theory", icon: Lightbulb, status: "live" },
  { slug: "munsell-color-system-reference", name: "Munsell Color System Reference", description: "Browse the Munsell color system", category: "theory", icon: Grid3x3, status: "live" },
  { slug: "natural-color-system-reference", name: "Natural Color System Reference", description: "Browse the Natural Color System", category: "theory", icon: Grid3x3, status: "live" },
  { slug: "pantone-to-hex-reference", name: "Pantone to HEX Reference", description: "Approximate Pantone colors in HEX", category: "theory", icon: Tag, status: "live" },
  { slug: "ral-to-hex-reference", name: "RAL to HEX Reference", description: "Approximate RAL colors in HEX", category: "theory", icon: Tag, status: "live" },
  { slug: "color-gamut-visualizer", name: "Color Gamut Visualizer", description: "Visualize where a color sits in common gamuts", category: "theory", icon: ScanLine, status: "live" },
  { slug: "color-symbolism-reference", name: "Color Symbolism Reference", description: "Reference for color symbolism worldwide", category: "theory", icon: Globe, status: "live" },
  { slug: "color-naming-history-tool", name: "Color Naming History Tool", description: "Browse the history of color names", category: "theory", icon: Clock, status: "live" },
  { slug: "color-trend-analyzer", name: "Color Trend Analyzer", description: "Analyze the trends in color over time", category: "theory", icon: BarChart3, status: "live" },
  { slug: "color-from-text-mood-tool", name: "Color from Text/Mood Tool", description: "Generate a palette from a text mood", category: "theory", icon: Sparkles, status: "live" },
  { slug: "color-blindness-test-ishihara", name: "Color Blindness Test (Ishihara-style)", description: "Take an Ishihara-style color blindness test", category: "theory", icon: Eye, status: "live" },
];

export const TOOLS_BY_SLUG: Record<string, ToolDef> = Object.fromEntries(
  TOOLS.map((t) => [(t as any).slug, t]),
);

export function toolsByCategory(): Record<string, ToolDef[]> {
  const out: Record<string, ToolDef[]> = {};
  for (const t of TOOLS) {
    (out[(t as any).category] ||= []).push(t);
  }
  return out;
}

