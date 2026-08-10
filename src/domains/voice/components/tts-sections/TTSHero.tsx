export function TTSHero() {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-hero">
      {/* Padding is symmetrical on purpose: the heading is the only content
          left, so this element alone owns both the header-to-heading and the
          heading-to-tool-box gap. The tool box below contributes pt-0. */}
      <div className="container mx-auto pb-3 pt-3 text-center sm:pb-5 sm:pt-5">
        <h1 className="mx-auto max-w-3xl text-balance font-display text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[56px]">
          {/* text-brand-glow resolves to hsl(258 90% 66%) — the #8B5CF6 the
              original hero hardcoded, now via the theme token. */}
          Free <span className="text-brand-glow">Text to Speech</span>
        </h1>
      </div>
    </section>
  );
}
