"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Is Racira TTS free?", a: "Yes. Racira TTS is completely free to use, with no quotas, signups or hidden costs. The platform runs entirely in your browser using the Web Speech API." },
  { q: "Does it support Hindi and other Indian languages?", a: "Yes. Racira TTS detects Hindi, Bengali, Tamil, Telugu, Marathi and more, and automatically pairs them with a compatible voice on your device." },
  { q: "Can I download the generated speech?", a: "On supported Chromium-based desktop browsers you can download the generated audio as a WebM file via tab-audio capture. On other browsers we surface a clear notice — a server-side renderer is on the roadmap." },
  { q: "Which browsers work best?", a: "Latest Google Chrome, Microsoft Edge and Brave on desktop deliver the best voice variety and the smoothest experience. Safari and Firefox also work for playback." },
  { q: "Is there any usage limit?", a: "No. Generation happens locally in your browser, so you can produce as much speech as you want without rate limits." },
  { q: "Does it work on mobile?", a: "Yes. Racira TTS is fully responsive and optimised for phones and tablets, using the device's native speech engine." },
  { q: "Can I use it for YouTube voiceovers?", a: "Absolutely. Many creators use Racira TTS for narration, voiceover drafts, language practice and accessibility work. You're welcome to use the output in your projects." },
  { q: "Is my text stored on a server?", a: "No. Your text never leaves your browser — it's autosaved locally so you can pick up where you left off, but Racira TTS does not transmit it anywhere." },
];

export function TTSFAQ() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" aria-labelledby="faq-title" className="container mx-auto py-20 sm:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[13px] font-semibold uppercase tracking-wider text-brand">FAQ</p>
        <h2 id="faq-title" className="mt-2 font-display text-[32px] font-bold tracking-tight sm:text-[40px]">
          Everything you need to know
        </h2>
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border-subtle bg-surface p-2 shadow-soft sm:p-4">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-border-subtle">
              <AccordionTrigger className="px-3 text-left text-[15px] font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="px-3 text-[14.5px] leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
