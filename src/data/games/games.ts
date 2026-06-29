import {
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
  type LucideIcon,
} from "lucide-react";

export type GameCategory = {
  name: string;
  icon: LucideIcon;
  subcategories: Record<string, string[]>;
};

export type Game = {
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  icon: LucideIcon;
};

export const slugify = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[''']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const CATEGORIES: GameCategory[] = [
  {
    name: "Puzzle Games",
    icon: Puzzle,
    subcategories: {
      "Number Puzzles": [
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
      ],
      "Logic Puzzles": [
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
      ],
      "Word & Grid Puzzles": [
        "Word Search",
        "Crossword",
        "Paint by Numbers",
        "Hexagonal Nonogram",
      ],
      "Spatial & Mechanical Puzzles": [
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
      ],
      "Riddles & Lateral Thinking": [
        "Einstein's Riddle",
        "Logic Grid Puzzle",
        "River Crossing Puzzle",
      ],
    },
  },
  {
    name: "Word Games",
    icon: Type,
    subcategories: {
      "Wordle Variants": [
        "Wordle",
        "Wordle Unlimited",
        "Wordle Hard Mode",
        "Dordle (2-word Wordle)",
        "Quordle (4-word Wordle)",
        "Octordle (8-word Wordle)",
      ],
      "Classic Word Games": [
        "Hangman",
        "Hangman (Topic Mode)",
        "Boggle Solitaire",
        "Word Sudoku",
        "Cryptogram",
        "Wordwheel",
        "Ghost (Letter-Adding Game)",
        "Word Snap",
        "Letter Tiles",
      ],
      "Word Building & Challenges": [
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
      ],
      "Vocabulary & Language": [
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
      ],
    },
  },
  {
    name: "Math & Number Games",
    icon: Calculator,
    subcategories: {
      "Arithmetic & Mental Math": [
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
      ],
      "Number Theory & Patterns": [
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
      ],
      "Applied Math": [
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
      ],
      "Number Systems": [
        "Roman Numerals Quiz",
        "Binary Conversion Game",
        "Hex / Octal Game",
        "Base Conversion Race",
      ],
    },
  },
  {
    name: "Card Games",
    icon: Spade,
    subcategories: {
      "Solitaire Variants": [
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
      ],
      "Casino Card Games": [
        "Blackjack Trainer",
        "Poker Hand Trainer",
        "Texas Hold'em Odds Trainer",
        "Video Poker",
      ],
      "Classic Card Games": [
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
      ],
    },
  },
  {
    name: "Board & Classic Games",
    icon: Crown,
    subcategories: {
      "Chess Variants": ["Chess", "Chess Puzzles", "Chess Openings Trainer"],
      "Draughts & Reversi": [
        "Checkers",
        "Draughts (International)",
        "Reversi (Othello)",
        "Othello 8x8",
      ],
      "Strategy Board Games": [
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
      ],
      "Family Board Games": [
        "Mancala",
        "Ludo (Local Multiplayer)",
        "Snakes & Ladders",
        "Halma",
        "Backgammon",
        "Cathedral Lite",
      ],
      "Deduction Games": ["Battleship", "Mastermind", "Bulls & Cows"],
    },
  },
  {
    name: "Arcade & Action Games",
    icon: Gamepad2,
    subcategories: {
      "Classic Arcade Clones": [
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
      ],
      "Ball & Breakout Games": [
        "Breakout (Arkanoid)",
        "Pong",
        "Brick Breaker",
        "Ball Bounce",
        "Pong Variants",
      ],
      "Endless & Runner Games": [
        "Flappy Bird Clone",
        "Endless Runner",
        "Geometry Dash Clone",
        "Doodle Jump Clone",
        "Gravity Flip Runner",
        "Tower Climb",
      ],
      "Shooter Games": [
        "Space Shooter",
        "Bullet Hell (Simple)",
        "Asteroid Dodge",
        "Laser Maze Arcade",
      ],
      "Casual Arcade Games": [
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
      ],
      "Platformer Games": [
        "2D Platformer",
        "Platform Puzzle",
        "Portal Clone (2D)",
      ],
      "Snake Variants": [
        "Neon Snake",
        "Turbo Snake",
        "Color Snake",
        "Snake (Walls Mode)",
      ],
      "Reflex Arcade": [
        "Reflex Tester",
        "Reaction Time Test",
        "Click Speed Test",
        "Dodge the Obstacles",
      ],
    },
  },
  {
    name: "Strategy & Tower Defense",
    icon: Castle,
    subcategories: {
      "Tower Defense": [
        "Tower Defense (Classic)",
        "Tower Defense (Maze)",
        "Tower Defense (Survival)",
        "Tower Defense (Sandbox)",
        "Castle Defense",
        "Zombie Tower Defense",
        "Space Tower Defense",
        "Medieval Tower Defense",
      ],
      "Turn-Based Strategy": [
        "Chess Tactics Puzzles",
        "Tactical Grid Battle",
        "War Strategy (Turn-Based)",
        "Risk Clone (Simple)",
        "Hex Strategy",
        "Auto Chess Lite",
        "Battle Simulator",
        "Army Balancer Game",
      ],
      "City & Civilization Builder": [
        "City Builder (Simple)",
        "Civilization Lite",
        "4X Lite (Explore, Expand, Exploit, Exterminate)",
        "Kingdom Management",
        "Resource Manager",
      ],
      "RPG & Dungeon": [
        "Dungeon Crawler (Turn-Based)",
        "Roguelike Lite",
        "Dungeon Map Generator Game",
        "Puzzle RPG",
      ],
    },
  },
  {
    name: "Idle & Clicker Games",
    icon: MousePointerClick,
    subcategories: {
      "Business & Economy Idle": [
        "Cookie Clicker",
        "Business Tycoon Idle",
        "Mining Clicker",
        "Bank Idle",
        "Tech Startup Idle",
        "Energy Empire Idle",
        "Prestige Idle",
        "Upgrade Rush",
      ],
      "Nature & Farm Idle": [
        "Farm Idle",
        "Forest Idle",
        "Ocean Idle",
        "Ant Colony Idle",
      ],
      "Sci-Fi & Fantasy Idle": [
        "Space Colony Idle",
        "Planet Builder Idle",
        "Time Clicker",
        "Magic Realm Idle",
        "Dungeon Idle",
      ],
      "Service & Lifestyle Idle": [
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
      ],
    },
  },
  {
    name: "Simulation Games",
    icon: Factory,
    subcategories: {
      "Finance & Business Sim": [
        "Stock Market Simulator",
        "Forex Trading Simulator",
        "Startup Simulator",
        "Real Estate Simulator",
        "Bank Manager",
      ],
      "Food & Retail Sim": [
        "Restaurant Simulator",
        "Shop Simulator",
        "Pizza Delivery Simulator",
        "Food Truck Simulator",
        "Supermarket Simulator",
        "Coffee Shop Simulator",
      ],
      "Transport & Logistics Sim": [
        "Airline Manager",
        "Railway Manager",
        "Port Manager",
        "Taxi Company Simulator",
        "Logistics Manager",
      ],
      "City & Infrastructure Sim": [
        "Hotel Manager",
        "City Traffic Simulator",
        "Power Grid Manager",
        "Water Supply Manager",
      ],
      "Agriculture & Environment Sim": [
        "Farming Simulator",
        "Eco Farm Simulator",
        "Fishing Village Sim",
        "Medieval Village Sim",
      ],
      "Science & Space Sim": [
        "Space Station Manager",
        "Solar System Sandbox",
        "Weather Simulator",
        "Ecosystem Simulator",
        "Gravity Simulator",
        "Particle Physics Sandbox",
        "Ant Colony Simulator",
        "Conway's Game of Life",
      ],
      "Hospitality & Service Sim": [
        "Hospital Simulator",
        "School Manager",
        "Library Manager",
        "Museum Curator Sim",
      ],
    },
  },
  {
    name: "Quiz & Trivia Games",
    icon: HelpCircle,
    subcategories: {
      "Geography Quiz": [
        "Geography Quiz",
        "Flag Quiz",
        "Capital Cities Quiz",
        "Country Shape Quiz",
        "Map Pin Quiz",
        "World Rivers Quiz",
        "Mountain Peaks Quiz",
        "Ocean Quiz",
        "Continent Quiz",
      ],
      "History Quiz": [
        "History Quiz (World)",
        "History Quiz (Ancient)",
        "History Quiz (Modern)",
        "Year Guesser (Historical Events)",
        "Decade Quiz",
        "Timeline Ordering Game",
      ],
      "Science Quiz": [
        "Science Quiz (General)",
        "Biology Quiz",
        "Chemistry Quiz",
        "Physics Quiz",
        "Astronomy Quiz",
        "Human Body Quiz",
        "Famous Inventors Quiz",
        "Famous Scientists Quiz",
      ],
      "Arts & Culture Quiz": [
        "Art History Quiz",
        "Music Theory Quiz",
        "Movie Year Quiz",
        "Guess the Movie Genre",
        "Book Title Quiz",
        "Author Quiz",
        "Famous Quotes Quiz",
        "Who Said It Quiz",
      ],
      "Sports Quiz": [
        "Sports Facts Quiz",
        "Cricket Quiz",
        "Football (Soccer) Quiz",
        "Olympics Quiz",
      ],
      "Brand & Pop Culture Quiz": [
        "Logo Quiz",
        "Car Brand Quiz",
        "Emoji Quiz",
        "Food & Cuisine Quiz",
      ],
      "Nature & General Quiz": [
        "Animal Kingdom Quiz",
        "Plant Quiz",
        "Color Name Quiz",
        "Language Quiz (What Language Is This?)",
        "Number Trivia Quiz",
      ],
      "Game Show Style": [
        "True or False Trivia",
        "Odd One Out Quiz",
        "Fill the Blank Trivia",
        "Math Quiz",
        "Times Tables Quiz",
      ],
    },
  },
  {
    name: "Memory & Brain Games",
    icon: Brain,
    subcategories: {
      "Visual Memory": [
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
      ],
      "Sequence Memory": [
        "Sequence Recall",
        "Simon Says",
        "Sound Sequence Memory",
        "Color Sequence Memory",
        "Dual N-Back Lite",
        "Corsi Block Tapping",
      ],
      "Number & Word Memory": [
        "Number Recall",
        "Word Recall",
        "Digit Span Test",
        "Position Memory",
        "Object List Memory",
        "Pi Digits Memory",
        "Face Recognition Memory",
      ],
      "Cognitive Tests": [
        "Odd One Out Memory",
        "Speed Memory Match",
        "Pairs (Expanded Deck)",
        "Stroop Test",
        "Flanker Task",
        "Task Switching Game",
        "Mental Rotation Game",
        "Visual Attention Test",
      ],
    },
  },
  {
    name: "Typing Games",
    icon: Keyboard,
    subcategories: {
      "Speed & Accuracy Tests": [
        "Typing Speed Test (WPM)",
        "Typing Accuracy Test",
        "Paragraph Typing Test",
        "Custom Text Typing Test",
        "Blind Typing Test",
        "Typing Leaderboard (Local)",
      ],
      "Typing Trainers": [
        "Typing Race",
        "Finger Placement Trainer",
        "Home Row Drill",
        "Punctuation Typing Test",
        "Number Row Typing Test",
        "Code Typing Practice",
        "Capital Letters Typing",
        "Symbol Typing Challenge",
        "QWERTY vs Dvorak Trainer",
      ],
      "Typing Games (Action)": [
        "Typing Shooter",
        "Typing Adventure",
        "Keyboard Challenge",
        "Typing vs Time",
        "Typing Zen Mode",
        "Rapid Fire Typing",
      ],
    },
  },
  {
    name: "Drawing & Creative Games",
    icon: Palette,
    subcategories: {
      "Pixel Art": [
        "Pixel Art Editor",
        "Mini Pixel Art Challenges",
        "Color by Number",
        "Dot-to-Dot Generator",
        "ASCII Art Creator",
      ],
      "Drawing Tools & Games": [
        "MS Paint Clone",
        "Etch-a-Sketch",
        "Symmetry Drawing Game",
        "Doodle Guesser (Solo)",
        "Pictionary Solo Mode",
        "Reverse Pictionary",
        "Emoji Art Builder",
      ],
      "Generative & Procedural Art": [
        "Spirograph Generator",
        "Kaleidoscope Drawer",
        "Mandala Creator",
        "Abstract Art Generator",
        "Fractal Explorer",
        "L-System Art Generator",
        "Turtle Graphics Game",
        "Geometric Pattern Maker",
      ],
    },
  },
  {
    name: "Educational Games",
    icon: GraduationCap,
    subcategories: {
      "Science & Chemistry": [
        "Periodic Table Quiz",
        "Element Symbol Game",
        "Molecule Builder",
        "Chemical Equation Balancer Game",
        "Nutrition Facts Game",
      ],
      "Physics & Engineering": [
        "Newton's Laws Simulation",
        "Simple Machines Game",
        "Electricity Circuit Builder",
        "Force & Motion Game",
        "Projectile Motion Sim",
        "Optics Ray Diagram Game",
        "Wave Interference Sim",
      ],
      "Computer Science": [
        "Coding Puzzle (Block-Based)",
        "Binary Logic Gates Game",
        "Algorithm Visualizer Game",
        "Sorting Race (Visualizer)",
        "Pathfinding Game",
        "Regex Pattern Game",
        "Boolean Algebra Game",
      ],
      "Language & Literacy": [
        "Language Vocabulary Builder",
        "Verb Conjugation Game",
        "Grammar Correction Game",
        "Parts of Speech Tagger",
        "Punctuation Game",
        "Sentence Builder",
        "Reading Comprehension Quiz",
      ],
      "History & Geography": ["Timeline Ordering Game", "Map Labeling Game"],
      "Biology & Health": [
        "Ecosystem Food Chain Game",
        "Human Body Labeling",
        "Anatomy Quiz",
      ],
    },
  },
  {
    name: "Casino-Style Games (No Real Money)",
    icon: Dice5,
    subcategories: {
      "Table Game Simulators": [
        "Roulette Simulator",
        "Blackjack Trainer",
        "Baccarat Trainer",
        "Craps Simulator",
        "Pai Gow Trainer",
        "3 Card Poker Trainer",
      ],
      "Poker Trainers": [
        "Poker Trainer (Texas Hold'em)",
        "Poker Trainer (Omaha)",
        "Video Poker",
        "Card Counting Trainer",
        "Poker Odds Trainer",
      ],
      "Slot & Dice": [
        "Slot Machine Simulator",
        "Dice Probability Game",
        "Keno Simulator",
        "Lottery Odds Simulator",
      ],
      "Betting Strategy Games": [
        "Horse Race Betting Sim",
        "Sports Betting Sim (No Real Money)",
        "Casino Chips Manager",
        "Probability Calculator Game",
        "Expected Value Game",
      ],
    },
  },
  {
    name: "Reflex & Speed Games",
    icon: Zap,
    subcategories: {
      "Reaction Tests": [
        "Reaction Time Test",
        "Color Reaction Test",
        "Sound Reaction Test",
        "Pattern Reaction",
        "Reflex Arc Test",
        "Eye-Hand Coordination Test",
      ],
      "Click & Aim Games": [
        "Click Speed Test (CPS)",
        "Aim Trainer (2D)",
        "Target Click Game",
        "Balloon Pop Speed",
        "Number Click Order",
        "Letter Click Order",
      ],
      "Timed Challenges": [
        "Tap Timing Game",
        "Rhythm Tap Game",
        "Beat the Clock",
        "Speed Sort",
        "Quick Math Reflex",
        "Rapid Fire Quiz",
        "Rapid Color Match",
        "Anti-Distraction Focus Game",
      ],
    },
  },
  {
    name: "Ambient & Relaxing Games",
    icon: Waves,
    subcategories: {
      "Physics Sandboxes": [
        "Sand Falling Simulator",
        "Water Physics Sandbox",
        "Fluid Dynamics Lite",
        "Gravity Simulator",
        "Particle Physics Sandbox",
      ],
      "Cellular Automata": [
        "Conway's Game of Life (Interactive)",
        "Cellular Automata Explorer",
        "Langton's Ant",
        "Turing Pattern Sim",
      ],
      "Generative Visuals": [
        "Ambient Particle System",
        "Firefly Simulator",
        "Rain Sound Visualizer",
        "Lissajous Pattern Generator",
        "Wave Interference Sim",
        "Color Gradient Explorer",
        "Perlin Noise Explorer",
        "Procedural Landscape Generator",
        "Generative Art Loop",
      ],
      "Zen & Coloring": [
        "Bubble Wrap Popper",
        "Zen Garden Simulator",
        "Mandala Coloring",
        "Adult Coloring Book",
      ],
    },
  },
  {
    name: "Novelty & Misc Games",
    icon: Sparkles,
    subcategories: {
      "Guessing Games": [
        "20 Questions (AI Guess)",
        "Higher or Lower (Number)",
        "Higher or Lower (Price of Things)",
        "Hot or Cold (Number)",
        "Odd or Even Blitz",
        "Rock Paper Scissors (vs AI)",
        "Rock Paper Scissors Lizard Spock",
      ],
      "Personality & IQ Games": [
        "Personality Quiz Game",
        "Which X Are You? Quiz",
        "Color Personality Test",
        "Left Brain / Right Brain Test",
        "IQ Style Pattern Test",
        "Shape Rotation IQ",
        "Spatial Reasoning Game",
      ],
      "Fun & Novelty": [
        "Magic 8-Ball",
        "Fortune Cookie Generator",
        "Astrology Mini Game",
        "Name Generator Game",
        "Character Creator Lite",
        "Truth or Dare Generator (Solo)",
      ],
      "Meta & Gacha": [
        "Loot Box Simulator (No Purchases)",
        "Gacha Pull Simulator",
        "Achievement Unlocked (Meta-Game)",
        "Idle Prestige Game",
      ],
    },
  },
];

export const PRIORITY_GAMES = [
  "Sudoku",
  "Wordle",
  "Crossword",
  "Chess",
  "Checkers",
  "Tic-Tac-Toe",
  "Connect Four",
  "Solitaire (Klondike)",
  "Snake",
  "Tetris",
  "Minesweeper",
  "Hangman",
  "Typing Speed Test (WPM)",
  "Memory Card Match",
  "Geography Quiz",
  "Flag Quiz",
  "Mental Math Challenge",
  "Stock Market Simulator",
  "Business Tycoon Idle",
  "Cookie Clicker",
];

let _allGames: Game[] | null = null;
let _bySlug: Map<string, Game> | null = null;

export const getAllGames = (): Game[] => {
  if (_allGames) return _allGames;
  const seen = new Set<string>();
  const games: Game[] = [];
  for (const category of CATEGORIES) {
    for (const [subcategory, titles] of Object.entries(category.subcategories)) {
      for (const title of titles) {
        let slug = slugify(title);
        // Some titles repeat across categories — keep first occurrence unique.
        if (seen.has(slug)) {
          slug = `${slug}-${slugify(category.name)}`;
        }
        seen.add(slug);
        games.push({
          slug,
          title,
          category: category.name,
          subcategory,
          icon: category.icon,
        });
      }
    }
  }
  _allGames = games;
  return games;
};

export const getGameBySlug = (slug: string): Game | undefined => {
  if (!_bySlug) {
    _bySlug = new Map(getAllGames().map((g) => [g.slug, g]));
  }
  return _bySlug.get(slug);
};

export const getCategories = () => CATEGORIES;

export const getGamesByCategory = (categoryName: string): Game[] =>
  getAllGames().filter((g) => g.category === categoryName);

export const searchGames = (query: string): Game[] => {
  const q = query.trim().toLowerCase();
  if (!q) return getAllGames();
  return getAllGames().filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.subcategory.toLowerCase().includes(q),
  );
};

export const getTotalGameCount = (): number => getAllGames().length;
