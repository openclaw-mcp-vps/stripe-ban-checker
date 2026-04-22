"use client";

import { type FormEvent, useState } from "react";
import { LoaderCircle, Lock, ShieldCheck } from "lucide-react";

import { PricingCard } from "@/components/PricingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function UnlockAccessPanel() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Unable to unlock access right now.");
        return;
      }

      window.location.reload();
    } catch {
      setErrorMessage("Connection failed while unlocking access. Please retry.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Lock className="h-6 w-6 text-[#58a6ff]" />
            Tool Access Required
          </CardTitle>
          <CardDescription>
            Purchase a plan, then unlock with the same email used at checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-[#c9d1d9]">
            <li>Complete checkout using the Stripe hosted payment link.</li>
            <li>Wait for confirmation; webhook marks your email as paid.</li>
            <li>Enter that email below to set your secure access cookie.</li>
          </ol>

          <form onSubmit={handleUnlock} className="space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="founder@startup.com"
            />
            <Button type="submit" disabled={isLoading || email.trim().length < 5} className="w-full">
              {isLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Verifying Purchase
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Unlock My Access
                </>
              )}
            </Button>
          </form>

          {errorMessage ? (
            <p className="rounded-md border border-[#f85149]/50 bg-[#f85149]/10 p-3 text-sm text-[#ff7b72]">{errorMessage}</p>
          ) : null}
        </CardContent>
      </Card>

      <PricingCard compact />
    </div>
  );
}
