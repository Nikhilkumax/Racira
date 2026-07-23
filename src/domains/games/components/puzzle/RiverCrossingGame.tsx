"use client";
import React, { useState } from "react";
import { PuzzleWrapper, GameButton } from "./_shared";

export default function RiverCrossingGame() {
    const [left, setLeft] = useState<string[]>(["🐺", "🐑", "🥬"]);
    const [right, setRight] = useState<string[]>([]);
    const [boat, setBoat] = useState<string[]>([]);
    const [boatSide, setBoatSide] = useState<"left" | "right">("left");
    const [message, setMessage] = useState("");

    const load = (item: string) => {
        if (boat.length >= 2) return;
        if (boatSide === "left") {
            setLeft(left.filter((i) => i !== item));
        } else {
            setRight(right.filter((i) => i !== item));
        }
        setBoat([...boat, item]);
    };

    const unload = (item: string) => {
        setBoat(boat.filter((i) => i !== item));
        if (boatSide === "left") {
            setLeft([...left, item]);
        } else {
            setRight([...right, item]);
        }
    };

    const cross = () => {
        const newSide = boatSide === "left" ? "right" : "left";
        setBoatSide(newSide);
        const shore = newSide === "left" ? left : right;
        const other = newSide === "left" ? right : left;
        if (boat.length === 0) { setMessage("Boat is empty!"); return; }
        const newShore = [...shore, ...boat];
        const newOther = [...other];
        setBoat([]);
        if (newSide === "left") { setLeft(newShore); } else { setRight(newShore); }
        if (newOther.includes("🐺") && newOther.includes("🐑") && !newOther.includes("🥬")) {
            setMessage("Wolf ate the sheep! Game over.");
        } else if (newOther.includes("🐑") && newOther.includes("🥬") && !newOther.includes("🐺")) {
            setMessage("Sheep ate the cabbage! Game over.");
        } else if (right.length + boat.length === 3) {
            setMessage("All crossed! You win! 🎉");
        } else {
            setMessage("");
        }
    };

    const reset = () => { setLeft(["🐺", "🐑", "🥬"]); setRight([]); setBoat([]); setBoatSide("left"); setMessage(""); };

    return (
        <PuzzleWrapper title="River Crossing" subcategory="Riddles & Lateral Thinking" subcategorySlug="riddles-lateral-thinking"
            instructions="Cross the wolf, sheep, and cabbage. Wolf eats sheep if alone. Sheep eats cabbage if alone. Boat holds 2."
            onReset={reset}
            status={[{ label: "Boat", value: boatSide }, { label: "Cargo", value: String(boat.length) }]}>
            <div className="flex flex-col items-center gap-4">
                <div className="flex justify-between w-full max-w-2xl gap-4">
                    <div className="flex-1 border-2 border-foreground rounded-lg p-4 min-h-32">
                        <div className="text-sm font-bold mb-2">Left Shore</div>
                        <div className="flex gap-2 flex-wrap">
                            {left.map((item) => (
                                <button key={item} onClick={() => load(item)} disabled={boatSide !== "left"}
                                    className="text-3xl p-2 rounded hover:bg-accent disabled:opacity-30">{item}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 border-2 border-foreground rounded-lg p-4 min-h-32">
                        <div className="text-sm font-bold mb-2">Right Shore</div>
                        <div className="flex gap-2 flex-wrap">
                            {right.map((item) => (
                                <button key={item} onClick={() => load(item)} disabled={boatSide !== "right"}
                                    className="text-3xl p-2 rounded hover:bg-accent disabled:opacity-30">{item}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="border-2 border-yellow-400 rounded-lg p-4 bg-yellow-500/10">
                    <div className="text-sm font-bold mb-2">Boat ({boatSide} side)</div>
                    <div className="flex gap-2">
                        {boat.map((item) => (
                            <button key={item} onClick={() => unload(item)} className="text-3xl p-2 rounded hover:bg-accent">{item}</button>
                        ))}
                    </div>
                </div>
                <GameButton onClick={cross}>Cross River →</GameButton>
                {message && <p className={"font-bold " + (message.includes("win") ? "text-green-500" : "text-red-500")}>{message}</p>}
            </div>
        </PuzzleWrapper>
    );
}
