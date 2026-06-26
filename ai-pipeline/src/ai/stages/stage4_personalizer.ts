/**
 * @file stages/stage4_personalizer.ts
 * @description Stage 4 — Personalization patch generation via Gemini 2.0 Flash.
 * Does NOT rewrite content. Produces a diff-like patch applied by Stage 5.
 */

import Groq from 'groq-sdk';
import { PersonalizationPatchSchema } from '../schemas';
import type {
  PromptContext,
  CourseOutline,
  LessonContentMap,
  QuizMap,
  CapstoneProject,
  PersonalizationPatch,
} from '../types';
import { MODEL_CONFIG } from '../config';
import { withRetry } from '../utils/retry';
import { stageLogger } from '../logger';
import { auditLog } from '../promptAudit';

const log = stageLogger('stage4_personalizer');

/** Domains considered "generic" — no analogy injection for these */
const GENERIC_DOMAINS = new Set(['general', 'student', 'none', 'n/a', '']);

/**
 * Generates a PersonalizationPatch describing where to inject domain analogies,
 * what prerequisite gaps exist, and which lessons need difficulty adjustment.
 * Applies analogy injection only if expertiseDomain is non-generic.
 *
 * @param ctx - PromptContext
 * @param outline - Stage 1 output
 * @param contentMap - Stage 2 output
 * @param quizMap - Stage 3a output
 * @param capstone - Stage 3b output
 * @returns PersonalizationPatch to be applied by Stage 5
 */
export async function generatePersonalizationPatch(
  ctx: PromptContext,
  outline: CourseOutline,
  contentMap: LessonContentMap,
  quizMap: QuizMap,
  capstone: CapstoneProject,
): Promise<PersonalizationPatch> {
  const apiKey = process.env['GROQ_API_KEY'];
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const groq = new Groq({ apiKey });

  const isGenericDomain = GENERIC_DOMAINS.has(
    ctx.userInput.expertiseDomain.toLowerCase().trim(),
  );

  log.info(
    { domain: ctx.userInput.expertiseDomain, isGenericDomain },
    'Starting personalization',
  );

  return withRetry(
    async (feedback) => {
      const systemPrompt = buildSystemPrompt(isGenericDomain);
      const userPrompt = buildUserPrompt(ctx, outline, contentMap, isGenericDomain, feedback?.promptFeedback);

      auditLog('stage4_personalizer', { systemPrompt, userPrompt: userPrompt.slice(0, 500) });

      const result = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: MODEL_CONFIG.personalizer,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const raw = result.choices[0]?.message?.content || '{}';

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        throw new Error(`JSON parse failed: ${(err as Error).message}`);
      }

      const validated = PersonalizationPatchSchema.safeParse(parsed);
      if (!validated.success) {
        const details = validated.error.issues
          .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
          .join('\n');
        throw new Error(`Personalization patch validation failed:\n${details}`);
      }

      const patch = validated.data as PersonalizationPatch;

      // Enforce analogy injection rule
      if (isGenericDomain) {
        patch.analogyInjections = [];
      }

      log.info(
        {
          analogyInjections: patch.analogyInjections.length,
          prerequisiteGaps: patch.prerequisiteGaps.length,
          difficultyFlags: patch.difficultyFlags.length,
        },
        'Stage 4 personalization validated',
      );

      return patch;
    },
    { maxAttempts: 5, baseDelayMs: 1000, label: 'stage4_personalizer' },
  );
}

function buildSystemPrompt(isGenericDomain: boolean): string {
  const instruction = isGenericDomain
    ? 'Generate EMPTY arrays for all three fields (no analogies for generic domains).'
    : 'Generate analogies, gaps, and flags as needed to personalize the course for the specific domain.';

  return `You are a curriculum personalization specialist optimizing courses for learners with specific professional backgrounds.

Your role is to identify opportunities to:
1. Inject domain-specific analogies into lessons
2. Flag prerequisite knowledge gaps
3. Flag difficulty mismatches

${instruction}

OUTPUT CONTRACT:
Return ONLY valid JSON matching the schema. No markdown fences. No preamble. No explanation.

IMPORTANT:
- Only inject analogies if the learner domain is specific (not generic)
- Flag real gaps, not hypothetical ones
- Flag difficulty only if it conflicts with stated level`;
}

function buildUserPrompt(
  ctx: PromptContext,
  outline: CourseOutline,
  contentMap: LessonContentMap,
  isGenericDomain: boolean,
  feedback?: string,
): string {
  const { userInput } = ctx;

  const moduleSummary = outline.modules
    .map((m) => `- Module ${m.id}: ${m.title}`)
    .join('\n');

  return `Analyze the following course structure and content for personalization opportunities.

## Course
Title: ${outline.title}
Difficulty: ${userInput.difficulty}
Learner Domain: ${userInput.expertiseDomain}
Topic: ${userInput.topic}

## Modules
${moduleSummary}

## Personalization Task
${
  isGenericDomain
    ? 'This learner has a GENERIC domain (not specific). Return empty arrays for all fields.'
    : `This learner has a SPECIFIC domain: "${userInput.expertiseDomain}".
Identify where domain-specific analogies would strengthen understanding.
Flag any prerequisites this domain might lack.
Flag any lessons that seem misaligned with the stated ${userInput.difficulty} level.`
}

## Output Schema
{
  "analogyInjections": [
    {
      "lessonId": "m1l1",
      "insertAfterParagraph": 0,
      "analogyText": "Just like [domain analogy], [concept] works by..."
    }
  ],
  "prerequisiteGaps": [
    {
      "concept": "Understanding of X",
      "suggestedLessonTitle": "Prerequisite: X Fundamentals",
      "insertBeforeModuleId": "m2"
    }
  ],
  "difficultyFlags": [
    {
      "lessonId": "m1l1",
      "reason": "This requires knowledge of [X] which hasn't been introduced",
      "suggestedAction": "Move to Module 3 or add prerequisite"
    }
  ]
}

${feedback ?? ''}

Now generate the patch.`;
}
