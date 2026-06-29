import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import type { Tool } from "@/data/video/tools";
import { ToolIcon } from "./ToolIcon";

export function ComingSoon({ tool }: { tool: Tool }) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary mb-6">
        <ToolIcon name={tool.icon} className="h-7 w-7" />
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        {tool.name}
      </h1>
      <p className="mt-3 text-muted-foreground">{tool.description}</p>

      <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
        <Clock className="h-4 w-4" />
        Coming soon
      </div>

      <p className="mt-6 text-sm text-muted-foreground max-w-md mx-auto">
        We're polishing this tool. In the meantime, try our live MP4 Converter — it runs entirely in your browser.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/tools/mp4-converter"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Try MP4 Converter
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All tools
        </Link>
      </div>
    </div>
  );
}
