"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = {
    rows: [2, 3, 1],
    cols: [2, 2, 2],
};

const THERMOMETERS = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
];

export default function ThermometersGame() {
    const [filled, setFilled] = useState<number[]>([0, 0, 0]);

    const adjust = (idx: number, level: number) => {
        const next = [...filled];
        next[idx] = level;
        setFilled(next);
    };

    return (
        <PuzzleWrapper title="Thermometers" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Fill mercury in thermometers. Row/column clues show total filled cells. Fill from bulb upward."
            onReset={() => setFilled([0, 0, 0])}
            status={[{ label: "Row sums", value: CLUES.rows.join(", ") }, { label: "Col sums", value: CLUES.cols.join(", ") }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                    {THERMOMETERS.map((thermo, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="flex flex-col-reverse gap-0.5">
                                {thermo.map(([r, c], j) => (
                    <button key={j} onClick={() => adjust(i, j + 1)}
                        className={"w-10 h-10 rounded-full border-2 border-foreground " + (j < filled[i] ? "bg-red-500" : "bg-card")}>
                        {j === thermo.length - 1 ? "🔴" : ""}
                    </button>
                ))}
                            </div>
                            <div className="text-xs">Fill: {filled[i]}</div>
                        </div>
                    ))}
                </div>
                <div className="text-sm text-muted-foreground">
                    Row clues: {CLUES.rows.join(" | ")} | Col clues: {CLUES.cols.join(" | ")}
                </div>
            </div>
        </PuzzleWrapper>
    );
}
