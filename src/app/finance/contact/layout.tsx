import { Metadata } from "next";
import { site as FINANCE_SITE } from "@/domains/finance/site";

export const metadata: Metadata = {
  title: `Contact — ${FINANCE_SITE.copyrightName}`,
  description: `Get in touch with the ${FINANCE_SITE.copyrightName} editorial team.`,
  openGraph: {
    title: `Contact — ${FINANCE_SITE.copyrightName}`,
    description: "Get in touch with the Racira Finance editorial team.",
    url: "/contact",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
