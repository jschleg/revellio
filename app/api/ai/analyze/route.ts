import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import type { Metadata } from "@/lib/types/data";

export async function POST(request: NextRequest) {
  try {
    const { metadataArray } = await request.json();

    if (!metadataArray || !Array.isArray(metadataArray)) {
      return NextResponse.json(
        { error: "Invalid metadata array" },
        { status: 400 }
      );
    }

    const aiService = new AIService();
    const analysis = await aiService.analyzeMetadata(metadataArray as Metadata[]);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error in AI analyze:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

