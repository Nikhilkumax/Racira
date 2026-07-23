"use client";
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
