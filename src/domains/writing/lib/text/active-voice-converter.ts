/**
 * Active voice converter: find passive constructions and recast the ones it can
 * recast correctly, then say plainly which ones it could not.
 *
 * A passive sentence is a form of "be" plus a past participle, and it only
 * becomes an active sentence when the actor is named — otherwise there is
 * nothing to put in the subject position. So the engine:
 *
 *   1. finds `be + participle` where the participle ends in -ed or appears in
 *      the published irregular table;
 *   2. takes the actor from a following "by …" phrase, unless that phrase is an
 *      idiom or a time ("by hand", "by Friday") rather than a person;
 *   3. rebuilds the sentence in the tense it can prove: simple past from
 *      was/were, perfect from has/have/had been;
 *   4. reports everything else — agentless passives, present tense, adjectival
 *      participles — as findings with no rewrite, and counts them.
 *
 * Nothing is guessed. A sentence the rules do not cover is left exactly as it
 * was and listed as such, which is the honest behaviour for a rule engine.
 */
import { words } from "./tokenize.ts";

/**
 * Past participles with an irregular simple past. Named apart from the shared
 * IRREGULAR_PARTICIPLES set in lexicons.ts, which answers a different question
 * (is this token a participle at all).
 */
export const PARTICIPLE_SIMPLE_PAST: Record<string, string> = {
  written: "wrote",
  taken: "took",
  given: "gave",
  done: "did",
  seen: "saw",
  held: "held",
  kept: "kept",
  found: "found",
  led: "led",
  read: "read",
  told: "told",
  brought: "brought",
  bought: "bought",
  taught: "taught",
  chosen: "chose",
  drawn: "drew",
  driven: "drove",
  eaten: "ate",
  begun: "began",
  spoken: "spoke",
  broken: "broke",
  thrown: "threw",
  worn: "wore",
  won: "won",
  lost: "lost",
  paid: "paid",
  sold: "sold",
  spent: "spent",
  caught: "caught",
  cut: "cut",
  put: "put",
  set: "set",
  left: "left",
  met: "met",
  run: "ran",
  known: "knew",
  shown: "showed",
  hidden: "hid",
  forgotten: "forgot",
  sent: "sent",
  made: "made",
  built: "built",
};

/**
 * Participles that usually describe a state rather than an action. Recasting
 * "she was tired by noon" as "noon tired she" would be wrong, so these are
 * reported and never converted.
 */
export const ADJECTIVAL_PARTICIPLES = new Set([
  "tired",
  "interested",
  "excited",
  "worried",
  "surprised",
  "concerned",
  "involved",
  "based",
  "located",
  "situated",
  "married",
  "related",
  "filled",
  "covered",
  "dressed",
  "seated",
  "experienced",
  "qualified",
  "dedicated",
  "committed",
  "determined",
  "pleased",
  "delighted",
  "disappointed",
  "satisfied",
  "accustomed",
  "familiar",
  "aware",
]);

/** "by" phrases that are idioms or times, not actors. */
const NON_AGENT_BY =
  /^(?:then|now|tomorrow|yesterday|today|tonight|noon|midnight|night|morning|afternoon|evening|hand|heart|default|design|name|law|definition|nature|mistake|accident|chance|far|all means|no means|and large|contrast|comparison|example|extension|necessity|proxy|the time|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|\d[\w:.]*)(?![\p{L}\p{N}])/iu;

/** Subject starters that can safely lose their capital when recast. */
const COMMON_STARTERS = new Set([
  "the",
  "a",
  "an",
  "this",
  "that",
  "these",
  "those",
  "it",
  "he",
  "she",
  "they",
  "we",
  "you",
  "my",
  "our",
  "his",
  "her",
  "their",
]);

const PASSIVE = /\b(has been|have been|had been|was|were|is|are|am)\s+([a-z]+)\b(?:\s+by\s+([^,.;:!?]+))?/i;

export interface PassiveFinding {
  /** The clause as written. */
  source: string;
  /** The active rewrite, or null when no rule covers this sentence. */
  active: string | null;
  agent: string | null;
  verb: string;
  tense: string;
  /** Why no rewrite was produced, when `active` is null. */
  reason: string | null;
}

export interface PassiveReport {
  output: string;
  findings: PassiveFinding[];
  converted: number;
  agentless: number;
  /** Clauses left exactly as written, with a reason. */
  unconverted: number;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function softenCase(value: string): string {
  const first = words(value)[0]?.toLowerCase() ?? "";
  return COMMON_STARTERS.has(first) ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}

function isParticiple(verb: string): boolean {
  const lower = verb.toLowerCase();
  return lower.endsWith("ed") || Object.prototype.hasOwnProperty.call(PARTICIPLE_SIMPLE_PAST, lower);
}

function simplePast(participle: string): string {
  const lower = participle.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(PARTICIPLE_SIMPLE_PAST, lower)) {
    return PARTICIPLE_SIMPLE_PAST[lower];
  }
  return lower; // a regular participle already is its own simple past
}

/** Every passive construction found, converted or not. */
export function findPassive(text: string): PassiveFinding[] {
  const findings: PassiveFinding[] = [];
  const paragraphs = text.split(/\n+/);

  for (const paragraph of paragraphs) {
    const clauses = paragraph.split(/(?<=[.!?])\s+/).filter((part) => part.trim().length > 0);
    for (const clause of clauses) {
      const match = clause.match(PASSIVE);
      if (!match || match.index === undefined) continue;
      const [, aux, verb, rawAgent] = match;
      if (!isParticiple(verb)) continue;
      if (ADJECTIVAL_PARTICIPLES.has(verb.toLowerCase())) continue;

      const subject = clause.slice(0, match.index).trim();
      const agentText = rawAgent?.trim() ?? "";
      const isAgent = agentText.length > 0 && !NON_AGENT_BY.test(agentText);
      const lowerAux = aux.toLowerCase();

      let active: string | null = null;
      let reason: string | null = null;

      if (!subject) {
        reason = "No subject before the verb; nothing to put after the actor.";
      } else if (!isAgent) {
        reason = "No named actor: add one, or keep the passive if the actor is unknown or unimportant.";
      } else if (lowerAux === "was" || lowerAux === "were") {
        active = `${capitalize(agentText)} ${simplePast(verb)} ${softenCase(subject)}.`;
      } else if (lowerAux === "has been" || lowerAux === "have been" || lowerAux === "had been") {
        const helper = lowerAux.split(" ")[0];
        active = `${capitalize(agentText)} ${helper} ${verb.toLowerCase()} ${softenCase(subject)}.`;
      } else {
        reason = `Tense "${aux} ${verb}" is not covered; recast by hand.`;
      }

      findings.push({
        source: clause.trim(),
        active,
        agent: isAgent ? agentText : null,
        verb,
        tense: lowerAux,
        reason,
      });
    }
  }

  return findings;
}

/** Rewrite every convertible passive and report the rest. */
export function convertPassive(text: string): PassiveReport {
  const findings = findPassive(text);
  const convertible = findings.filter((finding) => finding.active !== null);

  let output = text;
  for (const finding of convertible) {
    if (finding.active) output = output.replace(finding.source, finding.active);
  }

  return {
    output,
    findings,
    converted: convertible.length,
    agentless: findings.filter((finding) => finding.agent === null).length,
    unconverted: findings.filter((finding) => finding.active === null).length,
  };
}
