/**
 * AUTO-GENERATED — do not edit by hand.
 *
 * Source: src/domains/audio/seo/source/batch-08-audio-conversion.json
 * Regenerate: node scripts/audio-json-to-seo.mjs src/domains/audio/seo/source/batch-08-audio-conversion.json <this file> audioSeoBatch8
 * Validate first: node scripts/validate-audio-seo-json.mjs src/domains/audio/seo/source/batch-08-audio-conversion.json
 */
import type { ToolSeo } from "@/components/shared/seo-types";

export const audioSeoBatch8: Record<string, ToolSeo> = {
  "audio-format-converter": {
    keywords: [
      "format grid",
      "bit depth",
      "sample rate",
      "batch conversion",
    ],
    intro:
      "Audio Format Converter is the universal member of the converter family: pick any of nine output formats, set the quality controls that format actually exposes, and convert a batch at once. It runs the native encoders in your browser where it can, and falls back to a bundled encoder core where it must.",
    content:
      "Drop one file or twenty, choose the target format from the grid and adjust the settings panel, which changes shape depending on what you picked. Press the convert button and each file in the queue is processed in turn, with its own progress and its own download.\n\nWhat the panel exposes:\n\n- A format grid offering MP3, WAV, M4A, FLAC, OGG, AAC, AIFF, WMA and OPUS.\n- A quality control that follows the format: an MP3 bitrate ladder of 64, 128, 192 and 320, an AAC ladder of 96, 128, 192 and 256, a WMA ladder of 64, 128 and 192, and an OPUS ladder of 64, 96, 128 and 192.\n- A bit depth choice of 16 or 24 for the uncompressed formats WAV and AIFF.\n- A FLAC compression level from 0 to 12, defaulting to 5.\n- An OGG quality scale of 2, 5, 7 and 10, with a fixed bitrate alternative of 96, 128, 192 and 256.\n- A channel mode of original, mono or stereo, and a sample rate choice of original or 16, 24, 32, 44.1 or 48 kHz.\n- A metadata setting of preserve or strip, with a note that fields and cover art may not survive between very different formats.\n- A queue with per-file status, progress and a download each, plus a download all control once several have finished.\n\nTwo engines sit behind this interface, and the tool chooses between them. MP3, WAV and AIFF have encoders that run in the page itself, so those conversions never download the encoder core. Anything else, and any conversion with metadata set to preserve, needs the bundled core, which is roughly thirty one megabytes fetched once and then reused. The tool probes which encoders the loaded core actually provides and disables formats whose requirements are not met rather than failing part way through a batch. Sample rates above the source rate are disabled for a simple reason: resampling upwards adds no information, so the option would only create bigger files with no benefit.\n\nWhat the universal tool does not promise:\n\n- The first non native conversion has to fetch and initialise the encoder core, which takes time on a slow connection.\n- Preserve carries tags only where the target container supports them, so album art in particular may not transfer between very different formats.\n- FLAC and ALAC are lossless, but converting from a lossy source cannot recover what was already discarded.\n- Sample rate options stop at 48 kHz, so very high rate sources are not offered a matching output.\n- The queue processes files one at a time, so a batch conversion is a long sequential wait rather than a parallel job.\n- Nothing here edits the audio: no trimming, levelling or cleanup is applied along the way.\n\nUse it when a set of files has to end up in one format, and check the settings panel before starting rather than after, because the quality ladder changes with the format you choose. If the job is simply to make files smaller, the bitrate converter beside it opens on the setting that matters instead of on the format grid.",
    howTo: [
      { step: "Drop one or more audio files onto the panel, or click to browse for them." },
      { step: "Choose the output format from the grid and set the quality control that format exposes." },
      { step: "Adjust sample rate, channel mode and metadata, remembering that rates above the source are disabled." },
      { step: "Press the convert button and watch each file's progress, then download individually or all at once." },
    ],
    whenToUse:
      "Audio Format Converter is the general purpose conversion tool, so it is the right choice whenever the output format is the open question. {{bitrate-quality-converter|Bitrate/Quality Converter}} opens directly on the bitrate choice for the common job of making a file smaller, and the single format converters such as {{mp3-converter|MP3 Converter}} and {{flac-converter|FLAC Converter}} preset one target with nothing else to configure. When the source is an unusual container that needs decoding before anything else, {{wma-m4b-caf-decoder|WMA/M4B/CAF Decoder}} handles that first step.",
    faqs: [
      {
        q: "Why does the quality control change when I pick a different format?",
        a: "Because the formats do not share a quality scale. MP3 and AAC are measured in kilobits per second, WAV and AIFF in bit depth, FLAC in a compression level from 0 to 12 and OGG on a Vorbis quality scale of 2 to 10. The panel shows the control that belongs to the format you selected rather than a generic slider.",
      },
      {
        q: "Why is my file uploaded somewhere?",
        a: "It is not. Two engines are used depending on the format: in page encoders for MP3, WAV and AIFF, and a bundled encoder core for everything else. The core is a static download of about thirty one megabytes that runs inside the tab, so your audio stays in the browser's memory throughout and never leaves the device.",
      },
      {
        q: "Why are some sample rates greyed out?",
        a: "Because they are above the rate of the file you loaded, and resampling upward adds no quality. It would only produce a larger file containing the same information padded out with interpolated samples. The option is disabled rather than hidden so it is clear the tool considered it.",
      },
      {
        q: "What does the metadata setting actually do?",
        a: "Preserve passes tags and cover art through where the target container supports them, and strip writes a file with no metadata at all. Preserve is the reason a conversion sometimes takes longer, since it forces the bundled encoder into the path. Fields and art may still not survive between very different formats, which the panel says outright.",
      },
      {
        q: "Can I convert a whole folder at once?",
        a: "You can drop many files and they will all be processed in one run with individual progress and downloads, and a download all control appears once several have finished. They are handled one at a time rather than in parallel, so a large batch takes roughly as long as the sum of its parts.",
      },
    ],
  },

  "bitrate-quality-converter": {
    keywords: [
      "bitrate",
      "re-encode",
      "mp3",
      "file size",
    ],
    intro:
      "Bitrate/Quality Converter re-encodes audio at a different bitrate so a file comes out smaller or lighter, opening directly on the quality choice rather than on a format grid. It is the shortest route for the most common conversion job.",
    content:
      "Drop a file, pick a bitrate and convert. The tool is the universal converter with the output pinned to MP3 up front, so the choice in front of you is how much quality to spend rather than which container to write.\n\nWhat the panel offers:\n\n- An output fixed to MP3, so there is no format grid to work through first.\n- The MP3 bitrate ladder of 64, 128, 192 and 320 kilobits per second, labelled from Economy up to Best.\n- A constant or variable rate mode, where variable encoding chooses the rate per passage and usually produces a smaller file at the same perceived quality.\n- Channel mode and sample rate controls, with rates above the source disabled because upsampling adds nothing.\n- A metadata setting of preserve or strip, with a note that some fields may not transfer.\n- The same queue as the universal tool: per file status, progress, individual downloads and a download all control.\n\nTwo things decide how long this takes and which engine runs. A plain re-encode with metadata stripped and a constant bitrate can be done entirely in the page, so nothing is downloaded. Switching to variable rate, choosing preserve or picking a format other than MP3 moves the work to the bundled encoder core, which is fetched once and reused. The bitrate ladder is the interesting part of the interface, because the difference between the rungs is not linear: moving from 320 down to 192 is a large reduction in file size with a small change in perceived quality for most listeners, while going from 64 to 128 is a large audible improvement. The honest framing is that this tool makes files smaller, and the lowest useful rung depends on the content rather than on the number.\n\nWhere re-encoding is the wrong answer:\n\n- Re-encoding a lossy file at a lower rate compounds the loss, so a second generation copy sounds worse than the bitrate alone suggests.\n- Nothing is gained by re-encoding at the same or a higher bitrate; the file gets larger or stays the same size for no quality improvement at all.\n- There is no measurement of the source, so the tool cannot warn you that a file is already at a low rate before you reduce it further.\n- Sample rate options stop at 48 kHz, so unusually high rate sources get no matching output.\n- The metadata preserve option cannot guarantee that every field survives the move into a new MP3 tag.\n- Only MP3 is offered here; a different target means using the universal converter instead.\n\nUse it when the deliverable is defined by size or by an upload limit: a podcast episode that has to fit inside a hosting allowance, a voice memo to send by message, or an archive that should be smaller without being unusable. Step down one rung at a time and listen, because the right bitrate depends on how dense the material is rather than on a rule of thumb, and keep the original file until the smaller copy has proved it still does the job.",
    howTo: [
      { step: "Drop an audio file onto the panel; the output format is already set to MP3." },
      { step: "Choose a bitrate from the ladder, stepping down a rung at a time if size is the priority." },
      { step: "Decide between constant and variable rate, and set channel mode, sample rate and metadata as needed." },
      { step: "Press convert, then download the smaller file and check it before deleting the original." },
    ],
    whenToUse:
      "Bitrate/Quality Converter is the direct route to a smaller file, which makes it the natural tool when an upload limit or a storage budget set the target. {{audio-format-converter|Audio Format Converter}} is the general purpose alternative when the output format is what you actually need to change, and {{mp3-converter|MP3 Converter}} covers the same format with its own presets. To predict the outcome before running anything, {{audio-file-size-calculator|Audio File Size Calculator}} estimates the result from the bitrate, and {{streaming-bitrate-calculator|Streaming Bitrate Calculator}} answers the bandwidth version of the question.",
    faqs: [
      {
        q: "Which bitrate should I choose?",
        a: "It depends on the content. Spoken word is usually fine at 64 to 96 kilobits per second, music for casual listening sits around 128 to 192, and 320 is the ceiling of the MP3 ladder where extra bits buy almost nothing. Step down one rung and listen rather than assuming the lowest option is acceptable.",
      },
      {
        q: "Does converting to a lower bitrate damage the file?",
        a: "It discards detail that cannot be recovered, and if the source was already lossy the second encode adds its own loss on top of the first. That is why a re-encoded copy can sound worse than its bitrate suggests. Keep the original file until you are satisfied with the smaller version.",
      },
      {
        q: "Why does choosing variable rate take longer?",
        a: "Because it moves the work onto the bundled encoder core, which is fetched and initialised on first use, whereas a constant rate MP3 with metadata stripped is handled by the in page encoder. The core is about thirty one megabytes and is reused for later conversions in the same session.",
      },
      {
        q: "Will my tags survive the conversion?",
        a: "Set metadata to preserve and the tool passes them through where the MP3 tag format can hold them, with the caveat that not every field or piece of cover art transfers between different formats. Set it to strip and the output carries no metadata at all, which is also the faster path.",
      },
      {
        q: "Can I convert to a different format here?",
        a: "No, the output is pinned to MP3 by design so that the interface opens on the quality decision. If the destination needs AAC, FLAC or anything else, the universal format converter is the tool for that job, and it exposes the same queue and the same metadata choice.",
      },
    ],
  },

  "wma-m4b-caf-decoder": {
    keywords: [
      "wma",
      "m4b",
      "caf",
      "transcode",
    ],
    intro:
      "WMA/M4B/CAF Decoder turns three awkward containers into something every player understands. Point it at a Windows Media file, an audiobook or a Core Audio Format file and get back an MP3, a WAV or a FLAC.",
    content:
      "Drop a single file into the panel, choose one of three output targets and press decode. A progress bar tracks the run and the finished file appears as a row with its name, its size in kilobytes and a download control.\n\nThe panel and the three targets:\n\n- A drop zone accepting files with the wma, m4b, caf and asf extensions, with drag and drop or a click to browse.\n- Three output buttons: MP3 for universal playback, WAV for lossless and uncompressed, and FLAC for lossless and compressed.\n- A progress bar with a percentage readout while the decode runs.\n- A result row naming the new file, its size and a download control, plus a clear button to reset the panel.\n- A single file per run, deliberately, because these sources are rare enough that a queue would only complicate the error reporting.\n\nEach target maps to a specific encoder: MP3 is written at 192 kilobits per second, WAV as 16 bit little endian PCM, and FLAC with its own lossless encoder. All three runs decode through the bundled encoder core rather than the in page path, because none of these containers can be handled natively. Every run is a genuine transcode rather than a rename, because the audio is decoded and re-encoded into the target; a protected file cannot be handled by changing its extension, and the three targets each map to a specific encoder. The arguments carry two deliberate guards. First, video and image streams are excluded, which matters most for audiobooks: an M4B file usually carries cover art as an attached picture stream, and without the guard that stream confuses the output mapping. Second, metadata is preserved where the source has it. The remaining limitation is the source itself: Core Audio Format files can hold several PCM variants, and one that the core cannot read fails with a message that says the file may be unsupported, protected or corrupt rather than pretending the run succeeded.\n\nWhat it cannot do:\n\n- Protected files are not decoded, and a message saying so is the only outcome available for them.\n- Only one file is handled per run, so a library of audiobooks means repeating the process.\n- The MP3 target is fixed at 192 kilobits per second and the WAV target at 16 bit, so there are no quality choices.\n- It decodes to the three listed targets only; anything else needs a second step through the universal converter.\n- Excessively large files are limited by the memory the browser will give the encoder core.\n- Nothing is analysed first, so an unusual variant inside a supported container is only discovered when the run fails.\n\nUse it when a file from one of these three families will not open anywhere modern: an old Windows Media recording, an audiobook that needs to play on a device without M4B support, or a Core Audio Format file exported from a Mac application. WAV is the safe choice when the result will be edited, and MP3 when it needs to play everywhere.",
    howTo: [
      { step: "Drop a file with a wma, m4b, caf or asf extension into the panel, or click to browse for one." },
      { step: "Choose the output target: MP3 for universal playback, WAV for lossless and uncompressed, or FLAC for lossless and compressed." },
      { step: "Press the decode button and watch the progress bar, remembering the encoder core may load first." },
      { step: "Download the finished file from the result row, or clear the panel to start another." },
    ],
    whenToUse:
      "WMA/M4B/CAF Decoder is the rescue tool for containers that most browsers and devices will not open, so it belongs before any other processing. {{alac-m4a-lossless-converter|ALAC/M4A Lossless Converter}} covers the Apple lossless side of the same problem, which is a distinct codec inside a similar container. Once the file is in a normal format, {{audio-format-converter|Audio Format Converter}} handles the usual conversion work, and {{audio-trimmer|Audio Trimmer}} is the natural next step for cutting a long audiobook or recording down. To write a WMA file rather than read one, {{wma-converter|WMA Converter}} creates that container directly.",
    faqs: [
      {
        q: "What are these three formats?",
        a: "WMA is the legacy Windows Media audio format, M4B is an MP4 container used for audiobooks and normally holds AAC audio, and CAF is Apple's Core Audio Format, which is usually a container for PCM. All three are awkward in a browser, which is why they are handled by a bundled decoder rather than the in page path.",
      },
      {
        q: "Why only one file at a time?",
        a: "It is a deliberate choice rather than a missing feature. These sources are rare, and reporting a failure clearly matters more here than processing a batch, because the failure mode for an unusual variant is a container quirk rather than a simple error. One file per run keeps that reporting honest.",
      },
      {
        q: "My audiobook has cover art. Will that break the conversion?",
        a: "No, it is handled. An attached picture in an M4B is an extra stream, and the decode arguments exclude video and image streams so that the cover art cannot confuse the output mapping. The audio comes through and the metadata that the target can hold is preserved.",
      },
      {
        q: "Why did an m4a file fail?",
        a: "Because this tool is aimed at the three listed families and the encoder path is chosen for them. A file that claims to be one thing and contains another is only discovered when the run fails, and the message says the file may be unsupported, protected or corrupt. The ALAC converter handles the lossless Apple case.",
      },
      {
        q: "Is there a quality setting?",
        a: "No. The targets are fixed: MP3 at 192 kilobits per second, WAV at 16 bit PCM, and FLAC at its own lossless setting. That keeps the tool about getting a file into a usable form. If you need a different bitrate or bit depth, decode here first and then run the universal converter on the result.",
      },
    ],
  },

  "alac-m4a-lossless-converter": {
    keywords: [
      "alac",
      "m4a",
      "lossless",
      "aac",
    ],
    intro:
      "ALAC/M4A Lossless Converter moves audio into or out of Apple's lossless codec, which lives inside an M4A container. It encodes to ALAC, or takes an existing ALAC file back out to WAV, FLAC, AAC or MP3.",
    content:
      "Drop a file, choose one of five targets and convert. The panel reports progress while it runs and presents the finished file with its name, its size and a download control.\n\nThe five targets and what each writes:\n\n- ALAC inside an M4A container, the lossless target that Apple software reads natively.\n- WAV, meaning lossless and uncompressed PCM, the right choice when the result will be edited.\n- FLAC, meaning lossless and compressed, which is smaller than WAV and readable well beyond Apple's ecosystem.\n- AAC inside an M4A container at 256 kilobits per second, the compact lossy option.\n- MP3 at 192 kilobits per second, the universal lossy fallback.\n- A drop zone accepting m4a, mp4, alac, aac, wav, flac, mp3 and caf files, plus a progress bar and a clear control.\n\nThe conversion runs through a bundled encoder core that carries Apple's lossless encoder, and every direction excludes video and image streams. That guard is not incidental: an M4A file often contains cover art as an attached picture, and leaving it in place confuses the mapping between what goes into the decoder and what comes out. The codec matters when choosing a target. ALAC is genuinely lossless and reduces file size compared with packing the same audio into a WAV, but FLAC is the more portable lossless choice because it is readable far outside Apple's platforms, and both are far larger than the AAC or MP3 targets. Converting from a lossy source into ALAC does not create lossless audio; it only produces a lossless container for the lossy material, which is a common misunderstanding worth stating plainly. Bit depth and sample rate come from the source rather than from a setting here, so the lossless targets preserve whatever the input carried and the lossy targets keep the same rate while discarding detail.\n\nWhat the conversion does not give you:\n\n- ALAC output is effectively an Apple ecosystem format, so portability is better served by FLAC unless you specifically need it.\n- Metadata is not carried across in this tool's conversions, so titles, artists and cover art have to be set again afterwards.\n- Protected files are not converted, and the error message says the file may be corrupt or use an unsupported codec.\n- The lossy targets have fixed settings: AAC at 256 kilobits per second and MP3 at 192, with no ladder to choose from.\n- One file per run, so a library means repeating the process rather than dropping a folder.\n- Encoding to a lossless format cannot improve a lossy source, and the file will simply be larger.\n\nUse it in one of two directions. Encode to ALAC when a file has to live in an Apple library natively, or decode from ALAC when the material needs to leave that ecosystem and play somewhere else. Keep the conversion count as low as possible: a journey through two lossy steps is worse than one, and a lossless target does not undo loss that happened earlier. One conversion in the right direction beats a chain of them.",
    howTo: [
      { step: "Drop an M4A or ALAC file into the panel, or any audio you want encoded into lossless ALAC." },
      { step: "Choose the target: ALAC in M4A, WAV, FLAC, AAC in M4A, or MP3." },
      { step: "Press convert and let the progress bar finish; the encoder core may load before the work starts." },
      { step: "Download the new file from the result row, and set metadata again afterwards if the file needs it." },
    ],
    whenToUse:
      "ALAC/M4A Lossless Converter is the tool when the codec in question is Apple's own lossless format, in either direction. {{wma-m4b-caf-decoder|WMA/M4B/CAF Decoder}} covers the neighbouring job of rescuing files from legacy or audiobook containers, and {{flac-converter|FLAC Converter}} is the more portable lossless destination when Apple support is not a requirement. For a general change of format, {{audio-format-converter|Audio Format Converter}} exposes the whole grid with its quality controls.",
    faqs: [
      {
        q: "What is ALAC and how is it different from FLAC?",
        a: "Both are lossless compression schemes that store the exact samples while making the file smaller than an uncompressed WAV. ALAC is Apple's, used inside M4A files, and FLAC is the open alternative that plays far more widely. Choose ALAC when Apple software needs to read it natively, and FLAC when portability matters more.",
      },
      {
        q: "Does converting to ALAC improve quality?",
        a: "No, and this is the most common misunderstanding. Lossless only means the file describes the samples exactly; it cannot recover detail removed by an earlier lossy encode. Encoding an MP3 to ALAC produces a much larger file containing the same lossy audio, which gains nothing.",
      },
      {
        q: "Will my cover art and tags transfer?",
        a: "Not in this tool. Every direction excludes video and image streams so that attached cover art cannot confuse the stream mapping, and metadata is not carried across. If the finished file needs its title, artist or art, those are set afterwards with the tag editor.",
      },
      {
        q: "Which target should I pick to leave the Apple ecosystem?",
        a: "FLAC if you want lossless and broad compatibility, or MP3 if the destination is a legacy player that will not take FLAC. WAV is the right answer when the file is going into an editor, because uncompressed audio avoids any question about decoder support in the software you are about to use.",
      },
      {
        q: "Why is only one file handled at a time?",
        a: "Because these conversions depend on an unusual codec path where failures are more informative than speed, and reporting them one at a time keeps the message specific to the file that failed. A batch of files means running the conversion repeatedly, or encoding duplicates of a single large file rather than a library.",
      },
    ],
  },
};
