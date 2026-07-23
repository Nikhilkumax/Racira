"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = [
    [0, 1, 0, 0],
    [0, 0, 0, 2],
    [0, 0, 0, 0],
    [1, 0, 0, 0],
];

export default function MasyuGame() {
    const [edges, setEdges] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number, dir: string) => {
        const key = r + "-" + c + "-" + dir;
        const next = new Set(edges);
        if (next.has(key)) next.delete(key); else next.add(key);
        setEdges(next);
    };

    return (
        <PuzzleWrapper title="Masyu" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Draw a single loop through all clue circles. Black circles require a turn, white circles require straight or turn."
            onReset={() => setEdges(new Set())}
            status={[{ label: "Edges", value: String(edges.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block p-4">
                    {CLUES.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((clue, c) => (
                                <div key={c} className="relative w-16 h-16 flex items-center justify-center">
                                    {clue === 1 && <div className="w-4 h-4 rounded-full border-2 border-foreground bg-card" />}
                                    {clue === 2 && <div className="w-4 h-4 rounded-full bg-foreground" />}
                                    <button onClick={() => toggle(r, c, "top")} className={"absolute top-0 left-0 w-full h-1 " + (edges.has(r + "-" + c + "-top") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "bottom")} className={"absolute bottom-0 left-0 w-full h-1 " + (edges.has(r + "-" + c + "-bottom") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "left")} className={"absolute top-0 left-0 w-1 h-full " + (edges.has(r + "-" + c + "-left") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "right")} className={"absolute top-0 right-0 w-1 h-full " + (edges.has(r + "-" + c + "-right") ? "bg-foreground" : "hover:bg-primary/30")} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">White = turn required, Black = straight required.</p>
            </div>
        </PuzzleWrapper>
    );
}
