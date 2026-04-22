import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ACCESS_COOKIE_NAME, createAccessToken, getAccessCookieOptions } from "@/lib/auth";
import { hasActivePurchase } from "@/lib/lemonsqueezy";

const emailSchema = z.object({
  email: z.string().email(),
  intent: z.string().optional()
});

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();

    if (formData.get("intent") === "logout") {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.set(ACCESS_COOKIE_NAME, "", {
        ...getAccessCookieOptions(),
        maxAge: 0
      });
      return response;
    }

    const parsed = emailSchema.safeParse({
      email: String(formData.get("email") ?? ""),
      intent: String(formData.get("intent") ?? "")
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/check", request.url));
    }

    const email = normalizeEmail(parsed.data.email);
    const paid = await hasActivePurchase(email);

    if (!paid) {
      return NextResponse.redirect(new URL("/check", request.url));
    }

    const response = NextResponse.redirect(new URL("/check", request.url));
    response.cookies.set(ACCESS_COOKIE_NAME, createAccessToken(email), getAccessCookieOptions());
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const parsed = emailSchema.safeParse(body);

  if (!parsed.success || !parsed.data.email) {
    return NextResponse.json({ error: "Provide a valid checkout email." }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const paid = await hasActivePurchase(email);

  if (!paid) {
    return NextResponse.json(
      {
        error:
          "No completed payment was found for that email yet. Use the same checkout email and allow a moment for webhook sync."
      },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE_NAME, createAccessToken(email), getAccessCookieOptions());
  return response;
}
