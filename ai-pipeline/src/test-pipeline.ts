/**
 * @file test-pipeline.ts
 * @description Direct pipeline testing script — run from terminal without API integration.
 * Usage: npm run test-pipeline
 */

import 'dotenv/config';
import { runCoursePipeline, PipelineEmitter } from './ai/pipeline';
import type { UserInput } from './ai/types';
import { logger } from './ai/logger';

const log = logger.child({ component: 'test' });

/**
 * Sample test input for a 1-week Python course
 */
const SAMPLE_INPUT: UserInput = {
  topic: ' ai for UI/UX',
  difficulty: 'Intermediate',
  expertiseDomain: 'software engineering',
  learningDuration: '1w',
  tags: ['AI Ethics', 'UI/UX Design', 'Responsible AI', 'Human-Computer Interaction'],
  organisationName: 'Globallogic',
};

/**
 * Runs the pipeline with test input and streams progress to console.
 */
async function main(): Promise<void> {
  log.info({ input: SAMPLE_INPUT }, '🚀 Starting pipeline test');
  console.log('\n' + '='.repeat(70));
  console.log('AI COURSE GENERATION PIPELINE TEST');
  console.log('='.repeat(70) + '\n');

  console.log('Input:');
  console.log(`  Topic: ${SAMPLE_INPUT.topic}`);
  console.log(`  Difficulty: ${SAMPLE_INPUT.difficulty}`);
  console.log(`  Duration: ${SAMPLE_INPUT.learningDuration}`);
  console.log(`  Domain: ${SAMPLE_INPUT.expertiseDomain}`);
  console.log(`  Tags: ${SAMPLE_INPUT.tags.join(', ')}\n`);

  const startTime = Date.now();
  const emitter = new PipelineEmitter();

  // Listen to stage completion events
  emitter.on('stage_complete', ({ stage, progress }) => {
    const bar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
    console.log(`[${progress.toString().padStart(3)}%] ${bar} ${stage}`);
  });

  try {
    const result = await runCoursePipeline(SAMPLE_INPUT, { emitter });

    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(70));

    if (!result.valid) {
      console.error('❌ FAILED — Course generation produced invalid output\n');
      if (result.errors && result.errors.length > 0) {
        console.error('Validation Errors:');
        for (const err of result.errors) {
          console.error(`  ${err instanceof Error ? err.message : String(err)}`);
        }
      }
      process.exit(1);
    }

    console.log('✅ SUCCESS — Course generated and validated\n');

    const { meta, course } = result.course;

    // Print summary
    console.log('📚 COURSE SUMMARY');
    console.log('─'.repeat(70));
    console.log(`Title: ${course.title}`);
    console.log(`Subtitle: ${course.subtitle}`);
    console.log(`Difficulty: ${course.difficulty}`);
    console.log(`Estimated Hours: ${course.estimatedHours}`);
    console.log(`Modules: ${course.modules.length}`);
    console.log(`Total Lessons: ${course.modules.reduce((sum, m) => sum + m.lessons.length, 0)}`);

    console.log('\n📖 LEARNING OUTCOMES');
    console.log('─'.repeat(70));
    course.learningOutcomes.forEach((outcome, i) => {
      console.log(`${i + 1}. ${outcome}`);
    });

    console.log('\n🎯 MODULE BREAKDOWN');
    console.log('─'.repeat(70));
    course.modules.forEach((mod, idx) => {
      console.log(`\nModule ${idx + 1}: ${mod.title}`);
      console.log(`  Description: ${mod.description.substring(0, 100)}...`);
      console.log(`  Lessons (${mod.lessons.length}):`);
      mod.lessons.forEach((lesson) => {
        const content = mod.quiz?.questions[0] ? '✓' : '?';
        console.log(
          `    • [${lesson.type.padEnd(10)}] ${lesson.title} (${lesson.estimatedReadMinutes}m) ${content}`,
        );
      });
      console.log(`  Quiz: ${mod.quiz?.questions?.length ?? 0} questions`);
    });

    console.log('\n🎓 CAPSTONE PROJECT');
    console.log('─'.repeat(70));
    console.log(`Title: ${course.capstone.title}`);
    console.log(`Phases: ${course.capstone.phases.length}`);
    console.log(`Tech Stack: ${course.capstone.techStack.join(', ')}`);
    console.log(`Evaluation Criteria: ${course.capstone.evaluationCriteria.length} items`);

    console.log('\n📊 METADATA');
    console.log('─'.repeat(70));
    console.log(`Schema Version: ${meta.schemaVersion}`);
    console.log(`Generated At: ${meta.generatedAt}`);
    console.log(`Models Used: outline=${meta.models.outline}, content=${meta.models.content}`);
    console.log(`  quizzes=${meta.models.quizzes}, capstone=${meta.models.capstone}`);
    console.log(`Tavily Sources: ${meta.tavilySources.length}`);
    console.log(`Generation Time: ${duration}ms (${(duration / 1000).toFixed(1)}s)`);

    console.log('\n' + '='.repeat(70));
    console.log(`✨ Full CourseJSON ready for persistence (${JSON.stringify(result.course).length} bytes)`);
    console.log('='.repeat(70) + '\n');

    // Write full JSON to file for inspection
    const fs = await import('fs/promises');
    const outputPath = './test-output.json';
    await fs.writeFile(outputPath, JSON.stringify(result.course, null, 2), 'utf-8');
    console.log(`📁 Full course JSON written to: ${outputPath}\n`);

    process.exit(0);
  } catch (err) {
    console.error('\n❌ UNRECOVERABLE ERROR\n');
    console.error(err instanceof Error ? err.message : String(err));
    console.error('\nCheck your environment variables:');
    console.error('  - GEMINI_API_KEY (required)');
    console.error('  - TAVILY_API_KEY (required)');
    console.error('  - MISTRAL_API_KEY (optional, falls back to Gemini)');
    console.error('  - REDIS_URL (required for BullMQ, but not for direct test)\n');
    process.exit(1);
  }
}

main();
