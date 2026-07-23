"use client";
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
