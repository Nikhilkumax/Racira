/**
 * Unit tests for the prose-to-bullets engine.
 *
 * The engine's only edit is connector removal, so the known positives assert
 * both the bullet and the reported connector, and the near-misses pin the cases
 * where a connector must stay (no comma, inside a word) or where an existing
 * list must survive untouched.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { LEADING_CONNECTORS, extractBullets, formatBulletList } from "./bullet-points.ts";

test("LEADING_CONNECTORS: unique, comma-terminated and non-empty", () => {
  assert.ok(LEADING_CONNECTORS.length >= 20);
  assert.equal(new Set(LEADING_CONNECTORS).size, LEADING_CONNECTORS.length);
  for (const connector of LEADING_CONNECTORS) {
    assert.ok(connector.endsWith(","), `${connector} keeps its comma`);
    assert.ok(connector.length > 3);
  }
});

test("extractBullets: one bullet per sentence, connector reported and removed", () => {
  const result = extractBullets("However, the plan changed. The team agreed on a new date. Finally, we shipped it.");
  assert.equal(result.bullets.length, 3);
  assert.equal(result.bullets[0].text, "The plan changed.");
  assert.equal(result.bullets[0].removedConnector, "However,");
  assert.equal(result.bullets[0].source, "However, the plan changed.");
  assert.equal(result.bullets[1].removedConnector, null);
  assert.equal(result.bullets[2].text, "We shipped it.");
});

test("extractBullets: a connector without its comma is left alone", () => {
  const result = extractBullets("However the plan changed.");
  assert.equal(result.bullets[0].removedConnector, null);
  assert.equal(result.bullets[0].text, "However the plan changed.");
});

test("extractBullets: existing list lines are preserved, or ignored on request", () => {
  const text = "- Keep this line\n- And this one\nWe add one more sentence.";
  const kept = extractBullets(text);
  assert.equal(kept.existingListItems.length, 2);
  assert.equal(kept.bullets.length, 1);
  const list = formatBulletList(kept);
  assert.ok(list.startsWith("- Keep this line\n- And this one\n- We add one more sentence."));

  // With the option off, existing list lines are ignored rather than converted:
  // the output is built from prose sentences only.
  const dropped = extractBullets(text, { keepExistingLists: false });
  assert.equal(dropped.existingListItems.length, 0);
  assert.equal(formatBulletList(dropped), "- We add one more sentence.");
});

test("extractBullets: only a single trailing period is stripped", () => {
  assert.equal(extractBullets("Finally, we shipped it.", { stripTrailingPeriod: true }).bullets[0].text, "We shipped it");
  assert.equal(extractBullets("Did we ship it?", { stripTrailingPeriod: true }).bullets[0].text, "Did we ship it?");
  assert.equal(extractBullets("We waited...", { stripTrailingPeriod: true }).bullets[0].text, "We waited...");
});

test("extractBullets: unicode and empty input", () => {
  const result = extractBullets("Le café était plein. Les gâteaux coûtaient 3 €.");
  assert.equal(result.bullets.length, 2);
  assert.ok(result.bullets[0].text.startsWith("Le café"));
  assert.deepEqual(extractBullets("").bullets, []);
  assert.equal(formatBulletList(extractBullets("")), "");
});
