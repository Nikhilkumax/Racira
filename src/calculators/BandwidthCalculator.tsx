"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Wifi } from "lucide-react";

interface BandwidthResult {
  bitsPerSec: number;
  kbps: number;
  mbps: number;
  gbps: number;
  bytesPerSec: number;
  KBps: number;
  MBps: number;
  GBps: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateBandwidth = (
  unit: string,
  valueStr: string
): BandwidthResult | null => {
  const val = parseFloat(valueStr);

  if (isNaN(val) || val < 0) return null;

  try {
    // Standard metric definition for network speed (1 Kbps = 1000 bps, NOT 1024)
    // Convert everything to a base of bits per second (bps)
    let bps = 0;

    switch (unit) {
      case "bps": bps = val; break;
      case "kbps": bps = val * 1000; break;
      case "mbps": bps = val * 1000000; break;
      case "gbps": bps = val * 1000000000; break;
      case "Bps": bps = val * 8; break;
      case "KBps": bps = val * 8 * 1000; break;
      case "MBps": bps = val * 8 * 1000000; break;
      case "GBps": bps = val * 8 * 1000000000; break;
      default: bps = val;
    }

    // Now convert bps back out to all formats
    const kbps = bps / 1000;
    const mbps = bps / 1000000;
    const gbps = bps / 1000000000;

    const Bps = bps / 8;
    const KBps = Bps / 1000;
    const MBps = Bps / 1000000;
    const GBps = Bps / 1000000000;

    return {
      bitsPerSec: bps,
      kbps: parseFloat(kbps.toFixed(4)),
      mbps: parseFloat(mbps.toFixed(4)),
      gbps: parseFloat(gbps.toFixed(4)),
      bytesPerSec: Bps,
      KBps: parseFloat(KBps.toFixed(4)),
      MBps: parseFloat(MBps.toFixed(4)),
      GBps: parseFloat(GBps.toFixed(4)),
      isError: false
    };

  } catch (err) {
    return { bitsPerSec: 0, kbps: 0, mbps: 0, gbps: 0, bytesPerSec: 0, KBps: 0, MBps: 0, GBps: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const BandwidthCalculator = () => {
  const [unit, setUnit] = useState("mbps");
  const [value, setValue] = useState("1000"); // 1 Gigabit internet

  const [result, setResult] = useState<BandwidthResult | null>(null);

  const calculate = () => {
    setResult(calculateBandwidth(unit, value));
  };

  useEffect(() => { calculate(); }, [unit, value]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the difference between a Bit and a Byte?", answer: "This is the most common confusion in technology. A 'bit' is a single binary digit (a 1 or a 0). A 'Byte' is a collection of exactly 8 bits. Network speeds are almost always advertised in bits (lowercase 'b'), while file sizes are measured in Bytes (uppercase 'B')." },
    { question: "Why does my 100 Mbps internet download files at 12 MB/s?", answer: "Internet Service Providers (ISPs) advertise speeds in Megabits per second (Mbps) because the number looks larger for marketing. However, your web browser downloads files in Megabytes per second (MB/s). Because there are 8 bits in a Byte, you must divide your advertised internet speed by 8. (100 Mbps ÷ 8 = 12.5 MB/s maximum theoretical download speed)." },
    { question: "Does bandwidth use 1000 or 1024?", answer: "Network bandwidth universally uses the decimal standard (base-10), meaning 1 Kilobit = exactly 1,000 bits. This is different from RAM and traditional hard drives, which historically used the binary standard (base-2) where 1 Kilobyte = exactly 1,024 bytes." },
    { question: "What is Gigabit internet?", answer: "Gigabit internet (1 Gbps) provides a theoretical download speed of 1,000 Megabits per second. If divided by 8, this equals a massive 125 Megabytes per second of data transfer. At this speed, a standard 5 GB HD movie would download in about 40 seconds." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Bandwidth Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bandwidth Speed Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Network Speed</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className={wrap}><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} min="0" step="any" /></div>
                </div>
                <div className="w-32">
                  <div className={wrap}>
                    <select value={unit} onChange={e => setUnit(e.target.value)} className={ci}>
                      <optgroup label="Bits (Network Speed)">
                        <option value="bps">bps</option>
                        <option value="kbps">Kbps</option>
                        <option value="mbps">Mbps</option>
                        <option value="gbps">Gbps</option>
                      </optgroup>
                      <optgroup label="Bytes (File Download)">
                        <option value="Bps">B/s</option>
                        <option value="KBps">KB/s</option>
                        <option value="MBps">MB/s</option>
                        <option value="GBps">GB/s</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <Wifi className="h-5 w-5" /> Convert Speed
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
                  <div className="bg-sky-500/10 p-4 border-b border-border/50">
                    <h3 className="font-bold text-sky-700 dark:text-sky-400">Network Speed (Bits)</h3>
                    <div className="text-xs text-muted-foreground">Used by ISPs (lowercase 'b')</div>
                  </div>
                  <div className="divide-y divide-border/50">
                    <div className="grid grid-cols-2 p-3 items-center">
                      <div className="text-sm font-bold text-foreground">bps</div>
                      <div className="text-right font-mono text-muted-foreground break-all">{result.bitsPerSec.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 p-3 items-center">
                      <div className="text-sm font-bold text-foreground">Kbps</div>
                      <div className="text-right font-mono text-muted-foreground break-all">{result.kbps.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 p-3 items-center bg-secondary/20">
                      <div className="text-sm font-bold text-foreground">Mbps</div>
                      <div className="text-right font-mono text-primary font-bold break-all">{result.mbps.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 p-3 items-center">
                      <div className="text-sm font-bold text-foreground">Gbps</div>
                      <div className="text-right font-mono text-muted-foreground break-all">{result.gbps.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
                  <div className="bg-emerald-500/10 p-4 border-b border-border/50">
                    <h3 className="font-bold text-emerald-700 dark:text-emerald-400">Download Speed (Bytes)</h3>
                    <div className="text-xs text-muted-foreground">Used by Web Browsers (uppercase 'B')</div>
                  </div>
                  <div className="divide-y divide-border/50">
                    <div className="grid grid-cols-2 p-3 items-center">
                      <div className="text-sm font-bold text-foreground">B/s</div>
                      <div className="text-right font-mono text-muted-foreground break-all">{result.bytesPerSec.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 p-3 items-center">
                      <div className="text-sm font-bold text-foreground">KB/s</div>
                      <div className="text-right font-mono text-muted-foreground break-all">{result.KBps.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 p-3 items-center bg-secondary/20">
                      <div className="text-sm font-bold text-foreground">MB/s</div>
                      <div className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold break-all">{result.MBps.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 p-3 items-center">
                      <div className="text-sm font-bold text-foreground">GB/s</div>
                      <div className="text-right font-mono text-muted-foreground break-all">{result.GBps.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Great Broadband Marketing Trick</h2>
            <p>If you pay your Internet Service Provider (ISP) for a "100 Meg" internet connection, you might be furious when you download a video game and your browser says it is only downloading at 12 Megs. Are you being scammed? No, you are experiencing the most successful marketing trick in the technology industry: the difference between a Bit and a Byte.</p>

            <h2>Bits vs. Bytes (The Rule of 8)</h2>
            <p>At the fundamental hardware level, computers communicate using binary code—a series of 1s and 0s. A single binary digit is called a <strong>Bit</strong> (short for Binary Digit). By standard convention, bits are represented with a lowercase 'b'.</p>
            <p>However, when computers store files on a hard drive, they group those bits into standardized packages. A package of exactly 8 bits is called a <strong>Byte</strong>. Bytes are represented with an uppercase 'B'.</p>
            <p>When an ISP advertises your speed, they use Megabits per second (Mbps). They do this simply because the number looks 8 times larger on a billboard. When your web browser downloads a file, it measures the speed in Megabytes per second (MB/s). <strong>To find your true download speed, you must divide your advertised internet speed by 8.</strong></p>

            <h2>Understanding Gigabit Internet</h2>
            <p>Fiber optic infrastructure has brought "Gigabit" internet to many residential homes. 1 Gigabit per second (Gbps) equals 1,000 Megabits per second (Mbps). When divided by 8, a Gigabit connection provides a maximum theoretical download speed of 125 Megabytes per second (MB/s).</p>
            <p>While incredibly fast, you will rarely see a single file download at 125 MB/s. This is because bandwidth acts like a physical pipe. Just because your pipe is large enough to handle 125 MB/s of water doesn't mean the server you are downloading from has a pump strong enough to push the water that fast. Most web servers cap their upload speeds to individual users, meaning the real benefit of Gigabit internet is allowing a family of 5 to stream 4K video simultaneously without lagging, rather than accelerating a single download.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bandwidth-calculator" />
          <PopularCalculators exclude="/calculator/bandwidth-calculator" />
        </div>
      </div>
    </>
  );
};
export default BandwidthCalculator;
