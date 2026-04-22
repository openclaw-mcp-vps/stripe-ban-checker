import { NextRequest, NextResponse } from "next/server";

import { extractPurchaseFromWebhook, upsertPurchase, verifyStripeSignature } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSignature = request.headers.get("stripe-signature");

  if (secret) {
    if (!verifyStripeSignature(rawBody, stripeSignature, secret)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const purchase = extractPurchaseFromWebhook(payload);

  if (purchase) {
    await upsertPurchase(purchase);
  }

  return NextResponse.json({ received: true, stored: Boolean(purchase) });
}
