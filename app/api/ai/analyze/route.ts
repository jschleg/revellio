import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import type { Metadata, CSVData } from "@/lib/types/data";

export async function POST(request: NextRequest) {
  try {
    console.log("📥 [API] /api/ai/analyze - Unified analysis request received");
    const { metadataArray, dataSlices, userPrompt } = await request.json();

    if (!metadataArray || !Array.isArray(metadataArray)) {
      console.error("❌ [API] Invalid metadata array");
      return NextResponse.json(
        { error: "Invalid metadata array" },
        { status: 400 }
      );
    }

    if (!dataSlices || !Array.isArray(dataSlices)) {
      console.error("❌ [API] Invalid data slices");
      return NextResponse.json(
        { error: "Invalid data slices" },
        { status: 400 }
      );
    }

    console.log(`📊 [API] Processing ${metadataArray.length} files`);
    console.log(`📝 [API] User prompt: ${userPrompt || "None"}`);
    console.log("🔑 [API] OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);

    const aiService = new AIService();
    const analysis = await aiService.unifiedAnalysis(
      metadataArray as Metadata[],
      dataSlices as CSVData[],
      userPrompt || ""
    );

    console.log("✅ [API] Unified analysis complete:", {
      visualizations: analysis.visualizations.length,
      relations: analysis.relations.length,
      insights: analysis.metadata.insights.length,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("❌ [API] Error in unified AI analyze:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

