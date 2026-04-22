import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { analyzeBusinessModel } from "@/lib/ai-analyzer";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/auth";

export const runtime = "nodejs";

const requestSchema = z.object({
  businessDescription: z
    .string()
    .min(120, "Share enough detail: what you sell, who pays, and how funds move.")
    .max(6000, "Description is too long. Keep it under 6000 characters.")
});

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const session = verifyAccessToken(token);

  if (!session) {
    return NextResponse.json({ error: "Paid access required. Please unlock the tool first." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const report = await analyzeBusinessModel(parsed.data.businessDescription);
  return NextResponse.json(report, { status: 200 });
}
