"use client";

import Link from "next/link";
import { Wrench } from "lucide-react";
import type { Tool } from "@/data/tools";

const SERVER_TOOLS = [
  "pdf-to-word", "pdf-to-excel", "pdf-to-powerpoint",
  "word-to-pdf", "excel-to-pdf", "powerpoint-to-pdf", "html-to-pdf",
  "ocr-pdf", "sign-pdf", "edit-pdf", "add-text", "add-image",
  "redact-pdf", "protect-pdf", "unlock-pdf",
];

const ToolCard = ({ tool }: { tool: Tool }) => {
  const isServer = SERVER_TOOLS.includes(tool.slug);
  const Icon = tool.icon ?? Wrench;

  return (
    <Link href={`/${tool.slug}`} className="tool-card group">
      {isServer && (
        <span className="tool-card-badge">Soon</span>
      )}
      <div className="tool-card-icon">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">
        {tool.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
        {tool.description}
      </p>
    </Link>
  );
};

export default ToolCard;
