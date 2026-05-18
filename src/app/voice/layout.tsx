import { TTSHeader } from "@/components/tts/TTSHeader";
import Footer from "@/components/Footer";

export default function VoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TTSHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
