
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function VoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-voice flex min-h-screen flex-col">
      <Header mode="category" categoryName="Voice" />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
