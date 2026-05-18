export function TTSSeoContent() {
  return (
    <section id="seo-content" aria-labelledby="seo-title" className="bg-surface-muted/40 py-20 sm:py-24">
      <article className="container mx-auto max-w-3xl">
        <header className="text-center">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-brand">Guide</p>
          <h2 id="seo-title" className="mt-2 font-display text-[30px] font-bold tracking-tight sm:text-[36px]">
            The free, unlimited AI voice generator built for the modern web
          </h2>
        </header>

        <div className="mt-10 space-y-6 text-[15.5px] leading-[1.75] text-foreground/90">
          <p>
            Racira TTS is a <strong>free text-to-speech tool</strong> designed
            for creators, students, educators and teams who need fast, reliable
            voice generation without the friction of API keys, monthly
            subscriptions or strict character limits. Type your script, choose a
            premium voice, and listen instantly.
          </p>

          <h3 className="font-display text-[20px] font-semibold tracking-tight">An unlimited AI voice generator that respects your time</h3>
          <p>
            Most online TTS tools cap your usage, gate languages behind paid
            tiers, or force you through onboarding flows just to hear a sample.
            Racira TTS takes a different approach: the entire engine runs in
            your browser, which means there are no servers to throttle, no
            tokens to count, and no spreadsheets to budget.
          </p>

          <h3 className="font-display text-[20px] font-semibold tracking-tight">Browser-based voice generation, end to end</h3>
          <p>
            Under the hood, Racira TTS uses the <em>Web Speech API</em>, the
            same speech synthesis layer that powers system voices on modern
            operating systems. We map our branded voices — Novaire, Atlas,
            Dante, Orion, Rex, Nova, Aria, Luna and Stella — to the best
            available voices on your device, and
            tune their pitch and rate so they feel consistent across browsers.
          </p>

          <h3 className="font-display text-[20px] font-semibold tracking-tight">A multilingual TTS tool that adapts to your script</h3>
          <p>
            Whether you are writing in English, Hindi, Arabic, Japanese,
            Spanish, French, German, Bengali, Tamil, Telugu or Marathi, Racira
            TTS automatically detects the language of your text and recommends a
            matching voice. Switching between scripts and languages is as
            simple as typing.
          </p>

          <h3 className="font-display text-[20px] font-semibold tracking-tight">Voice generation for YouTube, podcasts and accessibility</h3>
          <p>
            Creators use Racira TTS for narration drafts, faceless YouTube
            voiceovers, podcast intros, language learning, accessibility
            previews, and study material. Since everything is generated in your
            browser, your scripts stay private — no upload, no account, no
            telemetry.
          </p>

          <p>
            Ready to try it? <a href="#studio" className="text-brand underline-offset-4 hover:underline">Open the Racira TTS Studio</a> and generate
            your first voiceover in seconds.
          </p>
        </div>
      </article>
    </section>
  );
}
