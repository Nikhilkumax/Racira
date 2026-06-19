"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, BookOpen } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface BookPublishingInputs {
  pageCount: number;
  wordCount: number;
  editingType: "none" | "proofreading" | "copyediting" | "developmental" | "comprehensive";
  coverDesignType: "diy" | "premade" | "basic" | "custom" | "premium";
  formattingType: "diy" | "standard" | "complex";
  marketingBudget: number;
  isbnCount: number;
  authorCopies: number;
  printCostPerBook: number;
}

interface BookPublishingResult {
  totalCost: number;
  editingCost: number;
  coverCost: number;
  formattingCost: number;
  publishingCost: number;
  marketingCost: number;
  printingCost: number;
  costPerWord: number;
  costPerBook: number; // if we count total cost / author copies
  chartData: { name: string; value: number; color: string }[];
}

const DEFAULTS = {
  pageCount: "250",
  wordCount: "62500", // ~250 words per page
  editingType: "copyediting" as const,
  coverDesignType: "custom" as const,
  formattingType: "standard" as const,
  marketingBudget: "500",
  isbnCount: "1",
  authorCopies: "50",
  printCostPerBook: "4.50",
};

const calculateCosts = (inputs: BookPublishingInputs): BookPublishingResult => {
  const {
    wordCount, editingType, coverDesignType, formattingType,
    marketingBudget, isbnCount, authorCopies, printCostPerBook
  } = inputs;

  // Editing Costs (based on industry standard rates per word)
  let editingCost = 0;
  switch (editingType) {
    case "proofreading": editingCost = wordCount * 0.015; break;
    case "copyediting": editingCost = wordCount * 0.025; break;
    case "developmental": editingCost = wordCount * 0.035; break;
    case "comprehensive": editingCost = wordCount * 0.06; break;
    case "none": default: editingCost = 0; break;
  }

  // Cover Design Costs
  let coverCost = 0;
  switch (coverDesignType) {
    case "premade": coverCost = 100; break;
    case "basic": coverCost = 250; break;
    case "custom": coverCost = 600; break;
    case "premium": coverCost = 1500; break;
    case "diy": default: coverCost = 0; break;
  }

  // Formatting Costs
  let formattingCost = 0;
  switch (formattingType) {
    case "standard": formattingCost = 150 + (wordCount / 1000 * 1.5); break; // base + length factor
    case "complex": formattingCost = 350 + (wordCount / 1000 * 2.5); break; // images, tables, etc
    case "diy": default: formattingCost = 0; break;
  }

  // ISBN Costs (Bowker rates approx)
  const isbnTotal = isbnCount === 1 ? 125 : isbnCount > 1 ? 295 : 0; // 10 pack is 295
  
  // Printing Costs
  const printingCost = authorCopies * printCostPerBook;

  const totalCost = editingCost + coverCost + formattingCost + isbnTotal + marketingBudget + printingCost;
  
  const costPerWord = wordCount > 0 ? totalCost / wordCount : 0;
  const costPerBook = authorCopies > 0 ? totalCost / authorCopies : 0;

  const chartData = [
    { name: "Editing", value: editingCost, color: "hsl(var(--primary))" },
    { name: "Cover Design", value: coverCost, color: "#10b981" },
    { name: "Formatting", value: formattingCost, color: "#f59e0b" },
    { name: "Publishing/ISBN", value: isbnTotal, color: "#3b82f6" },
    { name: "Marketing", value: marketingBudget, color: "#8b5cf6" },
    { name: "Printing", value: printingCost, color: "#ef4444" },
  ].filter(d => d.value > 0);

  return {
    totalCost,
    editingCost,
    coverCost,
    formattingCost,
    publishingCost: isbnTotal,
    marketingCost: marketingBudget,
    printingCost,
    costPerWord,
    costPerBook,
    chartData,
  };
};

const CompactInput = ({
  id, label, value, onChange, prefix, suffix, type = "number", ...props
}: {
  id: string; label: string; value: string; onChange: (val: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: unknown;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input
        id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CompactSelect = ({
  id, label, value, onChange, options
}: {
  id: string; label: string; value: string; onChange: (val: string) => void;
  options: {value: string, label: string}[];
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <select
      id={id} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 py-1 text-sm bg-background border border-input rounded-md shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number }[];
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function BookPublishingCostCalculator() {
  const [pageCount, setPageCount] = useState(DEFAULTS.pageCount);
  const [wordCount, setWordCount] = useState(DEFAULTS.wordCount);
  const [editingType, setEditingType] = useState<BookPublishingInputs["editingType"]>(DEFAULTS.editingType);
  const [coverDesignType, setCoverDesignType] = useState<BookPublishingInputs["coverDesignType"]>(DEFAULTS.coverDesignType);
  const [formattingType, setFormattingType] = useState<BookPublishingInputs["formattingType"]>(DEFAULTS.formattingType);
  const [marketingBudget, setMarketingBudget] = useState(DEFAULTS.marketingBudget);
  const [isbnCount, setIsbnCount] = useState(DEFAULTS.isbnCount);
  const [authorCopies, setAuthorCopies] = useState(DEFAULTS.authorCopies);
  const [printCostPerBook, setPrintCostPerBook] = useState(DEFAULTS.printCostPerBook);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<BookPublishingResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    handleCalculate();
  }, []);

  // Sync words/pages roughly
  const handlePageChange = (val: string) => {
    setPageCount(val);
    const pages = parseFloat(val) || 0;
    setWordCount((pages * 250).toString());
  };

  const handleCalculate = () => {
    const inputs: BookPublishingInputs = {
      pageCount: parseFloat(pageCount) || 0,
      wordCount: parseFloat(wordCount) || 0,
      editingType,
      coverDesignType,
      formattingType,
      marketingBudget: parseFloat(marketingBudget) || 0,
      isbnCount: parseInt(isbnCount) || 0,
      authorCopies: parseInt(authorCopies) || 0,
      printCostPerBook: parseFloat(printCostPerBook) || 0,
    };
    setResult(calculateCosts(inputs));
  };

  const reset = () => {
    setPageCount(DEFAULTS.pageCount);
    setWordCount(DEFAULTS.wordCount);
    setEditingType(DEFAULTS.editingType);
    setCoverDesignType(DEFAULTS.coverDesignType);
    setFormattingType(DEFAULTS.formattingType);
    setMarketingBudget(DEFAULTS.marketingBudget);
    setIsbnCount(DEFAULTS.isbnCount);
    setAuthorCopies(DEFAULTS.authorCopies);
    setPrintCostPerBook(DEFAULTS.printCostPerBook);
    setShowAdvanced(false);

    setResult(calculateCosts({
      pageCount: parseFloat(DEFAULTS.pageCount),
      wordCount: parseFloat(DEFAULTS.wordCount),
      editingType: DEFAULTS.editingType,
      coverDesignType: DEFAULTS.coverDesignType,
      formattingType: DEFAULTS.formattingType,
      marketingBudget: parseFloat(DEFAULTS.marketingBudget),
      isbnCount: parseInt(DEFAULTS.isbnCount),
      authorCopies: parseInt(DEFAULTS.authorCopies),
      printCostPerBook: parseFloat(DEFAULTS.printCostPerBook),
    }));
  };

  const fmtCurrency = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtCurrencyZero = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const faqs = [
    { question: "How much does it cost to self-publish a book?", answer: "Self-publishing costs vary wildly based on quality and length. A bare-bones, DIY approach might cost $0 to $500. A professional, high-quality self-publishing effort for a standard 60,000-word novel typically ranges from $2,000 to $5,000, covering professional developmental/copy editing, a custom cover design, formatting, and a basic marketing launch." },
    { question: "Why is editing the most expensive part of publishing?", answer: "Editing is incredibly labor-intensive. A professional editor must read your manuscript multiple times, fact-check, ensure consistency, fix grammar, and improve flow. Industry standard rates range from 1.5 to 6 cents per word depending on the level of editing. For a 70,000-word book, even a basic copyedit at 2.5 cents per word costs $1,750." },
    { question: "Do I need to buy my own ISBN?", answer: "If you plan to publish exclusively on Amazon KDP (Kindle Direct Publishing) as an ebook, Amazon provides a free ASIN, and you do not legally need an ISBN. However, if you want to publish in print, distribute widely to bookstores, or maintain complete control over your publishing imprint name, you should purchase your own ISBNs from Bowker (in the US). A single ISBN costs $125, but a 10-pack is $295." },
    { question: "Can I just design the cover myself to save money?", answer: "You can, but it is highly discouraged unless you are a professional graphic designer. The cover is your book's primary marketing tool. A poor cover instantly flags a book as amateur, severely damaging sales potential. If you are on a strict budget, consider a 'premade' cover from a reputable designer (usually $50–$150) rather than full DIY." },
    { question: "What is the difference between copyediting and developmental editing?", answer: "Developmental editing looks at the big picture: plot holes, character arcs, pacing, and structure. It is the most expensive and time-consuming. Copyediting focuses on the sentence level: grammar, punctuation, spelling, consistency, and style. Proofreading is the final, cheapest sweep to catch typos before publication." },
    { question: "How much should I budget for book marketing?", answer: "Marketing budgets vary by author goals. For a debut self-published author aiming for steady baseline sales, $200–$500 for initial launch promotions (like newsletter promos, ARC services, and basic Amazon ads) is typical. For authors treating it as a primary business, marketing budgets often scale indefinitely based on Return on Ad Spend (ROAS)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Book Publishing Cost Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Book Publishing Cost Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT COLUMN: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            {/* Normal Tier */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <CompactInput
                  id="page-count"
                  label="Est. Pages"
                  value={pageCount}
                  onChange={handlePageChange}
                />
                <CompactInput
                  id="word-count"
                  label="Word Count"
                  value={wordCount}
                  onChange={setWordCount}
                />
              </div>

              <CompactSelect
                id="editing-type"
                label="Editing Level"
                value={editingType}
                onChange={(val) => setEditingType(val as any)}
                options={[
                  { value: "none", label: "None / DIY ($0)" },
                  { value: "proofreading", label: "Proofreading Only (Cheapest)" },
                  { value: "copyediting", label: "Copyediting (Standard)" },
                  { value: "developmental", label: "Developmental + Copy (Thorough)" },
                  { value: "comprehensive", label: "Comprehensive Package (Premium)" },
                ]}
              />

              <CompactSelect
                id="cover-design"
                label="Cover Design Quality"
                value={coverDesignType}
                onChange={(val) => setCoverDesignType(val as any)}
                options={[
                  { value: "diy", label: "DIY ($0)" },
                  { value: "premade", label: "Premade Cover (~$100)" },
                  { value: "basic", label: "Basic Custom (~$250)" },
                  { value: "custom", label: "Standard Custom (~$600)" },
                  { value: "premium", label: "Premium/Illustrated (~$1500+)" },
                ]}
              />
            </div>

            {/* Advanced Tier */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Additional Costs</div>
                  
                  <CompactSelect
                    id="formatting-type"
                    label="Interior Formatting"
                    value={formattingType}
                    onChange={(val) => setFormattingType(val as any)}
                    options={[
                      { value: "diy", label: "DIY (Vellum/Atticus) ($0)" },
                      { value: "standard", label: "Professional Standard" },
                      { value: "complex", label: "Complex (Images/Tables)" },
                    ]}
                  />

                  <CompactSelect
                    id="isbn-count"
                    label="ISBNs Needed"
                    value={isbnCount}
                    onChange={setIsbnCount}
                    options={[
                      { value: "0", label: "0 (Amazon Free ASIN)" },
                      { value: "1", label: "1 ISBN ($125)" },
                      { value: "10", label: "10-Pack ($295)" },
                    ]}
                  />

                  <CompactInput
                    id="marketing-budget"
                    label="Marketing/Launch Budget"
                    value={marketingBudget}
                    onChange={setMarketingBudget}
                    prefix="$"
                  />

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50 mt-1">
                    <CompactInput
                      id="author-copies"
                      label="Author Copies"
                      value={authorCopies}
                      onChange={setAuthorCopies}
                    />
                    <CompactInput
                      id="print-cost"
                      label="Print Cost/Book"
                      value={printCostPerBook}
                      onChange={setPrintCostPerBook}
                      prefix="$"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                <Calculator className="h-4 w-4" /> Calculate Costs
              </button>
              <button
                type="button"
                onClick={reset}
                className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Total Estimated Cost</p>
                  <p className="text-4xl font-black text-primary">{fmtCurrencyZero(result.totalCost)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on a <strong>{parseFloat(wordCount).toLocaleString()}</strong> word manuscript.
                  </p>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card divide-x divide-border">
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Editing</p>
                    <p className="text-base font-bold text-foreground">{fmtCurrencyZero(result.editingCost)}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Design</p>
                    <p className="text-base font-bold text-foreground">{fmtCurrencyZero(result.coverCost + result.formattingCost)}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Admin/Print/Mkt</p>
                    <p className="text-base font-bold text-foreground">{fmtCurrencyZero(result.publishingCost + result.printingCost + result.marketingCost)}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 3. Breakdown Chart */}
                  <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                    <p className="text-sm font-semibold text-foreground mb-2 text-center">Budget Allocation</p>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={result.chartData}
                            cx="50%" cy="50%"
                            innerRadius={55} outerRadius={80}
                            paddingAngle={2} dataKey="value" stroke="none"
                          >
                            {result.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      {result.chartData.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: entry.color }}></div>
                            {entry.name}
                          </div>
                          <span className="font-medium text-foreground">{fmtCurrencyZero(entry.value)} ({(entry.value / result.totalCost * 100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Table Summary */}
                  <div className="bg-card border border-border rounded-lg p-0 flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-foreground p-4 pb-2 text-center border-b border-border">Detailed Breakdown</p>
                    <div className="overflow-y-auto">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-border">
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">Editorial</td>
                            <td className="px-4 py-3 text-right">{fmtCurrency(result.editingCost)}</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">Cover Art</td>
                            <td className="px-4 py-3 text-right">{fmtCurrency(result.coverCost)}</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">Formatting</td>
                            <td className="px-4 py-3 text-right">{fmtCurrency(result.formattingCost)}</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">ISBN/Admin</td>
                            <td className="px-4 py-3 text-right">{fmtCurrency(result.publishingCost)}</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">Marketing</td>
                            <td className="px-4 py-3 text-right">{fmtCurrency(result.marketingCost)}</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">Physical Proofs</td>
                            <td className="px-4 py-3 text-right">{fmtCurrency(result.printingCost)}</td>
                          </tr>
                          <tr className="bg-muted/20 font-bold text-primary border-t border-border">
                            <td className="px-4 py-3">Total Investment</td>
                            <td className="px-4 py-3 text-right">{fmtCurrency(result.totalCost)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          
          <article className="prose-finance">
            <h2>Complete Guide to Book Publishing Costs</h2>
            <h3>Understanding the True Cost of Publishing</h3>
            <p>Writing a book is free, but publishing a high-quality book that competes with traditional publishers requires a financial investment. Our Book Publishing Cost Calculator helps aspiring independent authors construct a realistic budget before launching their literary careers.</p>
            <p>Whether you are planning to self-publish via Amazon KDP (Kindle Direct Publishing), IngramSpark, or seeking hybrid publishing services, knowing where your money goes is crucial. The total cost is determined almost entirely by your manuscript's word count and the level of professional polish you desire. While some authors publish for exactly $0 using DIY methods, the industry average to professionally self-publish a 60,000-word novel is between $2,000 and $4,500.</p>

            <h2>Editorial Costs (The Largest Expense)</h2>
            <p>Editing should be the largest slice of your publishing budget. A beautiful cover will get a reader to buy the book, but poor editing will earn you 1-star reviews that kill all future sales. Editing is typically billed by the word, not by the hour.</p>
            <p>Proofreading (1 to 2 cents/word) provides the final polish, catching typos, double words, missing punctuation, and minor formatting errors. This is the bare minimum you should invest in. Copyediting (2 to 3 cents/word) focuses on sentence structure, flow, grammar, consistency, and passive voice. Developmental Editing (3 to 6 cents/word) is a big-picture structural edit that evaluates plot holes, character arcs, pacing, and overall story viability, which often requires major rewrites.</p>

            <h2>Cover Design (The Most Important Marketing Tool)</h2>
            <p>Do not design your own cover unless you are a professional graphic designer with experience in book typography. Your cover must instantly convey the genre to a scrolling browser on Amazon. A thriller needs to look like a thriller; a romance must look like a romance.</p>
            <p>If you are on a tight budget, look for Premade Covers. Many talented designers sell pre-designed covers where they simply swap in your title and author name for $50 to $150. A standard Custom Cover using stock photography manipulation typically runs $300 to $800. Fully Illustrated Premium Covers (popular in Fantasy and Sci-Fi) often exceed $1,500.</p>

            <h2>Interior Formatting & Typography</h2>
            <p>Formatting is taking your Microsoft Word document and turning it into a professional ePub file for Kindles and a PDF for print-on-demand paperbacks. Professional formatters ensure chapter headings start on the right page, handle drop caps, and eliminate widows and orphans.</p>
            <p>Many indie authors save money here by purchasing software like Vellum or Atticus for around $150 to $250, which allows unlimited DIY formatting with professional results. Hiring a professional formatter typically costs $150 to $400 depending on manuscript complexity.</p>

            <h2>ISBNs and Administrative Costs</h2>
            <p>An ISBN is a unique identifier for your book. If you publish exclusively through Amazon KDP for ebooks, Amazon provides a free ASIN, and no ISBN is required. Amazon will also provide a free ISBN for your print book, but it lists Amazon as the publisher of record.</p>
            <p>If you want to be listed as your own publisher, or if you want to distribute to libraries and independent bookstores via IngramSpark, you must buy your own ISBN. In the US, Bowker holds the monopoly on ISBNs. One ISBN costs $125. Because you need a separate ISBN for every format, it is almost always more economical to buy a 10-pack for $295.</p>

            <h2>Marketing and Launch Budgets</h2>
            <p>"Build it and they will come" does not apply to publishing. Over 8,000 books are published on Amazon every single day. To gain visibility, you need a marketing budget. Common launch expenses include ARC Services ($50 - $200) to distribute Advanced Reader Copies in exchange for honest launch-day reviews, Newsletter Promos ($25 - $100+) to email your book to their subscribers, and PPC Ads. Beginners should budget at least $200–$500 to test ad copy and discover converting audiences.</p>

            <h2>Traditional vs. Hybrid vs. Self-Publishing</h2>
            <p>This calculator assumes you are Self-Publishing. If you secure a Traditional Publishing contract (via a literary agent), your cost is $0. The publisher pays for the editing, cover, and formatting, and pays you an advance. However, you surrender creative control and take a much smaller royalty percentage.</p>
            <p>Beware of Vanity Presses or predatory "Hybrid" publishers that charge you $5,000 to $10,000 to publish your book. They often outsource editing and design to the lowest bidder and keep a massive percentage of your royalties. You can almost always produce a higher quality book for half the price by hiring your own freelancers.</p>

            <h2>How to Reduce Your Publishing Costs</h2>
            <p>If your budget is tight, do not cut corners on the cover or the editing. Instead, join critique groups or find reliable beta readers to review your manuscript before sending it to a professional editor—the cleaner your draft, the less an editor may charge. Use DIY formatting software like Atticus, rely on pre-made covers from quality designers, and utilize free grassroots marketing on social media to build an organic audience before opening your wallet for paid advertising.</p>
          </article>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/book-publishing-cost-calculator" />
          <PopularCalculators exclude="/calculator/book-publishing-cost-calculator" />
        </div>
      </div>
    </>
  );
}
