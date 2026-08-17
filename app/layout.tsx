import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Syndic360 — Gérez votre copropriété à 360°",
  description:
    "Solution marocaine de gestion de syndic de copropriété multi-résidences.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-page text-text-primary">
        {children}
      </body>
    </html>
  );
}
