/**
 * @file stages/stage3b_capstone.ts
 * @description Stage 3b — Capstone project generation via configurable model.
 * Runs in parallel with stage3a. Uses enrichment tools to avoid hallucinated tech stacks.
 */

import { Mistral } from '@mistralai/mistralai';
import Groq from 'groq-sdk';
import { CapstoneSchema } from '../schemas';
import type {
  PromptContext,
  CourseOutline,
  CapstoneProject,
} from '../types';
import { MODEL_MISTRAL } from '../types';
import { MODEL_CONFIG } from '../config';
import { withRetry } from '../utils/retry';
import { stageLogger } from '../logger';
import { auditLog } from '../promptAudit';
import { validateTechStack } from '../validators';

const log = stageLogger('stage3b_capstone');

export async function generateCapstone(
  ctx: PromptContext,
  outline: CourseOutline,
): Promise<CapstoneProject> {
  log.info({ topic: ctx.userInput.topic }, 'Starting capstone generation');

  try {
    return await withRetry(
      async (feedback) => {
        const systemPrompt = buildSystemPrompt();
        // Add feedback dynamically
        let currentFeedback = feedback?.promptFeedback ?? '';
        const userPrompt = buildUserPrompt(ctx, outline, currentFeedback);

        auditLog('stage3b_capstone', { systemPrompt, userPrompt: userPrompt.slice(0, 500) });

        const raw = await callModel(systemPrompt, userPrompt);

        let parsed: unknown;
        try {
          const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          parsed = JSON.parse(cleaned);
        } catch (err) {
          throw new Error(`JSON parse failed: ${(err as Error).message}\nRaw: ${raw.slice(0, 400)}`);
        }

        const validated = CapstoneSchema.safeParse(parsed);
        if (!validated.success) {
          const details = validated.error.issues
            .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
            .join('\n');
          throw new Error(`Capstone validation failed:\n${details}`);
        }

        const result = validated.data as CapstoneProject;
        
        const allowedTools = [
          ...ctx.enrichment.currentTools.map((t) => t.toLowerCase()),
          ...ctx.enrichment.keyFrameworks.map((f) => f.toLowerCase()),
          ctx.userInput.topic.toLowerCase(),
        ];
        validateTechStack(result.techStack, allowedTools);

        log.info({ phases: result.phases.length }, 'Stage 3b capstone validated');
        return result;
      },
      { maxAttempts: 3, baseDelayMs: 1000, label: 'stage3b_capstone' },
    );
  } catch (err) {
    log.error({ err }, 'Capstone generation failed after all retries — using fallback');
    
    return {
      title: 'Capstone generation failed',
      overview: 'Please regenerate this section.',
      realWorldRelevance: 'N/A',
      phases: [{ phase: 'Failed', description: 'Failed to generate', deliverable: 'None' }],
      techStack: [ctx.userInput.topic],
      evaluationCriteria: ['Failed to generate'],
      stretchGoals: ['Failed to generate'],
    };
  }
}

async function callModel(system: string, user: string): Promise<string> {
  const mistralKey = process.env['MISTRAL_API_KEY'];
  const groqKey = process.env['GROQ_API_KEY'];
  
  // Use config route for capstone, configurable via CAPSTONE_MODEL env var
  const usesMistral = mistralKey && process.env['CAPSTONE_MODEL'] === 'mistral-7b-instruct';

  if (!mistralKey && !groqKey) throw new Error('No LLM API key available');

  if (usesMistral) {
    try {
      log.info('Using Mistral 7B for capstone generation');
      const client = new Mistral({ apiKey: mistralKey });
      const resp = await client.chat.complete({
        model: MODEL_MISTRAL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.5,
        responseFormat: { type: 'json_object' },
      });
      const content = resp.choices?.[0]?.message?.content;
      if (typeof content !== 'string') throw new Error('Empty Mistral response');
      return content;
    } catch (err) {
      log.warn({ err }, 'Mistral failed — falling back to Groq');
    }
  }

  log.info(`Using Groq (${MODEL_CONFIG.capstone}) for capstone generation`);
  const groq = new Groq({ apiKey: groqKey });
  
  const result = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    model: MODEL_CONFIG.capstone,
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });
  
  return result.choices[0]?.message?.content || '{}';
}

function buildSystemPrompt(): string {
  return `You are a senior project architect and industry mentor who designs capstone projects for elite bootcamps.

FACTUAL ACCURACY & NO-FILLER RULES:
- Deep Learning is a SUBSET of machine learning — never state the reverse.
- Every phrase must carry concrete technical weight. Ban generic fluff like "In this phase we will..."
- Tech stack entries MUST be real, installable tools/libraries (e.g. "PyTorch", "Express").
- Tech stack CANNOT be course names or vague descriptors (e.g. "ML Full Course", "Deep Learning Guide").

PROJECT STANDARDS:
- The project must solve a real, named problem in the learner's domain
- Each phase must have a clear, testable deliverable
- Minimum 3 phases, maximum 6 phases
- Stretch goals must extend the core project materially (e.g., "Add Redis caching"), not just "make it better"

OUTPUT CONTRACT:
Return ONLY a valid JSON object. No markdown fences. No preamble. No explanation outside JSON.`;
}

function buildUserPrompt(
  ctx: PromptContext,
  outline: CourseOutline,
  feedback?: string,
): string {
  const { userInput, enrichment } = ctx;

  const toolList = [
    ...enrichment.currentTools,
    ...enrichment.keyFrameworks,
  ]
    .slice(0, 10)
    .join(', ');

  const moduleList = outline.modules
    .map((m) => `- ${m.title}: ${m.description}`)
    .join('\n');

  return `Design a professional capstone project for the course "${outline.title}".

## Learner Profile
- Domain Expertise: ${userInput.expertiseDomain}
- Learning Duration: ${userInput.learningDuration}
- Difficulty: ${userInput.difficulty}

## Topics Covered (project must integrate these)
${moduleList}

## ALLOWED Tech Stack (use REAL installable tools from this list, do NOT use course names)
${toolList || userInput.topic}

## Trending Context (ground truth facts)
${enrichment.trendingSummary.slice(0, 1200)}

## Required JSON Structure
{
  "title": "<compelling project title>",
  "overview": "<what the learner will build and why — concrete, no filler>",
  "realWorldRelevance": "<what real-world problem this solves>",
  "phases": [
    {
      "phase": "<Phase 1: Name>",
      "description": "<what to build in this phase (no filler)>",
      "deliverable": "<specific, testable output>"
    }
  ],
  "techStack": ["<tool1>", "<tool2>"],
  "evaluationCriteria": ["<specific, measurable criterion>"],
  "stretchGoals": ["<meaningful extension goal>"]
}

${feedback ?? ''}

Design the capstone project now.`;
}
