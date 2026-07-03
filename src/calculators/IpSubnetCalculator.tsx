"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Network } from "lucide-react";

interface SubnetResult {
  ipAddress: string;
  subnetMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  wildcardMask: string;
  binaryIp: string;
  binaryMask: string;
  isError: boolean;
  errorMsg?: string;
}

const numToIP = (num: number) => {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join(".");
};

const ipToNum = (ip: string) => {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

const calculateSubnet = (
  ipInput: string,
  cidrStr: string
): SubnetResult | null => {
  // Validate IP
  const ipParts = ipInput.split(".");
  if (ipParts.length !== 4) return null;
  for (let part of ipParts) {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
  }

  const cidr = parseInt(cidrStr, 10);
  if (isNaN(cidr) || cidr < 0 || cidr > 32) return null;

  try {
    const ipNum = ipToNum(ipInput);
    
    // Create subnet mask numeric
    const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardNum = (~maskNum) >>> 0;

    const networkNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (networkNum | wildcardNum) >>> 0;

    const totalHosts = cidr === 32 ? 1 : Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? 0 : totalHosts - 2;

    const firstHostNum = usableHosts > 0 ? (networkNum + 1) >>> 0 : 0;
    const lastHostNum = usableHosts > 0 ? (broadcastNum - 1) >>> 0 : 0;

    // Binary strings
    const toBin = (num: number) => {
      const b = num.toString(2).padStart(32, "0");
      return `${b.slice(0,8)}.${b.slice(8,16)}.${b.slice(16,24)}.${b.slice(24,32)}`;
    };

    return {
      ipAddress: ipInput,
      subnetMask: numToIP(maskNum),
      networkAddress: numToIP(networkNum),
      broadcastAddress: numToIP(broadcastNum),
      firstHost: usableHosts > 0 ? numToIP(firstHostNum) : "N/A",
      lastHost: usableHosts > 0 ? numToIP(lastHostNum) : "N/A",
      totalHosts,
      usableHosts,
      wildcardMask: numToIP(wildcardNum),
      binaryIp: toBin(ipNum),
      binaryMask: toBin(maskNum),
      isError: false
    };

  } catch (err) {
    return { ipAddress: "", subnetMask: "", networkAddress: "", broadcastAddress: "", firstHost: "", lastHost: "", totalHosts: 0, usableHosts: 0, wildcardMask: "", binaryIp: "", binaryMask: "", isError: true, errorMsg: "Invalid IP address format." };
  }
};

const IpSubnetCalculator = () => {
  const [ip, setIp] = useState("192.168.1.100");
  const [cidr, setCidr] = useState("24");

  const [result, setResult] = useState<SubnetResult | null>(null);

  const calculate = () => {
    setResult(calculateSubnet(ip, cidr));
  };

  useEffect(() => { calculate(); }, [ip, cidr]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground font-mono";

  const faqs = [
    { question: "What is a Subnet Mask?", answer: "A subnet mask is a 32-bit number that masks an IP address, dividing the IP address into a Network Address and a Host Address. It tells network routers exactly how large your local network is so they know whether to route traffic internally or send it out to the internet." },
    { question: "Why do we subtract 2 from total hosts?", answer: "In any standard subnet, the very first address is reserved as the 'Network Identifier' and the very last address is reserved as the 'Broadcast Address' (used to send messages to all devices at once). Therefore, if a /24 subnet has 256 total IP addresses, you can only physically assign 254 of them to computers or devices." },
    { question: "What does /24 mean (CIDR)?", answer: "CIDR (Classless Inter-Domain Routing) notation is a shorthand way of writing a subnet mask. /24 simply means that the first 24 bits of the 32-bit subnet mask are turned ON (1s). This correlates to the standard subnet mask 255.255.255.0." },
    { question: "What is a Wildcard Mask?", answer: "A wildcard mask is the exact inverse of a subnet mask (all 1s become 0s, and all 0s become 1s). It is heavily used in advanced networking equipment like Cisco routers and firewalls to quickly define Access Control Lists (ACLs) and routing protocols like OSPF." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "IP Subnet Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">IP Subnet Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">IPv4 Address</label>
              <div className={wrap}><input type="text" value={ip} onChange={e => setIp(e.target.value)} className={ci} placeholder="e.g. 192.168.1.100" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Subnet Mask (CIDR)</label>
              <div className={wrap}>
                <span className="pl-3 text-muted-foreground font-bold">/</span>
                <input type="number" value={cidr} onChange={e => setCidr(e.target.value)} className={ci} min="0" max="32" />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Invalid IP Address</div>
                  <div className="text-base font-medium text-foreground">Please enter a valid IPv4 address (e.g. 192.168.1.100) and a CIDR between 0 and 32.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-6">
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Usable Hosts</div>
                  <div className="text-5xl font-extrabold text-foreground tracking-tight font-mono">{result.usableHosts.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground font-bold mt-1 uppercase">Total IPs: {result.totalHosts.toLocaleString()}</div>
                </div>

                <div className="bg-sky-500/10 border-l-4 border-sky-500 rounded-lg p-6">
                  <div className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-1 uppercase tracking-wider">Subnet Mask</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-mono mt-2">{result.subnetMask}</div>
                  <div className="text-xs text-muted-foreground font-bold mt-2 uppercase">Wildcard: {result.wildcardMask}</div>
                </div>
              </div>

              <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden mt-2">
                <div className="bg-secondary/50 p-4 border-b border-border/50">
                  <h3 className="font-bold text-foreground">Subnet Layout Details</h3>
                </div>
                <div className="divide-y divide-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 p-4 items-center">
                    <div className="text-sm font-bold text-foreground mb-1 md:mb-0">Network Address</div>
                    <div className="text-base md:text-right font-mono text-muted-foreground">{result.networkAddress}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 p-4 items-center">
                    <div className="text-sm font-bold text-foreground mb-1 md:mb-0">First Usable IP</div>
                    <div className="text-base md:text-right font-mono text-primary font-bold">{result.firstHost}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 p-4 items-center">
                    <div className="text-sm font-bold text-foreground mb-1 md:mb-0">Last Usable IP</div>
                    <div className="text-base md:text-right font-mono text-primary font-bold">{result.lastHost}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 p-4 items-center">
                    <div className="text-sm font-bold text-foreground mb-1 md:mb-0">Broadcast Address</div>
                    <div className="text-base md:text-right font-mono text-muted-foreground">{result.broadcastAddress}</div>
                  </div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Binary Representation</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">IP Address</div>
                    <div className="p-3 bg-secondary/30 rounded border border-border/50 font-mono text-xs md:text-sm text-center break-all tracking-wider text-foreground">
                      {result.binaryIp}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Subnet Mask</div>
                    <div className="p-3 bg-secondary/30 rounded border border-border/50 font-mono text-xs md:text-sm text-center break-all tracking-wider text-primary">
                      {result.binaryMask}
                    </div>
                  </div>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding IPv4 Subnetting</h2>
            <p>At its core, a computer network is like a city postal system. The IP address is the exact street address of a house, but the post office needs to know which city the house is in. A <strong>Subnet Mask</strong> acts as the dividing line, cutting an IP address into two distinct parts: the Network (the city) and the Host (the specific house).</p>

            <h2>Why We Use CIDR Notation</h2>
            <p>Writing out subnet masks like <code>255.255.255.0</code> is tedious. Network engineers use <strong>CIDR (Classless Inter-Domain Routing)</strong> shorthand. Because an IPv4 address is mathematically just 32 bits of binary (1s and 0s), a subnet mask simply turns on the first sequence of bits to "mask" the network.</p>
            <p>If you see an IP address written as <code>192.168.1.100 /24</code>, the <code>/24</code> means that the first 24 bits of the subnet mask are 1s. If you convert 24 1s into decimal format, you get exactly 255.255.255.0. This tells the router that the first three blocks (192.168.1) belong to the Network, leaving the final 8 bits (the last block) available for Hosts (devices).</p>

            <h2>The -2 Host Rule</h2>
            <p>If you allocate 8 bits for host addresses, binary math dictates you have 256 total combinations (2^8 = 256). However, you can never assign 256 devices to this network. Why? Because the IPv4 protocol permanently reserves two specific addresses in every single subnet:</p>
            <ul>
              <li><strong>The Network Address:</strong> The very first address in the block (e.g., .0) is used to mathematically identify the entire network itself. It cannot be assigned to a computer.</li>
              <li><strong>The Broadcast Address:</strong> The very last address in the block (e.g., .255) is reserved. If a router sends a data packet to the broadcast address, it acts as a loudspeaker, sending the packet to every single device on the network simultaneously.</li>
            </ul>
            <p>Therefore, a standard /24 home network has 256 total IPs, but only 254 <em>usable</em> IPs.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ip-subnet-calculator" />
          <PopularCalculators exclude="/calculator/ip-subnet-calculator" />
        </div>
      </div>
    </>
  );
};
export default IpSubnetCalculator;
