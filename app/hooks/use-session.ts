import { useState, useCallback, useEffect } from "react";
import { MetadataExtractor } from "@/lib/analysis/metadata-extractor";
import { getErrorMessage, extractApiError } from "@/lib/utils/error-handling";
import type {
  CSVData,
  Metadata,
  UnifiedAIOutput,
  DataMeshOutput,
  DataMeshRelation,
} from "@/lib/types/data";

export interface SessionState {
  id: string | null;
  name: string;
  csvData: CSVData[];
  metadataInput: Metadata[];
  dataMeshPrompt: string;
  userPrompt: string;
  meshOutput: DataMeshOutput | null;
  meshRelations: DataMeshRelation[];
  meshInputPayload: {
    metadataArray: Metadata[];
    dataSlices?: Array<{ fileName: string; rows: unknown[] }>;
    userPrompt?: string;
    config?: unknown;
  } | null;
  aiOutput: UnifiedAIOutput | null;
  aiInputPayload: {
    metadataArray: Metadata[];
    dataSlices?: Array<{ fileName: string; rows: unknown[] }>;
    userPrompt?: string;
    config?: unknown;
  } | null;
}

const createEmptySessionState = (): SessionState => ({
  id: null,
  name: "Untitled Session",
  csvData: [],
  metadataInput: [],
  dataMeshPrompt: "",
  userPrompt: "",
  meshOutput: null,
  meshRelations: [],
  meshInputPayload: null,
  aiOutput: null,
  aiInputPayload: null,
});

export function useSession() {
  const [session, setSession] = useState<SessionState>(createEmptySessionState());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  const createNewSession = useCallback(async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Untitled Session",
          csvData: [],
        }),
      });

      if (!response.ok) {
        const { message } = await extractApiError(response);
        throw new Error(message || "Failed to create session");
      }

      const sessionData = await response.json();
      setSession({
        ...createEmptySessionState(),
        id: sessionData.id,
        name: sessionData.name,
      });
      setSidebarRefreshTrigger((prev) => prev + 1);
      return sessionData.id;
    } catch (error) {
      console.error("Error creating session:", error);
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const saveSession = useCallback(
    async (sessionId: string | null, isProcessing: boolean = false) => {
      if (!sessionId) {
        return await createNewSession();
      }

      if (isProcessing) {
        return;
      }

      setIsSaving(true);
      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: session.name,
            csvData: session.csvData,
            dataMeshOutput: session.meshOutput,
            aiOutput: session.aiOutput,
            dataMeshPrompt: session.dataMeshPrompt,
            userPrompt: session.userPrompt,
            meshInputPayload: session.meshInputPayload,
            aiInputPayload: session.aiInputPayload,
          }),
        });

        if (!response.ok) {
          const { message, status } = await extractApiError(response);

          if (status === 404 || message.includes("not found")) {
            console.warn("Session not found, creating new session");
            setSession((prev) => ({ ...prev, id: null }));
            return await createNewSession();
          }

          throw new Error(message || "Failed to save session");
        }

        setSidebarRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error saving session:", error);
        const errorMessage = getErrorMessage(error);
        if (errorMessage.includes("not found")) {
          setSession((prev) => ({ ...prev, id: null }));
          return await createNewSession();
        }
        throw new Error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    },
    [session, createNewSession]
  );

  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoadingSession(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);

      if (!response.ok) {
        const { message } = await extractApiError(response);
        throw new Error(message || "Failed to load session");
      }

      const sessionData = await response.json();

      let metadataArray: Metadata[] = [];
      if (sessionData.csvData && sessionData.csvData.length > 0) {
        const metadataExtractor = new MetadataExtractor();
        metadataArray = metadataExtractor.extractAll(sessionData.csvData);
      }

      setSession({
        id: sessionData.id,
        name: sessionData.name,
        csvData: sessionData.csvData || [],
        metadataInput: metadataArray,
        dataMeshPrompt: sessionData.dataMeshPrompt || "",
        userPrompt: sessionData.userPrompt || "",
        meshOutput: sessionData.dataMeshOutput || null,
        meshRelations: sessionData.dataMeshOutput?.relations || [],
        meshInputPayload: sessionData.meshInputPayload || null,
        aiOutput: sessionData.aiOutput || null,
        aiInputPayload: sessionData.aiInputPayload || null,
      });

      return metadataArray.length > 0;
    } catch (error) {
      console.error("Error loading session:", error);
      throw new Error(getErrorMessage(error));
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          if (session.id === sessionId) {
            setSession(createEmptySessionState());
            await createNewSession();
          }
          setSidebarRefreshTrigger((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error deleting session:", error);
        throw new Error(getErrorMessage(error));
      }
    },
    [session.id, createNewSession]
  );

  const initializeSession = useCallback(async () => {
    try {
      const response = await fetch("/api/sessions");
      if (response.ok) {
        const sessions = await response.json();
        if (sessions && Array.isArray(sessions) && sessions.length > 0) {
          const mostRecentSession = sessions[0];
          if (mostRecentSession?.id) {
            await loadSession(mostRecentSession.id);
            return;
          }
        }
      }
      await createNewSession();
    } catch (error) {
      console.error("Error initializing session:", error);
      await createNewSession();
    }
  }, [loadSession, createNewSession]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return {
    session,
    setSession,
    isSaving,
    isLoadingSession,
    sidebarRefreshTrigger,
    createNewSession,
    saveSession,
    loadSession,
    deleteSession,
  };
}

