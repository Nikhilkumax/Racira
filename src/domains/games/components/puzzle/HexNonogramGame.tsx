"use client";
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
