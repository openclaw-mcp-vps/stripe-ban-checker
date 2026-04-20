import Link from "next/link";
import { AlertOctagon, BadgeCheck, CreditCard, Radar, ShieldAlert } from "lucide-react";
import { PricingCard } from "@/components/PricingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const painPoints = [
  {
    title: "Category bans are broad",
    description:
      "Stripe can reject entire verticals based on risk posture, even when your use case is legitimate and not obviously prohibited.",
    icon: AlertOctagon
  },
  {
    title: "One bad application hurts future options",
    description:
      "A rejected underwriting profile can reduce your odds with other processors and put your fundraising timeline at risk.",
    icon: ShieldAlert
  },
  {
    title: "Founders guess instead of preparing",
    description:
      "Most teams apply with vague descriptions, missing policies, and no risk controls, which increases rejection probability.",
    icon: Radar
  }
];

const faq = [
  {
    question: "Does this guarantee Stripe approval?",
    answer:
      "No tool can guarantee approval. This product gives a conservative pre-screen, highlights likely red flags, and helps you present a cleaner underwriting package."
  },
  {
    question: "Who is this built for?",
    answer:
      "Early-stage SaaS and fintech founders in edge categories such as marketplaces, crypto-adjacent products, lending workflows, or regulated service layers."
  },
  {
    question: "What do I need to provide?",
    answer:
      "A plain-language description of your product, user types, transaction flow, what you charge for, and how money moves between parties."
  },
  {
    question: "How quickly can I run checks?",
    answer:
      "Each report is generated in seconds. Most founders run multiple versions while refining their website copy and underwriting responses."
  }
];

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-[0_25px_60px_rgba(2,6,23,0.45)] backdrop-blur sm:p-10">
          <div className="max-w-3xl space-y-6">
            <p className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
              Fintech Compliance Intelligence
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-100 sm:text-5xl">
              Check if your business model violates Stripe before you apply.
            </h1>
            <p className="text-lg leading-relaxed text-slate-300">
              Stripe bans entire business categories with limited upfront clarity. Stripe Ban Checker scores your model,
              flags risky terms from your positioning, and gives concrete fixes so you can apply with confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/check">
                <Button size="lg">Run Your First Check</Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </a>
            </div>
          </div>
        </header>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-slate-100 sm:text-3xl">Why founders get blocked</h2>
          <p className="mt-3 max-w-3xl text-slate-400">
            Payments risk teams care about exposure, not just intent. If your model sounds adjacent to prohibited or
            heavily restricted activity, you need stronger framing and controls.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {painPoints.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
                    <item.icon className="h-5 w-5 text-cyan-300" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-slate-300">{item.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <CreditCard className="h-5 w-5 text-cyan-300" />
                1. Describe Your Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Enter how users pay, who receives funds, and where risk lives. The analyzer works best with operational
              details, not marketing slogans.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <ShieldAlert className="h-5 w-5 text-cyan-300" />
                2. See Risk Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Get a compatibility score, issue severity, and category-level concerns tied to Stripe policy patterns.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <BadgeCheck className="h-5 w-5 text-cyan-300" />
                3. Fix Before Applying
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Follow practical recommendations to reduce underwriting friction and present your business in a compliant,
              reviewable way.
            </CardContent>
          </Card>
        </section>

        <section id="pricing" className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-3xl font-semibold text-slate-100">Simple pricing for high-stakes decisions</h2>
            <p className="mt-3 text-slate-300">
              The wrong processor application can delay revenue for months. For $12/month, you can screen every pivot,
              onboarding flow, and copy update before it reaches Stripe risk review.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              <li>Unlimited business model checks</li>
              <li>Rule-based and AI-assisted risk explanation</li>
              <li>Actionable rewrite guidance for underwriting</li>
              <li>Built for founders in gray-area fintech verticals</li>
            </ul>
          </div>
          <PricingCard />
        </section>

        <section className="mt-16" id="faq">
          <h2 className="text-3xl font-semibold text-slate-100">FAQ</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faq.map((entry) => (
              <Card key={entry.question}>
                <CardHeader>
                  <CardTitle className="text-base text-slate-100">{entry.question}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-slate-300">{entry.answer}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
