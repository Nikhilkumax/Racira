"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

const PEOPLE = ["Alice", "Bob", "Carol"];
const ITEMS = ["Book", "Pen", "Mug"];
const DAYS = ["Mon", "Tue", "Wed"];

export default function LogicGridGame() {
    const [grid, setGrid] = useState<Record<string, string>>({});

    const set = (key: string, value: string) => {
        const next = { ...grid };
        if (next[key] === value) delete next[key]; else next[key] = value;
        setGrid(next);
    };

    return (
        <PuzzleWrapper title="Logic Grid Puzzle" subcategory="Riddles & Lateral Thinking" subcategorySlug="riddles-lateral-thinking"
            instructions="Use the clues to match people with items and days. Click cells to mark matches."
            onReset={() => setGrid({})}
            status={[{ label: "Marked", value: String(Object.keys(grid).length) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="text-sm text-muted-foreground max-w-md">
                    Clues: Alice brought the Book. Bob brought it on Wed. Carol brought the Mug on Mon.
                </div>
                <div className="flex gap-4">
                    <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                        <div className="flex">
                            <div className="w-20 p-2" />
                            {ITEMS.map((item) => <div key={item} className="w-16 p-2 text-center text-xs font-bold border border-border">{item}</div>)}
                        </div>
                        {PEOPLE.map((person) => (
                            <div key={person} className="flex">
                                <div className="w-20 p-2 text-xs font-bold border border-border">{person}</div>
                                {ITEMS.map((item) => {
                                    const key = person + "-" + item;
                                    return (
                                        <button key={item} onClick={() => set(key, "yes")}
                                            className={"w-16 h-10 border border-border " + (grid[key] ? "bg-green-500/40" : "bg-card hover:bg-accent")}>
                                            {grid[key] ? "✓" : ""}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    <div className="inline-block border-2 border-foreground rounded-lg overflow-hidden">
                        <div className="flex">
                            <div className="w-20 p-2" />
                            {DAYS.map((day) => <div key={day} className="w-16 p-2 text-center text-xs font-bold border border-border">{day}</div>)}
                        </div>
                        {PEOPLE.map((person) => (
                            <div key={person} className="flex">
                                <div className="w-20 p-2 text-xs font-bold border border-border">{person}</div>
                                {DAYS.map((day) => {
                                    const key = person + "-" + day;
                                    return (
                                        <button key={day} onClick={() => set(key, "yes")}
                                            className={"w-16 h-10 border border-border " + (grid[key] ? "bg-green-500/40" : "bg-card hover:bg-accent")}>
                                            {grid[key] ? "✓" : ""}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PuzzleWrapper>
    );
}
