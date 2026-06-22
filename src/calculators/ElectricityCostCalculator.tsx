"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Zap } from "lucide-react";

interface CostResult {
  dailyKwh: number;
  monthlyKwh: number;
  yearlyKwh: number;
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateCost = (powerStr: string, powerUnit: string, hoursStr: string, costStr: string): CostResult | null => {
  const power = parseFloat(powerStr);
  let hoursPerDay = parseFloat(hoursStr);
  const costPerKwh = parseFloat(costStr);

  if (isNaN(power) || isNaN(hoursPerDay) || isNaN(costPerKwh) || power < 0 || hoursPerDay < 0 || costPerKwh < 0) {
    return null;
  }

  if (hoursPerDay > 24) hoursPerDay = 24;

  let watts = power;
  if (powerUnit === "kw") watts = power * 1000;

  const dailyKwh = (watts * hoursPerDay) / 1000;
  const monthlyKwh = dailyKwh * 30; // standard 30 day avg month
  const yearlyKwh = dailyKwh * 365;

  const dailyCost = dailyKwh * costPerKwh;
  const monthlyCost = monthlyKwh * costPerKwh;
  const yearlyCost = yearlyKwh * costPerKwh;

  return {
    dailyKwh,
    monthlyKwh,
    yearlyKwh,
    dailyCost,
    monthlyCost,
    yearlyCost,
    isError: false
  };
};

const ElectricityCostCalculator = () => {
  const [power, setPower] = useState("1500");
  const [powerUnit, setPowerUnit] = useState("watts");
  const [hours, setHours] = useState("4");
  const [costRate, setCostRate] = useState("0.15");

  const [result, setResult] = useState<CostResult | null>(null);

  const calculate = () => {
    setResult(calculateCost(power, powerUnit, hours, costRate));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setPower("1500"); setPowerUnit("watts"); setHours("4"); setCostRate("0.15");
    setResult(calculateCost("1500", "watts", "4", "0.15"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-4 text-lg bg-transparent outline-none border-none text-foreground font-mono";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const faqs = [
    { question: "What is a Kilowatt-Hour (kWh)?", answer: "A Kilowatt-Hour is a unit of energy used by utility companies to bill you. It represents 1,000 watts of power being sustained for exactly one hour. For example, leaving a 100-watt light bulb on for 10 hours uses exactly 1 kWh (100W × 10h = 1000Wh = 1kWh)." },
    { question: "How do I find my electricity rate?", answer: "Look at your most recent electrical bill. Divide the total cost of the bill by the total number of kWh used that month. In the US, the national average is roughly $0.15 to $0.17 per kWh, though it varies wildly by state (e.g., California might be $0.30+, while Washington might be $0.10)." },
    { question: "How do I find the wattage of an appliance?", answer: "Almost all electrical devices have a metal nameplate or a sticker on the back or bottom indicating their power consumption. It will either state 'W' for Watts, or give you Amps (A) and Volts (V). If it gives Amps and Volts, multiply them together to get Watts (Watts = Amps × Volts)." },
    { question: "Does my fridge run 24 hours a day?", answer: "No. While it is plugged in 24 hours a day, the compressor that actually draws heavy power cycles on and off to maintain temperature. A typical modern refrigerator only actively draws power for about 8 hours a day. Enter 8 hours instead of 24 for an accurate estimate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Electricity Cost Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Electricity Cost Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col mb-1">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Power Consumption</span>
              </label>
              <div className="flex gap-2">
                <div className={`${wrap} flex-1`}><input type="number" value={power} onChange={e => setPower(e.target.value)} className={ci} min="0" step="any" placeholder="e.g. 1500" /></div>
                <div className={`${wrap} w-28 shrink-0`}>
                  <select value={powerUnit} onChange={e => setPowerUnit(e.target.value)} className={`${ci} !text-base`}>
                    <option value="watts">Watts</option>
                    <option value="kw">kW</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Look for the wattage on the back/bottom sticker of the appliance.</p>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Usage Time</span>
                <span className="text-xs text-muted-foreground font-normal self-end">Hours per Day</span>
              </label>
              <div className={wrap}><input type="number" value={hours} onChange={e => setHours(e.target.value)} className={ci} min="0" max="24" step="any" placeholder="e.g. 4" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Electricity Cost</span>
                <span className="text-xs text-muted-foreground font-normal self-end">$ per kWh</span>
              </label>
              <div className="flex items-center rounded-md border border-input bg-background h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 px-3">
                <span className="text-muted-foreground font-mono text-lg">$</span>
                <input type="number" value={costRate} onChange={e => setCostRate(e.target.value)} className="w-full h-full px-2 text-lg bg-transparent outline-none border-none text-foreground font-mono" min="0" step="0.01" placeholder="0.15" />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <Zap className="h-5 w-5" /> Calculate Cost
              </button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result ? (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Estimated Monthly Cost</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {formatCurrency(result.monthlyCost)}
                  </div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Energy Used</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{parseFloat(result.monthlyKwh.toPrecision(6))}</div>
                  <div className="text-xs text-muted-foreground font-medium">kWh / Month</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Daily Cost</div>
                    <div className="text-xs text-muted-foreground font-medium">{parseFloat(result.dailyKwh.toPrecision(4))} kWh</div>
                  </div>
                  <div className="text-3xl font-extrabold text-foreground font-mono">{formatCurrency(result.dailyCost)}</div>
                </div>
                
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Yearly Cost</div>
                    <div className="text-xs text-muted-foreground font-medium">{parseFloat(result.yearlyKwh.toPrecision(6))} kWh</div>
                  </div>
                  <div className="text-3xl font-extrabold text-foreground font-mono">{formatCurrency(result.yearlyCost)}</div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Calculation Logic</h3>
                <ul className="space-y-3 font-mono text-sm">
                  <li className="flex items-start gap-2 text-muted-foreground border-b border-border/50 pb-2">
                    <span className="w-6 shrink-0 text-primary font-bold text-right">1.</span> 
                    <span>Convert Watts to Kilowatts (kW):<br/><span className="font-bold text-foreground">Watts ÷ 1000 = kW</span></span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground border-b border-border/50 pb-2">
                    <span className="w-6 shrink-0 text-primary font-bold text-right">2.</span> 
                    <span>Calculate daily energy consumption (kWh):<br/><span className="font-bold text-foreground">kW × Hours per Day = Daily kWh</span></span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <span className="w-6 shrink-0 text-primary font-bold text-right">3.</span> 
                    <span>Calculate cost:<br/><span className="font-bold text-foreground">Daily kWh × Cost Rate = Daily Cost</span></span>
                  </li>
                </ul>
              </div>

            </>) : (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please enter valid positive numbers for all fields.</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>How Is Electricity Billed?</h2>
            <p>Unlike water or gas, which are billed by physical volume, electricity is billed by <strong>Energy</strong> over time. The standard unit of measurement used by utility companies worldwide is the <strong>Kilowatt-Hour (kWh)</strong>. This unit does not mean "kilowatts per hour." Rather, it means exactly 1,000 watts of power sustained for exactly one hour. For instance, running a 1,500-watt space heater for two hours consumes 3 kWh (1.5 kW × 2h = 3 kWh).</p>

            <h2>Finding Your Power Consumption (Watts)</h2>
            <p>To accurately estimate the cost of running an appliance, you must know its power draw. Almost all consumer electronics have a specification sticker on the back or bottom. Look for a number followed by "W" (Watts). Typical examples include:</p>
            <ul>
              <li><strong>LED Light Bulb:</strong> 10W</li>
              <li><strong>Laptop Computer:</strong> 50W to 100W</li>
              <li><strong>Desktop PC (Gaming):</strong> 400W to 800W</li>
              <li><strong>Space Heater:</strong> 1,500W</li>
              <li><strong>Central Air Conditioner:</strong> 3,000W to 5,000W</li>
            </ul>
            <p>If the sticker does not list Watts, it will list Amps (A) and Volts (V). In North America, standard wall outlets are 120V. You can easily find the wattage using Ohm's Law: <strong>Watts = Volts × Amps</strong>. So, a device drawing 5 Amps on a 120V circuit consumes 600 Watts.</p>

            <h2>Finding Your Electricity Rate</h2>
            <p>Electricity rates fluctuate based on where you live, the time of year, and even the time of day. In the United States, the average cost is around $0.15 per kWh, but this ranges from $0.10 in states with cheap hydroelectric power to over $0.35 in states like Hawaii or California.</p>
            <p>To find your exact rate, grab your latest electrical bill. Do not just look at the rate they advertise (often called the "generation rate"). You must also account for transmission and delivery fees. The most accurate way to find your true rate is to take the <strong>Total Cost of the Bill</strong> and divide it by the <strong>Total kWh Used</strong> that month.</p>

            <h2>Beware of "Always On" Appliances</h2>
            <p>When using this calculator, be realistic about "Usage Time." A television might draw 100W, but you only watch it for 4 hours a day. Conversely, a device in "standby mode" (like a cable box or a TV waiting for a remote signal) might only draw 10W, but because it draws that power 24 hours a day, 365 days a year, it can cost you over $10 a year to do absolutely nothing!</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/electricity-cost-calculator" />
          <PopularCalculators exclude="/calculator/electricity-cost-calculator" />
        </div>
      </div>
    </>
  );
};
export default ElectricityCostCalculator;
