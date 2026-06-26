import { execSync } from 'child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export interface ValidationError extends Error {
  isValidationError: true;
}

export function createValidationError(msg: string): ValidationError {
  const err = new Error(msg) as ValidationError;
  err.isValidationError = true;
  return err;
}

/** Check Python syntax by writing to temp file and running py_compile */
export function validatePythonCode(code: string): void {
  const file = join(tmpdir(), `check_${Date.now()}_${Math.floor(Math.random() * 1000)}.py`);
  try {
    writeFileSync(file, code);
    execSync(`python -m py_compile ${file}`, { stdio: 'pipe' });
  } catch (err: any) {
    const output = err.stderr ? err.stderr.toString() : err.message;
    throw createValidationError(`Syntax error or compilation failure:\n${output}`);
  } finally {
    try { unlinkSync(file); } catch {}
  }
}

/** Static pattern check for Keras/sklearn wrapper issues */
export function validateStaticPatterns(code: string): void {
  if (code.includes('GridSearchCV') || code.includes('RandomizedSearchCV')) {
    if (code.includes('keras.Sequential') || code.includes('keras.Model')) {
      if (!code.includes('KerasClassifier') && !code.includes('KerasRegressor')) {
        throw createValidationError(
          'GridSearchCV/RandomizedSearchCV CANNOT wrap a raw keras.Sequential/Model without KerasClassifier or KerasRegressor wrapper.'
        );
      }
    }
  }
}

/** Validates tech stack against a known list (can be extended) */
export function validateTechStack(techStack: string[], allowedKeywords: string[]): void {
  const allowed = new Set(allowedKeywords.map(k => k.toLowerCase()));
  
  for (const item of techStack) {
    const l = item.toLowerCase();
    if (l.includes('course') || l.includes('guide') || l.includes('tutorial') || l.includes('introduction')) {
      throw createValidationError(`Tech stack hallucination detected: "${item}" is not a valid tool or library.`);
    }
  }
}

/** Quiz self-consistency check */
export function validateQuizConsistency(question: string, correctOption: string, explanation: string, lessonBody: string): void {
  // Simple word containment overlap check
  const bodyWords = new Set(lessonBody.toLowerCase().split(/\W+/).filter(w => w.length > 4));
  const explanationWords = explanation.toLowerCase().split(/\W+/).filter(w => w.length > 4);
  
  if (explanationWords.length === 0 || bodyWords.size === 0) return;
  
  let overlap = 0;
  for (const w of explanationWords) {
    if (bodyWords.has(w)) overlap++;
  }
  
  const overlapRatio = overlap / explanationWords.length;
  // If fewer than 20% of significant words in the explanation appear in the lesson body, it's likely hallucinated
  if (overlapRatio < 0.2) {
    throw createValidationError(
      `Quiz explanation ("${explanation.slice(0, 50)}...") has low overlap (${Math.round(overlapRatio*100)}%) with lesson body. The answer MUST be explicitly supported by the lesson text.`
    );
  }
}
