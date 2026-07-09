
import { totalCount } from "@/domains/design/registry";


export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
      Racira Design — {totalCount} free design tools.
    </footer>
  );
}
