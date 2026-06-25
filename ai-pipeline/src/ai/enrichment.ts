/**
 * @file enrichment.ts
 * @description Tavily web search enrichment layer.
 * Extracts keywords AND retains 2-4 sentences of grounding source text per result
 * so downstream LLMs have real facts to draw from rather than inventing specifics.
 */

import { tavily } from 'tavily';
import type { EnrichmentResult, TavilySource } from './types';
import { logger, stageLogger } from './logger';

const log = stageLogger('enrichment');

/**
 * Clean up raw search result for use as grounding text.
 * Removes URLs, image refs, UI noise — but preserves real sentences.
 * Caps at 600 chars (≈3–4 sentences) per source for token budget.
 */
function cleanSourceForGrounding(raw: string): string {
  if (!raw) return '';
  const cleaned = raw
    .replace(/\[(?:Image|Video).*?\]/gi, '')   // Remove [Image X], [Video]
    .replace(/https?:\/\/\S+/g, '')            // Remove URLs
    .replace(/blob:[^\s]*/g, '')
    .replace(/[●•\[\]→]/g, ' ')               // Strip UI symbols (keep parens/braces for code context)
    .replace(/\s{2,}/g, ' ')                   // Collapse whitespace
    .trim();

  // Extract only full sentences — stop at sentence boundary within budget
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) ?? [];
  let result = '';
  for (const s of sentences) {
    if ((result + s).length > 600) break;
    result += s + ' ';
  }
  return result.trim() || cleaned.slice(0, 600);
}

/**
 * Extracts key technical terms and concepts to act as "latest keywords".
 * Prioritises capitalised proper nouns (library/framework names).
 */
function extractKeywords(content: string, topic: string): string[] {
  // Match Capitalized tool/framework names, plus common crypto/tech lowercased terms
  const pattern = /\b([A-Z][a-zA-Z0-9.\-]+(?:\s+[A-Z][a-zA-Z0-9.\-]+)*|web3|defi|crypto|blockchain|v\d+)\b/g;
  const matches = new Set<string>();

  let match;
  while ((match = pattern.exec(content)) !== null) {
    if (match[1] && match[1].length > 2) {
      // Filter out common English capitalised words that aren't tech terms
      const word = match[1];
      if (!/^(The|This|That|These|Those|When|Where|What|How|Why|With|From|Into|Over|Under|For|And|But|Not|Its|Our|Each|Some|Many|Most|More|Also|Both|Can|May|Will|Has|Was|Been|Have|You|Your|We|In|Is|If|To|Of|On|At|By|As|An|A)$/.test(word)) {
        matches.add(word);
      }
    }
  }

  // Always include the topic itself
  matches.add(topic);

  // Return max 15 high-signal keywords
  return Array.from(matches).slice(0, 15);
}

/**
 * Calls Tavily search and returns both keywords AND grounding sentences.
 * The groundingContext field is the key addition — it provides 2-4 real
 * sentences per source so LLMs draw from actual text, not training memory.
 */
export async function enrichWithTavily(
  topic: string,
  tags: string[],
): Promise<EnrichmentResult> {
  const apiKey = process.env['TAVILY_API_KEY'];
  if (!apiKey) {
    log.warn('TAVILY_API_KEY not set — returning empty enrichment');
    return emptyEnrichment();
  }

  const client = tavily({ apiKey });
  const currentYear = new Date().getFullYear();
  const tagString = tags.slice(0, 3).join(' ');

  // Two focused queries: broad concepts + specific tools/frameworks
  const query = `${topic} ${tagString} core concepts tools frameworks ${currentYear}`;

  log.info({ query }, 'Running Tavily search');

  try {
    const response = await client.search(query, {
      maxResults: 6,
      searchDepth: 'basic',
      includeAnswer: true,
    });

    const allResults = response.results ?? [];

    // Sort by relevance score descending
    allResults.sort((a, b) => b.score - a.score);

    // Take top 4 results; keep grounding text AND cleaned keywords
    const topSources: TavilySource[] = allResults.slice(0, 4).map(s => ({
      url: s.url ?? '',
      title: s.title ?? '',
      content: cleanSourceForGrounding(s.content ?? ''),
      score: s.score ?? 0,
    }));

    const combinedCleanContent = topSources.map((s) => s.content).join(' ');

    // Extract keywords from real source text
    const currentTools = extractKeywords(combinedCleanContent, topic);
    const keyFrameworks = extractKeywords(combinedCleanContent, topic);

    // Build a grounding context block: Tavily answer (concise) + top source excerpts
    // This is the key fix: downstream LLMs get REAL text to draw from
    const groundingParts: string[] = [];
    if (response.answer) {
      groundingParts.push(`Summary: ${response.answer.slice(0, 800)}`);
    }
    topSources.slice(0, 3).forEach((s, i) => {
      if (s.content) {
        groundingParts.push(`Source ${i + 1} [${s.title}]: ${s.content}`);
      }
    });

    // trendingSummary now carries actual grounding text (capped at 2000 chars for token budget)
    const trendingSummary = groundingParts.join('\n\n').slice(0, 2000);

    const result: EnrichmentResult = {
      trendingSummary,
      currentTools,
      keyFrameworks,
      rawSources: topSources,
    };

    const estimatedTokens = Math.ceil(JSON.stringify(result).length / 4);

    log.info(
      {
        sourceCount: topSources.length,
        keywordCount: currentTools.length,
        estimatedTokens,
        hasAnswer: !!response.answer,
      },
      'Enrichment complete (with grounding context)',
    );

    return result;
  } catch (err) {
    log.error({ err }, 'Tavily search failed — returning empty enrichment');
    return emptyEnrichment();
  }
}

/** Returns a safe empty enrichment result when Tavily is unavailable. */
function emptyEnrichment(): EnrichmentResult {
  return {
    trendingSummary: '',
    currentTools: [],
    keyFrameworks: [],
    rawSources: [],
  };
}
