"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, FileText, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DocResults {
  cooFee: number;
  invoiceFee: number;
  legalizationFee: number;
  licenseFee: number;
  shipmentsPerYear: number;
  shipmentValue: number;
  
  totalDocCost: number;
  annualCost: number;
  percentOfValue: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateDocs = (
  cooFee: number, invoiceFee: number, 
  legalizationFee: number, licenseFee: number, 
  shipmentsPerYear: number, shipmentValue: number
): DocResults => {
  
  const totalDocCost = cooFee + invoiceFee + legalizationFee + licenseFee;
  const annualCost = totalDocCost * shipmentsPerYear;
  
  const percentOfValue = shipmentValue > 0 ? (totalDocCost / shipmentValue) * 100 : 0;

  const chartData = [
    { name: "Certificate of Origin", value: cooFee, color: "hsl(var(--blue-500))" },
    { name: "Forwarder / Invoice Prep", value: invoiceFee, color: "hsl(var(--amber-500))" },
    { name: "Consular Legalization", value: legalizationFee, color: "hsl(var(--emerald-500))" },
    { name: "Export Licenses", value: licenseFee, color: "hsl(var(--destructive))" },
  ];

  const summaryStats = [
    { label: "Cost Per Shipment", value: `$${totalDocCost.toFixed(2)}` },
    { label: "Annual Documentation Expense", value: `$${annualCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Cost vs Cargo Value", value: `${percentOfValue.toFixed(2)}%` },
    { label: "Total Shipments", value: shipmentsPerYear.toLocaleString() },
  ];

  const breakdown = [
    { label: "Certificate of Origin (Chamber of Commerce)", amount: `$${cooFee.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-600" },
    { label: "Forwarder Doc Prep / Commercial Invoice", amount: `$${invoiceFee.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Consular Legalization / Attestation", amount: `$${legalizationFee.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-emerald-600" },
    { label: "Export Licenses / Permits", amount: `$${licenseFee.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Total Documentation Cost Per Shipment", amount: `$${totalDocCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
    { label: `Margin Impact (Percent of Goods Value)`, amount: `${percentOfValue.toFixed(2)}%`, isTotal: true, colorClass: "text-primary font-bold text-[15px]" },
  ];

  return { cooFee, invoiceFee, legalizationFee, licenseFee, shipmentsPerYear, shipmentValue, totalDocCost, annualCost, percentOfValue, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  cooFee: "75",
  invoiceFee: "125",
  legalizationFee: "350",
  licenseFee: "0",
  shipmentsPerYear: "24",
  shipmentValue: "45000",
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none">{suffix}</span>}
    </div>
  </div>
);

export default function ExportDocumentationCostCalculator() {
  const [cooFee, setCooFee] = useState(DEFAULTS.cooFee);
  const [invoiceFee, setInvoiceFee] = useState(DEFAULTS.invoiceFee);
  const [legalizationFee, setLegalizationFee] = useState(DEFAULTS.legalizationFee);
  const [licenseFee, setLicenseFee] = useState(DEFAULTS.licenseFee);
  const [shipmentsPerYear, setShipmentsPerYear] = useState(DEFAULTS.shipmentsPerYear);
  const [shipmentValue, setShipmentValue] = useState(DEFAULTS.shipmentValue);
  
  const [results, setResults] = useState<DocResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateDocs(
      parseFloat(cooFee) || 0, parseFloat(invoiceFee) || 0,
      parseFloat(legalizationFee) || 0, parseFloat(licenseFee) || 0,
      parseFloat(shipmentsPerYear) || 0, parseFloat(shipmentValue) || 0
    ));
  };

  const handleReset = () => {
    setCooFee(DEFAULTS.cooFee); setInvoiceFee(DEFAULTS.invoiceFee);
    setLegalizationFee(DEFAULTS.legalizationFee); setLicenseFee(DEFAULTS.licenseFee);
    setShipmentsPerYear(DEFAULTS.shipmentsPerYear); setShipmentValue(DEFAULTS.shipmentValue);
    setResults(calculateDocs(75, 125, 350, 0, 24, 45000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Export Doc Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.name}:</span>
          <span className="text-foreground">${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Export Documentation Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Export Documentation Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Export Fees per Shipment</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="coo" label="Certificate of Origin" value={cooFee} onChange={setCooFee} prefix="$" tooltip="Chamber of Commerce fee to verify where goods were manufactured." />
              <CompactInput id="inv" label="Forwarder Doc Prep" value={invoiceFee} onChange={setInvoiceFee} prefix="$" tooltip="Freight forwarder fee for creating Commercial Invoices & Packing Lists." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="leg" label="Consular Legalization" value={legalizationFee} onChange={setLegalizationFee} prefix="$" tooltip="Embassy attestation fees (very common for Middle East exports)." />
              <CompactInput id="lic" label="Export Licenses" value={licenseFee} onChange={setLicenseFee} prefix="$" tooltip="Cost of permits for restricted goods (ITAR, Dual-Use Tech)." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-emerald-500" />
              <h2 className="text-2xl font-bold mb-3">Scale & Margin Impact</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="shp" label="Shipments per Year" value={shipmentsPerYear} onChange={setShipmentsPerYear} tooltip="How many international export shipments do you send annually?" />
              <CompactInput id="val" label="Avg Shipment Value" value={shipmentValue} onChange={setShipmentValue} prefix="$" tooltip="Average commercial invoice total." />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>For low-value shipments (like a $500 sample), fixed export documentation fees can completely wipe out your profit margin. Always calculate docs as a % of COGS.</p>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Cost Per Shipment
                  </div>
                  <div className="text-4xl font-bold tracking-tighter mb-2 text-primary">
                    ${results.totalDocCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Bureaucracy and paperwork adds <span className="font-bold text-foreground">{results.percentOfValue.toFixed(2)}%</span> to your cost of goods sold.
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {results.summaryStats.map((stat, i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-sm:border-l-0 max-sm:border-t" : ""} ${i === 3 ? "max-sm:border-t" : ""}`}>
                      <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{stat.label}</div>
                      <div className="text-sm font-bold truncate">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Document Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Fee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Bureaucracy Cost Mix</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={results.chartData.filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {results.chartData.filter(d => d.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Hidden Costs of International Trade</h2>
            <p>New exporters often focus purely on the cost of the Ocean Freight (moving the physical box from Point A to Point B). They are routinely shocked when their Freight Forwarder hands them a $600 bill just for "Documentation Fees."</p>
            <p>Moving goods across international borders requires a mountain of legal paperwork, and none of it is free.</p>
            
            <h3>Common Export Documents</h3>
            <ul>
              <li><strong>Certificate of Origin (COO):</strong> Many countries require absolute proof of where a product was made to apply the correct tariffs. This usually requires a stamp from a local Chamber of Commerce.</li>
              <li><strong>Consular Legalization:</strong> Some countries (especially in the Middle East and Latin America) require the export documents to be physically taken to their local embassy and stamped/legalized before the goods can ship. This is highly expensive.</li>
              <li><strong>Forwarder Doc Prep:</strong> Freight forwarders charge a standard "Doc Fee" to generate the Bill of Lading, Commercial Invoice, and file the Electronic Export Information (EEI) with the government.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Margin Trap on Small Orders</h2>
            <p>Because documentation fees are usually <strong>fixed flat rates</strong> per shipment, they are incredibly dangerous for small orders. If your documentation costs $550, and you are shipping a full $100,000 container of goods, the docs only add a negligible 0.5% to your cost. <strong>You remain profitable.</strong></p>
            <p>If a foreign customer asks for a $2,000 "test order," that same $550 documentation fee adds a catastrophic 27.5% markup to your goods. You will likely lose money on the test order unless you explicitly charge the customer a "Documentation Surcharge."</p>
          </section>
          <FAQSection faqs={[
            { question: "What is an EEI?", answer: "Electronic Export Information. In the US, if any single commodity line item in your shipment is valued over $2,500, you are legally required to file an EEI via the AES (Automated Export System) for Census tracking." },
            { question: "Can I avoid Consular Legalization?", answer: "Usually not. If the destination country's customs law requires it, the goods will simply be impounded at the destination port if they arrive without the embassy stamps." },
            { question: "Should I charge the customer for these fees?", answer: "Yes. Under Incoterms like EXW or FCA, the buyer is technically responsible for export clearance costs, though it is usually easier for the seller to pay them and add them as a line item on the Commercial Invoice." },
          ]} pageUrl="https://racira.com/calculator/export-documentation-cost-calculator" />
          <PopularCalculators exclude="/calculator/export-documentation-cost-calculator" />
        </div>
      </div>
    </>
  );
}
