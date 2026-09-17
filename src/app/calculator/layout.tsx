import Header from "@/components/Header";
import { LegalLinks } from "@/components/LegalLinks";
import { CALCULATOR_SITE } from "@/domains/calculator/site";
import { copyrightLine } from "@/lib/site-identity";


export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header mode="category" categoryName="Calculator" />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 py-8">
        <p className="mb-3 text-center text-xs text-muted-foreground">{copyrightLine(CALCULATOR_SITE)}</p>
        <LegalLinks />
      </footer>
    </>
  );
}
