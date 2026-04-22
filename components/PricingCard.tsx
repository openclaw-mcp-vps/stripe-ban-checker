import { CheckCircle2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PricingCardProps = {
  compact?: boolean;
};

const FEATURES = [
  "Unlimited business model scans",
  "Stripe-specific prohibited category detection",
  "Risk score with policy references",
  "Actionable mitigation plan before you apply",
  "Cookie-based account access after purchase"
];

export function PricingCard({ compact = false }: PricingCardProps) {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-b from-[#161b22] to-[#0d1117]">
      <CardHeader>
        <CardTitle className="text-2xl">Stripe Ban Checker Pro</CardTitle>
        <CardDescription>Built for founders in gray-area fintech and marketplace models.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-4xl font-bold text-[#f0f6fc]">$12<span className="text-lg font-medium text-[#8b949e]">/month</span></p>
          <p className="mt-1 text-sm text-[#8b949e]">Cancel any time. No setup fee.</p>
        </div>

        <ul className="space-y-3 text-sm">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-[#c9d1d9]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#3fb950]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {paymentLink ? (
          <a
            href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ size: compact ? "default" : "lg" }), "w-full")}
          >
            Buy Now
          </a>
        ) : (
          <p className="rounded-md border border-[#f85149]/40 bg-[#f85149]/10 p-3 text-sm text-[#ff7b72]">
            Add NEXT_PUBLIC_STRIPE_PAYMENT_LINK to enable checkout.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
