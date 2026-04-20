import type { RiskLevel, RuleMatch } from "@/types/compliance";

export interface StripeRule {
  id: string;
  title: string;
  category: string;
  severity: RiskLevel;
  keywords: string[];
  whyItMatters: string;
  stripeReference: string;
}

export const STRIPE_RULES: StripeRule[] = [
  {
    id: "adult-content",
    title: "Explicit Adult Content",
    category: "Content",
    severity: "critical",
    keywords: ["porn", "adult cam", "escort", "onlyfans management", "explicit content", "nude"],
    whyItMatters:
      "Stripe generally prohibits explicit sexual content businesses and related services in standard onboarding.",
    stripeReference: "Prohibited and restricted businesses: adult content and services"
  },
  {
    id: "gambling",
    title: "Unlicensed Gambling",
    category: "Gaming",
    severity: "critical",
    keywords: ["sports betting", "casino", "lottery", "wager", "poker with cash", "bookmaker"],
    whyItMatters:
      "Betting and games of chance require licensing and jurisdiction-specific approvals that most startups lack.",
    stripeReference: "Restricted business: gambling and games of chance"
  },
  {
    id: "counterfeit-or-illegal",
    title: "Counterfeit or Illegal Goods",
    category: "Commerce",
    severity: "critical",
    keywords: ["counterfeit", "fake ids", "stolen accounts", "pirated software", "illegal drugs", "weapons"],
    whyItMatters:
      "Selling illegal goods or services is prohibited and results in immediate account closure.",
    stripeReference: "Prohibited business: illegal products and services"
  },
  {
    id: "high-risk-financial",
    title: "High-Risk Financial Products",
    category: "Financial",
    severity: "high",
    keywords: [
      "binary options",
      "forex signals",
      "investment returns",
      "securities crowdfunding",
      "unlicensed lending",
      "debt collection"
    ],
    whyItMatters:
      "Financial services are highly regulated; missing licenses or disclosures can trigger rejection.",
    stripeReference: "Restricted business: financial and investment services"
  },
  {
    id: "crypto-exchange-custody",
    title: "Crypto Exchange or Custody Exposure",
    category: "Crypto",
    severity: "high",
    keywords: ["crypto exchange", "custodial wallet", "token launch", "on-ramp", "off-ramp", "stablecoin yield"],
    whyItMatters:
      "Crypto-adjacent services can be supported only in limited forms and regions with additional controls.",
    stripeReference: "Crypto restrictions and regional policy requirements"
  },
  {
    id: "marketplace-risk",
    title: "Marketplace Facilitation Risk",
    category: "Platform",
    severity: "moderate",
    keywords: ["marketplace", "gig platform", "multi-vendor", "payouts to sellers", "escrow", "merchant of record"],
    whyItMatters:
      "Marketplaces are allowed but need explicit funds flow design, KYC, and clear seller onboarding controls.",
    stripeReference: "Stripe Connect compliance and platform requirements"
  },
  {
    id: "health-claims",
    title: "Medical or Supplement Claims",
    category: "Healthcare",
    severity: "high",
    keywords: ["miracle cure", "medical diagnosis", "prescription", "supplement", "pharmaceutical", "telemedicine"],
    whyItMatters:
      "Regulated healthcare products need compliant claims language and often additional payment controls.",
    stripeReference: "Restricted business: healthcare and regulated products"
  },
  {
    id: "remote-tech-support",
    title: "Remote Tech Support / Scam Signals",
    category: "Services",
    severity: "high",
    keywords: ["remote pc fix", "virus cleanup service", "computer support hotline", "unlock account fee"],
    whyItMatters:
      "Remote support businesses have high fraud/chargeback risk and are commonly restricted.",
    stripeReference: "Restricted business: deceptive or high-fraud services"
  },
  {
    id: "ip-infringement",
    title: "IP Infringement Exposure",
    category: "Commerce",
    severity: "high",
    keywords: ["brand replicas", "movie streaming clone", "licensed logos", "resold software keys"],
    whyItMatters:
      "Intellectual property violations drive dispute rates and can trigger processor bans.",
    stripeReference: "Prohibited business: intellectual property infringement"
  }
];

function normalizeText(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
}

export function findStripeRuleMatches(description: string): RuleMatch[] {
  const text = normalizeText(description);

  return STRIPE_RULES.map((rule) => {
    const matchedKeywords = rule.keywords.filter((keyword) => text.includes(keyword.toLowerCase()));

    if (matchedKeywords.length === 0) {
      return null;
    }

    const keywordCoverage = matchedKeywords.length / rule.keywords.length;
    const confidence = Math.min(0.95, 0.4 + keywordCoverage * 0.7);

    return {
      id: rule.id,
      title: rule.title,
      category: rule.category,
      severity: rule.severity,
      confidence,
      matchedKeywords,
      whyItMatters: rule.whyItMatters,
      stripeReference: rule.stripeReference
    } satisfies RuleMatch;
  }).filter((match): match is RuleMatch => Boolean(match));
}

export function detectRiskSignals(description: string) {
  const text = normalizeText(description);

  return {
    mentionsAnonymousPayments: /anonymous|no[-\s]?kyc|private payment|burner/i.test(text),
    mentionsRapidPayouts: /instant payout|same day payout|fast cashout/i.test(text),
    mentionsChargebackProneLanguage: /guaranteed return|double your money|no refund/i.test(text),
    mentionsRegulatedVertical: /casino|crypto|medical|lending|adult|supplement/i.test(text)
  };
}

export function severityWeight(level: RiskLevel): number {
  switch (level) {
    case "critical":
      return 28;
    case "high":
      return 18;
    case "moderate":
      return 10;
    case "low":
      return 4;
    default:
      return 0;
  }
}
