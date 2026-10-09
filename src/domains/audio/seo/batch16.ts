/**
 * AUTO-GENERATED — do not edit by hand.
 *
 * Source: src/domains/audio/seo/source/batch-16-audio-effects-a.json
 * Regenerate: node scripts/audio-json-to-seo.mjs src/domains/audio/seo/source/batch-16-audio-effects-a.json <this file> audioSeoBatch16
 * Validate first: node scripts/validate-audio-seo-json.mjs src/domains/audio/seo/source/batch-16-audio-effects-a.json
 */
import type { ToolSeo } from "@/components/shared/seo-types";

export const audioSeoBatch16: Record<string, ToolSeo> = {
  "reverb-simulator": {
    keywords: [
      "Schroeder",
      "damped combs",
      "tail",
      "damping",
    ],
    intro:
      "Reverb Simulator puts a room around a recording using the classic algorithmic topology rather than a recording of a real space. Four damped combs and two allpasses build a tail whose length and colour you set.",
    content:
      "Choose a file, set the four controls, and apply; the result is a WAV as long as the source plus the tail.\n\nThe controls:\n\n- A room size from half to double, defaulting to one, which scales the comb delays and therefore the spacing of the early reflections.\n- A sustain figure from sixty to ninety percent, defaulting to seventy five, which is the feedback in the comb loops.\n- A damping frequency from one to eight kilohertz, defaulting to four, in steps of two hundred and fifty hertz.\n- A mix from nothing to everything, defaulting to thirty percent, with nothing meaning an exact dry passthrough.\n\nThe topology is the one Manfred Schroeder described in 1961: four parallel comb filters, each with its own delay and a damped feedback path, then two allpass filters in series to smear the result into something that does not sound like a set of discrete echoes. That combination is what still defines what people mean by an algorithmic plate. The parallel damped combs are where the tail comes from: each one recirculates its own delayed copy of the signal, and the feedback determines how long it takes to decay, so the sustain control is really a decay length control. Damping is applied inside each comb's loop, so each pass through the filter discards a little high frequency, which is why a real tail gets darker as it fades and why damping is what makes the difference between a bright plate and a distant hall. The size control changes the comb delays themselves, which moves the spacing of the early reflections and so changes the perceived dimensions of the room rather than merely its decay. The reported decay figure is deliberately described as a rough estimate, because it is computed from the size and feedback settings rather than measured from the rendered tail, and the output is exactly the source length plus two seconds, allowing for the tail to run past the end of the material. What the tool is not is a sampler of real rooms: it has no early-reflection pattern from an actual space, so it will not convince anyone that a voice was recorded in a cathedral, but it will put a smooth, tunable space behind anything.\n\nWhat it does not do:\n\n- No convolution with a real impulse response, so it cannot reproduce a specific space.\n- No pre-delay control.\n- The decay figure shown is an estimate from the settings rather than a measurement.\n- No separate control of early reflections and tail.\n- No modulation of the tail, so long decays can sound slightly static.\n- Output is sixteen bit WAV with two seconds of tail appended.\n\nUse it for the ordinary job of putting a little space behind a dry recording: a vocal that needs to sit back, a drum bus that wants glue, or a synth that needs to sound less like it was made on a laptop. When the aim is to match a specific room rather than to invent one, the convolution reverb uses a measured impulse instead, and when the question is which decay length will not fight the tempo, the reverb time calculator answers that before any processing happens.",
    howTo: [
      { step: "Drop an audio file onto the panel and wait for it to decode." },
      { step: "Set the room size and sustain for the decay length you want." },
      { step: "Set the damping for how bright the tail should be, and the mix for how much of it to hear." },
      { step: "Apply the reverb and download the WAV, which includes two seconds of tail." },
    ],
    whenToUse:
      "Reverb Simulator is the tool for adding an invented space behind dry material with full control of its decay and colour. {{convolution-reverb|Convolution Reverb}} uses a measured impulse response instead, which is the right choice when a specific space has to be matched. {{hallway-room-simulator|Hallway Room Simulator}} is the quicker one-purpose option, and {{reverb-time-calculator|Reverb Time Calculator}} works out the decay figures that will not smear across the beat.",
    faqs: [
      {
        q: "Why does the output have a tail added?",
        a: "Because a reverb continues after the source stops. The comb loops keep recirculating until the feedback is damped away, so the output is the source length plus two seconds to hold that decay. Cutting it at the end of the source would clip the tail off mid-decay.",
      },
      {
        q: "What does damping actually change?",
        a: "How much high frequency is lost on each pass through the comb loops. With heavy damping the tail goes dark quickly, which reads as a large distant hall; with light damping it stays bright, which is the plate character. It is the control that decides the colour of the tail rather than its length.",
      },
      {
        q: "Why is the reported decay only an estimate?",
        a: "Because it is computed from the size and feedback settings rather than measured from the rendered audio. It is close enough to choose settings by, and it is honest about being an approximation, but a real time to fall sixty decibels would have to be measured from the output.",
      },
      {
        q: "Is mix at zero really dry?",
        a: "Yes, exactly. At zero the dry signal passes through untouched, which is a useful reference point: set the control to zero, apply, and compare against the file you started with to confirm nothing else has changed.",
      },
      {
        q: "How much reverb should I use on a vocal?",
        a: "Under forty percent is the usual advice, which leaves the words in front of the space rather than inside it. If the voice starts to sound distant, the mix is too high; if the tail is audible as a separate sound, the decay or the size is too long.",
      },
    ],
  },

  "echo-delay-generator": {
    keywords: [
      "feedback",
      "taps",
      "delay time",
      "presets",
    ],
    intro:
      "Echo Delay Generator repeats a sound at a chosen interval, with feedback setting how many repeats follow. It is the simplest way to add depth or a rhythmic echo to a recording.",
    content:
      "Set the delay time, the feedback and the echo level, drop a file, and process; the panel reports how many repeats fell inside the file.\n\nThe controls:\n\n- A delay time from twenty to twelve hundred milliseconds in five millisecond steps, defaulting to two hundred and fifty.\n- Four presets naming the usual musical settings: a slapback at eighty milliseconds, an eighth note at two hundred and fifty, a dotted eighth at three hundred and seventy five, and a quarter note at five hundred.\n- A feedback control from nothing to ninety five percent in five percent steps, defaulting to thirty five.\n- An echo level from nothing to everything, defaulting to forty percent, which sets how loud the echoes are against the dry sound.\n\nThe arithmetic is short enough to write out. Each output sample is the dry sample plus the echo level multiplied by the echo signal at that point, and the echo signal is the dry sample from one delay earlier plus the feedback multiplied by the echo from one delay earlier. That recursion produces a tap at every whole multiple of the delay time, with amplitudes that fall by the feedback factor each time, so a feedback of thirty five percent gives repeats at the set level, then thirty five percent of that, then thirty five percent of that again. The panel reports how many of those taps actually fall inside the file, counted as the largest whole multiple of the delay that fits, and it also gives the summed tap energy: a geometric series which is the honest measure of how much echo has accumulated at any moment. That count is worth looking at, because a long delay on a short file produces one or two repeats at most, and the tail beyond the end is simply dropped rather than appended as it is with a reverb. The presets exist because the delay time is usually chosen against a tempo rather than by ear, and the four named settings cover the intervals that come up most often. Feedback above about ninety percent starts to sound less like echo and more like a sustained tone, since the repeats stop decaying at a rate the ear can follow.\n\nWhere it is limited:\n\n- No tempo detection, so the musical presets assume the usual hundred and twenty.\n- Repeats past the end of the file are dropped rather than appended.\n- No ping-pong routing between the channels.\n- No filtering of the repeats, so each one is as bright as the dry sound.\n- Feedback is capped below the point where the recursion could run away.\n- Output is sixteen bit WAV.\n\nUse it to put a slapback behind a vocal, to add rhythmic depth to a guitar, or to make a single hit feel like a pattern. When the repeats should be worked out against a tempo rather than guessed at, the delay time calculator gives the note divisions, and when the repeats should be smeared into a space instead of staying distinct, the reverb simulator is the tool for that.",
    howTo: [
      { step: "Drop an audio file onto the panel." },
      { step: "Set the delay time, using a preset if you want a musical interval." },
      { step: "Choose the feedback for how many repeats should follow and the echo level for how loud they are." },
      { step: "Press process and check the reported number of repeats that fit inside the file." },
    ],
    whenToUse:
      "Echo Delay Generator is the tool for discrete repeats, which is what makes it rhythmically useful. {{reverb-simulator|Reverb Simulator}} and {{convolution-reverb|Convolution Reverb}} smear the repeats into a space instead. When the delay time has to be a note division rather than a guess, {{delay-time-calculator|Delay Time Calculator}} supplies it, and {{chorus-effect|Chorus Effect}} uses much shorter delays to thicken a sound rather than to repeat it.",
    faqs: [
      {
        q: "Why does the panel tell me how many repeats fit?",
        a: "Because a delay only produces as many repeats as the file has room for. A five hundred millisecond delay on a three second file gives five repeats at most, and everything after that falls past the end. Knowing the count is the quick way to see whether the effect will be heard as an echo pattern or as a single tap.",
      },
      {
        q: "What does the summed tap energy figure mean?",
        a: "It is the total of the repeats' amplitudes, which for a constant feedback is a geometric series. At a hundred percent echo level and high feedback the total grows quickly, which is the arithmetic reason a heavily fed delay can build up to something much louder than the dry signal.",
      },
      {
        q: "How do I get a rhythmic echo rather than a wash?",
        a: "Choose a delay time that is a note division of the tempo, keep the feedback moderate so the repeats are countable, and keep the echo level below the dry sound. A dotted eighth at a moderate feedback is the classic setting for a wide, rhythmic repeat.",
      },
      {
        q: "Why is feedback capped?",
        a: "Because at a hundred percent the loop would never decay, and above it the recursion would grow without limit and the output would run away into noise. The cap keeps the effect inside the range where it behaves predictably.",
      },
      {
        q: "Can I make the repeats darker than the original?",
        a: "Not with this tool, since each repeat is a copy of the dry signal at a reduced level. To soften them, apply a gentle equaliser or the old tape effect to the whole result, which colours the repeats and the dry sound together.",
      },
    ],
  },

  "chorus-effect": {
    keywords: [
      "doubling",
      "low frequency oscillator",
      "depth",
      "mix",
    ],
    intro:
      "Chorus Effect thickens a sound by mixing it with a slightly delayed, gently swept copy of itself. The result sits close enough to the original to fuse with it and far enough away to sound like a second performance.",
    content:
      "Choose a file, set the sweep rate, depth and mix, and apply; the report confirms the settings and warns if the output had to be limited.\n\nThe controls:\n\n- A rate from a tenth of a hertz to eight, defaulting to one and a half, which is the speed of the sweep.\n- A depth from nothing to twelve milliseconds, defaulting to five, which is how far the delay moves either side of its resting point.\n- A mix from nothing to everything, defaulting to fifty percent, which is the balance between the dry signal and the swept copy.\n- A fixed fifteen millisecond base delay that is not exposed, because it is the value that makes a chorus sound like doubling rather than like a flange.\n\nThe mechanism is a delay line whose length is modulated by a low frequency oscillator, and a few details decide whether the result is usable. The base delay sets the character: around fifteen milliseconds the copy is heard as a second voice, while delays of a few milliseconds or less produce the comb-filtered sweep of a flanger instead. The depth is the amount of movement, and it is deliberately small, since a large sweep turns a doubling effect into an obvious wobble. The oscillator's phase is coherent across the channels, which means both sides move together rather than independently; that keeps the stereo image stable, whereas independent modulation would smear the image and make the effect sound wide but unfocused. The mix balances the two signals, and at nothing the dry signal passes through exactly, so a zero mix is a genuine bypass rather than an approximation. Because the two signals are added rather than blended in turn, the summed peak can exceed full scale on material that is already loud, and the report says so when the output had to be limited. That limiting only occurs when the sum would have clipped, so it is a safety measure rather than part of the effect.\n\nWhat it does not do:\n\n- No independent modulation per channel, which is deliberate.\n- No additional voices, so the result is two-part doubling rather than a full ensemble.\n- No filter or tone control on the copied signal.\n- The base delay is fixed rather than adjustable.\n- No control over the oscillator's shape.\n- Output is sixteen bit WAV.\n\nUse it to make a single-tracked vocal sound like two takes, to thicken a synth pad, or to add movement to a clean guitar part. When the delay should be short enough to comb rather than to double, the flanger and the phaser produce that sweep, and when the aim is to widen an existing stereo image rather than to add a copy, the stereo widener does that without adding a signal. A chorus works best on a single voice or a single instrument rather than on a full mix, since every element it touches acquires the same movement, and a part that is already thick can end up sounding indistinct once a second copy is added to it.",
    howTo: [
      { step: "Drop an audio file onto the panel and let it decode." },
      { step: "Set the rate for how fast the copy should move and the depth for how far." },
      { step: "Set the mix to balance the copy against the dry sound." },
      { step: "Apply the chorus, listen for any limiting in the report, and download the WAV." },
    ],
    whenToUse:
      "Chorus Effect is the tool for thickening one part into two, which is why it sits behind most doubled vocals and chorused guitars. {{flanger-effect|Flanger Effect}} and {{phaser-effect|Phaser Effect}} use much shorter delays, or none at all, to sweep the frequency response instead. To make an existing stereo image wider without adding a copy, {{stereo-widener|Stereo Widener}} is the direct tool, and {{echo-delay-generator|Echo Delay Generator}} produces repeats long enough to be heard as separate events.",
    faqs: [
      {
        q: "Why does a chorus use a fifteen millisecond delay?",
        a: "Because that is the region where the copy is heard as a separate voice rather than as a filter. Shorter delays let the copy interfere with the original and produce comb filtering, which is the flanger's territory; longer ones separate into a distinct echo. Fifteen milliseconds sits in the narrow band between them.",
      },
      {
        q: "What happens if the depth is very high?",
        a: "The pitch of the copy moves further as it is swept, because changing the length of a delay line changes the pitch of what it outputs. That is heard as an obvious wobble rather than as doubling, which is why the depth control tops out at a modest figure.",
      },
      {
        q: "Why do both channels move together?",
        a: "Because independent modulation would move the two sides apart and smear the stereo image. A coherent oscillator keeps the image where it was while still adding movement, which is the effect a chorus is supposed to produce on a mix rather than a spread.",
      },
      {
        q: "Why might the output be limited?",
        a: "Because the dry signal and its copy are summed, and on already-loud material the sum can pass full scale. The report tells you when that happened. Lowering the mix reduces the risk, since less of the copy is being added to the original.",
      },
      {
        q: "Does a zero mix change anything at all?",
        a: "No. At zero the dry signal is passed through exactly, which makes it a useful way to confirm that the processing is behaving as expected. It also means the effect can be dialled in gradually from a known-clean starting point.",
      },
    ],
  },

  "flanger-effect": {
    keywords: [
      "comb",
      "feedback",
      "sweep",
      "depth",
    ],
    intro:
      "Flanger Effect sweeps a short delay against the original and feeds the result back, which produces a comb of resonant peaks that slides up and down. It is the jet-plane whoosh rather than the chorus's doubling.",
    content:
      "Choose a file, set the sweep rate, depth, feedback and mix, and apply; the report gives the settings and notes any limiting.\n\nThe controls:\n\n- A rate from a twentieth of a hertz to five, defaulting to a third of a hertz, which is a slow sweep.\n- A depth from nothing to five milliseconds, defaulting to two, so the delay moves within a very short range.\n- A feedback from nothing to ninety percent, defaulting to sixty.\n- A mix from nothing to everything, defaulting to seventy percent.\n- A fixed one millisecond base delay, which together with the depth is what makes this a flanger rather than a chorus.\n\nThe difference between this and a chorus is almost entirely one of scale, and the consequence is large. With a delay of a millisecond or two, the copy and the original interfere across the whole audible band, producing a comb of evenly spaced peaks and notches that moves as the delay changes; because the spacing is harmonic, the ear hears the sweep as a single resonating tone climbing and falling, which is the effect's whole character. The feedback is what makes it resonant rather than merely hollow: the delayed signal is fed back into the delay, so each tooth of the comb is reinforced repeatedly, and the impulse response settles into amplitudes that fall by the feedback factor at each multiple of the delay. That is why high feedback with a slow sweep produces the classic jet whoosh, and why the panel keeps the control below the point where the comb would begin to sustain on its own. The sweep rate decides whether the effect is heard as movement or as a static colour: a very slow rate makes the material sound as though it is passing through a fixed resonance, while a faster one is unmistakably a sweep. Depth sets how far the teeth travel, and a larger depth moves the peaks further apart as the sweep runs. The mix brings the processed signal forward against the dry one, and at nothing the dry passes through exactly.\n\nWhere it stops:\n\n- No independent control of the sweep shape.\n- Feedback is capped below the point of self-oscillation.\n- No stereo offset between the channels, so both sides sweep together.\n- No tempo synchronisation, so the rate has to be set against the music by ear.\n- The base delay is fixed rather than exposed.\n- Output is sixteen bit WAV.\n\nUse it on guitars, synth pads, drum loops or anything that benefits from movement: the effect is at its best when the sweep is slow enough to be felt rather than noticed. When the goal is doubling a single part rather than colouring it, the chorus uses a longer delay to produce a second voice instead, and when the notches need to be unevenly spaced rather than harmonic, the phaser is the tool that produces them. The effect is at its most convincing when the sweep is slow enough to sit under the music rather than on top of it, which is why rates below one hertz are the useful half of the range.",
    howTo: [
      { step: "Drop an audio file onto the panel." },
      { step: "Set a slow rate and a small depth to hear the character before pushing either." },
      { step: "Raise the feedback for resonance, remembering that past eighty percent the comb begins to howl." },
      { step: "Set the mix and apply, then check the report for limiting." },
    ],
    whenToUse:
      "Flanger Effect is the tool for a moving resonance, which suits clean guitars, synth pads and anything that wants a whoosh. {{chorus-effect|Chorus Effect}} uses a longer delay to produce doubling rather than filtering, and {{phaser-effect|Phaser Effect}} sweeps allpass notches that are unevenly spaced. When the effect is applied rhythmically, {{echo-delay-generator|Echo Delay Generator}} with a slow rate can be timed against the music, and {{stereo-widener|Stereo Widener}} changes the width without adding movement.",
    faqs: [
      {
        q: "What is the difference between a flanger and a chorus?",
        a: "The length of the delay. A chorus delays the copy by about fifteen milliseconds so it is heard as a second voice; a flanger delays it by a millisecond or two, so it interferes with the original and becomes a comb filter. The feedback control then makes the flanger resonant, which a chorus does not need.",
      },
      {
        q: "Why does high feedback sound like a howl?",
        a: "Because feedback reinforces each tooth of the comb repeatedly, so the resonance grows sharper and more sustained. Past about eighty percent the effect stops sounding like a filter and starts behaving like a resonating body of its own, which is why the control stops below the point of self-oscillation.",
      },
      {
        q: "Why can I not set a very fast sweep?",
        a: "Because the rate range is chosen for the effect's musical use. Very fast modulation of a short delay turns into a vibrato-like pitch wobble rather than a sweep, and the depth control already reaches far enough to make the effect obvious at a slow rate.",
      },
      {
        q: "Does the flanger work on a mono file?",
        a: "Yes, since the operation is on the signal itself rather than on the difference between channels. It is often more dramatic on stereo material only because the sweep is heard against a wider image, not because the effect requires two channels.",
      },
      {
        q: "How is the comb spacing determined?",
        a: "By the delay length. Notches appear at frequencies whose half-wavelength matches the delay, so a one millisecond delay spaces them about five hundred hertz apart, and the spacing grows as the sweep shortens the delay. That even spacing is what distinguishes the flanger from the phaser.",
      },
    ],
  },

  "phaser-effect": {
    keywords: [
      "allpass",
      "notches",
      "stages",
      "sweep",
    ],
    intro:
      "Phaser Effect sweeps a chain of allpass filters against the dry signal, which places notches at unevenly spaced frequencies. The movement is a swirl rather than a whoosh.",
    content:
      "Drop a file, set the rate, the number of stages and the mix, and apply; the report gives the stage count and the frequency range the sweep covers.\n\nThe controls:\n\n- A rate from a twentieth of a hertz to five, defaulting to half a hertz.\n- A stage count from one to eight, defaulting to four.\n- A mix from nothing to everything, defaulting to seventy percent.\n- A fixed sweep range from three hundred hertz to four kilohertz that the notches travel through, with the mix setting the depth of the notches.\n\nThe chain is a series of first-order allpass sections whose corner frequency is swept by a low frequency oscillator. An allpass filter changes the phase of a signal without changing its level, which means the dry and processed signals can be added together and cancel wherever the phase difference reaches half a cycle. That cancellation is where the notches come from. Each section contributes its own phase shift, and because each stage's corner is scaled from the same base frequency, the resulting notches are spaced unevenly rather than at multiples of a single frequency, which is the audible distinction between a phaser and a flanger: a flanger's comb teeth are harmonic and its sweep sounds like a resonating tone, while a phaser's notches are irregular and its sweep sounds like a swirl. Adding stages adds notches and deepens the effect, so the stage control goes from a gentle shimmer at one or two stages to a full phase sweep at eight. Mix sets how much of the processed signal is added, and the two extremes of the spectrum are worth knowing about, since at direct current and at the very top of the band the chain comes back into phase with the dry signal and the result settles at one minus the mix regardless of how many stages are in the chain. At zero mix the dry signal therefore passes exactly.\n\nWhat it does not offer:\n\n- No control of the sweep range, which is fixed.\n- No feedback path, so the notches stay broad rather than becoming resonant.\n- No per-channel offset, so both sides sweep together.\n- No selection of the allpass section type.\n- No tempo synchronisation of the rate.\n- Output is sixteen bit WAV.\n\nUse it on electric piano, clean guitar, pads and vocals where a gentle swirl is wanted rather than an obvious effect; with few stages and a low mix it is one of the least obtrusive ways to add movement. When the notches should be harmonic and reinforced by feedback, the flanger is the right tool, and when the movement should be amplitude rather than phase, the tremolo produces that with a single control. A phaser is also worth trying where a flanger feels too aggressive, since its notches are broader and its movement is harder to place as a distinct sound, and on material that already has a lot going on that restraint is often what makes the difference between an effect and an intrusion.",
    howTo: [
      { step: "Drop an audio file onto the panel." },
      { step: "Start with a slow rate and four stages, which is the familiar setting." },
      { step: "Add stages for more notches and a deeper swirl." },
      { step: "Set the mix and apply, lowering the mix if the sweep becomes too obvious." },
    ],
    whenToUse:
      "Phaser Effect is the tool for a smooth phase swirl whose notches are unevenly spaced, which is why it suits electric piano and clean guitars. {{flanger-effect|Flanger Effect}} produces a harmonic comb with feedback instead. {{chorus-effect|Chorus Effect}} doubles a part rather than filtering it, and {{equalizer|Equalizer}} shapes the spectrum statically rather than moving it.",
    faqs: [
      {
        q: "Why does a phaser sound different from a flanger?",
        a: "Because the notches are spaced differently. A flanger's notches sit at multiples of a single frequency, which the ear hears as a resonating tone, while a phaser's come from several allpass sections with scaled corners and land unevenly, which is heard as a swirl rather than a pitch.",
      },
      {
        q: "What does adding stages do?",
        a: "Each section contributes phase shift, so more sections mean more notches and a deeper effect. One or two stages give a subtle movement; four is the familiar setting; eight makes the sweep pronounced enough to dominate a part.",
      },
      {
        q: "Why does the tool not let me change the sweep range?",
        a: "Three hundred hertz to four kilohertz is the region where the effect is heard on most material, and fixing it keeps the control surface to the three settings that change the character. A different range would mostly move the swirl to where there is less content to act on.",
      },
      {
        q: "Why does the mix control matter so much?",
        a: "Because the notches are produced by adding the processed signal to the dry one, so the mix sets their depth. At a low mix the effect is a gentle colouration; at a high mix the notches are deep and the phase movement is unmistakable.",
      },
      {
        q: "Is a phaser useful on a whole mix?",
        a: "It is usually a colouring effect for a part rather than for a mix, since applying movement across everything can make the whole thing sound unstable. When the aim is a wider stereo image rather than a swirl, the stereo widener is the more suitable tool.",
      },
    ],
  },

  "tremolo-effect": {
    keywords: [
      "raised cosine",
      "amplitude",
      "rate",
      "depth",
    ],
    intro:
      "Tremolo Effect makes the level rise and fall at a steady rate. It is a single dimension of movement applied to a sound, with the shape fixed and only the speed and amount to choose.",
    content:
      "Set the speed and the depth, drop a file, and process; the level swings between the original and a reduced value at the chosen rate.\n\nThe controls:\n\n- A speed from half a hertz to twelve, in half hertz steps, defaulting to four.\n- Four presets at two, four, six and eight hertz, covering the range from a slow swell to a flutter.\n- A depth from nothing to everything, defaulting to fifty percent, which is how far the level drops at the bottom of each cycle.\n\nThe modulation is a raised cosine, which means the gain follows a smooth curve between one and one minus the depth rather than moving linearly or switching. The choice of shape matters more than it might appear. A raised cosine has no corners, so the level arrives at the bottom of each cycle and leaves it gradually, which is what keeps the effect from sounding mechanical or adding a click. The oscillation never reaches zero unless the depth is at its maximum and the shape is smooth there as well, so nothing is ever switched off. Because the modulation is applied to the amplitude of the signal rather than to a delay line, the pitch and the frequency content are entirely untouched. That is what separates a tremolo from a vibrato, which modulates pitch instead, and from a chorus or flanger, which modulate a delay and therefore produce either doubling or comb filtering. The rate is the character: a couple of hertz reads as a slow swell, around five is the classic guitar amplifier tremolo, and above about eight the effect becomes a fast flutter that can add a nervous quality to a sustained part. Depth is the amount, and moderate settings are more useful than extreme ones on material that already has movement of its own. At zero depth the gain is one everywhere, so the signal passes through unchanged.\n\nWhat it does not do:\n\n- Only amplitude modulation, with no pitch or filter movement.\n- No synchronisation to a tempo, so the rate has to be chosen against the music by ear.\n- No control over the modulation shape.\n- No stereo offset between the channels.\n- No synchronisation with other effects.\n- Output is sixteen bit WAV.\n\nUse it to add movement to a sustained part that would otherwise be static: a held organ chord, a synth pad, a clean guitar arpeggio or a rhodes. When the modulation should move the pitch rather than the level, the vibrato is the counterpart, and when the movement should come from a filter sweep driven by the material itself, the auto-wah responds to the playing rather than to an oscillator. Tremolo is also one of the few effects that can be applied to a whole recording without drawing attention to itself, provided the depth stays shallow: at a few per cent the sense of movement is felt rather than heard, which is the intended use for a setting this subtle. The rate is what decides how the movement reads, and the useful test is to listen to whether it settles into the music or fights it; a rate that lands between the beats is harder to ignore than one that sits on them.",
    howTo: [
      { step: "Drop an audio file onto the panel." },
      { step: "Set the speed, using a preset if a familiar tremolo rate is what you want." },
      { step: "Set the depth for how much the level should drop at the bottom of each cycle." },
      { step: "Process the file and listen for whether the rate sits with the music." },
    ],
    whenToUse:
      "Tremolo Effect is the tool for level movement on a sustained part, which is why it suits held chords and pads. {{vibrato-effect|Vibrato Effect}} moves the pitch instead, which is the other half of the same idea. {{auto-wah|Auto-Wah}} sweeps a filter according to what is played rather than at a fixed rate, and {{chorus-effect|Chorus Effect}} adds movement by doubling the part rather than by modulating its level.",
    faqs: [
      {
        q: "What is the difference between tremolo and vibrato?",
        a: "Tremolo varies the level and vibrato varies the pitch. The two are often confused because amplifier makers have historically labelled their pitch modulation as tremolo, but the effects are distinct and are produced by entirely different means: one scales the signal, the other moves a delay line.",
      },
      {
        q: "Why does the modulation use a raised cosine?",
        a: "Because it has no corners, so the level reaches the bottom of each cycle and leaves it smoothly. A linear or switched modulation would introduce a kink in the waveform at every half cycle, which is audible as a click or as an unnatural regularity.",
      },
      {
        q: "Which rate sounds like a classic amplifier tremolo?",
        a: "Around four to five hertz. Below about two it reads as a slow swell rather than as a tremolo, and above eight it becomes a flutter. The presets span that range, and the useful settings are usually toward the middle of it.",
      },
      {
        q: "Does tremolo work on a full mix?",
        a: "It can, and a very shallow setting across a mix adds a subtle sense of movement. Deeper settings are better kept to individual parts, since modulating everything at once tends to read as a wobble on the whole recording rather than as an effect on anything in particular.",
      },
      {
        q: "Can I make it follow the tempo?",
        a: "Not automatically, since the rate is in hertz rather than note divisions. Working out the tempo first with the BPM calculator and then choosing a rate that corresponds to a subdivision is the way to line it up with the music.",
      },
    ],
  },

  "vibrato-effect": {
    keywords: [
      "delay line",
      "cents",
      "rate",
      "interpolation",
    ],
    intro:
      "Vibrato Effect makes the pitch of a recording rise and fall at a steady rate. It is produced by sweeping a short delay line, so the movement is in the pitch rather than in the level.",
    content:
      "Set the speed and the depth in cents, drop a file, and process; the panel reports the settings, the verified swing, and how much shorter the output is.\n\nThe controls:\n\n- A speed from one to fourteen hertz, in half hertz steps, defaulting to six and a half.\n- Three presets at five, six and a half and eight hertz, which sit around the range a singer's natural vibrato occupies.\n- A depth from five to two hundred cents, in five cent steps, defaulting to fifty.\n- A footer reporting the swing in cents as verified from the modulation depth, the rate, and the percentage by which the output is shorter than the source.\n\nThe mechanism is a delay line whose length is modulated by an oscillator, with the output read from an interpolated position between the stored samples. Because the read position moves, the pitch of what comes out rises and falls exactly as the delay shortens and lengthens, and the relationship between the two is defined precisely enough to be worth knowing: the depth in cents translates into a peak delay excursion, and that excursion multiplied by the oscillator's angular frequency gives the maximum fractional rate change, which is the pitch swing. The panel recomputes the swing from the actual modulation parameters and reports it, so the figure is a verification of the implementation rather than a restatement of the setting. Linear interpolation between neighbouring samples is what lets the read position fall between them without introducing a step, which is what keeps the moving pitch smooth rather than grainy. The output is shorter than the input, and that is not an error but the arithmetic of the method: the delay line has to be primed before it can produce output, and its headroom has to be reserved on both sides of the sweep, so a portion of the source is consumed before the first sample comes out. The reported percentage is the honest measure of that cost. Depth is what decides whether the effect is a natural vibrato or a siren: fifty cents is around a quarter tone and reads as expressive singing, while two hundred cents is a full tone and is a stylistic effect rather than a natural one.\n\nWhat it does not do:\n\n- No feedback, so it is a vibrato rather than a chorus or a flanger.\n- No synchronisation to a tempo.\n- No independent modulation per channel.\n- The output is necessarily shorter than the source.\n- No control of the oscillator shape.\n- Output is sixteen bit WAV.\n\nUse it to add natural movement to a sustained instrument or a held vocal note, to thicken a part that was recorded too steadily, or as a deliberate effect on synths and guitars. When the movement should be in the level rather than the pitch, the tremolo is the counterpart, and when the aim is to widen or double a part rather than to move its pitch, the chorus and the stereo widener do that. The movement is deliberately periodic rather than natural, which is why it works as an effect rather than as a correction.",
    howTo: [
      { step: "Drop an audio file onto the panel." },
      { step: "Set the speed, using a preset near the rate a voice would naturally use." },
      { step: "Set the depth in cents, starting around fifty for a natural feel." },
      { step: "Process the file, check the reported swing and length change, and download the WAV." },
    ],
    whenToUse:
      "Vibrato Effect is the tool for pitch movement on a sustained part, which makes it useful on held vocals and on instruments recorded too evenly. {{tremolo-effect|Tremolo Effect}} moves the level rather than the pitch. When the movement should be a filter rather than a pitch, {{chorus-effect|Chorus Effect}} and {{flanger-effect|Flanger Effect}} modulate a delay at longer or shorter settings, and {{pitch-shift-calculator|Pitch Shift Calculator}} is where a fixed pitch change is worked out.",
    faqs: [
      {
        q: "Why is the output shorter than the input?",
        a: "Because a modulated delay line has to be filled before it can output anything, and it needs room on both sides of the sweep so the read position never runs off either end. The source samples consumed by that headroom do not appear in the output, and the report states the percentage.",
      },
      {
        q: "How deep is a natural vibrato?",
        a: "Roughly twenty to sixty cents for a singer, which is why fifty is the default. Beyond about a hundred cents the movement stops reading as expression and starts reading as a deliberate effect, which is useful but is a different thing.",
      },
      {
        q: "Why is linear interpolation used?",
        a: "Because the read position of a modulated delay rarely lands exactly on a stored sample. Interpolating between the two neighbours produces a smooth value at any position, which is what keeps the pitch movement continuous rather than introducing the graininess a nearest-sample read would create.",
      },
      {
        q: "Is the reported cent figure the same as the setting?",
        a: "It is the swing the settings actually produce, recomputed from the modulation depth, the oscillator's frequency and the relationship between an excursion in time and a change in pitch. That is why it is worth checking when the rate is extreme, since the same depth at a higher rate produces a larger swing.",
      },
      {
        q: "Can I use it to correct a pitch that drifts?",
        a: "Not directly, because the movement here is a fixed oscillation rather than a correction. Pitch correction is the tool for following and correcting an existing drift, since it measures each note and pulls it back to where it should be.",
      },
    ],
  },

  "distortion-effect": {
    keywords: [
      "hyperbolic tangent",
      "drive",
      "symmetric",
      "quiet passages",
    ],
    intro:
      "Distortion Effect adds harmonic grit with a single drive control. The shaping curve is smooth and symmetrical, so it rounds peaks over rather than squaring them off.",
    content:
      "Set the drive from one to thirty, drop a file, and process; the footer reports how much a quiet passage is lifted at that setting.\n\nThe control and the curve:\n\n- A drive control from one to thirty, defaulting to five.\n- Four presets named for what they sound like: a warm setting at three, a crunch at eight, a heavy one at fifteen and a fuzz at twenty-five.\n- A footer reporting how far a quiet passage at a tenth of full scale is lifted by the chosen curve, which is a direct readout of how much the shaping compresses the dynamic range.\n\nThe curve is a hyperbolic tangent scaled by a normalisation factor, and its mathematical properties are the reason it sounds the way it does. It is odd symmetric, meaning that a positive input and the corresponding negative input produce exactly opposite outputs, which is why it adds no direct current offset to the signal. It maps full scale to full scale in both directions, so the peak level is preserved rather than reduced. It is strictly increasing, so a louder input always produces a louder output, and that is what keeps it free of the fold-back artefacts that a wrapped or deliberately non-monotonic curve would produce, where a louder input can produce a quieter output with unpleasant consequences. And because it compresses proportionally, quiet passages are lifted further than loud ones: at a drive of five, a passage sitting at a tenth of full scale comes out at around half of full scale, while a passage already at full scale stays there but rounded over rather than flat-topped. That asymmetry between quiet and loud is the whole character of the effect, and it is why distortion makes a part sound louder as well as grittier — what changes is not merely the harmonic content but the relationship between the loud and quiet passages.\n\nWhat it does not do:\n\n- No tone control, so the added harmonics are not shaped afterwards.\n- No bias or asymmetry control, so the effect is a symmetric one rather than producing even harmonics.\n- No output level compensation, so a heavily driven file comes out louder.\n- No oversampling, so the harmonics generated above half the sample rate are not filtered.\n- One curve only, with no other shapes available.\n- Output is sixteen bit WAV.\n\nUse it for the ordinary purposes of distortion: making a bass or a guitar sound driven, adding edge to a synth, or giving a drum bus some grit. When the distortion should be a lo-fi texture rather than a smooth saturation, the bitcrusher produces quantisation noise instead of harmonics, and when the goal is to make a signal louder without adding harmonics, the amplifier and the normalizer do that without colouring it. One caution is worth repeating, since it is the most common mistake with any saturation: the added harmonics raise the peak level of the material as a whole, so a part that sounds right in isolation can push a mix over when it is combined with everything else, and checking the output level after the fact is part of using the effect well.",
    howTo: [
      { step: "Drop an audio file onto the panel." },
      { step: "Set the drive with the slider or one of the four presets." },
      { step: "Read the footer to see how much the curve lifts quiet passages at that setting." },
      { step: "Process the file and download the distorted WAV." },
    ],
    whenToUse:
      "Distortion Effect is the tool for adding harmonics and reducing the distance between quiet and loud in one step. {{bitcrusher-effect|Bitcrusher Effect}} produces quantisation and aliasing artefacts instead, which is a different and harsher texture. {{ring-modulator|Ring Modulator}} moves the spectrum rather than folding it, and {{audio-limiter|Audio Limiter}} is what to use afterwards if the added harmonics have pushed the peaks over.",
    faqs: [
      {
        q: "Why is the curve symmetric rather than biased?",
        a: "Because a symmetric curve leaves the waveform's positive and negative halves matched, which prevents a direct current offset appearing in the output. Biased, asymmetric curves add even harmonics and a thump at the start of a note, which is characteristic of some hardware but is not what this effect is for.",
      },
      {
        q: "Why does distortion make a part sound louder?",
        a: "Because the curve lifts quiet passages more than loud ones. At a drive of five a very quiet passage comes up by several times, while a full scale one is merely rounded over, so the distance between loud and quiet shrinks. That compression is as much of the effect as the added harmonics.",
      },
      {
        q: "What does fold-back-free mean?",
        a: "That the curve always increases with input, so a louder input never produces a quieter output. Curves that wrap around when they exceed their range break that rule and produce an unpleasant crackle on loud passages, which is what a strictly increasing curve avoids.",
      },
      {
        q: "Will the peaks clip?",
        a: "No, because the curve maps full scale to full scale and never exceeds it. What can happen is that the added harmonics raise the peak level of the material as a whole, so the output may be louder than the input even though no single sample goes past full scale.",
      },
      {
        q: "Should I put anything after the distortion?",
        a: "A gentle equaliser to tame the added high frequencies is common, and a limiter if the result is now over level. Both are separate tools here, which keeps the distortion itself to one variable.",
      },
    ],
  },

  "bitcrusher-effect": {
    keywords: [
      "quantisation",
      "sample-and-hold",
      "bits",
      "effective",
    ],
    intro:
      "Bitcrusher Effect reduces the resolution of a recording in two ways at once, which is how the sound of early digital equipment is imitated. Bit depth sets the coarseness of the levels and a sample-and-hold sets the coarseness of time.",
    content:
      "Choose a file, set the bit depth and the hold, and crush it; the report gives the settings and the effective sample rate the result simulates.\n\nThe two controls:\n\n- A bit depth from two to sixteen, defaulting to eight, which is the number of levels each sample is snapped to.\n- A sample-and-hold from one to forty, defaulting to four, where the figure is how many input samples each output value is held for.\n- A report giving the bit depth, the hold factor, and the effective sample rate that the hold produces, which is the source rate divided by the hold.\n- The knowledge that sixteen bits with a hold of one is transparent, which means the effect has a genuine bypass setting rather than a near-miss.\n\nThe two reductions are independent and produce different artefacts, which is why both appear in one tool. Quantisation snaps each sample to a grid of levels; with fewer bits the step between adjacent levels grows, and the difference between the true value and the snapped one is heard as a hiss of noise that is present even during quiet passages. That is quantisation noise, and its level relative to the signal is set by the bit depth alone. The sample-and-hold works in time rather than in level: one sample is captured and repeated for several successive output positions, which discards the detail between those positions and folds any content above the resulting effective rate back down into the audible band as aliasing. The two artefacts therefore have completely different characters — one is a steady hiss and the other is a metallic shimmer that moves with the material — and combining them at moderate settings produces the familiar eight bit sampler sound of the mid nineteen eighties. The effective rate line exists because the hold is expressed as a multiple rather than as a rate, and the two are not equivalent: a hold of four on a forty eight thousand hertz file gives twelve kilohertz, while the same hold on a ninety six thousand hertz file gives twenty four, so the hold has to be read against the source rate to know what the result actually sounds like.\n\nWhat it cannot do:\n\n- No dithering, so the quantisation noise is correlated with the signal rather than randomised.\n- No anti-aliasing filter, so the alias content from the hold is deliberately retained.\n- No separate control of where in each held block the sample is captured.\n- No reconstruction filter, so the output is a stepped waveform rather than a band-limited one.\n- No wet and dry mix.\n- Output is written as sixteen bit WAV while sounding far coarser.\n\nUse it when the target is a lo-fi texture rather than a smooth saturation: eight bit drum machine grit, video game percussion, or the telephone era character of early digital recordings. When the aim is harmonics rather than resolution, the distortion effect produces a smooth saturation instead, and when the target is a specific recording format's limitations, the sample rate calculator and the bit depth calculator describe what those formats actually provide.",
    howTo: [
      { step: "Drop an audio file onto the panel and let it decode." },
      { step: "Set the bit depth, starting at eight for a recognisable lo-fi character." },
      { step: "Set the sample-and-hold factor and note the effective sample rate it produces." },
      { step: "Crush the file and download it, or set sixteen bits and a hold of one to confirm the bypass." },
    ],
    whenToUse:
      "Bitcrusher Effect is the tool when the goal is deliberate loss of resolution rather than harmonic saturation. {{distortion-effect|Distortion Effect}} adds harmonics with a smooth curve instead of quantising. {{ring-modulator|Ring Modulator}} changes the spectrum by multiplication, and {{radio-effect|Radio Effect}} narrows the band to imitate a transmission rather than reducing the resolution.",
    faqs: [
      {
        q: "Why do the two controls sound different?",
        a: "Because they degrade different things. Fewer bits quantises the level of each sample, which adds a steady hiss of quantisation noise, while a longer hold repeats each sample across time, which discards detail and folds high frequencies down as aliasing. One is a noise floor and the other is a moving shimmer.",
      },
      {
        q: "What does the effective sample rate mean?",
        a: "It is the source rate divided by the hold factor, and it describes the rate the result behaves like. A hold of four on a forty four thousand one hundred hertz file gives about eleven kilohertz, which is why the same hold factor sounds different on files at different rates.",
      },
      {
        q: "Is the effect ever transparent?",
        a: "Yes, at sixteen bits with a hold of one. Nothing is quantised further than the file already was and nothing is held, so the output matches the input. That is useful as a reference point when judging how much of a character a particular setting adds.",
      },
      {
        q: "Why is no dither applied?",
        a: "Because dither exists to make quantisation noise less objectionable when the aim is fidelity, and this tool's aim is the opposite. Leaving the noise correlated with the signal is what gives the effect its characteristic grain rather than a smooth, dithered refinement.",
      },
      {
        q: "Can I crush only part of a file?",
        a: "The whole file is processed in one pass. To crush a section, keep that section with the trimmer, crush it, and join it back into place with the joiner, which is the usual way to apply any of these effects to part of a recording.",
      },
    ],
  },

  "ring-modulator": {
    keywords: [
      "carrier",
      "sum and difference",
      "phase",
      "tremolo",
    ],
    intro:
      "Ring Modulator multiplies a recording by a steady tone, which replaces its harmonic structure with sum and difference frequencies. The result is metallic, bell-like or robotic depending on the carrier frequency.",
    content:
      "Set the carrier frequency and phase, drop a file, and process; the footer explains what the carrier does to the spectrum.\n\nThe controls:\n\n- A carrier frequency from one to twelve hundred hertz, defaulting to seventy.\n- Four presets with their own phase settings: a robot at thirty hertz, a dalek-like effect at seventy, a science fiction setting at two hundred and thirty with the phase at ninety degrees, and a metallic one at six hundred and forty.\n- A carrier phase from zero to three hundred and sixty degrees in fifteen degree steps.\n- A footer explaining that the output contains the original frequencies plus and minus the carrier, and that the carrier itself is suppressed when the phase is ninety degrees.\n\nThe operation is a multiplication rather than an addition, and that is what makes it sound unlike anything else. Multiplying two signals produces new frequencies at the sum and difference of every pair of components, so a single tone of a given pitch entering the tool comes out as two tones, one above and one below the original by the carrier frequency, with the original itself gone. Applied to a complex sound the effect is dramatic: the harmonic series that gave the sound its identity is replaced by two shifted copies of it, which is why the output reads as metallic or bell-like rather than as a filtered version of the input. The carrier frequency sets the interval between the two copies, so a low carrier produces widely spaced mirror images that sound discordant, while a high one pushes the difference components down into the audible range and the sum components above it. The phase control is subtle but worth understanding. At zero the carrier is a pure cosine, and at ninety degrees it is a pure sine; because the two components of the output carry opposite signs in one of those cases, the phase decides whether the two copies reinforce or cancel in particular spectral regions. The footer's claim that the carrier is suppressed at ninety degrees is the practical consequence: at that phase the carrier tone itself is removed from the output, which matters when the carrier would otherwise be audible as a whistle over the top of the effect. Very low carrier rates stop being a metallic effect at all and act as an amplitude modulation instead.\n\nWhat it does not offer:\n\n- No wet and dry mix, so the effect is always applied fully.\n- No control of the carrier's waveform.\n- No tracking of the input pitch.\n- The carrier is not filtered out of the output except by the phase setting.\n- No stereo offset between the channels.\n- Output is sixteen bit WAV.\n\nUse it for deliberate effects: a robotic voice, a bell-like tone from a sustained sound, science fiction textures, or a subtle metallic edge at a high carrier setting. When the modulation should be in the level rather than the spectrum, the tremolo applies a raised cosine instead, and when the target is harmonic saturation rather than spectral shifting, the distortion and the bitcrusher are the tools for that.",
    howTo: [
      { step: "Drop an audio file onto the panel." },
      { step: "Set the carrier frequency, starting with a preset if you want a known character." },
      { step: "Adjust the phase, using ninety degrees if the carrier itself should not be heard." },
      { step: "Process the file and download the ring modulated WAV." },
    ],
    whenToUse:
      "Ring Modulator is the tool when the spectrum itself should be moved rather than shaped, which is how robotic and bell-like effects are made. {{tremolo-effect|Tremolo Effect}} modulates the level using a smooth curve instead of multiplying. {{distortion-effect|Distortion Effect}} and {{bitcrusher-effect|Bitcrusher Effect}} change the signal by reshaping it rather than by multiplying it, and {{telephone-effect|Telephone Effect}} narrows the band to imitate a transmission.",
    faqs: [
      {
        q: "Why does the original pitch disappear?",
        a: "Because multiplication produces only the sum and difference of frequencies, not the originals. A tone multiplied by a steady carrier comes out as two tones either side of it, which is why the harmonic relationships that identify the sound are replaced and the result seems to have no obvious pitch.",
      },
      {
        q: "What does the carrier frequency control?",
        a: "The distance between the two shifted copies of the spectrum. A low carrier spreads them narrowly and produces a discordant, robot-like sound; a high one separates them widely so the difference components fall into the audible band as a lower, bell-like tone.",
      },
      {
        q: "Why does the phase matter?",
        a: "Because the two copies of the spectrum carry opposite signs in one of the two phase states, so which components reinforce and which cancel depends on it. The practical consequence is that at ninety degrees the carrier tone itself is suppressed, which removes the whistle that would otherwise sit over the effect.",
      },
      {
        q: "Why is there no mix control?",
        a: "Because the effect is a multiplication, so a partial mix would not be a partial ring modulation but simply the dry signal added to the modulated one — a different sound rather than a proportion of the same one. The character comes from the whole signal being multiplied.",
      },
      {
        q: "What happens at very low carrier frequencies?",
        a: "The two copies of the spectrum end up so close together that the effect stops being heard as a change of pitch and starts behaving as an amplitude modulation, which is a tremolo-like flutter rather than a metallic tone.",
      },
    ],
  },

  "auto-wah": {
    keywords: [
      "envelope",
      "bandpass",
      "sensitivity",
      "attack",
    ],
    intro:
      "Auto-Wah sweeps a filter according to how loud the playing is, so hard notes open toward brightness and quiet ones let it fall closed. The movement comes from the performance rather than from an oscillator.",
    content:
      "Choose a file, set the sensitivity and the timing, and apply; the report gives the level at which the filter opens fully and the attack and release times.\n\nThe controls:\n\n- A sensitivity from five percent to sixty, defaulting to twenty five, which is the level at which the filter opens fully.\n- An attack from one to a hundred milliseconds, defaulting to ten.\n- A release from twenty to five hundred milliseconds, defaulting to a hundred and twenty.\n- A mix from nothing to everything, defaulting to fully processed, since the effect is usually wanted at full strength.\n- A fixed sweep range from two hundred hertz to two kilohertz, which is where the filter travels between.\n\nThe filter is a bandpass whose centre frequency is driven by an envelope follower rather than by an oscillator, and the envelope's timing controls are the ones that decide the character. The sensitivity sets how much level is needed to open the filter fully: at a low figure even quiet playing lifts the centre frequency to its maximum, while at a high figure only the hardest attacks get there, which is what makes the control useful for matching the effect to a performance rather than to a preset. The follower measures the level of the signal with an attack that decides how quickly the filter responds to a new note and a release that decides how quickly it falls back afterwards. Fast attack with slow release is the classic funk setting: the filter opens almost immediately on the transient and then closes slowly across the note, so each note has a downward sweep built into it. A slow attack does the opposite and smooths the effect so that it responds to phrases rather than to individual notes, which is the gentler setting for sustained material. The mix control exists because the processed signal alone can sound thin — a bandpass removes everything outside its pass band — and blending the original back keeps the body of the sound while the sweep provides the movement. The report gives the opening level in decibels below full scale as well as as a fraction, which makes it possible to set the sensitivity against a known peak level rather than by ear alone.\n\nWhere it is limited:\n\n- The sweep range is fixed rather than adjustable.\n- No control of the filter's resonance or bandwidth.\n- No sidechain input, so it responds to the file being processed and not to another signal.\n- The follower measures the level of the whole signal rather than of a particular band.\n- No tempo synchronisation.\n- Output is sixteen bit WAV.\n\nUse it on anything played rhythmically where the movement should follow the playing: bass, guitar, electric piano or a drum loop with clear transients. When the movement should come from a steady oscillator instead of from the material, the phaser and the flanger sweep regardless of level, and when the filter should be set rather than moving, the equalizer shapes the spectrum statically. The honesty of the effect is part of its appeal: it responds to what is actually played.",
    howTo: [
      { step: "Drop an audio file onto the panel and note how loud its loudest moments are." },
      { step: "Set the sensitivity so that the loudest notes just open the filter fully." },
      { step: "Choose the attack and release, fast attack with slow release for a funk feel." },
      { step: "Set the mix, apply, and check the reported opening level." },
    ],
    whenToUse:
      "Auto-Wah is the tool when the filter should follow the playing rather than a fixed rate, which is what makes it work on rhythmic material. {{phaser-effect|Phaser Effect}} and {{flanger-effect|Flanger Effect}} sweep at a rate you set instead. When the frequency response should be shaped rather than moved, {{equalizer|Equalizer}} is the direct tool, and {{tremolo-effect|Tremolo Effect}} modulates the level rather than the tone.",
    faqs: [
      {
        q: "How do I set the sensitivity?",
        a: "So that the loudest notes in the material just reach the point where the filter is fully open. Too low and the filter is permanently wide open, so there is no sweep; too high and it never opens, so the sound stays dull. The reported opening level is the figure to compare against the file's actual peaks.",
      },
      {
        q: "What makes the funk sound?",
        a: "A fast attack with a slow release. The filter opens almost instantly when a note starts and then falls back gradually across it, so every note carries a downward sweep. Reversing the two gives the opposite character, where the filter creeps open and then shuts quickly.",
      },
      {
        q: "Why is the filter a bandpass rather than a lowpass?",
        a: "Because a moving band is what produces the characteristic vowel-like sweep. A lowpass would open and close in a single direction and would leave everything above the cutoff removed, whereas a bandpass passes a moving window of the spectrum and keeps the effect recognisable as a wah.",
      },
      {
        q: "Why does the mix control matter here?",
        a: "Because a bandpass removes everything outside its band, so the processed signal alone can sound thin and hollow. Blending some of the original back restores the body of the sound while the sweep supplies the movement, which is what makes the effect usable on a full part rather than on a single note.",
      },
      {
        q: "Will it work on sustained material?",
        a: "It works, but with less character, because the effect depends on level changing over time. On a long pad the filter will tend to find a position and stay near it; on percussive or plucked material with clear note starts it sweeps distinctly on every event.",
      },
    ],
  },

  "stereo-widener": {
    keywords: [
      "mid",
      "side",
      "width",
      "out-of-phase",
    ],
    intro:
      "Stereo Widener changes how wide a stereo recording sounds by scaling the difference between its two channels. The centre stays put while the sides move further apart or closer together.",
    content:
      "Drop a stereo file, set the width, and process; the panel reports the side channel's share of the total energy before and after, and warns if the output peak went past full scale.\n\nThe control and the readout:\n\n- A width from nothing to two hundred percent, in five percent steps, defaulting to a hundred and forty.\n- Five presets named for what they do: mono at nothing, narrow at seventy, normal at a hundred, wide at a hundred and forty, and ultra at a hundred and eighty.\n- A footer giving the side channel's percentage of the total energy before and after processing, and the output peak.\n- A channel requirement: the tool needs two channels, and a mono file is refused rather than silently doubled.\n\nThe arithmetic is a change of basis. A stereo signal can be described by its mid component, which is the average of the two channels and carries everything common to both sides, and its side component, which is half their difference and carries only what differs. Widening multiplies the side component by the chosen factor and rebuilds the two channels from the scaled pair, so at a hundred percent the operation is an exact identity, at nothing it collapses to mono, and above a hundred it exaggerates whatever differs between the sides. Expressing the result as the side channel's share of the total energy is what makes the readout honest: that share scales with the square of the width factor, so a hundred and forty percent width multiplies the side energy by nearly two, and the figure shows the change directly rather than merely restating the setting. There is one consequence worth understanding before using it. Content that is the same in both channels has no side component at all, so widening cannot make it wider; only what already differs is affected, which is why a hard-panned mix opens up dramatically while a mono-compatible one barely changes. And because the side component is added to the mid in one channel and subtracted in the other, material with an inverted relationship between the sides can grow beyond full scale, which the tool reports as a peak warning rather than allowing it to pass silently. Bringing the level back afterwards is a job for the amplifier.\n\nWhere it does not help:\n\n- Mono or near-mono material gains almost nothing, since there is no side content to scale.\n- Out-of-phase content can exceed full scale at high widths, which is reported rather than prevented.\n- No frequency-dependent widening, so the whole spectrum moves together.\n- No control over the width over time.\n- No monitoring of mono compatibility, which is worth checking separately.\n- Output is sixteen bit WAV.\n\nUse it to open up a mix that was recorded narrow, to push a doubled part to the edges of the image, or to check how a mix behaves when its sides are exaggerated. When the aim is to create width where there was none by adding a copy rather than by scaling a difference, the chorus and the mono to stereo converter are the tools for that, and when the mid and side components need to be manipulated separately, the mid side encoder is the direct route.",
    howTo: [
      { step: "Drop a stereo file onto the panel; a mono file is refused by design." },
      { step: "Set the width, starting at a hundred percent to confirm the output matches the input." },
      { step: "Read the side energy figures to see how much the image actually changed." },
      { step: "Check the peak warning and bring the level down with the amplifier if it appears." },
    ],
    whenToUse:
      "Stereo Widener is the tool for changing the width of an image that already has side content, which is what makes it different from adding a second voice. {{mid-side-encoder|Mid-Side Encoder}} exposes the mid and side components for separate treatment, and {{mono-to-stereo-converter|Mono-to-Stereo Converter}} creates a stereo file from mono without adding width at all. When the movement rather than the width is the goal, {{chorus-effect|Chorus Effect}} and {{8d-audio-converter|8D Audio Converter}} add it by other means.",
    faqs: [
      {
        q: "Why does widening do nothing on some files?",
        a: "Because only the difference between the two channels is scaled. If a recording has identical left and right content, as a mono file doubled to stereo does, there is no side component and no width to change. Hard-panned and heavily stereo material responds far more.",
      },
      {
        q: "What does the side energy figure measure?",
        a: "How much of the total energy sits in the difference between the channels rather than in what they share. It scales with the square of the width factor, so the number changes quickly as the width moves, and it is a more honest measure of widening than an impression that the sound got bigger.",
      },
      {
        q: "Why is there a peak warning?",
        a: "Because the side component is added to one channel and subtracted from the other, so on material whose sides are partly inverted the two can sum to more than full scale. The warning reports it rather than hiding it, and bringing the level down afterwards is a matter for the amplifier.",
      },
      {
        q: "Does widening hurt mono compatibility?",
        a: "It can. The more the sides are exaggerated, the more a mono fold-down loses, because the fold averages the two channels and anything that differs between them partly cancels. If a mix has to survive mono playback, check it with the stereo to mono converter after widening.",
      },
      {
        q: "What width should I use?",
        a: "A hundred percent is exact identity, so anything above it is a deliberate exaggeration. Around a hundred and twenty to a hundred and forty opens a narrow mix without sounding unnatural; beyond a hundred and eighty the sides tend to dominate and the effect becomes obvious rather than flattering.",
      },
    ],
  },

  "mono-to-stereo-converter": {
    keywords: [
      "mono",
      "copies",
      "centre",
      "channels",
    ],
    intro:
      "Mono-to-Stereo Converter turns a single-channel recording into a two-channel file by copying it to both sides. The result sits dead centre, which is exactly what makes it compatible everywhere.",
    content:
      "Drop a mono file and process it; both output channels are exact copies of the input, and the result downloads as a stereo WAV.\n\nWhat the tool does:\n\n- It requires a single-channel source and refuses a file that is already stereo, rather than silently doing nothing.\n- Both output channels are the input channel, sample for sample and bit for bit.\n- The output is written as a stereo WAV, so a player that insists on two channels will accept it.\n- Nothing in the signal is changed: no gain, no filtering, no delay between the sides.\n\nThe value of the tool is in how unremarkable it is, and that is worth stating clearly because it is easy to expect the wrong thing from a converter with this name. Copying one channel to two produces a signal that is by definition identical on both sides, which means it has no side component at all: the mid and side view of the result puts all of the energy in the mid channel and none in the side. The consequence is that the result is perfectly mono compatible, since folding the two channels back together returns exactly the original sample values, and it sits dead centre in the stereo image with no sense of width whatsoever. That is the correct behaviour for the job, which is getting a mono file into a container or a workflow that expects two channels, and it is the wrong thing to reach for if the intent is to make a mono recording sound wide. Because the copy is exact, the operation is reversible by the stereo to mono converter and the round trip returns the original file, and it can be repeated without any degradation, since no processing is applied at any stage and the samples are copied rather than recalculated.\n\nWhat it cannot do:\n\n- No width, because there is nothing for the two channels to differ by.\n- No delay, panning or level offset between the sides.\n- No reverb or doubling, which are separate effects.\n- It refuses a stereo source rather than converting it in some other way.\n- No change of format beyond writing two channels instead of one.\n- Output is sixteen bit WAV.\n\nUse it when a mono file has to be delivered in a two-channel container, when a player or a pipeline will not accept a single-channel file, or as a first step before adding a real stereo effect. When the aim is actually to make a mono recording sound wider, the stereo widener cannot help for the reason above and a chorus or a short delay between the channels is the approach that works, and when the question is what happens when a stereo mix is folded to mono, the stereo to mono converter answers it. It is worth stating plainly what the conversion does not do, because the name invites the opposite expectation: a copy of one channel into two creates no difference between the sides, so no amount of listening will reveal any width, and the file will behave identically to the original mono one in every situation except that it satisfies software expecting two channels.",
    howTo: [
      { step: "Drop a mono file onto the panel; a stereo file is refused with an explanation." },
      { step: "Process it, which copies the single channel to both sides." },
      { step: "Check that the result plays as a stereo file in whatever player you use." },
      { step: "Download the WAV." },
    ],
    whenToUse:
      "Mono-to-Stereo Converter is the tool for putting a mono recording into a two-channel container without altering it. {{stereo-to-mono-converter|Stereo-to-Mono Converter}} performs the opposite fold. When the goal is genuine width rather than compatibility, {{stereo-widener|Stereo Widener}} scales an existing difference and {{chorus-effect|Chorus Effect}} adds a delayed copy, both of which create side content where this tool deliberately creates none.",
    faqs: [
      {
        q: "Will the output sound any wider than the mono original?",
        a: "No, and it cannot. Copying one channel to two produces identical channels, which by definition have no difference for a stereo system to place anywhere. The sound sits exactly in the centre, which is what the operation is for.",
      },
      {
        q: "Why does it refuse a stereo file?",
        a: "Because there is nothing to convert. A stereo file already has two channels, and the tool's job is the specific conversion from one to two. Refusing makes the situation clear rather than producing output that is identical to the input for reasons that would not be obvious.",
      },
      {
        q: "Is any quality lost in the conversion?",
        a: "No. Each sample of the mono channel is copied into both output channels unchanged, so the file contains the same samples as the original with nothing recalculated. The conversion can be repeated or reversed without any accumulation of error.",
      },
      {
        q: "How do I make a mono recording sound wide?",
        a: "Not with a straight copy, since there is no difference to scale. Adding a slightly delayed or modulated copy of the signal to one side creates the difference that a stereo image needs, which is what the chorus effect does by design.",
      },
      {
        q: "Why would I need this at all?",
        a: "Because some players, editors and delivery pipelines require two channels and will reject or mis-handle a single-channel file. Converting is a compatibility step rather than a processing step, and it leaves the audio exactly as it was.",
      },
    ],
  },

  "stereo-to-mono-converter": {
    keywords: [
      "fold",
      "average",
      "cancel",
      "mono",
    ],
    intro:
      "Stereo-to-Mono Converter folds a two-channel recording into one channel by averaging the sides. It is the standard downmix, and it is also the quickest way to hear whether a mix survives mono playback.",
    content:
      "Drop a stereo file and process it; the two channels are averaged into one, and the result downloads as a mono WAV.\n\nThe operation and what it means:\n\n- The tool requires two channels and refuses a mono file, since there is nothing to fold.\n- The fold is the average of the left and right channels, which is the standard broadcast downmix rather than simply taking one side.\n- The footer notes that correlated content drops by six decibels in the process and that out-of-phase material can cancel.\n- The peak level is checked after the fold rather than assumed to be safe.\n- Nothing else is changed: no gain compensation is applied, and no filtering or delay.\n\nThe arithmetic explains both the use and the risk. Averaging two identical channels produces that same channel at its original level, which is why a mono-compatible part folds down cleanly; the six decibel drop mentioned in the footer applies to a signal present only in one channel, which loses half its amplitude when it is averaged with silence, and that is exactly the loss a hard-panned element suffers in a mono fold. Out-of-phase material is the other extreme: if the two channels carry the same content with opposite polarity, averaging adds them to zero and the sound vanishes entirely from the result. Neither of those behaviours is a fault of the tool; they are what a downmix does, and they are the reason a mono check belongs in any workflow where the material might be played on a single speaker. Because the fold arithmetic is exact, folding and then duplicating the result gives a stereo file whose sides are identical, which is a round trip that changes the width and nothing else. The peak check matters because the fold can in principle raise the level — content that is identical in both channels sums to the original level, but content that is inverted on one side cancels and reduces it, so the result is normally quieter rather than louder, and the tool reports the figure rather than assuming.\n\nWhat it does not do:\n\n- No fold to a weighted sum, which some broadcast specifications call for.\n- No mono compatibility analysis beyond the peak level.\n- No compensation for the loss of panned elements.\n- No gain adjustment to keep the level constant.\n- No handling of more than two channels.\n- Output is a mono sixteen bit WAV.\n\nUse it to make a mono delivery from a stereo master, to check that a mix survives single-speaker playback before release, or to prepare a file for a device that only accepts one channel. When the fold is a step on the way back to stereo, the mono to stereo converter duplicates the result to two identical channels, and when the concern is specifically how much difference the two sides carry, the mid side encoder shows it directly by putting the side content in a channel of its own. The conversion is also worth running over a finished mix as a matter of habit rather than only when a mono delivery is required, since the parts that change level on the fold are exactly the parts that depend on the width of the image in order to be heard at all.",
    howTo: [
      { step: "Drop a stereo file onto the panel; a mono file is refused with an explanation." },
      { step: "Process it, which averages the two channels into one." },
      { step: "Listen for anything that disappears or drops in level, which indicates phase or panning problems." },
      { step: "Download the mono WAV." },
    ],
    whenToUse:
      "Stereo-to-Mono Converter is the tool for a mono delivery and for the compatibility check that should precede one. {{mono-to-stereo-converter|Mono-to-Stereo Converter}} performs the opposite duplication. When the amount of difference between the sides needs examining rather than folding away, {{mid-side-encoder|Mid-Side Encoder}} separates the shared content from the difference, and {{stereo-widener|Stereo Widener}} is the tool that changes the difference deliberately. The fold is worth listening to rather than merely calculating, since the parts that change level are the ones that identify where a mix depends on its width. Elements that only drop slightly are mostly centred, and anything that becomes noticeably quieter or disappears was depending on the two channels to carry it.",
    faqs: [
      {
        q: "Why do centred elements drop in level?",
        a: "The average of two identical channels is that same signal, so a centred element keeps its level. What drops by six decibels is an element present in only one channel, because it is being averaged with silence. In practice a mono fold usually sounds slightly quieter overall because most mixes have something panned.",
      },
      {
        q: "Can sounds disappear entirely?",
        a: "Yes, if the two channels carry the same content with opposite polarity. Averaging them adds plus one to minus one and produces nothing, so an out-of-phase element vanishes. That is a genuine phase problem in the mix rather than a fault of the conversion.",
      },
      {
        q: "Is the result quieter than the original?",
        a: "Usually slightly, and the tool reports the peak so the figure can be confirmed. The exact change depends on how correlated the channels are: fully correlated content keeps its level, and partly inverted content loses some of it.",
      },
      {
        q: "Should I compensate the level afterwards?",
        a: "If the mono file is replacing the stereo one in a sequence, bringing it back up with the normalizer is reasonable. The conversion itself applies no gain by design, because silently changing the level would make it harder to hear what the fold actually did.",
      },
      {
        q: "Is the fold the same as muting one channel?",
        a: "No, and the difference matters. Muting one side discards it entirely, losing anything that was only there; averaging keeps the sum of both sides, so panned content is reduced rather than removed, and that is why the average is the standard downmix.",
      },
    ],
  },

  "mid-side-encoder": {
    keywords: [
      "mid",
      "side",
      "difference",
      "round trip",
    ],
    intro:
      "Mid-Side Encoder re-expresses a stereo recording as the sum of its channels and their difference. The sum goes in one channel and the difference in the other, which makes each available for separate treatment.",
    content:
      "Drop a stereo file and process it; the output is a stereo WAV whose left channel carries the mid and whose right carries the side.\n\nWhat the tool produces and what it means:\n\n- The mid channel is the average of the two sides, which is everything the channels have in common.\n- The side channel is half their difference, which is everything they do not share.\n- The output is written as a stereo file with the mid on the left and the side on the right, because that is the form most editors can load and process.\n- The tool requires a stereo source, since there is no side component in a mono file.\n- The paired decoder restores the original exactly, sample for sample, which has been verified by a direct comparison.\n\nEverything the tool does follows from the change of basis. Ordinary stereo describes a signal by what comes out of each speaker; this view describes it by what the two channels share and what they differ by, and the two descriptions contain exactly the same information. The practical consequence is that the components can be dealt with independently. The mid channel is a perfectly good mono version of the recording, so a mono fold-down is already implicit in it; the side channel is the whole of the difference, so scaling it scales the width and nothing else, and discarding it entirely produces a mono image while keeping both output channels. Because the transformation is linear and its inverse is exact, processing the components and decoding the result is a lossless way to make changes that would otherwise be awkward, and the round trip through encoder and decoder returns the original file sample for sample, which is the guarantee worth relying on. There is one property worth noticing in use: content that is identical in both channels produces a completely silent side channel. That makes the encoder a quick test for how much genuine stereo content a recording contains, since a wide pop mix will show a busy side channel while a doubled mono file shows silence.\n\nWhere the format causes friction:\n\n- The encoded file sounds phasey if played directly, which is expected rather than a defect.\n- Nothing in the file records that it is encoded, so a listener or an editor has to know.\n- The channels are not labelled beyond the convention of mid on the left.\n- A mono source is refused, since it has no side content.\n- No level compensation is applied to the components.\n- Output is sixteen bit WAV; the pairs round trip exactly.\n\nUse it when the mid and side components have to be treated differently: compressing the mid to control the centre without touching the sides, equalising the side channel to brighten the width, or simply measuring how much stereo content a mix really has. When the aim is to change the width without separating the components, the stereo widener does exactly that in one step, and when the components need processing as audio rather than being extracted for inspection, the mid side processor is the tool that combines the two operations.",
    howTo: [
      { step: "Drop a stereo file onto the panel; a mono file is refused." },
      { step: "Process it to produce a stereo file with the mid on the left and the side on the right." },
      { step: "Treat the two channels as wanted, or note how much content the side channel carries." },
      { step: "Decode the result with the mid side decoder to recover the original stereo." },
    ],
    whenToUse:
      "Mid-Side Encoder is the tool for separating what the channels share from what they differ by, which is what makes independent treatment possible. {{mid-side-decoder|Mid-Side Decoder}} turns the result back into ordinary stereo, and {{mid-side-processor|Mid-Side Processor}} combines both operations with controls for each component. When the width simply needs changing, {{stereo-widener|Stereo Widener}} does that without exposing the components at all.",
    faqs: [
      {
        q: "Why does the encoded file sound strange when I play it?",
        a: "Because the left channel is the sum and the right is the difference, which is not a left and right image at all. Played directly the two sound partly out of phase. That is the point of the format rather than a fault, and decoding restores the original exactly.",
      },
      {
        q: "How do I know the round trip is exact?",
        a: "The encoder and decoder are linear transformations that invert each other, and the pair has been verified by comparing the decoded output with the original sample by sample. Nothing is approximated, so a file can be encoded and decoded repeatedly without any accumulation of difference.",
      },
      {
        q: "What does a silent side channel tell me?",
        a: "That the two channels are identical, so the recording has no stereo content at all beyond the duplication. It is a quick way to check whether a file that is nominally stereo carries any genuine difference between its sides.",
      },
      {
        q: "Can I use this to make a mono version?",
        a: "The mid channel is exactly the mono fold-down, so keeping it and discarding the side would give that result. The stereo to mono converter does the same job in one step without producing an encoded file that then has to be handled carefully.",
      },
      {
        q: "Does encoding change the sound?",
        a: "Not in any way that survives decoding. The transformation moves energy between channels but preserves the information, and because it is reversible the round trip is lossless. What changes is the representation rather than the audio.",
      },
    ],
  },

  "mid-side-decoder": {
    keywords: [
      "inverse",
      "mid",
      "side",
      "sample for sample",
    ],
    intro:
      "Mid-Side Decoder turns an encoded pair back into ordinary left and right stereo. It assumes the left channel is the sum and the right is the difference, and rebuilds the original channels from them.",
    content:
      "Drop an encoded file and process it; the output is standard stereo left and right, restored from the mid and side components.\n\nWhat the tool does:\n\n- It treats the first channel as the mid, which is the sum of the original sides, and the second as the side, which is half their difference.\n- It reconstructs the two output channels by adding and subtracting the two inputs, restoring each side of the original stereo image.\n- Both input channels are required, since the reconstruction needs both components.\n- A file exported by the encoder decodes back sample for sample, which is the property the pair was designed around.\n- Nothing is added, removed or scaled in the process.\n\nThe reconstruction is the exact inverse of the encoding, and the reason it works is worth a sentence because it explains why the format is lossless. The encoder described the original pair by their average and half their difference; the decoder adds the difference to the average to recover one channel, and subtracts it to recover the other, so every sample of the original is reproduced precisely from the two components. That is why a file can be encoded, worked on as components, and decoded back without any loss as long as the processing applied to the components was arithmetic rather than destructive. The tool makes one assumption that has to be respected: it takes the left channel as the mid and the right as the side, which is the convention the encoder writes, and it has no way to detect whether a file really is encoded. Feeding it an ordinary stereo recording produces a plausible but wrong result, since the two channels of an ordinary mix are not a sum and a difference, so the transform is only meaningful on material that went through an encoder or was produced by a mid and side processor. The output is indistinguishable from the original stereo when the pairing is correct, which is the best evidence that the round trip worked.\n\nWhat it does not do:\n\n- No detection of whether the input is actually encoded.\n- No adjustment of the components before decoding.\n- No stereo width control, which is the widener's job.\n- No handling of a mono input.\n- No record of the transformation is stored in the file.\n- Output is sixteen bit WAV.\n\nUse it to restore stereo after working on the components as audio: after compressing the mid to control the centre, after equalising the side to change the width's tone, or after any other processing that was easier to apply to the two components than to the two channels. When the components need to be adjusted and recombined in one operation, the mid side processor is the tool that does both, and when only the width needs changing, the stereo widener does that without going through an encoded stage at all. Keeping the two components in separate files during a session is a common working habit, since it makes clear which representation is being handled and prevents an encoded file being mistaken for ordinary stereo later.",
    howTo: [
      { step: "Drop a file that was produced by the mid side encoder or a mid side processor." },
      { step: "Confirm the convention: the first channel is the mid and the second is the side." },
      { step: "Process it to rebuild ordinary left and right channels." },
      { step: "Compare the result against the original stereo to confirm the round trip was exact." },
    ],
    whenToUse:
      "Mid-Side Decoder is the tool for the second half of a mid and side workflow, once the components have been processed as audio. {{mid-side-encoder|Mid-Side Encoder}} produces the components in the first place, and {{mid-side-processor|Mid-Side Processor}} handles both directions with controls for each part. When the aim is simply a wider or narrower image, {{stereo-widener|Stereo Widener}} reaches the result in one step.",
    faqs: [
      {
        q: "How do I know a file is encoded?",
        a: "The tool cannot tell, so the file's origin has to. Anything exported by the mid side encoder or a mid and side processor is encoded with the mid on the left and the side on the right; an ordinary stereo file is not, and decoding it would produce a wrong result that happens to sound plausible.",
      },
      {
        q: "Is the round trip really lossless?",
        a: "Yes, provided nothing destructive has been done to the components in between. The two transformations invert each other exactly, so a file that is encoded and decoded without other processing comes back sample for sample.",
      },
      {
        q: "What happens if I decode an ordinary stereo file?",
        a: "The arithmetic still runs, but the assumption behind it is false, so the result is not the original recording. The two output channels are built from a sum and a difference that were never a sum and a difference, which produces a narrower and slightly strange image.",
      },
      {
        q: "Why is the pair split into two tools?",
        a: "Because most of the use for the transformation is in working on the components between the two steps, and separate tools make that workflow explicit. When the adjustment and the recombination belong together, the mid side processor offers them in a single pass.",
      },
      {
        q: "Can I use the decoder to widen a mix?",
        a: "Only if the components are adjusted between the two steps, since the decoder on its own restores exactly what the encoder produced. Scaling the side component before decoding is how width is changed in this representation, and the widener does the same arithmetic without the intermediate file.",
      },
    ],
  },
};
