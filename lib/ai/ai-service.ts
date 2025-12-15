import OpenAI from "openai";
import type {
  Metadata,
  AIAnalysis,
  VisualizationSuggestion,
  Structure,
  Decision,
  Explanation,
  Relation,
  UnifiedAIOutput,
  VisualizationInstruction,
  CSVData,
} from "@/lib/types/data";

/**
 * AI Service - Handles AI-powered analysis and decision making using OpenAI
 * 
 * Uses GPT-4o for structured data analysis tasks
 */
export class AIService {
  private client: OpenAI | null = null;
  private model: string = "gpt-4o";

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new OpenAI({
        apiKey: apiKey,
      });
    } else if (typeof window === "undefined") {
      // Server-side: try to get from environment
      const envKey = process.env.OPENAI_API_KEY;
      if (envKey) {
        this.client = new OpenAI({
          apiKey: envKey,
        });
      }
    }
  }

  /**
   * Check if AI service is available
   */
  private isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Analyze metadata and generate AI insights
   */
  async analyzeMetadata(metadataArray: Metadata[]): Promise<AIAnalysis> {
    if (!this.isAvailable()) {
      // Fallback to basic structure if AI is not available
      return this.getFallbackAnalysis(metadataArray);
    }

    try {
      const prompt = this.buildMetadataAnalysisPrompt(metadataArray);
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `Du bist ein Experte für Datenanalyse und Visualisierung. 
            Analysiere die bereitgestellten Metadaten von CSV-Dateien und erstelle strukturierte Analysen.
            Antworte IMMER im JSON-Format mit der exakten Struktur, die gefordert wird.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      const analysis = JSON.parse(content) as Partial<AIAnalysis>;
      
      return {
        structure: analysis.structure || this.getFallbackStructure(metadataArray),
        visualizations: analysis.visualizations || [],
        insights: analysis.insights || [],
        assumptions: analysis.assumptions || [],
      };
    } catch (error) {
      console.error("Error in AI analysis:", error);
      return this.getFallbackAnalysis(metadataArray);
    }
  }

  /**
   * Suggest visualizations based on data structure
   */
  async suggestVisualizations(
    structure: Structure
  ): Promise<VisualizationSuggestion[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const prompt = this.buildVisualizationPrompt(structure);
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `Du bist ein Experte für Datenvisualisierung. 
            Analysiere die Datenstruktur und schlage passende Visualisierungen vor.
            Antworte IMMER im JSON-Format mit einem Array von Visualisierungsvorschlägen.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const result = JSON.parse(content) as { visualizations?: VisualizationSuggestion[] };
      return result.visualizations || [];
    } catch (error) {
      console.error("Error in visualization suggestions:", error);
      return [];
    }
  }

  /**
   * Explain a decision made by the system
   */
  async explainDecision(decision: Decision): Promise<Explanation> {
    if (!this.isAvailable()) {
      return {
        decision,
        rationale: "AI service not available",
        confidence: 0.5,
      };
    }

    try {
      const prompt = `Erkläre die folgende Entscheidung des Systems:
      
Typ: ${decision.type}
Daten: ${JSON.stringify(decision.data, null, 2)}

Erkläre:
1. Warum diese Entscheidung getroffen wurde
2. Welche Alternativen in Betracht gezogen wurden
3. Wie sicher die Entscheidung ist (0-1)

Antworte im JSON-Format mit: rationale, alternatives (Array), confidence (0-1)`;

      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Du bist ein Experte für erklärbare KI. Erkläre Entscheidungen klar und nachvollziehbar.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      const explanation = JSON.parse(content) as Partial<Explanation>;
      return {
        decision,
        rationale: explanation.rationale || "Keine Erklärung verfügbar",
        alternatives: explanation.alternatives || [],
        confidence: explanation.confidence || 0.5,
      };
    } catch (error) {
      console.error("Error in decision explanation:", error);
      return {
        decision,
        rationale: "Fehler bei der Erklärung",
        confidence: 0.5,
      };
    }
  }

  /**
   * Identify relations between datasets using AI
   */
  async identifyRelations(metadataArray: Metadata[]): Promise<Relation[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const prompt = this.buildRelationPrompt(metadataArray);
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `Du bist ein Experte für Datenmodellierung und Relationen.
            Identifiziere Beziehungen zwischen verschiedenen Datensätzen.
            Antworte IMMER im JSON-Format mit einem Array von Relationen.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const result = JSON.parse(content) as { relations?: Relation[] };
      return result.relations || [];
    } catch (error) {
      console.error("Error in relation identification:", error);
      return [];
    }
  }

  /**
   * Generate explanation text for visualizations
   */
  async generateExplanation(
    visualizationType: string,
    data: unknown
  ): Promise<string> {
    if (!this.isAvailable()) {
      return "Erklärung nicht verfügbar";
    }

    try {
      const prompt = `Erkläre diese Visualisierung:
      
Typ: ${visualizationType}
Daten: ${JSON.stringify(data, null, 2)}

Erkläre:
- Was zeigt die Visualisierung?
- Warum wurde dieser Typ gewählt?
- Welche Erkenntnisse lassen sich ableiten?`;

      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Du bist ein Experte für Datenvisualisierung. Erkläre Visualisierungen klar und verständlich.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      });

      return response.choices[0]?.message?.content || "Erklärung nicht verfügbar";
    } catch (error) {
      console.error("Error in explanation generation:", error);
      return "Fehler bei der Erklärung";
    }
  }

  /**
   * Build prompt for metadata analysis
   */
  private buildMetadataAnalysisPrompt(metadataArray: Metadata[]): string {
    const metadataSummary = metadataArray.map((meta, idx) => {
      return `
Datei ${idx + 1}: ${meta.fileName}
- Spalten: ${meta.columns.map(c => `${c.name} (${c.type})`).join(", ")}
- Zeilen: ${meta.rowCount}
- Header vorhanden: ${meta.hasHeader}
- Beispiel-Daten (erste 3 Zeilen):
${JSON.stringify(meta.sample.rows.slice(0, 3), null, 2)}
`;
    }).join("\n");

    return `Analysiere die folgenden CSV-Metadaten und erstelle eine strukturierte Analyse:

${metadataSummary}

Erstelle eine JSON-Antwort mit:
- structure: { tables: Metadata[], relations: Relation[], overlaps: SemanticOverlap[], suggestedMerge?: {...} }
- visualizations: Array von Visualisierungsvorschlägen
- insights: Array von Erkenntnissen (Strings)
- assumptions: Array von Annahmen (Strings)

Identifiziere:
1. Potenzielle Relationen zwischen den Dateien
2. Semantische Überschneidungen
3. Passende Visualisierungen
4. Wichtige Erkenntnisse`;
  }

  /**
   * Build prompt for visualization suggestions
   */
  private buildVisualizationPrompt(structure: Structure): string {
    return `Basierend auf dieser Datenstruktur schlage passende Visualisierungen vor:

Tabellen: ${structure.tables.length}
Relationen: ${structure.relations.length}
Überschneidungen: ${structure.overlaps.length}

Spalten-Informationen:
${structure.tables.map((t, i) => 
  `Tabelle ${i + 1}: ${t.columns.map(c => `${c.name} (${c.type})`).join(", ")}`
).join("\n")}

Erstelle ein JSON-Objekt mit einem Array "visualizations" von Visualisierungsvorschlägen.
Jeder Vorschlag sollte enthalten:
- type: einer der Typen (bar-chart, line-chart, pie-chart, table, scatter-plot, relational-view, aggregated-overview)
- explanation: Warum diese Visualisierung passend ist
- reasoning: Begründung`;
  }

  /**
   * Build prompt for relation identification
   */
  private buildRelationPrompt(metadataArray: Metadata[]): string {
    const metadataSummary = metadataArray.map((meta, idx) => {
      return `
Datei ${idx + 1}: ${meta.fileName}
Spalten: ${meta.columns.map(c => `${c.name} (${c.type})`).join(", ")}
`;
    }).join("\n");

    return `Identifiziere Beziehungen zwischen diesen Datensätzen:

${metadataSummary}

Erstelle ein JSON-Objekt mit einem Array "relations" von Relationen.
Jede Relation sollte enthalten:
- type: "key" | "time" | "category" | "semantic"
- sourceColumn: Spaltenname aus Datei 1
- targetColumn: Spaltenname aus Datei 2
- confidence: 0-1
- description: Beschreibung der Relation`;
  }

  /**
   * Fallback analysis when AI is not available
   */
  private getFallbackAnalysis(metadataArray: Metadata[]): AIAnalysis {
    return {
      structure: this.getFallbackStructure(metadataArray),
      visualizations: [],
      insights: [],
      assumptions: [],
    };
  }

  /**
   * Get fallback structure
   */
  private getFallbackStructure(metadataArray: Metadata[]): Structure {
    return {
      tables: metadataArray,
      relations: [],
      overlaps: [],
    };
  }

  /**
   * Unified analysis: Takes metadata, data slices, user prompt and returns complete visualization instructions
   */
  async unifiedAnalysis(
    metadataArray: Metadata[],
    dataSlices: CSVData[],
    userPrompt: string
  ): Promise<UnifiedAIOutput> {
    if (!this.isAvailable()) {
      return this.getFallbackUnifiedOutput(metadataArray);
    }

    try {
      const prompt = this.buildUnifiedAnalysisPrompt(metadataArray, dataSlices, userPrompt);
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `Du bist ein Experte für Datenanalyse und Visualisierung. 
            Analysiere die bereitgestellten Metadaten und Datenstichproben von CSV-Dateien.
            Erstelle eine vollständige Analyse mit Visualisierungsanweisungen, Relationen und Begründungen.
            Antworte IMMER im JSON-Format mit der exakten Struktur, die gefordert wird.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      const result = JSON.parse(content) as Partial<UnifiedAIOutput>;
      
      return {
        visualizations: result.visualizations || [],
        relations: result.relations || [],
        reasoning: result.reasoning || "Keine Begründung verfügbar",
        metadata: {
          insights: result.metadata?.insights || [],
          assumptions: result.metadata?.assumptions || [],
        },
      };
    } catch (error) {
      console.error("Error in unified AI analysis:", error);
      return this.getFallbackUnifiedOutput(metadataArray);
    }
  }

  /**
   * Build prompt for unified analysis
   */
  private buildUnifiedAnalysisPrompt(
    metadataArray: Metadata[],
    dataSlices: CSVData[],
    userPrompt: string
  ): string {
    const metadataSummary = metadataArray.map((meta, idx) => {
      return `
Datei ${idx + 1}: ${meta.fileName}
- Spalten: ${meta.columns.map(c => `${c.name} (${c.type})`).join(", ")}
- Zeilen: ${meta.rowCount}
- Header vorhanden: ${meta.hasHeader}
`;
    }).join("\n");

    const dataSlicesSummary = dataSlices.map((data, idx) => {
      const sampleRows = data.rows.slice(0, 5);
      return `
Datei ${idx + 1}: ${data.fileName}
Datenstichprobe (5 Elemente):
${JSON.stringify(sampleRows, null, 2)}
`;
    }).join("\n");

    return `Analysiere die folgenden CSV-Daten und erstelle eine vollständige Visualisierungsstrategie:

METADATEN:
${metadataSummary}

DATENSTICHPROBEN (5 Elemente pro Datei):
${dataSlicesSummary}

USER-PROMPT (zusätzlicher Kontext):
${userPrompt || "Kein zusätzlicher Kontext bereitgestellt"}

Erstelle eine JSON-Antwort mit folgender Struktur:
{
  "visualizations": [
    {
      "type": "bar-chart" | "line-chart" | "pie-chart" | "table" | "scatter-plot" | "relational-view" | "aggregated-overview",
      "module": "Name des Visualisierungsmoduls",
      "config": {
        "dataSource": "Dateiname oder 'combined'",
        "columns": ["Spalte1", "Spalte2"],
        "aggregation": "sum" | "avg" | "count" | null,
        "filters": {}
      },
      "reasoning": "Warum diese Visualisierung gewählt wurde"
    }
  ],
  "relations": [
    {
      "type": "key" | "time" | "category" | "semantic",
      "sourceColumn": "Spaltenname aus Datei 1",
      "targetColumn": "Spaltenname aus Datei 2",
      "confidence": 0.0-1.0,
      "description": "Beschreibung der Relation"
    }
  ],
  "reasoning": "Gesamtbegründung für alle Entscheidungen und Visualisierungen",
  "metadata": {
    "insights": ["Erkenntnis 1", "Erkenntnis 2"],
    "assumptions": ["Annahme 1", "Annahme 2"]
  }
}

WICHTIG:
- Identifiziere alle relevanten Relationen zwischen den Dateien
- Wähle passende Visualisierungen basierend auf den Daten und dem User-Prompt
- Erkläre jede Entscheidung klar
- Berücksichtige den User-Prompt bei der Auswahl der Visualisierungen`;
  }

  /**
   * Fallback unified output when AI is not available
   */
  private getFallbackUnifiedOutput(metadataArray: Metadata[]): UnifiedAIOutput {
    return {
      visualizations: [],
      relations: [],
      reasoning: "AI-Service nicht verfügbar",
      metadata: {
        insights: [],
        assumptions: [],
      },
    };
  }
}
