import { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy — Racira",
  description: "How Racira handles your data, cookies, and third-party advertising.",
};

const PrivacyPolicy = () => (
  <>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
    <div className="racira-page-container py-12 prose-finance max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-8 text-foreground">Privacy Policy</h1>

      <p>Last updated: August 14, 2026</p>

      <p>
        At Racira, we take your privacy seriously. This policy describes how we handle
        your data when you use our website and the tools we offer across our categories
        (calculators, PDF, image, voice, design, developer utilities, games, and more).
      </p>

      <h2>1. Data Collection</h2>
      <p>
        Racira does not require an account, and we do not collect personal information
        such as your name or email address to use our tools. Our tools run primarily in
        your web browser, and the content you work with — such as numbers you enter into
        a calculator, files you upload to a converter, or text you synthesize — is
        processed locally on your device and is not stored on our servers.
      </p>

      <h2>2. Cookies and Tracking</h2>
      <p>
        We use standard cookies and similar technologies to understand how visitors use
        our site and to remember your preferences (such as dark mode). We may use
        third-party services such as Google Analytics to help us improve the user
        experience.
      </p>

      <h2>3. Advertising</h2>
      <p>
        We may display advertisements on our website, including ads served by Google
        AdSense. Third-party vendors, including Google, use cookies to serve ads based on
        a user&apos;s prior visits to this website and other websites. Google&apos;s use of
        advertising cookies enables it and its partners to serve ads to you based on your
        visits to this site and/or other sites on the Internet.
      </p>
      <p>
        You may opt out of personalized advertising by visiting Google&apos;s Ads Settings at{" "}
        <a href="https://www.google.com/settings/ads" className="text-primary hover:underline">https://www.google.com/settings/ads</a>{" "}
        or the opt-out page of the Network Advertising Initiative at{" "}
        <a href="https://www.aboutads.info/choices" className="text-primary hover:underline">https://www.aboutads.info/choices</a>.
        You can also control cookies through your browser settings.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>
        Our website may contain links to other websites or use third-party services.
        These third parties have their own privacy policies, and we encourage you to
        review them. We are not responsible for the content or practices of external
        sites.
      </p>

      <h2>5. Changes to This Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. Any changes will be posted on
        this page with an updated &quot;Last updated&quot; date.
      </p>

      <h2>6. Contact</h2>
      <p>
        If you have questions about this policy, please visit our{" "}
        <a href="/contact" className="text-primary hover:underline">Contact page</a>.
      </p>
    </div>
  </>
);

export default PrivacyPolicy;
