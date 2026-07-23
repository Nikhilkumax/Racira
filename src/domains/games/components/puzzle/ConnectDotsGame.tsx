"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SIZE = 5;
const PAIRS = [
    { color: "bg-red-500", a: [0, 0], b: [4, 4] },
    { color: "bg-blue-500", a: [0, 4], b: [4, 0] },
];

export default function ConnectDotsGame() {
    const [paths, setPaths] = useState<Record<string, [number, number][]>>({});

    return (
        <PuzzleWrapper title="Connect Dots (Numberlink)" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Connect matching colored dots with paths. Paths cannot cross. Fill the entire grid."
            onReset={() => setPaths({})}
            status={[{ label: "Pairs", value: String(PAIRS.length) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {Array.from({ length: SIZE }, (_, r) => (
                        <div key={r} className="flex">
                            {Array.from({ length: SIZE }, (_, c) => {
                                const pair = PAIRS.find((p) => (p.a[0] === r && p.a[1] === c) || (p.b[0] === r && p.b[1] === c));
                                return (
                                    <div key={c} className={"w-12 h-12 flex items-center justify-center border border-border " + (pair ? pair.color : "bg-card")}>
                                        {pair ? "●" : ""}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Connect same-colored dots without crossing paths.</p>
            </div>
        </PuzzleWrapper>
    );
}
