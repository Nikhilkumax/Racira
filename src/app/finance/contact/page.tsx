"use client";

import { PageShell } from "@/components/finance/page-shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function Contact() {
  return (
    <PageShell>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-24">
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message sent. We'll be in touch.");
            (e.target as HTMLFormElement).reset();
          }}
          className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 md:p-8"
        >
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input required className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input required type="email" className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea required rows={5} className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full">Send message</Button>
        </form>
      </section>
    </PageShell>
  );
}