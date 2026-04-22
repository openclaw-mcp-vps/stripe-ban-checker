import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ShieldAlert, Target, Zap } from "lucide-react";

import { PricingCard } from "@/components/PricingCard";

export const metadata: Metadata = {
  title: "Check if your business model violates Stripe",
  description:
    "Stripe Ban Checker flags prohibited and high-risk business patterns before your payment stack gets rejected."
};

const PROBLEM_POINTS = [
  "Stripe can reject entire verticals after you already built onboarding and billing.",
  "One rejection can cascade to higher reserves or denials from other processors.",
  "Founders in fintech and marketplace models often misdescribe fund flow and trigger bans."
];

const SOLUTION_POINTS = [
  "Score your model against prohibited and restricted categories.",
  "See exactly which policy areas trigger risk and why.",
  "Get concrete mitigation language before submitting your Stripe application."
];

const FAQS = [
  {
    question: "Does this guarantee Stripe approval?",
    answer:
      "No tool can guarantee approval because Stripe underwriters evaluate full business context, risk history, and jurisdiction. This product gives you a materially better first-pass submission by removing obvious policy red flags."
  },
  {
    question: "Who should use Stripe Ban Checker?",
    answer:
      "Early-stage SaaS and fintech founders, especially marketplace, crypto-adjacent, and high-risk vertical operators who need to validate payment compliance before launch."
  },
  {
    question: "What happens after I pay?",
    answer:
      "Use the same email at checkout and unlock the analyzer from the /check page. Access is stored in a secure httpOnly cookie after verification."
  },
  {
    question: "How accurate is the analysis?",
    answer:
      "The engine combines deterministic Stripe-policy keyword detection with optional OpenAI reasoning for context. It is built to catch practical underwriting risk, not replace legal counsel."
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:pt-20">
        <div className="rounded-2xl border border-[#30363d] bg-[#111827]/70 p-8 shadow-2xl sm:p-12">
          <div className="max-w-3xl space-y-6">
            <p className="inline-flex rounded-full border border-[#1f6feb]/50 bg-[#1f6feb]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#58a6ff]">
              fintech-tools
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight text-[#f0f6fc] sm:text-5xl">
              Check if your business model violates Stripe before you get rejected.
            </h1>
            <p className="text-lg text-[#8b949e]">
              Stripe bans entire categories without clear upfront documentation. Stripe Ban Checker analyzes your offer,
              fund flow, and billing model so you can fix compliance issues before underwriting blocks your growth.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/check"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#238636] px-6 text-sm font-semibold text-white transition hover:bg-[#2ea043]"
              >
                Start Compliance Check
              </Link>
              <a
                href="#pricing"
                className="inline-flex h-11 items-center justify-center rounded-md border border-[#30363d] px-6 text-sm font-semibold text-[#c9d1d9] transition hover:bg-[#161b22]"
              >
                See Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-14 sm:grid-cols-3 sm:px-6">
        <div className="rounded-xl border border-[#30363d] bg-[#0f1620] p-5">
          <ShieldAlert className="h-6 w-6 text-[#ff7b72]" />
          <p className="mt-3 text-sm text-[#c9d1d9]">
            Prevent sudden payment shutdown by detecting prohibited business signals early.
          </p>
        </div>
        <div className="rounded-xl border border-[#30363d] bg-[#0f1620] p-5">
          <Target className="h-6 w-6 text-[#58a6ff]" />
          <p className="mt-3 text-sm text-[#c9d1d9]">
            Align your positioning with what Stripe underwriters actually look for.
          </p>
        </div>
        <div className="rounded-xl border border-[#30363d] bg-[#0f1620] p-5">
          <Zap className="h-6 w-6 text-[#f2cc60]" />
          <p className="mt-3 text-sm text-[#c9d1d9]">
            Get actionable fixes in minutes instead of learning from a rejected application.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-[#30363d] bg-[#111827]/50 p-6">
            <h2 className="text-2xl font-semibold text-[#f0f6fc]">The Problem</h2>
            <ul className="mt-4 space-y-3 text-sm text-[#c9d1d9]">
              {PROBLEM_POINTS.map((point) => (
                <li key={point} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-[#ff7b72]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[#30363d] bg-[#111827]/50 p-6">
            <h2 className="text-2xl font-semibold text-[#f0f6fc]">The Solution</h2>
            <ul className="mt-4 space-y-3 text-sm text-[#c9d1d9]">
              {SOLUTION_POINTS.map((point) => (
                <li key={point} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#3fb950]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <h2 className="mb-6 text-center text-3xl font-semibold text-[#f0f6fc]">Simple Pricing</h2>
        <PricingCard />
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <h2 className="mb-6 text-center text-3xl font-semibold text-[#f0f6fc]">FAQ</h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <article key={faq.question} className="rounded-xl border border-[#30363d] bg-[#111827]/60 p-5">
              <h3 className="text-lg font-semibold text-[#f0f6fc]">{faq.question}</h3>
              <p className="mt-2 text-sm text-[#c9d1d9]">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
