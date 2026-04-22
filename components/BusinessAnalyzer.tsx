"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

import type { AnalysisResult } from "@/lib/ai-analyzer";
import { ComplianceReport } from "@/components/ComplianceReport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const MIN_DESCRIPTION_LENGTH = 120;

export function BusinessAnalyzer() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const remainingCharacters = useMemo(
    () => Math.max(0, MIN_DESCRIPTION_LENGTH - description.trim().length),
    [description]
  );

  async function runAnalysis() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ businessDescription: description })
      });

      const payload = (await response.json()) as AnalysisResult | { error?: string };

      if (!response.ok) {
        setResult(null);
        setErrorMessage((payload as { error?: string }).error ?? "Analysis failed. Please try again.");
        return;
      }

      setResult(payload as AnalysisResult);
    } catch {
      setResult(null);
      setErrorMessage("Network error while running analysis. Please retry.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Describe Your Business Model</CardTitle>
          <CardDescription>
            Include what you sell, who pays, how money moves, and any crypto, marketplace, or regulated components.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Example: We run a B2B marketplace for digital lending leads. Borrowers pay nothing, lenders pay us per qualified lead, and we do not hold customer funds."
          />

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-[#8b949e]">
              {remainingCharacters > 0
                ? `Add ${remainingCharacters} more characters for a high-confidence analysis.`
                : "Description length is strong enough for detailed risk detection."}
            </p>

            <Button
              onClick={runAnalysis}
              disabled={isLoading || description.trim().length < MIN_DESCRIPTION_LENGTH}
              className="sm:min-w-44"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run Compliance Check
                </>
              )}
            </Button>
          </div>

          {errorMessage ? (
            <div className="rounded-md border border-[#f85149]/50 bg-[#f85149]/10 px-3 py-2 text-sm text-[#ff7b72]">
              {errorMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {result ? <ComplianceReport result={result} /> : null}
    </div>
  );
}
