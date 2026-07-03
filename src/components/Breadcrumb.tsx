import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav aria-label="Breadcrumb" className="racira-page-container py-3">
    <ol className="flex flex-nowrap items-center gap-1 text-[11px] sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-none py-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-1 shrink-0">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors truncate max-w-[100px] sm:max-w-none">{item.label}</Link>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[120px] sm:max-w-none">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumb;


