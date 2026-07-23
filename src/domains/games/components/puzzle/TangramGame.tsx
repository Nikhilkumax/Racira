"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PIECES = [
    { id: 1, color: "bg-red-500/60", shape: "triangle" },
    { id: 2, color: "bg-blue-500/60", shape: "triangle" },
    { id: 3, color: "bg-green-500/60", shape: "square" },
    { id: 4, color: "bg-yellow-500/60", shape: "triangle" },
    { id: 5, color: "bg-purple-500/60", shape: "triangle" },
    { id: 6, color: "bg-pink-500/60", shape: "parallelogram" },
    { id: 7, color: "bg-orange-500/60", shape: "triangle" },
];

export default function TangramGame() {
    const [rotations, setRotations] = useState<Record<number, number>>({});

    const rotate = (id: number) => {
        setRotations({ ...rotations, [id]: ((rotations[id] || 0) + 45) % 360 });
    };

    return (
        <PuzzleWrapper title="Tangram" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Arrange the 7 pieces to form shapes. Click a piece to rotate it 45 degrees."
            onReset={() => setRotations({})}
            status={[{ label: "Pieces", value: String(PIECES.length) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-64 h-64 border-2 border-foreground rounded-lg bg-muted/10 flex flex-wrap items-center justify-center gap-2 p-4">
                    {PIECES.map((piece) => (
                        <button key={piece.id} onClick={() => rotate(piece.id)}
                            className={"w-16 h-16 " + piece.color + " rounded transform transition-transform"}
                            style={{ transform: "rotate(" + (rotations[piece.id] || 0) + "deg)" }}>
                        </button>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Click pieces to rotate. Arrange to form the target shape.</p>
            </div>
        </PuzzleWrapper>
    );
}
