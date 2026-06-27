/**
 * @file worker.ts
 * @description BullMQ worker that processes course generation jobs.
 * Integrates with the pipeline and emits job progress updates.
 * Run with: npm run worker
 */

import { Worker, type Job } from 'bullmq';
import { runCoursePipeline, PipelineEmitter } from './ai/pipeline';
import type { UserInput } from './ai/types';
import { logger } from './ai/logger';

const REDIS_URL = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
const QUEUE_NAME = 'course-generation';

const log = logger.child({ component: 'worker' });

/**
 * BullMQ worker that consumes jobs from the course-generation queue.
 * Calls runCoursePipeline and updates job progress at each stage.
 */
const worker = new Worker<UserInput>(
  QUEUE_NAME,
  async (job: Job<UserInput>) => {
    log.info({ jobId: job.id, topic: job.data.topic }, 'Processing job');

    const emitter = new PipelineEmitter();

    // Map pipeline progress events to BullMQ job progress
    emitter.on('stage_complete', async ({ stage, progress }) => {
      await job.updateProgress(progress);
      log.info({ jobId: job.id, stage, progress }, 'Job stage update');
    });

    const result = await runCoursePipeline(job.data, { emitter });

    if (!result.valid) {
      log.error(
        { jobId: job.id, errors: result.errors },
        'Course generation produced invalid output',
      );
      // Still return partial — upstream workers decide whether to persist
      return { success: false, partialCourse: result.partialCourse };
    }

    log.info(
      { jobId: job.id, title: result.course.course.title },
      'Course generation successful',
    );

    return { success: true, course: result.course };
  },
  {
    connection: {
      url: REDIS_URL,
    },
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60_000, // 5 jobs per minute max
    },
  },
);

worker.on('completed', (job, result) => {
  log.info({ jobId: job.id, success: result.success }, 'Job completed');
});

worker.on('failed', (job, err) => {
  log.error({ jobId: job?.id, err: err.message }, 'Job failed');
});

worker.on('error', (err) => {
  log.error({ err: err.message }, 'Worker error');
});

log.info({ queue: QUEUE_NAME }, 'Worker started');
