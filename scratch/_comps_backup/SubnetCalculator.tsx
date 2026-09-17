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
  network: string;
  netmask: string;
  wildcard: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  usableHosts: number;
  totalAddresses: number;
  isPrivate: boolean;
  ipClass: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

function intToIp(v: number): string {
  return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255].join(".");
}

function calcSubnet(ip: string, prefix: number): SubnetResult {
  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & mask) >>> 0;
  const broadcastInt = (networkInt | (~mask >>> 0)) >>> 0;
  const usableHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.max(0, broadcastInt - networkInt - 1);
  const totalAddresses = 2 ** (32 - prefix);
  const wildcard = (~mask >>> 0);
  const firstHost = prefix >= 31 ? networkInt : networkInt + 1;
  const lastHost = prefix >= 31 ? broadcastInt : broadcastInt - 1;

  const firstOctet = ipInt >>> 24;
  const ipClass = firstOctet < 128 ? "A" : firstOctet < 192 ? "B" : firstOctet < 224 ? "C" : firstOctet < 240 ? "D" : "E";
  const privateRanges: [number, number][] = [[0x0a000000, 0x0affffff], [0xac100000, 0xac1fffff], [0xc0a80000, 0xc0a8ffff]];
  const isPrivate = privateRanges.some(([lo, hi]) => networkInt >= lo && networkInt <= hi);

  const breakdown = [
    { label: "IP Address", value: ip },
    { label: "CIDR Prefix", value: `/${prefix}` },
    { label: "Subnet Mask", value: intToIp(mask) },
    { label: "Wildcard Mask", value: intToIp(wildcard) },
    { label: "Network Address", value: intToIp(networkInt) },
    { label: "First Usable Host", value: prefix >= 31 ? "—" : intToIp(firstHost) },
    { label: "Last Usable Host", value: prefix >= 31 ? "—" : intToIp(lastHost) },
    { label: "Broadcast Address", value: prefix >= 31 ? "—" : intToIp(broadcastInt) },
  ];
  const summaryStats = [
    { label: "Usable Hosts", value: `${usableHosts.toLocaleString("en-US")}` },
    { label: "Total Addresses", value: `${totalAddresses.toLocaleString("en-US")}` },
    { label: "Subnet Mask", value: intToIp(mask) },
    { label: "Network", value: intToIp(networkInt) },
    { label: "Broadcast", value: prefix >= 31 ? "—" : intToIp(broadcastInt) },
    { label: "IP Class", value: ipClass },
    { label: "Address Type", value: isPrivate ? "Private (RFC 1918)" : "Public" },
    { label: "Wildcard Mask", value: intToIp(wildcard) },
  ];
  const chartData = [
    { name: "Usable Hosts", value: usableHosts, fill: "hsl(var(--primary))" },
    { name: "Network + Broadcast", value: prefix >= 31 ? 0 : 2, fill: "#f59e0b" },
  ];
  return { ip, prefix, network: intToIp(networkInt), netmask: intToIp(mask), wildcard: intToIp(wildcard), broadcast: prefix >= 31 ? "—" : intToIp(broadcastInt), firstHost: prefix >= 31 ? "—" : intToIp(firstHost), lastHost: prefix >= 31 ? "—" : intToIp(lastHost), usableHosts, totalAddresses, isPrivate, ipClass, breakdown, summaryStats, chartData };
}

const DEFAULTS = { ip: "192.168.1.0", prefix: "24" };

export default function SubnetCalculator() {
  const [ip, setIp] = useState(DEFAULTS.ip);
  const [prefix, setPrefix] = useState(DEFAULTS.prefix);
  const [result, setResult] = useState<SubnetResult | null>(null);

  const p = parseInt(prefix, 10);
  const octets = ip.split(".").map((o) => parseInt(o, 10));
  const errs: string[] = [];
  if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255)) errs.push("Enter a valid IPv4 address like 192.168.1.0.");
  if (isNaN(p) || p < 0 || p > 32) errs.push("Prefix length must be between 0 and 32.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcSubnet(ip, p)); };
  const reset = () => {
    setIp(DEFAULTS.ip); setPrefix(DEFAULTS.prefix);
    setResult(calcSubnet("192.168.1.0", 24));
  };
  useEffect(() => { setResult(calcSubnet("192.168.1.0", 24)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is CIDR notation?", answer: "CIDR (Classless Inter-Domain Routing) notation writes an IP followed by a slash and the prefix length, e.g. 192.168.1.0/24. The prefix length is the number of leading 1-bits in the subnet mask, which determines how many addresses the network contains." },
    { question: "How many usable hosts are in a subnet?", answer: "Total addresses equal 2^(32 − prefix). In IPv4, the network address and broadcast address are reserved, so usable hosts are total minus 2 — except /31 and /32 point-to-point links, where all addresses are usable." },
    { question: "What is the difference between a subnet mask and wildcard mask?", answer: "The subnet mask marks which bits identify the network (1s) versus the host (0s). The wildcard mask is its inverse — used by ACLs and routing protocols to match a range of addresses." },
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
                <div className={inp}><input type="text" value={ip} onChange={e => setIp(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Prefix Length (/24)</label>
                <div className={inp}><input type="number" value={prefix} onChange={e => setPrefix(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">/</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Usable Host Addresses</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.usableHosts.toLocaleString("en-US")}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.network}/{result.prefix} · {result.totalAddresses.toLocaleString("en-US")} total addresses</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Network`, result.network], ["Broadcast", result.broadcast], ["Subnet Mask", result.netmask]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-sm font-bold break-all">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Subnet Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 7 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 7 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Address Allocation</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v.toLocaleString("en-US"), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Usable hosts vs reserved network/broadcast addresses</p>
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
            <h2 className="text-2xl font-bold mb-3">How Subnetting Works</h2>
            <p>This <strong>IP subnet calculator</strong> takes an IPv4 address and a CIDR prefix, builds the subnet mask, and derives the network address, broadcast address, and usable host range. The host bits of the address are zeroed to find the network; the broadcast fills them with ones.</p>
            <h2 className="text-2xl font-bold mb-3">Hosts and Prefix Lengths</h2>
            <p>Each step shorter in the prefix doubles the address count. A /24 holds 256 addresses with 254 usable hosts; a /16 holds 65,536. Point-to-point links commonly use /30 or /31, wasting nothing.</p>
            <h2 className="text-2xl font-bold mb-3">Private vs Public</h2>
            <p>RFC 1918 reserves 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 for private networks that never route on the public internet. The calculator flags whether your network falls in one of these ranges.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/subnet-calculator" />
          <PopularCalculators exclude="/calculator/subnet-calculator" />
        </div>
      </div>
    </>
  );
}
