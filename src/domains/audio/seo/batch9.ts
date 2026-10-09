/**
 * AUTO-GENERATED — do not edit by hand.
 *
 * Source: src/domains/audio/seo/source/batch-09-analysis-metering.json
 * Regenerate: node scripts/audio-json-to-seo.mjs src/domains/audio/seo/source/batch-09-analysis-metering.json <this file> audioSeoBatch9
 * Validate first: node scripts/validate-audio-seo-json.mjs src/domains/audio/seo/source/batch-09-analysis-metering.json
 */
import type { ToolSeo } from "@/components/shared/seo-types";

export const audioSeoBatch9: Record<string, ToolSeo> = {
  "waveform-visualizer": {
    keywords: [
      "peak envelope",
      "800 buckets",
      "stereo",
      "duration",
    ],
    intro:
      "Waveform Visualizer draws a whole recording as a min/max peak envelope, so every transient from first sample to last is visible at once. Drop a file and the full shape of it appears on a canvas within a moment.",
    content:
      "The view is the classic amplitude-over-time picture: loud passages fill the height of the canvas, quiet ones thin toward the centre line, and the overall arc of a track is legible without pressing play.\n\nHow the picture is built:\n\n- The whole file is divided into 800 buckets regardless of how long it is, so a five second clip and a five minute track both span the same canvas width.\n- Each bucket keeps the smallest and the largest sample inside it, and the bar is drawn between those two values, which preserves single-sample spikes that averaging would erase.\n- Stereo channels are overlaid in two shades, left first and right translucent on top, so channel imbalance shows up as a colour difference rather than a number.\n- A centre line marks zero amplitude, and a readout underneath reports the bucket count, the channel count and the duration.\n\nExtraction is a single linear pass over the decoded channel data, keeping a running minimum and maximum per bucket and clamping both to the legal sample range before they are mapped to pixels. Because nothing is smoothed or decimated, a click buried in a quiet passage still reaches full height, which is precisely what makes an envelope view more useful than a scrolling meter for spotting a problem in the middle of a long file. Decoding uses the browser's own decoder, so nothing is uploaded and no encoder has to be fetched. Canvas backing size follows the device pixel ratio, so the drawing stays sharp on high density screens rather than being scaled up from a smaller bitmap. The output is a genuine peak envelope rather than a smoothed sketch, which means a single sample that reaches full scale is drawn at full height wherever it sits in the file. Because the drawing is a direct reading of the decoded samples, the picture cannot misrepresent the levels it was given, and clipping in the source shows as a bar pinned flat against the top or bottom edge of the canvas rather than as a rounded peak, which makes a squared-off section easy to spot before anyone listens to it.\n\nWhat the view deliberately leaves out:\n\n- Amplitude is drawn linearly, so quiet sections look flatter than they sound and a compressed master looks like a solid block.\n- There is no zoom, scrub or playhead, so you cannot inspect a single millisecond closely.\n- No time or level axes are labelled on the canvas.\n- Stereo channels are overlaid rather than stacked, so differences show as colour rather than as separate rows.\n- Nothing can be exported; the canvas is a screen-only measurement with no download path.\n\nTreat it as the first look at a file: it answers whether the recording is continuous, whether it clips, whether one channel is consistently weaker, and whether the quiet intro really is quiet. When a specific frequency, level or loudness number is what you need, reach for the meters that measure rather than draw, and when the envelope shows a section worth cutting, the trimming tools work from the same decoded audio.",
    howTo: [
      { step: "Drop an audio file onto the panel, or click it to browse; the file decodes and draws straight away." },
      { step: "Read the envelope left to right, comparing how much height each section fills against the centre line." },
      { step: "Compare the two channel shades to see whether one side sits consistently louder than the other." },
      { step: "Check the readout under the canvas for bucket count, channel count and total duration." },
    ],
    whenToUse:
      "Waveform Visualizer is the fastest way to see the overall shape of a file, so start here when you do not yet know what is wrong with a recording. {{spectrogram-viewer|Spectrogram Viewer}} answers the frequency version of the same question across time, and {{frequency-analyzer|Frequency Analyzer}} follows a dominant pitch rather than an amplitude. For numbers rather than a picture, {{rms-meter|RMS Meter}} gives level statistics, and {{audio-trimmer|Audio Trimmer}} acts on the section the envelope reveals.",
    faqs: [
      {
        q: "Why does a long file not take longer to draw?",
        a: "Because the work is a single linear pass over the samples: each bucket keeps a running minimum and maximum, so the cost grows with the length of the audio but never with the size of the canvas. Nothing is filtered, transformed or smoothed along the way.",
      },
      {
        q: "Why do quiet parts look almost flat?",
        a: "Amplitude is drawn linearly rather than on a decibel scale. A passage forty decibels down is a hundredth of the height, which is faithful but visually unforgiving. That is why a quiet room recording can look nearly empty while it still contains audible detail.",
      },
      {
        q: "Can I zoom in on one moment?",
        a: "No. The view always shows the entire file at 800 buckets, which is a deliberate trade: you can see structure across a long recording at a glance, but you cannot magnify a single transient. To inspect a specific section, cut it out first and view the shorter file.",
      },
      {
        q: "What do the two colours mean in a stereo file?",
        a: "Each channel is drawn over the others in its own shade, with the second channel translucent so both remain visible. Where the colours align exactly the channels match; where one colour dominates, that side is louder in that section.",
      },
      {
        q: "Is my audio uploaded to draw this?",
        a: "No. Decoding happens inside the browser using its own audio decoder and the peaks are computed in the page, so the file never leaves the device and no encoder download of any size is needed for a waveform.",
      },
    ],
  },

  "spectrum-analyzer": {
    keywords: [
      "magnitude spectrum",
      "spectral centroid",
      "Hann window",
      "averaged frames",
    ],
    intro:
      "Spectrum Analyzer averages the whole file into one magnitude spectrum, so the frequency balance of a recording becomes a single readable curve. Peak frequency and spectral centroid are reported alongside it as numbers.",
    content:
      "The canvas plots level in decibels against frequency, with zero decibels at the top and minus one hundred at the bottom, and grey gridlines every two kilohertz up to Nyquist so you can read a feature's place on the axis.\n\nWhat the tool computes and shows:\n\n- The averaged frames count, the bin width in hertz, and the fixed display range of 0 dB at the top down to −100 dB at the bottom.\n- Peak frequency, the single bin with the most energy in the average, which is often the fundamental of a sustained tone.\n- Spectral centroid, the amplitude-weighted mean of the spectrum, which behaves like a brightness readout and moves up as high-frequency content increases.\n- Duration, taken from the decoded audio rather than from any metadata.\n\nAnalysis runs a windowed discrete Fourier transform at a size of 8192 samples per frame with a Hann window, and applies the amplitude correction that a Hann window requires so the plotted level stays honest instead of sinking by the window's gain factor. Frames are averaged across the file rather than shown one at a time, which trades time resolution for stability: broad tonal balance becomes clear and momentary events average out. Because 8192 points are analysed, low frequencies are resolved finely — useful for spotting a rumble shelf or a room resonance around fifty hertz — while the average smooths the ragged detail you would see in a live analyser. The spectrum is computed on the decoded channels in the page, so no upload and no encoder fetch is involved. The result is a magnitude spectrum averaged over the file and expressed in decibels against frequency, which is why the curve reads as a tonal balance rather than as a moment in time. Because the transform size is fixed, the reported bin width is fixed too, so every feature on the plot can be located to within one bin of the axis. Reading a magnitude spectrum well means remembering that one axis is logarithmic and the other linear, so equal distances across the plot do not correspond to equal musical intervals, and a bass note occupies far less of the width than its perceived pitch range would suggest.\n\nWhere the average misleads:\n\n- A short event such as a click or a single cymbal hit is diluted by the averaging and may not appear at all.\n- The curve is drawn per channel but only the first channel's curve is plotted, so a stereo file with very different sides shows one of them.\n- Peak frequency reports the loudest bin in the average, which for broadband music is a weak indicator compared with a tonal signal.\n- Bin width falls out of the analysis size, so the reported frequency resolution is fixed rather than adjustable.\n- The display clamps at −100 dB, so an extremely quiet floor is flattened against the bottom of the plot.\n\nUse it to characterise material rather than to diagnose a moment: it tells you where the energy sits, whether the top end is rolled off, and whether a hum or rumble is a real part of the average. For a feature that changes over time, the spectrogram shows the same information with time on the horizontal axis.",
    howTo: [
      { step: "Drop an audio file onto the panel; decoding and the transform run automatically." },
      { step: "Read the curve against the two kilohertz gridlines to see where the energy concentrates." },
      { step: "Take the peak frequency and spectral centroid cards as the tonal and brightness summaries." },
      { step: "Check the frames and bin width caption to understand how much averaging sits behind the curve." },
    ],
    whenToUse:
      "Spectrum Analyzer is the tool for the frequency balance of a whole file, answering whether the top end rolls off and where the weight sits. {{spectrogram-viewer|Spectrogram Viewer}} shows the same energy but across time, and {{frequency-analyzer|Frequency Analyzer}} tracks a changing dominant pitch instead of averaging it away. When the question is level rather than frequency, {{rms-meter|RMS Meter}} and {{loudness-meter-lufs|Loudness Meter (LUFS)}} give the numbers that matter.",
    faqs: [
      {
        q: "Why is the curve so smooth compared with a live analyser?",
        a: "Because frames across the whole file are averaged into one spectrum. A live analyser updates many times a second and keeps its ragged detail; this one makes tonal balance stable and readable at the cost of hiding momentary events.",
      },
      {
        q: "What does the spectral centroid tell me?",
        a: "It is the amplitude-weighted mean frequency, so it behaves like a brightness reading. Move it up and the material sounds more brilliant or noisier; move it down and the weight has shifted toward the low end. It is a summary, not a target.",
      },
      {
        q: "Why is the peak frequency not the note I hear?",
        a: "Because it is the loudest single bin in the average. In broadband music that bin can fall anywhere, and even in tonal material a strong harmonic may be louder than the fundamental. Trust it most on steady, clearly pitched signals.",
      },
      {
        q: "What is the Hann window for?",
        a: "The transform assumes each block is periodic, so cutting a block out of continuous audio creates edge discontinuities that smear energy across neighbouring bins. A Hann window tapers the block ends to suppress that smear, and its amplitude correction keeps the displayed level accurate.",
      },
      {
        q: "Can I change the frequency resolution?",
        a: "No. The analysis size is fixed at 8192 points, which sets both the reported bin width and the low-frequency detail. That choice favours reading the low end of a recording over fast time resolution, which is why the spectrogram exists for time-varying detail.",
      },
    ],
  },

  "spectrogram-viewer": {
    keywords: [
      "spectrogram",
      "time-frequency",
      "dBFS",
      "hover",
    ],
    intro:
      "Spectrogram Viewer turns a file into a time-frequency heatmap, so you can see not only where the energy sits but when it arrives. Hovering any point reads out the exact time, frequency and level underneath the pointer.",
    content:
      "Time runs left to right and frequency runs bottom to top, with brightness standing in for level on a dark background that makes quiet detail legible against the loud events.\n\nThe view and what it reports:\n\n- A heatmap of roughly thirty seconds of audio, taken from the start of the file, drawn as a bitmap rather than as a live scrolling trace.\n- A fire-style colour ramp from black through purple and red to yellow and white, mapped across a range of −90 to 0 dBFS.\n- A hover readout giving the time in seconds, the frequency in hertz and the level in dBFS at the pointer's position.\n- A caption recording the channel count, sample rate, analysed duration, frame count and the top bin frequency.\n\nThe underlying analysis is a short-time Fourier transform with overlapping frames, and the frames are converted to decibels before being mapped to colour, which is why a quiet room tone still shows as faint structure instead of vanishing to black. Mapping to decibels rather than to linear amplitude matters here: a linear map would show only the loudest moments and leave everything else indistinguishable. Only the first channel is analysed, and the run is capped at about thirty seconds because the bitmap hands one pixel per column to the frame array; longer files would either blur or need scrolling that the reference view does not offer. Since each frame records level per bin, a sustained tone appears as a horizontal line, a sweep as a diagonal, and broadband noise such as hiss as a uniform wash — the three patterns worth learning first. Naming it precisely: this is a spectrogram, a picture whose axes are time and frequency, and it is the standard view for anything that changes as the recording plays. The complement is the time-frequency trade-off itself, because a short analysis window resolves rapid events while a long one resolves fine frequency detail, and no single setting serves both purposes at once. That is why a spectrogram is the right view for locating a problem in time while the averaged spectrum remains the right view for judging balance.\n\nWhat the view does not attempt:\n\n- Only the first thirty seconds are analysed, so a problem later in a file will not appear.\n- Frequency is mapped linearly, not logarithmically, so the low octaves are compressed into the bottom of the image.\n- Only one channel is used, so a stereo difference is invisible here.\n- There is no axis labelling beyond the hover readout and the caption.\n- The bitmap is fixed at 900 by 320, so fine detail below one pixel is not represented.\n- No image export or saved analysis is offered.\n\nUse it when you need to see structure in time: a mains hum as a bright band at fifty or sixty hertz, a hiss that runs the whole length, a click as a single vertical stripe, or a whistle that drifts. Once the pattern tells you what the problem is, the cleanup tools in the same category act on it, and the average spectrum is the right view for judging tonal balance without the time axis.",
    howTo: [
      { step: "Choose an audio file with the file picker; the first channel of the first thirty seconds is analysed." },
      { step: "Look for the three signature patterns: horizontal lines for steady tones, diagonals for sweeps, and even washes for noise." },
      { step: "Hover any part of the image to read the exact time, frequency and level at that point." },
      { step: "Check the caption for frame count and top frequency to understand the resolution behind the picture." },
    ],
    whenToUse:
      "Spectrogram Viewer is the right tool when a problem or a feature has a distinctive time-frequency signature, such as hum, hiss, chirps or clicks. {{spectrum-analyzer|Spectrum Analyzer}} shows the same energy averaged over the file, which is better for tonal balance, and {{frequency-analyzer|Frequency Analyzer}} follows a single dominant pitch through time. To clean up what the picture reveals, {{noise-reducer|Noise Reducer}} and the notch-based hum tools address the patterns this view makes obvious.",
    faqs: [
      {
        q: "Why only the first thirty seconds?",
        a: "The image gives one column of pixels per analysed frame, so a longer file would either be blurred down or need a scrolling view. Capping the analysis at about thirty seconds keeps every frame represented at full resolution, and long material can be cut down first if a later section matters.",
      },
      {
        q: "What do the colours mean?",
        a: "Brighter is louder. The ramp runs from black through purple and red to yellow and white across a range of −90 to 0 dBFS, so a solid white feature is at or near full scale and a faint purple one is deep in the noise floor.",
      },
      {
        q: "How do I read a hum or a hiss on this view?",
        a: "Hum appears as one or more bright horizontal bands at a fixed low frequency, usually with harmonics above it. Hiss appears as a fairly even wash across the upper part of the image for the file's whole length, which is what distinguishes it from musical content that comes and goes.",
      },
      {
        q: "Why is the frequency axis not logarithmic?",
        a: "A linear axis is simpler to read for reference work and keeps each hertz at a constant distance, but it squeezes the low octaves together and stretches the top. That is why a bass line looks compressed near the bottom while cymbal energy occupies a wide bright region above it.",
      },
      {
        q: "Does the file get uploaded to build the image?",
        a: "No. The file is decoded in the browser and the transform runs in the page, so nothing is transmitted. The cost is that the analysis holds the frame array in memory, which is another reason the duration is capped rather than unlimited.",
      },
    ],
  },

  "frequency-analyzer": {
    keywords: [
      "dominant frequency",
      "stable-pitch segments",
      "mean frequency",
      "segment table",
    ],
    intro:
      "Frequency Analyzer follows the dominant frequency through a recording and groups it into stable-pitch segments, so a melody, a spoken line or a drifting tone becomes a list of measurable runs. It reports the mean frequency and amplitude of each one.",
    content:
      "The canvas draws each segment as a horizontal bar at its mean frequency, and a table underneath lists the same runs with their start time, end time, mean frequency and mean amplitude.\n\nWhat each run represents:\n\n- The analysed channel is the first one, and the timeline is computed in overlapping 4096-sample frames with a hop of 2048 samples.\n- Frames are only considered voiced above an amplitude threshold of 400 on the sample scale, which keeps silence from being reported as a very low note.\n- Segment merging tolerates a sixty cent deviation between neighbouring frames, so a run breaks when the pitch genuinely moves rather than on every small fluctuation.\n- Segments shorter than fifty milliseconds are discarded, and the table shows the first twelve runs.\n\nBetween the frame level and the table there are two stages. The first produces a dominant frequency per frame together with its amplitude, and the second walks that sequence and starts a new segment whenever the frequency jumps beyond the tolerance or the amplitude falls below the voiced threshold. The sixty cent allowance is a musical choice: it is slightly wider than the range a steady note wanders through as vibrato and intonation move, yet far narrower than a semitone, so a real change of note always starts a new segment. The amplitude column is useful in its own right, because a run that is high in frequency but low in amplitude is usually a harmonic slipping past the fundamental, while a strong low run suggests the fundamental has been tracked properly. Presenting the findings as a segment table rather than a single number is what makes the tool usable on real material, because it keeps the stable-pitch segments separate and shows how long each one held. A melody read this way becomes a series of measurable runs, and an unsteady delivery becomes a long list of short entries rather than one average that describes nothing in particular, which is exactly the kind of problem a single averaged pitch would hide.\n\nWhat the analysis cannot promise:\n\n- Only the first channel is analysed, so a stereo file is summarised by one side.\n- Silences and unpitched material produce no segments rather than a measured noise floor.\n- The canvas stops showing what is beyond the loudest voiced segment scaled up by ten per cent, so unusually high runs are clipped at the top of the plot.\n- Only the first twelve segments are listed, however many were found.\n- The reported frequency is a mean over each run, so a slow glide is summarised as one number instead of a shape.\n- There is no export of the segment list.\n\nUse it for material that is meant to be pitched: a tuning check on a sustained note, a spoken take where you want to see how wide the delivery's range actually is, a recording of an instrument to check whether the low notes are coming through, or a drift test on a synthesiser. For a single number instead of a timeline, the frequency counter reports one fundamental with a confidence figure, and the spectrum view is better for judging an instrument's harmonics.",
    howTo: [
      { step: "Drop an audio file onto the panel and wait for the segment analysis to finish." },
      { step: "Scan the canvas for runs, reading height as mean frequency and width as how long the pitch held." },
      { step: "Read the table for exact start and end times, mean frequency and mean amplitude of each run." },
      { step: "Compare the reported range against what you expected from the material to spot missing fundamentals or drift." },
    ],
    whenToUse:
      "Frequency Analyzer is built for pitched material where the dominant frequency moves over time, which makes it the natural check on tuning, range and drift. {{frequency-counter|Frequency Counter}} condenses the same kind of measurement into one fundamental and a confidence percentage, and {{spectrum-analyzer|Spectrum Analyzer}} shows harmonic balance without a time axis. For unpitched problems such as hum or noise, {{spectrogram-viewer|Spectrogram Viewer}} is the clearer view.",
    faqs: [
      {
        q: "What counts as a stable-pitch segment?",
        a: "A run of consecutive frames where the dominant frequency stays within sixty cents of its neighbours and the amplitude stays above the voiced threshold. Anything shorter than fifty milliseconds is dropped, so brief glitches do not become segments of their own.",
      },
      {
        q: "Why does a long note sometimes show as several segments?",
        a: "Because a change of more than sixty cents starts a new run. Strong vibrato, a slide, or a moment where a harmonic briefly overtakes the fundamental can all split a musical note into more than one row, which is worth knowing before reading the count as a number of notes.",
      },
      {
        q: "What is the amplitude column for?",
        a: "It carries the mean level of the run on the sample scale, which helps judge whether a tracked frequency is the fundamental or a harmonic. A high frequency at low amplitude usually means the analyser locked onto an overtone rather than the note itself.",
      },
      {
        q: "Why were no segments found on my recording?",
        a: "The material is either too quiet to pass the voiced threshold or too noisy for a consistent dominant frequency to emerge. Silence produces nothing by design, and heavily percussive or broadband content rarely holds a pitch long enough to form a run.",
      },
      {
        q: "Can I export the segment list?",
        a: "No, the table is a screen-only readout showing the first twelve runs. If the values need to be kept, read them off the table, or cut the interesting section out first so that its runs appear at the top of the list.",
      },
    ],
  },

  "phase-meter": {
    keywords: [
      "phase correlation",
      "mono-compatibility",
      "quarter trend",
      "L/R balance",
    ],
    intro:
      "Phase Meter reports how alike the two channels of a stereo file really are, giving a correlation figure between minus one and plus one. It also shows how that figure moves across the file and which side is louder.",
    content:
      "A single correlation value summarises the relationship between left and right, and its meaning is direct: near plus one the channels are effectively the same, near minus one they are mirror images, and around zero they carry largely independent material.\n\nWhat the panel reports:\n\n- The overall correlation, printed to three decimals and labelled in words as effectively mono, correlated, wide or decorrelated, out of phase in places, or polarity inverted.\n- A horizontal bar centred on zero, with the filled position showing which side of the midpoint the value falls on.\n- A trend row splitting the file into quarters, so a problem confined to one section shows up even when the whole-file figure looks acceptable.\n- An L/R balance figure in decibels, reported as left relative to right, with a dash when either side is silent.\n\nCorrelation is computed as a normalised inner product of the two channels across the file: the sum of their products divided by the product of their energies. That normalisation is what makes the result comparable between a loud master and a quiet demo, and it is also why the calculation needs a guard against silence, where the denominator would otherwise be zero. The trend quarters come from running the same computation over four equal spans, which matters in practice because a whole-file figure can average a good chorus and a broken verse into a number that looks fine. The balance reading is a separate comparison of the two channels' energy, so it answers a different question: not whether the sides agree, but whether one is consistently louder. Stated plainly, the panel is a phase correlation measurement with a mono-compatibility verdict attached to it. The overall figure describes the file as a whole, while the quarter trend shows how that correlation shifts across four spans, so a reading that looks acceptable on average can still be shown to hide a passage that folds up when summed. Nothing in the panel changes the audio, so it is a diagnostic to run before delivery rather than a repair to run after a complaint arrives.\n\nWhat the meter cannot tell you:\n\n- A mono file is rejected outright, since there is no second channel to compare with.\n- The whole-file figure can hide a section that is seriously out of phase if the rest is well correlated.\n- No frequency dependence is shown, so a problem confined to the bass or the top end reads as one averaged number.\n- Nothing is corrected here; the measurement only reports what is present.\n- The trend is limited to four quarters, so short trouble spots inside a long section may not appear.\n- Silence in one channel leaves the balance figure blank rather than reporting a value.\n\nUse it before delivering anything that may be summed to mono: a phone speaker, a club system with a mono sub, a television broadcast, or a podcast played on a single speaker. A value near plus one collapses safely, a value near minus one partially cancels, and the usual cause of the latter is a polarity flip on one channel or a mid-side processing mistake.",
    howTo: [
      { step: "Drop a stereo audio file onto the panel; mono files are reported as unsupported rather than analysed." },
      { step: "Read the correlation value against its descriptive label to judge mono compatibility." },
      { step: "Look along the trend row to check whether all four quarters behave the same way." },
      { step: "Compare the L/R balance figure to see whether one channel carries more energy than the other." },
    ],
    whenToUse:
      "Phase Meter is the diagnostic for mono compatibility, so it belongs in the chain before any delivery that might be summed to one channel. {{correlation-meter|Correlation Meter}} presents the same measurement as a broadcast-style needle meter, and {{goniometer-vectorscope|Goniometer / Vectorscope}} shows the stereo field as a shape rather than a number. If the reading points at a specific fault, {{channel-inverter|Channel Inverter}} can test a polarity flip and {{mid-side-processor|Mid/Side Processor}} can rebuild the sides.",
    faqs: [
      {
        q: "What is a good correlation value?",
        a: "For material that must survive mono, keep it above roughly zero; broadcast practice is loosely zero and up, and close to plus one is safest. Music can sit comfortably between plus zero point three and plus zero point eight, and very wide ambient material may hover near zero without being broken.",
      },
      {
        q: "Why does a value near minus one matter?",
        a: "Because the two channels are close to mirror images, so summing them to mono cancels much of the content instead of reinforcing it. The usual causes are a polarity inversion on one channel, a miswired cable, or over-aggressive side processing, and the fix is to correct the source rather than to hide the number.",
      },
      {
        q: "Why is the trend split into quarters?",
        a: "A single figure for a whole song can average a well-behaved chorus and a broken section into something that looks acceptable. Four spans are enough to reveal that a problem is local rather than general, and the quarters follow the file's own length rather than clock time.",
      },
      {
        q: "What does the balance reading measure?",
        a: "It compares the energy in the left channel with the energy in the right and reports the result in decibels relative to the right side. A positive figure means the left is louder, a negative one the other way, and a dash appears when a channel is silent and no ratio exists.",
      },
      {
        q: "Can it fix phase problems?",
        a: "No, it only measures them. Once you know a section is out of phase, the correction belongs with the channel tools, where a polarity inversion can be tested or a mid-side rebuild can be attempted, and the meter can then be run again to confirm the change.",
      },
    ],
  },

  "correlation-meter": {
    keywords: [
      "correlation meter",
      "broadcast",
      "mono-compatibility",
      "segment history",
    ],
    intro:
      "Correlation Meter presents the stereo correlation of a file as a broadcast-style needle meter, with a running history across the recording. It measures exactly what the phase meter measures, but in the form a broadcast engineer would recognise.",
    content:
      "The bar runs from minus one on the left to plus one on the right with zero at the centre, and the filled segment shows where the file's overall correlation falls and how far it sits from the midpoint.\n\nWhat the meter shows:\n\n- A wide meter track labelled at minus one, minus zero point five, zero, plus zero point five and plus one.\n- The overall correlation printed to three decimals, with a short interpretation next to it: highly correlated and mono-safe, dangerous anti-phase content, or a healthy stereo spread.\n- A running history in four segments, each showing the correlation for that part of the file so movement over time is visible rather than collapsed.\n- A note beneath the display giving the practical ranges that matter in delivery work.\n\nThe measurement is a normalised cross-correlation of the left and right channels, the same quantity a hardware correlation meter displays, with the result confined between minus one and plus one by construction. Reading it well is mostly about knowing what is normal for the genre. Broadcast masters are expected to keep the figure above roughly zero so that a mono television feed does not lose content, dance and pop records commonly sit between plus zero point three and plus zero point eight because their sides carry real energy, and very wide ambient or orchestral recordings can legitimately hover near zero where the two channels share little. A result that is consistently negative is the case worth acting on: it indicates that summing to mono will subtract rather than add. As with any averaged figure, the running history is what prevents an acceptable average from concealing a passage that goes badly wrong. The segment history serves the same purpose as a chart recorder attached to a hardware meter: it makes movement visible, so a file whose overall reading looks healthy but which swings sharply in one part can be identified rather than assumed safe. This is a mono-compatibility check first and a stereo width check second, and the two readings often disagree, which is useful information in itself.\n\nWhere the meter stops short:\n\n- The history has four segments only, so a short excursion inside a long passage may not appear.\n- Frequency dependence is not shown, so a bass-only polarity problem reads as one number.\n- A mono file cannot be analysed and is reported as unsupported.\n- The display is a measurement, not a processor: nothing is corrected here.\n- There is no time axis under the history, only segment numbers.\n- No logging or export of the values is offered.\n\nUse it as the delivery check on a stereo master, and as a quick sanity test when a mix has been rebuilt from stems and the sides may have been reconstructed incorrectly. When the numbers need to be cross-referenced against the shape of the stereo image, the vectorscope shows the same material as a figure, and the phase meter gives the same measurement with an added channel balance figure.",
    howTo: [
      { step: "Drop a stereo audio file onto the panel; mono files are flagged rather than analysed." },
      { step: "Read the needle position against the labelled scale to place the file's overall correlation." },
      { step: "Step through the four history segments to see whether the figure moves during the file." },
      { step: "Check the interpretation line, and treat a consistently negative reading as the case that needs fixing." },
    ],
    whenToUse:
      "Correlation Meter is the delivery check for stereo material that may be summed, so run it on any master headed for broadcast or for single-speaker playback. {{phase-meter|Phase Meter}} measures the same thing while adding a channel balance figure and a plain-language label, and {{goniometer-vectorscope|Goniometer / Vectorscope}} shows the stereo field as a shape. Where the reading points at a rebuild, {{mid-side-processor|Mid/Side Processor}} and {{channel-mixer|Channel Mixer}} are the tools that change the sides.",
    faqs: [
      {
        q: "How is this different from the phase meter?",
        a: "The underlying measurement is the same normalised correlation of the two channels. The difference is presentation and extra readouts: this tool shows the classic broadcast needle with a segment history, while the phase meter adds a channel balance figure and describes the value in words.",
      },
      {
        q: "What values should a music master show?",
        a: "Dance and pop typically land between plus zero point three and plus zero point eight because wide synths and effects carry genuine side energy. A figure above roughly zero is generally safe for mono, and material hovering near zero is acceptable when the arrangement is deliberately spacious.",
      },
      {
        q: "Why does a negative reading deserve attention?",
        a: "Because it means the channels are partly inverted relative to each other, so a mono sum will cancel content instead of reinforcing it. Listeners on a phone speaker or a mono system then hear a quieter, thinner version of the mix, and the cause is usually a polarity flip rather than the arrangement.",
      },
      {
        q: "Why only four history segments?",
        a: "The history is meant to show the broad movement of the correlation across the file rather than every fluctuation. Four spans reveal a section that behaves differently, and a problem short enough to hide between two spans is better investigated by cutting that section out and measuring it on its own.",
      },
      {
        q: "Does anything get corrected automatically?",
        a: "No, this is a read-only measurement. If the value indicates a problem, the correction has to be made deliberately: test a polarity inversion, rebuild the sides, or return to the mix, then measure again to confirm the result improved.",
      },
    ],
  },

  "goniometer-vectorscope": {
    keywords: [
      "Lissajous",
      "stereo field",
      "fountain",
      "4000 points",
    ],
    intro:
      "Goniometer / Vectorscope plots the stereo field of a file as a rotated Lissajous figure, so the shape of the image is visible rather than reduced to a number. Mono, inverted and genuinely wide material each produce a recognisable figure.",
    content:
      "Left and right channels drive the two axes of a scatter plot rotated forty five degrees, which is what makes the usual reading possible: identical channels collapse to a vertical line, inverted channels to a horizontal one, and real stereo spreads as a fountain around the vertical.\n\nWhat the display draws:\n\n- A square canvas with a dark background, a white reference cross and a surrounding circle to anchor the shape.\n- Up to 4000 stereo sample pairs plotted as small points with additive alpha, so overlap builds density and the outline of the distribution becomes readable.\n- A vertical axis carrying the sum of the two channels and a horizontal axis carrying their difference, which is why mono lands on the vertical and anti-phase content on the horizontal.\n- A caption explaining how to read the three characteristic shapes.\n\nThe rotation is not decoration: it is the reason the picture can be judged by eye at all. With sum on the vertical and difference on the horizontal, how tall the figure is shows how much the two channels share, while how wide it is shows how much they differ. A tall narrow figure means a nearly mono recording, a broad fan means a wide image with real side information, and a flat horizontal line means the sides are inverted. Only four thousand sample pairs are plotted, sampled across the file rather than taken from the beginning, because a scatter plot of every sample in a long recording would simply fill the square and lose its shape. Points are drawn with additive transparency so that regions where the signal spends most of its time appear brightest, which turns the display into a density map as well as a shape. The figure is a Lissajous pattern, the same construction a hardware vectorscope draws, rotated so that the vertical axis carries the mono sum and the horizontal axis carries the side difference. Reading it gets quicker with practice: a narrow ribbon means the stereo field is close to mono, a broad even fan means the two channels genuinely differ across the range, and a tilted shape means the image leans to one side. Because 4000 points are plotted across the whole file rather than only from its opening, the figure describes the recording as a whole instead of just its first seconds.\n\nWhat the figure cannot show:\n\n- It is a whole-file summary, so a section that goes out of phase is diluted by the rest.\n- Four thousand points is a sample of the material, not every pair, so fine structure is approximate.\n- Frequency information is absent: nothing here distinguishes a wide bass from a wide cymbal.\n- No numbers are reported, so the display complements measurement rather than replacing it.\n- Silence produces a single dense dot at the centre with no useful shape.\n- Nothing is exported or recorded over time.\n\nUse it when you want to see the stereo image rather than measure it: judging whether a reverb is genuinely wide, whether a doubled vocal has pushed the image off centre, or whether a remaster has narrowed a classic recording. Pair it with the correlation meters when a decision has to be defended with a number as well as a picture.",
    howTo: [
      { step: "Drop a stereo audio file onto the panel; mono files are reported as unsupported." },
      { step: "Read the overall shape first: vertical for mono, horizontal for inverted, a fountain for real stereo width." },
      { step: "Judge brightness as dwell time, since the densest regions are where the signal spends most of its energy." },
      { step: "Use the reference cross and circle to compare how far the distribution reaches from the centre." },
    ],
    whenToUse:
      "Goniometer / Vectorscope is the visual counterpart to the correlation meters, best when the stereo image needs to be seen rather than scored. {{correlation-meter|Correlation Meter}} and {{phase-meter|Phase Meter}} give the numbers, with the latter adding a channel balance figure. When the shape shows the image sitting off centre or leaning to one side, {{mid-side-processor|Mid/Side Processor}} and {{channel-isolator|Channel Isolator}} are the tools that let you work on the sides directly.",
    faqs: [
      {
        q: "Why is the display rotated forty five degrees?",
        a: "So that the vertical axis carries the sum of the two channels and the horizontal carries their difference. That orientation is what makes mono appear as a vertical line and inverted content as a horizontal one, which is the convention every goniometer uses.",
      },
      {
        q: "What does the shape of a good stereo image look like?",
        a: "A fountain: dense along the vertical where the two channels agree, spreading outward where they differ, and staying symmetric about the centre. A lopsided fountain suggests an unbalanced image, and a flat horizontal line means the sides are inverted.",
      },
      {
        q: "Why only 4000 points?",
        a: "Plotting every sample pair of a long recording would fill the square with ink and hide the distribution. Sampling four thousand pairs across the whole file shows the shape and the density while keeping the drawing readable.",
      },
      {
        q: "Does the density of the points mean anything?",
        a: "Yes. Points are drawn with additive transparency, so regions where the audio spends more time accumulate brightness. A bright compact core with faint outliers means the recording sits mostly in the centre with occasional excursions, which is typical of a centred mix with effects.",
      },
      {
        q: "Can it tell me whether a specific instrument is out of phase?",
        a: "Not reliably. The figure summarises the whole file, so one instrument's phase relationship is mixed with everything else and with any frequency-dependent behaviour. To isolate a part, render it on its own or cut that section out first and then measure it.",
      },
    ],
  },

  "loudness-meter-lufs": {
    keywords: [
      "LUFS",
      "integrated loudness",
      "momentary",
      "short-term",
      "platform targets",
    ],
    intro:
      "Loudness Meter (LUFS) measures a file the way streaming platforms do, reporting integrated, momentary and short-term loudness and placing each against the targets the major services normalise to. It answers why one upload sounds quieter than another with a number.",
    content:
      "Drop a file and three figures appear: integrated loudness for the whole programme, the highest momentary reading over a four hundred millisecond window, and the highest short-term reading over three seconds.\n\nThe measurement and the readings it produces:\n\n- Integrated LUFS, the number to compare against a platform's target, measured according to the ITU-R BS.1770-4 algorithm.\n- Momentary maximum, taken over the peak four hundred millisecond window found in the file.\n- Short-term maximum, taken over the peak three second window, which is close to how a listener experiences a loud passage.\n- A comparison strip against targets including minus fourteen for Spotify, YouTube, Amazon and Tidal, minus fifteen for Deezer, minus sixteen for Apple Music sound check and podcast standards, and minus twenty three for EBU R128 broadcast.\n\nTwo stages of K-weighting modelling the head's response are applied before the level is measured, and the measurement is gated twice. An absolute gate at minus seventy LUFS discards very quiet stretches so that a long silence cannot drag the average down, and a relative gate ten units below the ungated loudness discards the quieter parts of the programme so the integrated figure describes the material that is actually being listened to rather than including its pauses. Each target row is reported as a signed difference in LU: a positive value means the file is louder than the target and the platform will turn it down, and a negative value means it is quieter and will usually not be turned up. That asymmetry is the reason loudness normalisation is worth measuring before delivery rather than after. The platform targets shown are the ones the major services normalise toward, and they cluster in a narrow band, which is worth noting: minus fourteen, minus fifteen and minus sixteen are close enough that a master aiming at one is rarely badly wrong for the others. Broadcast's minus twenty three is a different world entirely, which is why a piece of work cannot sensibly be prepared for both without measuring against each of them in turn.\n\nWhat the meter deliberately does not do:\n\n- It measures only; nothing is gained or normalised, so a file that is too loud needs a separate correction step.\n- Targets are shown for comparison and are not rules imposed on the material.\n- A file shorter than three seconds cannot produce a meaningful short-term reading.\n- True peak is not reported here, so a loudness-compliant master can still exceed a delivery ceiling in inter-sample terms.\n- Nothing is written to the file's metadata, so a delivered master carries no loudness tag as a result of measuring it.\n- Movement within the programme is summarised as maxima rather than as a curve.\n\nUse it before uploading anything to a platform, and before mastering work where a target has to be hit to within a fraction of a unit. When the measurement shows the file is quiet or loud, the normaliser beside it applies the gain safely, and the range and histogram tools show whether the loudness inside the programme moves more than the material warrants.",
    howTo: [
      { step: "Drop an audio file onto the panel; the measurement runs without any settings to choose." },
      { step: "Read the integrated figure as the number to compare with a platform's target." },
      { step: "Check the momentary and short-term maxima to see how loud the file gets at its peaks." },
      { step: "Look down the target list for signed differences in LU, then apply gain elsewhere if the file needs correcting." },
    ],
    whenToUse:
      "Loudness Meter (LUFS) answers the delivery question directly, so run it before uploading to any platform that normalises. {{loudness-range-lra-meter|Loudness Range (LRA) Meter}} shows how much the loudness moves through the programme, and {{true-peak-meter|True Peak Meter}} checks the ceiling that loudness targets usually come with. When the numbers call for a change, {{loudness-normalizer|Loudness Normalizer}} applies the gain and {{streaming-platform-loudness-guide|Streaming Platform Loudness Guide}} explains what each service does with it.",
    faqs: [
      {
        q: "What is the difference between integrated, momentary and short-term loudness?",
        a: "Integrated is the gated average across the whole programme and is the figure platforms compare against. Momentary is the level over a four hundred millisecond window and short-term over three seconds, so the two maxima tell you how loud the file gets rather than what it averages.",
      },
      {
        q: "Why does gating matter?",
        a: "Without gating, a long quiet introduction or a stretch of silence would pull the average down and make the loud section look acceptable while it is not. The absolute gate removes very quiet material and the relative gate removes the quieter parts of the programme, so the measurement reflects what listeners actually hear.",
      },
      {
        q: "Why does my file show a positive difference against a target?",
        a: "Because it is louder than that target. A positive number of LU means the platform will apply attenuation when it normalises, so the track will play back at the level the service prefers rather than louder than the rest of the catalogue. That is a warning, not a failure.",
      },
      {
        q: "Should my master be exactly at the target?",
        a: "Matching a target is a reasonable aim for consistent playback, and podcast and broadcast work often requires it. For music the target is a reference point rather than a rule: what matters most is knowing where the file sits so the decision is deliberate instead of accidental.",
      },
      {
        q: "Does this check peaks as well?",
        a: "No. Loudness and peak level are separate measurements, and a file can be perfectly on target for loudness while still exceeding a delivery ceiling in inter-sample terms. Run the true peak meter alongside it before delivering anything that has a specified maximum.",
      },
    ],
  },

  "true-peak-meter": {
    keywords: [
      "true peak",
      "sample peak",
      "dBTP",
      "oversampling",
    ],
    intro:
      "True Peak Meter compares the peak level of the digital samples with an estimate of the peak that will exist after conversion to analog. The gap between the two figures is where inter-sample clipping hides.",
    content:
      "Two numbers are reported for the worst channel: sample peak in dBFS, which is what the file's samples literally contain, and an estimated true peak in dBTP, which accounts for the signal that continues between them.\n\nWhat the panel shows and how the estimate is made:\n\n- Sample peak in dBFS and estimated true peak in dBTP, side by side for direct comparison.\n- Headroom to zero dBTP and headroom to the minus one dBTP delivery target, both reported in decibels.\n- A verdict line that says whether the file is at or above full scale, below it but above the streaming target, or compliant with the common minus one dBTP target.\n- The number of channels analysed, noting that the worst channel is the one shown.\n\nThe estimate comes from oversampling each channel by a factor of four using a band-limited sinc interpolation with a sixteen-tap Hann kernel, then taking the largest value found. That is a deliberately modest reconstruction, and its behaviour is worth knowing: material close to Nyquist can reconstruct as much as about three decibels hotter than its samples suggest, and the classic test case is a crest that falls exactly halfway between two samples, where the samples read minus three point zero one decibels and the reconstruction recovers close to zero. Linear interpolation between neighbouring samples was tested and rejected because it cannot represent that reconstruction at all, which is why the sinc kernel is used. The result is an estimate rather than a guarantee: a higher oversampling factor or a longer kernel would refine it further, and the tool says so by labelling the reading as estimated. The comparison between the two figures is the useful part: if they are close, the file has little hidden overshoot, and if the estimate runs well above the sample peak, the material is doing something near the top of the band that a converter will reproduce at a level the samples never show. Delivery specifications are written in terms of the estimated figure for exactly that reason, since the ceiling has to hold after encoding and conversion rather than only in the file as stored, whatever sample rate and bit depth it happens to use.\n\nWhere the measurement has limits:\n\n- The verdict is based on the worst channel, so a per-channel breakdown is not shown.\n- The reconstruction is four times oversampled, so a true peak finer than that is not resolved exactly.\n- Only the peak is reported, so loudness has to be measured separately.\n- Nothing is limited or corrected: an over-ceiling file needs the limiter or a gain change.\n- Inter-sample estimation cannot predict what a specific digital-to-analog converter will do, only how much hotter the reconstructed signal may be.\n- No log of peak positions in time is produced.\n\nUse it as the last check before delivery, because lossy encoding and digital-to-analog conversion can both push a signal above the ceiling its samples appear to respect. Set the output ceiling with a limiter and confirm with this meter rather than trusting the sample peak alone.",
    howTo: [
      { step: "Drop an audio file onto the panel; every channel is analysed and the worst one is reported." },
      { step: "Compare sample peak against the estimated true peak to see how much is hidden between the samples." },
      { step: "Read the headroom figures against zero dBTP and against the minus one dBTP delivery target." },
      { step: "If the verdict warns about full scale, reduce gain or apply a limiter and measure again." },
    ],
    whenToUse:
      "True Peak Meter is the delivery ceiling check, so it belongs alongside loudness measurement rather than instead of it. {{loudness-meter-lufs|Loudness Meter (LUFS)}} supplies the loudness side of the same delivery question, and {{peak-limiter|Peak Limiter}} or {{brickwall-limiter|Brickwall Limiter}} is where a ceiling is actually imposed. To see whether the peaks are unusual for the material, {{crest-factor-meter|Crest Factor Meter}} describes their relationship to the average level.",
    faqs: [
      {
        q: "Why can the true peak be higher than the sample peak?",
        a: "Because samples are instantaneous measurements of a continuous waveform. If the real peak falls between two samples, neither one records it, so a converter that reconstructs the analog signal carefully will output more than the samples suggest, up to about three decibels at the top of the band.",
      },
      {
        q: "How accurate is the estimate?",
        a: "It is a four times oversampled band-limited reconstruction, which recovers the classic half-sample crest case cleanly but is not an exact analog simulation. That is why the reading is labelled as estimated and why a delivery ceiling is best left a little below the limit rather than right at it.",
      },
      {
        q: "What is dBTP?",
        a: "Decibels true peak, a scale that is referenced to full scale just like dBFS but measured against the reconstructed waveform rather than the samples. The two scales therefore read the same units but the dBTP figure is always the higher of the pair for a given file.",
      },
      {
        q: "Why does a loudness target come with a peak target?",
        a: "Because lossy encoding and conversion can both add inter-sample overshoot, and a master sitting exactly at full scale can distort after a platform encodes it. Specifying a ceiling such as minus one dBTP leaves room for that overshoot, which is why the two specifications travel together.",
      },
      {
        q: "Does the meter tell me where the peak occurs?",
        a: "No, only its level. If the position matters, the waveform view shows where the loudest transients sit in the file, and cutting the section out and measuring it separately gives a peak figure for just that passage.",
      },
    ],
  },

  "rms-meter": {
    keywords: [
      "RMS",
      "crest factor",
      "half-second window",
      "dBFS",
    ],
    intro:
      "RMS Meter reports the average level of a file, its peak, and the ratio between them, then plots that average over time in half-second windows. It is the plain level measurement that most other readings are built on.",
    content:
      "Four cards summarise the file — average RMS, peak, crest factor and duration — and a bar chart underneath shows how the average level moves through the recording.\n\nWhat is measured and how it is presented:\n\n- RMS in dBFS together with the underlying linear value, so the root-mean-square level can be read either way.\n- Peak level in dBFS with its linear value, which is the largest absolute sample in the file.\n- Crest factor in decibels, computed as peak divided by RMS, which quantifies how peaky the material is.\n- A bar for every half-second window, scaled so the largest window fills the full height of the chart, with each bar's exact level available on hover.\n\nRoot mean square is the square root of the mean of the squared samples, which is why it tracks perceived energy far better than a peak reading does: a passage that is loud throughout shows a high average, while a quiet recording with one loud click does not. Squaring is what makes the measure insensitive to sign, so phase and polarity have no effect on it. The crest factor then falls out of the comparison, and it is the number that explains why two files at identical RMS can behave completely differently at a limiter — one sitting near its average and the other spiking well above it. The windowed timeline uses half-second spans, a compromise between stability and detail: short enough to show a quiet verse or a loud chorus, long enough that individual drum hits do not dominate. Bars are scaled to the loudest window rather than to an absolute reference, so the chart shows the shape of the level over time and the cards carry the absolute figures. Every figure on the panel is a plain measurement with no frequency weighting applied, which makes it a fair comparison between two files and a poor predictor of how a streaming platform will treat them. The pairing of average and peak is the point of the display: read alone, either number can mislead, and how a limiter will behave depends on the relationship between the two rather than on either one by itself.\n\nWhat the numbers do not cover:\n\n- RMS is not perceptual loudness, so it does not account for frequency weighting and will not match a platform's normalisation.\n- The windowed chart is scaled to its own maximum, so the same visual height can mean different absolute levels in different files.\n- Only the maximum window is highlighted implicitly by relative height, with no marker for the quietest one.\n- Nothing is measured per channel, so a file with one silent channel reports a combined figure over all channels.\n- No hearing-weighted meter is offered, which is what the loudness meter is for.\n\nUse it as the first level measurement on any file, and as the explanation when a limiter behaves unexpectedly: a high crest factor tells you that the peaks are far above the average and that dynamic control will matter more than gain. When the same information is needed in a perceptual form, the loudness meter and the VU meter answer related questions with different weighting.",
    howTo: [
      { step: "Drop an audio file onto the panel; the measurement has no options to configure." },
      { step: "Read the RMS and peak cards together to judge both the average and the worst sample." },
      { step: "Check the crest factor to see how far the peaks sit above the average level." },
      { step: "Scan the bar chart for sections where the average level drops or rises, hovering a bar for its exact level." },
    ],
    whenToUse:
      "RMS Meter is the general-purpose level measurement, useful whenever average and peak need to be seen together with the ratio between them. {{crest-factor-meter|Crest Factor Meter}} explores that ratio window by window and highlights the most peak-heavy moment, and {{vu-meter|VU Meter}} presents the same average with the timing and scaling of a classic needle. For perceptual loudness, {{loudness-meter-lufs|Loudness Meter (LUFS)}} is the meter that matches platform behaviour.",
    faqs: [
      {
        q: "How is the average level calculated here?",
        a: "The square root of the mean of the squared sample values, which is a way of expressing average energy rather than momentary amplitude. Because the squares are averaged, a long quiet passage and a short loud one contribute in proportion to their duration and their energy, which is closer to how loudness is perceived.",
      },
      {
        q: "What is a typical crest factor?",
        a: "A pure sine wave sits at three decibels, which is the theoretical minimum for a single tone. Heavily limited masters often land between six and ten decibels, natural speech and percussive material frequently exceed twelve, and sparse recordings with wide dynamics can go higher still.",
      },
      {
        q: "Why is the bar chart scaled to its own maximum?",
        a: "So that the shape of the level over time stays visible whatever the file's absolute level. The cards carry the absolute numbers, and the chart answers a different question: does the recording stay at one level, or does it move?",
      },
      {
        q: "Will this tell me if my file is suitable for a platform?",
        a: "Not directly, because platform normalisation is based on perceptual loudness rather than RMS. Use this meter to understand the file's level and peaks, and the loudness meter to compare against the targets services actually apply.",
      },
      {
        q: "Why does the crest factor matter at a limiter?",
        a: "Because the limiter has to reduce peaks, and a high crest factor means the peaks are far above the average. That forces more gain reduction for the same overall level change, which is why two files at the same RMS can sound and measure very differently after limiting.",
      },
    ],
  },

  "vu-meter": {
    keywords: [
      "VU",
      "average-rectified",
      "300 millisecond",
      "0 VU",
    ],
    intro:
      "VU Meter reads a dropped file the way a classic needle meter would, averaging the level over three hundred millisecond windows and referencing zero VU to minus eighteen dBFS. The result is a deliberately slow, averaged reading rather than a peak one.",
    content:
      "An integrated figure dominates the panel, with a bar beneath it spanning minus twenty to plus three VU, a marked point at zero, and a row of window bars showing how the reading moves through the file.\n\nWhat the meter presents and how it is derived:\n\n- An integrated VU figure, with a dash in place of a number when the file is quiet enough to be effectively silent.\n- The underlying average-rectified level in dBFS, shown alongside the channel count and sample rate.\n- A bar scaled from minus twenty to plus three VU with a tick at zero, and a gradient from green through yellow to red as it rises.\n- One bar per three hundred millisecond window, so the movement of the average across the recording is visible.\n\nThe reading is built from average rectification rather than root mean square, which is the distinction that makes a VU meter a VU meter: the absolute value of the signal is taken and averaged over the integration window, so the ballistics are slow and steady in the way the standard intends. The three hundred millisecond integration is the classic figure, and zero VU is referenced to minus eighteen dBFS RMS in the EBU R68 convention, so a file peaking at zero dBFS generally reads a few units above zero on this scale. The consequence of that deliberate averaging is the meter's best-known behaviour: it under-reads fast transients, which is a feature rather than a fault, because the needle was designed to track how loudness is perceived rather than to catch every spike. When the reading looks lower than the peak level suggests, that gap is the transient content the ballistics have passed over. The 300 millisecond integration is the figure the standard specifies, and the zero VU reference is a convention rather than a property of the audio, so the same file would read differently against a different reference. What the scale is designed to show is whether a programme sits around its nominal point consistently, and a reading that drifts far from 0 VU says something about level control rather than about peaks.\n\nWhere this meter should not be relied on:\n\n- Fast transients are systematically under-reported, so it is a poor choice for catching clipping or overs.\n- The scale tops out at plus three VU, so very hot material reads as a full bar rather than as a number beyond the scale.\n- Only one integrated figure is given, with no separate left and right readings.\n- The reference is a convention, so a file calibrated for a different standard will not read against it directly.\n- Nothing is exported and no peak value is reported here.\n- It is a measurement only, with no gain applied as a result.\n\nUse it for the job the convention was designed for: judging how a mix will feel to a listener, matching levels between takes in a session, and checking that a programme sits near zero VU over its length rather than drifting. When peaks and true peaks are the concern, the peak program meter and the true peak meter report those without the deliberate smoothing.",
    howTo: [
      { step: "Drop an audio file onto the panel; no settings are needed and the measurement runs immediately." },
      { step: "Read the large integrated figure against the bar, treating zero VU as the reference point." },
      { step: "Look at the average-rectified dBFS line beneath it to see the underlying level." },
      { step: "Scan the window bars to check whether the average holds steady or drifts across the file." },
    ],
    whenToUse:
      "VU Meter is the right reading when the question is how loud a file feels rather than where its samples peak, so it suits session level matching and programme checks. {{ppm-meter|PPM Meter}} answers the opposite question with fast peak integration and an over indicator, and {{rms-meter|RMS Meter}} gives a squared-average measurement with a peak figure alongside it. For readings tied to platform normalisation, {{loudness-meter-lufs|Loudness Meter (LUFS)}} is the meter designed for that purpose.",
    faqs: [
      {
        q: "Why is zero VU not the same as zero dBFS?",
        a: "They are different scales with different references. Zero VU corresponds to minus eighteen dBFS RMS in the EBU convention, which is why material peaking near full scale reads several units above zero on this display rather than at it.",
      },
      {
        q: "Why does the meter miss my loudest moments?",
        a: "Because it integrates over three hundred milliseconds by design, so a transient shorter than that is averaged with the material around it. That smoothing is the standard's intent and matches perception, but it means this meter cannot be used to catch overs.",
      },
      {
        q: "What is average rectification?",
        a: "Taking the absolute value of each sample and averaging them over the window, as opposed to squaring them as a root-mean-square meter does. The two measures track each other closely but not identically, and the rectified version is the one the VU convention specifies.",
      },
      {
        q: "Why is only one figure shown instead of a separate left and right reading?",
        a: "The display is a whole-file summary, so a single integrated value is what it reports, with the channel count noted in the caption. If a per-channel balance question matters, the phase meter reports the relationship between left and right directly.",
      },
      {
        q: "What does a dash instead of a number mean?",
        a: "The file is quiet enough that the reading would be meaningless, so it is suppressed rather than displayed as a very low number. Empty or near-silent files are the usual cause.",
      },
    ],
  },

  "ppm-meter": {
    keywords: [
      "peak program meter",
      "10 millisecond",
      "over indicator",
      "envelope",
    ],
    intro:
      "PPM Meter reads a file with the fast ballistics of a peak program meter, integrating over ten millisecond blocks and warning when samples reach the ceiling. Where a VU meter averages, this one catches.",
    content:
      "A large peak program figure heads the panel, with the true sample peak beside it and a scale marked at zero, minus three, minus six, minus nine, minus twelve, minus twenty four and minus forty eight dBFS.\n\nWhat the meter reports:\n\n- The peak program level, taken from ten millisecond block peaks, presented in dBFS with a dash if the file is effectively silent.\n- The true sample peak, which is the largest absolute sample value in the file, used to drive the over warning.\n- A bar that turns yellow above minus nine and red above minus three, so the approach to the ceiling is visible before it is reached.\n- A warning line reading over when the sample peak reaches minus zero point one dBFS or higher.\n- An envelope row with one bar per hundred milliseconds, coloured red for any window above minus three, giving a view of how the level moves across the file.\n\nThe two figures measure different things on purpose. The peak program level is a short-block integration, roughly matching how a hardware PPM responds, so it reflects the loudness of transients over ten milliseconds rather than a single instantaneous sample. The over lamp, by contrast, is driven by the actual maximum sample value, because the point of an over indicator is to flag the exact moment a converter ran out of headroom, and an integrated figure would miss that by averaging. Keeping both means the display can warn that a programme is riding too close to the ceiling without falsely declaring an over, and can also catch a single clipped sample that the integrated figure reports comfortably below the limit. The envelope bars make the same distinction over time, highlighting any hundred millisecond window whose peak exceeds minus three decibels. The 10 millisecond block is the integration that separates a peak program meter from an averaging meter: short enough to catch the arrival of a transient and long enough to ignore the shape of any single sample. That makes this the meter to watch when setting levels for material with hard attacks, and it is why the true sample peak sits beside it, because an integrated figure alone will never flag a single clipped sample.\n\nWhat it does not attempt:\n\n- Only the sample peak is checked for overs, so inter-sample overshoot is not reported here.\n- The over threshold is fixed at minus zero point one dBFS with no adjustable tolerance.\n- The scale stops at zero, so content above full scale shows as a full bar rather than a value.\n- One integrated figure covers all channels, with no per-channel breakdown.\n- There is no held peak marker that persists after the moment has passed.\n- Nothing is exported and no correction is applied.\n\nUse it as the peak-side companion when preparing material for delivery: it tells you how close the programme sits to the ceiling and whether anything has actually touched it. The VU meter answers the perceptual question with slower ballistics, and the true peak meter extends the over check to the level between samples, which is the measurement a lossy encode or a converter will react to.",
    howTo: [
      { step: "Drop an audio file onto the panel; the peak program measurement starts straight away." },
      { step: "Read the large peak program figure and compare it with the true sample peak beside it." },
      { step: "Watch the bar colour: yellow signals passing minus nine, red signals passing minus three." },
      { step: "Check for the over warning and scan the envelope row for any window marked red." },
    ],
    whenToUse:
      "PPM Meter is the peak-side reading for programme material, catching transients that an averaged meter would smooth away. {{vu-meter|VU Meter}} reads the same file with the slower ballistics that match perceived loudness, and {{true-peak-meter|True Peak Meter}} extends the over check from the samples to the reconstructed signal. Where a ceiling has to be enforced rather than measured, {{peak-limiter|Peak Limiter}} applies it, and {{crest-factor-meter|Crest Factor Meter}} explains how far the peaks sit above the average.",
    faqs: [
      {
        q: "What is the difference between peak program level and true sample peak?",
        a: "The peak program figure integrates over ten millisecond blocks and behaves like a hardware PPM, so it reflects transient energy rather than a single instantaneous value. The true sample peak is the largest absolute sample in the file, which is why it drives the over warning.",
      },
      {
        q: "When does the over warning appear?",
        a: "When the sample peak reaches minus zero point one dBFS or higher. That threshold is fixed rather than adjustable, and it is deliberately just below full scale so that material sitting on the ceiling is flagged rather than only material that has clearly exceeded it.",
      },
      {
        q: "Why do I need both a PPM and a true peak meter?",
        a: "Because they answer different questions. A PPM tells you how the programme rides against the ceiling and whether the samples have reached it, while a true peak meter estimates the reconstructed level between samples, which is what a converter or a lossy encoder will react to.",
      },
      {
        q: "What do the colours on the bar mean?",
        a: "Green means the reading is safely below minus nine, yellow is between minus nine and minus three, and red is above minus three. The same colouring appears on the envelope bars, where any hundred millisecond window above minus three is drawn red.",
      },
      {
        q: "Is the programme too hot if it touches the red?",
        a: "Not necessarily. Red indicates that peaks are close to the ceiling, which matters most for material that will be encoded lossily or converted to analog. Reduce gain or limit the peaks if a delivery specification applies, and confirm with the true peak meter rather than the sample reading alone.",
      },
    ],
  },

  "crest-factor-meter": {
    keywords: [
      "crest factor",
      "peak-to-RMS",
      "transients",
      "peakiest window",
    ],
    intro:
      "Crest Factor Meter measures how far a recording's peaks sit above its average level, both across the file and window by window. It highlights the single most peak-heavy moment the analysis finds.",
    content:
      "Four cards report the crest factor, the peak level, the average level and the position of the most peak-heavy window, with the windowed series drawn below them.\n\nWhat is measured and displayed:\n\n- The overall crest factor in decibels, defined as peak divided by RMS and described on screen in exactly those terms.\n- Peak and RMS levels in dBFS, so the two numbers behind the ratio are both visible rather than hidden inside it.\n- The time position and the value of the loudest window, found by scanning the series of three hundred millisecond windows and highlighting the highest in a contrasting colour.\n- One bar per three hundred millisecond window, drawn from the first window to the last, so the balance between transients and sustained material can be seen changing through the file.\n\nThe measurement itself is a peak-to-RMS ratio computed in decibels, which is why the two component levels are shown alongside it: a crest factor of twelve decibels can come from a loud peak over a quiet average or from a modest peak over a very quiet average, and those are different situations. The three hundred millisecond window matches the window used by the averaging meters in this category, which makes the crest series comparable with a VU reading taken over the same spans. Practical readings are worth memorising: a pure sine sits at three decibels, which is the floor for a single tone, while natural speech and percussive material often exceed twelve. That gap is the reason a recording can clip at a limiter while its average level still looks conservative, because the peaks are doing the damage rather than the sustained level. The highlighted window is the peakiest window, and locating it in time makes the figure actionable, since a single transient-heavy passage is a different problem from an even distribution of peaks across a whole recording, and the two call for different treatment.\n\nWhat the meter does not tell you:\n\n- It reports no frequency information, so it cannot say whether the peaks are bright or low.\n- The window length is fixed at three hundred milliseconds, so transient detail shorter than that is summarised within a window rather than shown separately.\n- There is no held maximum marker across the file, only the highlighted window position.\n- Nothing is measured per channel, so a peak on one side is reported as part of a combined figure.\n- The display is a measurement, and no gain or dynamics processing is applied.\n- Silent files produce meaningless ratios rather than a clear error, so an empty reading is a hint to check the file.\n\nUse it when material needs dynamic treatment and you want to know how much control will be required: a high crest factor means a limiter or compressor will be asked to do real work, while a low one suggests the material is already controlled. Comparing the crest factor before and after processing is one of the more honest ways to judge how hard a master has been pushed.",
    howTo: [
      { step: "Drop an audio file onto the panel; the crest calculation needs no configuration." },
      { step: "Read the crest factor card and the peak and RMS cards together, since the ratio comes from those two." },
      { step: "Look at the highlighted bar to find the most peak-heavy three hundred millisecond window in the file." },
      { step: "Compare early and late windows to see whether the dynamic character changes through the recording." },
    ],
    whenToUse:
      "Crest Factor Meter is the tool for understanding how much the peaks stand above the average, which frames what any dynamics processing will have to do. {{rms-meter|RMS Meter}} measures the same average and peak with a longer window and presents them alongside a level timeline, and {{true-peak-meter|True Peak Meter}} extends the peak check beyond the samples. When the ratio calls for control, {{dynamic-range-compressor|Dynamic Range Compressor}} and {{peak-limiter|Peak Limiter}} are where that is applied.",
    faqs: [
      {
        q: "What is a crest factor in plain terms?",
        a: "It is the ratio between the loudest peak in a recording and its average level, expressed in decibels. A high value means the peaks stand well above the sustained material; a low value means the recording is already dense and even in level.",
      },
      {
        q: "What values are normal?",
        a: "A pure sine wave is three decibels, which is as low as it gets for a single tone. Naturally recorded speech and percussion often exceed twelve, and heavily limited or highly compressed masters frequently sit in the six to ten decibel range.",
      },
      {
        q: "Why does a high crest factor cause clipping?",
        a: "Because the ceiling is reached by peaks, not by the average. A file with a comfortable average can still have individual transients at full scale, so it clips or triggers a limiter even though its overall level looks conservative.",
      },
      {
        q: "What does the most peak-heavy window tell me?",
        a: "It identifies the three hundred millisecond span with the largest difference between peak and average, which is usually the moment with the most transient content. On a drum-heavy mix that is a hit; on spoken material it is often a plosive or a hard consonant.",
      },
      {
        q: "Can I use this to judge how hard a master has been pushed?",
        a: "Comparing the crest factor of a master against an unprocessed mix is one of the more reliable measures of that, because limiting and compression reduce the gap between peaks and average. It is a better indicator than level alone, though loudness measurement remains the delivery standard.",
      },
    ],
  },

  "frequency-counter": {
    keywords: [
      "fundamental",
      "autocorrelation",
      "confidence",
      "octave error",
    ],
    intro:
      "Frequency Counter reports the fundamental frequency of a recording as a single number with a confidence percentage. It is the tool for a quick tuning check rather than for following a melody.",
    content:
      "The dominant readout gives the detected fundamental in hertz, with a confidence bar beneath it and a note of how many windows contributed to the result.\n\nWhat the panel reports:\n\n- The fundamental frequency for the first channel, or a dash when nothing periodic is found.\n- A confidence between zero and one, displayed as a percentage and as a filled bar, so a weak estimate can be recognised rather than trusted blindly.\n- The number of analysis windows that contributed, or a note that no periodic signal was found in the search range of fifty hertz to five kilohertz.\n- A caption recording the file name, the sample rate, the channel count and the method used.\n\nThe estimate comes from normalised autocorrelation rather than from a transform peak. Autocorrelation compares the signal with a delayed copy of itself across a range of delays, and the delay that produces the strongest agreement corresponds to one period of the waveform. That matters because a frequency-domain peak can land on any harmonic, whereas the autocorrelation peak naturally aligns with the repeating period of the whole waveform, which is what the fundamental actually is. Detection is octave-safe, meaning the peak selection avoids the classic failure where a strong second harmonic is mistaken for the fundamental and the answer is reported an octave too high. The search range is bounded between fifty hertz and five kilohertz, which covers voice and most instruments while excluding the very low rumble and the very high partials that would confuse a period estimate, and the confidence figure reflects how distinct the winning delay was from the alternatives. Avoiding the octave error is the specific reason the period method is used here, because mistaking a strong second harmonic for the fundamental is the classic failure of naive detection and it produces an answer exactly double the truth. Nothing in the display asks you to trust the number without support, so the confidence bar and the window count are both shown and the search range is stated rather than left implicit. A frequency reported at low confidence is best treated as a hint to check by other means, while on a steady tone the estimate is normally the most precise figure available for the file.\n\nWhere the method has limits:\n\n- Only the first channel of a stereo file is analysed.\n- The result is a single figure for the whole file, so a changing pitch is averaged rather than tracked.\n- Content outside the fifty hertz to five kilohertz search range is reported as nothing found.\n- Polyphonic material can produce a confident but meaningless answer, since several fundamentals compete.\n- Percussive or noisy recordings typically produce low confidence rather than a useful number.\n- Nothing is exported, and no note name is given alongside the frequency.\n\nUse it to check a tuning reference, confirm the pitch of a sustained note, or find out what a hum is actually sitting on. When the pitch changes through the material and the movement itself is the point, the frequency analyzer follows it segment by segment, and the spectrum view shows which harmonics are contributing to the sound.",
    howTo: [
      { step: "Drop an audio file onto the panel; the estimate is computed without any settings." },
      { step: "Read the frequency as the detected fundamental for the first channel of the file." },
      { step: "Check the confidence bar before relying on the value, especially for noisy or polyphonic material." },
      { step: "Confirm the result against the note you expected, or use it to identify an unexplained tone such as a hum." },
    ],
    whenToUse:
      "Frequency Counter suits a quick, single-number tuning or identification check on material with a clear pitch. {{frequency-analyzer|Frequency Analyzer}} follows the dominant pitch over time and lists it as measurable segments, and {{spectrum-analyzer|Spectrum Analyzer}} shows the harmonic content behind the fundamental. For a tone that needs to be examined as a time-frequency pattern, {{spectrogram-viewer|Spectrogram Viewer}} shows exactly where it sits.",
    faqs: [
      {
        q: "Why autocorrelation instead of a transform peak?",
        a: "Because autocorrelation finds the repeating period of the waveform, which is what the fundamental is. A transform peak simply reports the loudest frequency component, which in a harmonic-rich sound may well be the second or third harmonic rather than the fundamental itself.",
      },
      {
        q: "What does the confidence figure mean?",
        a: "It expresses how clearly one delay stood out from the alternatives in the autocorrelation. A high confidence means a single period was strongly indicated; a low one means the signal was noisy, polyphonic, or too short for a stable estimate, and the frequency should then be treated as a guess.",
      },
      {
        q: "Why does it report nothing for some files?",
        a: "The search range is bounded between fifty hertz and five kilohertz. Content outside that band produces no estimate, as does genuinely unpitched material such as noise or a drum loop, where no repeating period exists to find.",
      },
      {
        q: "How accurate is the answer?",
        a: "On a clearly pitched, sustained sound it is typically accurate to well within a hertz and is often more precise than reading a transform bin. On polyphonic or heavily processed material the confidence figure is the honest guide to how much to trust it.",
      },
      {
        q: "Can it tell me the nearest note?",
        a: "No, it reports a frequency only, so the conversion to a note is a separate step. That is deliberate: the frequency is the measurement, and mapping it onto a tuning system depends on which reference pitch you are working to.",
      },
    ],
  },

  "loudness-range-lra-meter": {
    keywords: [
      "loudness range",
      "LRA",
      "percentile",
      "short-term loudness",
    ],
    intro:
      "Loudness Range (LRA) Meter measures how much the loudness of a programme moves from start to finish, expressed in loudness units. It draws the short-term loudness over time and marks the percentile span the range is taken between.",
    content:
      "Three cards report the range in LU and the tenth and ninety fifth percentile levels in LUFS, with the short-term series drawn over time below them and the measured span shaded across the plot.\n\nWhat each figure means and how it is derived:\n\n- Loudness range in loudness units, computed from the gated distribution of short-term loudness rather than from the extremes of the waveform.\n- The tenth and ninety fifth percentile levels, which bracket the part of the distribution the range is measured between.\n- A short-term loudness series drawn as a continuous curve, broken wherever the measurement is undefined.\n- A shaded band across the plot showing the percentile span, so the visual and the number refer to the same thing.\n\nShort-term loudness is sampled in overlapping windows, and it is the distribution of those values that the range describes. Taking percentiles rather than extremes is the key design decision: a single loud effect or a brief quiet passage would otherwise dominate the figure, whereas the tenth and ninety fifth percentiles describe how the bulk of the programme behaves. A second gate removes windows that are more than twenty units below the programme's own average, which stops a long fade or a quiet introduction from inflating the result. Reading the number is largely a matter of context. Dialogue productions typically land around three to eight units because speech is naturally even once it is levelled, produced music commonly sits between four and ten, and classical or wide dynamic material can exceed fifteen. A value much larger than the material warrants usually points at unlevelled takes rather than at an artistic decision. The abbreviation for the measurement is LRA, and it is quoted constantly in delivery specifications, so knowing which side of a typical figure a programme falls on is worth more than recalling the exact value. The range is not a quality judgement: wide is right for some material and wrong for other material, and the useful signal is whether the number matches what the content actually does. Those typical ranges are worth treating as observations rather than as rules.\n\nWhere the measurement is limited:\n\n- A file too short for several short-term windows produces no meaningful range.\n- The percentiles describe the bulk of the programme, so an isolated extreme does not appear in the number.\n- Only the range is summarised, with no target value imposed.\n- The plot is drawn once at analysis time and is not interactive, so the hover-free curve cannot be interrogated point by point.\n- Silence at the start or end of a file is gated out rather than reported.\n- No export of the series or of the percentiles is offered.\n\nUse it alongside the loudness meter when a programme has to be both at a target level and internally consistent: the integrated figure says where the whole programme sits, and the range says whether it stays there. The histogram view shows the same distribution from the other direction, revealing whether the material lives at one loudness or sweeps across many.",
    howTo: [
      { step: "Drop an audio file onto the panel; the short-term series is measured immediately." },
      { step: "Read the loudness range card as the spread of the programme's loudness in units." },
      { step: "Check the tenth and ninety fifth percentile levels to see where the bulk of the material sits." },
      { step: "Compare the drawn curve against the shaded band to spot sections that push outside the main range." },
    ],
    whenToUse:
      "Loudness Range (LRA) Meter answers how much a programme's loudness moves, which is a different question from where it sits overall. {{loudness-meter-lufs|Loudness Meter (LUFS)}} provides the integrated, momentary and short-term figures plus platform targets, and {{loudness-histogram|Loudness Histogram}} shows the same distribution as a bar chart. When the range turns out too wide for the material, {{dynamic-range-compressor|Dynamic Range Compressor}} or {{loudness-normalizer|Loudness Normalizer}} is the next step.",
    faqs: [
      {
        q: "What is a loudness unit?",
        a: "A unit on the loudness scale, equivalent to a decibel in size but referenced to the perceptual measurement rather than to the signal level. A range of five units means the programme's short-term loudness typically moves across about five units as it plays.",
      },
      {
        q: "Why use percentiles instead of the loudest and quietest passages?",
        a: "Because a single loud effect or a brief quiet moment would otherwise define the entire figure. Counting from the tenth to the ninety fifth percentile describes how the bulk of the programme behaves, which is far more representative of what a listener experiences.",
      },
      {
        q: "What ranges are typical?",
        a: "Dialogue and podcast material usually lands around three to eight units because levelled speech is naturally consistent. Produced music commonly sits between four and ten, and classical or deliberately dynamic material can exceed fifteen units.",
      },
      {
        q: "Is a wide range a problem?",
        a: "Only if it is wider than the material calls for. Documentary, film and classical work is expected to move a lot, while a pop single or a podcast that swings widely usually means the takes were not levelled rather than that the production is dynamic.",
      },
      {
        q: "How is this different from dynamic range?",
        a: "Dynamic range is usually used for the distance between a signal's loudest peak and its noise floor or average level. Loudness range measures the movement of perceived loudness through a programme, which is why the two figures can point in quite different directions for the same file.",
      },
    ],
  },

  "loudness-histogram": {
    keywords: [
      "histogram",
      "LU bins",
      "relative gate",
      "distribution",
    ],
    intro:
      "Loudness Histogram charts the distribution of a programme's short-term loudness, so you can see whether a recording lives at one level or sweeps across many. It also reports the range and how much of the material the gates removed.",
    content:
      "Each bar is one loudness unit wide, so the height of a bar shows how many short-term windows of the programme landed at that loudness, and the shape of the whole chart is the character of the material at a glance.\n\nWhat the view reports and how the distribution is built:\n\n- A histogram of short-term loudness grouped into single unit bins, drawn with the low end of the scale on the left.\n- The loudness range in units, taken from the same gated distribution the range meter uses.\n- The percentage of analysis windows excluded by the gating, which is a useful honesty check on the measurement.\n- One bar per occupied bin, with the axis labelled at the lowest, middle and highest bin centres.\n\nThe distribution is built from short-term loudness windows measured on a gated scale, then filtered by a relative gate set twenty units below the power mean of the programme itself before being counted into bins. That gate is what keeps a single quiet passage or an extended fade from stretching the chart into a long, uninformative tail, and the excluded percentage makes the effect visible instead of silent. Reading the shape is the point of the tool. A tall narrow spike means the material holds one loudness throughout, which is what a levelled podcast or a heavily compressed master looks like; a broad spread means the loudness genuinely moves, as it does in classical, film or acoustic recordings. A chart with two separate clusters is often the signature of a programme assembled from takes that were not matched, which is a problem the aggregate range figure cannot reveal on its own. Counting in LU bins of one unit each is a deliberately coarse choice, fine enough to show the shape and coarse enough to stay readable on a canvas of fixed width. The chart is a distribution rather than a timeline, so it answers how the loudness is arranged and leaves when it changes to the range meter's series. Reading it alongside those figures gives a fuller picture of a programme than any one of them provides alone, and a chart that is barely visible at all usually means the file is too short for the analysis to have a distribution worth drawing.\n\nWhat the chart does not cover:\n\n- It describes loudness over time only in aggregate, so it cannot say where in the file a bin occurs.\n- Bin width is fixed at one unit, so finer movement is merged together.\n- Material too short for a useful number of windows produces a sparse or empty chart.\n- The gate is applied before counting, so excluded windows are represented only by the percentage figure.\n- There is no interactive readout per bin, and no export of the counts.\n- It reports no target and applies no correction.\n\nUse it when a programme needs to be consistent rather than merely on target: the integrated loudness says where it sits, and this chart says whether it stays there. It is also a quick way to see the effect of a processing chain, since the same material measured before and after levelling produces visibly different shapes.",
    howTo: [
      { step: "Drop an audio file onto the panel; the short-term distribution is measured and drawn automatically." },
      { step: "Read the overall shape: a single tall spike means one loudness, a broad spread means genuine movement." },
      { step: "Check the range card and the percentage of windows excluded by the gates next to the chart." },
      { step: "Look for more than one cluster in the shape, which usually indicates material that was not levelled consistently." },
    ],
    whenToUse:
      "Loudness Histogram is the view to choose when the shape of a programme's loudness matters more than its summary figures. {{loudness-range-lra-meter|Loudness Range (LRA) Meter}} reports the same distribution as a range and a time series, and {{loudness-meter-lufs|Loudness Meter (LUFS)}} gives the integrated figures and platform targets. When the chart shows a spread that should be tighter, {{loudness-normalizer|Loudness Normalizer}} or {{dynamic-range-compressor|Dynamic Range Compressor}} is the tool that acts on it.",
    faqs: [
      {
        q: "What does the shape of the histogram tell me?",
        a: "How the programme's loudness is distributed. A single tall spike means it stays at one level throughout, which is typical of levelled speech or a heavily compressed master. A broad, flat spread means the loudness genuinely moves, as it does in classical and film material.",
      },
      {
        q: "What does the excluded percentage mean?",
        a: "It is the share of analysis windows removed by the gates before counting, mostly very quiet material and windows well below the programme's own average. A high figure is worth noticing, because it means much of the recording sits far below the loudness the chart is describing.",
      },
      {
        q: "Why do two separate clusters appear sometimes?",
        a: "Usually because the programme was assembled from takes recorded or processed at different levels, leaving the material grouped around two loudness points. It is a specific and useful finding: the aggregate range figure shows the symptom, and this chart shows the cause.",
      },
      {
        q: "Why are very quiet windows left out?",
        a: "A relative gate is applied twenty units below the programme's own average so that a fade-out or a long quiet section cannot stretch the chart into a tail that accounts for almost none of the listening. The percentage of excluded windows is reported so the effect is visible rather than hidden.",
      },
      {
        q: "Does the histogram show where in the file a level occurs?",
        a: "No, it is a distribution and discards time by design. To see when the loudness changes rather than where it concentrates, the range meter's time series shows the short-term loudness plotted against the file's duration.",
      },
    ],
  },
};
