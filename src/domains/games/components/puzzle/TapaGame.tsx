"use client";
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
