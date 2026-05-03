"use client";

import Link from "next/link";
import { Calculator, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const CalcHeader = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="container-page flex h-14 items-center justify-between">
        <Link href="/calculator" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Calculator className="h-5 w-5 text-blue-600" />
          <span>Racira <span className="text-blue-600">Calculator</span></span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Explore Tools
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default CalcHeader;
