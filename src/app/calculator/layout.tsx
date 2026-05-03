import CalcHeader from "@/components/calculator/CalcHeader";

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CalcHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}
