import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredPurchase = {
  email: string;
  orderId: string;
  productId?: string;
  createdAt: string;
};

const purchasesPath = path.join(process.cwd(), "data", "purchases.json");

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function verifyLemonSqueezySignature(body: string, signatureHeader: string): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (!secret || !signatureHeader) {
    return false;
  }

  const digest = createHmac("sha256", secret).update(body, "utf8").digest("hex");

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

export async function readPurchases(): Promise<StoredPurchase[]> {
  try {
    const raw = await readFile(purchasesPath, "utf8");
    const parsed = JSON.parse(raw) as StoredPurchase[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function upsertPurchase(purchase: StoredPurchase): Promise<void> {
  const existing = await readPurchases();
  const email = normalizeEmail(purchase.email);
  const deduped = existing.filter((item) => normalizeEmail(item.email) !== email);
  deduped.push({ ...purchase, email });
  await writeFile(purchasesPath, JSON.stringify(deduped, null, 2), "utf8");
}

export async function hasPaidAccess(email: string): Promise<boolean> {
  const existing = await readPurchases();
  const normalized = normalizeEmail(email);
  return existing.some((item) => normalizeEmail(item.email) === normalized);
}

export function getCheckoutUrl(): string {
  const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;
  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;

  if (!storeId || !productId) {
    return "";
  }

  return `https://checkout.lemonsqueezy.com/buy/${storeId}?checkout[variant_id]=${productId}`;
}

export function checkoutSnippet(): string {
  return `
(function () {
  if (window.createLemonSqueezy) return;
  const script = document.createElement('script');
  script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
  script.defer = true;
  script.onload = function () {
    if (window.LemonSqueezy) {
      window.createLemonSqueezy = true;
    }
  };
  document.head.appendChild(script);
})();
`;
}
