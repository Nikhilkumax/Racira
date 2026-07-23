const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "src", "domains", "games", "components", "puzzle");
fs.mkdirSync(dir, { recursive: true });

const games = {
    "WordSearchGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const GRID = [
    ["R", "A", "C", "I", "R", "A"],
    ["P", "U", "Z", "Z", "L", "E"],
    ["G", "A", "M", "E", "S", "F"],
    ["W", "O", "R", "D", "S", "U"],
    ["S", "E", "A", "R", "C", "H"],
    ["F", "I", "N", "D", "S", "N"],
];

const WORDS = ["RACIRA", "PUZZLE", "GAMES", "WORD", "SEARCH", "FIND"];

export default function WordSearchGame() {
    const [found, setFound] = useState<Set<string>>(new Set());
    const [selecting, setSelecting] = useState<[number, number] | null>(null);
    const [selected, setSelected] = useState<[number, number][]>([]);

    const startSelect = (r: number, c: number) => {
        setSelecting([r, c]);
        setSelected([[r, c]]);
    };

    const endSelect = (r: number, c: number) => {
        if (!selecting) return;
        const [sr, sc] = selecting;
        const word = selected.map(([r, c]) => GRID[r][c]).join("");
        if (WORDS.includes(word)) {
            setFound(new Set([...found, word]));
        }
        setSelecting(null);
        setSelected([]);
    };

    const onEnter = (r: number, c: number) => {
        if (!selecting) return;
        const [sr, sc] = selecting;
        const dr = Math.sign(r - sr);
        const dc = Math.sign(c - sc);
        const cells: [number, number][] = [];
        let cr = sr, cc = sc;
        while (true) {
            cells.push([cr, cc]);
            if (cr === r && cc === c) break;
            cr += dr; cc += dc;
        }
        setSelected(cells);
    };

    return (
        <PuzzleWrapper title="Word Search" subcategory="Word & Grid Puzzles" subcategorySlug="word-grid-puzzles"
            instructions="Find and select the hidden words. Click and drag from first to last letter."
            onReset={() => { setFound(new Set()); setSelected([]); setSelecting(null); }}
            status={[{ label: "Found", value: found.size + "/" + WORDS.length }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap gap-2 justify-center">
                    {WORDS.map((w) => (
                        <span key={w} className={"px-2 py-1 rounded text-sm font-semibold " + (found.has(w) ? "bg-green-500/20 text-green-600 line-through" : "bg-muted/30")}>{w}</span>
                    ))}
                </div>
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {GRID.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((letter, c) => {
                                const isSel = selected.some(([sr, sc]) => sr === r && sc === c);
                                return (
                                    <button key={c}
                                        onMouseDown={() => startSelect(r, c)}
                                        onMouseUp={() => endSelect(r, c)}
                                        onMouseEnter={() => onEnter(r, c)}
                                        className={"w-10 h-10 flex items-center justify-center font-bold border border-border " + (isSel ? "bg-primary/40" : "bg-card hover:bg-accent")}>
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "CrosswordGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const GRID = [
    ["C", "A", "T", ""],
    ["O", "", "", ""],
    ["D", "O", "G", ""],
    ["E", "", "", ""],
];

const CLUES = {
    across: { 1: "Feline pet", 3: "Canine pet" },
    down: { 1: "Fish egg", 2: "Feline pet" },
};

export default function CrosswordGame() {
    const [answers, setAnswers] = useState<string[][]>(() => GRID.map((r) => r.map(() => ""));
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const set = (letter: string) => {
        if (!selected) return;
        const [r, c] = selected;
        if (GRID[r][c] === "") return;
        const next = answers.map((row) => [...row]);
        next[r][c] = letter.toUpperCase();
        setAnswers(next);
    };

    return (
        <PuzzleWrapper title="Crossword" subcategory="Word & Grid Puzzles" subcategorySlug="word-grid-puzzles"
            instructions="Fill in the crossword grid. Click a cell to select it, then type a letter."
            onReset={() => { setAnswers(GRID.map((r) => r.map(() => ""))); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {GRID.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isBlack = cell === "";
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                return (
                                    <button key={c} onClick={() => !isBlack && setSelected([r, c])}
                                        className={"w-12 h-12 flex items-center justify-center font-bold border border-border " + (isBlack ? "bg-foreground" : isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                        {isBlack ? "" : answers[r][c]}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 flex-wrap justify-center max-w-xs">
                    {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
                        <GameButton key={l} onClick={() => set(l)} className="w-8 h-8 p-0 text-xs">{l}</GameButton>
                    ))}
                    <GameButton onClick={() => set("")} variant="ghost">Clear</GameButton>
                </div>
                <div className="text-sm text-muted-foreground">
                    Across: 1. {CLUES.across[1]} | 3. {CLUES.across[3]} | Down: 1. {CLUES.down[1]} | 2. {CLUES.down[2]}
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "PaintByNumbersGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SOLUTION = [
    [1, 0, 1, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1],
];

const ROW_CLUES = [[1, 1, 1], [3], [2, 2], [3], [1, 1, 1]];
const COL_CLUES = [[1, 1, 1], [3], [3], [3], [1, 1, 1]];

export default function PaintByNumbersGame() {
    const [grid, setGrid] = useState<number[][]>(() => SOLUTION.map((r) => r.map(() => 0)));

    const toggle = (r: number, c: number) => {
        const next = grid.map((row) => [...row]);
        next[r][c] = (next[r][c] + 1) % 2;
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Paint by Numbers" subcategory="Word & Grid Puzzles" subcategorySlug="word-grid-puzzles"
            instructions="Fill cells to match the number clues. Numbers show consecutive filled groups per row/column."
            onReset={() => { setGrid(SOLUTION.map((r) => r.map(() => 0))); }}
            status={[{ label: "Grid", value: "5x5" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex">
                    <div className="w-12" />
                    {COL_CLUES.map((clues, i) => (
                        <div key={i} className="w-10 flex flex-col items-center justify-end text-xs font-bold">
                            {clues.map((n, j) => <div key={j}>{n}</div>)}
                        </div>
                    ))}
                </div>
                {grid.map((row, r) => (
                    <div key={r} className="flex items-center">
                        <div className="w-12 flex justify-end text-xs font-bold pr-1">
                            {ROW_CLUES[r].map((n, j) => <span key={j} className="ml-1">{n}</span>)}
                        </div>
                        {row.map((cell, c) => (
                            <button key={c} onClick={() => toggle(r, c)}
                                className={"w-10 h-10 flex items-center justify-center border border-border " + (cell === 1 ? "bg-foreground" : "bg-muted/20 hover:bg-accent")}>
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </PuzzleWrapper>
    );
}
`,

    "HexNonogramGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SIZE = 5;

export default function HexNonogramGame() {
    const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));

    const toggle = (r: number, c: number) => {
        const next = grid.map((row) => [...row]);
        next[r][c] = (next[r][c] + 1) % 2;
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Hexagonal Nonogram" subcategory="Word & Grid Puzzles" subcategorySlug="word-grid-puzzles"
            instructions="Fill hexagonal cells to match the clues. Each row shows consecutive filled groups."
            onReset={() => { setGrid(Array.from({ length: SIZE }, () => Array(SIZE).fill(0))); }}
            status={[{ label: "Grid", value: SIZE + "x" + SIZE }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block">
                    {grid.map((row, r) => (
                        <div key={r} className="flex" style={{ marginLeft: r * 20 }}>
                            {row.map((cell, c) => (
                                <button key={c} onClick={() => toggle(r, c)}
                                    className={"w-10 h-10 flex items-center justify-center border border-border transform rotate-45 " + (cell === 1 ? "bg-foreground" : "bg-muted/20 hover:bg-accent")}>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click cells to fill/unfill.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "JigsawGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton, shuffle, range } from "./_shared";

const SIZE = 3;

export default function JigsawGame() {
    const [tiles, setTiles] = useState<number[]>(() => shuffle(range(SIZE * SIZE)));
    const [empty, setEmpty] = useState<number>(SIZE * SIZE - 1);

    const move = (idx: number) => {
        const r = Math.floor(idx / SIZE);
        const c = idx % SIZE;
        const er = Math.floor(empty / SIZE);
        const ec = empty % SIZE;
        if (Math.abs(r - er) + Math.abs(c - ec) !== 1) return;
        const next = [...tiles];
        [next[idx], next[empty]] = [next[empty], next[idx]];
        setTiles(next);
        setEmpty(idx);
    };

    const reset = () => { setTiles(shuffle(range(SIZE * SIZE))); setEmpty(SIZE * SIZE - 1); };

    return (
        <PuzzleWrapper title="Jigsaw Puzzle" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Arrange tiles in order. Click a tile adjacent to the empty space to slide it."
            onReset={reset}
            status={[{ label: "Grid", value: SIZE + "x" + SIZE }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {Array.from({ length: SIZE }, (_, r) => (
                        <div key={r} className="flex">
                            {Array.from({ length: SIZE }, (_, c) => {
                                const idx = r * SIZE + c;
                                const tile = tiles[idx];
                                return (
                                    <button key={c} onClick={() => move(idx)}
                                        className={"w-20 h-20 flex items-center justify-center text-2xl font-bold border border-border " + (tile === SIZE * SIZE - 1 ? "bg-transparent" : "bg-card hover:bg-accent")}>
                                        {tile === SIZE * SIZE - 1 ? "" : tile + 1}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "SlidingPuzzleGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton, shuffle, range } from "./_shared";

const SIZE = 4;

export default function SlidingPuzzleGame() {
    const [tiles, setTiles] = useState<number[]>(() => {
        const arr = shuffle(range(SIZE * SIZE));
        return arr;
    });
    const [empty, setEmpty] = useState<number>(() => tiles.indexOf(SIZE * SIZE - 1));

    const move = (idx: number) => {
        const r = Math.floor(idx / SIZE);
        const c = idx % SIZE;
        const er = Math.floor(empty / SIZE);
        const ec = empty % SIZE;
        if (Math.abs(r - er) + Math.abs(c - ec) !== 1) return;
        const next = [...tiles];
        [next[idx], next[empty]] = [next[empty], next[idx]];
        setTiles(next);
        setEmpty(idx);
    };

    const reset = () => {
        const arr = shuffle(range(SIZE * SIZE));
        setTiles(arr);
        setEmpty(arr.indexOf(SIZE * SIZE - 1));
    };

    const isSolved = tiles.every((t, i) => t === i);

    return (
        <PuzzleWrapper title="15 Puzzle (Sliding)" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Slide tiles to arrange them in order 1-15. Click a tile adjacent to the empty space."
            onReset={reset}
            status={[{ label: "State", value: isSolved ? "Solved!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {Array.from({ length: SIZE }, (_, r) => (
                        <div key={r} className="flex">
                            {Array.from({ length: SIZE }, (_, c) => {
                                const idx = r * SIZE + c;
                                const tile = tiles[idx];
                                return (
                                    <button key={c} onClick={() => move(idx)}
                                        className={"w-16 h-16 flex items-center justify-center text-xl font-bold border border-border " + (tile === SIZE * SIZE - 1 ? "bg-transparent" : "bg-card hover:bg-accent")}>
                                        {tile === SIZE * SIZE - 1 ? "" : tile + 1}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                {isSolved && <p className="text-green-500 font-bold">Solved! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
`,

    "TangramGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PIECES = [
    { id: 1, color: "bg-red-500/60", shape: "triangle" },
    { id: 2, color: "bg-blue-500/60", shape: "triangle" },
    { id: 3, color: "bg-green-500/60", shape: "square" },
    { id: 4, color: "bg-yellow-500/60", shape: "triangle" },
    { id: 5, color: "bg-purple-500/60", shape: "triangle" },
    { id: 6, color: "bg-pink-500/60", shape: "parallelogram" },
    { id: 7, color: "bg-orange-500/60", shape: "triangle" },
];

export default function TangramGame() {
    const [rotations, setRotations] = useState<Record<number, number>>({});

    const rotate = (id: number) => {
        setRotations({ ...rotations, [id]: ((rotations[id] || 0) + 45) % 360 });
    };

    return (
        <PuzzleWrapper title="Tangram" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Arrange the 7 pieces to form shapes. Click a piece to rotate it 45 degrees."
            onReset={() => setRotations({})}
            status={[{ label: "Pieces", value: String(PIECES.length) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-64 h-64 border-2 border-foreground rounded-lg bg-muted/10 flex flex-wrap items-center justify-center gap-2 p-4">
                    {PIECES.map((piece) => (
                        <button key={piece.id} onClick={() => rotate(piece.id)}
                            className={"w-16 h-16 " + piece.color + " rounded transform transition-transform"}
                            style={{ transform: "rotate(" + (rotations[piece.id] || 0) + "deg)" }}>
                        </button>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click pieces to rotate. Arrange to form the target shape.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "PipePuzzleGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton, range } from "./_shared";

const SIZE = 5;
const PIPES = ["└", "┘", "┌", "┐", "│", "─", "┤", "├", "┬", "┴", "┼"];

export default function PipePuzzleGame() {
    const [grid, setGrid] = useState<string[][]>(() => Array.from({ length: SIZE }, () => Array(SIZE).fill("─")));

    const cycle = (r: number, c: number) => {
        const next = grid.map((row) => [...row]);
        const idx = PIPES.indexOf(next[r][c]);
        next[r][c] = PIPES[(idx + 1) % PIPES.length];
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Pipe Puzzle" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Connect pipes from start to end. Click cells to cycle through pipe types."
            onReset={() => { setGrid(Array.from({ length: SIZE }, () => Array(SIZE).fill("─"))); }}
            status={[{ label: "Grid", value: SIZE + "x" + SIZE }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {grid.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((pipe, c) => (
                                <button key={c} onClick={() => cycle(r, c)}
                                    className="w-12 h-12 flex items-center justify-center text-2xl border border-border bg-card hover:bg-accent">
                                    {pipe}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click cells to cycle pipe types.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "ConnectDotsGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SIZE = 5;
const PAIRS = [
    { color: "bg-red-500", a: [0, 0], b: [4, 4] },
    { color: "bg-blue-500", a: [0, 4], b: [4, 0] },
];

export default function ConnectDotsGame() {
    const [paths, setPaths] = useState<Record<string, [number, number][]>>({});

    return (
        <PuzzleWrapper title="Connect Dots (Numberlink)" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Connect matching colored dots with paths. Paths cannot cross. Fill the entire grid."
            onReset={() => setPaths({})}
            status={[{ label: "Pairs", value: String(PAIRS.length) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {Array.from({ length: SIZE }, (_, r) => (
                        <div key={r} className="flex">
                            {Array.from({ length: SIZE }, (_, c) => {
                                const pair = PAIRS.find((p) => (p.a[0] === r && p.a[1] === c) || (p.b[0] === r && p.b[1] === c));
                                return (
                                    <div key={c} className={"w-12 h-12 flex items-center justify-center border border-border " + (pair ? pair.color : "bg-card")}>
                                        {pair ? "●" : ""}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Connect same-colored dots without crossing paths.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "MazeSolverGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton, range, randInt } from "./_shared";

const SIZE = 11;

function genMaze(): number[][] {
    const maze = Array.from({ length: SIZE }, () => Array(SIZE).fill(1));
    const stack: [number, number][] = [[1, 1]];
    maze[1][1] = 0;
    while (stack.length) {
        const [r, c] = stack[stack.length - 1];
        const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
        let moved = false;
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr > 0 && nr < SIZE - 1 && nc > 0 && nc < SIZE - 1 && maze[nr][nc] === 1) {
                maze[r + dr / 2][c + dc / 2] = 0;
                maze[nr][nc] = 0;
                stack.push([nr, nc]);
                moved = true;
                break;
            }
        }
        if (!moved) stack.pop();
    }
    maze[SIZE - 2][SIZE - 2] = 0;
    return maze;
}

export default function MazeSolverGame() {
    const [maze, setMaze] = useState<number[][]>(() => genMaze());
    const [player, setPlayer] = useState<[number, number]>([1, 1]);
    const [won, setWon] = useState(false);

    const move = (dr: number, dc: number) => {
        if (won) return;
        const [r, c] = player;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && maze[nr][nc] === 0) {
            setPlayer([nr, nc]);
            if (nr === SIZE - 2 && nc === SIZE - 2) setWon(true);
        }
    };

    const reset = () => { setMaze(genMaze()); setPlayer([1, 1]); setWon(false); };

    return (
        <PuzzleWrapper title="Maze Solver" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Navigate from top-left to bottom-right. Use buttons or arrow keys to move."
            onReset={reset}
            status={[{ label: "State", value: won ? "Won!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {maze.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isPlayer = player[0] === r && player[1] === c;
                                const isGoal = r === SIZE - 2 && c === SIZE - 2;
                                return (
                                    <div key={c} className={"w-8 h-8 flex items-center justify-center text-sm " + (cell === 1 ? "bg-foreground" : isPlayer ? "bg-blue-500" : isGoal ? "bg-green-500/40" : "bg-card")}>
                                        {isPlayer ? "●" : isGoal ? "★" : ""}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <div />
                    <GameButton onClick={() => move(-1, 0)}>↑</GameButton>
                    <div />
                    <GameButton onClick={() => move(0, -1)}>←</GameButton>
                    <GameButton onClick={() => move(0, 1)}>→</GameButton>
                    <div />
                    <GameButton onClick={() => move(1, 0)}>↓</GameButton>
                    <div />
                </div>
                {won && <p className="text-green-500 font-bold">You escaped! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
`,

    "SokobanGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const LEVEL = [
    "#####",
    "#@$.#",
    "#####",
];

const parseLevel = (level: string[]) => {
    const grid = level.map((row) => row.split(""));
    let player: [number, number] = [0, 0];
    const boxes: [number, number][] = [];
    const goals: [number, number][] = [];
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === "@") player = [r, c];
            if (grid[r][c] === "$") boxes.push([r, c]);
            if (grid[r][c] === ".") goals.push([r, c]);
        }
    }
    return { grid, player, boxes, goals };
};

export default function SokobanGame() {
    const [state, setState] = useState(() => parseLevel(LEVEL));

    const move = (dr: number, dc: number) => {
        const [pr, pc] = state.player;
        const nr = pr + dr, nc = pc + dc;
        if (state.grid[nr][nc] === "#") return;
        const boxIdx = state.boxes.findIndex(([br, bc]) => br === nr && bc === nc);
        if (boxIdx >= 0) {
            const br = nr + dr, bc = nc + dc;
            if (state.grid[br][bc] === "#" || state.boxes.some(([r, c]) => r === br && c === bc)) return;
            const boxes = [...state.boxes];
            boxes[boxIdx] = [br, bc];
            setState({ ...state, player: [nr, nc], boxes });
        } else {
            setState({ ...state, player: [nr, nc] });
        }
    };

    const reset = () => setState(parseLevel(LEVEL));
    const won = state.boxes.every(([r, c]) => state.goals.some(([gr, gc]) => gr === r && gc === c));

    return (
        <PuzzleWrapper title="Sokoban" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Push boxes onto goal spots. You can only push, not pull. Don't get boxes stuck in corners!"
            onReset={reset}
            status={[{ label: "State", value: won ? "Won!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden font-mono">
                    {state.grid.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isPlayer = state.player[0] === r && state.player[1] === c;
                                const isBox = state.boxes.some(([br, bc]) => br === r && bc === c);
                                const isGoal = state.goals.some(([gr, gc]) => gr === r && gc === c);
                                let display = " ";
                                let bg = "bg-card";
                                if (cell === "#") { display = "█"; bg = "bg-foreground"; }
                                else if (isPlayer) { display = "@"; bg = "bg-blue-500/40"; }
                                else if (isBox) { display = "$"; bg = isGoal ? "bg-green-500/40" : "bg-yellow-500/40"; }
                                else if (isGoal) { display = "."; bg = "bg-green-500/20"; }
                                return <div key={c} className={"w-10 h-10 flex items-center justify-center border border-border " + bg}>{display}</div>;
                            })}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <div />
                    <GameButton onClick={() => move(-1, 0)}>↑</GameButton>
                    <div />
                    <GameButton onClick={() => move(0, -1)}>←</GameButton>
                    <GameButton onClick={() => move(0, 1)}>→</GameButton>
                    <div />
                    <GameButton onClick={() => move(1, 0)}>↓</GameButton>
                    <div />
                </div>
                {won && <p className="text-green-500 font-bold">All boxes on goals! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
`,

    "RushHourGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

type Car = { id: number; row: number; col: number; len: number; horizontal: boolean; isTarget: boolean };

const INITIAL_CARS: Car[] = [
    { id: 0, row: 2, col: 0, len: 2, horizontal: true, isTarget: true },
    { id: 1, row: 0, col: 1, len: 3, horizontal: false, isTarget: false },
    { id: 2, row: 3, col: 2, len: 2, horizontal: true, isTarget: false },
];

const SIZE = 6;

export default function RushHourGame() {
    const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
    const [selected, setSelected] = useState<number | null>(null);

    const move = (forward: boolean) => {
        if (selected === null) return;
        const car = cars[selected];
        const dr = forward ? (car.horizontal ? 0 : 1) : (car.horizontal ? 0 : -1);
        const dc = forward ? (car.horizontal ? 1 : 0) : (car.horizontal ? -1 : 0);
        const nr = car.row + dr, nc = car.col + dc;
        if (nr < 0 || nc < 0) return;
        if (car.horizontal && nc + car.len > SIZE) return;
        if (!car.horizontal && nr + car.len > SIZE) return;
        const next = [...cars];
        next[selected] = { ...car, row: nr, col: nc };
        setCars(next);
    };

    const won = cars[0].col + cars[0].len === SIZE;

    return (
        <PuzzleWrapper title="Rush Hour" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Move the red car to the right edge. Select a car, then move it forward/backward."
            onReset={() => { setCars(INITIAL_CARS); setSelected(null); }}
            status={[{ label: "Selected", value: selected !== null ? "Car " + selected : "—" }, { label: "State", value: won ? "Won!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block border-2 border-foreground rounded-lg overflow-hidden" style={{ width: SIZE * 40, height: SIZE * 40 }}>
                    {cars.map((car) => (
                        <button key={car.id} onClick={() => setSelected(car.id)}
                            className={"absolute rounded flex items-center justify-center text-xs font-bold transition-all " + (car.isTarget ? "bg-red-500" : "bg-blue-500") + (selected === car.id ? " ring-2 ring-yellow-400" : "")}
                            style={{
                                left: car.col * 40,
                                top: car.row * 40,
                                width: car.horizontal ? car.len * 40 : 40,
                                height: car.horizontal ? 40 : car.len * 40,
                            }}>
                            {car.isTarget ? "→" : ""}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <GameButton onClick={() => move(false)}>← Backward</GameButton>
                    <GameButton onClick={() => move(true)}>Forward →</GameButton>
                </div>
                {won && <p className="text-green-500 font-bold">Escaped! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
`,

    "TowerOfHanoiGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton, range } from "./_shared";

const NUM_DISKS = 4;

export default function TowerOfHanoiGame() {
    const [towers, setTowers] = useState<number[][]>(() => [range(NUM_DISKS).map((i) => NUM_DISKS - i), [], []]);
    const [selected, setSelected] = useState<number | null>(null);

    const click = (tower: number) => {
        if (selected === null) {
            if (towers[tower].length > 0) setSelected(tower);
        } else {
            if (selected === tower) { setSelected(null); return; }
            const from = towers[selected];
            const to = towers[tower];
            if (to.length === 0 || from[from.length - 1] < to[to.length - 1]) {
                const next = towers.map((t) => [...t]);
                next[tower].push(next[selected].pop()!);
                setTowers(next);
            }
            setSelected(null);
        }
    };

    const won = towers[2].length === NUM_DISKS;
    const reset = () => { setTowers([range(NUM_DISKS).map((i) => NUM_DISKS - i), [], []]); setSelected(null); };

    return (
        <PuzzleWrapper title="Tower of Hanoi" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Move all disks to the right peg. Larger disks cannot go on smaller ones."
            onReset={reset}
            status={[{ label: "Disks", value: String(NUM_DISKS) }, { label: "State", value: won ? "Won!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-8 items-end">
                    {towers.map((tower, i) => (
                        <button key={i} onClick={() => click(i)}
                            className={"relative flex flex-col-reverse items-center justify-start w-32 h-48 border-2 rounded-lg " + (selected === i ? "border-yellow-400 bg-yellow-500/10" : "border-foreground bg-muted/10")}>
                            {tower.map((disk, j) => (
                                <div key={j} className="bg-blue-500 rounded text-center text-xs text-white font-bold"
                                    style={{ width: 20 + disk * 20, height: 20 }}>
                                    {disk + 1}
                                </div>
                            ))}
                        </button>
                    ))}
                </div>
                {won && <p className="text-green-500 font-bold">Solved! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
`,

    "PegSolitaireGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const INITIAL = [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
];

export default function PegSolitaireGame() {
    const [board, setBoard] = useState<number[][]>(() => INITIAL.map((r) => [...r]));
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const click = (r: number, c: number) => {
        if (board[r][c] === 0) return;
        if (selected) {
            const [sr, sc] = selected;
            const dr = r - sr, dc = c - sc;
            if (Math.abs(dr) + Math.abs(dc) === 2) {
                const mr = sr + dr / 2, mc = sc + dc / 2;
                if (board[mr][mc] === 1 && board[r][c] === 0) {
                    const next = board.map((row) => [...row]);
                    next[sr][sc] = 0;
                    next[mr][mc] = 0;
                    next[r][c] = 1;
                    setBoard(next);
                }
            }
            setSelected(null);
        } else {
            setSelected([r, c]);
        }
    };

    const reset = () => { setBoard(INITIAL.map((r) => [...r])); setSelected(null); };
    const pegs = board.flat().filter((c) => c === 1).length;

    return (
        <PuzzleWrapper title="Peg Solitaire" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Jump pegs over adjacent pegs to remove them. Leave one peg in the center."
            onReset={reset}
            status={[{ label: "Pegs", value: String(pegs) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                if (cell === -1) return <div key={c} className="w-10 h-10 bg-transparent" />;
                                return (
                                    <button key={c} onClick={() => click(r, c)}
                                        className={"w-10 h-10 flex items-center justify-center border border-border " + (cell === 1 ? (isSel ? "bg-yellow-400" : "bg-blue-500") : "bg-muted/20 hover:bg-accent")}>
                                        {cell === 1 ? "●" : ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Select a peg, then jump over an adjacent peg.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "LightsOutGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton, range, randInt } from "./_shared";

const SIZE = 5;

function toggle(grid: boolean[][], r: number, c: number): boolean[][] {
    const next = grid.map((row) => [...row]);
    const toggleCell = (r: number, c: number) => {
        if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) next[r][c] = !next[r][c];
    };
    toggleCell(r, c);
    toggleCell(r - 1, c);
    toggleCell(r + 1, c);
    toggleCell(r, c - 1);
    toggleCell(r, c + 1);
    return next;
}

function genGrid(): boolean[][] {
    let grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
    for (let i = 0; i < 10; i++) {
        grid = toggle(grid, randInt(0, SIZE - 1), randInt(0, SIZE - 1));
    }
    return grid;
}

export default function LightsOutGame() {
    const [grid, setGrid] = useState<boolean[][]>(() => genGrid());

    const click = (r: number, c: number) => setGrid(toggle(grid, r, c));
    const won = grid.every((row) => row.every((cell) => !cell));
    const reset = () => setGrid(genGrid());

    return (
        <PuzzleWrapper title="Lights Out" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Turn off all lights. Clicking a cell toggles it and its neighbors."
            onReset={reset}
            status={[{ label: "State", value: won ? "Won!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {grid.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => (
                                <button key={c} onClick={() => click(r, c)}
                                    className={"w-12 h-12 flex items-center justify-center border border-border " + (cell ? "bg-yellow-400" : "bg-muted/20 hover:bg-accent")}>
                                    {cell ? "💡" : ""}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                {won && <p className="text-green-500 font-bold">All lights out! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
`,

    "PentominoGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PENTOMINOES = ["F", "I", "L", "N", "P", "T", "U", "V", "W", "X", "Y", "Z"];
const COLORS = ["bg-red-500/40", "bg-blue-500/40", "bg-green-500/40", "bg-yellow-500/40", "bg-purple-500/40", "bg-pink-500/40", "bg-orange-500/40", "bg-cyan-500/40", "bg-lime-500/40", "bg-indigo-500/40", "bg-rose-500/40", "bg-amber-500/40"];

const SIZE = 8;

export default function PentominoGame() {
    const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
    const [selected, setSelected] = useState<number>(1);

    const paint = (r: number, c: number) => {
        const next = grid.map((row) => [...row]);
        next[r][c] = next[r][c] === selected ? 0 : selected;
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Pentomino Puzzle" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Place 12 pentomino pieces to fill the board. Each piece covers 5 cells."
            onReset={() => { setGrid(Array.from({ length: SIZE }, () => Array(SIZE).fill(0))); setSelected(1); }}
            status={[{ label: "Piece", value: PENTOMINOES[selected - 1] || "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {grid.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => (
                                <button key={c} onClick={() => paint(r, c)}
                                    className={"w-10 h-10 flex items-center justify-center border border-border " + (cell === 0 ? "bg-muted/20 hover:bg-accent" : COLORS[cell - 1] || "bg-card")}>
                                    {cell !== 0 ? PENTOMINOES[cell - 1] : ""}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1 justify-center max-w-md">
                    {PENTOMINOES.map((p, i) => (
                        <GameButton key={p} onClick={() => setSelected(i + 1)}
                            className={selected === i + 1 ? "ring-2 ring-yellow-400" : ""}>
                            {p}
                        </GameButton>
                    ))}
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "DotsAndBoxesGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SIZE = 4;

export default function DotsAndBoxesGame() {
    const [hEdges, setHEdges] = useState<Set<string>>(new Set());
    const [vEdges, setVEdges] = useState<Set<string>>(new Set());
    const [boxes, setBoxes] = useState<Record<string, number>>({});
    const [turn, setTurn] = useState(1);

    const toggleH = (r: number, c: number) => {
        const key = r + "-" + c;
        if (hEdges.has(key)) return;
        const next = new Set(hEdges);
        next.add(key);
        setHEdges(next);
        checkBoxes(next, vEdges, turn, setBoxes, setTurn);
    };

    const toggleV = (r: number, c: number) => {
        const key = r + "-" + c;
        if (vEdges.has(key)) return;
        const next = new Set(vEdges);
        next.add(key);
        setVEdges(next);
        checkBoxes(hEdges, next, turn, setBoxes, setTurn);
    };

    const reset = () => { setHEdges(new Set()); setVEdges(new Set()); setBoxes({}); setTurn(1); };
    const p1 = Object.values(boxes).filter((v) => v === 1).length;
    const p2 = Object.values(boxes).filter((v) => v === 2).length;

    return (
        <PuzzleWrapper title="Dots and Boxes" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Take turns drawing lines. Complete a box to score a point and take another turn."
            onReset={reset}
            status={[{ label: "Turn", value: "Player " + turn }, { label: "P1", value: String(p1) }, { label: "P2", value: String(p2) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block p-4">
                    {Array.from({ length: SIZE }, (_, r) => (
                        <div key={r}>
                            <div className="flex">
                                {Array.from({ length: SIZE }, (_, c) => (
                                    <div key={c} className="relative w-12 h-6 flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-foreground" />
                                        {c < SIZE - 1 && (
                                            <button onClick={() => toggleH(r, c)}
                                                className={"flex-1 h-1 " + (hEdges.has(r + "-" + c) ? "bg-foreground" : "hover:bg-primary/30")} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            {r < SIZE - 1 && (
                                <div className="flex">
                                    {Array.from({ length: SIZE }, (_, c) => (
                                        <div key={c} className="relative w-12 h-6 flex flex-col items-center">
                                            {c < SIZE - 1 && (
                                                <div className={"flex-1 w-full flex items-center justify-center " + (boxes[r + "-" + c] ? (boxes[r + "-" + c] === 1 ? "bg-red-500/30" : "bg-blue-500/30") : "")}>
                                                    {boxes[r + "-" + c] ? "P" + boxes[r + "-" + c] : ""}
                                                </div>
                                            )}
                                            {c < SIZE - 1 && (
                                                <button onClick={() => toggleV(r, c)}
                                                    className={"w-1 flex-1 " + (vEdges.has(r + "-" + c) ? "bg-foreground" : "hover:bg-primary/30")} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </PuzzleWrapper>
    );
}

function checkBoxes(hEdges: Set<string>, vEdges: Set<string>, turn: number, setBoxes: (fn: (b: Record<string, number>) => Record<string, number>) => void, setTurn: (fn: (t: number) => number) => void) {
    setBoxes((prev) => {
        const next = { ...prev };
        let scored = false;
        for (let r = 0; r < SIZE - 1; r++) {
            for (let c = 0; c < SIZE - 1; c++) {
                const key = r + "-" + c;
                if (next[key]) continue;
                if (hEdges.has(r + "-" + c) && hEdges.has((r + 1) + "-" + c) && vEdges.has(r + "-" + c) && vEdges.has(r + "-" + (c + 1))) {
                    next[key] = turn;
                    scored = true;
                }
            }
        }
        if (!scored) setTurn((t) => t === 1 ? 2 : 1);
        return next;
    });
}
`,

    "EinsteinsRiddleGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const ITEMS = {
    house: ["Red", "Green", "White", "Yellow", "Blue"],
    nationality: ["Brit", "Dane", "Swede", "Norwegian", "German"],
    drink: ["Tea", "Coffee", "Milk", "Water", "Beer"],
    cigar: ["Pall Mall", "Dunhill", "Blends", "Blue Master", "Prince"],
    pet: ["Dog", "Bird", "Cat", "Horse", "Fish"],
};

const CATEGORIES = Object.keys(ITEMS);

export default function EinsteinsRiddleGame() {
    const [grid, setGrid] = useState<Record<string, number[]>>(() => {
        const g: Record<string, number[]> = {};
        CATEGORIES.forEach((cat) => { g[cat] = [0, 0, 0, 0, 0]; });
        return g;
    });
    const [selected, setSelected] = useState<[string, number] | null>(null);

    const assign = (cat: string, itemIdx: number, house: number) => {
        const next = { ...grid };
        next[cat] = [...next[cat]];
        next[cat][itemIdx] = house;
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Einstein's Riddle" subcategory="Riddles & Lateral Thinking" subcategorySlug="riddles-lateral-thinking"
            instructions="5 houses, 5 attributes each. Use the clues to determine who owns the fish."
            onReset={() => {
                const g: Record<string, number[]> = {};
                CATEGORIES.forEach((cat) => { g[cat] = [0, 0, 0, 0, 0]; });
                setGrid(g);
            }}
            status={[{ label: "Houses", value: "5" }]}>
            <div className="flex flex-col items-center gap-4 overflow-x-auto">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    <div className="flex">
                        <div className="w-24 p-2 font-bold border border-border bg-muted/20">House →</div>
                        {[1, 2, 3, 4, 5].map((h) => <div key={h} className="w-16 p-2 text-center font-bold border border-border bg-muted/20">{h}</div>)}
                    </div>
                    {CATEGORIES.map((cat) => (
                        <div key={cat} className="flex">
                            <div className="w-24 p-2 font-bold border border-border bg-muted/10 capitalize">{cat}</div>
                            {ITEMS[cat].map((item, i) => (
                                <div key={i} className="w-16 p-1 border border-border">
                                    <div className="text-xs mb-1">{item}</div>
                                    <select value={grid[cat][i]} onChange={(e) => assign(cat, i, Number(e.target.value))}
                                        className="w-full text-xs p-1 rounded border border-border bg-card">
                                        <option value={0}>—</option>
                                        {[1, 2, 3, 4, 5].map((h) => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Assign each item to a house number (1-5).</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "LogicGridGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PEOPLE = ["Alice", "Bob", "Carol"];
const ITEMS = ["Book", "Pen", "Mug"];
const DAYS = ["Mon", "Tue", "Wed"];

export default function LogicGridGame() {
    const [grid, setGrid] = useState<Record<string, string>>({});

    const set = (key: string, value: string) => {
        const next = { ...grid };
        if (next[key] === value) delete next[key]; else next[key] = value;
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Logic Grid Puzzle" subcategory="Riddles & Lateral Thinking" subcategorySlug="riddles-lateral-thinking"
            instructions="Use the clues to match people with items and days. Click cells to mark matches."
            onReset={() => setGrid({})}
            status={[{ label: "Marked", value: String(Object.keys(grid).length) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="text-sm text-muted-foreground max-w-md">
                    Clues: Alice brought the Book. Bob brought it on Wed. Carol brought the Mug on Mon.
                </div>
                <div className="flex gap-4">
                    <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                        <div className="flex">
                            <div className="w-20 p-2" />
                            {ITEMS.map((item) => <div key={item} className="w-16 p-2 text-center text-xs font-bold border border-border">{item}</div>)}
                        </div>
                        {PEOPLE.map((person) => (
                            <div key={person} className="flex">
                                <div className="w-20 p-2 text-xs font-bold border border-border">{person}</div>
                                {ITEMS.map((item) => {
                                    const key = person + "-" + item;
                                    return (
                                        <button key={item} onClick={() => set(key, "yes")}
                                            className={"w-16 h-10 border border-border " + (grid[key] ? "bg-green-500/40" : "bg-card hover:bg-accent")}>
                                            {grid[key] ? "✓" : ""}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                        <div className="flex">
                            <div className="w-20 p-2" />
                            {DAYS.map((day) => <div key={day} className="w-16 p-2 text-center text-xs font-bold border border-border">{day}</div>)}
                        </div>
                        {PEOPLE.map((person) => (
                            <div key={person} className="flex">
                                <div className="w-20 p-2 text-xs font-bold border border-border">{person}</div>
                                {DAYS.map((day) => {
                                    const key = person + "-" + day;
                                    return (
                                        <button key={day} onClick={() => set(key, "yes")}
                                            className={"w-16 h-10 border border-border " + (grid[key] ? "bg-green-500/40" : "bg-card hover:bg-accent")}>
                                            {grid[key] ? "✓" : ""}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "RiverCrossingGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

export default function RiverCrossingGame() {
    const [left, setLeft] = useState<string[]>(["🐺", "🐑", "🥬"]);
    const [right, setRight] = useState<string[]>([]);
    const [boat, setBoat] = useState<string[]>([]);
    const [boatSide, setBoatSide] = useState<"left" | "right">("left");
    const [message, setMessage] = useState("");

    const load = (item: string) => {
        if (boat.length >= 2) return;
        if (boatSide === "left") {
            setLeft(left.filter((i) => i !== item));
        } else {
            setRight(right.filter((i) => i !== item));
        }
        setBoat([...boat, item]);
    };

    const unload = (item: string) => {
        setBoat(boat.filter((i) => i !== item));
        if (boatSide === "left") {
            setLeft([...left, item]);
        } else {
            setRight([...right, item]);
        }
    };

    const cross = () => {
        const newSide = boatSide === "left" ? "right" : "left";
        setBoatSide(newSide);
        const shore = newSide === "left" ? left : right;
        const other = newSide === "left" ? right : left;
        if (boat.length === 0) { setMessage("Boat is empty!"); return; }
        const newShore = [...shore, ...boat];
        const newOther = [...other];
        setBoat([]);
        if (newSide === "left") { setLeft(newShore); } else { setRight(newShore); }
        if (newOther.includes("🐺") && newOther.includes("🐑") && !newOther.includes("🥬")) {
            setMessage("Wolf ate the sheep! Game over.");
        } else if (newOther.includes("🐑") && newOther.includes("🥬") && !newOther.includes("🐺")) {
            setMessage("Sheep ate the cabbage! Game over.");
        } else if (right.length + boat.length === 3) {
            setMessage("All crossed! You win! 🎉");
        } else {
            setMessage("");
        }
    };

    const reset = () => { setLeft(["🐺", "🐑", "🥬"]); setRight([]); setBoat([]); setBoatSide("left"); setMessage(""); };

    return (
        <PuzzleWrapper title="River Crossing" subcategory="Riddles & Lateral Thinking" subcategorySlug="riddles-lateral-thinking"
            instructions="Cross the wolf, sheep, and cabbage. Wolf eats sheep if alone. Sheep eats cabbage if alone. Boat holds 2."
            onReset={reset}
            status={[{ label: "Boat", value: boatSide }, { label: "Cargo", value: String(boat.length) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex justify-between w-full max-w-2xl gap-4">
                    <div className="flex-1 border-2 border-foreground rounded-lg p-4 min-h-32">
                        <div className="text-sm font-bold mb-2">Left Shore</div>
                        <div className="flex gap-2 flex-wrap">
                            {left.map((item) => (
                                <button key={item} onClick={() => load(item)} disabled={boatSide !== "left"}
                                    className="text-3xl p-2 rounded hover:bg-accent disabled:opacity-30">{item}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 border-2 border-foreground rounded-lg p-4 min-h-32">
                        <div className="text-sm font-bold mb-2">Right Shore</div>
                        <div className="flex gap-2 flex-wrap">
                            {right.map((item) => (
                                <button key={item} onClick={() => load(item)} disabled={boatSide !== "right"}
                                    className="text-3xl p-2 rounded hover:bg-accent disabled:opacity-30">{item}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="border-2 border-yellow-400 rounded-lg p-4 bg-yellow-500/10">
                    <div className="text-sm font-bold mb-2">Boat ({boatSide} side)</div>
                    <div className="flex gap-2">
                        {boat.map((item) => (
                            <button key={item} onClick={() => unload(item)} className="text-3xl p-2 rounded hover:bg-accent">{item}</button>
                        ))}
                    </div>
                </div>
                <GameButton onClick={cross}>Cross River →</GameButton>
                {message && <p className={"font-bold " + (message.includes("win") ? "text-green-500" : "text-red-500")}>{message}</p>}
            </div>
        </PuzzleWrapper>
    );
}
`,
};

let count = 0;
for (const [filename, content] of Object.entries(games)) {
    fs.writeFileSync(path.join(dir, filename), content);
    count++;
}
console.log("Created " + count + " remaining game files");