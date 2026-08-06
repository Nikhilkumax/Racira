"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Is Racira TTS free?", a: "Yes. Racira TTS is completely free to use, with no quotas, signups or hidden costs. Speech is generated locally on your own device." },
  { q: "Which languages and accents are supported?", a: "Racira TTS currently supports American English and British English, with 28 voices split between the two accents. Additional languages are planned but are not available yet." },
  { q: "Can I download the generated speech?", a: "Yes. Choose WAV or MP3 before you generate, then use the Download button in the player to save the file directly. There's no screen recording or tab capture involved." },
  { q: "Why does the first generation take longer than the rest?", a: "The voice model is downloaded to your browser the first time you generate, which takes a moment on a typical connection. It's cached afterwards, so every later generation starts right away." },
  { q: "Which browsers work best?", a: "Racira TTS needs a browser with WebGPU support — the latest Google Chrome, Microsoft Edge or Brave on desktop are the safest choices. If your browser can't run it, you'll see a clear notice instead of a broken player." },
  { q: "Is there any usage limit?", a: "No. Generation happens locally on your device, so you can produce as much speech as you want without rate limits." },
  { q: "Does it work on mobile?", a: "The page itself is fully responsive, but generation requires WebGPU, which many mobile browsers don't support yet. On those devices you'll see a notice explaining that instead of the studio." },
  { q: "Can I use it for YouTube voiceovers?", a: "Absolutely. Many creators use Racira TTS for narration, voiceover drafts, language practice and accessibility work. You're welcome to use the output in your projects." },
  { q: "Is my text stored on a server?", a: "No. Your text never leaves your device — it's turned into speech locally in your browser, and Racira TTS does not transmit it anywhere." },
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
