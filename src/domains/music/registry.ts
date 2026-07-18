import { AArrowDown, AArrowUp, ALargeSmall, Accessibility, Activity, ActivitySquare, AirVent, Airplay, AlarmCheck, AlarmClock, AlarmClockCheck, AlarmClockMinus, AlarmClockOff, AlarmClockPlus, AlarmMinus, AlarmPlus, AlarmSmoke, Album, AlertCircle, AlertOctagon, AlertTriangle, AlignCenter, AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignHorizontalDistributeCenter, AlignHorizontalDistributeEnd, AlignHorizontalDistributeStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart, AlignHorizontalSpaceAround, AlignHorizontalSpaceBetween, AlignJustify, AlignLeft, AlignRight, AlignStartHorizontal, AlignStartVertical, AlignVerticalDistributeCenter, AlignVerticalDistributeEnd, AlignVerticalDistributeStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalSpaceAround, AlignVerticalSpaceBetween, Ambulance, Ampersand, Ampersands, AudioLines, AudioWaveform, Award, BarChart3, BookMarked, BookOpen, Boxes, Brain, Building2, Calendar, ChartLine, Circle, CircleDot, Clapperboard, ClipboardCheck, ClipboardList, Clock, Compass, Crown, Disc3, Drum, Eye, FileBadge, FileMusic, FilePenLine, FileQuestion, FileText, Gauge, GitBranch, GraduationCap, Grid3x3, Guitar, Hash, Headphones, Hexagon, History, Key, KeySquare, Layers, Layers3, LayoutGrid, LayoutPanelLeft, Library, ListChecks, Map, MapPin, Megaphone, Mic2, Music2, Music3, Music4, Network, Notebook, Palette, Pencil, PencilRuler, Piano, Play, Podcast, Radio, Repeat, Repeat2, Ruler, Search, Settings2, Shield, Shuffle, Sliders, SlidersHorizontal, Sparkle, Sparkles, Speaker, Star, Tag, Tags, Target, Timer, Type, Wand2, Waves, Workflow, Wrench, Youtube, Zap } from "lucide-react";
import { ToolResult } from "@/components/CategorySearch";

export type Tool = {
  name: string;
  slug: string;
  description: string;
  icon: any;
  status: "live" | "soon";
};

export type ToolCategory = {
  name: string;
  description: string;
  tools: Tool[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const mk = (entries: [string, string, any, boolean?][]): Tool[] =>
  entries.map(([name, description, icon, built = false]) => ({ name, slug: slugify(name), description, icon, status: built ? "live" : "soon" }));

export const categories: ToolCategory[] = [
  {
    name: "Beat Making & Drum Machines",
    description: "Sequencers, pads and groove builders for rhythm production",
    tools: mk([
      ["Step Sequencer Drum Machine", "Classic 16-step grid sequencer", Grid3x3],
      ["Beat Pad (MPC-style)", "Finger-drum style trigger pads", LayoutGrid],
      ["Rhythm Pattern Builder", "Compose custom rhythm patterns", Activity],
      ["Polyrhythm Generator", "Layer competing meters and pulses", Layers],
      ["Metronome Tool", "Precise click with subdivisions", Timer],
      ["Groove Quantizer", "Apply human groove templates", Waves],
      ["Drum Pattern Library", "Browse genre drum patterns", Library],
      ["Swing Amount Tool", "Dial in shuffle and swing feel", Gauge],
      ["Trap Beat Builder", "Hi-hat rolls and 808 patterns", Drum],
      ["Lo-Fi Beat Maker", "Dusty, mellow lo-fi grooves", Disc3],
      ["Breakbeat Editor", "Slice and rearrange breaks", Shuffle],
      ["Percussion Arranger", "Layer auxiliary percussion", Boxes],

    ]),
  },
  {
    name: "Melody & Harmony",
    description: "Tools for writing and analysing melodic lines",
    tools: mk([
      ["Piano Roll Editor", "MIDI-style melody editing", Piano],
      ["Melody Generator", "Idea sparks for melodic phrases", Sparkles],
      ["Chord Progression Builder", "Stack chords into progressions", Music2],
      ["Scale Explorer", "Visualise scales and modes", Compass],
      ["Arpeggio Generator", "Build arpeggio patterns", GitBranch],
      ["Melodic Motif Builder", "Develop reusable motifs", Sparkle],
      ["Counterpoint Checker", "Verify species counterpoint rules", Shield],
      ["Harmonic Analysis Tool", "Label functions and cadences", Search],
      ["Voice Leading Guide", "Smooth voice motion checker", Workflow],
      ["Call & Response Builder", "Pair antecedent and consequent phrases", Repeat2],
      ["Interval Training Tool", "Ear training for intervals", Brain],
      ["Transposition Tool", "Shift to any key", KeySquare],

    ]),
  },
  {
    name: "Chord Tools",
    description: "Chord theory, lookup and substitution helpers",
    tools: mk([
      ["Chord Builder", "Construct chords from intervals", Music3],
      ["Chord Finder", "Identify chords from notes", AArrowDown],
      ["Chord Inversion Explorer", "View all inversions", Repeat],
      ["Chord Substitution Finder", "Find tasteful substitutions", Wand2],
      ["Secondary Dominant Finder", "V/x dominant lookup", Star],
      ["Circle of Fifths Tool", "Interactive circle of fifths", CircleDot],
      ["Chord Chart Builder", "Guitar and piano chord charts", LayoutPanelLeft],
      ["Nashville Number System Tool", "Number charts for any key", Hash],
      ["Chord Progression Generator", "Generate fresh progressions", AArrowUp],
      ["Modulation Pathway Tool", "Pivot chord modulation paths", Network],
      ["Borrowed Chord Explorer", "Modal interchange chords", Crown],
      ["Extended Chord Reference", "9ths, 11ths, 13ths and beyond", BookMarked],

    ]),
  },
  {
    name: "Scales & Theory",
    description: "Scales, modes and theory references",
    tools: mk([
      ["Scale Library Browser", "Search hundreds of scales", ALargeSmall],
      ["Mode Explorer", "Dorian, Phrygian and friends", Accessibility],
      ["Pentatonic Scale Visualizer", "Major and minor pentatonics", Circle],
      ["Exotic Scale Explorer", "World and synthetic scales", Map],
      ["Key Signature Reference", "All key signatures at a glance", Key],
      ["Relative Major/Minor Finder", "Find the relative key", ActivitySquare],
      ["Parallel Key Comparator", "Compare parallel major and minor", AirVent],
      ["Note Frequency Reference", "Hz values for every note", Airplay],
      ["Pitch Class Set Explorer", "Set theory for atonal music", Hexagon],
      ["Roman Numeral Analysis Tool", "Analyse with Roman numerals", Type],
      ["Music Theory Quiz", "Test your theory knowledge", FileQuestion],
      ["Interval Stack Builder", "Stack intervals into structures", Layers3],

    ]),
  },
  {
    name: "Composition & Arrangement",
    description: "Plan structure, orchestration and dynamics",
    tools: mk([
      ["Song Structure Planner", "Map sections of a song", AlarmCheck],
      ["Verse-Chorus-Bridge Layout", "Classic pop form planner", AlignJustify],
      ["Arrangement Timeline Builder", "Plot instruments across time", Calendar],
      ["Orchestration Guide", "Pair instruments effectively", BookOpen],
      ["Texture Layer Planner", "Plan textural layers", AlarmClock],
      ["Dynamic Curve Builder", "Shape arrangement dynamics", ChartLine],
      ["Motif Development Tool", "Develop themes across sections", AlarmClockCheck],
      ["Tension & Release Planner", "Map tension arcs", AlarmClockMinus],
      ["Intro & Outro Builder", "Craft strong openings and endings", Play],
      ["Transition Technique Reference", "Library of section transitions", AlarmClockOff],
      ["Musical Form Reference", "Sonata, rondo, AABA and more", AlarmClockPlus],
      ["Remix Structure Planner", "Plan remix arrangements", AlarmMinus],

    ]),
  },
  {
    name: "Sound Design",
    description: "Synthesis, modulation and effects design",
    tools: mk([
      ["Synthesizer Patch Builder", "Web Audio patch designer", Settings2],
      ["Oscillator Type Comparator", "Compare waveforms by ear", AudioWaveform],
      ["Filter Type Explorer", "Low/high/band/notch filters", SlidersHorizontal],
      ["ADSR Envelope Builder", "Shape attack, decay, sustain, release", AlarmPlus],
      ["LFO Pattern Builder", "Design modulation shapes", AlarmSmoke],
      ["Modulation Matrix Planner", "Route modulation sources", Album],
      ["FM Synthesis Patch Builder", "Operator-based FM design", Sliders],
      ["Wavetable Concept Builder", "Plan wavetable morphs", AudioLines],
      ["Effects Chain Designer", "Order your FX chain", Wrench],
      ["Reverb Impulse Response Selector", "Match spaces to sources", Building2],
      ["Delay Tap Timing Calculator", "Tempo-synced delay times", AlertCircle],
      ["Sound Layering Tool", "Plan layered sound design", AlertOctagon],

    ]),
  },
  {
    name: "Guitar & Bass Tools",
    description: "Fretboard, chords and patterns for stringed players",
    tools: mk([
      ["Guitar Chord Diagram Maker", "Draw guitar chord shapes", Guitar],
      ["Guitar Scale Diagram Maker", "Plot scales on the fretboard", AlertTriangle],
      ["Guitar Fretboard Explorer", "Notes across the neck", AlignCenter],
      ["Guitar Tuner", "Web Audio chromatic tuner", AlignCenterHorizontal],
      ["Guitar Chord Progression Player", "Hear progressions on guitar", AlignCenterVertical],
      ["Guitar Tablature Builder", "Type and edit tabs", FileMusic],
      ["Bass Line Builder", "Compose bass grooves", Music4],
      ["Guitar Capo Position Calculator", "Find the right capo fret", Target],
      ["String Gauge Guide", "Pick gauges by tuning", Ruler],
      ["Guitar Mode Position Mapper", "CAGED-style mode positions", MapPin],
      ["Strumming Pattern Builder", "Design strum patterns", AlignEndHorizontal],
      ["Guitar Solo Pattern Generator", "Lick and solo ideas", AlignEndVertical],

    ]),
  },
  {
    name: "Piano & Keyboard",
    description: "Practice, theory and trainers for keys",
    tools: mk([
      ["Virtual Piano", "Playable Web Audio piano", AlignHorizontalDistributeCenter],
      ["Piano Chord Visualizer", "See chords on the keys", AlignHorizontalDistributeEnd],
      ["Piano Scale Highlighter", "Highlight scales on a keyboard", AlignHorizontalDistributeStart],
      ["Piano Sight-Reading Trainer", "Practice reading notation", GraduationCap],
      ["Piano Interval Trainer", "Train interval recognition", AlignHorizontalJustifyCenter],
      ["Piano Note Identifier", "Identify notes on the staff", Eye],
      ["Keyboard Shortcut Map Builder", "Custom keyboard control maps", AlignHorizontalJustifyEnd],
      ["Piano Technique Exercise Builder", "Build practice routines", Pencil],

    ]),
  },
  {
    name: "Notation & Scoring",
    description: "Lead sheets, tabs and score formatting",
    tools: mk([
      ["Music Notation Tool", "Browser-based ABC notation", AlignHorizontalJustifyStart],
      ["Lead Sheet Builder", "Melody plus chord symbols", FileText],
      ["Chord Chart Formatter", "Clean chord chart layouts", FilePenLine],
      ["Drum Notation Reference", "Standard drum notation", AlignHorizontalSpaceAround],
      ["Music Symbol Reference", "Every common symbol", Palette],
      ["Tablature Formatter", "Format tabs for print", AlignHorizontalSpaceBetween],
      ["Fake Book Page Builder", "Real Book style pages", Notebook],
      ["Lyric Sheet Formatter", "Clean lyric layouts", AlignLeft],
      ["Score Layout Tool", "Set page and system spacing", PencilRuler],
      ["Transposing Score Tool", "Shift scores to any key", AlignRight],

    ]),
  },
  {
    name: "Production & Mixing",
    description: "Workflow guides for mix and master",
    tools: mk([
      ["Gain Staging Guide", "Healthy levels at every stage", AlignStartHorizontal],
      ["Mix Level Reference", "Target levels per element", BarChart3],
      ["Frequency Spectrum Planner", "Carve space across the spectrum", AlignStartVertical],
      ["Panning Position Builder", "Plan a stereo image", AlignVerticalDistributeCenter],
      ["Stereo Width Planner", "Mono-to-wide balance", Speaker],
      ["Sidechain Concept Planner", "Plan sidechain routing", Zap],
      ["Mix Reference Track Comparator", "A/B against references", Headphones],
      ["Mastering Level Checklist", "Loudness and headroom checks", ListChecks],
      ["Signal Flow Diagram Builder", "Map your routing", AlignVerticalDistributeEnd],
      ["Production Checklist", "End-to-end release checks", ClipboardCheck],

    ]),
  },
  {
    name: "Music for Creators",
    description: "Licensing, distribution and metadata helpers",
    tools: mk([
      ["Royalty-Free Music Concept Builder", "Plan RF releases", Award],
      ["Sync Licensing Checklist", "Prep for sync placements", ClipboardList],
      ["Jingle Concept Planner", "Plan ad jingles", Megaphone],
      ["Podcast Background Music Builder", "Underscore for podcasts", Podcast],
      ["Intro/Outro Music Designer", "Brandable bumpers", Clapperboard],
      ["YouTube Music Strategy Planner", "Music for video creators", Youtube],
      ["Music Metadata Builder", "ID3 and metadata tags", Tags],
      ["Music Distribution Checklist", "Pre-distribution checks", Radio],
      ["Copyright Registration Guide", "How to register works", AlignVerticalDistributeStart],
      ["Music Publishing Reference", "Publishing 101", AlignVerticalJustifyCenter],
      ["ISRC Code Generator", "Generate ISRC codes", Tag],
      ["ISWC Code Reference", "Understand ISWC codes", FileBadge],

    ]),
  },
  {
    name: "Music Education",
    description: "Flashcards, quizzes and learning references",
    tools: mk([
      ["Note Reading Flashcards", "Drill staff note reading", AlignVerticalJustifyEnd],
      ["Ear Training Interval Quiz", "Recognise intervals by ear", Mic2],
      ["Sight-Reading Rhythm Trainer", "Read rhythm at sight", AlignVerticalJustifyStart],
      ["Music History Timeline", "Eras, styles and composers", History],
      ["Composer Reference Library", "Browse great composers", AlignVerticalSpaceAround],
      ["Instrument Range Reference", "Ranges by instrument", AlignVerticalSpaceBetween],
      ["Time Signature Explorer", "Common and odd meters", Clock],
      ["Conducting Pattern Visualizer", "Beat patterns by meter", Ambulance],
      ["Music Vocabulary Reference", "Italian terms and more", Ampersand],
      ["Music Theory Worksheet Generator", "Printable theory worksheets", Ampersands],

    ]),
  },
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools);
export const totalTools = allTools.length;

export const findTool = (slug: string) => allTools.find((t) => (t as any).slug === slug);
export const findCategoryOfTool = (slug: string) =>
  categories.find((c) => c.tools.some((t) => (t as any).slug === slug));

export const SEARCH_REGISTRY: ToolResult[] = categories.flatMap((cat) =>
  cat.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    slug: tool.slug,
    href: `/music/tool/${tool.slug}`,
    category: cat.name,
    isBuilt: tool.status === "live",
  }))
);
