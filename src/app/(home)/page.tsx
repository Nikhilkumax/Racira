import { Metadata } from "next";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Features from "@/components/Features";

export const metadata: Metadata = {
  title: "Racira | All Your Essential Tools. One Platform.",
  description:
    "A unified platform for the everyday tools you actually use — calculators, PDF, image, and AI tools. Fast, private, and built for the browser.",
  alternates: {
    canonical: "https://racira.com",
  },
  openGraph: {
    title: "Racira | All Your Essential Tools. One Platform.",
    description:
      "A unified platform for calculators, PDF, image, and AI tools. Fast, private, and built for the browser.",
    url: "https://racira.com",
    siteName: "Racira",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Racira | All Your Essential Tools. One Platform.",
    description:
      "A unified platform for calculators, PDF, image, and AI tools. Fast, private, and built for the browser.",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Features />
    </>
  );
}
