import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 15.
 *
 * Skipped from this window:
 *  - emotion-color-finder — slug promises colour-emotion associations, component
 *    hashes the emotion name into arbitrary hues.
 *  - screen-color-picker — renders the identical EyedropperTool as eyedropper-tool
 *    (authored here), so the two pages would be indistinguishable.
 *
 * The gradient tools in this alphabetical window (gradient-angle-adjuster,
 * gradient-angle-calculator, gradient-collection-browser, gradient-color-stop-editor,
 * gradient-from-image, gradient-interpolator, gradient-previewer, gradient-reverser,
 * gradient-palette-mixer, gradient-to-css-exporter) are handled together in batch 16.
 */
export const SEO_BATCH_15: Record<string, ToolSeo> = {
  "eye-color-reference": {
    keywords: [
      "eye color reference",
      "eye color palette",
      "eye color hex codes",
      "iris color shades",
      "eye colors with hex",
    ],
    intro:
      "The eye color reference generates a five-swatch palette drawn from the hue bands associated with iris colour — blue, green, amber, violet and red — with every value written out as a hex code.",
    content:
      "The eye color reference works like the other themed generators: five swatches, each with its colour and code, a Regenerate button, and a panel listing the set as numbered CSS custom properties ready to copy. What distinguishes it is the hue bands the five swatches are drawn from, which follow the spectrum you actually see in irises rather than an arbitrary spread.\n\n- The first swatch comes from the blue band around 200 degrees, the second from a green near 120, the third from an amber around 30, the fourth from a violet near 260, and the fifth from a red at zero.\n- Read as a set that is the familiar range of eye colours, running from the cool blues and greens through hazel and amber to the reddish browns that dominate in most populations.\n- Anyone who has looked at a chart of iris pigmentation will recognise the arc.\n\n- The second constraint is lightness, which is held between roughly twenty-five and fifty-five percent across the whole set.\n- That is a darker band than most of the other themed generators use, and it is what keeps the swatches reading as eyes rather than as pastels: a pale blue is a wall colour, while the blue here carries the depth of an iris in shadow.\n- The third constraint is chroma, capped at about 0.16, so no swatch comes out fully saturated.\n\nAs with the other generated palettes, Regenerate re-rolls only the saturation, not the hues or the lightness ladder. Each of the five positions keeps its band and its tonal position, so repeated presses give you the same five kinds of colour at slightly different intensities. That makes the tool a chooser rather than a slot machine — you are settling on how deep and how muted the set should feel, not gambling on a new palette.\n\nWhere this is useful is anywhere a character, an illustration or a product is being given eye colour, and the value has to be consistent across several assets. An avatar system, a doll or a game character generator all need a small fixed set of iris shades that are distinguishable from one another but sit in the same tonal world, which is exactly what the five bands produce. It is also handy for illustration palettes generally, since a set of five muted warm and cool darks works for skin, hair and shadow notation.\n\nBe clear about what it is not. These are generated colours chosen to sit in the right hue bands, not measurements of real eyes — actual iris colour is produced by pigmentation and light scattering, varies across the surface of a single eye, and never appears as one flat value. Nor is this a list of commonly named eye colours like hazel or grey; the bands cover blue, green, amber, violet and red, and grey-brown falls between the bands rather than inside one. Used as an eye color palette to pick a consistent set of iris color shades from, though, it is quicker than inventing eye color hex codes by hand, and every swatch arrives as an eye colors with hex value you can paste straight into an asset file.",
    howTo: [
      { step: "Press Regenerate until the saturation level suits the assets you are making." },
      { step: "Read the five swatches — blue, green, amber, violet and red bands, from darker to lighter." },
      { step: "Copy the numbered custom properties, or copy an individual swatch value." },
    ],
    whenToUse:
      "Use this when you need a consistent set of iris colours for avatars, characters or illustrations. Use the hair colour reference for the same job on hair, or a themed palette generator when the mood rather than the subject is the guide. For the neighbouring steps, see the {{flag-color-extractor|flag color extractor}} and the {{brand-color-library|brand color library}}.",
    faqs: [
      {
        q: "Are these real eye colours?",
        a: "No. They are generated values chosen from the hue bands associated with irises, not measurements. Real iris colour varies across the surface of one eye and never appears as a single flat value.",
      },
      {
        q: "Why are the swatches darker than other themed palettes?",
        a: "Lightness is held between about 25 and 55 percent. That deeper band is what keeps the result reading as an eye rather than a pastel wall colour.",
      },
      {
        q: "Does Regenerate change the hues?",
        a: "No. Each of the five positions keeps its hue band and its place on the lightness ladder; only the saturation is re-rolled, so the character of the set stays stable.",
      },
      {
        q: "Is grey included?",
        a: "Not as its own band. The five cover blue, green, amber, violet and red, so greyish-brown iris colours sit between the bands rather than inside one of them.",
      },
      {
        q: "What does the eye color reference not do?",
        a: "That is a darker band than most of the other themed generators use, and it is what keeps the swatches reading as eyes rather than as pastels: a pale blue is a wall colour, while the blue here carries the depth of an iris in shadow. The third constraint is chroma, capped at about 0.16, so no swatch comes out fully satur",
      },
    ],
  },

  "eyedropper-tool": {
    keywords: [
      "eyedropper tool",
      "pick color from screen",
      "sample color from anywhere",
      "screen color picker tool",
      "hex color picker tool",
    ],
    intro:
      "The eyedropper tool samples any pixel on your screen using the browser's native EyeDropper API, returning the color as a hex value you can copy.",
    content:
      "The eyedropper tool is a single button and a result. Press Open eyedropper and the browser takes over: the cursor becomes a sampling target that you can move anywhere, over any application or window, not just this page. Click on a pixel and the tool fills a large swatch with the colour it found, along with the hex value and a copy button. Press Escape instead and nothing is picked, with a short cancelled message shown in place of a result.\n\nWhat the tool hands back is deliberately minimal:\n\n- One native EyeDropper call, where the browser takes over the cursor and can sample any window rather than only this page.\n- The result arrives as an sRGB hex value on a large swatch with a copy button.\n- Escape cancels instead of picking, leaving a short cancelled message in place of a result.\n\nThe mechanism behind it is the EyeDropper API, a browser-level sampling interface rather than a canvas trick. That distinction is the whole reason the tool is useful: because the browser is doing the sampling, it can read pixels outside the page — a desktop application, a video frame, a PDF, another browser tab — which no page-based colour picker can do. It also means the colour that comes back is the colour as rendered, after any display scaling and colour management the system has applied, which is usually what you want when matching something on screen.\n\nThe honest caveat is support. The API is implemented in the Chromium family — Chrome, Edge and Opera — and not in Firefox or Safari. The page detects this after loading and, where the API is missing, replaces the button with a plain statement of what to use instead. That detection is deliberately done on the client rather than during the render, so the page does not disagree with itself between the server and the browser.\n\nThe workflow is as direct as the tool. Open the dropper, move to whatever you are matching, click, and copy the value from the swatch. Because there is no intermediate state — no image upload, no zoom-and-click on a canvas — it is the right choice when the thing you are sampling is already on screen and you simply need its value. It is a poor choice when the source is a file on disk or a design asset, since there is nothing to sample until it is displayed.\n\nA couple of practical points:\n\n- The result arrives as a hex code and nothing else, so for rgb() or hsl() form the value goes through a converter.\n- Sampling a very small feature can be awkward at high display scaling, in which case zooming the source first helps.\n- Nothing can be sampled until it is displayed: a file on disk or a design asset has to be opened on screen first.\n\nAs a screen color picker tool it covers the case that image-based samplers cannot, and as a hex color picker tool it returns a value ready to paste. When you need to pick color from screen — matching an existing brand asset in another window, or grabbing a colour from a video — this is the shortest path available in a browser, and when you need to sample color from anywhere inside an uploaded image instead, the image colour picker is the tool to use.",
    howTo: [
      { step: "Press Open eyedropper; the cursor turns into a sampling target." },
      { step: "Move over whatever you are matching — any window, not just this page — and click the pixel." },
      { step: "Read the hex value from the large swatch and copy it." },
      { step: "Press Escape instead to cancel, which leaves nothing picked." },
    ],
    whenToUse:
      "Use this when the colour you need is already visible somewhere on screen and you want it as a value in one click. Use the image colour picker when you need to sample from an uploaded file, or the palette extractor when you want an image's several main colours rather than one pixel. For a file on disk the {{image-color-picker|image color picker}} samples an uploaded image, and the {{color-palette-extractor|palette extractor}} returns an image's main colors instead of one pixel.",
    faqs: [
      {
        q: "Which browsers support it?",
        a: "The EyeDropper API works in Chrome, Edge and Opera. Firefox and Safari do not implement it, and the page shows a message explaining that instead of a button when support is missing.",
      },
      {
        q: "Can I sample colours outside the browser window?",
        a: "Yes, and that is the advantage of using the native API. The browser performs the sampling, so you can pick from any application, video frame or document on screen.",
      },
      {
        q: "What happens if I press Escape?",
        a: "The pick is cancelled and no swatch appears. The page reports the cancellation in place of a result rather than leaving a stale value on screen.",
      },
      {
        q: "What format is the result?",
        a: "A hex code, shown on the swatch with a copy button. For rgb() or hsl() output, pass the hex through a converter afterwards.",
      },
      {
        q: "Can I sample a colour from a file that is not open on screen?",
        a: "No. The browser samples rendered pixels, so an image has to be displayed before it can be picked. For files, the image color picker reads an uploaded picture directly.",
      },
    ],
  },

  "figma-token-generator": {
    keywords: [
      "figma token generator",
      "figma color tokens",
      "figma tokens json",
      "export colors to figma",
      "figma variables colors",
    ],
    intro:
      "The figma token generator turns a list of named colors into a token JSON document, so a palette can be exported to Figma with the names you choose rather than positional keys.",
    content:
      "The figma token generator is a two-column tool: a list of name-and-colour rows on the left, and the JSON document they produce on the right. It starts with two rows, primary and danger, and the Add button appends further rows named color plus a number, seeded with a random colour. Every row has a text field for the name, a colour field for the value and a delete button, and the JSON regenerates as you type.\n\nWhat comes out is a small document with a single color group, and one entry per row keyed by the name you supplied. Each entry carries the value as an upper-case hex string and the type declared as color. That shape is the design-token interchange format: because each token declares its type, a consuming pipeline knows it is dealing with a colour and can transform it for whatever target it is writing, instead of passing a bare string along and guessing.\n\n- The naming field is what separates this tool from a palette exporter.\n- Palette exporters generate their keys from position — brand-1, brand-2 and so on — which is fast and produces a document that says nothing about meaning; here the key is whatever you type, so primary and danger arrive as primary and danger, and the token file reads like the naming convention the product already uses.\n- That makes it the right tool when the names exist already, in a brand guide or a Figma library, and the job is to transcribe them rather than invent them.\n\nMatch the names to how the receiving library is organised before you copy. A Figma variable collection typically groups colours by theme and role, so prefixing names consistently — surface, surface-muted, accent, accent-strong — keeps the import predictable and avoids a flat list of unrelated keys. There is no renaming inside the tool, so a name typed badly is a name regenerated; the document is small enough that re-typing a key is rarely a problem.\n\nTwo details to check against your pipeline. The emitted keys are the bare value and type pair, while the current draft of the format module prefixes them with a dollar sign as $value and $type; many tools accept both, while newer releases built on the draft expect the prefix, and a missing value error usually means that single character. There is also no validation beyond well-formed JSON: an empty name field produces an entry with a blank key, and duplicate names collapse into one entry because JSON objects cannot repeat a key.\n\n- What the tool does not cover is everything else a design system eventually needs — spacing, radii, typography, nesting and theme variants — and every entry it writes is typed as a colour.\n- Used as a figma token generator for a palette, though, it does the one job cleanly: name the colours, copy the figma tokens json, and the figma color tokens are ready to import as figma variables colors with the names already in place — which is what makes it the shortcut when the task is to export colors to figma from a design system that already has a vocabulary.",
    howTo: [
      { step: "Replace the default primary and danger names with the token names your library uses." },
      { step: "Set each value with the colour field, or add further rows with Add." },
      { step: "Copy the JSON document from the panel on the right." },
      { step: "Add the dollar prefix to value and type if your pipeline expects the current draft spelling." },
    ],
    whenToUse:
      "Use this when you already have token names and need them exported as a colour token document. Use the design token generator when you would rather start from a palette and accept positional keys, or the CSS variables exporter when you only need custom properties. A lighter name-and-value document for JavaScript is the {{color-json-generator|color JSON generator}}'s output, and a theme object written for a component library is what the {{chakra-ui-color-exporter|chakra ui color exporter}} produces.",
    faqs: [
      {
        q: "When should I use this instead of the design token generator?",
        a: "The document shape is the same. The difference is naming: here you type each token name, while the palette-based generator derives positional keys such as brand-1 from the swatch order.",
      },
      {
        q: "What if two rows have the same name?",
        a: "The later one wins, because JSON objects cannot hold duplicate keys. Name collisions are worth checking before the document leaves the tool.",
      },
      {
        q: "Does the output need the dollar prefix?",
        a: "The generator writes value and type. The current draft of the format module uses $value and $type, so add the prefix if your import expects the newer spelling.",
      },
      {
        q: "Can it export other token types?",
        a: "No. Every entry is declared as a color. Spacing, typography and numeric tokens are outside the scope of this page.",
      },
      {
        q: "Does the case of the names matter?",
        a: "Only to the destination — the keys are written exactly as typed, so kebab-case and camelCase round-trip alike. What matters is matching the vocabulary the library already uses, since the point is to transcribe names rather than invent them.",
      },
    ],
  },

  "flag-color-extractor": {
    keywords: [
      "flag color extractor",
      "flag colors with hex",
      "national flag color codes",
      "extract colors from flag",
      "country flag palettes",
    ],
    intro:
      "The flag color extractor lists the colors of eight national flags with the hex code for each, so a flag palette can be read or copied directly rather than picked by eye.",
    content:
      "- The flag color extractor presents eight flags as cards — the United States, Germany, Japan, Brazil, India, France, the United Kingdom and Italy.\n- Each card shows the flag's colours as a row of coloured bands, with the hex code for every band printed underneath in monospace and a copy button that takes the whole set at once.\n- There are no inputs: this is a reference, and the palette for each flag is fixed.\n\nThe bands are proportioned equally, which is a deliberate simplification rather than an error. A real flag alternates stripe widths and includes devices — crescents, stars, wheels, crosses — that no row of equal rectangles can represent. What the cards give you is the flag's palette and its order, which is what matters when the colours are being reused: the codes are the exact values, and the sequence tells you which colour leads.\n\nThe eight flags are also a useful reminder of how small the world's flag palette really is. Red, white and blue account for the great majority of them, and the differences lie in the specific reds and blues rather than in the hues themselves. Germany's black, red and gold is one of the few sets without white; Japan is a single red on white; Brazil stacks green, yellow, blue and white. Comparing them in one place makes it obvious how much character comes from the particular shade of a familiar hue — the deep navy of the Union Jack and the lighter blue of the French tricolour are the same colour in name only.\n\nIn practice the tool is used two ways. The first is as a source of a ready-made palette: a red, a white and a deep blue taken straight from a flag gives a palette with an unmistakable national character that has already been tested for legibility by a century of use, and the copy button takes the whole set into a project in one click. The second is verification — confirming that the blue you have been using matches the blue the flag actually specifies, which is a common problem when an asset has been resampled a few times.\n\nA word on the values themselves, because flag colours are less fixed than they look. What a flag looks like depends on the textile it is printed on, the dye batch and the light it is seen in, which is why national specifications usually give approximate references rather than exact codes. The hexes here are screen-appropriate interpretations of those references, chosen to look right on a display, and they are the ones you want for web and interface work rather than for print reproduction.\n\nThere is no export beyond copying the codes and no image input, so if the flag you need is not among the eight there is nothing to upload — the image colour picker or the palette extractor will read colours from a picture instead. Within those bounds, as a set of country flag palettes this is a quick way to get flag colors with hex, and as a source of national flag color codes it removes the guesswork from extract colors from flag work entirely.",
    howTo: [
      { step: "Find the flag card you want." },
      { step: "Read the swatch row: each flag's colours are shown side by side with their hex values beneath." },
      { step: "Copy the values you need for a project." },
      { step: "Remember the set is curated rather than searchable — eight flags are included." },
    ],
    whenToUse:
      "Use this when a design calls for a national palette — a sporting event, a travel or language feature, a localised campaign — and you want the codes rather than an approximation. Use the image colour picker or palette extractor when the flag you need is not in the list. For the neighbouring steps, see the {{brand-color-library|brand color library}} and the {{cultural-color-palettes|cultural color palettes}}.",
    faqs: [
      {
        q: "How many flags are included?",
        a: "Eight: the United States, Germany, Japan, Brazil, India, France, the United Kingdom and Italy. Each includes its full set of colours with hex codes.",
      },
      {
        q: "Are the stripe proportions accurate?",
        a: "No. The bands are shown at equal widths, so the cards convey each flag's palette and colour order rather than its geometry or devices.",
      },
      {
        q: "Can I copy a whole palette at once?",
        a: "Yes. The copy button on each card copies all of that flag's hex values in order, separated by spaces, so they can be pasted as a group.",
      },
      {
        q: "Why do the colours differ from an official specification?",
        a: "Because a flag's appearance depends on dye, fabric and lighting; specifications give approximate references. These are screen-appropriate values intended for web and interface use.",
      },
      {
        q: "Where does the flag color extractor stop short?",
        a: "There is no export beyond copying the codes and no image input, so if the flag you need is not among the eight there is nothing to upload — the image colour picker or the palette extractor will read colours from a picture instead. Within those bounds, as a set of country flag palettes this is a quick way to get flag co",
      },
    ],
  },

  "flutter-color-generator": {
    keywords: [
      "flutter color generator",
      "flutter color constants",
      "dart color from hex",
      "flutter colors class",
      "color 0xff",
    ],
    intro:
      "The flutter color generator converts named hex colors into Dart constants using the Color(0xFF...) form, ready to paste into a Flutter colors class.",
    content:
      "The flutter color generator takes a list of named colours and writes out one Dart line per entry. The default rows produce a line for primary and a line for danger, and the Add button appends further rows named color plus a number. Each row pairs a name field with a colour field and a delete button, and the output panel updates as you edit.\n\n- Each line takes the form of a static const Color declaration, with the name from the left of the row and the value converted into Flutter's ARGB integer literal.\n- That conversion is the part worth understanding: Dart's Color constructor takes a single thirty-two bit integer in which the first two hex digits carry the alpha channel, not a string.\n- Flutter's convention for an opaque colour is therefore a color 0xff prefix in front of the six hex digits, which is why the value you type as a six-digit hex becomes an eight-digit literal in the output.\n- Nothing is lost in the process — the alpha is simply made explicit.\n\nThe output is a set of declarations rather than a complete class. That is the right granularity for most projects: paste the lines inside the class you already keep for design tokens and they compile immediately, with no wrapper to reconcile and no naming scheme imposed. The names you type are the names in the code, so the token file and the call sites use the same vocabulary.\n\n- In use, the workflow is to type the token names in the left column in the same casing your project expects — lowerCamelCase is the Dart convention, so surfaceMuted rather than surface-muted — set each colour, then copy.\n- Because the output is one line per row, it can be pasted in pieces as a palette grows, and the six-digit values are the same ones you would get from a design file, which keeps the handoff honest.\n\nThere are real limits worth knowing. The alpha channel is always opaque, so translucent colours cannot be expressed here; Flutter handles those with a separate withOpacity call at the point of use. Only the ARGB hex form is produced, so there is no MaterialColor swatch with its shade map and no ThemeData scaffold — a Material palette is built from a seed colour rather than from a list of literals. The output is also not a complete Dart file: it has no class declaration, no imports and no closing brace, so it is a block of declarations to place rather than something to compile on its own.\n\nCompared with the other native exporters, this one is deliberately narrow — Android resources, iOS UIColor initialisers and Flutter constants each get their own page, sharing the same row interface. Used as a flutter color generator for a token list, it is the shortest route from hex values to the flutter color constants a project needs: type the names, read off the dart color from hex conversions, and copy the lines into your flutter colors class with the color 0xff form already written.",
    howTo: [
      { step: "Type the token names in the left column, using the casing your project expects." },
      { step: "Set each colour with the field beside its name, or add rows with Add." },
      { step: "Copy the declarations and paste them inside your existing colours class." },
    ],
    whenToUse:
      "Use this when a Flutter project needs a block of colour constants from a palette. Use the iOS or Android exporters for those platforms, or the design token generator when the colours need to travel as a document rather than as code. A JavaScript-side array of the same values is what the {{color-array-generator|color array generator}} writes, and handing the palette to a build step rather than to the editor is what the {{color-csv-exporter|color CSV exporter}} is for.",
    faqs: [
      {
        q: "Why does the output have eight hex digits?",
        a: "Dart's Color takes a single 32-bit integer, so the first two digits carry the alpha channel. The 0xff prefix means fully opaque, followed by the six digits of your colour.",
      },
      {
        q: "Can it generate a MaterialColor swatch?",
        a: "No. Only plain Color constants are emitted. A Material swatch with its shade map is built from a seed colour by Flutter's own theming rather than from a list of literals.",
      },
      {
        q: "Is the output a complete Dart file?",
        a: "No — it is a set of static const declarations with no class wrapper, imports or braces. Paste them inside the class that already holds your design tokens.",
      },
      {
        q: "Can the Flutter output carry an alpha channel?",
        a: "Not here. Every value is written opaque. For translucency, apply withOpacity at the call site or write the alpha digits into the literal by hand.",
      },
      {
        q: "Why do the names have to be valid Dart identifiers?",
        a: "Because each row becomes the identifier in a static const declaration — a hyphen or a space produces code that will not parse, even though nothing here validates it for you.",
      },
    ],
  },

  "focus-indicator-contrast-checker": {
    keywords: [
      "focus indicator contrast checker",
      "focus ring contrast",
      "3 to 1 focus contrast",
      "keyboard focus visibility",
    ],
    intro:
      "Focus Indicator Contrast Checker measures the color of a focus ring against the surface behind it and judges the pairing at 3 to 1.",
    content:
      "Focus Indicator Contrast Checker measures a focus ring against the surface it will appear on and reports the ratio to two decimal places, judged at 3 to 1. The sample draws the ring the way it is usually built, as a 2px outline in the indicator color around a control whose label uses that same color, so you can see the indicator and its surface together rather than as two swatches.\n\nThe check matters because keyboard focus is the one piece of interface state that some users cannot work without. Someone navigating by keyboard has no pointer to tell them where they are, so a focus ring that disappears against a background is not a cosmetic problem. The requirement it is measured against sits alongside the non-text contrast rule, which treats the indicator as part of the interface rather than as decoration.\n\nThree things have to hold for a focus indicator to be genuinely visible, and this page only measures the first:\n\n- The ring color against its surrounding surface, which is the 3 to 1 pairing this tool evaluates.\n- The ring against the component it surrounds, which is a different pair and is not measured here.\n- The ring's area or thickness, since a thin indicator can be lost even when the colors separate well.\n\nThe ratio comes from the standard WCAG 2.x calculation: both colors are converted to sRGB, their channels are linearised, and the linear values are weighted 0.2126 red, 0.7152 green and 0.0722 blue into a relative luminance. The lighter luminance plus 0.05 is divided by the darker plus 0.05, rounded to two decimals before comparison.\n\nThe limits here are practical rather than mathematical.\n\n- Only the ring against the background is measured. The ring against the component it wraps is a second pairing that the tool does not evaluate.\n- Thickness and area are not inputs, so a passing pair does not guarantee the indicator will be noticed.\n- One surface is measured at a time, but a control can sit on a card, on the page background and on a sticky header, and each is its own surface.\n- The tool cannot see whether something else overlaps the ring, which is a common cause of invisible focus in real pages.\n- No alpha and no third surface behind the pair.\n\nCheck the ring against every surface a control can land on, including the hover state of the row behind it, and against the component's own fill for the second pairing. If a single ring color cannot clear 3 to 1 everywhere, a common answer is to pair the ring with a contrasting outline offset so it carries its own background rather than relying on whatever is behind it.\n\nA useful habit is to treat 3 to 1 focus contrast as a floor rather than a goal, and to test keyboard focus visibility on the surfaces where a ring is most likely to be crowded out: table rows, selected list items and the primary action of a dialog. Those are the places where the indicator is drawn next to a colored fill rather than a neutral page, and they are where a ring that passes a focus ring contrast measurement in isolation still ends up hard to see. If one indicator has to work everywhere, give it a contrasting halo so it carries its own separation instead of borrowing it from whatever sits behind.",
    howTo: [
      { step: "Set the focus ring color in the first field, which is labelled Indicator." },
      { step: "Set the surface the control sits on in the second field." },
      { step: "Read the ratio at the top of the second panel, to two decimal places." },
      { step: "Check the Pass or Fail line against the 3 to 1 threshold, and read the sample to see the ring drawn as a 2px outline around a focused control." },
    ],
    whenToUse:
      "Use the focus indicator contrast checker for the ring that appears when a control is reached by keyboard, especially on controls that sit on more than one surface. The component's own boundary belongs with the {{ui-component-contrast-checker|UI component contrast checker}}, label legibility inside the control belongs with the {{wcag-21-aa-checker|WCAG 2.1 AA checker}}, and a whole interface where several indicators share one color is quicker to review with the {{palette-accessibility-checker|palette accessibility checker}}.",
    faqs: [
      {
        q: "Is 3 to 1 the official requirement for a focus indicator?",
        a: "It is the figure the non-text contrast rule applies to interface elements, and it is the accepted working target for focus indicators. This page applies it uniformly, which makes it stricter than any arrangement that allows a lower contrast when the indicator is thicker.",
      },
      {
        q: "My ring passes here but users still lose it. Why?",
        a: "Two common reasons. The ring may be too thin to notice at a normal viewing distance, or it may be drawn underneath a sticky element so the visible part is much smaller than designed. Check the ring's thickness and its stacking order, not just its color.",
      },
      {
        q: "Should the ring be measured against the control or the page?",
        a: "Both, in practice. This check covers the ring against the surface behind it. The ring against the control it wraps is a separate pair, and a ring that separates well from the page can still vanish against a saturated button fill.",
      },
      {
        q: "Do I need a separate check for dark mode?",
        a: "Yes. Dark mode is a different set of surfaces, so every pairing has to be measured again. A ring that clears 3 to 1 on a white page often fails against a dark card unless the color is changed.",
      },
      {
        q: "Is it acceptable to rely on a browser default focus ring?",
        a: "Often, yes, provided nothing in your stylesheet removes it. The default ring is designed to be visible, so if you restyle focus, the burden of proving the replacement reaches 3 to 1 falls on your own colors.",
      },
    ],
  },

  "forest-nature-palette-generator": {
    keywords: [
      "forest nature palette generator",
      "green color palette",
      "woodland palette",
      "deep natural greens",
    ],
    intro:
      "The forest nature palette generator turns a fixed green run — hues 120, 90, 70, 140 and 40 — into five deep natural greens along a lightness ramp from 0.3 to 0.6.",
    content:
      "The forest nature palette generator is the darkest preset in the themed family, and that is deliberate. Its hues are 120, 90, 70, 140 and 40 — a run that moves from true green through moss and olive to an earthy yellow-green — and its lightness climbs only from 0.3 to 0.6, so the strip lives where greens are dense. The first swatch is close to a canopy shadow, the last is a leaf in light, and the chroma of each is rolled between 0.08 and 0.16 on regenerate.\n\n- Five hues: 120, 90, 70, 140 and 40, in that order.\n- Lightness ramp: 0.3, 0.375, 0.45, 0.525 and 0.6.\n- Chroma: rolled per swatch within 0.08 to 0.16.\n- Output: five hex swatches and a copyable CSS custom-property block.\n\nBecause the ramp starts dark, this green color palette is unusually good at supplying surfaces. Deep green at 0.3 and 0.375 can carry light text, the middle values serve as borders and secondary surfaces, and the two lightest swatches work as accents or as marks on a dark background. That is the opposite of the coastal and light presets, which supply brightness first and leave the shadows to other tools — and it is the reason a woodland palette suits products that are read at night or used outdoors.\n\n- No blue or purple in the run, so the set cannot supply a cool neutral for text or an information colour.\n- The darkest swatches are still not near-black, so a true ink tone has to be added if the layout needs one.\n- Green is the palette's point, which makes it a poor fit for status colours: greens already mean success in most interfaces.\n- No preset selector, no alpha and no gradient output, only the hex tokens.\n\nGreen covers an unusually wide stretch of the visible gamut, spanning more chroma than any other hue family at the same lightness, so a low chroma ceiling is exactly what keeps deep natural greens from turning acidic. Capping chroma between 0.08 and 0.16 also holds every swatch inside the sRGB gamut at these lightness values, which is why the strip prints clean hex values without clipping — a claim the brighter presets cannot always make.\n\nUse it for surfaces in calm, earthy or outdoor products, for botanical branding, and for any interface that should feel like it is used by lamp light rather than by daylight. The earth-tone generator pairs naturally with it for warm accents, the dark-mode generator supplies a cooler near-black when the layout needs one, and the light-mode generator is the place to look if the palette instead has to sit around a bright surface. One caution in the other direction: a green set is a commitment, since most interfaces already use green to mean success, so keep the palette's middle values away from status work. Two of the five — the olive at hue 70 and the yellow-green at 40 — also read as yellowish rather than green at small sizes, so they work better as accents than as the palette's identity.",
    howTo: [
      { step: "Open the page for the initial forest roll." },
      { step: "Press Regenerate to re-roll chroma while the green run and the dark ramp stay fixed." },
      { step: "Copy the CSS block for tokens, or pick individual hex values from the swatches." },
      { step: "Assign the two darkest swatches to surfaces and the lightest to marks and accents." },
    ],
    whenToUse:
      "Use this when a palette should feel wooded, quiet and dark rather than bright. The {{earth-tone-palette-generator|earth palette generator}} supplies the warm accents this run lacks, the {{dark-mode-palette-generator|dark mode palette generator}} covers the deeper surfaces a layout may still need, and the {{light-mode-palette-generator|light mode palette generator}} answers the opposite brief.",
    faqs: [
      {
        q: "Why is this palette darker than the other themed pages?",
        a: "Its lightness ramp runs from 0.3 to 0.6 rather than into the 0.7 to 0.85 range, which is what gives it usable surfaces instead of light accents.",
      },
      {
        q: "Does it include any cool colour?",
        a: "No. The run is greens and yellow-greens only, so a cool neutral for text has to come from another tool or from a neutral built off one of these hues.",
      },
      {
        q: "What changes on Regenerate?",
        a: "Chroma only, rolled between 0.08 and 0.16 for each swatch. Hue order and the lightness ramp are fixed parts of the preset.",
      },
      {
        q: "Can I use a green from this set for a success state?",
        a: "Better not, unless the whole interface is green. In most products green already communicates success, so a green status colour made from this palette would collide with the brand.",
      },
      {
        q: "Is the lightest green usable as text on the darkest one?",
        a: "Probably, since the ramp spans 0.3 to 0.6, but measure it: the contrast checker answers that question properly, and the pair is inside the palette so it is easy to test.",
      },
    ],
  },
};
