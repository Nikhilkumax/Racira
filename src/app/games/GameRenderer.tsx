"use client";

import React, { Suspense } from "react";
import { lazyGameComponents } from "./lazyComponents";

export default function GameRenderer({ slug }: { slug: string }) {
    const GameComponent = lazyGameComponents[slug];

    if (!GameComponent) {
        return (
            <div className="inline-flex flex-col items-center justify-center p-12 border border-border border-dashed rounded-2xl bg-card max-w-md w-full">
                <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
                <p className="text-muted-foreground text-sm">
                    We're currently building this game. Check back soon to play!
                </p>
            </div>
        );
    }

    return (
        <Suspense
            fallback={
                <div className="inline-flex flex-col items-center justify-center p-12 border border-border border-dashed rounded-2xl bg-card max-w-md w-full">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
                    <p className="text-muted-foreground text-sm">Loading game...</p>
                </div>
            }
        >
            <GameComponent />
        </Suspense>
    );
}