"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PUZZLE = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];

const REGIONS = [
    [[0,0],[0,1],[1,0],[1,1]],
    [[0,2],[0,3],[0,4],[1,4]],
    [[1,1],[1,2],[1,3],[2,3]],
    [[2,0],[2,1],[3,0],[3,1]],
    [[2,2],[2,4],[3,2],[3,3],[3,4]],
    [[4,0],[4,1],[4,2],[4,3],[4,4]],
];

export default function SuguruGame() {
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLE.map((r) => [...r])
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const place = (n: number) => {
        if (!selected) return;
        const [r, c] = selected;
        const next = board.map((row) => [...row]);
        next[r][c] = n;
        setBoard(next);
    };

    const getRegion = (r: number, c: number) => REGIONS.findIndex((reg) => reg.some(([rr, cc]) => rr === r && cc === c));

    return (
        <PuzzleWrapper title="Suguru" subcategory="Number Puzzles" subcategorySlug="number-puzzles"
            instructions="Fill each region with 1 to N (N = region size). Same numbers cannot touch (including diagonally)."
            onReset={() => { setBoard(PUZZLE.map((r) => [...r])); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0]+","+selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                const region = getRegion(r, c);
                                const regionColors = ["bg-red-500/10", "bg-blue-500/10", "bg-green-500/10", "bg-yellow-500/10", "bg-purple-500/10", "bg-pink-500/10"];
                                return (
                                    <button key={c} onClick={() => setSelected([r, c])}
                                        className={"w-12 h-12 flex items-center justify-center font-semibold border border-border " + (isSel ? "bg-primary/30" : regionColors[region] || "bg-card")}>
                                        {cell || ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => <GameButton key={n} onClick={() => place(n)}>{n}</GameButton>)}
                    <GameButton onClick={() => place(0)} variant="ghost">Clear</GameButton>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
