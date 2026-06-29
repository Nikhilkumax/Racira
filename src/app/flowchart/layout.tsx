import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racira Diagrams & Flowcharts — 190 Free Diagramming Tools",
  description:
    "Build flowcharts, mind maps, UML, ER and architecture diagrams. 190 free diagramming tools in your browser. No signup.",
};

export default function FlowchartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
