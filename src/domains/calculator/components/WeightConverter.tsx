"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Calculator } from "lucide-react";

type WeightUnit = "mg" | "g" | "kg" | "ton" | "oz" | "lb" | "st";

const units: { key: WeightUnit; label: string; shortLabel: string; toGrams: number }[] = [
  { key: "mg", label: "Milligrams (mg)", shortLabel: "mg", toGrams: 0.001 },
  { key: "g", label: "Grams (g)", shortLabel: "g", toGrams: 1 },
  { key: "kg", label: "Kilograms (kg)", shortLabel: "kg", toGrams: 1000 },
  { key: "ton", label: "Metric Tons (t)", shortLabel: "t", toGrams: 1_000_000 },
  { key: "oz", label: "Ounces (oz)", shortLabel: "oz", toGrams: 28.3495 },
  { key: "lb", label: "Pounds (lb)", shortLabel: "lb", toGrams: 453.592 },
  { key: "st", label: "Stones (st)", shortLabel: "st", toGrams: 6350.29 },
];

const fmt = (n: number) => {
  if (Math.abs(n) >= 0.01 || n === 0)
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  return n.toExponential(4);
};

const faqs = [
  {
    question: "What is a weight converter?",
    answer:
      "A weight converter is a tool that lets you instantly convert a measurement of weight or mass from one unit to another — for example, from kilograms to pounds, grams to ounces, or stones to kilograms. Our converter supports seven commonly used metric and imperial units and shows all conversions simultaneously so you can compare at a glance.",
  },
  {
    question: "How many grams are in a pound?",
    answer:
      "There are exactly 453.592 grams in one pound (lb). Conversely, one gram equals approximately 0.002205 pounds. This conversion factor is the international standard and is used in both scientific and everyday contexts. For quick mental math, you can remember that 1 lb ≈ 454 g.",
  },
  {
    question: "How do I convert kilograms to pounds?",
    answer:
      "To convert kilograms (kg) to pounds (lb), multiply the kilogram value by 2.20462. For example, 70 kg × 2.20462 = 154.32 lb. To go the other direction — pounds to kilograms — divide the pound value by 2.20462, or equivalently multiply by 0.453592. Our calculator performs this conversion instantly with up to 6 decimal places of precision.",
  },
  {
    question: "What is the difference between weight and mass?",
    answer:
      "Mass is the amount of matter in an object and does not change regardless of location. Weight is the gravitational force acting on that mass — it varies depending on where you are (e.g., on the Moon you weigh less but your mass stays the same). In everyday usage, 'weight' and 'mass' are used interchangeably, and units like kilograms and pounds are used to measure both. Technically, kilograms (kg) measure mass, while Newtons (N) measure force (weight). For practical purposes on Earth, this distinction rarely matters.",
  },
  {
    question: "How many pounds are in a stone?",
    answer:
      "One stone (st) equals exactly 14 pounds (lb). Stones are a traditional British and Irish unit of weight still commonly used in those countries for measuring body weight. For example, a person who weighs 11 stone is 154 pounds, or approximately 69.85 kilograms. Our calculator supports stones for easy conversion.",
  },
  {
    question: "What is a metric ton and how does it compare to other units?",
    answer:
      "A metric ton (also called a tonne) equals exactly 1,000 kilograms, or 2,204.62 pounds, or approximately 1.102 US short tons. It is the standard large-mass unit in the metric system and is widely used in shipping, trade, and industry. Do not confuse it with the US short ton (2,000 lb) or the UK long ton (2,240 lb), which are different measurements.",
  },
  {
    question: "How accurate is this weight converter?",
    answer:
      "Our weight converter uses internationally recognized, high-precision conversion factors for all units. Results are displayed with up to 6 decimal places, and very small numbers are shown in scientific notation for clarity. The converter is suitable for everyday use, cooking, fitness tracking, and scientific applications. For certified laboratory or trade purposes, always use a calibrated physical scale.",
  },
  {
    question: "Can I convert between imperial and metric units?",
    answer:
      "Yes, absolutely. Our converter supports seamless conversion between all metric units (milligrams, grams, kilograms, metric tons) and all imperial units (ounces, pounds, stones). Simply enter your value, select the source unit and the target unit, click Calculate, and instantly see the converted result — plus a table showing all seven unit equivalents at once.",
  },
];

const WeightConverter = () => {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<WeightUnit>("kg");
  const [to, setTo] = useState<WeightUnit>("lb");
  const [showResults, setShowResults] = useState(false);

  // Computed
  const v = parseFloat(value) || 0;
  const fromUnit = units.find((u) => u.key === from)!;
  const toUnit = units.find((u) => u.key === to)!;
  const grams = v * fromUnit.toGrams;
  const result = grams / toUnit.toGrams;

  const handleCalculate = () => {
    if (!value || isNaN(parseFloat(value))) return;
    setShowResults(true);
  };

  const reset = () => {
    setValue("1");
    setFrom("kg");
    setTo("lb");
    setShowResults(false);
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Weight Converter" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Weight Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField
                  id="wt-value"
                  label="Weight Value"
                  value={value}
                  onChange={setValue}
                  tooltip="Enter the numeric value you want to convert."
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">From Unit</label>
                  <Select value={from} onValueChange={(v) => setFrom(v as WeightUnit)}>
                    <SelectTrigger className="input-calc" id="wt-from">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.key} value={u.key}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">To Unit</label>
                  <Select value={to} onValueChange={(v) => setTo(v as WeightUnit)}>
                    <SelectTrigger className="input-calc" id="wt-to">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.key} value={u.key}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  id="wt-calculate"
                  onClick={handleCalculate}
                  className="btn-calculate flex-1 flex items-center justify-center gap-2"
                >Calculate</button>
                <button
                  onClick={reset}
                  className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"
                  aria-label="Reset"
                  id="wt-reset"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-2xl font-bold mb-3">Result</h2>

                <div className="result-card mb-6">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                    {fromUnit.label} → {toUnit.label}
                  </p>
                  <p className="text-2xl font-bold text-[hsl(217,91%,40%)] dark:text-primary">
                    {fmt(v)} {fromUnit.shortLabel} = {fmt(result)} {toUnit.shortLabel}
                  </p>
                </div>

                <h3 className="text-md font-semibold text-foreground mb-3">All Conversions for {fmt(v)} {fromUnit.shortLabel}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {units.map((u) => (
                    <div key={u.key} className="result-card">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{u.label}</p>
                      <p className="text-lg font-bold text-foreground">
                        {fmt(grams / u.toGrams)} {u.shortLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is a Weight Converter?</h2>
              <p>
                A weight converter is an online tool designed to instantly translate a measurement of weight or mass from one unit to another. Whether you need to know how many pounds are in 5 kilograms, how many grams are in an ounce, or how many stones you weigh based on your kilogram measurement, a weight converter eliminates manual calculation errors and saves time.
              </p>
              <p>
                Our weight converter supports seven of the most commonly used weight units: milligrams, grams, kilograms, metric tons (tonnes), ounces, pounds, and stones. It covers both the metric system (used in most of the world) and the imperial or US customary system (used primarily in the United States, United Kingdom, and a few other countries). After entering your value and selecting units, the tool displays the direct conversion and an all-units table in seconds.
              </p>

              <h2 className="text-2xl font-bold mb-3">How Weight Is Measured</h2>
              <p>
                Weight measurement systems have evolved over centuries, leading to the coexistence of metric and imperial units in the modern world. The metric system — adopted by most countries globally — is based on multiples of 10, making conversions between milligrams, grams, kilograms, and metric tons straightforward. One kilogram equals 1,000 grams; one metric ton equals 1,000 kilograms.
              </p>
              <p>
                The imperial system, still used in everyday life in the United States and the United Kingdom, is based on more arbitrary historical standards. Sixteen ounces make one pound; 14 pounds make one stone (used primarily in the UK for body weight). These irregular ratios are exactly why a reliable converter is so useful — there is no simple mental shortcut for all conversions.
              </p>
              <ul>
                <li><strong>Milligram (mg):</strong> One thousandth of a gram. Used in medicine, pharmacology, and nutrition labeling.</li>
                <li><strong>Gram (g):</strong> The base unit of mass in the metric system. Used in cooking, chemistry, and food packaging.</li>
                <li><strong>Kilogram (kg):</strong> 1,000 grams. The standard unit for body weight and most everyday measurements worldwide.</li>
                <li><strong>Metric Ton (t):</strong> 1,000 kilograms or 2,204.62 pounds. Used in industrial, commercial, and shipping contexts.</li>
                <li><strong>Ounce (oz):</strong> 1/16 of a pound, approximately 28.35 grams. Common in US recipes and food portion sizes.</li>
                <li><strong>Pound (lb):</strong> 453.592 grams. Standard US unit for body weight, grocery items, and shipping.</li>
                <li><strong>Stone (st):</strong> 14 pounds or approximately 6.35 kilograms. Widely used in the UK and Ireland for body weight.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p>
                Using the weight converter is straightforward. Begin by entering the numeric value you want to convert into the "Weight Value" field. Next, select the unit you are converting <em>from</em> using the "From Unit" dropdown — for example, kilograms. Then select the unit you want to convert <em>to</em> using the "To Unit" dropdown — for example, pounds. Click the <strong>Convert</strong> button to see your result.
              </p>
              <p>
                The results section shows your direct conversion prominently at the top, followed by a full table displaying your input value converted into all seven supported units simultaneously. This is especially useful when you need to communicate a measurement to people using different unit systems — such as sharing a recipe with both metric and imperial measurements.
              </p>
              <p>
                To start a new conversion, click the reset button (↺) to clear all fields and return to the default settings. There is no limit to the number of conversions you can perform.
              </p>

              <h2 className="text-2xl font-bold mb-3">Understanding Weight vs Mass</h2>
              <p>
                In everyday language, the terms "weight" and "mass" are used interchangeably — and for almost all practical purposes, this is perfectly acceptable. However, in physics, they refer to distinct concepts.
              </p>
              <p>
                <strong>Mass</strong> is the quantity of matter contained in an object. It is an intrinsic property that does not change based on location. Whether you are on Earth, the Moon, or in deep space, your mass remains constant. Mass is measured in kilograms (kg) in the International System of Units (SI).
              </p>
              <p>
                <strong>Weight</strong>, on the other hand, is the gravitational force exerted on an object's mass. It is measured in Newtons (N) in the SI system. Because gravitational acceleration varies by location — about 9.81 m/s² on Earth's surface but only 1.62 m/s² on the Moon — your weight changes depending on where you are, even though your mass does not.
              </p>
              <p>
                For everyday contexts like weighing food, tracking body weight, or shipping packages, this distinction is irrelevant. Scales measure the gravitational force on your mass and display the result in kilograms or pounds, which we conventionally call your "weight." Our converter operates in this everyday sense, treating kg, lb, g, oz, and other units as measures of how heavy something is under standard Earth gravity.
              </p>

              <h2 className="text-2xl font-bold mb-3">Example</h2>
              <p>
                Suppose you weigh yourself and the scale reads <strong>75 kilograms</strong>. You want to know what this is in pounds for a US-based health application, and also in stones for reference with a UK friend.
              </p>
              <ul>
                <li>75 kg × 2.20462 = <strong>165.35 pounds</strong></li>
                <li>75 kg ÷ 6.35029 = <strong>11.81 stones</strong> (or approximately 11 stones and 11 pounds)</li>
                <li>75 kg × 1,000 = <strong>75,000 grams</strong></li>
                <li>75 kg × 1,000,000 = <strong>75,000,000 milligrams</strong></li>
                <li>75 kg ÷ 1,000 = <strong>0.075 metric tons</strong></li>
                <li>75 kg × 35.274 = <strong>2,645.55 ounces</strong></li>
              </ul>
              <p>
                Our converter performs all of these calculations simultaneously the moment you click Convert, saving you from needing to look up each conversion factor individually.
              </p>

              <h2 className="text-2xl font-bold mb-3">Tips for Accurate Weight Measurement</h2>
              <p>
                For the most reliable weight measurements in everyday life, keep these practical tips in mind:
              </p>
              <ul>
                <li><strong>Use a calibrated scale:</strong> Digital scales are generally more accurate than analog (spring-based) scales. Ensure yours is calibrated and zeroed before use.</li>
                <li><strong>Measure on a flat, hard surface:</strong> Scales placed on carpet or uneven surfaces can give inaccurate readings due to uneven force distribution.</li>
                <li><strong>Weigh yourself consistently:</strong> For body weight tracking, weigh yourself at the same time of day (ideally in the morning, after using the bathroom, before eating) for comparable readings over time.</li>
                <li><strong>Account for container weight:</strong> When measuring ingredients, use the "tare" function on kitchen scales to subtract the weight of the bowl or container.</li>
                <li><strong>Check unit settings:</strong> Many digital scales can switch between kg and lb. Always confirm which unit your scale is displaying before recording or converting a measurement.</li>
                <li><strong>Use appropriate precision:</strong> For cooking, rounding to the nearest gram or 0.1 oz is usually sufficient. For pharmaceutical or laboratory work, use a scale accurate to 0.001 g (milligram precision).</li>
              </ul>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weight-converter" />
          <PopularCalculators exclude="/calculator/weight-converter" />
        </div>
      </div>
    </>
  );
};

export default WeightConverter;
