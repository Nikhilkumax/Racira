"use strict";
/**
 * Shared length-unit conversion — single source of truth for every CAD tool
 * that needs unit handling (Scale Calculator, Scale Bar Tool, …).
 *
 * All factors are "meters per one unit", so converting value → meters → value
 * is always `v / f(a) * f(b)` and never needs a pairwise lookup table. All
 * factors are exact by definition (SI, inch = 25.4 mm, IAU Julian year) or
 * reference-standard:
 *   - foot = 0.3048 m (exact, international foot), imperial chain derived.
 *   - light-year = 9,460,730,472,580,800 m (IAU, exact Julian year × c).
 *   - PostScript point = 1/72 in, pica = 1/6 in (PostScript Language
 *     Reference), pixel = 1/96 in (CSS reference pixel).
 *   - HP-GL unit = 0.025 mm (40 units per mm).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_UNITS = exports.OTHER_UNITS = exports.NAUTICAL_UNITS = exports.IMPERIAL_UNITS = exports.SI_UNITS = exports.UNIT_LABELS = exports.METERS_PER_UNIT = void 0;
exports.isKnownUnit = isKnownUnit;
exports.convertLength = convertLength;
exports.METERS_PER_UNIT = {
    // SI — small end
    ym: 1e-24, zm: 1e-21, am: 1e-18, fm: 1e-15, pm: 1e-12,
    Å: 1e-10, nm: 1e-9, μm: 1e-6, mm: 1e-3, cm: 1e-2, dm: 0.1,
    // SI — base and large end
    m: 1, dam: 10, hm: 100, km: 1e3, Mm: 1e6, Gm: 1e9,
    Tm: 1e12, Pm: 1e15, Em: 1e18, Zm: 1e21, Ym: 1e24,
    // Imperial / US (survey-adjacent definitions, exact by construction)
    th: 0.3048 / 12e3, in: 0.3048 / 12, li: 0.3048 / 12 * 7.92,
    ft: 0.3048, rd: 0.3048 / 12 * 7.92 * 25, yd: 0.3048 * 3,
    ch: 0.3048 * 3 * 22, fur: 0.3048 * 3 * 22 * 10, mi: 0.3048 * 3 * 22 * 10 * 8,
    lea: 0.3048 * 3 * 22 * 10 * 8 * 3,
    // Nautical
    ftm: 1.8288, cb: 185.2, NM: 1852,
    // Other
    ly: 9460730472580800, pt: 0.3048 / 12 / 72, p: 0.3048 / 12 / 6,
    px: 0.3048 / 12 / 96, hpgl: 0.025,
};
exports.UNIT_LABELS = {
    ym: "yoctometer", zm: "zeptometer", am: "attometer", fm: "femtometer",
    pm: "picometer", Å: "ångström", nm: "nanometer", μm: "micrometer",
    mm: "millimeter", cm: "centimeter", dm: "decimeter",
    m: "meter", dam: "decameter", hm: "hectometer", km: "kilometer",
    Mm: "megameter", Gm: "gigameter", Tm: "terameter", Pm: "petameter",
    Em: "exameter", Zm: "zettameter", Ym: "yottameter",
    th: "thou", in: "inch", li: "link", ft: "foot", rd: "rod",
    yd: "yard", ch: "chain", fur: "furlong", mi: "mile", lea: "league",
    ftm: "fathom", cb: "cable", NM: "nautical mile",
    ly: "light-year", pt: "PostScript point", p: "PostScript pica",
    px: "pixel", hpgl: "HP-GL unit",
};
/** SI small→large, then imperial/US, nautical, and the "other" group. */
exports.SI_UNITS = ["ym", "zm", "am", "fm", "pm", "Å", "nm", "μm", "mm", "cm", "dm", "m", "dam", "hm", "km", "Mm", "Gm", "Tm", "Pm", "Em", "Zm", "Ym"];
exports.IMPERIAL_UNITS = ["th", "in", "li", "ft", "rd", "yd", "ch", "fur", "mi", "lea"];
exports.NAUTICAL_UNITS = ["ftm", "cb", "NM"];
exports.OTHER_UNITS = ["ly", "pt", "p", "px", "hpgl"];
exports.ALL_UNITS = [...exports.SI_UNITS, ...exports.IMPERIAL_UNITS, ...exports.NAUTICAL_UNITS, ...exports.OTHER_UNITS];
/** True when both unit keys are known. */
function isKnownUnit(u) {
    return Object.prototype.hasOwnProperty.call(exports.METERS_PER_UNIT, u);
}
/**
 * Convert a value between two units of length via meters — the only place
 * conversion math should live so tools cannot drift apart.
 */
function convertLength(value, from, to) {
    return (value * exports.METERS_PER_UNIT[from]) / exports.METERS_PER_UNIT[to];
}
