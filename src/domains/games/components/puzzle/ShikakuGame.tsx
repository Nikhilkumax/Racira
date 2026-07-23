"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = [
    [0, 0, 0, 0],
    [0, 4, 0, 0],
    [0, 0, 0, 6],
    [0, 0, 0, 0],
];

export default function ShikakuGame() {
    const [regions, setRegions] = useState<number[][]>(() => CLUES.map((r) => r.map(() => 0)));
    const [currentRegion, setCurrentRegion] = useState(1);

    const paint = (r: number, c: number) => {
        const next = regions.map((row) => [...row]);
        next[r][c] = currentRegion;
        setRegions(next);
    };

    return (
        <PuzzleWrapper title="Shikaku" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Divide the grid into rectangles. Each rectangle has exactly one number equal to its area."
            onReset={() => { setRegions(CLUES.map((r) => r.map(() => 0))); setCurrentRegion(1); }}
            status={[{ label: "Region", value: String(currentRegion) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {CLUES.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((clue, c) => {
                                const regionColors = ["bg-card", "bg-red-500/20", "bg-blue-500/20", "bg-green-500/20", "bg-yellow-500/20", "bg-purple-500/20", "bg-pink-500/20", "bg-orange-500/20"];
                                return (
                                    <button key={c} onClick={() => paint(r, c)}
                                        className={"w-14 h-14 flex items-center justify-center font-bold border border-border " + (clue !== 0 ? "bg-foreground text-background" : regionColors[regions[r][c]] || "bg-card")}>
                                        {clue || ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map((n) => <GameButton key={n} onClick={() => setCurrentRegion(n)}>{n}</GameButton>)}
                </div>
            </div>
        </PuzzleWrapper>
    );
}
