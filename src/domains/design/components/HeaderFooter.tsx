
import { LegalLinks } from "@/components/LegalLinks";
import { DESIGN_SITE } from "@/domains/design/site";
import { copyrightLine } from "@/lib/site-identity";


export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
      <p>{copyrightLine(DESIGN_SITE)}</p>
      <LegalLinks className="mt-4" />
    </footer>
  );
}
