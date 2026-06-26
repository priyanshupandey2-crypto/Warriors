/**
 * @file config.ts
 * @description Centralized model configuration for the AI pipeline.
 * Use QUIZ_MODEL env var to A/B test quiz/capstone model routing.
 */

// Primary model for outline + content (fast, high-quality)
export const MODEL_CONFIG = {
  outline:     'llama-3.3-70b-versatile',
  content:     'llama-3.3-70b-versatile',
  personalizer: 'llama-3.3-70b-versatile',
  // Configurable via env var — defaults to llama-3.3-70b-versatile for quality
  // Set QUIZ_MODEL=mistral-7b-instruct to use Mistral (when MISTRAL_API_KEY is set)
  quiz:        process.env['QUIZ_MODEL'] ?? 'llama-3.3-70b-versatile',
  capstone:    process.env['CAPSTONE_MODEL'] ?? 'llama-3.3-70b-versatile',
} as const;
