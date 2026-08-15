import { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Contact Us — Racira",
  description: "Get in touch with the Racira team for support or inquiries.",
};

const Contact = () => (
  <>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
    <div className="racira-page-container py-12">
      <h1 className="text-4xl font-extrabold mb-4">Contact Us</h1>
      <p className="text-lg text-muted-foreground mb-8">
        We'd love to hear from you. Whether you have a question about one of our tools,
        want to report a bug, or have a suggestion for a new tool, our team is ready to
        help.
      </p>

      <div className="card-calculator max-w-xl">
        <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Email</p>
            <p className="text-lg font-semibold text-foreground">
              <a href="mailto:contact@racira.com" className="text-primary hover:underline">
                contact@racira.com
              </a>
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Response Time</p>
            <p className="text-lg font-semibold text-foreground">Within 24–48 hours</p>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default Contact;
