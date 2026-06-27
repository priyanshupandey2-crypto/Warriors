import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import { UserInput } from '../types';

const log = logger.child({ component: 'orgRAG' });

export interface OrgDocument {
  filename: string;
  organisation?: string;
  project?: string;
  tags: string[];
  description?: string;
  content: string;
  chunks: string[];
}

export interface RagMatch {
  document: OrgDocument;
  score: number;
  relevantChunks: string[];
}

const CHUNK_SIZE = 1500;
const OVERLAP = 200;

export class OrgRAG {
  private docsDir: string;
  private documents: OrgDocument[] = [];
  private initialized = false;

  constructor() {
    this.docsDir = path.resolve(process.env.ORG_DOCS_DIR || path.join(process.cwd(), 'org_docs'));
  }

  /**
   * Initializes the RAG by loading and chunking all .md files in the org_docs directory.
   */
  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      if (!fs.existsSync(this.docsDir)) {
        fs.mkdirSync(this.docsDir, { recursive: true });
        log.info({ dir: this.docsDir }, 'Created org_docs directory');
      }

      const files = fs.readdirSync(this.docsDir).filter(f => f.endsWith('.md') && !f.toUpperCase().includes('README'));
      
      for (const file of files) {
        const filePath = path.join(this.docsDir, file);
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        
        const doc = this.parseDocument(file, rawContent);
        if (doc) {
          this.documents.push(doc);
        }
      }

      this.initialized = true;
      log.info({ docCount: this.documents.length }, 'Org RAG initialized');
    } catch (error) {
      log.error({ error }, 'Failed to initialize Org RAG');
    }
  }

  /**
   * Parses frontmatter and chunks the document content.
   */
  private parseDocument(filename: string, rawContent: string): OrgDocument | null {
    try {
      let content = rawContent;
      let tags: string[] = [];
      let organisation = '';
      let project = '';
      let description = '';

      // Simple frontmatter parsing
      const fpMatch = rawContent.match(/^---\n([\s\S]*?)\n---/);
      if (fpMatch && fpMatch[1]) {
        content = rawContent.slice(fpMatch[0].length).trim();
        const fp = fpMatch[1];
        
        const orgMatch = fp.match(/organisation:\s*"?([^"\n]+)"?/);
        if (orgMatch && orgMatch[1]) organisation = orgMatch[1];
        
        const projMatch = fp.match(/project:\s*"?([^"\n]+)"?/);
        if (projMatch && projMatch[1]) project = projMatch[1];
        
        const descMatch = fp.match(/description:\s*"?([^"\n]+)"?/);
        if (descMatch && descMatch[1]) description = descMatch[1];
        
        const tagsMatch = fp.match(/tags:\s*\[(.*?)\]/);
        if (tagsMatch && tagsMatch[1]) {
          tags = tagsMatch[1].split(',').map(t => t.replace(/"/g, '').trim()).filter(Boolean);
        }
      }

      const chunks = this.chunkText(content, CHUNK_SIZE, OVERLAP);

      return {
        filename,
        organisation,
        project,
        tags: tags.map(t => t.toLowerCase()),
        description,
        content,
        chunks
      };
    } catch (err) {
      log.warn({ filename, err }, 'Failed to parse org document');
      return null;
    }
  }

  private chunkText(text: string, size: number, overlap: number): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + size));
      i += size - overlap;
    }
    return chunks.length ? chunks : [text];
  }

  /**
   * Extremely simple TF-IDF / keyword scoring approach for similarity.
   */
  private calculateSimilarity(queryTerms: string[], targetText: string): number {
    if (!targetText || queryTerms.length === 0) return 0;
    const lowerTarget = targetText.toLowerCase();
    
    let score = 0;
    for (const term of queryTerms) {
      if (term.length < 3) continue;
      // Count occurrences
      const matches = lowerTarget.match(new RegExp(this.escapeRegExp(term), 'gi'));
      if (matches) {
        score += matches.length * (term.length / 5); // Weight longer terms slightly more
      }
    }
    return score;
  }
  
  private escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  /**
   * Search for documents matching the user input.
   */
  public async search(input: UserInput, topK: number = 2, threshold: number = 2.0): Promise<RagMatch[]> {
    await this.init();

    if (this.documents.length === 0) return [];

    const queryTerms = [
      input.topic.toLowerCase(),
      ...input.topic.toLowerCase().split(/\s+/),
      ...input.tags.map(t => t.toLowerCase())
    ].filter(t => t.length > 2);

    const matches: RagMatch[] = [];

    for (const doc of this.documents) {
      // Bonus score if org matches
      let orgBonus = 0;
      if (input.organisationName && doc.organisation && 
          doc.organisation.toLowerCase().includes(input.organisationName.toLowerCase())) {
        orgBonus = 15; // Big bonus for matching org exactly
      }

      // Check tag overlap
      let tagScore = 0;
      for (const tag of input.tags) {
        if (doc.tags.includes(tag.toLowerCase())) {
          tagScore += 5;
        }
      }
      
      const docScore = this.calculateSimilarity(queryTerms, doc.description + " " + doc.content) + orgBonus + tagScore;

      if (docScore > threshold) {
        // Score the chunks to find top ones
        const scoredChunks = doc.chunks.map(chunk => ({
          chunk,
          score: this.calculateSimilarity(queryTerms, chunk)
        })).sort((a, b) => b.score - a.score);

        matches.push({
          document: doc,
          score: docScore,
          relevantChunks: scoredChunks.slice(0, 3).map(c => c.chunk) // take top 3 chunks
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}

// Singleton instance
export const orgRAG = new OrgRAG();
