"use client";

import { useState } from "react";
import { Loader2, SearchCheck } from "lucide-react";
import type { ComplianceAnalysis } from "@/lib/ai-analyzer";

type BusinessFormProps = {
  onResult: (result: ComplianceAnalysis) => void;
};

export function BusinessForm({ onResult }: BusinessFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [targetCustomers, setTargetCustomers] = useState("");
  const [revenueFlow, setRevenueFlow] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          businessName,
          businessModel,
          targetCustomers,
          revenueFlow
        })
      });

      const data = (await response.json()) as {
        error?: string;
        result?: ComplianceAnalysis;
      };

      if (!response.ok || !data.result) {
        throw new Error(data.error ?? "Unable to analyze this business model.");
      }

      onResult(data.result);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unexpected error while analyzing."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#283341] bg-[#11161d] p-6">
      <div>
        <h2 className="text-2xl font-semibold">Describe Your Business</h2>
        <p className="mt-2 text-sm text-[#8b949e]">
          Include your product, customer profile, onboarding flow, and how payments move between parties.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-[#c5d1dd]">Business Name</span>
        <input
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
          required
          className="w-full rounded-lg border border-[#283341] bg-[#0d1117] px-3 py-2 outline-none ring-[#2ea043] focus:ring-2"
          placeholder="Example: VendorFlow"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[#c5d1dd]">Business Model</span>
        <textarea
          value={businessModel}
          onChange={(event) => setBusinessModel(event.target.value)}
          required
          minLength={30}
          rows={5}
          className="w-full rounded-lg border border-[#283341] bg-[#0d1117] px-3 py-2 outline-none ring-[#2ea043] focus:ring-2"
          placeholder="Explain what you sell, how users interact, and any regulated activities involved."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-[#c5d1dd]">Target Customers</span>
          <input
            value={targetCustomers}
            onChange={(event) => setTargetCustomers(event.target.value)}
            required
            className="w-full rounded-lg border border-[#283341] bg-[#0d1117] px-3 py-2 outline-none ring-[#2ea043] focus:ring-2"
            placeholder="Example: US-based SMB marketplaces"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#c5d1dd]">Revenue Flow</span>
          <input
            value={revenueFlow}
            onChange={(event) => setRevenueFlow(event.target.value)}
            required
            className="w-full rounded-lg border border-[#283341] bg-[#0d1117] px-3 py-2 outline-none ring-[#2ea043] focus:ring-2"
            placeholder="Who pays, who receives funds, and when"
          />
        </label>
      </div>

      {error ? <p className="rounded-lg border border-[#f85149] bg-[#2a1315] p-3 text-sm">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-lg bg-[#2ea043] px-4 py-2 font-medium text-[#0d1117] transition hover:bg-[#3fb950] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <SearchCheck size={16} />}
        Analyze Compliance Risk
      </button>
    </form>
  );
}
