import { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Contact Us — Racira",
  description: "Get in touch with the Racira team for support or inquiries.",
};

const Contact = () => (
  <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
    <div className="container-page py-12">
      <h1 className="text-4xl font-extrabold mb-4">Contact Us</h1>
      <p className="text-lg text-muted-foreground mb-8">
        We'd love to hear from you. Whether you have a question about our calculators, want to report a bug, or have a suggestion for a new tool, our team is ready to help.
      </p>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div className="card-calculator">
          <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Email</p>
              <p className="text-lg font-semibold text-foreground">support@raciracalculator.com</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Response Time</p>
              <p className="text-lg font-semibold text-foreground">Within 24–48 hours</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Mailing Address</h2>
          <p className="text-muted-foreground leading-relaxed">
            Racira Finance Hub<br />
            Innovation Park, Tech City<br />
            Bangalore, Karnataka 560001<br />
            India
          </p>
        </div>
      </div>
    </div>
  </>
);

export default Contact;
