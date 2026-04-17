import Link from "next/link";
import { cookies } from "next/headers";
import { AccessGate } from "@/components/AccessGate";
import { CheckerWorkspace } from "@/components/CheckerWorkspace";
import { getCheckoutUrl } from "@/lib/lemonsqueezy";

export const metadata = {
  title: "Analyzer | Stripe Ban Checker",
  description: "Run a Stripe compliance risk scan on your business model."
};

export default async function CheckPage() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get("sbc_access")?.value;
  const hasAccess = accessCookie === "granted";
  const checkoutUrl = getCheckoutUrl();

  return (
    <main className="min-h-screen bg-transparent">
      <header className="border-b border-[#283341]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="text-sm font-medium text-[#8b949e] hover:text-[#e6edf3]">
            ← Back to landing page
          </Link>
          <p className="mono text-xs text-[#8b949e]">Stripe Ban Checker</p>
        </div>
      </header>

      {hasAccess ? (
        <CheckerWorkspace />
      ) : (
        <div className="px-4 py-16 md:px-8">
          <AccessGate checkoutUrl={checkoutUrl} />
        </div>
      )}
    </main>
  );
}
