import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 31 (pickers + palettes).
 *
 * Only tools whose logic is correct (audit verdict "Y") are authored here.
 * Tools flagged "P"/"N" in the functional audit are deliberately excluded.
 */
export const SEO_BATCH_31: Record<string, ToolSeo> = {
  "screen-color-picker": {
    keywords: [
      "screen color picker",
      "pick color from screen",
      "browser eyedropper",
      "capture on screen color",
    ],
    intro:
      "The screen color picker uses the browser's built-in EyeDropper interface so you can pick a color from your screen and copy the hex value straight away.",
    content:
      "The screen color picker hands the job of sampling to the browser itself. Press the open button and the cursor becomes a magnified loupe that travels over everything currently on screen — this page, other tabs, other applications, the desktop underneath. Click, and the color under the loupe arrives back in the page as a standard sRGB hex value, ready to copy. Nothing is uploaded, nothing is processed remotely: the sampling happens in the browser's own interface layer, and only the final value crosses back into the document.\n\nThis is the honest way to pick a color from screen content. Screenshot-and-inspect workflows lose a step to compression and scaling, and they pull you out of the page you were working in. Here the loop is press, point, click, copy. The hex that comes back is the color as the browser composites it — after your operating system's color profile and the page's own rendering have had their say — which is exactly the color your eye was looking at when you decided you wanted it.\n\nAs a browser eyedropper it is deliberately thin:\n\n- One native sampling call, returning an sRGB hex value that drops straight into CSS, a design file or a ticket.\n- No palette management, no history and no format switching — a single colour shown back at full size so you can confirm the sample landed where you meant it to.\n- The capability check runs on load, so a browser without the EyeDropper interface gets a plain statement rather than a button that does nothing.\n\nA few constraints are worth knowing before you reach for it:\n\n- The EyeDropper interface is a Chromium-family feature — Chrome, Edge, Opera — and does not exist in Firefox or Safari.\n- The picker only sees what the screen shows, so a colour behind another window has to be brought forward first.\n- Whatever sits under the loupe at the moment of clicking is what you get: animating backgrounds, video playback and hover transitions change value from frame to frame, and a pinch taken mid-transition records a colour nobody intended to ship.\n\nA screen picker is only as good as the frame it samples, so the workflow matters as much as the arithmetic. Bring the source window forward, hold still, and let the loupe settle before clicking: animating backgrounds, video playback and hover transitions all change value from frame to frame, and a pinch taken mid-transition records a colour nobody intended to ship. Where the target is small, a magnified preview beats a hopeful click, and where it is text on a coloured panel, sampling the glyph edge rather than its centre is the difference between the palette colour and an anti-aliased blend of it.\n\nNone of that is the tool's job, but all of it is why this beats a screenshot. The pick color from screen step is a single gesture, the capture on screen color result that comes back is the real value rather than something reconstructed by eye afterwards, and the sample can be repeated as often as the layout changes without another round trip through the image editor. Work that needs a dozen picks in one sitting — auditing a theme, matching a competitor's accent palette, rebuilding a reference layout — therefore turns into a few minutes of clicking rather than an afternoon of annotated screenshots.\n\nBecause the value returns as sRGB hex, it drops straight into CSS, design files and ticket descriptions without a conversion step. That is the whole point of a screen color picker: remove every step between I want that color and that color is in my stylesheet, and do it with the capture precision of the platform rather than the guesswork of a screenshot.",
    howTo: [
      { step: "Press the open eyedropper button — the cursor becomes a magnified loupe." },
      { step: "Move the loupe over any pixel on screen, in any window, and click to capture it." },
      { step: "Confirm the swatch, then copy the hex value into your CSS or design tool." },
    ],
    whenToUse:
      "Use this when the color you want is somewhere on screen — another app, a photo viewer, a brand site in the next tab. Use the image color picker when the source is a file, and the pixel color picker when you need to sample inside an uploaded image rather than the live screen. Where the source is a file, the {{image-color-picker|image color picker}} samples inside an uploaded image, and the {{pixel-color-picker|pixel color picker}} reads exact pixel values when bit-level accuracy matters rather than the live screen.",
    faqs: [
      {
        q: "Which browsers support screen picking?",
        a: "The browser EyeDropper interface is available in Chromium-based browsers such as Chrome, Edge and Opera. Firefox and Safari do not expose it yet, and the tool will tell you if it is unsupported.",
      },
      {
        q: "Can it sample colors outside the browser?",
        a: "Yes. The loupe operates at the screen level, so any visible pixel — another application, a desktop wallpaper, a second monitor — can be sampled and returned as hex.",
      },
      {
        q: "What format does it return?",
        a: "A six-digit sRGB hex value, the same notation CSS uses, which every design tool also accepts directly.",
      },
      {
        q: "Does the picked color account for my display profile?",
        a: "You get the color as the browser composites and displays it on your system, which matches what your eye sees on that screen. A different display with a different profile may show the same hex slightly differently.",
      },
      {
        q: "Why does the sampled value sometimes differ from the colour in the original asset?",
        a: "The sample is the colour as the browser composites and displays it, after your display profile and the page's rendering. That is usually what you want when matching something on screen; the same hex can look slightly different on another display.",
      },
    ],
  },

  "pixel-color-picker": {
    keywords: [
      "pixel color picker",
      "read pixel color from image",
      "get exact pixel hex",
      "sample image pixel value",
    ],
    intro:
      "The pixel color picker reads the exact color of any pixel in an uploaded image — click the canvas and the precise hex value appears, computed from the image data itself.",
    content:
      "Upload an image and the pixel color picker lays it on a canvas where every pixel is addressable. Move the crosshair cursor over the picture and click; the tool reads the raw image data at that exact coordinate and returns the stored RGB value as a hex code. There is no averaging with neighbours, no downscaling guess, no compression of the sample into an approximate name — you get the color the file actually contains at that spot, down to the last bit the format preserved.\n\nReading a pixel this way has its own character:\n\n- A crosshair click reads a single pixel at that exact coordinate, with no averaging over neighbouring pixels.\n- The value comes back as a hex swatch at full size, so you can be certain the read landed where you meant it to.\n- The read comes from the browser's image decoder, so PNG values stay bit-exact while JPEG values reflect whatever the codec stored.\n\nReading a pixel color from an image this way is the ground truth for every other color workflow. When you are checking whether an export pipeline shifted a brand color, the question is what value survived in the file, and only pixel-level access answers it. The same goes for matching a gradient stop, verifying a soft edge, or pulling the exact highlight tone out of a photograph: the swatch panel shows the picked value at full size next to its hex so you can be certain the read landed on the pixel you intended.\n\nThe canvas is capped at a generous working size for display, but sampling happens against the rendered image data, and you can zoom by uploading a cropped region if you need to separate two adjacent pixels. Because the read comes from the browser's image decoder, PNG values are bit-exact, while JPEG values reflect whatever the codec stored — which is precisely the point when you are diagnosing compression artifacts: the shifts are visible as values, not just as texture.\n\nThere is no magnifier and no coordinate readout here, which shapes how the tool is used:\n\n- The image is shown at the size the layout gives it, so to read pixel color from image detail at that scale the file has to be uploaded as a cropped region first.\n- Textured areas return whichever single pixel sits under the cursor rather than a representative tone, and when the goal is to get exact pixel hex that single read is the whole answer.\n- Nothing carries over between clicks, so the sample image pixel value has to be recorded by hand if it is needed later.\n\nOne caveat is worth knowing before the numbers are treated as absolute:\n\n- The browser decodes the file to sRGB first, and any colour profile baked into the asset is applied during that decode, so the value you copy is what CSS, a canvas and a design tool will agree with rather than the raw number stored in a wide-gamut original.\n- Large files are downsampled before they are read, so hair, foliage and fine texture are averaged with their neighbours rather than reported exactly.\n- Transparency has no special handling: a click on an area the image does not cover reads as black, because only the colour channels are sampled.\n\nIf your work continues past the single sample, the multi-color picker accumulates several picks into one palette, and the format converters turn the hex into rgb(), hsl() or OKLCH strings. For live screen sampling instead of file sampling, the screen color picker drives the browser's native loupe. But for the plain question of what exact pixel hex this image holds here — the pixel color picker stays the sharpest instrument on the bench.",
    howTo: [
      { step: "Drop an image into the upload area; it renders on the sampling canvas." },
      { step: "Click the exact pixel you want — the crosshair cursor marks the read position." },
      { step: "Copy the returned hex value, shown on a full-size swatch beside the image." },
    ],
    whenToUse:
      "Use this when the source is a file and the answer must be exact — export checks, gradient stops, edge inspection. Use the screen color picker for colors living in other applications, and the dominant color tool when you want the overall color of an image rather than one coordinate's value. When several colours are wanted rather than one coordinate, an {{color-palette-extractor|extraction tool}} clusters the pixels, and the {{multi-color-picker|multi-color picker}} collects a series of single samples into one palette.",
    faqs: [
      {
        q: "How exact is the value it returns?",
        a: "It reads the image data directly, so PNG results are bit-exact to what the file stores. JPEG and other lossy formats return whatever the codec stored, which is exactly what you want when diagnosing compression.",
      },
      {
        q: "Can I pick from a specific zoomed region?",
        a: "Upload a cropped version of the region. Sampling addresses a pixel of the displayed image, so cropping enlarges the area each pixel covers and makes adjacent colors easier to separate.",
      },
      {
        q: "Does uploading send my image anywhere?",
        a: "No. The image stays in your browser; the canvas and the pixel read both happen locally.",
      },
      {
        q: "What is the difference between this and the eyedropper?",
        a: "The eyedropper samples the live screen via the browser's native API; this tool samples pixels inside an uploaded image file, so it also works in browsers without the EyeDropper interface.",
      },
      {
        q: "Does it read the original file byte-for-byte?",
        a: "No. The file is decoded to sRGB and drawn onto a canvas capped at 800 pixels on its long side, so the value matches what the browser renders; PNG values stay bit-exact at that size, while JPEG values reflect what the codec stored.",
      },
    ],
  },

  "color-picker-with-history": {
    keywords: [
      "color picker with history",
      "color picker recent colors",
      "keep picked color history",
      "picker that remembers colors",
    ],
    intro:
      "The color picker with history is a standard picker that keeps a recent colors strip, so every shade you touch is one click from coming back.",
    content:
      "A plain picker forgets everything the moment you move on, and half of color work is going back — the second button needs the same fill as the first, the hover state is the base darkened, the client asks for yesterday's accent. The color picker with history writes each value you choose into a recent strip beside the picker, and keeps that strip across visits in your browser's local storage, so the session's decisions survive a refresh and come back with you tomorrow.\n\nThe mechanics are deliberately boring, which is why they work:\n\n- Every colour you select becomes the current value immediately, with the large preview updating as you drag.\n- The same value is pushed onto the front of the history, and duplicates collapse so a colour appears once no matter how often you revisit it.\n- The strip holds the last twelve picks, and clicking any swatch makes it current again, which turns the history into a small working palette without asking you to name or save anything.\n\nAs a picker that remembers colors, it earns its keep in the unglamorous middle of a project: comparing two candidates by bouncing between them, reusing one grey across five screenshots, keeping a client's requested hex visible while you explore around it. When a decision hardens, promote the value properly — the favorites picker keeps an explicit set you curate, and the exporters turn a settled choice into CSS custom properties or design tokens.\n\nWhat makes a history worth keeping is that it answers questions nobody thought to ask at pick time. A colour saved an hour ago in a different tab is still available when a second screen needs the same accent, and a shade sampled from a reference site survives the reference site being redesigned. The list also documents drift: when three near-identical greys sit side by side in the color picker recent colors strip, it is telling you the palette was assembled by eye across several sessions rather than chosen once, which is the moment to consolidate, measure the candidates in the comparison tool and keep one.\n\nBecause entries move to the front as they are reused, the strip tunes itself to the current job, and because any entry can be re-picked with a click, keep picked color history turns into a two-second copy instead of a re-sample. That turns the tool into a small audit trail as well: the order in which values were chosen is often the order in which the design was decided.\n\nThe history is per-browser and per-machine, because it lives in local storage rather than an account:\n\n- Clearing site data clears it, and no one else sees it, which is the right default for client work.\n- There are no labels, no projects and no notes — the strip answers the honest question of what did I use recently.\n- Nothing can be pinned: entries age out in the order they were reused, so anything worth keeping belongs in the favorites picker.",
    howTo: [
      { step: "Pick a color with the field or the native picker — it becomes current and joins the recent strip." },
      { step: "Keep picking; the strip keeps the last twelve unique values, newest first." },
      { step: "Click any swatch in the strip to make that color current again." },
    ],
    whenToUse:
      "Use this when you keep needing yesterday's or five-minutes-ago's color and re-picking it is friction. Use the favorites picker when a set of colors is deliberate rather than recent, and the multi-color picker when you are assembling a palette instead of revisiting one. The {{color-picker-with-favorites|favorites picker}} keeps an explicit set you curate, and the {{multi-color-picker|multi-color picker}} is for assembling a palette rather than revisiting one value.",
    faqs: [
      {
        q: "Does the history survive closing the browser?",
        a: "Yes. Recent colors are stored in your browser's local storage for this site, so the strip is still there after a restart — and disappears if you clear site data.",
      },
      {
        q: "How many colors does it remember?",
        a: "The twelve most recent unique values. Picking an older color again moves it back to the front rather than duplicating it.",
      },
      {
        q: "Is the history shared with other devices?",
        a: "No. It is local to this browser on this machine — nothing is uploaded, so client colors stay on your machine.",
      },
      {
        q: "Can I remove a single color from the strip?",
        a: "The strip is a rolling recent list rather than a curated set; it ages out naturally as you pick. For a hand-picked permanent set, use the favorites picker.",
      },
      {
        q: "How many colours does the history hold, and what happens when it is full?",
        a: "Twelve. Each new pick goes to the front, a repeat moves its existing entry forward rather than duplicating it, and the oldest entry falls off the end.",
      },
    ],
  },

  "color-picker-with-favorites": {
    keywords: [
      "color picker with favorites",
      "save favorite colors",
      "bookmark color palette",
      "keep favorite swatches",
    ],
    intro:
      "The color picker with favorites is a standard picker plus a bookmark strip: save the colors you decide to keep and they stay one click away.",
    content:
      "A history answers what did I use lately; favorites answer what have I decided on. The color picker with favorites is the same comfortable picker with a persistent strip attached — when a value matters, you save it, and it sits beside the picker from then on, in this browser, across sessions, immune to the churn of exploration. Click a saved swatch to make it current; the large preview confirms you grabbed the right one before you copy it anywhere.\n\nThe distinction from history is deliberate and worth stating:\n\n- Recent colors age out and reshuffle no matter how important they were.\n- Favorites are a curated set that changes only when you change it, which makes this the right home for the short list that actually drives a project — the brand fill, the two neutrals every card sits on, the success and error accents.\n- The strip persists in local storage, so the set is still there next week and after a restart, yet it stays private to your machine, which is what client work wants from a bookmark color palette.\n\nIn day-to-day use the tool collapses a common loop: rather than keeping a sticky note of approved hexes and pasting them into a picker one at a time, the approved set is the picker. Exploration happens as usual in the field, and the moment a candidate is chosen, saving it promotes it from candidate to citizen. When a decision needs to leave your machine — into a stylesheet, a token file, a ticket — the exporters hand off cleanly, turning saved values into CSS custom properties or design tokens with the names they deserve.\n\nFavourites are the bridge between hunting and shipping. A colour found in a moodboard screenshot is a curiosity; the same colour saved with one tap is a candidate, and the gap between a candidate and a decision is usually just a short list in front of you. Keeping that list inside the picker removes the detour through a notes app or a scratch file, and it means save favorite colors happens at the moment of judgement, while the swatch is under the cursor and the comparison is still fresh, rather than an hour later from memory.\n\nThe strip also outlives the tab, so keep favorite swatches is durable rather than cosmetic: the set curated yesterday is the palette you start from today, one click each to re-select, compare or hand to the exporters when the moment to formalise arrives. It is worth clearing occasionally, because a bookmark strip that only grows stops being a short list and starts being a filing problem.\n\nWhat it does not try to be is a palette manager:\n\n- There are no projects, no tags and no sharing links — one flat set of favorite swatches for one person's browser.\n- The strip stays a single row, so it suits a short working set rather than a filing system that only grows.\n- Structure around many palettes belongs to the palette locker and the token exporters, which are the next rung up.\n\nFor keeping favorite swatches within reach while you work, a picker with a bookmark strip is exactly the right size.",
    howTo: [
      { step: "Pick a color as usual with the field or native picker." },
      { step: "Save it to the favorites strip when it is a keeper." },
      { step: "Click any saved swatch later to make it the current color again." },
    ],
    whenToUse:
      "Use this when a small set of approved colors should stay within reach across sessions. Use the history picker when you want automatic recall of recent picks instead of a curated set, and the palette locker when the unit of work is a whole palette rather than individual colors. Use the {{color-picker-with-history|history picker}} when automatic recall of recent picks is enough, the {{palette-locker|palette locker}} when the unit of work is a whole palette, and the {{css-custom-properties-exporter|CSS custom properties exporter}} when a saved set has to reach code.",
    faqs: [
      {
        q: "Where are favorites stored?",
        a: "In your browser's local storage for this site. They persist across visits and restarts, stay private to this machine, and vanish if you clear site data.",
      },
      {
        q: "How is this different from the history picker?",
        a: "History is automatic and rolling — the last dozen picks. Favorites are explicit and permanent until you remove them, which suits decided colors rather than recent ones.",
      },
      {
        q: "Can I export my favorites?",
        a: "Copy any swatch's hex straight from the strip; for a whole set heading into code, the CSS custom properties exporter or the token exporters format it properly.",
      },
      {
        q: "Is there a limit on how many I can save?",
        a: "The strip is meant for a short working set and stays one row; the storage limit of local storage is far beyond anything a favorites strip would hold.",
      },
      {
        q: "Why keep favorites instead of relying on the recent list?",
        a: "Recent colors age out and reshuffle no matter how important they are, while favorites change only when you change them. A saved set stays put until it is removed, which is what a brand fill or a project neutral needs.",
      },
    ],
  },

  "color-comparison-tool": {
    keywords: [
      "color comparison tool",
      "compare two colors side by side",
      "color difference checker",
      "hex comparison tool",
    ],
    intro:
      "The color comparison tool puts two colors side-by-side and measures how far apart they are, in plain RGB distance and in perceptual OKLCH terms.",
    content:
      "Two colors that look identical in one context can look obviously different in another, and eyeballing rarely settles the argument. The color comparison tool takes two values and answers the question three ways at once: the swatches sit literally side-by-side so your eye does the first pass, then the numbers quantify what the eye suspects. RGB Euclidean distance gives the straight arithmetic separation of the two values, and an OKLCH-based ΔE gives the perceptual reading — how different they look to a human, which is the number that actually matters when the question is will anyone notice.\n\nThe two numbers disagree, and that disagreement is the interesting part:\n\n- RGB Euclidean distance treats every channel equally, so a shift in blue can score the same as a shift in green while looking far smaller.\n- The OKLCH-based ΔE weights the channels the way vision does and folds lightness, chroma and hue into one figure, which is the number to cite when someone asks how different these two blues really are.\n- The swatches share an edge with no neutral between them, the one arrangement where the eye cannot smooth over a small gap.\n\nAs a hex comparison tool it earns its place in the dull but frequent disputes: did the export change the color, is this the same grey as last quarter's, are these two background tokens accidentally the same. Set both fields, read both numbers, and the discussion moves from opinion to measurement. When the verdict is too different, the mixers and shifters produce a value between the two; when the verdict is effectively the same, keeping the canonical one is a one-line cleanup.\n\nTwo colours are rarely compared for their own sake; they are compared because something depends on the answer. An accent against a surface, a hover state against a resting state, one brand asset against another: what matters is the size of the gap and its direction, and both are hard to judge by eye because the visual system adapts within seconds. Placing the swatches adjacent, sharing an edge with no neutral between them, exploits that adaptation deliberately — a direct join is the one place the eye cannot smooth over the difference, so a genuinely small gap becomes visible and a large one becomes obvious.\n\nReading the delta alongside the pair makes this a color difference checker rather than a swatch book: the fields give a number to attach to a review comment, and the side-by-side view gives the reviewer the same evidence the comment is built on, which is what makes the compare two colors side by side verdict stick. Numbers also survive hand-off, so a note that says the second grey is nearly indistinguishable from the first is checkable by whoever picks up the work.\n\nWhat the tool deliberately does not do is guess intent:\n\n- It will not tell you whether a difference is acceptable — a 2:1 contrast change is nothing in a decorative border and a failure on body text.\n- No accessibility verdict: the contrast checkers apply WCAG thresholds when a pass or fail is needed.\n- No harmony judgement either — the harmony finders read relationships, and the mixers are what produce a value between the two colours.",
    howTo: [
      { step: "Set color A and color B with the two fields." },
      { step: "Compare visually with the side-by-side swatches, then read the two distance figures." },
      { step: "Use the RGB distance for raw separation and the OKLCH ΔE for how different it will look." },
    ],
    whenToUse:
      "Use this when two specific values need a verdict — export checks, near-duplicate tokens, revision disputes. Use the contrast checkers when the question is accessibility rather than similarity, and the delta-E style readings here are also the basis of the just noticeable difference calculator for perception questions. The perceptual figure here is the same idea behind the {{just-noticeable-difference-calculator|just noticeable difference calculator}}, and for a pass or fail verdict the {{contrast-checker|contrast checker}} applies WCAG thresholds.",
    faqs: [
      {
        q: "Why do the two distance numbers disagree?",
        a: "RGB distance is raw channel arithmetic with no reference to human vision, while the OKLCH reading weights channels the way eyes do and folds lightness, chroma and hue together. The perceptual number is usually the meaningful one.",
      },
      {
        q: "What ΔE counts as noticeable?",
        a: "It depends on context and adjacency, but values under a few hundredths are generally indistinguishable, while anything approaching 0.1 in OKLCH terms is usually visible. The just noticeable difference calculator explores the boundary directly.",
      },
      {
        q: "Can I compare a color against itself after export?",
        a: "That is the classic use: set the original and the exported value, and the two numbers tell you whether the pipeline changed anything and whether it matters.",
      },
      {
        q: "Does it tell me if the difference passes accessibility?",
        a: "No — similarity and accessibility are different questions. The contrast checkers apply WCAG thresholds when you need a pass or fail verdict.",
      },
      {
        q: "Which of the two numbers should I quote in a review?",
        a: "The OKLCH-based ΔE, because it folds lightness, chroma and hue into one figure the way vision weights them. The RGB distance is useful as raw arithmetic separation, but a blue shift can score large while looking small.",
      },
    ],
  },

  "color-stack-viewer": {
    keywords: [
      "color stack viewer",
      "stack colors to inspect",
      "collect colors in one place",
      "build color list while browsing",
    ],
    intro:
      "The color stack viewer accumulates colors into a single strip as you add them, so you can stack colors and inspect the collection side-by-side before committing it anywhere.",
    content:
      "Colors rarely arrive one at a time. They trickle in — one from a logo, one from a screenshot, one from a stakeholder's message — and the working question is always what do these look like together. The color stack viewer is built around exactly that: a field to add colors one by one, and a live strip where the whole collection sits side-by-side, so the set grows in front of you and the relationships are visible from the second color onward.\n\nEach entry in the stack shows its swatch and its hex, and the strip itself is the inspection surface:\n\n- Every entry can be removed with one click when it turns out not to belong.\n- Contrast between neighbours, accidental near-duplicates and whether the collection leans warm or cool all become obvious once the colors share a row.\n- The copy-all button serialises the whole stack into one comma-separated list, ready to paste into a stylesheet comment, a ticket or another tool.\n\nAs a place to stack colors and inspect them, it sits deliberately between a single picker and a full palette tool. There is no shuffling, no harmony maths, no export formats; it is the collection tray that the fancier tools assume you already have. That makes it the honest first stop for the assemble phase of any palette work — get the candidates together, look at them side-by-side, delete the one that ruins the set — and the exporters or the palette sorters take over when the set is settled enough to deserve structure.\n\nThe tray's real value shows up mid-task. Scraping a palette out of a photograph means holding seven or eight candidates long enough to judge them together, and stacking them as they are sampled makes that judgement possible while the tab holding the source is still open, rather than at the end when the source is gone and the memory of the image has faded. Adding is one click or one keypress, removing the muddy ones is the same, and the order can be reshuffled to test which arrangement tells the story best.\n\nThat is the workflow the tool is built for: stack colors to inspect candidates in the order they were found, collect colors in one place so no promising sample is lost to a stray refresh, and build color list while browsing instead of reconstructing the set from a finished design days later. Duplicates become obvious once they are adjacent, and suspiciously close values become worth a second look before any of them is promoted into the deliverables.\n\nThe stack lives for the session, which matches the job:\n\n- Reloading the page clears the list, so anything worth keeping has to be copied out first.\n- There is no shuffling, no harmony maths and no export format here — structure arrives from the sorters and the exporters once the set is settled.\n- Duplicates are shown rather than blocked, which is right for a collection tray but means the list can quietly gather near-identical values that deserve a second look.",
    howTo: [
      { step: "Set a color in the field and press add — it joins the stack." },
      { step: "Keep adding; inspect the strip for relationships, duplicates and clashes." },
      { step: "Remove entries that do not belong, then copy all as a single list." },
    ],
    whenToUse:
      "Use this while a set of colors is still being gathered and the question is how they sit together. Use the palette sorters once the set needs order, the exporters when it moves into code, and the multi-color picker when you are sampling from one image rather than collecting from anywhere. Once a set needs order the {{palette-sorter|palette sorters}} arrange it, the {{color-palette-css-exporter|CSS exporter}} and {{color-palette-json-exporter|JSON exporter}} format it for code, and the {{palette-importer|palette importer}} is the way back in.",
    faqs: [
      {
        q: "Does the stack survive a page refresh?",
        a: "The stack is a working collection for the session and clears on reload. Anything worth keeping should be copied out or saved to favorites before you leave.",
      },
      {
        q: "Can I reorder the colors?",
        a: "You can remove and re-add to reshape the set; ordering is the job of the palette sorters once the collection is final.",
      },
      {
        q: "How many colors can it hold?",
        a: "There is no hard cap — the strip wraps, which is usually the signal that the collection has outgrown the tray and deserves a real palette tool.",
      },
      {
        q: "Can I copy the whole stack at once?",
        a: "Yes. The copy-all button serialises every color in the stack into one comma-separated list of hex values.",
      },
      {
        q: "Is there a limit on how many colors the stack holds?",
        a: "No cap is applied; the strip simply grows with each add. It is a working tray rather than an archive, and it clears when the page is reloaded.",
      },
    ],
  },

  "webcam-color-picker": {
    keywords: [
      "webcam color picker",
      "pick color from camera",
      "capture color from webcam",
      "live camera color sample",
    ],
    intro:
      "The webcam color picker turns your camera into a sampling surface: grab a frame from the webcam and pick a color straight out of the live snapshot.",
    content:
      "Some colors are not in a file or on the desktop — they are in the world. Paint on a wall, a fabric swatch, a printed proof, a leaf. The webcam color picker bridges that last gap: point your camera at the thing, capture a snapshot, and pick a color out of the frame with a click. The color travels from the physical object to a hex value without a screenshot-and-crop detour, which is the entire appeal of a live camera color sample.\n\nThe workflow is two stages by design:\n\n- First the frame: whatever the camera sees is frozen into a still, so the target cannot drift between aiming and picking.\n- Then the pick: the snapshot sits on a canvas like any uploaded image, and the value you click is read from the frame's own pixels as a hex code.\n- The captured frame stays local — the camera stream never leaves the browser, and the browser asks permission before the camera turns on at all.\n\nHonesty about lighting is part of the tool's contract:\n\n- A camera renders the world through white balance, exposure and the sensor's own colour response, so the hex is the colour as the camera saw it in that light — an excellent match for matching things in similar light, and only an approximation of the object's true surface colour.\n- Nothing is corrected for you: no auto-white-balance pass and no named-colour guesses, because a capture is only trustworthy while the chain from photon to hex stays short and visible.\n- The sample is only as good as the frame: distance changes colour, the shadow of the hand ruins a reference, and a capture worth trusting is usually taken twice under different light and compared.\n\nPhysically pointing a camera at something is a different act from picking on screen, and it has its own discipline. Distance changes colour: a patch sampled from arm's length is lit differently from one sampled close up, and the shadow of the hand holding the object is a reliable way to ruin a reference. Diffuse daylight from a window is the flattering source, a desk lamp adds a warm cast and a single overhead tube adds green, so a capture worth trusting is usually taken twice under different light and compared.\n\nWhere the object is small, filling the frame with it before freezing gives the sampler more pixels to work with and makes the pick color from camera step less of a gamble on one noisy patch. Used that way the webcam becomes a colourimeter for the physical world, good enough to match a paint chip, a fabric swatch or a piece of packaging against a digital palette without leaving the page or borrowing a scanner.\n\nThe same frame can yield several samples, and the stack viewer or multi-color picker will collect a series of picks if the job is a palette from a scene rather than a single value. As a webcam color picker it deliberately does nothing smarter than freeze and sample — no auto-white-balance corrections, no named-color guesses — because a capture color from webcam tool is only trustworthy while its chain from photon to hex stays short and visible.",
    howTo: [
      { step: "Allow camera access, frame the object, and capture a still." },
      { step: "Click the exact spot in the snapshot whose color you want." },
      { step: "Copy the hex value from the swatch panel." },
    ],
    whenToUse:
      "Use this when the color exists physically — paint, fabric, print, nature — and a camera is the only sensor you have. Use the image color picker when the source is already a file, and the screen color picker when the color is on screen rather than in the world. When the source is already a file the {{image-color-picker|image color picker}} reads it directly, and for a colour already on screen the {{screen-color-picker|screen color picker}} skips the camera entirely.",
    faqs: [
      {
        q: "Why does the picked color differ from the real object?",
        a: "Cameras apply white balance, exposure and their own color response, so you get the color as seen in that light. Include a known reference in the frame when the true surface color matters.",
      },
      {
        q: "Is my camera feed uploaded anywhere?",
        a: "No. The stream and the snapshot both stay in your browser; the pick is read from the local frame.",
      },
      {
        q: "Can I pick several colors from one snapshot?",
        a: "The frame stays on the canvas until replaced, so you can click as many points as you like — pair it with the stack viewer to collect a set.",
      },
      {
        q: "Why freeze a frame instead of picking live?",
        a: "A still guarantees the pixel under your click is the pixel you read; live video drifts between aiming and clicking, which quietly corrupts the sample.",
      },
      {
        q: "Does the camera stream or the snapshot ever leave the browser?",
        a: "No. The stream is decoded in the page and the frozen frame stays local, which is why the capture works without an account or an upload.",
      },
    ],
  },

  "complementary-palette-generator": {
    keywords: [
      "complementary palette generator",
      "color and its opposite",
      "complementary color pairs",
      "opposite color generator",
    ],
    intro:
      "The complementary palette generator takes one base color and returns it together with its direct opposite on the wheel, exactly 180 degrees away. The result is a fixed two-color pair: the base you set, and the complement the rule derives from it.",
    content:
      "Complementary is the most decisive harmony there is: take the base hue, add 180 degrees, and the result is the color and its opposite across the wheel. The complementary palette generator performs that rotation in OKLCH, holding your base's lightness and chroma steady while the hue swings to the far side. What comes back is one of the simplest complementary color pairs available, the base and its complement, drawn as swatches you can copy straight into a stylesheet. The count is set by the rule rather than by a setting: complementary is a two-color relationship and this tool adds no third value. Nothing here is random, so the same base always returns the same pair.\n\nThe rotation happens in OKLCH, and hue is the only coordinate that moves. Lightness and chroma are taken from the base, so both halves of the pair are exactly as light and as saturated as the color you set; a complementary color pair is therefore a pure hue relationship rather than a tonal one. Because OKLCH is perceptually even, the complement lands where the eye expects it rather than where a naive RGB turn would place it, which is why the pair reads as a genuine opposite rather than a slightly tilted relative. The base always appears first in the strip, so the color you must keep is never ambiguous.\n\n- The count is fixed at two. There is no count control and no third color, however much the layout might want one.\n- Only the 180 degree relationship is available here. The analogous, triadic, tetradic and split-complementary rules each live in their own tool.\n- No contrast check. Both members inherit the same lightness, which is the exact case where text over color tends to fail, so pairings have to be verified elsewhere.\n- No ordering or sorting. The strip stays in derivation order, base first, and the two swatches are never ranked by lightness or hue.\n- No lightness or chroma controls. The only input is the base color; every tonal decision belongs to the tints or shades tools afterwards.\n\nUse the pair by assigning roles rather than splitting the space evenly. A reliable pattern keeps one member as the surface and the other as the accent, with the accent confined to a small area, because equal areas of two complements compete and only area settles that competition. Where both members have to carry text, split either one into a lightness ramp first so the pair gains depth to work with. Warning colour work, iconography and sports kits are the classic homes for the rule, since there two colours must be unmistakably distinct at a glance.\n\nAs an opposite color generator this tool gives the raw relationship in a single step, with no wheel to read and no ruler to hold. Choose a base that already sits where you want the set to live, because everything derived here arrives at the base's own weight: a mid-tone base gives a mid-tone complement and a muted base gives a muted one. Keep a note of the base you used, since the complement is reproducible from it and from nothing else.",
    howTo: [
      { step: "Set the base color with the picker or by typing a hex value." },
      { step: "Read the two swatches: the base, then its 180° complement." },
      { step: "Copy the hex value from either swatch." },
    ],
    whenToUse:
      "Use the complementary generator when a decisive two-color contrast is the goal, such as an accent against a surface. The {{split-complementary-palette-generator|split-complementary generator}} trades some of that punch for two softer neighbours, the {{triadic-palette-generator|triadic generator}} adds a third voice, and the {{10-color-palette-generator|10-color palette generator}} lets you compare rules without leaving the page. Verify any text-on-color pairing with the {{contrast-checker|contrast checker}}, and use the {{palette-sorter|palette sorters}} when the strip needs an order.",
    faqs: [
      {
        q: "Why do the two colors look evenly matched in weight?",
        a: "By design. The rule copies the base's lightness and chroma to the complement, so only the hue changes. Vary one side's lightness with the tints or shades tools when a member has to recede.",
      },
      {
        q: "Can I get more than two colors from this tool?",
        a: "No. Complementary is a two-color relationship and the count follows from the rule, so the output is exactly the base and its opposite. For three or four colours, use the triadic or tetradic generator.",
      },
      {
        q: "Is this the same as an HSL complement?",
        a: "Often not. This tool rotates hue in OKLCH, a perceptually uniform space, so the opposite lands where vision expects it. Tools that rotate in HSL or RGB can return a complement that looks tilted or muted.",
      },
      {
        q: "Can I use the two colors as text and background?",
        a: "Check them first. Same-lightness pairs frequently miss contrast thresholds; the contrast checker returns the ratio, and the minimum contrast auto-fixer can nudge one side until it passes.",
      },
      {
        q: "Which swatch is my original color?",
        a: "The first one, on the left, in every case. The complement always follows it, so the base you set is never ambiguous in the strip.",
      },
    ],
  },

  "triadic-palette-generator": {
    keywords: [
      "triadic palette generator",
      "three evenly spaced colors",
      "triadic color scheme",
      "120 degree color harmony",
    ],
    intro:
      "The triadic palette generator builds a three-color scheme from any base: the base plus the two hues 120° and 240° away. It returns three evenly spaced colors and no more.",
    content:
      "A triadic palette generator performs the wheel's equilateral triangle: take the base, add 120 degrees, and add 240. The three resulting hues are evenly spaced, so no member of the triadic color scheme sits next to another and none dominates by geometry. The tool returns three evenly spaced colors, the base first and the two derived hues after it, with the base's lightness and chroma carried through to all three. That even spacing is the source of the set's balance, and it is the reason a triad reads as a committee of equals rather than as a pair with a spare.\n\nThe rotation runs in OKLCH, and hue is the only coordinate that changes. Lightness and chroma are read from the base, so all three swatches carry the same weight and differ only by their 120 degree color harmony positions around the wheel. Because OKLCH is perceptually even, those positions land where the eye expects the triangle to be rather than where a naive RGB rotation would scatter them. The result is the flat, poster-like set triads are known for: three evenly spaced colors held at a single tonal level.\n\n- The spacing is fixed at 120 degrees. There is no control over the triangle's size or rotation beyond choosing the base.\n- The count is fixed at three. There is no count control and no extra leg.\n- No contrast check, so equal-weight hues must be verified elsewhere before they carry text.\n- No ordering or sorting: the strip stays in derivation order, base then plus 120 then plus 240.\n- No lightness or chroma controls. The base is the only input, so ramps are built afterwards with the tints and shades tools.\n\nUse the triad where three equal voices are wanted and none should stand above the others: illustration, poster work, or a small categorical chart. In an interface, assign roles rather than areas. Let one leg take most of the surface, let a second carry the hierarchy, and save the third for the rare moment that must be found quickly, because without a role the three evenly spaced hues compete for the same job. If a palette needs four voices instead of three, the tetradic generator extends the same geometry to a rectangle; if the balance feels too broad, the split-complementary generator settles for a quieter pair.\n\nThe triangle is also the most durable of the small schemes. Because no leg is anyone's neighbour, darkening one for a night mode or desaturating another for print keeps the relationship recognisable under changes that would wreck a pair or a random set, which is why triads hold up in a design system rather than only in a single composition.\n\nThe scheme is also a natural teaching device, because the arithmetic is exact: set a primary red and the triangle lands on the yellow and blue of the school wheel, then move the base and watch all three legs rotate in lockstep. In production the same precision is what makes a triad reproducible, because the two derived hues are a fixed 120 degrees from the base, so a token set built on it can be regenerated from one value without drift. Test the triangle on real content rather than the swatch row, since three equal-weight hues read very differently once one of them is given a large surface.",
    howTo: [
      { step: "Set the base color with the picker or by typing a hex value." },
      { step: "Read the three swatches: base, +120°, +240°." },
      { step: "Copy the hex value of any swatch." },
    ],
    whenToUse:
      "Use the triadic generator when three equal, well-separated hues are the goal and no colour should dominate by geometry. The {{tetradic-palette-generator|tetradic generator}} extends the same idea to four, the {{analogous-palette-generator|analogous generator}} gives a quieter neighbouring run, and the {{split-complementary-palette-generator|split-complementary generator}} suits a base plus two supporting hues. Verify any text pairing with the {{contrast-checker|contrast checker}}, and reach for the {{palette-sorter|palette sorters}} when the strip needs an order.",
    faqs: [
      {
        q: "Why are the three colors equally vivid?",
        a: "The rule copies the base's lightness and chroma to all three legs, so the hue triangle is pure. Real interfaces usually vary lightness across the legs, and the tints and shades tools build those ramps.",
      },
      {
        q: "Which of the three should dominate?",
        a: "Geometry does not decide that, usage does. A common split gives one leg the surface, one the text and one the accents, with the contrast checker confirming which legs can carry text.",
      },
      {
        q: "Is this just any three colors?",
        a: "No. The 120 degree separation is what makes it triadic: the hues are maximally spaced for a three-color set. Three arbitrary colors share none of that balance.",
      },
      {
        q: "Can I start from a colour I already have?",
        a: "That is the intended flow. Set your existing brand or image colour as the base and the other two legs derive from it, keeping the scheme anchored to the colour you must keep.",
      },
      {
        q: "Can I change the count to two or four?",
        a: "No. The triadic color scheme is three colours and the count follows from the rule, with no count control. Two legs is the complementary generator's job and four is the tetradic generator's.",
      },
    ],
  },

  "tetradic-palette-generator": {
    keywords: [
      "tetradic palette generator",
      "four color rectangle harmony",
      "tetradic color scheme",
      "double complementary palette",
    ],
    intro:
      "The tetradic palette generator derives four hues from one base: the base plus 90°, 180° and 270°, forming the wheel's rectangle. It is the widest standard harmony here, and it returns exactly four colors.",
    content:
      "A tetradic palette generator draws the wheel's rectangle: base, base plus 90, base plus 180 and base plus 270. Read another way, that is a double complementary palette, two complementary pairs sharing one wheel, which is why the four color rectangle harmony offers more vocabulary than any other standard scheme. The richness cuts both ways, though. Four strong hues at equal weight compete, and the geometry itself gives no hierarchy to settle the fight, so this is the rule that most rewards discipline.\n\nThe rotation is applied in OKLCH, and hue is the only coordinate that moves. Lightness and chroma come from the base, so all four swatches share a single weight and differ only in where they sit on the wheel, which keeps the tetradic color scheme flat and predictable. Because OKLCH is perceptually even, the rectangle's corners land where the eye expects them. Where the base sits near the ends of the lightness range, the derived values keep its weight rather than darkening or lightening on their own.\n\n- The geometry is fixed at 90, 180 and 270 degrees. The rectangle cannot be stretched or rotated except by changing the base.\n- The count is fixed at four. There is no count control and no fifth colour.\n- No contrast check. Equal-weight hues still need verifying before they carry text.\n- No ordering or sorting: the strip keeps derivation order, base then plus 90 then plus 180 then plus 270.\n- No lightness or chroma controls. The base is the only input, so any ramps are built afterwards with the tints and shades tools.\n\nTreat the rectangle as two pairs rather than four equals. Let one complementary pair carry the dominant load, surface and primary accent, and hold the second pair in reserve for secondary accents, links and states. That reading turns the tetradic color scheme from a shouting match into a system, and it is why the double complementary palette keeps appearing in design systems that need four hue families without descending into rainbow. A rough proportion of seventy, twenty, seven and three works because the eye reads the two largest hues as structure and the two smallest as accents.\n\nFour hues is also the point at which a palette starts to need governance rather than selection. Check the arrangement against real content instead of the swatch row, because four voices only work while three of them stay quiet. If four prove one too many, the triadic generator is the same idea with a point removed, and it is usually the more manageable scheme.\n\nThe rectangle is also a useful frame for a brand system with fixed accents, because the shape is anchored to the base and the two pairs stay a known distance from the brand hue. In practice that makes it possible to reserve one pair for product surfaces and the other for marketing, without either drifting into an unrelated set. Rotating the base lets the same proportions be tried at different temperatures, so the shape can be kept while the mood is swapped, and the whole rectangle can be reproduced later from the base value alone.",
    howTo: [
      { step: "Set the base color with the picker or by typing a hex value." },
      { step: "Read the four swatches: base, +90°, +180°, +270°." },
      { step: "Split the rectangle into two pairs and assign roles before copying values." },
    ],
    whenToUse:
      "Use the tetradic generator when a scheme genuinely needs four hue families anchored to one colour. The {{triadic-palette-generator|triadic generator}} is the same geometry with a point removed and is easier to govern, the {{split-complementary-palette-generator|split-complementary generator}} is the quieter three-colour option, and the {{10-color-palette-generator|10-color palette generator}} lets you compare these rules side by side. Confirm which legs can carry text with the {{contrast-checker|contrast checker}}, and use the {{palette-sorter|palette sorters}} to expose the structure of the strip.",
    faqs: [
      {
        q: "Why is it called a double complementary palette?",
        a: "Because the rectangle is two complementary pairs sharing a wheel: the base and its opposite, plus the two hues 90 degrees either side. The classic tetradic color scheme and the double complementary palette are the same shape.",
      },
      {
        q: "How do I keep four colors from looking chaotic?",
        a: "Treat them as two pairs rather than four equals. Let one pair dominate the surface and the primary accent, and keep the second pair for secondary accents so three of the four hues stay quiet.",
      },
      {
        q: "Can I adjust the angles between the four colors?",
        a: "No. The four color rectangle harmony is fixed at 90, 180 and 270 degrees, and only the base changes the placement. A square arrangement is the same tool started from a different hue.",
      },
      {
        q: "Which of the four should carry text?",
        a: "Whichever the contrast checker approves against its background. Equal-weight hues rarely pass on their own, so darken one leg with the shades tool before assigning it to text.",
      },
      {
        q: "Can I drop down to three colors later?",
        a: "Yes, and often you should. Copy the legs that earned their place into the triadic generator or the palette locker, where a smaller set is easier to govern.",
      },
    ],
  },

  "square-harmony-palette": {
    keywords: [
      "square harmony palette",
      "90 degree color harmony",
      "four evenly spaced hues",
      "square color scheme",
    ],
    intro:
      "The square harmony palette takes one base colour and returns four hues spaced ninety degrees apart — a square inscribed on the colour wheel, anchored wherever your base sits.",
    content:
      "Four hues at even spacing is the most symmetric thing a colour wheel can do, and the square harmony palette produces exactly that from one input. Set a base colour and four swatches appear: the base itself, then the hues ninety, one hundred and eighty and two hundred and seventy degrees around the wheel. Because the spacing is equal, the resulting square color scheme has no dominant member by construction — every hue has the same number of neighbours at the same distance, which is why four-way charts and four-category dashboards reach for it.\n\n- The four slots are the base, +90°, +180° and +270°, in that order.\n- Rotation happens in OKLCH and only hue moves: lightness and chroma are carried over from your base, so the four swatches share one weight.\n- Hue wraps through the full circle, so a base near 300 degrees produces derived hues that continue past 360 rather than clipping.\n- The derivation is deterministic: the same base always returns the same four values, on any machine and in any session.\n\nThe engine behind it is the shared harmony routine this domain uses everywhere: the base is converted to OKLCH once, each derived hue is written back as an oklch string and converted to hex for the strip, and every value is clamped to the valid range. The page presents the tetradic derivation, which is the 90 degree color harmony by another name — the same four evenly spaced hues the tetradic page produces, since all four-square work in this domain runs through one function.\n\nThe set is also easy to reason about when something looks wrong later. Because the angles are equal, a complaint that two colours sit too close is always a complaint about the base's lightness and chroma rather than about the geometry, and the remedy is a tonal step rather than a different rule. Recording the base beside the four values keeps that diagnosis possible months afterwards, when nobody remembers which hue the square started from.\n\n- There is no control beyond the base colour: no spacing, no rotation offset, no count.\n- The order is fixed at base, +90, +180, +270. Nothing sorts or reorders the strip.\n- Equal lightness across four hues does not mean equal legibility. Two of the four can look far closer than the angles suggest, and none of them is checked for text use.\n- No alpha, no neutrals and no lightness ladder: this is a hue set, not a full design system.\n\nUse it when a layout genuinely has four channels that deserve equal weight: a four-series chart, a quad of feature cards, a board with four columns. Where one of the four needs to dominate, the square is the wrong geometry — the triadic set leaves room for an accent and the complementary pair is louder still. Before any of the four carries text, put the pairing through the contrast checker, since even spacing says nothing about readability, and use the palette sorter if the strip has to be ordered by hue or lightness for a legend.",
    howTo: [
      { step: "Set the base colour with the picker field, or type a hex value and let the field normalise it." },
      { step: "Read the four swatches: the base, then the hues at +90, +180 and +270 degrees." },
      { step: "Copy the hex value from any swatch you want to keep." },
      { step: "Check any text pairing from the set with the contrast checker before it ships." },
    ],
    whenToUse:
      "Use this when four categories deserve equal visual weight. The {{rectangle-harmony-palette|rectangle harmony palette}} describes the other four-hue geometry, the {{triadic-palette-generator|triadic generator}} spreads three hues for the same purpose with room left for an accent, and the {{palette-sorter|palette sorter}} orders the result for a legend or a swatch sheet.",
    faqs: [
      {
        q: "Which four hues does it return?",
        a: "The base colour and the hues ninety, one hundred and eighty and two hundred and seventy degrees around the wheel, in that order. All four share the base's lightness and chroma.",
      },
      {
        q: "Is this the same set as the tetradic generator?",
        a: "Yes. Both pages run the same 90-degree derivation from one shared routine, so the same base gives the same four values on either page. The names differ; the engine does not.",
      },
      {
        q: "Does it change lightness or saturation?",
        a: "No. Hue is the only coordinate that moves, so all four swatches sit at the base's weight. If you need depth rather than hue variety, the shade and tint tools are the right next step.",
      },
      {
        q: "Why can two of the four colours look almost identical?",
        a: "Because equal hue spacing says nothing about perceived difference: two yellows ninety degrees apart can read as one colour to most viewers. Assign them to large separate areas or pick a different geometry.",
      },
      {
        q: "Can I rotate the square without changing the base?",
        a: "Not directly — the base anchors the square. To place the square elsewhere, set a different base colour and keep your original as the accent.",
      },
    ],
  },

  "rectangle-harmony-palette": {
    keywords: [
      "rectangle harmony palette",
      "rectangular color scheme",
      "two complementary pairs",
      "four hue rectangle",
    ],
    intro:
      "The rectangle harmony palette is named for the four-hue geometry of two complementary pairs, and it renders the domain's square derivation of ninety-degree spacing — which is worth knowing before you rely on it.",
    content:
      "Colour theory knows two four-hue shapes. The square puts four hues at ninety degrees, all equally spaced. The rectangle uses two complementary pairs placed at unequal angles — one pair at, say, thirty degrees and two hundred and ten, the other at one hundred and twenty and three hundred. This page is named for the rectangle, and it renders the square: set a base colour and you get the base plus the hues at ninety, one hundred and eighty and two hundred and seventy degrees, generated by the same shared routine as the square and tetradic pages.\n\nA four hue rectangle is often the better shape for a product with two complementary jobs — an identity colour and a warning colour, say — because each pair can be separated from the other while the square holds everything equidistant. That is the design argument for the geometry, and it is also why the naming matters here: anyone arriving for the rectangle harmony palette meets the square derivation instead, and the difference only becomes visible once the palette is in use.\n\n- Output: four swatches, evenly spaced at 90-degree intervals, with the base first.\n- The rectangular color scheme as usually defined — two complementary pairs at unequal spacing — is not one of the routines this domain implements.\n- Hue is the only coordinate that changes; lightness and chroma follow the base, so the four share a weight.\n- Hue wraps around the circle rather than clipping, and the derivation is reproducible for a given base.\n\nThe practical consequence is a two-step workflow rather than a one-step one. Use this page to get the first pair and its opposites — the anchors of the two-hue rectangle — and then build the second pair deliberately with the hue tools, choosing the spacing that suits the layout instead of accepting a default. Where the second pair comes from, the hue rotator shifts a colour by a fixed number of degrees and the channel adjusters edit hue directly, so the rectangle can be placed by hand rather than inherited.\n\n- No rectangle mode, no spacing control and no per-pair offset: the geometry is fixed at ninety degrees.\n- No ordering, no count control and no lightness work — every swatch inherits the base's weight.\n- Nothing is checked for readability, and no neutrals are offered to separate hues that sit close together.\n- The page does not warn you that it produced a square; the name is the only place the expectation is set.\n\nReach for it as a starting point rather than as a finished rectangle: the four evenly spaced hues make a usable base, and the two extra angles that turn a square into a rectangle are a small manual step afterwards. Where the four-way split has to be exact, keep the values and adjust them in a hue tool; where the layout is a chart or a colour-coded board, the square derivation is often the better answer anyway. Either way the ordering is your job — the sorter orders by hue, lightness or chroma once the set is final.",
    howTo: [
      { step: "Set the base colour that anchors the first pair." },
      { step: "Read the four evenly spaced swatches the page returns." },
      { step: "Build the second pair deliberately with a hue tool if the layout needs the true rectangle." },
      { step: "Order the finished set with the palette sorter before it goes into a legend or a sheet." },
    ],
    whenToUse:
      "Use this when four hues are needed and the exact geometry is negotiable. The {{square-harmony-palette|square harmony palette}} is the same derivation under its accurate name, the {{hue-rotator|hue rotator}} is how the second pair of a true rectangle gets placed, and the {{palette-sorter|palette sorter}} gives the finished set an order.",
    faqs: [
      {
        q: "Does this page produce a rectangular color scheme?",
        a: "Not strictly. It renders the domain's square derivation — four hues at ninety degrees. A true rectangle uses two complementary pairs at unequal spacing, which has to be built by hand from these anchors.",
      },
      {
        q: "Then why is it called the rectangle harmony palette?",
        a: "The page slug names the geometry it advertises. The component behind it is the shared four-hue routine, so the output is the square; treat the title as a description of intent rather than of behaviour.",
      },
      {
        q: "How do I build the second pair of a rectangle?",
        a: "Take two of the returned hues and rotate them by hand — the hue rotator shifts a colour by a chosen number of degrees, and the channel adjusters edit hue directly. Keep the spacing uneven and the rectangle reads as intended.",
      },
      {
        q: "Is the square set a bad palette?",
        a: "No. It is the most balanced four-hue arrangement available and suits charts and equal-weight categories. It simply is not a rectangle, and the two are used for different moods.",
      },
      {
        q: "Does the page check that the four colours can be told apart?",
        a: "No. Equal angles do not guarantee perceptual separation, and nothing here measures it. Put the pairs through a contrast check before they carry text.",
      },
    ],
  },

  "random-palette-generator": {
    keywords: [
      "random palette generator",
      "random five color palette",
      "surprise palette",
      "roll a palette",
    ],
    intro:
      "The random palette generator rolls five independent colours per press — no harmony rule, no register, just a surprise palette to react to.",
    content:
      "Unconstrained randomness is a legitimate design tool, and the random palette generator is the plainest version of it. One press rolls a random five color palette; each swatch is an independent draw, so the five have no relationship to each other by construction and no relationship to any earlier roll. There is nothing to configure and nothing to remember, which is exactly what makes it useful at the start of a project when the problem is not having an opinion yet.\n\nThe page is a button and a strip. It arrives with one roll already generated, filling a grid that runs two columns wide on a phone and five across on a desktop, and the button re-rolls the whole set rather than one swatch. Each swatch shows its hex value, ready to copy.\n\n- Five independent colours per roll, drawn without a harmony constraint.\n- A fresh set on page load, and a full re-roll on every press of the button.\n- Nothing is seeded, stored or shared, so no two visits produce the same set.\n- The values are ordinary hex strings and can be copied straight into any tool that follows.\n\nIt helps to have a way to judge a roll quickly: look for one value that could carry a surface, one that could carry an accent and one that could carry text. Rolls that supply all three are rare, and that rarity is the useful signal — a surprise palette is a source of individual colours, so the roll a palette habit is best spent collecting them rather than waiting for a finished set.\n\nThe honest weaknesses are the reason curated registers exist. A draw that is uniform across the channel space puts a lot of mass in the muddy middle: the set will often contain two near-neighbours by accident, one colour that looks desaturated next to the rest, and nothing dark enough to serve as a surface. That is not a defect of the generator; it is what unconstrained randomness looks like, and it is why the pastel, neon and earth-tone generators pin a register instead.\n\n- - No reproducibility: there is no seed, so a roll you liked cannot be regenerated exactly. Copy the values you want to keep.\n- No coordination between swatches: no complementary or analogous structure is imposed, and none is guaranteed to emerge.\n- No neutrality: the set seldom contains a usable background or a neutral for text.\n- No text-safety signal: nothing here reports contrast, so every pair has to be checked before it carries copy.\n\nTreat it as an idea generator with a short memory. Roll until something catches, copy the two or three swatches that earned their place, and build the rest deliberately: the shade and tint tools for depth from the keepers, the sorter to give the strip an order, and the register-specific generators when the brief already says soft, electric or earthy. When a roll is nearly right, keep the good slots and re-roll the rest rather than restarting from nothing, which is how a random page turns into a real palette.",
    howTo: [
      { step: "Open the page and respond to the roll that is already there." },
      { step: "Press generate to roll a fresh five-colour set; repeat until something catches your eye." },
      { step: "Copy the hex values worth keeping before rolling again, since the old set is not recoverable." },
      { step: "Build the rest deliberately — neutrals, shades and an order — from the keepers." },
    ],
    whenToUse:
      "Use this when you want options rather than a rule — early exploration, mood boards, a fresh angle on a stale brief. The {{daily-color-palette-generator|daily palette generator}} is the same roll with a day-sized frame around it, the {{pastel-palette-generator|pastel palette generator}} pins the opposite register when the brief already says soft, and the {{palette-locker|palette locker}} is where keepers go while the rest of the set is re-rolled.",
    faqs: [
      {
        q: "Are the five colours coordinated in any way?",
        a: "No. Each swatch is an independent random draw with no harmony rule applied, so any coordination that appears in a roll is coincidence rather than design.",
      },
      {
        q: "Can I reproduce a set I liked?",
        a: "No — there is no seed and nothing is stored. Copy the hex values you want before pressing generate again, because the previous roll cannot be recovered.",
      },
      {
        q: "Why do random sets so often look muddy?",
        a: "Because a uniform draw across channel space spends a lot of its range on desaturated mid-tones. Registers like pastel and neon exist precisely to pin the output away from that middle.",
      },
      {
        q: "Does it guarantee a dark colour or a neutral for text?",
        a: "It guarantees nothing. A roll is just as likely to be all mid-tones as to include a usable surface, so plan on adding a neutral from the shade tools.",
      },
      {
        q: "Can I lock colours from one roll and roll the others?",
        a: "Not in this page — every press replaces all five. Copy the keepers elsewhere first, then roll again and build the set around them.",
      },
    ],
  },

  "palette-locker": {
    keywords: [
      "palette locker",
      "shuffle a palette",
      "lock colors and shuffle",
      "palette order",
    ],
    intro:
      "The palette locker is an editable five-colour list with one action: shuffle. It reorders the palette so a familiar set is seen in a new sequence — the name promises more than the page does.",
    content:
      "The palette locker is a small workbench with an honest limitation worth stating first: despite a name that suggests you can lock colors and shuffle the rest, the page does not hold anything. What it provides is an editable palette — five rows, each with a colour field and a remove button, plus an add button that appends a fresh random colour — and a single shuffle action that reorders the rows.\n\nThat is still useful, because order is a design decision that is easy to stop noticing. A palette sorted by hue reads as a ramp; the same five values in a shuffled order can suggest a different hierarchy, and seeing the set out of sequence is often what surfaces the two colours that were doing the same job.\n\nOrder also changes what a palette communicates. Sorted by hue, five colours read as a spectrum and invite comparison between neighbours; shuffled, the same values read as a set and the eye picks out the outlier. Shuffle a palette a few times and whichever colour keeps drawing attention is usually the one that should become the accent, which is a cheap way to let the palette make the decision. Where the arrangement has to be defended rather than noticed, sort for palette order instead of shuffling: a rule a reader can follow is worth more than a fresh sequence in a template or a style guide.\n\n- Each row is independently editable: change a value with the colour field or remove the row entirely.\n- Add color appends a new slot seeded with a random colour, so a palette can grow past five.\n- Shuffle reorders the existing values; it never changes or invents a colour.\n- Nothing persists between visits: the page returns to its default set on reload.\n\nThe shuffle is worth understanding precisely, because the implementation is a comparator sort rather than a card shuffle. Each comparison returns a random sign, which randomises the sequence but not uniformly: the outcome is biased towards its starting order, so some colours can remain near where they began. Nothing breaks — the palette is still reordered — but if the goal is a clean random permutation, a Fisher–Yates shuffle is the stronger tool, and this one is best used for a fresh look rather than for statistical exercise.\n\n- No lock or freeze control exists, so a colour cannot be pinned while the others move.\n- No undo: removing a row or editing a value is immediate and unrecoverable in the page.\n- No ordering by any property — the sorter is where hue, lightness and chroma ordering live.\n- No export: the confirmed palette has to be copied out value by value.\n\nUse it as a working palette on screen while you decide what the set actually is. Where a real lock-and-reroll loop is needed, hold the keepers elsewhere — a second tab of this page, or an imported palette of values you have already approved — and roll the rest against that fixed list. Where the goal is a defensible order rather than a new one, sort by hue or lightness instead of shuffling; a legend and a swatch sheet both want a rule, not a roll.",
    howTo: [
      { step: "Edit the rows to the palette you are working on, or press Add color to extend the list." },
      { step: "Press shuffle to see the same values in a new order and notice what the original order was hiding." },
      { step: "Copy out the values you want to keep; nothing is saved between visits." },
      { step: "Sort rather than shuffle once the palette needs an order that a reader can follow." },
    ],
    whenToUse:
      "Use this when a palette feels settled but its order may not be. The {{palette-sorter|palette sorter}} gives the set a defensible order by hue, lightness or chroma, the {{random-palette-generator|random palette generator}} is where the raw colours come from, and the {{palette-comparison|palette comparison}} tool is the better way to judge two arrangements side by side.",
    faqs: [
      {
        q: "Can I lock a colour and shuffle the others?",
        a: "No. The page has no lock control, so a colour cannot be pinned while the rest move. Keep a fixed list elsewhere and roll a second working copy against it.",
      },
      {
        q: "Does shuffle change the colours?",
        a: "Never. It only reorders the rows, so the palette contains exactly the values you put in, in a different sequence.",
      },
      {
        q: "Is the shuffle order truly random?",
        a: "It is randomised by a comparator sort rather than a uniform shuffle, so the result leans towards the starting order. Treat it as a fresh look rather than as a random permutation.",
      },
      {
        q: "Is my palette saved when I leave the page?",
        a: "No. Nothing persists, and the page returns to its default five colours on the next visit. Copy the values out before navigating away.",
      },
      {
        q: "What is the difference between shuffling and sorting a palette?",
        a: "Shuffling gives a new sequence with no rule behind it; sorting applies one — by hue, lightness or chroma. A reader can follow a sort; a shuffle is a fresh perspective for you.",
      },
    ],
  },

  "single-color-to-full-palette": {
    keywords: [
      "single color to full palette",
      "palette from one color",
      "hue band",
      "five swatch family",
    ],
    intro:
      "The single color to full palette tool spreads one colour across a sixty-degree hue band, returning five swatches at fifteen-degree steps with your base in the middle.",
    content:
      "One colour in, five colours out, and the shape of the spread is the whole story. The single color to full palette tool derives its set by rotating hue only: the strip runs from thirty degrees below your base to thirty above, in steps of fifteen, with the base itself occupying the middle slot. Nothing else about the colour changes — the derived swatches keep the base's lightness and chroma, so the five read as one family at one weight rather than as a ramp.\n\n- The five slots are the hues at -30°, -15°, the base, +15° and +30°, in that order.\n- Rotation happens in OKLCH, so the fifteen-degree steps are perceptually even rather than even only on paper.\n- Hue wraps through the full circle, which keeps bases near the ends of the wheel from clipping.\n- Lightness and chroma are inherited, and the derivation is deterministic for a given base.\n\nIt is a hue band rather than a tonal ladder, so this five swatch family shares a single weight — that is both its appeal and its main constraint. The name promises a full palette; what it delivers is a family, and knowing which of the two you need is the difference between a finished strip and one that still has work to do.\n\nA sixty-degree span is the classic analogous zone, and that is what this page is: a palette from one color that stays inside a single neighbourhood of the wheel. It is not a lightness ladder. That distinction matters, because the two produce very different palettes from the same base — a lightness ladder varies how light or dark a single hue is, while this tool varies the hue while holding the tonal weight constant. If your goal for the palette was depth (light surfaces, dark text, states in between), a shade or tint tool built on the same base is the one that will deliver it.\n\nThe results are best judged at the size they will be used. Fifteen degrees apart at one lightness is a subtle difference by design, and on small chips some of the five can be indistinguishable; on large surfaces the same five separate clearly. That is not a bug in the maths, it is the nature of a narrow band, and it is why the strip works well for atmospheric surfaces and poorly for tiny colour-coded dots.\n\n- Only five slots, all fixed: there is no count control and no way to widen the band.\n- No tonal variation: every swatch sits at the base's lightness and chroma, so there is nothing here for a surface, a border or a text colour.\n- No ordering or sorting, and no contrast reading of any kind.\n- No alpha handling, so translucent and solid steps are not part of the output.\n\nUse it when the base colour is already right and the palette simply needs company: a hero surface with two neighbours, a card background and its hover, a chart that steps gently through one family. Pair it with a tonal tool for anything that has to hold text, and use the analogous generator when you want the same idea structured as a rule rather than as a band you configure yourself.",
    howTo: [
      { step: "Set the base colour with the picker field." },
      { step: "Read the five swatches: two hues below the base, the base in the middle, two above." },
      { step: "Copy the hex values you want, remembering that all five share one tonal weight." },
      { step: "Add depth from a shade or tint tool if the palette has to carry surfaces or text." },
    ],
    whenToUse:
      "Use this when one anchor colour needs a small, subtle family around it. The {{analogous-palette-generator|analogous generator}} builds the same neighbourhood as a fixed three-hue rule, the {{color-tints-generator|tints generator}} and its shade counterparts supply the tonal depth this band deliberately lacks, and the {{palette-sorter|palette sorter}} orders the family once it is chosen.",
    faqs: [
      {
        q: "Is this a lightness ladder?",
        a: "No. Lightness and chroma stay with the base; only hue moves, at fifteen-degree steps across a sixty-degree band. Depth has to come from a shade or tint tool.",
      },
      {
        q: "Why do some of the five look identical?",
        a: "Because a narrow hue band at one lightness produces subtle differences. They separate on large surfaces and disappear on small ones, which is a property of the band rather than of the tool.",
      },
      {
        q: "Can I choose how wide the band is?",
        a: "Not on this page — the span is fixed at plus and minus thirty degrees. Wider hue variety comes from the harmony generators, which move in much larger steps.",
      },
      {
        q: "Does the base stay in the palette?",
        a: "Yes, in the middle slot. That makes the tool useful for extending a brand colour without changing it, because the anchor is always present in the strip.",
      },
      {
        q: "Will these five work as text and background pairs?",
        a: "Not on their own. Every swatch shares one tonal weight, so pairs of them have little contrast. Bring in a tonal step before using any of them for text.",
      },
    ],
  },

  "5-color-palette-generator": {
    keywords: [
      "5 color palette generator",
      "five color palette",
      "harmony rule count",
      "monochromatic five",
    ],
    intro:
      "The 5 color palette generator opens the base-plus-harmony workbench at a five-slot brief, and the honest detail is that only one of its six rules actually returns five colours.",
    content:
      "Most real palettes are small — four to six slots covering a surface, a couple of accents and a text colour — so a five-slot brief is common. This page answers it with the domain's standard workbench: one base colour, one harmony rule, and a strip of swatches whose length the rule decides. The rules available are the six this family always offers, and their counts are fixed, which is the fact worth knowing before starting: only the monochromatic rule delivers a five color palette, because it is the only one that varies lightness instead of hue.\n\nStarting from the count rather than from the rule is how this page earns its keep. Ask which of the six covers the brief, then check its harmony rule count before touching the base: the 5 color palette generator reaches five slots only through the monochromatic five, whose lightness steps of 0.15 and 0.30 sit either side of the base. A brief that asks for a vibrant five usually means five hues, which none of these rules produces, and knowing that in advance turns a mismatch into a decision instead of a surprise.\n\n- Complementary — the base and its opposite, two swatches.\n- Analogous — the neighbours thirty degrees either side, three swatches.\n- Triadic — a hundred and twenty degrees apart, three swatches.\n- Split-complementary — a hundred and fifty and two hundred and ten degrees, three swatches.\n- Tetradic — ninety degrees apart, four swatches.\n- Monochromatic — the base's own hue at lightness steps of -0.30, -0.15, 0, +0.15 and +0.30, clamped at the ends: five swatches.\n\nAll of the hue rules work in OKLCH and move hue alone, so their swatches keep the base's lightness and chroma; the monochromatic rule is the one that keeps hue and moves lightness. That difference is why \"five colours\" and \"a harmonious five\" are not the same request: the hue rules give you a family of related hues at one weight, while monochromatic gives you a single hue across five weights that can carry surfaces and states.\n\n- No slot count control. The harmony rule is the specification, and five is the ceiling rather than a setting.\n- The four hue rules return fewer than five, so the page cannot fill the brief by itself for those rules.\n- No neutrals and no text colour: nothing in the output is chosen for readability.\n- No ordering, no export and no alpha handling.\n\nReach for monochromatic when the brief is genuinely five slots and the palette should carry surfaces as well as accents — its five lightness steps map onto backgrounds, borders and text in a way a hue family cannot. Reach for a hue rule when the five colours are five things rather than five levels, and plan to complete the set with a neutral and a text colour from the tonal tools. Either way, record which rule produced the strip: two rules can land close together, and the rule is the part that makes the palette reproducible after the fact, when two sets sit side by side in a review and only one of them matches the brief.",
    howTo: [
      { step: "Set the base colour with the picker field." },
      { step: "Choose a harmony rule from the dropdown; the strip changes length to match the rule." },
      { step: "Pick monochromatic if the brief needs five swatches rather than a hue family." },
      { step: "Complete the palette with a neutral and a text colour from the tonal tools before shipping it." },
    ],
    whenToUse:
      "Use this when a brief specifies five slots and the harmony is still open. The {{8-color-palette-generator|8 color palette generator}} and the {{10-color-palette-generator|10 color palette generator}} are the same workbench for larger briefs, the {{color-shades-generator|shades generator}} extends any of these sets into a tonal ladder, and the {{contrast-checker|contrast checker}} is the check before the palette carries text.",
    faqs: [
      {
        q: "Does every rule return five colours?",
        a: "No. Complementary returns two; analogous, triadic and split-complementary return three; tetradic returns four; and only monochromatic returns five, by varying lightness instead of hue.",
      },
      {
        q: "So how do I get exactly five colours for my brief?",
        a: "Pick monochromatic, or choose a hue rule for the hue structure and add a neutral plus a text colour from the tonal tools. The page will not pad a set to a requested count.",
      },
      {
        q: "Which rule is best for a UI palette?",
        a: "Monochromatic, usually. Five lightness steps of one hue map onto surfaces, borders and text; a hue family does not, because every member sits at the same weight.",
      },
      {
        q: "Can I request a different number of slots?",
        a: "No. The rule fixes the count, and five is the maximum this workbench produces. Larger briefs go to the eight and ten colour pages, which run the same engine.",
      },
      {
        q: "Does the page check contrast for the set?",
        a: "It does not. Nothing in the output is measured for readability, so send any pair that carries text through the contrast checker before it ships.",
      },
    ],
  },

  "8-color-palette-generator": {
    keywords: [
      "8 color palette generator",
      "eight color palette",
      "layer a palette",
      "neutrals and accents",
    ],
    intro:
      "The 8 color palette generator takes a base colour and a harmony rule from the shared workbench, which means it hands you hue anchors for an eight-slot brief rather than eight swatches.",
    content:
      "Eight slots is where a palette stops being a set of colours and starts being a system: a couple of hue families, several neutrals, and states layered on top. The 8 color palette generator approaches that from the only direction this family knows — one base colour plus one harmony rule — and its ceiling is five swatches, because that is what the rules produce. Understanding the gap is the useful part of the page: the harmony strip supplies the hue anchors, and the remaining slots are a layering job rather than a generation one.\n\nThe six rules and their counts are fixed. Complementary returns two swatches, analogous three, triadic three, split-complementary three, tetradic four, and monochromatic five lightness steps of the base hue. The four hue rules hold lightness and chroma steady while moving hue, so they describe families; the monochromatic rule holds hue and moves lightness, so it describes levels.\n\nThinking in layers rather than in colours is what makes an eight color palette generator unnecessary as a generator and useful as an anchor source: layer a palette by deciding first how many neutrals and accents it needs, then filling the hue slots from the swatches this page returns. Two hue families, three or four neutrals and one accent is a shape that holds together at eight slots far more often than eight hues ever will.\n\n- Hue anchors: use a hue rule and treat its swatches as the family heads of the eight-slot system.\n- Tonal layers: extend each anchor with the shade and tint tools to get surfaces, borders and hover states at the same hue.\n- Neutrals: pull a low-chroma version of the base hue rather than a pure grey, so the eight slots feel related even where they are quiet.\n- States: derive hover and active variants from one of the tonal steps instead of inventing a new colour.\n\nThe reason an eight-slot palette usually fails is not a shortage of colours but a shortage of hierarchy. Eight equally saturated hues read as noise; eight slots that include two hue families, three or four neutrals and one accent read as a design. That is why this page is more useful as an anchor generator than as a finished palette: it gives you the two or three colours that carry identity, and the layering work supplies the rest.\n\n- It cannot return eight colours. Five is the maximum, and only monochromatic reaches it.\n- No neutrals, no text colour and no state variants are generated anywhere on the page.\n- No ordering, no export, no contrast readings.\n- No persistence: the strip is rebuilt from the current base and rule on each visit.\n\nUse it when the brief names eight slots and you need the hue decisions made quickly: pick the family heads here, then build the ladder from them with the tonal tools, and place the neutral where the layout needs a surface rather than where the wheel suggests one. Check the pairs that carry text as you go, because a system's readability is decided by its quietest slots rather than its loudest.",
    howTo: [
      { step: "Set the base colour and choose the harmony rule whose hue family suits the product." },
      { step: "Treat the returned swatches as the anchors of the eight-slot system rather than as the whole palette." },
      { step: "Extend each anchor into light and dark steps with the shade and tint tools." },
      { step: "Add a low-chroma neutral derived from the base hue, then check every text pair before shipping." },
    ],
    whenToUse:
      "Use this when a brief names eight slots and the hue decisions have to be made first. The {{5-color-palette-generator|5 color palette generator}} and the {{10-color-palette-generator|10 color palette generator}} are the same workbench at other briefs, the {{color-shades-generator|shades generator}} and the {{color-tints-generator|tints generator}} supply the layers an eight-slot system needs, and the {{palette-balance-analyzer|palette balance analyzer}} checks whether the finished set is weighted sensibly.",
    faqs: [
      {
        q: "Does this page return eight colours?",
        a: "No. The harmony rules produce between two and five swatches, so eight is a brief the page cannot fill on its own. It supplies hue anchors for a larger system.",
      },
      {
        q: "What belongs in the remaining slots of an eight-colour palette?",
        a: "Usually three or four neutrals, one or two tonal steps per hue anchor and a state variant. Those come from the shade, tint and tone tools rather than from a harmony rule.",
      },
      {
        q: "Should the neutrals be pure grey?",
        a: "A low-chroma version of a hue already in the palette usually looks more coherent than pure grey, because it carries a trace of the family into the quiet parts of the interface.",
      },
      {
        q: "Why do eight-hue palettes so often look chaotic?",
        a: "Because hierarchy collapses when every slot competes. Systems keep identity colours to two or three and let neutrals and tonal steps occupy the rest.",
      },
      {
        q: "Can I save the set from this page?",
        a: "No. Nothing persists, and the strip is rebuilt from the base and rule each visit. Copy the anchors before moving to the tonal tools.",
      },
    ],
  },

  "10-color-palette-generator": {
    keywords: [
      "10-color palette generator",
      "harmony palette generator",
      "palette from a base color",
      "analogous and triadic palettes",
    ],
    intro:
      "The 10-color palette generator turns one base color and one harmony rule into a small related set of swatches. It returns between two and five colors — the rule fixes the count rather than a setting — each shown with its hex value.",
    content:
      "The 10-color palette generator is a harmony palette generator: you set one base color, choose one harmony rule, and the whole set derives from that single pair of inputs. Nothing in the result is random, so the same two inputs always return the same swatches, and your base color is always one of them. The rule alone decides how many colors come back, and every rule reads from that same base, so the set stays recognisably one family.\n\n- Complementary — one hue 180° from the base (2 colors).\n- Analogous — the base plus ±30° either side (3 colors).\n- Triadic — 120° and 240° from the base (3 colors).\n- Split-complementary — 150° and 210° from the base (3 colors).\n- Tetradic — 90°, 180° and 270° from the base (4 colors).\n- Monochromatic — no hue rotation; lightness steps of ±0.15 and ±0.30 from the base, clamped at the ends (5 colors).\n\nThe rotation happens in OKLCH, and hue is the only coordinate that moves: lightness and chroma are read from the base, so every derived swatch is as light and as saturated as the color you set, and the strip holds together because the values differ by hue rather than by weight — that is what makes a palette from a base color coherent. Because OKLCH is perceptually even, the rotated hues land where the eye expects them rather than where a naive RGB turn would drop them. Because the maths is fixed, the same base and rule reproduce the same set on any device. Your base is always present in the strip: first for complementary, triadic, tetradic and split-complementary, and in the middle for analogous and monochromatic.\n\n- There is no count control. The harmony rule is the only thing that sets how many colors appear, and five is the maximum, so the tool cannot return eight or ten however its name reads.\n- No contrast check. It gives no text-safety reading, so any derived pair that carries text has to be verified elsewhere before it ships.\n- No ordering. The swatches arrive in derivation order and are never sorted, so a set can easily hold two colors too close to tell apart.\n\nPick the rule by how many colors the job needs rather than by taste. Two suit an accent and its companion; three suit a small chart series or badge set, and both triadic and split-complementary deliver three evenly separated hues. Four or five come from tetradic and monochromatic, the two rules built for that many values. Where the relationship is already decided, a single-rule finder gets to the answer in one step; this page is for choosing between the rules.\n\nBecause the 10-color palette generator draws everything from one base and one rule, changing either input regenerates the whole set — useful while a brand color is fixed and the palette around it is still open: hold the base, try analogous and triadic palettes until the strip behaves the way the layout needs, then copy the hex values worth keeping. Where a lighter variant of one hue is wanted instead of a second hue, a lightness ladder is the better derivation. Note which rule produced a set, since two rules can land close together and the record is what makes the derivation reproducible later.",
    howTo: [
      { step: "Set the base color with the picker or by typing a hex value into the field." },
      { step: "Choose a harmony rule from the dropdown — complementary, analogous, triadic, tetradic, split-complementary or monochromatic." },
      { step: "Read the swatch strip: the rule decides how many colors appear and which hues they are." },
      { step: "Copy the hex value from any swatch you want to keep." },
    ],
    whenToUse:
      "Use this when one fixed base color has to produce a small related set and you want to compare rules side by side: an accent pair, a three-color chart series, a badge set. The single-rule finders — {{complementary-palette-generator|complementary}}, {{analogous-palette-generator|analogous}}, {{triadic-palette-generator|triadic}}, {{tetradic-palette-generator|tetradic}}, {{split-complementary-palette-generator|split-complementary}} and {{monochromatic-palette-generator|monochromatic}} — run the same derivations one rule at a time, which is easier once the relationship is already decided. The {{5-color-palette-generator|5-color}} and {{8-color-palette-generator|8-color}} palette generators open the identical base-plus-harmony workbench at a fixed count, which suits a brief that starts from a target size rather than from a harmony.\n\nUse the {{contrast-checker|contrast checker}} before shipping any derived pair that carries text, and the {{palette-sorter|palette sorters}} when the strip needs an order. For a subtler set that stays inside one neighbourhood of the wheel, the {{single-color-to-full-palette|single-color-to-full-palette tool}} spreads the same base across a sixty-degree band at fixed lightness.",
    faqs: [
      {
        q: "How many colors does it return, and what decides the count?",
        a: "Two to five. The harmony rule sets it: two for complementary, three for analogous, triadic and split-complementary, four for tetradic, five for monochromatic. A specific count cannot be requested.",
      },
      {
        q: "Why is it called the 10-color palette generator if it returns at most five?",
        a: "The name comes from the page slug rather than from the output. The tool cannot return eight or ten colors, so treat the title as a page name and the harmony rule as the specification.",
      },
      {
        q: "Does it change lightness or saturation, or only hue?",
        a: "For every rule except monochromatic it changes only hue: rotations run in OKLCH with the base's lightness and chroma preserved, so the derived swatches match the base's weight. Monochromatic varies lightness instead, in steps of 0.15.",
      },
      {
        q: "Does the tool check contrast or order the swatches?",
        a: "No. It performs no contrast check, no text-safety reading and no sorting, so a derived set can hold two colors too close to distinguish. Run the pair through the contrast checker, and use the palette sorters when the strip needs an order.",
      },
      {
        q: "Can I copy the palette into CSS all at once?",
        a: "Not in this view — each swatch copies its own hex value. When a whole set has to reach code, the palette exporters in this category produce a ready-to-paste block for CSS, Tailwind or design tokens.",
      },
    ],
  },

  "pastel-palette-generator": {
    keywords: [
      "pastel palette generator",
      "soft pastel colors",
      "random pastel palette",
      "high lightness low chroma",
    ],
    intro:
      "The pastel palette generator rolls five hues and pins every one at lightness 0.88 with chroma 0.08, so each press produces soft pastel colors from a register rather than from taste.",
    content:
      "Pastel is a register, not a hue, and the pastel palette generator enforces that distinction mechanically. Each press rolls five random hues and then places every one at OKLCH lightness 0.88 with chroma 0.08. The hues are genuinely unpredictable; the tone is not. That split is what makes a random pastel palette reliable: two presses share no colours and still look like members of one family, because the only free variable is the hue circle.\n\n- Fixed by the tool: five swatches, lightness 0.88, chroma 0.08.\n- Left to chance: the five hues, drawn independently across the full circle.\n- One press on load, and a complete re-roll each time the button is pressed.\n- Each swatch shows its hex value; there is no copy block and no CSS output on this page.\n\nThe arithmetic runs in OKLCH rather than HSL for a specific reason. Lightness in OKLCH tracks perceived brightness, so 0.88 is a real statement about how pale the result looks, while an HSL lightness of 88 percent can still look vivid on some hues and washed out on others. Chroma 0.08 sits comfortably inside the sRGB gamut for every hue, which is why nothing here clips or muddies: the extreme hues stay clean instead of turning into approximations of themselves. The strip is generated after the component mounts, so the server and the browser never disagree about which colours were rolled.\n\n- No hue coordination: the five colours have no relationship to each other, only to the register.\n- High lightness means weak contrast against white. These colours are surfaces and scrims, not text.\n- Nothing in the strip is dark enough to serve as a border, an icon colour or a heading.\n- No CSS output, no alpha and no save: the values are copied swatch by swatch.\n\nAnother way to read the register is as a two-variable constraint: high lightness low chroma is what the eye reports as pastel, and both halves are needed. Raise lightness without capping chroma and the colours turn candy-bright; cap chroma without raising lightness and they become dusty earth tones. The tool applies both at the same values every time, which is why the roll produces soft pastel colors by construction rather than by opinion.\n\nUse it where softness is the requirement — a marketing surface behind dark text, a seasonal card, a hero that must not compete with its own copy — and add the dark half of the palette deliberately, since the register cannot supply it. The neon generator is this page's opposite bet with the same random-hue mechanism, the tints tool extends one chosen hue into pastel territory by hand, and the accessible palette generator is the way to find text colours that survive on top of whatever you roll. Because a roll cannot be reproduced, the palette worth keeping is the one you copy out by hand at the moment you like it rather than the one you plan to roll again later. That habit is the whole craft of working with a random register.",
    howTo: [
      { step: "Open the page and read the roll that is already there — five pastel-register swatches." },
      { step: "Press the button to roll five new hues; the register stays fixed while the colours change." },
      { step: "Copy the hex values worth keeping before rolling again, because the previous set is not recoverable." },
      { step: "Choose text and borders separately: this register supplies surfaces, not legible foregrounds." },
    ],
    whenToUse:
      "Use this when the brief says soft rather than when it says a colour. The {{neon-palette-generator|neon generator}} is the loud opposite register with the same mechanism, the {{color-tints-generator|tints generator}} lightens one chosen hue into pastel territory by hand, and the {{accessible-palette-generator|accessible palette generator}} finds foreground colours that pass on the light surfaces this page produces.",
    faqs: [
      {
        q: "What exactly is fixed, and what is random?",
        a: "Lightness at 0.88, chroma at 0.08 and the count of five are fixed; the five hues are random. The register never drifts, whatever the roll produces.",
      },
      {
        q: "Why can two rolls share no colours and still match?",
        a: "Because tone rather than hue is what a pastel family shares. Both rolls sit at the same lightness and chroma, which is the register the eye reads as pastel.",
      },
      {
        q: "Can these colours carry text?",
        a: "Not against white. Lightness 0.88 leaves very little headroom, which is why the register suits surfaces and needs a dark companion for anything that has to be read.",
      },
      {
        q: "Does it offer a chromatic scale or a palette size option?",
        a: "No. Five swatches at one register is the whole tool, and there is no count control, no hue constraint and no export beyond copying values individually.",
      },
      {
        q: "How do I get a pastel version of my brand colour specifically?",
        a: "Set that hue by hand in the tints tool instead: it raises lightness while keeping the hue and chroma you started from, rather than rolling an unrelated set.",
      },
    ],
  },

  "neon-palette-generator": {
    keywords: [
      "neon palette generator",
      "vibrant neon colors",
      "high chroma roll",
      "dark backdrop",
    ],
    intro:
      "The neon palette generator rolls five hues at lightness 0.75 and chroma 0.3, the vivid edge a screen can show, so every press produces vibrant neon colors against a dark surface.",
    content:
      "Neon is the opposite register from pastel, and the neon palette generator gets there the same way: fix the tone, randomise the hue. Each press draws five hues and places every one at OKLCH lightness 0.75 with chroma 0.3. That chroma sits at the edge of what an sRGB display can represent, which is what a high chroma roll is for — the colours read as emissive rather than merely saturated, the visual shorthand screens use for glowing gas tubes they cannot actually emit.\n\n- Fixed by the tool: five swatches, lightness 0.75, chroma 0.3.\n- Left to chance: the five hues, drawn independently.\n- A roll on load and a full re-roll on each press of the button.\n- No preset, no CSS block and no alpha: the strip is a set of hex values to copy individually.\n\nChroma 0.3 is not reachable for every hue in sRGB, and that is where the register gets interesting. Hues near the primaries and their intermediates — vivid green, cyan, magenta — convert cleanly; hues whose maximum chroma falls short get their channels clipped during conversion, so some rolls land closer to a rich saturated colour than to true neon. The clipping is not a defect but it is visible, and it explains why two presses can feel different in intensity even though the parameters never changed. Values are printed as hex, the sRGB reduction of the requested colour rather than the request itself.\n\n- Out-of-gamut requests are clipped per hue, so intensity varies between rolls.\n- The strip supplies accents only. Nothing in it is dark enough to be the surface neon needs.\n- Contrast on white is poor and unchecked; these colours are for dark backgrounds.\n- No export, no count control and no way to lock a hue you liked before re-rolling.\n\nSeen on a dark backdrop, these values gain apparent luminance, because the dark surface suppresses everything except the colour itself — the reason a set that looks gaudy on a white mock becomes convincing at night. Placement is the whole craft of the register: vibrant neon colors earn their keep as thin strokes, small badges and single accents rather than as large type or full-width fills.\n\nUse it where visibility is the job: an accent on a near-black dashboard, a call to action that has to out-shout a busy page, a poster that will be viewed on a phone at night. Pair it with the dark-mode palette generator for the surface it needs, and check text pairs with the contrast checker, because a colour that reads as light on black can still fail as text. Where the brief wants softness instead, the pastel generator is the same mechanism at the other end of the register. One practical habit helps either way: decide the surface before judging the accents, because a neon roll is only ever as good as the darkness it is shown against. Judge it there, never on the white preview the page opens on.",
    howTo: [
      { step: "Open the page for the roll already generated, or press the button for a new set of five hues." },
      { step: "Copy the accents worth keeping — the set is not stored and cannot be re-rolled back." },
      { step: "Set a near-black or deep navy surface from the dark-mode generator to judge them properly." },
      { step: "Check any text pairing against the contrast checker before shipping it." },
    ],
    whenToUse:
      "Use this when visibility matters more than calm — accents, highlights and nightlife-facing surfaces. The {{pastel-palette-generator|pastel palette generator}} pins the quiet end of the same axis, the {{dark-mode-palette-generator|dark mode palette generator}} supplies the surface neon needs to read as light, and the {{contrast-checker|contrast checker}} verifies any pair that has to carry text.",
    faqs: [
      {
        q: "Why do some rolls look less electric than others?",
        a: "Because chroma 0.3 is outside the sRGB gamut for many hues. Those colours are clipped during conversion, so the result is a rich saturated colour rather than a true neon.",
      },
      {
        q: "Are these real neon colours?",
        a: "No screen emits gas-tube light. What the register simulates is the vivid edge of sRGB, which is as close as a display gets and is what neon means in screen design.",
      },
      {
        q: "Why must the background be dark?",
        a: "High-chroma colours only read as emissive against something much darker; on white they vibrate at the edges and lose authority. The dark-mode generator supplies the right surface.",
      },
      {
        q: "Can I keep one hue and re-roll the others?",
        a: "Not here — every press replaces all five swatches. Copy the keepers out first, then roll again and build around them.",
      },
      {
        q: "Is the strip safe to use as text colour?",
        a: "Not automatically. Brightness and chroma say nothing about legibility, so measure any pairing with the contrast checker rather than judging from the swatch.",
      },
    ],
  },

  "earth-tone-palette-generator": {
    keywords: [
      "earth tone palette generator",
      "warm natural colors",
      "muted earthy palette",
      "natural color scheme",
    ],
    intro:
      "The earth tone palette generator builds five colours from a fixed run of warm hues with a lightness ramp from 0.35 to 0.65 and chroma rolled between 0.06 and 0.14 — warm natural colors with a controlled weight.",
    content:
      "The earth tone palette generator is a themed preset rather than a random register, and the difference shows in what stays constant. It draws from a fixed run of hues — 30, 50, 80, 20 and 10 — climbs a lightness ramp from 0.35 at the first swatch to 0.65 at the last, and rolls each colour's chroma somewhere between 0.06 and 0.14 on every regenerate. The result is a natural color scheme whose shape never changes and whose weight shifts slightly each time.\n\n- Hues: 30, 50, 80, 20 and 10 — warm ochre, gold, olive and clay territory, in that order.\n- Lightness: a straight ramp across the strip, 0.35, 0.425, 0.5, 0.575 and 0.65.\n- Chroma: rolled independently per swatch within the band 0.06 to 0.14.\n- Output: five uppercase hex values, plus a CSS block of --color-1 through --color-5 custom properties with a copy button.\n\nSeparating the deterministic parts from the random one is what makes the palette usable in a project. The hue order and the lightness ramp mean the strip always reads as soil to sand, darkest first, so the tokens can be assigned to roles with confidence: the first swatch is a surface, the last is a light accent, and the middle three are body colours. Only the chroma is rolled, which is the part a viewer notices least — a muted earthy palette stays recognisably itself whether the roll comes in grey or warm. Regenerate and the ordering holds.\n\nThat is why the strip is best described as warm natural colors with a memory. Roll it a dozen times and the palette's identity stays put while its warmth moves within a narrow range; a colour chosen from one roll will still sit comfortably beside a colour chosen from the next, which is not true of a fully random palette. That consistency is what lets the preset serve as a design token source rather than as a mood board of one-off ideas, and it matters when a palette has to survive several rounds of review.\n\n- No preset selector on this page: the component holds a single preset, so the only control is Regenerate.\n- No complementary or cool colour by design, so pairing the set with something contrasting is a manual job.\n- Nothing beyond the ramp ends: no deep ink below lightness 0.35 and no near-white above 0.65.\n- The CSS block carries hex values only — no contrast guidance, no roles and no tokens for a dark theme.\n\nReach for it when warmth is the brief: packaging that echoes paper and pigment, a botanical or food brand, a surface that must not look synthetic. Because the ramp supplies both a dark and a light end, it covers surfaces and accents without help; bring in a deep neutral only if the layout needs a near-black. The forest generator is the same machinery tuned green, the beach generator is the cool coastal counterpart, and the vintage generator trades this palette's saturation for a faded, printed warmth.",
    howTo: [
      { step: "Open the page; the first roll is already generated from the preset's hues and ramp." },
      { step: "Press Regenerate to roll new chroma values while the hue order and the lightness ramp hold." },
      { step: "Copy the CSS custom-property block, or lift individual hex values from the swatches." },
      { step: "Assign the darkest swatches to surfaces and the lightest to accents before editing anything." },
    ],
    whenToUse:
      "Use this when the palette should feel warm and material rather than digital. The {{forest-nature-palette-generator|forest palette generator}} applies the same preset machinery to greens, the {{ocean-beach-palette-generator|beach palette generator}} is the cool coastal version, and the {{vintage-retro-palette-generator|vintage retro generator}} takes the warmth in a faded, printed direction.",
    faqs: [
      {
        q: "What does Regenerate actually change?",
        a: "Only the chroma of each swatch, rolled within the band 0.06 to 0.14. The hues, their order and the lightness ramp are fixed by the preset.",
      },
      {
        q: "Why is the first swatch always the darkest?",
        a: "Because lightness follows the strip index: 0.35 at the first swatch rising to 0.65 at the last. That ramp is what makes the tokens assignable to roles.",
      },
      {
        q: "Can I add a cool colour to contrast with the set?",
        a: "Not from this page — the preset holds warm hues only. Bring one in from the complementary generator or take a deep navy from the shades tools.",
      },
      {
        q: "Is there a preset dropdown on these themed pages?",
        a: "Only where a component holds several presets. Each themed page here holds exactly one, so the selector is hidden and Regenerate is the single control.",
      },
      {
        q: "Does the CSS block include anything beyond hex values?",
        a: "No. It writes --color-1 through --color-5 as uppercase hex custom properties and offers one copy button; roles, themes and contrast notes are yours to add.",
      },
    ],
  },

  "daily-color-palette-generator": {
    keywords: [
      "daily color palette generator",
      "palette of the day",
      "random palette roll",
      "fresh palette",
    ],
    intro:
      "The daily color palette generator frames a fresh five-colour roll as a palette of the day, though the implementation is the same unseeded random roll used by the random palette page.",
    content:
      "A palette of the day is a pleasant ritual: open the page, meet five colours you did not choose, and see whether anything in them is useful. The daily color palette generator provides the ritual and not much more. Behind the page-length framing there is a single unseeded random roll — five independent hex values, generated when the page loads and re-rolled by one button — so nothing about the output is tied to the calendar. Reload twice in a minute and you will meet two different palettes.\n\n- Five swatches per roll, each drawn independently with no harmony rule.\n- One roll on load, and a complete re-roll on each press of the button.\n- No date, no seed and no history: the page has no memory of yesterday's set and cannot return to it.\n- The output is plain hex values, ready to copy into anything else.\n\nTelling the truth about that matters because the day-based framing quietly promises reproducibility — the idea that a palette belongs to a date and can be looked up again. It cannot. A genuinely daily palette needs a stored value: choose the roll you liked, copy the values into an imported palette or a note, and the day's palette becomes something you own rather than something the page remembers. The same trick turns a set of rolls into a proper series, which is what most people actually want from a daily habit.\n\n- The name suggests a schedule the page does not keep; there is no difference between this page and the random palette page in what it produces.\n- Nothing is reproducible: no seed, no history, no way to re-open the same set.\n- No register control, so rolls land wherever uniform randomness lands — often in muted mid-tones.\n- No contrast or readability check, and no neutral is guaranteed in a roll.\n\nIf the ritual is what you are after, the frictionless version is to keep the list rather than expecting the page to remember. Take one random palette roll, copy the values that interest you, and let a collection grow; a fresh palette every day then belongs to you, and the page stays what it is — a source of unexpected colours with no memory at all. The same advice covers the reverse case too: when a brief needs a palette that can be regenerated from a decision, choose a tool that derives from an input rather than one that rolls dice.\n\nTreat it as a low-friction way to collect colours you would not have picked. Keep a file of the rolls worth keeping, curate later rather than at the moment of rolling, and use the tonal tools to turn one interesting swatch into something buildable. Where the brief already has a register — soft, electric, earthy — the themed generators are the better source, and where the palette needs to be reproducible from a single input, the base-plus-harmony workbench is the tool that guarantees it every time. Where the brief names a season, a register or a mood instead, let the themed generators carry that decision and keep this page for the days when no decision has been made yet.",
    howTo: [
      { step: "Open the page for the day's roll — the palette is generated on load." },
      { step: "Press the button for a fresh set if the first roll says nothing to you." },
      { step: "Copy the swatches worth keeping into a note or an imported palette, since the roll is not recoverable." },
      { step: "Curate the collection later and develop one keeper with the tonal tools." },
    ],
    whenToUse:
      "Use this as a lightweight habit for collecting colours you would not otherwise try. The {{random-palette-generator|random palette generator}} is the identical roll without the daily framing, the {{palette-importer|palette importer}} is where the keepers belong if the series should survive, and the {{seasonal-palette-generator|seasonal palette generator}} is the themed option when the palette should follow the calendar rather than the dice.",
    faqs: [
      {
        q: "Is the palette tied to today's date?",
        a: "No. The roll is unseeded and happens on page load, so the set is not derived from the calendar and two reloads in the same minute will differ.",
      },
      {
        q: "Can I look up yesterday's palette again?",
        a: "No. Nothing is stored and there is no seed, so a set cannot be recovered. Recording the values you like is the only way to keep them.",
      },
      {
        q: "How is this different from the random palette generator?",
        a: "In output, not at all — both roll five independent colours from the same routine. The difference is the daily framing, which suits a habit rather than a task.",
      },
      {
        q: "Is the palette suitable for a whole interface?",
        a: "Rarely as it stands. A roll can be all mid-tones with no surface or neutral, so expect to add a dark and a neutral from the tonal tools before it can carry a layout.",
      },
      {
        q: "What is a better source for a palette that must be reproducible?",
        a: "The base-plus-harmony workbench: one base colour and one rule reproduce the same set on any machine, which is what a design system needs and a random roll cannot provide.",
      },
    ],
  },
};
