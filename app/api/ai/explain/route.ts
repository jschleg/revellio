import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import type { Decision } from "@/lib/types/data";

export async function POST(request: NextRequest) {
  try {
    const { decision } = await request.json();

    if (!decision) {
      return NextResponse.json(
        { error: "Invalid decision" },
        { status: 400 }
      );
    }

    const aiService = new AIService();
    const explanation = await aiService.explainDecision(decision as Decision);

    return NextResponse.json(explanation);
  } catch (error) {
    console.error("Error in AI explain:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

