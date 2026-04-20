import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAccessCookieValue,
  getAccessCookieMaxAge,
  getAccessCookieName,
  upsertPurchaseRecord
} from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

const bodySchema = z
  .object({
    event: z
      .object({
        event: z.string().optional(),
        data: z
          .object({
            order_id: z.union([z.string(), z.number()]).optional()
          })
          .passthrough()
          .optional()
      })
      .passthrough()
      .optional()
  })
  .passthrough();

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventName = parsed.data.event?.event;
  if (eventName && !eventName.toLowerCase().includes("checkout.success")) {
    return NextResponse.json({ error: "Unsupported checkout event" }, { status: 400 });
  }

  const maybeOrderId = parsed.data.event?.data?.order_id;
  if (maybeOrderId !== undefined) {
    await upsertPurchaseRecord({
      orderId: String(maybeOrderId),
      eventName: eventName || "checkout.success",
      status: "active",
      createdAt: new Date().toISOString()
    });
  }

  const response = NextResponse.json({ unlocked: true });
  response.cookies.set({
    name: getAccessCookieName(),
    value: createAccessCookieValue(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: getAccessCookieMaxAge(),
    path: "/"
  });

  return response;
}
