import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAISON — Curated Fashion",
  description: "Premium clothing marketplace for men and women",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
