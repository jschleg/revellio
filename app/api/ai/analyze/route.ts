import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import { log } from "@/lib/logger";
import type { Metadata, CSVData } from "@/lib/types/data";

export async function POST(request: NextRequest) {
  try {
    log.info("Unified analysis request received");
    const { metadataArray, dataSlices, userPrompt, relations } = await request.json();

    if (!metadataArray || !Array.isArray(metadataArray)) {
      log.error("Invalid metadata array");
      return NextResponse.json(
        { error: "Invalid metadata array" },
        { status: 400 }
      );
    }

    if (!dataSlices || !Array.isArray(dataSlices)) {
      log.error("Invalid data slices");
      return NextResponse.json(
        { error: "Invalid data slices" },
        { status: 400 }
      );
    }

    log.info("Processing unified analysis", {
      files: metadataArray.length,
      relations: relations?.length || 0,
      hasPrompt: !!userPrompt
    });
    
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    if (!hasApiKey) {
      log.error("OPENAI_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable in Vercel." },
        { status: 500 }
      );
    }

    const aiService = new AIService();
    
    try {
      const analysis = await aiService.unifiedAnalysis(
        metadataArray as Metadata[],
        dataSlices as CSVData[],
        userPrompt || "",
        relations || []
      );

      log.info("Unified analysis complete", {
        visualizations: analysis.visualizations.length,
        relations: analysis.relations.length,
        insights: analysis.metadata.insights.length,
      });

      return NextResponse.json(analysis);
    } catch (error) {
      log.error("Error in unifiedAnalysis service", error);
      throw error;
    }
  } catch (error) {
    log.error("Error in unified AI analyze API", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
