"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Copy, RefreshCw, Hash, Settings, Check } from "lucide-react";

const MacAddressGenerator = () => {
  const [format, setFormat] = useState("colon"); // colon, hyphen, dot, none
  const [count, setCount] = useState("5");
  const [caseType, setCaseType] = useState("upper"); // upper, lower
  const [prefix, setPrefix] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [macs, setMacs] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0");

  const formatMac = (hexArray: string[]) => {
    const raw = hexArray.join("");
    let formatted = raw;

    if (format === "colon") {
      formatted = hexArray.join(":");
    } else if (format === "hyphen") {
      formatted = hexArray.join("-");
    } else if (format === "dot") {
      formatted = `${raw.substring(0, 4)}.${raw.substring(4, 8)}.${raw.substring(8, 12)}`;
    }

    return caseType === "upper" ? formatted.toUpperCase() : formatted.toLowerCase();
  };

  const generate = () => {
    const num = parseInt(count) || 5;
    const maxNum = Math.min(Math.max(1, num), 100);
    
    let basePrefix: string[] = [];
    if (prefix) {
      // clean prefix
      const cleanPrefix = prefix.replace(/[^a-fA-F0-9]/g, "");
      for (let i = 0; i < cleanPrefix.length; i += 2) {
         if (basePrefix.length < 6) {
           basePrefix.push(cleanPrefix.substring(i, i + 2).padStart(2, "0"));
         }
      }
    }

    const newMacs: string[] = [];
    for (let i = 0; i < maxNum; i++) {
      let currentMac = [...basePrefix];
      while (currentMac.length < 6) {
        currentMac.push(generateHex());
      }
      // Ensure unicast and locally administered if no prefix is provided
      if (basePrefix.length === 0) {
         const firstByte = parseInt(currentMac[0], 16);
         // Set LSB of first byte to 0 (unicast) and second LSB to 1 (locally administered)
         currentMac[0] = ((firstByte & 0xFE) | 0x02).toString(16).padStart(2, "0");
      }
      newMacs.push(formatMac(currentMac));
    }

    setMacs(newMacs);
    setCopiedIndex(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const faqs = [
    { question: "What is a MAC address?", answer: "A Media Access Control (MAC) address is a unique identifier assigned to a network interface controller (NIC) for use as a network address in communications within a network segment. It is often referred to as a hardware address or physical address." },
    { question: "How long is a MAC address?", answer: "A standard MAC address is 48 bits long, typically represented as 12 hexadecimal digits (0-9, A-F), often grouped in pairs separated by hyphens or colons." },
    { question: "What is an OUI (prefix)?", answer: "The first 24 bits (3 bytes) of a MAC address are known as the Organizationally Unique Identifier (OUI). This prefix is assigned by the IEEE to the manufacturer of the networking hardware (e.g., Apple, Cisco, Intel)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "MAC Address Generator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">MAC Address Generator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Generate random, valid MAC addresses for network testing, spoofing, and development.</p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="card-calculator h-fit">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-primary" /> Settings
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Format</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value)} className="input-calc">
                      <option value="colon">Colon (XX:XX:XX:XX:XX:XX)</option>
                      <option value="hyphen">Hyphen (XX-XX-XX-XX-XX-XX)</option>
                      <option value="dot">Cisco Dot (XXXX.XXXX.XXXX)</option>
                      <option value="none">Raw (XXXXXXXXXXXX)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Case</label>
                    <select value={caseType} onChange={(e) => setCaseType(e.target.value)} className="input-calc">
                      <option value="upper">UPPERCASE</option>
                      <option value="lower">lowercase</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Vendor Prefix / OUI (Optional)</label>
                    <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} className="input-calc" placeholder="e.g. 00:1A:2B" />
                    <p className="text-[10px] text-muted-foreground mt-1">First 3 bytes. Leave blank for fully random locally-administered addresses.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Quantity</label>
                    <input type="number" value={count} onChange={(e) => setCount(e.target.value)} className="input-calc" min="1" max="100" />
                  </div>
                  <div className="pt-2">
                    <button onClick={generate} className="w-full p-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20">
                      <RefreshCw className="h-5 w-5" /> Generate MACs
                    </button>
                  </div>
                </section>
              </div>

              <div className="card-calculator flex flex-col">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <Hash className="h-5 w-5 text-primary" /> Results
                </h2>
                {macs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground min-h-[200px] border-2 border-dashed border-border rounded-xl bg-secondary/5">
                     <Hash className="h-8 w-8 mb-2 opacity-20" />
                     <p className="text-sm font-medium">Click generate to create MACs</p>
                  </div>
                ) : (
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                    {macs.map((mac, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-border bg-secondary/10 hover:border-primary/30 transition-colors group">
                        <span className="font-mono font-medium tracking-widest">{mac}</span>
                        <button 
                          onClick={() => copyToClipboard(mac, idx)}
                          className="p-2 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {copiedIndex === idx ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>How MAC Addresses Work</h2>
              <p>MAC addresses operate at the Data Link layer (Layer 2) of the OSI model. While IP addresses route traffic across global networks, MAC addresses are responsible for delivering data packets to the correct physical device on a local network segment (like your home Wi-Fi or office LAN).</p>
              
              <h3>Structure of a MAC Address</h3>
              <p>A standard 48-bit MAC address is divided into two halves. The first 24 bits represent the Organizationally Unique Identifier (OUI), which identifies the manufacturer. The remaining 24 bits are assigned by the manufacturer to uniquely identify the specific piece of hardware.</p>
              
              <h3>Locally Administered Addresses</h3>
              <p>When you generate a random MAC address without specifying a vendor prefix, this tool automatically sets the "Locally Administered" bit to 1. This ensures that the generated MAC address will not accidentally conflict with a globally registered manufacturer address on a real network.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mac-address-generator" />
            <PopularCalculators exclude="/calculator/mac-address-generator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default MacAddressGenerator;

