/**
 * AUTO-GENERATED — do not edit by hand.
 *
 * Source: src/domains/audio/seo/source/batch-01-accessibility.json
 * Regenerate: node scripts/audio-json-to-seo.mjs src/domains/audio/seo/source/batch-01-accessibility.json <this file> audioSeoBatch1
 * Validate first: node scripts/validate-audio-seo-json.mjs src/domains/audio/seo/source/batch-01-accessibility.json
 */
import type { ToolSeo } from "@/components/shared/seo-types";

export const audioSeoBatch1: Record<string, ToolSeo> = {
  "audio-speed-slow-down": {
    keywords: [
      "slow down audio",
      "tape mode",
      "preserve pitch",
      "speech comprehension",
    ],
    intro:
      "Audio Speed Slow Down replays a recording at a lower rate so difficult speech is easier to follow, stretching the file to at most twice its original length. The control range is deliberately one-sided: you can slow audio down to anywhere between 0.5x and 1.0x, but never speed it up.",
    content:
      "This tool reads a file into raw samples, rebuilds it at a slower playback rate, and hands back a WAV you can preview in place and then download. Upload anything the browser can decode — MP3, WAV, FLAC, M4A, OGG, AAC, AIFF, WMA or Opus — and the drop panel reports the decoded sample rate, channel count and duration before you change a single setting. The brief is narrow on purpose: slow down audio that is already recorded, by one fixed multiplier, and keep the result as faithful to the source as the algorithm allows. The speed control only ever moves downward, from 1.0x at the top to a 0.5x floor, and the label beside the slider converts the multiplier into the more intuitive slower percentage. The default sits at 0.75x, which is roughly where speech is noticeably slower but still natural.\n\nThe tool exposes a small, deliberately limited set of controls:\n\n- Speed multiplier from 0.5x to 1.0x in 0.05x steps.\n- Preset buttons for 0.5x, 0.6x, 0.7x, 0.8x and 0.9x.\n- Tape mode, which resamples linearly and lets pitch fall with the speed.\n- Preserve pitch mode, which time-stretches the audio and holds the original pitch.\n- WAV output at the source sample rate, named after the input with a slowed-0.75x style suffix.\n- Preview original and Preview edited players for an immediate A/B comparison.\n\nTape mode calls a linear resampler: each output sample is interpolated between two neighbouring input samples read at a position that advances by the speed factor, so the waveform is replayed more slowly and its pitch drops in step, exactly as if you had slowed a tape reel by hand. Preserve pitch mode runs an overlap-add time-stretch instead. The signal is sliced into 2048-sample grains windowed with a Hann curve and taken every 512 samples; each grain is written back at a synthesis hop scaled by the stretch ratio, and a correlation search slides every grain up to a few hundred samples either way so its onset lines up with what has already been written, before the overlapping windows are normalised. That holds the pitch steady while the timeline expands, at the cost of a faint smearing around sharp transients.\n\nWhat it will not do matters just as much:\n\n- It cannot speed audio up; 1.00x returns the file essentially unchanged and nothing goes above it.\n- Output is always 16-bit PCM WAV, so a slowed MP3 becomes a lossless file many times the size of the original.\n- The whole file must decode into memory at once, so there is no streaming path for very long recordings.\n- Tape mode lowers pitch, so voices and instruments sound progressively deeper as the slowdown increases.\n- Preserve pitch mode can add a slight warbling or phasing artefact around percussive attacks.\n- You cannot slow a single section; the multiplier applies to the entire file from start to finish.\n\nReach for tape mode when the material is spoken word and a natural drop in pitch is acceptable, because it is the simpler and cleaner of the two algorithms and the one tuned for speech comprehension. Choose preserve pitch when the recording is musical, when you are learning a part by ear, or when a lower key would make the result hard to follow. For study and transcription work 0.75x is the usual starting point, with 0.5x reserved for the hardest passages where clarity beats naturalness.",
    howTo: [
      { step: "Drop an audio file onto the upload panel, or click it to browse; the panel then shows the decoded sample rate, channel count and duration." },
      { step: "Set the speed with the slider between 0.5x and 1.0x, or tap a preset; the label shows both the multiplier and the matching slower percentage." },
      { step: "Pick a mode — Tape for the clearest speech with a natural pitch drop, or Preserve pitch for musical material — then click Process." },
      { step: "Compare Preview original against Preview edited, then use Download to save the WAV, named after your file with a slowed-0.75x suffix." },
    ],
    whenToUse:
      "Audio Speed Slow Down is the comprehension-first member of the speed family: it only ever slows a file down and uses the simplest, cleanest algorithms to do it. When you need the full range, speeding up as well as slowing with independent pitch control and finer ratios, use {{audio-speed-changer|Audio Speed Changer}} instead, which handles everything from quick podcast skimming to slowed-down study playback in one place. If your goal is the tempo of a musical passage rather than the playback rate of a whole file, {{tempo-changer|Tempo Changer}} and {{time-stretcher|Time Stretcher}} change duration while holding pitch fixed. And to work out the exact ratio you want before you touch any audio, {{playback-speed-calculator|Playback Speed Calculator}} converts a target duration into the multiplier you need.",
    faqs: [
      {
        q: "Can Audio Speed Slow Down ever speed a file up?",
        a: "No. The slider runs from 0.5x to 1.0x and nothing goes above 1.00x, which returns the audio essentially untouched. Speeding up is a separate job handled by the Audio Speed Changer, and the slowdown floor is capped at half speed because both algorithms start to sound obviously processed beyond that point.",
      },
      {
        q: "What is the difference between Tape and Preserve pitch?",
        a: "Tape mode resamples the waveform, so lowering the speed lowers the pitch by the same factor; a voice gets deeper as the file gets longer. Preserve pitch mode time-stretches the audio so the duration grows while the pitch stays where it was, which suits music and pitch-matching practice but can add a faint warbling quality on dense material.",
      },
      {
        q: "Why is the output always a WAV file?",
        a: "The browser decoder hands the tool raw PCM samples, and re-encoding to a compressed format would mean bundling an encoder for every possible input type. Writing uncompressed 16-bit WAV at the source sample rate keeps the slowed copy faithful to exactly what was decoded. Convert the WAV afterwards if the size matters.",
      },
      {
        q: "How much longer will my file be at each setting?",
        a: "Divide the original duration by the multiplier. A three-minute clip becomes four minutes at 0.75x and six minutes at 0.5x. The output duration readout next to the preview buttons confirms the exact new length before you download, so you can check the result at a glance.",
      },
      {
        q: "Will slowing a recording down make speech easier to understand?",
        a: "As a rule yes, up to a point. Slowing to about 0.75x gives listeners more time to process each word without the sound turning unnatural. Past that, tape mode drops the pitch far enough that some consonants blur, and preserve pitch mode starts to smear transients, so 0.5x is best saved for short passages you are studying closely.",
      },
    ],
  },

  "hearing-aid-frequency-reference": {
    keywords: [
      "hearing aid",
      "fitting bands",
      "vowel formants",
      "sensation level",
    ],
    intro:
      "Hearing Aid Frequency Reference maps the eight frequency bands that a hearing aid fitting conversation usually revolves around, showing which speech sounds live in each band and how far a tone has to rise above a threshold to be heard. It is a visual and numeric reference rather than an audio processor.",
    content:
      "Nothing is uploaded here and nothing is played back, so this is a reference chart and calculator for hearing aid conversations rather than an audio tool. The page draws a logarithmic frequency axis from 125 Hz to 10 kHz and divides it into eight fitting bands centred on 250, 500, 1000, 2000, 3000, 4000, 6000 and 8000 Hz. Each column is shaded by how critical that band typically is for understanding speech, and the band edges sit at the geometric mean between neighbouring centres, so the chart above and the lookup below can never disagree about where one band ends and the next begins.\n\nOn top of the static chart the page adds three interactive controls:\n\n- Eight fitting bands centred on 250, 500, 1000, 2000, 3000, 4000, 6000 and 8000 Hz.\n- Importance shading from 1, for air and sparkle, up to 5 for the fricative and s-region bands.\n- Eight average adult vowel formants, each with F1 for openness, F2 for frontness and an example word.\n- A frequency explorer running from 125 Hz to 10,000 Hz in 5 Hz steps.\n- A tone level control from 20 to 90 dB SPL and a hearing threshold control from 0 to 90 dB HL.\n- A readout that reports how far the tone sits above the threshold you entered.\n\nThe lookups are plain arithmetic. A band function compares the chosen frequency against the geometric-mean boundaries and returns that band's speech content and its fitting note, so moving the frequency slider rewrites the explanation underneath it in real time. The sensation level is calculated by subtracting the threshold in dB HL from the presentation level in dB SPL and then clamping the result at zero, which is why the number never goes negative; at or below threshold it simply reads 0 dB and reports that the tone is likely inaudible. The vowel markers are positioned on the same logarithmic axis using the second formant as the horizontal coordinate, with the first formant given as the openness figure in the caption. The values are average adult data published by Peterson and Barney in 1952, not measurements of any individual speaker.\n\nIt is worth being explicit about the edges of the tool:\n\n- It is a teaching reference, not a fitting: it cannot read an audiogram, prescribe gain or produce a hearing aid prescription.\n- Sensation level floors at 0 dB, so it cannot show how far below threshold a sound actually falls.\n- The vowel formants are average adult values and ignore age, accent and vocal tract size.\n- The axis stops at 125 Hz and 10 kHz, so sub-bass and the highest air frequencies are off the chart.\n- It produces no sound at all; the frequency map is purely visual and numeric.\n- Band importance is a general speech-clarity guide, not a clinical target for any one listener.\n\nUse the chart as a translation layer. When a fitting screen shows gain at 3 kHz, the reference tells you that band carries the s, sh and f sounds that mark plurals and verb endings, which is often the difference between hearing a voice and understanding it. When someone describes a problem as muffled but still audible, the shading points at the 2 to 4 kHz region where consonants separate from background noise. Read it alongside a real audiogram and a real audiologist rather than in place of them.",
    howTo: [
      { step: "Read the eight fitting bands chart: each column is labelled with its centre frequency, and the shading plus importance dots show how critical that band usually is for speech." },
      { step: "Find where a vowel sits using the markers under the chart, each labelled with its F1 and F2 values and an example word such as beet or boot." },
      { step: "Drag the frequency slider across the 125 Hz to 10,000 Hz range to look up any single value; the panel names the band it falls in and prints that band's speech content and fitting note." },
      { step: "Set the tone level and your threshold to read the sensation level in dB, then move either slider to see how much headroom the tone has above threshold." },
    ],
    whenToUse:
      "Hearing Aid Frequency Reference answers the question of what a frequency means for speech, which makes it a natural companion to the tools that measure real audio. Point {{frequency-analyzer|Frequency Analyzer}} at a recording to see where its energy actually sits, then use this chart to interpret those peaks in terms of speech sounds. To measure a single tone rather than a spectrum, {{frequency-counter|Frequency Counter}} reports the fundamental frequency of what it hears, and {{tone-generator|Tone Generator}} lets you produce a clean tone at any band so you can hear the difference between 1 kHz and 4 kHz directly. For the musical equivalent of the same lookup, {{note-frequency-calculator|Note Frequency Calculator}} converts between note names and hertz.",
    faqs: [
      {
        q: "Is this the same thing as a hearing test?",
        a: "No. A hearing test measures your actual thresholds with calibrated equipment, and an audiogram records them frequency by frequency. This page is a teaching reference: it explains what each band carries and does a small sensation-level calculation from numbers you type in. It never measures your hearing and it cannot diagnose anything.",
      },
      {
        q: "What does the sensation level number actually mean?",
        a: "It is the presentation level in dB SPL minus your threshold in dB HL, clamped at zero. If a 60 dB SPL tone meets a 45 dB threshold, the sensation level is 15 dB, meaning the tone sits 15 decibels above the point where you start to hear it. Because it floors at zero, a value of 0 dB means the tone is at or below threshold, not that it is exactly audible.",
      },
      {
        q: "Which bands matter most for understanding speech?",
        a: "The 2 kHz to 4 kHz region carries the highest importance in the chart, and for good reason. That is where the s, sh, f, t and ch sounds live, the consonants that distinguish plurals from singulars and past from present. The 1 kHz band anchors overall loudness, while the 8 kHz band adds air and naturalness but very little meaning.",
      },
      {
        q: "Where do the vowel formant values come from?",
        a: "They are average adult formant measurements published by Peterson and Barney in 1952, one of the classic studies of American English vowels. F1 describes how open the mouth is and F2 describes how far forward the tongue sits, which is why the markers spread from beet at the high-F2 end to boot at the low-F2 end. Individual speakers vary around these averages.",
      },
      {
        q: "Why is the frequency axis spaced so unevenly?",
        a: "The axis is logarithmic, which matches how hearing works. Equal distances on the chart represent equal ratios in hertz rather than equal numbers of hertz, so the gap from 125 Hz to 250 Hz is one octave and so is the gap from 5 kHz to 10 kHz. That mirrors the octave spacing audiologists use on a real audiogram.",
      },
    ],
  },
};
