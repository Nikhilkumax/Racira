"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton, shuffle, range } from "./_shared";

const SIZE = 3;

export default function JigsawGame() {
    const [tiles, setTiles] = useState<number[]>(() => shuffle(range(SIZE * SIZE)));
    const [empty, setEmpty] = useState<number>(SIZE * SIZE - 1);

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

    const reset = () => { setTiles(shuffle(range(SIZE * SIZE))); setEmpty(SIZE * SIZE - 1); };

    return (
        <PuzzleWrapper title="Jigsaw Puzzle" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Arrange tiles in order. Click a tile adjacent to the empty space to slide it."
            onReset={reset}
            status={[{ label: "Grid", value: SIZE + "x" + SIZE }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {Array.from({ length: SIZE }, (_, r) => (
                        <div key={r} className="flex">
                            {Array.from({ length: SIZE }, (_, c) => {
                                const idx = r * SIZE + c;
                                const tile = tiles[idx];
                                return (
                                    <button key={c} onClick={() => move(idx)}
                                        className={"w-20 h-20 flex items-center justify-center text-2xl font-bold border border-border " + (tile === SIZE * SIZE - 1 ? "bg-transparent" : "bg-card hover:bg-accent")}>
                                        {tile === SIZE * SIZE - 1 ? "" : tile + 1}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </PuzzleWrapper>
    );
}
