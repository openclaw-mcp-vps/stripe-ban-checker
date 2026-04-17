import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeBusinessModel } from "@/lib/ai-analyzer";

const AnalyzeInputSchema = z.object({
  businessName: z.string().min(2).max(120),
  businessModel: z.string().min(30).max(5000),
  targetCustomers: z.string().min(5).max(300),
  revenueFlow: z.string().min(5).max(1000)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = AnalyzeInputSchema.parse(body);

    const result = await analyzeBusinessModel(input);

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          issues: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Analysis failed. Please retry in a moment."
      },
      { status: 500 }
    );
  }
}
