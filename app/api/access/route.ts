import { NextResponse } from "next/server";
import { z } from "zod";
import { hasPaidAccess } from "@/lib/lemonsqueezy";

const AccessSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = AccessSchema.parse(body);

    const access = await hasPaidAccess(email);

    if (!access) {
      return NextResponse.json(
        { error: "No completed purchase found for that email yet." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      name: "sbc_access",
      value: "granted",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
}
