import { HomeClient } from "@/domains/colors/components/home-client";
import { COLORS_SITE } from "@/domains/colors/site";

// Count derives from the registry (COLORS_SITE.title) — the old hardcoded
// "100+" disagreed with the hero's "226".
export const metadata = {
  title: COLORS_SITE.title,
  description: "Convert, pick, mix, extract and check colors. 100+ free color tools in one place. No signup required.",
  openGraph: {
    title: COLORS_SITE.title,
    description: "Convert, pick, mix, extract and check colors. 100+ free color tools in one place.",
  },
  twitter: {
    card: "summary",
    title: COLORS_SITE.title,
  },
};

export default function Home() {
  return (
    <>
        <HomeClient />
      </>
  );
}
