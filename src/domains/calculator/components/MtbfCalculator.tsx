"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, BarChart3, Wrench, Clock, Gauge } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";

interface MtbfResult {
  mtbf: number;
  failureRate: number;
  mttr: number;
  availability: number;
  uptime: number;
  downtime: number;
  reliability: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  uptimeData: { hour: number; uptime: number; cumulative: number }[];
  barData: { name: string; hours: number; fill: string }[];
}

const DEFAULTS = {
  operationalTime: "8760",
  numFailures: "5",
  mttr: "8",
  operatingHoursPerDay: "24",
};

const calculate = (v: typeof DEFAULTS): MtbfResult => {
  const opTime = parseFloat(v.operationalTime) || 0;
  const failures = parseFloat(v.numFailures) || 0;
  const mttr = parseFloat(v.mttr) || 0;
  const hoursPerDay = parseFloat(v.operatingHoursPerDay) || 24;

  let mtbf = 0;
  let failureRate = 0;
  let availability = 100;
  let uptime = opTime;
  let downtime = 0;
  let reliability = 100;

  if (failures > 0 && opTime > 0) {
    mtbf = opTime / failures;
    failureRate = failures / opTime;
    downtime = failures * mttr;
    uptime = opTime;
  } else if (opTime > 0) {
    mtbf = opTime;
    failureRate = 1 / opTime;
  }

  if (mtbf > 0 && mttr >= 0) {
    availability = (mtbf / (mtbf + mttr)) * 100;
    reliability = Math.exp(-failureRate * mtbf) * 100;
  }

  const days = Math.ceil(opTime / hoursPerDay) || 1;
  const uptimeData: { hour: number; uptime: number; cumulative: number }[] = [];
  for (let d = 0; d <= days; d++) {
    const hour = d * hoursPerDay;
    const remaining = Math.max(0, opTime - hour);
    const cumFailures = failureRate > 0 ? failureRate * hour : 0;
    const expectedUptime = availability / 100 * remaining;
    uptimeData.push({
      hour,
      uptime: hour > 0 ? parseFloat(expectedUptime.toFixed(2)) : 0,
      cumulative: parseFloat((100 - (cumFailures * 100)).toFixed(1)),
    });
  }

  const barData = [
    { name: "MTBF", hours: parseFloat(mtbf.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "MTTR", hours: parseFloat(mttr.toFixed(1)), fill: "#ef4444" },
    { name: "Total Time", hours: parseFloat(opTime.toFixed(1)), fill: "#3b82f6" },
    { name: "Uptime", hours: parseFloat(uptime.toFixed(1)), fill: "#10b981" },
    { name: "Downtime", hours: parseFloat(downtime.toFixed(1)), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Total Operational Time", value: `${opTime.toFixed(1)} hours` },
    { label: "Total Operational Days", value: `${days} days` },
    { label: "Number of Failures", value: `${failures.toFixed(0)} failures` },
    { label: "MTTR (Mean Time to Repair)", value: `${mttr.toFixed(1)} hours` },
    { label: "MTBF (Mean Time Between Failures)", value: `${mtbf.toFixed(1)} hours` },
    { label: "MTBF in Days", value: `${(mtbf / 24).toFixed(1)} days` },
    { label: "Failure Rate (λ)", value: `${failureRate.toFixed(6)} failures/hour` },
    { label: "Availability", value: `${availability.toFixed(2)}%` },
    { label: "Total Downtime", value: `${downtime.toFixed(1)} hours` },
    { label: "Total Uptime", value: `${uptime.toFixed(1)} hours` },
  ];

  const summaryStats = [
    { label: "MTBF", value: `${mtbf.toFixed(1)} hrs` },
    { label: "Failure Rate", value: `${(failureRate * 1000).toFixed(2)} /1000hrs` },
    { label: "MTTR", value: `${mttr.toFixed(1)} hrs` },
    { label: "Availability", value: `${availability.toFixed(2)}%` },
    { label: "Reliability", value: `${reliability.toFixed(2)}%` },
    { label: "Total Downtime", value: `${downtime.toFixed(1)} hrs` },
  ];

  return {
    mtbf,
    failureRate,
    mttr,
    availability,
    uptime,
    downtime,
    reliability,
    breakdown,
    summaryStats,
    uptimeData,
    barData,
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded shadow text-xs">
        <p className="font-bold">{payload[0].payload.name || payload[0].name}</p>
        <p style={{ color: payload[0].payload.fill || payload[0].color }}>{payload[0].value} hours</p>
      </div>
    );
  }
  return null;
};

export default function MtbfCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<MtbfResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => {
    setResult(calculate(vals));
  };

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const updateVal = (key: keyof typeof DEFAULTS, val: string) =>
    setVals((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is MTBF?", answer: "MTBF (Mean Time Between Failures) is the average time between consecutive failures of a repairable system. It is calculated by dividing the total operational time by the number of failures over that period." },
    { question: "What is the difference between MTBF and MTTR?", answer: "MTBF measures how long a system operates between failures, while MTTR (Mean Time To Repair) measures how long it takes to repair the system after a failure. Together with availability, they characterize system reliability and maintainability." },
    { question: "How is availability calculated?", answer: "Availability = MTBF / (MTBF + MTTR). This gives the fraction of time the system is operational. An availability of 99.9% means the system is down for about 8.76 hours per year." },
    { question: "What does the failure rate tell you?", answer: "The failure rate (λ) is the frequency with which a system fails, expressed as failures per unit time. It is the reciprocal of MTBF: λ = 1/MTBF. A lower failure rate means higher reliability." },
    { question: "What is a good MTBF value?", answer: "MTBF targets vary widely by industry. For consumer electronics, 10,000-50,000 hours is common. For enterprise servers, 100,000+ hours. For aerospace systems, millions of hours. The 'bathtub curve' shows that failure rates are typically high at the beginning (infant mortality) and end of life." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Engineering", href: "/calculator#engineering" },
          { label: "MTBF Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Mean Time Between Failures (MTBF) Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5" /> Operational Data
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Operational Time</label>
                  <div className="relative">
                    <input type="number" value={vals.operationalTime} onChange={(e) => updateVal("operationalTime", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">hours</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Number of Failures</label>
                  <input type="number" value={vals.numFailures} onChange={(e) => updateVal("numFailures", e.target.value)} className="input-calc" step="1" min="0" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" /> Maintenance Data
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">MTTR (Mean Time to Repair)</label>
                  <div className="relative">
                    <input type="number" value={vals.mttr} onChange={(e) => updateVal("mttr", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">hours</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Hours Per Day</label>
                  <input type="number" value={vals.operatingHoursPerDay} onChange={(e) => updateVal("operatingHoursPerDay", e.target.value)} className="input-calc" step="any" min="0.1" max="24" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCalculate} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> MTBF
                </div>
                <div className="text-4xl font-bold text-primary mb-1">{result.mtbf.toFixed(1)} hours</div>
                <p className="text-sm text-muted-foreground">
                  Availability: {result.availability.toFixed(2)}% · Failure Rate: {(result.failureRate * 1000).toFixed(2)} /1000hrs
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Availability</div>
                  <div className={`text-lg font-bold ${result.availability >= 99.9 ? 'text-emerald-600' : result.availability >= 99 ? 'text-amber-600' : 'text-rose-600'}`}>{result.availability.toFixed(2)}%</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">MTTR</div>
                  <div className="text-lg font-bold text-foreground">{result.mttr.toFixed(1)} hrs</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Reliability</div>
                  <div className="text-lg font-bold text-foreground">{result.reliability.toFixed(2)}%</div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Metric</th>
                      <th className="text-right text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Reliability & Uptime Over Time</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={result.uptimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(val) => `${val}h`} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="cumulative" name="Cumulative Uptime %" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="uptime" name="Instantaneous Uptime" stroke="#10b981" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">MTBF Components Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                      {result.barData.map((_, i) => (
                        <Cell key={i} fill={result.barData[i].fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">MTBF and Reliability Engineering: Predicting System Performance</h2>
            <p>In reliability engineering, MTBF (Mean Time Between Failures) is one of the most fundamental metrics used to quantify the reliability of repairable systems. It provides a single number that captures how long a system can be expected to operate before it is likely to experience its next failure. However, MTBF is just one piece of a larger puzzle that includes MTTR (Mean Time To Repair), availability, and the failure rate. Together, these metrics allow engineers, managers, and procurement teams to make data-driven decisions about maintenance schedules, warranty periods, spare parts inventory, and system design improvements.</p>

            <h3>1. The MTBF Calculation and Its Limitations</h3>
            <p>The basic formula for MTBF is straightforward: MTBF = Total Operational Time / Number of Failures. For example, if a data center UPS system operates for 8,760 hours in a year and experiences 3 failures, its MTBF is 2,920 hours, or roughly 4 months between failures. However, this calculation assumes that failures are independent and that the failure rate is constant over time — an assumption known as the "flat part" of the bathtub curve. In practice, many systems exhibit decreasing failure rates (infant mortality) or increasing failure rates (wear-out), which means MTBF is best used as an average or planning metric rather than a precise prediction.</p>

            <h3>2. The Relationship Between MTBF, MTTR, and Availability</h3>
            <p>While MTBF tells you how often a system fails, MTTR tells you how quickly you can get it back. Availability, often expressed as a percentage, is the probability that the system is operational at any given moment. The formula is simple: Availability = MTBF / (MTBF + MTTR). Consider a web server with an MTBF of 500 hours and an MTTR of 4 hours: availability = 500 / 504 = 99.2%. If you reduce MTTR to 2 hours through better spare parts coverage and faster response times, availability rises to 99.6%. For mission-critical systems requiring "five nines" (99.999%), this means only 5.26 minutes of downtime per year, which requires both extremely high MTBF and extremely low MTTR.</p>

            <h3>3. Practical Applications Across Industries</h3>
            <p>MTBF-based calculations are used across every industry that relies on equipment uptime. In data centers, IT teams use MTBF to plan redundant cooling and power paths, ensuring that the probability of simultaneous failure is negligible. In manufacturing, production lines use MTBF to schedule preventive maintenance during planned downtime windows, minimizing unplanned outages. In aerospace and defense, MTBF is part of the formal safety case for aircraft engines, medical devices, and weapons systems, where the cost of failure can be catastrophic. Airlines, for instance, rely on engine MTBF data in the tens of thousands of hours to ensure that in-flight shutdowns are rare events.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mean-time-between-failures-mtbf-calculator" />
          <PopularCalculators exclude="/calculator/mean-time-between-failures-mtbf-calculator" />
        </div>
      </div>
    </>
  );
}
