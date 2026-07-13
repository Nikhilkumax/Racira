"use client";
import { RotateCcw, Check, Copy, Calculator } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showResults, setShowResults] = useState(true); // Default true for generators

  const handleCalculate = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    
    let chars = "";
    if (includeUpper) chars += upper;
    if (includeLower) chars += lower;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (chars === "") return;

    let generated = "";
    for (let i = 0; i < length; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setCopied(false);
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    let score = 0;
    if (length > 8) score++;
    if (length > 12) score++;
    if (includeUpper && includeLower) score++;
    if (includeNumbers) score++;
    if (includeSymbols) score++;
    
    if (score <= 2) return { label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const strength = getStrength();

  const faqs = [
    { question: "What makes a password strong?", answer: "A strong password is long (at least 12-16 characters) and uses a mix of uppercase letters, lowercase letters, numbers, and symbols. Most importantly, it should be unique to every account and not contain personal information like your name or birthday." },
    { question: "Why should I use a random password generator?", answer: "Human brains are bad at being random. We tend to use patterns or words that are vulnerable to 'dictionary attacks' or brute-force software. A random generator ensures every character is truly unpredictable." },
    { question: "Are symbols really necessary?", answer: "Yes. Adding symbols significantly increases the 'entropy' or complexity of the password, making it exponentially harder for hackers to crack using automated tools." }
  ];

  const reset = () => {
    setLength(16);
    setIncludeUpper(true);
    setIncludeLower(true);
    setIncludeNumbers(true);
    setIncludeSymbols(true);
    handleCalculate();
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Password Generator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Password Generator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Inputs Column */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
              <div className="flex justify-between mb-2 text-sm font-medium">
                <span>Password Length</span>
                <span>{length}</span>
              </div>
              <input 
                type="range" 
                min="6" 
                max="64" 
                value={length} 
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary/30 transition-colors">
                <input type="checkbox" checked={includeUpper} onChange={(e) => setIncludeUpper(e.target.checked)} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Uppercase (A-Z)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary/30 transition-colors">
                <input type="checkbox" checked={includeLower} onChange={(e) => setIncludeLower(e.target.checked)} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Lowercase (a-z)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary/30 transition-colors">
                <input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Numbers (0-9)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary/30 transition-colors">
                <input type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Symbols (!@#$)</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
            </div>
          </div>

          {/* Results/Display Column */}
          <div className="flex flex-col gap-3">
            <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
              <h2 className="text-2xl font-bold mb-3">Generated Password</h2>
              <div className="relative mb-4">
                <div className="w-full bg-secondary/50 rounded-xl border border-border p-6 pr-16 text-2xl font-mono break-all min-h-[80px] flex items-center text-foreground">
                  {password}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                  aria-label="Copy to clipboard"
                >
                  {copied ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6" />}
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Strength:</div>
                <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: strength.label === "Weak" ? "33%" : strength.label === "Medium" ? "66%" : "100%" }} />
                </div>
                <div className="text-sm font-bold">{strength.label}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Below fold components */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          
          <div className="mt-4 space-y-8 mb-10">
            <section>
              <h2 className="text-2xl font-bold mb-3">How the Password Generator Works</h2>
              <p className="text-muted-foreground mb-3">Our Password Generator uses a cryptographically secure randomization process to create truly unpredictable strings of characters. Simply select your desired length (from 6 to 64 characters) and toggle which character sets you want to include: uppercase, lowercase, numbers, or symbols.</p>
              <p className="text-muted-foreground mb-3">When you click Calculate, the tool pulls randomly from your selected pools to assemble a unique password. The 'Strength' meter provides real-time feedback based on the length and variety of characters used, helping you ensure your new password meets modern security standards.</p>
              <p className="text-muted-foreground">For maximum security, we recommend a minimum length of 16 characters including all four character types. You can easily copy your new password to your clipboard using the icon in the display box.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground mb-3">The <strong>Generated Password</strong> is displayed in the large, monospace box at the top. This font ensures that ambiguous characters (like a lowercase 'l' and uppercase 'I') are easily distinguishable to prevent entry errors.</p>
              <p className="text-muted-foreground mb-3">The <strong>Strength Meter</strong> categorizes your password as Weak, Medium, or Strong. This is calculated using 'entropy' logic—the more characters and variety you have, the higher the entropy, and the harder it is for automated 'brute-force' tools to guess your password.</p>
              <p className="text-muted-foreground">If you see a 'Weak' rating, we strongly suggest increasing the length or adding more character types before using the password for sensitive accounts like banking or email.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">Common Use Cases</h2>
              <p className="text-muted-foreground mb-3"><strong>New Account Creation:</strong> Use the generator whenever you sign up for a new service to ensure you aren't reusing old, potentially compromised passwords from other sites.</p>
              <p className="text-muted-foreground mb-3"><strong>Regular Security Audits:</strong> Cybersecurity experts recommend changing passwords for sensitive accounts every 3–6 months. Our tool makes it easy to rotate in fresh, high-strength passwords regularly.</p>
              <p className="text-muted-foreground"><strong>Internal Systems:</strong> Developers and IT administrators use random generators to create secure temporary passwords for users or default credentials for new server deployments.</p>
            </section>
          </div>

          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Strong Passwords Matter</h2>
            <p>In the age of frequent data breaches, your password is the first and sometimes only line of defense for your personal information. Reusing a simple password across multiple sites is the most common way accounts get compromised.</p>
            <h3>Best Practices for Security</h3>
            <p>We recommend using a password manager (like Bitwarden, 1Password, or Apple Keychain) to store these complex passwords. You should also enable Two-Factor Authentication (2FA) whenever possible, as it provides an additional layer of security even if your password is stolen.</p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/password-generator" />
          <PopularCalculators exclude="/calculator/password-generator" />
        </div>
      </div>
    </>
  );
};

export default PasswordGenerator;

