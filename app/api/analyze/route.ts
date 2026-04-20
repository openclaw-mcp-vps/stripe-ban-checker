import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeBusinessModel } from "@/lib/ai-analyzer";
import { getAccessCookieName, isAccessCookieValid } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

const requestSchema = z.object({
  businessDescription: z.string().min(40, "Provide at least 40 characters for meaningful analysis.").max(6000)
});

export async function POST(request: Request) {
  const accessCookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${getAccessCookieName()}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!isAccessCookieValid(accessCookie)) {
    return NextResponse.json(
      {
        error: "Active subscription required. Complete checkout to unlock analysis."
      },
      { status: 402 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message || "Invalid request"
      },
      { status: 400 }
    );
  }

  const report = await analyzeBusinessModel(parsed.data.businessDescription);
  return NextResponse.json({ report });
}
