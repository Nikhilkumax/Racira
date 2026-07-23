"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PENTOMINOES = ["F", "I", "L", "N", "P", "T", "U", "V", "W", "X", "Y", "Z"];
const COLORS = ["bg-red-500/40", "bg-blue-500/40", "bg-green-500/40", "bg-yellow-500/40", "bg-purple-500/40", "bg-pink-500/40", "bg-orange-500/40", "bg-cyan-500/40", "bg-lime-500/40", "bg-indigo-500/40", "bg-rose-500/40", "bg-amber-500/40"];

const SIZE = 8;

export default function PentominoGame() {
    const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
    const [selected, setSelected] = useState<number>(1);

    const paint = (r: number, c: number) => {
        const next = grid.map((row) => [...row]);
        next[r][c] = next[r][c] === selected ? 0 : selected;
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Pentomino Puzzle" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Place 12 pentomino pieces to fill the board. Each piece covers 5 cells."
            onReset={() => { setGrid(Array.from({ length: SIZE }, () => Array(SIZE).fill(0))); setSelected(1); }}
            status={[{ label: "Piece", value: PENTOMINOES[selected - 1] || "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {grid.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => (
                                <button key={c} onClick={() => paint(r, c)}
                                    className={"w-10 h-10 flex items-center justify-center border border-border " + (cell === 0 ? "bg-muted/20 hover:bg-accent" : COLORS[cell - 1] || "bg-card")}>
                                    {cell !== 0 ? PENTOMINOES[cell - 1] : ""}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1 justify-center max-w-md">
                    {PENTOMINOES.map((p, i) => (
                        <GameButton key={p} onClick={() => setSelected(i + 1)}
                            className={selected === i + 1 ? "ring-2 ring-yellow-400" : ""}>
                            {p}
                        </GameButton>
                    ))}
                </div>
            </div>
        </PuzzleWrapper>
    );
}
