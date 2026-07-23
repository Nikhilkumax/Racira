const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "src", "domains", "games", "components", "puzzle");
fs.mkdirSync(dir, { recursive: true });

const games = {
    // ===== NUMBER PUZZLES =====
    "SamuraiSudokuGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export default function SamuraiSudokuGame() {
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLE.map((r) => [...r])
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        if (PUZZLE[r][c] !== 0) return;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Samurai Sudoku" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Five overlapping Sudoku grids. Fill each block so rows/columns have 1-4 (simplified version)."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isFixed = PUZZLE[r][c] !== 0;
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-8 h-8 flex items-center justify-center text-sm font-semibold border border-border " + (isSel ? "bg-primary/30" : isFixed ? "bg-muted/30" : "bg-card hover:bg-accent")}>
                                        {cell !== 0 ? cell : ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((n) => <GameButton key={n} onClick={() => place(n)}>{n}</GameButton>)}
                    <GameButton onClick={() => place(0)} variant="ghost">Clear</GameButton>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "SudokuXGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [1, 0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 0, 0, 0, 0, 0, 0, 0, 5],
];

export default function SudokuXGame() {
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLE.map((r) => [...r])
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        if (PUZZLE[r][c] !== 0) return;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Sudoku X" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Sudoku with two diagonal constraints. Each row, column, 3x3 box, AND both diagonals must have 1-9."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full" style={{background: "linear-gradient(to bottom right, transparent 49%, rgba(255,0,0,0.1) 49%, rgba(255,0,0,0.1) 51%, transparent 51%)"}} />
                        <div className="absolute top-0 left-0 w-full h-full" style={{background: "linear-gradient(to bottom left, transparent 49%, rgba(255,0,0,0.1) 49%, rgba(255,0,0,0.1) 51%, transparent 51%)"}} />
                    </div>
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isFixed = PUZZLE[r][c] !== 0;
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const rightBorder = (c + 1) % 3 === 0 && c !== 8 ? "border-r-2 border-r-foreground" : "border-r border-border";
                                const bottomBorder = (r + 1) % 3 === 0 && r !== 8 ? "border-b-2 border-b-foreground" : "border-b border-border";
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-10 h-10 flex items-center justify-center font-semibold border " + rightBorder + " " + bottomBorder + " " + (isSel ? "bg-primary/30" : isFixed ? "bg-muted/30" : "bg-card hover:bg-accent")}>
                                        {cell !== 0 ? cell : ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <GameButton key={n} onClick={() => place(n)}>{n}</GameButton>)}
                    <GameButton onClick={() => place(0)} variant="ghost">Clear</GameButton>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "HyperSudokuGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 4, 0, 0, 0, 0, 0, 5, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export default function HyperSudokuGame() {
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLE.map((r) => [...r])
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        if (PUZZLE[r][c] !== 0) return;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Hyper Sudoku" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Sudoku with extra 3x3 regions (shaded). Each row, column, 3x3 box, AND extra region must have 1-9."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isFixed = PUZZLE[r][c] !== 0;
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const inExtra = (r >= 1 && r <= 3 && c >= 1 && c <= 3) || (r >= 1 && r <= 3 && c >= 5 && c <= 7) || (r >= 5 && r <= 7 && c >= 1 && c <= 3) || (r >= 5 && r <= 7 && c >= 5 && c <= 7);
                                const rightBorder = (c + 1) % 3 === 0 && c !== 8 ? "border-r-2 border-r-foreground" : "border-r border-border";
                                const bottomBorder = (r + 1) % 3 === 0 && r !== 8 ? "border-b-2 border-b-foreground" : "border-b border-border";
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-10 h-10 flex items-center justify-center font-semibold border " + rightBorder + " " + bottomBorder + " " + (isSel ? "bg-primary/30" : isFixed ? "bg-muted/30" : inExtra ? "bg-primary/5 hover:bg-primary/10" : "bg-card hover:bg-accent")}>
                                        {cell !== 0 ? cell : ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <GameButton key={n} onClick={() => place(n)}>{n}</GameButton>)}
                    <GameButton onClick={() => place(0)} variant="ghost">Clear</GameButton>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "MiniSudokuGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton, range } from "./_shared";

const PUZZLE = [
    [1, 0, 0, 4],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 0, 0, 3],
];

export default function MiniSudokuGame() {
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLE.map((r) => [...r])
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        if (PUZZLE[r][c] !== 0) return;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Mini Sudoku 4x4" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Fill the 4x4 grid so each row, column, and 2x2 box has 1-4."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isFixed = PUZZLE[r][c] !== 0;
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const rightBorder = (c + 1) % 2 === 0 && c !== 3 ? "border-r-2 border-r-foreground" : "border-r border-border";
                                const bottomBorder = (r + 1) % 2 === 0 && r !== 3 ? "border-b-2 border-b-foreground" : "border-b border-border";
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-14 h-14 flex items-center justify-center text-lg font-semibold border " + rightBorder + " " + bottomBorder + " " + (isSel ? "bg-primary/30" : isFixed ? "bg-muted/30" : "bg-card hover:bg-accent")}>
                                        {cell !== 0 ? cell : ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((n) => <GameButton key={n} onClick={() => place(n)}>{n}</GameButton>)}
                    <GameButton onClick={() => place(0)} variant="ghost">Clear</GameButton>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "KakuroGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = {
    rowClues: { "0-1": 3, "0-2": 2, "1-1": 4, "1-2": 3 },
    colClues: { "1-0": 4, "2-0": 3, "1-1": 3, "2-1": 4 },
};

export default function KakuroGame() {
    const [board, setBoard] = useState<number[][]>(() => [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ]);
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        if (r === 0 || c === 0) return;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Kakuro" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Fill empty cells with 1-9. Numbers in each run must sum to the clue. No repeats in a run."
            onReset={() => { setBoard([[0,0,0],[0,0,0],[0,0,0]]); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isBlocked = r === 0 || c === 0;
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const rowClue = CLUES.rowClues[r+"-"+c];
                                const colClue = CLUES.colClues[r+"-"+c];
                                return (
                                    <button key={c} onClick={() => !isBlocked && setSelected([r, c])}
                                        className={"w-16 h-16 flex items-center justify-center font-semibold border border-border " + (isBlocked ? "bg-foreground text-background" : isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                        {isBlocked ? (colClue || "") + "\\" + (rowClue || "") : (cell || "")}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <GameButton key={n} onClick={() => place(n)}>{n}</GameButton>)}
                    <GameButton onClick={() => place(0)} variant="ghost">Clear</GameButton>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "FutoshikiGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
];

const CONSTRAINTS = [
    { r1: 0, c1: 0, r2: 0, c2: 1, op: "<" },
    { r1: 1, c1: 0, r2: 1, c2: 1, op: ">" },
];

export default function FutoshikiGame() {
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLE.map((r) => [...r])
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Futoshiki" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Fill the grid with 1-4 so each row and column has no repeats. Inequality signs must be satisfied."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex items-center">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const constraint = CONSTRAINTS.find((con) => con.r1 === r && con.c1 === c);
                                return (
                                    <React.Fragment key={c}>
                                        <button onClick={() => setSelected([r, c])}
                                            className={"w-12 h-12 flex items-center justify-center font-semibold border border-border " + (isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                            {cell || ""}
                                        </button>
                                        {c < 3 && constraint && <span className="px-1 text-primary font-bold">{constraint.op}</span>}
                                        {c < 3 && !constraint && <span className="px-1">&nbsp;</span>}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((n) => <GameButton key={n} onClick={() => place(n)}>{n}</GameButton>)}
                    <GameButton onClick={() => place(0)} variant="ghost">Clear</GameButton>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "BinairoGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SIZE = 6;
const PUZZLE = [
    [0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0],
];

export default function BinairoGame() {
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLE.map((r) => [...r])
    );

    const toggle = (r: number, c: number) => {
        if (PUZZLE[r][c] !== 0) return;
        const next = board.map((row) => [...row]);
        next[r][c] = next[r][c] === 1 ? 0 : 1;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Binairo" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Fill with 0s and 1s. No more than 2 same adjacent. Each row/column has equal 0s and 1s. No identical rows/columns."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); }}
            status={[{ label: "Grid", value: SIZE + "x" + SIZE }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isFixed = PUZZLE[r][c] !== 0;
                                return (
                                    <button key={c} onClick={() => toggle(r, c)}
                                        className={"w-12 h-12 flex items-center justify-center text-lg font-bold border border-border " + (isFixed ? "bg-muted/30" : "bg-card hover:bg-accent") + " " + (cell === 1 ? "text-blue-500" : cell === 0 && PUZZLE[r][c] === 0 ? "text-foreground" : "text-red-500")}>
                                        {cell !== 0 ? cell : ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click cells to toggle between 0 and 1.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "SuguruGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];

const REGIONS = [
    [[0,0],[0,1],[1,0],[1,1]],
    [[0,2],[0,3],[0,4],[1,4]],
    [[1,1],[1,2],[1,3],[2,3]],
    [[2,0],[2,1],[3,0],[3,1]],
    [[2,2],[2,4],[3,2],[3,3],[3,4]],
    [[4,0],[4,1],[4,2],[4,3],[4,4]],
];

export default function SuguruGame() {
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLE.map((r) => [...r])
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    const getRegion = (r: number, c: number) => REGIONS.findIndex((reg) => reg.some(([rr, cc]) => rr === r && cc === c));

    return (
        <PuzzleWrapper title="Suguru" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Fill each region with 1 to N (N = region size). Same numbers cannot touch (including diagonally)."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const region = getRegion(r, c);
                                const regionColors = ["bg-red-500/10", "bg-blue-500/10", "bg-green-500/10", "bg-yellow-500/10", "bg-purple-500/10", "bg-pink-500/10"];
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-12 h-12 flex items-center justify-center font-semibold border border-border " + (isSel ? "bg-primary/30" : regionColors[region] || "bg-card")}>
                                        {cell || ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => <GameButton key={n} onClick={() => place(n)}>{n}</GameButton>)}
                    <GameButton onClick={() => place(0)} variant="ghost">Clear</GameButton>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "Str8tsGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];

export default function Str8tsGame() {
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLE.map((r) => [...r])
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Str8ts" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Fill white cells with 1-5. Each row/column has no repeats. Consecutive white cells form straights."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-12 h-12 flex items-center justify-center font-semibold border border-border " + (isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                        {cell || ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => <GameButton key={n} onClick={() => place(n)}>{n}</GameButton>)}
                    <GameButton onClick={() => place(0)} variant="ghost">Clear</GameButton>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "FillominoGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SIZE = 5;
const PUZZLE = [
    [0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0],
    [0, 0, 0, 0, 0],
];

export default function FillominoGame() {
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLE.map((r) => [...r])
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Fillomino" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Divide the grid into regions. Each region of size N is filled with N. Same-number regions cannot touch."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-12 h-12 flex items-center justify-center font-semibold border border-border " + (isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                        {cell || ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => <GameButton key={n} onClick={() => place(n)}>{n}</GameButton>)}
                    <GameButton onClick={() => place(0)} variant="ghost">Clear</GameButton>
                </div>
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
console.log("Created " + count + " game files");