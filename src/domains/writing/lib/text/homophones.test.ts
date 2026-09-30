/**
 * Unit tests for the homophone context rules.
 *
 * Each pair gets a positive case (the construction the rule documents) and the
 * negative near-misses that must stay silent — "Your car is nice" must not fire
 * for your/you're, "rather than" must not fire for then/than pointer. The probes
 * here are the precision claims the tool page makes.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HOMOPHONE_PAIR_COUNT,
  HOMOPHONE_RULES,
  findHomophoneConfusions,
  formatHomophoneReport,
  homophoneCounts,
} from "./homophones.ts";

const words = (text: string) => findHomophoneConfusions(text).map((finding) => `${finding.word}=>${finding.suggestion}`);

test("documents a fixed set of pairs with well-formed patterns", () => {
  assert.equal(HOMOPHONE_PAIR_COUNT, 44);
  assert.equal(HOMOPHONE_RULES.length, 44);
  const ids = HOMOPHONE_RULES.map((rule) => rule.id);
  assert.equal(new Set(ids).size, ids.length, "rule ids are unique");
  for (const rule of HOMOPHONE_RULES) {
    assert.ok(rule.patterns.length > 0, `${rule.id} has a pattern`);
    assert.ok(rule.pair.length > 0, `${rule.id} names its pair`);
  }
});

test("a lookbehind, when a pattern uses one, is always leading", () => {
  // Regression guard: a lookbehind placed after the consumed word is evaluated
  // after it and can never match, which silently disables the rule.
  for (const rule of HOMOPHONE_RULES) {
    for (const pattern of rule.patterns) {
      const source = pattern.re.source;
      if (source.includes("(?<=")) {
        assert.ok(source.startsWith("(?<="), `${rule.id} lookbehind is leading: ${source}`);
      }
    }
  }
});

test("flags the flagship confusions", () => {
  const cases: [string, string][] = [
    ["your going to love it", "your=>you're"],
    ["Its been a long day", "Its=>It's"],
    ["The dog lost it's collar", "it's=>its"],
    ["Your welcome to stay", "Your=>You're"],
    ["I like you're new car", "you're=>your"],
    ["Their is a problem", "Their=>There"],
    ["There dog is barking", "There=>Their"],
    ["They're is a problem", "They're=>There"],
    ["It is to late to stop", "to=>too"],
    ["I went too the store", "too=>to"],
    ["I have two much work", "two=>too"],
    ["This is better then that", "then=>than"],
    ["We ate and than we left", "than=>then"],
    ["The affect on sales was small", "affect=>effect"],
    ["The affects of the policy are unclear", "affects=>effects"],
    ["It will effect the outcome", "effect=>affect"],
    ["Don't loose your keys", "loose=>lose"],
    ["Want to loose weight fast", "loose=>lose"],
    ["Whose going to the party", "Whose=>Who's"],
    ["Who's book is this", "Who's=>Whose"],
    ["I have past the test", "past=>passed"],
    ["The passed week was busy", "passed=>past"],
    ["It was quiet good", "quiet=>quite"],
    ["Everyone accept me agreed", "accept=>except"],
    ["Please advice me", "advice=>advise"],
    ["She gave me good advise", "advise=>advice"],
    ["A piece of mind", "piece=>peace"],
    ["A peace of cake", "peace=>piece"],
    ["It is a moral principal", "principal=>principle"],
    ["The principle investigator called", "principle=>principal"],
    ["I need stationary for school", "stationary=>stationery"],
    ["The stationery car would not move", "stationery=>stationary"],
    ["They compliment each other well", "compliment=>complement"],
    ["The cite address is wrong", "cite=>site"],
    ["Please brake the silence", "brake=>break"],
    ["The break pads are worn", "break=>brake"],
    ["He has lead the team", "lead=>led"],
    ["I write everyday.", "everyday=>every day"],
    ["This is every day life", "day=>everyday"],
    ["alot of work", "alot=>a lot"],
    ["Read allowed in class", "allowed=>aloud"],
    ["I cannot bare it", "bare=>bear"],
    ["She was throne from the horse", "throne=>thrown"],
    ["The son light was bright", "son=>sun"],
    ["I don't know witch is better", "witch=>which"],
    ["Their going to the party", "Their=>There"],
    ["It will effect me deeply", "effect=>affect"],
    ["The stationery car would not move", "stationery=>stationary"],
  ];
  for (const [text, expected] of cases) {
    assert.deepEqual(words(text), [expected], text);
  }
});

test("leaves the near-misses alone", () => {
  const clean = [
    "Your car is nice",
    "It's been fun",
    "Its collar is red",
    "There is a cat",
    "Their dog is nice",
    "I went to the store",
    "We ate too much",
    "He ran faster than me",
    "Better than I thought",
    "I would rather walk than drive",
    "I have led the team",
    "a well-known fact",
    "Whether or not we go depends on the weather",
    "I read the book aloud",
    "I was not allowed to enter",
    "I passed the test",
    "The past week was busy",
    "She was quiet all evening",
    "Everyone except me agreed",
    "Please advise me",
    "Good advice is rare",
    "The principal of the school spoke",
    "In principle, that is right",
    "The stationary bike is broken",
    "I bought stationery paper",
    "These colours complement each other",
    "He gave me a compliment",
    "He will cite the source",
    "The site address is wrong",
    "The brakes failed",
    "He led the team",
    "I write every day",
    "The hole in the wall",
    "The whole day was ruined",
    "Please wait for me",
    "Losing weight is hard",
    "The weather forecast is good",
    "A piece of cake is nice",
    "Peace and quiet",
  ];
  for (const text of clean) {
    assert.deepEqual(words(text), [], text);
  }
});

test("points at the word, not the context, and shows a snippet", () => {
  const text = "This is better then that.";
  const [finding] = findHomophoneConfusions(text);
  assert.equal(finding.word, "then");
  assert.equal(text.slice(finding.start, finding.end), "then");
  assert.equal(finding.pair, "then / than");
  assert.match(finding.snippet, /better then that/);
  assert.match(finding.note, /comparison/i);
});

test("keeps the writer's capitalisation in the suggestion", () => {
  assert.deepEqual(words("Whose going home?"), ["Whose=>Who's"]);
  assert.deepEqual(words("their going home now"), ["their=>there"]);
});

test("suggests the plural form when the pattern matched a plural", () => {
  assert.deepEqual(words("The affects of the policy"), ["affects=>effects"]);
  assert.deepEqual(words("Those are moral principals"), ["principals=>principles"]);
  assert.deepEqual(words("It will effect the result"), ["effect=>affect"]);
});

test("reports several findings in document order", () => {
  const findings = findHomophoneConfusions("Their is a problem and your going to see it.");
  assert.deepEqual(
    findings.map((finding) => [finding.word, finding.suggestion]),
    [
      ["Their", "There"],
      ["your", "you're"],
    ],
  );
  assert.ok(findings[0].start < findings[1].start);
});

test("counts findings per pair", () => {
  const findings = findHomophoneConfusions("your going, your welcome, It was to late");
  assert.deepEqual(homophoneCounts(findings), [
    { pair: "your / you're", count: 2 },
    { pair: "to / too / two", count: 1 },
  ]);
});

test("formats a report for copying and downloading", () => {
  assert.equal(formatHomophoneReport([], 44), "No suspicious homophones. 44 confusion pairs checked.");
  const report = formatHomophoneReport(findHomophoneConfusions("This is better then that"), 44);
  assert.match(report, /Possible homophone confusions: 1/);
  assert.match(report, /then → than {2}\(then \/ than\)/);
});
