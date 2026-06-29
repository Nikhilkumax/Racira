import Link from "next/link";
import { useTheme } from "@/lib/pdf/ThemeProvider";
import { Moon, Sun, ChevronDown } from "lucide-react";
import { tools, categories } from "@/data/pdf/tools";
import { useState, useRef, useEffect } from "react";

const Header = () => {
  const { theme, toggle } = useTheme();
  const [toolsOpen, setToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border"
      style={{ boxShadow: "var(--header-shadow)" }}
    >
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="text-primary">Racira</span>
          <span className="text-foreground">PDF</span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Tools dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              Tools
              <ChevronDown className="h-4 w-4" />
            </button>
            {toolsOpen && (
              <div className="absolute right-0 top-full mt-2 w-[540px] max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-lg">
                {categories.map((cat) => (
                  <div key={cat} className="mb-4 last:mb-0">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {cat}
                    </h4>
                    <div className="grid grid-cols-2 gap-1">
                      {tools
                        .filter((t) => t.category === cat)
                        .map((tool) => (
                          <Link
                            key={tool.slug}
                            href={`/pdf/${tool.slug}`}
                            onClick={() => setToolsOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
                          >
                            <tool.icon className="h-4 w-4 text-primary" />
                            {tool.name}
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
