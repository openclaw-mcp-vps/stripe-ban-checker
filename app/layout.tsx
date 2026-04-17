import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"]
});

const siteUrl = "https://stripe-ban-checker.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Stripe Ban Checker | Check if your business model violates Stripe",
  description:
    "Analyze your business model against Stripe's prohibited business list and terms before applying. Avoid surprise rejections and processor blacklisting.",
  keywords: [
    "Stripe compliance checker",
    "Stripe prohibited businesses",
    "Stripe risk assessment",
    "payment processor compliance",
    "fintech founder tools"
  ],
  openGraph: {
    title: "Stripe Ban Checker",
    description:
      "Find Stripe compliance risks before you apply. Get a detailed risk report and practical mitigation steps.",
    type: "website",
    url: siteUrl,
    siteName: "Stripe Ban Checker"
  },
  twitter: {
    card: "summary_large_image",
    title: "Stripe Ban Checker",
    description:
      "Avoid Stripe rejection. Analyze your business model for prohibited or high-risk patterns before you apply."
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
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
