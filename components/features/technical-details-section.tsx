"use client";

import { useState, useCallback } from "react";
import { Eye, Copy, Check } from "lucide-react";
import { JsonTreeView } from "@/components/json-tree-view";

interface TechnicalDetailsSectionProps {
  meshInputPayload: unknown;
  meshOutput: unknown;
  aiInputPayload: unknown;
  aiOutput: unknown;
}

export function TechnicalDetailsSection({
  meshInputPayload,
  meshOutput,
  aiInputPayload,
  aiOutput,
}: TechnicalDetailsSectionProps) {
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [copiedAIInput, setCopiedAIInput] = useState(false);
  const [copiedAIOutput, setCopiedAIOutput] = useState(false);

  const handleCopy = useCallback(async (data: unknown, setCopied: (value: boolean) => void) => {
    const jsonString = JSON.stringify(data, null, 2);
    
    // Check if we're in the browser and clipboard API is available
    if (typeof window !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        // Fall through to fallback method
      }
    }
    
    // Fallback for older browsers or when clipboard API is not available
    if (typeof document !== "undefined") {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = jsonString;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          console.error("Fallback copy command failed");
        }
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
    }
  }, []);

  return (
    <>
      {meshInputPayload && meshOutput && (
        <div className="mb-8 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Data Mesh Input / Output
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-blue-200/80 bg-blue-50/60 backdrop-blur-sm p-4 shadow-sm dark:border-blue-800/80 dark:bg-blue-950/40">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Input
                </h3>
                <button
                  onClick={() => handleCopy(meshInputPayload, setCopiedInput)}
                  className="group flex items-center gap-1.5 rounded border border-blue-300 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 transition-all hover:bg-blue-200 hover:shadow-sm dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800/50"
                  title="Copy JSON to clipboard"
                >
                  {copiedInput ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 transition-transform group-hover:scale-110" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="max-h-[600px] overflow-auto rounded bg-white/80 p-3 shadow-sm dark:bg-zinc-800/60">
                <JsonTreeView data={meshInputPayload} />
              </div>
            </div>
            <div className="rounded-lg border border-green-200/80 bg-green-50/60 backdrop-blur-sm p-4 shadow-sm dark:border-green-800/80 dark:bg-green-950/40">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Output
                </h3>
                <button
                  onClick={() => handleCopy(meshOutput, setCopiedOutput)}
                  className="group flex items-center gap-1.5 rounded border border-green-300 bg-green-100 px-2 py-1 text-xs font-medium text-green-700 transition-all hover:bg-green-200 hover:shadow-sm dark:border-green-700 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800/50"
                  title="Copy JSON to clipboard"
                >
                  {copiedOutput ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 transition-transform group-hover:scale-110" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="max-h-[600px] overflow-auto rounded bg-white/80 p-3 shadow-sm dark:bg-zinc-800/60">
                <JsonTreeView data={meshOutput} />
              </div>
            </div>
          </div>
        </div>
      )}

      {aiInputPayload && aiOutput && (
        <div className="mb-8 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                AI Analysis Input / Output
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-blue-200/80 bg-blue-50/60 backdrop-blur-sm p-4 shadow-sm dark:border-blue-800/80 dark:bg-blue-950/40">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Input
                </h3>
                <button
                  onClick={() => handleCopy(aiInputPayload, setCopiedAIInput)}
                  className="group flex items-center gap-1.5 rounded border border-blue-300 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 transition-all hover:bg-blue-200 hover:shadow-sm dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800/50"
                  title="Copy JSON to clipboard"
                >
                  {copiedAIInput ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 transition-transform group-hover:scale-110" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="max-h-[600px] overflow-auto rounded bg-white/80 p-3 shadow-sm dark:bg-zinc-800/60">
                <JsonTreeView data={aiInputPayload} />
              </div>
            </div>
            <div className="rounded-lg border border-green-200/80 bg-green-50/60 backdrop-blur-sm p-4 shadow-sm dark:border-green-800/80 dark:bg-green-950/40">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Output
                </h3>
                <button
                  onClick={() => handleCopy(aiOutput, setCopiedAIOutput)}
                  className="group flex items-center gap-1.5 rounded border border-green-300 bg-green-100 px-2 py-1 text-xs font-medium text-green-700 transition-all hover:bg-green-200 hover:shadow-sm dark:border-green-700 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800/50"
                  title="Copy JSON to clipboard"
                >
                  {copiedAIOutput ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 transition-transform group-hover:scale-110" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="max-h-[600px] overflow-auto rounded bg-white/80 p-3 shadow-sm dark:bg-zinc-800/60">
                <JsonTreeView data={aiOutput} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

