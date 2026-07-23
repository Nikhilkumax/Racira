"use client";
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
