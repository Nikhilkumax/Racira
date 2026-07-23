"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const LEVEL = [
    "#####",
    "#@$.#",
    "#####",
];

const parseLevel = (level: string[]) => {
    const grid = level.map((row) => row.split(""));
    let player: [number, number] = [0, 0];
    const boxes: [number, number][] = [];
    const goals: [number, number][] = [];
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === "@") player = [r, c];
            if (grid[r][c] === "$") boxes.push([r, c]);
            if (grid[r][c] === ".") goals.push([r, c]);
        }
    }
    return { grid, player, boxes, goals };
};

export default function SokobanGame() {
    const [state, setState] = useState(() => parseLevel(LEVEL));

    const move = (dr: number, dc: number) => {
        const [pr, pc] = state.player;
        const nr = pr + dr, nc = pc + dc;
        if (state.grid[nr][nc] === "#") return;
        const boxIdx = state.boxes.findIndex(([br, bc]) => br === nr && bc === nc);
        if (boxIdx >= 0) {
            const br = nr + dr, bc = nc + dc;
            if (state.grid[br][bc] === "#" || state.boxes.some(([r, c]) => r === br && c === bc)) return;
            const boxes = [...state.boxes];
            boxes[boxIdx] = [br, bc];
            setState({ ...state, player: [nr, nc], boxes });
        } else {
            setState({ ...state, player: [nr, nc] });
        }
    };

    const reset = () => setState(parseLevel(LEVEL));
    const won = state.boxes.every(([r, c]) => state.goals.some(([gr, gc]) => gr === r && gc === c));

    return (
        <PuzzleWrapper title="Sokoban" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Push boxes onto goal spots. You can only push, not pull. Don't get boxes stuck in corners!"
            onReset={reset}
            status={[{ label: "State", value: won ? "Won!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden font-mono">
                    {state.grid.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isPlayer = state.player[0] === r && state.player[1] === c;
                                const isBox = state.boxes.some(([br, bc]) => br === r && bc === c);
                                const isGoal = state.goals.some(([gr, gc]) => gr === r && gc === c);
                                let display = " ";
                                let bg = "bg-card";
                                if (cell === "#") { display = "█"; bg = "bg-foreground"; }
                                else if (isPlayer) { display = "@"; bg = "bg-blue-500/40"; }
                                else if (isBox) { display = "$"; bg = isGoal ? "bg-green-500/40" : "bg-yellow-500/40"; }
                                else if (isGoal) { display = "."; bg = "bg-green-500/20"; }
                                return <div key={c} className={"w-10 h-10 flex items-center justify-center border border-border " + bg}>{display}</div>;
                            })}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <div />
                    <GameButton onClick={() => move(-1, 0)}>↑</GameButton>
                    <div />
                    <GameButton onClick={() => move(0, -1)}>←</GameButton>
                    <GameButton onClick={() => move(0, 1)}>→</GameButton>
                    <div />
                    <GameButton onClick={() => move(1, 0)}>↓</GameButton>
                    <div />
                </div>
                {won && <p className="text-green-500 font-bold">All boxes on goals! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
