import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type {
  CSVData,
  DataMeshOutput,
  UnifiedAIOutput,
  DataMeshRelation,
} from "@/lib/types/data";

// GET /api/sessions/[id] - Get a session with all data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        csvFiles: {
          include: {
            rows: {
              orderBy: { rowIndex: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        dataMeshRelations: {
          orderBy: { orderIndex: "asc" },
        },
        aiVisualizations: {
          orderBy: { orderIndex: "asc" },
        },
        aiRelations: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Reconstruct CSVData array
    const csvData: CSVData[] = session.csvFiles.map((file) => ({
      fileName: file.fileName,
      columns: JSON.parse(file.columns),
      rows: file.rows.map((row) => JSON.parse(row.rowData)),
      rawContent: file.rawContent,
      metadata: JSON.parse(file.metadata),
    }));

    // Reconstruct DataMeshOutput
    const dataMeshOutput: DataMeshOutput | null = session.dataMeshSummary
      ? {
          relations: session.dataMeshRelations.map((rel) => ({
            title: rel.title,
            relationExplanation: rel.relationExplanation,
            elements: JSON.parse(rel.elements),
          })),
          summary: session.dataMeshSummary,
        }
      : null;

    // Reconstruct UnifiedAIOutput
    const aiOutput: UnifiedAIOutput | null = session.aiOutputReasoning
      ? {
          visualizations: session.aiVisualizations.map((viz) => ({
            type: viz.type as any,
            module: viz.module,
            reasoning: viz.reasoning,
            config: JSON.parse(viz.config),
            schema: viz.schema ? JSON.parse(viz.schema) : undefined,
          })),
          relations: session.aiRelations.map((rel) => ({
            type: rel.type as any,
            sourceColumn: rel.sourceColumn,
            targetColumn: rel.targetColumn,
            confidence: rel.confidence,
            description: rel.description,
          })),
          reasoning: session.aiOutputReasoning,
          metadata: session.aiOutputMetadata
            ? JSON.parse(session.aiOutputMetadata)
            : { insights: [], assumptions: [] },
        }
      : null;

    return NextResponse.json({
      id: session.id,
      name: session.name,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      dataMeshPrompt: session.dataMeshPrompt,
      userPrompt: session.userPrompt,
      csvData,
      dataMeshOutput,
      aiOutput,
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/[id] - Update a session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, csvData, dataMeshOutput, aiOutput, dataMeshPrompt, userPrompt } = body;

    // Check if session exists
    const existingSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Update session basic info
    await prisma.session.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingSession.name,
        dataMeshPrompt: dataMeshPrompt !== undefined ? dataMeshPrompt : existingSession.dataMeshPrompt,
        userPrompt: userPrompt !== undefined ? userPrompt : existingSession.userPrompt,
        dataMeshSummary: dataMeshOutput?.summary !== undefined ? dataMeshOutput.summary : existingSession.dataMeshSummary,
        aiOutputReasoning: aiOutput?.reasoning !== undefined ? aiOutput.reasoning : existingSession.aiOutputReasoning,
        aiOutputMetadata: aiOutput?.metadata !== undefined ? JSON.stringify(aiOutput.metadata) : existingSession.aiOutputMetadata,
      },
    });

    // Delete existing related data if new data is provided
    if (csvData !== undefined) {
      await prisma.cSVFile.deleteMany({ where: { sessionId: id } });
      
      // Recreate CSV files
      if (Array.isArray(csvData)) {
        for (const csv of csvData) {
          const csvFile = await prisma.cSVFile.create({
            data: {
              sessionId: id,
              fileName: csv.fileName,
              rawContent: csv.rawContent || "",
              hasHeader: csv.metadata?.hasHeader ?? true,
              rowCount: csv.metadata?.rowCount || csv.rows.length,
              columns: JSON.stringify(csv.columns),
              metadata: JSON.stringify(csv.metadata),
            },
          });

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
    }

    if (dataMeshOutput?.relations !== undefined) {
      await prisma.dataMeshRelation.deleteMany({ where: { sessionId: id } });
      
      if (Array.isArray(dataMeshOutput.relations)) {
        await prisma.dataMeshRelation.createMany({
          data: dataMeshOutput.relations.map((rel: DataMeshRelation, index: number) => ({
            sessionId: id,
            title: rel.title,
            relationExplanation: rel.relationExplanation,
            elements: JSON.stringify(rel.elements),
            orderIndex: index,
          })),
        });
      }
    }

    if (aiOutput?.visualizations !== undefined) {
      await prisma.visualizationInstruction.deleteMany({ where: { sessionId: id } });
      
      if (Array.isArray(aiOutput.visualizations)) {
        await prisma.visualizationInstruction.createMany({
          data: aiOutput.visualizations.map((viz: any, index: number) => ({
            sessionId: id,
            type: viz.type,
            module: viz.module,
            reasoning: viz.reasoning,
            config: JSON.stringify(viz.config),
            schema: viz.schema ? JSON.stringify(viz.schema) : null,
            orderIndex: index,
          })),
        });
      }
    }

    if (aiOutput?.relations !== undefined) {
      await prisma.relation.deleteMany({ where: { sessionId: id } });
      
      if (Array.isArray(aiOutput.relations)) {
        await prisma.relation.createMany({
          data: aiOutput.relations.map((rel: any) => ({
            sessionId: id,
            type: rel.type,
            sourceColumn: rel.sourceColumn,
            targetColumn: rel.targetColumn,
            confidence: rel.confidence,
            description: rel.description,
          })),
        });
      }
    }

    const updatedSession = await prisma.session.findUnique({
      where: { id },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - Delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.session.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}

