/**
 * Locale-aware formatting helpers built on the platform `Intl` APIs.
 *
 * Nothing here is a hand-rolled formatter: number, date, currency and collation
 * results all come from `Intl.NumberFormat`, `Intl.DateTimeFormat` and
 * `Intl.Collator`, so the output matches what the runtime actually ships for a
 * locale. Invalid locale tags are caught and reported instead of thrown.
 *
 * The locale list is curated (the web platform has no "list every locale" API);
 * any valid BCP-47 tag the user types is still accepted.
 */

export interface LocaleOption {
  value: string;
  label: string;
}

/** Curated set of widely used BCP-47 tags, with the region spelled out. */
export const LOCALES: LocaleOption[] = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "en-AU", label: "English (Australia)" },
  { value: "en-CA", label: "English (Canada)" },
  { value: "en-IN", label: "English (India)" },
  { value: "en-NZ", label: "English (New Zealand)" },
  { value: "en-ZA", label: "English (South Africa)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "fr-CA", label: "French (Canada)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "de-AT", label: "German (Austria)" },
  { value: "de-CH", label: "German (Switzerland)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "es-MX", label: "Spanish (Mexico)" },
  { value: "es-AR", label: "Spanish (Argentina)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "pt-PT", label: "Portuguese (Portugal)" },
  { value: "it-IT", label: "Italian (Italy)" },
  { value: "nl-NL", label: "Dutch (Netherlands)" },
  { value: "sv-SE", label: "Swedish (Sweden)" },
  { value: "nb-NO", label: "Norwegian Bokmål (Norway)" },
  { value: "da-DK", label: "Danish (Denmark)" },
  { value: "fi-FI", label: "Finnish (Finland)" },
  { value: "pl-PL", label: "Polish (Poland)" },
  { value: "cs-CZ", label: "Czech (Czechia)" },
  { value: "sk-SK", label: "Slovak (Slovakia)" },
  { value: "hu-HU", label: "Hungarian (Hungary)" },
  { value: "ro-RO", label: "Romanian (Romania)" },
  { value: "tr-TR", label: "Turkish (Türkiye)" },
  { value: "ru-RU", label: "Russian (Russia)" },
  { value: "uk-UA", label: "Ukrainian (Ukraine)" },
  { value: "el-GR", label: "Greek (Greece)" },
  { value: "he-IL", label: "Hebrew (Israel)" },
  { value: "ar-EG", label: "Arabic (Egypt)" },
  { value: "ar-SA", label: "Arabic (Saudi Arabia)" },
  { value: "fa-IR", label: "Persian (Iran)" },
  { value: "ur-PK", label: "Urdu (Pakistan)" },
  { value: "hi-IN", label: "Hindi (India)" },
  { value: "bn-IN", label: "Bengali (India)" },
  { value: "ta-IN", label: "Tamil (India)" },
  { value: "te-IN", label: "Telugu (India)" },
  { value: "mr-IN", label: "Marathi (India)" },
  { value: "gu-IN", label: "Gujarati (India)" },
  { value: "th-TH", label: "Thai (Thailand)" },
  { value: "vi-VN", label: "Vietnamese (Vietnam)" },
  { value: "id-ID", label: "Indonesian (Indonesia)" },
  { value: "ms-MY", label: "Malay (Malaysia)" },
  { value: "fil-PH", label: "Filipino (Philippines)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
  { value: "ko-KR", label: "Korean (South Korea)" },
  { value: "zh-CN", label: "Chinese (Simplified, China)" },
  { value: "zh-TW", label: "Chinese (Traditional, Taiwan)" },
  { value: "zh-HK", label: "Chinese (Traditional, Hong Kong)" },
];

export type FormatResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** True when the tag is a syntactically valid locale the runtime accepts. */
export function isValidLocale(locale: string): boolean {
  if (!locale.trim()) return false;
  try {
    Intl.getCanonicalLocales(locale);
    new Intl.NumberFormat(locale);
    return true;
  } catch {
    return false;
  }
}

/**
 * Supported IANA time zones. `Intl.supportedValuesOf("timeZone")` omits the
 * "UTC" link, which is exactly the zone most people want for a deterministic
 * comparison, so it is prepended here.
 */
export function supportedTimeZones(): string[] {
  const supportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
    .supportedValuesOf;
  if (typeof supportedValuesOf !== "function") return ["UTC"];
  try {
    const zones = supportedValuesOf("timeZone").filter((zone) => zone !== "UTC");
    return ["UTC", ...zones];
  } catch {
    return ["UTC"];
  }
}

/** Supported ISO 4217 currency codes, or an empty list when unavailable. */
export function supportedCurrencies(): string[] {
  const supportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
    .supportedValuesOf;
  if (typeof supportedValuesOf !== "function") return [];
  try {
    return supportedValuesOf("currency");
  } catch {
    return [];
  }
}

/** The runtime's current time zone (used as the default selection). */
export function currentTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Format a numeric value; returns the error message instead of throwing. */
export function formatNumber(
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions = {},
): FormatResult<string> {
  if (!Number.isFinite(value)) return { ok: false, error: "Enter a finite number." };
  try {
    return { ok: true, value: new Intl.NumberFormat(locale, options).format(value) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid formatting options." };
  }
}

/** Format a Date; returns the error message instead of throwing. */
export function formatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {},
): FormatResult<string> {
  if (Number.isNaN(date.getTime())) return { ok: false, error: "Enter a valid date and time." };
  try {
    return { ok: true, value: new Intl.DateTimeFormat(locale, options).format(date) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid formatting options." };
  }
}

/** Parts of a formatted date (year/month/day/weekday/…), for the detail table. */
export function dateParts(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {},
): FormatResult<Intl.DateTimeFormatPart[]> {
  try {
    return { ok: true, value: new Intl.DateTimeFormat(locale, options).formatToParts(date) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid formatting options." };
  }
}

export interface SortOptions {
  locale: string;
  numeric?: boolean;
  sensitivity?: "base" | "accent" | "case" | "variant";
  caseFirst?: "upper" | "lower" | "false";
  ignorePunctuation?: boolean;
}

/**
 * Sort lines with `Intl.Collator` (the locale-aware default), plain code-point
 * order, or collator order with numeric collation forced on. The comparison is
 * stable: equal keys keep their input order.
 */
export function sortLines(lines: string[], options: SortOptions): FormatResult<string[]> {
  try {
    if (!isValidLocale(options.locale)) {
      return { ok: false, error: `"${options.locale}" is not a valid locale tag.` };
    }
    const collator = new Intl.Collator(options.locale, {
      numeric: options.numeric ?? false,
      sensitivity: options.sensitivity ?? "variant",
      caseFirst: options.caseFirst && options.caseFirst !== "false" ? options.caseFirst : undefined,
      ignorePunctuation: options.ignorePunctuation ?? false,
    });
    const decorated = lines.map((line, index) => ({ line, index }));
    decorated.sort((a, b) => {
      const result = collator.compare(a.line, b.line);
      return result !== 0 ? result : a.index - b.index;
    });
    return { ok: true, value: decorated.map((entry) => entry.line) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Collation failed." };
  }
}

/** Plain UTF-16 code-unit ordering, for comparison against the collator. */
export function sortByCodePoint(lines: string[]): string[] {
  return lines
    .map((line, index) => ({ line, index }))
    .sort((a, b) => {
      if (a.line === b.line) return a.index - b.index;
      return a.line < b.line ? -1 : 1;
    })
    .map((entry) => entry.line);
}

/**
 * Locale-aware sort with the digits-as-numbers preference inferred from the
 * data (used by the "sort naturally" column): lines whose first token parses as
 * a number compare numerically.
 */
export function sortNaturally(lines: string[], locale: string): FormatResult<string[]> {
  return sortLines(lines, { locale, numeric: true, sensitivity: "variant" });
}

/** Case-insensitive, accent-insensitive comparison used by the dedupe preview. */
export function localeKey(text: string, locale: string): string {
  try {
    return text.toLocaleLowerCase(locale).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch {
    return text.toLowerCase();
  }
}
