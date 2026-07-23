"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const CLUES = [
    [3, 0, 3],
    [0, 2, 0],
    [1, 0, 1],
];

export default function SlitherlinkGame() {
    const [edges, setEdges] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number, dir: string) => {
        const key = r + "-" + c + "-" + dir;
        const next = new Set(edges);
        if (next.has(key)) next.delete(key); else next.add(key);
        setEdges(next);
    };

    return (
        <PuzzleWrapper title="Slitherlink" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Draw a single loop. Numbers show how many edges surround that cell. Click edges to toggle."
            onReset={() => setEdges(new Set())}
            status={[{ label: "Edges", value: String(edges.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block p-4">
                    {CLUES.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((clue, c) => (
                                <div key={c} className="relative w-16 h-16 flex items-center justify-center">
                                    <span className="font-bold">{clue || ""}</span>
                                    <button onClick={() => toggle(r, c, "top")} className={"absolute top-0 left-0 w-full h-1 " + (edges.has(r + "-" + c + "-top") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "bottom")} className={"absolute bottom-0 left-0 w-full h-1 " + (edges.has(r + "-" + c + "-bottom") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "left")} className={"absolute top-0 left-0 w-1 h-full " + (edges.has(r + "-" + c + "-left") ? "bg-foreground" : "hover:bg-primary/30")} />
                                    <button onClick={() => toggle(r, c, "right")} className={"absolute top-0 right-0 w-1 h-full " + (edges.has(r + "-" + c + "-right") ? "bg-foreground" : "hover:bg-primary/30")} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click edges to draw the loop.</p>
            </div>
        </PuzzleWrapper>
    );
}
