import Breadcrumb from "@/components/Breadcrumb";

const Disclaimer = () => (
  <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Disclaimer" }]} />
    <div className="racira-page-container py-8 max-w-3xl prose-finance">
      <h1 className="text-3xl font-extrabold mb-6 text-foreground">Disclaimer</h1>
      <p><strong>Last updated:</strong> February 12, 2026</p>

      <h2>General Information Only</h2>
      <p>The information provided by RaciraCalculator is for general informational and educational purposes only. All calculations produced by our tools are estimates based on the data you input and standard financial formulas.</p>

      <h2>Not Financial Advice</h2>
      <p>Nothing on this website constitutes financial, investment, tax, legal, or other professional advice. You should not rely solely on our calculators to make financial decisions. Always consult with a qualified financial advisor, mortgage broker, or other appropriate professional before making significant financial commitments.</p>

      <h2>No Guarantee of Accuracy</h2>
      <p>While we make every effort to ensure our calculators produce accurate results, we do not warrant or guarantee the accuracy, reliability, or completeness of any information or calculations on this website. Actual loan payments, interest rates, investment returns, and other financial figures may differ significantly from our estimates.</p>

      <h2>No Liability</h2>
      <p>RaciraCalculator, its owners, operators, and contributors shall not be held liable for any losses, damages, or financial harm resulting from the use of, or reliance on, information or calculations provided on this website.</p>

      <h2>External Links</h2>
      <p>Our website may contain links to external websites. We do not endorse or take responsibility for the content, accuracy, or practices of any third-party websites.</p>

      <h2>Changes</h2>
      <p>We reserve the right to update this disclaimer at any time without notice. Please review this page periodically for changes.</p>

      <h2>Contact</h2>
      <p>If you have questions about this disclaimer, please visit our <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
    </div>
  </>
);

export default Disclaimer;
