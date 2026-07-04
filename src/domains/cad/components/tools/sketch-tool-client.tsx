"use client";

import dynamic from "next/dynamic";

export const SketchToolClient = dynamic(
  () => import("@/domains/cad/components/tools/sketch-tool").then((mod) => mod.SketchTool),
  { ssr: false }
);
