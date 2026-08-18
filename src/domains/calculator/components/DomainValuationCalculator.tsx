"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface DomainResult {
  name: string;
  tld: string;
  length: number;
  visitors: number;
  baseValue: number;
  lengthAdj: number;
  keywordMult: number;
  trafficValue: number;
  ageMult: number;
  estimatedValue: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

type Keyword = "none" | "moderate" | "high";

const TLD_BASE: Record<string, number> = { com: 1000, net: 500, org: 500, io: 400, co: 350, ai: 300, app: 300, dev: 250, me: 250, info: 200, biz: 200, other: 150 };
const KEYWORD_MULT: Record<Keyword, number> = { none: 1, moderate: 1.5, high: 2.5 };

function calcDomain(name: string, tld: string, visitors: number, keyword: Keyword, ageYears: number): DomainResult {
  const length = name.length;
  const baseValue = TLD_BASE[tld] || TLD_BASE.other;
  const lengthAdj = length <= 5 ? 3 : length <= 8 ? 1.8 : length <= 12 ? 1.2 : 0.7;
  const keywordMult = KEYWORD_MULT[keyword];
  const trafficValue = visitors * 0.1 * 12 * 20; // $0.10 RPM * 12 months * 20x multiple
  const ageMult = ageYears >= 5 ? 1.3 : ageYears >= 2 ? 1.15 : 1;
  const estimatedValue = Math.round((baseValue * lengthAdj * keywordMult + trafficValue) * ageMult);

  const breakdown = [
    { label: "Domain Name", value: `${name}.${tld}` },
    { label: "Length", value: `${length} characters` },
    { label: "TLD Base Value", value: `$${baseValue.toLocaleString()}` },
    { label: "Length Multiplier", value: `×${lengthAdj}` },
    { label: "Keyword Multiplier", value: `×${keywordMult} (${keyword})` },
    { label: "Traffic Component", value: `$${trafficValue.toLocaleString()}` },
    { label: "Age Multiplier", value: `×${ageMult} (${ageYears} yrs)` },
    { label: "Estimated Market Value", value: `$${estimatedValue.toLocaleString()}` },
  ];
  const summaryStats = [
    { label: "Estimated Value", value: `$${estimatedValue.toLocaleString()}` },
    { label: "TLD", value: `.${tld}` },
    { label: "Length", value: `${length} chars` },
    { label: "Traffic", value: `${visitors}/mo` },
    { label: "Keyword", value: keyword },
    { label: "Age", value: `${ageYears} years` },
    { label: "Base", value: `$${baseValue.toLocaleString()}` },
    { label: "Traffic Value", value: `$${trafficValue.toLocaleString()}` },
  ];
  const chartData = [
    { name: "Base + Length", value: Math.round(baseValue * lengthAdj * keywordMult), fill: "hsl(var(--primary))" },
    { name: "Traffic", value: Math.round(trafficValue), fill: "#10b981" },
    { name: "Age Boost", value: Math.max(0, Math.round((baseValue * lengthAdj * keywordMult + trafficValue) * (ageMult - 1))), fill: "#f59e0b" },
  ];
  return { name, tld, length, visitors, baseValue, lengthAdj, keywordMult, trafficValue, ageMult, estimatedValue, breakdown, summaryStats, chartData };
}

const DEFAULTS = { name: "financehub", tld: "com", visitors: "1000", keyword: "moderate" as Keyword, age: "5" };

export default function DomainValuationCalculator() {
  const [name, setName] = useState(DEFAULTS.name);
  const [tld, setTld] = useState(DEFAULTS.tld);
  const [visitors, setVisitors] = useState(DEFAULTS.visitors);
  const [keyword, setKeyword] = useState<Keyword>("moderate");
  const [age, setAge] = useState(DEFAULTS.age);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<DomainResult | null>(null);

  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const v = parseFloat(visitors) || 0;
  const a = parseInt(age) || 0;
  const errs: string[] = [];
  if (cleanName.length < 2) errs.push("Domain name must be at least 2 characters.");
  if (v < 0) errs.push("Monthly visitors cannot be negative.");
  if (a < 0 || a > 50) errs.push("Domain age must be 0–50 years.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDomain(cleanName, tld, v, keyword, a)); };
  const reset = () => {
    setName(DEFAULTS.name); setTld(DEFAULTS.tld); setVisitors(DEFAULTS.visitors); setKeyword("moderate"); setAge(DEFAULTS.age);
    setResult(calcDomain("financehub", "com", 1000, "moderate", 5));
  };
  useEffect(() => { setResult(calcDomain("financehub", "com", 1000, "moderate", 5)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How are domain names valued?", answer: "Domain value comes from three buckets: the name itself (short, memorable, dictionary words in a strong TLD), the traffic it receives (estimated from ads, parking, and search volume), and its history (age, backlinks, authority). Valuations are heuristics — actual sales range widely." },
    { question: "What makes a domain valuable?", answer: "Length is king: 5 characters or fewer with a .com is rare and valuable. Generic keywords (insurance.com, loans.com) command seven figures because they monetize via type-in traffic. Premium TLDs (.com, .io, .ai, .app) carry a base premium; obscure TLDs subtract from it." },
    { question: "How does traffic affect value?", answer: "A domain with 1,000 monthly visitors monetized at ~$0.10 per visit earns ~$1,200/year. At a 20× revenue multiple, that adds ~$24,000 to the price. Domains with established backlinks also pass SEO authority to their next owner." },
    { question: "What is this valuation worth?", answer: "It is a transparent scoring heuristic, not an appraisal. Real sales depend on buyer demand, comparable transactions, and negotiation. For serious valuation, check recent sales at NameBio and marketplaces, and consider a professional appraisal for high-value names." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Domain Name Valuation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Domain Name Valuation Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Domain Name</label>
                <div className={inp}><input type="text" value={name} onChange={e => setName(e.target.value)} className={ci} placeholder="financehub" /></div>
              </div>
              <div>
                <label className={lbl}>TLD</label>
                <select value={tld} onChange={e => setTld(e.target.value)} className={sel}>
                  {Object.keys(TLD_BASE).filter(t => t !== "other").map(t => <option key={t} value={t}>.{t}</option>)}
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>Monthly Visitors</label>
              <div className={inp}><input type="number" value={visitors} onChange={e => setVisitors(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">/mo</span></div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Name Quality</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Keyword Value</label>
                      <select value={keyword} onChange={e => setKeyword(e.target.value as Keyword)} className={sel}>
                        <option value="none">None / Brandable</option>
                        <option value="moderate">Moderate (semi-generic)</option>
                        <option value="high">High (generic keyword)</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Domain Age</label>
                      <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Market Value</div>
                <div className="text-4xl font-extrabold tracking-tight">${result.estimatedValue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.name}.{result.tld} · {result.length} chars · {result.visitors}/mo traffic</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["TLD", `.${result.tld}`], ["Length", `${result.length} chars`], ["Traffic", `${result.visitors}/mo`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Valuation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 7 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 7 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Value Components</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v / 1000}K`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Domains Are Valued</h2>
            <p>Domain value = (TLD base × length multiplier × keyword multiplier) + traffic component, all scaled by age. This <strong>domain name valuation calculator</strong> makes the model transparent: short generic names in .com with real traffic and history are worth the most; long obscure names in niche TLDs are worth the least.</p>
            <h2 className="text-2xl font-bold mb-3">The Drivers</h2>
            <p>Length: 5 characters or fewer commands up to 3× a longer name. Keywords: generic, money-adjacent words (insurance, loans, crypto) multiply value. Traffic: 1,000 visitors/month ≈ $1,200/year of parking revenue ≈ $24,000 of value at a 20× multiple. Age: 5+ years with backlinks adds authority.</p>
            <h2 className="text-2xl font-bold mb-3">Selling Your Domain</h2>
            <p>List on Afternic, Sedo, and Dan with a realistic asking price around 2–5× your target (negotiation headroom). Brokerage takes 10–15%. If a buyer's offer beats 80% of your ask, take it — domain markets are thin and the next buyer may be years away.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/domain-name-valuation-calculator" />
          <PopularCalculators exclude="/calculator/domain-name-valuation-calculator" />
        </div>
      </div>
    </>
  );
}
