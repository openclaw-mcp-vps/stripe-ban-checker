"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, WandSparkles } from "lucide-react";
import { ComplianceReport } from "@/components/ComplianceReport";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { ComplianceReportData } from "@/types/compliance";

type BusinessAnalyzerProps = {
  hasAccess: boolean;
};

const EXAMPLE_PROMPTS = [
  "We are building a B2B SaaS platform for subscription analytics and revenue forecasting for software companies.",
  "We run a marketplace where users buy and sell digital assets and we handle payouts to independent creators.",
  "We provide crypto tax automation for exchanges and wallets, without holding customer funds."
];

export function BusinessAnalyzer({ hasAccess }: BusinessAnalyzerProps) {
  const [businessDescription, setBusinessDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ComplianceReportData | null>(null);

  const canSubmit = hasAccess && businessDescription.trim().length >= 40 && !isLoading;

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setReport(null);

    if (!hasAccess) {
      setError("Unlock the analyzer first to run compliance checks.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessDescription })
      });

      if (response.status === 402) {
        setError("Active subscription required. Complete checkout to unlock analysis.");
        return;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Could not analyze your business model.");
        return;
      }

      const payload = (await response.json()) as { report: ComplianceReportData };
      setReport(payload.report);
    } catch {
      setError("Network error. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className={!hasAccess ? "border-amber-400/30" : "border-cyan-400/20"}>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-2xl text-slate-100">Business Model Analyzer</CardTitle>
            <Badge variant={hasAccess ? "default" : "warn"}>{hasAccess ? "Unlocked" : "Locked"}</Badge>
          </div>
          <p className="text-sm text-slate-400">
            Describe your product, customers, transaction flow, and what you actually charge for. More detail produces a
            more accurate risk readout.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <Textarea
              value={businessDescription}
              onChange={(event) => setBusinessDescription(event.target.value)}
              rows={8}
              placeholder="Example: We operate a marketplace for freelance security researchers. Companies post bounties, researchers submit vulnerability reports, and we hold funds then release payouts after validation."
              disabled={!hasAccess || isLoading}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">{businessDescription.length} characters</p>
              <Button type="submit" disabled={!canSubmit}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <WandSparkles className="mr-2 h-4 w-4" />
                    Analyze for Stripe Risk
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setBusinessDescription(prompt)}
                className="rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
              >
                Use example
              </button>
            ))}
          </div>

          {!hasAccess && (
            <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              The analyzer is behind a paid plan. Complete checkout to unlock full compliance reports.
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <ComplianceReport report={report} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
