"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SIZE = 5;
const LETTERS = "ABCDE";

export default function AbcPathfinderGame() {
    const [board, setBoard] = useState<string[][]>(() => Array.from({ length: SIZE }, () => Array(SIZE).fill("")));
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (letter: string) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = letter;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="ABC Pathfinder" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Place A-E in each row and column. Each letter appears exactly once per row and column."
            onReset={() => { setBoard(Array.from({ length: SIZE }, () => Array(SIZE).fill(""))); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0] + "," + selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-14 h-14 flex items-center justify-center text-lg font-bold border border-border " + (isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                        {cell}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {LETTERS.split("").map((l) => <GameButton key={l} onClick={() => place(l)}>{l}</GameButton>)}
                    <GameButton onClick={() => place("")} variant="ghost">Clear</GameButton>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
