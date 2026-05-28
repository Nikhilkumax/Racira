"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Cat } from "lucide-react";

const CatPregnancyCalculator = () => {
  const [matingDate, setMatingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const mating = new Date(matingDate);
    if (isNaN(mating.getTime())) return;

    // Average feline gestation: 63–65 days (range 58–72 days)
    const avgGestation = 63;
    const dueDate = new Date(mating);
    dueDate.setDate(dueDate.getDate() + avgGestation);

    const earlyDate = new Date(mating);
    earlyDate.setDate(earlyDate.getDate() + 58);
    const lateDate = new Date(mating);
    lateDate.setDate(lateDate.getDate() + 72);

    const today = new Date();
    const daysPregnant = Math.round((today.getTime() - mating.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const trimester = daysPregnant < 21 ? "1st (Weeks 1–3)" : daysPregnant < 42 ? "2nd (Weeks 4–6)" : "3rd (Weeks 7–9)";

    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    setResults({ dueDate: fmt(dueDate), earlyDate: fmt(earlyDate), lateDate: fmt(lateDate), daysPregnant, daysRemaining, trimester });
  };

  const reset = () => {
    setShowResults(false);
    const d = new Date(); d.setDate(d.getDate() - 30);
    setMatingDate(d.toISOString().split("T")[0]);
    setResults(null);
  };

  const faqs = [
    {
      question: "How long is a cat pregnant?",
      answer: "The average feline gestation period is 63–65 days from the date of mating, with a normal range of 58–72 days. First-time mothers (queens) often deliver slightly later than experienced ones."
    },
    {
      question: "What are the signs a cat is pregnant?",
      answer: "Early signs include 'pinking up' (nipples become rosy and enlarged) around 2–3 weeks, morning sickness, and increased appetite. By week 5, the abdomen will visibly swell. A vet can confirm with ultrasound as early as day 25."
    },
    {
      question: "How many kittens does a cat usually have?",
      answer: "The average litter size is 4 kittens, ranging from 1 to 12. Litter size depends on the queen's age, breed, and health. Siamese cats tend toward larger litters; Persian cats tend toward smaller ones."
    },
    {
      question: "When should I take a pregnant cat to the vet?",
      answer: "Schedule a vet visit as soon as pregnancy is suspected. Your vet can confirm the pregnancy, estimate litter size, and advise on nutrition. A final check-up in the last week before the due date is recommended."
    },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cat Pregnancy Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cat Pregnancy Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate your cat's expected due date, current trimester, and days remaining based on the mating date.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Date of Mating</label>
                <input
                  type="date"
                  value={matingDate}
                  onChange={(e) => setMatingDate(e.target.value)}
                  className="input-calc"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Cat className="h-5 w-5" /> Calculate Due Date
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Pregnancy Timeline</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Expected Due Date</p>
                    <p className="text-2xl font-black text-foreground">{results.dueDate}</p>
                    <p className="text-sm text-muted-foreground mt-1">{results.daysRemaining} days remaining</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Stage</p>
                    <p className="text-xl font-black text-foreground">{results.trimester}</p>
                    <p className="text-sm text-muted-foreground mt-1">Day {results.daysPregnant} of ~65</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Earliest Possible Delivery", value: 0, textValue: results.earlyDate },
                  { label: "Latest Possible Delivery", value: 0, textValue: results.lateDate },
                  { label: "Average Gestation Period", value: 0, textValue: "63–65 days" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>A Complete Guide to Cat Pregnancy</h2>
              <p>Whether you are a professional breeder or a surprised pet owner, understanding the timeline and stages of feline pregnancy helps you provide the best possible care for your queen and her unborn kittens.</p>

              <h3>Week-by-Week Development</h3>
              <ul>
                <li><strong>Week 1–2:</strong> Fertilisation and implantation. No visible signs yet.</li>
                <li><strong>Week 3:</strong> "Pinking up" — nipples become rosy. Morning sickness may begin.</li>
                <li><strong>Week 4–5:</strong> Embryos detectable by vet ultrasound. Abdomen begins to round.</li>
                <li><strong>Week 6–7:</strong> Rapid fetal growth. The queen's appetite increases significantly.</li>
                <li><strong>Week 8:</strong> Kittens may be felt moving. Queen begins nesting behaviour.</li>
                <li><strong>Week 9+:</strong> Labour can begin at any time. Monitor closely.</li>
              </ul>

              <h3>Nutrition During Pregnancy</h3>
              <p>A pregnant queen should be switched to a high-quality <strong>kitten food</strong> from around week 4 of pregnancy and continue through weaning. Kitten food is denser in calories, calcium, and protein — all critical for healthy fetal development and milk production. Feed her ad libitum (free choice) during the last two weeks before birth.</p>

              <h3>Preparing for Labour</h3>
              <p>Set up a quiet, warm, dark nesting box in the last week. Line it with clean towels or paper. The queen will likely choose this spot to give birth if she feels safe there. Signs of imminent labour include restlessness, loss of appetite, and a drop in rectal temperature to below 37.8°C (100°F).</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cat-pregnancy" />
          <PopularCalculators exclude="/calculator/cat-pregnancy-calculator" />
        </div>
      </div>
    </>
  );
};

export default CatPregnancyCalculator;

