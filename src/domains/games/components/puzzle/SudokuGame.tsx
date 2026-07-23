"use client";

import React, { useState, useCallback, useMemo } from "react";
import { GameShell, GameButton } from "../GameShell";

const PUZZLES: number[][][] = [
    [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    [
        [0, 0, 0, 2, 6, 0, 7, 0, 1],
        [6, 8, 0, 0, 7, 0, 0, 9, 0],
        [1, 9, 0, 0, 0, 4, 5, 0, 0],
        [8, 2, 0, 1, 0, 0, 0, 4, 0],
        [0, 0, 4, 3, 0, 8, 9, 0, 0],
        [0, 5, 0, 0, 0, 9, 0, 7, 8],
        [0, 0, 9, 7, 0, 0, 0, 3, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 0, 0, 0],
    ],
];

const SOLUTIONS: number[][][] = [
    [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 0, 0, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, 5, 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9],
    ],
];

function isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) return false;
        if (board[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[boxRow + i][boxCol + j] === num) return false;
        }
    }
    return true;
}

export default function SudokuGame() {
    const [puzzleIdx, setPuzzleIdx] = useState(0);
    const [board, setBoard] = useState<number[][]>(() =>
        PUZZLES[0].map((r) => [...r])
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);
    const [errors, setErrors] = useState<Set<string>>(new Set());

    const fixed = useMemo(() => PUZZLES[puzzleIdx].map((r) => r.map((v) => v !== 0), []), [puzzleIdx]);

    const reset = useCallback(() => {
        setBoard(PUZZLES[puzzleIdx].map((r) => [...r]));
        setSelected(null);
        setErrors(new Set());
    }, [puzzleIdx]);

    const newPuzzle = useCallback(() => {
        const idx = (puzzleIdx + 1) % PUZZLES.length;
        setPuzzleIdx(idx);
        setBoard(PUZZLES[idx].map((r) => [...r]));
        setSelected(null);
        setErrors(new Set());
    }, [puzzleIdx]);

    const placeNumber = useCallback(
        (num: number) => {
            if (!selected) return;
            const [r, c] = selected;
            if (fixed[r][c]) return;
            const next = board.map((row) => [...row]);
            next[r][c] = num;
            setBoard(next);
            const errs = new Set<string>();
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (next[i][j] === 0) continue;
                    const n = next[i][j];
                    next[i][j] = 0;
                    if (!isValid(next, i, j, n)) errs.add(`${i}-${j}`);
                    next[i][j] = n;
                }
            }
            setErrors(errs);
        },
        [selected, board, fixed]
    );

    const isComplete = useMemo(() => {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) return false;
            }
        }
        return errors.size === 0;
    }, [board, errors]);

    return (
        <GameShell
            title="Sudoku"
            category="Puzzle Games"
            subcategory="Number Puzzles"
            categorySlug="puzzle-games"
            subcategorySlug="number-puzzles"
            onReset={newPuzzle}
            instructions="Fill the 9×9 grid so each row, column, and 3×3 box contains digits 1-9. Click a cell, then tap a number."
            status={[
                { label: "Errors", value: String(errors.size) },
                { label: "Status", value: isComplete ? "Solved!" : "In progress" },
            ]}
        >
            <div className="flex flex-col items-center gap-6">
                <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => {
                                const isFixed = fixed[r][c];
                                const isSelected = selected && selected[0] === r && selected[1] === c;
                                const hasError = errors.has(`${r}-${c}`);
                                const boxBorder = "";
                                const rightBorder = (c + 1) % 3 === 0 && c !== 8 ? "border-r-2 border-r-foreground" : "border-r border-border";
                                const bottomBorder = (r + 1) % 3 === 0 && r !== 8 ? "border-b-2 border-b-foreground" : "border-b border-border";
                                return (
                                    <button
                                        key={c}
                                        onClick={() => setSelected([r, c])}
                                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg font-semibold ${rightBorder} ${bottomBorder} ${isSelected ? "bg-primary/20" : isFixed ? "bg-muted/30" : "bg-card hover:bg-accent"
                                            } ${hasError ? "text-red-500" : "text-foreground"}`}
                                    >
                                        {cell !== 0 ? cell : ""}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <GameButton key={n} onClick={() => placeNumber(n)}>
                            {n}
                        </GameButton>
                    ))}
                    <GameButton onClick={() => placeNumber(0)} variant="ghost">
                        Clear
                    </GameButton>
                </div>
                <div className="flex gap-2">
                    <GameButton onClick={reset}>Reset</GameButton>
                </div>
                {isComplete && (
                    <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="font-semibold text-green-600 dark:text-green-400">🎉 Puzzle Solved!</p>
                    </div>
                )}
            </div>
        </GameShell>
    );
}