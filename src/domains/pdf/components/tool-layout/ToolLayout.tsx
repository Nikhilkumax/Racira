import Link from "next/link";
import type { ReactNode } from "react";
import type { Tool } from "@/domains/pdf/registry/tools";

interface ToolLayoutProps {
  tool: Tool;
  slug: string;
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

const ToolLayout = ({ tool, slug, leftPanel, rightPanel }: ToolLayoutProps) => {
  return (
    <main className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Breadcrumb bar */}
      <div className="border-b border-border bg-background px-4 sm:px-6 py-2.5 shrink-0">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{tool.name}</span>
        </nav>
      </div>

      {/* 2-panel workspace */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Left: Preview area */}
        <div className="flex-1 overflow-auto bg-muted/30 relative">
          {leftPanel}
        </div>

        {/* Right: Options panel */}
        <div className="w-full lg:w-[340px] xl:w-[380px] border-t lg:border-t-0 lg:border-l border-border bg-card overflow-auto shrink-0">
          {rightPanel}
        </div>
      </div>
    </main>
  );
};

export default ToolLayout;
