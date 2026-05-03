import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Voice & AI Tools — Coming Soon",
  description: "Intelligent audio and voice utilities powered by modern AI models. Coming soon to Racira.",
};

export default function AiToolsComingSoon() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-6">
        <span className="text-4xl">🎙️</span>
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Voice & AI Tools</h1>
      <p className="mt-4 text-xl text-muted-foreground">Coming Soon</p>
      <p className="mt-6 max-w-md text-muted-foreground">
        Harnessing the power of AI for transcription, synthesis, and audio cleanup, 
        delivered right to your browser.
      </p>
      <Button asChild className="mt-10" variant="hero">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
