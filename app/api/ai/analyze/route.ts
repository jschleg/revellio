import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import type { Metadata } from "@/lib/types/data";

export async function POST(request: NextRequest) {
  try {
    console.log("📥 [API] /api/ai/analyze - Request received");
    const { metadataArray } = await request.json();

    if (!metadataArray || !Array.isArray(metadataArray)) {
      console.error("❌ [API] Invalid metadata array");
      return NextResponse.json(
        { error: "Invalid metadata array" },
        { status: 400 }
      );
    }

    console.log(`📊 [API] Processing ${metadataArray.length} metadata entries`);
    console.log("🔑 [API] OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);

    const aiService = new AIService();
    const analysis = await aiService.analyzeMetadata(metadataArray as Metadata[]);

    console.log("✅ [API] Analysis complete:", {
      insights: analysis.insights.length,
      assumptions: analysis.assumptions.length,
      visualizations: analysis.visualizations.length,
      relations: analysis.structure.relations.length,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("❌ [API] Error in AI analyze:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

