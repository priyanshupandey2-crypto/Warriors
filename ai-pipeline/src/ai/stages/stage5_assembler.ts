/**
 * @file stages/stage5_assembler.ts
 * @description Stage 5 — Pure TypeScript assembler. No LLM call.
 * Merges all stage outputs, applies the personalization patch,
 * runs full Zod validation, and stamps metadata.
 */

import { CourseSchema } from '../schemas';
import type {
  PromptContext,
  CourseOutline,
  LessonContentMap,
  QuizMap,
  CapstoneProject,
  PersonalizationPatch,
  CourseJSON,
  CourseMetadata,
  FullModule,
  FullLesson,
  ModuleQuiz,
} from '../types';
import { SCHEMA_VERSION } from '../types';
import { MODEL_CONFIG } from '../config';
import { stageLogger } from '../logger';
import type { ZodError } from 'zod';

const log = stageLogger('stage5_assembler');

export type AssemblerResult =
  | { valid: true; course: CourseJSON }
  | { valid: false; errors: ZodError[]; partialCourse: Partial<CourseJSON> };

/**
 * Assembles all stage outputs into a final CourseJSON.
 * Applies PersonalizationPatch. Runs complete Zod validation.
 * Stamps schemaVersion, generatedAt, model versions, and Tavily source URLs.
 *
 * @param ctx - PromptContext (for metadata and enrichment sources)
 * @param outline - Stage 1 output
 * @param contentMap - Stage 2 output
 * @param quizMap - Stage 3a output
 * @param capstone - Stage 3b output
 * @param orgModule - Stage 3c output (optional)
 * @param patch - Stage 4 output
 * @param pipelineStartMs - Timestamp pipeline started (for duration stamping)
 * @returns AssemblerResult — valid or invalid with partial course and errors
 */
export function assembleCourse(
  ctx: PromptContext,
  outline: CourseOutline,
  contentMap: LessonContentMap,
  quizMap: QuizMap,
  capstone: CapstoneProject,
  orgModule: FullModule | null,
  patch: PersonalizationPatch,
  pipelineStartMs: number,
): AssemblerResult {
  log.info('Starting course assembly');

  // 1. Build full modules with applied content + quizzes
  const fullModules: FullModule[] = outline.modules.map((mod) => {
    const lessons: FullLesson[] = mod.lessons.map((lessonOutline) => {
      const rawContent = contentMap[lessonOutline.id];
      if (!rawContent) {
        throw new Error(`Missing expected content for lesson: ${lessonOutline.id}`);
      }
      const contentObj = rawContent;

      // Apply analogy injections from the personalization patch
      const patchedMarkdown = applyAnalogyInjections(
        lessonOutline.id,
        contentObj.content,
        patch,
      );

      return {
        id: lessonOutline.id,
        title: lessonOutline.title,
        type: lessonOutline.type,
        content: patchedMarkdown,
        estimatedReadMinutes: contentObj.estimatedReadMinutes,
      };
    });

    const quiz = quizMap[mod.id];
    if (!quiz) {
      throw new Error(`Missing expected quiz for module: ${mod.id}`);
    }

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      lessons,
      quiz,
    };
  });

  if (orgModule) {
    fullModules.push(orgModule);
  }

  // 2. Compute estimated hours from lesson read times
  const estimatedHours = computeEstimatedHours(fullModules);

  // 3. Build metadata
  const meta: CourseMetadata = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    models: {
      outline: MODEL_CONFIG.outline,
      content: MODEL_CONFIG.content,
      quizzes: MODEL_CONFIG.quiz,
      capstone: MODEL_CONFIG.capstone,
    },
    tavilySources: ctx.enrichment.rawSources
      .map((s) => s.url)
      .filter(Boolean),
    generationDurationMs: Date.now() - pipelineStartMs,
  };

  // 4. Assemble the candidate CourseJSON
  const candidate: CourseJSON = {
    meta,
    course: {
      title: outline.title,
      subtitle: outline.subtitle,
      description: outline.description,
      difficulty: ctx.userInput.difficulty,
      estimatedHours,
      tags: ctx.userInput.tags,
      learningOutcomes: outline.learningOutcomes,
      modules: fullModules,
      capstone,
    },
  };

  // 5. Validate against CourseSchema
  const validated = CourseSchema.safeParse(candidate);

  if (!validated.success) {
    log.error(
      {
        errorCount: validated.error.issues.length,
        paths: validated.error.issues.map((i) => i.path.join('.')),
      },
      'Course validation failed',
    );

    return {
      valid: false,
      errors: [validated.error],
      partialCourse: candidate,
    };
  }

  log.info('✅ Course assembled and validated');
  return { valid: true, course: validated.data as CourseJSON };
}


function applyAnalogyInjections(lessonId: string, content: string, patch: PersonalizationPatch): string {
  const injections = patch.analogyInjections.filter((inj) => inj.lessonId === lessonId);

  if (injections.length === 0) {
    return content;
  }

  let markdown = content;
  for (const injection of injections) {
    const paragraphs = markdown.split('\n\n');
    if (injection.insertAfterParagraph < paragraphs.length) {
      paragraphs.splice(injection.insertAfterParagraph + 1, 0, injection.analogyText);
      markdown = paragraphs.join('\n\n');
    }
  }

  return markdown;
}

function computeEstimatedHours(modules: FullModule[]): number {
  let totalMinutes = 0;
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      totalMinutes += lesson.estimatedReadMinutes || 0;
    }
  }
  return Math.ceil(totalMinutes / 60);
}
