/**
 * @file types.ts
 * @description All shared TypeScript types and interfaces for the AuraLearn AI pipeline.
 * Single source of truth for non-Zod types used across all stages.
 */

// ─── User Input ───────────────────────────────────────────────────────────────

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type LearningDuration = '2h' | '1d' | '1w' | '2w' | '4w' | '1m' | '3m';

export type LessonType = 'concept' | 'hands-on' | 'case-study';

export interface UserInput {
  topic: string;
  difficulty: Difficulty;
  expertiseDomain: string;
  learningDuration: LearningDuration;
  tags: string[];
}

// ─── Tavily Enrichment ────────────────────────────────────────────────────────

export interface TavilySource {
  url: string;
  title: string;
  content: string;
  score: number;
}

export interface EnrichmentResult {
  trendingSummary: string;
  currentTools: string[];
  keyFrameworks: string[];
  rawSources: TavilySource[];
}

// ─── Prompt Context ───────────────────────────────────────────────────────────

export interface ModuleSpec {
  moduleCount: number;
  lessonsPerModule: number | [number, number]; // fixed or [min, max]
}

export interface PromptContext {
  userInput: UserInput;
  enrichment: EnrichmentResult;
  domainAnalogy: string;
  moduleSpec: ModuleSpec;
  /** ISO-8601 timestamp this context was created */
  createdAt: string;
}

// ─── Stage 1 – Outline ────────────────────────────────────────────────────────

export interface LessonOutline {
  id: string;
  title: string;
  type: LessonType;
}

export interface ModuleOutline {
  id: string;
  title: string;
  description: string;
  lessons: LessonOutline[];
}

export interface CourseOutline {
  title: string;
  subtitle: string;
  description: string;
  learningOutcomes: string[];
  modules: ModuleOutline[];
}

// ─── Stage 2 – Lesson Content ─────────────────────────────────────────────────

export interface CodeSnippet {
  language: string;
  code: string;
  caption: string;
}

export interface LessonContent {
  body: string;
  realWorldExample: string;
  codeSnippets: CodeSnippet[];
  commonPitfalls: string[];
  keyTakeaways: string[];
  estimatedReadMinutes: number;
  _validationWarnings?: string[];
}

/** Map from lessonId → LessonContent */
export type LessonContentMap = Record<string, LessonContent>;

// ─── Stage 3a – Quizzes ───────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  _validationWarnings?: string[];
}

export interface ModuleQuiz {
  moduleId: string;
  questions: QuizQuestion[];
}

/** Map from moduleId → ModuleQuiz */
export type QuizMap = Record<string, ModuleQuiz>;

// ─── Stage 3b – Capstone ──────────────────────────────────────────────────────

export interface CapstonePhase {
  phase: string;
  description: string;
  deliverable: string;
}

export interface CapstoneProject {
  title: string;
  overview: string;
  realWorldRelevance: string;
  phases: CapstonePhase[];
  techStack: string[];
  evaluationCriteria: string[];
  stretchGoals: string[];
}

// ─── Stage 4 – Personalization ────────────────────────────────────────────────

export interface AnalogyInjection {
  lessonId: string;
  insertAfterParagraph: number;
  analogyText: string;
}

export interface PrerequisiteGap {
  concept: string;
  suggestedLessonTitle: string;
  insertBeforeModuleId: string;
}

export interface DifficultyFlag {
  lessonId: string;
  reason: string;
  suggestedAction: string;
}

export interface PersonalizationPatch {
  analogyInjections: AnalogyInjection[];
  prerequisiteGaps: PrerequisiteGap[];
  difficultyFlags: DifficultyFlag[];
}

// ─── Stage 5 – Assembled Course ───────────────────────────────────────────────

export interface CourseMetadata {
  schemaVersion: string;
  generatedAt: string;
  models: {
    outline: string;
    content: string;
    quizzes: string;
    capstone: string;
  };
  tavilySources: string[];
  generationDurationMs: number;
}

export interface FullLesson {
  id: string;
  title: string;
  type: LessonType;
  content: LessonContent;
}

export interface FullModule {
  id: string;
  title: string;
  description: string;
  lessons: FullLesson[];
  quiz: ModuleQuiz;
}

export interface CourseBody {
  title: string;
  subtitle: string;
  description: string;
  difficulty: Difficulty;
  estimatedHours: number;
  tags: string[];
  learningOutcomes: string[];
  modules: FullModule[];
  capstone: CapstoneProject;
}

export interface CourseJSON {
  meta: CourseMetadata;
  course: CourseBody;
}

// ─── Pipeline Result ──────────────────────────────────────────────────────────

export type PipelineResult =
  | { valid: true; course: CourseJSON }
  | { valid: false; errors: unknown[]; partialCourse: Partial<CourseJSON> };

export interface StageCompleteEvent {
  stage: string;
  progress: number; // 0–100
  data?: unknown;
}

// ─── Model version strings ────────────────────────────────────────────────────

export const MODEL_GROQ = 'llama-3.3-70b-versatile' as const;
export const MODEL_MISTRAL = 'mistral-7b-instruct' as const;
export const SCHEMA_VERSION = '1.0.0' as const;
