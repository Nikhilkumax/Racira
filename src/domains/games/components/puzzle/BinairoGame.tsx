"use client";
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
