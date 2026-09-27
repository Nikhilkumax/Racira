import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 29.
 *
 * Four slider tools verified against `SliderTool` and `makeColorFilter`, and three
 * verified games (read line by line: the twelve-card match, the four-tile sequence
 * game and the five-option recall test, with their real counters and verdicts).
 *
 * These games were on the earlier skip list without having been verified. Reading the
 * implementations showed working state machines, honest scoring and no external data,
 * so they are documented here rather than left blank.
 */
export const SEO_BATCH_29: Record<string, ToolSeo> = {
  "saturation-booster": {
    keywords: [
      "saturation booster",
      "boost color saturation",
      "make a color more vivid",
      "increase saturation hex",
      "saturation boost slider",
    ],
    intro:
      "The saturation booster raises a colour's saturation by a percentage you choose, from 0 to 30 percent, and shows the result beside the original.",
    content:
      "The layout is two panels. On the left, a colour field opens on a mid blue, and under it a slider labelled Boost saturation runs from zero to thirty percent, opening at twenty. On the right, a card titled Result holds one large swatch showing the boosted colour, and it updates as either control moves.\n\n- What the slider does is an addition rather than a multiplier: the number is divided by a hundred and added to the colour's saturation in the perceptual space the rest of this domain works in, so twenty percent means a fifth of the full saturation range more than the colour already had.\n- That framing matters for a colour that is already vivid — a saturated yellow at ninety percent has little room left and will barely move, while a muted grey-blue at ten percent will change noticeably from the same setting.\n\nLightness and hue are left alone, which is the property that makes the tool useful rather than merely available. Boosting saturation by adjusting a colour by eye usually drags the hue along with it, and a palette that starts on one orange ends up with three slightly different ones. Here the hue angle is untouched, so a set of colours boosted by the same amount stays within the same families.\n\nThe range is deliberately narrow. Thirty percent at the top is a noticeable change and not a garish one, which suits the everyday need: recovering a colour that was desaturated for a background and is being reused as an accent, or pushing a pastel far enough to read as a brand colour. Beyond that the tool will not go, and a colour that needs to be neon has to be built rather than nudged.\n\nWhat it does not do is report anything. There is no before-and-after ratio, no chroma value, no warning when a boosted colour leaves the printable range and no export — the original and the result sit side by side and that is the whole output. It is also a one-way control: this page only boosts, and reducing saturation is a separate tool with its own slider.\n\nComparing the two swatches is how the setting gets decided. A boost that changes the colour noticeably without pushing it out of its family is usually what a surface or an accent wanted; a result that reads as a different colour means the setting was too high for that hue, since yellows and greens move further at the same percentage than blues and purples do. Because the tool holds one colour at a time, a palette is normally boosted swatch by swatch with the same setting, which keeps the relationships between them intact.\n\n- Limits: one colour, one direction, a maximum of thirty percent, no relative or multiplicative mode, no undo and no value readout beyond the swatch.\n- As a saturation booster it answers boost color saturation directly, and for anyone wanting to make a color more vivid this is the saturation boost slider that tells you what it did rather than guessing — enough to increase saturation hex values in a palette without shifting their hues.",
    howTo: [
      { step: "Pick the colour in the field on the left." },
      { step: "Move the Boost saturation slider; it runs from 0 to 30 percent and starts at 20." },
      { step: "Read the result swatch on the right and note the change before applying the same setting to other colours." },
    ],
    whenToUse:
      "Use this when a colour already in the palette needs more presence without its hue changing. Use the saturation reducer when the direction is the other way, the vibrance adjuster when the slider should cross zero, or the saturation explorer when the whole range needs looking at rather than one step. When the goal is a quieter version the {{saturation-reducer|saturation reducer}} subtracts along the same axis, and the {{vibrance-adjuster|vibrance adjuster}} moves either way from neutral.",
    faqs: [
      {
        q: "How much can the saturation rise?",
        a: "Up to thirty percent, in one-percent steps, with the slider starting at twenty. It is an addition to the colour's saturation rather than a multiplication of it.",
      },
      {
        q: "Does the hue change?",
        a: "No. Only saturation moves — lightness and hue are left alone, which keeps a colour recognisably in the same family after boosting.",
      },
      {
        q: "Why does a vivid colour barely change?",
        a: "Because the setting adds to existing saturation. A colour already near the top of the range has little room left, while a muted one shows the same setting much more strongly.",
      },
      {
        q: "Can I reduce saturation here?",
        a: "No. The slider only runs upward from zero, so reducing a colour means using the saturation reducer or the symmetric vibrance adjuster.",
      },
      {
        q: "How much does thirty percent change the colour?",
        a: "The percentage is divided by a hundred and added to the OKLCH chroma, so thirty percent is a noticeable change rather than a different colour. Lightness and hue stay where they were, and no chroma figure or before-and-after ratio is reported.",
      },
    ],
  },

  "saturation-reducer": {
    keywords: [
      "saturation reducer",
      "reduce color saturation",
      "desaturate a color",
      "make a color less vivid",
      "muted color hex",
    ],
    intro:
      "The saturation reducer lowers a colour's saturation by up to 30 percent, showing the muted result beside the original with its hue and lightness untouched.",
    content:
      "Two panels again: a colour field that opens on a mid blue with a slider beneath it labelled Reduce saturation, running from zero to thirty percent and starting at twenty, and a result card on the right holding a single large swatch of the muted colour.\n\n- The slider subtracts rather than multiplies.\n- The chosen percentage is divided by a hundred and taken away from the colour's saturation, so twenty percent removes a fifth of the available chroma.\n- A colour that arrives fully saturated therefore changes a great deal, while one that is already muted has less left to give and moves only slightly — the opposite of what a multiplier would do, and the reason the same setting produces visibly different amounts of change across a palette.\n\nHue and lightness stay exactly where they were, which is what separates a deliberate desaturation from dropping the colour towards grey. Both the hue angle and the lightness reading are preserved, so a muted version of a brand colour still belongs to the brand's family and can sit next to the original without either looking off.\n\nThat property is the everyday use. Most interfaces need a quieter version of a colour for surfaces, secondary text, disabled states and chart backgrounds, and building those by mixing in grey produces cooler, flatter results than reducing saturation in the colour's own space. Because the range stops at thirty percent, the result is muted without being washed out, and it stays a colour rather than becoming a neutral.\n\nThe tool reports nothing beyond the swatch pair. There is no chroma figure, no indication of how close the colour is to grey, no contrast check against whatever it will sit on and no export. It also only reduces: the same implementation with a positive sign is the saturation booster, and this page will not brighten a colour that has already gone too far.\n\nWorking one colour at a time is the intended rhythm. A palette usually gets muted in sequence with the same setting, so a set of surfaces or secondary text keeps its internal relationships rather than being quietened by varying amounts, and the narrow range makes that easy to repeat exactly. Where a single colour needs more than the slider can give, the tone generator moves it towards grey instead, which is the right tool when the goal is a neutral rather than simply a quieter colour.\n\nLimits: one colour, one direction, thirty percent maximum, no relative mode, no saved history and no readout.\n\n- As a saturation reducer it handles reduce color saturation and desaturate a color in a single slider, and for a muted color hex value that keeps its hue rather than drifting towards grey, it is the make a color less vivid version with the direction fixed and the range stated.\n- Quietening a colour in its own space is what keeps a muted surface recognisable as part of the same family rather than a grey substitute for it, and that is the whole difference this slider makes.",
    howTo: [
      { step: "Choose the colour to mute in the field on the left." },
      { step: "Drag the Reduce saturation slider between 0 and 30 percent to set how much comes off." },
      { step: "Compare the result swatch with the original and note the muted value." },
    ],
    whenToUse:
      "Use this when a palette needs quieter versions of its colours for surfaces, borders, disabled states or secondary text. Use the tone generator when the colour should also move towards grey, or the vibrance adjuster when the slider has to cross zero. The {{saturation-booster|saturation booster}} pushes the same axis upward, the {{vibrance-adjuster|vibrance adjuster}} moves in both directions, and the {{color-tones-generator|tone generator}} performs the operation ten times over as a ladder.",
    faqs: [
      {
        q: "How far can the saturation drop?",
        a: "Thirty percent at the most, in one-percent steps, added as a subtraction from the colour's existing saturation rather than applied as a multiplier.",
      },
      {
        q: "Does it change the hue or the lightness?",
        a: "Neither. Both are preserved exactly, so a muted version of a colour still reads as a member of the same family.",
      },
      {
        q: "Will a pale colour become grey?",
        a: "Not within the range offered. The colour loses chroma but keeps its hue and lightness, so it stays a colour rather than becoming a neutral.",
      },
      {
        q: "Can I boost a colour here?",
        a: "No — the slider subtracts only. Raising saturation is what the saturation booster does with the same implementation and the sign reversed.",
      },
      {
        q: "Can the colour go fully grey?",
        a: "No. The slider tops out at thirty percent and the percentage is subtracted from the chroma with a floor at zero, so the result is a quieter version of the same colour rather than a grey, while hue and lightness stay exactly where they were.",
      },
    ],
  },

  "vibrance-adjuster": {
    keywords: [
      "vibrance adjuster",
      "vibrance vs saturation",
      "adjust color vibrance",
      "symmetric saturation slider",
      "color intensity control",
    ],
    intro:
      "The vibrance adjuster moves a colour's saturation either way from a single slider that runs from minus 30 to plus 30 percent and opens at zero.",
    content:
      "The page holds a colour field, a slider labelled Saturation, and a large result swatch. The slider is the difference between this tool and the two directional ones beside it in the domain: it starts at zero, which leaves the colour unchanged, and it travels thirty percent in either direction, so the same control raises and lowers chroma.\n\n- That symmetric behaviour is what the name describes, and it is close to the sense vibrance carries in photo editing, where the adjustment is meant to be intelligent about what it touches.\n- Here it is not: the number is divided by a hundred and added to the colour's saturation, so a positive setting works by addition and a negative one by subtraction, with no protection for already-saturated colours and no weighting by how much chroma a colour has.\n- Knowing that makes the tool predictable and keeps the comparison with a photographic vibrance control honest.\n\nThe default of zero is deliberate. A slider that opens in the middle lets the colour field be used as the primary control while the slider stays neutral until it is needed, and it means the result swatch can be trusted to show exactly the colour entered until the slider moves.\n\nWhere it earns its place is in the middle of a decision rather than at the end of one. Auditioning whether a colour should carry more or less intensity is easier on one control that goes both ways than by switching between two tools, and the symmetric range makes the comparison fair — thirty percent up and thirty percent down are the same size of change by construction.\n\nWhat it does not give is any reading of the result. Saturation is not printed, the amount of change is not summarised, there is no lock on lightness or hue beyond the fact that the underlying operation leaves them alone, and nothing checks whether the adjusted colour still works as text or as a surface. It is also limited to one colour with no palette view.\n\nThat neutral starting point is what makes the page useful at the start of a decision rather than at the end. Leaving the slider at zero shows the entered colour untouched, and moving it a few points either way is often enough to settle whether a candidate is too loud or too quiet for the job it will do. Read as a color intensity control rather than as an image editor, the vibrance adjuster is honest about being one number — saturation, added or subtracted, with the colour itself as the reference point between the two directions.\n\n- Limits: a single colour, a thirty percent ceiling in each direction, no relative or adaptive mode despite the name, no saved state and no export.\n- Read as an adjust color vibrance control rather than a photographic one, it is a clean symmetric saturation slider: one colour intensity control where the starting point is the colour itself, and the vibrance vs saturation question is answered plainly — this is saturation, by addition and subtraction.",
    howTo: [
      { step: "Pick the colour in the field." },
      { step: "Move the Saturation slider negative to quieten the colour, or positive to strengthen it." },
      { step: "Return the slider to zero to get the entered colour back unchanged." },
    ],
    whenToUse:
      "Use this when auditioning a colour at several intensities and both directions are needed from one control. Use the saturation booster or reducer when only one direction is wanted, or the saturation explorer when the whole range should be seen at once. For a single direction the {{saturation-booster|saturation booster}} and {{saturation-reducer|saturation reducer}} are the one-way controls, and the {{color-tones-generator|tone generator}} lays the same axis out as a ten-step strip.",
    faqs: [
      {
        q: "What range does the slider cover?",
        a: "Minus thirty to plus thirty percent, starting at zero. Steps are single percent, so both directions cover the same amount of change.",
      },
      {
        q: "Is this the same as vibrance in photo software?",
        a: "No. Photographic vibrance protects already-saturated colours; this tool simply adds or subtracts saturation, so a vivid colour at a high setting will lose its balance.",
      },
      {
        q: "What happens at zero?",
        a: "Nothing — the result swatch shows the colour exactly as entered. That is what the default position is for, so the slider stays neutral until it is moved.",
      },
      {
        q: "Does it preserve hue and lightness?",
        a: "Yes. Only saturation changes, in either direction, so the colour stays in the same family whatever the setting.",
      },
      {
        q: "Why does the slider start in the middle?",
        a: "Zero is neutral, which keeps the colour field's own setting intact until a direction is chosen. The range runs thirty percent each way, subtracting from or adding to chroma in OKLCH, and the result is shown as a swatch without any printed reading.",
      },
    ],
  },

  "exposure-adjuster": {
    keywords: [
      "exposure adjuster",
      "brighten a color",
      "darken a color hex",
      "exposure slider",
      "color lightness control",
    ],
    intro:
      "The exposure adjuster brightens or darkens a colour from a slider that runs from 0 to 200 percent and sits at 100, showing the result in a large swatch.",
    content:
      "The controls are a colour field, a slider labelled brightness with a range from zero to two hundred and a starting value of one hundred, and a result card holding one large swatch. One hundred is the neutral point: below it the colour is darkened, above it the colour is lightened, and the swatch follows the slider continuously.\n\n- The arithmetic is a scaled lightness change rather than a photographic exposure.\n- Leaving the neutral point by twenty points applies a lighten or a darken of (20/200) — a tenth of the operation's full strength — so the two halves of the slider produce symmetric amounts of change around the neutral.\n- That means the fifty-point mark is a quarter of the way to black and the hundred-and-fifty mark a quarter of the way to white, which makes the slider easy to reason about even though no formula is shown anywhere on the page.\n\nWhat it does not model is light.\n\n- An exposure control in photography multiplies the light reaching a sensor, which clips highlights and preserves the character of the shadows; this tool moves a colour's lightness directly, so a colour pushed far up the range simply becomes paler and eventually reaches white.\n- Treating the slider as a lightness control rather than as a camera setting gives the results you would expect from the code.\n\nHue and saturation are preserved through both directions, which is what makes the tool useful in a palette rather than only on a single swatch. Producing the hover, pressed or disabled variant of a colour is the everyday case: a hundred and ten is a subtle lift, a hundred and thirty is a noticeably lighter version for a hover state, and ninety gives the pressed version while keeping the hue recognisable.\n\nThe page offers no measurement and no export. There is no lightness readout, no contrast check between the adjusted colour and anything it might sit on, no comparison against the original colour beyond seeing the swatch, and no palette view for adjusting a set together. It is also only a preview: the value has to be taken away by reading the swatch.\n\nThe two halves of the slider are useful in different places. Lighter variants — one hundred and ten through one hundred and thirty — cover hover states, disabled surfaces and chart backgrounds; the darker half covers pressed states, borders drawn on light surfaces and text set on pale fills. Because one control reaches both, a complete state set can be built from a single colour without switching tools, and the neutral point gives a reliable way back to the original value when an experiment has gone too far.\n\nLimits: one colour, a 0 to 200 range around a neutral of 100, a lightness operation rather than a true exposure, and no readout, history or export. As an exposure adjuster it does the two jobs the name implies — brighten a color above the neutral point or darken a color hex value below it — and as a color lightness control with an exposure slider it is the simplest way to move a colour without touching its hue.",
    howTo: [
      { step: "Pick the colour in the field." },
      { step: "Set the slider below 100 to darken, above 100 to lighten; it runs 0 to 200." },
      { step: "Read the adjusted colour from the result swatch, which updates as the slider moves." },
    ],
    whenToUse:
      "Use this when a colour needs a lighter or darker variant for a state, and the hue must stay put. Use the lighten or darken tools when the amount should be stated as a fraction, or the tint and shade generators when a whole ladder is wanted instead of one step. The {{color-lighten-tool|lighten tool}} and {{color-darken-tool|darken tool}} make the same lightness change from a percentage set directly, and the {{css-filter-generator|CSS filter generator}} writes a brightness value into a filter declaration.",
    faqs: [
      {
        q: "What does 100 percent mean?",
        a: "The neutral point — the colour is unchanged. Values below it darken the colour and values above it lighten it, with the same amount of change either side.",
      },
      {
        q: "Is this a real exposure adjustment?",
        a: "No. It moves the colour's lightness rather than simulating how light reaches a sensor, so highlights never clip and a colour pushed far enough simply becomes pale.",
      },
      {
        q: "Are hue and saturation kept?",
        a: "Yes, through both directions. That is what makes the tool usable for hover and pressed states, where the variant has to stay recognisably the same colour.",
      },
      {
        q: "Does it report the resulting value?",
        a: "Not as text — the result is a swatch the colour can be read from. There is no lightness figure, no contrast check and no export.",
      },
      {
        q: "Is this the same as photographic exposure?",
        a: "No. The slider runs from zero to two hundred with a neutral of one hundred, and the operation is a scaled lightness change — lightness is shifted by up to half in OKLCH — rather than a multiplication of the light reaching a sensor, so nothing clips the way a real exposure change would.",
      },
    ],
  },

  "color-matching-game": {
    keywords: [
      "color matching game",
      "match color pairs game",
      "memory card color game",
      "color matching practice",
      "find matching colors",
    ],
    intro:
      "The color matching game deals twelve face-down cards built from six colours and asks you to clear the grid by turning over matching pairs.",
    content:
      "Each round deals twelve cards from six colours: the six are generated at a fixed lightness and chroma with random hues, each is duplicated into a pair, and the twelve are shuffled across the grid. Face-down cards are empty bordered squares and a face-up card shows its colour, so the grid gives nothing away until a card is turned.\n\nThe rules are the ones the shape implies. Two cards can be open at a time; turning the second one counts as a flip, and if the two colours match, the pair stays face up after a brief pause. If they do not match, both turn back down again about seven-tenths of a second later, which is long enough to register the colours and short enough to keep the round moving.\n\nThe progress panel keeps two figures. Pairs found counts cleared pairs out of six, and Flips counts the attempts — the number that actually measures how well the round went, since a pair found in the first few flips says more than the fact of clearing the grid eventually. Both reset when a new deal is made.\n\nWhere the game is more than a distraction is in the hue set it deals. Six colours at the same lightness and the same chroma differ only by hue angle, and with random hues drawn from the full circle it is entirely possible to get two greens and no yellow — so the practical skill is holding a shade in memory long enough to match it against one that looks similar but is not identical. That is the same judgement an interface asks for when two near-identical accent colours have to be told apart.\n\nThe button below the figures reshuffles at any time and reads Play again once all six pairs are cleared, so a finished round can be restarted without hunting for a control. There is no timer, no score attached beyond the flip count, no difficulty setting and nothing stored between visits.\n\nPlaying a few rounds is also a reasonable check on a palette that has gone stale. Colours that can be told apart comfortably in a design file are sometimes revealed here as near-identities — two greens a few degrees apart will cost extra flips, and a set that produces them is a set that will produce unreadable charts later. Read that way the color matching game is more than a break in the work: it is a quick, if indirect, test of whether a palette's colours are actually distinguishable, and a match color pairs game is a pleasant way to discover that they are not.\n\n- Limits: six pairs, twelve cards, random hues each deal, a flip counter and nothing else — no timer, no best score, no hint, no difficulty.\n- As a color matching practice game it is a memory card color game with an honest count, and for anyone who wants to find matching colors under time pressure there is deliberately no clock here at all.",
    howTo: [
      { step: "Turn over one card to reveal its colour." },
      { step: "Turn a second card; a matching pair stays face up, a mismatch turns both back down." },
      { step: "Clear all six pairs, then press Reshuffle or Play again for a new deal." },
    ],
    whenToUse:
      "Use this as a light way to practise distinguishing near-identical hues, or as a break between palette work. Use the colour memory test when the question is recall of a single shade, or the naming challenge when the vocabulary is what needs testing. For the neighbouring steps, see the {{daily-color-generator|daily color generator}} and the {{color-of-the-year-browser|color of the year browser}}.",
    faqs: [
      {
        q: "How many cards and colours are there?",
        a: "Twelve cards built from six colours, each duplicated into a pair and shuffled. Pairs found counts up to six.",
      },
      {
        q: "What are the six colours?",
        a: "They are generated fresh each deal at a fixed lightness and chroma with random hues, so two deals rarely produce the same set and similar hues can appear together.",
      },
      {
        q: "Is the move count a score?",
        a: "It is the flip count — every pair of turns increments it. A low figure is the good result, and there is no other scoring.",
      },
      {
        q: "Is there a timer or a saved best?",
        a: "Neither. The round starts with a reshuffle button, keeps only the two figures during play, and forgets everything when the page is reloaded.",
      },
      {
        q: "What does the color matching game not do?",
        a: "As a color matching practice game it is a memory card color game with an honest count, and for anyone who wants to find matching colors under time pressure there is deliberately no clock here at all.",
      },
    ],
  },

  "color-memory-game": {
    keywords: [
      "color memory game",
      "repeat the color sequence",
      "simon style color game",
      "color sequence memory test",
      "watch and repeat colors",
    ],
    intro:
      "The color memory game flashes a growing sequence of colour tiles and asks you to repeat it in order, extending the run by one tile each time you get it right.",
    content:
      "Four tiles drive the page: a red, a blue, a green and an amber, arranged in a two-by-two grid that is dimmed to half opacity when it is not the game's turn to speak. A sequence of tile positions is flashed one at a time about seven-tenths of a second apart, the flashing tile brightening and lifting slightly, and when the sequence ends the tiles become clickable.\n\nFrom there the loop is the familiar one. Repeating the whole sequence correctly extends it by a single random tile and the tool plays it back again. Repeating it incorrectly ends the run, with the panel saying so and the sequence restarting from one tile on the next attempt. Partial progress counts for nothing, which is what gives the game its shape.\n\nThe progress card reports two numbers and a line of status. Sequence length is the current run, and best this session is the longest sequence completed — held for the visit rather than saved, so a reload clears it. The status line changes with the phase: an invitation before the first press, a warning to watch while the tiles flash, a countdown of remaining tiles during your turn, and a plain statement that the sequence restarted when a run ends.\n\nPlaying it well is mostly about not rushing. The tiles differ by hue rather than by brightness, and the two tiles that are easiest to confuse sit diagonally opposite each other, so the sequence has to be held as a set of positions rather than as a pattern of colours. Runs of five or six are common; longer ones need the sequence chunked into groups.\n\nStart and restart share one button, so the page is a single control plus the grid — no difficulty setting, no speed change, no colour-blind alternative for the tile palette and no scoring beyond the best length. The four tile colours are fixed.\n\nWhy the four tiles work for this is worth noting. They differ in hue but not in lightness or chroma, so the sequence cannot be held in memory as a pattern of light and dark, and the two most confusable tiles sit diagonally rather than next to each other. That makes the round a test of ordered recall with almost no other cue attached to it, and it is the reason the color memory game is harder than its simple four-tile grid looks — long runs are reachable only by chunking the sequence into groups of three or four.\n\nLimits: four fixed tiles, one speed, no saved scores, no reverse mode and no way to change the sequence length other than reaching it.\n\n- Used as a color sequence memory test it is a watch and repeat colors game with a clear counter, and the repeat the color sequence part is exactly what the name of a simon style color game promises.\n- Nothing is timed, nothing is stored and no difficulty can be dialled up, so a run ends when attention does rather than when a clock does.",
    howTo: [
      { step: "Press Start; the first tile flashes." },
      { step: "Watch the whole sequence, then click the tiles in the same order." },
      { step: "Keep going — each correct repeat adds a tile; a wrong tile ends the run and shows the best length so far." },
    ],
    whenToUse:
      "Use this when you want a short test of sequential colour recall — it exercises holding an ordered list in memory rather than judging a shade. Use the colour memory test when the round should be about matching one shade, or the matching game when pairs are the mechanism. For the neighbouring steps, see the {{daily-color-generator|daily color generator}} and the {{color-of-the-year-browser|color of the year browser}}.",
    faqs: [
      {
        q: "How many tiles are there?",
        a: "Four, fixed as a red, a blue, a green and an amber, laid out in a two-by-two grid. The tiles dim between turns and brighten as they flash.",
      },
      {
        q: "Does a mistake end the whole game?",
        a: "It ends the run. The panel says the sequence restarts from one tile, and the best length recorded so far stays on screen.",
      },
      {
        q: "How fast does the sequence play?",
        a: "One tile roughly every seven-tenths of a second with a short pause before it starts. The speed is fixed and there is no difficulty setting.",
      },
      {
        q: "Is the best score saved?",
        a: "No — it is kept for the session only and labelled that way, so reloading the page resets it to zero.",
      },
      {
        q: "What does the color memory game not do?",
        a: "Used as a color sequence memory test it is a watch and repeat colors game with a clear counter, and the repeat the color sequence part is exactly what the name of a simon style color game promises. Nothing is timed, nothing is stored and no difficulty can be dialled up, so a run ends when attention does rather than whe",
      },
    ],
  },

  "color-memory-test": {
    keywords: [
      "color memory test",
      "test color recall",
      "remember the shade",
      "hue discrimination test",
      "color recall score",
    ],
    intro:
      "The color memory test shows a single shade for three seconds, hides it, and asks you to pick it out of five near-identical swatches.",
    content:
      "A round has two phases. First a large swatch appears under the heading Memorise this color, and the panel notes that it hides after three seconds — a timer runs behind the scenes and the phase changes on its own, so there is no button to press and no way to sit with the colour longer. Then the swatch is replaced by five candidates under the heading Which one was it?, shuffled.\n\n- The five candidates are the exact colour plus four hue-shifted neighbours at plus and minus fifteen and thirty degrees, all generated at the same lightness and chroma.\n- The original is therefore always present, and the four decoys are close enough in hue that the choice is made on memory of the shade rather than on recognising a different colour family.\n\nPicking one gives an immediate verdict in the result card: either a confirmation that the exact swatch was found, or a statement of what the target actually was, printed as its hex code. The score card then shows two figures — a fraction of correct answers out of rounds played, and an accuracy percentage computed from the same two numbers, rounded.\n\nThe three-second exposure is what makes the test about recall rather than about comparison. With the target on screen it would be trivial; holding a shade in mind for even a few seconds and then choosing between neighbours a few degrees apart is genuinely difficult, and the accuracy figure over several rounds is where a pattern shows up. A score near one in five is what guessing would produce, so the useful reading is anything well above that.\n\nThe controls are deliberately thin. One button moves to the next round and doubles as a skip, the previous verdict stays on screen until it is pressed, and the score accumulates for the visit without being stored. There is no difficulty setting, no timer pressure on the guess itself, no distribution of your answers and no record of which hues you get wrong — a chart of that would be more instructive than the accuracy alone.\n\nThe test is more revealing over several rounds than in any single one. Because the hue offsets are fixed at fifteen and thirty degrees in both directions, a run of rounds samples the whole wheel, and an accuracy well above the one-in-five that guessing would produce is a real signal of shade memory rather than luck. Repeating a handful of rounds is also the clearest demonstration of a point colour theory keeps making: a few degrees of hue are almost invisible when two swatches are apart, and entirely obvious when they are adjacent.\n\n- Limits: five options per round, one exposure time, a session-only score, no history and no export.\n- As a color memory test it is a clean test color recall loop, and for anyone wondering whether they can remember the shade they just saw, the hue discrimination test that follows — plus its color recall score — answers it in a handful of rounds.",
    howTo: [
      { step: "Look at the colour while it is shown; it hides after three seconds." },
      { step: "Pick the swatch you believe is the exact shade from the five offered." },
      { step: "Press Next round to continue — the score and accuracy build up as rounds accumulate." },
    ],
    whenToUse:
      "Use this when you want to test shade recall rather than colour knowledge, or to see how much of a difference a few degrees of hue actually makes. Use the naming challenge when the vocabulary is the subject, or the sequence game when order rather than shade is being tested. The {{simultaneous-contrast-visualizer|simultaneous contrast visualizer}} shows why a remembered shade shifts, and the {{color-naming-challenge|naming challenge}} is the other game in this corner of the catalogue.",
    faqs: [
      {
        q: "How long is the colour shown?",
        a: "Three seconds. The phase changes automatically, so there is no control to extend the exposure and the shade is visible only once per round.",
      },
      {
        q: "What are the other four swatches?",
        a: "Hue-shifted versions of the target at plus and minus fifteen and thirty degrees, at the same lightness and chroma, so they differ mainly in hue.",
      },
      {
        q: "How is the accuracy worked out?",
        a: "Correct answers divided by rounds played, rounded to a percentage. A score near one in five is what random guessing would produce.",
      },
      {
        q: "Is the score kept between visits?",
        a: "No. Score, rounds and accuracy last for the session only, and there is no record of which hues were missed.",
      },
      {
        q: "What are the four wrong options?",
        a: "Hue-shifted neighbours a few degrees either side of the exact colour, so a guess made from memory has to beat near-misses rather than obvious decoys. One exposure time applies to every round, and the score resets with the session.",
      },
    ],
  },
};
