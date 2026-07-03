import Breadcrumb from "@/components/Breadcrumb";

const TermsOfService = () => (
  <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />
    <div className="racira-page-container py-8 max-w-3xl prose-finance">
      <h1 className="text-3xl font-extrabold mb-6 text-foreground">Terms of Service</h1>
      <p><strong>Last updated:</strong> February 12, 2026</p>

      <h2>Acceptance of Terms</h2>
      <p>By accessing and using RaciraCalculator, you agree to these Terms of Service. If you do not agree, please do not use our website.</p>

      <h2>Use of Calculators</h2>
      <p>Our calculators are provided for informational and educational purposes only. The results are estimates based on the information you provide and standard financial formulas. They do not constitute financial, investment, tax, or legal advice.</p>

      <h2>No Guarantee of Accuracy</h2>
      <p>While we strive for accuracy, we make no warranties or guarantees regarding the accuracy, completeness, or reliability of any calculations. Actual financial outcomes may differ based on factors not accounted for by our tools. Always consult a qualified financial professional for specific advice.</p>

      <h2>Intellectual Property</h2>
      <p>All content, design, and code on RaciraCalculator is the property of RaciraCalculator and is protected by applicable intellectual property laws.</p>

      <h2>Limitation of Liability</h2>
      <p>RaciraCalculator shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of our website or calculators. You use our tools entirely at your own risk.</p>

      <h2>Third-Party Links</h2>
      <p>Our website may contain links to third-party websites. We are not responsible for the content or practices of these external sites.</p>

      <h2>Changes to Terms</h2>
      <p>We reserve the right to modify these terms at any time. Continued use of the website constitutes acceptance of updated terms.</p>

      <h2>Contact</h2>
      <p>For questions regarding these terms, please visit our <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
    </div>
  </>
);

export default TermsOfService;
