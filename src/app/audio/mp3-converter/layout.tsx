import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MP3 Converter — Convert Audio to MP3 Online Free | Racira Audio",
  description: "Free online MP3 converter. Convert WAV, OGG, FLAC, M4A and more to MP3 at 128, 192 or 320 kbps. Fast, private and fully in your browser — no uploads.",
  openGraph: {
    title: "MP3 Converter — Convert Audio to MP3 Online Free",
    description: "Convert any audio to MP3 at up to 320 kbps, instantly and privately in your browser. No signup, no uploads.",
    url: "/audio/mp3-converter",
    type: "website",
  },
  alternates: {
    canonical: "/audio/mp3-converter"
  }
};

export default function Mp3ConverterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        id="mp3-software-schema"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "MP3 Converter",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Web",
            url: "/audio/mp3-converter",
            description:
              "Free online MP3 converter that converts audio files to MP3 at 128, 192 or 320 kbps directly in the browser.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        id="mp3-breadcrumb-schema"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Audio Conversion", item: "/" },
              {
                "@type": "ListItem",
                position: 3,
                name: "MP3 Converter",
                item: "/audio/mp3-converter",
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        id="mp3-faq-schema"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is the MP3 Converter free?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. The Racira Audio MP3 Converter is completely free with no signup or limits.",
                },
              },
              {
                "@type": "Question",
                name: "Are my files uploaded to a server?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Conversion happens entirely in your browser, so your audio never leaves your device.",
                },
              },
              {
                "@type": "Question",
                name: "What bitrates are supported?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can convert to MP3 at 128 kbps, 192 kbps or 320 kbps.",
                },
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
