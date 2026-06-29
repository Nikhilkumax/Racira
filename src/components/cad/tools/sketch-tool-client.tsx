"use client";

import dynamic from "next/dynamic";

export const SketchToolClient = dynamic(
  () => import("@/components/cad/tools/sketch-tool").then((mod) => mod.SketchTool),
  { ssr: false }
);
