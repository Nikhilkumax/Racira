"use client";
import { RotateCcw, ShieldCheck, Check, Copy } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
const HashCalculator = () => {
  const [inputText, setInputText] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const algorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

  useEffect(() => {
    const generateHash = async () => {
      if (!inputText) {
        setHash("");
        return;
      }

      try {
        const msgUint8 = new TextEncoder().encode(inputText);
        const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setHash(hashHex);
      } catch (err) {
        console.error("Hashing failed:", err);
        setHash("Error generating hash");
      }
    };

    generateHash();
  }, [inputText, algorithm]);

  const handleCopy = () => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    { question: "What is a cryptographic hash?", answer: "A hash is a unique digital fingerprint of a piece of data. It's a one-way function, meaning you can easily generate a hash from text, but you cannot realistically reverse the process to get the original text back from the hash." },
    { question: "Which algorithm should I use?", answer: "For most security purposes, SHA-256 or SHA-512 are recommended. SHA-1 is now considered cryptographically broken and should only be used for legacy compatibility or non-security checksums." },
    { question: "Is this safe to use?", answer: "Yes. This calculator runs entirely in your browser using the Web Crypto API. Your input text is never sent to any server, ensuring your data remains private." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Hash Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hash Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Input Text</label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="input-calc min-h-[120px] resize-y py-3"
                    placeholder="Enter text to hash..."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Algorithm</label>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      className="input-calc"
                    >
                      {algorithms.map((alg) => (
                        <option key={alg} value={alg}>{alg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setInputText("")}
                      className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" /> Clear Input
                    </button>
                  </div>
                </div>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {hash && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Generated Hash
                  </h2>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    {copied ? (
                      <><Check className="h-4 w-4" /> Copied!</>
                    ) : (
                      <><Copy className="h-4 w-4" /> Copy Hash</>
                    )}
                  </button>
                </div>
                
                <div className="p-4 rounded-xl bg-secondary/50 border border-border break-all font-mono text-sm leading-relaxed text-foreground select-all">
                  {hash}
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Length</p>
                      <p className="font-bold">{hash.length * 4} bits</p>
                   </div>
                   <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Chars</p>
                      <p className="font-bold">{hash.length}</p>
                   </div>
                   <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Format</p>
                      <p className="font-bold">Hex</p>
                   </div>
                   <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Security</p>
                      <p className={`font-bold ${algorithm === 'SHA-1' ? 'text-orange-600' : 'text-green-600'}`}>
                        {algorithm === 'SHA-1' ? 'Low' : 'High'}
                      </p>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Understanding Cryptographic Hashes</h2>
              <p>A hash function takes an input of any size and produces a fixed-size string of characters. This output, known as a hash or checksum, is consistent: the same input will always produce the same hash.</p>
              
              <h3>Common Use Cases</h3>
              <ul>
                <li><strong>Data Integrity:</strong> Verifying that a file has not been altered during download by comparing its hash.</li>
                <li><strong>Password Storage:</strong> Storing hashes of passwords rather than the passwords themselves, so that if a database is leaked, the original passwords are not immediately visible.</li>
                <li><strong>Digital Signatures:</strong> Authenticating the sender of a message.</li>
                <li><strong>Blockchain:</strong> Linking blocks of data together securely.</li>
              </ul>

              <h3>Popular Hashing Algorithms</h3>
              <p><strong>SHA-256:</strong> Part of the SHA-2 family, it produces a 256-bit (64 character) hash. It is the most widely used algorithm today and is considered highly secure.</p>
              <p><strong>SHA-512:</strong> Similar to SHA-256 but produces a 512-bit hash. It is even more secure but requires more computational power.</p>
              <p><strong>SHA-1:</strong> A legacy algorithm that is now considered vulnerable to collision attacks and should be avoided for security-critical applications.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hash-calculator" />
          <PopularCalculators exclude="/calculator/hash-calculator" />
        </div>
      </div>
    </>
  );
};

export default HashCalculator;

