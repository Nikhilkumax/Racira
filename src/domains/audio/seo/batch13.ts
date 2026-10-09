/**
 * AUTO-GENERATED — do not edit by hand.
 *
 * Source: src/domains/audio/seo/source/batch-13-trimming-editing-b.json
 * Regenerate: node scripts/audio-json-to-seo.mjs src/domains/audio/seo/source/batch-13-trimming-editing-b.json <this file> audioSeoBatch13
 * Validate first: node scripts/validate-audio-seo-json.mjs src/domains/audio/seo/source/batch-13-trimming-editing-b.json
 */
import type { ToolSeo } from "@/components/shared/seo-types";

export const audioSeoBatch13: Record<string, ToolSeo> = {
  "audio-pitch-shifter": {
    keywords: [
      "semitones",
      "cents",
      "frequency ratio",
      "duration",
    ],
    intro:
      "Audio Pitch Shifter changes the pitch of a recording while leaving its length exactly as it was. The interval is chosen in semitones with a fine-tune in cents, so a song can be moved into a comfortable key without altering its tempo at all.",
    content:
      "Set the interval, drop a file, and process. The result is a WAV of exactly the same duration as the source, with the pitch moved by the chosen amount.\n\nThe controls:\n\n- A semitone slider from twelve down to twelve up, defaulting to plus two.\n- A fine-tune slider in cents from minus fifty to plus fifty, defaulting to zero, which gives hundredth-of-a-semitone precision.\n- A report line giving the combined shift, the multiplier it produces, where a reference pitch of 440 Hz lands after the shift, and confirmation that the length has not moved.\n\nThe shift is built from two operations applied one after the other, and knowing why matters. The signal is first resampled by the frequency ratio derived from the interval, which raises the pitch by exactly that factor and shortens the file by the same amount. It is then stretched back by that same factor, which restores the original duration without moving the pitch down again. Because the second stage undoes precisely the length change the first one made, the output duration matches the input to the sample, which is the property that separates this tool from a tape-style speed change. A shift of twelve semitones is a factor of two, and the cents control contributes a hundredth of a semitone on top of whatever the interval gives. The stretch stage is a windowed overlap-add method that searches for the position at which each grain best continues the audio already written, which is what stops a shifted tone from sounding watery. The weakness is the one every time-domain method shares: small shifts leave the material sounding much as it did, while large ones blur transients and can leave a dense mix slightly smeared. Up to about three semitones is usually transparent, and a full octave is where the artefacts start to become a matter of taste rather than something you stop noticing.\n\nWhat to expect and what not to:\n\n- The duration is preserved exactly, so nothing has to be re-cut afterwards.\n- Up to two channels are handled, so a stereo file keeps its image.\n- Large shifts smear transients, which is inherent to stretching rather than a defect of this implementation.\n- No formant handling, so a heavily shifted voice sounds a little larger or smaller as well as higher or lower.\n- One fixed interval applies to the whole file, with no change over time.\n- The output is sixteen bit WAV whatever the source was.\n\nUse it for the jobs a pitch change solves: moving a track into a key a singer can reach, tuning a recording that was made at the wrong reference, building a harmony from a shifted copy, or matching a sample to the material around it. When only the duration should change, the time stretcher and tempo changer keep the pitch where it is, and when a single note needs correcting inside a performance rather than a whole file being moved, pitch correction works note by note instead. The interval is stated in semitones because that is the unit musicians already think in, and the cents control covers the fraction of a semitone that matching an existing recording often needs.",
    howTo: [
      { step: "Drop an audio file onto the panel and wait for it to decode." },
      { step: "Choose the interval in semitones, using the fine-tune in cents for smaller corrections." },
      { step: "Check the reported multiplier and the note the reference pitch lands on." },
      { step: "Press process, compare the previews, and download the shifted WAV." },
    ],
    whenToUse:
      "Audio Pitch Shifter is the tool when the pitch must move and the timing must not, which makes it the choice for key changes and reference tuning. {{tempo-changer|Tempo Changer}} and {{time-stretcher|Time Stretcher}} change duration with the pitch held instead, and {{audio-speed-changer|Audio Speed Changer}} offers both behaviours from one control if you have not yet decided which you need. To transpose written material rather than recorded audio, {{musical-transpose-tool|Musical Transpose Tool}} works in note names.",
    faqs: [
      {
        q: "Why does a large shift sound smeared?",
        a: "Because the pitch has to be rebuilt from grains of the original audio. Small changes overlap grains that are still very similar, while large ones have to repeat and blend portions that no longer match, and the result is a loss of transient sharpness. It is a property of time-domain stretching, not a setting that can be tuned away.",
      },
      {
        q: "Is the timing really untouched?",
        a: "Yes. The stretch stage is driven by exactly the factor the resample stage used, so the two cancel in duration terms. The output length equals the input length to the sample, which means a shifted file lines up with the original if both are placed at the same start point.",
      },
      {
        q: "What does the cents control do that whole semitones cannot?",
        a: "It moves the pitch by hundredths of a semitone, which is the range you need to fix a recording made slightly off pitch or to meet another instrument exactly. Fifty cents is half a semitone in each direction, so the fine-tune and the interval sliders overlap only at the extremes of taste.",
      },
      {
        q: "Can I shift only part of a file?",
        a: "The whole file is shifted in one pass, so a single interval applies throughout. To shift one section only, keep that section with the trimmer, shift it, then join it back into place with the joiner.",
      },
      {
        q: "Does the shift change the stereo image?",
        a: "No. Both channels are shifted by the same factor and the same method, so the relative timing between them is unchanged and the image stays where it was. The tool accepts up to two channels and leaves anything wider alone.",
      },
    ],
  },

  "tempo-changer": {
    keywords: [
      "BPM ratio",
      "percent",
      "WSOLA",
      "pitch",
    ],
    intro:
      "Tempo Changer speeds a recording up or slows it down while the pitch stays exactly where it was. Give it an original and a target tempo and it works out the ratio, or drive it directly with a percentage.",
    content:
      "Load a file, choose whether to work in tempo or in percent, and process. The report states the ratio, the two tempos or the percent, the duration before and after, and confirms that the pitch was preserved.\n\nThe controls:\n\n- A pair of mode buttons, one for tempo and one for percent.\n- In tempo mode, an original and a target tempo from twenty to four hundred beats per minute, defaulting to a hundred and twenty and a hundred and twenty four.\n- In percent mode, a single slider from fifty to two hundred percent, defaulting to a hundred.\n- A report line with the ratio, the duration change and the note that the pitch was preserved.\n\nThe arithmetic is deliberately small. In tempo mode the BPM ratio is the target divided by the original, protected against a zero original so a slip of the keyboard cannot produce an infinite ratio; in percent mode the ratio is simply the percentage over a hundred. A faster tempo means a shorter file, so the stretch factor handed to the engine is the reciprocal of the ratio. The engine itself is a windowed overlap-add method in the WSOLA family: the audio is cut into overlapping grains, each output grain searches a short range of positions for the one that best continues the waveform already written, and the search is what keeps pitched material from turning into a comb-filtered mess. Because the grains are recombined at new positions rather than played faster, the pitch and the timbre survive intact — this is a time operation, not a speed operation. The honest limit is the same one any such method has. Within roughly fifteen percent in either direction the change is hard to hear; beyond that transients begin to soften and percussion loses some of its snap, because a grain-based method reconstructs attacks rather than moving them. Both modes are pure functions of the samples and the ratio, so the same file and the same setting always produce the same output.\n\nWhere it struggles:\n\n- Extreme changes smear transients, so a very large tempo move is best reserved for material without sharp attacks.\n- No independent pitch control, because holding the pitch is the entire point here.\n- Nothing about groove is analysed, so the result is a proportional change rather than a tempo map.\n- One ratio applies to the whole file.\n- No formant handling, so a large stretch on speech can sound odd even with the pitch intact.\n- Output is sixteen bit WAV, and up to two channels are processed.\n\nUse it when a take sits at the wrong tempo for an edit, when a practice recording should be a little slower to follow, or when a demo needs to be heard at performance speed. When the pitch should move with the speed instead, the speed changer's tape mode does that by resampling. When the same job is stated as a length rather than a tempo, the time stretcher says it in different units. Reading the reported ratio before and after is the quickest way to confirm what a change implies, since the duration movement appears on the same line as the setting that produced it.",
    howTo: [
      { step: "Drop an audio file onto the panel and note the duration shown." },
      { step: "Choose to work by tempo or by percent, depending on how the problem is stated." },
      { step: "Enter the original and target tempo, or move the percent slider." },
      { step: "Press process, read the reported duration change, and download the result." },
    ],
    whenToUse:
      "Tempo Changer is the tool when the tempo is the thing being named, which is how a musician usually states the problem. {{time-stretcher|Time Stretcher}} handles the same job from a length-first point of view, and {{audio-speed-changer|Audio Speed Changer}} adds a tape-style mode where the pitch moves with the speed. To find the tempo of a file you already have, {{bpm-calculator|BPM Calculator}} and {{tap-tempo|Tap Tempo}} measure it before you change anything.",
    faqs: [
      {
        q: "What is the difference between this and the speed changer?",
        a: "This tool only ever changes duration, so the pitch comes out where it started. The speed changer offers both behaviours: a tape mode that resamples and moves pitch with speed, and a keep-pitch mode that works like this one. If the pitch must not move, the two are equivalent.",
      },
      {
        q: "How far can I push the change before it sounds wrong?",
        a: "Around fifteen percent in either direction is where most material stays convincing. Beyond that the grains have to be positioned further from where they naturally continue, and attacks start to lose their edge. Percussion shows it first and sustained material last.",
      },
      {
        q: "Do I need to know the original tempo exactly?",
        a: "Only if you want a specific target figure. Because the tool uses the ratio between the two numbers, an error in both cancels out; if you are unsure, an original of a hundred and twenty and a target of a hundred and thirty two gives the same ten percent change as any other pair in the same proportion.",
      },
      {
        q: "Does the tempo change affect the pitch at all?",
        a: "No. The audio is rebuilt from overlapping grains rather than played at a different rate, so every frequency ends up where it began. That is precisely why the method is slower than a resample, which would need no search at all.",
      },
      {
        q: "Can I change tempo gradually across a file?",
        a: "There is one ratio for the whole file, so the change is proportional and constant. For a recording that drifts, split it at the points where the tempo changes, process each part with the ratio it needs, and join the results with the joiner.",
      },
    ],
  },

  "time-stretcher": {
    keywords: [
      "length multiplier",
      "overlapping grains",
      "pitch",
      "duration",
    ],
    intro:
      "Time Stretcher makes a recording longer or shorter without touching its pitch. The control is a length multiplier, so the job is stated in the units a sound editor usually thinks in.",
    content:
      "Choose a multiplier, drop a file, and process. The report gives the factor, the duration before and after, and confirmation that the pitch came through unchanged.\n\nThe controls:\n\n- A single slider from half length to double, in steps of a twentieth, defaulting to one and a quarter.\n- A report line with the multiplier, the two durations, and the statement that the pitch was preserved.\n- No mode switch and no secondary settings, because a length multiplier fully describes the operation.\n- Up to two channels, so a stereo file stays a stereo file.\n\nStretching works by overlapping grains. The audio is cut into short windows that overlap each other, and the output rebuilds the signal by placing those windows at new positions — closer together to shorten, further apart to lengthen. The naive version of that produces a hollow, phasey result, because grains that were never adjacent get crossfaded into each other. The method used here searches, for every output grain, a small range of positions for the one whose onset best continues what has already been written, which keeps successive grains on the same part of the waveform. That search is the entire reason a stretched voice still sounds like the same voice rather than like a chorus of it, and it is also why a long stretch takes noticeably longer than a resample would. A multiplier below one removes time and a multiplier above one inserts it, and the reported duration is the source duration multiplied by the factor. The limit is material-dependent rather than numerical: pads, ambiences and sustained tones stretch beautifully because they have no sharp events to misplace, while percussive loops are happiest within twenty percent or so, since a drum hit is a very short event that a grain grid can only approximate. Nothing about the pitch moves in either direction, which is what separates this from simply playing the file faster.\n\nWhat it cannot fix:\n\n- Extreme factors sound smeared on transient-rich material.\n- No pitch control on top, so a stretch and a shift are two separate passes.\n- One factor for the whole file, with no gradual change.\n- No tempo or beat information is read, so the result is proportional rather than bar-aligned.\n- Formants are not handled, so a large stretch on speech can sound unnatural even with the pitch intact.\n- Output is sixteen bit WAV.\n\nUse it for fitting a piece of audio to a fixed slot in an edit, slowing a phrase down to hear it in detail, or extending an ambience that was recorded slightly too short. When the change should be described as a tempo in beats per minute, the tempo changer takes the same ratio from the other direction, and when the pitch needs to move as well, the pitch shifter and speed changer cover that ground. Two things are worth knowing before a stretch. The output length follows the multiplier applied to the sample count, so the duration you get is the duration the arithmetic implies rather than an approximation. And because grains are placed by search rather than by rounding, the cost of a long stretch is processor time, not quality, which means a file that takes a while to process has not been damaged by the wait.",
    howTo: [
      { step: "Drop an audio file onto the panel and wait for the duration to appear." },
      { step: "Move the slider to the multiplier you need, above one to lengthen and below one to shorten." },
      { step: "Press process and read the reported before and after durations." },
      { step: "Play the result and download it if the pitch and transients hold up." },
    ],
    whenToUse:
      "Time Stretcher is the right shape when a piece of audio has to fit an exact duration, such as a cue that runs two seconds long. {{tempo-changer|Tempo Changer}} states the same change as a beat rate instead, and {{audio-speed-changer|Audio Speed Changer}} can move speed and pitch together when that is what the material wants. To work out what a proposed change does to the running time, {{playback-speed-calculator|Playback Speed Calculator}} does the arithmetic without processing any audio.",
    faqs: [
      {
        q: "Will a stretched voice still sound like a voice?",
        a: "Within reasonable limits, yes, because the pitch is untouched and the grains are aligned to the waveform. Large stretches can still sound unnatural on speech, because the spacing between the harmonics stays fixed while the events around them spread out, which no time-domain method fully resolves.",
      },
      {
        q: "Which material stretches best?",
        a: "Sustained material: pads, room tone, drones, strings and reverb tails, where there are no sharp events to place wrongly. Percussive loops are the hardest case, because a drum hit is a very short event and the grain grid can only land near it rather than on it.",
      },
      {
        q: "Why does stretching take longer than a speed change?",
        a: "Because every output grain searches a small range of positions for the one that continues the waveform best, and that search costs roughly a second of processor time per minute of audio. Resampling has no search at all and is effectively instant.",
      },
      {
        q: "Should I stretch in one big step or several small ones?",
        a: "Several small steps usually hold up better. Each pass only has to move grains a short distance, so less misalignment accumulates, and the total change is the product of the factors. It costs more processing time, which is the trade.",
      },
      {
        q: "Does the length come out exactly as the multiplier says?",
        a: "The output length is driven by the factor applied to the sample count, so the duration follows the arithmetic closely. Reading the reported before and after figures is the reliable way to confirm what a particular file actually produced.",
      },
    ],
  },

  "audio-normalizer": {
    keywords: [
      "peak normalization",
      "loudness normalization",
      "ceiling",
      "joint",
    ],
    intro:
      "Audio Normalizer brings a file to a chosen level, either by its loudest sample or by its average loudness. The two modes answer different questions, and the panel reports which one applied.",
    content:
      "Pick a mode, set the target, drop a file, and process. The report states the level before and after, and in the loudness mode it tells you honestly when the ceiling stopped the target being reached.\n\nThe controls:\n\n- Two mode buttons, one labelled for peak and one for average loudness.\n- In peak mode, a target from twelve decibels below full scale to full scale, in half-decibel steps, defaulting to minus one.\n- In loudness mode, a target from minus thirty to minus nine decibels, defaulting to minus eighteen, plus a ceiling from minus six to zero, defaulting to minus one.\n- A report line giving the measured input level and the level actually achieved, with an explicit note when the ceiling got in the way.\n\nPeak normalization measures the largest sample in the file and multiplies everything by whatever gain puts that sample on the target. Because the peak is the largest value present, no gain chosen this way can push anything past full scale, which makes the mode safe by construction and exact by definition. Loudness normalization measures instead the square root of the mean of the squares, which is a fair approximation of how loud the material sounds rather than how loud its worst moment is. That measurement is taken jointly across the channels rather than per channel, and a single gain is derived and applied to all of them, which is the detail that preserves stereo balance: normalizing the channels separately would move a centred element off-centre as soon as one side happened to peak higher. The gain is then limited by the ceiling. If reaching the loudness target would push the loudest sample above the ceiling, the smaller gain wins, and the report says so plainly rather than quietly clipping. A file with a high peak and a low average, which is what a sparse recording with one loud transient looks like, is exactly the case where the target will not be met. Both modes are two-pass operations: measure first, then scale, so nothing depends on the order the channels are visited.\n\nWhat it does not do:\n\n- No dynamic processing, so the relationship between loud and quiet passages is unchanged.\n- Loudness mode will miss a low target on peaky material, and says so rather than clipping.\n- No true-peak measurement, so inter-sample peaks are not considered.\n- No measurement over time, so there is no loudness range or short-term view.\n- Peak mode gives no indication of perceived loudness at all, only of the sample maximum.\n- Output is sixteen bit WAV.\n\nUse it for the two jobs the modes describe: hitting an exact peak so a file cannot clip downstream, or bringing a set of recordings to a consistent perceived level so they sit together. When the goal is a broadcast-standard loudness measurement rather than a quick level match, the loudness normalizer follows the same intent with the full standard behind it, and when the level simply needs raising without a target in mind, the amplifier adds a fixed amount of gain and warns you about clipping.",
    howTo: [
      { step: "Drop an audio file onto the panel and let it decode." },
      { step: "Choose peak if an exact maximum matters, or loudness if perceived level matters." },
      { step: "Set the target, and in loudness mode also the ceiling that must not be crossed." },
      { step: "Press process, read the achieved level in the report, and download the result." },
    ],
    whenToUse:
      "Audio Normalizer is the quick level match, whether the goal is a safe peak or a consistent average. {{loudness-normalizer|Loudness Normalizer}} answers the same question against a published standard, and {{rms-normalizer|RMS Normalizer}} is the narrow version that measures only average level. When the level needs a fixed lift rather than a target, {{audio-amplifier|Audio Amplifier}} and {{volume-booster|Volume Booster}} add gain, the second with a limiter behind it.",
    faqs: [
      {
        q: "Which mode should I choose by default?",
        a: "Peak, if the file is going somewhere that must not clip and there is no loudness specification to meet. Loudness, if several files have to sit together at a similar perceived level, which is the case for a set of recordings made at different times.",
      },
      {
        q: "Why did the loudness target not get reached?",
        a: "Because the ceiling blocked it. A file with one loud transient and a low average needs a lot of gain to lift its average, and that much gain would push the transient past the ceiling. The tool takes the smaller gain and reports the level it actually achieved instead of hiding the shortfall.",
      },
      {
        q: "Does normalizing change the character of the audio?",
        a: "Not in peak mode, where every sample is multiplied by the same factor and the balance between loud and quiet is untouched. In loudness mode the same is true, since one gain is computed for the whole file; what changes is only the overall level.",
      },
      {
        q: "Why is one gain used for both channels?",
        a: "Because a stereo file has a balance that depends on the relative levels of the two sides. Computing a gain per channel would move a centred element to one side whenever one channel happened to be louder, so the measurement is taken jointly and one gain is applied to both.",
      },
      {
        q: "Does it make a quiet recording as loud as a commercial one?",
        a: "Only up to the ceiling. Raising the average without raising the peak requires reducing the dynamic range, which is compression rather than normalization. A compressor run before this tool is the usual way to close the remaining gap.",
      },
    ],
  },

  "audio-amplifier": {
    keywords: [
      "decibels",
      "gain",
      "clipped samples",
      "clipping",
    ],
    intro:
      "Audio Amplifier multiplies a file by a gain you choose in decibels, and tells you exactly how many samples hit the ceiling along the way. It is the plainest way to make a quiet recording louder.",
    content:
      "Set the gain, drop a file, and process. The footer reports the peak the file had before the change and, if anything ran out of range, the number of samples that were clipped.\n\nThe controls:\n\n- A gain slider from one to twenty four decibels, in one-decibel steps, defaulting to six.\n- Four presets at three, six, ten and twenty decibels for the usual cases.\n- A footer line giving the input peak both as a value and in decibels below full scale.\n- An explicit warning naming the number of samples that were clipped, or a confirmation that nothing was.\n\nThe gain is applied by converting decibels into a linear multiplier and scaling every sample by it. Decibels are a ratio, so six decibels doubles the amplitude and twenty decibels multiplies it by ten; the conversion is the standard power-of-ten relationship between the two scales. Because the multiplier is applied uniformly, the file's internal balance is untouched — the quiet parts get louder by exactly as much as the loud parts do, which is what separates this from a compressor. Anything that lands outside the valid range is clamped to the ceiling, and every sample that had to be clamped is counted. Clipping is a hard failure of a waveform rather than a gentle reduction: a peak that would have reached a third above full scale is instead flattened into a straight line, which adds harmonics that were not in the original and is heard as harshness rather than as extra level. That is the whole reason the count is reported. If it is zero, the boost was safe and the file is simply louder. If it is not, the answer is a smaller boost, a normalizer aimed at a safe target, or the volume booster, which uses a limiter so the peaks are controlled rather than squared off.\n\nWhere it is limited:\n\n- Only upward gain, so lowering a level is the volume reducer's job.\n- No dynamics, so loud and quiet passages stay the same distance apart.\n- Clipped samples are clamped rather than compressed, and the result is audible as harshness.\n- No metering beyond the input peak and the clip count.\n- One gain for the whole file and for every channel.\n- Output is sixteen bit WAV.\n\nUse it when a recording is simply too quiet and a fixed lift is all that is needed: a field recording that came back low, a voice memo that sits far below the rest of a project, or a stem that needs to be brought up to match its neighbours. When the goal is a specific level rather than a specific increase, the normalizer aims at a target instead, and when the material has peaks that must not clip, the limiter and the volume booster control them while the gain is applied. Knowing the amount of headroom first is what makes the choice easy: a file whose peak is already close to full scale has nowhere for the boost to go, and a file that sits well below it can take a large one without a single sample reaching the ceiling.",
    howTo: [
      { step: "Drop an audio file onto the panel; the duration appears once it decodes." },
      { step: "Set the gain with the slider or one of the four presets." },
      { step: "Press process and read the peak and the clip count in the footer." },
      { step: "If samples were clipped, lower the gain and run it again before downloading." },
    ],
    whenToUse:
      "Audio Amplifier is the straightforward gain stage, useful when the amount of lift is known and the material has headroom to take it. {{audio-normalizer|Audio Normalizer}} aims at a target level instead of adding a named amount, and {{volume-booster|Volume Booster}} applies gain behind a limiter so a quiet file can be lifted hard without squaring off its peaks. When the level must come down rather than up, {{volume-reducer|Volume Reducer}} does that.",
    faqs: [
      {
        q: "Why did the boost clip only some samples?",
        a: "Because clipping depends on the peak, not on the average. A file can sit mostly well below full scale and still have a few loud transients near the ceiling; those are the samples that run out of range first. The count tells you how many, which is a good guide to how much smaller the boost needs to be.",
      },
      {
        q: "Is six decibels really twice as loud?",
        a: "Six decibels is twice the amplitude, which is a real and measurable doubling of the waveform. Perceived loudness roughly doubles nearer ten decibels, because the ear responds to level logarithmically, which is why the presets step the way they do and why a small-looking change can be very audible.",
      },
      {
        q: "Does amplifying change the tone?",
        a: "Multiplying by a constant does not alter the frequency content at all, so an unclipped boost is tonally transparent. Clipping does change the tone, because a flattened peak introduces harmonics that were not present in the source.",
      },
      {
        q: "How do I make a file louder without clipping it?",
        a: "Raise the average rather than the peak. A limiter or the volume booster catches transient peaks while the rest of the material comes up, and a compressor run beforehand reduces the distance between loud and quiet, which is what the extra level has to fit into.",
      },
      {
        q: "Can I reduce the level with a negative value?",
        a: "The slider runs from one to twenty four decibels upward, so it is a boost only. Reducing a level is exactly the same arithmetic with a multiplier below one, and the volume reducer offers it with the same clarity.",
      },
    ],
  },

  "audio-limiter": {
    keywords: [
      "ceiling",
      "lookahead",
      "release",
      "brick wall",
    ],
    intro:
      "Audio Limiter holds every peak below a ceiling you set, which is what makes brick wall peak control possible without cutting the file short. It looks ahead so it can turn a peak down before it arrives.",
    content:
      "Set the ceiling and the timing, drop a file, and process. The report gives the peak before and after and states that the ceiling was never exceeded.\n\nThe controls:\n\n- A ceiling from six decibels below full scale to full scale, in half-decibel steps, defaulting to minus one.\n- A lookahead from one to twenty milliseconds, defaulting to five.\n- A release from twenty to five hundred milliseconds, defaulting to a hundred.\n- A report line with the input and output peaks and the ceiling that was held.\n\nWhat separates a limiter from a compressor is the promise rather than the amount of reduction. The engine works through a ring buffer that delays the output by exactly the lookahead length: sample values and their computed gains are stored in matching slots, and audio is emitted from a slot only after the gain for it has already been decided. That ordering is the whole trick. Because the gain was calculated when the peak was seen rather than recovered after it had passed, no sample can slip out at the wrong level — the answer is fixed before the sample leaves the buffer. The gain required at any point is the smallest needed by any sample in the next lookahead window, and the release curve then lets the gain climb back toward unity between peaks, slower or faster according to the release time. A short lookahead reacts sooner but has less room to move smoothly; a long one is gentler on dense material. The release is where the sound is decided: a long release keeps the level down through a passage of close peaks, which sounds smooth but can dull a whole section, while a short one springs back between hits, which is punchier but can pump on sustained material. Using it as the final stage before export is the intended place, since nothing downstream can undo a peak that has already been caught.\n\nWhere it does not help:\n\n- It cannot restore headroom that the material never had; heavy reduction sounds compressed.\n- No metering of inter-sample peaks, so a converted file can still overshoot downstream.\n- Reduction is applied to the whole file, with no per-band treatment.\n- Loudness is not measured, so this is not a loudness tool.\n- Up to two channels, and all are limited independently rather than as a linked pair.\n- Output is sixteen bit WAV.\n\nUse it as the last stage of a chain: after equalization and compression, before export, when a mix is a decibel over and must not clip. When the ceiling has to be guaranteed against inter-sample peaks as well, the brickwall limiter is the stricter version, and when the goal is loudness rather than peak control, the normalizer and loudness normalizer answer a different question. The lookahead and release are the only two controls that change how it sounds, and both have a natural resting place: a few milliseconds of lookahead is enough to catch anything a converter will later care about, and a release in the low hundreds of milliseconds suits most material. What the engine will not do is pretend. It reports the peaks before and after rather than asserting success, so if the input never approached the ceiling the honest reading is that almost nothing happened and no brick wall was needed.",
    howTo: [
      { step: "Drop an audio file onto the panel and note the reported input peak." },
      { step: "Set the ceiling to the level the file must not exceed." },
      { step: "Choose the lookahead and release, longer release for dense material." },
      { step: "Press process, check that the output peak sits at the ceiling, and download the WAV." },
    ],
    whenToUse:
      "Audio Limiter is the peak-control stage for the end of a chain, where the requirement is that nothing goes over a line. {{brickwall-limiter|Brickwall Limiter}} is the stricter sibling for material that must survive a later conversion, and {{peak-limiter|Peak Limiter}} takes the same idea with fewer settings. To raise loudness rather than control peaks, {{audio-normalizer|Audio Normalizer}} and {{loudness-normalizer|Loudness Normalizer}} aim at a level instead.",
    faqs: [
      {
        q: "What does the lookahead actually do?",
        a: "It delays the audio by the chosen number of milliseconds while keeping the sample values and their gains in matched slots. When a peak is seen, the gain that will handle it is stored with it, so the delayed sample is emitted already reduced. Without that delay the gain could only react after the peak had been written.",
      },
      {
        q: "Why does a long release sound smoother but duller?",
        a: "Because the gain stays reduced through a run of peaks rather than returning to unity between them. That avoids the level flapping up and down, which is heard as pumping, but it also means the whole passage sits lower than it otherwise would, which reads as a loss of life on dense material.",
      },
      {
        q: "Will the ceiling be met exactly?",
        a: "No sample will exceed it, which is the promise, and the reported output peak shows how close the file ends up. If the peaks were not actually over the ceiling to begin with, there may be nothing to reduce and the file passes through essentially unchanged.",
      },
      {
        q: "Is a limiter the same as a compressor with a high ratio?",
        a: "They share the arithmetic but not the guarantee. A compressor reduces gain according to a ratio and an envelope, while a limiter promises that nothing passes the ceiling, which is why it needs the lookahead and the ring buffer rather than reacting to level as it arrives.",
      },
      {
        q: "Can I use several passes of limiting?",
        a: "You can, and each pass flattens the material a little further, because the promise only concerns the peak and says nothing about how much of the waveform has been pressed against it. One careful pass with a sensible ceiling usually sounds better than three conservative ones.",
      },
    ],
  },

  "audio-compressor": {
    keywords: [
      "threshold",
      "ratio",
      "soft knee",
      "attack",
      "release",
    ],
    intro:
      "Audio Compressor reduces the distance between the loudest and quietest parts of a recording, so a mix sits at a more even level. Every parameter of the classic gain computer is exposed, including the knee.",
    content:
      "Set the six controls, drop a file, and process. The report states the ratio and threshold that applied, the average level before and after, and the make-up gain if any was used.\n\nThe controls:\n\n- A threshold from forty eight decibels below full scale to full scale, defaulting to minus twenty four.\n- A ratio from one to twenty to one, in half steps, defaulting to four to one.\n- A knee from zero to twelve decibels, defaulting to six.\n- An attack from one to a hundred milliseconds, defaulting to ten.\n- A release from twenty to six hundred milliseconds, defaulting to a hundred and twenty.\n- A make-up gain from zero to eighteen decibels, defaulting to zero.\n\nThe engine is a static gain computer with a soft knee and an envelope follower. Above the threshold, a sample is reduced according to the ratio: at four to one, four decibels above the threshold produce one decibel of extra output, so the loud parts are pushed back toward the threshold while everything below it passes untouched. The knee is what happens at the boundary. With a hard knee the gain reduction switches on abruptly the moment a sample crosses the line, which is audible on material that hovers there; a soft knee spreads that transition over the chosen number of decibels, so the compression fades in rather than switching. Attack and release set how quickly the gain follows the signal, and they are the controls that decide the character rather than the amount. A slow attack lets the first few milliseconds of a transient through before the gain comes down, which is what makes a drum sound punchy; a fast attack catches the transient and holds it down, which is what makes a part sound dense and controlled. Release governs how quickly the gain returns, and too fast a release on low-frequency material produces audible level flapping. The average level is reported before and after, which is the honest measure of how much the dynamic range actually shrank. Make-up gain is a plain fixed lift applied afterwards, and it is deliberately separate rather than automatic, because only you know whether the reduced file needs bringing back up.\n\nWhat it does not do:\n\n- No automatic make-up gain, so the average level drops unless you add it.\n- No gain-reduction metering over time, only the average before and after.\n- One band only, so a single loud low end affects the whole spectrum.\n- Channels are compressed independently, so a stereo image can shift under heavy compression.\n- No sidechain input, so it cannot be triggered by another signal.\n- Output is sixteen bit WAV.\n\nUse it to even out a performance that drifts in level, to add sustain to a bass or a guitar, or to make a mix sit together before a final level stage. When the reduction should be spread across the spectrum instead, the multiband compressor splits the bands first, and when a copy of the signal should be blended back in for a denser result without a fully compressed sound, the parallel compressor does that with one control.",
    howTo: [
      { step: "Drop an audio file onto the panel and let it decode." },
      { step: "Set the threshold just below the level of the loud passages you want reduced." },
      { step: "Choose the ratio for how much reduction, then the knee and the attack and release for how it behaves." },
      { step: "Press process, read the reported average levels, and add make-up gain if the file is now too quiet." },
    ],
    whenToUse:
      "Audio Compressor is the general-purpose dynamics stage, useful when a performance varies in level or a part needs more sustain. {{dynamic-range-compressor|Dynamic Range Compressor}} is the way to reach for a specific amount of range reduction, and {{multiband-compressor|Multiband Compressor}} splits the spectrum first so a loud low end does not drag the whole signal down. When the reduction should be triggered by another track, {{sidechain-compressor|Sidechain Compressor}} adds that routing.",
    faqs: [
      {
        q: "Why did the file get quieter?",
        a: "Because compression reduces whatever sits above the threshold, and unless the quiet parts happen to fill the gap the average level falls. That is what the make-up gain control is for: add roughly the amount of reduction you can hear, then check the reported average against the original.",
      },
      {
        q: "What is the knee for?",
        a: "It softens the transition into compression. With a hard knee the gain reduction arrives the instant a sample crosses the threshold, which is audible on material that sits near the line. A soft knee spreads that change over a few decibels so the compression arrives gradually instead.",
      },
      {
        q: "How do I make a drum sound punchier?",
        a: "Slow the attack down. With an attack of ten to thirty milliseconds the gain does not come down until after the initial transient has passed, so the hit keeps its edge while the body behind it is controlled. A fast attack does the opposite and makes the sound denser.",
      },
      {
        q: "What does pumping sound like and how do I stop it?",
        a: "It is the level rising and falling audibly with the rhythm, caused by the gain returning too quickly between peaks. Lengthening the release is the first fix; if that dulls the material, a lower ratio with a lower threshold spreads the work over more of the signal.",
      },
      {
        q: "Is compressing twice the same as compressing harder once?",
        a: "Not quite. Two gentle stages with different settings tend to sound more transparent than one aggressive stage, because neither has to do very much at any instant. That said the parallel compressor reaches a similar goal by blending a compressed copy with the original.",
      },
    ],
  },

  "audio-expander": {
    keywords: [
      "downward expansion",
      "threshold",
      "ratio",
      "knee",
    ],
    intro:
      "Audio Expander pushes everything below a threshold further down, which is the opposite motion to a compressor. It tightens a noisy recording gradually rather than cutting to silence.",
    content:
      "Set the threshold, ratio and timing, drop a file, and process. The report gives the threshold, the downward ratio, and the average level before and after.\n\nThe controls:\n\n- A threshold from sixty decibels below full scale down to twelve below, defaulting to minus thirty five.\n- A downward ratio from one to ten to one to one to one and a tenth, defaulting to one to two, shown as the downward figure.\n- A knee from zero to twelve decibels, defaulting to six.\n- An attack from one to fifty milliseconds, defaulting to five.\n- A release from twenty to six hundred milliseconds, defaulting to a hundred and fifty.\n\nThe motion is the mirror image of compression. Everything above the threshold passes through unchanged, and everything below it is reduced in proportion to how far below it sits, according to the ratio: at one to two downward, a passage ten decibels below the threshold comes out twenty decibels below. That proportionality is what distinguishes expansion from gating. A gate decides yes or no for each moment and produces silence, while an expander keeps the quieter material present, just further down, so the result reads as a recording with more contrast rather than one with holes in it. The knee again spreads the transition into the reduction so the change is not abrupt at the line, and attack and release decide how quickly the gain follows. The practical use is setting the threshold just above the noise floor of a room recording. Speech and music sit above it and are untouched; hiss, air conditioning and room tone sit below it and sink, and because they sink rather than vanish the result keeps its natural texture. On a signal that already has a clean floor, an expander will do very little, which is the correct outcome rather than a failure. Too low a threshold and nothing is affected; too high and the quiet consonants of speech start to be pushed down, which is usually heard first as a loss of intelligibility rather than as noise reduction.\n\nWhat it does not do:\n\n- It reduces rather than removes, so a very loud noise floor still leaves something behind.\n- High ratios begin to behave like a gate and share the gate's artefacts instead of the expander's smoothness.\n- No frequency dependence, so broadband noise and quiet musical detail are treated identically.\n- The average level falls, and no make-up gain is applied automatically.\n- Channels are processed independently, so a stereo image can shift on very quiet material.\n- Output is sixteen bit WAV.\n\nUse it when a recording needs tightening without hard edges: a noisy room that should stay natural, a drum bus where the gaps between hits should feel quieter, or a spoken take where the pauses should not sit as high as they do. When the quiet parts should become true silence, the gate does that with its own controls for holding open and fading the edges, and when the noise itself should be targeted by its character rather than its level, the noise reducer and the specialist removers work on what the noise sounds like. The motion it applies has a name worth knowing, since it is what separates the two tools people most often confuse: downward expansion scales the quiet material rather than switching it, so the result keeps the room's character instead of acquiring the abrupt edges a gate produces.",
    howTo: [
      { step: "Drop an audio file onto the panel and play a quiet passage to hear its floor." },
      { step: "Set the threshold just above the noise floor so speech and music stay clear of it." },
      { step: "Choose a gentle downward ratio and check the knee and timing." },
      { step: "Press process, compare the reported average levels, and download the result." },
    ],
    whenToUse:
      "Audio Expander is the gentle way to add contrast and push a noise floor down without cutting holes in the material. {{audio-gate|Audio Gate}} removes rather than reduces, which is more decisive and more drastic. When the noise has a recognisable character, {{noise-reducer|Noise Reducer}} and {{hiss-remover|Hiss Remover}} address it by its spectrum instead of by its level.",
    faqs: [
      {
        q: "How is this different from a gate?",
        a: "A gate makes a decision per moment and produces silence below its threshold, which is why it needs hysteresis and a hold time to avoid chattering. An expander scales instead, so a quiet passage stays audible but further down, and the result keeps its texture rather than being cut into.",
      },
      {
        q: "Will it remove the background noise completely?",
        a: "No, and that is deliberate. Expansion divides the quiet material down by a ratio, so a floor thirty decibels below the signal can be pushed to sixty, which is enough to stop it being noticed without deleting it. Complete removal needs a gate or a spectral tool.",
      },
      {
        q: "How do I set the threshold?",
        a: "Just above the noise floor of the recording. If you can hear the noise sitting under the speech and the threshold is set below it, nothing will happen; if consonants start disappearing, the threshold has climbed into the quiet parts of the signal and should come back down.",
      },
      {
        q: "Why is the maximum downward ratio only one to ten?",
        a: "Because beyond that an expander stops being an expander and starts behaving like a gate with a soft edge, inheriting the gate's artefacts without its controls. When you want that much reduction, the gate is the honest tool for it.",
      },
      {
        q: "What does the release time change here?",
        a: "How quickly the gain comes back up after the signal rises above the threshold again. Too fast and the noise floor swells back audibly after each phrase; too slow and the beginning of the next passage sounds dull because the gain has not recovered yet.",
      },
    ],
  },

  "audio-gate": {
    keywords: [
      "hysteresis",
      "hold",
      "edge fade",
      "gated",
    ],
    intro:
      "Audio Gate silences everything below a closing threshold, with a second threshold for opening and a hold time so the result does not stutter. It reports the share of the file it actually silenced.",
    content:
      "Set the two thresholds and the timing, drop a file, and process. The footer gives the thresholds, the percentage of the file that was gated, and the input peak.\n\nThe controls:\n\n- An open threshold from sixty decibels below full scale to ten below, defaulting to minus forty.\n- A close threshold over the same range, defaulting to minus fifty.\n- A hold from zero to a thousand milliseconds, defaulting to a hundred and fifty.\n- An edge fade from one to a hundred milliseconds, defaulting to ten.\n- A footer line with both thresholds, the percentage gated, and the peak of the input.\n\nTwo thresholds rather than one is the detail that makes a gate usable. The level has to rise above the open threshold before anything passes, but it only has to fall below the lower close threshold before the gate shuts again, and the gap between them is the hysteresis that stops a signal hovering on a single line from chattering the gate open and closed many times a second. The envelope driving that decision is a short windowed measurement of level rather than the raw sample value, which is what stops a single high sample from opening the gate and a single low one from closing it. Hold time then keeps the gate open for a set period after it has opened, which is what prevents short pauses inside a word from being cut into separate fragments. The fade applies a ramp on both edges rather than switching instantly, because a hard switch steps the waveform away from whatever level it was at and that step is a click. Everything below the close threshold ends up at true silence, which is the point of the tool, and the reported percentage is the honest measure of how much of the file that turned out to be. The two thresholds are linked so the close can never be raised above the open, since that arrangement would make the gate attempt to close and open on the same level. As with any gate, the risk is the same one: a threshold set too high takes the quiet parts of the wanted signal with it, and on speech that shows up as missing consonants rather than as a cleaner recording.\n\nWhere the gate is the wrong tool:\n\n- Hard silencing is audible on music and on natural-sounding dialogue.\n- Frequencies are not considered, so hiss at the same level as breath is gated with it.\n- Everything below the threshold goes to zero, so there is no partial reduction.\n- No lookahead, so the very start of a sound may be trimmed before the gate opens.\n- Independent channels mean a stereo image can shift when only one side passes.\n- Output is sixteen bit WAV.\n\nUse it where silence is the correct answer: cleaning the gaps in a spoken-word recording that has a noisy background, silencing a guitar amp between phrases, or preparing a stem whose pauses should be truly empty. When a gentler result is wanted, the expander reduces below the threshold rather than removing, and when the goal is to take out the quiet stretches of a long recording to shorten it, the silence remover does that by finding them and cutting them away.",
    howTo: [
      { step: "Drop an audio file onto the panel and listen to a passage that should be silent." },
      { step: "Set the open threshold just above the level of the material to keep." },
      { step: "Set the close threshold below the open one so hysteresis has room." },
      { step: "Choose a hold long enough to bridge short pauses and a few milliseconds of edge fade, then process." },
    ],
    whenToUse:
      "Audio Gate is the tool when the wanted answer is true silence, which suits noisy spoken word, amp noise between phrases and stems that should have empty pauses. {{audio-expander|Audio Expander}} makes the same decision gradually rather than absolutely. When the aim is a shorter file rather than a quieter one, {{silence-remover|Silence Remover}} cuts the quiet spans out altogether, and {{noise-reducer|Noise Reducer}} addresses noise by its spectrum instead of its level.",
    faqs: [
      {
        q: "Why are there two thresholds?",
        a: "Because a single line makes the gate flicker. A signal sitting right on one threshold crosses it constantly, so the gate would open and close many times a second. Opening above one level and closing below a lower one gives the signal somewhere to sit without triggering anything.",
      },
      {
        q: "What is the hold time for?",
        a: "It keeps the gate open for a set period after it opens, which bridges short gaps inside a word or between notes. Without it, the natural dip in the middle of a syllable would be treated as a gap and cut, which sounds like a stutter rather than like noise reduction.",
      },
      {
        q: "Why do I still hear a click at the edges?",
        a: "Because switching gain instantly steps the waveform away from whatever level it had reached. The edge fade ramps the gain over a few milliseconds on both sides instead, so the change is smooth. Raising it closer to ten or twenty milliseconds removes the click even on low-frequency material.",
      },
      {
        q: "Does gating damage the audio that passes through?",
        a: "No. Passages above the thresholds are multiplied by one and untouched, and the percentages reported refer only to the quiet portions. What can be damaged is intelligibility, if the threshold is set so high that quiet consonants fall below it as well.",
      },
      {
        q: "Why does my stereo file shift when the gate works?",
        a: "Because each channel is measured and gated on its own, so a moment where the left channel is above the threshold and the right is below will pass on one side only. Compressing to mono before gating, or using the expander, avoids the effect when it matters.",
      },
    ],
  },

  "silence-remover": {
    keywords: [
      "threshold",
      "minimum silence",
      "padding",
      "cuts",
    ],
    intro:
      "Silence Remover finds the quiet stretches in a recording and cuts them out, leaving the material that matters. Each cut keeps a little padding so the joins do not click.",
    content:
      "Choose a threshold and a minimum length, drop a file, and process. The footer reports how many seconds of silence were removed across how many cuts.\n\nThe controls:\n\n- Three threshold presets, labelled by the room they suit: a quiet one at fifty decibels below full scale, a medium one at forty, and a loud room at thirty.\n- A minimum silence length from two hundred to two thousand milliseconds, in steps of a hundred, defaulting to seven hundred.\n- A footer line giving the removed time, the number of cuts, and the padding kept at every edge.\n- Detection runs on the first channel, but every channel is cut at identical positions so a stereo file stays aligned.\n\nThe two settings are doing different jobs and both matter. The threshold decides what counts as silence at all: a low setting only treats the very quietest material as a gap, so it suits a recording made in a quiet room, while a higher setting is needed when the room had air conditioning or traffic, at the cost of also treating quiet musical passages as gaps. The minimum length decides how long a quiet stretch has to last before it is considered removable, and it is the control that protects the natural pauses in speech. The detection works on short frames and measures the level within each one, keeping runs of quiet frames that last at least the minimum; because it is a sustained measurement rather than a per-sample decision, a single quiet sample in the middle of a word never becomes a cut. What makes the result listenable is the padding. Fifty milliseconds are kept at each end of every cut, so the material either side does not butt together at a level discontinuity, and the transition is short enough to be inaudible as a fade but long enough to avoid a click. The arithmetic of how much comes out is reported rather than guessed, which matters when the purpose is to shorten a recording to a fixed length: run it, read the figure, and adjust the minimum length rather than the threshold if too much or too little has gone.\n\nWhat it does not do:\n\n- It cuts rather than compresses, so the timeline changes length.\n- Only the level is considered, so a quiet passage of wanted audio is treated as silence.\n- Detection uses one channel, so a gap in one channel only is not found.\n- The threshold presets are three fixed levels rather than a free value.\n- The removed audio is not recoverable from the result; only the original still holds it.\n- Output is sixteen bit WAV.\n\nUse it to shorten a lecture that is full of pauses, to tighten a spoken take before transcription, or to strip the dead air out of a field recording with long gaps between events. When the aim is to divide a recording at its silent gaps rather than remove them, the splitter does that, and when the quiet stretches should be pushed down rather than taken out, the gate and the expander reduce them while keeping the timeline intact.",
    howTo: [
      { step: "Drop an audio file onto the panel and note the duration." },
      { step: "Pick the threshold that matches the room the recording was made in." },
      { step: "Set the minimum silence length so that natural speech pauses are not cut." },
      { step: "Press process, read the removed time and cut count, and download the shortened WAV." },
    ],
    whenToUse:
      "Silence Remover is the tool for making a recording shorter by taking out its dead air, which is a different job from making it quieter. {{audio-splitter|Audio Splitter}} uses those same quiet gaps as cut points and keeps every section as its own file instead. When the pauses should stay in place but sit lower, {{audio-gate|Audio Gate}} and {{audio-expander|Audio Expander}} reduce them, and {{audio-trimmer|Audio Trimmer}} removes a single span you name yourself. To measure the gaps before cutting them, {{silence-statistics-calculator|Silence Statistics Calculator}} reports how much silence a file holds and where it sits.",
    faqs: [
      {
        q: "What is the padding for?",
        a: "It keeps fifty milliseconds of audio either side of each cut so the two surviving ends do not meet at a level mismatch, which would be heard as a click. It is short enough that you do not hear it as a fade, but it is the reason the joins pass unnoticed.",
      },
      {
        q: "Which threshold preset should I use?",
        a: "The one that matches the room: the quiet setting for a treated room or a close microphone, the medium one for an ordinary living room, and the loud setting where there was air conditioning or traffic. Choosing a setting quieter than the actual room leaves gaps behind; choosing a louder one starts eating quiet speech.",
      },
      {
        q: "Why does the minimum length matter so much?",
        a: "Because it is what distinguishes a pause from a breath. Set too short, the natural gaps inside and between words are removed and the speech sounds rushed and clipped. It is the control to adjust first when too much has been taken out.",
      },
      {
        q: "Does it make the recording quieter?",
        a: "No, it makes it shorter. The level of everything that survives is unchanged and the silence is deleted rather than reduced, which is why the reported removal is a duration and not a level change.",
      },
      {
        q: "Can I undo it if too much was removed?",
        a: "Not from the result, which no longer contains the removed audio. The original file is untouched and is the thing to process again with a lower threshold or a longer minimum. Running the tool twice on the same file is not needed, since the whole file is processed in one pass.",
      },
    ],
  },

  "ringtone-maker": {
    keywords: [
      "span",
      "cap",
      "fades",
      "loop",
    ],
    intro:
      "Ringtone Maker takes any span of a song and trims it to ringtone length with fades at both ends. The output is a WAV ready to be converted for a phone.",
    content:
      "Choose the start, the length and the fade, drop a file, and process. The report gives the span in seconds, confirms the length is within the cap, and states the fade time applied.\n\nThe controls:\n\n- A start position from zero to six hundred seconds, so the first ten minutes of a file are reachable.\n- A length from five to forty seconds, defaulting to thirty.\n- A fade from zero to five seconds, in quarter-second steps, defaulting to one and a half.\n- A report line with the chosen span, the cap, and the fade, plus a reminder that the WAV is what a phone conversion starts from.\n\nThree details do the work. The first is the cap at forty seconds, applied by taking the smaller of the requested length and the cap, and then the smaller of that and the audio remaining after the start point, so the span can never run past the end of the file. The second is the start position, which is clamped so that at least half a second of material is available after it, which prevents a slider at the very end of a long file from producing an empty result. The third is the fade. Both ends receive the same linear fade, and its length is limited to a quarter of the span, so a fade can never overrun the material it is shaping; a one and a half second fade on a thirty second pick is the usual starting point. Linear is the right curve here rather than exponential or equal power, because the output is going to be looped by the phone: a fade that reaches exact silence at each end gives the ring a clean seam if the phone repeats the file, and a fade that only approached zero would leave a small step at the wrap. That is also why the fades double as the loop point, which is worth knowing when choosing where to start. A span that begins on a beat and ends on one will loop convincingly; a span cut through the middle of a phrase will not, and the fade is the only part of that the tool can smooth.\n\nWhat it does not do:\n\n- No phone format conversion here, so an iPhone ringtone still needs an M4R step.\n- The span is chosen by numbers rather than by dragging on a waveform.\n- One span per run, so a second candidate means processing again.\n- No volume adjustment, so a quiet master stays quiet.\n- No tempo or beat detection to help find a good start point.\n- Output is sixteen bit WAV.\n\nUse it to turn a chorus into a ringtone, to cut an alert from a longer piece, or to make a short notification sound from a recording. When the aim is a seamless repeating bed rather than a phone alert, the loop maker finds the best cut point for you, and when the span needs precise ends or a different fade shape, the trimmer and the fade tool give the two operations separately with more control over each.",
    howTo: [
      { step: "Drop an audio file onto the panel and note its duration." },
      { step: "Set the start position to the moment the ringtone should begin." },
      { step: "Choose a length within the forty second cap and a fade that suits the material." },
      { step: "Press process, listen to the result, and download the WAV for phone conversion." },
    ],
    whenToUse:
      "Ringtone Maker is the tool when a short, loopable extract of a longer piece is the goal. {{audio-trimmer|Audio Trimmer}} and {{audio-cutter|Audio Cutter}} handle the same cutting without the length cap or the built-in fades. When a seamless repeating loop matters more than a phone alert, {{audio-loop-maker|Audio Loop Maker}} chooses the cut point for you, and {{m4a-converter|M4A Converter}} is the conversion step an iPhone ringtone needs after the WAV is made.",
    faqs: [
      {
        q: "Why is the length capped at forty seconds?",
        a: "Because that is already longer than any phone will play before giving up and going to voicemail, and it keeps the output small. The cap is applied before the file's own length, so a request for forty seconds on a twenty second file produces a twenty second ringtone rather than an error.",
      },
      {
        q: "Why does the fade length get reduced sometimes?",
        a: "Because it is limited to a quarter of the span, so a five second fade on a five second pick becomes one and a quarter seconds. That keeps the two fades from meeting in the middle, which would attenuate the whole ringtone rather than just its ends.",
      },
      {
        q: "Can I use the result as an iPhone ringtone directly?",
        a: "Not directly, because iPhones take the M4R format. The WAV is the correct starting point: convert it with the M4A converter and rename the result to the M4R extension, or copy the WAV into the ringtones folder on Android, which accepts it as it stands.",
      },
      {
        q: "What makes a good start point?",
        a: "A moment where the music is already moving, usually on a downbeat, with the end falling on another beat. Since the fades also serve as the loop point, a span that begins and ends on the same beat repeats convincingly, while one cut through the middle of a phrase will sound unfinished each time it wraps.",
      },
      {
        q: "Does the tool change the level?",
        a: "No. The span is copied and faded, and nothing else is altered, so a quiet master produces a quiet ringtone. If it needs to be louder, run the amplifier or the normalizer over the result, or over the source before cutting.",
      },
    ],
  },
};
