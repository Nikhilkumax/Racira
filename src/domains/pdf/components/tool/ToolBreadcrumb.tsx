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
        <Breadcrumb className="py-3">
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
