/**
 * Genre blender: two genres, their stock elements and their reader
 * expectations, combined into premise scaffolds that keep at least one
 * convention from each side.
 *
 * The blend is not a random mash-up. Each genre carries the elements its
 * readers expect — the objects, the pressures, the kinds of scene — and a
 * blend works when the two sets collide in a way that makes both still
 * recognisable. The engine pairs one element from each genre in five fixed
 * templates, names a required element if the writer supplies one, and shows
 * both conventions lists so the writer can see what a reader will expect to
 * survive the merge.
 *
 * The checks are the blend's own risks: the same genre twice is not a blend,
 * a missing element leaves the collision generic, and a blend whose
 * conventions cannot coexist is named rather than hidden.
 */
export interface Genre {
  id: string;
  name: string;
  /** Things and pressures this genre's readers expect to see. */
  elements: string[];
  /** The kinds of scene the genre is built from. */
  conventions: string[];
}

/** Ten genres with their stock elements and conventions. */
export const BLEND_GENRES: readonly Genre[] = [
  {
    id: "fantasy",
    name: "Fantasy",
    elements: ["a map that redraws itself", "a debt owed to something older than the kingdom", "a gate that opens only for the willing"],
    conventions: ["a journey out of the known world", "a rule of magic with a price", "a confrontation with what the hero refuses to become"],
  },
  {
    id: "science-fiction",
    name: "Science fiction",
    elements: ["a ship running past its rated life", "a system that has started answering back", "a colony whose records do not match its population"],
    conventions: ["a technology that changes what is possible", "a consequence measured in decades", "a question about who counts as a person"],
  },
  {
    id: "mystery",
    name: "Mystery",
    elements: ["a witness who lies by telling the truth", "an alibi with one gap in it", "a room everyone had a reason to enter"],
    conventions: ["a body or an absence that starts the clock", "clues that reverse meaning on rereading", "a solution the reader could have reached"],
  },
  {
    id: "romance",
    name: "Romance",
    elements: ["a promise made before the story begins", "a shared obligation neither can abandon", "a secret that delays honesty"],
    conventions: ["two people who want incompatible lives", "a barrier that is real, not a misunderstanding", "a choice made openly, at cost"],
  },
  {
    id: "horror",
    name: "Horror",
    elements: ["a house that keeps what it is given", "a recording that plays something new", "a town that agreed, decades ago, to look away"],
    conventions: ["a threat that follows rules the reader learns", "isolation that turns help into risk", "a cost paid by someone specific"],
  },
  {
    id: "thriller",
    name: "Thriller",
    elements: ["a courier who does not know what they carry", "a deadline nobody set out loud", "an organisation with two sets of orders"],
    conventions: ["pressure that never lets the protagonist stop", "information asymmetries that shift", "a final move that uses the antagonist's own method"],
  },
  {
    id: "western",
    name: "Western",
    elements: ["a town that pays in promises", "a railway line that will arrive regardless", "a gun kept unloaded on purpose"],
    conventions: ["a frontier where law is a proposal", "a stand taken at visible cost", "a departure that closes the story"],
  },
  {
    id: "historical",
    name: "Historical",
    elements: ["a ledger written in two hands", "a crossing that will not be repeated", "a trade that everyone depends on and nobody names"],
    conventions: ["a documented event the characters cannot change", "ordinary life under a large pressure", "a private decision that history will not record"],
  },
  {
    id: "comedy",
    name: "Comedy",
    elements: ["a plan that requires everyone to lie", "a formal occasion nobody has prepared for", "a misunderstanding that is technically true"],
    conventions: ["a social order that refuses to bend", "escalation that stays inside the rules", "a resolution that restores the ordinary world"],
  },
  {
    id: "noir",
    name: "Noir",
    elements: ["a case that pays too well", "a client whose story has no witnesses", "a favour owed to the wrong department"],
    conventions: ["a protagonist compromised before page one", "a city that rewards the wrong people", "a truth that costs more than the lie"],
  },
];

export interface BlendIdea {
  id: string;
  label: string;
  text: string;
}

export interface BlendResult {
  first: Genre | null;
  second: Genre | null;
  element: string;
  ideas: BlendIdea[];
  output: string;
  checks: string[];
}

export interface BlendInput {
  first?: string;
  second?: string;
  element?: string;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Combine the two genres into five premise scaffolds. */
export function blendGenres(input: BlendInput = {}): BlendResult {
  const first = BLEND_GENRES.find((genre) => genre.id === input.first) ?? null;
  const second = BLEND_GENRES.find((genre) => genre.id === input.second) ?? null;
  const element = clean(input.element ?? "");

  const ideas: BlendIdea[] = [];
  if (first && second && first.id !== second.id) {
    const a = first.elements;
    const b = second.elements;
    const required = element || `the ${first.name.toLowerCase()} element that refuses to fit`;
    ideas.push(
      {
        id: "collision",
        label: "Collision",
        text: `A ${first.name.toLowerCase()} story opens on ${a[0]}; a ${second.name.toLowerCase()} story opens on ${b[0]}. They are the same object, and ${required} is why nobody agrees what it is.`,
      },
      {
        id: "deadline",
        label: "Deadline",
        text: `The protagonist must resolve ${b[1]} before ${a[1]} comes due, and ${required} is the only thing that buys time.`,
      },
      {
        id: "inversion",
        label: "Inversion",
        text: `The ${second.name.toLowerCase()} conventions hold — ${second.conventions[1]} — until ${a[2]} arrives and forces the ${first.name.toLowerCase()} question: ${first.conventions[1]}.`,
      },
      {
        id: "cost",
        label: "Cost",
        text: `Solving ${a[0]} the ${first.name.toLowerCase()} way would satisfy ${b[2]}, but breaches ${second.conventions[2]}. ${element ? `${element} is the compromise; it satisfies no one.` : "The compromise satisfies no one."}`,
      },
      {
        id: "frame",
        label: "Frame",
        text: `Tell a ${first.name.toLowerCase()} story inside a ${second.name.toLowerCase()} one: ${a[1]} is the frame, ${b[0]} is the case, and ${required} is what the frame was built to hide.`,
      },
    );
  }

  const output = ideas.map((idea) => `${idea.label}\n${idea.text}`).join("\n\n");
  const checks: string[] = [];
  if (!first || !second) {
    checks.push("Pick both genres; the blend is the collision between them.");
  } else if (first.id === second.id) {
    checks.push(`${first.name} with ${second.name} is the same genre twice; the collision needs two sets of expectations.`);
  } else {
    const clash = first.conventions[0] === second.conventions[0];
    if (clash) {
      checks.push("Both genres share a convention; the blend will need a different point of friction.");
    }
  }
  if (!element) {
    checks.push("No required element; naming one — an object, a line, a place — keeps the collision specific instead of generic.");
  }
  if (first && second && first.id !== second.id && ideas.length === 0) {
    checks.push("No ideas generated; check the two genres are different.");
  }

  return { first, second, element, ideas, output, checks };
}
