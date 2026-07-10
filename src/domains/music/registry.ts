import { ToolResult } from "@/components/CategorySearch";

export type Tool = {
  name: string;
  slug: string;
  description: string;
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

const mk = (entries: [string, string][]): Tool[] =>
  entries.map(([name, description]) => ({ name, slug: slugify(name), description }));

export const categories: ToolCategory[] = [
  {
    name: "Beat Making & Drum Machines",
    description: "Sequencers, pads and groove builders for rhythm production",
    tools: mk([
      ["Step Sequencer Drum Machine", "Classic 16-step grid sequencer"],
      ["Beat Pad (MPC-style)", "Finger-drum style trigger pads"],
      ["Rhythm Pattern Builder", "Compose custom rhythm patterns"],
      ["Polyrhythm Generator", "Layer competing meters and pulses"],
      ["Metronome Tool", "Precise click with subdivisions"],
      ["Groove Quantizer", "Apply human groove templates"],
      ["Drum Pattern Library", "Browse genre drum patterns"],
      ["Swing Amount Tool", "Dial in shuffle and swing feel"],
      ["Trap Beat Builder", "Hi-hat rolls and 808 patterns"],
      ["Lo-Fi Beat Maker", "Dusty, mellow lo-fi grooves"],
      ["Breakbeat Editor", "Slice and rearrange breaks"],
      ["Percussion Arranger", "Layer auxiliary percussion"],
    ]),
  },
  {
    name: "Melody & Harmony",
    description: "Tools for writing and analysing melodic lines",
    tools: mk([
      ["Piano Roll Editor", "MIDI-style melody editing"],
      ["Melody Generator", "Idea sparks for melodic phrases"],
      ["Chord Progression Builder", "Stack chords into progressions"],
      ["Scale Explorer", "Visualise scales and modes"],
      ["Arpeggio Generator", "Build arpeggio patterns"],
      ["Melodic Motif Builder", "Develop reusable motifs"],
      ["Counterpoint Checker", "Verify species counterpoint rules"],
      ["Harmonic Analysis Tool", "Label functions and cadences"],
      ["Voice Leading Guide", "Smooth voice motion checker"],
      ["Call & Response Builder", "Pair antecedent and consequent phrases"],
      ["Interval Training Tool", "Ear training for intervals"],
      ["Transposition Tool", "Shift to any key"],
    ]),
  },
  {
    name: "Chord Tools",
    description: "Chord theory, lookup and substitution helpers",
    tools: mk([
      ["Chord Builder", "Construct chords from intervals"],
      ["Chord Finder", "Identify chords from notes"],
      ["Chord Inversion Explorer", "View all inversions"],
      ["Chord Substitution Finder", "Find tasteful substitutions"],
      ["Secondary Dominant Finder", "V/x dominant lookup"],
      ["Circle of Fifths Tool", "Interactive circle of fifths"],
      ["Chord Chart Builder", "Guitar and piano chord charts"],
      ["Nashville Number System Tool", "Number charts for any key"],
      ["Chord Progression Generator", "Generate fresh progressions"],
      ["Modulation Pathway Tool", "Pivot chord modulation paths"],
      ["Borrowed Chord Explorer", "Modal interchange chords"],
      ["Extended Chord Reference", "9ths, 11ths, 13ths and beyond"],
    ]),
  },
  {
    name: "Scales & Theory",
    description: "Scales, modes and theory references",
    tools: mk([
      ["Scale Library Browser", "Search hundreds of scales"],
      ["Mode Explorer", "Dorian, Phrygian and friends"],
      ["Pentatonic Scale Visualizer", "Major and minor pentatonics"],
      ["Exotic Scale Explorer", "World and synthetic scales"],
      ["Key Signature Reference", "All key signatures at a glance"],
      ["Relative Major/Minor Finder", "Find the relative key"],
      ["Parallel Key Comparator", "Compare parallel major and minor"],
      ["Note Frequency Reference", "Hz values for every note"],
      ["Pitch Class Set Explorer", "Set theory for atonal music"],
      ["Roman Numeral Analysis Tool", "Analyse with Roman numerals"],
      ["Music Theory Quiz", "Test your theory knowledge"],
      ["Interval Stack Builder", "Stack intervals into structures"],
    ]),
  },
  {
    name: "Composition & Arrangement",
    description: "Plan structure, orchestration and dynamics",
    tools: mk([
      ["Song Structure Planner", "Map sections of a song"],
      ["Verse-Chorus-Bridge Layout", "Classic pop form planner"],
      ["Arrangement Timeline Builder", "Plot instruments across time"],
      ["Orchestration Guide", "Pair instruments effectively"],
      ["Texture Layer Planner", "Plan textural layers"],
      ["Dynamic Curve Builder", "Shape arrangement dynamics"],
      ["Motif Development Tool", "Develop themes across sections"],
      ["Tension & Release Planner", "Map tension arcs"],
      ["Intro & Outro Builder", "Craft strong openings and endings"],
      ["Transition Technique Reference", "Library of section transitions"],
      ["Musical Form Reference", "Sonata, rondo, AABA and more"],
      ["Remix Structure Planner", "Plan remix arrangements"],
    ]),
  },
  {
    name: "Sound Design",
    description: "Synthesis, modulation and effects design",
    tools: mk([
      ["Synthesizer Patch Builder", "Web Audio patch designer"],
      ["Oscillator Type Comparator", "Compare waveforms by ear"],
      ["Filter Type Explorer", "Low/high/band/notch filters"],
      ["ADSR Envelope Builder", "Shape attack, decay, sustain, release"],
      ["LFO Pattern Builder", "Design modulation shapes"],
      ["Modulation Matrix Planner", "Route modulation sources"],
      ["FM Synthesis Patch Builder", "Operator-based FM design"],
      ["Wavetable Concept Builder", "Plan wavetable morphs"],
      ["Effects Chain Designer", "Order your FX chain"],
      ["Reverb Impulse Response Selector", "Match spaces to sources"],
      ["Delay Tap Timing Calculator", "Tempo-synced delay times"],
      ["Sound Layering Tool", "Plan layered sound design"],
    ]),
  },
  {
    name: "Guitar & Bass Tools",
    description: "Fretboard, chords and patterns for stringed players",
    tools: mk([
      ["Guitar Chord Diagram Maker", "Draw guitar chord shapes"],
      ["Guitar Scale Diagram Maker", "Plot scales on the fretboard"],
      ["Guitar Fretboard Explorer", "Notes across the neck"],
      ["Guitar Tuner", "Web Audio chromatic tuner"],
      ["Guitar Chord Progression Player", "Hear progressions on guitar"],
      ["Guitar Tablature Builder", "Type and edit tabs"],
      ["Bass Line Builder", "Compose bass grooves"],
      ["Guitar Capo Position Calculator", "Find the right capo fret"],
      ["String Gauge Guide", "Pick gauges by tuning"],
      ["Guitar Mode Position Mapper", "CAGED-style mode positions"],
      ["Strumming Pattern Builder", "Design strum patterns"],
      ["Guitar Solo Pattern Generator", "Lick and solo ideas"],
    ]),
  },
  {
    name: "Piano & Keyboard",
    description: "Practice, theory and trainers for keys",
    tools: mk([
      ["Virtual Piano", "Playable Web Audio piano"],
      ["Piano Chord Visualizer", "See chords on the keys"],
      ["Piano Scale Highlighter", "Highlight scales on a keyboard"],
      ["Piano Sight-Reading Trainer", "Practice reading notation"],
      ["Piano Interval Trainer", "Train interval recognition"],
      ["Piano Note Identifier", "Identify notes on the staff"],
      ["Keyboard Shortcut Map Builder", "Custom keyboard control maps"],
      ["Piano Technique Exercise Builder", "Build practice routines"],
    ]),
  },
  {
    name: "Notation & Scoring",
    description: "Lead sheets, tabs and score formatting",
    tools: mk([
      ["Music Notation Tool", "Browser-based ABC notation"],
      ["Lead Sheet Builder", "Melody plus chord symbols"],
      ["Chord Chart Formatter", "Clean chord chart layouts"],
      ["Drum Notation Reference", "Standard drum notation"],
      ["Music Symbol Reference", "Every common symbol"],
      ["Tablature Formatter", "Format tabs for print"],
      ["Fake Book Page Builder", "Real Book style pages"],
      ["Lyric Sheet Formatter", "Clean lyric layouts"],
      ["Score Layout Tool", "Set page and system spacing"],
      ["Transposing Score Tool", "Shift scores to any key"],
    ]),
  },
  {
    name: "Production & Mixing",
    description: "Workflow guides for mix and master",
    tools: mk([
      ["Gain Staging Guide", "Healthy levels at every stage"],
      ["Mix Level Reference", "Target levels per element"],
      ["Frequency Spectrum Planner", "Carve space across the spectrum"],
      ["Panning Position Builder", "Plan a stereo image"],
      ["Stereo Width Planner", "Mono-to-wide balance"],
      ["Sidechain Concept Planner", "Plan sidechain routing"],
      ["Mix Reference Track Comparator", "A/B against references"],
      ["Mastering Level Checklist", "Loudness and headroom checks"],
      ["Signal Flow Diagram Builder", "Map your routing"],
      ["Production Checklist", "End-to-end release checks"],
    ]),
  },
  {
    name: "Music for Creators",
    description: "Licensing, distribution and metadata helpers",
    tools: mk([
      ["Royalty-Free Music Concept Builder", "Plan RF releases"],
      ["Sync Licensing Checklist", "Prep for sync placements"],
      ["Jingle Concept Planner", "Plan ad jingles"],
      ["Podcast Background Music Builder", "Underscore for podcasts"],
      ["Intro/Outro Music Designer", "Brandable bumpers"],
      ["YouTube Music Strategy Planner", "Music for video creators"],
      ["Music Metadata Builder", "ID3 and metadata tags"],
      ["Music Distribution Checklist", "Pre-distribution checks"],
      ["Copyright Registration Guide", "How to register works"],
      ["Music Publishing Reference", "Publishing 101"],
      ["ISRC Code Generator", "Generate ISRC codes"],
      ["ISWC Code Reference", "Understand ISWC codes"],
    ]),
  },
  {
    name: "Music Education",
    description: "Flashcards, quizzes and learning references",
    tools: mk([
      ["Note Reading Flashcards", "Drill staff note reading"],
      ["Ear Training Interval Quiz", "Recognise intervals by ear"],
      ["Sight-Reading Rhythm Trainer", "Read rhythm at sight"],
      ["Music History Timeline", "Eras, styles and composers"],
      ["Composer Reference Library", "Browse great composers"],
      ["Instrument Range Reference", "Ranges by instrument"],
      ["Time Signature Explorer", "Common and odd meters"],
      ["Conducting Pattern Visualizer", "Beat patterns by meter"],
      ["Music Vocabulary Reference", "Italian terms and more"],
      ["Music Theory Worksheet Generator", "Printable theory worksheets"],
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
    isBuilt: false,
  }))
);
