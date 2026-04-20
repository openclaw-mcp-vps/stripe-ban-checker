"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Setup: (options: { eventHandler: (event: unknown) => void }) => void;
      Url: { Open: (url: string) => void };
    };
  }
}

type PricingCardProps = {
  compact?: boolean;
};

function getClientCheckoutUrl() {
  const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;
  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  if (!storeId || !productId) return null;

  const params = new URLSearchParams({
    embed: "1",
    media: "0",
    logo: "0",
    "checkout[custom][store_id]": storeId
  });

  return `https://checkout.lemonsqueezy.com/buy/${encodeURIComponent(productId)}?${params.toString()}`;
}

export function PricingCard({ compact = false }: PricingCardProps) {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);
  const [status, setStatus] = useState<string>("");
  const checkoutUrl = useMemo(() => getClientCheckoutUrl(), []);

  const grantAccess = useCallback(
    async (payload?: unknown) => {
      const response = await fetch("/api/access/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ event: payload })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Could not unlock access.");
      }

      setStatus("Payment confirmed. Analyzer unlocked.");
      router.push("/check?purchase=success");
      router.refresh();
    },
    [router]
  );

  const handleLemonEvent = useCallback(
    async (event: unknown) => {
      const maybeEvent = event as { event?: string; data?: { order_id?: string } };
      const eventName = maybeEvent?.event;

      if (!eventName) {
        return;
      }

      if (eventName.toLowerCase().includes("checkout.success")) {
        try {
          await grantAccess(event);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to unlock access.";
          setStatus(message);
        }
      }
    },
    [grantAccess]
  );

  useEffect(() => {
    if (!checkoutUrl || typeof window === "undefined") {
      return;
    }

    const setup = () => {
      window.createLemonSqueezy?.();
      window.LemonSqueezy?.Setup({ eventHandler: handleLemonEvent });
    };

    if (window.LemonSqueezy) {
      setup();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-lemonsqueezy="true"]');
    if (existing) {
      existing.addEventListener("load", setup, { once: true });
      return () => existing.removeEventListener("load", setup);
    }

    const script = document.createElement("script");
    script.src = "https://assets.lemonsqueezy.com/lemon.js";
    script.defer = true;
    script.dataset.lemonsqueezy = "true";
    script.addEventListener("load", setup, { once: true });
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", setup);
    };
  }, [checkoutUrl, handleLemonEvent]);

  const handleCheckout = () => {
    if (!checkoutUrl) {
      setStatus("Missing Lemon Squeezy public env vars.");
      return;
    }

    setIsOpening(true);

    if (typeof window !== "undefined" && window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Setup({ eventHandler: handleLemonEvent });
      window.LemonSqueezy.Url.Open(checkoutUrl);
      setIsOpening(false);
      return;
    }

    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    setIsOpening(false);
  };

  return (
    <Card className="border-cyan-400/30 bg-gradient-to-b from-slate-900 to-slate-950">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-2xl text-slate-100">Stripe Ban Checker Pro</CardTitle>
          <Badge variant="default">$12/mo</Badge>
        </div>
        <p className="text-sm text-slate-400">
          Fast pre-screening before you apply to Stripe. Avoid rejection and avoid getting flagged by downstream processors.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="space-y-2 text-sm text-slate-200">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
            Compliance score + specific risk categories from Stripe policy patterns.
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 text-cyan-300" />
            AI recommendations to rewrite positioning and reduce underwriting friction.
          </li>
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
            Unlimited checks while your subscription is active.
          </li>
        </ul>

        <Button className="w-full" size={compact ? "default" : "lg"} onClick={handleCheckout} disabled={isOpening}>
          {isOpening ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Opening Checkout...
            </>
          ) : (
            <>
              Unlock Full Analyzer
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500">
          Secure payment via Lemon Squeezy checkout overlay. Your access is unlocked instantly after successful payment.
        </p>

        {status && <p className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-cyan-300">{status}</p>}
      </CardContent>
    </Card>
  );
}
