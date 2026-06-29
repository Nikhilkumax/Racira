"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface RegistrationFeeResults {
  totalRegistrationFee: number;
  adValoremTax: number;
  baseAndPlateFees: number;
  localTaxes: number;
  latePenalty: number;
  breakdown: {
    baseFee: number;
    plateFee: number;
    titleFee: number;
    adValorem: number;
    localTax: number;
    lateFee: number;
  };
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateRegistrationFee = (inputs: typeof DEFAULTS): RegistrationFeeResults => {
  const vehicleValue = parseFloat(inputs.vehicleValue) || 0;
  const baseFee = parseFloat(inputs.baseFee) || 0;
  const adValoremRate = parseFloat(inputs.adValoremRate) / 100 || 0;
  const plateFee = parseFloat(inputs.plateFee) || 0;
  const titleFee = parseFloat(inputs.titleFee) || 0;
  
  // Advanced
  const localTax = parseFloat(inputs.localTax) || 0;
  const lateFee = parseFloat(inputs.lateFee) || 0;

  if (vehicleValue < 0 || baseFee < 0) {
    return {
      totalRegistrationFee: 0, adValoremTax: 0, baseAndPlateFees: 0, localTaxes: 0, latePenalty: 0,
      breakdown: { baseFee: 0, plateFee: 0, titleFee: 0, adValorem: 0, localTax: 0, lateFee: 0 },
      isError: true, errorMsg: "Vehicle value and base fees cannot be negative."
    };
  }

  // Value-based tax
  const adValorem = vehicleValue * adValoremRate;

  // Summaries
  const baseAndPlateFees = baseFee + plateFee + titleFee;
  const totalRegistrationFee = baseAndPlateFees + adValorem + localTax + lateFee;

  return {
    totalRegistrationFee,
    adValoremTax: adValorem,
    baseAndPlateFees,
    localTaxes: localTax,
    latePenalty: lateFee,
    breakdown: {
      baseFee,
      plateFee,
      titleFee,
      adValorem,
      localTax,
      lateFee
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  vehicleValue: "25000",
  baseFee: "50",
  adValoremRate: "1.5",
  plateFee: "25",
  titleFee: "15",
  // Advanced
  localTax: "0",
  lateFee: "0"
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, tooltip, type = "number", options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function CarRegistrationFeeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<RegistrationFeeResults>(calculateRegistrationFee(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateRegistrationFee(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateRegistrationFee(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

  const pieData = results.isError ? [] : [
    { name: "Base Fee", value: results.breakdown.baseFee, color: "#3b82f6" },
    { name: "Value Tax", value: results.breakdown.adValorem, color: "#10b981" },
    { name: "Plate/Title", value: results.breakdown.plateFee + results.breakdown.titleFee, color: "#f59e0b" },
    { name: "Local Tax", value: results.breakdown.localTax, color: "#8b5cf6" },
    { name: "Late Fee", value: results.breakdown.lateFee, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const faqs = [
    { question: "What is an Ad Valorem tax?", answer: "Ad Valorem is Latin for 'according to value.' Many states charge a vehicle registration fee that is a percentage of your car's current market value. This means a new luxury car will cost vastly more to register than a 15-year-old economy car." },
    { question: "What is the difference between Title and Registration?", answer: "A Title is a legal document proving you own the vehicle. Registration is the fee you pay to legally operate that vehicle on public roads. You usually only pay for a Title once when you buy the car, but Registration is an annual recurring cost." },
    { question: "Why is my registration fee so much higher this year?", answer: "If you just bought a new car, your state's value-based (ad valorem) tax will be calculated on its high purchase price. As the car depreciates in value over the years, this portion of your registration fee should slowly decrease." },
    { question: "Do I have to pay registration fees if I don't drive the car?", answer: "Generally, yes. If the car has a license plate and you intend to ever drive it on public roads, it must be currently registered. If it is sitting broken in a garage, you can sometimes apply for an 'inoperable' or 'planned non-operation' (PNO) status for a much smaller fee." },
    { question: "Are car registration fees tax deductible?", answer: "The IRS allows you to deduct the portion of your registration fee that is strictly based on the value of the car (the ad valorem tax). Flat fees, plate fees, and weight fees are not tax-deductible." },
    { question: "What happens if I pay my registration late?", answer: "Almost all states immediately assess a late penalty if you miss your expiration date. This penalty often compounds the longer you wait. Furthermore, driving with expired registration can result in expensive traffic tickets or even having your car impounded." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Car Registration Fee Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Registration Fee Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Vehicle Value</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-4 text-primary font-bold text-lg">$</span>
                <input type="number" value={inputs.vehicleValue} onChange={e => handleChange("vehicleValue", e.target.value)} className="w-full h-full px-2 text-xl font-bold bg-transparent outline-none border-none text-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Used to calculate ad valorem (value-based) taxes.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="base-fee" label="State Base Fee" value={inputs.baseFee} onChange={(v: string) => handleChange("baseFee", v)} prefix="$" />
              <CompactInput id="ad-valorem" label="Value Tax Rate" value={inputs.adValoremRate} onChange={(v: string) => handleChange("adValoremRate", v)} suffix="%" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="plate-fee" label="License Plate Fee" value={inputs.plateFee} onChange={(v: string) => handleChange("plateFee", v)} prefix="$" />
              <CompactInput id="title-fee" label="Title Transfer Fee" value={inputs.titleFee} onChange={(v: string) => handleChange("titleFee", v)} prefix="$" />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="local-tax" label="Local / County Tax" value={inputs.localTax} onChange={(v: string) => handleChange("localTax", v)} prefix="$" />
                  <CompactInput id="late-fee" label="Late Penalties" value={inputs.lateFee} onChange={(v: string) => handleChange("lateFee", v)} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Registration Due</div>
                  <div className="text-5xl font-bold text-primary mb-1">{formatCurrency(results.totalRegistrationFee)}</div>
                  <div className="text-sm text-muted-foreground">This is the estimated total cost to register, tag, and title your vehicle.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Base & Plates</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.baseAndPlateFees)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Value Tax</div>
                    <div className="text-lg font-bold text-emerald-600">{formatCurrency(results.adValoremTax)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Late Penalties</div>
                    <div className="text-lg font-bold text-red-500">{formatCurrency(results.latePenalty)}</div>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Fee Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">State Base Registration</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.baseFee)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Ad Valorem (Value Tax)</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.adValorem)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">License Plate Fee</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.plateFee)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Title Transfer Fee</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.titleFee)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Local / County Tax</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.localTax)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">Late Fees / Penalties</span>
                      <span className="font-medium text-red-500">{formatCurrency(results.breakdown.lateFee)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Total Amount Due</span>
                      <span className="text-primary">{formatCurrency(results.totalRegistrationFee)}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Cost Distribution</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                          {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Car Registration Fee Calculator?</h2>
            <p>A Car Registration Fee Calculator helps you estimate exactly how much it will cost to legally register and title your vehicle with the Department of Motor Vehicles (DMV). Registration fees are notoriously complex, often combining flat rates with value-based percentages and hidden surcharges. Whether you are buying a new car at a dealership, purchasing a used car from a private seller, or simply renewing your annual tags, this calculator removes the guesswork so you can budget appropriately without facing sticker shock at the DMV counter.</p>

            <h2>How It Works</h2>
            <p>Our algorithm breaks down the common multi-layered structure of US vehicle registration. First, it takes a standard <strong>State Base Fee</strong>. Then, it calculates the <strong>Ad Valorem Tax</strong> by taking the <code>Vehicle Value * Tax Rate</code>. Ad Valorem is Latin for "according to value," meaning more expensive cars pay higher taxes. Next, it adds one-time costs like the <strong>License Plate Fee</strong> and <strong>Title Transfer Fee</strong>. Finally, any input local taxes or late penalties are summed together to provide your total estimated out-the-door registration cost.</p>

            <h2>Understanding Your Results</h2>
            <p>The <strong>Total Registration Due</strong> is the final amount you should expect to pay to get your sticker and legal paperwork. <strong>Base & Plates</strong> represent the fixed administrative costs of maintaining your records and physical license plate. The <strong>Value Tax</strong> is often the largest portion of the bill, directly reflecting the market value of your vehicle. If you miss your renewal date, <strong>Late Penalties</strong> will be added to this total.</p>

            <h2>Key Factors</h2>
            <p>The single largest variable in your registration fee is your <strong>Vehicle Value</strong>. If you live in a state that charges a 2% ad valorem tax, registering a $50,000 luxury SUV will cost you $1,000 in taxes alone, compared to just $200 for a $10,000 used car. <strong>Title Fees</strong> are a factor only when ownership changes hands; if you are simply renewing your annual registration, you can typically set the Title Fee and Plate Fee to zero, drastically lowering your estimate.</p>

            <h2>Advanced Features</h2>
            <p>Under Advanced Options, you can input <strong>Local / County Tax</strong>. Many cities and counties add their own municipal "wheel tax" on top of the state registration fee to fund local road repairs. You can also calculate <strong>Late Penalties</strong>. Most DMVs are unforgiving; missing your expiration date by even a few days can trigger compounding late fees that quickly escalate.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The Annual Renewal.</strong> Sarah is renewing the tags on her 5-year-old car, now valued at $15,000. Her state charges a $40 base fee and a 1% value tax. Because she isn't transferring ownership, her title and plate fees are $0. Her total registration cost is a reasonable $190.</p>
            <p><strong>Example 2: Buying a New Car.</strong> John just bought a brand new $60,000 truck. He has to pay the $50 base fee, $25 for new plates, $15 for the title transfer, and a massive 2% ad valorem tax because the vehicle is so valuable. When he goes to the DMV, his total bill will be a shocking $1,290.</p>

            <h2>Tips & Best Practices</h2>
            <p>If you are buying a car from a private seller, always bring extra cash or a larger check than you expect; DMVs will not negotiate, and you cannot leave with your plates until the exact balance is paid in full. If you are renewing, set a calendar reminder a month in advance to avoid brutal late fees. Finally, remember that your Ad Valorem tax is tax-deductible on your federal income returns, so keep your registration receipt for tax season.</p>

            <h2>Benefits</h2>
            <p>Using a Car Registration Fee Calculator provides peace of mind. It prevents you from walking into the DMV completely blind to the costs. By anticipating the heavy value-based taxes associated with newer vehicles, you can roll these costs into your initial car-buying budget rather than scrambling to drain your savings account just to get license plates.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-registration-fee-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
