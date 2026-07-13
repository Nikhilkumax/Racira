import Header from "@/components/Header";
import AudioClientGrid from "@/domains/audio/components/ClientGrid";
import { categories } from "@/domains/audio/registry";
import { SearchAudio } from "./SearchAudio";

export const metadata = {
  title: "Racira Audio — Free Online Audio & Podcast Tools",
  description: "235+ free tools to convert, edit, analyze and master audio. Designed for podcasters and audio engineers. Runs entirely in your browser.",
  openGraph: {
    title: "Racira Audio — Free Audio Tools",
    description: "235+ free tools to convert, edit, analyze and master audio. No signup required.",
  },
};

export default function AudioPage() {
  const totalCount = categories.reduce((sum, cat) => sum + cat.tools.length, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Audio" />

      <main className="flex-1">
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              {totalCount}+ Free Audio Tools —{" "}
              <span className="hero-gradient-text">Convert, Edit & Master</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Essential utilities to convert formats, tune instruments, analyze spectrums, and master podcasts instantly. No signup required.
            </p>
            <SearchAudio />
          </div>
        </section>

        <AudioClientGrid />
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Racira Audio — {totalCount} free audio tools. Runs entirely in your browser.
      </footer>
    </div>
  );
}
