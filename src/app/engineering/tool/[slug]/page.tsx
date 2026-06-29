import { notFound } from "next/navigation";
import { toolsBySlug } from "@/lib/engineering/tools";
import { SiteHeader } from "@/components/engineering/site-header";
import { ComingSoon, ToolShell } from "@/components/engineering/tool-shell";
import {
  OhmsLawTool,
  VoltageDividerTool,
  CurrentDividerTool,
  CapacitorTool,
  InductorTool,
  RcTimeConstantTool,
  PowerFactorTool,
} from "@/components/engineering/tools/electrical";

const builtComponents: Record<string, React.ComponentType> = {
  "ohm-s-law-calculator": OhmsLawTool,
  "voltage-divider-calculator": VoltageDividerTool,
  "current-divider-calculator": CurrentDividerTool,
  "capacitor-calculator": CapacitorTool,
  "inductor-calculator": InductorTool,
  "rc-time-constant-calculator": RcTimeConstantTool,
  "power-factor-calculator": PowerFactorTool,
};

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tool = toolsBySlug.get(resolvedParams.slug);
  
  if (!tool) {
    notFound();
  }

  const Comp = builtComponents[tool.slug];

  return (
    <>
      <SiteHeader />
      <ToolShell tool={tool}>
        {Comp ? <Comp /> : <ComingSoon name={tool.name} />}
      </ToolShell>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tool = toolsBySlug.get(resolvedParams.slug);
  const title = tool ? `${tool.name} — Racira Engineering` : "Tool — Racira Engineering";
  const description = tool?.description ?? "Engineering calculators and references.";
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}
