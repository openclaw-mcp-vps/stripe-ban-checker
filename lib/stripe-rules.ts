import prohibitedBusinesses from "@/data/prohibited-businesses.json";

export type RuleSeverity = "low" | "medium" | "high" | "critical";

export type RuleMatch = {
  category: string;
  severity: RuleSeverity;
  description: string;
  matchedKeywords: string[];
  confidence: number;
};

export type RuleScanResult = {
  matches: RuleMatch[];
  riskScore: number;
  overallRisk: RuleSeverity;
};

type RuleEntry = {
  category: string;
  severity: RuleSeverity;
  description: string;
  keywords: string[];
};

const severityWeight: Record<RuleSeverity, number> = {
  low: 10,
  medium: 22,
  high: 34,
  critical: 48
};

const normalizedRules = prohibitedBusinesses as RuleEntry[];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreToOverallRisk(score: number): RuleSeverity {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export function scanBusinessAgainstRules(input: {
  businessName: string;
  businessModel: string;
  targetCustomers: string;
  revenueFlow: string;
}): RuleScanResult {
  const corpus = normalizeText(
    `${input.businessName} ${input.businessModel} ${input.targetCustomers} ${input.revenueFlow}`
  );

  const matches: RuleMatch[] = normalizedRules
    .map((rule) => {
      const matchedKeywords = rule.keywords.filter((keyword) =>
        corpus.includes(keyword.toLowerCase())
      );

      if (matchedKeywords.length === 0) {
        return null;
      }

      const confidence = Math.min(96, 45 + matchedKeywords.length * 12);

      return {
        category: rule.category,
        severity: rule.severity,
        description: rule.description,
        matchedKeywords,
        confidence
      } satisfies RuleMatch;
    })
    .filter((match): match is RuleMatch => Boolean(match));

  const baseScore = matches.reduce(
    (sum, item) => sum + severityWeight[item.severity] + item.matchedKeywords.length * 4,
    0
  );

  const diversificationPenalty = matches.length > 1 ? Math.min(20, matches.length * 5) : 0;
  const riskScore = Math.max(5, Math.min(100, baseScore + diversificationPenalty));

  return {
    matches,
    riskScore,
    overallRisk: scoreToOverallRisk(riskScore)
  };
}

export function generateBaselineRecommendations(scan: RuleScanResult): string[] {
  const base: string[] = [
    "Document your exact money flow, including who pays whom and when funds are settled.",
    "Prepare a transparent Terms of Service and refund policy before onboarding users.",
    "Avoid vague claims in marketing copy, especially financial return or guarantee language."
  ];

  const riskSpecific: Record<RuleSeverity, string[]> = {
    low: ["Maintain a compliance changelog and re-check your model before shipping major features."],
    medium: [
      "Request Stripe pre-approval details in writing before launching paid plans.",
      "Narrow your initial scope to low-risk segments and delay edge-case offerings."
    ],
    high: [
      "Consult payments counsel to validate licensing and underwriting requirements.",
      "Build processor redundancy now (secondary PSP + fallback invoicing flow)."
    ],
    critical: [
      "Do not submit this model to Stripe in its current state; restructure the offering first.",
      "Remove prohibited activity from product scope and separate risky lines into independent entities."
    ]
  };

  return [...base, ...riskSpecific[scan.overallRisk]];
}
