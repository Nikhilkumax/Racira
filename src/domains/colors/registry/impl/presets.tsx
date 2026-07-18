"use client";

import {
  makeThemedPalette, makeStyledColor, makeColorFilter, makeScale,
  makeVarGenerator, makeNativeColorExport, makeContrastChecker, makeNameGenerator
} from "./extra2";
import { makeHarmony, makeGradient } from "./index";

export const cyberpunk = makeThemedPalette({ Cyberpunk: { hues: [310, 280, 200, 160, 50], l: [0.55, 0.7], c: [0.2, 0.3] } });
export const vaporwave = makeThemedPalette({ Vaporwave: { hues: [320, 280, 200, 180, 30], l: [0.7, 0.85], c: [0.1, 0.2] } });
export const anime = makeThemedPalette({ Anime: { hues: [340, 30, 200, 120, 280], l: [0.6, 0.8], c: [0.15, 0.25] } });
export const scifi = makeThemedPalette({ "Sci-Fi": { hues: [200, 220, 180, 280, 60], l: [0.3, 0.7], c: [0.1, 0.25] } });
export const fantasy = makeThemedPalette({ Fantasy: { hues: [260, 30, 140, 350, 200], l: [0.4, 0.7], c: [0.15, 0.25] } });
export const ocean = makeThemedPalette({ Ocean: { hues: [200, 210, 190, 220, 180], l: [0.4, 0.75], c: [0.08, 0.18] } });
export const sunset = makeThemedPalette({ Sunset: { hues: [10, 30, 350, 50, 320], l: [0.55, 0.78], c: [0.15, 0.22] } });
export const space = makeThemedPalette({ Space: { hues: [260, 280, 220, 300, 240], l: [0.15, 0.55], c: [0.1, 0.2] } });
export const festival = makeThemedPalette({ Festival: { hues: [0, 60, 180, 280, 320], l: [0.55, 0.75], c: [0.18, 0.28] } });
export const wedding = makeThemedPalette({ Wedding: { hues: [350, 30, 60, 0, 20], l: [0.75, 0.92], c: [0.05, 0.12] } });
export const gaming = makeThemedPalette({ Gaming: { hues: [340, 280, 200, 120, 30], l: [0.5, 0.7], c: [0.2, 0.32] } });
export const retro = makeThemedPalette({ Retro: { hues: [30, 0, 200, 60, 140], l: [0.45, 0.65], c: [0.1, 0.18] } });
export const nature = makeThemedPalette({ Nature: { hues: [120, 90, 30, 70, 200], l: [0.4, 0.7], c: [0.08, 0.18] } });
export const business = makeThemedPalette({ Business: { hues: [220, 200, 240, 0, 30], l: [0.35, 0.65], c: [0.04, 0.12] } });
export const dark = makeThemedPalette({ Dark: { hues: [220, 240, 260, 200, 280], l: [0.15, 0.4], c: [0.04, 0.12] } });
export const light = makeThemedPalette({ Light: { hues: [220, 200, 180, 0, 30], l: [0.85, 0.97], c: [0.02, 0.08] } });
export const earth = makeThemedPalette({ Earth: { hues: [30, 50, 80, 20, 10], l: [0.35, 0.65], c: [0.06, 0.14] } });
export const forest = makeThemedPalette({ Forest: { hues: [120, 90, 70, 140, 40], l: [0.3, 0.6], c: [0.08, 0.16] } });
export const beach = makeThemedPalette({ Beach: { hues: [200, 180, 50, 30, 220], l: [0.55, 0.85], c: [0.08, 0.16] } });
export const vintage = makeThemedPalette({ Vintage: { hues: [30, 10, 60, 200, 350], l: [0.4, 0.7], c: [0.08, 0.16] } });
export const wesAnderson = makeThemedPalette({ "Wes Anderson": { hues: [30, 350, 60, 180, 20], l: [0.5, 0.8], c: [0.1, 0.2] } });
export const skinTones = makeThemedPalette({ Skin: { hues: [25, 30, 20, 15, 35], l: [0.35, 0.85], c: [0.04, 0.12] } });
export const hairTones = makeThemedPalette({ Hair: { hues: [30, 15, 0, 45, 60], l: [0.1, 0.85], c: [0.02, 0.12] } });
export const eyeTones = makeThemedPalette({ Eyes: { hues: [200, 120, 30, 260, 0], l: [0.25, 0.55], c: [0.06, 0.16] } });
export const pastel = makeThemedPalette({ Pastel: { hues: [0, 60, 120, 180, 240, 300], l: [0.8, 0.9], c: [0.05, 0.1] } });
export const neon = makeThemedPalette({ Neon: { hues: [320, 180, 60, 120, 280], l: [0.6, 0.7], c: [0.25, 0.35] } });
export const desert = makeThemedPalette({ Desert: { hues: [40, 30, 20, 10, 50], l: [0.5, 0.8], c: [0.1, 0.2] } });

export const Warm = makeStyledColor("warm");
export const Cool = makeStyledColor("cool");
export const Muted = makeStyledColor("muted");
export const Vibrant = makeStyledColor("vibrant");

export const Grayscale = makeColorFilter("grayscale");
export const Sepia = makeColorFilter("sepia");
export const Bright = makeColorFilter("brightness");
export const ContrastAdj = makeColorFilter("contrast");

export const ValueScale = makeScale("value");
export const ChromaScale = makeScale("chroma");
export const HueScale = makeScale("hue");

export const SCSSVars = makeVarGenerator("scss");
export const LESSVars = makeVarGenerator("less");
export const StyledVars = makeVarGenerator("styled");
export const AndroidExport = makeNativeColorExport("android");
export const IOSExport = makeNativeColorExport("ios");
export const FlutterExport = makeNativeColorExport("flutter");
export const FigmaExport = makeNativeColorExport("figma");

export const AAChecker = makeContrastChecker(4.5, "WCAG 2.1 AA");
export const AAAChecker = makeContrastChecker(7, "WCAG 2.1 AAA");
export const APCAChecker = makeContrastChecker(4.5, "WCAG 3.0 APCA (approx.)");
export const LargeText = makeContrastChecker(3, "Large text AA");
export const UIComponent = makeContrastChecker(3, "UI component (3:1)");
export const FocusIndicator = makeContrastChecker(3, "Focus indicator (3:1)");

export const NicknameGen = makeNameGenerator("Color nickname");

export const Comp = makeHarmony("complementary");
export const Anal = makeHarmony("analogous");
export const Tri = makeHarmony("triadic");
export const Tet = makeHarmony("tetradic");
export const Split = makeHarmony("split");
export const Mono = makeHarmony("mono");

export const Linear = makeGradient("linear");
export const Radial = makeGradient("radial");
export const Conic = makeGradient("conic");
export const Multi = makeGradient("multi");
