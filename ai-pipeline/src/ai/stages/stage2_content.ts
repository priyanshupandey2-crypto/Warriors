/**
 * @file stages/stage2_content.ts
 * @description Stage 2 — Lesson content generation via Groq.
 * Processes lessons in batches of 3 to stay within context limits.
 * Falls back to minimal stub content if all retries are exhausted.
 */

import Groq from 'groq-sdk';
import { LessonContentSchema } from '../schemas';
import type {
  PromptContext,
  CourseOutline,
  LessonContentMap,
  LessonContent,
  LessonOutline,
} from '../types';
import { MODEL_CONFIG } from '../config';
import { withRetry } from '../utils/retry';
import { stageLogger } from '../logger';
import { auditLog } from '../promptAudit';
import { validatePythonCode, validateStaticPatterns, ValidationError } from '../validators';

const log = stageLogger('stage2_content');
const BATCH_SIZE = 3; // Reduced from 4 to give more tokens per lesson

export async function generateLessonContent(
  ctx: PromptContext,
  outline: CourseOutline,
): Promise<LessonContentMap> {
  const apiKey = process.env['GROQ_API_KEY'];
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const groq = new Groq({ apiKey });

  // Flatten all lessons across all modules
  const allLessons: Array<{ lesson: LessonOutline; moduleTitle: string }> = [];
  for (const mod of outline.modules) {
    for (const lesson of mod.lessons) {
      allLessons.push({ lesson, moduleTitle: mod.title });
    }
  }

  // Chunk into batches of BATCH_SIZE
  const batches: Array<typeof allLessons> = [];
  for (let i = 0; i < allLessons.length; i += BATCH_SIZE) {
    batches.push(allLessons.slice(i, i + BATCH_SIZE));
  }

  log.info({ totalLessons: allLessons.length, batches: batches.length }, 'Starting content generation');

  // Track generated code snippet hashes to detect duplicates across batches
  const usedCodeHashes = new Set<string>();
  const contentMap: LessonContentMap = {};

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    if (!batch) continue;

    log.info({ batchIdx: batchIdx + 1, size: batch.length }, 'Processing lesson batch');

    try {
      const batchResult = await withRetry(
        async (feedback) => {
          const systemPrompt = buildSystemPrompt();
          const userPrompt = buildUserPrompt(ctx, outline, batch, feedback?.promptFeedback, usedCodeHashes);

          auditLog('stage2_content', { systemPrompt, userPrompt: userPrompt.slice(0, 500) });

          const result = await groq.chat.completions.create({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            model: MODEL_CONFIG.content,
            temperature: 0.6, // Slightly lower for factual accuracy
            response_format: { type: 'json_object' },
          });

          const raw = result.choices[0]?.message?.content || '{}';

          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch (err) {
            throw new Error(`JSON parse failed: ${(err as Error).message}`);
          }

          // Validate each lesson in the batch
          const batchMap: LessonContentMap = {};
          const data = parsed as Record<string, unknown>;

          for (const { lesson } of batch) {
            const lessonRaw = data[lesson.id];
            const validated = LessonContentSchema.safeParse(lessonRaw);
            if (!validated.success) {
              const details = validated.error.issues
                .map((i) => `  [${lesson.id}] ${i.path.join('.')}: ${i.message}`)
                .join('\n');
              throw new Error(`Lesson content validation failed:\n${details}`);
            }
            
            const lessonContent = validated.data as LessonContent;
            batchMap[lesson.id] = lessonContent;
          }

          return batchMap;
        },
        { maxAttempts: 3, baseDelayMs: 1000, label: `stage2_batch_${batchIdx}` },
      );

      Object.assign(contentMap, batchResult);
    } catch (err) {
      log.error({ batchIdx, err }, 'Batch failed after all retries — using fallback content');

      for (const { lesson } of batch) {
        contentMap[lesson.id] = buildFallbackContent(lesson.title, ctx.userInput.topic, err);
      }
    }
  }

  log.info({ lessonCount: Object.keys(contentMap).length }, 'Stage 2 content complete');
  return contentMap;
}

function buildSystemPrompt(): string {
  return `You are a world-class technical instructor at an elite online learning platform.

FACTUAL ACCURACY RULES (highest priority — never violate):
- Only use facts present in the provided Source Context. If a fact is not in the context, describe at a general/textbook level rather than inventing specifics.
- Deep Learning is a SUBSET of machine learning. Neural networks with many layers are called deep learning models. Never state the reverse.
- sklearn's GridSearchCV/RandomizedSearchCV CANNOT wrap a raw keras.Sequential or keras.Model directly — a KerasClassifier/KerasRegressor wrapper from scikeras or tf.keras.wrappers is required. Never generate code that does this without the wrapper.
- TFLiteConverter must use TFLiteConverter.from_keras_model(model) — never mix TF Lite with PyTorch or OpenVINO in the same function without separate imports for each.

DOMAIN ANALOGY REQUIREMENT:
- The lesson body MUST explicitly reference the domainAnalogy provided in the user prompt.
- Use the phrase "Just as [domain analogy]..." or "Similar to [domain concept]..." at least once in the body field.
- This is not optional — analogy embedding is a hard requirement.

CODE QUALITY RULES:
- Code snippets must be complete, standalone, and runnable (all imports at top)
- Never reuse a code snippet from a previous lesson verbatim — vary the dataset, variable names, or technique even if covering the same topic
- If a code snippet DOES reuse a concept, change the example (e.g., use a different dataset or architecture)
- No code that mixes frameworks (TF + PyTorch + OpenVINO) without appropriate guards/imports

TECHSTACK RULES — techStack fields may only contain real installable libraries or platforms:
- VALID examples: "PyTorch", "scikit-learn", "FastAPI", "Solidity", "web3.py", "Hardhat", "OpenZeppelin"
- INVALID examples: "ML Full Course", "Blockchain Development Course", "Complete Guide", "Introduction to X"
- Rule: if it can't be installed with pip/npm/yarn/cargo, it does NOT belong in techStack

NO PADDING:
- Ban: "In this lesson we will...", "By the end of this...", "To illustrate this, consider...", "As we have seen..."
- Every sentence must add new information
- No generic advice like "Make sure you understand the basics before proceeding"

OUTPUT CONTRACT:
Return ONLY a valid JSON object where each key is a lessonId and each value contains the lesson content as MARKDOWN.
No markdown fences around the entire response. No preamble. No explanation outside the JSON.

REQUIRED FORMAT per lessonId:
{
  "lessonId": {
    "content": "Complete markdown string (800–1500 characters minimum) with all of the following sections:\\n\\n1. Main explanation with headers (##, ###), **bold**, *italics*, and lists. Must reference domain analogy at least once.\\n2. ## Real-World Example\\n<specific named company, project, or dataset>\\n3. ## Code Examples\\n<complete, runnable code blocks with language markers>\\n4. ## Common Pitfalls\\n<bulleted list>\\n5. ## Key Takeaways\\n<bulleted list>",
    "estimatedReadMinutes": 10
  }
}`;
}

function buildUserPrompt(
  ctx: PromptContext,
  outline: CourseOutline,
  batch: Array<{ lesson: LessonOutline; moduleTitle: string }>,
  feedback?: string,
  usedCodeHashes?: Set<string>,
): string {
  const { userInput, enrichment, domainAnalogy } = ctx;
  const courseTitle = outline.title;

  const lessonsList = batch
    .map(({ lesson, moduleTitle }) => `- [${lesson.id}] "${lesson.title}" (${lesson.type}, in module "${moduleTitle}")`)
    .join('\n');

  const duplicateWarning = usedCodeHashes && usedCodeHashes.size > 0
    ? `\n## Code Reuse Warning\nThe following code patterns have already been used in earlier lessons. DO NOT reproduce them — use different datasets, architectures, or techniques:\n(${usedCodeHashes.size} snippet(s) already used — vary your code examples)\n`
    : '';

  return `Generate detailed lesson content for the following lessons from the course "${courseTitle}".

## Course Context
- Topic: ${userInput.topic}
- Difficulty: ${userInput.difficulty}
- Learner Domain: ${userInput.expertiseDomain}

## Domain Analogy (MUST appear in each lesson body using "Just as..." or "Similar to..." framing)
${domainAnalogy}

## Verified Tools & Frameworks (use ONLY these — do NOT hallucinate other names)
${enrichment.currentTools.slice(0, 8).join(', ') || 'Use general/textbook tools for this topic'}

## Source Context (ground truth — draw facts and concepts from here, not from training memory)
${enrichment.trendingSummary.slice(0, 1200) || 'No external context — use general/textbook knowledge only.'}
${duplicateWarning}
## Lessons to Write

${lessonsList}

${feedback ?? ''}

NOW generate the full JSON with all lessons. Each key must be a lessonId from the list above.`;
}

function buildFallbackContent(title: string, topic: string, err?: unknown): LessonContent {
  const errMsg = err instanceof Error ? err.message : String(err);
  return {
    content: `# ${title}\n\nThis lesson covers ${title} in the context of ${topic}. Content generation failed due to service limits or validation exhaustion — this is a placeholder to prevent pipeline failure.\n\n## Real-World Example\n\nA practical application of ${title} in real-world ${topic} scenarios.\n\n## Common Pitfalls\n\n- Content generation failed for this lesson\n\n## Key Takeaways\n\n- Please regenerate this lesson for accurate content`,
    estimatedReadMinutes: 10,
    _validationWarnings: [`Content generation failed: ${errMsg}`]
  };
}
