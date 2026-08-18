"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SubnetResult {
  ip: string;
  prefix: number;
  ipInt: number;
  netmaskInt: number;
  networkInt: number;
  broadcastInt: number;
  network: string;
  netmask: string;
  wildcard: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  usableHosts: number;
  totalAddresses: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function ipToInt(ip: string): number | null {
  const parts = ip.trim().split(".").map(p => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(v: number): string {
  return `${(v >>> 24) & 255}.${(v >>> 16) & 255}.${(v >>> 8) & 255}.${v & 255}`;
}

function calcSubnet(ip: string, prefix: number): SubnetResult {
  const ipInt = ipToInt(ip)!;
  const netmaskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & netmaskInt) >>> 0;
  const broadcastInt = prefix === 32 ? networkInt : (networkInt | ((1 << (32 - prefix)) - 1)) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);
  const usableHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.max(0, totalAddresses - 2);

  const breakdown = [
    { label: "IP Address", value: ip },
    { label: "CIDR Prefix", value: `/${prefix}` },
    { label: "Subnet Mask", value: intToIp(netmaskInt) },
    { label: "Wildcard Mask", value: intToIp(~netmaskInt >>> 0) },
    { label: "Network Address", value: intToIp(networkInt) },
    { label: "Broadcast Address", value: intToIp(broadcastInt) },
    { label: "First Usable Host", value: intToIp(networkInt + 1) },
    { label: "Last Usable Host", value: intToIp(broadcastInt - 1) },
    { label: "Usable Hosts", value: `${usableHosts}` },
    { label: "Total Addresses", value: `${totalAddresses}` },
  ];
  const summaryStats = [
    { label: "Network", value: intToIp(networkInt) },
    { label: "Broadcast", value: intToIp(broadcastInt) },
    { label: "Netmask", value: intToIp(netmaskInt) },
    { label: "Usable Hosts", value: `${usableHosts}` },
    { label: "Total Addresses", value: `${totalAddresses}` },
    { label: "First Host", value: intToIp(networkInt + 1) },
    { label: "Last Host", value: intToIp(broadcastInt - 1) },
    { label: "Prefix", value: `/${prefix}` },
  ];
  const chartData = [
    { name: "Usable", value: Math.max(0, usableHosts), fill: "hsl(var(--primary))" },
    { name: "Reserved", value: Math.max(0, totalAddresses - usableHosts), fill: "#f59e0b" },
  ];
  return { ip, prefix, ipInt, netmaskInt, networkInt, broadcastInt, network: intToIp(networkInt), netmask: intToIp(netmaskInt), wildcard: intToIp(~netmaskInt >>> 0), broadcast: intToIp(broadcastInt), firstHost: intToIp(networkInt + 1), lastHost: intToIp(broadcastInt - 1), usableHosts, totalAddresses, breakdown, summaryStats, chartData };
}

const DEFAULTS = { ip: "192.168.1.0", prefix: "24" };

export default function IpSubnetCalculator() {
  const [ip, setIp] = useState(DEFAULTS.ip);
  const [prefix, setPrefix] = useState(DEFAULTS.prefix);
  const [result, setResult] = useState<SubnetResult | null>(null);

  const pf = parseInt(prefix) || 0;
  const errs: string[] = [];
  if (!ipToInt(ip)) errs.push("Enter a valid IPv4 address (e.g. 192.168.1.0).");
  if (pf < 0 || pf > 32) errs.push("CIDR prefix must be between 0 and 32.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcSubnet(ip, pf)); };
  const reset = () => {
    setIp(DEFAULTS.ip); setPrefix(DEFAULTS.prefix);
    setResult(calcSubnet("192.168.1.0", 24));
  };
  useEffect(() => { setResult(calcSubnet("192.168.1.0", 24)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How does CIDR notation work?", answer: "The /24 in 192.168.1.0/24 means the first 24 bits are the network — leaving 8 bits (256 addresses) for hosts. The subnet mask 255.255.255.0 encodes the same boundary." },
    { question: "Why are usable hosts two fewer?", answer: "The network address (all host bits zero) and the broadcast address (all host bits one) can't be assigned to devices. A /24 has 254 usable hosts out of 256 addresses." },
    { question: "What about /31 and /32?", answer: "Point-to-point links use /31 (2 usable addresses, RFC 3021) and loopbacks use /32 (1 address). The calculator handles these special cases." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "IP Subnet Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">IP Subnet Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>IP Address</label>
                <div className={inp}><input value={ip} onChange={e => setIp(e.target.value)} placeholder="e.g. 192.168.1.0" className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>CIDR Prefix</label>
                <select value={prefix} onChange={e => setPrefix(e.target.value)} className={sel}>
                  {Array.from({ length: 33 }, (_, i) => <option key={i} value={i}>/{i} ({i === 24 ? "255.255.255.0" : ""})</option>)}
                </select>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Usable Hosts</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.usableHosts}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.network} – {result.broadcast} · {result.netmask} · /{result.prefix}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Network`, result.network], ["Broadcast", result.broadcast], ["Netmask", result.netmask]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Subnet Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Address Space</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} addresses`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Usable vs reserved (network + broadcast) addresses</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Subnetting Works</h2>
            <p>This <strong>IP subnet calculator</strong> masks the address with the CIDR prefix to find the network, then derives the broadcast, host range, and counts. Every /24 in 192.168.1.0/24 shares the first 24 bits; the remaining 8 bits enumerate 256 addresses.</p>
            <h2 className="text-2xl font-bold mb-3">The Address Accounting</h2>
            <p>Total addresses double with each smaller prefix: /24 → 256, /23 → 512, /25 → 128. Two are always reserved for network and broadcast, except on /31 point-to-point links where both are usable.</p>
            <h2 className="text-2xl font-bold mb-3">Planning Subnets</h2>
            <p>Size the subnet to the device count plus headroom: a floor of 30 devices needs /27 (30 usable), not /24. Good planning prevents renumbering when the office grows.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ip-subnet-calculator" />
          <PopularCalculators exclude="/calculator/ip-subnet-calculator" />
        </div>
      </div>
    </>
  );
}
