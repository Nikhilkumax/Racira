"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
];

const CONSTRAINTS = [
    { r1: 0, c1: 0, r2: 0, c2: 1, op: "<" },
    { r1: 1, c1: 0, r2: 1, c2: 1, op: ">" },
];

export default function FutoshikiGame() {
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLE.map((r) => [...r])
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Futoshiki" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Fill the grid with 1-4 so each row and column has no repeats. Inequality signs must be satisfied."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex items-center">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const constraint = CONSTRAINTS.find((con) => con.r1 === r && con.c1 === c);
                                return (
                                    <React.Fragment key={c}>
                                        <button onClick={() => setSelected([r, c])}
                                            className={"w-12 h-12 flex items-center justify-center font-semibold border border-border " + (isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                            {cell || ""}
                                        </button>
                                        {c < 3 && constraint && <span className="px-1 text-primary font-bold">{constraint.op}</span>}
                                        {c < 3 && !constraint && <span className="px-1">&nbsp;</span>}
                                    </React.Fragment>
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
