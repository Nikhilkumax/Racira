"use client";
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
