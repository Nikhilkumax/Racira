import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Racira",
  description: "Learn more about Racira Calculator, our mission, and our team.",
};

const About = () => (
  <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />
    <div className="racira-page-container py-8 max-w-3xl">
      <h1 className="text-3xl font-extrabold mb-6">About RaciraCalculator</h1>
      <div className="prose-finance">
        <h2>Our Mission</h2>
        <p>RaciraCalculator was created with a simple goal: to make financial planning tools accessible, accurate, and free for everyone. We believe that understanding your finances shouldn't require expensive software or professional consultations for basic calculations.</p>

        <h2>What We Offer</h2>
        <p>Our suite of calculators covers key areas of personal finance — mortgages, loans, compound interest, and credit card payoff. Each tool uses industry-standard formulas used by banks and financial institutions worldwide. All calculations are performed instantly in your browser, ensuring complete privacy.</p>

        <h2>Our Commitment to Accuracy</h2>
        <p>We take accuracy seriously. Our calculators are built using standard amortization and compounding formulas and are regularly tested to ensure reliable results. However, we want to be transparent: our results are estimates intended for educational and planning purposes. They do not constitute financial advice, and actual loan terms, rates, and payments may differ based on your specific financial situation and lender terms.</p>

        <h2>Privacy First</h2>
        <p>Your financial data never leaves your browser. We do not store, transmit, or share any numbers you enter into our calculators. Your privacy and security are paramount to us.</p>

        <h2>Long-Term Vision</h2>
        <p>We are committed to growing RaciraCalculator into a comprehensive financial resource. Our roadmap includes additional calculators, educational content, and tools to help you make the best financial decisions for your future.</p>
      </div>
      <PopularCalculators />
    </div>
  </>
);

export default About;
