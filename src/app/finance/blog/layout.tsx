import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles — Racira Finance",
  description: "Browse all articles on investing, personal finance, markets, and the economy.",
  openGraph: {
    title: "Articles — Racira Finance",
    description: "Browse all articles on investing, personal finance, markets, and the economy.",
    url: "/blog",
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
