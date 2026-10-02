/**
 * Proposal template: assemble a project proposal from a title, a client, the
 * problem, the approach, the deliverables, a timeline and a price, then check
 * that each section is present and specific.
 *
 * The engine writes no scope and no estimate; it provides the sections a client
 * expects and flags the blanks — an approach with one step, a price with no
 * figure in it.
 */
import { words } from "./tokenize.ts";

export interface ProposalInput {
  title: string;
  client: string;
  problem: string;
  approach: string[];
  deliverables: string[];
  timeline: string;
  price: string;
}

export interface ProposalCheck {
  id: string;
  message: string;
}

export interface ProposalDraft {
  proposal: string;
  words: number;
  deliverables: string[];
  checks: ProposalCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

export function buildProposal(input: ProposalInput): ProposalDraft {
  const title = clean(input.title);
  const client = clean(input.client);
  const problem = clean(input.problem);
  const approach = input.approach.map(clean).filter(Boolean);
  const deliverables = input.deliverables.map(clean).filter(Boolean);
  const timeline = clean(input.timeline);
  const price = clean(input.price);

  const blocks: string[] = [];
  if (title || client) {
    blocks.push([title ? `Proposal: ${title}` : "", client ? `Prepared for: ${client}` : ""].filter(Boolean).join("\n"));
  }
  if (problem) blocks.push(`Problem\n${problem}`);
  if (approach.length > 0) {
    blocks.push(`Approach\n${approach.map((step, index) => `${index + 1}. ${step}`).join("\n")}`);
  }
  if (deliverables.length > 0) {
    blocks.push(`Deliverables\n${deliverables.map((item) => `- ${item}`).join("\n")}`);
  }
  if (timeline) blocks.push(`Timeline\n${timeline}`);
  if (price) blocks.push(`Investment\n${price}`);

  const proposal = blocks.join("\n\n");

  const checks: ProposalCheck[] = [];
  if (!title) checks.push({ id: "title", message: "Give the proposal a title a client can refer to." });
  if (!client) checks.push({ id: "client", message: "Name the client; a proposal addressed to anyone belongs to no one." });
  if (!problem) {
    checks.push({ id: "problem", message: "State the problem in the client's terms before describing your approach." });
  }
  if (approach.length < 2) {
    checks.push({ id: "approach", message: "An approach needs at least two steps; one line reads as a promise rather than a plan." });
  }
  if (deliverables.length < 2) {
    checks.push({ id: "deliverables", message: "List at least two concrete deliverables, each a noun the client can check off." });
  }
  if (deliverables.length > 8) {
    checks.push({ id: "deliverables-many", message: `${deliverables.length} deliverables buries the scope; group them or keep the eight that matter.` });
  }
  if (!timeline) checks.push({ id: "timeline", message: "Add a timeline, even a rough one; clients price time as much as money." });
  if (!price) {
    checks.push({ id: "price", message: "Add the investment line, or say explicitly that the price follows." });
  } else if (!/\d/.test(price)) {
    checks.push({ id: "price-figure", message: "The investment line needs a figure; 'competitive' is not a price." });
  }

  return { proposal, words: words(proposal).length, deliverables, checks };
}
