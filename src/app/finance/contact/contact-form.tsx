"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export function ContactForm() {
  return (
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
  );
}
