"use client";

import { AlertTriangle, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComplianceReportData, ComplianceIssue, RiskLevel } from "@/types/compliance";

type ComplianceReportProps = {
  report: ComplianceReportData;
};

function badgeForSeverity(severity: RiskLevel): "default" | "warn" | "danger" | "muted" {
  if (severity === "critical" || severity === "high") return "danger";
  if (severity === "moderate") return "warn";
  if (severity === "low") return "default";
  return "muted";
}

function severityLabel(severity: RiskLevel) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function priorityTone(priority: "now" | "next" | "later") {
  if (priority === "now") return "text-rose-300";
  if (priority === "next") return "text-amber-300";
  return "text-cyan-300";
}

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-300";
  if (score >= 55) return "text-amber-300";
  return "text-rose-300";
}

function sortBySeverity(issues: ComplianceIssue[]) {
  const order: Record<RiskLevel, number> = {
    critical: 4,
    high: 3,
    moderate: 2,
    low: 1
  };

  return [...issues].sort((a, b) => order[b.severity] - order[a.severity]);
}

export function ComplianceReport({ report }: ComplianceReportProps) {
  const orderedIssues = sortBySeverity(report.issues);

  return (
    <div className="space-y-5">
      <Card className="border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-xl text-slate-100">Compliance Readout</CardTitle>
          <Badge variant={report.verdict === "low" ? "default" : "danger"}>{severityLabel(report.verdict)} Risk</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stripe Compatibility Score</p>
            <p className={`mt-2 text-4xl font-semibold ${scoreTone(report.score)}`}>{report.score}/100</p>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400"
                style={{ width: `${report.score}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm leading-relaxed text-slate-300">
            {report.summary}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-xs text-slate-500">Detected Risks</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{report.issues.length}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-xs text-slate-500">Rule Matches</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{report.ruleMatches.length}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-xs text-slate-500">Analyzer Model</p>
              <p className="mt-2 text-sm font-medium text-slate-100">{report.analyzerModel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
              <ShieldAlert className="h-5 w-5 text-rose-300" />
              Risk Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderedIssues.length === 0 && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                No direct prohibited-category issues found from your description.
              </div>
            )}

            {orderedIssues.map((issue) => (
              <div key={issue.title} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-100">{issue.title}</p>
                  <Badge variant={badgeForSeverity(issue.severity)}>{severityLabel(issue.severity)}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-300">{issue.explanation}</p>
                <p className="mt-2 text-xs text-slate-500">{issue.stripeReference}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
              <CheckCircle2 className="h-5 w-5 text-cyan-300" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.recommendations.map((recommendation) => (
              <div key={recommendation.title} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-100">{recommendation.title}</p>
                  <span className={`text-xs uppercase tracking-wide ${priorityTone(recommendation.priority)}`}>
                    {recommendation.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{recommendation.action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
          <p>
            This report is a pre-screening tool, not legal advice. Stripe underwriting decisions depend on your exact flow,
            geography, licenses, and historical chargeback profile.
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2 text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          Generated {new Date(report.generatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
