import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deep Work Session Planner — Plan focused 90-minute blocks | Racira",
  description:
    "Free Deep Work Session Planner. Set an intention, choose a 50/10 or 90/15 block structure, run a distraction-free timer, and log your focus sessions. No sign-up.",
  openGraph: {
    title: "Deep Work Session Planner — Racira",
    description:
      "Plan distraction-free deep work sessions with a built-in timer, pre-flight checklist, and session log.",
    type: "website",
    url: "/tools/deep-work-session-planner",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deep Work Session Planner — Racira",
    description:
      "Free planner + timer for distraction-free deep work sessions. 50/10, 90/15, or custom blocks.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Deep Work Session Planner",
            applicationCategory: "ProductivityApplication",
            operatingSystem: "Any",
            description:
              "Free planner and timer for distraction-free deep work sessions with customizable focus and break blocks.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      {children}
    </>
  );
}
