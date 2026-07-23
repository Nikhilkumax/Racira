"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const ISLANDS = [
    [3, 0, 0, 2, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 0, 0, 4],
    [0, 0, 0, 0, 0],
    [2, 0, 0, 3, 0],
];

export default function HashiGame() {
    const [bridges, setBridges] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number, dir: string) => {
        const key = r + "-" + c + "-" + dir;
        const next = new Set(bridges);
        if (next.has(key)) next.delete(key); else next.add(key);
        setBridges(next);
    };

    return (
        <PuzzleWrapper title="Hashi (Bridges)" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Connect islands with bridges. Numbers show bridge count. Max 2 bridges per pair. No crossing bridges."
            onReset={() => setBridges(new Set())}
            status={[{ label: "Bridges", value: String(bridges.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {ISLANDS.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((num, c) => (
                                <div key={c} className="relative w-14 h-14 flex items-center justify-center border border-border">
                                    {num !== 0 ? (
                                        <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">{num}</div>
                                    ) : (
                                        <div className="w-full h-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click between islands to build bridges.</p>
            </div>
        </PuzzleWrapper>
    );
}
