"use client";
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
