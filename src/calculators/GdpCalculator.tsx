"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Globe } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUSD = (n: number, d = 0) => `$${fmt(n, d)}`;
const fmtT = (n: number) => n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T` : n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : fmtUSD(n);

const Inp = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface GDPResult {
  gdp: number;
  gdpPerCapita: number;
  gdpGrowthAmount: number;
  realGdp: number;
  gdpDeflator: number;
  componentsData: { name: string; value: number; pct: number }[];
  growthData: { year: number; gdp: number; realGdp: number }[];
}

export default function GdpCalculator() {
  const [mode, setMode] = useState<"expenditure" | "income" | "output">("expenditure");
  // Expenditure approach
  const [consumption, setConsumption] = useState("14200");
  const [investment, setInvestment] = useState("3800");
  const [govSpending, setGovSpending] = useState("4600");
  const [exports, setExports] = useState("3100");
  const [imports, setImports] = useState("3300");
  // Additional
  const [population, setPopulation] = useState("335");
  const [inflationRate, setInflationRate] = useState("3.2");
  const [years, setYears] = useState("5");
  const [growthRate, setGrowthRate] = useState("2.5");
  const [res, setRes] = useState<GDPResult | null>(null);

  useEffect(() => { calculate(); }, []);

  const calculate = () => {
    const C = parseFloat(consumption) || 14200;
    const I = parseFloat(investment) || 3800;
    const G = parseFloat(govSpending) || 4600;
    const X = parseFloat(exports) || 3100;
    const M = parseFloat(imports) || 3300;
    const pop = parseFloat(population) || 335;
    const infl = parseFloat(inflationRate) / 100 || 0.032;
    const yrs = parseInt(years) || 5;
    const gr = parseFloat(growthRate) / 100 || 0.025;

    const gdp = C + I + G + (X - M); // billions for US demo
    const gdpPerCapita = (gdp * 1e9) / (pop * 1e6);
    const netExports = X - M;
    const gdpDeflator = 100 * (1 + infl);
    const realGdp = gdp / (gdpDeflator / 100);
    const gdpGrowthAmount = gdp * gr;

    const total = C + I + G + Math.abs(netExports);
    const componentsData = [
      { name: "Consumption (C)", value: C, pct: (C / total) * 100 },
      { name: "Investment (I)", value: I, pct: (I / total) * 100 },
      { name: "Gov. Spending (G)", value: G, pct: (G / total) * 100 },
      { name: "Net Exports (X-M)", value: netExports, pct: (netExports / gdp) * 100 },
    ];

    const growthData = Array.from({ length: yrs + 1 }, (_, i) => ({
      year: new Date().getFullYear() + i,
      gdp: parseFloat((gdp * Math.pow(1 + gr, i)).toFixed(1)),
      realGdp: parseFloat((realGdp * Math.pow(1 + gr - infl, i)).toFixed(1)),
    }));

    setRes({ gdp: gdp * 1e9, gdpPerCapita, gdpGrowthAmount: gdpGrowthAmount * 1e9, realGdp: realGdp * 1e9, gdpDeflator, componentsData, growthData });
  };

  const faqs = [
    { question: "What is GDP?", answer: "GDP (Gross Domestic Product) is the total monetary value of all final goods and services produced within a country's borders during a specific time period, usually a quarter or year. It's the world's most widely used measure of economic size and growth. GDP includes output from all industries: manufacturing, services, agriculture, construction, and government. It does not count intermediate goods (to avoid double-counting) or output produced abroad by domestic citizens (that's GNP)." },
    { question: "What are the three ways to calculate GDP?", answer: "1) Expenditure approach: GDP = C + I + G + (X-M) — sums all spending on final goods: consumer spending, business investment, government spending, and net exports. 2) Income approach: GDP = wages + rents + interest + profits — sums all income earned in producing goods. 3) Output/Production approach: sums the value added at each stage of production across all industries. All three methods yield the same result by definition." },
    { question: "What is the difference between real and nominal GDP?", answer: "Nominal GDP is measured in current prices and can increase simply due to inflation without any real growth in output. Real GDP is adjusted for inflation using a price deflator (or CPI), showing true growth in economic output. For comparing growth across years or countries, always use real GDP. A country reporting 7% nominal GDP growth with 6% inflation is only growing 1% in real terms." },
    { question: "What is GDP per capita?", answer: "GDP per capita divides total GDP by population, giving an average economic output per person. It's used to compare living standards across countries. The US GDP per capita is approximately $80,000+ (one of the world's highest). Luxembourg tops the list at ~$140,000. Poor nations may have per capita GDP below $1,000. Note that GDP per capita doesn't measure income distribution — a country with high GDP per capita can still have extreme inequality." },
    { question: "What are the limitations of GDP as an economic measure?", answer: "GDP has well-documented limitations: It doesn't measure inequality, environmental degradation, non-market work (childcare, volunteering), happiness, or sustainability. It treats all spending equally — spending on healthcare for preventable illness counts the same as spending on education. GDP growth from disasters (rebuilding) or environmental cleanup counts as positive. Alternative measures like Human Development Index (HDI), Genuine Progress Indicator (GPI), or Gross National Happiness supplement GDP for a fuller picture of wellbeing." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "GDP Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">GDP Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">GDP Inputs (Expenditure Approach)</h2>
            <p className="text-sm text-muted-foreground">Enter components in billions USD. Default values approximate the US economy.</p>
            <div className="flex flex-col gap-4">
              <Inp id="C" label="Consumer Spending (C)" value={consumption} onChange={setConsumption} suffix="B" />
              <Inp id="I" label="Business Investment (I)" value={investment} onChange={setInvestment} suffix="B" />
              <Inp id="G" label="Government Spending (G)" value={govSpending} onChange={setGovSpending} suffix="B" />
              <div className="grid grid-cols-2 gap-3">
                <Inp id="X" label="Exports (X)" value={exports} onChange={setExports} suffix="B" />
                <Inp id="M" label="Imports (M)" value={imports} onChange={setImports} suffix="B" />
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Adjustments</p>
                <div className="grid grid-cols-2 gap-3">
                  <Inp id="pop" label="Population (millions)" value={population} onChange={setPopulation} />
                  <Inp id="infl" label="Inflation Rate" value={inflationRate} onChange={setInflationRate} suffix="%" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Inp id="gr" label="GDP Growth Rate" value={growthRate} onChange={setGrowthRate} suffix="%" />
                  <Inp id="yrs" label="Projection Years" value={years} onChange={setYears} suffix="yrs" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={() => { setConsumption("14200"); setInvestment("3800"); setGovSpending("4600"); setExports("3100"); setImports("3300"); setPopulation("335"); setInflationRate("3.2"); setGrowthRate("2.5"); setYears("5"); setTimeout(calculate, 0); }} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">GDP Results</h2>
                  <Globe className="h-5 w-5 text-primary" />
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Nominal GDP</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtT(res.gdp)}</div>
                  <div className="text-sm text-muted-foreground font-medium">Real GDP: {fmtT(res.realGdp)} | Per Capita: {fmtUSD(res.gdpPerCapita)}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Component</th><th className="p-2.5 text-right">Value</th><th className="p-2.5 pr-3 text-right">Share</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50 text-base">
                      {res.componentsData.map(row => (
                        <tr key={row.name} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-medium text-foreground">{row.name}</td>
                          <td className="p-2.5 text-right font-semibold text-foreground">{fmtT(row.value * 1e9)}</td>
                          <td className="p-2.5 pr-3 text-right text-muted-foreground">{fmt(row.pct, 1)}%</td>
                        </tr>
                      ))}
                      <tr className="bg-primary/5 font-bold">
                        <td className="p-2.5 pl-3 text-foreground">Total GDP (C+I+G+NX)</td>
                        <td className="p-2.5 text-right text-foreground">{fmtT(res.gdp)}</td>
                        <td className="p-2.5 pr-3 text-right text-muted-foreground">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">GDP Growth Projection</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={res.growthData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}B`} />
                      <Tooltip formatter={(v: any, n: string) => [`$${v}B`, n === "gdp" ? "Nominal GDP" : "Real GDP"]} />
                      <Legend />
                      <Line type="monotone" dataKey="gdp" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Nominal GDP" />
                      <Line type="monotone" dataKey="realGdp" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Real GDP" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  {[
                    { label: "Nominal GDP", value: fmtT(res.gdp) },
                    { label: "Real GDP", value: fmtT(res.realGdp) },
                    { label: "GDP/Capita", value: fmtUSD(res.gdpPerCapita) },
                    { label: "Net Exports", value: fmtT((parseFloat(exports) - parseFloat(imports)) * 1e9) },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding GDP: The Expenditure Approach</h2>
            <p>The Gross Domestic Product (GDP) formula using the expenditure approach is: <strong>GDP = C + I + G + (X − M)</strong>. This is the most commonly used method for calculating GDP. Consumer spending (C) typically represents 65-70% of GDP in developed economies. Business investment (I) covers capital expenditure on equipment, structures, and inventories. Government spending (G) includes federal, state, and local expenditures on goods and services (but not transfer payments like Social Security). Net exports (X−M) is exports minus imports; a trade deficit produces a negative value that reduces GDP.</p>
            <p>The US GDP is approximately $28-29 trillion annually (2024), making it the world's largest economy. China is second at approximately $18 trillion, followed by Germany, Japan, and India. The EU as a bloc exceeds $18 trillion combined. GDP growth of 2-3% annually is considered healthy for a developed economy; emerging markets often target 5-7%.</p>

            <h2>Nominal vs Real GDP</h2>
            <p>Nominal GDP measures economic output using current prices. This means it can rise simply due to inflation without any real increase in goods and services produced. Real GDP adjusts for inflation using a price index (the GDP deflator), giving a true measure of economic output growth. When economists discuss economic growth, they always mean real GDP growth — the US, for example, may show nominal GDP growth of 5-6% but real GDP growth of only 2-3% after accounting for 3%+ inflation.</p>

            <h2>GDP Per Capita as a Welfare Measure</h2>
            <p>GDP per capita divides total GDP by population and provides a rough proxy for average living standards. The US GDP per capita of approximately $80,000+ ranks among the world's highest. However, GDP per capita says nothing about income distribution — a country could have high average GDP per capita while having extreme inequality where most wealth is concentrated in a small elite. Countries like Norway, Luxembourg, and Singapore consistently top GDP per capita rankings, reflecting high productivity, strong institutions, and skilled workforces.</p>

            <h2>GDP Growth Drivers</h2>
            <p>GDP growth is driven by four main factors: (1) Labor force growth — more workers produce more output; (2) Capital investment — more equipment and technology raises productivity; (3) Technological progress — innovation allows more output per input; (4) Education and human capital — a more skilled workforce is more productive. Long-run sustainable GDP growth in developed economies averages 2-3% annually. Recessions (two consecutive quarters of negative GDP growth) occur periodically due to demand shocks, supply disruptions, financial crises, or policy errors.</p>

            <h2>GDP Limitations and Alternative Measures</h2>
            <p>GDP was never designed to be a measure of human welfare — it's a measure of economic activity. Environmental economists note that GDP treats environmental destruction as positive (cleanup costs add to GDP). Social economists observe that unpaid work (childcare, eldercare, volunteering) is excluded. Inequality economists note that GDP growth can leave most citizens worse off if gains accrue entirely to the wealthy. Alternative measures like the Human Development Index (HDI), which combines GDP per capita with health and education metrics, and the Genuine Progress Indicator (GPI), which adjusts for inequality and environmental costs, provide complementary perspectives on national wellbeing.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gdp-calculator" />
          <PopularCalculators exclude="/calculator/gdp-calculator" />
        </div>
      </div>
    </>
  );
}
