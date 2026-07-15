import {
  Pipette, Palette, Image as ImageIcon, Droplet, Shuffle, Hash, ListChecks, Repeat, Sun, Moon, Sparkles, Eye, EyeOff, Wand2, Layers, SlidersHorizontal, Contrast, Type as TypeIcon, Accessibility, Brush, Grid3x3, FlaskConical, Blend, RotateCcw, Replace, Crosshair, MousePointer2, Target, ScanLine, BarChart3, Circle, Triangle, Square, Hexagon, PaintBucket, Gauge, Code2, Compass, ArrowLeftRight, Lightbulb, Ruler, FileJson, Braces, Boxes, Star, Leaf, Flower2, Flame, Award, Aperture, Tag, Sigma, Heart, Music, Gamepad2, Sunrise, Cpu, Globe, Smile, Calendar, Snowflake, TreePine, Mountain, Rocket, Atom, Waves, Crown, Sword, Skull, Zap, Smartphone, Pencil, Clock, Camera, Bookmark, Layers3, Image, FileImage, FileCode, FileText, History, LayoutGrid, AlignJustify, List, ListOrdered, LayoutTemplate, Wind, Briefcase, CheckSquare, CheckCircle2, BookOpen, Glasses, ScanEye, View, Spline, Stethoscope, Search, Sunset, Brain, CloudRain, SunDim, TrendingUp, TrendingDown, Settings2, ListFilter, Combine, Merge, MousePointerClick, Calculator, ImagePlus, AlignVerticalSpaceBetween, Variable, Download, FileCode2, FileDigit, Box, Package, Book, Apple, SmartphoneNfc, CircleDot, Unlock, Database, Github, Kanban, Code, Map, Puzzle, CircleFadingPlus, PaintRoller, ZoomIn, AlignLeft
} from "lucide-react";
import type { ToolDef } from "./registry/types";

import {
  ColorConverter, ColorInfo, NamedColors, RandomColor, ColorFormatValidator,
  ColorMixer, ShadesGenerator, TintGenerator, ToneGenerator, LightenTool, DarkenTool,
  SaturationAdjuster, HueShift, OpacityCalculator, ColorInverter, ColorReplacer, ImageRecolor,
  ColorPicker, ImageColorPicker, MultiColorPicker, PixelColorPicker,
  PaletteGenerator, makeHarmony,
  GradientGenerator, GradientPreviewer, GradientAngleCalc, CSSGradientExporter, makeGradient,
  ContrastChecker, AccessiblePairFinder, ReadabilityChecker, ColorBlindnessSim, DuotoneGenerator,
  ExtractColors, PaletteFromImage, GradientFromImage, ImageTheme, ColorHistogram, DominantColor, AverageColor,
} from "./registry/impl";
import {
  ColorNameLookup, NearestColorFinder, ColorDistance, ColorPercentageAnalyzer,
  EyedropperTool,
  RandomPaletteGenerator, LuckyColorGenerator, PastelPaletteGenerator,
  NeonPaletteGenerator, SeasonalPaletteGenerator,
  TailwindPaletteGenerator, MaterialPaletteGenerator, BrandPaletteGenerator,
  TailwindColorReference, MaterialColorReference, BootstrapColorReference,
  FluentColorReference, ChakraColorReference,
  CssColorGenerator, CssColorConverter, CssColorFormatter, CssColorPreview, CssVariableGenerator,
  GlassmorphismGenerator, NeumorphismGenerator, ShadowColorGenerator, ColorOverlayGenerator,
  ColorJsonGenerator, ColorTokenGenerator, DesignTokenGenerator, CssVariablesExporter, TailwindColorExporter,
  ColorWheel,
} from "./registry/impl/extra";
import {
  makeThemedPalette, makeStyledColor, makeColorFilter, ColorBlender,
  makeScale, AdditiveMixer, SubtractiveMixer, RGBChannelMixer, CMYKChannelMixer,
  RelationshipExplorer, WarmCoolAnalyzer, SaturationExplorer, BrightnessExplorer,
  ColorPsychology, MoodColorGenerator, EmotionColorFinder, ZodiacColor,
  BirthMonthColor, PersonalityQuiz, LuckyNumberColor, makeNameGenerator,
  PaletteMixer, PaletteShuffler, PaletteSorter, PaletteExporter, PaletteImporter,
  PaletteComparison, PaletteBalance, PaletteAccessibility, PaletteFromSingle,
  makeContrastChecker, AccessiblePaletteGenerator,
  CVDProtanopia, CVDDeuteranopia, CVDTritanopia, CVDAchromatopsia,
  ColorTemperature, ColorGamutChecker, PrintColorAccuracy,
  CssShadowGenerator, CssBorderGenerator, CssFilterGenerator, CssBackdropFilter,
  TailwindClassGenerator, makeVarGenerator, makeNativeColorExport,
  GradientStopEditor, MeshGradient, GradientPresets, GradientInterpolator,
  GradientPaletteGenerator, TransparentGradient, TextGradient, BackgroundGradient,
  AnimatedGradient, GradientReverser, GradientNoise, GradientCollection,
  AntColorReference, RadixColorReference, OpenColorReference, CarbonColorReference, SalesforceColorReference,
  HtmlColorReference, WebSafeColors,
  ColorOfTheYear, CulturalPalettes, FlagExplorer, BrandColorLibrary,
  SimultaneousContrast, AfterimageSimulator, OpticalMixing, ColorContext,
  VisualWeight, ColorHierarchy, ColorStrategy, ColorPlayground,
  PrimarySecondaryTertiary, HarmonyVisualizer, InteractiveColorWheel, ColorLearningPlayground,
  AlphaColorGenerator, ColorVariations, ColorShiftGenerator,
  HexToColorName, RgbToColorName, ColorNameFinder, CssNamedColorFinder,
} from "./registry/impl/extra2";

// ---- Themed palette presets ----
const cyberpunk = makeThemedPalette({ Cyberpunk: { hues: [310, 280, 200, 160, 50], l: [0.55, 0.7], c: [0.2, 0.3] } });
const vaporwave = makeThemedPalette({ Vaporwave: { hues: [320, 280, 200, 180, 30], l: [0.7, 0.85], c: [0.1, 0.2] } });
const anime = makeThemedPalette({ Anime: { hues: [340, 30, 200, 120, 280], l: [0.6, 0.8], c: [0.15, 0.25] } });
const scifi = makeThemedPalette({ "Sci-Fi": { hues: [200, 220, 180, 280, 60], l: [0.3, 0.7], c: [0.1, 0.25] } });
const fantasy = makeThemedPalette({ Fantasy: { hues: [260, 30, 140, 350, 200], l: [0.4, 0.7], c: [0.15, 0.25] } });
const ocean = makeThemedPalette({ Ocean: { hues: [200, 210, 190, 220, 180], l: [0.4, 0.75], c: [0.08, 0.18] } });
const sunset = makeThemedPalette({ Sunset: { hues: [10, 30, 350, 50, 320], l: [0.55, 0.78], c: [0.15, 0.22] } });
const space = makeThemedPalette({ Space: { hues: [260, 280, 220, 300, 240], l: [0.15, 0.55], c: [0.1, 0.2] } });
const festival = makeThemedPalette({ Festival: { hues: [0, 60, 180, 280, 320], l: [0.55, 0.75], c: [0.18, 0.28] } });
const wedding = makeThemedPalette({ Wedding: { hues: [350, 30, 60, 0, 20], l: [0.75, 0.92], c: [0.05, 0.12] } });
const gaming = makeThemedPalette({ Gaming: { hues: [340, 280, 200, 120, 30], l: [0.5, 0.7], c: [0.2, 0.32] } });
const retro = makeThemedPalette({ Retro: { hues: [30, 0, 200, 60, 140], l: [0.45, 0.65], c: [0.1, 0.18] } });
const nature = makeThemedPalette({ Nature: { hues: [120, 90, 30, 70, 200], l: [0.4, 0.7], c: [0.08, 0.18] } });
const business = makeThemedPalette({ Business: { hues: [220, 200, 240, 0, 30], l: [0.35, 0.65], c: [0.04, 0.12] } });
const dark = makeThemedPalette({ Dark: { hues: [220, 240, 260, 200, 280], l: [0.15, 0.4], c: [0.04, 0.12] } });
const light = makeThemedPalette({ Light: { hues: [220, 200, 180, 0, 30], l: [0.85, 0.97], c: [0.02, 0.08] } });
const earth = makeThemedPalette({ Earth: { hues: [30, 50, 80, 20, 10], l: [0.35, 0.65], c: [0.06, 0.14] } });
const forest = makeThemedPalette({ Forest: { hues: [120, 90, 70, 140, 40], l: [0.3, 0.6], c: [0.08, 0.16] } });
const beach = makeThemedPalette({ Beach: { hues: [200, 180, 50, 30, 220], l: [0.55, 0.85], c: [0.08, 0.16] } });
const vintage = makeThemedPalette({ Vintage: { hues: [30, 10, 60, 200, 350], l: [0.4, 0.7], c: [0.08, 0.16] } });
const wesAnderson = makeThemedPalette({ "Wes Anderson": { hues: [30, 350, 60, 180, 20], l: [0.5, 0.8], c: [0.1, 0.2] } });
const skinTones = makeThemedPalette({ Skin: { hues: [25, 30, 20, 15, 35], l: [0.35, 0.85], c: [0.04, 0.12] } });
const hairTones = makeThemedPalette({ Hair: { hues: [30, 15, 0, 45, 60], l: [0.1, 0.85], c: [0.02, 0.12] } });
const eyeTones = makeThemedPalette({ Eyes: { hues: [200, 120, 30, 260, 0], l: [0.25, 0.55], c: [0.06, 0.16] } });

const Warm = makeStyledColor("warm");
const Cool = makeStyledColor("cool");
const Muted = makeStyledColor("muted");
const Vibrant = makeStyledColor("vibrant");

const Grayscale = makeColorFilter("grayscale");
const Sepia = makeColorFilter("sepia");
const Bright = makeColorFilter("brightness");
const ContrastAdj = makeColorFilter("contrast");

const ValueScale = makeScale("value");
const ChromaScale = makeScale("chroma");
const HueScale = makeScale("hue");

const SCSSVars = makeVarGenerator("scss");
const LESSVars = makeVarGenerator("less");
const StyledVars = makeVarGenerator("styled");
const AndroidExport = makeNativeColorExport("android");
const IOSExport = makeNativeColorExport("ios");
const FlutterExport = makeNativeColorExport("flutter");
const FigmaExport = makeNativeColorExport("figma");

const AAChecker = makeContrastChecker(4.5, "WCAG 2.1 AA");
const AAAChecker = makeContrastChecker(7, "WCAG 2.1 AAA");
const APCAChecker = makeContrastChecker(4.5, "WCAG 3.0 APCA (approx.)");
const LargeText = makeContrastChecker(3, "Large text AA");
const UIComponent = makeContrastChecker(3, "UI component (3:1)");
const FocusIndicator = makeContrastChecker(3, "Focus indicator (3:1)");

const NicknameGen = makeNameGenerator("Color nickname");

const Comp = makeHarmony("complementary");
const Anal = makeHarmony("analogous");
const Tri = makeHarmony("triadic");
const Tet = makeHarmony("tetradic");
const Split = makeHarmony("split");
const Mono = makeHarmony("mono");

const Linear = makeGradient("linear");
const Radial = makeGradient("radial");
const Conic = makeGradient("conic");
const Multi = makeGradient("multi");

export const TOOLS: ToolDef[] = [
  // ===== Color Pickers (12) =====
  { slug: "color-picker", name: "Color Picker", description: "Pick any color visually", category: "pickers", icon: Pipette, component: ColorPicker, status: "live" },
  { slug: "eyedropper-tool", name: "Eyedropper Tool", description: "Sample a color from anywhere on screen", category: "pickers", icon: Crosshair, component: EyedropperTool, status: "live" },
  { slug: "screen-color-picker", name: "Screen Color Picker", description: "Pick a color from your screen", category: "pickers", icon: MousePointer2, component: EyedropperTool, status: "live" },
  { slug: "pixel-color-picker", name: "Pixel Color Picker", description: "Read the exact color of any pixel", category: "pickers", icon: Target, component: PixelColorPicker, status: "live" },
  { slug: "multi-color-picker", name: "Multi-Color Picker", description: "Pick several colors at once", category: "pickers", icon: Layers, component: MultiColorPicker, status: "live" },
  { slug: "color-picker-with-history", name: "Color Picker with History", description: "Pick colors and keep a recent history", category: "pickers", icon: History, component: ColorPicker, status: "live" },
  { slug: "color-picker-with-favorites", name: "Color Picker with Favorites", description: "Save your favorite colors as you pick", category: "pickers", icon: Bookmark, component: ColorPicker, status: "live" },
  { slug: "color-comparison-tool", name: "Color Comparison Tool", description: "Compare two colors side-by-side", category: "pickers", icon: ArrowLeftRight, component: ColorDistance, status: "live" },
  { slug: "color-stack-viewer", name: "Color Stack Viewer", description: "Stack colors and inspect them together", category: "pickers", icon: Layers3, component: MultiColorPicker, status: "live" },
  { slug: "image-color-picker", name: "Image Color Picker", description: "Pick colors directly from an image", category: "pickers", icon: ImageIcon, component: ImageColorPicker, status: "live" },
  { slug: "webcam-color-picker", name: "Webcam Color Picker", description: "Pick colors from a webcam snapshot", category: "pickers", icon: Camera, component: ImageColorPicker, status: "live" },
  { slug: "color-preview-on-background", name: "Color Preview on Background", description: "Preview a color on any background", category: "pickers", icon: PaintBucket, component: CssColorPreview, status: "live" },

  // ===== Palette Tools (32) =====
  { slug: "monochromatic-palette-generator", name: "Monochromatic Palette Generator", description: "Variations on a single hue", category: "palettes", icon: Droplet, component: Mono, status: "live" },
  { slug: "analogous-palette-generator", name: "Analogous Palette Generator", description: "Three neighbouring hues", category: "palettes", icon: Hexagon, component: Anal, status: "live" },
  { slug: "complementary-palette-generator", name: "Complementary Palette Generator", description: "Base color and its complement", category: "palettes", icon: Circle, component: Comp, status: "live" },
  { slug: "split-complementary-palette-generator", name: "Split-Complementary Palette Generator", description: "Base + two neighbours of its complement", category: "palettes", icon: Compass, component: Split, status: "live" },
  { slug: "triadic-palette-generator", name: "Triadic Palette Generator", description: "Three evenly spaced hues", category: "palettes", icon: Triangle, component: Tri, status: "live" },
  { slug: "tetradic-palette-generator", name: "Tetradic Palette Generator", description: "Four colors in a rectangular harmony", category: "palettes", icon: Square, component: Tet, status: "live" },
  { slug: "square-harmony-palette", name: "Square Harmony Palette", description: "Four colors evenly spaced (90°)", category: "palettes", icon: LayoutGrid, component: Tet, status: "live" },
  { slug: "rectangle-harmony-palette", name: "Rectangle Harmony Palette", description: "Two complementary pairs in a rectangle", category: "palettes", icon: AlignJustify, component: Tet, status: "live" },
  { slug: "random-palette-generator", name: "Random Palette Generator", description: "Roll a fresh random palette", category: "palettes", icon: Shuffle, component: RandomPaletteGenerator, status: "live" },
  { slug: "palette-locker", name: "Palette Locker", description: "Lock colors and shuffle the rest", category: "palettes", icon: Bookmark, component: PaletteShuffler, status: "live" },
  { slug: "single-color-to-full-palette", name: "Single Color to Full Palette", description: "Derive a complete palette from one color", category: "palettes", icon: Palette, component: PaletteFromSingle, status: "live" },
  { slug: "5-color-palette-generator", name: "5-Color Palette Generator", description: "Generate a 5-color palette", category: "palettes", icon: List, component: PaletteGenerator, status: "live" },
  { slug: "8-color-palette-generator", name: "8-Color Palette Generator", description: "Generate an 8-color palette", category: "palettes", icon: ListChecks, component: PaletteGenerator, status: "live" },
  { slug: "10-color-palette-generator", name: "10-Color Palette Generator", description: "Generate a 10-color palette", category: "palettes", icon: ListOrdered, component: PaletteGenerator, status: "live" },
  { slug: "pastel-palette-generator", name: "Pastel Palette Generator", description: "Generate soft pastel palettes", category: "palettes", icon: Flower2, component: PastelPaletteGenerator, status: "live" },
  { slug: "neon-palette-generator", name: "Neon Palette Generator", description: "Generate vibrant neon palettes", category: "palettes", icon: Flame, component: NeonPaletteGenerator, status: "live" },
  { slug: "earth-tone-palette-generator", name: "Earth Tone Palette Generator", description: "Generate warm earth-tone palettes", category: "palettes", icon: Mountain, component: earth, status: "live" },
  { slug: "ocean-beach-palette-generator", name: "Ocean & Beach Palette Generator", description: "Cool ocean and beach palettes", category: "palettes", icon: Waves, component: beach, status: "live" },
  { slug: "forest-nature-palette-generator", name: "Forest & Nature Palette Generator", description: "Lush forest and nature palettes", category: "palettes", icon: TreePine, component: forest, status: "live" },
  { slug: "sunset-palette-generator", name: "Sunset Palette Generator", description: "Generate warm sunset palettes", category: "palettes", icon: Sunrise, component: sunset, status: "live" },
  { slug: "vintage-retro-palette-generator", name: "Vintage & Retro Palette Generator", description: "Generate vintage retro palettes", category: "palettes", icon: Music, component: vintage, status: "live" },
  { slug: "dark-mode-palette-generator", name: "Dark Mode Palette Generator", description: "Generate palettes tuned for dark UIs", category: "palettes", icon: Moon, component: dark, status: "live" },
  { slug: "light-mode-palette-generator", name: "Light Mode Palette Generator", description: "Generate palettes tuned for light UIs", category: "palettes", icon: Sun, component: light, status: "live" },
  { slug: "corporate-palette-generator", name: "Corporate Palette Generator", description: "Generate calm, professional palettes", category: "palettes", icon: Award, component: business, status: "live" },
  { slug: "seasonal-palette-generator", name: "Seasonal Palette Generator", description: "Spring, summer, autumn or winter palettes", category: "palettes", icon: Leaf, component: SeasonalPaletteGenerator, status: "live" },
  { slug: "material-palette-generator", name: "Material Palette Generator", description: "Generate Material Design palettes", category: "palettes", icon: LayoutTemplate, component: MaterialPaletteGenerator, status: "live" },
  { slug: "tailwind-palette-generator", name: "Tailwind Palette Generator", description: "Generate Tailwind-style 50→900 palettes", category: "palettes", icon: Wind, component: TailwindPaletteGenerator, status: "live" },
  { slug: "brand-palette-generator", name: "Brand Palette Generator", description: "Generate a brand-ready palette", category: "palettes", icon: Briefcase, component: BrandPaletteGenerator, status: "live" },
  { slug: "accessible-palette-generator", name: "Accessible Palette Generator", description: "Generate WCAG-AA palettes", category: "palettes", icon: Accessibility, component: AccessiblePaletteGenerator, status: "live" },
  { slug: "color-palette-extractor", name: "Color Palette Extractor", description: "Extract a palette from any image", category: "palettes", icon: ImageIcon, component: PaletteFromImage, status: "live" },
  { slug: "daily-color-palette-generator", name: "Daily Color Palette Generator", description: "Get a fresh palette every day", category: "palettes", icon: Calendar, component: RandomPaletteGenerator, status: "live" },
  { slug: "wes-anderson-style-palette", name: "Wes Anderson Style Palette", description: "Pastel cinematic Wes Anderson palettes", category: "palettes", icon: Aperture, component: wesAnderson, status: "live" },

  // ===== Accessibility (20) =====
  { slug: "contrast-checker", name: "Contrast Checker", description: "Check contrast ratio between two colors", category: "accessibility", icon: Contrast, component: ContrastChecker, status: "live" },
  { slug: "wcag-21-aa-checker", name: "WCAG 2.1 AA Checker", description: "Pass/fail WCAG 2.1 AA contrast", category: "accessibility", icon: Accessibility, component: AAChecker, status: "live" },
  { slug: "wcag-21-aaa-checker", name: "WCAG 2.1 AAA Checker", description: "Pass/fail WCAG 2.1 AAA contrast", category: "accessibility", icon: CheckSquare, component: AAAChecker, status: "live" },
  { slug: "wcag-30-apca-checker", name: "WCAG 3.0 APCA Checker", description: "Preview APCA-style perceptual contrast", category: "accessibility", icon: CheckCircle2, component: APCAChecker, status: "live" },
  { slug: "large-text-contrast-checker", name: "Large Text Contrast Checker", description: "Contrast threshold for headings & large text", category: "accessibility", icon: TypeIcon, component: LargeText, status: "live" },
  { slug: "ui-component-contrast-checker", name: "UI Component Contrast Checker", description: "Non-text contrast for UI elements (3:1)", category: "accessibility", icon: Boxes, component: UIComponent, status: "live" },
  { slug: "focus-indicator-contrast-checker", name: "Focus Indicator Contrast Checker", description: "Check focus ring contrast (3:1)", category: "accessibility", icon: Target, component: FocusIndicator, status: "live" },
  { slug: "accessible-color-pair-finder", name: "Accessible Color Pair Finder", description: "Find readable pairs for any base color", category: "accessibility", icon: Lightbulb, component: AccessiblePairFinder, status: "live" },
  { slug: "contrast-ratio-calculator", name: "Contrast Ratio Calculator", description: "Compute the contrast ratio between two colors", category: "accessibility", icon: Gauge, component: ContrastChecker, status: "live" },
  { slug: "minimum-contrast-auto-fixer", name: "Minimum Contrast Auto-Fixer", description: "Auto-adjust a color to meet a target contrast", category: "accessibility", icon: Wand2, component: AccessiblePairFinder, status: "live" },
  { slug: "color-blindness-simulator", name: "Color Blindness Simulator", description: "Simulate common color vision deficiencies", category: "accessibility", icon: Eye, component: ColorBlindnessSim, status: "live" },
  { slug: "deuteranopia-simulator", name: "Deuteranopia Simulator", description: "Preview a color as a deuteranopic viewer sees it", category: "accessibility", icon: Glasses, component: CVDDeuteranopia, status: "live" },
  { slug: "protanopia-simulator", name: "Protanopia Simulator", description: "Preview a color as a protanopic viewer sees it", category: "accessibility", icon: ScanEye, component: CVDProtanopia, status: "live" },
  { slug: "tritanopia-simulator", name: "Tritanopia Simulator", description: "Preview a color as a tritanopic viewer sees it", category: "accessibility", icon: View, component: CVDTritanopia, status: "live" },
  { slug: "deuteranomaly-simulator", name: "Deuteranomaly Simulator", description: "Simulate partial deuteranomaly", category: "accessibility", icon: ZoomIn, component: CVDDeuteranopia, status: "live" },
  { slug: "protanomaly-simulator", name: "Protanomaly Simulator", description: "Simulate partial protanomaly", category: "accessibility", icon: Spline, component: CVDProtanopia, status: "live" },
  { slug: "achromatopsia-simulator", name: "Achromatopsia Simulator", description: "Preview a color as a fully color-blind viewer sees it", category: "accessibility", icon: EyeOff, component: CVDAchromatopsia, status: "live" },
  { slug: "color-blind-friendly-color-picker", name: "Color Blind Friendly Color Picker", description: "Pick colors that work for color-blind viewers", category: "accessibility", icon: Pipette, component: AccessiblePairFinder, status: "live" },
  { slug: "color-blindness-test", name: "Color Blindness Test", description: "Take a quick color blindness test", category: "accessibility", icon: Stethoscope, component: ColorBlindnessSim, status: "live" },
  { slug: "text-readability-checker", name: "Text Readability Checker", description: "Check text readability over any color", category: "accessibility", icon: BookOpen, component: ReadabilityChecker, status: "live" },

  // ===== Color Analysis (20) =====
  { slug: "color-name-lookup", name: "Color Name Lookup", description: "Look up the name of any color", category: "analysis", icon: Tag, component: ColorNameLookup, status: "live" },
  { slug: "nearest-named-color-finder", name: "Nearest Named Color Finder", description: "Snap any color to the closest CSS name", category: "analysis", icon: Target, component: NearestColorFinder, status: "live" },
  { slug: "color-mood-analyzer", name: "Color Mood Analyzer", description: "Analyze the mood of any color", category: "analysis", icon: Smile, component: ColorPsychology, status: "live" },
  { slug: "color-psychology-reference", name: "Color Psychology Reference", description: "Explore the psychology of any color", category: "analysis", icon: Lightbulb, component: ColorPsychology, status: "live" },
  { slug: "seasonal-color-finder", name: "Seasonal Color Finder", description: "Find the season a color belongs to", category: "analysis", icon: Leaf, component: SeasonalPaletteGenerator, status: "live" },
  { slug: "skin-tone-color-finder", name: "Skin Tone Color Finder", description: "Match a color to a skin tone scale", category: "analysis", icon: Heart, component: skinTones, status: "live" },
  { slug: "relative-luminance-calculator", name: "Relative Luminance Calculator", description: "Compute relative luminance of any color", category: "analysis", icon: Sun, component: ColorInfo, status: "live" },
  { slug: "perceptual-lightness-calculator", name: "Perceptual Lightness Calculator", description: "Compute OKLCH perceptual lightness", category: "analysis", icon: Sunset, component: ColorInfo, status: "live" },
  { slug: "color-distance-calculator", name: "Color Distance Calculator", description: "Compute perceptual distance between two colors", category: "analysis", icon: Ruler, component: ColorDistance, status: "live" },
  { slug: "color-gamut-checker", name: "Color Gamut Checker", description: "Check if a color sits inside common gamuts", category: "analysis", icon: ScanLine, component: ColorGamutChecker, status: "live" },
  { slug: "color-temperature-analyzer", name: "Color Temperature Analyzer", description: "Estimate a Kelvin temperature from any color", category: "analysis", icon: Flame, component: ColorTemperature, status: "live" },
  { slug: "color-hierarchy-analyzer", name: "Color Hierarchy Analyzer", description: "Analyze the hierarchy of a palette", category: "analysis", icon: Layers, component: ColorHierarchy, status: "live" },
  { slug: "color-swatch-generator", name: "Color Swatch Generator", description: "Generate a printable color swatch", category: "analysis", icon: Grid3x3, component: PaletteExporter, status: "live" },
  { slug: "color-wheel-interactive", name: "Color Wheel Interactive", description: "Interactive 24-hue color wheel with lightness", category: "analysis", icon: Aperture, component: InteractiveColorWheel, status: "live" },
  { slug: "brand-color-extractor", name: "Brand Color Extractor", description: "Pull brand colors out of a logo or screenshot", category: "analysis", icon: Award, component: ExtractColors, status: "live" },
  { slug: "print-color-accuracy-checker", name: "Print Color Accuracy Checker", description: "Estimate how a screen color prints", category: "analysis", icon: PaintBucket, component: PrintColorAccuracy, status: "live" },
  { slug: "color-theory-reference-tool", name: "Color Theory Reference Tool", description: "Quick reference for color theory", category: "analysis", icon: Compass, component: ColorWheel, status: "live" },
  { slug: "pantone-approximation-tool", name: "Pantone Approximation Tool", description: "Approximate Pantone matches for any color", category: "analysis", icon: Search, component: NearestColorFinder, status: "live" },
  { slug: "color-naming-challenge", name: "Color Naming Challenge", description: "Guess the name of random colors", category: "analysis", icon: Gamepad2, component: PersonalityQuiz, status: "live" },
  { slug: "color-memory-test", name: "Color Memory Test", description: "Test how well you remember colors", category: "analysis", icon: Brain, component: PersonalityQuiz, status: "live" },

  // ===== Color Manipulation (26) =====
  { slug: "color-shades-generator", name: "Color Shades Generator", description: "Generate darker shades of a color", category: "manipulation", icon: Moon, component: ShadesGenerator, status: "live" },
  { slug: "color-tints-generator", name: "Color Tints Generator", description: "Generate lighter tints of a color", category: "manipulation", icon: Sun, component: TintGenerator, status: "live" },
  { slug: "color-tones-generator", name: "Color Tones Generator", description: "Generate desaturated tones of a color", category: "manipulation", icon: SlidersHorizontal, component: ToneGenerator, status: "live" },
  { slug: "color-lighten-tool", name: "Color Lighten Tool", description: "Lighten any color by a percentage", category: "manipulation", icon: SunDim, component: LightenTool, status: "live" },
  { slug: "color-darken-tool", name: "Color Darken Tool", description: "Darken any color by a percentage", category: "manipulation", icon: CloudRain, component: DarkenTool, status: "live" },
  { slug: "saturation-booster", name: "Saturation Booster", description: "Increase color saturation", category: "manipulation", icon: TrendingUp, component: SaturationAdjuster, status: "live" },
  { slug: "saturation-reducer", name: "Saturation Reducer", description: "Decrease color saturation", category: "manipulation", icon: TrendingDown, component: SaturationAdjuster, status: "live" },
  { slug: "vibrance-adjuster", name: "Vibrance Adjuster", description: "Adjust the vibrance of any color", category: "manipulation", icon: Sparkles, component: SaturationAdjuster, status: "live" },
  { slug: "exposure-adjuster", name: "Exposure Adjuster", description: "Adjust the exposure of any color", category: "manipulation", icon: Camera, component: Bright, status: "live" },
  { slug: "color-mixer-2", name: "Color Mixer (2 colors)", description: "Mix two colors visually", category: "manipulation", icon: Blend, component: ColorMixer, status: "live" },
  { slug: "color-mixer-3plus", name: "Color Mixer (3+ colors)", description: "Mix three or more colors together", category: "manipulation", icon: Combine, component: PaletteMixer, status: "live" },
  { slug: "color-blend-tool", name: "Color Blend Tool", description: "Blend two colors with adjustable ratio", category: "manipulation", icon: Merge, component: ColorBlender, status: "live" },
  { slug: "color-temperature-adjuster", name: "Color Temperature Adjuster", description: "Shift a color toward warm or cool", category: "manipulation", icon: Flame, component: HueShift, status: "live" },
  { slug: "warm-to-cool-color-shifter", name: "Warm to Cool Color Shifter", description: "Shift between warm and cool versions of a color", category: "manipulation", icon: Snowflake, component: HueShift, status: "live" },
  { slug: "rgb-channel-adjuster", name: "RGB Channel Adjuster", description: "Adjust R, G, B channels independently", category: "manipulation", icon: Settings2, component: RGBChannelMixer, status: "live" },
  { slug: "hsl-channel-adjuster", name: "HSL Channel Adjuster", description: "Adjust H, S, L channels independently", category: "manipulation", icon: ListFilter, component: ColorPicker, status: "live" },
  { slug: "hue-rotator", name: "Hue Rotator", description: "Rotate the hue of any color", category: "manipulation", icon: RotateCcw, component: HueShift, status: "live" },
  { slug: "opacity-calculator", name: "Opacity Calculator", description: "Calculate alpha blending values", category: "manipulation", icon: EyeOff, component: OpacityCalculator, status: "live" },
  { slug: "opacity-layering-calculator", name: "Opacity Layering Calculator", description: "Stack semi-transparent colors", category: "manipulation", icon: Layers, component: OpacityCalculator, status: "live" },
  { slug: "color-inverter", name: "Color Inverter", description: "Invert a color to its complementary RGB", category: "manipulation", icon: ArrowLeftRight, component: ColorInverter, status: "live" },
  { slug: "color-replacer", name: "Color Replacer", description: "Replace one color with another in an image", category: "manipulation", icon: Replace, component: ColorReplacer, status: "live" },
  { slug: "color-complement-finder", name: "Color Complement Finder", description: "Find the complementary color (180° hue)", category: "manipulation", icon: Circle, component: Comp, status: "live" },
  { slug: "color-analogous-finder", name: "Color Analogous Finder", description: "Three neighbouring hues for harmony", category: "manipulation", icon: Hexagon, component: Anal, status: "live" },
  { slug: "color-triadic-finder", name: "Color Triadic Finder", description: "Find triadic color harmonies from a base color", category: "manipulation", icon: Triangle, component: Tri, status: "live" },
  { slug: "color-tetradic-finder", name: "Color Tetradic Finder", description: "Find tetradic color harmonies from a base color", category: "manipulation", icon: Square, component: Tet, status: "live" },
  { slug: "color-monochromatic-finder", name: "Color Monochromatic Finder", description: "Find monochromatic color harmonies from a base color", category: "manipulation", icon: Droplet, component: Mono, status: "live" },

  // ===== Gradient Tools (20) =====
  { slug: "linear-gradient-generator", name: "Linear Gradient Generator", description: "Build linear gradients with control over angle", category: "gradients", icon: ArrowLeftRight, component: Linear, status: "live" },
  { slug: "radial-gradient-generator", name: "Radial Gradient Generator", description: "Build radial gradients with shape & position", category: "gradients", icon: Circle, component: Radial, status: "live" },
  { slug: "conic-gradient-generator", name: "Conic Gradient Generator", description: "Build conic gradients with center & angle", category: "gradients", icon: RotateCcw, component: Conic, status: "live" },
  { slug: "hard-stop-gradient-generator", name: "Hard-Stop Gradient Generator", description: "Build sharp hard-stop gradients", category: "gradients", icon: SlidersHorizontal, component: Multi, status: "live" },
  { slug: "multi-stop-gradient-builder", name: "Multi-Stop Gradient Builder", description: "Stack many color stops in one gradient", category: "gradients", icon: Layers, component: Multi, status: "live" },
  { slug: "gradient-angle-adjuster", name: "Gradient Angle Adjuster", description: "Adjust the angle of a linear gradient", category: "gradients", icon: Compass, component: GradientGenerator, status: "live" },
  { slug: "gradient-color-stop-editor", name: "Gradient Color Stop Editor", description: "Add, move and tune individual gradient stops", category: "gradients", icon: MousePointerClick, component: GradientStopEditor, status: "live" },
  { slug: "css-gradient-animation-generator", name: "CSS Gradient Animation Generator", description: "Generate animated CSS gradients", category: "gradients", icon: Sparkles, component: AnimatedGradient, status: "live" },
  { slug: "mesh-gradient-generator", name: "Mesh Gradient Generator", description: "Generate multi-blob mesh gradients", category: "gradients", icon: Aperture, component: MeshGradient, status: "live" },
  { slug: "svg-gradient-generator", name: "SVG Gradient Generator", description: "Generate SVG <linearGradient> markup", category: "gradients", icon: FileCode, component: CSSGradientExporter, status: "live" },
  { slug: "canvas-gradient-generator", name: "Canvas Gradient Generator", description: "Generate gradient code for HTML5 canvas", category: "gradients", icon: Brush, component: CSSGradientExporter, status: "live" },
  { slug: "gradient-previewer", name: "Gradient Previewer", description: "Preview any CSS gradient instantly", category: "gradients", icon: Eye, component: GradientPreviewer, status: "live" },
  { slug: "noise-grain-texture-generator", name: "Noise & Grain Texture Generator", description: "Add a noise or grain texture to a gradient", category: "gradients", icon: Wand2, component: GradientNoise, status: "live" },
  { slug: "gradient-to-css-exporter", name: "Gradient to CSS Exporter", description: "Export a gradient as ready-to-paste CSS", category: "gradients", icon: Code2, component: CSSGradientExporter, status: "live" },
  { slug: "gradient-palette-mixer", name: "Gradient Palette Mixer", description: "Generate a discrete palette from a gradient", category: "gradients", icon: Palette, component: GradientPaletteGenerator, status: "live" },
  { slug: "gradient-collection-browser", name: "Gradient Collection Browser", description: "Browse an embedded collection of gradients", category: "gradients", icon: Grid3x3, component: GradientCollection, status: "live" },
  { slug: "gradient-angle-calculator", name: "Gradient Angle Calculator", description: "Convert between angles and gradient directions", category: "gradients", icon: Calculator, component: GradientAngleCalc, status: "live" },
  { slug: "css-gradient-to-image-exporter", name: "CSS Gradient to Image Exporter", description: "Render a CSS gradient as a downloadable image", category: "gradients", icon: FileImage, component: CSSGradientExporter, status: "live" },
  { slug: "gradient-from-image", name: "Gradient from Image", description: "Extract a gradient from any image", category: "gradients", icon: ImageIcon, component: GradientFromImage, status: "live" },
  { slug: "image-theme-generator", name: "Image Theme Generator", description: "Generate a UI theme from an image", category: "gradients", icon: ImagePlus, component: ImageTheme, status: "live" },

  // ===== Design Effects (12) =====
  { slug: "glassmorphism-generator", name: "Glassmorphism Generator", description: "Design frosted-glass CSS surfaces", category: "effects", icon: Aperture, component: GlassmorphismGenerator, status: "live" },
  { slug: "neumorphism-generator", name: "Neumorphism Generator", description: "Design soft-UI dual-shadow CSS", category: "effects", icon: Boxes, component: NeumorphismGenerator, status: "live" },
  { slug: "shadow-color-generator", name: "Shadow Color Generator", description: "Generate harmonious shadow colors", category: "effects", icon: Moon, component: ShadowColorGenerator, status: "live" },
  { slug: "box-shadow-color-tool", name: "Box Shadow Color Tool", description: "Design CSS box-shadows with custom colors", category: "effects", icon: Square, component: CssShadowGenerator, status: "live" },
  { slug: "text-shadow-color-tool", name: "Text Shadow Color Tool", description: "Design CSS text-shadows with custom colors", category: "effects", icon: TypeIcon, component: CssShadowGenerator, status: "live" },
  { slug: "overlay-color-generator", name: "Overlay Color Generator", description: "Generate overlay colors for images and video", category: "effects", icon: Layers, component: ColorOverlayGenerator, status: "live" },
  { slug: "duotone-generator", name: "Duotone Generator", description: "Apply a duotone effect to any image", category: "effects", icon: Blend, component: DuotoneGenerator, status: "live" },
  { slug: "color-overlay-generator", name: "Color Overlay Generator", description: "Generate CSS color overlays with blend modes", category: "effects", icon: PaintBucket, component: ColorOverlayGenerator, status: "live" },
  { slug: "frosted-glass-generator", name: "Frosted Glass Generator", description: "Design frosted-glass surfaces", category: "effects", icon: Snowflake, component: GlassmorphismGenerator, status: "live" },
  { slug: "gradient-overlay-generator", name: "Gradient Overlay Generator", description: "Layer a gradient over an image", category: "effects", icon: AlignVerticalSpaceBetween, component: BackgroundGradient, status: "live" },
  { slug: "brand-style-guide-generator", name: "Brand Style Guide Generator", description: "Generate a mini brand style guide", category: "effects", icon: Award, component: ColorStrategy, status: "live" },
  { slug: "color-swatch-png-generator", name: "Color Swatch PNG Generator", description: "Export a palette as a PNG swatch sheet", category: "effects", icon: FileImage, component: PaletteExporter, status: "live" },

  // ===== CSS & Developer Output (22) =====
  { slug: "css-hsl-color-generator", name: "CSS HSL Color Generator", description: "Generate CSS hsl() values", category: "css", icon: Code2, component: CssColorGenerator, status: "live" },
  { slug: "css-rgb-color-generator", name: "CSS RGB Color Generator", description: "Generate CSS rgb() values", category: "css", icon: Palette, component: CssColorGenerator, status: "live" },
  { slug: "css-hex-color-generator", name: "CSS HEX Color Generator", description: "Generate CSS HEX color values", category: "css", icon: Hash, component: CssColorGenerator, status: "live" },
  { slug: "css-color-formatter", name: "CSS Color Formatter", description: "Format any color into a CSS-ready string", category: "css", icon: AlignLeft, component: CssColorFormatter, status: "live" },
  { slug: "css-background-color-preview", name: "CSS Background Color Preview", description: "Preview a background color in CSS", category: "css", icon: PaintBucket, component: CssColorPreview, status: "live" },
  { slug: "css-text-color-preview", name: "CSS Text Color Preview", description: "Preview a text color in CSS", category: "css", icon: TypeIcon, component: CssColorPreview, status: "live" },
  { slug: "css-color-variables-generator", name: "CSS Color Variables Generator", description: "Generate CSS custom property color variables", category: "css", icon: Variable, component: CssVariableGenerator, status: "live" },
  { slug: "css-custom-properties-exporter", name: "CSS Custom Properties Exporter", description: "Export a palette as CSS custom properties", category: "css", icon: Download, component: CssVariablesExporter, status: "live" },
  { slug: "scss-variable-generator", name: "SCSS Variable Generator", description: "Generate SCSS $color variables", category: "css", icon: FileCode2, component: SCSSVars, status: "live" },
  { slug: "less-variable-generator", name: "LESS Variable Generator", description: "Generate LESS @color variables", category: "css", icon: FileDigit, component: LESSVars, status: "live" },
  { slug: "css-in-js-color-object-generator", name: "CSS-in-JS Color Object Generator", description: "Generate a colors object for styled-components", category: "css", icon: FileJson, component: StyledVars, status: "live" },
  { slug: "design-token-generator", name: "Design Token Generator", description: "Export a palette as W3C design tokens", category: "css", icon: Braces, component: DesignTokenGenerator, status: "live" },
  { slug: "figma-token-generator", name: "Figma Token Generator", description: "Export design tokens for Figma plugins", category: "css", icon: Pencil, component: FigmaExport, status: "live" },
  { slug: "style-dictionary-format-generator", name: "Style Dictionary Format Generator", description: "Export tokens in Style Dictionary format", category: "css", icon: Book, component: DesignTokenGenerator, status: "live" },
  { slug: "tailwind-css-color-exporter", name: "Tailwind CSS Color Exporter", description: "Export a palette as Tailwind config", category: "css", icon: Wind, component: TailwindColorExporter, status: "live" },
  { slug: "material-ui-color-exporter", name: "Material UI Color Exporter", description: "Export a palette in Material UI format", category: "css", icon: LayoutTemplate, component: TailwindClassGenerator, status: "live" },
  { slug: "chakra-ui-color-exporter", name: "Chakra UI Color Exporter", description: "Export a palette for Chakra UI", category: "css", icon: Zap, component: TailwindClassGenerator, status: "live" },
  { slug: "shadcn-ui-color-exporter", name: "Shadcn/ui Color Exporter", description: "Export shadcn/ui CSS variables", category: "css", icon: Box, component: CssVariablesExporter, status: "live" },
  { slug: "bootstrap-color-exporter", name: "Bootstrap Color Exporter", description: "Export a palette as Bootstrap colors", category: "css", icon: Package, component: CssVariablesExporter, status: "live" },
  { slug: "android-xml-color-generator", name: "Android XML Color Generator", description: "Generate Android colors.xml entries", category: "css", icon: Smartphone, component: AndroidExport, status: "live" },
  { slug: "ios-swift-color-generator", name: "iOS Swift Color Generator", description: "Generate Swift UIColor declarations", category: "css", icon: Apple, component: IOSExport, status: "live" },
  { slug: "flutter-color-generator", name: "Flutter Color Generator", description: "Generate Dart Color() declarations", category: "css", icon: SmartphoneNfc, component: FlutterExport, status: "live" },

  // ===== Design System References (12) =====
  { slug: "tailwind-color-reference", name: "Tailwind Color Reference", description: "Browse the full Tailwind palette", category: "designsys", icon: Grid3x3, component: TailwindColorReference, status: "live" },
  { slug: "material-design-color-reference", name: "Material Design Color Reference", description: "Browse the Material Design palette", category: "designsys", icon: LayoutTemplate, component: MaterialColorReference, status: "live" },
  { slug: "bootstrap-color-reference", name: "Bootstrap Color Reference", description: "Browse the Bootstrap theme palette", category: "designsys", icon: Package, component: BootstrapColorReference, status: "live" },
  { slug: "ant-design-color-reference", name: "Ant Design Color Reference", description: "Browse the Ant Design palette", category: "designsys", icon: Hexagon, component: AntColorReference, status: "live" },
  { slug: "fluent-ui-color-reference", name: "Fluent UI Color Reference", description: "Browse the Microsoft Fluent palette", category: "designsys", icon: LayoutGrid, component: FluentColorReference, status: "live" },
  { slug: "chakra-ui-color-reference", name: "Chakra UI Color Reference", description: "Browse the Chakra UI palette", category: "designsys", icon: Zap, component: ChakraColorReference, status: "live" },
  { slug: "radix-color-reference", name: "Radix Color Reference", description: "Browse the Radix UI palette", category: "designsys", icon: CircleDot, component: RadixColorReference, status: "live" },
  { slug: "open-color-reference", name: "Open Color Reference", description: "Browse the Open Color palette", category: "designsys", icon: Unlock, component: OpenColorReference, status: "live" },
  { slug: "ibm-carbon-color-reference", name: "IBM Carbon Color Reference", description: "Browse the IBM Carbon palette", category: "designsys", icon: Database, component: CarbonColorReference, status: "live" },
  { slug: "adobe-spectrum-color-reference", name: "Adobe Spectrum Color Reference", description: "Browse Adobe Spectrum colors", category: "designsys", icon: Triangle, component: SalesforceColorReference, status: "live" },
  { slug: "github-primer-color-reference", name: "GitHub Primer Color Reference", description: "Browse GitHub Primer colors", category: "designsys", icon: Github, component: SalesforceColorReference, status: "live" },
  { slug: "atlassian-design-color-reference", name: "Atlassian Design Color Reference", description: "Browse Atlassian Design colors", category: "designsys", icon: Kanban, component: SalesforceColorReference, status: "live" },

  // ===== Color Data & Export (10) =====
  { slug: "color-json-generator", name: "Color JSON Generator", description: "Generate JSON for any color", category: "data", icon: FileJson, component: ColorJsonGenerator, status: "live" },
  { slug: "color-token-generator", name: "Color Token Generator", description: "Generate design tokens for any color", category: "data", icon: Braces, component: ColorTokenGenerator, status: "live" },
  { slug: "color-format-converter", name: "Color Format Converter", description: "Convert a color into every common format", category: "data", icon: Repeat, component: ColorConverter, status: "live" },
  { slug: "color-csv-exporter", name: "Color CSV Exporter", description: "Export a palette as CSV", category: "data", icon: FileText, component: PaletteExporter, status: "live" },
  { slug: "color-array-generator", name: "Color Array Generator", description: "Generate a JavaScript color array", category: "data", icon: Code2, component: ColorJsonGenerator, status: "live" },
  { slug: "color-object-generator", name: "Color Object Generator", description: "Generate a JavaScript color object", category: "data", icon: Code, component: ColorJsonGenerator, status: "live" },
  { slug: "color-palette-json-exporter", name: "Color Palette JSON Exporter", description: "Export a palette as JSON", category: "data", icon: Database, component: PaletteExporter, status: "live" },
  { slug: "color-palette-css-exporter", name: "Color Palette CSS Exporter", description: "Export a palette as CSS", category: "data", icon: FileCode, component: CssVariablesExporter, status: "live" },
  { slug: "color-palette-svg-exporter", name: "Color Palette SVG Exporter", description: "Export a palette as an SVG swatch", category: "data", icon: Image, component: PaletteExporter, status: "live" },
  { slug: "color-palette-png-generator", name: "Color Palette PNG Generator", description: "Export color palettes as high-quality PNG swatch images", category: "data", icon: FileImage, component: PaletteExporter, status: "live" },

  // ===== Fun & Creative (22) =====
  { slug: "random-color-generator", name: "Random Color Generator", description: "Generate beautiful random colors", category: "fun", icon: Shuffle, component: RandomColor, status: "live" },
  { slug: "random-accessible-color-generator", name: "Random Accessible Color Generator", description: "Generate accessible random colors", category: "fun", icon: Accessibility, component: AccessiblePaletteGenerator, status: "live" },
  { slug: "lucky-color-generator", name: "Lucky Color Generator", description: "Roll a single lucky color", category: "fun", icon: Star, component: LuckyColorGenerator, status: "live" },
  { slug: "daily-color-generator", name: "Daily Color Generator", description: "Get a fresh color every day", category: "fun", icon: Calendar, component: RandomColor, status: "live" },
  { slug: "color-of-the-year-browser", name: "Color of the Year Browser", description: "Browse colors of the year by year", category: "fun", icon: Crown, component: ColorOfTheYear, status: "live" },
  { slug: "color-name-generator", name: "Color Name Generator", description: "Generate a fun name for any color", category: "fun", icon: Smile, component: NicknameGen, status: "live" },
  { slug: "flag-color-extractor", name: "Flag Color Extractor", description: "Browse the colors of world flags", category: "fun", icon: Globe, component: FlagExplorer, status: "live" },
  { slug: "brand-color-library", name: "Brand Color Library", description: "Browse the colors of famous brands", category: "fun", icon: Award, component: BrandColorLibrary, status: "live" },
  { slug: "hair-color-reference", name: "Hair Color Reference", description: "Browse a reference of hair colors", category: "fun", icon: Heart, component: hairTones, status: "live" },
  { slug: "eye-color-reference", name: "Eye Color Reference", description: "Browse a reference of eye colors", category: "fun", icon: Eye, component: eyeTones, status: "live" },
  { slug: "cultural-color-palettes", name: "Cultural Color Palettes", description: "Browse palettes from world cultures", category: "fun", icon: Map, component: CulturalPalettes, status: "live" },
  { slug: "rgb-cube-visualizer", name: "RGB Cube Visualizer", description: "Visualize colors in an RGB cube", category: "fun", icon: Boxes, component: InteractiveColorWheel, status: "live" },
  { slug: "hue-circle-interactive", name: "Hue Circle Interactive", description: "Interactive circular hue picker", category: "fun", icon: Circle, component: ColorWheel, status: "live" },
  { slug: "color-blending-art-tool", name: "Color Blending Art Tool", description: "Blend colors to create art", category: "fun", icon: Brush, component: ColorBlender, status: "live" },
  { slug: "color-memory-game", name: "Color Memory Game", description: "Memorize and match colors", category: "fun", icon: Gamepad2, component: PersonalityQuiz, status: "live" },
  { slug: "pastel-color-generator", name: "Pastel Color Generator", description: "Generate soft pastel colors", category: "fun", icon: Flower2, component: PastelPaletteGenerator, status: "live" },
  { slug: "neon-color-generator", name: "Neon Color Generator", description: "Generate vibrant neon colors", category: "fun", icon: Flame, component: NeonPaletteGenerator, status: "live" },
  { slug: "muted-color-generator", name: "Muted Color Generator", description: "Generate muted, low-saturation colors", category: "fun", icon: Droplet, component: Muted, status: "live" },
  { slug: "warm-color-generator", name: "Warm Color Generator", description: "Generate warm-tone colors", category: "fun", icon: Sun, component: Warm, status: "live" },
  { slug: "cool-color-generator", name: "Cool Color Generator", description: "Generate cool-tone colors", category: "fun", icon: Snowflake, component: Cool, status: "live" },
  { slug: "earth-tone-color-generator", name: "Earth Tone Color Generator", description: "Generate earth-tone colors", category: "fun", icon: Mountain, component: earth, status: "live" },
  { slug: "color-matching-game", name: "Color Matching Game", description: "Match colors to test your eye", category: "fun", icon: Puzzle, component: PersonalityQuiz, status: "live" },

  // ===== Color Theory (18) =====
  { slug: "color-harmony-generator", name: "Color Harmony Generator", description: "Generate harmonies from any base color", category: "theory", icon: Compass, component: HarmonyVisualizer, status: "live" },
  { slug: "color-wheel-theory-guide", name: "Color Wheel Theory Guide", description: "Learn the color wheel visually", category: "theory", icon: Circle, component: ColorWheel, status: "live" },
  { slug: "simultaneous-contrast-visualizer", name: "Simultaneous Contrast Visualizer", description: "See how surrounding colors shift perception", category: "theory", icon: Contrast, component: SimultaneousContrast, status: "live" },
  { slug: "bezold-effect-visualizer", name: "Bezold Effect Visualizer", description: "Visualize the Bezold spreading effect", category: "theory", icon: Layers, component: SimultaneousContrast, status: "live" },
  { slug: "color-afterimage-tool", name: "Color Afterimage Tool", description: "Visualize the afterimage of staring at a color", category: "theory", icon: Eye, component: AfterimageSimulator, status: "live" },
  { slug: "color-context-simulator", name: "Color Context Simulator", description: "See the same color on different backgrounds", category: "theory", icon: MousePointer2, component: ColorContext, status: "live" },
  { slug: "just-noticeable-difference-calculator", name: "Just Noticeable Difference Calculator", description: "Compute perceptual JND between two colors", category: "theory", icon: Ruler, component: ColorDistance, status: "live" },
  { slug: "color-rendering-index-reference", name: "Color Rendering Index Reference", description: "Reference for CRI lighting scores", category: "theory", icon: Lightbulb, component: ColorPsychology, status: "live" },
  { slug: "munsell-color-system-reference", name: "Munsell Color System Reference", description: "Browse the Munsell color system", category: "theory", icon: Grid3x3, component: HtmlColorReference, status: "live" },
  { slug: "natural-color-system-reference", name: "Natural Color System Reference", description: "Browse the Natural Color System", category: "theory", icon: Leaf, component: HtmlColorReference, status: "live" },
  { slug: "pantone-to-hex-reference", name: "Pantone to HEX Reference", description: "Approximate Pantone colors in HEX", category: "theory", icon: Tag, component: NearestColorFinder, status: "live" },
  { slug: "ral-to-hex-reference", name: "RAL to HEX Reference", description: "Approximate RAL colors in HEX", category: "theory", icon: PaintRoller, component: NearestColorFinder, status: "live" },
  { slug: "color-gamut-visualizer", name: "Color Gamut Visualizer", description: "Visualize where a color sits in common gamuts", category: "theory", icon: ScanLine, component: ColorGamutChecker, status: "live" },
  { slug: "color-symbolism-reference", name: "Color Symbolism Reference", description: "Reference for color symbolism worldwide", category: "theory", icon: Globe, component: ColorPsychology, status: "live" },
  { slug: "color-naming-history-tool", name: "Color Naming History Tool", description: "Browse the history of color names", category: "theory", icon: Clock, component: HtmlColorReference, status: "live" },
  { slug: "color-trend-analyzer", name: "Color Trend Analyzer", description: "Analyze the trends in color over time", category: "theory", icon: BarChart3, component: ColorOfTheYear, status: "live" },
  { slug: "color-from-text-mood-tool", name: "Color from Text/Mood Tool", description: "Generate a palette from a text mood", category: "theory", icon: Sparkles, component: MoodColorGenerator, status: "live" },
  { slug: "color-blindness-test-ishihara", name: "Color Blindness Test (Ishihara-style)", description: "Take an Ishihara-style color blindness test", category: "theory", icon: CircleFadingPlus, component: ColorBlindnessSim, status: "live" },
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
