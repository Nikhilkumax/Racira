import Link from "next/link";
import type { Tool } from "@/data/pdf/tools";

const SERVER_TOOLS = [
  "pdf-to-word", "pdf-to-excel", "pdf-to-powerpoint",
  "word-to-pdf", "excel-to-pdf", "powerpoint-to-pdf", "html-to-pdf",
  "ocr-pdf", "sign-pdf", "edit-pdf", "add-text", "add-image",
  "redact-pdf", "protect-pdf", "unlock-pdf",
];

const ToolCard = ({ tool }: { tool: Tool }) => {
  const isServer = SERVER_TOOLS.includes(tool.slug);

  return (
    <Link
      href={`/pdf/${tool.slug}`}
      className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6 card-hover relative"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
        isServer ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
      }`}>
        <tool.icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-foreground text-[15px] leading-snug">
          {tool.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {tool.description}
        </p>
        {isServer && (
          <span className="inline-flex items-center gap-1 mt-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Coming Soon
          </span>
        )}
      </div>
    </Link>
  );
};

export default ToolCard;
