import { ToolResult } from "@/components/CategorySearch";
import { AudioLines, Captions, Code, FastForward, Filter, Layers, Mic, Podcast, Scissors, SpellCheck, Volume2, Wand2 } from "lucide-react";

export const CATEGORIES = [
  {
    name: "Speech Synthesis & TTS",
    description: "Generate and edit lifelike voice audio.",
    tools: [
      {
        slug: "text-to-speech-generator",
        name: "Text-to-Speech Generator",
        description: "Convert written text into natural, lifelike speech across 50+ languages.",
        icon: AudioLines,
        status: "soon",
      },
      {
        slug: "ssml-editor",
        name: "SSML Editor & Previewer",
        description: "Write, validate, and preview advanced Speech Synthesis Markup Language tags.",
        icon: Code,
        status: "soon",
      },
      {
        slug: "podcast-intro-maker",
        name: "Podcast Intro Maker",
        description: "Generate professional, broadcast-quality voiceover intros for podcasts and videos.",
        icon: Podcast,
        status: "soon",
      },
      {
        slug: "pronunciation-checker",
        name: "Pronunciation Reference",
        description: "Hear the exact, correct pronunciation of complex terms, names, and medical jargon.",
        icon: Volume2,
        status: "soon",
      },
      {
        slug: "ai-voice-changer",
        name: "AI Voice Changer",
        description: "Modify vocal characteristics, pitch, and tone to create custom character voices.",
        icon: Wand2,
        status: "soon",
      },
    ],
  },
  {
    name: "Audio Editing & Utilities",
    description: "Transcribe, trim, and adjust voice recordings.",
    tools: [
      {
        slug: "speech-to-text-transcriber",
        name: "Speech-to-Text Transcriber",
        description: "Accurately transcribe audio files and voice memos into plain text instantly.",
        icon: Mic,
        status: "soon",
      },
      {
        slug: "audio-speed-changer",
        name: "Audio Speed Changer",
        description: "Adjust the tempo of speech recordings without distorting or altering the pitch.",
        icon: FastForward,
        status: "soon",
      },
      {
        slug: "audio-noise-reducer",
        name: "Voice Noise Reducer",
        description: "Clean up background static and hums from vocal recordings for clearer audio.",
        icon: Filter,
        status: "soon",
      },
      {
        slug: "phonetic-transcriber",
        name: "Phonetic IPA Converter",
        description: "Convert English words and sentences into standard International Phonetic Alphabet (IPA) notation.",
        icon: SpellCheck,
        status: "soon",
      },
      {
        slug: "subtitle-generator",
        name: "Subtitles Generator",
        description: "Automatically generate VTT or SRT subtitle files from spoken audio tracks.",
        icon: Captions,
        status: "soon",
      },
      {
        slug: "audio-trimmer",
        name: "Audio Trimmer & Cropper",
        description: "Quickly crop, trim, and split voice memos directly in your browser.",
        icon: Scissors,
        status: "soon",
      },
      {
        slug: "voice-overlap-mixer",
        name: "Voice Overlap Mixer",
        description: "Combine multiple voice tracks or layer a voiceover seamlessly onto a background music track.",
        icon: Layers,
        status: "soon",
      },
    ],
  },
];

export const TOTAL_TOOLS = CATEGORIES.reduce((acc, cat) => acc + cat.tools.length, 0);

export const SEARCH_REGISTRY: ToolResult[] = CATEGORIES.flatMap((c) =>
  c.tools.map((t) => ({
    name: t.name,
    description: t.description,
    slug: t.slug,
    href: `/voice/${t.slug}`,
    category: c.name,
    isBuilt: t.status === "live",
  }))
);
