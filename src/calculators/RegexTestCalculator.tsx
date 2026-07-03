"use client";
import { RotateCcw, Check, Copy, List, Search, AlertCircle } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
const RegexTestCalculator = () => {
  const [pattern, setPattern] = useState("([a-zA-Z0-9._%-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6})");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("My email is hello@example.com and support@racira.org");
  
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    setError(null);
    try {
      if (!pattern) {
        setResults(null);
        return;
      }
      const regex = new RegExp(pattern, flags);
      const matches = Array.from(testString.matchAll(regex));
      const formattedMatches = matches.map((match, idx) => ({
        index: idx,
        fullMatch: match[0],
        groups: match.slice(1),
        start: match.index,
        end: (match.index || 0) + match[0].length
      }));
      setResults({
        matchCount: matches.length,
        matches: formattedMatches
      });
    } catch (err: any) {
      setError(err.message);
      setResults(null);
    }
  };

  const reset = () => {
    setShowResults(false);
    setResults(null);
  };

  const copyPattern = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    { question: "What is Regex?", answer: "Regex (Regular Expression) is a sequence of characters that forms a search pattern. It's used for string matching, search-and-replace, and validation in almost all programming languages." },
    { question: "What do the flags g, i, and m mean?", answer: "'g' stands for global (find all matches), 'i' stands for case-insensitive, and 'm' stands for multi-line." },
    { question: "How do I escape special characters?", answer: "Special characters like ., *, +, ?, etc., have meanings in regex. To match them literally, you must precede them with a backslash (e.g., \\. matches a dot)." }
  ];

  return (
    <>
      <Breadcrumb 
        items={[
          { label: "Home", href: "/" }, 
          { label: "Calculators", href: "/calculator" }, 
          { label: "Regex Match Calculator" }
        ]} 
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Regex Match Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Regex Pattern</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/</span>
                      <input 
                        type="text" 
                        value={pattern} 
                        onChange={(e) => setPattern(e.target.value)} 
                        className={`input-calc pl-8 font-mono ${error ? 'border-red-500 bg-red-500/5' : ''}`}
                        placeholder="e.g. ^[a-z]+$"
                      />
                      <span className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/</span>
                    </div>
                    <input 
                      type="text" 
                      value={flags} 
                      onChange={(e) => setFlags(e.target.value)} 
                      className="w-20 input-calc font-mono text-center"
                      placeholder="flags"
                    />
                    <button onClick={copyPattern} className="p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors">
                      {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-medium"><AlertCircle className="h-3 w-3" /> {error}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Test String</label>
                  <textarea 
                    value={testString} 
                    onChange={(e) => setTestString(e.target.value)} 
                    className="input-calc min-h-[120px] font-mono py-4"
                    placeholder="Enter text to search..."
                  />
                </div>
              </div>
            
              <div className="mt-8 flex gap-3 items-center pt-4 border-t border-border">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button
                  onClick={reset}
                  className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"
                  aria-label="Reset"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator py-6 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Total Matches</p>
                    <p className="text-4xl font-black text-foreground">{results.matchCount}</p>
                  </div>
                  <div className="card-calculator py-6 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                    <p className="text-4xl font-black text-emerald-500">{results.matchCount > 0 ? "Match" : "No Match"}</p>
                  </div>
                </div>

                <div className="card-calculator">
                  <h2 className="text-2xl font-bold mb-3">
                    <List className="h-5 w-5 text-primary" /> Captured Matches & Groups
                  </h2>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {results.matches.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground bg-secondary/5 rounded-xl border border-dashed border-border">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p>No matches found with current pattern.</p>
                      </div>
                    ) : (
                      results.matches.map((match: any) => (
                        <div key={match.index} className="p-4 rounded-xl border border-border bg-secondary/10">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">Match {match.index + 1}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">index: {match.start}-{match.end}</span>
                          </div>
                          <p className="font-mono text-sm bg-white p-2 rounded border border-border mb-3 break-all">{match.fullMatch}</p>
                          {match.groups.length > 0 && (
                            <div className="space-y-2">
                              {match.groups.map((group: string, gIdx: number) => (
                                <div key={gIdx} className="flex gap-2 items-center text-xs">
                                  <span className="font-bold text-muted-foreground min-w-[60px]">Group {gIdx + 1}:</span>
                                  <span className="font-mono text-primary break-all">{group || "null"}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Mastering Regular Expressions</h2>
              <p>Regular expressions (regex) are incredibly powerful tools for text processing. From validating form inputs like emails and passwords to parsing complex server logs, regex is an essential skill for any developer or IT professional.</p>
              
              <h3>Common Regex Patterns</h3>
              <ul>
                <li><strong>Email:</strong> <code>/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{"{"}2,{"}"}$/</code></li>
                <li><strong>IPv4 Address:</strong> <code>/^(?:[0-9]{"{"}1,3{"}"}\.){"{"}3{"}"}[0-9]{"{"}1,3{"}"}$/</code></li>
                <li><strong>Date (YYYY-MM-DD):</strong> <code>/^\d{"{"}4{"}"}-\d{"{"}2{"}"}-\d{"{"}2{"}"}$/</code></li>
                <li><strong>URL:</strong> <code>/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{"{"}1,256{"}"}\.[a-zA-Z0-9()]{"{"}1,6{"}"}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/</code></li>
              </ul>

              <h3>Why Captured Groups?</h3>
              <p>Brackets <code>()</code> in regex serve two purposes: they group parts of your pattern together, and they "capture" the matched text so you can reference it later. This is extremely useful when you need to extract specific parts of a string, such as a username from an email or a domain from a URL.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/regex-match" />
          <PopularCalculators exclude="/calculator/regex-test-calculator" />
        </div>
      </div>
    </>
  );
};

export default RegexTestCalculator;

