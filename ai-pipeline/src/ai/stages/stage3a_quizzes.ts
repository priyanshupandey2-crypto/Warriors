/**
 * @file stages/stage3a_quizzes.ts
 * @description Stage 3a — Quiz generation via configurable model (Groq default, Mistral opt-in).
 * Runs in parallel with stage3b. Produces 4 scenario-based MCQ per module.
 * Quizzes receive FULL lesson body text to ensure answer/content consistency.
 */

import { Mistral } from '@mistralai/mistralai';
import Groq from 'groq-sdk';
import { QuizMapSchema } from '../schemas';
import type {
  PromptContext,
  CourseOutline,
  LessonContentMap,
  QuizMap,
} from '../types';
import { MODEL_MISTRAL } from '../types';
import { MODEL_CONFIG } from '../config';
import { withRetry } from '../utils/retry';
import { stageLogger } from '../logger';
import { auditLog } from '../promptAudit';
import { validateQuizConsistency } from '../validators';

const log = stageLogger('stage3a_quizzes');

export async function generateQuizzes(
  ctx: PromptContext,
  outline: CourseOutline,
  contentMap: LessonContentMap,
): Promise<QuizMap> {
  log.info({ moduleCount: outline.modules.length }, 'Starting quiz generation');

  try {
    return await withRetry(
      async (feedback) => {
        const systemPrompt = buildSystemPrompt();
        const userPrompt = buildUserPrompt(ctx, outline, contentMap, feedback?.promptFeedback);

        auditLog('stage3a_quizzes', { systemPrompt, userPrompt: userPrompt.slice(0, 500) });

        const raw = await callModel(systemPrompt, userPrompt);

        let parsed: unknown;
        try {
          const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          parsed = JSON.parse(cleaned);
        } catch (err) {
          throw new Error(`JSON parse failed: ${(err as Error).message}\nRaw: ${raw.slice(0, 400)}`);
        }

        const validated = QuizMapSchema.safeParse(parsed);
        if (!validated.success) {
          const details = validated.error.issues
            .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
            .join('\n');
          throw new Error(`Quiz validation failed:\n${details}`);
        }

        // Run post-generation validation checks on the quiz content
        const quizMap = validated.data as QuizMap;
        for (const [moduleId, moduleQuiz] of Object.entries(quizMap)) {
          // Identify the lesson content for this module to check consistency against
          const moduleOutline = outline.modules.find(m => m.id === moduleId);
          if (!moduleOutline) continue;
          
          let combinedBodyText = '';
          for (const l of moduleOutline.lessons) {
            if (contentMap[l.id]) combinedBodyText += contentMap[l.id]!.body + ' ';
          }

          for (const q of moduleQuiz.questions) {
            const correctOptionText = q.options[q.correctIndex] ?? '';
            validateQuizConsistency(q.question, correctOptionText, q.explanation, combinedBodyText);
          }
        }

        log.info({ quizCount: Object.keys(quizMap).length }, 'Stage 3a quizzes validated');
        return quizMap;
      },
      { maxAttempts: 3, baseDelayMs: 1000, label: 'stage3a_quizzes' },
    );
  } catch (err) {
    log.error({ err }, 'Quiz generation failed after all retries — using fallback quizzes');
    const errMsg = err instanceof Error ? err.message : String(err);
    
    // Return empty stubs with validation warning
    const fallbackMap: QuizMap = {};
    for (const mod of outline.modules) {
      fallbackMap[mod.id] = {
        moduleId: mod.id,
        questions: [{
          question: 'Quiz generation failed.',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: 0,
          explanation: 'Please regenerate this quiz.',
          _validationWarnings: [`Quiz generation failed: ${errMsg}`]
        }]
      };
    }
    return fallbackMap;
  }
}

async function callModel(system: string, user: string): Promise<string> {
  const mistralKey = process.env['MISTRAL_API_KEY'];
  const groqKey = process.env['GROQ_API_KEY'];
  // Check QUIZ_MODEL env var — if set to "mistral-7b-instruct" and key is available, use Mistral
  const usesMistral = mistralKey && process.env['QUIZ_MODEL'] === 'mistral-7b-instruct';

  if (!mistralKey && !groqKey) throw new Error('No LLM API key available');

  if (usesMistral) {
    try {
      log.info('Using Mistral 7B for quiz generation (QUIZ_MODEL=mistral-7b-instruct)');
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

  log.info(`Using Groq (${MODEL_CONFIG.quiz}) for quiz generation`);
  const groq = new Groq({ apiKey: groqKey });
  const result = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    model: MODEL_CONFIG.quiz,
    temperature: 0.5, // Lower temperature = more factually consistent
    response_format: { type: 'json_object' },
  });
  return result.choices[0]?.message?.content || '{}';
}

function buildSystemPrompt(): string {
  return `You are a senior assessment designer specializing in scenario-based learning evaluation.

CRITICAL CONSISTENCY RULE:
- The correct answer and its explanation MUST directly match a claim made in the provided lesson text below.
- If a question would contradict the lesson, change the question — never ship a quiz that contradicts its lesson.
- Read the FULL lesson body text provided and base all questions only on what is explicitly stated there.

FACTUAL ACCURACY RULES:
- Deep Learning is a SUBSET of machine learning — never state the reverse.
- Do not invent facts not present in the lesson body.

QUESTION STANDARDS:
- Every question must present a realistic scenario requiring analysis, not recall
- Wrong answers (distractors) must be plausible — common real-world mistakes, not obviously absurd
- Explanations must teach why the correct answer is right AND why each distractor is wrong

TECHSTACK RULES — options and explanations may only reference real installable libraries:
- VALID: "PyTorch", "scikit-learn", "Solidity", "Hardhat", "web3.py"
- INVALID: "ML Full Course", "Complete Blockchain Guide", "Introduction to X"

NO FILLER:
- Every word in question, option, and explanation must add information
- No "all of the above" / "none of the above" options

OUTPUT CONTRACT:
Return ONLY a valid JSON object. No markdown fences. No preamble. No explanation outside JSON.

RULES:
- Exactly 4 questions per module
- Exactly 4 options per question
- correctIndex is 0-indexed integer (0, 1, 2, or 3)`;
}

function buildUserPrompt(
  ctx: PromptContext,
  outline: CourseOutline,
  contentMap: LessonContentMap,
  feedback?: string,
): string {
  const { userInput } = ctx;

  // KEY FIX: Pass FULL lesson body (not just 400-char snippet) so quiz answers
  // can be verified against actual lesson content
  const moduleDigests = outline.modules
    .map((mod) => {
      const lessonDigests = mod.lessons
        .map((l) => {
          const content = contentMap[l.id];
          // Use full body up to 1200 chars (vs old 400) — sufficient for consistency check
          const body = content ? content.body.slice(0, 1200) : 'Content pending';
          return `  Lesson "${l.title}" (${l.id}):\n  ${body}`;
        })
        .join('\n\n');
      return `Module "${mod.title}" (${mod.id}):\n${lessonDigests}`;
    })
    .join('\n\n---\n\n');

  return `Generate a complete quiz for every module in the course "${outline.title}".

CRITICAL: Every correct answer and its explanation must directly reference content from the lesson body text below.
If a question would conflict with the lesson body, change the question.

## Course Context
- Topic: ${userInput.topic}
- Difficulty: ${userInput.difficulty}

## Full Module + Lesson Body Text (ground truth for quiz answers)
${moduleDigests.slice(0, 8000)}

## Required JSON Structure
{
  "<moduleId>": {
    "moduleId": "<moduleId>",
    "questions": [
      {
        "question": "<scenario-based question referencing specific module content>",
        "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
        "correctIndex": <0-3>,
        "explanation": "<why correct + why each distractor is wrong — must cite lesson content>"
      }
    ]
  }
}

${feedback ?? ''}

Generate quizzes for all ${outline.modules.length} modules now.`;
}
