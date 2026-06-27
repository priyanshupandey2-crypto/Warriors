/**
 * @file schemas.ts
 * @description Single source of truth for all Zod schemas used throughout
 * the AuraLearn AI pipeline. Every stage validates its output against these.
 */

import { z } from 'zod';

// ─── Primitives ───────────────────────────────────────────────────────────────

export const DifficultySchema = z.enum([
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
]);

export const LearningDurationSchema = z.enum([
  '2h',
  '1d',
  '1w',
  '2w',
  '4w',
  '1m',
  '3m',
]);

export const LessonTypeSchema = z.enum(['concept', 'hands-on', 'case-study']);

// ─── UserInputSchema ──────────────────────────────────────────────────────────

/**
 * Validates the raw request body arriving at POST /api/courses/generate.
 * Export and use in the backend route handler before enqueueing the BullMQ job.
 */
export const UserInputSchema = z.object({
  topic: z.string().min(3).max(200),
  difficulty: DifficultySchema,
  expertiseDomain: z.string().min(2).max(100),
  learningDuration: LearningDurationSchema,
  tags: z.array(z.string().min(1)).max(10).default([]),
  organisationName: z.string().optional(),
});

export type UserInputSchemaType = z.infer<typeof UserInputSchema>;

// ─── OutlineSchema (Stage 1) ──────────────────────────────────────────────────

export const LessonOutlineSchema = z.object({
  id: z.string().regex(/^m\d+l\d+$/, 'Must match pattern m{n}l{n}'),
  title: z.string().min(5).max(150),
  type: LessonTypeSchema,
});

export const ModuleOutlineSchema = z.object({
  id: z.string().regex(/^m\d+$/, 'Must match pattern m{n}'),
  title: z.string().min(5).max(150),
  description: z.string().min(20).max(500),
  lessons: z.array(LessonOutlineSchema).min(2).max(5),
});

export const OutlineSchema = z.object({
  title: z.string().min(5).max(200),
  subtitle: z.string().min(10).max(300),
  description: z.string().min(50).max(1000),
  learningOutcomes: z
    .array(z.string().min(10))
    .min(4)
    .max(8),
  modules: z.array(ModuleOutlineSchema).min(3).max(9),
});

export type OutlineSchemaType = z.infer<typeof OutlineSchema>;

// ─── LessonContentSchema (Stage 2) ───────────────────────────────────────────

export const CodeSnippetSchema = z.object({
  language: z.string().min(1),
  code: z.string().min(10),
  caption: z.string().min(5).max(200),
});

export const LessonContentSchema = z.object({
  content: z
    .string()
    .min(100, 'Lesson content must be at least 100 characters in markdown format'),
  estimatedReadMinutes: z.number().int().min(1).max(60),
  _validationWarnings: z.array(z.string()).optional(),
});

export const LessonContentMapSchema = z.record(z.string(), LessonContentSchema);

export type LessonContentMapSchemaType = z.infer<typeof LessonContentMapSchema>;

// ─── QuizSchema (Stage 3a) ────────────────────────────────────────────────────

export const QuizQuestionSchema = z.object({
  question: z.string().min(20),
  options: z
    .array(z.string().min(3))
    .length(4, 'Must have exactly 4 options'),
  correctIndex: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
  explanation: z.string().min(20),
  _validationWarnings: z.array(z.string()).optional(),
});

export const ModuleQuizSchema = z.object({
  moduleId: z.string(),
  questions: z
    .array(QuizQuestionSchema)
    .length(4, 'Must have exactly 4 questions'),
});

export const QuizMapSchema = z.record(z.string(), ModuleQuizSchema);

export type QuizMapSchemaType = z.infer<typeof QuizMapSchema>;

// ─── CapstoneSchema (Stage 3b) ────────────────────────────────────────────────

export const CapstonePhaseSchema = z.object({
  phase: z.string().min(3).max(100),
  description: z.string().min(30),
  deliverable: z.string().min(10),
});

export const CapstoneSchema = z.object({
  title: z.string().min(5).max(200),
  overview: z.string().min(100),
  realWorldRelevance: z.string().min(50),
  phases: z.array(CapstonePhaseSchema).min(3).max(6),
  techStack: z.array(z.string().min(1)).min(2),
  evaluationCriteria: z.array(z.string().min(10)).min(3),
  stretchGoals: z.array(z.string().min(10)).min(2),
});

export type CapstoneSchemaType = z.infer<typeof CapstoneSchema>;

// ─── PersonalizationPatchSchema (Stage 4) ─────────────────────────────────────

export const AnalogyInjectionSchema = z.object({
  lessonId: z.string(),
  insertAfterParagraph: z.number().int().min(0),
  analogyText: z.string().min(30),
});

export const PrerequisiteGapSchema = z.object({
  concept: z.string().min(3),
  suggestedLessonTitle: z.string().min(5),
  insertBeforeModuleId: z.string(),
});

export const DifficultyFlagSchema = z.object({
  lessonId: z.string(),
  reason: z.string().min(10),
  suggestedAction: z.string().min(10),
});

export const PersonalizationPatchSchema = z.object({
  analogyInjections: z.array(AnalogyInjectionSchema),
  prerequisiteGaps: z.array(PrerequisiteGapSchema),
  difficultyFlags: z.array(DifficultyFlagSchema),
});

export type PersonalizationPatchSchemaType = z.infer<
  typeof PersonalizationPatchSchema
>;

// ─── CourseSchema (Master – Stage 5) ─────────────────────────────────────────

const CourseMetaSchema = z.object({
  schemaVersion: z.string(),
  generatedAt: z.string().datetime(),
  models: z.object({
    outline: z.string(),
    content: z.string(),
    quizzes: z.string(),
    capstone: z.string(),
  }),
  tavilySources: z.array(z.string().url()),
  generationDurationMs: z.number().int().min(0),
});

const FullLessonSchema = z.object({
  id: z.string(),
  title: z.string().min(5),
  type: LessonTypeSchema,
  content: z.string().min(100, 'Lesson content must be at least 100 characters in markdown format'),
  estimatedReadMinutes: z.number().int().min(1).max(60),
});

export const FullModuleSchema = z.object({
  id: z.string(),
  title: z.string().min(5),
  description: z.string().min(20),
  lessons: z.array(FullLessonSchema).min(2).max(5),
  quiz: ModuleQuizSchema,
});

const CourseBodySchema = z.object({
  title: z.string().min(5).max(200),
  subtitle: z.string().min(10),
  description: z.string().min(50),
  difficulty: DifficultySchema,
  estimatedHours: z.number().positive(),
  tags: z.array(z.string()),
  learningOutcomes: z.array(z.string().min(10)).min(4).max(8),
  modules: z.array(FullModuleSchema).min(3).max(9),
  capstone: CapstoneSchema,
});

/**
 * Master schema — the backend persists this to MongoDB.
 * This is the final validated shape returned by the pipeline.
 */
export const CourseSchema = z.object({
  meta: CourseMetaSchema,
  course: CourseBodySchema,
});

export type CourseSchemaType = z.infer<typeof CourseSchema>;
