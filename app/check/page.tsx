import type { Metadata } from "next";
import { cookies } from "next/headers";

import { BusinessAnalyzer } from "@/components/BusinessAnalyzer";
import { UnlockAccessPanel } from "@/components/UnlockAccessPanel";
import { Button } from "@/components/ui/button";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Compliance Checker",
  description: "Run Stripe compliance checks on your business model using AI and policy rules."
};

export default async function CheckPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const session = verifyAccessToken(accessToken);

  if (!session) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 space-y-3">
          <h1 className="text-4xl font-semibold text-[#f0f6fc]">Stripe Compliance Checker</h1>
          <p className="max-w-3xl text-[#8b949e]">
            This analysis tool is available to paid subscribers. Purchase once, then unlock access with the checkout
            email to start scanning your business model against Stripe risk categories.
          </p>
        </div>
        <UnlockAccessPanel />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-[#f0f6fc]">Stripe Compliance Checker</h1>
          <p className="mt-1 text-sm text-[#8b949e]">Signed in as {session.email}</p>
        </div>

        <form action="/api/access" method="post">
          <input type="hidden" name="intent" value="logout" />
          <Button type="submit" variant="outline">
            Log Out
          </Button>
        </form>
      </div>

      <BusinessAnalyzer />
    </main>
  );
}
