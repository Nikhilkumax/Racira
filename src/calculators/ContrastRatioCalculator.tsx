"use client";
import { Eye, Info, ArrowRightLeft, CheckCircle2, XCircle } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
const ContrastRatioCalculator = () => {
  const [fgColor, setFgColor] = useState("#673AB7"); // Deep Violet
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [ratio, setRatio] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const getLuminance = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const components = [r, g, b].map(v => {
      if (v <= 0.03928) return v / 12.92;
      return Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return components[0] * 0.2126 + components[1] * 0.7152 + components[2] * 0.0722;
  };

  useEffect(() => {
    try {
      const l1 = getLuminance(fgColor);
      const l2 = getLuminance(bgColor);
      const newRatio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      setRatio(newRatio);
    } catch (e) {
      setRatio(0);
    }
  }, [fgColor, bgColor]);

  const swapColors = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  const getStatus = (target: number) => {
    return ratio >= target ? (
      <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="h-4 w-4" /> Pass</span>
    ) : (
      <span className="flex items-center gap-1 text-red-600 font-bold"><XCircle className="h-4 w-4" /> Fail</span>
    );
  };

  const faqs = [
    { question: "What are the WCAG contrast requirements?", answer: "WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text. Level AAA requires at least 7:1 for normal text and 4.5:1 for large text." },
    { question: "What counts as 'large text'?", answer: "In WCAG guidelines, large text is defined as at least 18pt (typically 24px) or 14pt bold (typically 18.67px bold)." },
    { question: "Why is color contrast important?", answer: "Good contrast ensures that your content is readable by everyone, including people with visual impairments like low vision or color blindness. It also improves readability for all users in different lighting conditions." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Color Contrast Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Color Contrast Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest">Foreground (Text)</label>
                  <div className="flex gap-3">
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 bg-transparent" />
                    <input type="text" value={fgColor.toUpperCase()} onChange={(e) => setFgColor(e.target.value)} className="flex-1 input-calc font-mono uppercase" maxLength={7} />
                  </div>
                </div>

                <button onClick={swapColors} className="p-3 rounded-full hover:bg-secondary transition-colors text-muted-foreground mt-6">
                  <ArrowRightLeft className="h-6 w-6" />
                </button>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest">Background</label>
                  <div className="flex gap-3">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 bg-transparent" />
                    <input type="text" value={bgColor.toUpperCase()} onChange={(e) => setBgColor(e.target.value)} className="flex-1 input-calc font-mono uppercase" maxLength={7} />
                  </div>
                </div>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="card-calculator flex flex-col items-center justify-center text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Contrast Ratio</p>
                <p className="text-6xl font-black mb-2">{ratio.toFixed(2)}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                   <Info className="h-3 w-3" /> Minimum for AA is 4.5:1
                </div>
              </div>
            </div>

            <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
               <h2 className="text-2xl font-bold mb-3">
                  <Eye className="h-5 w-5 text-primary" /> WCAG Compliance Check
               </h2>
               <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                     <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">AA Normal Text</p>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground">4.5:1</span>
                        {getStatus(4.5)}
                     </div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                     <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">AA Large Text</p>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground">3.0:1</span>
                        {getStatus(3)}
                     </div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                     <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">AAA Normal Text</p>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground">7.0:1</span>
                        {getStatus(7)}
                     </div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                     <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">AAA Large Text</p>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground">4.5:1</span>
                        {getStatus(4.5)}
                     </div>
                  </div>
               </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Web Accessibility (a11y) and Color</h2>
              <p>Accessibility is not just a feature; it's a fundamental requirement of the modern web. The Web Content Accessibility Guidelines (WCAG) provide a technical standard for ensuring that web content is accessible to people with various disabilities.</p>
              
              <h3>The AA vs. AAA Standard</h3>
              <p><strong>Level AA</strong> is the standard required by most laws and regulations (like the ADA in the US or the EAA in Europe). It ensures that content is readable by the majority of people.</p>
              <p><strong>Level AAA</strong> is the highest level of accessibility. While it is not always required by law, it provides the best possible experience for users with significant visual impairments.</p>

              <h3>Tips for Better Contrast</h3>
              <ul>
                <li><strong>Avoid pure grays:</strong> Pure gray on white can often fail contrast tests. Adding a slight tint of your primary color can make it look more natural while maintaining readability.</li>
                <li><strong>Weight Matters:</strong> Bolder fonts can often pass contrast tests with a lower ratio than thin fonts of the same color.</li>
                <li><strong>Don't rely on color alone:</strong> Color contrast is only one part of the story. Use icons, underlines, and clear labels to convey meaning to users who may not be able to perceive color differences at all.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/contrast-ratio" />
          <PopularCalculators exclude="/calculator/contrast-ratio-calculator" />
        </div>
      </div>
    </>
  );
};

export default ContrastRatioCalculator;

