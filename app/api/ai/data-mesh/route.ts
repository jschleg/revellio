import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import type { Metadata, CSVData } from "@/lib/types/data";

export async function POST(request: NextRequest) {
  try {
    console.log("📥 [API] /api/ai/data-mesh - Data mesh request received");
    const { metadataArray, allData } = await request.json();

    if (!metadataArray || !Array.isArray(metadataArray)) {
      console.error("❌ [API] Invalid metadata array");
      return NextResponse.json(
        { error: "Invalid metadata array" },
        { status: 400 }
      );
    }

    if (!allData || !Array.isArray(allData)) {
      console.error("❌ [API] Invalid allData array");
      return NextResponse.json(
        { error: "Invalid allData array" },
        { status: 400 }
      );
    }

    const totalRows = allData.reduce((sum: number, data: CSVData) => sum + data.rows.length, 0);
    console.log(`📊 [API] Processing ${metadataArray.length} files for data mesh`);
    console.log(`📊 [API] Total rows: ${totalRows}`);
    console.log("🔑 [API] OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);

    const aiService = new AIService();
    const dataMesh = await aiService.dataMesh(
      metadataArray as Metadata[],
      allData as CSVData[]
    );

    console.log("✅ [API] Data mesh complete:", {
      relations: dataMesh.relations.length,
    });

    return NextResponse.json(dataMesh);
  } catch (error) {
    console.error("❌ [API] Error in data mesh:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

