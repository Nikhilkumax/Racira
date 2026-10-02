/**
 * Email to formal letter: reformat a casual message as a letter and replace the
 * documented casual markers, listing every substitution.
 *
 * The moves are all mechanical and visible:
 *
 *   - the greeting is rewritten ("Hi Sam," -> "Dear Sam,"), or added and flagged;
 *   - the sign-off block is found anywhere in the last few lines, replaced with
 *     a formal valediction and a signature taken from the email or the sender
 *     option;
 *   - contractions are expanded from a published table;
 *   - casual phrases are replaced ("asap" -> "as soon as possible"); the
 *     first-person openers include their pronoun, so "I just wanted to" cannot
 *     turn into "I I am writing to";
 *   - emoji and runs of exclamation marks are removed, and counted.
 *
 * The body is never restructured. A letter that needs a different argument
 * needs a writer, and the checks say so instead of pretending otherwise.
 */
import { applyPhraseReplacements, findPhraseMatches, type PhraseEntry } from "./phrases.ts";
import { words } from "./tokenize.ts";

export interface LetterChange {
  id: string;
  from: string;
  to: string;
  note: string;
}

/** Contractions expanded in the formal version. */
export const LETTER_CONTRACTIONS: readonly [string, string][] = [
  ["can't", "cannot"],
  ["won't", "will not"],
  ["don't", "do not"],
  ["doesn't", "does not"],
  ["didn't", "did not"],
  ["isn't", "is not"],
  ["aren't", "are not"],
  ["wasn't", "was not"],
  ["weren't", "were not"],
  ["hasn't", "has not"],
  ["haven't", "have not"],
  ["hadn't", "had not"],
  ["i'm", "I am"],
  ["i've", "I have"],
  ["i'll", "I will"],
  ["i'd", "I would"],
  ["we're", "we are"],
  ["we've", "we have"],
  ["we'll", "we will"],
  ["they're", "they are"],
  ["they've", "they have"],
  ["you're", "you are"],
  ["you've", "you have"],
  ["it's", "it is"],
  ["that's", "that is"],
  ["there's", "there is"],
  ["let's", "let us"],
];

/**
 * Casual phrasing with a letter-appropriate equivalent. The first-person
 * openers carry their own pronoun so the replacement never doubles one.
 */
export const CASUAL_PHRASES: readonly { phrase: string; replacement: string; note: string }[] = [
  { phrase: "i just wanted to", replacement: "I am writing to", note: "The apologetic opener a letter does not need." },
  { phrase: "i wanted to", replacement: "I am writing to", note: "States the purpose directly." },
  { phrase: "thanks a lot", replacement: "thank you very much", note: "Warmer in speech than on paper." },
  { phrase: "thanks", replacement: "thank you", note: "The full form belongs in a letter." },
  { phrase: "cheers", replacement: "thank you", note: "Informal thanks." },
  { phrase: "asap", replacement: "as soon as possible", note: "Abbreviation for a deadline." },
  { phrase: "btw", replacement: "by the way", note: "Chat abbreviation." },
  { phrase: "let me know", replacement: "please let me know", note: "Adds the courtesy the letter register expects." },
  { phrase: "get back to me", replacement: "respond to me", note: "Phrasal verb with a formal equivalent." },
  { phrase: "reach out", replacement: "contact", note: "Business euphemism." },
  { phrase: "touch base", replacement: "make contact", note: "Business idiom." },
  { phrase: "no worries", replacement: "you are welcome", note: "Casual reassurance." },
  { phrase: "talk soon", replacement: "I look forward to speaking with you", note: "Warmth without the shorthand." },
  { phrase: "keep me posted", replacement: "please keep me informed", note: "Adds the politeness marker." },
  { phrase: "a lot of", replacement: "considerable", note: "Casual quantifier." },
  { phrase: "kids", replacement: "children", note: "Casual noun." },
  { phrase: "guys", replacement: "everyone", note: "Casual address." },
];

const GREETING = /^(hi|hey|hello|dear)\b[,\s]*(.*)$/i;
const CLOSING = /^(thanks|thank you|cheers|best|best wishes|regards|take care|talk soon|bye|speak soon)[,!.]*\s*$/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

export interface LetterDraft {
  output: string;
  changes: LetterChange[];
  checks: string[];
  words: number;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Turn the message into a letter and list every change. */
export function formaliseEmail(text: string, options: { sender?: string } = {}): LetterDraft {
  const changes: LetterChange[] = [];
  const checks: string[] = [];
  const sender = clean(options.sender ?? "");

  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const filled: number[] = [];
  lines.forEach((line, index) => {
    if (line.trim().length > 0) filled.push(index);
  });

  const firstIndex = filled.length > 0 ? filled[0] : -1;

  // The sign-off can sit on the last line or one or two lines above a typed
  // signature, so the last three non-empty lines are checked.
  const tail = filled.slice(-3);
  const closingIndex = tail.find((index) => CLOSING.test(lines[index].trim())) ?? -1;

  // A short line right after the sign-off reads as a typed name.
  let signature = sender;
  if (closingIndex >= 0 && !signature) {
    const afterIndex = lines.findIndex((line, index) => index > closingIndex && line.trim().length > 0);
    if (
      afterIndex >= 0 &&
      words(lines[afterIndex]).length <= 4 &&
      !/[.!?]$/.test(lines[afterIndex].trim())
    ) {
      signature = clean(lines[afterIndex]);
    }
  }

  let greeting: string | null = null;
  let emojiRemoved = 0;
  let bangsRemoved = 0;
  const bodyLines: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    let line = lines[index];

    if (index === firstIndex) {
      const match = line.match(GREETING);
      if (match) {
        const name = clean(match[2]).replace(/[,.!]+$/, "");
        greeting = `Dear ${name || "Sir or Madam"},`;
        if (match[1].toLowerCase() !== "dear") {
          changes.push({
            id: "greeting",
            from: line.trim(),
            to: greeting,
            note: "A letter opens with Dear; the name is kept exactly as written.",
          });
        }
        continue;
      }
    }

    // Everything from the sign-off onwards belongs to the closing block.
    if (closingIndex >= 0 && index >= closingIndex) continue;

    if (EMOJI.test(line)) {
      emojiRemoved += line.match(EMOJI)?.length ?? 0;
      line = line.replace(EMOJI, "");
    }
    const runs = line.match(/!{2,}/g);
    if (runs) {
      bangsRemoved += runs.length;
      line = line.replace(/!{2,}/g, "!");
    }
    bodyLines.push(line.replace(/[ \t]+$/, ""));
  }

  if (!greeting) {
    greeting = "Dear Sir or Madam,";
    checks.push("No greeting line found; Dear Sir or Madam was added — replace it with the reader's name.");
  }
  if (closingIndex < 0) {
    checks.push("No sign-off found; Yours sincerely was added with a signature line.");
  } else {
    changes.push({
      id: "closing",
      from: lines[closingIndex].trim(),
      to: "Yours sincerely,",
      note: "A letter closes with a formal valediction and a signature line.",
    });
  }
  if (emojiRemoved > 0) {
    changes.push({
      id: "emoji",
      from: `${emojiRemoved} emoji`,
      to: "removed",
      note: "Emoji are removed from the body; the letter register does not carry them.",
    });
  }
  if (bangsRemoved > 0) {
    changes.push({
      id: "bangs",
      from: `${bangsRemoved} repeated exclamation mark${bangsRemoved === 1 ? "" : "s"}`,
      to: "single or removed",
      note: "Runs of exclamation marks read as shouting in print.",
    });
  }

  // Contractions first, then the casual phrases, so "it's" is expanded before
  // any table phrase sees the sentence.
  let body = bodyLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  for (const [contraction, expansion] of LETTER_CONTRACTIONS) {
    const pattern = new RegExp(`\\b${contraction.replace(/'/g, "['\\u2019]")}\\b`, "gi");
    const matches = body.match(pattern);
    if (matches) {
      changes.push({
        id: "contraction",
        from: matches[0],
        to: expansion,
        note: "Contractions are expanded in a letter.",
      });
      body = body.replace(pattern, expansion);
    }
  }

  const phraseEntries: PhraseEntry[] = CASUAL_PHRASES.map((entry) => ({
    phrase: entry.phrase,
    note: entry.note,
    replacement: entry.replacement,
  }));
  const phraseMatches = findPhraseMatches(body, phraseEntries);
  for (const match of phraseMatches) {
    changes.push({
      id: "phrase",
      from: match.source,
      to: match.replacement ?? match.source,
      note: match.note,
    });
  }
  body = applyPhraseReplacements(body, phraseMatches).output;

  const bodyWordCount = words(body).length;
  if (bodyWordCount === 0) {
    checks.push("No body text found — the message was only a greeting and a sign-off.");
  } else if (bodyWordCount < 20) {
    checks.push("The body is under twenty words; a letter usually needs a stated purpose and a clear next step.");
  }

  const closing = `Yours sincerely,\n${signature || "[Your name]"}`;
  const output = `${greeting}\n\n${body}\n\n${closing}`;
  return { output, changes, checks, words: bodyWordCount };
}
