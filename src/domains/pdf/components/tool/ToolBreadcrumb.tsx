import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ToolBreadcrumbProps {
  category: string;
  toolName: string;
}

/**
 * Inline breadcrumb rendered flush below the sticky header (no gap, no
 * background card). Path: Home / PDF Tools / <Category> / <Tool Name>,
 * with `>` chevron separators and the last item highlighted.
 *
 * "PDF Tools" links to the homepage at `/` (the catalog landing page).
 */
const ToolBreadcrumb = ({ category, toolName }: ToolBreadcrumbProps) => {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        {/* ── MOBILE: ← [Category] (immediate parent) ── */}
        <nav aria-label="breadcrumb" className="md:hidden py-3">
          <a
            href="/pdf"
            aria-label={`Back to ${category}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span aria-hidden="true">←</span>
            {category}
          </a>
        </nav>

        {/* ── DESKTOP: full trail ── */}
        <Breadcrumb className="hidden md:flex py-3">
          <BreadcrumbList className="text-[13px]">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/pdf">PDF Tools</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/pdf">{category}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground">
                {toolName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default ToolBreadcrumb;
