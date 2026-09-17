/**
 * Shared unit conversion & scale calculation engine: single source of truth.
 * Supports 6 physical quantities: Length, Area, Volume, Mass, Angle, Temperature.
 * Matches full scale.twir.re parity and standards.
 */

export type QuantityType = "length" | "area" | "volume" | "mass" | "angle" | "temperature";
export type ScaleMode = "one-to-x" | "inches-to-the-foot" | "scale-factor" | "convert-units-only";
export type SolveTarget = "reality" | "scale" | "ratio";
export type RatioType = "reduction" | "enlargement";

// ==========================================
// 1. LENGTH UNITS (Base: meter)
// ==========================================
export const METERS_PER_UNIT: Record<string, number> = {
  // Metric (SI) — common range
  nm: 1e-9,
  μm: 1e-6,
  mm: 1e-3,
  cm: 1e-2,
  dm: 1e-1,
  m: 1,
  dam: 10,
  hm: 100,
  km: 1e3,
  Mm: 1e6,

  // Imperial / USCS
  th: 0.3048 / 12e3,
  in: 0.3048 / 12,
  li: 0.3048 / 12 * 7.92,
  ft: 0.3048,
  rd: 0.3048 / 12 * 7.92 * 25,
  yd: 0.3048 * 3,
  ch: 0.3048 * 3 * 22,
  fur: 0.3048 * 3 * 22 * 10,
  mi: 0.3048 * 3 * 22 * 10 * 8,
  lea: 0.3048 * 3 * 22 * 10 * 8 * 3,
  ftm: 1.8288,
  cb: 185.2,
  nmi: 1852,

  // Extended SI + specialty
  ym: 1e-24,
  zm: 1e-21,
  am: 1e-18,
  fm: 1e-15,
  pm: 1e-12,
  Å: 1e-10,
  Gm: 1e9,
  Tm: 1e12,
  Pm: 1e15,
  Em: 1e18,
  Zm: 1e21,
  Ym: 1e24,
  ly: 9_460_730_472_580_800,

  // Digital / print (default 96 DPI for px)
  pt: 0.3048 / 12 / 72,
  p: 0.3048 / 12 / 6,
  px: 0.0254 / 96,
  hpgl: 0.000025,
};

export const UNIT_LABELS: Record<string, string> = {
  nm: "nanometer (nm)",
  μm: "micrometer (μm)",
  mm: "millimeter (mm)",
  cm: "centimeter (cm)",
  dm: "decimeter (dm)",
  m: "meter (m)",
  dam: "decameter (dam)",
  hm: "hectometer (hm)",
  km: "kilometer (km)",
  Mm: "megameter (Mm)",
  th: "thou (th)",
  in: "inch (in)",
  li: "link (li)",
  ft: "foot (ft)",
  rd: "rod (rd)",
  yd: "yard (yd)",
  ch: "chain (ch)",
  fur: "furlong (fur)",
  mi: "mile (mi)",
  lea: "league (lea)",
  ftm: "fathom (ftm)",
  cb: "cable (cb)",
  nmi: "nautical mile (nmi)",
  ym: "yoctometer (ym)",
  zm: "zeptometer (zm)",
  am: "attometer (am)",
  fm: "femtometer (fm)",
  pm: "picometer (pm)",
  Å: "ångström (Å)",
  Gm: "gigameter (Gm)",
  Tm: "terameter (Tm)",
  Pm: "petameter (Pm)",
  Em: "exameter (Em)",
  Zm: "zettameter (Zm)",
  Ym: "yottameter (Ym)",
  ly: "light-year (ly)",
  pt: "PostScript point (pt)",
  p: "PostScript pica (p)",
  px: "pixel (px)",
  hpgl: "HP-GL unit (hpgl)",
};

export const UNIT_GROUPS: { label: string; units: string[] }[] = [
  {
    label: "Metric (SI)",
    units: ["mm", "cm", "m", "km", "nm", "μm", "dm", "dam", "hm", "Mm"],
  },
  {
    label: "Imperial / USCS",
    units: ["in", "ft", "yd", "mi", "th", "li", "rd", "ch", "fur", "lea", "ftm", "cb", "nmi"],
  },
  {
    label: "Digital / Print",
    units: ["px", "pt", "p", "hpgl"],
  },
  {
    label: "Scientific & Astronomical",
    units: ["Å", "ly", "pm", "fm", "am", "zm", "ym", "Gm", "Tm", "Pm", "Em", "Zm", "Ym"],
  },
];

export const ALL_UNITS: string[] = UNIT_GROUPS.flatMap((g) => g.units);

// ==========================================
// 2. AREA UNITS (Base: square meter m²)
// ==========================================
export const SQ_METERS_PER_UNIT: Record<string, number> = {
  // Metric (SI) — Construction & Surveying
  "m²": 1,
  "cm²": 1e-4,
  "mm²": 1e-6,
  "dm²": 1e-2,
  "dam²": 100,
  "hm² (hectare)": 10000,
  "km²": 1e6,
  // Imperial / USCS — Architectural & Land Surveying
  "square inch (in²)": 0.00064516,
  "square foot (ft²)": 0.09290304,
  "square yard (yd²)": 0.83612736,
  "square mile (mi²)": 2589988.110336,
  "acre (ac)": 4046.8564224,
  "rood (ro)": 1011.7141056,
  "square chain (ch²)": 404.68564224,
  "square (100 ft²)": 9.290304,
  "square perch (rd²)": 25.29285264,
  "square thou (mil²)": 6.4516e-10,
  "homestead": 647497.027584,
  "section": 2589988.110336,
  "survey township (twp)": 93239571.972096,
};

export const AREA_GROUPS: { label: string; units: string[] }[] = [
  {
    label: "Metric (SI)",
    units: ["m²", "cm²", "mm²", "hm² (hectare)", "km²", "dm²", "dam²"],
  },
  {
    label: "Imperial / USCS",
    units: [
      "square inch (in²)", "square foot (ft²)", "square yard (yd²)", "acre (ac)",
      "square mile (mi²)", "rood (ro)", "square chain (ch²)", "square (100 ft²)",
      "square perch (rd²)", "square thou (mil²)",
      "homestead", "section", "survey township (twp)"
    ],
  },
];

// ==========================================
// 3. VOLUME UNITS (Base: cubic meter m³)
// ==========================================
export const CU_METERS_PER_UNIT: Record<string, number> = {
  // Metric (SI)
  "m³ (kiloliter)": 1,
  "dm³ (liter)": 0.001,
  "cm³ (milliliter)": 1e-6,
  "mm³ (microliter)": 1e-9,
  "dam³ (megaliter)": 1000,
  "hm³ (gigaliter)": 1e6,
  "km³ (teraliter)": 1e9,
  // US Customary
  "gallon (US) (gal)": 0.003785411784,
  "quart (US) (qt)": 0.000946352946,
  "pint (US) (pt)": 0.000473176473,
  "gill (US) (gi)": 0.00011829411825,
  "fluid ounce (US) (fl oz)": 0.0000295735295625,
  "petrol barrel (US) (bl)": 0.158987294928,
  // Imperial (UK)
  "gallon (UK) (gal)": 0.00454609,
  "quart (UK) (qt)": 0.0011365225,
  "pint (UK) (pt)": 0.00056826125,
  "gill (UK) (gi)": 0.0001420653125,
  "fluid ounce (UK) (fl oz)": 0.0000284130625,
  "petrol barrel (UK) (bl)": 0.15911315,
  // Cubic & Specialty
  "cubic yard (cu yd)": 0.764554857984,
  "cubic foot (cu ft)": 0.028316846592,
  "cubic inch (cu in)": 0.000016387064,
  "board foot (bd ft)": 0.002359737216,
  "cord (cd)": 3.624556363776,
  "acre-foot": 1233.48183754752,
  "acre-inch": 102.79015312896,
  "perch": 0.7008419532,
  "register ton (TN)": 2.8316846592,
  "load": 1.4158423296,
  "freightton": 1.13267386368,
};

export const VOLUME_GROUPS: { label: string; units: string[] }[] = [
  {
    label: "Metric (SI)",
    units: ["dm³ (liter)", "cm³ (milliliter)", "m³ (kiloliter)", "mm³ (microliter)", "dam³ (megaliter)", "hm³ (gigaliter)", "km³ (teraliter)"],
  },
  {
    label: "US Liquid Measure",
    units: ["gallon (US) (gal)", "quart (US) (qt)", "pint (US) (pt)", "fluid ounce (US) (fl oz)", "gill (US) (gi)", "petrol barrel (US) (bl)"],
  },
  {
    label: "Imperial (UK) Measure",
    units: ["gallon (UK) (gal)", "quart (UK) (qt)", "pint (UK) (pt)", "fluid ounce (UK) (fl oz)", "gill (UK) (gi)", "petrol barrel (UK) (bl)"],
  },
  {
    label: "Cubic & Engineering",
    units: [
      "cubic yard (cu yd)",
      "cubic foot (cu ft)",
      "cubic inch (cu in)",
      "board foot (bd ft)",
      "cord (cd)",
      "acre-foot",
      "acre-inch",
      "perch",
      "register ton (TN)",
      "load",
      "freightton"
    ],
  },
];

// ==========================================
// 4. MASS UNITS (Base: gram g)
// ==========================================
export const GRAMS_PER_UNIT: Record<string, number> = {
  // Metric (SI)
  "gram (g)": 1,
  "kilogram (kg)": 1000,
  "milligram (mg)": 0.001,
  "microgram (μg)": 1e-6,
  "nanogram (ng)": 1e-9,
  "centigram (cg)": 0.01,
  "decigram (dg)": 0.1,
  "decagram (dag)": 10,
  "hectogram (hg)": 100,
  "megagram (Mg) (tonne)": 1e6,
  // Avoirdupois
  "pound (lb) (Avoirdupoids)": 453.59237,
  "ounce (oz) (Avoirdupoids)": 28.349523125,
  "dram (dr) (Avoirdupoids)": 1.7718451953125,
  "grain": 0.06479891,
  "stone (st) (long Avoirdupoids)": 6350.29318,
  "hundredweight (cwt) (long Avoirdupoids)": 50802.34544,
  "ton (T) (long Avoirdupoids)": 1016046.9088,
  "hundredweight, cental (cwt) (short Avoirdupoids)": 45359.237,
  "ton (T) (short Avoirdupoids)": 907184.74,
};

export const MASS_GROUPS: { label: string; units: string[] }[] = [
  {
    label: "Metric (SI)",
    units: ["kilogram (kg)", "gram (g)", "milligram (mg)", "megagram (Mg) (tonne)", "microgram (μg)", "nanogram (ng)", "hectogram (hg)", "decagram (dag)", "decigram (dg)", "centigram (cg)"],
  },
  {
    label: "Avoirdupois (Common)",
    units: [
      "pound (lb) (Avoirdupoids)",
      "ounce (oz) (Avoirdupoids)",
      "dram (dr) (Avoirdupoids)",
      "stone (st) (long Avoirdupoids)",
      "ton (T) (short Avoirdupoids)",
      "ton (T) (long Avoirdupoids)",
      "grain",
      "hundredweight, cental (cwt) (short Avoirdupoids)",
      "hundredweight (cwt) (long Avoirdupoids)"
    ],
  },
];

// ==========================================
// 5. ANGLE UNITS (Base: radian rad)
// ==========================================
export const RADIANS_PER_UNIT: Record<string, number> = {
  "radian (rad)": 1,
  "degree (°)": Math.PI / 180,
  "minute (')": Math.PI / (180 * 60),
  'second (")': Math.PI / (180 * 3600),
  "gon (g)": Math.PI / 200,
  "revolution": 2 * Math.PI,
  "circle": 2 * Math.PI,
  "semicircle": Math.PI,
  "quadrant": Math.PI / 2,
  "sign": Math.PI / 6,
  "hour": Math.PI / 12,
  "point": Math.PI / 16,
  "angular mil": 0.001,
  "military mil": Math.PI / 3200,
};

export const ANGLE_GROUPS: { label: string; units: string[] }[] = [
  {
    label: "Standard Units",
    units: ["degree (°)", "radian (rad)", "minute (')", 'second (")'],
  },
  {
    label: "Navigation & Astronomy",
    units: ["revolution", "circle", "semicircle", "quadrant", "sign", "hour", "point"],
  },
  {
    label: "Geodetic & Military",
    units: ["gon (g)", "angular mil", "military mil"],
  },
];

// ==========================================
// 6. TEMPERATURE UNITS (Base: Kelvin K)
// ==========================================
export const TEMPERATURE_UNITS = [
  "celsius (°C)",
  "fahrenheit (°F)",
  "kelvin (K)",
  "rankine (°R)",
];

export const TEMPERATURE_GROUPS: { label: string; units: string[] }[] = [
  {
    label: "Temperature Scales",
    units: ["celsius (°C)", "fahrenheit (°F)", "kelvin (K)", "rankine (°R)"],
  },
];

/**
 * Sanitizes floating-point calculations to eliminate IEEE 754 precision residue
 * (e.g. 5.6843e-14 resulting from 32°F -> 0°C or cancellation errors in near-zero ratios).
 */
export function cleanFloat(num: number): number {
  if (!isFinite(num) || isNaN(num)) return 0;
  // If the value is within a small epsilon of zero, clamp to exact 0
  if (Math.abs(num) < 1e-10) return 0;
  // If the value is within tiny epsilon of an integer, round to that integer
  const rounded = Math.round(num);
  if (Math.abs(num - rounded) < 1e-11) return rounded;
  // Strip floating-point noise beyond 10 significant digits
  return parseFloat(num.toPrecision(10));
}

export function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return cleanFloat(value);

  const isFromC = from.startsWith("celsius") || from === "°C";
  const isFromF = from.startsWith("fahrenheit") || from === "°F";
  const isFromK = from.startsWith("kelvin") || from === "K";
  const isFromR = from.startsWith("rankine") || from === "°R";

  const isToC = to.startsWith("celsius") || to === "°C";
  const isToF = to.startsWith("fahrenheit") || to === "°F";
  const isToK = to.startsWith("kelvin") || to === "K";
  const isToR = to.startsWith("rankine") || to === "°R";

  // Direct exact pairs for standard units avoiding Kelvin transit precision loss
  if (isFromF && isToC) return cleanFloat((value - 32) * (5 / 9));
  if (isFromC && isToF) return cleanFloat(value * (9 / 5) + 32);
  if (isFromC && isToK) return cleanFloat(value + 273.15);
  if (isFromK && isToC) return cleanFloat(value - 273.15);
  if (isFromF && isToR) return cleanFloat(value + 459.67);
  if (isFromR && isToF) return cleanFloat(value - 459.67);
  if (isFromK && isToR) return cleanFloat(value * (9 / 5));
  if (isFromR && isToK) return cleanFloat(value * (5 / 9));

  // Fallback conversion via Kelvin
  let k = value;
  if (isFromC) k = value + 273.15;
  else if (isFromF) k = (value + 459.67) * (5 / 9);
  else if (isFromR) k = value * (5 / 9);

  let out = k;
  if (isToC) out = k - 273.15;
  else if (isToF) out = k * (9 / 5) - 459.67;
  else if (isToR) out = k * (9 / 5);

  return cleanFloat(out);
}

// ==========================================
// UNIFIED QUANTITY ACCESSOR
// ==========================================
export interface QuantityUnitConfig {
  defaultScaleUnit: string;
  defaultRealUnit: string;
  unitLabels: Record<string, string>;
  unitGroups: { label: string; units: string[] }[];
  allUnits: string[];
  factors: Record<string, number>;
}

export function getQuantityConfig(quantity: QuantityType = "length", dpi = 96): QuantityUnitConfig {
  const safeDpi = (isNaN(dpi) || dpi <= 0) ? 96 : dpi;

  switch (quantity) {
    case "area":
      return {
        defaultScaleUnit: "cm²",
        defaultRealUnit: "m²",
        unitLabels: Object.fromEntries(Object.keys(SQ_METERS_PER_UNIT).map(k => [k, k])),
        unitGroups: AREA_GROUPS,
        allUnits: AREA_GROUPS.flatMap(g => g.units),
        factors: SQ_METERS_PER_UNIT,
      };
    case "volume":
      return {
        defaultScaleUnit: "cm³ (milliliter)",
        defaultRealUnit: "m³ (kiloliter)",
        unitLabels: Object.fromEntries(Object.keys(CU_METERS_PER_UNIT).map(k => [k, k])),
        unitGroups: VOLUME_GROUPS,
        allUnits: VOLUME_GROUPS.flatMap(g => g.units),
        factors: CU_METERS_PER_UNIT,
      };
    case "mass":
      return {
        defaultScaleUnit: "gram (g)",
        defaultRealUnit: "kilogram (kg)",
        unitLabels: Object.fromEntries(Object.keys(GRAMS_PER_UNIT).map(k => [k, k])),
        unitGroups: MASS_GROUPS,
        allUnits: MASS_GROUPS.flatMap(g => g.units),
        factors: GRAMS_PER_UNIT,
      };
    case "angle":
      return {
        defaultScaleUnit: "degree (°)",
        defaultRealUnit: "degree (°)",
        unitLabels: Object.fromEntries(Object.keys(RADIANS_PER_UNIT).map(k => [k, k])),
        unitGroups: ANGLE_GROUPS,
        allUnits: ANGLE_GROUPS.flatMap(g => g.units),
        factors: RADIANS_PER_UNIT,
      };
    case "temperature":
      return {
        defaultScaleUnit: "celsius (°C)",
        defaultRealUnit: "fahrenheit (°F)",
        unitLabels: Object.fromEntries(TEMPERATURE_UNITS.map(k => [k, k])),
        unitGroups: TEMPERATURE_GROUPS,
        allUnits: TEMPERATURE_UNITS,
        factors: { "celsius (°C)": 1, "fahrenheit (°F)": 1, "kelvin (K)": 1, "rankine (°R)": 1 },
      };
    case "length":
    default: {
      const dynamicFactors = { ...METERS_PER_UNIT, px: 0.0254 / safeDpi };
      return {
        defaultScaleUnit: "cm",
        defaultRealUnit: "m",
        unitLabels: UNIT_LABELS,
        unitGroups: UNIT_GROUPS,
        allUnits: ALL_UNITS,
        factors: dynamicFactors,
      };
    }
  }
}

export function convertLength(value: number, from: string, to: string, dpi = 96): number {
  const safeDpi = (isNaN(dpi) || dpi <= 0) ? 96 : dpi;
  const factors: Record<string, number> = { ...METERS_PER_UNIT, px: 0.0254 / safeDpi };
  const fromFactor = factors[from] ?? 1;
  const toFactor = factors[to] ?? 1;
  return (value * fromFactor) / toFactor;
}

export function convertQuantity(
  value: number,
  from: string,
  to: string,
  quantity: QuantityType = "length",
  dpi = 96
): number {
  if (quantity === "temperature") {
    return convertTemperature(value, from, to);
  }
  const config = getQuantityConfig(quantity, dpi);
  const fromFactor = config.factors[from] ?? 1;
  const toFactor = config.factors[to] ?? 1;
  return (value * fromFactor) / toFactor;
}

// ==========================================
// ARCHITECTURAL & STANDARD SCALES
// ==========================================
export interface ArchitecturalPreset {
  label: string;
  inchesPerFoot: number;
  ratio: number;
  ratioText: string;
  description: string;
}

export const ARCHITECTURAL_PRESETS: ArchitecturalPreset[] = [
  { label: '1/16" = 1\'-0"', inchesPerFoot: 1 / 16, ratio: 1 / 192, ratioText: "1:192", description: "Large site / campus plans" },
  { label: '3/32" = 1\'-0"', inchesPerFoot: 3 / 32, ratio: 1 / 128, ratioText: "1:128", description: "Large commercial complexes" },
  { label: '1/8" = 1\'-0"', inchesPerFoot: 1 / 8, ratio: 1 / 96, ratioText: "1:96", description: "Commercial floor plans" },
  { label: '3/16" = 1\'-0"', inchesPerFoot: 3 / 16, ratio: 1 / 64, ratioText: "1:64", description: "Residential schematics" },
  { label: '1/4" = 1\'-0"', inchesPerFoot: 1 / 4, ratio: 1 / 48, ratioText: "1:48", description: "Standard residential blueprints" },
  { label: '3/8" = 1\'-0"', inchesPerFoot: 3 / 8, ratio: 1 / 32, ratioText: "1:32", description: "Kitchen / bath elevations" },
  { label: '1/2" = 1\'-0"', inchesPerFoot: 1 / 2, ratio: 1 / 24, ratioText: "1:24", description: "Cabinetry & framing details" },
  { label: '3/4" = 1\'-0"', inchesPerFoot: 3 / 4, ratio: 1 / 16, ratioText: "1:16", description: "Wall sections & joinery" },
  { label: '1" = 1\'-0"', inchesPerFoot: 1, ratio: 1 / 12, ratioText: "1:12", description: "Construction sections" },
  { label: '1-1/2" = 1\'-0"', inchesPerFoot: 1.5, ratio: 1 / 8, ratioText: "1:8", description: "Large assembly details" },
  { label: '3" = 1\'-0"', inchesPerFoot: 3, ratio: 1 / 4, ratioText: "1:4", description: "Full-scale component details" },
];

export const STANDARD_SCALES: { label: string; ratio: number }[] = [
  // Enlargement
  { label: "10:1", ratio: 10 },
  { label: "5:1", ratio: 5 },
  { label: "2:1", ratio: 2 },
  // Full scale
  { label: "1:1", ratio: 1 },
  // Reduction Metric & Arch
  { label: "1:2", ratio: 1 / 2 },
  { label: "1:4", ratio: 1 / 4 },
  { label: "1:5", ratio: 1 / 5 },
  { label: "1:8", ratio: 1 / 8 },
  { label: "1:10", ratio: 1 / 10 },
  { label: "1:12", ratio: 1 / 12 },
  { label: "1:16", ratio: 1 / 16 },
  { label: "1:20", ratio: 1 / 20 },
  { label: "1:24", ratio: 1 / 24 },
  { label: "1:25", ratio: 1 / 25 },
  { label: "1:32", ratio: 1 / 32 },
  { label: "1:48", ratio: 1 / 48 },
  { label: "1:50", ratio: 1 / 50 },
  { label: "1:64", ratio: 1 / 64 },
  { label: "1:75", ratio: 1 / 75 },
  { label: "1:96", ratio: 1 / 96 },
  { label: "1:100", ratio: 1 / 100 },
  { label: "1:125", ratio: 1 / 125 },
  { label: "1:128", ratio: 1 / 128 },
  { label: "1:150", ratio: 1 / 150 },
  { label: "1:192", ratio: 1 / 192 },
  { label: "1:200", ratio: 1 / 200 },
  { label: "1:250", ratio: 1 / 250 },
  { label: "1:300", ratio: 1 / 300 },
  { label: "1:400", ratio: 1 / 400 },
  { label: "1:500", ratio: 1 / 500 },
  { label: "1:750", ratio: 1 / 750 },
  { label: "1:1000", ratio: 1 / 1000 },
  { label: "1:1250", ratio: 1 / 1250 },
  { label: "1:2500", ratio: 1 / 2500 },
  { label: "1:5000", ratio: 1 / 5000 },
  { label: "1:10000", ratio: 1 / 10000 },
  { label: "1:25000", ratio: 1 / 25000 },
  { label: "1:50000", ratio: 1 / 50000 },
];

export interface StandardScaleMatch {
  label: string;
  ratio: number;
  computedLabel: string;
}

export function findNearestStandardScale(ratio: number): StandardScaleMatch | null {
  if (!isFinite(ratio) || ratio <= 0) return null;

  let bestScale = STANDARD_SCALES[0];
  let minDiff = Infinity;

  for (const s of STANDARD_SCALES) {
    const diff = Math.abs(Math.log(ratio / s.ratio));
    if (diff < minDiff) {
      minDiff = diff;
      bestScale = s;
    }
  }

  // Check if it's already an exact match (within 0.3%)
  const relDiff = Math.abs(ratio - bestScale.ratio) / bestScale.ratio;
  if (relDiff < 0.003) {
    return null; // already standard
  }

  // Format computed ratio label for display
  let computedLabel = "";
  if (ratio < 1) {
    const denom = 1 / ratio;
    computedLabel = `1:${formatSmartNumber(denom, 2)}`;
  } else {
    computedLabel = `${formatSmartNumber(ratio, 2)}:1`;
  }

  return {
    label: bestScale.label,
    ratio: bestScale.ratio,
    computedLabel,
  };
}

// ==========================================
// SCALE INPUTS & RESULT INTERFACES
// ==========================================
export interface ScaleEquivalentItem {
  scaleLabel: string;
  ratio: number;
  scaleLength: number;
  scaleUnit: string;
  realLength: number;
  realUnit: string;
  description: string;
  isCurrent: boolean;
}

export interface ScaleInputs {
  quantityType?: QuantityType;
  dpi?: number;
  ratioType?: RatioType;
  mode: ScaleMode;
  solveFor: SolveTarget;
  scaleValue: string;
  scaleUnit: string;
  oneToXRatio: string;
  archPresetIndex: number;
  archCustomInches: string;
  archMode: "preset" | "custom";
  scaleFactor: string;
  realValue: string;
  realUnit: string;
}

export interface ScaleResult {
  solveFor: SolveTarget;
  solvedValue: number;
  solvedUnit: string;
  scaleValueDisplay: number;
  scaleUnit: string;
  realValueDisplay: number;
  realUnit: string;
  ratioDecimal: number;
  scaleRatioText: string;
  scaleFactorText: string;
  equivalents: ScaleEquivalentItem[];
  nearestStandardScale?: StandardScaleMatch | null;
  isValid: boolean;
  errorMessage?: string;
}

export function formatSmartNumber(num: number, maxDec = 6): string {
  if (!isFinite(num) || isNaN(num)) return "0";
  const clean = cleanFloat(num);
  if (clean === 0) return "0";

  const abs = Math.abs(clean);
  if (abs >= 1e9 || (abs < 1e-4 && abs > 0)) {
    return clean.toExponential(4);
  }

  const str = clean.toFixed(maxDec);
  if (!str.includes(".")) return clean.toLocaleString("en-US");
  const trimmed = str.replace(/\.?0+$/, "");
  const parts = trimmed.split(".");
  const intPart = parseFloat(parts[0]).toLocaleString("en-US");
  return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
}

// ==========================================
// MAIN CALCULATION FUNCTION
// ==========================================
export function calculateScale(inputs: ScaleInputs): ScaleResult {
  const {
    quantityType = "length",
    dpi = 96,
    ratioType = "reduction",
    mode: rawMode,
    solveFor,
    scaleValue,
    scaleUnit,
    oneToXRatio,
    archPresetIndex,
    archCustomInches,
    archMode,
    scaleFactor,
    realValue,
    realUnit,
  } = inputs;

  const isNonSpatial = quantityType === "temperature" || quantityType === "angle";
  // Non-spatial types only permit convert-units-only
  const mode: ScaleMode = isNonSpatial ? "convert-units-only" : rawMode;

  const config = getQuantityConfig(quantityType, dpi);
  const sVal = parseFloat(scaleValue) || 0;
  const rVal = parseFloat(realValue) || 0;

  if (quantityType !== "temperature" && (sVal < 0 || rVal < 0)) {
    return {
      solveFor,
      solvedValue: 0,
      solvedUnit: "",
      scaleValueDisplay: sVal,
      scaleUnit,
      realValueDisplay: rVal,
      realUnit,
      ratioDecimal: 1,
      scaleRatioText: "1 : 1",
      scaleFactorText: "1",
      equivalents: [],
      nearestStandardScale: null,
      isValid: false,
      errorMessage: "Negative values are not supported for this quantity type.",
    };
  }

  // Temperature special case (affine conversion, convert-only)
  if (quantityType === "temperature") {
    let finalScale = sVal;
    let finalReal = rVal;
    let solvedVal = 0;
    let solvedUnit = realUnit;

    if (solveFor === "reality") {
      finalReal = convertTemperature(sVal, scaleUnit, realUnit);
      solvedVal = finalReal;
      solvedUnit = realUnit;
    } else if (solveFor === "scale") {
      finalScale = convertTemperature(rVal, realUnit, scaleUnit);
      solvedVal = finalScale;
      solvedUnit = scaleUnit;
    } else {
      // Solve ratio for temperature is not applicable, defaults to 1:1
      solvedVal = 1;
      solvedUnit = "ratio (1:1)";
    }

    return {
      solveFor,
      solvedValue: solvedVal,
      solvedUnit,
      scaleValueDisplay: finalScale,
      scaleUnit,
      realValueDisplay: finalReal,
      realUnit,
      ratioDecimal: 1,
      scaleRatioText: "1 : 1 (Direct Temperature Conversion)",
      scaleFactorText: "1",
      equivalents: [], // suppressed for temperature
      nearestStandardScale: null,
      isValid: true,
    };
  }

  // Angle special case (locked to convert-only, but multiplicative)
  if (quantityType === "angle") {
    let finalScale = sVal;
    let finalReal = rVal;
    let solvedVal = 0;
    let solvedUnit = realUnit;

    const fromFactor = config.factors[scaleUnit] ?? 1;
    const toFactor = config.factors[realUnit] ?? 1;

    if (solveFor === "reality") {
      const radians = sVal * fromFactor;
      finalReal = radians / toFactor;
      solvedVal = finalReal;
      solvedUnit = realUnit;
    } else if (solveFor === "scale") {
      const radians = rVal * toFactor;
      finalScale = radians / fromFactor;
      solvedVal = finalScale;
      solvedUnit = scaleUnit;
    } else {
      solvedVal = 1;
      solvedUnit = "ratio (1:1)";
    }

    return {
      solveFor,
      solvedValue: solvedVal,
      solvedUnit,
      scaleValueDisplay: finalScale,
      scaleUnit,
      realValueDisplay: finalReal,
      realUnit,
      ratioDecimal: 1,
      scaleRatioText: "1 : 1 (Direct Angle Conversion)",
      scaleFactorText: "1",
      equivalents: [], // suppressed for angle
      nearestStandardScale: null,
      isValid: true,
    };
  }

  // Length, Area, Volume, Mass (all 4 modes supported, linear scaling matches scale.twir.re)
  let effectiveRatio = 1; // scaleBase / realBase
  let ratioDisplay = "1 : 1";

  if (solveFor === "ratio") {
    const sBase = sVal * (config.factors[scaleUnit] ?? 1);
    const rBase = rVal * (config.factors[realUnit] ?? 1);

    if (rBase > 0 && sBase > 0) {
      effectiveRatio = sBase / rBase;
      const xDenom = 1 / effectiveRatio;
      ratioDisplay = xDenom >= 1
        ? `1 : ${formatSmartNumber(xDenom, 2)}`
        : `${formatSmartNumber(effectiveRatio, 2)} : 1`;
    } else {
      effectiveRatio = 1;
      ratioDisplay = "1 : 1";
    }
  } else {
    switch (mode) {
      case "one-to-x": {
        const x = parseFloat(oneToXRatio) || 1;
        if (x > 0) {
          if (ratioType === "enlargement") {
            effectiveRatio = x;
            ratioDisplay = `${formatSmartNumber(x, 2)} : 1`;
          } else {
            effectiveRatio = 1 / x;
            ratioDisplay = `1 : ${formatSmartNumber(x, 2)}`;
          }
        } else {
          effectiveRatio = 1;
          ratioDisplay = "1 : 1";
        }
        break;
      }
      case "inches-to-the-foot": {
        if (archMode === "preset") {
          const preset = ARCHITECTURAL_PRESETS[archPresetIndex] ?? ARCHITECTURAL_PRESETS[4];
          effectiveRatio = preset.ratio;
          ratioDisplay = `${preset.label} (${preset.ratioText})`;
        } else {
          const inches = parseFloat(archCustomInches) || 1;
          effectiveRatio = inches / 12;
          const x = 12 / inches;
          ratioDisplay = `${inches}" = 1'-0" (1:${formatSmartNumber(x, 2)})`;
        }
        break;
      }
      case "scale-factor": {
        const factor = parseFloat(scaleFactor) || 1;
        effectiveRatio = factor;
        const x = factor > 0 ? 1 / factor : 1;
        ratioDisplay = factor < 1
          ? `1 : ${formatSmartNumber(x, 2)} (${factor})`
          : `${formatSmartNumber(factor, 2)} : 1 (${factor})`;
        break;
      }
      case "convert-units-only":
      default: {
        effectiveRatio = 1;
        ratioDisplay = "1 : 1 (Direct Unit Conversion)";
        break;
      }
    }
  }

  let finalScaleVal = sVal;
  let finalRealVal = rVal;
  let solvedVal = 0;
  let solvedUnit = realUnit;

  if (solveFor === "reality") {
    const sBase = sVal * (config.factors[scaleUnit] ?? 1);
    const rBase = effectiveRatio > 0 ? sBase / effectiveRatio : 0;
    finalRealVal = rBase / (config.factors[realUnit] ?? 1);
    solvedVal = finalRealVal;
    solvedUnit = realUnit;
  } else if (solveFor === "scale") {
    const rBase = rVal * (config.factors[realUnit] ?? 1);
    const sBase = rBase * effectiveRatio;
    finalScaleVal = sBase / (config.factors[scaleUnit] ?? 1);
    solvedVal = finalScaleVal;
    solvedUnit = scaleUnit;
  } else {
    solvedVal = effectiveRatio > 0 ? 1 / effectiveRatio : 1;
    solvedUnit = ratioType === "enlargement" ? "ratio (X:1)" : "ratio (1:X)";
  }

  // Nearest standard scale suggestion (only when solving for ratio)
  let nearestMatch: StandardScaleMatch | null = null;
  if (solveFor === "ratio" && effectiveRatio > 0) {
    nearestMatch = findNearestStandardScale(effectiveRatio);
  }

  // Generate Common Scale Equivalents based on the real value in base units
  const realBase = finalRealVal * (config.factors[realUnit] ?? 1);

  // Quantity-aware descriptions for the equivalents table
  const getEquivalentDesc = (label: string, qt: QuantityType): string => {
    if (qt === "area") {
      const map: Record<string, string> = {
        "1:20":  "Small room / detail area",
        "1:50":  "Room or apartment floor area",
        "1:100": "Building footprint area",
        "1:200": "Site plan area",
        "1:500": "Urban block / campus area",
      };
      return map[label] ?? "Standard area scale";
    }
    if (qt === "volume") {
      const map: Record<string, string> = {
        "1:20":  "Small-space volumetric model",
        "1:50":  "Room volume comparison",
        "1:100": "Building volumetric study",
        "1:200": "Site volumetric analysis",
        "1:500": "Urban massing model",
      };
      return map[label] ?? "Standard volume scale";
    }
    if (qt === "mass") {
      const map: Record<string, string> = {
        "1:20":  "Scale model material weight",
        "1:50":  "Structural component weight",
        "1:100": "Building section weight",
        "1:200": "Full structure weight",
        "1:500": "Infrastructure mass estimate",
      };
      return map[label] ?? "Standard mass scale";
    }
    // Default: length (architectural descriptions)
    const map: Record<string, string> = {
      "1:20":  "Detailed components / interior elements",
      "1:50":  "Detailed plans & sections",
      "1:100": "General floor plans & layouts",
      "1:200": "Site layouts / overall sections",
      "1:500": "Master site plans & area surveys",
    };
    return map[label] ?? "Standard scale";
  };

  const standardScales = [
    { label: "1:20",  ratio: 1 / 20,  desc: getEquivalentDesc("1:20",  quantityType) },
    { label: "1:50",  ratio: 1 / 50,  desc: getEquivalentDesc("1:50",  quantityType) },
    { label: "1:100", ratio: 1 / 100, desc: getEquivalentDesc("1:100", quantityType) },
    { label: "1:200", ratio: 1 / 200, desc: getEquivalentDesc("1:200", quantityType) },
    { label: "1:500", ratio: 1 / 500, desc: getEquivalentDesc("1:500", quantityType) },
  ];

  const currentRatioRounded = Math.round(effectiveRatio * 1e7) / 1e7;
  const standardMatches = standardScales.some(s => Math.round(s.ratio * 1e7) / 1e7 === currentRatioRounded);

  const equivalentsList: ScaleEquivalentItem[] = standardScales.map((s) => {
    const sBase = realBase * s.ratio;
    const sDisplay = sBase / (config.factors[scaleUnit] ?? 1);
    const isCurrent = Math.round(s.ratio * 1e7) / 1e7 === currentRatioRounded;
    return {
      scaleLabel: s.label,
      ratio: s.ratio,
      scaleLength: sDisplay,
      scaleUnit,
      realLength: finalRealVal,
      realUnit,
      description: s.desc,
      isCurrent,
    };
  });

  if (!standardMatches && effectiveRatio > 0) {
    const customX = 1 / effectiveRatio;
    const customLabel = customX >= 1 ? `1:${formatSmartNumber(customX, 2)}` : `${formatSmartNumber(effectiveRatio, 2)}:1`;
    const sBase = realBase * effectiveRatio;
    const sDisplay = sBase / (config.factors[scaleUnit] ?? 1);

    equivalentsList.push({
      scaleLabel: `${customLabel} (Active Scale)`,
      ratio: effectiveRatio,
      scaleLength: sDisplay,
      scaleUnit,
      realLength: finalRealVal,
      realUnit,
      description: "Current calculated scale",
      isCurrent: true,
    });
  }

  equivalentsList.sort((a, b) => b.ratio - a.ratio);

  return {
    solveFor,
    solvedValue: cleanFloat(solvedVal),
    solvedUnit,
    scaleValueDisplay: cleanFloat(finalScaleVal),
    scaleUnit,
    realValueDisplay: cleanFloat(finalRealVal),
    realUnit,
    ratioDecimal: cleanFloat(effectiveRatio),
    scaleRatioText: ratioDisplay,
    scaleFactorText: formatSmartNumber(effectiveRatio, 6),
    equivalents: equivalentsList,
    nearestStandardScale: nearestMatch,
    isValid: true,
  };
}
