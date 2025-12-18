import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import { log } from "@/lib/logger";
import type { Metadata, Row } from "@/lib/types/data";

export async function POST(request: NextRequest) {
  try {
    log.info("Data mesh request received");
    const { metadataArray, dataSlices, userPrompt, existingRelations, feedback, relationToUpdate } = await request.json();

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

    const totalRows = dataSlices.reduce((sum: number, data: { rows: unknown[] }) => sum + (data.rows?.length || 0), 0);
    log.info("Processing data mesh", { 
      files: metadataArray.length, 
      totalRows,
      hasPrompt: !!userPrompt,
    });

    const aiService = new AIService();
    
    try {
      const dataMesh = await aiService.dataMesh(
        metadataArray as Metadata[],
        dataSlices as Array<{ fileName: string; rows: Row[] }>,
        userPrompt || "",
        existingRelations,
        feedback,
        relationToUpdate
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
