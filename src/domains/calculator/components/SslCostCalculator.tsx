"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, ShieldCheck, Lock, Globe, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SslCostCalculator() {
  const [numDomains, setNumDomains] = useState("1");
  const [sslType, setSslType] = useState("dv");
  const [years, setYears] = useState("1");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    annualCost: 0,
    totalCost: 0,
    typeLabel: "",
    warrantyLevel: "",
    trustLevel: "",
  });

  const handleCalculate = () => {
    const domains = parseInt(numDomains) || 1;
    const duration = parseInt(years) || 1;

    let basePrice = 0;
    let typeLabel = "";
    let warrantyLevel = "";
    let trustLevel = "";

    switch (sslType) {
      case "dv":
        basePrice = 15;
        typeLabel = "Domain Validated (DV)";
        warrantyLevel = "$10,000";
        trustLevel = "Standard (Encryption Only)";
        break;
      case "ov":
        basePrice = 90;
        typeLabel = "Organization Validated (OV)";
        warrantyLevel = "$50,000";
        trustLevel = "High (Verified Business)";
        break;
      case "ev":
        basePrice = 250;
        typeLabel = "Extended Validation (EV)";
        warrantyLevel = "$1,000,000+";
        trustLevel = "Premium (Maximum Trust)";
        break;
      case "wildcard":
        basePrice = 120;
        typeLabel = "Wildcard SSL (*.domain.com)";
        warrantyLevel = "$125,000";
        trustLevel = "Standard (Multi-subdomain)";
        break;
      case "multi":
        basePrice = 50 + (domains * 25);
        typeLabel = "Multi-Domain (SAN)";
        warrantyLevel = "$500,000";
        trustLevel = "Flexible";
        break;
    }

    const annualCost = basePrice;
    const totalCost = annualCost * duration;

    setResults({
      annualCost,
      totalCost,
      typeLabel,
      warrantyLevel,
      trustLevel,
    });
    setShowResults(true);
  };

  const reset = () => {
    setNumDomains("1");
    setSslType("dv");
    setYears("1");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is the difference between DV, OV, and EV SSL?", answer: "DV (Domain Validated) only verifies domain ownership. OV (Organization Validated) verifies the company exists. EV (Extended Validation) is the most rigorous, verifying legal identity and physical location. All three provide the same level of technical encryption, but different levels of user trust." },
    { question: "Can I get an SSL certificate for free?", answer: "Yes, Let's Encrypt provides free DV SSL certificates. However, they must be renewed every 90 days and do not offer warranties, business validation (OV/EV), or wildcard support on all platforms." },
    { question: "What is a Wildcard SSL certificate?", answer: "A Wildcard SSL certificate covers your main domain and an unlimited number of its subdomains (e.g., mail.example.com, blog.example.com, shop.example.com) under a single certificate." },
    { question: "How long can an SSL certificate last?", answer: "As of 2020, major browsers like Chrome and Safari only trust SSL certificates with a lifespan of 398 days (about 13 months). While you can prepay for multiple years to get a discount, you must re-issue the certificate annually." },
    { question: "What does the SSL warranty cover?", answer: "An SSL warranty protects your site visitors. If a visitor loses money due to a fraudulent transaction on your site caused by a flaw in the SSL certificate, the Certificate Authority (CA) will compensate the visitor up to the warranty amount." },
    { question: "Do I need SSL for SEO?", answer: "Yes. Since 2014, Google has used HTTPS as a ranking signal. Sites without SSL may be marked as 'Not Secure' in browsers, which significantly increases bounce rates and reduces search visibility." },
    { question: "What is a SAN certificate?", answer: "A SAN (Subject Alternative Name) certificate, also known as a Multi-Domain certificate, allows you to secure multiple completely different domain names (e.g., example.com, mysite.net, and store.io) with one certificate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "SSL Certificate Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">SSL Certificate Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Certificate Type</label>
                  <select 
                    value={sslType} 
                    onChange={(e) => setSslType(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="dv">Domain Validated (DV)</option>
                    <option value="ov">Organization Validated (OV)</option>
                    <option value="ev">Extended Validation (EV)</option>
                    <option value="wildcard">Wildcard SSL (*.domain.com)</option>
                    <option value="multi">Multi-Domain (SAN)</option>
                  </select>
                </div>
                <InputField id="years" label="Duration (Years)" value={years} onChange={setYears} tooltip="Pre-paying for multiple years often provides a discount." />
                {sslType === "multi" && (
                  <InputField id="domains" label="Number of Domains" value={numDomains} onChange={setNumDomains} tooltip="How many unique domains do you need to secure?" />
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-2xl font-bold mb-3">Cost & Protection Summary</h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Total Budget ({years} Years)</p>
                    <p className="text-4xl font-black text-foreground">${results.totalCost.toLocaleString()}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Annual Average</p>
                    <p className="text-2xl font-black text-foreground">${results.annualCost.toLocaleString()}/yr</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Validation Level", value: 0, textValue: results.typeLabel },
                  { label: "Relying Party Warranty", value: 0, textValue: results.warrantyLevel },
                  { label: "Trust Indicator", value: 0, textValue: results.trustLevel, highlight: true },
                ]} />
                <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800">Note: Browser standards require certificates to be re-issued every 13 months, even if you pay for multiple years upfront.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Why Your Website Needs an SSL Certificate</h2>
              <p>SSL (Secure Sockets Layer) is the standard technology for keeping an internet connection secure and safeguarding any sensitive data that is being sent between two systems. It prevents criminals from reading and modifying any information transferred, including potential personal details like credit card numbers or login credentials. Today, SSL is not just a luxury; it is a fundamental requirement for any professional website.</p>

              <h3>Technical Security vs. Visual Trust</h3>
              <p>From a purely technical standpoint, a free $0 SSL certificate from Let's Encrypt provides the exact same 256-bit encryption as a $500 Enterprise EV certificate. The difference lies in <strong>identity verification</strong> and <strong>visual trust indicators</strong>. High-value websites (e-commerce, banking, healthcare) pay for expensive certificates because they want a Certificate Authority to manually verify their business identity, which provides a higher level of legal assurance to their customers.</p>

              <h3>Understanding SSL Categories</h3>
              <ul>
                <li><strong>Domain Validated (DV):</strong> The quickest and cheapest. Verification is done via email or DNS. Ideal for blogs and small personal sites.</li>
                <li><strong>Organization Validated (OV):</strong> The CA checks the legal existence of the organization. Your company name is listed in the certificate details. Ideal for business sites.</li>
                <li><strong>Extended Validation (EV):</strong> The 'gold standard.' Requires extensive legal and physical verification. Provides the highest level of warranty and consumer protection.</li>
                <li><strong>Wildcard SSL:</strong> A cost-effective way to secure one domain and all its subdomains. If you have many subdomains, this is much cheaper than buying individual certs.</li>
              </ul>

              <h3>The Importance of the SSL Warranty</h3>
              <p>One of the most misunderstood parts of paid SSL certificates is the <strong>warranty</strong>. If a Certificate Authority improperly issues a certificate to a hacker who then uses it to spoof your site and steal money from a customer, the CA's insurance will cover the customer's loss up to the warranty limit. Free certificates come with $0 warranty, while high-end certs offer up to $1.75 million in protection.</p>

              <h3>Impact on SEO and User Experience</h3>
              <p>Google has officially stated that HTTPS is a ranking signal. Beyond SEO, browsers like Chrome and Firefox now display 'Not Secure' warnings for any page served over HTTP. Studies show that up to 85% of users will abandon a website if they see a 'Not Secure' warning, especially if the site asks for any form of data input. Investing in a stable, trusted SSL certificate is a direct investment in your conversion rate and brand reputation.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ssl-certificate-cost-calculator" />
          <PopularCalculators exclude="/calculator/ssl-certificate-cost-calculator" />
        </div>
      </div>
    </>
  );
}
