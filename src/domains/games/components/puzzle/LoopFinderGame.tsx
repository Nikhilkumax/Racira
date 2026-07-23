"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SIZE = 5;

export default function LoopFinderGame() {
    const [edges, setEdges] = useState<Set<string>>(new Set());

    const toggle = (r: number, c: number, dir: string) => {
        const key = r + "-" + c + "-" + dir;
        const next = new Set(edges);
        if (next.has(key)) next.delete(key); else next.add(key);
        setEdges(next);
    };

    return (
        <PuzzleWrapper title="Loop Finder" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Draw a single closed loop through the grid dots. Click edges to toggle."
            onReset={() => setEdges(new Set())}
            status={[{ label: "Edges", value: String(edges.size) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block p-4">
                    {Array.from({ length: SIZE }, (_, r) => (
                        <div key={r} className="flex">
                            {Array.from({ length: SIZE }, (_, c) => (
                                <div key={c} className="relative w-12 h-12 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-foreground" />
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
