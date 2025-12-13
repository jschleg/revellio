"use client";

import { useState } from "react";
import { FileDrop } from "@/components/file-drop";
import { CSVParser } from "@/lib/data/csv-parser";
import { DataValidator } from "@/lib/data/data-validator";
import { DataProcessor } from "@/lib/data/data-processor";
import { MetadataExtractor } from "@/lib/analysis/metadata-extractor";
import type { CSVData, ProcessedData, ValidationResult } from "@/lib/types/data";
import { FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function PlaygroundPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
    setIsProcessing(true);

    try {
      const parser = new CSVParser();
      const validator = new DataValidator();
      const processor = new DataProcessor();
      const extractor = new MetadataExtractor();

      // Parse all files
      const parsedData: CSVData[] = [];
      const validations: ValidationResult[] = [];

      for (const file of selectedFiles) {
        try {
          // Validate file content first
          const content = await file.text();
          if (!parser.validate(content)) {
            validations.push({
              isValid: false,
              errors: [`${file.name}: File is empty or invalid`],
              warnings: [],
            });
            continue;
          }

          // Parse CSV
          const data = await parser.parse(file);
          parsedData.push(data);

          // Validate parsed data
          const validation = validator.validate(data);
          validations.push(validation);

          // Check quality
          const quality = validator.checkQuality(data);
          if (quality.issues.length > 0) {
            validation.warnings.push(...quality.issues);
          }
        } catch (err) {
          validations.push({
            isValid: false,
            errors: [`${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`],
            warnings: [],
          });
        }
      }

      setCsvData(parsedData);
      setValidationResults(validations);

      // Process data if we have valid files
      if (parsedData.length > 0) {
        const processed = await processor.process(parsedData);
        setProcessedData(processed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setCsvData([]);
    setProcessedData(null);
    setValidationResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Revellio Playground
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Lade CSV-Dateien hoch und sehe, wie Revellio sie analysiert
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Dateien hochladen
          </h2>
          <FileDrop
            onFilesSelected={handleFilesSelected}
            accept=".csv"
            maxFiles={10}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Fehler</span>
            </div>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-600 dark:text-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-400">
              Dateien werden verarbeitet...
            </span>
          </div>
        )}

        {/* Validation Results */}
        {validationResults.length > 0 && (
          <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Validierung
            </h2>
            <div className="space-y-4">
              {validationResults.map((validation, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${
                    validation.isValid
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {validation.isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <span className="font-medium">
                      {files[index]?.name || `Datei ${index + 1}`}
                    </span>
                    <span
                      className={`ml-2 rounded px-2 py-1 text-xs ${
                        validation.isValid
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                      }`}
                    >
                      {validation.isValid ? "Gültig" : "Ungültig"}
                    </span>
                  </div>
                  {validation.errors.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {validation.errors.map((err, i) => (
                        <li key={i} className="text-red-700 dark:text-red-300">
                          {err}
                        </li>
                      ))}
                    </ul>
                  )}
                  {validation.warnings.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {validation.warnings.map((warn, i) => (
                        <li key={i} className="text-yellow-700 dark:text-yellow-300">
                          {warn}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Display */}
        {csvData.length > 0 && (
          <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Metadaten
            </h2>
            <div className="space-y-6">
              {csvData.map((data, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                      {data.fileName}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400">Zeilen:</span>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {data.metadata.rowCount}
                      </p>
                    </div>
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400">Spalten:</span>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {data.metadata.columns.length}
                      </p>
                    </div>
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400">Header:</span>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {data.metadata.hasHeader ? "Ja" : "Nein"}
                      </p>
                    </div>
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400">Spaltentypen:</span>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {Array.from(new Set(data.metadata.columnTypes)).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-zinc-500 dark:text-zinc-400">Spalten:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.metadata.columns.map((col, colIndex) => (
                        <span
                          key={colIndex}
                          className="rounded bg-zinc-200 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {col.name} ({col.type})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structure Analysis */}
        {processedData && (
          <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Strukturanalyse
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Anzahl Tabellen:</span>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {processedData.structure.tables.length}
                </p>
              </div>
              {processedData.structure.relations.length > 0 && (
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Gefundene Relationen:</span>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {processedData.structure.relations.length}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {processedData.structure.relations.slice(0, 5).map((rel, i) => (
                      <li key={i} className="text-zinc-600 dark:text-zinc-400">
                        {rel.description} ({rel.type})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {processedData.structure.suggestedMerge && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <span className="font-medium text-blue-900 dark:text-blue-200">
                    Merge-Vorschlag:
                  </span>
                  <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">
                    Strategie: {processedData.structure.suggestedMerge.strategy}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-700 dark:text-blue-300">
                    {processedData.structure.suggestedMerge.assumptions.map((assumption, i) => (
                      <li key={i}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clear Button */}
        {files.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleClear}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Alles zurücksetzen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

