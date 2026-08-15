import Header from "@/components/Header";
import { LegalLinks } from "@/components/LegalLinks";


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
        <LegalLinks />
      </footer>
    </>
  );
}
