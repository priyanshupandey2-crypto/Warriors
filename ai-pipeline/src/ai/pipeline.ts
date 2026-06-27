/**
 * @file pipeline.ts
 * @description Main pipeline orchestrator for AuraLearn course generation.
 * Wires all 5 stages, runs 3a/3b in parallel, handles retries,
 * enforces 90-second timeout, and emits stage_complete progress events.
 */

import { EventEmitter } from 'events';
import { enrichWithTavily } from './enrichment';
import { buildPromptContext } from './promptBuilder';
import { generateOutline } from './stages/stage1_outline';
import { generateLessonContent } from './stages/stage2_content';
import { generateQuizzes } from './stages/stage3a_quizzes';
import { generateCapstone } from './stages/stage3b_capstone';
import { generateOrgModule } from './stages/stage3c_org_module';
import { generatePersonalizationPatch } from './stages/stage4_personalizer';
import { assembleCourse } from './stages/stage5_assembler';
import { UserInputSchema } from './schemas';
import type { UserInput, PipelineResult, StageCompleteEvent } from './types';
import { stageLogger } from './logger';

const log = stageLogger('pipeline');

const DEFAULT_TIMEOUT_MS = Number(
  process.env['AI_PIPELINE_TIMEOUT_MS'] ?? 90_000,
);

/** EventEmitter subclass used to stream stage_complete events to callers. */
export class PipelineEmitter extends EventEmitter {
  override emit(event: string, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }

  emitStageComplete(data: StageCompleteEvent): void {
    this.emit('stage_complete', data);
  }

  onStageComplete(listener: (data: StageCompleteEvent) => void): this {
    return this.on('stage_complete', listener);
  }
}

export interface PipelineOptions {
  /** EventEmitter to stream progress events — used for SSE delivery */
  emitter?: PipelineEmitter;
  /** Override timeout in ms */
  timeoutMs?: number;
}

/**
 * Main entry point for the AI course generation pipeline.
 * Validates input, runs all 5 stages, and returns a fully assembled CourseJSON.
 *
 * Stage order:
 *   Enrichment → Stage 1 → Stage 2 → [Stage 3a ‖ Stage 3b] → Stage 4 → Stage 5
 *
 * @param rawInput - Raw user input (validated internally)
 * @param opts - Optional emitter and timeout override
 * @returns PipelineResult — valid CourseJSON or partial with errors
 */
export async function runCoursePipeline(
  rawInput: UserInput,
  opts: PipelineOptions = {},
): Promise<PipelineResult> {
  const { emitter, timeoutMs = DEFAULT_TIMEOUT_MS } = opts;
  const pipelineStart = Date.now();

  // ── Validate user input ──────────────────────────────────────────────────
  const parsed = UserInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      valid: false,
      errors: [parsed.error],
      partialCourse: {},
    };
  }
  const input: UserInput = parsed.data as UserInput;
  log.info({ topic: input.topic, difficulty: input.difficulty }, 'Pipeline started');

  // ── Timeout wrapper ──────────────────────────────────────────────────────
  let timedOut = false;
  const timeoutHandle = globalThis.setTimeout(() => {
    timedOut = true;
    log.error({ timeoutMs }, 'Pipeline timeout exceeded');
  }, timeoutMs);

  const emit = (stage: string, progress: number, data?: unknown): void => {
    emitter?.emitStageComplete({ stage, progress, data });
    log.info({ stage, progress }, 'Stage complete');
    
    // Terminal logging for debugging SSE and visual pipeline tracing
    console.log(`\n==================================================`);
    console.log(`🏁 STAGE COMPLETE: ${stage} (Progress: ${progress}%)`);
    console.log(`==================================================`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  };

  try {
    // ── Enrichment ─────────────────────────────────────────────────────────
    const enrichment = await enrichWithTavily(input.topic, input.tags);
    checkTimeout(timedOut, 'enrichment');
    emit('enrichment', 10, enrichment);

    // ── Build prompt context ───────────────────────────────────────────────
    const ctx = buildPromptContext(input, enrichment);
    emit('prompt_context', 15, ctx);

    // ── Stage 1: Outline ───────────────────────────────────────────────────
    const outline = await generateOutline(ctx);
    checkTimeout(timedOut, 'stage1_outline');
    emit('stage1_outline', 30, outline);

    // ── Stage 2: Lesson Content ────────────────────────────────────────────
    const contentMap = await generateLessonContent(ctx, outline);
    checkTimeout(timedOut, 'stage2_content');
    emit('stage2_content', 55, contentMap);

    // ── Stage 3a + 3b + 3c: Parallel ────────────────────────────────────────────
    const [quizMap, capstone, orgModule] = await Promise.all([
      generateQuizzes(ctx, outline, contentMap),
      generateCapstone(ctx, outline),
      generateOrgModule(ctx, outline),
    ]);
    checkTimeout(timedOut, 'stage3_parallel');
    emit('stage3_quizzes_capstone', 75, { quizMap, capstone, orgModule });

    // ── Stage 4: Personalization ───────────────────────────────────────────
    const patch = await generatePersonalizationPatch(
      ctx,
      outline,
      contentMap,
      quizMap,
      capstone,
    );
    checkTimeout(timedOut, 'stage4_personalizer');
    emit('stage4_personalizer', 90, patch);

    // ── Stage 5: Assemble + Validate ───────────────────────────────────────
    const result = assembleCourse(
      ctx,
      outline,
      contentMap,
      quizMap,
      capstone,
      orgModule,
      patch,
      pipelineStart,
    );
    emit('stage5_assembler', 100, result);

    const totalMs = Date.now() - pipelineStart;
    log.info({ valid: result.valid, totalMs }, 'Pipeline complete');

    return result;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    log.error({ err: error.message }, 'Pipeline failed with unrecoverable error');

    return {
      valid: false,
      errors: [error],
      partialCourse: {},
    };
  } finally {
    globalThis.clearTimeout(timeoutHandle);
  }
}

function checkTimeout(timedOut: boolean, stage: string): void {
  if (timedOut) {
    throw new Error(`Pipeline timeout exceeded at stage: ${stage}`);
  }
}
