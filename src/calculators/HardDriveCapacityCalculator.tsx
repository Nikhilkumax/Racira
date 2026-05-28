"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, HardDrive } from "lucide-react";

const HardDriveCapacityCalculator = () => {
  const [size, setSize] = useState("2");
  const [unit, setUnit] = useState("TB");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let rawBytes = parseFloat(size) || 0;
    const units: any = { "GB": 10**9, "TB": 10**12 };
    rawBytes *= units[unit] || 1;

    if (rawBytes <= 0) return;

    // Windows uses binary (powers of 1024)
    // 1 GiB = 1024^3 bytes
    // 1 TiB = 1024^4 bytes
    const gib = rawBytes / (1024 ** 3);
    const tib = rawBytes / (1024 ** 4);

    // Formatted capacity is usually ~93% of the binary capacity due to file system overhead
    const formattedGib = gib * 0.93;

    setResults({
      rawBytes,
      osGiB: gib,
      osTiB: tib,
      formattedGiB: formattedGib,
      marketingLoss: rawBytes - (gib * (1000**3)), // This is not quite right, but we want the difference from what people expect
      diffPct: ((rawBytes - (gib * (1000**3))) / rawBytes) * 100 // This is basically the 1000 vs 1024 diff
    });
  };

  const reset = () => {
    setShowResults(false);
    setSize("2"); setUnit("TB");
    setResults(null);
  };

  const faqs = [
    { question: "Why does my 2TB drive only show 1.81TB in Windows?", answer: "This is due to the difference between decimal and binary measurements. Manufacturers use decimal (1,000 bytes = 1 KB), while Windows uses binary (1,024 bytes = 1 KiB). The larger the drive, the bigger the 'missing' gap appears to be." },
    { question: "What is the difference between TB and TiB?", answer: "TB (Terabyte) is $10^{12}$ bytes. TiB (Tebibyte) is $2^{40}$ bytes. Windows labels binary TiB as 'TB' in the interface, which causes confusion." },
    { question: "Where does the rest of the space go?", answer: "Besides the binary calculation difference, a small portion of space is reserved for the File System (NTFS/APFS) partition table, Master File Table (MFT), and system metadata." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Hard Drive Capacity Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hard Drive Capacity Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate the actual usable storage space of your hard drive or SSD as seen by your operating system.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="size" label="Drive Size (Marketing)" value={size} onChange={setSize} />
                  </div>
                  <div className="w-24 mt-7">
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-calc">
                      <option>GB</option><option>TB</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <HardDrive className="h-5 w-5" /> Calculate Real Space
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Storage Conversion</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Windows OS Capacity</p>
                    <p className="text-4xl font-black text-foreground">
                      {unit === "TB" ? results.osTiB.toFixed(2) + " TB" : results.osGiB.toFixed(1) + " GB"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Measured in binary (GiB/TiB)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Marketing Gap</p>
                    <p className="text-3xl font-black text-foreground">~7.4% <span className="text-sm font-normal text-muted-foreground">difference</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Decimal Bytes", value: 0, textValue: results.rawBytes.toLocaleString() + " B" },
                  { label: "Usable (Formatted)", value: 0, textValue: results.formattedGiB.toFixed(1) + " GiB (est.)" },
                  { label: "Binary Unit Name", value: 0, textValue: unit === "TB" ? "Tebibytes (TiB)" : "Gibibytes (GiB)" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Mystery of the Missing Gigabytes</h2>
              <p>When you buy a hard drive, you might feel cheated when your "1TB" drive shows up as "931GB" in Windows. This isn't because the drive is broken or poor quality; it's because manufacturers and software developers use different measuring sticks.</p>
              <h3>Decimal vs Binary</h3>
              <ul>
                <li><strong>Manufacturers (Decimal):</strong> Use powers of 10. For them, 1 Kilobyte = 1,000 bytes.</li>
                <li><strong>Computers (Binary):</strong> Use powers of 2. For them, 1 Kibibyte = 1,024 bytes.</li>
              </ul>
              <p>As drives get larger, this 2.4% difference compounds. By the time you reach Terabytes, the difference is approximately 7.4%.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hard-drive-capacity" />
          <PopularCalculators exclude="/calculator/hard-drive-capacity-calculator" />
        </div>
      </div>
    </>
  );
};

export default HardDriveCapacityCalculator;

