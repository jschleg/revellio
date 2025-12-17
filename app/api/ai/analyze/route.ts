import { NextRequest, NextResponse } from "next/server";
import { AIService, type VisualizationConfig } from "@/lib/ai/ai-service";
import { log } from "@/lib/logger";
import type { Metadata, Row, UnifiedAIOutput } from "@/lib/types/data";

export async function POST(request: NextRequest) {
  try {
    log.info("Unified analysis request received");
    const { metadataArray, dataSlices, userPrompt, config, existingOutput, feedback } = await request.json();

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
      hasPrompt: !!userPrompt,
      config: config || {}
    });

    const aiService = new AIService();
    
    try {
      const analysis = await aiService.unifiedAnalysis(
        metadataArray as Metadata[],
        dataSlices as Array<{ fileName: string; rows: Row[] }>,
        userPrompt || "",
        (config || {}) as VisualizationConfig,
        existingOutput as UnifiedAIOutput | undefined,
        feedback
      );

      log.info("Unified analysis complete", {
        visualizations: analysis.visualizations.length,
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
