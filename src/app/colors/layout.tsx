import Header from "@/components/Header";
import { LegalLinks } from "@/components/LegalLinks";

export default function ColorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Colors" />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border/60 py-8">
        <LegalLinks />
      </footer>
    </div>
  );
}
