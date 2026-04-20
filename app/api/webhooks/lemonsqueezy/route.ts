import { NextResponse } from "next/server";
import { z } from "zod";
import {
  persistWebhookEvent,
  upsertPurchaseRecord,
  verifyLemonWebhookSignature
} from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

const webhookSchema = z
  .object({
    meta: z
      .object({
        event_name: z.string(),
        custom_data: z.record(z.any()).optional()
      })
      .passthrough(),
    data: z
      .object({
        id: z.union([z.string(), z.number()]).optional(),
        attributes: z.record(z.any()).optional()
      })
      .passthrough()
  })
  .passthrough();

function parseStatus(eventName: string): "active" | "cancelled" | "refunded" {
  if (eventName.includes("cancel") || eventName.includes("expired")) return "cancelled";
  if (eventName.includes("refund")) return "refunded";
  return "active";
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const parsed = webhookSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Unsupported webhook shape" }, { status: 400 });
  }

  const eventName = parsed.data.meta.event_name;
  await persistWebhookEvent(eventName, parsed.data);

  const attributes = parsed.data.data.attributes ?? {};
  const orderIdValue =
    attributes.order_id ??
    attributes.identifier ??
    attributes.subscription_id ??
    parsed.data.data.id ??
    parsed.data.meta.custom_data?.order_id;

  const orderId = orderIdValue ? String(orderIdValue) : "";
  const email =
    (typeof attributes.user_email === "string" && attributes.user_email) ||
    (typeof attributes.email === "string" && attributes.email) ||
    undefined;

  if (orderId) {
    await upsertPurchaseRecord({
      orderId,
      email,
      eventName,
      status: parseStatus(eventName),
      createdAt: new Date().toISOString()
    });
  }

  return NextResponse.json({ received: true });
}
