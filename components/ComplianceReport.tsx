import { AlertTriangle, BadgeCheck, ShieldAlert } from "lucide-react";
import { RiskMeter } from "@/components/RiskMeter";
import type { ComplianceAnalysis } from "@/lib/ai-analyzer";

type ComplianceReportProps = {
  result: ComplianceAnalysis;
};

export function ComplianceReport({ result }: ComplianceReportProps) {
  return (
    <section className="space-y-5 rounded-2xl border border-[#283341] bg-[#0f151d] p-6">
      <div>
        <h2 className="text-2xl font-semibold">Risk Assessment</h2>
        <p className="mt-2 text-sm text-[#8b949e]">{result.executiveSummary}</p>
      </div>

      <RiskMeter score={result.riskScore} level={result.overallRisk} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#283341] bg-[#11161d] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-medium">
            <ShieldAlert size={18} />
            Detected Issues
          </h3>
          {result.issues.length === 0 ? (
            <p className="text-sm text-[#8b949e]">
              No direct prohibited category match detected. Continue with underwriting-safe positioning.
            </p>
          ) : (
            <ul className="space-y-3">
              {result.issues.map((issue) => (
                <li key={`${issue.category}-${issue.confidence}`} className="rounded-lg border border-[#283341] p-3">
                  <p className="font-medium text-[#e6edf3]">{issue.category}</p>
                  <p className="mt-1 text-sm text-[#8b949e]">{issue.description}</p>
                  <p className="mono mt-2 text-xs text-[#d29922]">
                    Matched: {issue.matchedKeywords.join(", ")} | Confidence: {issue.confidence}%
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#283341] bg-[#11161d] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-medium">
              <AlertTriangle size={18} />
              Recommendations
            </h3>
            <ul className="space-y-2 text-sm text-[#c5d1dd]">
              {result.recommendations.map((recommendation) => (
                <li key={recommendation}>• {recommendation}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[#283341] bg-[#11161d] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-medium">
              <BadgeCheck size={18} />
              Lower-Risk Alternatives
            </h3>
            <ul className="space-y-2 text-sm text-[#c5d1dd]">
              {result.safeAlternatives.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
