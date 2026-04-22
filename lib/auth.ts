import { createHmac, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE_NAME = "sbc_access";

const ACCESS_TTL_SECONDS = 60 * 60 * 24 * 30;

type AccessPayload = {
  email: string;
  exp: number;
  iat: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSigningSecret() {
  return process.env.ACCESS_COOKIE_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "local-dev-signing-secret";
}

function sign(payloadBase64: string) {
  return createHmac("sha256", getSigningSecret()).update(payloadBase64).digest("base64url");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createAccessToken(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccessPayload = {
    email: normalizeEmail(email),
    iat: now,
    exp: now + ACCESS_TTL_SECONDS
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAccessToken(token: string | undefined) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AccessPayload;
    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp < now || !payload.email) {
      return null;
    }

    return {
      email: payload.email,
      exp: payload.exp,
      iat: payload.iat
    };
  } catch {
    return null;
  }
}

export function getAccessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_TTL_SECONDS
  };
}
