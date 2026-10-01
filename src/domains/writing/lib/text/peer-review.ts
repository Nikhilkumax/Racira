/**
 * Peer review checklist: a sectioned set of items a reviewer works through, with
 * progress by section and a copyable review report.
 *
 * The items are the conventional questions a reviewer asks of a paper — does the
 * abstract match what was done, are the methods reproducible, do the results
 * support the claims — grouped into the sections a paper has. The checklist
 * organises the reading; it does not assess the paper itself.
 */

export interface ReviewItem {
  id: string;
  section: string;
  text: string;
}

export const PEER_REVIEW_CHECKLIST: ReviewItem[] = [
  { id: "abstract-claim", section: "Summary", text: "Does the abstract state what was actually done, not what was hoped?" },
  { id: "abstract-contribution", section: "Summary", text: "Is the contribution clear from the abstract alone?" },
  { id: "question-framed", section: "Introduction", text: "Is the research question stated, and is it answerable?" },
  { id: "literature-positioned", section: "Introduction", text: "Is the work positioned against the existing literature?" },
  { id: "methods-reproducible", section: "Methods", text: "Could another researcher repeat this from the methods as written?" },
  { id: "methods-appropriate", section: "Methods", text: "Are the methods appropriate to the question asked?" },
  { id: "ethics", section: "Methods", text: "Are ethics, consent and data handling described where relevant?" },
  { id: "results-support", section: "Results", text: "Do the results support the claims made in the discussion?" },
  { id: "stats", section: "Results", text: "Are the statistics reported with the detail a reader needs to judge them?" },
  { id: "limitations", section: "Discussion", text: "Are the limitations named honestly?" },
  { id: "conclusion-earned", section: "Discussion", text: "Does the conclusion follow from the evidence, without overreach?" },
  { id: "referencing", section: "Presentation", text: "Are the references complete and the figures and tables legible?" },
];

export interface SectionProgress {
  section: string;
  done: number;
  total: number;
}

export interface ReviewProgress {
  done: number;
  total: number;
  percent: number;
  sections: SectionProgress[];
}

/** Progress through the checklist, counted overall and by section. */
export function reviewProgress(done: string[]): ReviewProgress {
  const marked = new Set(done);
  const sections: SectionProgress[] = [];
  for (const item of PEER_REVIEW_CHECKLIST) {
    let section = sections.find((entry) => entry.section === item.section);
    if (!section) {
      section = { section: item.section, done: 0, total: 0 };
      sections.push(section);
    }
    section.total += 1;
    if (marked.has(item.id)) section.done += 1;
  }
  const completed = PEER_REVIEW_CHECKLIST.filter((item) => marked.has(item.id)).length;
  return {
    done: completed,
    total: PEER_REVIEW_CHECKLIST.length,
    percent: Math.round((completed / PEER_REVIEW_CHECKLIST.length) * 100),
    sections,
  };
}

/** A copyable review report: the ticks, the progress and the reviewer's notes. */
export function reviewReport(done: string[], comments: Record<string, string> = {}): string {
  const progress = reviewProgress(done);
  const marked = new Set(done);
  const lines = [
    `Peer review — ${progress.done}/${progress.total} items checked (${progress.percent}%)`,
    `By section: ${progress.sections.map((section) => `${section.section} ${section.done}/${section.total}`).join(" · ")}`,
    "",
  ];
  for (const item of PEER_REVIEW_CHECKLIST) {
    lines.push(`${marked.has(item.id) ? "[x]" : "[ ]"} ${item.text}`);
    const comment = comments[item.id]?.trim();
    if (comment) lines.push(`    ${comment}`);
  }
  return lines.join("\n");
}
