"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PlResult {
  lossPct: number;
  receivedPct: number;
  sent: number;
  lost: number;
  received: number;
  effectiveMbps: number | null;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcPl(sent: number, lost: number, bandwidthMbps: number | null): PlResult {
  const received = Math.max(0, sent - lost);
  const lossPct = sent > 0 ? (lost / sent) * 100 : 0;
  const receivedPct = 100 - lossPct;
  const effectiveMbps = bandwidthMbps !== null ? bandwidthMbps * (1 - lossPct / 100) : null;
  const breakdown = [
    { label: "Packets Sent", value: `${sent.toLocaleString()}` },
    { label: "Packets Lost", value: `${lost.toLocaleString()}` },
    { label: "Packets Received", value: `${received.toLocaleString()}` },
    { label: "Packet Loss Rate", value: `${fmt(lossPct)}%` },
    { label: "Delivery Rate", value: `${fmt(receivedPct)}%` },
    ...(bandwidthMbps !== null ? [
      { label: "Link Bandwidth", value: `${fmt(bandwidthMbps)} Mbps` },
      { label: "Effective Throughput", value: `${fmt(effectiveMbps!)} Mbps` },
    ] : []),
  ];
  const summaryStats = [
    { label: "Loss Rate", value: `${fmt(lossPct)}%` },
    { label: "Delivery Rate", value: `${fmt(receivedPct)}%` },
    { label: "Lost Packets", value: `${lost.toLocaleString()}` },
    ...(bandwidthMbps !== null ? [{ label: "Effective Throughput", value: `${fmt(effectiveMbps!)} Mbps` }] : []),
  ];
  const chartData = [
    { name: "Received", value: received, fill: "hsl(var(--primary))" },
    { name: "Lost", value: lost, fill: "#ef4444" },
  ];
  return { lossPct, receivedPct, sent, lost, received, effectiveMbps, breakdown, summaryStats, chartData };
}

const DEFAULTS = { sent: "10000", lost: "250", bw: "100" };

export default function PacketLossCalculator() {
  const [sent, setSent] = useState(DEFAULTS.sent);
  const [lost, setLost] = useState(DEFAULTS.lost);
  const [bw, setBw] = useState(DEFAULTS.bw);
  const [result, setResult] = useState<PlResult | null>(null);

  const s = parseFloat(sent);
  const l = parseFloat(lost);
  const b = bw.trim() === "" ? null : parseFloat(bw);
  const errs: string[] = [];
  if (!s || s <= 0) errs.push("Packets sent must be greater than 0.");
  if (isNaN(l) || l < 0) errs.push("Packets lost must be 0 or greater.");
  if (l > s) errs.push("Lost packets cannot exceed packets sent.");
  if (b !== null && (!b || b <= 0)) errs.push("Bandwidth must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcPl(s, l, b)); };
  const reset = () => {
    setSent(DEFAULTS.sent); setLost(DEFAULTS.lost); setBw(DEFAULTS.bw);
    setResult(calcPl(10000, 250, 100));
  };
  useEffect(() => { setResult(calcPl(10000, 250, 100)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is packet loss?", answer: "The percentage of data packets that never reach their destination. A few drops are normal on congested networks; sustained loss above 2–3% causes visible problems — stuttering video calls, lagging games, and stalled downloads." },
    { question: "How is it measured?", answer: "Send a known number of packets (ping floods and network tools do this automatically) and count the ones that don't come back: loss % = lost ÷ sent × 100. The calculator also converts loss into effective throughput on your link." },
    { question: "What causes packet loss?", answer: "Congestion (routers dropping packets when buffers overflow), faulty cables, Wi-Fi interference, and ISP throttling. Testing at different times and over different paths helps isolate the cause." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Packet Loss Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Packet Loss Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Packets Sent</label>
                <input type="number" value={sent} onChange={e => setSent(e.target.value)} className={inp} placeholder="10000" />
              </div>
              <div>
                <label className={lbl}>Packets Lost</label>
                <input type="number" value={lost} onChange={e => setLost(e.target.value)} className={inp} placeholder="250" />
              </div>
              <div>
                <label className={lbl}>Bandwidth (Mbps) — optional</label>
                <input type="number" value={bw} onChange={e => setBw(e.target.value)} className={inp} placeholder="100" />
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
              <div className={`${result.lossPct <= 2 ? "bg-primary/10 border-l-4 border-primary" : result.lossPct <= 5 ? "bg-amber-500/10 border-l-4 border-amber-500" : "bg-destructive/10 border-l-4 border-destructive"} rounded-lg p-5`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.lossPct <= 2 ? "text-primary" : result.lossPct <= 5 ? "text-amber-600" : "text-destructive"}`}>Packet Loss Rate</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.lossPct)}%</div>
                <div className="text-sm text-muted-foreground mt-1">{result.lost.toLocaleString()} of {result.sent.toLocaleString()} packets lost · {fmt(result.receivedPct)}% delivered</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Received", `${result.received.toLocaleString()}`], ["Lost", `${result.lost.toLocaleString()}`], ["Delivery", `${fmt(result.receivedPct)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Delivered vs Lost</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [v.toLocaleString(), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Every lost packet is wasted bandwidth and retransmission cost</p>
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
            <h2 className="text-2xl font-bold mb-3">The Packets That Never Arrive</h2>
            <p>Networks deliver data in packets, and occasionally some simply vanish. This <strong>packet loss calculator</strong> turns sent-and-lost counts into the loss percentage — and shows what the loss does to your effective throughput.</p>
            <h2 className="text-2xl font-bold mb-3">The Calculation</h2>
            <p>Loss % = lost ÷ sent × 100. Below 2% is typical for healthy connections; above 5% breaks real-time applications. If you supply your link's bandwidth, the calculator applies the loss rate to estimate effective throughput — a 10% loss turns 100 Mbps into 90 Mbps.</p>
            <h2 className="text-2xl font-bold mb-3">Diagnosing the Drops</h2>
            <p>Run a prolonged ping (hundreds of packets, not a handful), test on wired vs Wi-Fi, and compare different destinations. Loss on one path but not another points to a specific hop; loss everywhere points to your own network or ISP.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/packet-loss-calculator" />
          <PopularCalculators exclude="/calculator/packet-loss-calculator" />
        </div>
      </div>
    </>
  );
}
