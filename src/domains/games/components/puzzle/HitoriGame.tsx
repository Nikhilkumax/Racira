"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [1, 2, 3, 1],
    [2, 1, 4, 3],
    [3, 4, 1, 2],
    [1, 3, 2, 4],
];

export default function HitoriGame() {
    const [blacked, setBlacked] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number) => {
        const key = r + "-" + c;
        const next = new Set(blacked);
        if (next.has(key)) next.delete(key); else next.add(key);
        setBlacked(next);
    };

    return (
        <PuzzleWrapper title="Hitori" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Black out cells so no number repeats in any row or column. Black cells cannot touch. White cells must be connected."
            onReset={() => setBlacked(new Set())}
            status={[{ label: "Blacked", value: String(blacked.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {PUZZLE.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((num, c) => {
                                const key = r + "-" + c;
                                const isBlack = blacked.has(key);
                                return (
                                    <button key={c} onClick={() => toggle(r, c)}
                                        className={"w-14 h-14 flex items-center justify-center text-lg font-semibold border border-border " + (isBlack ? "bg-foreground text-background" : "bg-card hover:bg-accent")}>
                                        {num}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click cells to black them out.</p>
            </div>
        </PuzzleWrapper>
    );
}
