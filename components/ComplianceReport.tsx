import { AlertTriangle, CircleCheck, ShieldAlert, ShieldCheck } from "lucide-react";

import type { AnalysisResult } from "@/lib/ai-analyzer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ComplianceReportProps = {
  result: AnalysisResult;
};

function scoreTone(score: number) {
  if (score >= 80) {
    return {
      label: "Strong",
      badge: "success" as const,
      indicator: "bg-[#2ea043]"
    };
  }

  if (score >= 60) {
    return {
      label: "Needs Review",
      badge: "warning" as const,
      indicator: "bg-[#d29922]"
    };
  }

  return {
    label: "High Risk",
    badge: "danger" as const,
    indicator: "bg-[#f85149]"
  };
}

function severityVariant(severity: string) {
  if (severity === "critical" || severity === "high") {
    return "danger" as const;
  }
  if (severity === "medium") {
    return "warning" as const;
  }
  return "default" as const;
}

export function ComplianceReport({ result }: ComplianceReportProps) {
  const tone = scoreTone(result.complianceScore);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            {result.complianceScore >= 80 ? (
              <ShieldCheck className="h-6 w-6 text-[#3fb950]" />
            ) : result.complianceScore >= 60 ? (
              <AlertTriangle className="h-6 w-6 text-[#f2cc60]" />
            ) : (
              <ShieldAlert className="h-6 w-6 text-[#ff7b72]" />
            )}
            Compliance Score: {result.complianceScore}/100
          </CardTitle>
          <CardDescription>{result.summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Badge variant={tone.badge}>{tone.label}</Badge>
            <span className="text-xs uppercase tracking-wide text-[#8b949e]">
              Method: {result.analysisMethod === "hybrid-ai" ? "AI + policy rules" : "Policy rules"}
            </span>
          </div>
          <Progress value={result.complianceScore} indicatorClassName={tone.indicator} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flagged Risk Areas</CardTitle>
          <CardDescription>These items are likely to trigger manual underwriting or outright rejection.</CardDescription>
        </CardHeader>
        <CardContent>
          {result.flaggedAreas.length === 0 ? (
            <div className="flex items-start gap-2 rounded-md border border-[#2ea043]/40 bg-[#2ea043]/10 p-4 text-sm text-[#7ee787]">
              <CircleCheck className="mt-0.5 h-4 w-4" />
              <p>No direct prohibited-category signals were detected in your description.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {result.flaggedAreas.map((area, index) => (
                <div key={`${area.category}-${index}`} className="rounded-md border border-[#30363d] bg-[#0d1117] p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-[#f0f6fc]">{area.category}</h4>
                    <Badge variant={severityVariant(area.severity)}>{area.severity.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-[#c9d1d9]">{area.reason}</p>
                  <p className="mt-2 text-xs text-[#8b949e]">Evidence: {area.evidence}</p>
                  <p className="text-xs text-[#8b949e]">Reference: {area.policyReference}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action Plan</CardTitle>
          <CardDescription>Use these steps before submitting your Stripe application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#8b949e]">Recommendations</h4>
            <ul className="list-disc space-y-2 pl-5 text-sm text-[#c9d1d9]">
              {result.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {result.saferAlternatives.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#8b949e]">Safer Positioning Ideas</h4>
              <ul className="list-disc space-y-2 pl-5 text-sm text-[#c9d1d9]">
                {result.saferAlternatives.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
