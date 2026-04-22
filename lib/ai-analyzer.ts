import OpenAI from "openai";
import { z } from "zod";

import { type FlaggedArea, analyzeAgainstStripeRules } from "@/lib/stripe-rules";

export const analysisSchema = z.object({
  complianceScore: z.number().int().min(0).max(100),
  verdict: z.enum(["low-risk", "review-needed", "high-risk", "prohibited"]),
  summary: z.string().min(30),
  flaggedAreas: z.array(
    z.object({
      category: z.string().min(3),
      severity: z.enum(["low", "medium", "high", "critical"]),
      reason: z.string().min(10),
      evidence: z.string().min(8),
      policyReference: z.string().min(10)
    })
  ),
  recommendations: z.array(z.string().min(12)).min(3),
  saferAlternatives: z.array(z.string().min(6)).max(6),
  analysisMethod: z.enum(["rules-only", "hybrid-ai"])
});

export type AnalysisResult = z.infer<typeof analysisSchema>;

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function fromRulesOnly(input: string): AnalysisResult {
  const baseline = analyzeAgainstStripeRules(input);

  return {
    ...baseline,
    analysisMethod: "rules-only"
  };
}

function mergeWithBaseline(
  aiResult: AnalysisResult,
  baseline: ReturnType<typeof analyzeAgainstStripeRules>
): AnalysisResult {
  const mergedFlaggedAreas: FlaggedArea[] = Array.from(
    new Map(
      [...aiResult.flaggedAreas, ...baseline.flaggedAreas].map((item) => [
        `${item.category}:${item.severity}`,
        item
      ])
    ).values()
  );

  const recommendations = Array.from(new Set([...aiResult.recommendations, ...baseline.recommendations])).slice(0, 8);
  const saferAlternatives = Array.from(new Set([...aiResult.saferAlternatives, ...baseline.saferAlternatives])).slice(0, 6);

  const score = Math.min(aiResult.complianceScore, baseline.complianceScore + 10);

  const hasCritical = mergedFlaggedAreas.some((item) => item.severity === "critical");
  const hasHigh = mergedFlaggedAreas.some((item) => item.severity === "high");

  const verdict: AnalysisResult["verdict"] = hasCritical
    ? "prohibited"
    : hasHigh
      ? "high-risk"
      : score < 80
        ? "review-needed"
        : "low-risk";

  return {
    ...aiResult,
    complianceScore: Math.max(0, Math.min(100, score)),
    verdict,
    flaggedAreas: mergedFlaggedAreas,
    recommendations,
    saferAlternatives,
    analysisMethod: "hybrid-ai" as const
  };
}

export async function analyzeBusinessModel(input: string): Promise<AnalysisResult> {
  const baseline = analyzeAgainstStripeRules(input);

  if (!openaiClient) {
    return {
      ...baseline,
      analysisMethod: "rules-only",
      summary:
        `${baseline.summary} AI deep analysis is not active because OPENAI_API_KEY is not configured.`
    };
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a Stripe compliance analyst for startup businesses. Return JSON only using this schema: complianceScore (0-100 int), verdict (low-risk|review-needed|high-risk|prohibited), summary, flaggedAreas[{category,severity,reason,evidence,policyReference}], recommendations[3-8], saferAlternatives[0-6], analysisMethod (set to hybrid-ai)."
        },
        {
          role: "user",
          content: `Analyze this business model for Stripe compatibility:\n\n${input}`
        }
      ]
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return fromRulesOnly(input);
    }

    const parsed = analysisSchema.parse(JSON.parse(responseText));
    return mergeWithBaseline(parsed, baseline);
  } catch {
    return {
      ...fromRulesOnly(input),
      summary: `${baseline.summary} AI analysis failed, so this report uses deterministic policy rules only.`
    };
  }
}
