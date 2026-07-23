"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const GRID = [
    ["C", "A", "T", ""],
    ["O", "", "", ""],
    ["D", "O", "G", ""],
    ["E", "", "", ""],
];

const CLUES = {
    across: { 1: "Feline pet", 3: "Canine pet" },
    down: { 1: "Fish egg", 2: "Feline pet" },
};

export default function CrosswordGame() {
    const [answers, setAnswers] = useState<string[][]>(() => GRID.map((r) => r.map(() => "")));
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const set = (letter: string) => {
        if (!selected) return;
        const [r, c] = selected;
        if (GRID[r][c] === "") return;
        const next = answers.map((row) => [...row]);
        next[r][c] = letter.toUpperCase();
        setAnswers(next);
    };

    return (
        <PuzzleWrapper title="Crossword" subcategory="Word & Grid Puzzles" subcategorySlug="word-grid-puzzles"
            instructions="Fill in the crossword grid. Click a cell to select it, then type a letter."
            onReset={() => { setAnswers(GRID.map((r) => r.map(() => ""))); setSelected(null); }}
            status={[{ label: "Selected", value: selected ? selected[0] + "," + selected[1] : "—" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {GRID.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isBlack = cell === "";
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                return (
                                    <button key={c} onClick={() => !isBlack && setSelected([r, c])}
                                        className={"w-12 h-12 flex items-center justify-center font-bold border border-border " + (isBlack ? "bg-foreground" : isSel ? "bg-primary/30" : "bg-card hover:bg-accent")}>
                                        {isBlack ? "" : answers[r][c]}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 flex-wrap justify-center max-w-xs">
                    {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
                        <GameButton key={l} onClick={() => set(l)} className="w-8 h-8 p-0 text-xs">{l}</GameButton>
                    ))}
                    <GameButton onClick={() => set("")} variant="ghost">Clear</GameButton>
                </div>
                <div className="text-sm text-muted-foreground">
                    Across: 1. {CLUES.across[1]} | 3. {CLUES.across[3]} | Down: 1. {CLUES.down[1]} | 2. {CLUES.down[2]}
                </div>
            </div>
        </PuzzleWrapper>
    );
}
