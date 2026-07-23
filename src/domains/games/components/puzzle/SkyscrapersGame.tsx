"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = {
    top: [2, 1, 3, 2],
    bottom: [2, 3, 1, 2],
    left: [2, 2, 1, 3],
    right: [3, 1, 2, 2],
};

export default function SkyscrapersGame() {
    const [board, setBoard] = useState<number[][]>(() => [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Skyscrapers" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Fill with 1-4. Each row/column has no repeats. Clues show how many buildings are visible from that side."
            onReset={() => { setBoard([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex">
                    <div className="w-8" />
                    {CLUES.top.map((clue, i) => <div key={i} className="w-12 h-8 flex items-center justify-center font-bold">{clue}</div>)}
                </div>
                {board.map((row, r) => (
                    <div key={r} className="flex items-center">
                        <div className="w-8 flex items-center justify-center font-bold">{CLUES.left[r]}</div>
                        {row.map((cell, c) => {
                            const isSel = selected && selected[0] === r && selected[1] === c;
                            return (
                                <button key={c} onClick={() => setSelected([r, c])}
                                    className={"w-12 h-12 flex items-center justify-center font-semibold border border-border " + (isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                    {cell || ""}
                                </button>
                            );
                        })}
                        <div className="w-8 flex items-center justify-center font-bold">{CLUES.right[r]}</div>
                    </div>
                ))}
                <div className="flex">
                    <div className="w-8" />
                    {CLUES.bottom.map((clue, i) => <div key={i} className="w-12 h-8 flex items-center justify-center font-bold">{clue}</div>)}
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((n) => <GameButton key={n} onClick={() => place(n)}>{n}</GameButton>)}
                    <GameButton onClick={() => place(0)} variant="ghost">Clear</GameButton>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
