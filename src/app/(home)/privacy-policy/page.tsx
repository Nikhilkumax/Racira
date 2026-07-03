import { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy — Racira",
  description: "Our privacy policy and data handling practices.",
};

const PrivacyPolicy = () => (
  <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
    <div className="racira-page-container py-12 prose-finance max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-8 text-foreground">Privacy Policy</h1>
      
      <p>Last updated: April 25, 2024</p>
      
      <p>At Racira Calculator, we take your privacy seriously. This policy describes how we handle your data when you use our website.</p>
      
      <h2>1. Data Collection</h2>
      <p>We do not collect any personal information. All calculations are performed locally in your web browser. We do not store your financial data, health metrics, or any other inputs you provide to our calculators on our servers.</p>
      
      <h2>2. Cookies and Tracking</h2>
      <p>We use standard cookies and similar technologies to understand how visitors use our site and to remember your preferences (such as dark mode). We may use third-party services like Google Analytics to help us improve the user experience.</p>
      
      <h2>3. Third-Party Services</h2>
      <p>Our website may contain links to other websites or use third-party advertising services. These third parties have their own privacy policies, and we encourage you to review them.</p>
      
      <h2>4. Changes to This Policy</h2>
      <p>We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date.</p>
    </div>
  </>
);

export default PrivacyPolicy;
