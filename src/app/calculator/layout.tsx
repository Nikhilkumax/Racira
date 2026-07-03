import Header from "@/components/Header";


export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header mode="category" categoryName="Calculator" />
      <main className="flex-1">{children}</main>
    </>
  );
}
