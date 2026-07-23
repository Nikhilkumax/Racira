import React from "react";

const gameComponents: Record<string, () => Promise<any>> = {
    // Number Puzzles
    "sudoku": () => import("@/domains/games/components/puzzle/SudokuGame"),
    "killer-sudoku": () => import("@/domains/games/components/puzzle/KillerSudokuGame"),
    "samurai-sudoku": () => import("@/domains/games/components/puzzle/SamuraiSudokuGame"),
    "sudoku-x": () => import("@/domains/games/components/puzzle/SudokuXGame"),
    "hyper-sudoku": () => import("@/domains/games/components/puzzle/HyperSudokuGame"),
    "mini-sudoku-4x4": () => import("@/domains/games/components/puzzle/MiniSudokuGame"),
    "kakuro": () => import("@/domains/games/components/puzzle/KakuroGame"),
    "futoshiki": () => import("@/domains/games/components/puzzle/FutoshikiGame"),
    "binairo": () => import("@/domains/games/components/puzzle/BinairoGame"),
    "suguru": () => import("@/domains/games/components/puzzle/SuguruGame"),
    "str8ts": () => import("@/domains/games/components/puzzle/Str8tsGame"),
    "fillomino": () => import("@/domains/games/components/puzzle/FillominoGame"),
    // Logic Puzzles
    "minesweeper": () => import("@/domains/games/components/puzzle/MinesweeperGame"),
    "nonogram-picross": () => import("@/domains/games/components/puzzle/NonogramGame"),
    "hitori": () => import("@/domains/games/components/puzzle/HitoriGame"),
    "nurikabe": () => import("@/domains/games/components/puzzle/NurikabeGame"),
    "slitherlink": () => import("@/domains/games/components/puzzle/SlitherlinkGame"),
    "masyu": () => import("@/domains/games/components/puzzle/MasyuGame"),
    "thermometers-puzzle": () => import("@/domains/games/components/puzzle/ThermometersGame"),
    "skyscrapers": () => import("@/domains/games/components/puzzle/SkyscrapersGame"),
    "akari-light-up": () => import("@/domains/games/components/puzzle/AkariGame"),
    "shikaku": () => import("@/domains/games/components/puzzle/ShikakuGame"),
    "tapa": () => import("@/domains/games/components/puzzle/TapaGame"),
    "loop-finder": () => import("@/domains/games/components/puzzle/LoopFinderGame"),
    "hashi-bridges": () => import("@/domains/games/components/puzzle/HashiGame"),
    "ripple-effect": () => import("@/domains/games/components/puzzle/RippleEffectGame"),
    "abc-pathfinder": () => import("@/domains/games/components/puzzle/AbcPathfinderGame"),
    // Word & Grid Puzzles
    "word-search": () => import("@/domains/games/components/puzzle/WordSearchGame"),
    "crossword": () => import("@/domains/games/components/puzzle/CrosswordGame"),
    "paint-by-numbers": () => import("@/domains/games/components/puzzle/PaintByNumbersGame"),
    "hexagonal-nonogram": () => import("@/domains/games/components/puzzle/HexNonogramGame"),
    // Spatial & Mechanical Puzzles
    "jigsaw-puzzle": () => import("@/domains/games/components/puzzle/JigsawGame"),
    "sliding-puzzle-15-puzzle": () => import("@/domains/games/components/puzzle/SlidingPuzzleGame"),
    "tangram": () => import("@/domains/games/components/puzzle/TangramGame"),
    "pipe-puzzle": () => import("@/domains/games/components/puzzle/PipePuzzleGame"),
    "connect-dots-numberlink": () => import("@/domains/games/components/puzzle/ConnectDotsGame"),
    "maze-solver": () => import("@/domains/games/components/puzzle/MazeSolverGame"),
    "sokoban": () => import("@/domains/games/components/puzzle/SokobanGame"),
    "rush-hour-puzzle": () => import("@/domains/games/components/puzzle/RushHourGame"),
    "tower-of-hanoi": () => import("@/domains/games/components/puzzle/TowerOfHanoiGame"),
    "peg-solitaire": () => import("@/domains/games/components/puzzle/PegSolitaireGame"),
    "lights-out": () => import("@/domains/games/components/puzzle/LightsOutGame"),
    "pentomino-puzzle": () => import("@/domains/games/components/puzzle/PentominoGame"),
    "dots-and-boxes": () => import("@/domains/games/components/puzzle/DotsAndBoxesGame"),
    // Riddles & Lateral Thinking
    "einsteins-riddle": () => import("@/domains/games/components/puzzle/EinsteinsRiddleGame"),
    "logic-grid-puzzle": () => import("@/domains/games/components/puzzle/LogicGridGame"),
    "river-crossing-puzzle": () => import("@/domains/games/components/puzzle/RiverCrossingGame"),
};

export const lazyGameComponents: Record<string, React.ComponentType> = Object.fromEntries(
    Object.entries(gameComponents).map(([slug, importFn]) => [
        slug,
        React.lazy(() => importFn().then((m) => ({ default: m.default }))),
    ])
);