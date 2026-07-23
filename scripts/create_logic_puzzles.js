const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "src", "domains", "games", "components", "puzzle");
fs.mkdirSync(dir, { recursive: true });

const games = {
    "MinesweeperGame.tsx": `"use client";
import React, { useState, useEffect } from "react";
import { PuzzleWrapper, GameButton, range, randInt } from "./_shared";

const SIZE = 9;
const MINES = 10;

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; count: number };

function genBoard(): Cell[][] {
    const board: Cell[][] = range(SIZE).map(() => range(SIZE).map(() => ({ mine: false, revealed: false, flagged: false, count: 0 })));
    let placed = 0;
    while (placed < MINES) {
        const r = randInt(0, SIZE - 1);
        const c = randInt(0, SIZE - 1);
        if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
    }
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c].mine) continue;
            let cnt = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc].mine) cnt++;
                }
            }
            board[r][c].count = cnt;
        }
    }
    return board;
}

export default function MinesweeperGame() {
    const [board, setBoard] = useState<Cell[][]>(() => genBoard());
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    const reveal = (r: number, c: number) => {
        if (gameOver || board[r][c].revealed || board[r][c].flagged) return;
        const next = board.map((row) => row.map((cell) => ({ ...cell })));
        const stack: [number, number][] = [[r, c]];
        while (stack.length) {
            const [cr, cc] = stack.pop()!;
            if (cr < 0 || cr >= SIZE || cc < 0 || cc >= SIZE) continue;
            const cell = next[cr][cc];
            if (cell.revealed || cell.flagged) continue;
            cell.revealed = true;
            if (cell.mine) { setGameOver(true); return; }
            if (cell.count === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        stack.push([cr + dr, cc + dc]);
                    }
                }
            }
        }
        setBoard(next);
        const safe = next.flat().filter((cell) => !cell.mine && cell.revealed).length;
        if (safe === SIZE * SIZE - MINES) setWon(true);
    };

    const flag = (r: number, c: number) => {
        if (gameOver || board[r][c].revealed) return;
        const next = board.map((row) => row.map((cell) => ({ ...cell })));
        next[r][c].flagged = !next[r][c].flagged;
        setBoard(next);
    };

    const reset = () => { setBoard(genBoard()); setGameOver(false); setWon(false); };

    return (
        <PuzzleWrapper title="Minesweeper" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Reveal all safe cells without hitting a mine. Numbers show adjacent mines. Right-click to flag."
            onReset={reset}
            status={[{ label: "Mines", value: String(MINES) }, { label: "State", value: gameOver ? "Boom!" : won ? "Won!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => (
                                <button key={c} onClick={() => reveal(r, c)} onContextMenu={(e) => { e.preventDefault(); flag(r, c); }}
                                    className={"w-8 h-8 flex items-center justify-center text-sm font-bold border border-border " + (cell.revealed ? (cell.mine ? "bg-red-500" : "bg-card") : "bg-muted/30 hover:bg-accent")}>
                                    {cell.revealed ? (cell.mine ? "💣" : cell.count || "") : (cell.flagged ? "🚩" : "")}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                {gameOver && <p className="text-red-500 font-bold">Game Over! Click Reset to try again.</p>}
                {won && <p className="text-green-500 font-bold">You Win! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
`,

    "NonogramGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SOLUTION = [
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1],
];

const ROW_CLUES = [[2, 2], [1, 1, 1], [3], [1, 1, 1], [2, 2]];
const COL_CLUES = [[2, 1], [1, 2], [2, 1], [1, 2], [2, 1]];

export default function NonogramGame() {
    const [grid, setGrid] = useState<number[][]>(() => SOLUTION.map((r) => r.map(() => 0)));

    const toggle = (r: number, c: number) => {
        const next = grid.map((row) => [...row]);
        next[r][c] = (next[r][c] + 1) % 3;
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Nonogram (Picross)" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Fill cells to match the number clues. Numbers show consecutive filled groups. Click to cycle: empty → fill → mark X."
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
                                className={"w-10 h-10 flex items-center justify-center border border-border " + (cell === 1 ? "bg-foreground" : cell === 2 ? "bg-card" : "bg-muted/20 hover:bg-accent")}>
                                {cell === 2 ? "X" : ""}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </PuzzleWrapper>
    );
}
`,

    "HitoriGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [1, 2, 3, 1],
    [2, 1, 4, 3],
    [3, 4, 1, 2],
    [1, 3, 2, 4],
];

export default function HitoriGame() {
    const [blacked, setBlacked] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number) => {
        const key = r + "-" + c;
        const next = new Set(blacked);
        if (next.has(key)) next.delete(key); else next.add(key);
        setBlacked(next);
    };

    return (
        <PuzzleWrapper title="Hitori" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Black out cells so no number repeats in any row or column. Black cells cannot touch. White cells must be connected."
            onReset={() => setBlacked(new Set())}
            status={[{ label: "Blacked", value: String(blacked.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {PUZZLE.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((num, c) => {
                                const key = r + "-" + c;
                                const isBlack = blacked.has(key);
                                return (
                                    <button key={c} onClick={() => toggle(r, c)}
                                        className={"w-14 h-14 flex items-center justify-center text-lg font-semibold border border-border " + (isBlack ? "bg-foreground text-background" : "bg-card hover:bg-accent")}>
                                        {num}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click cells to black them out.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "NurikabeGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0],
    [0, 0, 0, 3, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
];

export default function NurikabeGame() {
    const [grid, setGrid] = useState<number[][]>(() => PUZZLE.map((r) => [...r]));

    const toggle = (r: number, c: number) => {
        if (PUZZLE[r][c] !== 0) return;
        const next = grid.map((row) => [...row]);
        next[r][c] = next[r][c] === 0 ? -1 : 0;
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Nurikabe" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Shade cells to form a connected wall. Each island has exactly one number and that many cells. No 2x2 shaded areas."
            onReset={() => { setGrid(PUZZLE.map((r) => [...r])); }}
            status={[{ label: "Shaded", value: String(grid.flat().filter((c) => c === -1).length) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {grid.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isClue = PUZZLE[r][c] !== 0;
                                const isShaded = cell === -1;
                                return (
                                    <button key={c} onClick={() => toggle(r, c)}
                                        className={"w-12 h-12 flex items-center justify-center font-bold border border-border " + (isClue ? "bg-card" : isShaded ? "bg-foreground" : "bg-muted/20 hover:bg-accent")}>
                                        {isClue ? PUZZLE[r][c] : ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click empty cells to shade/unshade.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "SlitherlinkGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = [
    [3, 0, 3],
    [0, 2, 0],
    [1, 0, 1],
];

export default function SlitherlinkGame() {
    const [edges, setEdges] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number, dir: string) => {
        const key = r + "-" + c + "-" + dir;
        const next = new Set(edges);
        if (next.has(key)) next.delete(key); else next.add(key);
        setEdges(next);
    };

    return (
        <PuzzleWrapper title="Slitherlink" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Draw a single loop. Numbers show how many edges surround that cell. Click edges to toggle."
            onReset={() => setEdges(new Set())}
            status={[{ label: "Edges", value: String(edges.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block p-4">
                    {CLUES.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((clue, c) => (
                                <div key={c} className="relative w-16 h-16 flex items-center justify-center">
                                    <span className="font-bold">{clue || ""}</span>
                                    <button onClick={() => toggle(r, c, "top")} className={"absolute top-0 left-0 w-full h-1 " + (edges.has(r + "-" + c + "-top") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "bottom")} className={"absolute bottom-0 left-0 w-full h-1 " + (edges.has(r + "-" + c + "-bottom") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "left")} className={"absolute top-0 left-0 w-1 h-full " + (edges.has(r + "-" + c + "-left") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "right")} className={"absolute top-0 right-0 w-1 h-full " + (edges.has(r + "-" + c + "-right") ? "bg-foreground" : "hover:bg-primary/30")} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click edges to draw the loop.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "MasyuGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = [
    [0, 1, 0, 0],
    [0, 0, 0, 2],
    [0, 0, 0, 0],
    [1, 0, 0, 0],
];

export default function MasyuGame() {
    const [edges, setEdges] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number, dir: string) => {
        const key = r + "-" + c + "-" + dir;
        const next = new Set(edges);
        if (next.has(key)) next.delete(key); else next.add(key);
        setEdges(next);
    };

    return (
        <PuzzleWrapper title="Masyu" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Draw a single loop through all clue circles. Black circles require a turn, white circles require straight or turn."
            onReset={() => setEdges(new Set())}
            status={[{ label: "Edges", value: String(edges.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block p-4">
                    {CLUES.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((clue, c) => (
                                <div key={c} className="relative w-16 h-16 flex items-center justify-center">
                                    {clue === 1 && <div className="w-4 h-4 rounded-full border-2 border-foreground bg-card" />}
                                    {clue === 2 && <div className="w-4 h-4 rounded-full bg-foreground" />}
                                    <button onClick={() => toggle(r, c, "top")} className={"absolute top-0 left-0 w-full h-1 " + (edges.has(r + "-" + c + "-top") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "bottom")} className={"absolute bottom-0 left-0 w-full h-1 " + (edges.has(r + "-" + c + "-bottom") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "left")} className={"absolute top-0 left-0 w-1 h-full " + (edges.has(r + "-" + c + "-left") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "right")} className={"absolute top-0 right-0 w-1 h-full " + (edges.has(r + "-" + c + "-right") ? "bg-foreground" : "hover:bg-primary/30")} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">White = turn required, Black = straight required.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "ThermometersGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = {
    rows: [2, 3, 1],
    cols: [2, 2, 2],
};

const THERMOMETERS = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
];

export default function ThermometersGame() {
    const [filled, setFilled] = useState<number[]>([0, 0, 0]);

    const adjust = (idx: number, level: number) => {
        const next = [...filled];
        next[idx] = level;
        setFilled(next);
    };

    return (
        <PuzzleWrapper title="Thermometers" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Fill mercury in thermometers. Row/column clues show total filled cells. Fill from bulb upward."
            onReset={() => setFilled([0, 0, 0])}
            status={[{ label: "Row sums", value: CLUES.rows.join(", ") }, { label: "Col sums", value: CLUES.cols.join(", ") }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                    {THERMOMETERS.map((thermo, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="flex flex-col-reverse gap-0.5">
                                {thermo.map(([r, c], j) => (
                    <button key={j} onClick={() => adjust(i, j + 1)}
                        className={"w-10 h-10 rounded-full border-2 border-foreground " + (j < filled[i] ? "bg-red-500" : "bg-card")}>
                        {j === thermo.length - 1 ? "🔴" : ""}
                    </button>
                ))}
                            </div>
                            <div className="text-xs">Fill: {filled[i]}</div>
                        </div>
                    ))}
                </div>
                <div className="text-sm text-muted-foreground">
                    Row clues: {CLUES.rows.join(" | ")} | Col clues: {CLUES.cols.join(" | ")}
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "SkyscrapersGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = {
    top: [2, 1, 3, 2],
    bottom: [2, 3, 1, 2],
    left: [2, 2, 1, 3],
    right: [3, 1, 2, 2],
};

export default function SkyscrapersGame() {
    const [board, setBoard] = useState<number[][]>(() => [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Skyscrapers" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Fill with 1-4. Each row/column has no repeats. Clues show how many buildings are visible from that side."
            onReset={() => { setBoard([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex">
                    <div className="w-8" />
                    {CLUES.top.map((clue, i) => <div key={i} className="w-12 h-8 flex items-center justify-center font-bold">{clue}</div>)}
                </div>
                {board.map((row, r) => (
                    <div key={r} className="flex items-center">
                        <div className="w-8 flex items-center justify-center font-bold">{CLUES.left[r]}</div>
                        {row.map((cell, c) => {
                            const isSel = selected && selected[0] === r && selected[1] === c;
                            return (
                                <button key={c} onClick={() => setSelected([r, c])}
                                    className={"w-12 h-12 flex items-center justify-center font-semibold border border-border " + (isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                    {cell || ""}
                                </button>
                            );
                        })}
                        <div className="w-8 flex items-center justify-center font-bold">{CLUES.right[r]}</div>
                    </div>
                ))}
                <div className="flex">
                    <div className="w-8" />
                    {CLUES.bottom.map((clue, i) => <div key={i} className="w-12 h-8 flex items-center justify-center font-bold">{clue}</div>)}
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

    "AkariGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = [
    [0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 0, 2, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];

export default function AkariGame() {
    const [lights, setLights] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number) => {
        if (CLUES[r][c] !== 0) return;
        const key = r + "-" + c;
        const next = new Set(lights);
        if (next.has(key)) next.delete(key); else next.add(key);
        setLights(next);
    };

    return (
        <PuzzleWrapper title="Akari (Light Up)" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Place bulbs to light all cells. Numbers show adjacent bulbs. Bulbs cannot see each other."
            onReset={() => setLights(new Set())}
            status={[{ label: "Bulbs", value: String(lights.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {CLUES.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((clue, c) => {
                                const key = r + "-" + c;
                                const hasLight = lights.has(key);
                                const isLit = hasLight || [...lights].some(([lr, lc]) => {
                                    const [pr, pc] = lr.split("-").map(Number);
                                    return (pr === r || pc === c) && CLUES.some((rr, ri) => rr.some((cc, ci) => cc !== 0 && ri === Math.min(pr, r) && ci === Math.min(pc, c)));
                                });
                                return (
                                    <button key={c} onClick={() => toggle(r, c)}
                                        className={"w-12 h-12 flex items-center justify-center font-bold border border-border " + (clue !== 0 ? "bg-foreground text-background" : hasLight ? "bg-yellow-400" : "bg-card hover:bg-accent")}>
                                        {clue !== 0 ? clue : hasLight ? "💡" : ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click cells to place/remove bulbs.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "ShikakuGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = [
    [0, 0, 0, 0],
    [0, 4, 0, 0],
    [0, 0, 0, 6],
    [0, 0, 0, 0],
];

export default function ShikakuGame() {
    const [regions, setRegions] = useState<number[][]>(() => CLUES.map((r) => r.map(() => 0)));
    const [currentRegion, setCurrentRegion] = useState(1);

    const paint = (r: number, c: number) => {
        const next = regions.map((row) => [...row]);
        next[r][c] = currentRegion;
        setRegions(next);
    };

    return (
        <PuzzleWrapper title="Shikaku" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Divide the grid into rectangles. Each rectangle has exactly one number equal to its area."
            onReset={() => { setRegions(CLUES.map((r) => r.map(() => 0))); setCurrentRegion(1); }}
            status={[{ label: "Region", value: String(currentRegion) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {CLUES.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((clue, c) => {
                                const regionColors = ["bg-card", "bg-red-500/20", "bg-blue-500/20", "bg-green-500/20", "bg-yellow-500/20", "bg-purple-500/20", "bg-pink-500/20", "bg-orange-500/20"];
                                return (
                                    <button key={c} onClick={() => paint(r, c)}
                                        className={"w-14 h-14 flex items-center justify-center font-bold border border-border " + (clue !== 0 ? "bg-foreground text-background" : regionColors[regions[r][c]] || "bg-card")}>
                                        {clue || ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map((n) => <GameButton key={n} onClick={() => setCurrentRegion(n)}>{n}</GameButton>)}
                </div>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "TapaGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = [
    [0, 0, 0, 0, 0],
    [0, 3, 0, 0, 0],
    [0, 0, 0, 2, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];

export default function TapaGame() {
    const [grid, setGrid] = useState<number[][]>(() => CLUES.map((r) => r.map(() => 0)));

    const toggle = (r: number, c: number) => {
        if (CLUES[r][c] !== 0) return;
        const next = grid.map((row) => [...row]);
        next[r][c] = next[r][c] === 0 ? 1 : 0;
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Tapa" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Shade cells to form a connected wall. Numbers show lengths of consecutive shaded groups around that cell."
            onReset={() => { setGrid(CLUES.map((r) => r.map(() => 0))); }}
            status={[{ label: "Shaded", value: String(grid.flat().filter((c) => c === 1).length) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {CLUES.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((clue, c) => {
                                const isShaded = grid[r][c] === 1;
                                return (
                                    <button key={c} onClick={() => toggle(r, c)}
                                        className={"w-12 h-12 flex items-center justify-center font-bold border border-border " + (clue !== 0 ? "bg-card" : isShaded ? "bg-foreground" : "bg-muted/20 hover:bg-accent")}>
                                        {clue || ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click cells to shade/unshade.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "LoopFinderGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SIZE = 5;

export default function LoopFinderGame() {
    const [edges, setEdges] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number, dir: string) => {
        const key = r + "-" + c + "-" + dir;
        const next = new Set(edges);
        if (next.has(key)) next.delete(key); else next.add(key);
        setEdges(next);
    };

    return (
        <PuzzleWrapper title="Loop Finder" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Draw a single closed loop through the grid dots. Click edges to toggle."
            onReset={() => setEdges(new Set())}
            status={[{ label: "Edges", value: String(edges.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block p-4">
                    {Array.from({ length: SIZE }, (_, r) => (
                        <div key={r} className="flex">
                            {Array.from({ length: SIZE }, (_, c) => (
                                <div key={c} className="relative w-12 h-12 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-foreground" />
                                    <button onClick={() => toggle(r, c, "top")} className={"absolute top-0 left-0 w-full h-1 " + (edges.has(r + "-" + c + "-top") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "bottom")} className={"absolute bottom-0 left-0 w-full h-1 " + (edges.has(r + "-" + c + "-bottom") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "left")} className={"absolute top-0 left-0 w-1 h-full " + (edges.has(r + "-" + c + "-left") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "right")} className={"absolute top-0 right-0 w-1 h-full " + (edges.has(r + "-" + c + "-right") ? "bg-foreground" : "hover:bg-primary/30")} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click edges to draw the loop.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "HashiGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const ISLANDS = [
    [3, 0, 0, 2, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 0, 0, 4],
    [0, 0, 0, 0, 0],
    [2, 0, 0, 3, 0],
];

export default function HashiGame() {
    const [bridges, setBridges] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number, dir: string) => {
        const key = r + "-" + c + "-" + dir;
        const next = new Set(bridges);
        if (next.has(key)) next.delete(key); else next.add(key);
        setEdges(next);
    };

    return (
        <PuzzleWrapper title="Hashi (Bridges)" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Connect islands with bridges. Numbers show bridge count. Max 2 bridges per pair. No crossing bridges."
            onReset={() => setBridges(new Set())}
            status={[{ label: "Bridges", value: String(bridges.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {ISLANDS.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((num, c) => (
                                <div key={c} className="relative w-14 h-14 flex items-center justify-center border border-border">
                                    {num !== 0 ? (
                                        <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">{num}</div>
                                    ) : (
                                        <div className="w-full h-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click between islands to build bridges.</p>
            </div>
        </PuzzleWrapper>
    );
}
`,

    "RippleEffectGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const REGIONS = [
    [1, 1, 2, 2],
    [1, 1, 2, 2],
    [3, 3, 4, 4],
    [3, 3, 4, 4],
];

export default function RippleEffectGame() {
    const [board, setBoard] = useState<number[][]>(() => REGIONS.map((r) => r.map(() => 0)));
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Ripple Effect" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Fill each region with 1 to N (N = region size). Same numbers cannot be in the same row/column within distance N."
            onReset={() => { setBoard(REGIONS.map((r) => r.map(() => 0))); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const region = REGIONS[r][c];
                                const regionColors = ["", "bg-red-500/10", "bg-blue-500/10", "bg-green-500/10", "bg-yellow-500/10"];
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-14 h-14 flex items-center justify-center font-semibold border border-border " + (isSel ? "bg-primary/30" : regionColors[region] || "bg-card")}>
                                        {cell || ""}
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

    "AbcPathfinderGame.tsx": `"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SIZE = 5;
const LETTERS = "ABCDE";

export default function AbcPathfinderGame() {
    const [board, setBoard] = useState<string[][]>(() => Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (letter: string) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = letter;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="ABC Pathfinder" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Place A-E in each row and column. Each letter appears exactly once per row and column."
            onReset={() => { setBoard(Array.from({ length: SIZE }, () => Array(SIZE).fill(""))); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-14 h-14 flex items-center justify-center text-lg font-bold border border-border " + (isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                        {cell}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {LETTERS.split("").map((l) => <GameButton key={l} onClick={() => place(l)}>{l}</GameButton>)}
                    <GameButton onClick={() => place("")} variant="ghost">Clear</GameButton>
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
console.log("Created " + count + " logic puzzle game files");