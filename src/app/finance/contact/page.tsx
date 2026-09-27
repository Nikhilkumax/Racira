import { PageShell } from "@/domains/finance/blog/page-shell";
import { ContactForm } from "./contact-form";
import { Mail } from "lucide-react";

// Server page owns the shell; the form is a client island. (The page must not
// be "use client" — PageShell renders the async SiteFooter, which cannot run
// client-side.)
export default function Contact() {
  return (
    <PageShell>
      <section className="racira-page-container grid gap-12 py-16 md:grid-cols-2 lg:py-24">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Contact</div>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">Tell us what you're working on.</h1>
          <p className="mt-4 text-muted-foreground">
            Story tips, corrections, partnership questions — we read everything.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" /> editorial@racira.example
          </div>
        </div>
        <ContactForm />
      </section>
    </PageShell>
  );
}
