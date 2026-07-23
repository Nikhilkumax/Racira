"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

type Car = { id: number; row: number; col: number; len: number; horizontal: boolean; isTarget: boolean };

const INITIAL_CARS: Car[] = [
    { id: 0, row: 2, col: 0, len: 2, horizontal: true, isTarget: true },
    { id: 1, row: 0, col: 1, len: 3, horizontal: false, isTarget: false },
    { id: 2, row: 3, col: 2, len: 2, horizontal: true, isTarget: false },
];

const SIZE = 6;

export default function RushHourGame() {
    const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
    const [selected, setSelected] = useState<number | null>(null);

    const move = (forward: boolean) => {
        if (selected === null) return;
        const car = cars[selected];
        const dr = forward ? (car.horizontal ? 0 : 1) : (car.horizontal ? 0 : -1);
        const dc = forward ? (car.horizontal ? 1 : 0) : (car.horizontal ? -1 : 0);
        const nr = car.row + dr, nc = car.col + dc;
        if (nr < 0 || nc < 0) return;
        if (car.horizontal && nc + car.len > SIZE) return;
        if (!car.horizontal && nr + car.len > SIZE) return;
        const next = [...cars];
        next[selected] = { ...car, row: nr, col: nc };
        setCars(next);
    };

    const won = cars[0].col + cars[0].len === SIZE;

    return (
        <PuzzleWrapper title="Rush Hour" subcategory="Spatial & Mechanical Puzzles" subcategorySlug="spatial-mechanical-puzzles"
            instructions="Move the red car to the right edge. Select a car, then move it forward/backward."
            onReset={() => { setCars(INITIAL_CARS); setSelected(null); }}
            status={[{ label: "Selected", value: selected !== null ? "Car " + selected : "—" }, { label: "State", value: won ? "Won!" : "Playing" }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block border-2 border-foreground rounded-lg overflow-hidden" style={{ width: SIZE * 40, height: SIZE * 40 }}>
                    {cars.map((car) => (
                        <button key={car.id} onClick={() => setSelected(car.id)}
                            className={"absolute rounded flex items-center justify-center text-xs font-bold transition-all " + (car.isTarget ? "bg-red-500" : "bg-blue-500") + (selected === car.id ? " ring-2 ring-yellow-400" : "")}
                            style={{
                                left: car.col * 40,
                                top: car.row * 40,
                                width: car.horizontal ? car.len * 40 : 40,
                                height: car.horizontal ? 40 : car.len * 40,
                            }}>
                            {car.isTarget ? "→" : ""}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <GameButton onClick={() => move(false)}>← Backward</GameButton>
                    <GameButton onClick={() => move(true)}>Forward →</GameButton>
                </div>
                {won && <p className="text-green-500 font-bold">Escaped! 🎉</p>}
            </div>
        </PuzzleWrapper>
    );
}
