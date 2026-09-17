import Header from "@/components/Header";
import { LegalLinks } from "@/components/LegalLinks";
import { DEVELOPERS_SITE } from "@/domains/developers/site";
import { copyrightLine } from "@/lib/site-identity";

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-developers min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Developers" />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border/60 py-8">
        <p className="mb-3 text-center text-xs text-muted-foreground">{copyrightLine(DEVELOPERS_SITE)}</p>
        <LegalLinks />
      </footer>
    </div>
  );
}
