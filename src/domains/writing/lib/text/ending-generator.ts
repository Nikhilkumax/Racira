/**
 * Ending generator: the shapes an ending can take, each one drafted against the
 * story's own want and obstacle so the writer can compare what each ending
 * promises and what it costs.
 *
 * An ending is a verdict on the force that pushed back all story. The six
 * shapes here are the verdicts that exist: the want won at a price, the want
 * revealed as the problem, the want abandoned at the threshold, the method that
 * defeats the protagonist, the world survived rather than fixed, and the
 * opening returned to changed. Each draft names what the shape asks of the
 * story, because an ending that arrives without setup reads as an accident.
 *
 * Ideas are generated only once a want and an obstacle exist — without both
 * there is nothing for an ending to answer. The checks name what the premise is
 * missing rather than dressing it up: a one-word want is a mood, and a story
 * with no named change has nowhere for the last scene to land.
 */
import { words } from "./tokenize.ts";

export interface EndingShape {
  id: string;
  name: string;
  /** What this ending promises the reader. */
  promise: string;
  /** What the shape asks of the story to work. */
  requires: string;
}

/** The six verdicts an ending can deliver. */
export const ENDING_SHAPES: readonly EndingShape[] = [
  {
    id: "full-circle",
    name: "Full circle",
    promise: "The opening image returns, changed by everything between.",
    requires: "An opening image worth returning to and one detail that has moved.",
  },
  {
    id: "cost",
    name: "Hard-won victory",
    promise: "The want is won, and the price is counted in the same scene.",
    requires: "A cost the reader saw the protagonist refuse earlier.",
  },
  {
    id: "inversion",
    name: "Inversion",
    promise: "The want turns out to be the obstacle, and is given up knowingly.",
    requires: "The want and the obstacle sharing a root the reader can now see.",
  },
  {
    id: "tragic",
    name: "Tragic fall",
    promise: "The protagonist's method for winning completes what the obstacle began.",
    requires: "A method the protagonist chose over a cleaner one.",
  },
  {
    id: "threshold",
    name: "Ambiguous threshold",
    promise: "The irreversible choice is made and the story stops before the result.",
    requires: "A choice genuinely balanced enough that two outcomes are possible.",
  },
  {
    id: "quiet-return",
    name: "Quiet return",
    promise: "The obstacle is survived rather than defeated, and what changed is named plainly.",
    requires: "An ordinary world worth returning to with something the protagonist now values differently.",
  },
];

export interface EndingIdea {
  id: string;
  name: string;
  promise: string;
  requires: string;
  text: string;
}

export interface EndingResult {
  protagonist: string;
  want: string;
  obstacle: string;
  turn: string;
  shapes: readonly EndingShape[];
  ideas: EndingIdea[];
  output: string;
  checks: string[];
  stats: { shapes: number; ideas: number; words: number };
}

export interface EndingInput {
  protagonist?: string;
  want?: string;
  obstacle?: string;
  /** What changes about the protagonist by the end. */
  turn?: string;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Draft each ending shape against the premise's want and obstacle. */
export function generateEndings(input: EndingInput = {}): EndingResult {
  const protagonist = clean(input.protagonist ?? "");
  const want = clean(input.want ?? "");
  const obstacle = clean(input.obstacle ?? "");
  const turn = clean(input.turn ?? "");

  const who = protagonist || "the protagonist";
  const change = turn || "the change the story was earning";
  const ideas: EndingIdea[] = [];

  if (want && obstacle) {
    const drafts: Record<string, string> = {
      "full-circle": `Return to the story's opening image: ${who} is back in the place the story opened on, and the want — ${want} — is still not settled. The last scene replays the first with one detail moved — ${change} — and the place is recognised rather than explained.`,
      cost: `${who} wins the want — ${want} — outright, and the win costs exactly what ${obstacle} always said it would. Put the cost in the same scene as the victory so the reader can tally both at once, and let the final line refuse to pretend the price was avoidable.`,
      inversion: `Reveal that the want — ${want} — was doing ${obstacle}'s work all along: it was a way of staying inside the problem. ${who} gives it up on the page, and the ending is the first choice the reader can trust.`,
      tragic: `${who} beats ${obstacle} with the obstacle's own method, and the method finishes what it started. The final beat shows the ordinary world adjusting to the protagonist's absence, without commentary and without a rescue.`,
      threshold: `${who} makes the irreversible choice and the story stops at the threshold. The reader sees the decision and not the result: the last image gives a direction, no verdict, and the ambiguity is deliberate rather than missing.`,
      "quiet-return": `${obstacle} is not defeated — it is survived. ${who} returns to ordinary life with the want — ${want} — out of reach, and with ${change}; the ending's work is naming that plainly in the last paragraph.`,
    };
    for (const shape of ENDING_SHAPES) {
      ideas.push({
        id: shape.id,
        name: shape.name,
        promise: shape.promise,
        requires: shape.requires,
        text: drafts[shape.id] ?? shape.promise,
      });
    }
  }

  const premise = [
    protagonist ? `cast: ${protagonist}` : "",
    want ? `want: ${want}` : "",
    obstacle ? `obstacle: ${obstacle}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const output = [
    premise,
    "",
    ...ideas.map((idea, index) => `${index + 1}. ${idea.name}\n   ${idea.text}`),
  ].join("\n");

  const checks: string[] = [];
  if (!want) {
    checks.push("No want named; an ending is a verdict on something specific.");
  }
  if (!obstacle) {
    checks.push("No obstacle; without the force that pushed back, the ending has nothing to answer.");
  }
  if (want && obstacle && !protagonist) {
    checks.push("No protagonist; an ending happens to someone, so name them.");
  }
  if (want && words(want).length < 3) {
    checks.push(`The want is ${words(want).length} word${words(want).length === 1 ? "" : "s"}; endings land on a concrete want, not a mood.`);
  }
  if (!turn) {
    checks.push("No turn; name what changes in the protagonist, or the closing scene will replay the opening.");
  }

  return {
    protagonist,
    want,
    obstacle,
    turn,
    shapes: ENDING_SHAPES,
    ideas,
    output,
    checks,
    stats: {
      shapes: ENDING_SHAPES.length,
      ideas: ideas.length,
      words: words([protagonist, want, obstacle, turn, output].join(" ")).length,
    },
  };
}
