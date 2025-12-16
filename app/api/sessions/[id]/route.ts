import { NextRequest, NextResponse } from "next/server";
import {
  getSessionById,
  updateSession,
  deleteSession,
  type SessionData,
} from "@/lib/services/session-service";

/**
 * GET /api/sessions/[id] - Get a session with all data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionById(id);
    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch session";

    // Check if it's a "not found" error
    if (errorMessage.includes("not found")) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * PUT /api/sessions/[id] - Update a session
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      csvData,
      dataMeshOutput,
      aiOutput,
      dataMeshPrompt,
      userPrompt,
    } = body;

    const sessionData: Partial<SessionData> = {
      name,
      csvData,
      dataMeshOutput,
      aiOutput,
      dataMeshPrompt,
      userPrompt,
    };

    const session = await updateSession(id, sessionData);
    return NextResponse.json(session);
  } catch (error) {
    console.error("Error updating session:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update session";

    // Check if it's a "not found" error
    if (errorMessage.includes("not found")) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/sessions/[id] - Delete a session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSession(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete session";

    // Check if it's a "not found" error
    if (errorMessage.includes("not found")) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
