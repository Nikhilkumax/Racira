/**
 * Consistent spelling: US and UK variants of the same word inside one document.
 *
 * Both spellings of every pair here are correct English. The fault this tool
 * looks for is a *document* that mixes them, which reads like two hands wrote
 * it. So the output is a count and a verdict about consistency, never a claim
 * about correctness — and the pairs whose meanings have drifted apart
 * (check / cheque, tire / tyre, curb / kerb, draft / draught, storey / story)
 * are deliberately excluded, because there the words are not variants of each
 * other at all.
 *
 * Three sources feed the analysis:
 *   - a listed set of pairs, published in the tool page;
 *   - the -ize / -ise and -yze / -yse families, matched on the same stem, so a
 *     word that is not on the list is still caught ("utilize" / "utilise");
 *   - the -ll- / -l- doubling families (traveled / travelled, canceled /
 *     cancelled), matched against a published list of stems, because a blind
 *     "collapse the doubled consonant" rule pairs words that are not variants
 *     of each other at all (filed / filled, tiled / tilled).
 */
export type Variant = "US" | "UK";

export interface VariantPair {
  us: string;
  uk: string;
}

/** Listed variants, grouped by the pair they belong to. */
export const VARIANT_PAIRS: VariantPair[] = [
  { us: "color", uk: "colour" },
  { us: "colors", uk: "colours" },
  { us: "colored", uk: "coloured" },
  { us: "favor", uk: "favour" },
  { us: "favorite", uk: "favourite" },
  { us: "favorite's", uk: "favourite's" },
  { us: "favorable", uk: "favourable" },
  { us: "honor", uk: "honour" },
  { us: "honors", uk: "honours" },
  { us: "honored", uk: "honoured" },
  { us: "labor", uk: "labour" },
  { us: "neighbor", uk: "neighbour" },
  { us: "neighbors", uk: "neighbours" },
  { us: "neighborhood", uk: "neighbourhood" },
  { us: "behavior", uk: "behaviour" },
  { us: "behaviors", uk: "behaviours" },
  { us: "flavor", uk: "flavour" },
  { us: "humor", uk: "humour" },
  { us: "rumor", uk: "rumour" },
  { us: "armor", uk: "armour" },
  { us: "endeavor", uk: "endeavour" },
  { us: "harbor", uk: "harbour" },
  { us: "vapor", uk: "vapour" },
  { us: "odor", uk: "odour" },
  { us: "splendor", uk: "splendour" },
  { us: "savior", uk: "saviour" },
  { us: "glamor", uk: "glamour" },
  { us: "rigor", uk: "rigour" },
  { us: "candor", uk: "candour" },
  { us: "clamor", uk: "clamour" },
  { us: "demeanor", uk: "demeanour" },
  { us: "valor", uk: "valour" },
  { us: "vigor", uk: "vigour" },
  { us: "parlor", uk: "parlour" },
  { us: "center", uk: "centre" },
  { us: "centers", uk: "centres" },
  { us: "centered", uk: "centred" },
  { us: "meter", uk: "metre" },
  { us: "liters", uk: "litres" },
  { us: "liter", uk: "litre" },
  { us: "theater", uk: "theatre" },
  { us: "fiber", uk: "fibre" },
  { us: "somber", uk: "sombre" },
  { us: "caliber", uk: "calibre" },
  { us: "specter", uk: "spectre" },
  { us: "maneuver", uk: "manoeuvre" },
  { us: "luster", uk: "lustre" },
  { us: "meager", uk: "meagre" },
  { us: "saber", uk: "sabre" },
  { us: "defense", uk: "defence" },
  { us: "offense", uk: "offence" },
  { us: "license", uk: "licence" },
  { us: "pretense", uk: "pretence" },
  { us: "catalog", uk: "catalogue" },
  { us: "dialog", uk: "dialogue" },
  { us: "analog", uk: "analogue" },
  { us: "monolog", uk: "monologue" },
  { us: "epilog", uk: "epilogue" },
  { us: "prolog", uk: "prologue" },
  { us: "program", uk: "programme" },
  { us: "encyclopedia", uk: "encyclopaedia" },
  { us: "pediatric", uk: "paediatric" },
  { us: "medieval", uk: "mediaeval" },
  { us: "anemia", uk: "anaemia" },
  { us: "leukemia", uk: "leukaemia" },
  { us: "esophagus", uk: "oesophagus" },
  { us: "diarrhea", uk: "diarrhoea" },
  { us: "anesthesia", uk: "anaesthesia" },
  { us: "esthetic", uk: "aesthetic" },
  { us: "archeology", uk: "archaeology" },
  { us: "gray", uk: "grey" },
  { us: "aluminum", uk: "aluminium" },
  { us: "airplane", uk: "aeroplane" },
  { us: "jewelry", uk: "jewellery" },
  { us: "counselor", uk: "counsellor" },
  { us: "marvelous", uk: "marvellous" },
  { us: "woolen", uk: "woollen" },
  { us: "plow", uk: "plough" },
  { us: "mold", uk: "mould" },
  { us: "smolder", uk: "smoulder" },
  { us: "mustache", uk: "moustache" },
  { us: "sulfur", uk: "sulphur" },
  { us: "cozy", uk: "cosy" },
  { us: "pajamas", uk: "pyjamas" },
  { us: "judgment", uk: "judgement" },
  { us: "aging", uk: "ageing" },
  { us: "skeptic", uk: "sceptic" },
  { us: "skeptical", uk: "sceptical" },
  { us: "pediatrician", uk: "paediatrician" },
  { us: "specialty", uk: "speciality" },
  { us: "fulfill", uk: "fulfil" },
  { us: "enroll", uk: "enrol" },
  { us: "installment", uk: "instalment" },
  { us: "skillful", uk: "skilful" },
  { us: "willful", uk: "wilful" },
];

/** "analyze" / "analyse": the -yze / -yse shape, matched on the shared stem. */
const YZE_RE = /^([a-z]{3,})(y[sz]e[sd]?|y[sz]ing)$/;

/** -ize / -ise, matched on the shared stem (organize / organise). */
const IZE_RE = /^([a-z]{4,})(i[sz]e[ds]?|i[sz]ing)$/;

/**
 * The -ll- / -l- doubling families. These are matched against a published list
 * of stems rather than by collapsing any double consonant, because a blind rule
 * pairs words that are not variants of each other at all (filed / filled,
 * tiled / tilled).
 */
export const DOUBLE_L_STEMS: string[] = [
  "cancel", "channel", "dial", "equal", "fuel", "jewel", "label", "level",
  "marvel", "model", "quarrel", "shovel", "signal", "total", "travel", "tunnel",
];

/**
 * Suffixes that start right after the stem's own final "l".
 * The stem already ends in l, so travelled is stem + "led" and traveled is
 * stem + "ed" — the extra l in the middle is the only difference.
 */
const DOUBLE_L_SUFFIX = /^(ed|ing|er|ers)$/;

function classifyDoubleL(word: string): { variant: Variant; family: string } | null {
  for (const stem of DOUBLE_L_STEMS) {
    if (!word.startsWith(stem)) continue;
    const rest = word.slice(stem.length);
    // Stem + l + suffix: the doubled form, travelled / cancelled (UK).
    if (rest.startsWith("l")) {
      const suffix = rest.slice(1);
      if (DOUBLE_L_SUFFIX.test(suffix)) return { variant: "UK", family: stem + suffix };
    }
    // Stem + suffix with no extra l: traveled / canceled (US).
    if (DOUBLE_L_SUFFIX.test(rest)) return { variant: "US", family: word };
  }
  return null;
}

export interface VariantOccurrence {
  word: string;
  start: number;
  end: number;
  variant: Variant;
  /** Family key: the US form of a listed pair, or the matched stem. */
  family: string;
  /** Which rule found it. */
  rule: "listed" | "ize-ise" | "yze-yse" | "ll-l";
}

export interface VariantFamily {
  family: string;
  rule: VariantOccurrence["rule"];
  usForms: string[];
  ukForms: string[];
  usCount: number;
  ukCount: number;
  mixed: boolean;
}

export interface VariantResult {
  occurrences: VariantOccurrence[];
  families: VariantFamily[];
  mixedFamilies: VariantFamily[];
  usTotal: number;
  ukTotal: number;
  /** Which variant the document leans on. */
  dominant: Variant | "even" | "none";
  /** The headline verdict. */
  consistency: "consistent-us" | "consistent-uk" | "mixed" | "no-variant-words";
  listedPairs: number;
}

const US_TO_FAMILY = new Map<string, string>();
const UK_TO_FAMILY = new Map<string, string>();
const UK_FORMS = new Set<string>();
for (const pair of VARIANT_PAIRS) {
  const family = pair.us;
  if (!US_TO_FAMILY.has(pair.us)) US_TO_FAMILY.set(pair.us, family);
  if (!UK_TO_FAMILY.has(pair.uk)) UK_TO_FAMILY.set(pair.uk, family);
  UK_FORMS.add(pair.uk);
}

/** Number of listed pairs (shown on the tool page). */
export const VARIANT_PAIR_COUNT = VARIANT_PAIRS.length;

const TOKEN_PATTERN = /[A-Za-z][A-Za-z'-]*/g;

function classifyToken(word: string): { variant: Variant; family: string; rule: VariantOccurrence["rule"] } | null {
  const lower = word.toLowerCase();

  const listedUs = US_TO_FAMILY.get(lower);
  if (listedUs) return { variant: "US", family: listedUs, rule: "listed" };
  const listedUk = UK_TO_FAMILY.get(lower);
  if (listedUk) return { variant: "UK", family: listedUk, rule: "listed" };

  const yze = lower.match(YZE_RE);
  if (yze) return { variant: lower.includes("yze") ? "US" : "UK", family: `${yze[1]}yse`, rule: "yze-yse" };

  const ize = lower.match(IZE_RE);
  if (ize) return { variant: lower.includes("ize") ? "US" : "UK", family: `${ize[1]}ise`, rule: "ize-ise" };

  const doubled = classifyDoubleL(lower);
  if (doubled) return { ...doubled, rule: "ll-l" };

  return null;
}

/** Analyse a text for mixed US/UK spellings. */
export function analyseSpellingVariants(text: string): VariantResult {
  const occurrences: VariantOccurrence[] = [];
  TOKEN_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    const classified = classifyToken(match[0]);
    if (!classified) continue;
    occurrences.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
      variant: classified.variant,
      family: classified.family,
      rule: classified.rule,
    });
  }

  // The stem-matched rules only mean something when both shapes are present in
  // one document, so those families are kept only when they are mixed. A listed
  // pair is reported even when the document uses it consistently, because then
  // it is evidence of which variant the writer chose.
  const byFamily = new Map<string, VariantOccurrence[]>();
  for (const occurrence of occurrences) {
    const list = byFamily.get(occurrence.family) ?? [];
    list.push(occurrence);
    byFamily.set(occurrence.family, list);
  }

  const families: VariantFamily[] = [];
  for (const [family, list] of byFamily) {
    const usForms = [...new Set(list.filter((entry) => entry.variant === "US").map((entry) => entry.word.toLowerCase()))];
    const ukForms = [...new Set(list.filter((entry) => entry.variant === "UK").map((entry) => entry.word.toLowerCase()))];
    const rule = list[0].rule;
    const mixed = usForms.length > 0 && ukForms.length > 0;
    if (rule !== "listed" && !mixed) continue;
    families.push({
      family,
      rule,
      usForms,
      ukForms,
      usCount: list.filter((entry) => entry.variant === "US").length,
      ukCount: list.filter((entry) => entry.variant === "UK").length,
      mixed,
    });
  }
  families.sort((a, b) => a.family.localeCompare(b.family));

  const kept = new Set(families.map((entry) => entry.family));
  const keptOccurrences = occurrences.filter((entry) => kept.has(entry.family));
  const mixedFamilies = families.filter((entry) => entry.mixed);
  const usTotal = keptOccurrences.filter((entry) => entry.variant === "US").length;
  const ukTotal = keptOccurrences.filter((entry) => entry.variant === "UK").length;

  let consistency: VariantResult["consistency"] = "no-variant-words";
  if (mixedFamilies.length > 0) consistency = "mixed";
  else if (usTotal > 0 && ukTotal === 0) consistency = "consistent-us";
  else if (ukTotal > 0 && usTotal === 0) consistency = "consistent-uk";

  const dominant: VariantResult["dominant"] =
    usTotal === 0 && ukTotal === 0 ? "none" : usTotal > ukTotal ? "US" : ukTotal > usTotal ? "UK" : "even";

  return {
    occurrences: keptOccurrences,
    families,
    mixedFamilies,
    usTotal,
    ukTotal,
    dominant,
    consistency,
    listedPairs: VARIANT_PAIR_COUNT,
  };
}

/** Report text for the copy/download buttons. */
export function formatVariantReport(result: VariantResult): string {
  if (result.occurrences.length === 0) {
    return `No variant spellings found. ${result.listedPairs} pairs checked, plus the -ize/-ise and -ll-/-l- shapes.`;
  }
  const lines = [
    `Variant spellings: ${result.occurrences.length} (US ${result.usTotal}, UK ${result.ukTotal})`,
    `Consistency: ${result.consistency}`,
    `Mixed families: ${result.mixedFamilies.length}`,
    "",
    ...result.families.map(
      (entry) => `${entry.family}: US [${entry.usForms.join(", ") || "—"}] UK [${entry.ukForms.join(", ") || "—"}]`,
    ),
  ];
  if (result.mixedFamilies.length > 0) {
    lines.push("", "Mixed in one document:");
    for (const entry of result.mixedFamilies) {
      lines.push(`  ${entry.usForms.join(", ")} / ${entry.ukForms.join(", ")}`);
    }
  }
  return lines.join("\n");
}
