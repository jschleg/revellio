import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import type { Structure } from "@/lib/types/data";

export async function POST(request: NextRequest) {
  try {
    const { structure } = await request.json();

    if (!structure) {
      return NextResponse.json(
        { error: "Invalid structure" },
        { status: 400 }
      );
    }

    const aiService = new AIService();
    const visualizations = await aiService.suggestVisualizations(structure as Structure);

    return NextResponse.json({ visualizations });
  } catch (error) {
    console.error("Error in AI visualizations:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

