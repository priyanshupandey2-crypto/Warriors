/**
 * @file promptAudit.ts
 * @description Prompt audit logging for debugging and compliance.
 * Logs out a summary for the main stream, and a complete unredacted log to a separate file transport using pino.
 * Controlled by PROMPT_AUDIT_ENABLED env var (default: true).
 */

import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

const AUDIT_ENABLED = process.env['PROMPT_AUDIT_ENABLED'] !== 'false';

// Setup full prompt audit logger using a separate file transport.
// Logs are written to logs/prompt_audit.log
const auditLogDir = path.join(process.cwd(), 'logs');
if (AUDIT_ENABLED && !fs.existsSync(auditLogDir)) {
  fs.mkdirSync(auditLogDir, { recursive: true });
}

const fileTransport = pino.transport({
  target: 'pino/file',
  options: { destination: path.join(auditLogDir, 'prompt_audit.log'), mkdir: true }
});

const fullAuditLogger = pino(
  {
    name: 'auralearn-prompt-audit',
    level: 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  fileTransport
);

export interface PromptAuditEntry {
  stage: string;
  timestamp: string;
  systemPrompt: string;
  userPrompt: string;
  promptTokenEstimate: number;
}

export interface PromptAuditSummary {
  stage: string;
  timestamp: string;
  systemPromptPreview: string;
  promptTokenEstimate: number;
}

/**
 * Logs a prompt audit entry for a pipeline stage.
 * Sends the full unredacted prompt to the audit file, and logs a short summary 
 * to the main logger to keep it clean.
 * No-op if PROMPT_AUDIT_ENABLED=false.
 *
 * @param stage - Stage identifier (e.g. 'stage1_outline')
 * @param prompts - Object containing systemPrompt and userPrompt
 */
export function auditLog(
  stage: string,
  prompts: { systemPrompt: string; userPrompt: string },
): void {
  if (!AUDIT_ENABLED) return;

  const promptTokenEstimate = Math.ceil((prompts.systemPrompt.length + prompts.userPrompt.length) / 4);

  const fullEntry: PromptAuditEntry = {
    stage,
    timestamp: new Date().toISOString(),
    systemPrompt: redactKeys(prompts.systemPrompt),
    userPrompt: redactKeys(prompts.userPrompt),
    promptTokenEstimate
  };

  // Write full prompts to separate audit log
  fullAuditLogger.info({ promptAudit: fullEntry }, `[AUDIT_FULL] ${stage}`);

  const summaryEntry: PromptAuditSummary = {
    stage,
    timestamp: fullEntry.timestamp,
    systemPromptPreview: redactKeys(prompts.systemPrompt.slice(0, 120)),
    promptTokenEstimate
  };

  // Write short summary to main logger
  logger.info({ promptAudit: summaryEntry }, `[AUDIT] ${stage}`);
}

/** Masks any potential secrets before storage. */
function redactKeys(text: string): string {
  return text
    .replace(/sk-[a-zA-Z0-9]{10,}/g, '[REDACTED_API_KEY]')
    .replace(/Bearer\s+[a-zA-Z0-9._-]{10,}/g, 'Bearer [REDACTED_TOKEN]');
}
