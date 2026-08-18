import Breadcrumb from "@/components/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Racira",
  description: "Racira's terms of service for using our browser-based tools.",
};

const TermsOfService = () => (
  <>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />
    <div className="racira-page-container py-8 max-w-3xl prose-finance">
      <h1 className="text-3xl font-extrabold mb-6 text-foreground">Terms of Service</h1>
      <p><strong>Last updated:</strong> August 14, 2026</p>

      <h2>Acceptance of Terms</h2>
      <p>
        By accessing and using Racira, you agree to these Terms of Service. If you do not
        agree, please do not use our website.
      </p>

      <h2>Use of Our Tools</h2>
      <p>
        Racira provides a suite of browser-based tools across multiple categories,
        including calculators, PDF utilities, image and design tools, voice synthesis,
        developer utilities, SEO tools, games, and more. Our tools are provided for
        informational, educational, and general utility purposes. Results produced by our
        tools are estimates based on the information you provide and standard formulas.
        They do not constitute financial, investment, tax, legal, medical, or other
        professional advice.
      </p>

      <h2>No Guarantee of Accuracy</h2>
      <p>
        While we strive for accuracy, we make no warranties or guarantees regarding the
        accuracy, completeness, or reliability of any results produced by our tools.
        Actual outcomes may differ based on factors not accounted for by our tools.
        Always consult a qualified professional for advice specific to your situation.
      </p>

      <h2>Acceptable Use</h2>
      <p>
        You agree not to misuse our website, attempt to disrupt its operation, or use it
        for any unlawful purpose. You are responsible for the content you process with
        our tools and must ensure you have the rights to any files or material you use
        with them.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content, design, and code on Racira is the property of Racira and is
        protected by applicable intellectual property laws.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        Racira shall not be liable for any direct, indirect, incidental, or consequential
        damages arising from your use of our website or tools. You use our tools entirely
        at your own risk.
      </p>

      <h2>Third-Party Links</h2>
      <p>
        Our website may contain links to third-party websites. We are not responsible for
        the content or practices of these external sites.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We reserve the right to modify these terms at any time. Continued use of the
        website constitutes acceptance of updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        For questions regarding these terms, please visit our{" "}
        <a href="/contact" className="text-primary hover:underline">Contact page</a>.
      </p>
    </div>
  </>
);

export default TermsOfService;
