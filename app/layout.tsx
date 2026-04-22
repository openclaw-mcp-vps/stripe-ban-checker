import type { Metadata } from "next";

import "@/app/globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://stripe-ban-checker.com"),
  title: {
    default: "Stripe Ban Checker | Check if your business model violates Stripe",
    template: "%s | Stripe Ban Checker"
  },
  description:
    "Analyze your business model against Stripe prohibited business policies and terms before you apply. Avoid rejection, suspension, and processor blacklisting.",
  openGraph: {
    title: "Stripe Ban Checker",
    description:
      "Check if your business model violates Stripe before you apply. Get risk scoring, policy flags, and mitigation steps.",
    url: "https://stripe-ban-checker.com",
    siteName: "Stripe Ban Checker",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Stripe Ban Checker",
    description:
      "Avoid Stripe rejection with an AI compliance pre-check for prohibited businesses and risky terms."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
