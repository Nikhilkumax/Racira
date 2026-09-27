import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 23.
 *
 * Skipped from this window: none. These seven are the remaining unique, non-flagged
 * slugs with no authored sibling in this part of the alphabet.
 */
export const SEO_BATCH_23: Record<string, ToolSeo> = {
  "color-tints-generator": {
    keywords: [
      "color tints generator",
      "tints of a color",
      "lighter shades of a color",
      "generate tints",
      "tint palette hex",
    ],
    intro:
      "The color tints generator produces ten progressively lighter versions of any color, each as a copyable hex value, by stepping lightness towards white while holding the hue and saturation.",
    content:
      "The color tints generator takes one colour and returns a strip of ten swatches. Pick a colour and the tool will generate tints of a color as a strip of ten swatches, each carrying its hex value and a copy button. There is nothing else to configure, and the count is fixed at ten.\n\n- A tint, in the sense this tool uses the word, is a colour moved towards white: hue and saturation are preserved and only lightness changes.\n- That is what separates a tint from a shade, which moves towards black, and from a tone, which moves towards grey.\n- Both of the other operations have their own generators in this domain, and using the wrong one is a common source of muddy palettes — a shade of a mid blue is recognisably the same colour, whereas moving it towards grey loses its identity entirely.\n\nThe spacing is even in perceptual terms, which matters more here than it might sound. The ten tints are placed at fixed fractions of the distance between the base colour's lightness and full white — one eleventh, two elevenths, and so on to ten elevenths — so the first step is a subtle lift and the last is very nearly white, with each swatch the same amount lighter than the one before it. Because the arithmetic works in a perceptual colour space rather than in the red, green and blue channels, the steps look evenly spaced rather than bunching up at the light end, which is what usually happens when lightness is nudged naively.\n\nOne property of the ladder is worth knowing before you use it. The base colour is not included in the strip: all ten swatches are lighter than the colour you picked, and the lightest is a near-white with only a trace of the original hue. That means the strip tells you where to go next rather than confirming where you are, and if the base itself belongs in the palette it has to be added separately.\n\nA second property follows from the spacing being relative. The tints are fractions of the distance from your colour's lightness to white, so the same ten-step ladder describes a much larger perceived change for a dark base than for a light one. A near-black produces ten steps that span most of the tonal range; a pale base produces ten steps that are all fairly close together. Neither is wrong, but it is worth choosing a base colour deliberately rather than assuming the ladder behaves the same way from any starting point.\n\nIn use, the strip is what a design system needs for hover states, backgrounds at descending emphasis, disabled states and surface layers. Working down the strip from the lightest tint gives a natural set of inset surfaces, and taking two or three adjacent tints gives a family that stays clearly related. Because each swatch copies independently, assembling a token file from the results is a paste rather than a series of conversions.\n\n- Limits: ten tints and no more, always lighter, never darker, no inclusion of the base, no contrast checking, and no export beyond the individual swatch values.\n- Used as a color tints generator, though, it covers the operation that palettes most often need, and for anyone who wants ten lighter shades of a color with the values attached it is one colour pick and a copy — a tint palette hex list without any arithmetic by hand.",
    howTo: [
      { step: "Pick the base colour with the field at the top." },
      { step: "Read the strip of ten swatches, which run from a subtle lift to almost white." },
      { step: "Copy individual values from the swatches for surface layers, hovers and disabled states." },
    ],
    whenToUse:
      "Use this when a palette needs lighter variants of one colour — surface layers, hover states, backgrounds at lower emphasis. Use the shade generator for darker variants, or the tone generator when the colour should also lose saturation. The {{color-shades-generator|shade generator}} and {{color-tones-generator|tone generator}} are the sibling ladders for darker and duller versions, and the {{color-lighten-tool|lighten tool}} handles a single one-off step.",
    faqs: [
      {
        q: "What is the difference between a tint and a shade?",
        a: "A tint moves a colour towards white and a shade moves it towards black. Both preserve the hue, so a tint is the lighter of the two directions.",
      },
      {
        q: "Is the base colour included in the strip?",
        a: "No. All ten swatches are lighter than the colour you chose, with the last one close to white. Add the base separately if the palette needs it.",
      },
      {
        q: "Why does a dark base give a wider range?",
        a: "Because the steps are fractions of the distance from the base lightness to white. A dark colour has further to travel, so the same ten steps span a larger perceived change.",
      },
      {
        q: "Do the tints keep the original hue and saturation?",
        a: "Yes. Only lightness changes, and it changes in a perceptual colour space, so the steps look evenly spaced rather than bunching up at the light end.",
      },
      {
        q: "Is the original colour part of the tint strip?",
        a: "No. The base is not one of the ten tints and nothing darker appears either: each entry is a fraction of the way from the base towards white, so the strip always reads as lighter versions of one hue.",
      },
    ],
  },

  "shadow-color-generator": {
    keywords: [
      "shadow color generator",
      "colored box shadow",
      "shadow color from a base color",
      "css shadow color",
      "tinted drop shadow",
    ],
    intro:
      "The shadow color generator derives a shadow tone from a base color by lowering its lightness while keeping the hue and saturation, then writes the CSS box-shadow declaration.",
    content:
      "The shadow color generator derives a shadow color from a base color and writes it out as a ready-to-paste declaration. Choose a base colour and the tool computes a darker version with the same hue and saturation, then writes out a box shadow using that colour at partial opacity. A preview shows a card floating on a background with the shadow applied, so the effect is visible rather than merely described, and the code panel carries the declaration with a copy button.\n\nThe tone is derived rather than chosen, and that is the point of the tool. A shadow in the same hue as the surface reads as light falling on a coloured object, whereas pure black at low opacity reads as a grey smudge — the difference is subtle at low opacity and obvious when the shadow is strong or large. Deriving the tone also means the shadow stays consistent as the base colour changes, which matters in a design system where several surfaces each need their own shadow and the relationship between them should not have to be re-decided each time.\n\nThe derivation lowers lightness by a fixed amount with a floor, so the result is a markedly darker version of the base without collapsing to black. Hue and saturation are untouched, which is what keeps a warm surface producing a warm shadow. Opacity is written into the declaration as an alpha channel on the hex value, at a fixed level — enough for the shadow to be visible on a light page without becoming a hard edge.\n\n- The rest of the declaration is conventional and fixed: a vertical offset, a substantial blur and a negative spread.\n- That combination is the standard recipe for a soft, natural-looking elevation.\n- The negative spread is the detail most hand-written shadows miss — it pulls the shadow inwards so it does not bleed out sideways from under the element, which is what makes a card look lifted rather than sitting in a pool of grey.\n\nWhere this is useful is anywhere elevation is part of the design language: cards, dropdowns, modals, floating action buttons. Deriving each shadow from its own surface colour gives a set of elevations that share a structure while each staying in the right hue family, which is much harder to achieve by mixing a single grey shadow across surfaces of different colours. It also answers a specific question quickly: if the brief says the shadow should be tinted rather than neutral, this is where the tone comes from.\n\n- Offsets, blur and spread are fixed, so only the colour is derived; the geometry has to be edited in the copied declaration.\n- The floor on lightness means a very dark base produces a shadow barely darker than the surface, and dark surfaces usually want a shadow made from a lighter tone instead — the reverse of what this tool produces.\n- There is no inset variant, no multi-layer shadow and no dark-mode counterpart; within those bounds it hands over a tinted drop shadow as an editable css shadow color declaration, with a colored box shadow already matched to the surface.",
    howTo: [
      { step: "Pick the base colour — normally the surface the element will sit on." },
      { step: "Check the preview to see how strong the derived tone looks in place." },
      { step: "Copy the box-shadow declaration and adjust the offsets or blur by hand if the elevation needs to differ." },
    ],
    whenToUse:
      "Use this when a design wants tinted rather than neutral shadows, or when several surfaces each need an elevation that belongs to them. Use the neumorphism generator when the element should appear moulded out of its background rather than lifted above it. When the shadow's geometry needs to be yours rather than fixed, the {{box-shadow-color-tool|box shadow color tool}} exposes offsets, blur and spread alongside the colour, and when the shadow belongs to type rather than to a surface, the {{text-shadow-color-tool|text shadow color tool}} is the same idea one property over.",
    faqs: [
      {
        q: "How is the shadow colour chosen?",
        a: "It is derived from your base colour: lightness is lowered by a fixed amount with a floor, while hue and saturation stay exactly as they were. Nothing is picked by eye.",
      },
      {
        q: "Why is the opacity written into the hex value?",
        a: "The declaration uses an eight-digit hex where the last two digits carry alpha. The level is fixed, which keeps the shadow visible on a light page without turning into a hard edge.",
      },
      {
        q: "Why the negative spread?",
        a: "It pulls the shadow inwards so it does not bleed out sideways from under the element. That is what makes a card read as lifted rather than sitting in a pool of grey.",
      },
      {
        q: "What about dark surfaces?",
        a: "The floor on lightness means a very dark base produces a shadow barely darker than itself, so the effect weakens. Dark themes usually want a shadow built from a lighter tone instead.",
      },
      {
        q: "Can the derived tone be used for anything other than the shadow?",
        a: "Yes — the hex is shown as a swatch of its own, so it can go into a border, a gradient or a second shadow. The box-shadow line is just the default way the tone is handed over.",
      },
    ],
  },

  "simultaneous-contrast-visualizer": {
    keywords: [
      "simultaneous contrast",
      "simultaneous contrast visualizer",
      "why colors look different on different backgrounds",
      "color perception illusion",
      "contrast illusion colors",
    ],
    intro:
      "The simultaneous contrast visualizer shows one color as a circle on both black and white backgrounds, side by side, so the way the surroundings change its appearance can be seen directly.",
    content:
      "- The simultaneous contrast visualizer places a single colour as a circle inside two panels, one filled with black and one with white, next to each other.\n- Choose the colour with the field and both circles update.\n- Nothing is measured and nothing is labelled, because the demonstration is the output: the two circles are rendered from an identical hex value and they will not look identical.\n\nWhat you are seeing is simultaneous contrast, one of the oldest known effects in colour perception. It is the classic color perception illusion, and it explains why contrast illusion colors cannot be judged from a value: the eye does not judge a colour in isolation, it judges it relative to its surroundings, and a small area inside a large area is pulled perceptually away from that surround. On black, the colour appears lighter and more luminous; on white, the same value appears darker and slightly denser. The illusion persists even when you know the two values are the same, which is precisely why it is worth having a page that shows it — knowing about the effect does not switch it off.\n\nWhy colors look different on different backgrounds is not a curiosity either — the practical consequences are everywhere in interface work, and they are the reason this belongs alongside the accessibility tools rather than among the toys. A brand colour chosen from a swatch on a white page will look noticeably lighter when it is applied as text or an icon on a dark header, so a palette signed off in one context can feel different in another. Two surfaces that read as clearly distinct in a mockup can appear nearly identical once they occupy different proportions of a screen. And a mid-tone placed beside a very dark tone will appear brighter than the same mid-tone placed beside a very light one, which is how hierarchy emerges from nothing more than adjacency.\n\nThe choice of the two surrounds is deliberate and worth noting. Black and white are the extremes, so they produce the largest perceptual shift a screen can show; that makes this the clearest version of the effect, and it also means it is not the version you will meet most often. In a real interface, the surrounds are mid-tones and the shift is smaller, though still real. There is no third background option here, so a mid-grey comparison has to be set up elsewhere.\n\nWhat the tool does not provide is any measurement of the effect.\n\n- There is no way to sample the two circles, no calculation of how much lift is applied, and no indication of how large the shift is in any formal colour model — the point is that the shift is perceptual rather than numerical, since the underlying values are identical by construction.\n- It is also purely a demonstration of surrounds, not of the related effects that come from size, motion or contrast with adjacent edges.\n\nUsed as a quick check on a palette, it earns its place in a review. When a colour has been approved on one background and has to work on another, putting it through here shows whether it will still read the same way — and for any interface that mixes light and dark surfaces, that is a question worth answering with the eye rather than with the hex value. As a simultaneous contrast visualizer it does one thing, but it does it in the way the effect is best understood: two identical circles, two surrounds, and the difference your own eye supplies.",
    howTo: [
      { step: "Pick the colour you want to test with the field." },
      { step: "Compare the circle on the black panel with the circle on the white panel." },
      { step: "Judge how the appearance shifts, and whether the colour still works on both kinds of surface." },
    ],
    whenToUse:
      "Use this when a colour has to work on both light and dark surfaces, or when teaching why a palette looks different in context. Use the contrast checker when the question is legibility rather than appearance. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "Are the two circles actually the same colour?",
        a: "Yes — both are rendered from the single value you chose. The difference in appearance comes entirely from the surrounding panels.",
      },
      {
        q: "Why black and white specifically?",
        a: "Because they are the extremes, so they produce the largest perceptual shift a display can demonstrate. Real interfaces usually surround a colour with mid-tones, where the effect is smaller but still present.",
      },
      {
        q: "Can I use a grey background instead?",
        a: "Not on this page — the two panels are fixed at black and white. A mid-tone comparison would need to be set up in a design tool.",
      },
      {
        q: "Does it measure the effect?",
        a: "No. The shift is perceptual rather than numerical, and the underlying values are identical by construction, so there is nothing to measure — the comparison is the output.",
      },
      {
        q: "What does the simultaneous contrast visualizer not do?",
        a: "There is no way to sample the two circles, no calculation of how much lift is applied, and no indication of how large the shift is in any formal colour model — the point is that the shift is perceptual rather than numerical, since the underlying values are identical by construction. It is also purely a demonstration of",
      },
    ],
  },

  "split-complementary-palette-generator": {
    keywords: [
      "split complementary palette generator",
      "base plus two neighbors of its complement",
      "split complementary color scheme",
      "150 and 210 degree harmony",
    ],
    intro:
      "The split-complementary palette generator returns three colors: the base plus the two hues 150° and 210° away, the neighbours of the base's complement. It is the softer cousin of the complementary pair.",
    content:
      "A split complementary palette generator takes the base and derives the two hues that sit either side of its opposite, at 150 and 210 degrees. In other words it is the base plus two neighbors of its complement, which gives a split complementary color scheme its characteristic tension: the same pull as a complementary pair, resolved into two supporting hues instead of one. The tool returns exactly three swatches, base first and the two derived hues after it, all at the base's own lightness and chroma. The count follows from the rule, and the 150 and 210 degree harmony is what sets it apart from its blunter relative.\n\nThe rotation happens in OKLCH, and hue is the only coordinate that moves. Lightness and chroma are read from the base, so every swatch shares one weight and the set differs only by hue. That shared weight is what keeps the two derived hues reading as support rather than as competition. Because OKLCH is perceptually even, the shoulders of the complement land where the eye expects them, so the scheme reads as a deliberate softening of the opposite rather than as three near-arbitrary hues.\n\n- The angles are fixed at 150 and 210 degrees. There is no control for widening or narrowing the split.\n- The count is fixed at three. There is no count control and no fourth hue.\n- No contrast check. The three hues sit at one lightness and usually need adjusting before they carry text.\n- No ordering or sorting: the strip keeps derivation order, base then plus 150 then plus 210.\n- No lightness or chroma controls, so the base is the only input and tonal work happens afterwards in the tints and shades tools.\n\nReach for the split when the pure complement feels too loud but a single hue feels too plain. It suits a base plus two accents that must feel related to the opposite side of the wheel without shouting, such as a primary colour with two companion accents or a headline hue with two quieter supports. Assign the base the largest area and let the derived hues share the accent work, because three equal-weight hues compete for the same space. Where all three must carry text, split one of them into a lightness ramp first.\n\nThe practical difference from a complementary pair is one of temperature and of volume. A complementary set is a duel between two colours; a split-complementary set is a base with a warm and a cool supporter, which is easier to place into a layout because the accent responsibility is divided. Keep a record of the base, since the whole trio is reproducible from that single value and the rule.\n\nThe two supporters are usually one warm and one cool, because they sit on opposite sides of the complement. That gives a split complementary color scheme a built-in temperature range that a single accent cannot provide, which is why the rule works well for editorial layouts where a headline colour needs both a highlight and a quieter counterpoint. As with every rule here the trio is deterministic, so a settled set can be regenerated for a token file rather than copied by hand.",
    howTo: [
      { step: "Set the base color with the picker or by typing a hex value." },
      { step: "Read the three swatches: base, +150°, +210°." },
      { step: "Copy the hex value of any swatch." },
    ],
    whenToUse:
      "Use the split-complementary generator when a base needs two softer supporters rather than one decisive opposite. The {{complementary-palette-generator|complementary generator}} is the pure pair and is blunter, the {{triadic-palette-generator|triadic generator}} is a fully balanced three, and the {{analogous-palette-generator|analogous generator}} keeps everything on one side of the wheel. Check any text pair with the {{contrast-checker|contrast checker}}, and use the {{palette-sorter|palette sorters}} if the three hues need an order.",
    faqs: [
      {
        q: "How is this different from a complementary pair?",
        a: "It replaces the single opposite with the two hues either side of it, so the contrast is spread across two supporters instead of one. The complementary generator returns the blunter two-color version.",
      },
      {
        q: "Why 150 and 210 degrees?",
        a: "They are the two neighbours of the 180 degree complement, 30 degrees to either side. That is what makes the split complementary color scheme read as related to the opposite while staying softer.",
      },
      {
        q: "Can I narrow or widen the split?",
        a: "No. The 150 and 210 degree harmony is fixed by the rule and only the base moves the three hues. Other spreads belong to the triadic and tetradic tools.",
      },
      {
        q: "Which hue should dominate?",
        a: "Usually the base. Give it the largest area and let the two derived hues carry accents, since they sit at the same lightness and compete if given equal space.",
      },
      {
        q: "Can the three colours work as text on colour?",
        a: "Not reliably at a shared lightness. Run the pair through the contrast checker and darken or lighten one side; the tints and shades tools make that ramp quickly.",
      },
    ],
  },

  "subtractive-color-mixer": {
    keywords: [
      "subtractive color mixer",
      "mix pigments",
      "subtractive color mixing",
      "cyan and yellow make green",
      "pigment mixing calculator",
    ],
    intro:
      "The subtractive color mixer combines two pigment colors by multiplying their channels, so cyan and yellow produce green the way inks and filters behave.",
    content:
      "The subtractive color mixer takes two colours and returns what you get when you mix pigments, combined the way inks, filters and translucent layers combine. Each colour has its own field, and the mixed result appears beside them as a large swatch. The defaults are cyan and yellow, which is a deliberate choice: multiplied together they produce a pure green, which is the answer most people remember from school and the quickest proof that the tool is modelling the right thing.\n\n- The arithmetic is per-channel multiplication.\n- Each of the red, green and blue values is scaled by the corresponding value of the other colour and divided by the full range, which is equivalent to treating both colours as filters or translucent inks that each remove part of the spectrum and letting the two removals compound.\n- It is the same operation as the multiply blend mode in image editing, and it is the correct model for ideal subtractive primaries.\n- Cyan removes red, yellow removes blue, and layering them leaves green — which is exactly what the arithmetic returns.\n\nThat model explains why this differs so sharply from mixing the same two colours of light. The additive mixer in this domain adds channels and moves towards white; this one multiplies and moves towards black. Every pairing here produces something darker than either input, which is the signature behaviour of pigment — mixing paints never yields a brighter result than its brightest component, and past three or four colours almost everything heads for a muddy brown.\n\nWhat the tool does not model is the behaviour of real pigment, and it is worth being clear about the gap. Real inks and paints scatter light, contain impurities, and vary in particle size and transparency, so a physical cyan and yellow mixed in a jar produces a green that is duller and greener-yellow than the ideal multiplication predicts, and the outcome depends on the medium and the proportions. There is also no black channel here, so this is not a CMYK conversion — it is two-colour multiplication rather than a four-ink model, and printing work would need a proper profile-based conversion.\n\nWhere the ideal model is genuinely useful is in reasoning about overlays and filters rather than about paint. A translucent coloured panel over another colour, a multiply blend in a design tool, and a coloured gel over a light all behave the way this arithmetic describes, so the tool is a reliable predictor for those cases and an approximation for ink. It is also a compact way to answer the questions people actually ask about mixing: what does blue and yellow make, what happens when you layer these two tints, and why does mixing more than three colours always end up brown.\n\n- Limits: two colours at a time, no proportion control — the mixture is always equal parts, so a two-to-one blend has to be approximated by mixing a mid-tone first — no opacity, no black channel, and no output beyond the resulting hex value.\n- As a pigment mixing calculator for ideal primaries it is exact, and as a subtractive color mixing demonstration it makes the important contrast with additive mixing obvious in one glance: cyan and yellow make green here, and make a pale grey in the additive tool beside it.",
    howTo: [
      { step: "Set the two pigment colours, starting from the cyan and yellow default if you want to see the classic result." },
      { step: "Read the mixed swatch for the combined colour." },
      { step: "Copy the resulting hex value if you need it in a design file." },
    ],
    whenToUse:
      "Use this when reasoning about layered translucency, multiply blends or ideal subtractive primaries. Use an additive mixer for light, or a profile-based CMYK conversion when the target is print. The {{additive-color-mixer|additive mixer}} is the light-side opposite, and the {{cmyk-channel-mixer|CMYK channel mixer}} works the same subtractive idea through ink percentages.",
    faqs: [
      {
        q: "How is the mixture calculated?",
        a: "Each channel of one colour is multiplied by the corresponding channel of the other. It is the same operation as a multiply blend, and it models two ideal filters or translucent inks.",
      },
      {
        q: "Why does mixing always produce something darker?",
        a: "Because multiplication moves towards black — each colour removes part of the spectrum, and the removals compound. That is the defining behaviour of subtractive mixing.",
      },
      {
        q: "Does this match real paint?",
        a: "Approximately. Real pigments scatter light and contain impurities, so a physical cyan and yellow give a duller green than the ideal arithmetic predicts, and the result depends on the medium and proportions.",
      },
      {
        q: "Can I control the proportions?",
        a: "No — the mixture is always equal parts. For an uneven blend, approximate it by mixing a mid-tone first and combining that.",
      },
      {
        q: "Why does the result differ from mixing paint in real life?",
        a: "Because the arithmetic is an ideal per-channel multiplication rather than a model of pigment: real paints scatter, absorb unevenly and carry fillers that keep a mixture from going fully dark, so the tool is best read as the idealised version of the process rather than a prediction of a specific tube.",
      },
    ],
  },

  "sunset-palette-generator": {
    keywords: [
      "sunset palette generator",
      "warm gradient palette",
      "dusk colors",
      "sunset hues",
    ],
    intro:
      "The sunset palette generator spreads five dusk hues — 10, 30, 350, 50 and 320 — along a lightness ramp from 0.55 to 0.78, giving a warm gradient palette whose chroma rolls between 0.15 and 0.22.",
    content:
      "A sunset is a gradient before it is a palette, and this preset is built the way the sky looks: a warm red at the bottom of the range, a gold in the middle, and pink at the top. The sunset palette generator uses hues 10, 30, 350, 50 and 320 in that order, raises lightness from 0.55 to 0.78 across the strip, and rolls each swatch's chroma between 0.15 and 0.22 — the most saturated band in the themed family, which is what makes the result read as glowing rather than merely warm.\n\n- Hues: a blood orange at 10, a gold at 30, a rose at 350, a yellow at 50 and a pink-magenta at 320.\n- Lightness: 0.55, 0.6075, 0.665, 0.7225 and 0.78 across the five swatches.\n- Chroma: rolled per swatch in the 0.15 to 0.22 range.\n- Output: five hex swatches and a copyable block of CSS custom properties.\n\nThe ordering is the reason the strip is useful for gradients rather than just for swatches. Hues alternate between the warm and the pink side of red while lightness climbs monotonically, so adjacent swatches blend into one another instead of jumping, and interpolating between them — by hand or with the gradient tools — produces a dusk ramp rather than a colour wheel. That is also why the palette is best judged on a large surface: five related warm hues at close lightness look nearly identical on small chips and unmistakably like a sky at full width. The sunset hues also stay inside one narrow band of the wheel, which is what keeps the ramp coherent rather than rainbow-like.\n\n- No dark tone: the range stops at 0.55, so the palette cannot supply a night sky or a text colour.\n- No cool complement, which makes a pure sunset set hard to use for information design on its own.\n- Warm, saturated colours vibrate against each other when used as adjacent text on a coloured surface; measure any pair before trusting it.\n- No preset selector, no export beyond hex tokens and no gradient string in the CSS block.\n\nRead as a warm gradient palette, the strip has a second use beyond swatches: five values along a rising ramp are enough for the gradient tools to interpolate into as many steps as a surface needs. Dusk colors also carry a shorthand no other preset does — the set reads as an ending, which suits launch imagery, seasonal sections and surfaces meant to feel like a moment rather than a brand.\n\nUse it for hero surfaces, seasonal campaigns and anything that should feel like late light — and pair it with a deep ink for text, because the whole strip is too bright to carry type. Where a gradient is the actual goal, take the five values into the gradient tools and let them interpolate the ramp; where the palette has to read as daylight rather than dusk, the beach generator is the cool counterpart and the light-mode generator covers the bright end. Keep the five values with any surface that used them: the combination is easy to reproduce and very hard to remember.",
    howTo: [
      { step: "Open the page for the initial dusk roll." },
      { step: "Press Regenerate to re-roll chroma while the hue order and the rising ramp stay fixed." },
      { step: "Copy the CSS block for tokens, or take the hex values across to the gradient tools." },
      { step: "Add a dark ink colour separately, since nothing in this strip can carry text." },
    ],
    whenToUse:
      "Use this when the palette should feel warm and glowing — hero sections, campaign pages, gradient work. The {{gradient-interpolator|gradient interpolator}} turns the strip into even steps, the {{ocean-beach-palette-generator|beach palette generator}} is the cool version of the same coast, and the {{earth-tone-palette-generator|earth palette generator}} offers the same warmth at print-like saturation.",
    faqs: [
      {
        q: "Why is the hue order so mixed rather than simply warm-first?",
        a: "It alternates across the warm and pink sides of red while lightness climbs, which is what lets neighbouring swatches blend into a dusk gradient instead of jumping between families.",
      },
      {
        q: "What is the highest chroma in the themed presets?",
        a: "This one, at 0.22, with the earth and forest presets well below it. Saturation is what makes the set read as glowing light rather than as warm earth.",
      },
      {
        q: "Can any of these colours carry text?",
        a: "None of them comfortably: the whole ramp is bright and saturated. Use the set for surfaces and artwork, and pair it with a deep ink for anything that must be read.",
      },
      {
        q: "Does the CSS output include a gradient?",
        a: "No, it writes hex custom properties only. The values can be pasted into the gradient tools when an actual ramp is what the design needs.",
      },
      {
        q: "What varies between regenerates?",
        a: "Chroma per swatch, inside the 0.15 to 0.22 band. The sunset hues, their order and the rising lightness are fixed by the preset.",
      },
    ],
  },

  "tailwind-css-color-exporter": {
    keywords: [
      "tailwind color exporter",
      "tailwind config colors",
      "tailwind color scale generator",
      "generate tailwind palette",
      "tailwind brand colors",
    ],
    intro:
      "The Tailwind color exporter expands one color into an eleven-step scale from 50 to 950 and writes it as a ready-to-paste tailwind.config colors block.",
    content:
      "- The Tailwind color exporter takes a single colour and produces a configuration snippet.\n- Pick a base colour and the tool builds a scale of eleven shades labelled from fifty to nine hundred and fifty, then writes them into a block of Tailwind config colors with the shades nested under a brand colour.\n- A copy button takes the whole block.\n\nThe scale is generated rather than sampled, which is the most important thing to understand about the output. Each of the eleven steps sits at a fixed lightness — the pale steps near the top of the range, the deepest near the bottom — while the hue and saturation are taken from the colour you chose. As a result every step is recognisably a version of your colour, and the whole ramp is internally consistent, with the lighter steps reading as tints and the darker ones as shades of one hue rather than as a collection of unrelated colours.\n\nOne consequence of that design is worth anticipating, because it surprises people who expect the opposite. Your chosen colour is not placed at any particular step. There is no rule that the base lands on five hundred; the ramp is a fixed lightness ladder wearing your colour, so a mid-blue may sit closest to the five hundred and six hundred steps while a pale colour sits closest to the top. If an exact value needs to appear in the scale, it has to be checked and adjusted afterwards.\n\nThe eleven steps follow the convention Tailwind adopted when it extended its own palettes: fifty at the lightest through nine hundred, with a nine hundred and fifty at the darkest for the very deepest tone. Because the scale builds from your hue and saturation, the result slots into a project that already uses the framework's naming — utilities such as the fifty, five hundred and nine hundred variants all resolve to something sensible, and the ramp behaves the way the rest of a Tailwind palette does.\n\nIn practice the workflow is a colour pick and a paste. Choose the brand colour, copy the block, drop it into the extend section of the configuration, and every shade becomes available as a utility with no further conversion. That is the whole point of exporting rather than generating a loose list of values: the output is already in the shape the build expects, so nothing has to be renamed or restructured.\n\n- Limits worth knowing: the block is written as a CommonJS module export, so a project using ES modules or the newer CSS-first configuration will need to adapt the wrapper even though the shades themselves are correct.\n- The colour name is fixed to brand, so renaming it is a manual edit; there is no dark-mode variant, no semantic aliasing and no export of other token types; and the values are hex, with no oklch form for projects that have moved to wider-gamut palettes.\n- There is also no contrast checking, so the suitability of any shade for text has to be tested separately — but within those bounds, as a tailwind color scale generator it removes the tedium of building eleven steps by hand, and for anyone who needs to generate tailwind palette shades from one brand colour or simply get tailwind brand colors into a config file, it is a single paste.",
    howTo: [
      { step: "Pick the brand colour with the field at the top." },
      { step: "Read the eleven generated shades, which run from 50 at the lightest to 950 at the darkest." },
      { step: "Copy the configuration block into the extend section of your Tailwind config." },
      { step: "Rename the brand key and adjust any shade that has to match an exact value." },
    ],
    whenToUse:
      "Use this when a Tailwind project needs a full shade ramp derived from a brand colour. Use the palette generator when you want to see the shades on screen without a config block, or the design token generator when the output has to be a token document instead of framework configuration. The framework's own families are laid out in the {{tailwind-color-reference|Tailwind color reference}} for comparing a derived ramp against them, and the {{contrast-checker|contrast checker}} is where the shade that will carry text gets verified.",
    faqs: [
      {
        q: "How many shades does the exported config define?",
        a: "Eleven, from 50 to 950, following the scale Tailwind uses for its own palettes. Each sits at a fixed lightness with the hue and saturation of your colour.",
      },
      {
        q: "Does my colour end up at 500?",
        a: "Not necessarily. The ramp is a fixed lightness ladder wearing your hue and saturation, so your exact colour may sit closest to a different step. Check afterwards if the precise value matters.",
      },
      {
        q: "Will the snippet work in any project?",
        a: "The shades will, but the wrapper is a CommonJS module export. Projects using ES modules or the newer CSS-first configuration need to adapt that wrapper.",
      },
      {
        q: "Can I rename the colour key?",
        a: "Not in the tool — the key is fixed to brand. Rename it in the copied snippet; the shades underneath are unaffected.",
      },
      {
        q: "Do I need the whole config block if I only want a few shades?",
        a: "The copy button hands over the whole snippet, and the shades inside it are individual values — taking two or three and dropping the wrapper is a manual trim when a config file is not the destination.",
      },
    ],
  },
};
