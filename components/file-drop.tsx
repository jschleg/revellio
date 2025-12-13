"use client";

import { useCallback, useState } from "react";
import { Upload, File, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileDropProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

export function FileDrop({
  onFilesSelected,
  accept = ".csv",
  maxFiles,
  className,
}: FileDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        // Check file type
        if (accept && !file.name.toLowerCase().endsWith(accept.replace(".", ""))) {
          errors.push(`${file.name} ist kein gültiges ${accept.toUpperCase()}-Format`);
          continue;
        }

        // Check max files
        if (maxFiles && validFiles.length + selectedFiles.length >= maxFiles) {
          errors.push(`Maximal ${maxFiles} Datei(en) erlaubt`);
          break;
        }

        validFiles.push(file);
      }

      if (errors.length > 0) {
        setError(errors.join(", "));
      } else {
        setError(null);
      }

      return validFiles;
    },
    [accept, maxFiles, selectedFiles.length]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validFiles = validateFiles(fileArray);

      if (validFiles.length > 0) {
        const newFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
      }
    },
    [selectedFiles, validateFiles, onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
      setError(null);
    },
    [selectedFiles, onFilesSelected]
  );

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    onFilesSelected([]);
    setError(null);
  }, [onFilesSelected]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          "min-h-[200px] p-8",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-zinc-300/50 bg-muted/30 hover:border-purple-300 hover:bg-muted/50",
          "dark:border-zinc-700/50 dark:hover:border-purple-700/50 dark:hover:bg-muted/30"
        )}
      >
        <input
          type="file"
          id="file-input"
          accept={accept}
          multiple={!maxFiles || maxFiles > 1}
          onChange={handleFileInput}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={cn(
              "rounded-full p-4",
              isDragging ? "bg-primary/10" : "bg-muted dark:bg-muted"
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8",
                isDragging ? "text-primary" : "text-zinc-600 dark:text-zinc-400"
              )}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {isDragging ? "Dateien hier ablegen" : "Dateien hier ablegen oder klicken zum Auswählen"}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {accept.toUpperCase()} Dateien
              {maxFiles && ` (max. ${maxFiles})`}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Ausgewählte Dateien ({selectedFiles.length})
            </p>
            <button
              onClick={clearAll}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Alle entfernen
            </button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-zinc-200/50 bg-card p-3 dark:border-zinc-700/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                  <File className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <button
                    onClick={() => removeFile(index)}
                    className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    aria-label="Datei entfernen"
                  >
                    <X className="h-4 w-4 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

