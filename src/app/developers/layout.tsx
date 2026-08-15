import Header from "@/components/Header";
import { LegalLinks } from "@/components/LegalLinks";

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
        <LegalLinks />
      </footer>
    </div>
  );
}
