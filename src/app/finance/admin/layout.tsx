import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Racira Finance",
  robots: "noindex,nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}