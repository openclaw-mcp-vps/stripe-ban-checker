import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { BusinessAnalyzer } from "@/components/BusinessAnalyzer";
import { PricingCard } from "@/components/PricingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessCookieName, isAccessCookieValid } from "@/lib/lemonsqueezy";

export const metadata: Metadata = {
  title: "Analyzer",
  description:
    "Run a Stripe compliance pre-check for your business model and identify prohibited-category risks before you apply."
};

type CheckPageProps = {
  searchParams: Promise<{ purchase?: string }>;
};

export default async function CheckPage({ searchParams }: CheckPageProps) {
  const cookieStore = await cookies();
  const params = await searchParams;
  const accessCookie = cookieStore.get(getAccessCookieName())?.value;
  const hasAccess = isAccessCookieValid(accessCookie);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-100">Stripe Ban Risk Analyzer</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Test how your business description may look to Stripe underwriting and detect high-risk language before you
            submit an application.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      {params.purchase === "success" && !hasAccess && (
        <Card className="mb-6 border-cyan-400/30 bg-cyan-500/10">
          <CardContent className="p-4 text-sm text-cyan-200">
            Purchase was detected. If your access has not unlocked yet, refresh this page in a few seconds.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <BusinessAnalyzer hasAccess={hasAccess} />

        {!hasAccess ? (
          <div className="space-y-4">
            <PricingCard compact />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-slate-100">What you unlock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <p>1. Compliance score tuned to Stripe policy exposure.</p>
                <p>2. Specific risk areas mapped to prohibited/restricted categories.</p>
                <p>3. Prioritized mitigation steps for underwriting readiness.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-100">Access Active</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Your subscription is active for this browser. You can run unlimited checks while your plan remains active.
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
