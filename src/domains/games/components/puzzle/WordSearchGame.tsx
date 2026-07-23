"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const GRID = [
    ["R", "A", "C", "I", "R", "A"],
    ["P", "U", "Z", "Z", "L", "E"],
    ["G", "A", "M", "E", "S", "F"],
    ["W", "O", "R", "D", "S", "U"],
    ["S", "E", "A", "R", "C", "H"],
    ["F", "I", "N", "D", "S", "N"],
];

const WORDS = ["RACIRA", "PUZZLE", "GAMES", "WORD", "SEARCH", "FIND"];

export default function WordSearchGame() {
    const [found, setFound] = useState<Set<string>>(new Set());
    const [selecting, setSelecting] = useState<[number, number] | null>(null);
    const [selected, setSelected] = useState<[number, number][]>([]);

    const startSelect = (r: number, c: number) => {
        setSelecting([r, c]);
        setSelected([[r, c]]);
    };

    const endSelect = (r: number, c: number) => {
        if (!selecting) return;
        const [sr, sc] = selecting;
        const word = selected.map(([r, c]) => GRID[r][c]).join("");
        if (WORDS.includes(word)) {
            setFound(new Set([...found, word]));
        }
        setSelecting(null);
        setSelected([]);
    };

    const onEnter = (r: number, c: number) => {
        if (!selecting) return;
        const [sr, sc] = selecting;
        const dr = Math.sign(r - sr);
        const dc = Math.sign(c - sc);
        const cells: [number, number][] = [];
        let cr = sr, cc = sc;
        while (true) {
            cells.push([cr, cc]);
            if (cr === r && cc === c) break;
            cr += dr; cc += dc;
        }
        setSelected(cells);
    };

    return (
        <PuzzleWrapper title="Word Search" subcategory="Word & Grid Puzzles" subcategorySlug="word-grid-puzzles"
            instructions="Find and select the hidden words. Click and drag from first to last letter."
            onReset={() => { setFound(new Set()); setSelected([]); setSelecting(null); }}
            status={[{ label: "Found", value: found.size + "/" + WORDS.length }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap gap-2 justify-center">
                    {WORDS.map((w) => (
                        <span key={w} className={"px-2 py-1 rounded text-sm font-semibold " + (found.has(w) ? "bg-green-500/20 text-green-600 line-through" : "bg-muted/30")}>{w}</span>
                    ))}
                </div>
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {GRID.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((letter, c) => {
                                const isSel = selected.some(([sr, sc]) => sr === r && sc === c);
                                return (
                                    <button key={c}
                                        onMouseDown={() => startSelect(r, c)}
                                        onMouseUp={() => endSelect(r, c)}
                                        onMouseEnter={() => onEnter(r, c)}
                                        className={"w-10 h-10 flex items-center justify-center font-bold border border-border " + (isSel ? "bg-primary/40" : "bg-card hover:bg-accent")}>
                                        {letter}
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
