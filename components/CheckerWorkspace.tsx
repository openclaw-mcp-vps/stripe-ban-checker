"use client";

import { useState } from "react";
import { BusinessForm } from "@/components/BusinessForm";
import { ComplianceReport } from "@/components/ComplianceReport";
import type { ComplianceAnalysis } from "@/lib/ai-analyzer";

export function CheckerWorkspace() {
  const [result, setResult] = useState<ComplianceAnalysis | null>(null);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 md:px-8">
      <BusinessForm onResult={setResult} />
      {result ? <ComplianceReport result={result} /> : null}
    </div>
  );
}
