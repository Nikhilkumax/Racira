/**
 * AUTO-GENERATED — do not edit by hand.
 *
 * Source: src/domains/audio/seo/source/batch-06-volume-dynamics.json
 * Regenerate: node scripts/audio-json-to-seo.mjs src/domains/audio/seo/source/batch-06-volume-dynamics.json <this file> audioSeoBatch6
 * Validate first: node scripts/validate-audio-seo-json.mjs src/domains/audio/seo/source/batch-06-volume-dynamics.json
 */
import type { ToolSeo } from "@/components/shared/seo-types";

export const audioSeoBatch6: Record<string, ToolSeo> = {
  "volume-booster": {
    keywords: [
      "soft clipping",
      "limiter",
      "headroom",
      "decibels",
    ],
    intro:
      "Volume Booster raises the level of a file by a chosen number of decibels, with a choice between a soft limiter that cannot clip and a raw boost that can. The two modes trade a gentle saturation against squared off peaks.",
    content:
      "Drop a file, choose how much boost you want and decide how the peaks should be handled, then read the output peak from the footer. The report quotes it to three decimal places and tells you which path was taken, so there is no ambiguity about whether the file clipped.\n\nWhat the panel offers:\n\n- A boost slider from 1 to 18 decibels in single decibel steps, defaulting to 6.\n- Three quick presets at plus 3, plus 6 and plus 12 decibels.\n- A soft limit mode, which passes the boosted samples through a hyperbolic tangent curve so the output approaches but never exceeds positive or negative one.\n- A hard clip mode, which applies the raw gain and lets anything above full scale be squared off.\n- A footer reporting the resulting peak and naming which of the two paths produced it.\n\nThe soft limit path is soft clipping in the plain sense: a saturation curve rather than a limiter with attack and release, which is why the honest promise is that no sample is hard clipped and why the output approaches the ceiling without touching it. Pushing a signal through a tangent curve compresses the top of the waveform progressively, so a boost of twelve decibels comes back dense and slightly rounded rather than torn, and the verified behaviour is that the output never exceeds the digital ceiling and that zero samples are hard clipped. The hard clip path does the opposite: the gain is applied literally and anything that lands past full scale is flattened at the rail, which is louder but introduces the harsh upper harmonics that clipping is known for. The footer exists precisely because the difference matters and the two modes can sound similar at low boosts.\n\nWhen each mode is the right one:\n\n- Soft limit is the safe choice for a quiet recording that needs to be heard, because it cannot produce the crackle of clipped samples.\n- The saturation it introduces is audible as a slight dulling and thickening at high boosts, so it is not free.\n- Hard clip is appropriate only when a little distortion is acceptable or wanted, or when a later stage will handle the peaks anyway.\n- Neither mode recovers headroom that was never there; a file recorded too loud is not improved by boosting it.\n- The tool has no meters beyond the output peak figure, so there is no gain reduction display to watch while setting the amount.\n- Boosting raises the noise floor along with the signal, so a noisy take comes back louder and equally noisy.\n\nUse the soft limit path whenever the goal is simply to make a quiet file audible, since it cannot clip and the saturation is mild at moderate amounts. Reach for the hard clip path only deliberately, when you want the edge it adds or when you know a later limiter will smooth the result. If the file needs to end up at a specific loudness rather than a specific boost, the loudness normalizer is the better tool, because it works from a measurement instead of a guess.",
    howTo: [
      { step: "Drop an audio file onto the panel, or click to choose one from disk." },
      { step: "Set the boost with the slider or one of the three presets at plus 3, plus 6 and plus 12 decibels." },
      { step: "Choose soft limit for a boost that cannot clip, or hard clip if you want the raw gain applied literally." },
      { step: "Read the output peak in the footer to confirm what happened, then download the boosted WAV." },
    ],
    whenToUse:
      "Volume Booster is for making a quiet file louder than it was, with an explicit decision about what to do when the boost runs out of headroom. {{audio-amplifier|Audio Amplifier}} is the plain gain tool when no peak strategy is needed, and {{volume-reducer|Volume Reducer}} is the mirror image for turning something down precisely. When the problem is that peaks need controlling rather than overall level, {{peak-limiter|Peak Limiter}} and {{brickwall-limiter|Brickwall Limiter}} do that job with lookahead instead of saturation.",
    faqs: [
      {
        q: "What is the difference between soft limit and hard clip?",
        a: "Soft limit passes the boosted signal through a smooth curve, so samples get progressively compressed near the ceiling and the output never exceeds it. Hard clip applies the gain literally and flattens anything past full scale against the rail. Soft is safer and slightly duller; hard is louder and adds harsh upper harmonics.",
      },
      {
        q: "Does the soft limiter really prevent clipping?",
        a: "Yes, and it is verified behaviour: the output approaches but never exceeds positive or negative one, and zero samples come back hard clipped. What it cannot do is leave the signal completely untouched, because the curve it applies is a form of saturation. At moderate boosts the effect is subtle; at high ones it is clearly audible.",
      },
      {
        q: "Why does a boosted file sound duller?",
        a: "Because saturation compresses the peaks, which changes the shape of the waveform rather than just its size. On the soft limit path that shows up as a slight loss of crispness on transients. If the file sounds dull, the boost is too ambitious for the material and the loudness normalizer will get you further without the same trade.",
      },
      {
        q: "How much can I boost before it is obvious?",
        a: "It depends on how much level the file already has. A quiet voice memo with a low noise floor takes six decibels cleanly and twelve with mild saturation, whereas an already hot mix will start saturating immediately. The footer peak figure tells you how hard the ceiling was pressed, which is the clearest available signal.",
      },
      {
        q: "Does boosting also raise the background noise?",
        a: "Yes. Gain is gain, so everything in the file comes up together, including hiss and room tone. If the noise becomes objectionable at the level you need, the answer is to reduce the noise first and then boost, which is a two step job using the cleanup tools before this one.",
      },
    ],
  },

  "volume-reducer": {
    keywords: [
      "attenuation",
      "db",
      "headroom",
      "peak level",
    ],
    intro:
      "Volume Reducer applies a precise decibel reduction to a file and reports exactly what level it left behind. Because turning something down cannot clip, the honest answer here is simply the resulting peak and the headroom that remains.",
    content:
      "Drop a file, set how many decibels to remove and read the footer. It reports the new peak level both as a linear figure and in dBFS, along with the amount of headroom still available below full scale, so the consequence of the setting is visible immediately.\n\nThe control and the readout:\n\n- A reduction slider from minus 24 decibels to zero in single decibel steps, defaulting to minus 6.\n- Four quick presets at minus 3, minus 6, minus 10 and minus 20 decibels.\n- A footer giving the peak level after the pass as a linear value to three decimals and as dBFS to one decimal.\n- A second figure stating how many decibels of headroom remain below full scale.\n- An output WAV named after the source with a reduced suffix.\n\nThe maths is a single multiplication per sample: the requested decibels are converted to a linear factor by raising ten to the power of the figure divided by twenty, and every sample is scaled by that one number. Nothing else is changed. There is no dynamics processing, no filtering and no time dependent behaviour, which is what makes the result predictable and exactly reversible in the sense that the same number of decibels added back would restore the original levels. Because attenuation moves the signal further from the ceiling, the whole operation is safe by construction: the output cannot clip regardless of how much is removed or how hot the input was. The footer's headroom figure is the useful part in practice, since it tells you how much room is left for whatever processing comes next.\n\nWhat attenuation cannot do:\n\n- It does not change the dynamic range of the file, only its position, so a squashed mix stays squashed at a lower level.\n- It cannot fix uneven levels inside a recording, which needs a leveler or a compressor rather than a global gain.\n- Removing a large amount makes the noise floor and any quantisation at the bottom of the file more prominent in relative terms.\n- There is no metering beyond the peak figures, so loudness is not measured and perceived level is not reported.\n- The tool applies one figure to the whole file, with no automation and no way to reduce only part of it.\n- Reducing level does not restore the headroom that clipping already destroyed earlier in the chain.\n\nUse it whenever a file needs to sit lower without anything else changing: to make room in a mix, to prepare a track for a limiter that benefits from a little space above it, or to lower a source that is drowning everything else. Pick a figure, check the remaining headroom in the footer, and remember that if the goal is a specific loudness rather than a specific cut, a normalizer is the tool that measures its way there. One figure for the whole file is the point here; when only part of a recording needs to sit lower, the leveler is the tool that rides gain over time instead, and when only one side is too loud, the balance adjuster is the right instrument.",
    howTo: [
      { step: "Drop an audio file onto the panel or click to choose one." },
      { step: "Set the reduction with the slider, or press one of the presets at minus 3, minus 6, minus 10 or minus 20 decibels." },
      { step: "Run the pass and read the footer, which gives the new peak in dBFS and the headroom that remains." },
      { step: "Download the reduced WAV, named after the original with a reduced suffix." },
    ],
    whenToUse:
      "Volume Reducer is the precise attenuation tool, so it is the right answer when a file simply needs to be quieter by a known amount. {{volume-booster|Volume Booster}} does the opposite with an explicit peak strategy, and {{balance-adjuster|Balance Adjuster}} applies the same idea to one channel only when the problem is a leaning stereo image. When the level needs to be measured rather than guessed, {{loudness-normalizer|Loudness Normalizer}} targets a loudness figure directly, and {{audio-fade-in-out|Audio Fade In/Out}} shapes level over time rather than applying one constant.",
    faqs: [
      {
        q: "Why does the footer report headroom?",
        a: "Because after attenuating, the amount of space left below full scale is the figure that governs whatever comes next. A file with twelve decibels of headroom can be processed or boosted without much risk, while one with half a decibel is already sitting at the ceiling. It is a practical readout rather than a decorative one.",
      },
      {
        q: "Can reducing the volume fix a distorted recording?",
        a: "No. Clipping happens where the waveform was flattened, and turning the level down afterwards keeps the flattened shape at a lower level. The distortion is baked into the waveform geometry. Repairing it needs a declipping tool, and even then the harmonics that were destroyed cannot be recreated exactly.",
      },
      {
        q: "Is reducing level the same as normalizing?",
        a: "No. Normalizing measures the file and applies whatever gain is needed to hit a target, while this tool applies a fixed cut that you choose. Normalizing is the right approach when the finishing level matters, and a fixed reduction is right when you simply need the file to sit lower in relation to something else.",
      },
      {
        q: "Does a large reduction hurt the audio quality?",
        a: "Not in any way you would hear on a normal file. The samples are scaled by a constant, so the shape of the waveform is preserved exactly, and the WAV output is floating point before it is encoded. Very large cuts on an already quiet recording can bring the noise floor closer to audibility in relative terms, but that is a consequence of the content, not the process.",
      },
      {
        q: "Can I reduce only part of a file?",
        a: "Not here. One figure is applied across the whole file, so reducing a single section means splitting the audio first and running the tool on that part alone. For level that changes over time, the leveler is designed to ride the gain automatically instead.",
      },
    ],
  },

  "audio-leveler": {
    keywords: [
      "automatic gain",
      "target level",
      "slew",
      "rms",
    ],
    intro:
      "Audio Leveler rides the level of a recording slowly so that quiet and loud passages end up matched, without squashing transients the way a compressor does. Gain moves at a limited speed and is capped at a maximum.",
    content:
      "Drop a file, set the level you want it to settle at and the limits on how fast and how far the gain may move, then run the pass. The footer reports the gain range that was actually applied across the file, so you can see how much work the leveler did.\n\nWhat the panel gives you:\n\n- A target level from minus 30 to minus 12 dBFS in RMS terms, defaulting to minus 20.\n- A maximum gain from 6 to 30 decibels, defaulting to 18, which stops silence being amplified into a wall of noise.\n- A maximum speed from 6 to 60 decibels per second in steps of 3, defaulting to 24.\n- A footer reporting the gain range applied, from the smallest cut to the largest boost, together with the speed limit in use.\n- An output WAV named after the source with a leveled suffix, and a two channel limit.\n\nThe engine is a slow automatic gain control rather than a compressor. The signal is divided into hundred millisecond blocks, each block's RMS level is compared against the target, and the correction is applied as a gain that is allowed to change only at the rate you set, expressed in decibels per second. That slew limit is what makes the difference audible: a leveler glides while a compressor pumps, because the compressor reacts within milliseconds to individual peaks while this tool reacts over fractions of a second to the average. The gain is also capped, so a passage of silence or a very quiet room does not get boosted by the maximum amount and turn the noise floor into the loudest thing in the file. Verified behaviour is that the adjustments follow the slow trend of the material and that transients are left alone.\n\nWhat it does not do:\n\n- It responds to RMS rather than to peaks, so a recording with sudden spikes is levelled on average while the spikes remain.\n- A low maximum speed can lag behind fast changes in level, leaving the first words after a quiet section too quiet.\n- A high maximum speed starts to sound like compression, which defeats the point of using a leveler instead.\n- The capped gain means a section that is far below the target is brought up only part of the way.\n- It works on the file as a whole, so two speakers with very different voices may still need manual attention afterwards.\n- There is no visual gain curve, only the reported range, so the shape of the ride is not shown.\n\nUse it on the material where level drifts rather than on material where it is uneven bar by bar: lectures, interviews, voice memos and long recordings where someone leaned back from the microphone and then leaned in again. Start at the default target and speed, listen to the quietest and loudest passages, and lower the maximum speed if the ride is audible as it moves. Check the reported gain range too: a range that never exceeds a decibel or two means the file was already even and the pass changed almost nothing.",
    howTo: [
      { step: "Drop an audio file onto the panel; the tool processes up to two channels." },
      { step: "Set the target level in dBFS RMS, starting from the default of minus 20." },
      { step: "Adjust the maximum gain and the maximum speed, lowering the speed for a smoother ride." },
      { step: "Run the pass, read the applied gain range in the footer, then download the leveled WAV." },
    ],
    whenToUse:
      "Audio Leveler is the tool for level that drifts slowly over a long recording, which is a different problem from a mix that needs its dynamics controlled. {{loudness-normalizer|Loudness Normalizer}} applies one static gain to hit a measured loudness target, and {{rms-normalizer|Rms Normalizer}} does the same against an average level rather than a perceptual one. When the variation is bar to bar rather than minute to minute, {{audio-compressor|Audio Compressor}} reacts quickly enough to catch it, and {{multi-guest-leveler|Multi-Guest Leveler}} is the version built for balancing several speakers at once.",
    faqs: [
      {
        q: "How is a leveler different from a compressor?",
        a: "A compressor reacts to peaks within milliseconds and reduces the loud parts, while a leveler rides the average level over seconds and moves both up and down. The result is that a leveler matches quiet and loud passages without touching transients, and a compressor tightens dynamics. They solve different problems and often work together.",
      },
      {
        q: "What does the slew limit actually do?",
        a: "It caps how fast the gain is allowed to change, in decibels per second. Without it the leveler would jump to the correct gain immediately, which sounds like a compressor pumping. With a limit of 24 decibels per second at hundred millisecond blocks, the gain can move about 2.4 decibels per step, which glides rather than jumps.",
      },
      {
        q: "Why is there a maximum gain setting?",
        a: "Because silence is the quietest thing there is. Without a cap, a leveler would try to lift near silent passages all the way to the target and turn the noise floor into the loudest part of the recording. The cap lets you decide how much lift is acceptable and verified behaviour keeps the boost within it.",
      },
      {
        q: "Will it even out two different speakers?",
        a: "It will reduce the difference between them over time, since it responds to the running average rather than to individual words, but it will not make them match word for word. For a conversation where the balance between speakers matters, the multi guest leveler is built for exactly that job.",
      },
      {
        q: "Why does the beginning of my file sound too quiet?",
        a: "Because the gain is limited in how quickly it can change, so it takes a moment to reach the target when the file starts quietly. Lowering the speed makes this worse and raising it makes the ride more audible. If the opening matters, the cleanest fix is to trim or fade the first second rather than to chase it with speed.",
      },
    ],
  },

  "loudness-normalizer": {
    keywords: [
      "lufs",
      "integrated loudness",
      "true peak",
      "streaming",
    ],
    intro:
      "Loudness Normalizer measures a file's integrated loudness with the same standard platforms use, then applies one constant gain so it lands on the target you choose. It is the ingest normalisation a streaming service would apply, done locally first.",
    content:
      "Drop a file, pick a target and set a ceiling, then read the report. The footer shows the loudness before and after, the gain that was applied, and the resulting peak, so you can see whether the ceiling interfered with the calculation.\n\nThe controls:\n\n- Four target presets at minus 16 for podcasts, minus 14 for Spotify and YouTube, minus 23 for EBU R128 and minus 24 for ATSC A/85.\n- A target slider from minus 30 to minus 9 LUFS in single unit steps, defaulting to minus 14.\n- A true peak ceiling from minus 6 to zero dBFS in half decibel steps, defaulting to minus 1.\n- A footer reporting the before and after loudness, the gain applied and the final peak level.\n- An output WAV named after the source with a lufs suffix, limited to two channels.\n\nThe measurement is ITU-R BS.1770-4 integrated loudness, the same standard a platform applies at ingest, including its gating so that silence and very quiet passages cannot pull the reading down. The gain that follows is a single constant factor applied jointly across the channels, which is deliberate: because every channel is scaled by the same number, the stereo balance is untouched and only the level changes. A hot master gets turned down and a quiet mix gets turned up, exactly as a service would do, but here you see the numbers and decide the target. The ceiling exists because loudness and true peak are different things: a file can be far below the loudness target and still have peaks near the rail, in which case the requested gain would push it over. When that happens the report says so explicitly, naming the gain that was applied and the gain that would have been wanted. A silent file is reported as such rather than being scaled by zero.\n\nWhat it cannot do:\n\n- It changes level only, so a squashed master arrives at the target still squashed; dynamics are untouched by design.\n- The gain is constant for the whole file, so loudness that varies inside a recording is not corrected.\n- When the ceiling limits the gain, the file lands short of the target, and the report is the only place that tells you.\n- It measures rather than models, so a file with unusual content may read differently from another tool's estimate of the same material.\n- Only two channels are accepted, so multichannel material is out of scope.\n- There is no limiter in the chain, so a very dynamic file cannot be squeezed to hit a loud target without a separate limiting step.\n\nUse it when a file needs to arrive at a streaming platform already at the level that platform will use, because then its own normalisation has nothing left to do. Check the report for the ceiling case, since that is the one outcome where the file does not reach the target, and follow with a limiter if the peaks are what is standing in the way. Leaving the ceiling at minus 1 also keeps room for the overshoot a lossy encoder can add afterwards.",
    howTo: [
      { step: "Drop an audio file onto the panel; the tool accepts up to two channels." },
      { step: "Choose a target from the presets, or set your own value anywhere from minus 30 to minus 9 LUFS." },
      { step: "Set the true peak ceiling, leaving the default of minus 1 dBFS unless a platform asks for something else." },
      { step: "Read the before and after loudness in the footer and note any ceiling warning, then download the normalised WAV." },
    ],
    whenToUse:
      "Loudness Normalizer is the tool when a file has to arrive at a specific loudness, which makes it the right finish for anything headed to a streaming service. {{loudness-meter-lufs|Loudness Meter (LUFS)}} measures without changing anything, which is the right first step when you only want to know where a file stands, and {{rms-normalizer|Rms Normalizer}} targets an average level instead of a perceptual one. When the ceiling is what prevents the target being reached, {{true-peak-meter|True Peak Meter}} explains why, and {{streaming-platform-loudness-guide|Streaming Platform Loudness Guide}} documents what each service does with the result.",
    faqs: [
      {
        q: "Why does the loudness measurement use gating?",
        a: "Because a straightforward average would be dominated by the quietest parts of a file. The standard applies an absolute gate so near silence is ignored and a relative gate so quiet passages well below the main programme are excluded, which is why the integrated figure reflects the loud parts. That is the same method platforms use at ingest.",
      },
      {
        q: "What happens if the ceiling blocks the gain?",
        a: "The file lands short of the loudness target and the footer tells you so, naming the gain applied and the gain that was wanted. That happens when a file has peaks close to the rail and needs to be turned up. The fix is to bring the peaks down with a limiter first, then normalise again.",
      },
      {
        q: "Does normalising change the dynamics?",
        a: "No. The gain is one constant factor applied to every sample jointly across the channels, so the shape of the waveform is unchanged and only its level moves. Perceived dynamics are identical. If you want the file denser rather than merely louder, that is a compression job before the normalise.",
      },
      {
        q: "Which target should I choose?",
        a: "Match the destination. Podcast distribution generally expects about minus 16 LUFS, Spotify and YouTube work to about minus 14, and broadcast standards are much lower at minus 23 in Europe and minus 24 for the American standard. The presets name each of those so the choice is explicit.",
      },
      {
        q: "Why is stereo balance preserved?",
        a: "Because a single joint gain is computed for the whole file and applied identically to every channel. If each channel were normalised separately, a slightly louder left channel would be pulled down more than the right and the image would shift. Measuring jointly avoids that entirely.",
      },
    ],
  },

  "peak-limiter": {
    keywords: [
      "lookahead",
      "ceiling",
      "gain reduction",
      "brick wall",
    ],
    intro:
      "Peak Limiter holds the loudest moments of a file under a ceiling you set, using lookahead so the gain is already reduced when the peak arrives. It is the general purpose limiter: you choose how far ahead it listens and how quickly it lets go.",
    content:
      "Drop a file, set the ceiling, decide how much lookahead to give the detector and how fast the gain should recover, then read the report. The footer gives the peak before and after, the ceiling in force and the total gain reduction applied.\n\nThe controls:\n\n- A ceiling from minus 12 to zero dBFS in half decibel steps, defaulting to minus 1.\n- A lookahead from 1 to 20 milliseconds in single millisecond steps, defaulting to 5.\n- A release from 10 to 500 milliseconds in steps of 10, defaulting to 60.\n- A report line quoting the peak before and after the pass, the ceiling and the gain reduction in decibels.\n- An output WAV named after the source with a limited suffix.\n\nThe engine is a lookahead brick wall limiter. The signal is delayed by the lookahead time while the detector looks at what is coming, and the gain that is computed when a peak is spotted is held in a ring buffer aligned to that exact delay, so a peak always receives the gain that was calculated for it rather than a gain computed a moment too late. That is what prevents overshoot: a limiter without lookahead has to react after the transient has already passed the ceiling, and the result is either an overshoot or a distortion known as clipping something that only happens in the moment. Release controls how quickly the gain returns to unity after each peak, and it is the control that shapes the character of the result: a fast release restores level quickly and can sound pumped on dense material, while a slow release holds the level down longer and sounds smoother but reduces more overall. The report's gain reduction figure is the difference between the peak before and after, which is the honest measure of how hard the limiter worked.\n\nWhere limiting is the wrong answer:\n\n- It does not raise the average level unless the peaks are what was holding it back, so a quiet file stays quiet after limiting.\n- Limiting is transparent only up to a point; several decibels of gain reduction on a dense mix becomes audible as a loss of punch.\n- A very short lookahead and a fast release can add audible distortion on low frequency content, because the gain itself is changing quickly.\n- It works on sample peaks, so true inter sample peaks are not modelled by the setting here.\n- The limiter has no makeup gain control, so the output is simply quieter rather than louder after a heavy pass.\n- Long lookahead values delay the audio, which matters when the file has to line up with something else.\n\nUse it as the final stage before delivery, when the job is to guarantee that nothing exceeds a stated line. Set the ceiling for the destination, give the detector a few milliseconds of lookahead, and choose a release that suits the density of the material: shorter for sparse speech, longer for a dense mix that would otherwise pump. Read the before and after peak figures together, because a large drop with an unchanged character usually means the ceiling was set lower than the material actually needed.",
    howTo: [
      { step: "Drop an audio file onto the panel or click to choose one from disk." },
      { step: "Set the ceiling you need the output to stay under, starting from minus 1 dBFS." },
      { step: "Choose a lookahead in milliseconds, longer being safer but delaying the audio further." },
      { step: "Pick a release that suits the material, run the pass and read the gain reduction in the footer." },
    ],
    whenToUse:
      "Peak Limiter is the everyday tool for keeping peaks under a line without squashing the whole file. {{brickwall-limiter|Brickwall Limiter}} is the same engine with three delivery presets, which is the faster route when the ceiling is a platform standard. When the goal is a loudness figure rather than a peak figure, {{loudness-normalizer|Loudness Normalizer}} measures and targets loudness directly, and when the problem is peaks that are already flattened rather than peaks that need holding, {{clipping-distortion-remover|Clipping Distortion Remover}} rebuilds them.",
    faqs: [
      {
        q: "What does lookahead do?",
        a: "It delays the audio while the detector examines what is coming, so the gain reduction is already in place when the peak reaches the output. Without it a limiter has to react after the fact, which either overshoots the ceiling or introduces distortion. Longer lookahead is safer at the cost of additional delay on the file.",
      },
      {
        q: "How much gain reduction is too much?",
        a: "There is no fixed number, but the more the limiter pulls, the more obvious it becomes. A decibel or two on occasional peaks is inaudible on most material, while continuous reduction of several decibels changes the punch of a mix. If the report shows heavy reduction across the whole file, the level should come down before limiting rather than after.",
      },
      {
        q: "Why does my bass sound different after limiting?",
        a: "Because low frequency content interacts badly with fast gain changes. A short lookahead with a quick release can make the gain itself fluctuate within a cycle of a low note, which produces distortion. Slower release and a slightly longer lookahead usually clear it up.",
      },
      {
        q: "Does limiting make the file louder?",
        a: "Not by itself. It only reduces peaks, so the output is at or below the input level. What makes a file louder is combining the reduced peaks with a gain increase, which is how the normaliser and limiter are used together: control the peaks first, then raise the level into the space you created.",
      },
      {
        q: "Is this the same as a brickwall limiter?",
        a: "The engine is identical, a lookahead brick wall. The difference is the interface: this tool exposes the ceiling, lookahead and release directly so you choose every value, while the brickwall version leads with three delivery presets and a single lookahead control.",
      },
    ],
  },

  "rms-normalizer": {
    keywords: [
      "rms",
      "static gain",
      "peak ceiling",
      "broadcast",
    ],
    intro:
      "RMS Normalizer applies one static gain so a file's average level lands on the target you choose, with a peak ceiling that honestly reports when it had to stop short. It is the classic broadcast style of normalising.",
    content:
      "Drop a file, set the target average level and a ceiling, then read the report. The footer gives the level before and after in dBFS, the gain applied and a note when the ceiling prevented the target from being reached.\n\nThe controls and the readout:\n\n- A target RMS from minus 30 to minus 9 dBFS in single decibel steps, defaulting to minus 18.\n- A peak ceiling from minus 6 to zero dBFS in half decibel steps, defaulting to minus 1.\n- A footer reporting the measured level before and after the pass, the gain applied and whether the ceiling interfered.\n- An output WAV named after the source with an rms suffix, limited to two channels.\n- Guidance in the panel noting that very peaky material may hit the ceiling before it reaches the target.\n\nThe measurement is taken jointly across the channels: every channel's squared samples are summed and divided by the total sample count before the square root is taken, so the figure describes the file rather than one side of it, and the worst case peak is tracked at the same time. The gain that follows is a single static gain, chosen as whichever is smaller between the gain needed to reach the target and the gain that would push the peak past the ceiling. That second condition is the honest part: rather than quietly overshooting in order to hit the number, the tool stops at the ceiling and the report says so, naming both the target it wanted and the ceiling that intervened. Because RMS is an average, it responds to how much energy is present rather than to how loud the material sounds, which is why it is brighter and more percussive content that tends to trip the ceiling first. The perceptual alternative is the loudness normaliser, which weights the measurement the way hearing does and applies gating as well.\n\nWhat RMS normalising does not give you:\n\n- RMS is not a perceptual measure, so two files normalised to the same RMS can sound noticeably different in loudness.\n- A file with sharp transients will hit the ceiling and land below the target, which is common on percussive material.\n- The gain is constant, so level variation inside the recording is not addressed at all.\n- It does not change dynamics; a compressed file stays compressed at its new level.\n- There is no limiter, so the ceiling is respected by reducing the gain, not by controlling the peaks.\n- Only two channels are accepted, and a mono file is measured on its single channel.\n\nUse it when a consistent average level matters more than a perceived loudness figure, which is the case in a lot of broadcast-adjacent work and when matching a set of files to each other. Watch for the ceiling note in the footer: if it appears often, either the target is too ambitious for the material or the peaks need controlling before the level is raised. A useful habit is to check the result with a loudness meter as well, since two files at the same average level can still feel different in loudness.",
    howTo: [
      { step: "Drop an audio file onto the panel; the tool accepts up to two channels." },
      { step: "Set the target RMS level, starting from the default of minus 18 dBFS." },
      { step: "Set a peak ceiling so the static gain cannot push the output into clipping." },
      { step: "Run the pass and read the footer, noting whether the ceiling limited the gain, then download the normalised WAV." },
    ],
    whenToUse:
      "RMS Normalizer suits work where a consistent average level is the goal, such as matching a series of files to each other. {{loudness-normalizer|Loudness Normalizer}} is the perceptual equivalent and the one to use when a streaming platform is the destination, and {{audio-normalizer|Audio Normalizer}} covers the simple peak based approach. When the reason the target is missed is that the level drifts within the file, {{audio-leveler|Audio Leveler}} is the tool that fixes that first.",
    faqs: [
      {
        q: "What does RMS actually measure?",
        a: "It is the root mean square of the samples, which for a waveform is a measure of average energy. It responds to how much signal is present rather than to peaks, so a dense mix and a sparse one can share an RMS figure while sounding quite different in loudness. That is why it is used for consistency rather than for perceptual matching.",
      },
      {
        q: "Why did my file not reach the target?",
        a: "Because the peak ceiling stopped it. The tool computes the smaller of two gains, the one that reaches the target and the one that keeps the peak under the ceiling, and applies whichever is smaller. When the ceiling wins, the footer says so and names the ceiling that intervened. Bringing the peaks down first lets the level come up further.",
      },
      {
        q: "Is this the same as peak normalising?",
        a: "No. Peak normalising targets the loudest sample, so it guarantees no clipping but says nothing about average loudness. RMS normalising targets the average, which is a better match for how loud a file feels, at the cost of needing a ceiling to stay safe.",
      },
      {
        q: "Why does it measure the channels jointly?",
        a: "So that a stereo file is treated as one thing rather than as two independent channels. Measuring jointly and applying one gain to both preserves the balance between the sides, and it also prevents a quiet channel from being boosted much further than a loud one, which would distort the image.",
      },
      {
        q: "Should I use this or the LUFS normaliser?",
        a: "The LUFS tool if the destination is a streaming service, because that is the measurement those platforms use. This one if the goal is a consistent average across a set of files, or if you specifically want the broadcast-style method. The two can give different results on the same file by a couple of decibels, which is expected.",
      },
    ],
  },

  "dynamic-range-compressor": {
    keywords: [
      "compression",
      "ratio",
      "attack",
      "make-up gain",
    ],
    intro:
      "Dynamic Range Compressor narrows the gap between the loud and quiet parts of a recording, and leads with three presets rather than a wall of controls. The panel shows the actual curve numbers behind each preset instead of hiding them.",
    content:
      "Drop a file, choose a preset and read the parameter line beneath it, which states the ratio, threshold, knee, attack, release and make-up gain in full. Running the pass returns a new file plus a report comparing the average level before and after.\n\nWhat each preset is set to:\n\n- Vocal leveler at 3 to 1 above minus 24 dBFS, with an 8 decibel knee, 10 millisecond attack, 150 millisecond release and plus 4 decibels of make-up gain.\n- Drum punch at 6 to 1 above minus 18 dBFS, with a 3 decibel knee, 25 millisecond attack, 100 millisecond release and plus 3 decibels make-up.\n- Broadcast at 4 to 1 above minus 20 dBFS, with a 6 decibel knee, 5 millisecond attack, 120 millisecond release and plus 5 decibels make-up.\n- A report line giving the average level before and after, the ratio and threshold in force, and a short description of the intended character.\n- An output WAV named after the source with a compressed suffix.\n\nThe engine uses a windowed RMS detector, a soft knee and gain smoothing rather than hard switching. An RMS detector responds to the energy in a window rather than to individual samples, which is what makes the result sound like levelling rather than like distortion. The soft knee means the transition into compression is gradual across a band around the threshold, so material that sits near the threshold does not switch between compressed and uncompressed states. Attack and release shape the gain over time, and the smoothing in the gain path is what keeps the changes from producing clicks. The make-up gain compensates for the level that compression removed, which is why the report's after figure is usually close to the before figure even though the dynamic range has narrowed. The drum preset deliberately uses a slower attack so the initial transient survives the compression and the body behind it gets denser.\n\nWhat compression does not do:\n\n- It reduces dynamic range rather than raising loudness; the level only rises because of the make-up gain that follows.\n- It cannot make a recording sound better than it is, and on already compressed material it mostly removes what little dynamic range remains.\n- The presets are starting points rather than settings matched to your file, and there is no preview to hear the curve before committing.\n- A compressor reacts to level, not to quality, so a noisy quiet passage gets boosted along with everything else once make-up gain is applied.\n- Three presets is not a full compressor: there is no sidechain, no band splitting and no per channel linking control here.\n- No metering of gain reduction is shown while setting up, only the average level change in the report afterwards.\n\nUse it to even out a voice before a podcast mix, to add density to a drum bus, or to make a spoken word recording sit at a consistent level for broadcast. Read the parameter line rather than trusting the preset name, because it tells you exactly what the curve is doing, and remember that compressing and then normalising is the usual order when the goal is a loud, controlled result.",
    howTo: [
      { step: "Drop an audio file onto the panel or click to choose one from disk." },
      { step: "Choose one of the three presets and read the parameter line to see the ratio, threshold and timings behind it." },
      { step: "Run the pass and compare the average level reported before and after compression." },
      { step: "Download the compressed WAV, and follow with a normaliser if the file needs to hit a specific loudness." },
    ],
    whenToUse:
      "Dynamic Range Compressor is the preset-led route into compression, which suits anyone who wants a known result rather than a parameter hunt. {{audio-compressor|Audio Compressor}} exposes the same idea as raw controls, and {{multiband-compressor|Multiband Compressor}} splits the signal so a boomy low end can be controlled without touching the top. When the aim is transparency rather than density, {{audio-leveler|Audio Leveler}} rides the level slowly instead, and {{parallel-compressor|Parallel Compressor}} keeps the original punch underneath a compressed layer.",
    faqs: [
      {
        q: "What does the ratio mean?",
        a: "It describes how much the level above the threshold is reduced. At 3 to 1, every 3 decibels above the threshold becomes 1 decibel at the output, so the excess is cut by two thirds. At 6 to 1 the reduction is stronger, which is why the drum preset feels more controlled than the vocal one.",
      },
      {
        q: "Why does attack time change the character so much?",
        a: "Because it decides how much of a transient survives before the gain comes down. A 25 millisecond attack lets the initial hit of a drum through before compressing the body, which is what gives the drum preset its punch. A 5 millisecond attack catches the transient too, which is what broadcast speech wants.",
      },
      {
        q: "What is a soft knee?",
        a: "It is a band around the threshold where compression is applied gradually rather than all at once. Without it, material hovering near the threshold switches between compressed and uncompressed, which is audible as a lurch. With a knee of 3 to 8 decibels the transition is smooth.",
      },
      {
        q: "Does make-up gain change the dynamics?",
        a: "No. It is a constant gain applied after compression, so it moves the whole file up without altering the reduced dynamic range. It exists because compression lowers the peak level, and without it the result would simply be quieter than the input rather than denser.",
      },
      {
        q: "Why does the after figure look similar to the before figure?",
        a: "Because the make-up gain is chosen to bring the average level back. What has changed is not the overall level but the distance between the loud and quiet parts, which is exactly what compression is for. If the two figures look identical, the preset is behaving as intended rather than doing nothing.",
      },
    ],
  },

  "multiband-compressor": {
    keywords: [
      "crossover",
      "bands",
      "threshold",
      "reconstruction",
    ],
    intro:
      "Multiband Compressor splits a file into low, mid and high bands and compresses each one separately, so a boomy bass can be controlled without dulling the top. The crossover is mathematically complementary, so the bands sum back to the input exactly.",
    content:
      "Drop a file, choose where the bands divide and set a shared threshold and ratio, then read the report. The footer names the two crossover frequencies and gives the average level change per channel, so you can see how much each pass moved.\n\nWhat the panel gives you:\n\n- A low to mid crossover from 80 to 800 hertz in steps of 10, defaulting to 250.\n- A mid to high crossover from 1000 to 8000 hertz in steps of 100, defaulting to 2500.\n- A threshold from minus 48 to minus 6 dBFS in single decibel steps, applied to all three bands.\n- A ratio from 1 to 10 in half steps, defaulting to 3, again shared across the bands.\n- A footer naming both crossover frequencies and reporting the average level change per channel.\n\nThe signal is divided once, each band is compressed in place with the shared threshold and a 3 decibel knee, and the three are summed back together. The crossover is designed to be complementary, which means that with the ratio at 1 to 1, where no compression happens at all, the sum of the three bands reproduces the input exactly. That property is what makes the tool trustworthy: the reconstruction of the three bands is exact at a ratio of unity, so any change in the sound comes from the compression rather than from the filtering. Each band's gain moves only when that band's own level demands it, which is the whole point of the approach. A bass that booms while the vocal is steady gets pulled down only in the low band, and the vocal is untouched. Fixed attack and release times of 5 and 120 milliseconds keep the bands from fighting one another, and no make-up gain is applied by default, so the report's level change reflects the compression honestly rather than the compensation. Only two channels are accepted.\n\nWhat it does not give you:\n\n- The threshold and ratio are shared, so a per band threshold is not available and quiet bands are compressed by the same rule as loud ones.\n- There is no make-up gain, so a heavily compressed result is simply quieter and has to be raised afterwards.\n- Only three bands exist, and the crossovers are moved rather than added, so this is not a full band-splitting chain.\n- Attack and release are fixed and not exposed, so the response time cannot be tuned to the material.\n- Gain reduction is not metered per band, so the only feedback is the average level change in the footer.\n- It cannot correct a tonal imbalance that is static; that is a job for the equaliser rather than for a compressor.\n\nUse it when one region of the spectrum is the problem: a low end that moves too much, a midrange that gets shouty, or a top end that spikes. Set the crossovers around the region in question rather than at arbitrary round numbers, bring the ratio up from unity until the movement settles, and check that the result still sounds like the original performance rather than a compressed version of it. If the whole file needs control rather than one band, the single band compressor is the simpler tool.",
    howTo: [
      { step: "Drop an audio file onto the panel; the tool accepts up to two channels." },
      { step: "Set the low to mid and mid to high crossovers around the region you want to control." },
      { step: "Set the threshold and ratio, starting from the defaults and raising the ratio until the movement settles." },
      { step: "Read the reported level change per channel, then download the multiband processed WAV." },
    ],
    whenToUse:
      "Multiband Compressor is the tool for a problem that lives in one part of the spectrum, which makes it the first choice for a boomy low end or a spiky top. {{dynamic-range-compressor|Dynamic Range Compressor}} is the single band alternative when the whole file needs controlling, and {{equalizer|Equalizer}} is the right tool for a tonal imbalance that never changes. When the specific concern is low frequency weight rather than low frequency movement, {{bass-booster|Bass Booster}} shapes it with a shelf instead.",
    faqs: [
      {
        q: "Why does the crossover matter so much?",
        a: "Because it decides which content ends up in which band, and therefore what each compressor is reacting to. A low to mid crossover at 250 hertz puts everything below the bass region, while moving it to 500 hertz pulls in the lower parts of voices and instruments. Setting it around the problem region is what makes the tool useful.",
      },
      {
        q: "Is the band split lossless?",
        a: "Yes, in the sense that matters. The crossover is complementary, so with the ratio at 1 to 1 the three bands sum back to the exact input. That means any change in the sound comes from the compression rather than from the filtering, which is verified behaviour rather than an assumption.",
      },
      {
        q: "Why is the threshold shared across all bands?",
        a: "It keeps the interface to one decision per parameter and is a deliberate simplification. The consequence is that a quiet band and a loud band are judged against the same level, so the loudest band does most of the work unless the crossovers isolate the problem well. A per band threshold would be more precise but also more to set up.",
      },
      {
        q: "Why is there no make-up gain?",
        a: "So the reported level change reflects the compression honestly rather than the compensation. Without make-up gain a heavily compressed result comes back quieter, and the footer figure tells you by how much. Raising the level afterwards with a normaliser or an amplifier keeps the two decisions separate.",
      },
      {
        q: "Can this fix a harsh vocal?",
        a: "Partly. If the harshness is a level problem in the upper midrange, moving the low to mid crossover up and compressing the mid band will reduce it. If it is a fixed tonal characteristic of the voice, no compressor will help and the equaliser is where the cutting belongs.",
      },
    ],
  },

  "parallel-compressor": {
    keywords: [
      "parallel compression",
      "blend",
      "dry signal",
      "sustain",
    ],
    intro:
      "Parallel Compressor blends a heavily compressed copy underneath the untouched original, so detail and sustain come up while the punch of the dry signal stays. It is the classic technique for drums, and it works on voices and bus mixes too.",
    content:
      "Drop a file, set how much of the compressed layer to blend in and how aggressive that layer should be, then read the report. The footer states the ratio and threshold used for the layer and the blend percentage, so the two halves of the decision are both on record.\n\nThe controls:\n\n- A blend control from 0 to 100 percent in steps of 5, defaulting to 40, with the remainder staying dry.\n- A compressor threshold from minus 48 to minus 12 dBFS in single decibel steps, defaulting to minus 28.\n- A compressor ratio from 2 to 20 in single steps, defaulting to 8.\n- An internal compressed layer fixed at a 3 decibel knee, plus 6 decibels of make-up gain, 3 millisecond attack and 80 millisecond release.\n- A report line naming the ratio, threshold and blend, plus the dry share as a percentage.\n- An output WAV named after the source with a parallel suffix, limited to two channels.\n\nParallel compression works because the two halves do different jobs. The compressed layer is deliberately aggressive, with a low threshold and a high ratio, so quiet detail behind the main hits is lifted heavily in relative terms and sustains longer. Blending it under the untouched original at a partial level means the transient information that a heavy compression pass would have softened is still present in full, because the dry signal carries it unchanged. The result is denser without being flatter, which is why the approach is associated with drums, where both attack and body matter. Blend is the control that decides the character: at a low percentage the compressed layer adds a little support beneath the original, while at 50 percent or more the density becomes the dominant quality. The compressor in the layer is fixed at its own attack, release and make-up settings on purpose, because the only thing worth tuning is how hard it works and how much of it you hear.\n\nWhat the blend cannot do:\n\n- It raises the level as well as the density, so the sum of two layers can exceed full scale and there is no limiter to stop it.\n- A high blend percentage on already compressed material simply adds more compression and little else.\n- The dry layer is untouched, so any problem in the original, including noise, comes through at full level.\n- The internal compressor's attack, release and knee are fixed, so the layer's character cannot be tuned beyond its threshold and ratio.\n- There is no metering, so the only guide to how much the layer is working is the blend percentage you set.\n- It works on the whole file, so it cannot apply the technique to one element inside a mix.\n\nUse it when the goal is density rather than control: a drum bus that needs more body, a vocal that needs to sit forward without sounding squashed, or a mix that needs weight without losing its punch. Start at the default blend, listen for whether the result is denser in the right way, and remember that the level will have risen, so normalising afterwards is the usual last step.",
    howTo: [
      { step: "Drop an audio file onto the panel; the tool accepts up to two channels." },
      { step: "Set how hard the internal compressor works by choosing a threshold and a ratio for the compressed layer." },
      { step: "Blend the compressed layer in, starting from the default of 40 percent and adjusting from there." },
      { step: "Read the reported blend and settings, then download the parallel processed WAV." },
    ],
    whenToUse:
      "Parallel Compressor is the tool for adding density while keeping transients, which makes it a natural fit for drums and for vocals that need presence. {{dynamic-range-compressor|Dynamic Range Compressor}} is the direct route when you want the compression itself to be audible in the main path, and {{audio-compressor|Audio Compressor}} exposes the raw controls. When the aim is to keep a music bed out of the way of a voice rather than to add density, {{sidechain-compressor|Sidechain Compressor}} is the tool built for that instead.",
    faqs: [
      {
        q: "Why compress a copy instead of the original?",
        a: "Because the original then keeps its transients intact. The compressed layer is extremely dense and lifts quiet detail, while the dry copy carries the attack. Summed together, you hear both. Compressing the original directly would give the density without preserving the punch, which is a different sound.",
      },
      {
        q: "What blend percentage should I start with?",
        a: "The default of 40 percent is a sensible middle. Drums usually take more, somewhere between 30 and 50 percent, while vocals want less because the density competes with intelligibility. Anything above about 50 percent makes the compressed layer the dominant sound rather than a support beneath the original.",
      },
      {
        q: "Why is the internal compressor so aggressive?",
        a: "Because its job is to be a dense layer rather than a transparent processor. A threshold of minus 28 dBFS with an 8 to 1 ratio and 6 decibels of make-up gain makes it work hard on purpose, so that its quiet detail sits high enough to be heard when blended under the original. Tuning it to be gentle would defeat the technique.",
      },
      {
        q: "Will the output be louder than the input?",
        a: "Yes, and that is expected, since two layers are being summed. There is no limiter in the chain, so a high blend on already hot material can exceed full scale. Check the level after the pass and normalise or limit as needed rather than assuming the result is safe.",
      },
      {
        q: "Does it work on spoken word?",
        a: "It can, with restraint. A small blend adds body to a dry voice without making it sound compressed, which is useful in podcast work. The catch is that the compressed layer also raises the noise floor between words, so on a noisy recording the effect can be counterproductive.",
      },
    ],
  },

  "sidechain-compressor": {
    keywords: [
      "sidechain",
      "ducking",
      "program",
      "lookahead",
    ],
    intro:
      "Sidechain Compressor ducks one audio file whenever a second file is playing, and mixes the two together. Feed music as the program and a voice as the trigger, and the music steps out of the way automatically.",
    content:
      "Load two files into the two slots, set how far the program should be ducked and how quickly it should return, then create the mix. The result is a single file containing the ducked program with the trigger signal mixed on top, and the report states the duck depth, threshold and lookahead used.\n\nThe controls and slots:\n\n- A program slot for the audio that gets ducked, and a sidechain slot for the audio that triggers the ducking.\n- A threshold from minus 60 to minus 6 dBFS in single decibel steps, defaulting to minus 30, above which the trigger acts.\n- A duck range from 0 to 24 decibels, defaulting to 9, which caps how far the program is pulled down.\n- An attack from 1 to 100 milliseconds and a release from 50 to 1000 milliseconds in steps of 10.\n- A lookahead from 0 to 20 milliseconds, and a safety limiter on the summed output at minus 1 dBFS, enabled by default.\n\nThe tool mixes both files down to mono, pads the shorter one with silence so the two line up from their starts, and then applies gain to the program based on the trigger's level. The duck depth is referenced to the threshold: when the trigger rises above it, the program's gain is pulled down by up to the range you set, and the gain is smoothed by the attack and release times so the movement is not abrupt. Lookahead delays the program by a few milliseconds so that the duck is already at full depth when the trigger's transient arrives, which is what prevents the first syllable of a word clipping through unducked. The two files must share a sample rate, and the tool refuses the pair rather than resampling silently if they do not, naming both rates in the error. Because the output is a mix rather than two files, the effective result is a finished ducked piece rather than a gain curve you can apply elsewhere. The safety limiter protects the sum, since adding two signals can exceed full scale.\n\nWhere it is the wrong tool:\n\n- It requires both files to share a sample rate, so mismatched material must be converted first.\n- Both inputs are mixed to mono, so anything genuinely stereo in the program loses its image.\n- The duck is a single gain over the program, so it cannot duck only the midrange and leave the bass alone.\n- The output is the summed mix, so there is no way to export the ducking gain on its own.\n- A long release that suits speech will sound sluggish on percussive triggers.\n- The two clips are aligned from their starts, with no offset control, so a voice that begins later in the program is handled by silence rather than by timing.\n\nUse it for the everyday voice-over-music problem: a podcast bed, a radio spot, or an interview mixed over an intro. Set the threshold a few decibels below the voice's average, choose a duck range that clears enough space without making the music disappear, and leave the safety limiter on unless you are deliberately mixing hot.",
    howTo: [
      { step: "Load the program into the first slot, which is the audio that will be ducked, and the trigger into the second." },
      { step: "Set the threshold below the trigger's average level, and a duck range that clears enough space for it." },
      { step: "Choose attack, release and lookahead times, using the lookahead so the duck is ready before each word." },
      { step: "Keep the safety limiter on, then create the ducking mix and download the summed WAV." },
    ],
    whenToUse:
      "Sidechain Compressor is for the case where one sound has to make room for another automatically, which is the standard voice over music problem. {{audio-compressor|Audio Compressor}} is the ordinary dynamics tool when there is only one signal to control, and {{parallel-compressor|Parallel Compressor}} adds density rather than creating space. When the two sources simply need to be heard in sequence, {{audio-joiner|Audio Joiner}} is the tool for placing them end to end, and {{loudness-normalizer|Loudness Normalizer}} finishes the result at a delivery level.",
    faqs: [
      {
        q: "Which file goes in which slot?",
        a: "The program slot takes the audio that should get out of the way, typically music. The sidechain slot takes the audio that should trigger the ducking, typically a voice. They are not interchangeable: putting them the wrong way round ducks the voice every time the music plays, which is the opposite of what is usually wanted.",
      },
      {
        q: "Why do both files need the same sample rate?",
        a: "Because the duck is computed sample by sample against the trigger's level. If the two files run at different rates there is no honest way to line them up, so the tool refuses the pair and tells you both rates rather than resampling behind your back and producing something subtly wrong.",
      },
      {
        q: "What does the lookahead prevent?",
        a: "It prevents the first syllable of a word from poking through unducked. The program is delayed by the lookahead amount while the gain change is computed ahead of time, so the duck reaches full depth before the trigger's transient actually arrives at the output. Without it, beginnings of words clip over the music.",
      },
      {
        q: "Why is there a safety limiter?",
        a: "Because the output is a sum of two signals and adding them can exceed full scale even when neither was loud on its own. The limiter sits at minus 1 dBFS on the mix and is on by default. Turning it off is possible if you intend to process the sum further, but then the level is your responsibility.",
      },
      {
        q: "Can I export just the ducked music without the voice?",
        a: "No. The output is the summed mix of the ducked program and the trigger, which is the finished ducked piece. If you need the music alone with the ducking applied, the practical route is to keep the two sources separate and apply the level change yourself in an editor.",
      },
    ],
  },

  "brickwall-limiter": {
    keywords: [
      "brick wall",
      "ceiling",
      "headroom",
      "mastering",
    ],
    intro:
      "Brickwall Limiter is the final-safety version of a limiter, built around three delivery presets instead of a wall of parameters. The output never crosses the ceiling, whatever happens upstream.",
    content:
      "Drop a file, choose the preset that matches your delivery, and adjust the lookahead if you want more safety margin. The report gives the peak before and after, the ceiling that was enforced and a plain description of what the preset is for.\n\nThe three presets:\n\n- Transparent, with a ceiling of minus 1 dBFS and an 80 millisecond release, leaving a decibel of headroom and staying inaudible on most material.\n- Loud for streaming, at minus 0.3 dBFS with a 40 millisecond release, which is the ceiling most services expect for delivery.\n- Hard digital, at zero dBFS with a 20 millisecond release, where nothing at all passes above the line and recovery is fastest.\n- A lookahead control from 1 to 20 milliseconds, defaulting to 5, shared by all three presets.\n- A report line giving the peak before and after the pass, the ceiling in force and the preset's description.\n\nThe engine is the same lookahead brick wall used by the peak limiter, with the signal delayed while the detector looks ahead and the computed gain held in a ring buffer aligned to that delay. That alignment is what makes the brick wall claim literal: because the gain for a peak is already in place when the peak reaches the output, overshoot is not possible, and the ceiling is a property of the output rather than an aspiration. The presets differ in ceiling and release, which is where the character comes from. A minus 1 dBFS ceiling with a slow release is the conservative choice for material that has to survive a lossy encode, since encoders can overshoot what the file itself did. The minus 0.3 preset matches the common streaming delivery recommendation. Zero dBFS is the mathematically tightest line, and with the fastest release it is also the most likely to sound worked on. Because the tool is a limiter, it only reduces peaks; it does not raise the level of the file.\n\nWhat a brick wall does not give you:\n\n- It cannot make a file louder, only quieter at the peaks, so a quiet master stays quiet after the pass.\n- A really low ceiling with a fast release will audibly change dense material, particularly bass.\n- The ceiling applies to sample peaks, so inter sample overshoot is not specifically modelled.\n- Only three presets exist, with no separate control of release outside them.\n- It is not a loudness tool, so it says nothing about where the file lands against a platform target.\n- It cannot undo peaks that were already clipped before the file reached it.\n\nUse it as the last stage of any chain, when the requirement is simply that nothing exceeds a stated line. The transparent preset is the safe default for anything that will be encoded to a lossy format afterwards, and for mastering deliveries where the level was set earlier in the chain, the streaming preset matches what most services expect, and the hard digital preset is for situations where the deliverable spec literally says zero. If the file also needs to reach a loudness figure, normalise first and limit afterwards.",
    howTo: [
      { step: "Drop an audio file onto the panel or click to choose one from disk." },
      { step: "Choose the preset that matches the delivery: transparent, loud for streaming, or hard digital." },
      { step: "Adjust the lookahead if you want a wider safety margin before each peak." },
      { step: "Run the pass, check the peak figures in the report, and download the brickwalled WAV." },
    ],
    whenToUse:
      "Brickwall Limiter is the delivery-ceiling tool, so it belongs at the end of a chain rather than in the middle of one. {{peak-limiter|Peak Limiter}} is the same engine with direct control of the ceiling, lookahead and release, which suits material that needs tuning rather than a preset. When the deliverable is defined by loudness rather than by peak, {{loudness-normalizer|Loudness Normalizer}} is the tool that measures its way to the target, and {{clipping-distortion-remover|Clipping Distortion Remover}} handles the case where the damage happened earlier than the limiter.",
    faqs: [
      {
        q: "Why is minus 1 dBFS the transparent setting?",
        a: "Because it leaves a decibel of space above the loudest sample, which matters when the file will be encoded to a lossy format. Encoders can produce inter sample overshoot slightly above the level the file itself contained, so having a little headroom means the encoded version is still safe. It is also gentle enough to be inaudible on most material.",
      },
      {
        q: "What makes this a brick wall rather than an ordinary limiter?",
        a: "The lookahead. The signal is delayed while the detector examines what is coming, and the gain computed for a peak is held in a buffer aligned to that exact delay, so it is already applied when the peak arrives. That removes overshoot entirely, which is what the term describes.",
      },
      {
        q: "Which preset should I use for a streaming release?",
        a: "The loud streaming preset, at minus 0.3 dBFS with a 40 millisecond release. That ceiling is what most services expect for delivery, and the faster release keeps the level up between peaks. Pair it with a loudness normaliser beforehand if the file also has to hit a target in LUFS.",
      },
      {
        q: "Does the limiter add loudness?",
        a: "No. It only reduces peaks, so the output is at or below the input level. Loudness comes from raising the level into the space that limiting creates, which is why the two steps are normally done in order: normalise to the target, then limit to keep the peaks in place.",
      },
      {
        q: "Why does my bass sound different at zero dBFS?",
        a: "Because a low ceiling with a fast release means the gain is changing quickly, and low frequency content is where fast gain changes become audible as distortion. The transparent preset with its slower release avoids most of it. If the deliverable allows minus 1 dBFS, that is the safer choice for bass heavy material.",
      },
    ],
  },

  "clipping-distortion-remover": {
    keywords: [
      "clipping",
      "declipped",
      "crest",
      "interpolation",
    ],
    intro:
      "Clipping Distortion Remover rebuilds the flattened tops of a hard-clipped recording by interpolating through each clipped run. It restores the crest the clipping cut off, using the shape of the surrounding signal as its guide.",
    content:
      "Drop a file, set the slider to the level the file was clipped at, and run the repair. The report says how many samples were rebuilt, what crest was restored and whether the output had to be scaled to fit inside full scale.\n\nThe control and the readout:\n\n- A clip ceiling from minus 6 to zero dBFS in steps of a tenth of a decibel, defaulting to minus 0.1, which is where the file tops out.\n- Detection of runs of samples that sit at or above that ceiling, treated as flattened tops.\n- Reconstruction with a cubic Hermite curve across each run, with slopes measured from the surrounding signal.\n- A report giving the number of samples rebuilt, the crest restored in dBFS and any scaling applied at the end.\n- An output WAV named after the source with a declipped suffix.\n\nHard clipping leaves a characteristic signature: a run of consecutive samples pinned at the same level, forming a flat top where the waveform should have curved. The repair detects those runs and replaces each one with a cubic Hermite interpolation whose tangent at each end is measured from the signal on either side of the run, so the rebuilt curve leaves and re-enters with the same slope the original had. That slope continuity is why the repair does not produce a visible kink at the join, and it is verified behaviour: the crest is restored to within about one percent on the standard test fixture, and the reconstruction is bounded by the signal's own data rather than being invented. Because a faithful repair can produce a crest higher than the original file's clipped ceiling, and possibly above full scale, the tool scales the whole output down if necessary to fit, and says so in the report. The value of the repair is that the missing harmonics come back: clipping generates odd harmonics that were not in the original signal, and restoring the curve removes much of that artificial edge.\n\nWhat the repair cannot do:\n\n- It cannot restore harmonics the clipping destroyed; the result is closer to the original than the clipped file, not identical to it.\n- Setting the ceiling too low treats quiet material as clipped and rebuilds samples that were never damaged.\n- Setting it too high leaves the real clipped tops untouched, so the distortion stays.\n- It only acts on flat topped runs, so distortion from overdriven analogue stages or bit reduction is out of scope.\n- A badly clipped recording with long flat sections is improved but not rescued, because too much of the waveform is genuinely gone.\n- The output may be scaled down to fit, which changes the overall level of the file.\n\nUse it on material that has flat tops at a constant level, which is the signature it is looking for, and set the slider just above the level where the tops sit rather than at full scale. Check the report: a plausible number of rebuilt samples and a crest restored to a sensible figure both suggest the ceiling was set correctly, while a very large sample count usually means the threshold is too low.",
    howTo: [
      { step: "Drop a clipped audio file onto the panel or click to choose one from disk." },
      { step: "Set the clip ceiling slider just above the level where the flat tops sit, starting from the default." },
      { step: "Run the repair and read how many samples were rebuilt and what crest was restored." },
      { step: "Download the declipped WAV, noting any scaling that was applied to fit inside full scale." },
    ],
    whenToUse:
      "Clipping Distortion Remover is the repair for waveform damage caused by too much level at capture, which is a different problem from peaks that merely need holding. {{peak-limiter|Peak Limiter}} and {{brickwall-limiter|Brickwall Limiter}} prevent the damage in the first place, and {{volume-booster|Volume Booster}} is the tool that can cause it when the hard clip mode is chosen deliberately. When the waveform is not flattened but offset from the centre line, {{dc-offset-remover|DC Offset Remover}} is the related repair, and {{audio-limiter|Audio Limiter}} is the prevention step for material that is still being processed.",
    faqs: [
      {
        q: "How does the tool know where the clipping starts?",
        a: "You tell it with the ceiling slider, which should be set just above the level where the flat tops sit. A hard-clipped file has runs of consecutive samples pinned at a constant level, and those runs are the flats. The default of minus 0.1 dBFS suits files that were clipped at the digital ceiling.",
      },
      {
        q: "What does it actually do to the flattened samples?",
        a: "It replaces each run with a cubic Hermite curve whose slopes at both ends are measured from the surrounding signal. Because the tangents match, the rebuilt section rejoins without a kink. Verified behaviour is that the crest is restored to within about one percent on the standard fixture and the reconstruction stays within the bounds of the surrounding data.",
      },
      {
        q: "Will my file sound exactly like the original mix?",
        a: "No. The harmonics that clipping generated cannot be removed by rebuilding the waveform, and information about the true peak shape was lost when the samples were flattened. What you get is a smoother, more natural curve and much less of the harsh edge, which is a clear improvement rather than a restoration.",
      },
      {
        q: "Why was my output scaled down?",
        a: "Because a faithful repair can restore a crest that sits above full scale. Rather than letting the WAV encoder clamp it back onto the digital rail, which would undo the repair, the tool scales the whole file down so the restored crest fits below minus 0.1 dBFS and reports that it did so.",
      },
      {
        q: "What if the repair reports a huge number of samples?",
        a: "That usually means the ceiling is set too low, so ordinary loud material is being treated as clipped. The symptom is a file that sounds processed rather than repaired. Raise the ceiling until the count matches the extent of the visible flat tops, which are usually confined to the loudest passages.",
      },
    ],
  },
};
