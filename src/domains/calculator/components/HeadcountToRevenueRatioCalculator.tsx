"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Users, DollarSign } from "lucide-react";

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 2) => n.toFixed(d);
const fmtM = (n: number) => Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : Math.abs(n) >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;

function calcHeadcountToRevenueRatio(revenue: number, headcount: number) {
  const revenuePerEmployee = headcount > 0 ? revenue / headcount : 0;
  const employeesPerRevenue = revenuePerEmployee > 0 ? headcount / revenue : 0;
  const benchmarks = [
    { sector: "Technology", revenuePerEmployee: 500000 }, // $500k per employee
    { sector: "Finance", revenuePerEmployee: 300000 },
    { sector: "Healthcare", revenuePerEmployee: 200000 },
    { sector: "Manufacturing", revenuePerEmployee: 150000 },
    { sector: "Retail", revenuePerEmployee: 100000 },
    { sector: "Hospitality", revenuePerEmployee: 50000 },
  ];
  const status = revenuePerEmployee >= 400000 ? "High" : revenuePerEmployee >= 200000 ? "Medium" : "Low";
  return { revenuePerEmployee, employeesPerRevenue, benchmarks, status };
}

const TTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2 rounded-lg shadow text-xs">
    <p className="font-bold mb-1">{label}</p>
    <p className="text-primary font-semibold">Revenue per Employee: ${payload[0]?.value?.toFixed(0)}</p>
  </div>
) : null;

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"];

export default function HeadcountToRevenueRatioCalculator() {
  const [revenue, setRevenue] = useState("5000000");
  const [headcount, setHeadcount] = useState("25");
  const [res, setRes] = useState<ReturnType<typeof calcHeadcountToRevenueRatio> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);
  const run = () => setRes(calcHeadcountToRevenueRatio(parseFloat(revenue) || 0, parseFloat(headcount) || 0));
  const reset = () => { setRevenue("5000000"); setHeadcount("25"); setRes(calcHeadcountToRevenueRatio(5000000, 25)); };

  const faqs = [
    {
      question: "What is the Headcount to Revenue Ratio?",
      answer: "The Headcount to Revenue Ratio, also known as Revenue per Employee, measures how much revenue each employee generates on average. It is calculated as Total Revenue divided by Number of Employees. A higher ratio indicates greater productivity and efficiency in utilizing human capital.",
    },
    {
      question: "How do I calculate Revenue per Employee?",
      answer: "Revenue per Employee = Total Annual Revenue / Number of Full-Time Equivalent Employees. For example, a company with $10 million in revenue and 50 employees has a revenue per employee of $200,000.",
    },
    {
      question: "Why is Revenue per Employee important?",
      answer: "This metric helps assess workforce productivity, compare efficiency across companies in the same industry, and track trends over time. It's particularly useful for service-based and knowledge industries where human capital is a primary asset.",
    },
    {
      question: "What is a good Revenue per Employee ratio?",
      answer: "Benchmarks vary significantly by industry. Technology companies often exceed $300,000 per employee, while retail and hospitality may be below $100,000. It's essential to compare against peers in the same sector for meaningful insights.",
    },
    {
      question: "How can a company improve its Revenue per Employee?",
      answer: "Companies can improve this ratio by increasing revenue through better sales and product strategies, improving employee productivity through training and technology, optimizing organizational structure, and leveraging automation to increase output per employee.",
    },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Headcount to Revenue Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Headcount to Revenue Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Company Data</h2>
            <CompactInput id="rev" label="Annual Revenue" value={revenue} onChange={setRevenue} prefix="$" />
            <CompactInput id="hc" label="Number of Employees (Headcount)" value={headcount} onChange={setHeadcount} />
            <div className="p-3 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground">
              Revenue per Employee = Annual Revenue ÷ Number of Employees. Measures average revenue generated per worker.
            </div>
            <div className="flex gap-2.5">
              <button onClick={run} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border hover:bg-secondary h-9 transition-colors flex items-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h2 className="text-2xl font-bold mb-3">Productivity Analysis</h2>
                    <Users className="h-5 w-5 text-primary" />
                  </div>

                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                    <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Revenue per Employee</div>
                    <div className="text-4xl font-extrabold tracking-tight">${fmt(res.revenuePerEmployee, 0)}</div>
                    <div className="text-sm text-muted-foreground mt-1">Status: {res.status} · Employees: {parseInt(headcount)}</div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm border-collapse">
                      <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                        <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                      </tr></thead>
                      <tbody className="divide-y divide-border/50">
                        {[{
                          label: "Annual Revenue",
                          value: fmtM(parseFloat(revenue) || 0),
                        }, {
                          label: "Number of Employees",
                          value: `${parseInt(headcount)}`,
                        }, {
                          label: "Revenue per Employee",
                          value: `$${fmt(res.revenuePerEmployee, 0)}`,
                          bold: true,
                        }, {
                          label: "Employees per $1M Revenue",
                          value: `${fmt((1000000 / res.revenuePerEmployee) || 0, 1)}`,
                        }].map(r => (
                          <tr key={r.label} className={`hover:bg-secondary/20 ${(r as any).bold ? "font-bold bg-secondary/30" : ""}`}>
                            <td className="p-2.5 pl-3 font-semibold">{r.label}</td>
                            <td className="p-2.5 pr-3 text-right">{r.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <h3 className="text-sm font-bold mb-3">Your Ratio vs Industry Benchmarks (Revenue per Employee)</h3>
                    {mounted && (
                      <>
                        <div className="h-[200px]">
                          {/* Simple bar chart using divs instead of recharts for simplicity */}
                          <div className="h-full flex items-end gap-4">
                            {[{
                              sector: "Your Company",
                              value: res.revenuePerEmployee,
                            }, ...res.benchmarks].map((item, index) => (
                   <div key={index} className="flex-1 flex flex-col items-center">
                     <div className={`h-[calc(100%-20px)] w-[20px] bg-${index === 0 ? "primary" : "secondary"}/20`} style={{ height: `${((item as any).value ?? (item as any).revenuePerEmployee) / Math.max(...res.benchmarks.map(b => b.revenuePerEmployee)) * 100}%` }}></div>
                     <span className="text-xs text-muted-foreground mt-2">{item.sector}</span>
                     <span className="text-xs text-primary mt-1">${fmt((item as any).value ?? (item as any).revenuePerEmployee, 0)}</span>
                   </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border">
                    {[
                      { label: "Revenue per Employee", value: `$${fmt(res.revenuePerEmployee, 0)}` },
                      { label: "Status", value: res.status },
                      { label: "Employees", value: `${parseInt(headcount)}` },
                      { label: "Employees per $1M", value: `${fmt((1000000 / res.revenuePerEmployee) || 0, 1)}` },
                    ].map(item => (
                      <div key={item.label} className="flex flex-col">
                        <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                        <span className="text-base font-extrabold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is the Headcount to Revenue Ratio?</h2>
            <p>The Headcount to Revenue Ratio, commonly expressed as Revenue per Employee, measures the average revenue generated by each employee in an organization. It is calculated by dividing a company's total revenue by its number of employees. This metric serves as a key indicator of workforce productivity and operational efficiency, particularly in knowledge-intensive and service-based industries where human capital is a primary asset.</p>
            <p>A higher Revenue per Employee generally indicates greater efficiency in utilizing human resources to generate sales. However, this metric must be interpreted within industry context, as business models vary significantly—labor-intensive industries like hospitality typically show lower ratios than technology or financial services firms.</p>
            <h2 className="text-2xl font-bold mb-3">Why This Metric Matters</h2>
            <p>Revenue per Employee provides valuable insights for multiple stakeholders:</p>
            <ul className="list-disc list-inside my-4">
              <li>Management can track productivity trends over time and identify the impact of process improvements, technology investments, or organizational changes.</li>
              <li>Investors use this metric to compare operational efficiency across companies in the same sector, helping identify potential competitive advantages.</li>
              <li>HR professionals can benchmark against industry peers to evaluate the effectiveness of talent management and workforce planning strategies.</li>
            </ul>
            <p>It's particularly useful when combined with other metrics like profit margin and employee turnover to provide a more complete picture of organizational health.</p>
            <h2 className="text-2xl font-bold mb-3">Industry Benchmarks and Variations</h2>
            <p>Significant variations exist across industries due to differences in business models, capital intensity, and value propositions:</p>
            <ul className="list-disc list-inside my-4">
              <li>Technology and software companies often exceed $300,000-$500,000+ per employee due to high-value, scalable products.</li>
              <li>Financial services typically range from $200,000-$400,000 per employee.</li>
              <li>Manufacturing and industrial companies usually fall between $100,000-$200,000 per employee.</li>
              <li>Retail and hospitality sectors often show lower ratios, frequently below $100,000 per employee, reflecting their labor-intensive nature.</li>
            </ul>
            <p>When analyzing this metric, consider factors such as:</p>
            <ul className="list-disc list-inside my-4">
              <li>Mix of full-time vs. part-time employees</li>
              <li>Levels of automation and technology adoption</li>
              <li>Outsourcing of non-core functions</li>
              <li>Geographic distribution of workforce (cost of living variations)</li>
              <li>Stage of company growth (startups may prioritize growth over immediate productivity)</li>
            </ul>
            <h2 className="text-2xl font-bold mb-3">Improving Revenue per Employee</h2>
            <p>Organizations seeking to improve this ratio can focus on several levers:</p>
            <ul className="list-disc list-inside my-4">
              <li>Increasing revenue through product innovation, market expansion, or pricing optimization</li>
              <li>Enhancing employee productivity via training, performance management, and technology tools</li>
              <li>Optimizing organizational structure to reduce layers of management</li>
              <li>Leveraging automation and artificial intelligence to augment human capabilities</li>
              <li>Focusing on high-value activities and potentially outsourcing low-value tasks</li>
            </ul>
            <p>It's important to balance productivity improvements with employee well-being and sustainable work practices to avoid burnout and turnover.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/headcount-to-revenue-ratio-calculator" />
          <PopularCalculators exclude="/calculator/headcount-to-revenue-ratio-calculator" />
        </div>
      </div>
    </>
  );
}