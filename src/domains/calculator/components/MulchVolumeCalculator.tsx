"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Leaf } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

interface MulchInputs {
  length: number;
  width: number;
  depth: number;
  mulchType: string;
  wasteFactor: number;
}

interface MulchResult {
  volumeCubicFeet: number;
  volumeCubicYards: number;
  weightPounds: number;
  weightTons: number;
  bags2CuFt: number;
  bags3CuFt: number;
  cost: number;
  settledDepth: number;
  coverage1Inch: number;
  coverage2Inch: number;
  coverage3Inch: number;
}

const MULCH_TYPES = {
  "shredded-hardwood": { name: "Shredded Hardwood Bark", density: 22, settlement: 0.85, pricePerYard: 35 },
  "pine-bark": { name: "Pine Bark Nuggets", density: 18, settlement: 0.90, pricePerYard: 40 },
  "cedar-mulch": { name: "Cedar Mulch", density: 20, settlement: 0.88, pricePerYard: 45 },
  "cypress-mulch": { name: "Cypress Mulch", density: 19, settlement: 0.87, pricePerYard: 42 },
  "rubber-mulch": { name: "Rubber Mulch", density: 65, settlement: 0.98, pricePerYard: 80 },
  "straw": { name: "Straw Mulch", density: 10, settlement: 0.75, pricePerYard: 25 },
  "cocoa-shell": { name: "Cocoa Shell Mulch", density: 15, settlement: 0.80, pricePerYard: 50 },
  "compost": { name: "Compost Mulch", density: 35, settlement: 0.70, pricePerYard: 30 },
};

const DEFAULTS: MulchInputs = {
  length: 20,
  width: 10,
  depth: 3,
  mulchType: "shredded-hardwood",
  wasteFactor: 10,
};

function calculateMulch(inputs: MulchInputs): MulchResult {
  const { length, width, depth, mulchType, wasteFactor } = inputs;

  const mulchData = MULCH_TYPES[mulchType as keyof typeof MULCH_TYPES];
  const densityLbPerCuFt = mulchData.density;
  const settlementFactor = mulchData.settlement;
  const pricePerYard = mulchData.pricePerYard;

  const depthFeet = depth / 12;
  const volumeCubicFeet = length * width * depthFeet;
  const volumeWithWaste = volumeCubicFeet * (1 + wasteFactor / 100);
  const volumeCubicYards = volumeWithWaste / 27;

  const weightPounds = volumeWithWaste * densityLbPerCuFt;
  const weightTons = weightPounds / 2000;

  const bags2CuFt = volumeWithWaste / 2;
  const bags3CuFt = volumeWithWaste / 3;

  const cost = volumeCubicYards * pricePerYard;

  const settledDepth = depth * settlementFactor;

  const oneYardCuFt = 27;
  const coverage1Inch = oneYardCuFt / (1 / 12);
  const coverage2Inch = oneYardCuFt / (2 / 12);
  const coverage3Inch = oneYardCuFt / (3 / 12);

  return {
    volumeCubicFeet: volumeWithWaste,
    volumeCubicYards,
    weightPounds,
    weightTons,
    bags2CuFt,
    bags3CuFt,
    cost,
    settledDepth,
    coverage1Inch,
    coverage2Inch,
    coverage3Inch,
  };
}

export default function MulchVolumeCalculator() {
  const [inputs, setInputs] = useState<MulchInputs>(DEFAULTS);
  const [result, setResult] = useState<MulchResult>(calculateMulch(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateMulch(inputs));
  }, [inputs]);

  const handleCalculate = () => {
    setResult(calculateMulch(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateMulch(DEFAULTS));
  };

  const handleInputChange = (field: keyof MulchInputs, value: string | number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Calculators", href: "/calculator" },
    { label: "Mulch Volume Calculator" },
  ];

  const faqs = [
    {
      question: "How much mulch do I need for my garden?",
      answer: "For most landscaping applications, a 2-3 inch depth is recommended. Our calculator determines volume based on your area dimensions and desired depth, then adds waste factor to ensure you have enough material.",
    },
    {
      question: "What is the waste factor for mulch?",
      answer: "A typical waste factor is 10-15% to account for uneven terrain, settling, spillage, and coverage gaps. Increase this for irregular shapes or sloped areas.",
    },
    {
      question: "How many bags of mulch equal one cubic yard?",
      answer: "A cubic yard equals approximately 13.5 bags of 2 cu ft mulch or 9 bags of 3 cu ft mulch. Buying in bulk by the yard is usually more economical for larger projects.",
    },
    {
      question: "Why does mulch settle over time?",
      answer: "Organic mulches decompose and compact due to foot traffic, rain, and natural breakdown by microorganisms. Our calculator includes settlement factors based on mulch type—hardwood settles to about 85% of its original depth after one season.",
    },
    {
      question: "What's the coverage per cubic yard of mulch?",
      answer: "One cubic yard covers approximately 324 sq ft at 1 inch depth, 162 sq ft at 2 inches, or 108 sq ft at 3 inches. Actual coverage varies slightly with mulch type and installation method.",
    },
    {
      question: "Should I use rubber or organic mulch?",
      answer: "Rubber mulch lasts longer and doesn't decompose, making it low-maintenance and good for playgrounds. Organic mulches (bark, wood chips) enrich soil as they break down, improve water retention, and are preferred for garden beds.",
    },
    {
      question: "How deep should mulch be around trees?",
      answer: "Apply 2-4 inches of mulch around trees, keeping it 2-3 inches away from the trunk to prevent rot and pest issues. Spread the mulch ring to the tree's drip line for maximum benefit.",
    },
    {
      question: "How often should I replenish mulch?",
      answer: "Organic mulches should be replenished annually or when depth falls below 2 inches. Fast-decomposing types like straw may need replacement twice per year, while cedar and cypress last longer.",
    },
  ];

  const mulchData = MULCH_TYPES[inputs.mulchType as keyof typeof MULCH_TYPES];

  const breakdownRows = [
    { label: "Area (sq ft)", value: `${(inputs.length * inputs.width).toFixed(1)} ft²` },
    { label: "Depth Specified", value: `${inputs.depth.toFixed(1)} inches` },
    { label: "Raw Volume", value: `${(result.volumeCubicFeet / (1 + inputs.wasteFactor / 100)).toFixed(1)} ft³` },
    { label: "Waste Factor", value: `${inputs.wasteFactor}%` },
    { label: "Total Volume (with waste)", value: `${result.volumeCubicFeet.toFixed(1)} ft³`, highlight: true },
    { label: "Volume in Yards", value: `${result.volumeCubicYards.toFixed(2)} yd³`, highlight: true },
    { label: "Mulch Density", value: `${mulchData.density} lb/ft³` },
    { label: "Total Weight", value: `${result.weightPounds.toFixed(0)} lbs (${result.weightTons.toFixed(2)} tons)` },
    { label: "Settlement Factor", value: `${(mulchData.settlement * 100).toFixed(0)}%` },
    { label: "Settled Depth (Year 1)", value: `${result.settledDepth.toFixed(1)} inches` },
    { label: "Est. Cost", value: `$${result.cost.toFixed(2)}`, highlight: true },
  ];

  return (
    <div className="racira-page-container">
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-3xl font-bold mb-6">Mulch Volume Calculator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="space-y-6">
          <Card className="card-calculator !p-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="length" className="text-sm font-medium">
                  Bed Length (ft)
                </Label>
                <Input
                  id="length"
                  type="number"
                  value={inputs.length}
                  onChange={(e) => handleInputChange("length", parseFloat(e.target.value) || 0)}
                  className="h-10 text-base"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="width" className="text-sm font-medium">
                  Bed Width (ft)
                </Label>
                <Input
                  id="width"
                  type="number"
                  value={inputs.width}
                  onChange={(e) => handleInputChange("width", parseFloat(e.target.value) || 0)}
                  className="h-10 text-base"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="depth" className="text-sm font-medium">
                  Desired Depth (inches)
                </Label>
                <Input
                  id="depth"
                  type="number"
                  value={inputs.depth}
                  onChange={(e) => handleInputChange("depth", parseFloat(e.target.value) || 0)}
                  className="h-10 text-base"
                  step="0.5"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="mulchType" className="text-sm font-medium">
                  Mulch Type
                </Label>
                <Select
                  value={inputs.mulchType}
                  onValueChange={(value) => handleInputChange("mulchType", value)}
                >
                  <SelectTrigger id="mulchType" className="h-10 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MULCH_TYPES).map(([key, data]) => (
                      <SelectItem key={key} value={key}>
                        {data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="wasteFactor" className="text-sm font-medium">
                  Waste Factor (%)
                </Label>
                <Input
                  id="wasteFactor"
                  type="number"
                  value={inputs.wasteFactor}
                  onChange={(e) => handleInputChange("wasteFactor", parseFloat(e.target.value) || 0)}
                  className="h-10 text-base"
                  step="1"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleCalculate} className="h-10 w-full">
                  Calculate
                </Button>
                <Button onClick={handleReset} variant="outline" size="icon" className="h-10 w-10 shrink-0">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          <AdPlaceholder />
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="w-8 h-8 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Total Mulch Needed</h3>
            </div>
            <p className="text-4xl font-bold text-primary">{result.volumeCubicYards.toFixed(2)} yd³</p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.volumeCubicFeet.toFixed(1)} cubic feet
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Packaging Options</h3>
            <div className="grid grid-cols-3 divide-x border rounded-lg">
              <div className="p-3 text-center">
                <p className="text-sm text-muted-foreground mb-1">2 cu ft Bags</p>
                <p className="text-2xl font-bold text-green-600">{Math.ceil(result.bags2CuFt)}</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-sm text-muted-foreground mb-1">3 cu ft Bags</p>
                <p className="text-2xl font-bold text-orange-600">{Math.ceil(result.bags3CuFt)}</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-sm text-muted-foreground mb-1">Bulk (yd³)</p>
                <p className="text-2xl font-bold text-blue-600">{result.volumeCubicYards.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Breakdown</h3>
            <div className="space-y-0 border rounded-lg overflow-hidden">
              {breakdownRows.map((row, index) => (
                <div
                  key={index}
                  className={`flex justify-between text-base py-2.5 px-3 ${
                    index < breakdownRows.length - 1 ? "border-b" : ""
                  } ${row.highlight ? "bg-primary/5 font-semibold" : ""}`}
                >
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-3">Coverage Reference (per cubic yard)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>1 inch depth:</span>
                <span className="font-medium">{result.coverage1Inch.toFixed(0)} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span>2 inch depth:</span>
                <span className="font-medium">{result.coverage2Inch.toFixed(0)} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span>3 inch depth:</span>
                <span className="font-medium">{result.coverage3Inch.toFixed(0)} sq ft</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Weight per yard:</span>
                <span className="font-medium">{(mulchData.density * 27).toFixed(0)} lbs</span>
              </div>
            </div>
          </Card>

          <AdPlaceholder />
        </div>
      </div>

      <div className="mt-12 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">Understanding Mulch Volume and Coverage</h2>
        <div className="prose max-w-none text-muted-foreground space-y-4">
          <p>
            Calculating the right amount of mulch ensures your landscaping project stays on budget while providing adequate coverage for weed suppression, moisture retention, and soil temperature regulation. Mulch is sold by volume—either in cubic yards for bulk delivery or in bagged cubic feet at garden centers—so accurate volume calculation is essential.
          </p>
          <p>
            The standard depth for most mulch applications is 2 to 3 inches. This provides effective weed barrier and moisture conservation without smothering plant roots or wasting material. Vegetable gardens and annual beds often use 2 inches, while perennial beds and tree rings benefit from 3-4 inches, especially in hot or dry climates.
          </p>
          <p>
            <strong>Settlement and decomposition</strong> affect organic mulches over time. Shredded hardwood bark settles to roughly 85% of its original volume within the first season as it compacts and begins to break down. Pine bark nuggets settle less (around 90%) due to their larger particle size, while compost mulch can lose 30% of its volume as microorganisms decompose the organic matter and improve the soil.
          </p>
          <p>
            <strong>Waste factors</strong> account for spillage during transport and installation, irregular bed shapes, and material lost to gaps around obstacles. A 10% waste factor is typical for simple rectangular beds, but increase to 15-20% for curved borders, sloped terrain, or beds with many trees, shrubs, or hardscape features.
          </p>
          <h3 className="text-xl font-semibold mt-6">Choosing the Right Mulch Type</h3>
          <p>
            <strong>Shredded hardwood bark</strong> is the most common landscaping mulch. It decomposes moderately, enriches soil, and knits together to resist washing away on slopes. <strong>Pine bark nuggets</strong> last longer and float less than shredded bark, making them ideal for areas with heavy rain. <strong>Cedar and cypress mulches</strong> contain natural oils that resist insects and decay, extending their lifespan to 2-3 years.
          </p>
          <p>
            <strong>Rubber mulch</strong> is made from recycled tires and never decomposes, making it a permanent solution for playgrounds and high-traffic areas. It's heavier (65 lb/ft³ vs. 20 lb/ft³ for wood) and more expensive but eliminates annual replacement. <strong>Straw mulch</strong> is lightweight and inexpensive, ideal for vegetable gardens where rapid decomposition feeds the soil, though it requires frequent replenishment.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <FAQSection faqs={faqs} pageUrl="mulch-volume-calculator" />
      </div>

      <div className="mt-12">
        <PopularCalculators exclude="mulch-volume-calculator" />
      </div>
    </div>
  );
}
