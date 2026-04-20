import * as LemonSqueezySDK from "@lemonsqueezy/lemonsqueezy.js";
import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface PurchaseRecord {
  orderId: string;
  email?: string;
  eventName: string;
  status: "active" | "cancelled" | "refunded";
  createdAt: string;
}

interface PurchaseStore {
  purchases: PurchaseRecord[];
  webhookEvents: Array<{
    eventName: string;
    receivedAt: string;
    payload: unknown;
  }>;
}

const STORE_FILE = path.join(process.cwd(), ".data", "purchases.json");
const ACCESS_COOKIE_NAME = "sbc_access";
const ACCESS_COOKIE_DAYS = 31;

function getCookieSecret() {
  return process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "dev-cookie-secret-change-me";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getCookieSecret()).update(payload).digest("hex");
}

export function createAccessCookieValue() {
  const payload = base64UrlEncode(
    JSON.stringify({
      status: "active",
      exp: Date.now() + ACCESS_COOKIE_DAYS * 24 * 60 * 60 * 1000
    })
  );

  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function isAccessCookieValid(cookieValue?: string | null) {
  if (!cookieValue) return false;

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = signPayload(payload);
  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length) return false;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return false;

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as { status?: string; exp?: number };
    return decoded.status === "active" && typeof decoded.exp === "number" && Date.now() < decoded.exp;
  } catch {
    return false;
  }
}

async function loadStore(): Promise<PurchaseStore> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as PurchaseStore;

    return {
      purchases: parsed.purchases ?? [],
      webhookEvents: parsed.webhookEvents ?? []
    };
  } catch {
    return { purchases: [], webhookEvents: [] };
  }
}

async function saveStore(store: PurchaseStore) {
  await mkdir(path.dirname(STORE_FILE), { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function persistWebhookEvent(eventName: string, payload: unknown) {
  const store = await loadStore();
  store.webhookEvents.push({
    eventName,
    payload,
    receivedAt: new Date().toISOString()
  });
  store.webhookEvents = store.webhookEvents.slice(-1000);
  await saveStore(store);
}

export async function upsertPurchaseRecord(record: PurchaseRecord) {
  const store = await loadStore();
  const index = store.purchases.findIndex((entry) => entry.orderId === record.orderId);

  if (index >= 0) {
    store.purchases[index] = record;
  } else {
    store.purchases.push(record);
  }

  store.purchases = store.purchases.slice(-5000);
  await saveStore(store);
}

export async function hasRecordedPurchase(orderId: string) {
  const store = await loadStore();
  return store.purchases.some((entry) => entry.orderId === orderId && entry.status === "active");
}

export function verifyLemonWebhookSignature(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const providedBuffer = Buffer.from(signatureHeader, "hex");
  const expectedBuffer = Buffer.from(digest, "hex");

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function getCheckoutUrl(returnTo?: string) {
  const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;
  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  if (!storeId || !productId) return null;

  const base = `https://checkout.lemonsqueezy.com/buy/${encodeURIComponent(productId)}`;
  const query = new URLSearchParams({
    embed: "1",
    media: "0",
    logo: "0",
    "checkout[custom][store_id]": storeId
  });

  if (returnTo) {
    query.set("checkout[success_url]", returnTo);
  }

  return `${base}?${query.toString()}`;
}

export function getAccessCookieName() {
  return ACCESS_COOKIE_NAME;
}

export function getAccessCookieMaxAge() {
  return ACCESS_COOKIE_DAYS * 24 * 60 * 60;
}

export function getLemonSqueezySDKVersionHint() {
  return Object.keys(LemonSqueezySDK).length > 0 ? "sdk-loaded" : "sdk-missing";
}
