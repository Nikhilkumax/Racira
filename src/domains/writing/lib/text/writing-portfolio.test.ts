import { test } from "node:test";
import assert from "node:assert/strict";
import { PORTFOLIO_MINIMUM, PORTFOLIO_TARGET, RECENT_YEARS, buildPortfolio } from "./writing-portfolio.ts";

const PIECES = [
  "The night bus network | journalism | City Weekly | 2025",
  "Who fixes the streetlights | journalism | City Weekly | 2023",
  "Three lessons from a failed pilot | essays | | 2024",
  "On the ninth floor | fiction | | 2022",
  "The last repair shop | fiction | Lit Mag | 2024",
  "Field notes | newsletter | | 2025",
  "Draft: the flood maps | journalism | |",
].join("\n");

test("the portfolio constants are fixed", () => {
  assert.equal(PORTFOLIO_TARGET, 10);
  assert.equal(PORTFOLIO_MINIMUM, 6);
  assert.equal(RECENT_YEARS, 3);
});

test("pieces are grouped by genre and ordered newest first", () => {
  const plan = buildPortfolio(
    { name: "Maya Chen", positioning: "I write about cities and the people who fix them.", pieces: PIECES },
    { currentYear: 2026 },
  );
  assert.deepEqual(plan.counts, {
    total: 7,
    genres: 4,
    dated: 6,
    placed: 3,
    selected: 7,
    mostRecent: 2025,
  });
  assert.deepEqual(plan.groups.map((group) => group.genre), ["essays", "fiction", "journalism", "newsletter"]);
  assert.deepEqual(plan.groups[2].pieces.map((piece) => piece.title), [
    "The night bus network",
    "Who fixes the streetlights",
    "Draft: the flood maps",
  ]);
  assert.deepEqual(plan.checks, [
    "1 piece has no year: Draft: the flood maps — without a year the order is a guess.",
    "1 title is under three words (Field notes): an editor scanning a list needs to know what each piece is about.",
  ]);
  assert.match(plan.output, /Journalism \(3\)/);
  assert.match(plan.scaffold, /Maya Chen writes:/);
  assert.match(plan.scaffold, /Essays, Fiction, Journalism, Newsletter/);
});

test("a stale portfolio is asked for recent work", () => {
  const pieces = [
    "The long commute | journalism | City Weekly | 2020",
    "The quiet office | journalism | City Weekly | 2021",
    "Notes on noise | essays | | 2020",
    "A room of screens | essays | | 2021",
    "The last train | fiction | Lit Mag | 2020",
    "Small hours | fiction | Lit Mag | 2021",
  ].join("\n");
  const plan = buildPortfolio({ pieces }, { currentYear: 2026 });
  assert.equal(plan.counts.mostRecent, 2021);
  assert.deepEqual(plan.checks, [
    "The most recent piece is from 2021; add recent work or a work in progress, or the portfolio reads as a closed chapter.",
    "1 title is under three words (Small hours): an editor scanning a list needs to know what each piece is about.",
  ]);
});

test("a single genre and undated pieces are named", () => {
  const single = buildPortfolio(
    {
      pieces: [
        "The long commute | journalism | City Weekly | 2024",
        "The quiet office | journalism | City Weekly | 2023",
        "Notes on noise | journalism | | 2022",
        "The last train | journalism | | 2022",
        "Small hours | journalism | | 2021",
        "The night shift | journalism | | 2021",
      ].join("\n"),
    },
    { currentYear: 2026 },
  );
  assert.deepEqual(single.checks, [
    "Every piece sits under “journalism”; one genre shows no range — add another category or split the portfolio by audience.",
    "1 title is under three words (Small hours): an editor scanning a list needs to know what each piece is about.",
  ]);

  const undated = buildPortfolio(
    {
      pieces: [
        "The long commute | journalism | City Weekly",
        "The quiet office | essays |",
        "Notes on noise | essays |",
        "The last train | fiction | Lit Mag",
        "Small hours | fiction |",
        "Field notes from the edge | newsletter |",
      ].join("\n"),
    },
    { currentYear: 2026 },
  );
  assert.ok(undated.checks.some((check) => check === "6 pieces have no year: The long commute, The quiet office, Notes on noise, The last train, Small hours, Field notes from the edge — without a year the order is a guess."));
});

test("a thin portfolio and unplaced work are flagged", () => {
  const plan = buildPortfolio(
    {
      pieces: [
        "The long commute | journalism | | 2024",
        "The quiet office | essays | | 2023",
        "Small hours | fiction | | 2022",
      ].join("\n"),
    },
    { currentYear: 2026 },
  );
  assert.deepEqual(plan.checks, [
    "3 pieces is thin for a working portfolio; six to ten shows range without asking for a long read.",
    "Every genre has exactly one piece; a portfolio reads as range when at least one category carries two or more.",
    "No piece lists where it appeared; unpublished work needs a context line — course, competition or personal project.",
    "1 title is under three words (Small hours): an editor scanning a list needs to know what each piece is about.",
  ]);
  assert.equal(plan.selected.length, 3);
});

test("an empty portfolio asks for lines", () => {
  const plan = buildPortfolio({}, { currentYear: 2026 });
  assert.deepEqual(plan.counts, { total: 0, genres: 0, dated: 0, placed: 0, selected: 0, mostRecent: null });
  assert.deepEqual(plan.checks, ["No pieces yet. Paste one per line as Title | Genre | Where it appeared | Year."]);
});
