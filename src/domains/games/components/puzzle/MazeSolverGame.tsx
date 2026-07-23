"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton, range, randInt } from "./_shared";

const SIZE = 11;

function genMaze(): number[][] {
    const maze = Array.from({ length: SIZE }, () => Array(SIZE).fill(1));
    const stack: [number, number][] = [[1, 1]];
    maze[1][1] = 0;
    while (stack.length) {
        const [r, c] = stack[stack.length - 1];
        const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
        let moved = false;
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr > 0 && nr < SIZE - 1 && nc > 0 && nc < SIZE - 1 && maze[nr][nc] === 1) {
                maze[r + dr / 2][c + dc / 2] = 0;
                maze[nr][nc] = 0;
                stack.push([nr, nc]);
                moved = true;
                break;
            }
        }
        if (!moved) stack.pop();
    }
    maze[SIZE - 2][SIZE - 2] = 0;
    return maze;
}

export default function MazeSolverGame() {
    const [maze, setMaze] = useState<number[][]>(() => genMaze());
    const [player, setPlayer] = useState<[number, number]>([1, 1]);
    const [won, setWon] = useState(false);

    const move = (dr: number, dc: number) => {
        if (won) return;
        const [r, c] = player;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && maze[nr][nc] === 0) {
            setPlayer([nr, nc]);
            if (nr === SIZE - 2 && nc === SIZE - 2) setWon(true);
        }
    };

    const reset = () => { setMaze(genMaze()); setPlayer([1, 1]); setWon(false); };

    return (
        <PuzzleWrapper title="Maze Solver" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Navigate from top-left to bottom-right. Use buttons or arrow keys to move."
            onReset={reset}
            status={[{ label: "State", value: won ? "Won!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {maze.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isPlayer = player[0] === r && player[1] === c;
                                const isGoal = r === SIZE - 2 && c === SIZE - 2;
                                return (
                                    <div key={c} className={"w-8 h-8 flex items-center justify-center text-sm " + (cell === 1 ? "bg-foreground" : isPlayer ? "bg-blue-500" : isGoal ? "bg-green-500/40" : "bg-card")}>
                                        {isPlayer ? "●" : isGoal ? "★" : ""}
                                    </div>
                                );
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
                {won && <p className="text-green-500 font-bold">You escaped! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
