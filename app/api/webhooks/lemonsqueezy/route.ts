import { NextResponse } from "next/server";
import { upsertPurchase, verifyLemonSqueezySignature } from "@/lib/lemonsqueezy";

function extractPurchase(data: unknown): { email: string; orderId: string; productId?: string } | null {
  const payload = data as {
    data?: {
      id?: string;
      attributes?: {
        user_email?: string;
        identifier?: string;
        product_id?: number | string;
      };
    };
    meta?: {
      custom_data?: {
        email?: string;
      };
    };
  };

  const attributes = payload?.data?.attributes;
  const email = attributes?.user_email ?? payload?.meta?.custom_data?.email;
  const orderId = attributes?.identifier ?? payload?.data?.id;
  const productId = attributes?.product_id ? String(attributes.product_id) : undefined;

  if (!email || !orderId) {
    return null;
  }

  return {
    email,
    orderId,
    productId
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";

  if (!verifyLemonSqueezySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const purchase = extractPurchase(payload);

  if (!purchase) {
    return NextResponse.json({ received: true, skipped: true });
  }

  await upsertPurchase({
    ...purchase,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ received: true });
}
