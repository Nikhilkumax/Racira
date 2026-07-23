"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const ITEMS = {
    house: ["Red", "Green", "White", "Yellow", "Blue"],
    nationality: ["Brit", "Dane", "Swede", "Norwegian", "German"],
    drink: ["Tea", "Coffee", "Milk", "Water", "Beer"],
    cigar: ["Pall Mall", "Dunhill", "Blends", "Blue Master", "Prince"],
    pet: ["Dog", "Bird", "Cat", "Horse", "Fish"],
};

const CATEGORIES = Object.keys(ITEMS) as (keyof typeof ITEMS)[];

export default function EinsteinsRiddleGame() {
    const [grid, setGrid] = useState<Record<string, number[]>>(() => {
        const g: Record<string, number[]> = {};
        CATEGORIES.forEach((cat) => { g[cat] = [0, 0, 0, 0, 0]; });
        return g;
    });
    const [selected, setSelected] = useState<[string, number] | null>(null);

    const assign = (cat: string, itemIdx: number, house: number) => {
        const next = { ...grid };
        next[cat] = [...next[cat]];
        next[cat][itemIdx] = house;
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Einstein's Riddle" subcategory="Riddles & Lateral Thinking" subcategorySlug="riddles-lateral-thinking"
            instructions="5 houses, 5 attributes each. Use the clues to determine who owns the fish."
            onReset={() => {
                const g: Record<string, number[]> = {};
                CATEGORIES.forEach((cat) => { g[cat] = [0, 0, 0, 0, 0]; });
                setGrid(g);
            }}
            status={[{ label: "Houses", value: "5" }]}>
            <div className="flex flex-col items-center gap-4 overflow-x-auto">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    <div className="flex">
                        <div className="w-24 p-2 font-bold border border-border bg-muted/20">House →</div>
                        {[1, 2, 3, 4, 5].map((h) => <div key={h} className="w-16 p-2 text-center font-bold border border-border bg-muted/20">{h}</div>)}
                    </div>
                    {CATEGORIES.map((cat) => (
                        <div key={cat} className="flex">
                            <div className="w-24 p-2 font-bold border border-border bg-muted/10 capitalize">{cat}</div>
                            {ITEMS[cat].map((item, i) => (
                                <div key={i} className="w-16 p-1 border border-border">
                                    <div className="text-xs mb-1">{item}</div>
                                    <select value={grid[cat][i]} onChange={(e) => assign(cat, i, Number(e.target.value))}
                                        className="w-full text-xs p-1 rounded border border-border bg-card">
                                        <option value={0}>—</option>
                                        {[1, 2, 3, 4, 5].map((h) => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Assign each item to a house number (1-5).</p>
            </div>
        </PuzzleWrapper>
    );
}
