import { PRIVACY_SECURITY_TEXT } from "../privacy";
import type { ToolSeoEntry } from "../tool-seo";

/** Racira Fonts SEO content — batch 3 (CSS & web, decorative, preview). */
export const typographySeoBatch3: Record<string, ToolSeoEntry> = {
  "css-font-stack-builder": {
    keywords: [
      "css font stack builder",
      "fallback chain",
      "generic family",
      "emoji fallback",
    ],
    intro:
      "The CSS font stack builder assembles a font-family declaration in the order it is read: primary face, optional second face, generic family, and an optional emoji tail. The chain only ever shows itself when something is missing, which is exactly when it matters.",
    content:
      "The CSS font stack builder assembles a font-family declaration from four slots and previews it on real text. The order is the whole structure, and each slot has a job.\n\n- Primary face, chosen from the catalogue and quoted with its own stack, so the declaration can be pasted into any project.\n- An optional second face for the fallback chain, reduced to a bare family name so it does not drag the first face's generic families along with it.\n- The generic family last, which is the promise the browser can always keep: sans-serif, serif, monospace, system-ui or cursive.\n- An optional emoji fallback of three colour-emoji families, appended after the generic family so a glyph that no text face carries still renders as an emoji.\n\nA font stack is read left to right, and each entry is tried per character rather than per page. That is why the chain is invisible most of the time and suddenly visible in three situations: the primary face has not loaded yet, it is missing a glyph the copy needs, or it fails to load at all. The generic family at the end is not decoration — it is the entry that decides which metric the browser falls back to, so choosing serif under a sans primary produces a visibly different page during the swap period.\n\nThe panel reports the face count, the terminal family and the primary face's category, which together answer the question the declaration raises: how far does this chain have to stretch. The emoji tail is a good example of a decision that costs nothing when it is not needed and rescues a page when it is: a dingbat, a flag or a pictogram outside the text face renders as a coloured glyph rather than a blank box. The exported declaration is a single font-family line, and the preview shows the stack at two sizes, since a fallback that reads acceptably at 28 pixels can look wrong at 15.\n\nFour limits come with a one-line declaration, and each one explains why a particular problem moves to another tool.\n\n- It cannot express a unicode-range, so a stack cannot tell the browser which characters should come from which face; that belongs in the at-rules for the webfont.\n- It offers no metrics matching, so a fallback with different proportions still shifts the layout when the primary lands, which is a job for the size-adjust descriptor.\n- The catalogue is the only source of faces, so a project with a licensed family pastes the declaration and edits the first entry by hand.\n- The emoji fallback is all or nothing: three entries are added or none, so a page that needs a single symbol family carries the whole group.\n- Nothing limits the length of the chain, and a stack can grow until no one can say what each entry contributes, which is the failure this tool exists to make visible.\n\nWhat it does not need to do is verify anything: the declaration is valid CSS whatever the faces are, and the browser resolves it at render time. The discipline is in the order and in quoting names that contain spaces or a reserved word, which is the one place a hand-written stack usually breaks.",
    howTo: [
      { step: "Choose the primary face and note the category the panel reports, since that is the metric the generic family should match." },
      { step: "Add a second face only if there is a specific gap to fill, and check the face count readout rather than extending the chain for its own sake." },
      { step: "Set the generic family to match the primary's category, then decide whether the emoji fallback is worth its three entries." },
      { step: "Copy the declaration and paste it into the stylesheet, then confirm in the browser that a missing glyph and a blocked webfont both land where the chain intends." },
    ],
    whenToUse:
      "Reach for it when a font stack has grown by accident and nobody can say what each entry is for, when a page shows blank boxes for a symbol the text face lacks, or when a webfont swap has to be made less jarring and the generic family is the only lever available. The order is the transferable lesson. For the metric matching that removes the jump, the {{css-variable-font-builder|CSS variable font builder}} covers size-adjust; the {{system-font-stack-generator|system font stack generator}} builds the zero-download alternative, and the {{font-face-generator|font-face generator}} writes the declarations the stack refers to.",
    faqs: [
      {
        q: "How does a browser choose from a font stack?",
        a: "Per character and left to right. For each glyph the browser tries the first family, then the next, and so on until one resolves; the generic family at the end guarantees that something always does. That is why a stack can look correct for months and then show a fallback for a single character.",
      },
      {
        q: "Why put the generic family last?",
        a: "Because everything after it is unreachable. A generic family always resolves, so an entry listed after sans-serif never gets a chance. That is also why the emoji tail is appended after the generic family in this tool: the emoji families are reached for characters the earlier entries cannot supply.",
      },
      {
        q: "What does the emoji fallback add?",
        a: "Three colour-emoji families appended to the chain. Without them a pictogram outside the text face can render as a blank box, depending on the platform. With them the character resolves to a coloured glyph, at the cost of three entries that most stacks never need to use.",
      },
      {
        q: "Does the fallback affect layout?",
        a: "It can. Each family has its own metrics, so text rendered in the second face occupies different line lengths and heights from the same text in the first. Matching those metrics is what the size-adjust descriptor is for; a stack cannot do it, since the chain has no place to state a size adjustment.",
      },
      {
        q: "When do I need to quote a family name?",
        a: "Whenever the name contains a space or a word that could be read as a keyword. Quoting is always safe, so the tool quotes every named family. The one case worth care is a name that also matches a generic family, such as a family literally called monospace, which needs quoting to be treated as a name.",
      },
    ],
  },

  "system-font-stack-generator": {
    keywords: [
      "system font stack generator",
      "system-ui",
      "local fonts",
      "generic family",
    ],
    intro:
      "The system font stack generator writes zero-download stacks built from faces already installed on macOS, iOS, Windows, Android and Linux. Every non-generic entry is a real shipped system face, and the terminal generic keeps the stack working on anything not covered.",
    content:
      "The system font stack generator produces stacks that ask for nothing over the network, using only local fonts the operating system already has. That removes the download, the flash of unstyled text and the third-party connection in one decision, at the cost of the exact face being different on each platform.\n\nSix presets cover the common cases, and each one is a real stack rather than a description.\n\n- Modern UI leads with system-ui and -apple-system, then Segoe UI, Roboto, Helvetica Neue, Arial and Noto Sans before the generic, so each platform gets its own interface face.\n- Humanist uses Segoe UI, Helvetica Neue, Lucida Grande, Tahoma and Verdana for open apertures and a warmer voice than the default interface face.\n- Neo-grotesque runs Helvetica Neue, Helvetica, Arial and Liberation Sans, which is tight, neutral and predictable for dense interfaces.\n- Transitional serif stacks Charter, Bitstream Charter, Sitka Text, Cambria and Georgia, so a serif body text is available with no webfont at all.\n- Slab serif uses Roboto Slab, Rockwell and Courier New, the least reliably installed of the six and best treated as a display flavour.\n- Monospace leads with ui-monospace and SFMono-Regular, then SF Mono, Menlo, Consolas and Liberation Mono, which is where integer metrics matter for code and tabular data.\n\nThe panel reports the face count, the terminal generic family and, pointedly, zero network requests. For a design that has to survive offline, a locked-down device or a proxy that blocks font hosts, that is not a performance preference but the only kind of stack that renders at all. The last of those is the whole proposition: nothing about the first paint waits for a font, and no third-party host sits on the critical path. The trade is that the design is not identical between platforms, which is the intended behaviour of a system stack rather than a defect. The rendered face depends on the machine, and the preview says so under the sample, since the same page on a Mac and on Windows will show different letterforms two entries down the same stack.\n\nThree limits follow from the approach, and all three are consequences of choosing local fonts.\n\n- Metrics differ between the faces in a stack, so line breaks and block heights move between platforms, and no size-adjust is available here because there is no webfont to match against.\n- The terminal generic family decides the worst case, so a stack that ends in monospace makes a strong promise about anything unusual.\n- Name availability varies by version as well as by platform, so the least common entry in a stack can be years old on some machines and absent on others.\n- Nothing can be preloaded, since there is nothing to fetch, so the stack cannot be tuned for a faster first paint — it is already the fastest option available.\n- A stack is a single declaration with no at-rules behind it, which is why it is fast and also why it cannot express a weight, a style or a character range.",
    howTo: [
      { step: "Choose the preset that matches the voice the interface needs, then read the stack and confirm each entry is one you recognise as a shipped system face." },
      { step: "Check the terminal generic family, since that is what renders for a visitor whose platform has none of the named faces." },
      { step: "Type a sample line and compare the two preview sizes, remembering that the rendering you see is your own platform's." },
      { step: "Copy the declaration and, if the design depends on line breaks, verify the layout on a second operating system before shipping." },
    ],
    whenToUse:
      "Reach for it when a page has no design reason to ship a webfont, when the first paint matters more than platform-identical letterforms, or when a project needs a serif or monospace voice without adding a single request. Zero requests is a design decision, not a compromise. Where exact letterforms do matter, the {{css-font-stack-builder|CSS font stack builder}} writes the chain around a chosen face, the {{font-loading-strategy-builder|font loading strategy builder}} budgets the files that follow, and the {{css-variable-font-builder|CSS variable font builder}} matches the fallback metrics so a swapped-in webfont does not move the layout.",
    faqs: [
      {
        q: "Does a system stack really make no requests?",
        a: "None for the font itself. Every named entry is a face the operating system already ships, so the browser resolves the stack locally. There is no stylesheet, no font file and no third-party host involved, which removes both the download and the connection from the critical path.",
      },
      {
        q: "Why does the design look different on another computer?",
        a: "Because the stack resolves to whatever that platform has installed, which is the point of the approach. A modern interface face on Windows and on macOS are different typefaces by design, each drawn for its platform's rendering. The layout is consistent while the letterforms are not.",
      },
      {
        q: "What does system-ui resolve to?",
        a: "The operating system's own interface face, which is the safest single entry in a stack: on platforms that support it, it always resolves and always matches the surrounding interface. Its metrics differ from the named faces that follow it, so it is best used as the first entry rather than as a fallback.",
      },
      {
        q: "Can I combine a system stack with a webfont?",
        a: "Yes, and that is a common production arrangement: the system entry renders immediately while the webfont loads, then the webfont takes over. For it to work without a visible jump, the fallback metrics need matching with size-adjust, which the variable font builder covers, since a system stack on its own cannot express that adjustment.",
      },
      {
        q: "Which of the presets is least reliable?",
        a: "The slab serif, because Rockwell ships with some Windows editions and not others and Courier New is not a slab. Treat it as a display flavour with a monospace terminal rather than as a body stack, and check the rendering on the platforms the product actually supports.",
      },
    ],
  },

  "font-face-generator": {
    keywords: [
      "@font-face generator",
      "font-display",
      "unicode-range",
      "src descriptor",
    ],
    intro:
      "The @font-face generator writes the declaration a webfont actually needs: a local source first, a file second, and the weight, style, display and character-range fields that decide how it loads. The descriptors are what separate a working declaration from one that downloads on every page view.",
    content:
      "The @font-face generator builds a complete declaration and the matching usage rule, with the fields that change behaviour rather than the ones that merely satisfy a validator.\n\nThe descriptors it writes, and what each one decides:\n\n- Font family and an optional local source, listed first so a locally installed copy is used without a download when one exists.\n- The file URL with its format, offered as woff2, woff, truetype or opentype, with woff2 first in the list because of its size advantage.\n- The weight, which accepts a single value or a two-value range — a range is how one variable file covers several weights.\n- The style, normal, italic or oblique, which has to match the style the text asks for or the browser synthesises a slant instead.\n- The display policy, from swap, fallback, optional, block and auto, and an optional unicode-range that scopes the descriptor to a subset of characters.\n\nThe loading trade-off is reported beside the font-display choice, because font-display is the descriptor with a visible cost. Swap keeps text visible from the first paint and accepts a re-render when the webfont lands, which is the usual choice for body copy. Block hides the text for a short period and then paints the real face, which suits a logo and harms a paragraph. Optional gives the file a very short window and then never uses it for that page view, which removes layout shift entirely at the cost of the webfont often not appearing at all on a slow connection. Auto leaves the decision to the browser and is the least predictable of the five.\n\nTwo details deserve attention because they cause most of the confusion, and both live in the src descriptor. Listing a local source first is a performance win and a testing hazard: a developer with the family installed never sees the download, so the file path can be broken for weeks without anyone noticing. And a unicode-range only prevents a download when the referenced file is genuinely a subset; writing a range beside a full font file changes nothing about the bytes the page fetches, it only scopes which characters the declaration claims.\n\nWhat the generator leaves out is also a choice, and each omission points at a different follow-up.\n\n- It writes one file source, so a format chain for older browsers has to be assembled by hand and the woff2 preference is assumed rather than negotiated.\n- It does not emit the size-adjust or ascent-override descriptors that remove layout shift in a fallback, which belong with a stack rather than with a single face.\n- It cannot verify that the URL resolves, so a typo in the path produces a declaration that fails silently and shows the fallback face.\n- It does not check that a unicode-range matches the characters the subset file really contains, which is the difference between a scoped download and a request that quietly fetches a different file.\n- It generates no preload hint, so a file that is needed above the fold still waits for the stylesheet to be parsed before the browser learns about it.",
    howTo: [
      { step: "Enter the family name and the local name, keeping the local source first so an installed copy avoids the download." },
      { step: "Add the file URL and format, then set the weight and style to match the rules that will request the face." },
      { step: "Choose the display policy from the trade-off readout rather than by habit, and add a character range only if the file is a real subset." },
      { step: "Copy both outputs, then test with the local copy removed so the downloaded path is actually exercised." },
    ],
    whenToUse:
      "Reach for it when a webfont has to be declared correctly the first time, when text is invisible for a moment on load and the display policy needs revisiting, or when a declaration has to be audited for the fields that decide whether it downloads at all. The trade-off readout is the quickest way to explain font-display to someone who has never met it. For the fallback metrics that remove the jump, the {{css-variable-font-builder|CSS variable font builder}} covers size-adjust, the {{font-loading-strategy-builder|font loading strategy builder}} decides how many files to serve, and the {{css-font-stack-builder|CSS font stack builder}} writes the chain the usage rule joins.",
    faqs: [
      {
        q: "Why list a local source before the file?",
        a: "Because it avoids a download for anyone who already has the family installed, and it makes the webfont optional rather than mandatory. The trade-off is that a developer with the family installed will not notice a broken file path, so the downloaded route has to be tested deliberately by removing the local entry.",
      },
      {
        q: "Which font-display value should I use?",
        a: "For body copy, swap: text is visible immediately and one re-render is acceptable. For a logo or a short display line, block can be defensible since a brief invisibility is less disruptive than a visible swap. Optional removes layout shift entirely but on a slow connection the webfont may never appear for that page view.",
      },
      {
        q: "Does a unicode range reduce the download?",
        a: "Only when the file itself is a subset. The descriptor tells the browser which characters this declaration covers, so a page that needs none of them inside the range never fetches the file. Pointing a range at a full font file still transfers the whole file once it is used.",
      },
      {
        q: "Can one declaration cover several weights?",
        a: "Yes, with a weight range. A variable file declared with a range from 100 to 900 serves every weight in between, and the text requests them with ordinary font-weight values. A static file, in contrast, needs one declaration per weight, which is why the row count and the file count grow together.",
      },
      {
        q: "What if the font arrives as several formats?",
        a: "The generator writes one file source, since modern browsers all accept woff2. A chain for older engines has to be assembled by hand, listing each source with its format so the browser picks the first it understands. In practice the extra formats are rarely worth the complexity today.",
      },
    ],
  },

  "google-fonts-css-generator": {
    keywords: [
      "google fonts css generator",
      "css2 api",
      "preconnect",
      "ital,wght",
    ],
    intro:
      "The Google Fonts CSS generator turns a family and weight selection into a valid CSS2 API URL, the link tags that use it, and the CSS that applies the result. The ordering rules it implements are the ones the API actually enforces.",
    content:
      "The Google Fonts CSS generator builds a CSS2 API URL from a list of families, a set of weights and a display policy, then writes the link tags and the usage rules that go with it. The URL has rules that are easy to get wrong by hand, and the tool encodes them.\n\nThe encoding rules the generator applies:\n\n- Family names are joined with plus signs, and each family becomes its own parameter in the query string.\n- Weight tuples are sorted ascending, because the API requires the order it documents and rejects a list that arrives shuffled.\n- Italic styles are expressed as ital,wght tuples, sorted first by the italic flag and then by weight, so a normal 400 and an italic 400 are two distinct entries.\n- The display parameter is appended once for the whole request, not per family.\n\nThe sorting rule is the one that costs people time, because a hand-written URL usually works until a weight is added and then starts returning an error with no useful message. The generator reports the number of families, the number of weight tuples and the length of the resulting URL, and the last of those is a rough proxy for the cost of the request: a URL asking for four families across five weights is describing a lot of files, even though it is a single link tag.\n\nAlongside the URL, the tool writes the tags to paste into the document head. Two preconnect hints come first, one for the stylesheet host and one for the file host with the crossorigin attribute, and the stylesheet link follows. The preconnects are not decoration: without them the browser discovers the font host only after parsing the stylesheet, which puts a DNS and TLS handshake on the critical path at the worst possible moment. The usage block then writes one declaration per family, choosing a monospace fallback when the family name contains mono and a sans-serif one otherwise, which is a guess rather than a measurement but a better default than nothing. A family whose name contains a space is quoted in the declaration, which is the detail a hand-written usage rule most often misses.\n\nThe request has limits that the API itself does not have, and they are worth knowing before the URL is pasted.\n\n- No variable axes or optical sizing can be requested, so a variable family has to be specified weight by weight, which costs more files for the same visual result.\n- There is no text parameter, so a request cannot be subset to the characters a page actually uses — a technique that makes the smallest possible download for a heading-only face.\n- The weight list holds five values from 300 to 700, which covers most interface work but not a family whose light or black weights are the point.\n- Nothing validates a family name against the service, so a typo produces a URL that fails at runtime with the fallback silently appearing instead.\n- The usage declarations guess their generic family from the name, which is a reasonable default rather than a match for the project's own stack.",
    howTo: [
      { step: "Enter one family name per line, taking names from the suggested list unless the family is known to exist on the service." },
      { step: "Select the weights, and include italics only when an italic style is genuinely used, since each one adds tuples to the request." },
      { step: "Choose the display policy, then copy the three head tags in order so the preconnects come before the stylesheet link." },
      { step: "Paste the usage declarations and replace the guessed generic family with one that matches the design's fallback stack." },
    ],
    whenToUse:
      "Reach for it when a Google Fonts request has to be written correctly rather than by trial and error, when a stylesheet link is returning an error after someone added a weight, or when a page needs the preconnect pair explained and placed. The ordering rules are the part that saves a debugging session. For self-hosted files instead of a hosted request, the {{font-face-generator|font-face generator}} writes the declarations and the {{font-loading-strategy-builder|font loading strategy builder}} sets the budget; to choose the faces themselves, the {{font-pairing-suggester|font pairing suggester}} and the {{google-fonts-pairing-picker|Google Fonts pairing picker}} work on the same catalogue.",
    faqs: [
      {
        q: "Why does the order of weights matter in the URL?",
        a: "Because the API expects tuples in a documented order — italic flag first, then weight, both ascending — and rejects a request that does not match rather than sorting it for you. A hand-written URL often survives until a second weight is added, which is why the failure looks sudden.",
      },
      {
        q: "What are the preconnect hints for?",
        a: "They open the connection to the font hosts before the browser reaches the stylesheet that names them. Without them, the DNS lookup and TLS handshake to the font host happen after the CSS is parsed, which delays the font on exactly the first paint where it matters. One hint is for the CSS host and one for the file host.",
      },
      {
        q: "Can I request a variable font this way?",
        a: "The API supports it, but this tool does not, since it builds weight tuples from a fixed list. A variable family requested through the API still arrives as a range when the URL is written by hand; in this generator the alternative is to specify each weight individually, which costs more files for the same visual result.",
      },
      {
        q: "Does adding families make the page slower?",
        a: "It adds files, not link tags. The URL length readout is a hint rather than a measurement: what actually matters is how many weights across how many families the request describes, since each combination is a separate download. Two families at two weights is a reasonable budget; four families at five weights is not.",
      },
      {
        q: "What happens if a family name is misspelled?",
        a: "The stylesheet request fails and the browser falls back, usually with no visible error apart from the wrong typeface. Nothing in the tool checks the name against the service, so the suggested list or a quick check of the rendered page is the only verification before it ships.",
      },
    ],
  },

  "css-clamp-calculator": {
    keywords: [
      "css clamp calculator",
      "intercept",
      "preferred value",
      "viewport endpoints",
    ],
    intro:
      "The CSS clamp calculator draws the straight line between two sizes at two viewport widths and writes the declaration that follows it. It also shows what the line does at five points across the range, which is where a wrong endpoint becomes obvious.",
    content:
      "The CSS clamp calculator takes two sizes and two viewport endpoints and returns the clamp declaration that interpolates between them, with every intermediate value printed. It is the single-value version of a fluid scale, and the place to get the arithmetic right before a scale depends on it.\n\nThe result comes with four readouts that make the line inspectable.\n\n- The slope, given both as pixels per pixel of viewport and in viewport units per hundred, which is the figure that goes into the declaration.\n- The intercept in pixels, which is the size at a viewport of zero before the bounds cut the line off.\n- The preferred value, written as an intercept in rem plus a slope in viewport units, which is the middle term of the clamp.\n- The growth across the range, which is simply the maximum size minus the minimum and is the figure to sanity-check first.\n\nA behaviour table then evaluates the line at nought, a quarter, a half, three quarters and all of the range. For each point it prints the viewport width, the value the line would give, the value after clamping, and whether the result is pinned or fluid. The two ends are pinned by definition, and the middle three are where a mistake shows: if the linear value at three quarters of the range is already above the maximum, the desktop endpoint is set too low and the type stops growing early. Comparing the linear column with the rendered column also shows how much of the range is actually spent in motion rather than pinned at a bound.\n\nThe arithmetic has one safeguard built in: the calculator refuses to produce a line unless the maximum viewport is larger than the minimum and the maximum size is at least the minimum size. Without that, a slope would run backwards and the clamp would snap between its bounds instead of interpolating. The exported CSS also carries a plain pixel fallback before the clamp declaration, so an engine without clamp support gets a sensible middle size rather than the minimum or nothing at all, and the pixel variant is offered separately for projects that only need the fixed value.\n\nFour limits are worth knowing before the declaration ships.\n\n- The line is straight: there is no easing, so a design that wants type to accelerate in the middle needs two clamps across two ranges rather than one.\n- The declaration responds to the viewport rather than to the component's container, so a value inside a narrow column still grows with the window; a container query is the tool for that case.\n- The rem-based intercept assumes a sixteen-pixel root, so a project with a different root shifts the fixed part of every preferred value.\n- Nothing here knows what the right endpoints are. The arithmetic is exact and the design decision is yours, which is the honest division of labour, and the behaviour table is there so the endpoints can at least be checked after the fact.",
    howTo: [
      { step: "Enter the minimum and maximum sizes first, since their difference is the total growth and the figure to sanity-check against the design." },
      { step: "Enter the two viewport endpoints, ensuring the maximum is the larger and that both match real breakpoints in the design." },
      { step: "Read the slope, intercept and preferred value, then use the behaviour table to confirm the value is still fluid in the middle of the range." },
      { step: "Copy the CSS with its pixel fallback, or the pixel variant alone when the value does not need to grow." },
    ],
    whenToUse:
      "Reach for it when one value has to grow between two viewports and the arithmetic should be right the first time, when a clamp declaration is suspected of pinning too early, or when a fluid scale built elsewhere needs its individual steps checked. The behaviour table is the diagnostic. For a whole scale in one pass, the {{css-fluid-typography-builder|CSS fluid typography builder}} derives every step; the {{type-scale-generator|type scale generator}} gives the fixed sizes the endpoints come from, and the {{baseline-grid-calculator|baseline grid calculator}} checks what the resulting line boxes do to a vertical grid.",
    faqs: [
      {
        q: "What does the preferred value mean?",
        a: "It is the middle term of the clamp: a fixed size in rem plus a rate of growth in viewport units. Between the two viewport endpoints that expression is the whole story, and outside them the clamp's own bound takes over. Writing the fixed part in rem is what lets it respect a visitor's font-size setting.",
      },
      {
        q: "How can I tell if the endpoints are wrong?",
        a: "Read the behaviour table. If the clamped value stops changing before the last row, the maximum size is reached too early and the upper viewport is set too low. If the value is still at its minimum by the middle row, the growth is too slow or the lower endpoint is too wide.",
      },
      {
        q: "Why include a pixel fallback?",
        a: "Because the declaration is ignored wholesale by an engine that does not parse clamp, and the fallback keeps the type at a sensible middle size in that case. It costs one extra line. The separate pixel variant exists for projects that genuinely do not want any growth and only need the computed value.",
      },
      {
        q: "Can clamp replace media queries entirely?",
        a: "For a single value, effectively yes: one declaration covers the range. What it cannot do is respond to the space a component actually has, since viewport units describe the window rather than the box. When a heading sits inside a narrow column on a wide screen, a container query is the correct tool and clamp is not.",
      },
      {
        q: "What range of sizes suits a clamp?",
        a: "It suits any range where linear growth looks natural, which is most body and heading sizes. Very large display sizes often want a sublinear ramp, since the perceived difference between 96 and 128 pixels is smaller than between 16 and 21. When the growth has to slow at the top, split the range and clamp each half.",
      },
    ],
  },

  "text-shadow-builder": {
    keywords: [
      "text shadow builder",
      "text-shadow",
      "blur radius",
      "layers",
    ],
    intro:
      "The text shadow builder stacks layers, because every convincing shadow is a stack rather than a single offset. Each layer carries its own offsets, blur radius and colour, and the declaration is written in the same order the CSS paints it.",
    content:
      "The text shadow builder assembles a text-shadow declaration from a list of layers, previews it on real text and exports the exact CSS. Layers rather than presets is the choice that matters: a single shadow can give definition or depth, and only a stack gives both.\n\nEach layer carries four values and one of them is the reason the effect reads as depth.\n\n- Offset X and offset Y, each from minus 40 to 40 pixels, which place the layer relative to the letterform.\n- Blur radius from 0 to 60 pixels, where a hard edge and a soft halo are the two ends of the scale.\n- A colour, entered as a text field that accepts alpha — the same hex value with a two-digit alpha suffix keeps the layer from turning solid where layers overlap.\n- The layer order itself, since the first layer listed paints on top.\n\nThe order explains the standard recipe: a small offset with a tight blur and a strong colour goes first to sharpen the letter's edge against the background, and a larger offset with a wide blur and a partly transparent colour goes second to suggest the letter lifting off the surface. Reversed, the wide soft layer sits over the sharp one and the edge disappears. Alpha is the other half of the technique: two overlapping opaque layers produce a second copy of the text, while partly transparent layers accumulate into a gradient that reads as depth.\n\nThe panel also reports the declaration length, which is a rough proxy for how far the effect has travelled from a single value, and shows the layer count. Text, size from 16 to 96 pixels and weight are all adjustable, and the preview sits on a background colour you choose, since a shadow tuned on white can vanish on a dark surface. Two limitations are built into the model: values are absolute pixels, so a shadow tuned at 48 pixels becomes a disproportionate blur when the same class is applied at 16; and nothing reports the paint cost, which matters when a heavy stack sits on an element that animates.\n\nFive things are deliberately left to the component the declaration lands in.\n\n- There is no stroked or outlined letter beneath the shadow, though the two properties coexist when both are applied to the same text.\n- There is no per-character variation, so a shadow that changes along a word is a drawing exercise rather than a declaration.\n- Nothing reports the paint cost, which matters most when a heavy stack sits on an element that animates or scrolls.\n- The preview renders a single line, so a stack that behaves well on one line is not tested for how it accumulates across a paragraph.\n- The colour input is a text field: a value the browser cannot parse is skipped silently and that layer simply stops contributing to the effect.\n\nTreat the declaration as the mechanical part of the treatment, and make the surrounding decisions — size, weight, background and any outline — where the text actually lives.",
    howTo: [
      { step: "Start with the two default layers and read the preview, since they already demonstrate the sharp-plus-soft pairing most effects need." },
      { step: "Set the text, its size and the background colour before tuning the layers, because both change how much shadow the eye can read." },
      { step: "Adjust each layer's offsets and blur radius, adding an alpha value to the colour where layers overlap, and add or remove layers as the effect requires." },
      { step: "Copy the CSS and decide whether the values should become size-relative, since the declaration is written in fixed pixels." },
    ],
    whenToUse:
      "Reach for it when a heading needs depth and a single offset looks flat, when an existing shadow has turned into an unreadable smear, or when several layers of a live effect have to be documented as one declaration. Layer order is the part worth remembering. For an edge rather than a shadow the {{outlined-text-generator|outlined text generator}} draws a stroke, for an extrusion the {{3d-text-effect-preview|3D text effect preview}} stacks hard shadows, and for a glow the {{neon-text-previewer|neon text previewer}} layers colour around a bright core.",
    faqs: [
      {
        q: "Why does layer order matter in a text shadow?",
        a: "Because the first layer listed paints on top. A tight, strong layer above a wide, faint one gives a crisp edge with depth behind it; the same two layers in the opposite order bury the edge under the soft one. That is why the default stack starts with the definition layer and ends with the depth layer.",
      },
      {
        q: "Why use colours with alpha in the layers?",
        a: "So overlapping layers build up gradually instead of turning into a solid block. Two opaque shadows over the same letter look like two copies of the word, while partly transparent layers let the overlap read as a shadow falling away from the letters. The text colour field accepts the eight-digit hex form for exactly that.",
      },
      {
        q: "Should the blur radius scale with the text size?",
        a: "Yes. A blur of 8 pixels is a soft halo on a 16 pixel label and an invisible detail on a 72 pixel heading, so the same declaration reads differently at each size. Converting the offsets and the blur to values derived from the font size is how one effect survives a responsive scale.",
      },
      {
        q: "Does a text shadow affect layout?",
        a: "Not for the element itself: the shadow is painted outside the box and does not change its size, so nothing reflows. It can, however, overflow a container with overflow hidden, and it does contribute to the area the browser has to composite, which is the cost to watch on animated elements.",
      },
      {
        q: "Can I combine a shadow with an outline?",
        a: "Yes, and the two properties coexist: the stroke draws the letter's edge while the shadow layers sit behind it. The tool covers only the shadow half, so the outline is applied where the CSS is used. Keep the stroke's paint order in mind, since a stroke painted over the fill erodes the letterform.",
      },
    ],
  },

  "outlined-text-generator": {
    keywords: [
      "outlined text generator",
      "text stroke",
      "paint order",
      "hollow text",
    ],
    intro:
      "The outlined text generator produces hollow lettering with CSS, where the outline is drawn by a text stroke and the paint order keeps that stroke from eating into the glyph. The paint order is the part that makes thick outlines look right rather than eroded.",
    content:
      "The outlined text generator takes a string, a size, a text stroke width and two or three colours, then renders the result and exports the CSS that produces it.\n\n- The stroke width runs from half a pixel to 8px, reported both in pixels and as a percentage of the em so the weight of the outline can be related to the type size.\n- The fill can be transparent for a hollow letter, white, near-black or amber, and the background is a separate colour so the hollow can be judged against the surface it sits on.\n- Size spans 24px to 160px and letter spacing from 0 to 0.2em, which is the range hollow caps need, since a stroke makes letters look tighter than a solid fill does.\n- The readout states the paint order as stroke then fill, which is the setting that stops the stroke from cutting into the counters.\n- Browser support is reported as complete for the stroke property across modern browsers, which is why it is the technique used here rather than an SVG outline.\n\nThe order of painting is the whole trick. A stroke is centred on the glyph outline, so half of its width falls inside the letter and, painted over the fill, it erodes the shape from within. Setting the paint order to stroke first, fill second puts the fill back on top of the inner half, which leaves the outline sitting outside the letterform at its intended weight. That matters most at thick widths in hollow text, where an eroded cap can close its counters entirely. The stroke is also reported as a share of the em, because a 2px outline on a 64px letter is a fine line while the same 2px on a 24px letter is a heavy frame, and the ratio is what tells you which you are looking at.\n\n- The preview sets the weight to 800 regardless of the chosen face, since hollow lettering needs heavy forms to stay legible, so the result is not a preview of a light or regular weight.\n- Nothing checks the stroke colour against the background, so an outline in a colour close to the surface can be produced and will be hard to read.\n- Fill options are a fixed list of four, so an arbitrary fill colour has to be typed into the CSS after copying.\n- Descenders and fine terminals can still look pinched at the heaviest stroke widths, and the preview is the place to notice it.\n- The output is CSS only: no image export, and nothing rasterises the result for use where a picture is required.\n\nUse it for display caps where the hollow form is the design: a hero heading, a section number, a poster line. Keep the stroke width at a small share of the em for anything that has to be read at a distance, and check the outline colour against the background rather than trusting the preview's contrast. Where the letter needs depth rather than an edge, the shadow text generator stacks soft layers, the 3D text effect preview builds an extrusion, and a fill that changes across the letter is the text gradient maker's job.",
    howTo: [
      { step: "Type the words in caps, since hollow lettering is nearly always a display setting and lowercase forms lose their counters first." },
      { step: "Set the size, then raise the stroke width and watch the percentage of em readout rather than judging the outline by eye alone." },
      { step: "Choose the fill and the background together, which is where a hollow letter is either legible or invisible." },
      { step: "Copy the CSS and paste it into the component, remembering that the paint order declaration is what keeps the stroke outside the letterform." },
    ],
    whenToUse:
      "Reach for it when a display heading wants a hollow treatment, when a poster or a section number needs an outlined figure, or when someone has produced an outlined heading with a stroke that has eaten the letters and the fix has to be explained. The paint order line is usually the whole answer. Line heights and page placement can be checked against the same specification with the {{type-scale-generator|type scale generator}}, while the {{shadow-text-generator|shadow text generator}}, the {{3d-text-effect-preview|3D text effect preview}} and the {{text-gradient-maker|text gradient maker}} cover the other display treatments.",
    faqs: [
      {
        q: "Why does an outlined heading look eroded at thick widths?",
        a: "Because the stroke is centred on the glyph outline rather than drawn outside it, so half of its width lands inside the letter. Painted after the fill it covers that inner half and thins the form. Setting the paint order to stroke first and fill second restores the letter and leaves the outline outside, which is why the generated CSS includes it.",
      },
      {
        q: "Why is the preview always at weight 800?",
        a: "Because hollow lettering needs heavy forms. A light weight has thin strokes to begin with, and an outline drawn on top of a hairline stem leaves a shape that reads as two parallel lines rather than a letter. The preview therefore shows the setting at a weight that works, and the CSS leaves the weight to the component it is pasted into.",
      },
      {
        q: "Is a transparent fill the same as no fill?",
        a: "For the hollow look it is, and the difference appears when the background is not flat. A transparent fill lets whatever is behind the text show through the counters, while a fill set to the background colour blocks it. On a flat surface the two are identical; over an image they are not.",
      },
      {
        q: "What stroke width should I use?",
        a: "Judge it as a share of the em rather than in pixels. A stroke of about 1 to 3 percent of the em reads as a fine outline, while 5 percent and above starts to look like a frame, and the readout reports the ratio for the values you enter. Large display sizes tolerate a heavier stroke than small ones for the same reason.",
      },
      {
        q: "Can I outline text with a gradient stroke?",
        a: "Not with this property, since the stroke takes a single colour. A gradient outline needs the text rendered as an SVG path with a stroked shape, or the gradient applied to the fill instead. The text gradient maker covers the fill case, which is the one that usually looks better anyway.",
      },
    ],
  },

  "neon-text-previewer": {
    keywords: [
      "neon text previewer",
      "text glow",
      "glow intensity",
      "8-digit hex",
    ],
    intro:
      "The neon text previewer layers a glow around a bright core, which is what makes CSS neon read as a lit tube rather than as coloured blur. The halo and the core are separate layers, and a white highlight at the centre is what completes the effect.",
    content:
      "The neon text previewer builds six stacked glow layers around white type and exports the CSS that produces the tube effect.\n\n- The text glow stack is six layers: a white highlight at a four-pixel blur, then two full-colour layers at seven and twenty-one pixels, then three progressively larger layers at 42, 82 and 102 pixels with their alpha baked into the colour.\n- Glow intensity runs from 0.2 to 2 and scales every blur radius and every alpha together, so the tube can be dialled from a faint edge to a heavy bloom.\n- The glow colour accepts a picker or a typed hex value, and the outer radius is reported as the largest blur multiplied by the intensity.\n- The background defaults to a very dark navy, and it is adjustable, because the effect depends on a dark ground more than on any other single setting.\n- The text itself stays white at weight 600 with a little tracking, which is what a lit tube looks like at its core.\n\nThe layering is the technique. A single coloured shadow around white text reads as a soft smear; what makes neon convincing is the progression from the hot white centre out through the full-strength colour and into progressively larger halos with falling alpha. The alphas are written as 8-digit hex colours, which is the compact way to express a colour and its transparency together, and they are computed from the intensity so the whole glow scales from one control rather than six. The panel also states the readability caveat: the glow decorates, and a solid core is what keeps the text legible. At high intensity the halo bleeds into the letter spacing and the effective contrast of the letters against their ground drops, which is why the core stays white rather than taking the glow colour. The generated declaration sets the type to white and carries the six layers in order, leaving the background to whatever element it is applied to rather than baking in the dark navy shown in the preview.\n\n- The eight-digit hex alpha form is well supported in modern browsers, but it is the reason the exported CSS is not suitable for a target that requires older syntax.\n- Only one glow colour is produced, so a two-tube sign in contrasting colours needs two elements.\n- High intensity values bloom into the gaps between letters and reduce legibility, and nothing enforces a maximum beyond the slider's range.\n- Six blurred shadows on large text is a heavy paint cost, and the panel does not report it the way the extrusion tool does.\n- The effect assumes a dark background: on a light surface the glow washes out the letters rather than surrounding them.\n\nUse it for signage-style headings, a night-mode hero, or a seasonal treatment where the glow is the point, and keep the intensity low when the words have to be read rather than admired. Where the letter needs shade rather than light, the shadow text generator covers depth, the 3D text effect preview covers extrusion, and a fill that changes across the letter is the text gradient maker's job.",
    howTo: [
      { step: "Type the words and set the size, then choose a background dark enough for the glow to read against." },
      { step: "Pick the glow colour, which is the tube's colour, and leave the text itself white since the highlight is what reads as the lit core." },
      { step: "Raise the intensity and watch the outer glow radius readout, stopping before the halo bleeds into the word spacing." },
      { step: "Copy the CSS and re-check the letters at their final size, since legibility falls as the glow grows." },
    ],
    whenToUse:
      "Reach for it when a heading wants a sign-like glow, when a dark theme needs an accent treatment for a few words, or when an existing neon effect looks like coloured blur rather than a lit tube and the layer structure needs explaining. Where the effect is depth rather than light, the {{shadow-text-generator|shadow text generator}} stacks soft shadows, the {{3d-text-effect-preview|3D text effect preview}} builds an extrusion, and the {{outlined-text-generator|outlined text generator}} produces the hollow form that a glow sits well inside.",
    faqs: [
      {
        q: "Why is the text white when the glow is coloured?",
        a: "Because a lit tube is brightest at its centre. The eye reads a white core surrounded by coloured light as a glowing object, while text set in the glow colour reads as coloured text with a soft edge. Keeping the type white is also what preserves legibility as the intensity rises.",
      },
      {
        q: "What does the intensity control actually change?",
        a: "Every blur radius and every alpha in the stack, in proportion. At 0.2 the effect is a faint edge around the letters; at 2 the outermost layer is blurred by more than two hundred pixels. Because it scales the whole stack rather than one layer, the relationship between the core and the halo stays intact as the tube gets brighter.",
      },
      {
        q: "How do the fading layers get their transparency?",
        a: "From eight-digit hex colours, which carry the alpha in the last two digits alongside the colour. That is what allows the outer layers to be the same colour as the tube while fading smoothly, and it is also why the exported CSS needs a renderer that supports the eight-digit form.",
      },
      {
        q: "Should I use this for body text?",
        a: "No. Glow is a display treatment: large text with a bright halo loses its edge definition and the letters start to merge where the halos overlap. Headings, a logo lockup or a single amplified word are the cases it suits. For readable text on a dark ground, a high-contrast pair without glow is the better answer.",
      },
      {
        q: "How do I get two colours in one sign?",
        a: "Set two elements, each with its own glow colour, rather than trying to combine both in one stack. The layer structure is generated from a single colour, so a second colour needs its own declaration. Placing the two words side by side and letting their halos overlap is what produces the mixed-light look.",
      },
    ],
  },

  "waterfall-font-preview": {
    keywords: [
      "waterfall font preview",
      "size ladder",
      "editable size list",
      "truncated rows",
    ],
    intro:
      "The waterfall font preview renders the same sample down a size ladder, so fit, weight and rhythm can be judged at every size on one screen. The ladder is editable, which is what lets it match a real type scale rather than a generic one.",
    content:
      "The waterfall font preview takes a sample, a face, a weight and a comma-separated list of sizes, then renders the sample once per size down the size ladder, each row labelled with its pixel value.\n\n- The default ladder is 12, 14, 16, 20, 24, 32, 40, 56, 72 and 96 pixels, which covers a caption through to a display heading.\n- The editable size list is typed rather than chosen, so any set of sizes can be tested, including the exact steps of a project's type scale.\n- Up to fourteen values are rendered, each clamped to a maximum of 300 pixels, and values that cannot be parsed are dropped rather than breaking the ladder.\n- Weight is chosen from five values between 300 and 700, applied to every row at once.\n- The readouts report how many sizes were rendered, the range they span, and the classification of the family being previewed.\n\nRendering every row at a single weight is the point: a waterfall is about how one setting behaves as it grows, so holding weight, tracking and leading constant is what makes the rows comparable. Each row uses a line height of 1.15 and truncates with an ellipsis, which keeps the ladder's rhythm even when the sample is long, and every row carries the full sample as a title so the truncated text can still be read by hovering. The reference panel writes the family stack followed by a comment for each size in the ladder, which is a record of what was tested rather than a usable stylesheet. That distinction matters: the ladder is a comparison instrument, and the sizes it renders come from what you type rather than from any scale the tool derives.\n\n- Truncated rows mean a long sample cannot be compared end to end at every size in the ladder; only the first part of the string is visible.\n- Fourteen sizes are the ceiling, which is enough for a ladder and not enough for a full specimen.\n- The ladder shares one weight for every row, so the interaction between size and weight has to be explored in two passes.\n- Sizes above 300 pixels are dropped silently, as are values that do not parse.\n- The reference output is a comment block rather than CSS, and it names the family rather than giving you declarations to paste.\n\nUse it when a face has to hold up across a project's whole scale rather than at one size, when a type scale has been proposed and the sizing needs checking in the real face, or when a display face is being considered for smaller sizes and the question is where it stops working. Type the scale's own steps into the ladder so the preview matches the design. Where the face needs testing at different weights as well, the variable font sliders vary two axes at once, and where several faces need the same ladder, the multi-font comparison stacks them. The font size preview answers the size question for a single face, the type scale generator derives the steps to test, and the font previewer is the display-oriented sibling with its own fixed ladder.",
    howTo: [
      { step: "Choose the family and weight, then replace the default ladder with the exact size steps your scale uses, comma-separated." },
      { step: "Set a sample long enough to show the face's rhythm but short enough to read comfortably on each row." },
      { step: "Read the ladder from the bottom up, since a face that holds at 72px and collapses at 14px is the usual finding." },
      { step: "Check the sizes-rendered and range readouts to confirm the ladder parsed as typed, then keep the reference block as a record of what was tested." },
    ],
    whenToUse:
      "Reach for it when a face is being considered for a whole type scale, when a proposed scale needs checking in the real face before it is committed to a design system, or when the question is where a display face stops working as the size drops. It answers that faster than changing one previewer's size slider ten times. Where several faces are being compared on the same ladder, the {{multi-font-comparison|multi font comparison}} stacks them, the {{font-specimen-sheet|font-specimen sheet}} gives the full character set, and the {{font-line-height-tester|font line height tester}} covers the leading each row in the ladder would need.",
    faqs: [
      {
        q: "Why can I only see part of my text on each row?",
        a: "Because each row truncates with an ellipsis. Without it, a long sample at 96px would push the following rows off the screen and the ladder would stop being a ladder. Every row carries the full sample as its title, so hovering reveals the rest, and for a full read the sample belongs in a single-size preview instead.",
      },
      {
        q: "How many sizes can the ladder hold?",
        a: "Fourteen, and each is clamped to 300 pixels. That is enough for a type scale with a step per role plus a few display sizes. Values that do not parse, or that fall outside the range, are dropped silently, which is why the sizes-rendered readout is worth checking after pasting a long list.",
      },
      {
        q: "Why is the weight the same for every row?",
        a: "Because a waterfall compares sizes, and mixing weights would introduce a second variable. A face is usually heavier at small sizes and lighter at large ones, so the interesting interaction is between size and weight; that is explored by setting one weight, reading the ladder, then setting another and comparing the two passes.",
      },
      {
        q: "Can I use the reference output as a stylesheet?",
        a: "Not directly. It writes the family stack and a comment per size, so it records what the ladder contained rather than declaring rules. The size steps themselves are the useful part, and they belong in the type scale where they can be turned into proper classes with the leading each one needs.",
      },
      {
        q: "Why start the default ladder at 12px?",
        a: "Because a waterfall is most useful when it spans the whole range a face is used across. Twelve pixels is the lower end of what appears in a real interface, 96 is a display heading, and the steps between are the common ones. Replacing the list with a project's own scale is the intended use.",
      },
    ],
  },
};
