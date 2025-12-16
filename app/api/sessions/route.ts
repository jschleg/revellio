import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  listSessions,
  type SessionData,
} from "@/lib/services/session-service";

/**
 * GET /api/sessions - List all sessions
 */
export async function GET() {
  try {
    const sessions = await listSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch sessions";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/sessions - Create a new session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      csvData,
      dataMeshOutput,
      aiOutput,
      dataMeshPrompt,
      userPrompt,
      meshInputPayload,
      aiInputPayload,
    } = body;

    const sessionData: SessionData = {
      name,
      csvData,
      dataMeshOutput,
      aiOutput,
      dataMeshPrompt,
      userPrompt,
      meshInputPayload,
      aiInputPayload,
    };

    const session = await createSession(sessionData);
    return NextResponse.json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create session";
    return NextResponse.json(
      { error: "Failed to create session", details: errorMessage },
      { status: 500 }
    );
  }
}
