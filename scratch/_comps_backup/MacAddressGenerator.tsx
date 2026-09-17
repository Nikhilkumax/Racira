"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const VENDORS: Record<string, { label: string; oui: string }> = {
  random: { label: "Random (any vendor)", oui: "" },
  cisco: { label: "Cisco", oui: "00:00:0C" },
  intel: { label: "Intel", oui: "00:1B:21" },
  apple: { label: "Apple", oui: "00:1F:03" },
  dell: { label: "Dell", oui: "00:14:22" },
  hp: { label: "HP", oui: "3C:D9:2B" },
  google: { label: "Google", oui: "F8:98:EF" },
  raspberry: { label: "Raspberry Pi", oui: "B8:27:EB" },
};

const HEX = "0123456789ABCDEF";

function randomByte(): string {
  return HEX[Math.floor(Math.random() * 16)] + HEX[Math.floor(Math.random() * 16)];
}

function generateMacs(vendor: string, count: number): { mac: string; vendor: string; local: boolean; multicast: boolean }[] {
  const oui = VENDORS[vendor].oui;
  const out: { mac: string; vendor: string; local: boolean; multicast: boolean }[] = [];
  for (let i = 0; i < count; i++) {
    const parts = oui ? oui.split(":") : [randomByte(), randomByte(), randomByte()];
    while (parts.length < 6) parts.push(randomByte());
    const mac = parts.join(":").toUpperCase();
    const first = parseInt(parts[0], 16);
    out.push({ mac, vendor: VENDORS[vendor].label, local: (first & 0x02) !== 0, multicast: (first & 0x01) !== 0 });
  }
  return out;
}

interface MacResult {
  count: number;
  vendor: string;
  macs: { mac: string; vendor: string; local: boolean; multicast: boolean }[];
  digitData: { digit: string; count: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function calcMacs(vendor: string, count: number): MacResult {
  const macs = generateMacs(vendor, count);
  const lastDigits: Record<string, number> = {};
  for (const m of macs) {
    const last = m.mac.slice(-1);
    lastDigits[last] = (lastDigits[last] || 0) + 1;
  }
  const digitData = HEX.split("").map((d, i) => ({ digit: d, count: lastDigits[d] || 0, fill: i % 2 === 0 ? "hsl(var(--primary))" : "#8b5cf6" }));
  const oui = VENDORS[vendor].oui;
  const breakdown = [
    { label: "Vendor / OUI", value: VENDORS[vendor].label + (oui ? ` (${oui})` : " — random") },
    { label: "Addresses Generated", value: `${count}` },
    { label: "Unicast Addresses", value: `${macs.filter((m) => !m.multicast).length}` },
    { label: "Multicast Addresses", value: `${macs.filter((m) => m.multicast).length}` },
    { label: "Locally Administered", value: `${macs.filter((m) => m.local).length}` },
    { label: "Globally Unique", value: `${macs.filter((m) => !m.local).length}` },
    { label: "Format", value: "XX:XX:XX:XX:XX:XX (hex)" },
    { label: "Last-Digit Uniformity", value: `${Object.keys(lastDigits).length} distinct digits of 16` },
  ];
  const summaryStats = [
    { label: "Generated", value: `${count}` },
    { label: "Vendor", value: VENDORS[vendor].label },
    { label: "OUI Prefix", value: oui || "Random" },
    { label: "Unicast", value: `${macs.filter((m) => !m.multicast).length}` },
    { label: "Locally Administered", value: `${macs.filter((m) => m.local).length}` },
    { label: "Multicast", value: `${macs.filter((m) => m.multicast).length}` },
    { label: "Last Digit Spread", value: `${Object.keys(lastDigits).length}/16` },
    { label: "Addresses", value: macs.map((m) => m.mac).join(" · ") },
  ];
  return { count, vendor, macs, digitData, breakdown, summaryStats };
}

const DEFAULTS = { vendor: "random", count: "8" };

export default function MacAddressGenerator() {
  const [vendor, setVendor] = useState(DEFAULTS.vendor);
  const [count, setCount] = useState(DEFAULTS.count);
  const [result, setResult] = useState<MacResult | null>(null);

  const c = Math.min(20, Math.max(1, Math.round(parseFloat(count) || 8)));
  const errs: string[] = [];
  if (isNaN(parseFloat(count)) || parseFloat(count) < 1) errs.push("Generate at least one address.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMacs(vendor, c)); };
  const reset = () => {
    setVendor(DEFAULTS.vendor); setCount(DEFAULTS.count);
    setResult(calcMacs("random", 8));
  };
  useEffect(() => { setResult(calcMacs("random", 8)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a MAC address?", answer: "A MAC (media access control) address is a 48-bit hardware identifier burned into network interfaces, written as six hex bytes. The first three bytes — the OUI — identify the manufacturer; the rest are unique per device." },
    { question: "What do the first bits mean?", answer: "The least-significant bit of the first byte marks multicast (1) vs unicast (0); the next bit marks locally administered (1) vs globally unique (0). Vendors ship globally unique unicast addresses — the generator flags any deviation." },
    { question: "Can I use these addresses?", answer: "Random addresses are safe for testing, lab networks, and privacy (MAC randomization), but never spoof another device's address on a real network — it can disrupt operations and violate policies." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "MAC Address Generator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">MAC Address Generator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Vendor Prefix (OUI)</label>
                <select value={vendor} onChange={e => setVendor(e.target.value)} className={sel}>
                  {Object.entries(VENDORS).map(([k, v]) => <option key={k} value={k}>{v.label}{v.oui ? ` (${v.oui})` : ""}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={lbl}>Number of Addresses (1-20)</label>
                <div className={inp}><input type="number" value={count} onChange={e => setCount(e.target.value)} className={ci} /></div>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Generated MAC Addresses</div>
                <div className="text-3xl font-extrabold tracking-tight break-all">{result.macs[0].mac}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.macs.length} addresses · {VENDORS[result.vendor].label}{VENDORS[result.vendor].oui ? ` (${VENDORS[result.vendor].oui})` : " — random OUI"}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Generated`, `${result.count}`], ["Unicast", `${result.macs.filter((m) => !m.multicast).length}`], ["Locally Administered", `${result.macs.filter((m) => m.local).length}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Generated List</h3>
                <table className="w-full text-base"><tbody>
                  {result.macs.map((m, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2 text-muted-foreground">#{i + 1}</td>
                      <td className="py-2 font-mono font-semibold">{m.mac}</td>
                      <td className="py-2 text-right text-muted-foreground text-sm">{m.multicast ? "Multicast" : "Unicast"}{m.local ? " · Local" : " · Global"}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Last-Hex-Digit Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.digitData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="digit" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip formatter={(v: number) => [`${v} address(es)`, ""]} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {result.digitData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Random last bytes should spread evenly across hex digits</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold break-all text-right">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Anatomy of a MAC Address</h2>
            <p>This <strong>MAC address generator</strong> builds 48-bit addresses as six hex octets. With a vendor OUI selected, the first three octets identify the manufacturer and only the last three are randomized; the random mode draws all six.</p>
            <h2 className="text-2xl font-bold mb-3">Flag Bits</h2>
            <p>The first byte's two least-significant bits carry meaning: bit 0 marks multicast versus unicast, bit 1 marks locally administered versus globally unique. Vendor-assigned addresses are globally unique unicast — the generator reports any deviation.</p>
            <h2 className="text-2xl font-bold mb-3">Using Generated Addresses</h2>
            <p>Randomized MACs serve network testing, lab topologies, and privacy (as in phone MAC randomization). The last-digit distribution chart doubles as a quick randomness sanity check — uniform spread is expected from genuine random bytes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mac-address-generator" />
          <PopularCalculators exclude="/calculator/mac-address-generator" />
        </div>
      </div>
    </>
  );
}
