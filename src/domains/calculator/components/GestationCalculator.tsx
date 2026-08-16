"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Baby } from "lucide-react";

const ANIMALS = [
  { id: "cow", label: "Cow (Bos taurus)", days: 283 },
  { id: "horse", label: "Horse (Equus)", days: 340 },
  { id: "goat", label: "Goat (Capra)", days: 150 },
  { id: "sheep", label: "Sheep (Ovis)", days: 147 },
  { id: "pig", label: "Pig (Sus)", days: 114 },
  { id: "dog", label: "Dog (Canis)", days: 63 },
  { id: "cat", label: "Cat (Felis)", days: 65 },
  { id: "rabbit", label: "Rabbit (Oryctolagus)", days: 31 },
  { id: "elephant", label: "Elephant (Loxodonta)", days: 640 },
  { id: "human", label: "Human (Homo sapiens)", days: 280 },
] as const;

interface GestResult {
  animal: string;
  days: number;
  dueDate: string;
  weeks: number;
  dateStr: string;
}

function calcGestation(animalId: string, dateStr: string): GestResult {
  const animal = ANIMALS.find((a) => a.id === animalId) ?? ANIMALS[0];
  const date = dateStr ? new Date(dateStr + "T12:00:00") : new Date();
  const due = new Date(date);
  due.setDate(due.getDate() + animal.days);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return { animal: animal.label, days: animal.days, dueDate: fmt(due), weeks: animal.days / 7, dateStr: fmt(date) };
}

const DEFAULTS = { animal: "cow", date: "" };

const faqs = [
  { question: "How long are common gestation periods?", answer: "Humans ~280 days (40 weeks), cows ~283, horses ~340, pigs ~114, dogs ~63, cats ~65, rabbits ~31, elephants ~640 (22 months). In general, larger mammals carry longer — though elephants and whales take it to extremes." },
  { question: "How is the due date calculated?", answer: "Add the species' average gestation length in days to the breeding/conception date. Individual variation is normal — cattle can range 279–287 days and humans 37–42 weeks. This calculator uses the species average." },
  { question: "Why do small mammals have short gestations?", answer: "Shorter gestation trades infant maturity for faster reproduction — rabbits and rodents can produce many litters per year. Large mammals invest more time per offspring because the offspring must be relatively mature at birth to survive." },
];

export default function GestationCalculator() {
  const [animal, setAnimal] = useState(DEFAULTS.animal);
  const [date, setDate] = useState(DEFAULTS.date);
  const [result, setResult] = useState<GestResult>(() => calcGestation("cow", ""));

  const handleCalculate = () => {
    setResult(calcGestation(animal, date));
  };

  const reset = () => {
    setAnimal(DEFAULTS.animal);
    setDate(DEFAULTS.date);
    setResult(calcGestation("cow", ""));
  };

  const breakdown = [
    { label: "Species", value: result.animal, highlight: false },
    { label: "Conception / Breeding Date", value: result.dateStr, highlight: false },
    { label: "Gestation Length", value: `${result.days} days (${result.weeks.toFixed(1)} weeks)`, highlight: false },
    { label: "Expected Due Date", value: result.dueDate, highlight: true },
    { label: "Trimester Checkpoints", value: result.days >= 100 ? `At ${Math.round(result.days / 3)} days: 1/3 complete` : "Short gestation", highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Gestation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gestation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Baby className="w-4 h-4" /> Due Date Estimator
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Species</label>
                <select value={animal} onChange={(e) => setAnimal(e.target.value)} className="input-calc">
                  {ANIMALS.map((a) => (
                    <option key={a.id} value={a.id}>{a.label} — {a.days} days</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Conception / Breeding Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-calc" />
                <p className="text-xs text-muted-foreground mt-1">Leave empty to use today's date.</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Baby className="w-4 h-4 text-primary" /> EXPECTED DUE DATE
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.dueDate}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {result.days} days ({result.weeks.toFixed(1)} weeks) after {result.dateStr}.
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Gestation Lengths by Species</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {ANIMALS.map((a) => (
                  <div key={a.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{a.label.split(" (")[0]}</span>
                    <span className="font-semibold">{a.days} days</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Gestation Calculator</h2>
            <p>Gestation is the period from conception to birth, and it varies enormously across species — from 31 days in rabbits to 640 days in elephants. The length tracks body size and evolutionary strategy: small mammals reproduce fast with short gestations and large litters, while large mammals invest months of pregnancy in a single, relatively mature offspring.</p>
            <h3>Practical use</h3>
            <p>Livestock farmers plan breeding calendars around gestation — a cow bred on July 1 is expected to calve around April 10 the following year (283 days). For dogs and cats, the window is tighter (58–68 days), and veterinarians often date pregnancy from ovulation rather than mating. This calculator adds the species-average period to your chosen date to give an expected due date, with the understanding that a few days of variation is completely normal.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gestation-calculator" />
          <PopularCalculators exclude="/calculator/gestation-calculator" />
        </div>
      </div>
    </>
  );
}
