/**
 * @file logger.ts
 * @description Structured pino logger for the AI pipeline.
 * No console.log — all production logging goes through this.
 */

import pino from 'pino';

const level = process.env['LOG_LEVEL'] ?? 'info';

/**
 * Structured logger instance used across the entire AI pipeline.
 * Uses pino for JSON-formatted, high-performance logging.
 */
export const logger = pino({
  name: 'auralearn-ai-pipeline',
  level,
  ...(process.env['NODE_ENV'] !== 'production'
    ? { transport: { target: 'pino/file', options: { destination: 1 } } }
    : {}),
  serializers: {
    err: pino.stdSerializers.err,
  },
  formatters: {
    level(label: string) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Creates a child logger scoped to a specific pipeline stage.
 * @param stage - Stage identifier (e.g. 'stage1_outline', 'enrichment')
 * @param jobId - Optional BullMQ job ID for correlation
 */
export function stageLogger(stage: string, jobId?: string): pino.Logger {
  return logger.child({ stage, ...(jobId ? { jobId } : {}) });
}
