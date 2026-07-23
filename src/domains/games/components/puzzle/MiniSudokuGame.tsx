"use client";
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
