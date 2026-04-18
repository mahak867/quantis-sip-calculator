import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quantis — Advanced SIP Calculator",
  description:
    "Free SIP calculator with step-up SIP, inflation adjustment, LTCG tax estimation, and goal tracking. Built for Indian retail investors.",
  keywords: ["SIP calculator", "mutual fund", "investment", "India", "LTCG", "step-up SIP"],
  openGraph: {
    title: "Quantis — Advanced SIP Calculator",
    description: "Calculate SIP returns with step-up, inflation, and tax — built for Indian investors.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
