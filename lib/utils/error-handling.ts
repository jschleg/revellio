/**
 * Error handling utilities for consistent error management across the application
 */

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
}

/**
 * Extract error information from API response
 */
export async function extractApiError(
  response: Response
): Promise<{ message: string; status: number }> {
  try {
    const errorData = await response.json();
    return {
      message: errorData.details || errorData.error || "Unknown error",
      status: response.status,
    };
  } catch {
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
    };
  }
}

/**
 * Create a standardized error object
 */
export function createError(message: string, status?: number, details?: unknown): ApiError {
  return {
    message,
    status,
    details,
  };
}

