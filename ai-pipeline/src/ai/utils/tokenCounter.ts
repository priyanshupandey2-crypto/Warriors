/**
 * @file utils/tokenCounter.ts
 * @description Rough token estimation for prompt budget checks.
 * Uses the ~4 chars/token heuristic for English text.
 */

/**
 * Estimates the token count for a given string.
 * Uses the chars/4 heuristic — accurate enough for prompt budget enforcement.
 *
 * @param text - Raw text to estimate
 * @returns Approximate token count
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncates text to stay within a token budget.
 * Cuts at the last word boundary before the limit to avoid mid-word truncation.
 *
 * @param text - Text to potentially truncate
 * @param maxTokens - Maximum allowed token count
 * @returns Truncated text
 */
export function truncateToTokenBudget(
  text: string,
  maxTokens: number,
): string {
  const maxChars = maxTokens * 4;

  if (text.length <= maxChars) {
    return text;
  }

  // Cut at the last space before the limit
  const truncated = text.substring(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated;
}

/**
 * Checks whether the combined prompt payload is within token budget.
 *
 * @param parts - Array of text segments composing the prompt
 * @param budget - Max total tokens allowed
 * @returns Whether the payload fits
 */
export function isWithinBudget(parts: string[], budget: number): boolean {
  const total = parts.reduce((sum, p) => sum + estimateTokens(p), 0);
  return total <= budget;
}
