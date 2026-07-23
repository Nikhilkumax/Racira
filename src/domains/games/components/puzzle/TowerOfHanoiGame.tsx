"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton, range } from "./_shared";

const NUM_DISKS = 4;

export default function TowerOfHanoiGame() {
    const [towers, setTowers] = useState<number[][]>(() => [range(NUM_DISKS).map((i) => NUM_DISKS - i), [], []]);
    const [selected, setSelected] = useState<number | null>(null);

    const click = (tower: number) => {
        if (selected === null) {
            if (towers[tower].length > 0) setSelected(tower);
        } else {
            if (selected === tower) { setSelected(null); return; }
            const from = towers[selected];
            const to = towers[tower];
            if (to.length === 0 || from[from.length - 1] < to[to.length - 1]) {
                const next = towers.map((t) => [...t]);
                next[tower].push(next[selected].pop()!);
                setTowers(next);
            }
            setSelected(null);
        }
    };

    const won = towers[2].length === NUM_DISKS;
    const reset = () => { setTowers([range(NUM_DISKS).map((i) => NUM_DISKS - i), [], []]); setSelected(null); };

    return (
        <PuzzleWrapper title="Tower of Hanoi" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Move all disks to the right peg. Larger disks cannot go on smaller ones."
            onReset={reset}
            status={[{ label: "Disks", value: String(NUM_DISKS) }, { label: "State", value: won ? "Won!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-8 items-end">
                    {towers.map((tower, i) => (
                        <button key={i} onClick={() => click(i)}
                            className={"relative flex flex-col-reverse items-center justify-start w-32 h-48 border-2 rounded-lg " + (selected === i ? "border-yellow-400 bg-yellow-500/10" : "border-foreground bg-muted/10")}>
                            {tower.map((disk, j) => (
                                <div key={j} className="bg-blue-500 rounded text-center text-xs text-white font-bold"
                                    style={{ width: 20 + disk * 20, height: 20 }}>
                                    {disk + 1}
                                </div>
                            ))}
                        </button>
                    ))}
                </div>
                {won && <p className="text-green-500 font-bold">Solved! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
