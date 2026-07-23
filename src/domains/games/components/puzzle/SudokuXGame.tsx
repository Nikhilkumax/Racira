"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [1, 0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 0, 0, 0, 0, 0, 0, 0, 5],
];

export default function SudokuXGame() {
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
        <PuzzleWrapper title="Sudoku X" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Sudoku with two diagonal constraints. Each row, column, 3x3 box, AND both diagonals must have 1-9."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full" style={{background: "linear-gradient(to bottom right, transparent 49%, rgba(255,0,0,0.1) 49%, rgba(255,0,0,0.1) 51%, transparent 51%)"}} />
                        <div className="absolute top-0 left-0 w-full h-full" style={{background: "linear-gradient(to bottom left, transparent 49%, rgba(255,0,0,0.1) 49%, rgba(255,0,0,0.1) 51%, transparent 51%)"}} />
                    </div>
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isFixed = PUZZLE[r][c] !== 0;
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const rightBorder = (c + 1) % 3 === 0 && c !== 8 ? "border-r-2 border-r-foreground" : "border-r border-border";
                                const bottomBorder = (r + 1) % 3 === 0 && r !== 8 ? "border-b-2 border-b-foreground" : "border-b border-border";
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-10 h-10 flex items-center justify-center font-semibold border " + rightBorder + " " + bottomBorder + " " + (isSel ? "bg-primary/30" : isFixed ? "bg-muted/30" : "bg-card hover:bg-accent")}>
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
