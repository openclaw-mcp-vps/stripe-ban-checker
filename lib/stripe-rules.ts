export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type FlaggedArea = {
  category: string;
  severity: RiskSeverity;
  reason: string;
  evidence: string;
  policyReference: string;
};

type RuleDefinition = {
  id: string;
  category: string;
  severity: RiskSeverity;
  keywords: string[];
  reason: string;
  policyReference: string;
  recommendations: string[];
  saferAlternatives: string[];
};

const PROHIBITED_RULES: RuleDefinition[] = [
  {
    id: "unlicensed-money-transmission",
    category: "Unlicensed money transmission",
    severity: "critical",
    keywords: ["money transmitter", "remittance", "send money", "money transfer", "custody", "hold customer funds"],
    reason:
      "Stripe typically requires regulated licensing for businesses that move, hold, or transmit customer funds on behalf of others.",
    policyReference: "Stripe Prohibited and Restricted Businesses: Money transmission and unlicensed financial services",
    recommendations: [
      "Clarify that Stripe only processes your service fee, not customer principal funds.",
      "Use a licensed banking-as-a-service provider for custodial or remittance flows.",
      "Document your fund flow with a ledger and settlement timeline before applying."
    ],
    saferAlternatives: [
      "SaaS billing model where users pay only platform subscription fees",
      "Marketplace split-payments through licensed partners with documented KYC/AML controls"
    ]
  },
  {
    id: "sanctioned-or-illicit-activity",
    category: "Sanctions or illicit facilitation",
    severity: "critical",
    keywords: ["sanction", "darknet", "fraud toolkit", "carding", "anonymous shell company", "launder"],
    reason:
      "Stripe blocks businesses that facilitate illegal activity, sanctions evasion, or fraud-enabling services.",
    policyReference: "Stripe Terms: Illegal products/services and sanctions compliance",
    recommendations: [
      "Remove any language implying anonymity for prohibited activity.",
      "Add explicit sanctions screening and prohibited-use controls.",
      "Publish acceptable use policy and enforce account monitoring."
    ],
    saferAlternatives: [
      "Compliance-focused fraud prevention tools", "RegTech analytics for licensed institutions"
    ]
  },
  {
    id: "adult-services",
    category: "Adult content or services",
    severity: "high",
    keywords: ["adult content", "cam site", "escort", "porn", "explicit content", "onlyfans agency"],
    reason:
      "Adult content and related services are heavily restricted and commonly declined without a dedicated high-risk setup.",
    policyReference: "Stripe Restricted Businesses: Adult content and services",
    recommendations: [
      "Avoid ambiguous language around explicit content monetization.",
      "If applicable, separate compliant software tooling from adult media monetization.",
      "Prepare moderation and age-verification evidence for underwriting review."
    ],
    saferAlternatives: ["Creator CRM software without content monetization", "General social media scheduling tools"]
  },
  {
    id: "gambling-or-lotteries",
    category: "Gambling, betting, or sweepstakes",
    severity: "high",
    keywords: ["sportsbook", "casino", "betting", "wager", "lottery", "raffle", "prediction market"],
    reason:
      "Gambling and wagering flows are tightly regulated and usually restricted by payment processors.",
    policyReference: "Stripe Restricted Businesses: Gambling, games of chance, and betting",
    recommendations: [
      "Avoid taking stake funds directly through Stripe.",
      "Segment any game platform fees from wager handling.",
      "Confirm jurisdictional licensing requirements before launch."
    ],
    saferAlternatives: ["Skill-based competition software with no cash wagers", "Fantasy analytics subscriptions"]
  },
  {
    id: "weapons-or-controlled-goods",
    category: "Weapons or controlled goods",
    severity: "high",
    keywords: ["firearm", "ghost gun", "ammo", "weapon accessory", "silencer", "switchblade"],
    reason: "Weapons, ammunition, and certain controlled goods often trigger immediate account rejection.",
    policyReference: "Stripe Prohibited Businesses: Weapons and controlled goods",
    recommendations: [
      "Remove direct weapon sales from Stripe processing.",
      "Use alternative acquirers specialized for regulated categories.",
      "Keep Stripe limited to non-regulated software fees if possible."
    ],
    saferAlternatives: ["General e-commerce software subscriptions", "Compliance training for retailers"]
  },
  {
    id: "counterfeit-or-infringement",
    category: "Counterfeit or IP infringement",
    severity: "high",
    keywords: ["replica", "counterfeit", "bootleg", "fake brand", "pirated", "unlicensed stream"],
    reason: "Businesses enabling counterfeit goods or copyright infringement are typically prohibited.",
    policyReference: "Stripe Terms: Infringing goods and intellectual property violations",
    recommendations: [
      "Require seller verification and IP complaint handling workflows.",
      "Add takedown SLAs and automated listing checks.",
      "Prohibit replica and unauthorized branded inventory in your terms."
    ],
    saferAlternatives: ["Verified seller marketplaces", "Digital storefront tools with strict content policies"]
  }
];

const HIGH_RISK_RULES: RuleDefinition[] = [
  {
    id: "crypto-adjacent",
    category: "Crypto-adjacent operations",
    severity: "medium",
    keywords: ["crypto", "defi", "on-ramp", "off-ramp", "wallet", "stablecoin", "token"],
    reason:
      "Crypto-adjacent businesses can be approved, but underwriting usually requires detailed controls and clear product scope.",
    policyReference: "Stripe Restricted Businesses: Cryptocurrency and virtual assets",
    recommendations: [
      "Describe whether you custody assets, execute trades, or only provide analytics/software.",
      "Document KYC, AML, and transaction monitoring controls.",
      "Separate high-risk flows from recurring software billing."
    ],
    saferAlternatives: ["Non-custodial analytics SaaS", "Compliance reporting tools for licensed exchanges"]
  },
  {
    id: "marketplace-funds-flow",
    category: "Marketplace with third-party payouts",
    severity: "medium",
    keywords: ["marketplace", "escrow", "seller payout", "split payment", "take rate", "platform fee"],
    reason:
      "Marketplace models are supported, but unclear fund flows and payout responsibilities raise underwriting risk.",
    policyReference: "Stripe Connect underwriting guidance",
    recommendations: [
      "State who is merchant of record and when funds settle.",
      "Use Stripe Connect or licensed payout providers for third-party disbursement.",
      "Publish chargeback, refund, and dispute liability ownership."
    ],
    saferAlternatives: ["Lead generation marketplaces with off-platform settlement", "SaaS listing platforms with no payment handling"]
  },
  {
    id: "health-supplements-medical-claims",
    category: "Supplements or medical claims",
    severity: "medium",
    keywords: ["supplement", "fat loss", "cure", "medical claim", "prescription", "pharma"],
    reason:
      "Health products with aggressive claims have elevated dispute and compliance risk.",
    policyReference: "Stripe Restricted Businesses: Pharmaceuticals and certain health products",
    recommendations: [
      "Remove unsubstantiated efficacy claims.",
      "Document refund and customer support policies clearly.",
      "Keep compliance documentation for product claims and approvals."
    ],
    saferAlternatives: ["Wellness coaching subscriptions", "Educational content with no medical claims"]
  },
  {
    id: "chargeback-prone-patterns",
    category: "Chargeback-prone billing patterns",
    severity: "low",
    keywords: ["free trial then", "negative option", "no refunds", "instant payout", "high-ticket coaching"],
    reason: "Opaque billing terms and aggressive offers increase chargeback rates, which can trigger reserves or account closure.",
    policyReference: "Stripe Terms: Dispute and fraud thresholds",
    recommendations: [
      "Use explicit renewal disclosures and clear cancellation paths.",
      "Offer transparent refunds and support response SLAs.",
      "Send pre-renewal reminders for trial conversions."
    ],
    saferAlternatives: ["Transparent monthly subscriptions", "Usage-based billing with clear invoicing"]
  }
];

function includesAnyKeyword(normalizedText: string, keywords: string[]) {
  return keywords.filter((keyword) => normalizedText.includes(keyword));
}

function severityPenalty(severity: RiskSeverity) {
  switch (severity) {
    case "critical":
      return 38;
    case "high":
      return 24;
    case "medium":
      return 14;
    case "low":
      return 7;
    default:
      return 0;
  }
}

export type RuleScanResult = {
  complianceScore: number;
  verdict: "low-risk" | "review-needed" | "high-risk" | "prohibited";
  summary: string;
  flaggedAreas: FlaggedArea[];
  recommendations: string[];
  saferAlternatives: string[];
};

export function analyzeAgainstStripeRules(input: string): RuleScanResult {
  const normalized = input.toLowerCase();
  const matches: Array<RuleDefinition & { matchedKeywords: string[] }> = [];

  for (const rule of [...PROHIBITED_RULES, ...HIGH_RISK_RULES]) {
    const matchedKeywords = includesAnyKeyword(normalized, rule.keywords.map((keyword) => keyword.toLowerCase()));
    if (matchedKeywords.length > 0) {
      matches.push({ ...rule, matchedKeywords });
    }
  }

  let score = 100;
  for (const match of matches) {
    score -= severityPenalty(match.severity);
  }
  score = Math.max(0, Math.min(100, score));

  const hasCritical = matches.some((match) => match.severity === "critical");
  const hasHigh = matches.some((match) => match.severity === "high");
  const hasMedium = matches.some((match) => match.severity === "medium");

  const verdict = hasCritical
    ? "prohibited"
    : hasHigh
      ? "high-risk"
      : hasMedium || score < 80
        ? "review-needed"
        : "low-risk";

  const flaggedAreas: FlaggedArea[] = matches.map((match) => ({
    category: match.category,
    severity: match.severity,
    reason: match.reason,
    evidence: `Detected keywords: ${match.matchedKeywords.join(", ")}`,
    policyReference: match.policyReference
  }));

  const recommendations = Array.from(new Set(matches.flatMap((match) => match.recommendations))).slice(0, 8);
  const saferAlternatives = Array.from(new Set(matches.flatMap((match) => match.saferAlternatives))).slice(0, 6);

  const summary =
    matches.length === 0
      ? "No obvious Stripe policy conflicts were found in your description. You still need clear billing, dispute handling, and compliance docs during underwriting."
      : `Found ${matches.length} policy-sensitive areas. Focus on fund flow clarity, regulatory controls, and transparent billing before applying.`;

  return {
    complianceScore: score,
    verdict,
    summary,
    flaggedAreas,
    recommendations:
      recommendations.length > 0
        ? recommendations
        : [
            "Document your merchant-of-record setup and exact customer payment flow.",
            "Publish clear refund, cancellation, and dispute policies.",
            "Prepare KYC/AML and sanctions controls if your product touches financial movement."
          ],
    saferAlternatives
  };
}
