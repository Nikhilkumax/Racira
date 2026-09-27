import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 20.
 *
 * Skipped from this window:
 *  - nearest-named-color-finder — renders the identical ColorNameLookup as the
 *    already-authored color-name-lookup. The pantone and RAL reference slugs that
 *    share the same component are flagged, so this cluster has one honest page and
 *    six aspirational ones.
 *  - material-ui-color-exporter / chakra-ui-color-exporter — flagged; both render the
 *    Tailwind class generator.
 */
export const SEO_BATCH_20: Record<string, ToolSeo> = {
  "monochromatic-palette-generator": {
    keywords: [
      "monochromatic palette generator",
      "variations on a single hue",
      "monochromatic color scheme",
      "lightness steps of one hue",
    ],
    intro:
      "The monochromatic palette generator holds one hue and returns five lightness steps from it: the base plus two steps above and two below. It is the only harmony in this set that never rotates hue.",
    content:
      "A monochromatic palette generator does not move around the wheel at all. It holds the base's hue and chroma and walks its lightness, returning five steps: 0.30 and 0.15 below the base, the base itself in the middle, and 0.15 and 0.30 above it. That fixed set of lightness steps of one hue is what makes a monochromatic color scheme read as a single colour seen at five depths. It is the safest palette in the domain, and the one with no hue contrast at all to lean on.\n\nThe work happens in OKLCH, where lightness is a perceptual axis rather than a channel value, so the five steps look evenly spaced to the eye. Hue and chroma come straight from the base, which is why the five variations on a single hue share a temperature and a character rather than drifting into grey as they lighten. Where the base sits close to the top or bottom of the range, a step is clamped so the value stays valid; at the extremes the set compresses and one or two steps may land on the same near-white or near-black value.\n\n- The steps are fixed at 0.15 and 0.30 below and above the base. There is no control over the spacing.\n- The count is fixed at five, with no count control to add or remove a step.\n- No contrast check. Low separation is the class of problem this palette creates, so pairs must be verified elsewhere.\n- No ordering control: the strip runs darkest to lightest, with the base in the middle.\n- No hue or chroma controls. The base decides the colour, and the only thing the rule varies is how light each step is.\n\nUse the monochrome set when a single colour has to carry a whole surface: a section background through three tints, a text hierarchy, or a data chart that steps through one family. Assign roles along the lightness axis. The darkest step lands on text, the middle steps on surfaces and borders, and the lightest on backgrounds, and the palette stops needing a second hue. Because the steps share a chroma, the set keeps a consistent saturation even when a step lands near white.\n\nWhere a point of emphasis is unavoidable, bring in one accent from the complementary generator rather than adding another step, because a monochromatic color scheme has no built-in contrast to spare. Keep the base value with the palette; the five steps are reproducible from that one input and the fixed increments, which makes the set easy to recreate or hand off.\n\nGiven how much of an interface is neutral by nature, a monochrome set often covers more of a screen than any other rule. It supplies the surfaces, borders and type weights a layout already needs, and the fixed increments keep those steps consistent across components rather than re-invented on every screen. Because hue and chroma travel together, a saturated base yields saturated steps and a muted base yields a muted set, so the family keeps its character even at the pale end. As a first palette it is also the most forgiving, because there is nothing to balance between hues, only distance along one axis.",
    howTo: [
      { step: "Set the base color with the picker or by typing a hex value." },
      { step: "Read the five swatches, darkest to lightest, with the base in the middle." },
      { step: "Copy the hex value of any step." },
    ],
    whenToUse:
      "Use the monochromatic generator when one hue has to do all the work and the palette should feel calm and continuous. The {{analogous-palette-generator|analogous generator}} is the neighbouring-hues alternative, the {{color-tints-generator|tints}} and {{color-shades-generator|shades}} tools build longer ramps from a single value, and the {{complementary-palette-generator|complementary generator}} supplies the one accent a monochrome set often needs. Check any text pair with the {{contrast-checker|contrast checker}}, because lightness alone carries the hierarchy here.",
    faqs: [
      {
        q: "Why does this one return five colors while the others return two to four?",
        a: "Because the rule varies lightness instead of hue. Five steps, two above the base and two below, is what gives the set enough range to build a surface and a text hierarchy from one colour.",
      },
      {
        q: "Does the hue ever change?",
        a: "No. The lightness steps of one hue keep the hue and chroma fixed and move lightness only, which is why the set never drifts towards grey or towards a neighbouring hue.",
      },
      {
        q: "Why do some steps look almost identical near a very light base?",
        a: "Steps are clamped at the ends of the lightness range. A near-white base has little room above it, so the top steps compress and can land on similar values.",
      },
      {
        q: "Can I change the spacing or the number of steps?",
        a: "No. The increments are fixed at 0.15 and 0.30 and the count is fixed at five. For longer, finer ramps the tints and shades tools stretch a single value further.",
      },
      {
        q: "Is a monochrome palette safe for text?",
        a: "Safer than most, but not automatically. Lightness is the only tool it has, so check the pair anyway; the contrast checker confirms whether a step can carry text against another.",
      },
    ],
  },

  "multi-color-picker": {
    keywords: [
      "multi color picker",
      "pick multiple colors",
      "build a color palette manually",
      "color palette builder",
      "add colors to a palette list",
    ],
    intro:
      "The multi color picker collects colors one at a time into a palette list, with a count, a remove button on each swatch and a single copy for the whole set.",
    content:
      "The multi color picker has two halves. On one side is a colour field and a button labelled Add to palette. On the other is a panel headed with the number of colours collected so far, containing a small swatch for each with a remove cross in its corner, and a Copy all button once there is at least one entry. The empty state says so plainly rather than showing an empty grid.\n\nThe workflow is a loop that suits the way palettes are actually assembled:\n\n- Pick a colour, press Add to palette, pick another, add it — there is no step limit and no slots to fill, so the tool never prescribes how many colours a palette should hold.\n- Each swatch is drawn small enough that a longer list still reads at a glance, and removal is per entry rather than a single undo.\n- One Copy all button puts every value on the clipboard as an uppercase comma-separated sequence, in the order added, while individual swatches carry their own copy buttons.\n\nWhat makes this different from the generators elsewhere in the domain is that nothing is suggested. Every other palette tool produces colours from a rule — a harmony, a theme, an image, a base colour — and the result is coherent by construction. This one takes whatever you give it, which means it can express a palette that comes from somewhere else entirely: a brand guide, a photograph you already matched by eye, a competitor's site, a physical sample. It is a container, and the ordering and editing are the whole feature.\n\nThe copy behaviour is worth noticing because it is the reason the tool is faster than a notes app. Copy all puts every value in the list on the clipboard as an uppercase comma-separated sequence, in the order added, so the palette can be pasted into a design review, a message or a code comment as one string. Individual swatches also carry their own copy buttons for when only one value is needed.\n\nThe honest limits all follow from the tool being manual:\n\n- Duplicates are allowed — adding the same colour twice produces two entries and nothing warns you.\n- There is no reordering, so the order in the list is the order you add, and correcting it means removing and re-adding.\n- Nothing is saved: reloading the page clears the palette, and there is no contrast checking, no naming and no way to swap a colour in place once it is in the list.\n\nUsed as a multi color picker, it covers a task the generators cannot: assembling a palette from colours that already exist, with the ability to prune as you go. If you want to pick multiple colors deliberately, or to build a color palette manually rather than having one proposed, this is the direct route — a color palette builder with no opinions, where the only thing you supply is the judgement and the only thing it supplies is a tidy list and a way to add colors to a palette list in one string.",
    howTo: [
      { step: "Pick a colour with the field." },
      { step: "Press Add to palette — the swatch appears in the list and the count updates." },
      { step: "Repeat for each colour, using the remove cross on any swatch you want to drop." },
      { step: "Press Copy all to take the whole list as a comma-separated string." },
    ],
    whenToUse:
      "Use this when a palette already exists in your head, on a brand sheet or in a photograph, and it needs to be collected in one place. Use a generator when you want the colours proposed rather than transcribed. When the colours should be proposed rather than transcribed, the {{palette-locker|palette locker}} and the {{random-palette-generator|random palette generator}} build a set from a rule, and the {{palette-comparison|palette comparison}} reads a finished list.",
    faqs: [
      {
        q: "Is there a limit on how many colours I can add?",
        a: "No. The list grows as long as you keep adding, and the panel shows the running count rather than a fixed set of slots.",
      },
      {
        q: "What does Copy all produce?",
        a: "Every value in the list in the order you added them, upper-cased, separated by commas, so the whole palette can be pasted as a single string.",
      },
      {
        q: "Can I add the same colour twice?",
        a: "Yes, and nothing warns you. Duplicates are easy to introduce in a long list, so skim it before copying.",
      },
      {
        q: "Is the palette saved between visits?",
        a: "No. The list lives in the page only and is cleared on reload, so copy anything you want to keep before navigating away.",
      },
      {
        q: "Can I reorder entries once they are in the list?",
        a: "No. The list keeps the order you added colours in, so moving an entry means removing it and adding it again at the end.",
      },
    ],
  },

  "multi-stop-gradient-builder": {
    keywords: [
      "multi stop gradient builder",
      "three color gradient",
      "gradient with multiple stops",
      "multi color gradient css",
      "gradient stops builder",
    ],
    intro:
      "The multi stop gradient builder opens with a three-color ramp and lets you add, position and remove stops while the CSS declaration updates live.",
    content:
      "The multi stop gradient builder is the general-purpose ramp builder. It starts further along than the other gradient tools in this domain: instead of the usual pair of colours it opens with three — a blue at the start, a purple at the midpoint and a red at the end — so the moment the page loads there is already a multi-stop gradient on screen to work from.\n\n- Every stop gets its own row — a colour field and a position slider together — with a Remove button that appears once more than two remain.\n- The guard matters: a gradient with fewer than two colours has nothing to interpolate between, so the builder refuses to let you get there.\n- Add stop appends an entry at the midpoint of the ramp rather than at the end, so a new colour is immediately visible and can be dragged either way.\n\nThe distinction between this and a two-stop gradient is not just the number of colours. With two stops, every value on the ramp is a straight interpolation between the endpoints, and the only design decision is which two colours. With three or more, the positions matter as much as the colours: stops spread evenly give a smooth progression through the middle colour, while stops pushed towards one end compress the transition and leave flat colour on the other side. Pulling two stops onto the same position produces a hard edge instead of a blend. That is the vocabulary this tool exists to let you use, and it is why the position sliders are as important as the colour fields once you go past two colours.\n\n- Stop positions do not have to be in order: the browser sorts them before painting, so dragging the middle stop past the first only reorders the ramp.\n- Two stops at identical positions produce an abrupt transition rather than an error, which is the standard way CSS builds a hard stop.\n\nThe angle slider covers the full circle from zero to three hundred and sixty degrees, and the declaration is always written in degrees rather than as a direction keyword. Copy takes the whole thing as a background declaration. There is no radial or conic option here — this page builds linear ramps — and no interpolation-space control, so the browser's default interpolation applies.\n\nWhere a multi-stop gradient is worth the extra complexity is any surface that has to carry a story: a sky going from deep blue through orange to pale yellow, a chart background that signals a threshold, a hero that needs two hues plus a light passage between them. Two colours give a direction; three give a sequence. As a multi stop gradient builder it makes that structure editable rather than hand-written: a gradient with multiple stops can be reshaped by dragging rather than by editing numbers in a text editor. For a three color gradient or any other multi color gradient css, this gradient stops builder keeps the declaration in step with what you see, which is the difference between guessing at a ramp and watching it change.",
    howTo: [
      { step: "Start from the three default stops, or recolour them with the colour fields." },
      { step: "Drag the position sliders to control where each colour sits along the ramp." },
      { step: "Use Add stop for more colours — new stops arrive at the midpoint — and Remove to simplify." },
      { step: "Set the angle, then copy the background declaration." },
    ],
    whenToUse:
      "Use this when a ramp needs three or more colours, or when stop positions have to be placed precisely. Use the two-stop angle adjuster for simple direction changes, or the stop editor when the axis should stay fixed horizontally. For a two-colour sweep with no interior positions to place, the {{linear-gradient-generator|linear gradient generator}} is the same builder with fewer controls, and a ramp whose axis should stay put while the stops are placed is the {{gradient-color-stop-editor|gradient color stop editor}}.",
    faqs: [
      {
        q: "How many stops can I use?",
        a: "As many as you need. Add stop appends another entry at the midpoint, and Remove appears on each row once more than two remain.",
      },
      {
        q: "What happens if I move a stop past another one?",
        a: "Nothing breaks. The browser sorts stops by position before painting, so dragging the middle stop to the left of the first simply reorders the ramp.",
      },
      {
        q: "How do I make a hard edge?",
        a: "Place two stops at the same position. The transition between them collapses to a line, which is the standard way CSS expresses a hard stop.",
      },
      {
        q: "Can I build a radial or conic gradient here?",
        a: "No. This page produces linear ramps only, with the direction given in degrees. Radial and conic generators are separate tools.",
      },
      {
        q: "What colour does a new stop arrive with?",
        a: "A random one, chosen the moment Add stop is pressed. It lands at the midpoint of the ramp, so the position is sensible from the start and recolouring it is the only step left.",
      },
    ],
  },

  "muted-color-generator": {
    keywords: [
      "muted color generator",
      "muted color palette",
      "desaturated colors",
      "low saturation palette",
      "muted tones generator",
    ],
    intro:
      "The muted color generator produces five colors at very low saturation, drawn from anywhere on the wheel, for palettes that should feel restrained rather than vivid.",
    content:
      "The muted color generator returns five swatches, each with its hex value and a copy button, and a button that generates another set. It has no configuration: the tool exists to produce colours inside a specific band, and the band is the whole specification.\n\n- That band is defined mostly by saturation, which is held between roughly 0.03 and 0.07 in a perceptual colour space — very close to grey, but not grey.\n- At that level a colour still has a recognisable identity: a muted blue reads as blue, a muted olive reads as olive, and neither shouts.\n- Lightness varies between about forty and seventy percent, which keeps every swatch in the mid-range where a colour is legible on either a light or a dark surface, and the hue is unconstrained, spanning the whole wheel.\n\nThat last choice is the one that shapes how the palette behaves, and it is worth being clear about.\n\n- Each of the five swatches is generated independently, with its own random hue, so the result is not a family of related colours — it is five separate muted colours that happen to share a tonal character.\n- Sometimes that produces a pleasing spread across the wheel; sometimes it produces several near-neighbours and one outlier.\n- The generator does not coordinate the hues, because its subject is saturation rather than harmony.\n\nWhat follows from that is how to use it. This is a generator to harvest from rather than to accept whole. Generate a set, keep the two or three that work together, and generate again for the rest — or take a single colour as a starting point and let a harmony or monochromatic tool derive the related steps from it, which will give a more coherent scheme. Reaching straight for the copy button and shipping all five is what produces the slightly arbitrary feel that muted palettes are sometimes accused of.\n\nWhere the tool is genuinely strong is the case that motivated it. Many design briefs call for restraint — editorial sites, portfolios, wellness and lifestyle brands, anything where the imagery should carry the colour and the interface should get out of the way. Saturated colours fight that brief; greys alone can feel unfinished. Muted tones occupy the space in between, and producing five of them at a consistent level of restraint by hand is genuinely fiddly, because the eye adjusts as you go and the first colour starts to look vivid next to the fourth.\n\nWorth knowing: there is no contrast checking, and low-saturation colours are the ones most likely to fail against a surface at a similar lightness, so any pairing needs testing. There is also no way to constrain the hue range, so a palette that should stay cool cannot be nudged that way, and there is no history — generating again replaces the set, so copy anything worth keeping before pressing the button.\n\nUsed as a desaturated colors source, though, it does its one job well. For a muted color palette that should read as quiet, or as a low saturation palette for a design that lets imagery lead, this hands over muted tones at a consistent restraint in a click. As a muted tones generator it is far easier than mixing each colour towards grey by eye, because the eye recalibrates as you go and the first colour always starts to look vivid next to the fourth.",
    howTo: [
      { step: "Press the generate button to produce five muted swatches." },
      { step: "Keep the ones that work together and generate again for the rest." },
      { step: "Copy individual hex values — or take one colour into a harmony tool to derive related steps." },
      { step: "Check contrast on any pairing you intend to use for text and background." },
    ],
    whenToUse:
      "Use this when a design should be restrained and the imagery supplies the colour — editorial, portfolio, lifestyle. Use the muted tones from a single brand colour when the palette has to stay tied to a specific hue, which a harmony or monochromatic tool will do. For the neighbouring steps, see the {{daily-color-generator|daily color generator}} and the {{color-of-the-year-browser|color of the year browser}}.",
    faqs: [
      {
        q: "Why are the colours so close to grey?",
        a: "Saturation is held between roughly 0.03 and 0.07 in perceptual terms — enough for each colour to keep its identity, little enough that nothing shouts.",
      },
      {
        q: "Are the five colours related to each other?",
        a: "No. Each is generated independently with its own random hue, so the set shares a tonal character rather than a family relationship. Keeping two or three and regenerating is usually better than using all five.",
      },
      {
        q: "Does the generator avoid contrast problems?",
        a: "No. Low-saturation colours at similar lightness to their surface are exactly the ones that fail, so any pairing needs checking before it ships.",
      },
      {
        q: "Can I keep the palette for next time?",
        a: "Not in the tool — generating again replaces the set. Copy the hex values you want to keep first.",
      },
      {
        q: "What does the muted color generator not do?",
        a: "Each of the five swatches is generated independently, with its own random hue, so the result is not a family of related colours — it is five separate muted colours that happen to share a tonal character. Sometimes that produces a pleasing spread across the wheel; sometimes it produces several near-neighbours and one ou",
      },
    ],
  },

  "neon-color-generator": {
    keywords: [
      "neon color generator",
      "neon color palette",
      "bright neon colors",
      "neon hex codes",
      "fluorescent colors generator",
    ],
    intro:
      "The neon color generator produces five colors at a fixed high brightness and maximum saturation in random hues, giving the fluorescent look of neon signage.",
    content:
      "The neon color generator returns five swatches at a time, each with its hex value and a copy button, plus a button that generates a fresh set. The defaults are vivid the moment the page loads: every swatch sits at a high lightness and at the highest saturation the colour space will allow, which together produce the glowing, poster-like quality the name promises.\n\n- Both of those parameters are fixed.\n- Lightness is pinned around seventy-five percent, which is bright without washing out to white and is the level at which a colour reads as emissive rather than merely saturated.\n- Saturation is pushed to roughly 0.3, which is well beyond what most palettes use.\n- The hue, by contrast, is entirely free: each of the five swatches is drawn independently from the full wheel, so a set can contain anything from a hot pink to a lime to a cyan.\n\nThat independence is worth understanding before using the palette. There is no coordination between the five colours and no attempt to build a harmony — the generator's subject is intensity, not relationships. The practical consequence is that the set reliably looks like an eighties arcade cabinet or a nightclub sign and unreliably looks like a considered scheme. The way to use it is to generate until a set happens to work, or to take one colour and build the rest around it deliberately.\n\nA technical detail affects how many of the results are usable, and it is a real limitation rather than a footnote. Very high saturation pushes some hues outside the range a standard display can render — yellows and greens most of all, since the sRGB gamut is narrowest in that region. When the requested colour falls outside, the conversion returns the closest displayable value, so a swatch that should have been a blazing yellow-green comes back slightly duller than the others. In practice this means a neon palette generated here is not uniformly neon: the pinks, cyans and magentas tend to be the most vivid because they sit comfortably inside the gamut, and the pure greens and yellows are reined in.\n\nWhere these colours belong is on dark backgrounds, and that is not a stylistic preference so much as a functional one. A colour at this brightness against white is not legible as text and looks washed out as a fill; against a near-black surface it behaves the way neon actually does, appearing to emit light. Games, music and nightlife branding, event posters, cyberpunk and retro futures all use that effect deliberately, and it is also a reliable way to make a small accent — a badge, a status dot, a single line on a chart — impossible to miss.\n\n- Limits worth keeping in mind: no contrast checking, so any text on or over these colours needs testing; no constraint on the hue range, so a set that should stay within one part of the wheel cannot be steered; no history, so generating again discards what you had; and no export beyond copying individual neon hex codes.\n- As a bright neon colors source or a fluorescent colors generator, it does the one thing asked of it — five neon color palette swatches in one click — and the honest advice is the same as with any unconstrained set: harvest the ones that work rather than shipping all five.",
    howTo: [
      { step: "Press the generate button to produce five neon swatches." },
      { step: "Keep the ones that suit the piece and generate again for the rest." },
      { step: "Place them against a dark background so the brightness reads as glow rather than glare." },
      { step: "Copy individual hex values from the swatches." },
    ],
    whenToUse:
      "Use this when a design wants the fluorescent, high-energy look — games, music, events, retro-future branding. Use a pastel, muted or themed generator when the palette should be restrained or coordinated instead. For the neighbouring steps, see the {{daily-color-generator|daily color generator}} and the {{color-of-the-year-browser|color of the year browser}}.",
    faqs: [
      {
        q: "Why do some swatches look duller than others?",
        a: "The saturation requested is higher than a standard display can render for some hues, yellows and greens especially. Those colours are returned as the closest displayable value, so they come back slightly reined in.",
      },
      {
        q: "Are the five colours coordinated?",
        a: "No. Each is drawn independently from the full hue wheel, so the set shares intensity, not harmony. Generate until a set works, or build the others around one colour.",
      },
      {
        q: "What background suits these colours?",
        a: "A dark one. At this brightness they read as emissive against near-black, and appear washed out or illegible against white.",
      },
      {
        q: "Is the palette contrast-checked?",
        a: "No. High-brightness colours still fail contrast against light surfaces, so test any text or UI pairing before using it.",
      },
      {
        q: "What does the neon color generator not do?",
        a: "As a bright neon colors source or a fluorescent colors generator, it does the one thing asked of it — five neon color palette swatches in one click — and the honest advice is the same as with any unconstrained set: harvest the ones that work rather than shipping all five.",
      },
    ],
  },

  "neumorphism-generator": {
    keywords: [
      "neumorphism generator",
      "neumorphism css",
      "soft ui shadows",
      "css box shadow generator",
      "soft ui design generator",
    ],
    intro:
      "The neumorphism generator writes the soft UI shadow recipe — a background colour, a two-sided box shadow and a corner radius — with sliders for distance and blur.",
    content:
      "- The neumorphism generator has three controls, and the first is the one that defines the style: a Background colour that sets both the element and the surface it sits on.\n- Distance, from two to forty pixels, sets how far the two shadows are offset; blur, from two to eighty, sets how soft their edges are.\n- The preview shows a rounded square floating in a larger panel of the same colour, so the effect is judged as it will actually appear.\n\nThe CSS card holds three declarations, and together they are the complete neumorphism css recipe — the surface colour, the paired shadow and the radius. Reading the output as soft ui shadows rather than as a shadow is the mental shift the style requires. The first paints the background. The second is the interesting one — a box shadow with two entries, the first offset down and to the right in a darker tone, the second offset up and to the left in a lighter tone. That pairing is the entire technique: where a conventional shadow models light coming from one direction and blocking on the far side, this models an element pressed out of, or into, a surface that shares its colour. The third declaration rounds the corners, and the rounding matters more than it looks, because a soft shadow on a square corner reads as a glow rather than as moulded material.\n\nBoth shadow colours are derived rather than chosen. The darker entry is the background colour reduced in brightness by a fixed amount, and the lighter entry is the background colour raised by the same amount, so the relationship between the three is preserved whatever colour you pick. That is why the tool needs only one colour field: the shadows are always eight percent of lightness away from the surface in each direction, which is the standard proportion for the effect.\n\n- That derivation explains the style's signature constraint: because the shadow colours are close to the background, the effect only reads where the surface is a mid-tone with room on both sides.\n- On pure white there is nothing lighter to highlight with and the raised edge disappears; on near-black there is nothing darker to shade with.\n- Colours in the light-middle range — greys, pale blues, soft greens — are where it behaves, which is exactly the range the default sits in.\n\nThe two sliders control how pronounced the moulding is. Distance sets how far the light appears to travel, and with it how deep the element seems to sit; large values with a small blur produce a hard-edged, almost cartoonish relief, while small values keep it subtle. Blur controls the softness, and a blur that is much larger than the distance produces the diffuse, pillow-like appearance the style is known for.\n\nWhat the tool does not offer is worth stating plainly. There is no inset variant, so a pressed or recessed state — the usual way a soft UI button shows interaction — cannot be generated here and has to be written by hand; the CSS is short enough to adapt. The corner radius is fixed at twenty pixels. There is no second surface colour, so the element and its background are always the same value. And since the shadow tones are derived rather than picked, a design that wants warm highlights on a cool surface is out of reach.\n\nUsed as a neumorphism generator, though, it covers the parts that are tedious: computing two derived tones and writing the paired shadow correctly. As a css box shadow generator it produces one very specific recipe, and as a starting point for a soft UI design it hands over the recipe as a copyable block so a raised surface can be styled in one paste. Used as a soft ui design generator, the three declarations it returns are the foundation of the whole style, and the two derived tones are the part most people get wrong when writing it by hand.",
    howTo: [
      { step: "Set the Background colour — a mid-tone works best, since the shadows are derived from it." },
      { step: "Adjust Distance to control how far the surface appears to lift." },
      { step: "Adjust Blur for softness; a blur much larger than the distance gives the pillow-like look." },
      { step: "Copy the block and add an inset variant by hand if you need a pressed state." },
    ],
    whenToUse:
      "Use this when a light, tactile surface is wanted — dashboard cards, resting buttons, control panels. Use the glassmorphism generator when the surface should be translucent over an image instead of moulded out of its background. A shadow that belongs to its surface without the moulding is what the {{shadow-color-generator|shadow color generator}} derives, and when two shadows are more than the design needs, the {{box-shadow-color-tool|box shadow color tool}} builds a single one with its geometry and colour exposed.",
    faqs: [
      {
        q: "Why does the element need the same colour as its background?",
        a: "Because the whole effect comes from light and shade on a single material. A different element colour breaks the illusion, and the shadow tones would no longer read as derived from the surface.",
      },
      {
        q: "Can I generate an inset or pressed state?",
        a: "Not here — only the raised version is written. Adding the inset keyword to the shadow by hand produces the pressed variant.",
      },
      {
        q: "Why does nothing show on a white background?",
        a: "The highlight shadow is a lighter version of the surface, and there is nothing lighter than white. The effect needs a mid-tone with room on both sides of it.",
      },
      {
        q: "Are the shadow colours adjustable?",
        a: "No, they are derived from the background — eight percent lighter for one and eight percent darker for the other. A warm highlight on a cool surface would need hand-editing.",
      },
      {
        q: "Can the highlight and the shade have different offsets?",
        a: "No — they are exact mirrors of each other, both driven by the one distance slider. That symmetry is what makes the surface look moulded, so a lopsided pair is a manual edit of the copied declaration rather than a setting here.",
      },
    ],
  },

  "noise-grain-texture-generator": {
    keywords: [
      "noise grain texture generator",
      "add grain to gradient",
      "grainy gradient",
      "svg noise texture",
      "noise overlay css",
    ],
    intro:
      "The noise grain texture generator layers an SVG turbulence filter over a two-color gradient to show how grain removes banding and adds a printed texture.",
    content:
      "- The noise grain texture generator takes two colours and one action: choose a From and a To, and a fine grain appears over the gradient between them.\n- There are no sliders for the grain, no opacity control and no code output — the page demonstrates the combination and leaves the implementation to you.\n\nThe technique it shows is worth understanding, because it is the standard answer to a common problem. A gradient painted across a large area in eight bits per channel rarely renders smoothly: the browser has to fit a continuous ramp into a limited number of steps, and where adjacent steps are far enough apart to be visible the result is banding — soft, contour-like lines running across the surface. Adding noise breaks the contours up. The eye stops resolving the steps because the noise dominates the local contrast, and the gradient reads as continuous even though the underlying values have not changed.\n\nThe grain in the preview is an SVG filter, not an image. A turbulence element with a high base frequency and two octaves generates fractal noise procedurally, and it is drawn in a rectangle filling the panel, layered over the gradient at reduced opacity with an overlay blend mode. Being generated rather than loaded has two consequences: it costs no network request, and it stays crisp at any size because it is computed rather than stretched. The high frequency is what makes it read as grain rather than as clouds — a lower frequency would produce blotches instead.\n\nReproducing the effect in your own work is a matter of keeping the gradient and adding the overlay. The base is an ordinary linear gradient, and the grain is that same SVG rect placed over it with absolute positioning, partial opacity and a blend mode. If the grain itself needs to be a CSS background, the equivalent approach is a small tiling SVG or a base64-encoded noise image repeated as a background layer — the same idea with a different plumbing.\n\nWhere grain is worth the extra layer is anywhere a gradient covers a large area: hero backgrounds, full-width banners, presentation slides and email headers. It is also a way to give flat colour a printed or photographic feel without changing the colour, which is why it turns up in editorial and brand work. And it helps with another artefact of the same family — a gradient that passes through a very similar pair of colours can show visible steps even though the total range is small, and noise fixes that case too.\n\n- There is no code output on this page, so the recipe has to be transcribed rather than copied.\n- The grain amount, scale and opacity are fixed, so it cannot be tuned to a surface or to a print size.\n- The texture cannot be exported on its own.\n- Because the SVG filter is rendered live by the browser, the exact appearance of the noise varies a little between engines.\n\nUsed as a way to see what grain does to a pair of colours, the tool does its job in one step. As a reference for the technique — how to add grain to gradient artwork with an svg noise texture and a noise overlay css blend — it shows the correct construction, and the resulting grainy gradient is the right answer whenever banding is showing on a large smooth surface.",
    howTo: [
      { step: "Set the From and To colours to the gradient you are working with." },
      { step: "Look at the preview to see how grain changes the way the ramp reads." },
      { step: "Reproduce it in your own work by keeping the gradient and adding the noise layer over it." },
    ],
    whenToUse:
      "Use this when a gradient will be large enough for banding to show, or when flat colour needs a printed texture. Use a plain gradient builder when the surface is small enough that grain is unnecessary. Where the same pair should be shown without any texture, the {{linear-gradient-generator|linear gradient generator}} is the plain version; where the noise is one of several treatments on the same element, the {{css-filter-generator|CSS filter generator}} covers the other filter-based ones — blur, brightness, contrast, saturation and hue-rotate — that stack with a noise layer.",
    faqs: [
      {
        q: "What does the grain actually do?",
        a: "It breaks up the visible steps a gradient shows when a smooth ramp is fitted into eight bits per channel. The noise dominates the local contrast, so the eye reads the surface as continuous.",
      },
      {
        q: "Is the noise an image file?",
        a: "No. It is an SVG turbulence filter generated by the browser, so there is no download cost and the grain stays consistent at any size.",
      },
      {
        q: "Can I change how strong the grain is?",
        a: "Not on this page — the amount, frequency and opacity are fixed, and there is no code output to copy. The construction shown is what you would reproduce with your own values.",
      },
      {
        q: "Will the grain look identical everywhere?",
        a: "Not exactly. The filter is rendered by each browser engine, so the fine detail varies slightly between them.",
      },
      {
        q: "Can the grain sit over a flat colour instead of a gradient?",
        a: "Yes — the turbulence layer is independent of what it sits on, so the same recipe over a solid fill gives the same speckle. The blend does react to the colour underneath, so the grain takes on that colour rather than the gradient's.",
      },
    ],
  },
};
