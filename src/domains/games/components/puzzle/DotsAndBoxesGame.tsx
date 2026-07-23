"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const SIZE = 4;

export default function DotsAndBoxesGame() {
    const [hEdges, setHEdges] = useState<Set<string>>(new Set());
    const [vEdges, setVEdges] = useState<Set<string>>(new Set());
    const [boxes, setBoxes] = useState<Record<string, number>>({});
    const [turn, setTurn] = useState(1);

    const toggleH = (r: number, c: number) => {
        const key = r + "-" + c;
        if (hEdges.has(key)) return;
        const next = new Set(hEdges);
        next.add(key);
        setHEdges(next);
        checkBoxes(next, vEdges, turn, setBoxes, setTurn);
    };

    const toggleV = (r: number, c: number) => {
        const key = r + "-" + c;
        if (vEdges.has(key)) return;
        const next = new Set(vEdges);
        next.add(key);
        setVEdges(next);
        checkBoxes(hEdges, next, turn, setBoxes, setTurn);
    };

    const reset = () => { setHEdges(new Set()); setVEdges(new Set()); setBoxes({}); setTurn(1); };
    const p1 = Object.values(boxes).filter((v) => v === 1).length;
    const p2 = Object.values(boxes).filter((v) => v === 2).length;

    return (
        <PuzzleWrapper title="Dots and Boxes" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Take turns drawing lines. Complete a box to score a point and take another turn."
            onReset={reset}
            status={[{ label: "Turn", value: "Player " + turn }, { label: "P1", value: String(p1) }, { label: "P2", value: String(p2) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block p-4">
                    {Array.from({ length: SIZE }, (_, r) => (
                        <div key={r}>
                            <div className="flex">
                                {Array.from({ length: SIZE }, (_, c) => (
                                    <div key={c} className="relative w-12 h-6 flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-foreground" />
                                        {c < SIZE - 1 && (
                                            <button onClick={() => toggleH(r, c)}
                                                className={"flex-1 h-1 " + (hEdges.has(r + "-" + c) ? "bg-foreground" : "hover:bg-primary/30")} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            {r < SIZE - 1 && (
                                <div className="flex">
                                    {Array.from({ length: SIZE }, (_, c) => (
                                        <div key={c} className="relative w-12 h-6 flex flex-col items-center">
                                            {c < SIZE - 1 && (
                                                <div className={"flex-1 w-full flex items-center justify-center " + (boxes[r + "-" + c] ? (boxes[r + "-" + c] === 1 ? "bg-red-500/30" : "bg-blue-500/30") : "")}>
                                                    {boxes[r + "-" + c] ? "P" + boxes[r + "-" + c] : ""}
                                                </div>
                                            )}
                                            {c < SIZE - 1 && (
                                                <button onClick={() => toggleV(r, c)}
                                                    className={"w-1 flex-1 " + (vEdges.has(r + "-" + c) ? "bg-foreground" : "hover:bg-primary/30")} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </PuzzleWrapper>
    );
}

function checkBoxes(hEdges: Set<string>, vEdges: Set<string>, turn: number, setBoxes: (fn: (b: Record<string, number>) => Record<string, number>) => void, setTurn: (fn: (t: number) => number) => void) {
    setBoxes((prev) => {
        const next = { ...prev };
        let scored = false;
        for (let r = 0; r < SIZE - 1; r++) {
            for (let c = 0; c < SIZE - 1; c++) {
                const key = r + "-" + c;
                if (next[key]) continue;
                if (hEdges.has(r + "-" + c) && hEdges.has((r + 1) + "-" + c) && vEdges.has(r + "-" + c) && vEdges.has(r + "-" + (c + 1))) {
                    next[key] = turn;
                    scored = true;
                }
            }
        }
        if (!scored) setTurn((t) => t === 1 ? 2 : 1);
        return next;
    });
}
