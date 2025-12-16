/**
 * Session Service - Handles all session-related database operations
 * Provides clean, reusable functions for session management
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CSVData,
  DataMeshOutput,
  UnifiedAIOutput,
  DataMeshRelation,
} from "@/lib/types/data";

export interface SessionData {
  name?: string;
  csvData?: CSVData[];
  dataMeshOutput?: DataMeshOutput | null;
  aiOutput?: UnifiedAIOutput | null;
  dataMeshPrompt?: string | null;
  userPrompt?: string | null;
}

export interface SessionResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  dataMeshPrompt: string | null;
  userPrompt: string | null;
  csvData: CSVData[];
  dataMeshOutput: DataMeshOutput | null;
  aiOutput: UnifiedAIOutput | null;
}

/**
 * Create a new session with all related data in a transaction
 */
export async function createSession(data: SessionData): Promise<SessionResponse> {
  const session = await prisma.$transaction(async (tx) => {
    // Create the session
    const session = await tx.session.create({
      data: {
        name: data.name || "Untitled Session",
        dataMeshPrompt: data.dataMeshPrompt || null,
        userPrompt: data.userPrompt || null,
        dataMeshSummary: data.dataMeshOutput?.summary || null,
        aiOutputReasoning: data.aiOutput?.reasoning || null,
        aiOutputMetadata: data.aiOutput?.metadata
          ? JSON.stringify(data.aiOutput.metadata)
          : null,
      },
    });

    // Save CSV files and rows
    if (data.csvData && Array.isArray(data.csvData) && data.csvData.length > 0) {
      for (const csv of data.csvData) {
        const csvFile = await tx.cSVFile.create({
          data: {
            sessionId: session.id,
            fileName: csv.fileName,
            rawContent: csv.rawContent || "",
            hasHeader: csv.metadata?.hasHeader ?? true,
            rowCount: csv.metadata?.rowCount || csv.rows?.length || 0,
            columns: JSON.stringify(csv.columns || []),
            metadata: JSON.stringify(csv.metadata || {}),
          },
        });

        // Save rows in batches
        if (csv.rows && Array.isArray(csv.rows) && csv.rows.length > 0) {
          const batchSize = 1000;
          for (let i = 0; i < csv.rows.length; i += batchSize) {
            const batch = csv.rows.slice(i, i + batchSize);
            await tx.cSVRow.createMany({
              data: batch.map((row: any, index: number) => ({
                csvFileId: csvFile.id,
                rowData: JSON.stringify(row),
                rowIndex: i + index,
              })),
            });
          }
        }
      }
    }

    // Save Data Mesh Relations
    if (
      data.dataMeshOutput?.relations &&
      Array.isArray(data.dataMeshOutput.relations) &&
      data.dataMeshOutput.relations.length > 0
    ) {
      await tx.dataMeshRelation.createMany({
        data: data.dataMeshOutput.relations.map(
          (rel: DataMeshRelation, index: number) => ({
            sessionId: session.id,
            title: rel.title,
            relationExplanation: rel.relationExplanation,
            elements: JSON.stringify(rel.elements),
            orderIndex: index,
          })
        ),
      });
    }

    // Save AI Visualizations
    if (
      data.aiOutput?.visualizations &&
      Array.isArray(data.aiOutput.visualizations) &&
      data.aiOutput.visualizations.length > 0
    ) {
      await tx.visualizationInstruction.createMany({
        data: data.aiOutput.visualizations.map((viz: any, index: number) => ({
          sessionId: session.id,
          type: viz.type,
          module: viz.module,
          reasoning: viz.reasoning,
          config: JSON.stringify(viz.config || {}),
          schema: viz.schema ? JSON.stringify(viz.schema) : null,
          orderIndex: index,
        })),
      });
    }

    // Save AI Relations
    if (
      data.aiOutput?.relations &&
      Array.isArray(data.aiOutput.relations) &&
      data.aiOutput.relations.length > 0
    ) {
      await tx.relation.createMany({
        data: data.aiOutput.relations.map((rel: any) => ({
          sessionId: session.id,
          type: rel.type,
          sourceColumn: rel.sourceColumn,
          targetColumn: rel.targetColumn,
          confidence: rel.confidence,
          description: rel.description,
        })),
      });
    }

    return session;
  });

  // Fetch the complete session with all relations
  return getSessionById(session.id);
}

/**
 * Get a session by ID with all related data
 */
export async function getSessionById(
  sessionId: string
): Promise<SessionResponse> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
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
    throw new Error(`Session not found: ${sessionId}`);
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

  return {
    id: session.id,
    name: session.name,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    dataMeshPrompt: session.dataMeshPrompt,
    userPrompt: session.userPrompt,
    csvData,
    dataMeshOutput,
    aiOutput,
  };
}

/**
 * Update a session with new data
 */
export async function updateSession(
  sessionId: string,
  data: Partial<SessionData>
): Promise<SessionResponse> {
  // Check if session exists
  const existingSession = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!existingSession) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  await prisma.$transaction(async (tx) => {
    // Update session basic info
    await tx.session.update({
      where: { id: sessionId },
      data: {
        name: data.name !== undefined ? data.name : existingSession.name,
        dataMeshPrompt:
          data.dataMeshPrompt !== undefined
            ? data.dataMeshPrompt
            : existingSession.dataMeshPrompt,
        userPrompt:
          data.userPrompt !== undefined
            ? data.userPrompt
            : existingSession.userPrompt,
        dataMeshSummary:
          data.dataMeshOutput?.summary !== undefined
            ? data.dataMeshOutput.summary
            : existingSession.dataMeshSummary,
        aiOutputReasoning:
          data.aiOutput?.reasoning !== undefined
            ? data.aiOutput.reasoning
            : existingSession.aiOutputReasoning,
        aiOutputMetadata:
          data.aiOutput?.metadata !== undefined
            ? JSON.stringify(data.aiOutput.metadata)
            : existingSession.aiOutputMetadata,
      },
    });

    // Update CSV files if provided
    if (data.csvData !== undefined) {
      // Delete existing CSV files (cascade will delete rows)
      await tx.cSVFile.deleteMany({ where: { sessionId } });

      // Recreate CSV files
      if (Array.isArray(data.csvData) && data.csvData.length > 0) {
        for (const csv of data.csvData) {
          const csvFile = await tx.cSVFile.create({
            data: {
              sessionId,
              fileName: csv.fileName,
              rawContent: csv.rawContent || "",
              hasHeader: csv.metadata?.hasHeader ?? true,
              rowCount: csv.metadata?.rowCount || csv.rows?.length || 0,
              columns: JSON.stringify(csv.columns || []),
              metadata: JSON.stringify(csv.metadata || {}),
            },
          });

          if (csv.rows && Array.isArray(csv.rows) && csv.rows.length > 0) {
            const batchSize = 1000;
            for (let i = 0; i < csv.rows.length; i += batchSize) {
              const batch = csv.rows.slice(i, i + batchSize);
              await tx.cSVRow.createMany({
                data: batch.map((row: any, index: number) => ({
                  csvFileId: csvFile.id,
                  rowData: JSON.stringify(row),
                  rowIndex: i + index,
                })),
              });
            }
          }
        }
      }
    }

    // Update Data Mesh Relations if provided
    if (data.dataMeshOutput?.relations !== undefined) {
      await tx.dataMeshRelation.deleteMany({ where: { sessionId } });

      if (
        Array.isArray(data.dataMeshOutput.relations) &&
        data.dataMeshOutput.relations.length > 0
      ) {
        await tx.dataMeshRelation.createMany({
          data: data.dataMeshOutput.relations.map(
            (rel: DataMeshRelation, index: number) => ({
              sessionId,
              title: rel.title,
              relationExplanation: rel.relationExplanation,
              elements: JSON.stringify(rel.elements),
              orderIndex: index,
            })
          ),
        });
      }
    }

    // Update AI Visualizations if provided
    if (data.aiOutput?.visualizations !== undefined) {
      await tx.visualizationInstruction.deleteMany({ where: { sessionId } });

      if (
        Array.isArray(data.aiOutput.visualizations) &&
        data.aiOutput.visualizations.length > 0
      ) {
        await tx.visualizationInstruction.createMany({
          data: data.aiOutput.visualizations.map((viz: any, index: number) => ({
            sessionId,
            type: viz.type,
            module: viz.module,
            reasoning: viz.reasoning,
            config: JSON.stringify(viz.config || {}),
            schema: viz.schema ? JSON.stringify(viz.schema) : null,
            orderIndex: index,
          })),
        });
      }
    }

    // Update AI Relations if provided
    if (data.aiOutput?.relations !== undefined) {
      await tx.relation.deleteMany({ where: { sessionId } });

      if (
        Array.isArray(data.aiOutput.relations) &&
        data.aiOutput.relations.length > 0
      ) {
        await tx.relation.createMany({
          data: data.aiOutput.relations.map((rel: any) => ({
            sessionId,
            type: rel.type,
            sourceColumn: rel.sourceColumn,
            targetColumn: rel.targetColumn,
            confidence: rel.confidence,
            description: rel.description,
          })),
        });
      }
    }
  });

  // Fetch and return the updated session
  return getSessionById(sessionId);
}

/**
 * List all sessions with basic info
 */
export async function listSessions() {
  return await prisma.session.findMany({
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
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId },
  });
}

