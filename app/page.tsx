import Link from "next/link";
import { ArrowRight, Ban, CircleAlert, ShieldCheck, Zap } from "lucide-react";
import { CheckoutButton } from "@/components/CheckoutButton";
import { Button } from "@/components/ui/button";
import { getCheckoutUrl } from "@/lib/lemonsqueezy";

const faqs = [
  {
    q: "How accurate is the risk analysis?",
    a: "The checker combines deterministic rule matching against prohibited categories with AI interpretation for edge-case context. It is not legal advice, but it catches common rejection patterns before you apply."
  },
  {
    q: "Do I still need legal counsel?",
    a: "For high-risk or regulated models, yes. Use this tool as a pre-screen to reduce obvious payment-compliance mistakes before paying for legal review."
  },
  {
    q: "What happens after I subscribe?",
    a: "You unlock the analyzer immediately. After checkout, verify your purchase email once and the tool remains accessible with a secure access cookie."
  }
];

export default function HomePage() {
  const checkoutUrl = getCheckoutUrl();

  return (
    <main className="min-h-screen bg-transparent text-[#e6edf3]">
      <section className="relative overflow-hidden border-b border-[#283341] px-4 py-20 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mono mb-4 inline-flex rounded-full border border-[#283341] bg-[#11161d] px-3 py-1 text-xs text-[#8b949e]">
              fintech-tools • $12/mo
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Check if your business model violates Stripe
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[#8b949e]">
              Stripe rejects entire categories with little warning. One wrong compliance assumption can block
              your launch and hurt your ability to get approved elsewhere.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-auto bg-[#2ea043] px-5 py-3 text-[#0d1117] hover:bg-[#3fb950]">
                <Link href="/check" className="inline-flex items-center justify-center gap-2">
                  Go to Analyzer
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <CheckoutButton
                checkoutUrl={checkoutUrl}
                className="inline-flex items-center justify-center rounded-lg border border-[#283341] bg-[#11161d] px-5 py-3 font-medium text-[#c5d1dd] transition hover:border-[#3b4b5f]"
              >
                Start Subscription
              </CheckoutButton>
            </div>
          </div>

          <div className="rounded-2xl border border-[#283341] bg-[#11161d] p-6">
            <h2 className="text-xl font-semibold">Why founders use this before applying</h2>
            <ul className="mt-4 space-y-4 text-sm text-[#c5d1dd]">
              <li className="flex gap-3">
                <Ban className="mt-0.5" size={18} />
                Detect prohibited activity flags before Stripe detects them on your first charge.
              </li>
              <li className="flex gap-3">
                <CircleAlert className="mt-0.5" size={18} />
                Expose gray-area revenue flows that look like unlicensed money movement.
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5" size={18} />
                Get practical risk-reduction steps and safer launch alternatives.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <article className="rounded-xl border border-[#283341] bg-[#11161d] p-5">
            <h3 className="text-lg font-semibold">Problem</h3>
            <p className="mt-3 text-sm text-[#8b949e]">
              Stripe policies are broad, and category bans evolve. Founders ship products that look acceptable,
              then lose payment processing when risk teams interpret the model differently.
            </p>
          </article>
          <article className="rounded-xl border border-[#283341] bg-[#11161d] p-5">
            <h3 className="text-lg font-semibold">Solution</h3>
            <p className="mt-3 text-sm text-[#8b949e]">
              Submit your model details and receive a risk score, flagged policy categories, and actionable fixes
              tailored for marketplaces, fintech, and crypto-adjacent products.
            </p>
          </article>
          <article className="rounded-xl border border-[#283341] bg-[#11161d] p-5">
            <h3 className="text-lg font-semibold">Outcome</h3>
            <p className="mt-3 text-sm text-[#8b949e]">
              Apply with cleaner positioning, clearer money-flow documentation, and fewer compliance surprises
              that can trigger suspension or rejection.
            </p>
          </article>
        </div>
      </section>

      <section className="border-y border-[#283341] bg-[#0f151d] px-4 py-16 md:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#283341] bg-[#11161d] p-8 text-center">
          <p className="mono text-xs uppercase tracking-[0.2em] text-[#8b949e]">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold">$12/month</h2>
          <p className="mt-3 text-sm text-[#8b949e]">
            Built for early-stage SaaS and fintech founders operating near policy boundaries.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <CheckoutButton
              checkoutUrl={checkoutUrl}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2ea043] px-5 py-3 font-medium text-[#0d1117] transition hover:bg-[#3fb950]"
            >
              <Zap size={16} />
              Subscribe and Unlock
            </CheckoutButton>
            <Link href="/check" className="text-sm text-[#8b949e] underline underline-offset-4 hover:text-[#e6edf3]">
              Already purchased? Verify access here
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-semibold">FAQ</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((faq) => (
              <article key={faq.q} className="rounded-xl border border-[#283341] bg-[#11161d] p-5">
                <h3 className="font-medium">{faq.q}</h3>
                <p className="mt-2 text-sm text-[#8b949e]">{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
