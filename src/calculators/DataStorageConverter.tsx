"use client";
import { HardDrive, ArrowRightLeft, Cpu, Check, Copy } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
// Standard base-2 sizes (IEC standard used by Windows)
const units = [
  { id: "bit", name: "Bit", factor: 1 / 8 },
  { id: "byte", name: "Byte (B)", factor: 1 },
  { id: "kb", name: "Kilobyte (KB)", factor: 1024 },
  { id: "mb", name: "Megabyte (MB)", factor: Math.pow(1024, 2) },
  { id: "gb", name: "Gigabyte (GB)", factor: Math.pow(1024, 3) },
  { id: "tb", name: "Terabyte (TB)", factor: Math.pow(1024, 4) },
  { id: "pb", name: "Petabyte (PB)", factor: Math.pow(1024, 5) },
];

const DataStorageConverter = () => {
  const [inputValue, setInputValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("gb");
  const [toUnit, setToUnit] = useState("mb");
  const [showResults, setShowResults] = useState(false);

  const [convertedValue, setConvertedValue] = useState<number>(1024);
  const [allConversions, setAllConversions] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setConvertedValue(0);
      setAllConversions([]);
      return;
    }

    const fromFactor = units.find(u => u.id === fromUnit)?.factor || 1;
    const toFactor = units.find(u => u.id === toUnit)?.factor || 1;

    // Convert input to raw bytes, then to target unit
    const valueInBytes = val * fromFactor;
    const result = valueInBytes / toFactor;
    
    setConvertedValue(result);

    const all = units.map(u => ({
      id: u.id,
      name: u.name,
      value: valueInBytes / u.factor
    }));
    
    setAllConversions(all);
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatNumber = (num: number) => {
    if (num === 0) return "0";
    if (num < 0.0001 || num > 1000000) return num.toExponential(4);
    return parseFloat(num.toFixed(6)).toString();
  };

  const faqs = [
    { question: "Why do hard drive manufacturers and operating systems show different sizes?", answer: "Storage manufacturers usually use decimal measurements (Base-10), where 1 KB = 1000 Bytes. However, computer operating systems (like Windows) use binary measurements (Base-2), where 1 KB = 1024 Bytes. This is why a '1 Terabyte' hard drive shows up as ~931 Gigabytes in Windows." },
    { question: "What is the difference between a bit and a byte?", answer: "A bit is the smallest unit of digital data, representing a single binary value (0 or 1). A byte is a sequence of 8 bits. Storage space is usually measured in bytes (MB, GB), while network speeds are often measured in bits per second (Mbps)." },
    { question: "What comes after a Petabyte?", answer: "After Petabyte (PB) comes Exabyte (EB), Zettabyte (ZB), and Yottabyte (YB). Each step up represents a multiplier of 1024. For context, all the data stored on the internet globally is estimated to be in the low hundreds of Zettabytes." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Data Storage Converter" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Data Storage Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="max-w-3xl mx-auto">
                 <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-center justify-center">
                    <HardDrive className="h-6 w-6 text-primary" /> Storage Conversion
                 </h2>
                 
                 <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full space-y-2">
                       <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="input-calc text-xl font-bold p-4 h-16" placeholder="Value" />
                       <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="input-calc h-12 bg-secondary/50 font-medium">
                         {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                       </select>
                    </div>
                    
                    <button onClick={swapUnits} className="p-4 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0 my-2 md:my-0">
                       <ArrowRightLeft className="h-6 w-6" />
                    </button>

                    <div className="flex-1 w-full space-y-2">
                       <div className="w-full rounded-xl border border-border bg-secondary/10 text-xl font-black p-4 h-16 flex items-center overflow-x-auto custom-scrollbar whitespace-nowrap">
                          {formatNumber(convertedValue)}
                       </div>
                       <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="input-calc h-12 bg-secondary/50 font-medium">
                         {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                       </select>
                    </div>
                 </div>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {allConversions.length > 0 && (
              <>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <Cpu className="h-5 w-5 text-primary" /> Full Conversion Table
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {allConversions.map((conv, idx) => (
                    <div key={conv.id} className={`flex justify-between items-center p-3 rounded-lg border ${conv.id === toUnit ? 'bg-primary/10 border-primary/30' : 'bg-secondary/10 border-border'} hover:border-primary/30 transition-colors`}>
                      <span className="font-bold text-sm text-muted-foreground">{conv.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black">{formatNumber(conv.value)}</span>
                        <button 
                          onClick={() => copyToClipboard(conv.value.toString(), idx)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {copiedIndex === idx ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-4 text-center">Note: This calculator uses Base-2 binary standard (1 KB = 1024 Bytes) commonly used by memory modules and Windows OS.</p>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Base-2 vs. Base-10</h2>
              <p>In the tech industry, there is an ongoing discrepancy regarding how storage is measured. The International System of Units (SI) defines the prefix 'Kilo' as exactly 1,000. Under this system, 1 Kilobyte is 1,000 Bytes.</p>
              <p>However, computer architecture is inherently binary (base-2). Therefore, memory sizes naturally scale by powers of 2. Under the traditional binary system, 1 Kilobyte is 1,024 Bytes (2^10). To resolve this confusion, new prefixes like 'Kibibyte (KiB)' were introduced for base-2, but the industry generally still uses the old KB/MB nomenclature for both.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/data-storage-converter" />
          <PopularCalculators exclude="/calculator/data-storage-converter" />
        </div>
      </div>
    </>
  );
};

export default DataStorageConverter;

