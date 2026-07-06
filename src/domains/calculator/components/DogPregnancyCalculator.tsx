"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Bone } from "lucide-react";

const DogPregnancyCalculator = () => {
  const [matingDate, setMatingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const mating = new Date(matingDate);
    if (isNaN(mating.getTime())) return;

    // Average canine gestation: 63 days from ovulation / ~65 from LH surge
    const avgGestation = 63;
    const dueDate = new Date(mating);
    dueDate.setDate(dueDate.getDate() + avgGestation);

    const earlyDate = new Date(mating);
    earlyDate.setDate(earlyDate.getDate() + 58);
    const lateDate = new Date(mating);
    lateDate.setDate(lateDate.getDate() + 68);

    const today = new Date();
    const daysPregnant = Math.round((today.getTime() - mating.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    // Canine pregnancy key milestones
    const day25 = new Date(mating); day25.setDate(day25.getDate() + 25);
    const day45 = new Date(mating); day45.setDate(day45.getDate() + 45);
    const day58 = new Date(mating); day58.setDate(day58.getDate() + 58);

    const trimester = daysPregnant < 21 ? "1st (Weeks 1–3)" : daysPregnant < 42 ? "2nd (Weeks 4–6)" : "3rd (Weeks 7–9)";
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    setResults({
      dueDate: fmt(dueDate),
      earlyDate: fmt(earlyDate),
      lateDate: fmt(lateDate),
      ultrasoundDate: fmt(day25),
      xrayDate: fmt(day45),
      prepDate: fmt(day58),
      daysPregnant,
      daysRemaining,
      trimester,
    });
  };

  const reset = () => {
    setShowResults(false);
    const d = new Date(); d.setDate(d.getDate() - 30);
    setMatingDate(d.toISOString().split("T")[0]);
    setResults(null);
  };

  const faqs = [
    {
      question: "How long is a dog pregnant?",
      answer: "The average canine gestation is 63 days from the date of ovulation. Since the date of ovulation can differ from the date of mating, actual whelping dates commonly range from 58 to 68 days after mating."
    },
    {
      question: "What are the first signs of dog pregnancy?",
      answer: "In the first few weeks, signs are subtle: slight mucous discharge, behavioural changes, and morning sickness. By weeks 4–5, the abdomen will visibly enlarge and nipples will swell. A vet can confirm with ultrasound around day 25–30."
    },
    {
      question: "How do I prepare a whelping box?",
      answer: "Set up the whelping box in a warm, quiet room 1–2 weeks before the due date. The box should be large enough for the dam to stretch out fully with room for the puppies, but with rails to prevent the mother rolling onto a puppy."
    },
    {
      question: "What are signs of imminent labour in dogs?",
      answer: "Watch for nesting behaviour (rearranging bedding), restlessness, refusing food, shivering, and a drop in rectal temperature to below 37.2°C (99°F). Active labour typically begins within 12–24 hours of the temperature drop."
    },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Dog Pregnancy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dog Pregnancy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Date of Mating</label>
                <input
                  type="date"
                  value={matingDate}
                  onChange={(e) => setMatingDate(e.target.value)}
                  className="input-calc"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Pregnancy Milestones</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Expected Whelping Date</p>
                    <p className="text-2xl font-black text-foreground">{results.dueDate}</p>
                    <p className="text-sm text-muted-foreground mt-1">{results.daysRemaining} days remaining</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Trimester</p>
                    <p className="text-xl font-black text-foreground">{results.trimester}</p>
                    <p className="text-sm text-muted-foreground mt-1">Day {results.daysPregnant} of ~63</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Ultrasound Possible (Day 25)", value: 0, textValue: results.ultrasoundDate },
                  { label: "X-ray for Puppy Count (Day 45)", value: 0, textValue: results.xrayDate },
                  { label: "Prep Whelping Box (Day 58)", value: 0, textValue: results.prepDate },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Complete Guide to Dog Pregnancy (Canine Gestation)</h2>
              <p>Responsible breeding requires careful planning and attentive care throughout the entire gestation period. Here is everything you need to know about the 9 weeks of canine pregnancy.</p>

              <h3>Stage 1: Fertilisation (Days 1–7)</h3>
              <p>After mating, sperm can remain viable in the reproductive tract for up to 7 days. Because of this, the exact date of conception may differ from the mating date. Eggs are fertilised in the fallopian tubes and begin their journey to the uterus for implantation.</p>

              <h3>Stage 2: Embryonic Development (Days 8–28)</h3>
              <p>Embryos implant in the uterine wall around day 16–18. By day 25, a vet can detect heartbeats using ultrasound. Some dams may experience morning sickness and reduced appetite during this period.</p>

              <h3>Stage 3: Foetal Growth (Days 29–63)</h3>
              <p>This is the most dramatic phase. Organs form, skeletal structure calcifies (visible on X-ray from day 45 onward), and the pups grow rapidly. The dam's abdomen will become obviously distended. Nutritional needs increase by 25–50% in the final 3 weeks.</p>

              <h3>Nutrition During Pregnancy</h3>
              <p>Switch to a high-quality puppy or all-life-stage formula from week 5 onward. In the final trimester, shift to multiple smaller meals as the growing uterus reduces stomach capacity. Avoid calcium supplementation unless directed by a vet — excess calcium can actually impair uterine contractions during labour.</p>

              <h3>Warning Signs During Pregnancy</h3>
              <p>Contact your vet immediately if you notice: green or black discharge before the first puppy is delivered, more than 4 hours of active straining without a puppy being born, extreme lethargy, or signs of systemic illness. Emergency caesarean sections can save both the dam and her puppies.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dog-pregnancy" />
          <PopularCalculators exclude="/calculator/dog-pregnancy-calculator" />
        </div>
      </div>
    </>
  );
};

export default DogPregnancyCalculator;

