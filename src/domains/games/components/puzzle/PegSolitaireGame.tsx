"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const INITIAL = [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
];

export default function PegSolitaireGame() {
    const [board, setBoard] = useState<number[][]>(() => INITIAL.map((r) => [...r]));
    const [selected, setSelected] = useState<[number, number] | null>(null);

    const click = (r: number, c: number) => {
        if (board[r][c] === 0) return;
        if (selected) {
            const [sr, sc] = selected;
            const dr = r - sr, dc = c - sc;
            if (Math.abs(dr) + Math.abs(dc) === 2) {
                const mr = sr + dr / 2, mc = sc + dc / 2;
                if (board[mr][mc] === 1 && board[r][c] === 0) {
                    const next = board.map((row) => [...row]);
                    next[sr][sc] = 0;
                    next[mr][mc] = 0;
                    next[r][c] = 1;
                    setBoard(next);
                }
            }
            setSelected(null);
        } else {
            setSelected([r, c]);
        }
    };

    const reset = () => { setBoard(INITIAL.map((r) => [...r])); setSelected(null); };
    const pegs = board.flat().filter((c) => c === 1).length;

    return (
        <PuzzleWrapper title="Peg Solitaire" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Jump pegs over adjacent pegs to remove them. Leave one peg in the center."
            onReset={reset}
            status={[{ label: "Pegs", value: String(pegs) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isSel = selected && selected[0] === r && selected[1] === c;
                                if (cell === -1) return <div key={c} className="w-10 h-10 bg-transparent" />;
                                return (
                                    <button key={c} onClick={() => click(r, c)}
                                        className={"w-10 h-10 flex items-center justify-center border border-border " + (cell === 1 ? (isSel ? "bg-yellow-400" : "bg-blue-500") : "bg-muted/20 hover:bg-accent")}>
                                        {cell === 1 ? "●" : ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Select a peg, then jump over an adjacent peg.</p>
            </div>
        </PuzzleWrapper>
    );
}
