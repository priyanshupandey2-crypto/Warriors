/**
 * @file promptBuilder.ts
 * @description Constructs a typed PromptContext object from user inputs + enrichment.
 * Injects domain-specific analogies and computes module/lesson counts
 * based on learning duration.
 */

import type {
  UserInput,
  EnrichmentResult,
  PromptContext,
  ModuleSpec,
  LearningDuration,
} from './types';
import { stageLogger } from './logger';

const log = stageLogger('promptBuilder');

// ─── Duration → Module/Lesson mapping ─────────────────────────────────────────

const DURATION_SPECS: Record<LearningDuration, ModuleSpec> = {
  '2h': { moduleCount: 3, lessonsPerModule: 2 },
  '1d': { moduleCount: 4, lessonsPerModule: [2, 3] },
  '1w': { moduleCount: 5, lessonsPerModule: 3 },
  '2w': { moduleCount: 6, lessonsPerModule: [3, 4] },
  '4w': { moduleCount: 7, lessonsPerModule: 4 },
  '1m': { moduleCount: 7, lessonsPerModule: 4 },
  '3m': { moduleCount: 8, lessonsPerModule: [4, 5] },
};

// ─── Domain analogy mapping ───────────────────────────────────────────────────

const DOMAIN_ANALOGIES: Record<string, string> = {
  'civil engineering':
    'Explain concepts as if describing structural load distribution and foundation design',
  'mechanical engineering':
    'Use analogies from thermodynamics, gear systems, and mechanical stress analysis',
  'electrical engineering':
    'Draw parallels to circuit design, signal processing, and impedance matching',
  medicine:
    'Use medical analogies — diagnosis workflows, treatment protocols, and triage systems',
  healthcare:
    'Relate concepts to patient care pathways, clinical workflows, and diagnostic trees',
  finance:
    'Frame ideas using portfolio theory, risk management, and compound interest models',
  accounting:
    'Use double-entry bookkeeping, audit trails, and balance sheet analogies',
  law:
    'Draw parallels to legal precedent, case analysis, and regulatory frameworks',
  marketing:
    'Use funnel optimization, A/B testing, and audience segmentation analogies',
  design:
    'Relate to design systems, visual hierarchy, and iterative prototyping',
  architecture:
    'Use building architecture — load-bearing walls, blueprints, and spatial planning',
  biology:
    'Use ecosystem dynamics, cellular processes, and evolutionary adaptation analogies',
  chemistry:
    'Draw parallels to chemical reactions, molecular bonding, and catalysis',
  physics:
    'Use Newtonian mechanics, wave propagation, and energy conservation analogies',
  mathematics:
    'Frame concepts using proof strategies, set theory, and function composition',
  education:
    'Use pedagogical frameworks — scaffolding, zone of proximal development, and Bloom\'s taxonomy',
  'data science':
    'Relate to data pipelines, statistical distributions, and model training workflows',
  'software engineering':
    'Use software architecture patterns, API design, and debugging methodology',
  'project management':
    'Frame ideas using critical path analysis, resource allocation, and sprint cycles',
  military:
    'Use strategic planning, chain of command, and tactical execution analogies',
};

/**
 * Resolves a domain-specific analogy string for the given expertise domain.
 * Falls back to a generic "explain clearly" instruction for unknown/generic domains.
 */
function resolveDomainAnalogy(expertiseDomain: string): string {
  const normalized = expertiseDomain.toLowerCase().trim();

  // Skip analogy injection for generic/non-specific domains
  if (['general', 'student', 'none', 'n/a', ''].includes(normalized)) {
    return 'Explain concepts clearly using concrete, real-world examples from everyday life';
  }

  // Direct match
  const direct = DOMAIN_ANALOGIES[normalized];
  if (direct) {
    return direct;
  }

  // Partial match — check if any key is substring of or contained in the domain
  for (const [key, analogy] of Object.entries(DOMAIN_ANALOGIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return analogy;
    }
  }

  // Dynamic fallback — construct an analogy from the domain name itself
  return `Explain concepts using analogies familiar to a professional in ${expertiseDomain} — relate abstract ideas to concrete workflows and terminology from that field`;
}

/**
 * Builds the PromptContext used by all 5 pipeline stages.
 *
 * @param userInput - Validated user inputs
 * @param enrichment - Tavily enrichment results
 * @returns Fully populated PromptContext
 */
export function buildPromptContext(
  userInput: UserInput,
  enrichment: EnrichmentResult,
): PromptContext {
  const moduleSpec = DURATION_SPECS[userInput.learningDuration];
  const domainAnalogy = resolveDomainAnalogy(userInput.expertiseDomain);

  const context: PromptContext = {
    userInput,
    enrichment,
    domainAnalogy,
    moduleSpec,
    createdAt: new Date().toISOString(),
  };

  log.info(
    {
      topic: userInput.topic,
      duration: userInput.learningDuration,
      moduleCount: moduleSpec.moduleCount,
      lessonsPerModule: moduleSpec.lessonsPerModule,
      domain: userInput.expertiseDomain,
    },
    'PromptContext built',
  );

  return context;
}
