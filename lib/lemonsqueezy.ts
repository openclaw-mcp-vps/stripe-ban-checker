import { createHmac, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type PurchaseRecord = {
  email: string;
  source: "stripe" | "lemonsqueezy";
  reference: string;
  paidAt: string;
  amount?: number;
  currency?: string;
};

const DATA_DIRECTORY = path.join(process.cwd(), ".data");
const PURCHASES_FILE = path.join(DATA_DIRECTORY, "purchases.json");

async function ensureDataFile() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  try {
    await fs.access(PURCHASES_FILE);
  } catch {
    await fs.writeFile(PURCHASES_FILE, JSON.stringify({ purchases: [] }, null, 2), "utf8");
  }
}

async function readPurchaseStore() {
  await ensureDataFile();
  const raw = await fs.readFile(PURCHASES_FILE, "utf8");
  const parsed = JSON.parse(raw) as { purchases?: PurchaseRecord[] };
  return parsed.purchases ?? [];
}

async function writePurchaseStore(purchases: PurchaseRecord[]) {
  await ensureDataFile();
  await fs.writeFile(PURCHASES_FILE, JSON.stringify({ purchases }, null, 2), "utf8");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hasActivePurchase(email: string) {
  const normalized = normalizeEmail(email);
  const purchases = await readPurchaseStore();
  return purchases.some((purchase) => normalizeEmail(purchase.email) === normalized);
}

export async function upsertPurchase(record: PurchaseRecord) {
  const normalizedRecord: PurchaseRecord = {
    ...record,
    email: normalizeEmail(record.email)
  };

  const purchases = await readPurchaseStore();
  const existingIndex = purchases.findIndex(
    (purchase) =>
      normalizeEmail(purchase.email) === normalizedRecord.email ||
      (purchase.reference === normalizedRecord.reference && purchase.source === normalizedRecord.source)
  );

  if (existingIndex >= 0) {
    purchases[existingIndex] = {
      ...purchases[existingIndex],
      ...normalizedRecord
    };
  } else {
    purchases.push(normalizedRecord);
  }

  await writePurchaseStore(purchases);
}

export function verifyStripeSignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split(",").reduce<Record<string, string>>((accumulator, item) => {
    const [key, value] = item.split("=");
    if (key && value) {
      accumulator[key.trim()] = value.trim();
    }
    return accumulator;
  }, {});

  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = createHmac("sha256", secret).update(signedPayload).digest("hex");

  const incomingBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (incomingBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(incomingBuffer, expectedBuffer);
}

export function extractPurchaseFromWebhook(payload: unknown): PurchaseRecord | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybeStripeEvent = payload as {
    type?: string;
    data?: {
      object?: {
        id?: string;
        amount_total?: number;
        currency?: string;
        created?: number;
        customer_email?: string;
        customer_details?: {
          email?: string;
        };
      };
    };
  };

  if (maybeStripeEvent.type === "checkout.session.completed") {
    const session = maybeStripeEvent.data?.object;
    const email = session?.customer_details?.email || session?.customer_email;

    if (!email || !session?.id) {
      return null;
    }

    return {
      email,
      source: "stripe",
      reference: session.id,
      paidAt: session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString(),
      amount: session.amount_total,
      currency: session.currency
    };
  }

  const maybeLemonEvent = payload as {
    meta?: {
      event_name?: string;
      custom_data?: {
        email?: string;
      };
    };
    data?: {
      id?: string;
      attributes?: {
        user_email?: string;
        created_at?: string;
        total?: number;
        currency?: string;
      };
    };
  };

  if (maybeLemonEvent.meta?.event_name === "order_created") {
    const email =
      maybeLemonEvent.meta.custom_data?.email ||
      maybeLemonEvent.data?.attributes?.user_email;

    if (!email || !maybeLemonEvent.data?.id) {
      return null;
    }

    return {
      email,
      source: "lemonsqueezy",
      reference: maybeLemonEvent.data.id,
      paidAt: maybeLemonEvent.data.attributes?.created_at ?? new Date().toISOString(),
      amount: maybeLemonEvent.data.attributes?.total,
      currency: maybeLemonEvent.data.attributes?.currency
    };
  }

  return null;
}
