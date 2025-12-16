import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import type { Metadata, CSVData } from "@/lib/types/data";

export async function POST(request: NextRequest) {
  try {
    console.log("📥 [API] /api/ai/data-mesh - Data mesh request received");
    const { metadataArray, dataSlices, userPrompt } = await request.json();

    if (!metadataArray || !Array.isArray(metadataArray)) {
      console.error("❌ [API] Invalid metadata array");
      return NextResponse.json(
        { error: "Invalid metadata array" },
        { status: 400 }
      );
    }

    if (!dataSlices || !Array.isArray(dataSlices)) {
      console.error("❌ [API] Invalid dataSlices array");
      return NextResponse.json(
        { error: "Invalid dataSlices array" },
        { status: 400 }
      );
    }

    const totalRows = dataSlices.reduce((sum: number, data: CSVData) => sum + data.rows.length, 0);
    console.log(`📊 [API] Processing ${metadataArray.length} files for data mesh`);
    console.log(`📊 [API] Total rows in slices (20 per file): ${totalRows}`);
    console.log(`📝 [API] User prompt: ${userPrompt || "None"}`);
    
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    console.log("🔑 [API] OpenAI API Key exists:", hasApiKey);
    
    if (!hasApiKey) {
      console.error("❌ [API] OPENAI_API_KEY environment variable is not set");
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

      console.log("✅ [API] Data mesh complete:", {
        relations: dataMesh.relations.length,
      });

      return NextResponse.json(dataMesh);
    } catch (error) {
      console.error("❌ [API] Error in dataMesh service:", error);
      // Re-throw to be caught by outer try-catch
      throw error;
    }
  } catch (error) {
    console.error("❌ [API] Error in data mesh:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

