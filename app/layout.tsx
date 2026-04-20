import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://stripe-ban-checker.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Stripe Ban Checker | Check if your business model violates Stripe",
    template: "%s | Stripe Ban Checker"
  },
  description:
    "Analyze your business model against Stripe's prohibited business list and terms. Identify compliance risks before you apply and avoid payment processor blacklisting.",
  keywords: [
    "Stripe compliance checker",
    "Stripe prohibited businesses",
    "payment processor risk",
    "fintech founder tools",
    "high-risk SaaS payments"
  ],
  openGraph: {
    title: "Stripe Ban Checker",
    description:
      "Check if your business model violates Stripe before you apply. Get a compliance score, risk areas, and fixes.",
    type: "website",
    url: "/",
    siteName: "Stripe Ban Checker"
  },
  twitter: {
    card: "summary_large_image",
    title: "Stripe Ban Checker",
    description:
      "Stripe bans entire business categories without clear documentation. Check your risk before onboarding."
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: "/"
  }
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0d1117] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
