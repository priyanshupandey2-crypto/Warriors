/**
 * @file utils/retry.ts
 * @description Generic retry utility with exponential backoff for all pipeline stages.
 * Appends structured error feedback to the next attempt's context for LLM stages.
 */

import { logger } from '../logger';

export interface RetryOptions {
  maxAttempts?: number;
  /** Base delay in ms — doubled each attempt (1000 → 2000 → 4000) */
  baseDelayMs?: number;
  /** Optional label for logging */
  label?: string;
}

/** Context passed to the retry callback on failure */
export interface RetryFeedback {
  attempt: number;
  lastError: Error;
  /** Human-readable error message for LLM prompt injection */
  promptFeedback: string;
}

/**
 * Parses the Google 429 error message context to extract a specific retry delay
 * if the RPC error block includes a RetryInfo type.
 * @param err Error thrown by the operation
 * @returns Parsed delay in milliseconds plus a 2000ms buffer, or null if not found
 */
export function extractGoogleRetryDelay(err: unknown): number | null {
  const msg = err instanceof Error ? err.message : String(err);
  const match = msg.match(/"retryDelay":"(\d+)s"/);
  if (match && match[1]) {
    const seconds = parseInt(match[1], 10);
    if (!isNaN(seconds)) {
      return (seconds * 1000) + 2000; // adding 2s buffer as requested
    }
  }
  return null;
}

/**
 * Wraps an async function with exponential-backoff retry logic.
 * On each failure the callback receives a `RetryFeedback` object so LLM
 * stages can append the error to the next prompt attempt.
 *
 * @param fn - Async function. On retry `feedback` is truthy with prior error details.
 * @param opts - Retry configuration.
 * @returns Resolved value of `fn`.
 * @throws The last error if all attempts are exhausted.
 */
export async function withRetry<T>(
  fn: (feedback?: RetryFeedback) => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 1000, label = 'operation' } = opts;

  let lastError!: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const feedback: RetryFeedback | undefined =
        attempt === 1
          ? undefined
          : {
              attempt,
              lastError,
              promptFeedback: buildPromptFeedback(lastError, attempt),
            };

      return await fn(feedback);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxAttempts) {
        let waitMs = 0;
        let source: 'google_hint' | 'exponential' = 'exponential';

        // ONLY if it's a 429 error do we check the hint path
        if (lastError.message.includes('429')) {
          const googleHint = extractGoogleRetryDelay(lastError);
          if (googleHint !== null) {
            waitMs = googleHint;
            source = 'google_hint';
          } else {
            waitMs = Math.min(1000 * Math.pow(2, attempt), 60000);
          }
        } else {
          // Standard exponential backoff for non-429 errors
          waitMs = Math.min(1000 * Math.pow(2, attempt), 60000);
        }

        // Never retry immediately — minimum wait is always 2000ms
        waitMs = Math.max(waitMs, 2000);

        logger.warn(
          { label, attempt, maxAttempts, waitMs, source },
          `Attempt ${attempt}/${maxAttempts} failed. Waiting to retry.`
        );

        await sleep(waitMs);
      } else {
        logger.error(
          { label, maxAttempts, err: lastError.message },
          'All retry attempts exhausted',
        );
        throw lastError;
      }
    }
  }

  // Should never be reached due to loop structure but TS requires return/throw here
  throw lastError;
}

/**
 * Builds a prompt-injectable feedback string from a parse or validation error.
 * Used by LLM stages to self-correct on retry.
 */
function buildPromptFeedback(error: Error, attempt: number): string {
  const isJsonError =
    error.message.toLowerCase().includes('json') ||
    error.message.toLowerCase().includes('parse') ||
    error.message.toLowerCase().includes('syntax');

  if (isJsonError) {
    return (
      `\n\n[SYSTEM CORRECTION — Attempt ${attempt}]\n` +
      `Your previous response was not valid JSON. The parser error was:\n` +
      `  ${error.message}\n` +
      `Return ONLY raw JSON with no markdown fences, no preamble, and no explanation.`
    );
  }

  return (
    `\n\n[SYSTEM CORRECTION — Attempt ${attempt}]\n` +
    `Your previous response failed schema validation. Error details:\n` +
    `  ${error.message}\n` +
    `Fix the specific fields mentioned above and return valid JSON only.`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
