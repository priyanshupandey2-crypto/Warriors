/**
 * @file stages/stage1_outline.ts
 * @description Stage 1 — Course outline generation via Groq.
 * Produces a fully structured outline with modules, lessons, titles, and outcomes.
 */

import Groq from 'groq-sdk';
import { OutlineSchema } from '../schemas';
import type { PromptContext, CourseOutline } from '../types';
import { MODEL_CONFIG } from '../config';
import { withRetry } from '../utils/retry';
import { stageLogger } from '../logger';
import { auditLog } from '../promptAudit';

const log = stageLogger('stage1_outline');

export async function generateOutline(
  ctx: PromptContext,
): Promise<CourseOutline> {
  const apiKey = process.env['GROQ_API_KEY'];
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const groq = new Groq({ apiKey });

  return withRetry(
    async (feedback) => {
      const systemPrompt = buildSystemPrompt(ctx);
      const userPrompt = buildUserPrompt(ctx, feedback?.promptFeedback);

      auditLog('stage1_outline', { systemPrompt, userPrompt });

      log.info({ topic: ctx.userInput.topic, attempt: feedback?.attempt ?? 1 }, 'Requesting outline from Groq');

      const result = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: MODEL_CONFIG.outline,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      });

      const raw = result.choices[0]?.message?.content || '{}';

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        throw new Error(`JSON parse failed: ${(err as Error).message}\nRaw:\n${raw.slice(0, 300)}`);
      }

      const validated = OutlineSchema.safeParse(parsed);
      if (!validated.success) {
        const details = validated.error.issues
          .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
          .join('\n');
        throw new Error(`Zod validation failed:\n${details}`);
      }

      log.info(
        { modules: validated.data.modules.length },
        'Stage 1 outline validated',
      );
      return validated.data as CourseOutline;
    },
    { maxAttempts: 5, baseDelayMs: 1000, label: 'stage1_outline' },
  );
}

function buildSystemPrompt(ctx: PromptContext): string {
  const { moduleSpec } = ctx;
  const minLessons = Array.isArray(moduleSpec.lessonsPerModule)
    ? moduleSpec.lessonsPerModule[0]
    : moduleSpec.lessonsPerModule;

  return `You are a senior curriculum architect at a top-tier online learning institution with 15+ years of experience designing courses for Coursera, Pluralsight, and edX.

OUTPUT CONTRACT:
Return ONLY valid JSON matching the provided schema. No markdown fences. No preamble. No explanation.

FACTUAL ACCURACY RULES (never violate):
- Only use facts present in the provided Source Context section. If context is thin, describe concepts at a general/textbook level rather than inventing specifics.
- Deep Learning is a SUBSET of machine learning that uses neural networks with many layers — never state the reverse.
- Do not confuse library names with course names. Module titles are human-readable only; they must not appear in techStack fields.

QUALITY STANDARDS:
- Every module must have a clear, specific title (not generic like "Introduction" alone)
- Learning outcomes must be measurable with action verbs (Build, Implement, Analyze, Design)
- Lesson types: "concept" for theory, "hands-on" for practical labs, "case-study" for real-world analysis
- Module IDs must be "m1", "m2", ... and lesson IDs must be "m1l1", "m1l2", etc.
- Minimum ${minLessons} lessons per module

NO PADDING:
- Every module title and description must name a specific concept, tool, or technique
- Ban generic phrases: "In this module we will...", "By the end you will understand...", "Let's explore..."
- Every sentence must add new information — no filler

REQUIRED JSON SCHEMA:
{
  "title": "string",
  "subtitle": "string",
  "description": "string",
  "learningOutcomes": ["string"],
  "modules": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "lessons": [
        {
          "id": "string",
          "title": "string",
          "type": "concept | hands-on | case-study"
        }
      ]
    }
  ]
}`;
}

function buildUserPrompt(ctx: PromptContext, feedback?: string): string {
  const { userInput, enrichment, moduleSpec, domainAnalogy } = ctx;

  const lessonRange = Array.isArray(moduleSpec.lessonsPerModule)
    ? `${moduleSpec.lessonsPerModule[0]}–${moduleSpec.lessonsPerModule[1]}`
    : String(moduleSpec.lessonsPerModule);

  return `Generate a complete course outline for the following specification:

## Course Specification
- Topic: ${userInput.topic}
- Difficulty: ${userInput.difficulty}
- Learner Domain: ${userInput.expertiseDomain}
- Learning Duration: ${userInput.learningDuration}
- Tags: ${userInput.tags.join(', ')}

## Structure Requirements
- Modules: exactly ${moduleSpec.moduleCount}
- Lessons per module: ${lessonRange}
- Learning outcomes: 4–8 measurable outcomes

## Domain Analogy Frame (embed this perspective into module descriptions)
${domainAnalogy}

## Verified Tools & Frameworks (only use these names — do NOT invent others)
${enrichment.currentTools.slice(0, 8).join(', ') || 'See source context below'}

## Source Context (ground truth — draw module topics from this, not from training memory)
${enrichment.trendingSummary.slice(0, 1200) || 'No external context available — use general/textbook knowledge only.'}

${feedback ?? ''}

Generate the outline JSON now.`;
}
