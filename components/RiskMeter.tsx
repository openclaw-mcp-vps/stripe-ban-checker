"use client";

import { motion } from "framer-motion";
import type { RuleSeverity } from "@/lib/stripe-rules";

type RiskMeterProps = {
  score: number;
  level: RuleSeverity;
};

const levelColor: Record<RuleSeverity, string> = {
  low: "#2ea043",
  medium: "#d29922",
  high: "#f0883e",
  critical: "#f85149"
};

export function RiskMeter({ score, level }: RiskMeterProps) {
  return (
    <div className="rounded-xl border border-[#283341] bg-[#11161d] p-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-[#8b949e]">Compliance Risk Score</p>
        <span className="mono text-xs uppercase tracking-wide" style={{ color: levelColor[level] }}>
          {level}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#1c2430]">
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ backgroundColor: levelColor[level] }}
        />
      </div>
      <p className="mt-2 mono text-sm text-[#e6edf3]">{score}/100</p>
    </div>
  );
}
