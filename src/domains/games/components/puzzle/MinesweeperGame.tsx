"use client";
import React, { useState, useEffect } from "react";
import { PuzzleWrapper, GameButton, range, randInt } from "./_shared";

const SIZE = 9;
const MINES = 10;

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; count: number };

function genBoard(): Cell[][] {
    const board: Cell[][] = range(SIZE).map(() => range(SIZE).map(() => ({ mine: false, revealed: false, flagged: false, count: 0 })));
    let placed = 0;
    while (placed < MINES) {
        const r = randInt(0, SIZE - 1);
        const c = randInt(0, SIZE - 1);
        if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
    }
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c].mine) continue;
            let cnt = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc].mine) cnt++;
                }
            }
            board[r][c].count = cnt;
        }
    }
    return board;
}

export default function MinesweeperGame() {
    const [board, setBoard] = useState<Cell[][]>(() => genBoard());
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    const reveal = (r: number, c: number) => {
        if (gameOver || board[r][c].revealed || board[r][c].flagged) return;
        const next = board.map((row) => row.map((cell) => ({ ...cell })));
        const stack: [number, number][] = [[r, c]];
        while (stack.length) {
            const [cr, cc] = stack.pop()!;
            if (cr < 0 || cr >= SIZE || cc < 0 || cc >= SIZE) continue;
            const cell = next[cr][cc];
            if (cell.revealed || cell.flagged) continue;
            cell.revealed = true;
            if (cell.mine) { setGameOver(true); return; }
            if (cell.count === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        stack.push([cr + dr, cc + dc]);
                    }
                }
            }
        }
        setBoard(next);
        const safe = next.flat().filter((cell) => !cell.mine && cell.revealed).length;
        if (safe === SIZE * SIZE - MINES) setWon(true);
    };

    const flag = (r: number, c: number) => {
        if (gameOver || board[r][c].revealed) return;
        const next = board.map((row) => row.map((cell) => ({ ...cell })));
        next[r][c].flagged = !next[r][c].flagged;
        setBoard(next);
    };

    const reset = () => { setBoard(genBoard()); setGameOver(false); setWon(false); };

    return (
        <PuzzleWrapper title="Minesweeper" subcategory="Logic Puzzles" subcategorySlug="logic-puzzles"
            instructions="Reveal all safe cells without hitting a mine. Numbers show adjacent mines. Right-click to flag."
            onReset={reset}
            status={[{ label: "Mines", value: String(MINES) }, { label: "State", value: gameOver ? "Boom!" : won ? "Won!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => (
                                <button key={c} onClick={() => reveal(r, c)} onContextMenu={(e) => { e.preventDefault(); flag(r, c); }}
                                    className={"w-8 h-8 flex items-center justify-center text-sm font-bold border border-border " + (cell.revealed ? (cell.mine ? "bg-red-500" : "bg-card") : "bg-muted/30 hover:bg-accent")}>
                                    {cell.revealed ? (cell.mine ? "💣" : cell.count || "") : (cell.flagged ? "🚩" : "")}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                {gameOver && <p className="text-red-500 font-bold">Game Over! Click Reset to try again.</p>}
                {won && <p className="text-green-500 font-bold">You Win! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
