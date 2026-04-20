export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface RuleMatch {
  id: string;
  title: string;
  category: string;
  severity: RiskLevel;
  confidence: number;
  matchedKeywords: string[];
  whyItMatters: string;
  stripeReference: string;
}

export interface ComplianceIssue {
  title: string;
  severity: RiskLevel;
  confidence: number;
  explanation: string;
  stripeReference: string;
}

export interface Recommendation {
  title: string;
  priority: "now" | "next" | "later";
  action: string;
}

export interface ComplianceReportData {
  businessDescription: string;
  score: number;
  verdict: RiskLevel;
  summary: string;
  issues: ComplianceIssue[];
  recommendations: Recommendation[];
  ruleMatches: RuleMatch[];
  generatedAt: string;
  analyzerModel: string;
}
