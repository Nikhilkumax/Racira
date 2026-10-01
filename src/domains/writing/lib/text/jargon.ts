/**
 * Jargon: a curated list of workplace, technical, academic and marketing terms
 * with a plainer equivalent.
 *
 * This is a fixed, published table — there is no model, no meaning analysis and
 * no network call. A term that is not on the list is never touched, and every
 * substitution is returned with the match so the result can be reviewed line by
 * line. Some entries are precise technical terms in the right context (a
 * statistical model really is robust, an API really can be deprecated), so each
 * note says when the plain alternative fits and when the original is the right
 * word. The remover proposes; the writer decides.
 *
 * Matching follows the shared phrase engine: whole phrases only, longest first,
 * overlaps dropped, case-insensitive, with the source spelling preserved.
 */
import {
  applyPhraseReplacements,
  findPhraseMatches,
  type PhraseEntry,
  type PhraseMatch,
} from "./phrases.ts";

export const JARGON_TERMS: readonly PhraseEntry[] = [
  // ── Workplace and corporate ────────────────────────────────────────────────
  { phrase: "actionable", note: "Management shorthand for something you can act on.", replacement: "practical" },
  { phrase: "action item", note: "Meeting jargon for a task with an owner.", replacement: "task" },
  { phrase: "action items", note: "Meeting jargon for tasks with owners.", replacement: "tasks" },
  { phrase: "align on", note: "Corporate verb for reaching agreement.", replacement: "agree on" },
  { phrase: "at scale", note: "Vague way of saying widely or in large numbers.", replacement: "widely" },
  { phrase: "bandwidth", note: "Borrowed from networking to mean available time.", replacement: "time" },
  { phrase: "best practice", note: "Says a method is settled when it may only be common.", replacement: "proven method" },
  { phrase: "bleeding edge", note: "Marketing intensifier beyond leading edge.", replacement: "very new" },
  { phrase: "blue-sky thinking", note: "Corporate idiom for open-ended ideas.", replacement: "open-ended thinking" },
  { phrase: "boil the ocean", note: "Idiom for attempting far too much at once.", replacement: "attempt too much" },
  { phrase: "buy-in", note: "Business noun for agreement from the people affected.", replacement: "agreement" },
  { phrase: "cadence", note: "In business prose, a rhythm of meetings.", replacement: "schedule" },
  { phrase: "core competency", note: "Consulting term for what an organisation does well.", replacement: "strength" },
  { phrase: "deliverable", note: "Project jargon for a result the work must produce.", replacement: "result" },
  { phrase: "deliverables", note: "Project jargon for the results the work must produce.", replacement: "results" },
  { phrase: "double-click on", note: "Business metaphor for examining something closely.", replacement: "examine" },
  { phrase: "drill down", note: "Data jargon for looking at more detail.", replacement: "examine in detail" },
  { phrase: "due diligence", note: "Legal term used loosely; plain in everyday prose.", replacement: "careful review" },
  { phrase: "employee engagement", note: "Survey term for how invested staff feel.", replacement: "staff morale" },
  { phrase: "end-to-end", note: "Says complete in three syllables.", replacement: "complete" },
  { phrase: "evangelist", note: "Job title for someone who promotes a product.", replacement: "advocate" },
  { phrase: "evergreen", note: "Marketing metaphor for content that stays useful.", replacement: "long-lasting" },
  { phrase: "facilitate", note: "Formal verb with a plainer equivalent.", replacement: "help" },
  { phrase: "friction", note: "Product jargon for anything that slows a user.", replacement: "resistance" },
  { phrase: "granular", note: "Technical-sounding adjective for detailed.", replacement: "detailed" },
  { phrase: "growth hacking", note: "Marketing label for experiment-driven growth work.", replacement: "rapid experimentation" },
  { phrase: "guardrails", note: "Governance metaphor for limits on what is allowed.", replacement: "limits" },
  { phrase: "hand-off", note: "Process jargon for passing work to someone else.", replacement: "transfer" },
  { phrase: "headwinds", note: "Finance metaphor for conditions that make progress harder.", replacement: "obstacles" },
  { phrase: "holistic", note: "Formal adjective for considering the whole.", replacement: "complete" },
  { phrase: "ideate", note: "Invented verb for generating ideas.", replacement: "brainstorm" },
  { phrase: "impactful", note: "Marketing adjective for having an effect.", replacement: "effective" },
  { phrase: "in the weeds", note: "Idiom for being lost in detail.", replacement: "in the details" },
  { phrase: "incentivize", note: "Business verb for encouraging an action.", replacement: "encourage" },
  { phrase: "key takeaways", note: "Presentation label for the main points.", replacement: "main points" },
  { phrase: "takeaways", note: "Presentation label for the main points.", replacement: "main points" },
  { phrase: "kick-off", note: "Project jargon for the start of work.", replacement: "start" },
  { phrase: "learnings", note: "Business plural for lessons learned.", replacement: "lessons" },
  { phrase: "leverage", note: "Finance term used as a verb; use is shorter.", replacement: "use" },
  { phrase: "mission-critical", note: "Says essential with a hyphen.", replacement: "essential" },
  { phrase: "next-generation", note: "Marketing intensifier for new.", replacement: "new" },
  { phrase: "north star", note: "Strategy metaphor for a guiding goal.", replacement: "guiding goal" },
  { phrase: "onboard", note: "HR verb for bringing someone into a team.", replacement: "train" },
  { phrase: "operationalize", note: "Consulting verb for putting a plan into practice.", replacement: "put into practice" },
  { phrase: "optimize", note: "Often stands in for a plainer improve or tune.", replacement: "improve" },
  { phrase: "paradigm", note: "Academic word for a model or pattern.", replacement: "model" },
  { phrase: "ping", note: "Chat shorthand for sending a short message.", replacement: "message" },
  { phrase: "pivot", note: "Start-up jargon for changing direction.", replacement: "change direction" },
  { phrase: "pre-planning", note: "Doubles the meaning of planning.", replacement: "planning" },
  { phrase: "pushback", note: "Business noun for objections.", replacement: "objections" },
  { phrase: "quick win", note: "Project jargon for an easy early success.", replacement: "easy success" },
  { phrase: "quick wins", note: "Project jargon for easy early successes.", replacement: "easy successes" },
  { phrase: "ramp up", note: "Business phrasal verb for increasing.", replacement: "increase" },
  { phrase: "reach out", note: "Business euphemism for contacting someone.", replacement: "contact" },
  { phrase: "resourcing", note: "Project jargon for deciding who does the work.", replacement: "staffing" },
  { phrase: "rightsize", note: "Euphemism for changing headcount or scope.", replacement: "adjust the size of" },
  { phrase: "robust", note: "Precise in statistics; in marketing prose it usually means reliable.", replacement: "reliable" },
  { phrase: "roll out", note: "Product jargon for releasing something gradually.", replacement: "release" },
  { phrase: "runway", note: "Finance metaphor for time left before money runs out.", replacement: "time remaining" },
  { phrase: "scalable", note: "Technical term that often just means able to grow.", replacement: "able to grow" },
  { phrase: "seamless", note: "Marketing adjective for smooth or without interruption.", replacement: "smooth" },
  { phrase: "socialize", note: "Corporate verb for sharing an idea informally.", replacement: "share" },
  { phrase: "stakeholder", note: "Corporate noun for everyone affected by a decision.", replacement: "affected person" },
  { phrase: "stakeholders", note: "Corporate noun for everyone affected by a decision.", replacement: "affected people" },
  { phrase: "streamline", note: "Business verb for simplifying a process.", replacement: "simplify" },
  { phrase: "sunset", note: "Product jargon for discontinuing something.", replacement: "discontinue" },
  { phrase: "synergy", note: "The classic empty business word.", replacement: "cooperation" },
  { phrase: "synergies", note: "The plural of the classic empty business word.", replacement: "cooperation" },
  { phrase: "take offline", note: "Meeting jargon for discussing separately.", replacement: "discuss separately" },
  { phrase: "the ask", note: "Corporate noun for a request.", replacement: "the request" },
  { phrase: "thought leader", note: "Marketing title for a recognised expert.", replacement: "recognised expert" },
  { phrase: "tiger team", note: "Management jargon for a temporary task force.", replacement: "task force" },
  { phrase: "top-down", note: "Jargon when it means imposed rather than measured from above.", replacement: "directed from the top" },
  { phrase: "touchpoint", note: "Marketing noun for a point of contact.", replacement: "point of contact" },
  { phrase: "touchpoints", note: "Marketing noun for the points where a customer meets a brand.", replacement: "points of contact" },
  { phrase: "turnkey", note: "Sales adjective for ready to use.", replacement: "ready to use" },
  { phrase: "upskill", note: "HR verb for training staff.", replacement: "train" },
  { phrase: "value stream", note: "Lean-management term for a workflow.", replacement: "workflow" },
  { phrase: "vertical", note: "Business noun for an industry segment.", replacement: "industry" },
  { phrase: "wheelhouse", note: "Baseball idiom for an area of expertise.", replacement: "area of expertise" },
  { phrase: "whiteboard", note: "Office verb for sketching out an idea.", replacement: "sketch" },
  { phrase: "win-win", note: "Sales phrase for a deal that suits both sides.", replacement: "good for both sides" },
  { phrase: "workstream", note: "Programme jargon for a stream of related work.", replacement: "project" },

  // ── Technical ──────────────────────────────────────────────────────────────
  { phrase: "boilerplate", note: "Legal and coding jargon for standard text.", replacement: "standard text" },
  { phrase: "breaking change", note: "Release jargon for an incompatible change.", replacement: "incompatible change" },
  { phrase: "deprecated", note: "Keep when the exact API status matters; elsewhere say no longer supported.", replacement: "no longer supported" },
  { phrase: "footgun", note: "Developer slang for a design that invites mistakes.", replacement: "easy mistake" },
  { phrase: "glue code", note: "Developer slang for code that only connects two systems.", replacement: "connection code" },
  { phrase: "idempotent", note: "Precise in computing; only in general prose say safe to repeat.", replacement: "safe to repeat" },
  { phrase: "latency", note: "Technical term for delay, often in a user-facing description.", replacement: "delay" },
  { phrase: "magic number", note: "Coding jargon for an unexplained constant.", replacement: "unexplained constant" },
  { phrase: "microservice", note: "Architecture jargon for a small independent service.", replacement: "small service" },
  { phrase: "opinionated", note: "Software jargon for software with fixed conventions.", replacement: "with fixed conventions" },
  { phrase: "orthogonal", note: "Precise in mathematics; in general prose it means unrelated.", replacement: "unrelated" },
  { phrase: "refactor", note: "Developer verb for restructuring code without changing behaviour.", replacement: "restructure" },
  { phrase: "regression", note: "In software, a new bug in previously working code.", replacement: "new bug in old code" },
  { phrase: "rubber duck", note: "Developer shorthand for talking a problem through.", replacement: "talk it through" },
  { phrase: "scaffold", note: "Developer noun for starter structure.", replacement: "starter structure" },
  { phrase: "shim", note: "Developer noun for a small compatibility layer.", replacement: "compatibility layer" },
  { phrase: "throttle", note: "Systems verb for deliberately limiting a rate.", replacement: "limit" },

  // ── Academic and legal ─────────────────────────────────────────────────────
  { phrase: "aforementioned", note: "Legalistic adjective for already mentioned.", replacement: "already mentioned" },
  { phrase: "de facto", note: "Latin tag for in practice.", replacement: "in practice" },
  { phrase: "elucidate", note: "Formal verb for explain.", replacement: "explain" },
  { phrase: "herein", note: "Contract word for in this document.", replacement: "in this document" },
  { phrase: "hereinafter", note: "Contract word for from this point on.", replacement: "from this point on" },
  { phrase: "heretofore", note: "Archaic legal adverb for until now.", replacement: "until now" },
  { phrase: "inter alia", note: "Latin tag for among other things.", replacement: "among other things" },
  { phrase: "ipso facto", note: "Latin tag for by that fact alone.", replacement: "by that fact" },
  { phrase: "mutatis mutandis", note: "Latin tag for with the necessary changes made.", replacement: "with the necessary changes" },
  { phrase: "nexus", note: "Formal noun for a connection.", replacement: "connection" },
  { phrase: "notwithstanding", note: "Legalistic preposition for despite.", replacement: "despite" },
  { phrase: "pertaining to", note: "Formal phrase for about.", replacement: "about" },
  { phrase: "prima facie", note: "Legal Latin for on its face.", replacement: "on its face" },
  { phrase: "provided that", note: "Contract phrasing for if or as long as.", replacement: "if" },
  { phrase: "qua", note: "Latin tag for in the capacity of.", replacement: "as" },
  { phrase: "stipulate", note: "Legal verb for specify in an agreement.", replacement: "specify" },
  { phrase: "sui generis", note: "Latin tag for unique to itself.", replacement: "unique" },
  { phrase: "utilization", note: "Nominalisation of use.", replacement: "use" },
  { phrase: "vis-à-vis", note: "Latin tag for compared with.", replacement: "compared with" },
  { phrase: "viz.", note: "Abbreviation for namely.", replacement: "namely" },
  { phrase: "whereas", note: "Contract preamble word for because.", replacement: "because" },

  // ── Marketing ──────────────────────────────────────────────────────────────
  { phrase: "brand ambassador", note: "Marketing title for a promoter.", replacement: "promoter" },
  { phrase: "customer-centric", note: "Says focused on customers with a hyphen.", replacement: "focused on customers" },
  { phrase: "disruptive", note: "Overused adjective for new and different.", replacement: "new and different" },
  { phrase: "engagement", note: "Analytics word for interactions on a post.", replacement: "interaction" },
  { phrase: "frictionless", note: "Marketing adjective for easy.", replacement: "easy" },
  { phrase: "gamification", note: "Product term for adding game-like features.", replacement: "game-like features" },
  { phrase: "hyperlocal", note: "Marketing adjective for very local.", replacement: "very local" },
  { phrase: "influencer", note: "Marketing noun for someone paid or courted to promote.", replacement: "promoter" },
  { phrase: "omnichannel", note: "Retail jargon for selling across channels.", replacement: "across channels" },
  { phrase: "organic reach", note: "Social-media term for unpaid reach.", replacement: "unpaid reach" },
  { phrase: "pain point", note: "Marketing noun for a customer problem.", replacement: "problem" },
  { phrase: "pain points", note: "Marketing noun for customer problems.", replacement: "problems" },
  { phrase: "personalization", note: "Marketing noun for tailoring content.", replacement: "tailoring" },
  { phrase: "purchase journey", note: "Marketing metaphor for the buying process.", replacement: "buying process" },
  { phrase: "snackable content", note: "Marketing phrase for short content.", replacement: "short content" },
  { phrase: "storytelling", note: "Marketing noun for narrative.", replacement: "narrative" },
  { phrase: "thought leadership", note: "Marketing noun for expert commentary.", replacement: "expert commentary" },
  { phrase: "user-generated content", note: "Marketing term for customer-created content.", replacement: "customer-created content" },
  { phrase: "viral", note: "Marketing adjective for widely shared.", replacement: "widely shared" },

  // ── Metrics and reporting ──────────────────────────────────────────────────
  { phrase: "kpi", note: "Acronym for a measure of progress; name the measure instead.", replacement: "metric" },
  { phrase: "low-hanging fruit", note: "Business metaphor for the easiest win.", replacement: "easiest win" },
  { phrase: "move the needle", note: "Business idiom for making a measurable difference.", replacement: "make a difference" },
  { phrase: "north-star metric", note: "Strategy term for the one number a team follows.", replacement: "headline metric" },
  { phrase: "single source of truth", note: "Systems phrase for one authoritative copy.", replacement: "authoritative source" },
];

export function findJargon(text: string): PhraseMatch[] {
  return findPhraseMatches(text, JARGON_TERMS);
}

export interface JargonResult {
  /** The text with each listed term replaced, in document order. */
  output: string;
  replacements: PhraseMatch[];
}

/** Apply the jargon replacements left to right and return both copies. */
export function removeJargon(text: string): JargonResult {
  const replacements = findJargon(text);
  if (replacements.length === 0) return { output: text, replacements: [] };
  return { output: applyPhraseReplacements(text, replacements).output, replacements };
}
