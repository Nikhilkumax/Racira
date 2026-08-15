
import { LegalLinks } from "@/components/LegalLinks";


export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
      <p>Racira Design — free, private, in-browser design tools.</p>
      <LegalLinks className="mt-4" />
    </footer>
  );
}
