import Groq from 'groq-sdk';
import { FullModuleSchema } from '../schemas';
import type { PromptContext, FullModule, CourseOutline } from '../types';
import { MODEL_CONFIG } from '../config';
import { withRetry } from '../utils/retry';
import { stageLogger } from '../logger';
import { auditLog } from '../promptAudit';
import { orgRAG, RagMatch } from '../rag/orgRAG';
import { z } from 'zod';

const log = stageLogger('stage3c_org_module');

export async function generateOrgModule(
  ctx: PromptContext,
  outline: CourseOutline
): Promise<FullModule | null> {
  log.info({ topic: ctx.userInput.topic }, 'Starting org-specific module generation');

  try {
    // 1. Check RAG for relevant documents
    const matches = await orgRAG.search(ctx.userInput);

    if (!matches || matches.length === 0) {
      log.info('No relevant org documents found for this topic.');
      return null;
    }

    log.info({ matches: matches.length, topDoc: matches[0]?.document.project }, 'Found relevant org documents');

    // 2. Generate module using the RAG matches
    return await withRetry(
      async (feedback) => {
        const systemPrompt = buildSystemPrompt();
        const userPrompt = buildUserPrompt(ctx, outline, matches, feedback?.promptFeedback);

        auditLog('stage3c_org_module', { systemPrompt, userPrompt: userPrompt.slice(0, 1000) });

        const apiKey = process.env['GROQ_API_KEY'];
        if (!apiKey) throw new Error('GROQ_API_KEY is not set');
        const groq = new Groq({ apiKey });

        const result = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: MODEL_CONFIG.content,
          temperature: 0.5,
          response_format: { type: 'json_object' },
        });

        const raw = result.choices[0]?.message?.content || '{}';

        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch (err) {
          throw new Error(`JSON parse failed: ${(err as Error).message}`);
        }

        const validated = FullModuleSchema.safeParse(parsed);
        if (!validated.success) {
          const details = validated.error.issues
            .map((i: z.ZodIssue) => `  • ${i.path.join('.')}: ${i.message}`)
            .join('\n');
          throw new Error(`Org module validation failed:\n${details}`);
        }

        return validated.data as FullModule;
      },
      { maxAttempts: 3, baseDelayMs: 1000, label: 'stage3c_org_module' },
    );
  } catch (err) {
    log.error({ err }, 'Org module generation failed — skipping org module addition');
    return null;
  }
}

function buildSystemPrompt(): string {
  return `You are a technical curriculum expert. Your job is to create a complete, fully populated module documenting how a specific real-world organization applies the concepts taught in the course.

OUTPUT CONTRACT:
Return ONLY a valid JSON object matching the exact schema. No markdown fences. No explanations.

FACTUAL ACCURACY RULES:
- ONLY use facts provided in the "Organization Ground Truth Context".
- Do not invent architecture, features, or project names that are not in the context.

JSON SCHEMA REQUIREMENT (Must exactly match FullModule format):
{
  "id": "m_org",
  "title": "string",
  "description": "string",
  "lessons": [
    {
      "id": "m_org_l1",
      "title": "string",
      "type": "case-study",
      "content": "Full markdown string with detailed content...",
      "estimatedReadMinutes": 10
    }
  ],
  "quiz": {
    "moduleId": "m_org",
    "questions": [
      {
        "question": "string",
        "options": ["O1", "O2", "O3", "O4"],
        "correctIndex": 0,
        "explanation": "string"
      }
    ]
  }
}

- Include exactly 2 lessons (type: "case-study").
- The lesson 'content' MUST be a full markdown document containing headers, text, examples (if any exist in context).
- Include exactly 4 quiz questions for the module's 'quiz' object based entirely on the provided context.`;
}

function buildUserPrompt(
  ctx: PromptContext,
  outline: CourseOutline,
  matches: RagMatch[],
  feedback?: string
): string {
  const contextStrings = matches.map(m => {
    const doc = m.document;
    return `### Project: ${doc.project} (Org: ${doc.organisation})\n${doc.description}\n\nRelevant Context:\n` + m.relevantChunks.join('\n...\n');
  }).join('\n\n');

  return `Generate an organization-specific final module for the course "${outline.title}".

## Course Topic: ${ctx.userInput.topic}

## Organization Ground Truth Context
Use the following context to generate the lessons and quiz. This is real documentation from the organization.
Provide 2 detailed lessons showcasing how the core course concepts are applied in these specific projects.

${contextStrings}

${feedback ?? ''}

Generate the JSON now.`;
}
