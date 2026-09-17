import { Metadata } from "next";
import { site as FINANCE_SITE } from "@/domains/finance/site";

export const metadata: Metadata = {
  title: `Articles — ${FINANCE_SITE.copyrightName}`,
  description: "Browse all articles on investing, personal finance, markets, and the economy.",
  openGraph: {
    title: `Articles — ${FINANCE_SITE.copyrightName}`,
    description: "Browse all articles on investing, personal finance, markets, and the economy.",
    url: "/blog",
  },
  alternates: {
    canonical: "/blog",
  },
  twitter: {
    card: "summary",
    title: `Articles — ${FINANCE_SITE.copyrightName}`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
