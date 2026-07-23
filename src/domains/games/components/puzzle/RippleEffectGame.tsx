"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const REGIONS = [
    [1, 1, 2, 2],
    [1, 1, 2, 2],
    [3, 3, 4, 4],
    [3, 3, 4, 4],
];

export default function RippleEffectGame() {
    const [board, setBoard] = useState<number[][]>(() => REGIONS.map((r) => r.map(() => 0)));
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    return (
        <PuzzleWrapper title="Ripple Effect" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Fill each region with 1 to N (N = region size). Same numbers cannot be in the same row/column within distance N."
            onReset={() => { setBoard(REGIONS.map((r) => r.map(() => 0))); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const region = REGIONS[r][c];
                                const regionColors = ["", "bg-red-500/10", "bg-blue-500/10", "bg-green-500/10", "bg-yellow-500/10"];
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-14 h-14 flex items-center justify-center font-semibold border border-border " + (isSel ? "bg-primary/30" : regionColors[region] || "bg-card")}>
                                        {cell || ""}
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
