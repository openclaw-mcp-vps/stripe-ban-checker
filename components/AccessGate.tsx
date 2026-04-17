"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutButton } from "@/components/CheckoutButton";

type AccessGateProps = {
  checkoutUrl: string;
};

export function AccessGate({ checkoutUrl }: AccessGateProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Access verification failed.");
      }

      setStatus("Access granted. Loading analyzer...");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to verify purchase.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-[#283341] bg-[#11161d] p-6">
      <h1 className="text-2xl font-semibold">Unlock the Compliance Analyzer</h1>
      <p className="mt-2 text-sm text-[#8b949e]">
        This diagnostic tool is available to active subscribers at <span className="mono">$12/mo</span>.
      </p>

      <div className="mt-5 space-y-3">
        <CheckoutButton
          checkoutUrl={checkoutUrl}
          className="w-full rounded-lg bg-[#2ea043] px-4 py-2 font-medium text-[#0d1117] transition hover:bg-[#3fb950] disabled:cursor-not-allowed disabled:opacity-70"
        >
          Start Subscription in Lemon Squeezy
        </CheckoutButton>

        <label className="block space-y-2">
          <span className="text-sm text-[#c5d1dd]">Purchased already? Enter your checkout email:</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="founder@company.com"
            className="w-full rounded-lg border border-[#283341] bg-[#0d1117] px-3 py-2 outline-none ring-[#2ea043] focus:ring-2"
          />
        </label>

        <button
          type="button"
          onClick={handleUnlock}
          disabled={loading || !email}
          className="w-full rounded-lg border border-[#2ea043] px-4 py-2 font-medium text-[#2ea043] transition hover:bg-[#123420] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Checking purchase..." : "Verify Purchase and Unlock"}
        </button>

        {status ? <p className="text-sm text-[#8b949e]">{status}</p> : null}
      </div>
    </section>
  );
}
