"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, HardDrive } from "lucide-react";

interface StorageResult {
  bytes: number;
  kb: number; // Binary (1024)
  mb: number;
  gb: number;
  tb: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateStorage = (
  unit: string,
  valueStr: string
): StorageResult | null => {
  const val = parseFloat(valueStr);

  if (isNaN(val) || val < 0) return null;

  try {
    // We will use the traditional Binary standard (1024) as it is what Windows uses.
    let bytes = 0;

    switch (unit) {
      case "B": bytes = val; break;
      case "KB": bytes = val * 1024; break;
      case "MB": bytes = val * 1024 * 1024; break;
      case "GB": bytes = val * 1024 * 1024 * 1024; break;
      case "TB": bytes = val * 1024 * 1024 * 1024 * 1024; break;
      default: bytes = val;
    }

    const kb = bytes / 1024;
    const mb = bytes / Math.pow(1024, 2);
    const gb = bytes / Math.pow(1024, 3);
    const tb = bytes / Math.pow(1024, 4);

    return {
      bytes: bytes,
      kb: parseFloat(kb.toFixed(4)),
      mb: parseFloat(mb.toFixed(6)),
      gb: parseFloat(gb.toFixed(8)),
      tb: parseFloat(tb.toFixed(10)),
      isError: false
    };

  } catch (err) {
    return { bytes: 0, kb: 0, mb: 0, gb: 0, tb: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const StorageConverter = () => {
  const [unit, setUnit] = useState("GB");
  const [value, setValue] = useState("500");

  const [result, setResult] = useState<StorageResult | null>(null);

  const calculate = () => {
    setResult(calculateStorage(unit, value));
  };

  useEffect(() => { calculate(); }, [unit, value]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why does my 500GB hard drive only show 465GB in Windows?", answer: "This is the most common frustration in computing. Hard drive manufacturers use Decimal math (base-10), meaning they define 1 Gigabyte as exactly 1,000,000,000 bytes. However, Microsoft Windows uses Binary math (base-2), defining 1 Gigabyte as exactly 1,073,741,824 bytes. Because Windows divides the drive's total bytes by a larger number, the resulting GB capacity is visibly lower." },
    { question: "What is the difference between KB and KiB?", answer: "To solve the confusion between hard drive manufacturers and software developers, the International Electrotechnical Commission introduced new terms. 'KB' (Kilobyte) is the decimal standard (1,000 bytes). 'KiB' (Kibibyte) is the binary standard (1,024 bytes). Despite this new standard, Microsoft Windows still displays 'KB' but mathematically calculates it as 'KiB', keeping the confusion alive." },
    { question: "How many Megabytes in a Gigabyte?", answer: "In the traditional binary system used by software and memory (RAM), there are exactly 1,024 Megabytes in a Gigabyte. In the decimal system used by hard drive and flash drive manufacturers, there are exactly 1,000 Megabytes in a Gigabyte." },
    { question: "What does this calculator use?", answer: "This calculator uses the traditional Binary (1024) standard. This is because when a user wants to know how many 5MB photos can fit on their drive, they are usually looking at the file size reported by their computer's operating system, which relies on the 1024 binary standard." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Storage Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Data Storage Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">File Size or Drive Capacity</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className={wrap}><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} min="0" step="any" /></div>
                </div>
                <div className="w-32">
                  <div className={wrap}>
                    <select value={unit} onChange={e => setUnit(e.target.value)} className={ci}>
                      <option value="B">Bytes</option>
                      <option value="KB">KB</option>
                      <option value="MB">MB</option>
                      <option value="GB">GB</option>
                      <option value="TB">TB</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <HardDrive className="h-5 w-5" /> Convert Storage
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please check your inputs and try again.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
                <div className="bg-primary/10 p-4 border-b border-border/50">
                  <h3 className="font-bold text-primary">Binary Equivalent Sizes</h3>
                  <div className="text-xs text-muted-foreground">Standard 1024 Base (Used by Microsoft Windows)</div>
                </div>
                <div className="divide-y divide-border/50">
                  <div className="grid grid-cols-2 p-4 items-center hover:bg-secondary/20 transition-colors">
                    <div className="text-sm font-bold text-foreground">Bytes (B)</div>
                    <div className="text-right font-mono text-muted-foreground break-all">{result.bytes.toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-2 p-4 items-center hover:bg-secondary/20 transition-colors">
                    <div className="text-sm font-bold text-foreground">Kilobytes (KB)</div>
                    <div className="text-right font-mono text-muted-foreground break-all">{result.kb.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
                  </div>
                  <div className="grid grid-cols-2 p-4 items-center hover:bg-secondary/20 transition-colors">
                    <div className="text-sm font-bold text-foreground">Megabytes (MB)</div>
                    <div className="text-right font-mono text-muted-foreground break-all">{result.mb.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
                  </div>
                  <div className="grid grid-cols-2 p-4 items-center hover:bg-secondary/20 transition-colors bg-secondary/10">
                    <div className="text-sm font-bold text-foreground">Gigabytes (GB)</div>
                    <div className="text-right font-mono text-primary font-bold break-all">{result.gb.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                  </div>
                  <div className="grid grid-cols-2 p-4 items-center hover:bg-secondary/20 transition-colors">
                    <div className="text-sm font-bold text-foreground">Terabytes (TB)</div>
                    <div className="text-right font-mono text-muted-foreground break-all">{result.tb.toLocaleString(undefined, { maximumFractionDigits: 8 })}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Manufacturer Warning</div>
                <div className="text-sm text-foreground leading-relaxed">
                  If you bought a hard drive advertised as <strong>{value} {unit}</strong>, it will show up in Windows as roughly <strong>{(() => {
                    const decBytes = parseFloat(value) * Math.pow(1000, unit === "KB" ? 1 : unit === "MB" ? 2 : unit === "GB" ? 3 : unit === "TB" ? 4 : 0);
                    const binGB = decBytes / Math.pow(1024, unit === "KB" ? 1 : unit === "MB" ? 2 : unit === "GB" ? 3 : unit === "TB" ? 4 : 0);
                    return binGB.toFixed(2);
                  })()} {unit}</strong> due to the difference between decimal marketing and binary computer logic.
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Great Storage Discrepancy</h2>
            <p>Every year, millions of consumers buy a brand-new 1 Terabyte (TB) external hard drive, plug it into their Windows PC, and are furious to discover the computer says the drive only holds 931 Gigabytes. Did the manufacturer steal 69 Gigabytes of space? No, this discrepancy is the result of an industry-wide mathematical disagreement between hardware manufacturers and software developers.</p>

            <h2 className="text-2xl font-bold mb-3">Hardware vs Software (Base-10 vs Base-2)</h2>
            <p>Hard drive manufacturers (like Western Digital and Seagate) use the standard metric system (Decimal, Base-10). In the metric system, "Kilo" means 1,000. Therefore, they define 1 Kilobyte as exactly 1,000 bytes. By their math, a 1 Terabyte drive contains exactly 1,000,000,000,000 bytes.</p>
            <p>Computers, however, do not think in decimals; they think in binary (Base-2). In the binary system, memory is allocated in powers of 2. The closest power of 2 to one thousand is 1,024 (2^10). Therefore, software developers defined 1 Kilobyte as exactly 1,024 bytes. Microsoft Windows strictly uses this binary math.</p>
            <p>When you plug a 1,000,000,000,000-byte hard drive into Windows, the operating system divides that massive number by 1,024 (not 1,000) to find the Kilobytes, then divides by 1,024 again for Megabytes, and again for Gigabytes. This mathematically shrinks the visible number down to 931 GB. <strong>The physical storage space is entirely there; it is simply being measured with a different mathematical ruler.</strong></p>

            <h2 className="text-2xl font-bold mb-3">The Attempted Fix: Kibibytes</h2>
            <p>To end the confusion, the International Electrotechnical Commission created new prefixes in 1998. The decimal standard (1,000) kept the names Kilobyte (KB) and Megabyte (MB). The binary standard (1,024) was given the names Kibibyte (KiB) and Mebibyte (MiB).</p>
            <p>Apple adopted this standard. If you plug a 1TB drive into a Mac, macOS uses base-10 decimal math and correctly reports a full 1TB of space. However, Microsoft refused to adopt the standard. Windows still uses binary math (1,024) but continues to display the old 'KB' and 'GB' abbreviations, causing endless confusion for consumers to this day.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/storage-converter" />
          <PopularCalculators exclude="/calculator/storage-converter" />
        </div>
      </div>
    </>
  );
};
export default StorageConverter;
