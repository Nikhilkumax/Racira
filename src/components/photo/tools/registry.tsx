"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

const DofCalculator = dynamic(() => import("./calc/DofCalculator").then(mod => mod.DofCalculator), { ssr: false });
const HyperfocalCalculator = dynamic(() => import("./calc/HyperfocalCalculator").then(mod => mod.HyperfocalCalculator), { ssr: false });
const FovCalculator = dynamic(() => import("./calc/FovCalculator").then(mod => mod.FovCalculator), { ssr: false });
const FocalEquivCalculator = dynamic(() => import("./calc/FocalEquivCalculator").then(mod => mod.FocalEquivCalculator), { ssr: false });
const MagnificationCalculator = dynamic(() => import("./calc/MagnificationCalculator").then(mod => mod.MagnificationCalculator), { ssr: false });
const CocCalculator = dynamic(() => import("./calc/CocCalculator").then(mod => mod.CocCalculator), { ssr: false });
const NdFilterCalculator = dynamic(() => import("./calc/NdFilterCalculator").then(mod => mod.NdFilterCalculator), { ssr: false });
const PrintSizeCalculator = dynamic(() => import("./calc/PrintSizeCalculator").then(mod => mod.PrintSizeCalculator), { ssr: false });
const PrintDpiChecker = dynamic(() => import("./calc/PrintDpiChecker").then(mod => mod.PrintDpiChecker), { ssr: false });
const GoldenHourCalculator = dynamic(() => import("./calc/SunCalculators").then(mod => mod.GoldenHourCalculator), { ssr: false });
const BlueHourCalculator = dynamic(() => import("./calc/SunCalculators").then(mod => mod.BlueHourCalculator), { ssr: false });
const ExifViewer = dynamic(() => import("./image/ExifViewer").then(mod => mod.ExifViewer), { ssr: false });
const ExifStripper = dynamic(() => import("./image/ExifStripper").then(mod => mod.ExifStripper), { ssr: false });
const CompositionOverlay = dynamic(() => import("./image/CompositionOverlay").then(mod => mod.CompositionOverlay), { ssr: false });
const HistogramTool = dynamic(() => import("./image/HistogramTool").then(mod => mod.HistogramTool), { ssr: false });
const BatchRenamer = dynamic(() => import("./misc/BatchRenamer").then(mod => mod.BatchRenamer), { ssr: false });

export const TOOL_COMPONENTS: Record<string, ComponentType<any>> = {
  "depth-of-field-calculator": DofCalculator,
  "hyperfocal-distance-calculator": HyperfocalCalculator,
  "field-of-view-calculator": FovCalculator,
  "focal-length-equivalent-calculator": FocalEquivCalculator,
  "magnification-calculator": MagnificationCalculator,
  "circle-of-confusion-calculator": CocCalculator,
  "nd-filter-calculator": NdFilterCalculator,
  "print-size-calculator": PrintSizeCalculator,
  "photo-print-dpi-checker": PrintDpiChecker,
  "golden-hour-calculator": GoldenHourCalculator,
  "blue-hour-calculator": BlueHourCalculator,
  "exif-viewer": ExifViewer,
  "exif-stripper": ExifStripper,
  "rule-of-thirds-overlay": () => <CompositionOverlay variant="thirds" />,
  "golden-ratio-overlay": () => <CompositionOverlay variant="golden" />,
  "phi-grid-overlay": () => <CompositionOverlay variant="phi" />,
  "diagonal-method-overlay": () => <CompositionOverlay variant="diagonal" />,
  "histogram-editor": HistogramTool,
  "photo-batch-renamer": BatchRenamer,
};
