import { HomeClient } from "@/domains/colors/components/home-client";

export const metadata = {
  title: "Racira Colors — 100+ Free Color Tools",
  description: "Convert, pick, mix, extract and check colors. 100+ free color tools in one place. No signup required.",
  openGraph: {
    title: "Racira Colors — Fast, Simple & Free Color Tools",
    description: "Convert, pick, mix, extract and check colors. 100+ free color tools in one place.",
  },
};

export default function Home() {
  return (
    <>
        <HomeClient />
      </>
  );
}
