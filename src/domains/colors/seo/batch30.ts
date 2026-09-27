import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 30.
 *
 * One slug, and it is the last one in the registry that can be documented honestly
 * without either repairing a component or differentiating a duplicate. The naming
 * challenge was verified line by line: it draws from the standard CSS named-colour
 * list, offers four names per round, keeps a score and a streak, and shows the correct
 * answer after a guess.
 *
 * Everything still unauthored at this point falls into one of four groups, and none of
 * them is a writing job:
 *   1. identical component, no distinct page — the harmony finders, the pastel, neon,
 *      earth, frosted, overlay, screen, webcam, favourite and history pickers, the
 *      palette-size trio, the three CSS format generators, the two opacity tools, the
 *      reference duplicates (Munsell, NCS, naming history -> the HTML colour list) and
 *      the three Salesforce-backed framework references (Adobe Spectrum, Atlassian,
 *      GitHub Primer all render the same six Salesforce tokens);
 *   2. promise not met by the component — pantone-approximation-tool and
 *      ral-to-hex-reference (no Pantone or RAL data), bezold-effect-visualizer
 *      (simultaneous contrast), rgb-cube-visualizer, pqca and the anomaly simulators
 *      (full dichromacy matrices), color-temperature-analyzer (the kelvin figure runs
 *      opposite to photographic convention), minimum-contrast-auto-fixer (nothing is
 *      fixed), palette-locker (nothing can be locked) and the daily generators (no date
 *      is used);
 *   3. thin duplicate rather than a wrong one — random-palette-generator,
 *      single-color-to-full-palette, color-from-text-mood-tool and emotion-color-finder,
 *      whose palettes are a name hash rather than any mapping to the word chosen;
 *   4. missing data — the framework exporters that would need real per-framework
 *      palettes before their pages could say anything true.
 */
export const SEO_BATCH_30: Record<string, ToolSeo> = {
  "color-naming-challenge": {
    keywords: [
      "color naming challenge",
      "name that color quiz",
      "css color name quiz",
      "guess the color name",
      "color name test",
    ],
    intro:
      "The color naming challenge shows a swatch and four standard CSS color names, and keeps a running score and streak as you work out which one is right.",
    content:
      "A round has one swatch and four buttons. The swatch fills the left card under the heading Name this color, and below it sit four names drawn from the standard CSS named-colour list — one of them is the target, and the other three are other entries from the same list, chosen so that none of them shares the target's hex value. Two columns of buttons keep the choices short enough to read at a glance.\n\n- The pool is what makes the challenge instructive rather than trivial.\n- The names are the ones a stylesheet actually accepts — the long list of two hundred or so keyword colours that browsers resolve, from the obvious ones to the pairings nobody remembers.\n- Because the three distractors are real entries from the same list, a round is rarely as easy as it looks: two named colours can be a few degrees apart, and the difference between them is exactly what has to be recognised.\n\nThe scoring is the part worth watching. The result card shows two figures — a score out of rounds played, and a streak that counts consecutive correct answers and resets to zero the moment one goes wrong. That pairing makes the streak the more honest measure of skill: a score of eighty percent assembled across dozens of rounds means something different from eight consecutive correct answers.\n\nFeedback is immediate and specific. Before a guess the card says only that a standard name needs to be chosen; afterwards it either confirms the choice or states what the colour actually is, giving both the name and its hex code. That last detail is what turns a wrong answer into a lookup rather than a dead end — the hex can be taken away and used, and the name learned from it.\n\nThe CSS color name quiz format also happens to teach the one thing the list is genuinely useful for. Named colours are readable in source and memorable in review, which is why they survive in stylesheets even where a token system exists. Knowing that a particular shade is called the name it is called — rather than being a plausible-looking guess — is the difference between using them deliberately and avoiding them.\n\nWhat it does not offer is any help. There is no hint, no narrowing of the options after a wrong answer, no explanation of why a name belongs to a colour, no difficulty setting and no way to weight the rounds towards the names that keep being missed. The score and the streak last for the visit and are then forgotten.\n\n- Limits: four options per round, one round at a time, a session-only score, no history and no export.\n- As a color naming challenge it is a clean guess the color name loop against the standard list, and for anyone who wants a fast css color name quiz — a name that color quiz with a streak to keep honest — it is a swatch, four buttons and a button to move on — a color name test that costs nothing but the rounds you give it.",
    howTo: [
      { step: "Look at the swatch and read the four names offered." },
      { step: "Pick the one you believe is the standard CSS name for that colour." },
      { step: "Read the verdict in the result card, then press Next color — a wrong answer resets the streak." },
    ],
    whenToUse:
      "Use this to check how well the standard CSS colour names are known, or to settle which of two similar names belongs to a shade. Use the colour memory test when the target is recall of a shade rather than its vocabulary, or the named colour lookup when a list is what is needed. Once the standard names are familiar, the {{color-name-lookup|color name lookup}} answers what a value is called and the {{color-name-generator|name generator}} handles the reverse direction.",
    faqs: [
      {
        q: "Where do the four names come from?",
        a: "The standard CSS named-colour list. One option is the target and the other three are other entries from the same list, chosen so none of them shares the target's hex value.",
      },
      {
        q: "What is the difference between score and streak?",
        a: "Score is correct answers out of rounds played. Streak counts consecutive correct answers and resets to zero as soon as one is wrong.",
      },
      {
        q: "What happens when I answer wrongly?",
        a: "The card reports the colour's actual name and its hex value, so the round doubles as a correction. There is no hint before the answer.",
      },
      {
        q: "Is the score saved?",
        a: "No. Score, rounds and streak last only for the visit, and there is no history of which names have been missed.",
      },
      {
        q: "Does a wrong guess narrow the options?",
        a: "No. There is no hint, no narrowing of the four options after a wrong answer and no explanation of why a name was wrong; the round simply scores and moves on, and the score is session-only with no history and no export.",
      },
    ],
  },
};
