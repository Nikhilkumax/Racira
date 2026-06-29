"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const TAX_BRACKETS = [
  { rate: 10, label: "10%" },
  { rate: 12, label: "12%" },
  { rate: 22, label: "22%" },
  { rate: 24, label: "24%" },
  { rate: 32, label: "32%" },
  { rate: 35, label: "35%" },
  { rate: 37, label: "37%" },
];

const TaxEquivalentYieldCalculator = () => {
  const DEFAULTS = { muniYield: "4.00", federalRate: "24", stateRate: "5", exemptFromState: false };
  const [muniYield, setMuniYield] = useState(DEFAULTS.muniYield);
  const [federalRate, setFederalRate] = useState(DEFAULTS.federalRate);
  const [stateRate, setStateRate] = useState(DEFAULTS.stateRate);
  const [exemptFromState, setExemptFromState] = useState(DEFAULTS.exemptFromState);
  const [result, setResult] = useState<any>(null);

  const calculate = (my = muniYield, fr = federalRate, sr = stateRate, efs = exemptFromState) => {
    const MY = parseFloat(my) || 0;
    const FR = parseFloat(fr) || 0;
    const SR = parseFloat(sr) || 0;
    if (!MY || MY <= 0) return;
    const combinedRate = (FR + (efs ? 0 : SR)) / 100;
    if (combinedRate >= 1) return;
    const tey = MY / (1 - combinedRate);
    const advantage = tey - MY;
    const bracketData = TAX_BRACKETS.map((b) => {
      const cRate = (b.rate + (efs ? 0 : SR)) / 100;
      const teyBracket = cRate < 1 ? MY / (1 - cRate) : 0;
      return { bracket: b.label, "Tax-Free Yield": MY, "Tax Equivalent Yield": parseFloat(teyBracket.toFixed(4)) };
    });
    setResult({ MY, FR, SR, tey, advantage, combinedRate, bracketData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setMuniYield(DEFAULTS.muniYield); setFederalRate(DEFAULTS.federalRate);
    setStateRate(DEFAULTS.stateRate); setExemptFromState(DEFAULTS.exemptFromState);
    calculate(DEFAULTS.muniYield, DEFAULTS.federalRate, DEFAULTS.stateRate, DEFAULTS.exemptFromState);
  };

  const faqs = [
    { question: "What is tax equivalent yield?", answer: "Tax equivalent yield (TEY) is the pre-tax yield a taxable bond must offer to match the after-tax return of a tax-exempt municipal bond. It allows investors to make apples-to-apples comparisons between taxable and tax-free bonds on an after-tax basis." },
    { question: "What is the tax equivalent yield formula?", answer: "TEY = Municipal Bond Yield / (1 − Combined Marginal Tax Rate). The combined tax rate includes federal and applicable state income tax rates. For a 4% muni yield at a 29% combined rate: TEY = 4% / (1 − 0.29) = 5.63%." },
    { question: "Are all municipal bonds tax-exempt?", answer: "Most municipal bonds are exempt from federal income tax. Many are also exempt from state income taxes for residents of the issuing state. However, some municipal bonds (like private activity bonds) may be subject to the Alternative Minimum Tax (AMT). Always verify the specific bond's tax treatment." },
    { question: "How do I use this calculator to choose between bonds?", answer: "Compare the TEY result to the yield offered by comparable taxable bonds (same credit quality and maturity). If the taxable bond offers more than the TEY, it is better on an after-tax basis. If it offers less, the tax-free municipal bond is superior for your tax bracket." },
    { question: "Who benefits most from municipal bonds?", answer: "High-income investors in the highest tax brackets (32%, 35%, 37%) benefit most from municipal bonds because their tax savings are largest. At lower brackets (10%, 12%, 22%), the TEY advantage is minimal and taxable bonds often offer better after-tax returns." },
    { question: "Does state tax exemption increase the TEY advantage?", answer: "Yes. When a municipal bond is also exempt from your state income tax, the combined tax rate is lower, which increases the TEY. Investors in high-tax states like California (13.3% top rate) or New York (10.9%) gain significant additional benefit from state tax exemption." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Tax Equivalent Yield Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tax Equivalent Yield Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Municipal (Tax-Free) Bond Yield</label>
              <div className="relative">
                <input type="number" value={muniYield} onChange={(e) => setMuniYield(e.target.value)} className="h-10 w-full pl-3 pr-7 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="4.00" step="0.01" min="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Marginal Federal Tax Rate</label>
              <div className="relative">
                <input type="number" value={federalRate} onChange={(e) => setFederalRate(e.target.value)} className="h-10 w-full pl-3 pr-7 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="24" step="1" min="0" max="50" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">State Income Tax Rate</label>
              <div className="relative">
                <input type="number" value={stateRate} onChange={(e) => setStateRate(e.target.value)} className="h-10 w-full pl-3 pr-7 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="5" step="0.1" min="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={exemptFromState} onChange={(e) => setExemptFromState(e.target.checked)} className="rounded" />
              Bond is exempt from state tax (in-state issuer)
            </label>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Tax Equivalent Yield</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.tey, 2)}%</div>
                <div className="text-sm text-muted-foreground mt-1">
                  A taxable bond must yield <span className="font-semibold text-foreground">{fmt(result.tey, 2)}%</span> to match your {fmt(result.MY, 2)}% muni bond after taxes.
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Yield Comparison Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Municipal Bond Yield (Tax-Free)", value: `${fmt(result.MY)}%` },
                    { label: "Federal Tax Rate", value: `${fmt(result.FR)}%` },
                    { label: "State Tax Rate", value: exemptFromState ? "0% (State Exempt)" : `${fmt(result.SR)}%` },
                    { label: "Combined Marginal Tax Rate", value: `${fmt(result.combinedRate * 100)}%` },
                    { label: "Tax Equivalent Yield", value: `${fmt(result.tey, 2)}%` },
                    { label: "TEY Advantage vs Muni Yield", value: `+${fmt(result.advantage, 2)}%` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">TEY Across All Federal Tax Brackets</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.bracketData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} domain={[0, "auto"]} />
                    <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)}%`} />
                    <ReferenceLine y={result.MY} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: `Muni ${result.MY}%`, position: "insideTopLeft", fontSize: 10 }} />
                    <Bar dataKey="Tax Equivalent Yield" fill="#3b82f6" radius={[3, 3, 0, 0]}>
                      {result.bracketData.map((_: any, index: number) => {
                        const isCurrent = TAX_BRACKETS[index].rate === result.FR;
                        return <Cell key={`cell-${index}`} fill={isCurrent ? "#10b981" : "#3b82f6"} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">Green bar = your current tax bracket. Dashed line = muni bond yield.</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Muni Bond Yield (Tax-Free)", value: `${fmt(result.MY)}%` },
                    { label: "Combined Marginal Tax Rate", value: `${fmt(result.combinedRate * 100)}%` },
                    { label: "Tax Equivalent Yield", value: `${fmt(result.tey, 2)}%` },
                    { label: "TEY Advantage", value: `+${fmt(result.advantage, 2)}%`, border: true, bold: true },
                  ].map((s: any, i) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.bold ? "font-bold text-primary" : "font-medium"}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Tax Equivalent Yield Calculator?</h2>
            <p>A tax equivalent yield (TEY) calculator converts the yield of a tax-exempt municipal bond into the equivalent pre-tax yield that a taxable bond would need to offer to match it on an after-tax basis. This comparison is essential for fixed-income investors choosing between corporate bonds, Treasury bonds, and tax-free municipal bonds. Pre-filled with a 4.00% muni yield, 24% federal rate, and 5% state rate, the TEY is 5.63% — meaning you would need a taxable bond yielding at least 5.63% to beat the muni bond after taxes.</p>
            <h2>The Tax Equivalent Yield Formula</h2>
            <p><strong>TEY = Municipal Bond Yield / (1 − Combined Marginal Tax Rate)</strong></p>
            <p>The combined marginal tax rate includes both federal and applicable state income taxes. For defaults: TEY = 4.00% / (1 − 0.29) = 4.00% / 0.71 = 5.63%. The bar chart compares TEY across all seven federal income tax brackets so you can see how the advantage changes with your tax situation.</p>
            <h2>When Does the Muni Bond Win?</h2>
            <p>The municipal bond wins when taxable alternatives yield less than the TEY. If you're in the 32% federal bracket with 5% state taxes and a 4% muni bond, your TEY = 4% / (1 − 0.37) = 6.35%. Any taxable bond yielding less than 6.35% is inferior on an after-tax basis for you. High-income investors in the 37% bracket benefit most dramatically from municipal bonds.</p>
            <h2>State Tax Exemption Bonus</h2>
            <p>Many states exempt municipal bonds issued within their borders from state income tax. For investors in high-tax states like California (13.3%), New York (10.9%), or New Jersey (10.75%), this can add enormous value. A California investor in the 37% federal bracket with 13.3% state tax on a 4% muni bond: TEY = 4% / (1 − 0.503) = 8.05% — remarkable advantage over taxable bonds.</p>
            <h2>AMT Considerations</h2>
            <p>Some municipal bonds — particularly private activity bonds (PABs) used to fund airports, toll roads, and private hospitals — may be subject to the federal Alternative Minimum Tax (AMT). These bonds typically offer higher yields to compensate. Always verify a muni bond's AMT status before assuming full tax exemption.</p>
            <h2>Municipal Bonds vs Treasury Bonds</h2>
            <p>Treasury bonds are exempt from state income taxes but taxable at the federal level. For investors in low-tax states, Treasuries may be more advantageous than municipal bonds. For high-state-tax investors, double tax-exempt (DTE) municipal bonds — exempt from both federal and state taxes — frequently outperform Treasuries on an after-tax basis despite their lower stated yields.</p>
            <h2>Credit Quality and Duration Risk</h2>
            <p>After confirming that a muni bond beats the TEY threshold, compare credit quality and duration risk. Municipal bonds range from AAA-rated state general obligation bonds to below-investment-grade revenue bonds. Higher yields often come with higher default risk. The muni bond default rate has historically been very low (well under 0.1% for investment-grade munis), but credit analysis remains essential.</p>
            <h2>Practical Examples</h2>
            <p><strong>Conservative retiree (22% bracket, 5% state):</strong> TEY on 4% muni = 4% / 0.73 = 5.48%. At this bracket, competitive taxable bonds may beat the muni. <strong>High-income professional (37% bracket, 9.3% CA):</strong> TEY on 4% muni = 4% / (1 − 0.463) = 7.45%. Municipal bonds are clearly superior. The TEY analysis should always be the first step in fixed-income portfolio construction for high-income investors.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tax-equivalent-yield-calculator" />
          <PopularCalculators exclude="/calculator/tax-equivalent-yield-calculator" />
        </div>
      </div>
    </>
  );
};

export default TaxEquivalentYieldCalculator;
