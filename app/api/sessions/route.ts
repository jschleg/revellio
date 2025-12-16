import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type {
  CSVData,
  DataMeshOutput,
  UnifiedAIOutput,
  DataMeshRelation,
} from "@/lib/types/data";

// GET /api/sessions - List all sessions
export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            csvFiles: true,
          },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, csvData, dataMeshOutput, aiOutput, dataMeshPrompt, userPrompt } = body;

    // Create session
    const session = await prisma.session.create({
      data: {
        name: name || "Untitled Session",
        dataMeshPrompt: dataMeshPrompt || null,
        userPrompt: userPrompt || null,
        dataMeshSummary: dataMeshOutput?.summary || null,
        aiOutputReasoning: aiOutput?.reasoning || null,
        aiOutputMetadata: aiOutput?.metadata ? JSON.stringify(aiOutput.metadata) : null,
      },
    });

    // Save CSV files and rows
    if (csvData && Array.isArray(csvData)) {
      for (const csv of csvData) {
        const csvFile = await prisma.cSVFile.create({
          data: {
            sessionId: session.id,
            fileName: csv.fileName,
            rawContent: csv.rawContent || "",
            hasHeader: csv.metadata?.hasHeader ?? true,
            rowCount: csv.metadata?.rowCount || csv.rows.length,
            columns: JSON.stringify(csv.columns),
            metadata: JSON.stringify(csv.metadata),
          },
        });

        // Save rows
        if (csv.rows && Array.isArray(csv.rows)) {
          await prisma.cSVRow.createMany({
            data: csv.rows.map((row: any, index: number) => ({
              csvFileId: csvFile.id,
              rowData: JSON.stringify(row),
              rowIndex: index,
            })),
          });
        }
      }
    }

    // Save Data Mesh Relations
    if (dataMeshOutput?.relations && Array.isArray(dataMeshOutput.relations)) {
      await prisma.dataMeshRelation.createMany({
        data: dataMeshOutput.relations.map((rel: DataMeshRelation, index: number) => ({
          sessionId: session.id,
          title: rel.title,
          relationExplanation: rel.relationExplanation,
          elements: JSON.stringify(rel.elements),
          orderIndex: index,
        })),
      });
    }

    // Save AI Visualizations
    if (aiOutput?.visualizations && Array.isArray(aiOutput.visualizations)) {
      await prisma.visualizationInstruction.createMany({
        data: aiOutput.visualizations.map((viz: any, index: number) => ({
          sessionId: session.id,
          type: viz.type,
          module: viz.module,
          reasoning: viz.reasoning,
          config: JSON.stringify(viz.config),
          schema: viz.schema ? JSON.stringify(viz.schema) : null,
          orderIndex: index,
        })),
      });
    }

    // Save AI Relations
    if (aiOutput?.relations && Array.isArray(aiOutput.relations)) {
      await prisma.relation.createMany({
        data: aiOutput.relations.map((rel: any) => ({
          sessionId: session.id,
          type: rel.type,
          sourceColumn: rel.sourceColumn,
          targetColumn: rel.targetColumn,
          confidence: rel.confidence,
          description: rel.description,
        })),
      });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

