import OpenAI from "openai";
import {
  generateBaselineRecommendations,
  scanBusinessAgainstRules,
  type RuleMatch,
  type RuleSeverity
} from "@/lib/stripe-rules";

export type ComplianceAnalysis = {
  businessName: string;
  riskScore: number;
  overallRisk: RuleSeverity;
  executiveSummary: string;
  issues: RuleMatch[];
  recommendations: string[];
  safeAlternatives: string[];
};

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function extractJson(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return text.slice(start, end + 1);
}

function localFallback(input: {
  businessName: string;
  businessModel: string;
  targetCustomers: string;
  revenueFlow: string;
}): ComplianceAnalysis {
  const scan = scanBusinessAgainstRules(input);
  const recommendations = generateBaselineRecommendations(scan);

  const safeAlternatives = [
    "Start with invoice-only billing for vetted B2B customers while you collect underwriting evidence.",
    "Segment higher-risk features into manual review flows with stricter KYC and delayed payouts.",
    "Offer lower-risk paid tiers first, then request expanded processing capabilities after positive history."
  ];

  const summary =
    scan.matches.length === 0
      ? "No direct prohibited-category keywords were detected, but Stripe can still flag unclear money-flow or marketing practices."
      : `Detected ${scan.matches.length} potential compliance risk area(s) tied to Stripe's restricted categories.`;

  return {
    businessName: input.businessName,
    riskScore: scan.riskScore,
    overallRisk: scan.overallRisk,
    executiveSummary: summary,
    issues: scan.matches,
    recommendations,
    safeAlternatives
  };
}

export async function analyzeBusinessModel(input: {
  businessName: string;
  businessModel: string;
  targetCustomers: string;
  revenueFlow: string;
}): Promise<ComplianceAnalysis> {
  const fallback = localFallback(input);

  if (!openaiClient) {
    return fallback;
  }

  try {
    const completion = await openaiClient.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a Stripe compliance analyst. Return strict JSON only. Focus on prohibited businesses and underwriting risk indicators."
        },
        {
          role: "user",
          content: `Analyze this business:\n${JSON.stringify(input)}\n\nBaseline findings:\n${JSON.stringify(
            fallback
          )}\n\nReturn JSON with keys: executiveSummary, recommendations (string[]), safeAlternatives (string[]).`
        }
      ],
      temperature: 0.2
    });

    const outputText = completion.output_text;
    const jsonText = extractJson(outputText);

    if (!jsonText) {
      return fallback;
    }

    const parsed = JSON.parse(jsonText) as {
      executiveSummary?: string;
      recommendations?: string[];
      safeAlternatives?: string[];
    };

    return {
      ...fallback,
      executiveSummary: parsed.executiveSummary?.trim() || fallback.executiveSummary,
      recommendations:
        parsed.recommendations?.filter((item) => item.trim().length > 0) ||
        fallback.recommendations,
      safeAlternatives:
        parsed.safeAlternatives?.filter((item) => item.trim().length > 0) ||
        fallback.safeAlternatives
    };
  } catch {
    return fallback;
  }
}
