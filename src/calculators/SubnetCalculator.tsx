"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Globe, Network, Server, Info } from "lucide-react";

const SubnetCalculator = () => {
  const [ipAddress, setIpAddress] = useState("192.168.1.1");
  const [subnetMask, setSubnetMask] = useState("24");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    try {
      const parts = ipAddress.split(".").map(p => parseInt(p));
      if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
        throw new Error("Invalid IP");
      }

      const mask = parseInt(subnetMask);
      if (isNaN(mask) || mask < 0 || mask > 32) {
        throw new Error("Invalid Mask");
      }

      const ipNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
      const maskNum = mask === 0 ? 0 : (0xFFFFFFFF << (32 - mask)) >>> 0;
      
      const networkNum = (ipNum & maskNum) >>> 0;
      const broadcastNum = (networkNum | ~maskNum) >>> 0;

      const numHosts = Math.pow(2, 32 - mask);
      const usableHosts = mask >= 31 ? 0 : numHosts - 2;

      const numToIp = (num: number) => [
        (num >>> 24) & 0xFF,
        (num >>> 16) & 0xFF,
        (num >>> 8) & 0xFF,
        num & 0xFF
      ].join(".");

      const maskIp = numToIp(maskNum);
      const networkIp = numToIp(networkNum);
      const broadcastIp = numToIp(broadcastNum);
      const firstHost = numToIp(networkNum + 1);
      const lastHost = numToIp(broadcastNum - 1);

      setResults({
        networkIp,
        broadcastIp,
        maskIp,
        hostRange: mask >= 31 ? "N/A" : `${firstHost} - ${lastHost}`,
        totalHosts: numHosts.toLocaleString(),
        usableHosts: usableHosts < 0 ? 0 : usableHosts.toLocaleString(),
        binaryMask: (maskNum >>> 0).toString(2).padStart(32, '0').match(/.{8}/g)?.join(".")
      });
    } catch (e) {
      alert("Please enter a valid IPv4 address and subnet mask.");
    }
  };

  const reset = () => {
    setShowResults(false);
    setIpAddress("192.168.1.1"); setSubnetMask("24");
    setResults(null);
  };

  const faqs = [
    { question: "What is an IP Subnet?", answer: "A subnet (short for subnetwork) is a logical subdivision of an IP network. Subnetting allows a large network to be divided into smaller, more manageable segments, improving performance and security." },
    { question: "How does the Subnet Mask work?", answer: "The subnet mask is a 32-bit number that hides (masks) the network part of an IP address, leaving only the host part exposed. It determines which bits of the IP address belong to the network and which belong to the device." },
    { question: "What are 'Usable Hosts'?", answer: "In a standard subnet, two addresses are reserved: the Network Address (all host bits 0) and the Broadcast Address (all host bits 1). Usable hosts are all the addresses in between." }
  ];

  const maskOptions = Array.from({ length: 33 }, (_, i) => ({
    label: `/${i} (${[
      (0xFFFFFFFF << (32 - i) >>> 24) & 0xFF,
      (0xFFFFFFFF << (32 - i) >>> 16) & 0xFF,
      (0xFFFFFFFF << (32 - i) >>> 8) & 0xFF,
      (0xFFFFFFFF << (32 - i)) & 0xFF
    ].join(".")})`,
    value: i.toString()
  }));

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Subnet Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">IP Subnet Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="ip" label="IP Address" value={ipAddress} onChange={setIpAddress} placeholder="e.g. 192.168.1.1" />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Subnet Mask</label>
                  <select value={subnetMask} onChange={(e) => setSubnetMask(e.target.value)} className="input-calc">
                    {maskOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Network Details</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Network Address</p>
                    <p className="text-3xl font-black text-foreground">{results.networkIp}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Broadcast Address</p>
                    <p className="text-3xl font-black text-foreground">{results.broadcastIp}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <ResultDisplay items={[
                    { label: "Usable Host Range", value: 0, textValue: results.hostRange },
                    { label: "Total Hosts", value: 0, textValue: results.totalHosts },
                    { label: "Usable Hosts", value: 0, textValue: results.usableHosts },
                    { label: "Subnet Mask", value: 0, textValue: results.maskIp },
                  ]} />
                  <div className="p-4 rounded-xl bg-secondary/10 border border-border/50 font-mono text-xs overflow-x-auto">
                    <span className="text-muted-foreground mr-4">Binary Mask:</span>
                    <span className="text-foreground">{results.binaryMask}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Understanding Subnetting</h2>
              <p>In the early days of the Internet, IP addresses were assigned in large blocks called "classes" (Class A, B, and C). This was extremely wasteful, as many organizations received far more addresses than they needed. Subnetting was developed to allow for much more precise allocation of IP address space.</p>
              <h3>CIDR Notation</h3>
              <p>The slash notation (e.g., /24) is known as CIDR (Classless Inter-Domain Routing). It tells you how many bits of the 32-bit IP address are dedicated to the network prefix. A /24 mask means the first 24 bits are for the network, leaving 8 bits (2^8 = 256 addresses) for local hosts.</p>
              <h3>The Role of the Gateway</h3>
              <p>For a device on one subnet to communicate with a device on another, it must send its traffic through a "Default Gateway" (usually a router). The subnet mask allows the device to determine if a destination IP is "local" or if it needs to be sent to the gateway.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/subnet" />
          <PopularCalculators exclude="/calculator/subnet-calculator" />
        </div>
      </div>
    </>
  );
};

export default SubnetCalculator;

