"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const DateInput = ({ id, label, value, onChange }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} max={new Date().toISOString().split("T")[0]} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
  </div>
);

interface Inputs { matingDate: string; }

interface Result {
  dueDate: string;
  earlyDate: string;
  lateDate: string;
  daysPregnant: number;
  daysRemaining: number;
  trimester: string;
  progressPct: number;
  chart: { name: string; value: number; status: string }[];
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

const DEFAULTS: Inputs = { matingDate: (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0]; })() };

function calculate(inputs: Inputs): Result | null {
  const mating = new Date(inputs.matingDate + "T12:00:00");
  if (isNaN(mating.getTime())) return null;
  const today = new Date();
  const dueDate = addDays(mating, 63);
  const earlyDate = addDays(mating, 58);
  const lateDate = addDays(mating, 72);
  const daysPregnant = Math.max(0, daysBetween(mating, today));
  const daysRemaining = Math.max(0, daysBetween(today, dueDate));
  const trimester = daysPregnant < 21 ? "1st (Weeks 1-3)" : daysPregnant < 42 ? "2nd (Weeks 4-6)" : "3rd (Weeks 7-9)";
  const progressPct = Math.min(100, Math.max(0, (daysPregnant / 63) * 100));
  const milestones = [
    { day: 0, label: "Mating" },
    { day: 21, label: "1st Trimester" },
    { day: 25, label: "Ultrasound" },
    { day: 42, label: "2nd Trimester" },
    { day: 63, label: "Due Date" },
  ];
  const chart = milestones.map((m) => ({
    name: m.label,
    value: m.day,
    status: daysPregnant >= m.day ? "passed" : m.label === "Due Date" ? "upcoming" : "upcoming",
  }));
  return { dueDate: fmtDate(dueDate), earlyDate: fmtDate(earlyDate), lateDate: fmtDate(lateDate), daysPregnant, daysRemaining, trimester, progressPct, chart };
}

const CatPregnancyCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const hasErrors = isNaN(new Date(inputs.matingDate).getTime());

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const rows = r ? [
    { label: "Date of Mating", value: inputs.matingDate },
    { label: "Earliest Delivery (day 58)", value: r.earlyDate },
    { label: "Expected Due Date (day 63)", value: r.dueDate, highlight: true },
    { label: "Latest Delivery (day 72)", value: r.lateDate },
    { label: "Days Pregnant", value: fmt(r.daysPregnant) + " days", highlight: true },
    { label: "Days Remaining", value: fmt(r.daysRemaining) + " days" },
    { label: "Current Stage", value: r.trimester, total: true },
  ] : [];

  const faqs = [
    { question: "How long is a cat pregnant?", answer: "Average feline gestation is 63-65 days from mating, with a normal range of 58-72 days. First-time queens often deliver a little later than experienced mothers." },
    { question: "What are the signs a cat is pregnant?", answer: "'Pinking up' (rosy, enlarged nipples) around 2-3 weeks, mild morning sickness, increased appetite, then visible abdominal swelling by week 5. A vet can confirm by ultrasound as early as day 25." },
    { question: "How many kittens does a cat usually have?", answer: "The average litter is 4 kittens, ranging from 1 to 12 depending on the queen's age, breed, and health — Siamese tend to larger litters, Persians smaller." },
    { question: "When should I take a pregnant cat to the vet?", answer: "As soon as pregnancy is suspected — to confirm, estimate litter size, and adjust nutrition — plus a final check in the last week before the due date." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Cat Pregnancy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cat Pregnancy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Dates</div>
            <div>
              <DateInput id="matingDate" label="Date of Mating" value={inputs.matingDate} onChange={set("matingDate")} />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Enter a valid mating date.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {r && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
                  </div>
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Expected Due Date</div>
                  <div className="text-3xl font-bold text-primary mb-1 tracking-tight">{r.dueDate}</div>
                  <div className="text-sm text-muted-foreground font-medium"><span className="font-bold text-foreground">{fmt(r.daysRemaining)} days</span> remaining · {fmt(r.progressPct, 0)}% of gestation</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Days Pregnant</span>
                    <span className="font-extrabold text-primary">{fmt(r.daysPregnant)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Current Stage</span>
                    <span className="font-extrabold text-emerald-600">{r.trimester}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Gestation Range</span>
                    <span className="font-extrabold text-foreground">58-72 days</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Milestone</th>
                        <th className="p-2.5 pr-3 text-right w-[170px]">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {rows.map((row) => (
                        <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${row.highlight ? "bg-amber-500/10" : ""}`}>
                          <td className={`p-2.5 pl-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                          <td className={`p-2.5 pr-3 text-right font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Pregnancy Timeline (day of gestation)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={r.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={55} />
                      <YAxis domain={[0, 75]} tick={{ fontSize: 11 }} label={{ value: "Day", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip formatter={(v: number) => ["Day " + fmt(v), ""]} />
                      <Bar dataKey="value" name="Day" radius={[4, 4, 0, 0]}>
                        {r.chart.map((c, i) => (
                          <Cell key={i} fill={c.status === "passed" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">Solid bars = milestones reached.</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Mating Date", value: inputs.matingDate },
                      { label: "Due Date", value: r.dueDate, bold: true },
                      { label: "Days Pregnant", value: fmt(r.daysPregnant) + " days", bold: true },
                      { label: "Days Remaining", value: fmt(r.daysRemaining) + " days" },
                      { label: "Stage", value: r.trimester },
                      { label: "Progress", value: fmt(r.progressPct, 0) + "%" },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                        <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Week-by-Week Development</h2>
            <p>Weeks 1-2: fertilisation and implantation, no visible signs. Week 3: "pinking up" — nipples turn rosy, morning sickness may begin. Weeks 4-5: ultrasound confirms, abdomen rounds. Weeks 6-7: rapid growth, appetite surges. Week 8: kittens move, nesting starts. Week 9+: labour can begin at any time.</p>
            <h2 className="text-2xl font-bold mb-3">Caring for the Queen</h2>
            <p>Switch to high-quality kitten food from week 4 through weaning — it's denser in calories, calcium, and protein. Feed free-choice in the last two weeks, and set up a quiet, warm, dark nesting box lined with towels. A temperature drop below 100°F signals labour is imminent.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cat-pregnancy-calculator" />
          <PopularCalculators exclude="/calculator/cat-pregnancy-calculator" />
        </div>
      </div>
    </>
  );
};
export default CatPregnancyCalculator;
