"use client";

import { useState } from "react";
import { FileDrop } from "@/components/file-drop";
import { FileDisplay } from "@/components/file-display";
import { CSVParser } from "@/lib/data/csv-parser";
import type { CSVData } from "@/lib/types/data";
import { Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setError(null);
    setIsProcessing(true);

    try {
      const parser = new CSVParser();
      const parsedData: CSVData[] = [];

      for (const file of selectedFiles) {
        try {
          // Validate file content first
          const content = await file.text();
          if (!parser.validate(content)) {
            continue;
          }

          // Parse CSV
          const data = await parser.parse(file);
          parsedData.push(data);
        } catch (err) {
          // Skip invalid files silently or show error
          console.error(`Error parsing ${file.name}:`, err);
        }
      }

      setCsvData(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-purple-50/30 to-zinc-50 dark:from-zinc-950 dark:via-purple-950/20 dark:to-zinc-950">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent dark:from-purple-400 dark:to-purple-300">
            Revellio
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            KI-gestütztes Analyse- und Visualisierungstool
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Lade CSV-Dateien hoch und analysiere sie
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
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
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-200/50 bg-card p-4 dark:border-zinc-800/50">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-600 dark:text-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-400">
              Dateien werden verarbeitet...
            </span>
          </div>
        )}

        {/* File Display with Tables */}
        {csvData.length > 0 && (
          <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
            <FileDisplay csvData={csvData} />
          </div>
        )}
      </div>
    </div>
  );
}
