import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Racira Finance",
  description: "Get in touch with the Racira Finance editorial team.",
  openGraph: {
    title: "Contact — Racira Finance",
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
