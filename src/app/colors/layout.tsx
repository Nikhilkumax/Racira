import Header from "@/components/Header";

export default function ColorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Colors" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
