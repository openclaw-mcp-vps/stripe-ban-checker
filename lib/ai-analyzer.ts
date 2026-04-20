import OpenAI from "openai";
import { z } from "zod";
import {
  detectRiskSignals,
  findStripeRuleMatches,
  severityWeight,
  STRIPE_RULES
} from "@/lib/stripe-rules";
import type {
  ComplianceIssue,
  ComplianceReportData,
  Recommendation,
  RiskLevel,
  RuleMatch
} from "@/types/compliance";

const aiIssueSchema = z.object({
  title: z.string().min(4).max(120),
  severity: z.enum(["low", "moderate", "high", "critical"]),
  confidence: z.number().min(0).max(1),
  explanation: z.string().min(12).max(360),
  stripeReference: z.string().min(4).max(160)
});

const aiRecommendationSchema = z.object({
  title: z.string().min(4).max(120),
  priority: z.enum(["now", "next", "later"]),
  action: z.string().min(12).max(280)
});

const aiResponseSchema = z.object({
  score: z.number().int().min(0).max(100),
  verdict: z.enum(["low", "moderate", "high", "critical"]),
  summary: z.string().min(20).max(500),
  issues: z.array(aiIssueSchema).min(1).max(8),
  recommendations: z.array(aiRecommendationSchema).min(2).max(8)
});

function clampScore(input: number) {
  return Math.max(0, Math.min(100, Math.round(input)));
}

function verdictFromScore(score: number): RiskLevel {
  if (score < 30) return "critical";
  if (score < 55) return "high";
  if (score < 80) return "moderate";
  return "low";
}

function pickMostSevere(a: RiskLevel, b: RiskLevel): RiskLevel {
  const ordering: RiskLevel[] = ["low", "moderate", "high", "critical"];
  return ordering.indexOf(a) > ordering.indexOf(b) ? a : b;
}

function dedupeIssues(issues: ComplianceIssue[]) {
  const map = new Map<string, ComplianceIssue>();

  for (const issue of issues) {
    const key = issue.title.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, issue);
      continue;
    }

    const existing = map.get(key);
    if (!existing) continue;

    if (issue.confidence > existing.confidence) {
      map.set(key, issue);
    }
  }

  return [...map.values()];
}

function dedupeRecommendations(recommendations: Recommendation[]) {
  const map = new Map<string, Recommendation>();

  for (const recommendation of recommendations) {
    const key = recommendation.title.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, recommendation);
    }
  }

  return [...map.values()];
}

function buildHeuristicReport(description: string, matches: RuleMatch[]): ComplianceReportData {
  const baseline = 92;
  const severityPenalty = matches.reduce((sum, match) => sum + severityWeight(match.severity) * match.confidence, 0);
  const signals = detectRiskSignals(description);

  let signalPenalty = 0;
  if (signals.mentionsAnonymousPayments) signalPenalty += 16;
  if (signals.mentionsRapidPayouts) signalPenalty += 9;
  if (signals.mentionsChargebackProneLanguage) signalPenalty += 12;
  if (signals.mentionsRegulatedVertical) signalPenalty += 8;

  const score = clampScore(baseline - severityPenalty - signalPenalty);
  const verdict = verdictFromScore(score);

  const issues: ComplianceIssue[] = matches.map((match) => ({
    title: match.title,
    severity: match.severity,
    confidence: match.confidence,
    explanation: `${match.whyItMatters} Matched signals: ${match.matchedKeywords.join(", ")}.`,
    stripeReference: match.stripeReference
  }));

  if (signals.mentionsAnonymousPayments) {
    issues.push({
      title: "Anonymous or no-KYC payment language",
      severity: "high",
      confidence: 0.7,
      explanation:
        "Positioning the product around anonymous payments suggests weak compliance controls and raises processor risk.",
      stripeReference: "Terms of service and AML/KYC compliance expectations"
    });
  }

  if (signals.mentionsChargebackProneLanguage) {
    issues.push({
      title: "Chargeback-prone marketing claims",
      severity: "high",
      confidence: 0.62,
      explanation:
        "Guarantee-heavy promises and strict no-refund wording often correlate with elevated dispute rates.",
      stripeReference: "Card network dispute and refund policy requirements"
    });
  }

  const recommendations: Recommendation[] = [
    {
      title: "Rewrite your public positioning",
      priority: "now",
      action:
        "Remove any wording that implies restricted activity. Emphasize compliant use cases, verified users, and transparent refunds."
    },
    {
      title: "Document onboarding controls",
      priority: "now",
      action:
        "Prepare a one-page risk policy: KYC checks, prohibited-use monitoring, seller/offer review, and dispute handling workflows."
    },
    {
      title: "Prepare Stripe underwriting evidence",
      priority: "next",
      action:
        "Collect terms of service, acceptable use policy, compliance screenshots, and sample transaction flows before applying."
    }
  ];

  if (matches.some((match) => match.severity === "critical" || match.severity === "high")) {
    recommendations.unshift({
      title: "Get legal review before applying",
      priority: "now",
      action:
        "Validate whether your exact flow needs licensing, registration, or region restrictions before submitting to Stripe."
    });
  }

  const summary =
    matches.length === 0
      ? "No direct prohibited-category matches were detected, but you should still present clear compliance controls in your onboarding materials."
      : `Your model triggered ${matches.length} Stripe risk pattern${matches.length > 1 ? "s" : ""}. Tighten product positioning and underwriting documentation before applying.`;

  return {
    businessDescription: description,
    score,
    verdict,
    summary,
    issues: dedupeIssues(issues),
    recommendations: dedupeRecommendations(recommendations),
    ruleMatches: matches,
    generatedAt: new Date().toISOString(),
    analyzerModel: "heuristic-rule-engine-v1"
  };
}

async function maybeRunOpenAIRefinement(
  description: string,
  matches: RuleMatch[],
  heuristic: ComplianceReportData
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });

  const ruleContext = STRIPE_RULES.map((rule) => ({
    id: rule.id,
    title: rule.title,
    severity: rule.severity,
    category: rule.category,
    reference: rule.stripeReference
  }));

  const prompt = {
    business_description: description,
    triggered_rule_matches: matches,
    heuristic_result: {
      score: heuristic.score,
      verdict: heuristic.verdict,
      issues: heuristic.issues,
      recommendations: heuristic.recommendations
    },
    task:
      "Return a conservative Stripe compliance assessment. Be strict when signals are ambiguous. Keep recommendations specific and actionable for founders."
  };

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a payments compliance analyst. Produce JSON with score, verdict, summary, issues, and recommendations."
        },
        {
          role: "user",
          content: JSON.stringify({ rules: ruleContext, input: prompt })
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = aiResponseSchema.safeParse(JSON.parse(content));
    if (!parsed.success) return null;

    return parsed.data;
  } catch {
    return null;
  }
}

export async function analyzeBusinessModel(description: string): Promise<ComplianceReportData> {
  const normalized = description.trim();
  const ruleMatches = findStripeRuleMatches(normalized);
  const heuristicReport = buildHeuristicReport(normalized, ruleMatches);

  const aiRefinement = await maybeRunOpenAIRefinement(normalized, ruleMatches, heuristicReport);
  if (!aiRefinement) {
    return heuristicReport;
  }

  const score = clampScore(Math.min(aiRefinement.score, heuristicReport.score));
  const verdict = pickMostSevere(aiRefinement.verdict, heuristicReport.verdict);

  return {
    ...heuristicReport,
    score,
    verdict,
    summary: aiRefinement.summary,
    issues: dedupeIssues([...heuristicReport.issues, ...aiRefinement.issues]),
    recommendations: dedupeRecommendations([
      ...aiRefinement.recommendations,
      ...heuristicReport.recommendations
    ]),
    analyzerModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini"
  };
}
