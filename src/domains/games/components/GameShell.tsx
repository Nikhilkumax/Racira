"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, RotateCcw } from "lucide-react";

type GameShellProps = {
    title: string;
    category: string;
    subcategory: string;
    categorySlug: string;
    subcategorySlug: string;
    children: React.ReactNode;
    onReset?: () => void;
    instructions?: string;
    status?: { label: string; value: string }[];
};

export function GameShell({
    title,
    category,
    subcategory,
    categorySlug,
    subcategorySlug,
    children,
    onReset,
    instructions,
    status,
}: GameShellProps) {
    return (
        <div className="flex flex-col">
            <div className="racira-page-container pt-3 pb-0">
                <nav
                    aria-label="breadcrumb"
                    className="hidden md:flex items-center flex-wrap text-sm text-muted-foreground mb-4"
                >
                    <Link href="/" className="hover:text-foreground transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
                    <Link
                        href="/games"
                        className="hover:text-foreground transition-colors"
                    >
                        Games
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
                    <Link
                        href={`/games/${categorySlug}`}
                        className="hover:text-foreground transition-colors"
                    >
                        {category}
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
                    <Link
                        href={`/games/${subcategorySlug}`}
                        className="hover:text-foreground transition-colors"
                    >
                        {subcategory}
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
                    <span className="text-foreground font-medium">{title}</span>
                </nav>
                <nav
                    aria-label="breadcrumb"
                    className="md:hidden flex items-center mb-4"
                >
                    <Link
                        href={`/games/${subcategorySlug}`}
                        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span aria-hidden="true">←</span>
                        {subcategory}
                    </Link>
                </nav>

                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        {title}
                    </h1>
                    {onReset && (
                        <button
                            onClick={onReset}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" />
                            New Game
                        </button>
                    )}
                </div>

                {instructions && (
                    <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                        {instructions}
                    </p>
                )}

                {status && status.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-4">
                        {status.map((s) => (
                            <div
                                key={s.label}
                                className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm"
                            >
                                <span className="text-muted-foreground">{s.label}: </span>
                                <span className="font-semibold text-foreground">{s.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="racira-page-container pb-16">{children}</div>
        </div>
    );
}

export function GameButton({
    children,
    onClick,
    variant = "default",
    disabled,
    className = "",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "default" | "primary" | "ghost";
    disabled?: boolean;
    className?: string;
}) {
    const base =
        "inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        default: "border border-border bg-card hover:bg-accent",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "hover:bg-accent",
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}