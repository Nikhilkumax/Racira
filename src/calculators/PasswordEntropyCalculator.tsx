"use client";
import { Shield, Timer, Eye, EyeOff, ShieldCheck, ShieldAlert } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
const PasswordEntropyCalculator = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [entropy, setEntropy] = useState(0);
  const [crackTime, setCrackTime] = useState("");
  const [strength, setStrength] = useState({ label: "Very Weak", color: "text-red-500", bg: "bg-red-500" });
  const calculateEntropy = (pwd: string) => {
    if (!pwd) return 0;
    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 32;

    return pwd.length * Math.log2(poolSize || 1);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 1) return "Instantly";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    return "Centuries";
  };

  useEffect(() => {
    const e = calculateEntropy(password);
    setEntropy(e);

    // Assume 10 billion guesses per second (High-end hardware)
    const guessesPerSecond = 1e10;
    const totalGuesses = Math.pow(2, e);
    const secondsToCrack = totalGuesses / (2 * guessesPerSecond); // Average time is half the search space
    setCrackTime(formatTime(secondsToCrack));

    if (e < 28) setStrength({ label: "Very Weak", color: "text-red-600", bg: "bg-red-600" });
    else if (e < 36) setStrength({ label: "Weak", color: "text-orange-600", bg: "bg-orange-600" });
    else if (e < 60) setStrength({ label: "Reasonable", color: "text-yellow-600", bg: "bg-yellow-600" });
    else if (e < 128) setStrength({ label: "Strong", color: "text-emerald-600", bg: "bg-emerald-600" });
    else setStrength({ label: "Excellent", color: "text-blue-600", bg: "bg-blue-600" });
  }, [password]);

  const faqs = [
    { question: "What is password entropy?", answer: "Entropy is a measure of randomness. In the context of passwords, it tells you how difficult it is for a computer to guess your password by trying all possible combinations. Higher entropy means a more secure password." },
    { question: "What is a good entropy score?", answer: "Generally, anything over 60 bits is considered reasonable for everyday use, and over 100 bits is considered highly secure. For critical accounts, aim for 128 bits or more." },
    { question: "How can I increase my password entropy?", answer: "The most effective way is to increase the length of the password. Adding diverse character types (uppercase, numbers, symbols) also helps, but length is the most powerful factor." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Password Strength Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Password Entropy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="relative mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Test Your Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-calc pr-12 py-4 text-xl tracking-widest font-mono"
                    placeholder="Enter password..."
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="mt-4 flex gap-1 h-2 rounded-full overflow-hidden bg-secondary">
                   <div className={`h-full transition-all duration-500 ${strength.bg}`} style={{ width: `${Math.min(100, (entropy / 128) * 100)}%` }} />
                </div>
                <div className="mt-2 flex justify-between items-center">
                   <p className={`text-sm font-bold ${strength.color}`}>{strength.label}</p>
                   <p className="text-xs text-muted-foreground">{entropy.toFixed(1)} bits of entropy</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-secondary/30 flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm"><Timer className="h-6 w-6 text-primary" /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Cracking Time</p>
                    <p className="font-bold text-lg">{password ? crackTime : "---"}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border bg-secondary/30 flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm"><Shield className="h-6 w-6 text-primary" /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Character Pool</p>
                    <p className="font-bold text-lg">{password ? (entropy / password.length).toFixed(1) : "---"} <span className="text-xs font-normal">bits/char</span></p>
                  </div>
                </div>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {password && (<>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <h2 className="text-xl font-bold mb-6">Security Analysis</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                     <div className="flex items-center gap-3">
                        {password.length >= 12 ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldAlert className="h-5 w-5 text-orange-500" />}
                        <span className="font-medium">Length: {password.length} characters</span>
                     </div>
                     <span className="text-xs text-muted-foreground">{password.length >= 12 ? "Good" : "Short"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                     <div className="flex items-center gap-3">
                        {/[A-Z]/.test(password) && /[a-z]/.test(password) ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldAlert className="h-5 w-5 text-orange-500" />}
                        <span className="font-medium">Case Diversity</span>
                     </div>
                     <span className="text-xs text-muted-foreground">{/[A-Z]/.test(password) && /[a-z]/.test(password) ? "Mixed" : "Single Case"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                     <div className="flex items-center gap-3">
                        {/[0-9]/.test(password) ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldAlert className="h-5 w-5 text-orange-500" />}
                        <span className="font-medium">Contains Numbers</span>
                     </div>
                     <span className="text-xs text-muted-foreground">{/[0-9]/.test(password) ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                     <div className="flex items-center gap-3">
                        {/[^a-zA-Z0-9]/.test(password) ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldAlert className="h-5 w-5 text-orange-500" />}
                        <span className="font-medium">Special Characters</span>
                     </div>
                     <span className="text-xs text-muted-foreground">{/[^a-zA-Z0-9]/.test(password) ? "Yes" : "No"}</span>
                  </div>
                </div>
              
              </div>
            
</>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Password Strength vs. Entropy</h2>
              <p>Many websites use simple meters that check for specific characters. However, the true security of a password is its <strong>entropy</strong>, which measures the total number of guesses a computer must make to crack it via brute force.</p>
              
              <h3>The Brute Force Reality</h3>
              <p>Modern hardware is incredibly fast. A professional password-cracking rig can try billions of combinations every second. This is why passwords like "Password123!" are easily cracked despite having uppercase, numbers, and symbols—they are common and follow predictable patterns.</p>

              <h3>Tips for Ultra-Secure Passwords</h3>
              <ul>
                <li><strong>Length is King:</strong> A 20-character password made of simple words (a "passphrase") is often much stronger than an 8-character password with complex symbols.</li>
                <li><strong>Avoid Patterns:</strong> Don't use names, birthdays, or keyboard patterns like "qwerty" or "asdf".</li>
                <li><strong>Use a Manager:</strong> The best passwords are those you don't even know. Use a password manager to generate and store 20+ character random strings for every site.</li>
                <li><strong>Enable MFA:</strong> Multi-Factor Authentication provides a second layer of security even if your password is stolen or cracked.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/password-entropy" />
          <PopularCalculators exclude="/calculator/password-entropy-calculator" />
        </div>
      </div>
    </>
  );
};

export default PasswordEntropyCalculator;


