"use client";

import React from "react";
import { GameShell, GameButton } from "../GameShell";

type SimpleGameProps = {
    title: string;
    category?: string;
    subcategory?: string;
    categorySlug?: string;
    subcategorySlug?: string;
    instructions?: string;
    children: React.ReactNode;
    onReset?: () => void;
    status?: { label: string; value: string }[];
};

export function PuzzleWrapper({
    title,
    category = "Puzzle Games",
    subcategory = "Number Puzzles",
    categorySlug = "puzzle-games",
    subcategorySlug = "number-puzzles",
    instructions,
    children,
    onReset,
    status,
}: SimpleGameProps) {
    return (
        <GameShell
            title={title}
            category={category}
            subcategory={subcategory}
            categorySlug={categorySlug}
            subcategorySlug={subcategorySlug}
            instructions={instructions}
            onReset={onReset}
            status={status}
        >
            {children}
        </GameShell>
    );
}

export { GameButton };

export function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
}

export function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useResetKey() {
    const [key, setKey] = React.useState(0);
    const reset = React.useCallback(() => setKey((k) => k + 1), []);
    return { key, reset };
}