/**
 * Unit tests for the Intl helpers.
 *
 * Reference strings were captured from this runtime's ICU data before being
 * written down (V8 24.x): grouping and date output can differ between ICU
 * versions, so the assertions below are the ones that are stable across
 * supported locales.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  currentTimeZone,
  dateParts,
  formatDate,
  formatNumber,
  isValidLocale,
  localeKey,
  sortByCodePoint,
  sortLines,
  supportedCurrencies,
  supportedTimeZones,
  type FormatResult,
} from "./intl.ts";

/** Unwrap a FormatResult, failing the test loudly when the call reported an error. */
function value<T>(result: FormatResult<T>): T {
  if (!result.ok) throw new Error(`expected a formatted value, got: ${result.error}`);
  return result.value;
}

/** Narrow no-break space and no-break space compare equal to a plain space here. */
const squash = (text: string) => text.replace(/[\u202f\u00a0]/g, " ");

test("formatNumber: verified locale grouping", () => {
  assert.equal(value(formatNumber(1234567.89, "en-US")), "1,234,567.89");
  assert.equal(value(formatNumber(1234567.89, "de-DE")), "1.234.567,89");
  assert.equal(value(formatNumber(1234567.89, "hi-IN")), "12,34,567.89");
  assert.equal(squash(value(formatNumber(1234.5, "fr-FR"))), "1 234,5");
});

test("formatNumber: styles", () => {
  const currency = value(formatNumber(1234.5, "de-DE", { style: "currency", currency: "EUR" }));
  assert.equal(squash(currency), "1.234,50 €");
  const percent = value(formatNumber(0.256, "en-US", { style: "percent", maximumFractionDigits: 1 }));
  assert.equal(percent, "25.6%");
  const compact = value(formatNumber(12500, "en-US", { notation: "compact" }));
  assert.equal(compact, "13K");
});

test("formatNumber: invalid input returns an error instead of throwing", () => {
  const notFinite = formatNumber(Number.POSITIVE_INFINITY, "en-US");
  assert.equal(notFinite.ok, false);
  const badLocale = formatNumber(1, "not a locale!!");
  assert.equal(badLocale.ok, false);
  const badCurrency = formatNumber(1, "en-US", { style: "currency", currency: "NOTACODE" });
  assert.equal(badCurrency.ok, false);
});

test("formatDate: same instant, different zones", () => {
  const instant = new Date(Date.UTC(2026, 8, 29, 20, 0));
  assert.equal(value(formatDate(instant, "en-US", { dateStyle: "medium", timeZone: "UTC" })), "Sep 29, 2026");
  assert.equal(
    value(formatDate(instant, "en-US", { dateStyle: "medium", timeZone: "Asia/Tokyo" })),
    "Sep 30, 2026",
    "Tokyo is UTC+9, so the local date rolls over",
  );
  assert.equal(value(formatDate(instant, "de-DE", { dateStyle: "medium", timeZone: "UTC" })), "29.09.2026");
  assert.equal(
    value(
      formatDate(instant, "en-US", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" }),
    ),
    "09/29/2026",
  );
});

test("formatDate: invalid date and bad time zone are reported", () => {
  assert.equal(formatDate(new Date(Number.NaN), "en-US").ok, false);
  assert.equal(formatDate(new Date(), "en-US", { timeZone: "Mars/Olympus" }).ok, false);
});

test("dateParts: exposes the formatted pieces", () => {
  const parts = value(
    dateParts(new Date(Date.UTC(2026, 8, 29, 13, 45)), "en-US", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );
  assert.equal(parts.find((part) => part.type === "hour")?.value, "13");
  assert.equal(parts.find((part) => part.type === "minute")?.value, "45");
});

test("sortLines: collator orders umlauts by alphabet, code-point does not", () => {
  const words = ["zebra", "\u00c4rger", "apfel"];
  assert.deepEqual(value(sortLines(words, { locale: "de-DE" })), ["apfel", "\u00c4rger", "zebra"]);
  assert.deepEqual(sortByCodePoint(words), ["apfel", "zebra", "\u00c4rger"]);
});

test("sortLines: numeric collation sorts item2 before item10", () => {
  assert.deepEqual(
    value(sortLines(["item10", "item2", "item1"], { locale: "en", numeric: true })),
    ["item1", "item2", "item10"],
  );
  assert.deepEqual(
    value(sortLines(["item10", "item2", "item1"], { locale: "en", numeric: false })),
    ["item1", "item10", "item2"],
  );
});

test("sortLines: invalid locale is reported, not thrown", () => {
  assert.equal(sortLines(["a"], { locale: "not a locale!!" }).ok, false);
});

test("sortLines: base sensitivity ignores case, order stays stable", () => {
  // "A" and "a" compare equal at base sensitivity, so their input order is kept.
  assert.deepEqual(value(sortLines(["A", "a", "b"], { locale: "en", sensitivity: "base" })), ["A", "a", "b"]);
  assert.deepEqual(value(sortLines(["a", "A", "b"], { locale: "en", sensitivity: "base" })), ["a", "A", "b"]);
  assert.deepEqual(value(sortLines(["b2", "b1", "a1"], { locale: "en", numeric: true })), ["a1", "b1", "b2"]);
});

test("isValidLocale and environment helpers", () => {
  assert.equal(isValidLocale("en-US"), true);
  assert.equal(isValidLocale("de"), true);
  assert.equal(isValidLocale("not a locale!!"), false);
  assert.equal(isValidLocale(""), false);
  assert.ok(supportedTimeZones().includes("UTC"));
  assert.ok(supportedCurrencies().includes("USD"));
  assert.equal(typeof currentTimeZone(), "string");
});

test("localeKey: case- and accent-insensitive key", () => {
  assert.equal(localeKey("\u00c4rger", "de-DE"), "arger");
  assert.equal(localeKey("CAFÉ", "fr-FR"), "cafe");
});
