"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, ShieldAlert } from "lucide-react";

const PacketLossCalculator = () => {
  const [sent, setSent] = useState("1000");
  const [received, setReceived] = useState("995");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const s = parseInt(sent) || 0;
    const r = parseInt(received) || 0;

    if (s <= 0) return;

    const lost = Math.max(0, s - r);
    const lossPct = (lost / s) * 100;

    let grade = "Perfect";
    if (lossPct > 0 && lossPct <= 0.1) grade = "Excellent";
    else if (lossPct <= 1.0) grade = "Good";
    else if (lossPct <= 2.5) grade = "Acceptable";
    else if (lossPct <= 5.0) grade = "Poor";
    else grade = "Critical";

    setResults({
      lost,
      lossPct,
      successPct: 100 - lossPct,
      grade
    });
  };

  const reset = () => {
    setShowResults(false);
    setSent("1000"); setReceived("995");
    setResults(null);
  };

  const faqs = [
    { question: "What is packet loss?", answer: "Packet loss occurs when one or more packets of data traveling across a computer network fail to reach their destination. This is usually caused by network congestion, faulty hardware, or poor signal strength (especially on Wi-Fi or mobile)." },
    { question: "How much packet loss is 'normal'?", answer: "On a healthy wired connection, packet loss should be 0%. On Wi-Fi, 0.1% to 0.5% is common. Anything over 1% will start to affect performance in gaming and video calls." },
    { question: "How can I fix packet loss?", answer: "Try switching from Wi-Fi to a wired Ethernet cable, restarting your router, or checking for damaged cables. If the issue persists, it may be an issue with your ISP's infrastructure." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Packet Loss Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Packet Loss Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate the percentage of data lost during transmission and evaluate network health.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="sent" label="Packets Sent" value={sent} onChange={setSent} />
                <InputField id="received" label="Packets Received" value={received} onChange={setReceived} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <ShieldAlert className="h-5 w-5" /> Analyze Loss
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Transmission Health</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Packet Loss</p>
                    <p className="text-5xl font-black text-foreground">{results.lossPct.toFixed(2)}%</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center flex flex-col justify-center ${results.grade === "Perfect" || results.grade === "Excellent" ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-70">Network Grade</p>
                    <p className={`text-3xl font-black ${results.grade === "Perfect" || results.grade === "Excellent" ? "text-green-600" : "text-red-600"}`}>{results.grade}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Packets Lost", value: 0, textValue: results.lost.toLocaleString() },
                  { label: "Success Rate", value: 0, textValue: results.successPct.toFixed(2) + "%" },
                  { label: "VoIP Impact", value: 0, textValue: results.lossPct > 3 ? "Severe Glitching" : results.lossPct > 1 ? "Noticeable" : "Minimal" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Understanding Packet Loss</h2>
              <p>When you send data over the internet, it is broken down into small units called packets. If these packets don't arrive at their destination, the receiving computer must either ask for them to be resent (adding delay) or simply skip them (causing gaps in audio/video).</p>
              <h3>Why 1% Loss is a Big Deal</h3>
              <p>In many protocols like TCP, packet loss triggers a "congestion control" mechanism that drastically slows down your entire connection to prevent further loss. This is why even a small amount of packet loss can make a 1 Gbps connection feel like a dial-up modem.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/packet-loss" />
          <PopularCalculators exclude="/calculator/packet-loss-calculator" />
        </div>
      </div>
    </>
  );
};

export default PacketLossCalculator;

