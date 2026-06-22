"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Heart, Sparkles } from "lucide-react";

interface LoveResult {
  score: number;
  message: string;
  isError: boolean;
  errorMsg?: string;
}

const calculateLove = (name1: string, name2: string): LoveResult | null => {
  const n1 = name1.trim().toLowerCase();
  const n2 = name2.trim().toLowerCase();

  if (!n1 || !n2) return null;

  try {
    // A classic, fun, deterministic algorithm based on character codes
    // so the same two names always get the exact same score.
    const combined = n1 + "loves" + n2;
    
    let sum = 0;
    for (let i = 0; i < combined.length; i++) {
      sum += combined.charCodeAt(i);
    }
    
    // Create a deterministic pseudo-random number between 0 and 100
    // Multiply by a prime number and modulo 101 to get a score 0-100
    let score = (sum * 73) % 101;
    
    // Add a little flavor based on name lengths
    score = (score + (n1.length * n2.length)) % 101;

    let message = "";
    if (score >= 90) message = "A match made in heaven! 💘 You two are absolutely perfect for each other.";
    else if (score >= 75) message = "Sparks are flying! ✨ There is a very strong connection here.";
    else if (score >= 50) message = "There is definitely potential! 💖 With a little effort, this could blossom into something beautiful.";
    else if (score >= 25) message = "It might take some work. 🤔 You have different vibes, but opposites can attract!";
    else message = "Not the best astrological match. 💔 But hey, true love defies all odds!";

    return {
      score,
      message,
      isError: false
    };

  } catch (err) {
    return { score: 0, message: "", isError: true, errorMsg: "Calculation error." };
  }
};

const LoveCalculator = () => {
  const [name1, setName1] = useState("Romeo");
  const [name2, setName2] = useState("Juliet");

  const [result, setResult] = useState<LoveResult | null>(null);

  const calculate = () => {
    setResult(calculateLove(name1, name2));
  };

  useEffect(() => { calculate(); }, [name1, name2]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-pink-500/20 focus-within:border-pink-500";
  const ci = "w-full h-full px-4 text-lg bg-transparent outline-none border-none text-foreground font-medium";

  const faqs = [
    { question: "How does the Love Calculator actually work?", answer: "This calculator uses a deterministic numerology algorithm. It converts the letters of both names into their numerical ASCII values, combines them with a specific mathematical formula, and outputs a percentage. Because it relies on the exact spelling of the names, entering the exact same two names will always yield the exact same result." },
    { question: "Is this mathematically scientifically accurate?", answer: "Absolutely not! This calculator is purely for fun and entertainment. Human relationships are complex, beautiful, and entirely unpredictable. No mathematical algorithm or computer code can dictate who you will fall in love with. If you get a low score with your crush, ignore it and go talk to them!" },
    { question: "Does the order of the names matter?", answer: "Because of how the mathematical modulo algorithm processes the string of characters, putting 'John' first and 'Jane' second might yield a slightly different score than putting 'Jane' first and 'John' second. For the best reading, try it both ways!" },
    { question: "Why do we associate the heart symbol with love?", answer: "The modern heart symbol (♥) actually looks very little like a biological human heart. Historians believe the symbol originated in antiquity as a representation of the seedpod of the silphium plant, a species of giant fennel grown on the North African coast that was highly valued as an herbal contraceptive by the ancient Greeks and Romans." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Love Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">True Love Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-6 !p-6 shadow-sm border border-pink-200 dark:border-pink-900 bg-card">
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-2">Person 1</label>
                <div className={wrap}><input type="text" value={name1} onChange={e => setName1(e.target.value)} className={ci} placeholder="Enter a name..." /></div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-pink-100 dark:bg-pink-900/50 p-2 rounded-full border-4 border-card">
                  <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-2">Person 2</label>
                <div className={wrap}><input type="text" value={name2} onChange={e => setName2(e.target.value)} className={ci} placeholder="Enter a name..." /></div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold h-14 text-xl transition-all active:scale-[0.98] shadow-md hover:shadow-lg">
                <Sparkles className="h-6 w-6" /> Calculate Match
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please enter both names to calculate compatibility.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="card-calculator !p-8 border border-pink-200 dark:border-pink-900 bg-gradient-to-b from-pink-50 to-white dark:from-pink-950/30 dark:to-card shadow-lg text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
                  <Heart className="h-48 w-48 text-pink-500 fill-pink-500" />
                </div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 opacity-10">
                  <Heart className="h-32 w-32 text-pink-500 fill-pink-500" />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-foreground mb-6">Compatibility Score</h3>
                  
                  <div className="flex justify-center mb-6">
                    <div className="relative flex items-center justify-center h-40 w-40 rounded-full bg-white dark:bg-card border-8 border-pink-100 dark:border-pink-900 shadow-inner">
                      <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                        <circle cx="72" cy="72" r="68" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-pink-100 dark:text-pink-900" />
                        <circle cx="72" cy="72" r="68" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="427" strokeDashoffset={427 - (427 * result.score) / 100} className="text-pink-500 transition-all duration-1000 ease-out" />
                      </svg>
                      <div className="text-5xl font-extrabold text-pink-600 dark:text-pink-400 font-mono tracking-tighter">
                        {result.score}%
                      </div>
                    </div>
                  </div>

                  <p className="text-lg font-medium text-foreground max-w-md mx-auto leading-relaxed">
                    {result.message}
                  </p>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Romance</h2>
            <p>Can a computer algorithm truly predict love? Since the dawn of the internet, "Love Calculators" have been incredibly popular tools for friends and couples to test their compatibility. While they are purely for entertainment, the mathematics running behind the scenes are quite interesting.</p>

            <h2>How Deterministic Algorithms Work</h2>
            <p>If you type "Romeo" and "Juliet" into the calculator, you will get a specific score. If you refresh the page and type them in again tomorrow, you will get the exact same score. This is because the calculator is not randomly generating a number; it is using a <strong>Deterministic Algorithm</strong>.</p>
            <p>Computers do not natively understand letters; they only understand numbers. Every letter on your keyboard is assigned a numerical ASCII code. For example, a capital 'A' is 65, and a lowercase 'a' is 97. The Love Calculator takes the names you entered, converts every single letter into its numerical value, and adds them all together into a massive sum.</p>
            <p>It then runs that sum through a series of mathematical functions—usually involving prime numbers and modulo operations—to safely compress that massive number down into a two-digit percentage between 0 and 100.</p>

            <h2>Why Opposites Attract</h2>
            <p>While numerology is fun, human psychology is much more complex. Psychologists have long studied why certain personalities mesh well together. Interestingly, research suggests that the "Opposites Attract" theory has some scientific backing when it comes to specific personality traits.</p>
            <p>A highly organized, structured person often pairs incredibly well with a spontaneous, relaxed person. The structured partner provides stability and planning, while the spontaneous partner introduces excitement and flexibility. They physically balance out each other's extremes. So, if this calculator gives you a low score because your names are vastly different, take heart: in the real world, differences are often the foundation of the strongest relationships!</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/love-calculator" />
          <PopularCalculators exclude="/calculator/love-calculator" />
        </div>
      </div>
    </>
  );
};
export default LoveCalculator;
