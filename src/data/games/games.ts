import { ToolResult } from "@/components/CategorySearch";
import {
  type LucideIcon,
  Puzzle,
  Type,
  Calculator,
  Spade,
  Crown,
  Gamepad2,
  Castle,
  MousePointerClick,
  Factory,
  HelpCircle,
  Brain,
  Keyboard,
  Palette,
  GraduationCap,
  Dice5,
  Zap,
  Waves,
  Sparkles,
  ALargeSmall,
  Activity,
  AlarmClockCheck,
  AlarmClockMinus,
  AlarmClockOff,
  AlarmClockPlus,
  AlarmMinus,
  AlarmPlus,
  AlarmSmoke,
  Album,
  AlignCenter,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignHorizontalDistributeStart,
  AlignHorizontalJustifyStart,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalDistributeStart,
  AlignVerticalJustifyStart,
  BadgeJapaneseYen,
  BetweenHorizonalStart,
  BetweenHorizontalStart,
  BetweenVerticalStart,
  Binary,
  BookHeart,
  BookType,
  BrainCircuit,
  BrainCog,
  Brush,
  BugPlay,
  Building,
  Building2,
  ClipboardType,
  Club,
  DatabaseZap,
  Eye,
  FileQuestion,
  FileText,
  FileType,
  FileType2,
  Flag,
  FlagOff,
  FlaskConical,
  FlaskConicalOff,
  FlaskRound,
  Gamepad,
  Hash,
  ImagePlay,
  Joystick,
  Lightbulb,
  ListRestart,
  ListStart,
  MailQuestion,
  MonitorPlay,
  MoonStar,
  MousePointer,
  MousePointer2,
  MousePointerBan,
  Paintbrush,
  Paintbrush2,
  PaintbrushVertical,
  Play,
  PlugZap,
  PlugZap2,
  Rocket,
  Shield,
  ShieldAlert,
  ShieldBan,
  ShieldCheck,
  ShieldQuestion,
  Sigma,
  Star,
  StarHalf,
  StarOff,
  Stars,
  Swords,
  Target,
  TextCursor,
  Trophy,
  TvMinimalPlay,
  TypeOutline,
  Wand2,
} from "lucide-react";

export type GameSubcategory = {
  name: string;
  icon: LucideIcon;
  games: string[];
};

export type GameCategory = {
  name: string;
  icon: LucideIcon;
  subcategories: GameSubcategory[];
};

export type Game = {
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  icon: LucideIcon;
};

import { toSlug } from "@/lib/utils/slug";
export const slugify = toSlug;

export const CATEGORIES: GameCategory[] = [
  {
    name: "Puzzle Games",
    icon: Puzzle,
    subcategories: [
      {
        name: "Number Puzzles",
        icon: Hash,
        games: [
          "Sudoku",
          "Killer Sudoku",
          "Samurai Sudoku",
          "Sudoku X",
          "Hyper Sudoku",
          "Mini Sudoku (4x4)",
          "Kakuro",
          "Futoshiki",
          "Binairo",
          "Suguru",
          "Str8ts",
          "Fillomino",
        ]
      },
      {
        name: "Logic Puzzles",
        icon: BrainCircuit,
        games: [
          "Minesweeper",
          "Nonogram (Picross)",
          "Hitori",
          "Nurikabe",
          "Slitherlink",
          "Masyu",
          "Thermometers Puzzle",
          "Skyscrapers",
          "Akari (Light Up)",
          "Shikaku",
          "Tapa",
          "Loop Finder",
          "Hashi (Bridges)",
          "Ripple Effect",
          "ABC Pathfinder",
        ]
      },
      {
        name: "Word & Grid Puzzles",
        icon: BrainCog,
        games: [
          "Word Search",
          "Crossword",
          "Paint by Numbers",
          "Hexagonal Nonogram",
        ]
      },
      {
        name: "Spatial & Mechanical Puzzles",
        icon: Lightbulb,
        games: [
          "Jigsaw Puzzle",
          "Sliding Puzzle (15-puzzle)",
          "Tangram",
          "Pipe Puzzle",
          "Connect Dots (Numberlink)",
          "Maze Solver",
          "Sokoban",
          "Rush Hour Puzzle",
          "Tower of Hanoi",
          "Peg Solitaire",
          "Lights Out",
          "Pentomino Puzzle",
          "Dots and Boxes",
        ]
      },
      {
        name: "Riddles & Lateral Thinking",
        icon: AlignHorizontalDistributeStart,
        games: [
          "Einstein's Riddle",
          "Logic Grid Puzzle",
          "River Crossing Puzzle",
        ]
      },
    ]
  },
  {
    name: "Word Games",
    icon: Type,
    subcategories: [
      {
        name: "Wordle Variants",
        icon: BookType,
        games: [
          "Wordle",
          "Wordle Unlimited",
          "Wordle Hard Mode",
          "Dordle (2-word Wordle)",
          "Quordle (4-word Wordle)",
          "Octordle (8-word Wordle)",
        ]
      },
      {
        name: "Classic Word Games",
        icon: ClipboardType,
        games: [
          "Hangman",
          "Hangman (Topic Mode)",
          "Boggle Solitaire",
          "Word Sudoku",
          "Cryptogram",
          "Wordwheel",
          "Ghost (Letter-Adding Game)",
          "Word Snap",
          "Letter Tiles",
        ]
      },
      {
        name: "Word Building & Challenges",
        icon: FileType,
        games: [
          "Anagram Solver Game",
          "Unscramble Words",
          "Word Chain (Word Ladder)",
          "Word Connect",
          "Word Scramble",
          "Word Jumble",
          "Word Unscrambler Race",
          "Missing Letters",
          "Fill in the Blank",
          "4 Pics 1 Word Clone",
        ]
      },
      {
        name: "Vocabulary & Language",
        icon: AlignHorizontalJustifyStart,
        games: [
          "Spelling Bee",
          "Guess the Word",
          "Synonym Challenge",
          "Antonym Challenge",
          "Word Association",
          "Rhyme Time",
          "Compound Words",
          "Portmanteau Game",
          "Vocabulary Builder Game",
          "Parts of Speech Game",
          "Prefix / Suffix Challenge",
          "Palindrome Finder Game",
          "20 Questions (Word AI)",
          "Taboo Solo",
        ]
      },
    ]
  },
  {
    name: "Math & Number Games",
    icon: Calculator,
    subcategories: [
      {
        name: "Arithmetic & Mental Math",
        icon: Binary,
        games: [
          "Mental Math Challenge",
          "Arithmetic Sprint",
          "Multiplication Tables Race",
          "Division Challenge",
          "Order of Operations Quiz",
          "Speed Maths",
          "Maths Bingo",
          "24 Game (Make 24 with 4 numbers)",
          "Countdown Numbers Game",
          "Make 10",
          "Estimation War",
          "Rounding Challenge",
        ]
      },
      {
        name: "Number Theory & Patterns",
        icon: Sigma,
        games: [
          "Prime Number Hunt",
          "Factor Trees",
          "GCF & LCM Game",
          "Exponent Battle",
          "Number Sequence Game",
          "Pattern Recognition",
          "Missing Number",
          "Fibonacci Sequence Game",
          "Number Bond Game",
          "Number Memory",
          "Pi Digits Memory",
        ]
      },
      {
        name: "Applied Math",
        icon: AlignStartHorizontal,
        games: [
          "Fraction Duel",
          "Decimal Challenge",
          "Percentage Estimator Game",
          "Integer Operations",
          "Algebra Equation Game",
          "Geometry Shape Quiz",
          "Area & Perimeter Game",
          "Coordinate Plane Game",
          "2048",
          "Place Value Game",
        ]
      },
      {
        name: "Number Systems",
        icon: AlignStartVertical,
        games: [
          "Roman Numerals Quiz",
          "Binary Conversion Game",
          "Hex / Octal Game",
          "Base Conversion Race",
        ]
      },
    ]
  },
  {
    name: "Card Games",
    icon: Spade,
    subcategories: [
      {
        name: "Solitaire Variants",
        icon: AlignVerticalDistributeStart,
        games: [
          "Solitaire (Klondike)",
          "Spider Solitaire",
          "FreeCell",
          "Pyramid Solitaire",
          "Golf Solitaire",
          "TriPeaks Solitaire",
          "Yukon Solitaire",
          "Canfield Solitaire",
          "Forty Thieves",
          "Scorpion Solitaire",
        ]
      },
      {
        name: "Casino Card Games",
        icon: Club,
        games: [
          "Blackjack Trainer",
          "Poker Hand Trainer",
          "Texas Hold'em Odds Trainer",
          "Video Poker",
        ]
      },
      {
        name: "Classic Card Games",
        icon: BookHeart,
        games: [
          "Memory Card Match",
          "Snap",
          "War",
          "Go Fish",
          "Crazy Eights",
          "Old Maid",
          "Rummy",
          "Gin Rummy",
          "Cribbage",
          "Slapjack",
          "Speed (Spit)",
          "Concentration",
          "Palace (Card Game)",
          "Cheat (I Doubt It)",
          "UNO Clone",
        ]
      },
    ]
  },
  {
    name: "Board & Classic Games",
    icon: Crown,
    subcategories: [
      {
        name: "Chess Variants",
        icon: Swords,
        games: [
          "Chess",
          "Chess Puzzles",
          "Chess Openings Trainer",
        ]
      },
      {
        name: "Draughts & Reversi",
        icon: AlignVerticalJustifyStart,
        games: [
          "Checkers",
          "Draughts (International)",
          "Reversi (Othello)",
          "Othello 8x8",
        ]
      },
      {
        name: "Strategy Board Games",
        icon: Shield,
        games: [
          "Tic-Tac-Toe",
          "Connect Four",
          "Gomoku (5-in-a-row)",
          "Nine Men's Morris",
          "Fox & Hounds",
          "Hex (Board Game)",
          "Quoridor Lite",
          "Blokus Lite",
          "Amazons",
          "Havannah",
          "Go (9x9)",
          "Nim",
          "Sprouts",
        ]
      },
      {
        name: "Family Board Games",
        icon: ShieldAlert,
        games: [
          "Mancala",
          "Ludo (Local Multiplayer)",
          "Snakes & Ladders",
          "Halma",
          "Backgammon",
          "Cathedral Lite",
        ]
      },
      {
        name: "Deduction Games",
        icon: BetweenHorizonalStart,
        games: [
          "Battleship",
          "Mastermind",
          "Bulls & Cows",
        ]
      },
    ]
  },
  {
    name: "Arcade & Action Games",
    icon: Gamepad2,
    subcategories: [
      {
        name: "Classic Arcade Clones",
        icon: Gamepad,
        games: [
          "Snake",
          "Tetris",
          "Pac-Man Clone",
          "Asteroids Clone",
          "Galaga Clone",
          "Frogger Clone",
          "Centipede Clone",
          "Missile Command Clone",
          "Defender Clone",
          "Tempest Clone",
        ]
      },
      {
        name: "Ball & Breakout Games",
        icon: BetweenHorizontalStart,
        games: [
          "Breakout (Arkanoid)",
          "Pong",
          "Brick Breaker",
          "Ball Bounce",
          "Pong Variants",
        ]
      },
      {
        name: "Endless & Runner Games",
        icon: BetweenVerticalStart,
        games: [
          "Flappy Bird Clone",
          "Endless Runner",
          "Geometry Dash Clone",
          "Doodle Jump Clone",
          "Gravity Flip Runner",
          "Tower Climb",
        ]
      },
      {
        name: "Shooter Games",
        icon: BugPlay,
        games: [
          "Space Shooter",
          "Bullet Hell (Simple)",
          "Asteroid Dodge",
          "Laser Maze Arcade",
        ]
      },
      {
        name: "Casual Arcade Games",
        icon: Joystick,
        games: [
          "Whack-a-Mole",
          "Balloon Pop",
          "Catch the Falling Objects",
          "Fruit Slicer",
          "Bubble Shooter",
          "Zuma Clone",
          "Bejeweled Clone",
          "Match 3",
          "Match 4",
          "Candy Match",
          "Color Switch Clone",
        ]
      },
      {
        name: "Platformer Games",
        icon: Rocket,
        games: [
          "2D Platformer",
          "Platform Puzzle",
          "Portal Clone (2D)",
        ]
      },
      {
        name: "Snake Variants",
        icon: Flag,
        games: [
          "Neon Snake",
          "Turbo Snake",
          "Color Snake",
          "Snake (Walls Mode)",
        ]
      },
      {
        name: "Reflex Arcade",
        icon: DatabaseZap,
        games: [
          "Reflex Tester",
          "Reaction Time Test",
          "Click Speed Test",
          "Dodge the Obstacles",
        ]
      },
    ]
  },
  {
    name: "Strategy & Tower Defense",
    icon: Castle,
    subcategories: [
      {
        name: "Tower Defense",
        icon: FlagOff,
        games: [
          "Tower Defense (Classic)",
          "Tower Defense (Maze)",
          "Tower Defense (Survival)",
          "Tower Defense (Sandbox)",
          "Castle Defense",
          "Zombie Tower Defense",
          "Space Tower Defense",
          "Medieval Tower Defense",
        ]
      },
      {
        name: "Turn-Based Strategy",
        icon: ShieldBan,
        games: [
          "Chess Tactics Puzzles",
          "Tactical Grid Battle",
          "War Strategy (Turn-Based)",
          "Risk Clone (Simple)",
          "Hex Strategy",
          "Auto Chess Lite",
          "Battle Simulator",
          "Army Balancer Game",
        ]
      },
      {
        name: "City & Civilization Builder",
        icon: Building,
        games: [
          "City Builder (Simple)",
          "Civilization Lite",
          "4X Lite (Explore, Expand, Exploit, Exterminate)",
          "Kingdom Management",
          "Resource Manager",
        ]
      },
      {
        name: "RPG & Dungeon",
        icon: ImagePlay,
        games: [
          "Dungeon Crawler (Turn-Based)",
          "Roguelike Lite",
          "Dungeon Map Generator Game",
          "Puzzle RPG",
        ]
      },
    ]
  },
  {
    name: "Idle & Clicker Games",
    icon: MousePointerClick,
    subcategories: [
      {
        name: "Business & Economy Idle",
        icon: MousePointer,
        games: [
          "Cookie Clicker",
          "Business Tycoon Idle",
          "Mining Clicker",
          "Bank Idle",
          "Tech Startup Idle",
          "Energy Empire Idle",
          "Prestige Idle",
          "Upgrade Rush",
        ]
      },
      {
        name: "Nature & Farm Idle",
        icon: MousePointer2,
        games: [
          "Farm Idle",
          "Forest Idle",
          "Ocean Idle",
          "Ant Colony Idle",
        ]
      },
      {
        name: "Sci-Fi & Fantasy Idle",
        icon: MousePointerBan,
        games: [
          "Space Colony Idle",
          "Planet Builder Idle",
          "Time Clicker",
          "Magic Realm Idle",
          "Dungeon Idle",
        ]
      },
      {
        name: "Service & Lifestyle Idle",
        icon: TextCursor,
        games: [
          "Restaurant Idle",
          "City Idle",
          "Coffee Shop Idle",
          "Bakery Idle",
          "Gym Idle",
          "Theme Park Idle",
          "Zoo Idle",
          "Museum Idle",
          "Library Idle",
          "Hospital Idle",
          "School Idle",
          "Ore Miner Idle",
          "Factory Idle",
        ]
      },
    ]
  },
  {
    name: "Simulation Games",
    icon: Factory,
    subcategories: [
      {
        name: "Finance & Business Sim",
        icon: ListRestart,
        games: [
          "Stock Market Simulator",
          "Forex Trading Simulator",
          "Startup Simulator",
          "Real Estate Simulator",
          "Bank Manager",
        ]
      },
      {
        name: "Food & Retail Sim",
        icon: ListStart,
        games: [
          "Restaurant Simulator",
          "Shop Simulator",
          "Pizza Delivery Simulator",
          "Food Truck Simulator",
          "Supermarket Simulator",
          "Coffee Shop Simulator",
        ]
      },
      {
        name: "Transport & Logistics Sim",
        icon: MonitorPlay,
        games: [
          "Airline Manager",
          "Railway Manager",
          "Port Manager",
          "Taxi Company Simulator",
          "Logistics Manager",
        ]
      },
      {
        name: "City & Infrastructure Sim",
        icon: MoonStar,
        games: [
          "Hotel Manager",
          "City Traffic Simulator",
          "Power Grid Manager",
          "Water Supply Manager",
        ]
      },
      {
        name: "Agriculture & Environment Sim",
        icon: Play,
        games: [
          "Farming Simulator",
          "Eco Farm Simulator",
          "Fishing Village Sim",
          "Medieval Village Sim",
        ]
      },
      {
        name: "Science & Space Sim",
        icon: FlaskConical,
        games: [
          "Space Station Manager",
          "Solar System Sandbox",
          "Weather Simulator",
          "Ecosystem Simulator",
          "Gravity Simulator",
          "Particle Physics Sandbox",
          "Ant Colony Simulator",
          "Conway's Game of Life",
        ]
      },
      {
        name: "Hospitality & Service Sim",
        icon: Star,
        games: [
          "Hospital Simulator",
          "School Manager",
          "Library Manager",
          "Museum Curator Sim",
        ]
      },
    ]
  },
  {
    name: "Quiz & Trivia Games",
    icon: HelpCircle,
    subcategories: [
      {
        name: "Geography Quiz",
        icon: FileQuestion,
        games: [
          "Geography Quiz",
          "Flag Quiz",
          "Capital Cities Quiz",
          "Country Shape Quiz",
          "Map Pin Quiz",
          "World Rivers Quiz",
          "Mountain Peaks Quiz",
          "Ocean Quiz",
          "Continent Quiz",
        ]
      },
      {
        name: "History Quiz",
        icon: MailQuestion,
        games: [
          "History Quiz (World)",
          "History Quiz (Ancient)",
          "History Quiz (Modern)",
          "Year Guesser (Historical Events)",
          "Decade Quiz",
          "Timeline Ordering Game",
        ]
      },
      {
        name: "Science Quiz",
        icon: ShieldQuestion,
        games: [
          "Science Quiz (General)",
          "Biology Quiz",
          "Chemistry Quiz",
          "Physics Quiz",
          "Astronomy Quiz",
          "Human Body Quiz",
          "Famous Inventors Quiz",
          "Famous Scientists Quiz",
        ]
      },
      {
        name: "Arts & Culture Quiz",
        icon: Brush,
        games: [
          "Art History Quiz",
          "Music Theory Quiz",
          "Movie Year Quiz",
          "Guess the Movie Genre",
          "Book Title Quiz",
          "Author Quiz",
          "Famous Quotes Quiz",
          "Who Said It Quiz",
        ]
      },
      {
        name: "Sports Quiz",
        icon: StarHalf,
        games: [
          "Sports Facts Quiz",
          "Cricket Quiz",
          "Football (Soccer) Quiz",
          "Olympics Quiz",
        ]
      },
      {
        name: "Brand & Pop Culture Quiz",
        icon: StarOff,
        games: [
          "Logo Quiz",
          "Car Brand Quiz",
          "Emoji Quiz",
          "Food & Cuisine Quiz",
        ]
      },
      {
        name: "Nature & General Quiz",
        icon: Stars,
        games: [
          "Animal Kingdom Quiz",
          "Plant Quiz",
          "Color Name Quiz",
          "Language Quiz (What Language Is This?)",
          "Number Trivia Quiz",
        ]
      },
      {
        name: "Game Show Style",
        icon: Target,
        games: [
          "True or False Trivia",
          "Odd One Out Quiz",
          "Fill the Blank Trivia",
          "Math Quiz",
          "Times Tables Quiz",
        ]
      },
    ]
  },
  {
    name: "Memory & Brain Games",
    icon: Brain,
    subcategories: [
      {
        name: "Visual Memory",
        icon: BadgeJapaneseYen,
        games: [
          "Memory Card Match",
          "Pattern Recall",
          "Color Recall",
          "Symbol Recall",
          "Matrix Pattern Memory",
          "Spatial Memory Grid",
          "What Changed?",
          "Spot the Difference",
          "Hidden Objects",
          "Missing Object",
        ]
      },
      {
        name: "Sequence Memory",
        icon: Eye,
        games: [
          "Sequence Recall",
          "Simon Says",
          "Sound Sequence Memory",
          "Color Sequence Memory",
          "Dual N-Back Lite",
          "Corsi Block Tapping",
        ]
      },
      {
        name: "Number & Word Memory",
        icon: FileType2,
        games: [
          "Number Recall",
          "Word Recall",
          "Digit Span Test",
          "Position Memory",
          "Object List Memory",
          "Pi Digits Memory",
          "Face Recognition Memory",
        ]
      },
      {
        name: "Cognitive Tests",
        icon: Trophy,
        games: [
          "Odd One Out Memory",
          "Speed Memory Match",
          "Pairs (Expanded Deck)",
          "Stroop Test",
          "Flanker Task",
          "Task Switching Game",
          "Mental Rotation Game",
          "Visual Attention Test",
        ]
      },
    ]
  },
  {
    name: "Typing Games",
    icon: Keyboard,
    subcategories: [
      {
        name: "Speed & Accuracy Tests",
        icon: PlugZap,
        games: [
          "Typing Speed Test (WPM)",
          "Typing Accuracy Test",
          "Paragraph Typing Test",
          "Custom Text Typing Test",
          "Blind Typing Test",
          "Typing Leaderboard (Local)",
        ]
      },
      {
        name: "Typing Trainers",
        icon: TypeOutline,
        games: [
          "Typing Race",
          "Finger Placement Trainer",
          "Home Row Drill",
          "Punctuation Typing Test",
          "Number Row Typing Test",
          "Code Typing Practice",
          "Capital Letters Typing",
          "Symbol Typing Challenge",
          "QWERTY vs Dvorak Trainer",
        ]
      },
      {
        name: "Typing Games (Action)",
        icon: FileText,
        games: [
          "Typing Shooter",
          "Typing Adventure",
          "Keyboard Challenge",
          "Typing vs Time",
          "Typing Zen Mode",
          "Rapid Fire Typing",
        ]
      },
    ]
  },
  {
    name: "Drawing & Creative Games",
    icon: Palette,
    subcategories: [
      {
        name: "Pixel Art",
        icon: Paintbrush,
        games: [
          "Pixel Art Editor",
          "Mini Pixel Art Challenges",
          "Color by Number",
          "Dot-to-Dot Generator",
          "ASCII Art Creator",
        ]
      },
      {
        name: "Drawing Tools & Games",
        icon: Paintbrush2,
        games: [
          "MS Paint Clone",
          "Etch-a-Sketch",
          "Symmetry Drawing Game",
          "Doodle Guesser (Solo)",
          "Pictionary Solo Mode",
          "Reverse Pictionary",
          "Emoji Art Builder",
        ]
      },
      {
        name: "Generative & Procedural Art",
        icon: PaintbrushVertical,
        games: [
          "Spirograph Generator",
          "Kaleidoscope Drawer",
          "Mandala Creator",
          "Abstract Art Generator",
          "Fractal Explorer",
          "L-System Art Generator",
          "Turtle Graphics Game",
          "Geometric Pattern Maker",
        ]
      },
    ]
  },
  {
    name: "Educational Games",
    icon: GraduationCap,
    subcategories: [
      {
        name: "Science & Chemistry",
        icon: FlaskConicalOff,
        games: [
          "Periodic Table Quiz",
          "Element Symbol Game",
          "Molecule Builder",
          "Chemical Equation Balancer Game",
          "Nutrition Facts Game",
        ]
      },
      {
        name: "Physics & Engineering",
        icon: TvMinimalPlay,
        games: [
          "Newton's Laws Simulation",
          "Simple Machines Game",
          "Electricity Circuit Builder",
          "Force & Motion Game",
          "Projectile Motion Sim",
          "Optics Ray Diagram Game",
          "Wave Interference Sim",
        ]
      },
      {
        name: "Computer Science",
        icon: FlaskRound,
        games: [
          "Coding Puzzle (Block-Based)",
          "Binary Logic Gates Game",
          "Algorithm Visualizer Game",
          "Sorting Race (Visualizer)",
          "Pathfinding Game",
          "Regex Pattern Game",
          "Boolean Algebra Game",
        ]
      },
      {
        name: "Language & Literacy",
        icon: Wand2,
        games: [
          "Language Vocabulary Builder",
          "Verb Conjugation Game",
          "Grammar Correction Game",
          "Parts of Speech Tagger",
          "Punctuation Game",
          "Sentence Builder",
          "Reading Comprehension Quiz",
        ]
      },
      {
        name: "History & Geography",
        icon: ALargeSmall,
        games: [
          "Timeline Ordering Game",
          "Map Labeling Game",
        ]
      },
      {
        name: "Biology & Health",
        icon: Activity,
        games: [
          "Ecosystem Food Chain Game",
          "Human Body Labeling",
          "Anatomy Quiz",
        ]
      },
    ]
  },
  {
    name: "Casino-Style Games (No Real Money)",
    icon: Dice5,
    subcategories: [
      {
        name: "Table Game Simulators",
        icon: Building2,
        games: [
          "Roulette Simulator",
          "Blackjack Trainer",
          "Baccarat Trainer",
          "Craps Simulator",
          "Pai Gow Trainer",
          "3 Card Poker Trainer",
        ]
      },
      {
        name: "Poker Trainers",
        icon: AlarmClockCheck,
        games: [
          "Poker Trainer (Texas Hold'em)",
          "Poker Trainer (Omaha)",
          "Video Poker",
          "Card Counting Trainer",
          "Poker Odds Trainer",
        ]
      },
      {
        name: "Slot & Dice",
        icon: AlarmClockMinus,
        games: [
          "Slot Machine Simulator",
          "Dice Probability Game",
          "Keno Simulator",
          "Lottery Odds Simulator",
        ]
      },
      {
        name: "Betting Strategy Games",
        icon: ShieldCheck,
        games: [
          "Horse Race Betting Sim",
          "Sports Betting Sim (No Real Money)",
          "Casino Chips Manager",
          "Probability Calculator Game",
          "Expected Value Game",
        ]
      },
    ]
  },
  {
    name: "Reflex & Speed Games",
    icon: Zap,
    subcategories: [
      {
        name: "Reaction Tests",
        icon: PlugZap2,
        games: [
          "Reaction Time Test",
          "Color Reaction Test",
          "Sound Reaction Test",
          "Pattern Reaction",
          "Reflex Arc Test",
          "Eye-Hand Coordination Test",
        ]
      },
      {
        name: "Click & Aim Games",
        icon: AlarmClockOff,
        games: [
          "Click Speed Test (CPS)",
          "Aim Trainer (2D)",
          "Target Click Game",
          "Balloon Pop Speed",
          "Number Click Order",
          "Letter Click Order",
        ]
      },
      {
        name: "Timed Challenges",
        icon: AlarmClockPlus,
        games: [
          "Tap Timing Game",
          "Rhythm Tap Game",
          "Beat the Clock",
          "Speed Sort",
          "Quick Math Reflex",
          "Rapid Fire Quiz",
          "Rapid Color Match",
          "Anti-Distraction Focus Game",
        ]
      },
    ]
  },
  {
    name: "Ambient & Relaxing Games",
    icon: Waves,
    subcategories: [
      {
        name: "Physics Sandboxes",
        icon: AlarmMinus,
        games: [
          "Sand Falling Simulator",
          "Water Physics Sandbox",
          "Fluid Dynamics Lite",
          "Gravity Simulator",
          "Particle Physics Sandbox",
        ]
      },
      {
        name: "Cellular Automata",
        icon: AlarmPlus,
        games: [
          "Conway's Game of Life (Interactive)",
          "Cellular Automata Explorer",
          "Langton's Ant",
          "Turing Pattern Sim",
        ]
      },
      {
        name: "Generative Visuals",
        icon: AlarmSmoke,
        games: [
          "Ambient Particle System",
          "Firefly Simulator",
          "Rain Sound Visualizer",
          "Lissajous Pattern Generator",
          "Wave Interference Sim",
          "Color Gradient Explorer",
          "Perlin Noise Explorer",
          "Procedural Landscape Generator",
          "Generative Art Loop",
        ]
      },
      {
        name: "Zen & Coloring",
        icon: Album,
        games: [
          "Bubble Wrap Popper",
          "Zen Garden Simulator",
          "Mandala Coloring",
          "Adult Coloring Book",
        ]
      },
    ]
  },
  {
    name: "Novelty & Misc Games",
    icon: Puzzle,
    subcategories: [
      {
        name: "Guessing Games",
        icon: AlignCenter,
        games: [
          "20 Questions (AI Guess)",
          "Higher or Lower (Number)",
          "Higher or Lower (Price of Things)",
          "Hot or Cold (Number)",
          "Odd or Even Blitz",
          "Rock Paper Scissors (vs AI)",
          "Rock Paper Scissors Lizard Spock",
        ]
      },
      {
        name: "Personality & IQ Games",
        icon: AlignCenterHorizontal,
        games: [
          "Personality Quiz Game",
          "Which X Are You? Quiz",
          "Color Personality Test",
          "Left Brain / Right Brain Test",
          "IQ Style Pattern Test",
          "Shape Rotation IQ",
          "Spatial Reasoning Game",
        ]
      },
      {
        name: "Fun & Novelty",
        icon: AlignCenterVertical,
        games: [
          "Magic 8-Ball",
          "Fortune Cookie Generator",
          "Astrology Mini Game",
          "Name Generator Game",
          "Character Creator Lite",
          "Truth or Dare Generator (Solo)",
        ]
      },
      {
        name: "Meta & Gacha",
        icon: AlignEndHorizontal,
        games: [
          "Loot Box Simulator (No Purchases)",
          "Gacha Pull Simulator",
          "Achievement Unlocked (Meta-Game)",
          "Idle Prestige Game",
        ]
      },
    ]
  },
];


export const getAllGames = (): Game[] =>
  CATEGORIES.flatMap((cat) =>
    cat.subcategories.flatMap((sub) =>
      sub.games.map((title) => ({
        slug: slugify(title),
        title,
        category: cat.name,
        subcategory: sub.name,
        icon: sub.icon,
      }))
    )
  );

export const getCategories = (): GameCategory[] => CATEGORIES;

export const getGamesByCategory = (categoryName: string): Game[] => {
  const cat = CATEGORIES.find((c) => c.name === categoryName);
  if (!cat) return [];
  return cat.subcategories.flatMap(sub => 
      sub.games.map(title => ({
        slug: slugify(title),
        title,
        category: cat.name,
        subcategory: sub.name,
        icon: sub.icon,
      }))
  );
};

export const SEARCH_REGISTRY: ToolResult[] = CATEGORIES.flatMap((cat) =>
  cat.subcategories.flatMap(sub => 
    sub.games.map(title => ({
      name: title,
      description: `A ${sub.name.toLowerCase()} game`,
      slug: slugify(title),
      href: `/games/game/${slugify(title)}`,
      category: cat.name,
      isBuilt: false,
    }))
  )
);

export const searchGames = (query: string): Game[] => {
  const q = query.trim().toLowerCase();
  if (!q) return getAllGames();
  return getAllGames().filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.subcategory.toLowerCase().includes(q)
  );
};

export const getTotalGameCount = (): number => getAllGames().length;
