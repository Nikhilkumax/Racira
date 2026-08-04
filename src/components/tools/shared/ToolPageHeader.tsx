import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface ToolBreadcrumbItem {
  label: string;
  /** `null` marks the current page (rendered as plain text, not a link). */
  href: string | null;
}

interface ToolPageHeaderProps {
  breadcrumbItems: ToolBreadcrumbItem[];
  title: string;
}

/**
 * Canonical tool-page header: breadcrumb trail followed by the tool title.
 *
 * Markup and spacing are taken verbatim from the Calculator domain so every
 * domain renders with identical typography. Deliberately has no eyebrow or
 * description slot — that data still lives in the registries and is consumed
 * by `generateMetadata`, it just isn't rendered here.
 *
 * The mobile nav collapses the trail to a single back-link pointing at the
 * last item that has an `href` (the immediate parent).
 */
const ToolPageHeader = ({ breadcrumbItems, title }: ToolPageHeaderProps) => {
  const linkedItems = breadcrumbItems.filter((item) => item.href);
  const parent = linkedItems[linkedItems.length - 1];

  return (
    <div className="racira-page-container pt-3 pb-0">
      {parent && (
        <nav aria-label="breadcrumb" className="md:hidden flex items-center mb-6">
          <Link
            href={parent.href as string}
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span aria-hidden="true">←</span>{parent.label}
          </Link>
        </nav>
      )}

      <nav aria-label="breadcrumb" className="hidden md:flex items-center flex-wrap text-sm text-muted-foreground mb-6">
        {breadcrumbItems.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </Fragment>
        ))}
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-1 mb-4">
        {title}
      </h1>
    </div>
  );
};

export default ToolPageHeader;
