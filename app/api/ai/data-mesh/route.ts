import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import { log } from "@/lib/logger";
import type { Metadata, CSVData } from "@/lib/types/data";

export async function POST(request: NextRequest) {
  try {
    log.info("Data mesh request received");
    const { metadataArray, dataSlices, userPrompt } = await request.json();

    if (!metadataArray || !Array.isArray(metadataArray)) {
      log.error("Invalid metadata array");
      return NextResponse.json(
        { error: "Invalid metadata array" },
        { status: 400 }
      );
    }

    if (!dataSlices || !Array.isArray(dataSlices)) {
      log.error("Invalid dataSlices array");
      return NextResponse.json(
        { error: "Invalid dataSlices array" },
        { status: 400 }
      );
    }

    const totalRows = dataSlices.reduce((sum: number, data: CSVData) => sum + data.rows.length, 0);
    log.info("Processing data mesh", { 
      files: metadataArray.length, 
      totalRows,
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
      const dataMesh = await aiService.dataMesh(
        metadataArray as Metadata[],
        dataSlices as CSVData[],
        userPrompt || ""
      );

      log.info("Data mesh complete", { relations: dataMesh.relations.length });
      return NextResponse.json(dataMesh);
    } catch (error) {
      log.error("Error in dataMesh service", error);
      throw error;
    }
  } catch (error) {
    log.error("Error in data mesh API", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
