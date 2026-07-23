"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = [
    [0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 0, 2, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];

export default function AkariGame() {
    const [lights, setLights] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number) => {
        if (CLUES[r][c] !== 0) return;
        const key = r + "-" + c;
        const next = new Set(lights);
        if (next.has(key)) next.delete(key); else next.add(key);
        setLights(next);
    };

    return (
        <PuzzleWrapper title="Akari (Light Up)" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Place bulbs to light all cells. Numbers show adjacent bulbs. Bulbs cannot see each other."
            onReset={() => setLights(new Set())}
            status={[{ label: "Bulbs", value: String(lights.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {CLUES.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((clue, c) => {
                                const key = r + "-" + c;
                                const hasLight = lights.has(key);
                                const isLit = hasLight || [...lights].some(([lr, lc]) => {
                                    const [pr, pc] = lr.split("-").map(Number);
                                    return (pr === r || pc === c) && CLUES.some((rr, ri) => rr.some((cc, ci) => cc !== 0 && ri === Math.min(pr, r) && ci === Math.min(pc, c)));
                                });
                                return (
                                    <button key={c} onClick={() => toggle(r, c)}
                                        className={"w-12 h-12 flex items-center justify-center font-bold border border-border " + (clue !== 0 ? "bg-foreground text-background" : hasLight ? "bg-yellow-400" : "bg-card hover:bg-accent")}>
                                        {clue !== 0 ? clue : hasLight ? "💡" : ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click cells to place/remove bulbs.</p>
            </div>
        </PuzzleWrapper>
    );
}
