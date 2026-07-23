"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES: { rowClues: Record<string, number>; colClues: Record<string, number> } = {
    rowClues: { "0-1": 3, "0-2": 2, "1-1": 4, "1-2": 3 },
    colClues: { "1-0": 4, "2-0": 3, "1-1": 3, "2-1": 4 },
};

export default function KakuroGame() {
    const [board, setBoard] = useState<number[][]>(() => [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ]);
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        if (r === 0 || c === 0) return;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Kakuro" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Fill empty cells with 1-9. Numbers in each run must sum to the clue. No repeats in a run."
            onReset={() => { setBoard([[0, 0, 0], [0, 0, 0], [0, 0, 0]]); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0] + "," + selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isBlocked = r === 0 || c === 0;
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const rowClue = CLUES.rowClues[r + "-" + c];
                                const colClue = CLUES.colClues[r + "-" + c];
                                return (
                                    <button key={c} onClick={() => !isBlocked && setSelected([r, c])}
                                        className={"w-16 h-16 flex items-center justify-center font-semibold border border-border " + (isBlocked ? "bg-foreground text-background" : isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                        {isBlocked ? `${colClue || ""}\\${rowClue || ""}` : (cell || "")}
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
