"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton, shuffle, range } from "./_shared";

const SIZE = 4;

export default function SlidingPuzzleGame() {
    const [tiles, setTiles] = useState<number[]>(() => {
        const arr = shuffle(range(SIZE * SIZE));
        return arr;
    });
    const [empty, setEmpty] = useState<number>(() => tiles.indexOf(SIZE * SIZE - 1));

    const move = (idx: number) => {
        const r = Math.floor(idx / SIZE);
        const c = idx % SIZE;
        const er = Math.floor(empty / SIZE);
        const ec = empty % SIZE;
        if (Math.abs(r - er) + Math.abs(c - ec) !== 1) return;
        const next = [...tiles];
        [next[idx], next[empty]] = [next[empty], next[idx]];
        setTiles(next);
        setEmpty(idx);
    };

    const reset = () => {
        const arr = shuffle(range(SIZE * SIZE));
        setTiles(arr);
        setEmpty(arr.indexOf(SIZE * SIZE - 1));
    };

    const isSolved = tiles.every((t, i) => t === i);

    return (
        <PuzzleWrapper title="15 Puzzle (Sliding)" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Slide tiles to arrange them in order 1-15. Click a tile adjacent to the empty space."
            onReset={reset}
            status={[{ label: "State", value: isSolved ? "Solved!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {Array.from({ length: SIZE }, (_, r) => (
                        <div key={r} className="flex">
                            {Array.from({ length: SIZE }, (_, c) => {
                                const idx = r * SIZE + c;
                                const tile = tiles[idx];
                                return (
                                    <button key={c} onClick={() => move(idx)}
                                        className={"w-16 h-16 flex items-center justify-center text-xl font-bold border border-border " + (tile === SIZE * SIZE - 1 ? "bg-transparent" : "bg-card hover:bg-accent")}>
                                        {tile === SIZE * SIZE - 1 ? "" : tile + 1}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                {isSolved && <p className="text-green-500 font-bold">Solved! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
