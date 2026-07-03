"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ArrowRightLeft } from "lucide-react";

interface TransferResult {
  totalSeconds: number;
  timeFormatted: string;
  isError: boolean;
  errorMsg?: string;
}

const calculateTransfer = (
  fileSizeStr: string,
  fileUnit: string,
  speedStr: string,
  speedUnit: string
): TransferResult | null => {
  const size = parseFloat(fileSizeStr);
  const speed = parseFloat(speedStr);

  if (isNaN(size) || isNaN(speed) || size < 0 || speed <= 0) return null;

  try {
    // 1. Convert file size to Bytes
    // Using binary standard (1024) for file sizes
    let bytes = 0;
    switch (fileUnit) {
      case "MB": bytes = size * 1024 * 1024; break;
      case "GB": bytes = size * 1024 * 1024 * 1024; break;
      case "TB": bytes = size * 1024 * 1024 * 1024 * 1024; break;
      default: bytes = size;
    }

    // Convert bytes to bits
    const totalBits = bytes * 8;

    // 2. Convert speed to bits per second (bps)
    // Using decimal standard (1000) for network speeds
    let bps = 0;
    switch (speedUnit) {
      case "mbps": bps = speed * 1000000; break;
      case "gbps": bps = speed * 1000000000; break;
      case "MBps": bps = speed * 8 * 1000000; break;
      default: bps = speed;
    }

    // 3. Calculate time
    // Adding 5% overhead for TCP/IP packet headers and network latency
    const rawSeconds = totalBits / bps;
    const totalSeconds = rawSeconds * 1.05;

    // Format time
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let formatted = "";
    if (days > 0) formatted += `${days}d `;
    if (hours > 0 || days > 0) formatted += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) formatted += `${minutes}m `;
    formatted += `${seconds}s`;

    return {
      totalSeconds: totalSeconds,
      timeFormatted: formatted,
      isError: false
    };

  } catch (err) {
    return { totalSeconds: 0, timeFormatted: "", isError: true, errorMsg: "Calculation error." };
  }
};

const DataTransferCalculator = () => {
  const [size, setSize] = useState("50");
  const [sUnit, setSUnit] = useState("GB");
  const [speed, setSpeed] = useState("100");
  const [spUnit, setSpUnit] = useState("mbps");

  const [result, setResult] = useState<TransferResult | null>(null);

  const calculate = () => {
    setResult(calculateTransfer(size, sUnit, speed, spUnit));
  };

  useEffect(() => { calculate(); }, [size, sUnit, speed, spUnit]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why is the calculation not exact?", answer: "When you download a file, you are not just receiving the raw file data. The internet uses the TCP/IP protocol, which wraps your file data in digital 'envelopes' (packets) containing routing information, checksums, and sequence numbers. This calculator adds a standard 5% overhead to account for this extra packet data and general network latency." },
    { question: "What is overhead?", answer: "Overhead refers to the mandatory extra data required to manage a network connection. If you have a 100 Mbps connection, you cannot use all 100 Mbps for your actual file. A small percentage of that bandwidth is consumed by your computer constantly saying 'I received packet 4, please send packet 5' to the server." },
    { question: "Why does my download slow down at the end?", answer: "This is usually caused by your computer's hard drive or CPU bottlenecking the process. When downloading a massive file, the web browser must continuously flush data from the fast RAM into long-term storage. If your storage drive is slow or fragmented, the browser will artificially pause the download to give the hard drive time to catch up." },
    { question: "Does Ethernet matter?", answer: "Absolutely. While Wi-Fi is convenient, it is highly susceptible to radio interference and packet loss. If a packet is lost in the air, the router must wait and re-transmit it, destroying your transfer speed. A hardwired Ethernet cable provides a dedicated, shielded connection ensuring nearly zero packet loss, maximizing your theoretical download speed." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Data Transfer Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Data Transfer Time Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">File Size</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className={wrap}><input type="number" value={size} onChange={e => setSize(e.target.value)} className={ci} min="0" step="any" /></div>
                </div>
                <div className="w-32">
                  <div className={wrap}>
                    <select value={sUnit} onChange={e => setSUnit(e.target.value)} className={ci}>
                      <option value="MB">MB</option>
                      <option value="GB">GB</option>
                      <option value="TB">TB</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Network Speed</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className={wrap}><input type="number" value={speed} onChange={e => setSpeed(e.target.value)} className={ci} min="0" step="any" /></div>
                </div>
                <div className="w-32">
                  <div className={wrap}>
                    <select value={spUnit} onChange={e => setSpUnit(e.target.value)} className={ci}>
                      <option value="mbps">Mbps</option>
                      <option value="gbps">Gbps</option>
                      <option value="MBps">MB/s</option>
                    </select>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Mbps = Megabits (ISP Speed). MB/s = Megabytes (Browser Speed).</p>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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
              
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-6">
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider">Estimated Transfer Time</div>
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {result.timeFormatted}
                  </span>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Calculation Notes</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Includes an automatic <strong>+5% overhead penalty</strong> to simulate real-world TCP/IP packet headers and protocol acknowledgments.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Assumes the server sending the file is capable of maxing out your connection speed (which is rarely true for Gigabit connections).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Assumes no other devices on your local network are actively consuming bandwidth during the transfer.</span>
                  </li>
                </ul>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Reality of Internet Downloads</h2>
            <p>In theory, calculating a file download is simple math: divide the size of the file by the speed of the network. However, in the real world of computer science, theoretical speeds are never achieved. There are two major technical bottlenecks that prevent perfect data transfer: Base Conversion and Network Overhead.</p>

            <h2>The Base Conversion Trap</h2>
            <p>The first hurdle is ensuring you are using the correct math. File sizes on your computer's hard drive are measured in <strong>Bytes</strong> using binary math (Base-2), meaning 1 Gigabyte is exactly 1,024 Megabytes. Network speeds are measured in <strong>bits</strong> using decimal math (Base-10), meaning 1 Gigabit is exactly 1,000 Megabits.</p>
            <p>If you have a 100 Megabit (Mbps) connection and try to download a 100 Megabyte (MB) file, it will absolutely not take 1 second. You must first convert the bytes into bits (multiply by 8), and then account for the base math difference. A 100 MB file over a 100 Mbps connection mathematically takes just over 8.3 seconds.</p>

            <h2>The TCP/IP Overhead Tax</h2>
            <p>The internet relies on the TCP/IP protocol to ensure data is transmitted accurately. When a server sends you a file, it does not send one massive block of data. It chops the file up into thousands of tiny pieces called "Packets."</p>
            <p>Each packet must be wrapped in a digital envelope (a header) that contains the destination IP address, the sequence number, and a checksum to verify the data wasn't corrupted in transit. Every time your computer receives a packet, it must use a tiny fraction of your upload bandwidth to send an acknowledgment message back to the server saying "Packet received, send the next one."</p>
            <p>All of this mandatory background chatter consumes bandwidth. This "Overhead Tax" generally consumes about 5% of your total network capacity, which is why this calculator automatically adds a 5% time penalty to give you a realistic real-world estimate.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/data-transfer-calculator" />
          <PopularCalculators exclude="/calculator/data-transfer-calculator" />
        </div>
      </div>
    </>
  );
};
export default DataTransferCalculator;
