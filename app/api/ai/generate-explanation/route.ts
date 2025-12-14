import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";

export async function POST(request: NextRequest) {
  try {
    const { visualizationType, data } = await request.json();

    if (!visualizationType) {
      return NextResponse.json(
        { error: "Invalid visualization type" },
        { status: 400 }
      );
    }

    const aiService = new AIService();
    const explanation = await aiService.generateExplanation(visualizationType, data);

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Error in AI generate explanation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

