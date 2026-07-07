import Header from "@/components/Header";

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Developers" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
