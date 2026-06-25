/**
 * @file server.ts
 * @description Optional HTTP server for testing the AI pipeline via curl/postman.
 * Usage: npm run server
 * Then: curl -X POST http://localhost:3001/generate -H "Content-Type: application/json" -d '{...}'
 */

import 'dotenv/config';
import { runCoursePipeline, PipelineEmitter } from './ai/pipeline';
import type { UserInput } from './ai/types';
import { logger } from './ai/logger';

const log = logger.child({ component: 'server' });

const BACKEND_URL = process.env['BACKEND_URL'] ?? 'http://localhost:8000';

async function notifyBackend(
  reviewQueueId: number,
  success: boolean,
  data: any
) {
  try {
    const endpoint = success
      ? `/api/queue/process-generated/${reviewQueueId}`
      : `/api/queue/process-failed/${reviewQueueId}`;

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(success ? data : { error: data.error || 'Unknown error' }),
    });

    if (!response.ok) {
      log.warn({ reviewQueueId, status: response.status }, 'Backend notification failed');
    }
  } catch (err) {
    log.error({ reviewQueueId, err }, 'Failed to notify backend');
  }
}

(async () => {
  // Minimal HTTP server (no external dependencies)
  const PORT = process.env['PORT'] ?? 3001;

  const { createServer } = await import('http');

  const server = createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method !== 'POST' || req.url !== '/generate') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found. POST /generate' }));
      return;
    }

    // Parse request body
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1e6) {
        // 1MB max
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request body too large' }));
        req.socket.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const input: UserInput = {
          topic: payload.topic,
          difficulty: payload.difficulty,
          learningDuration: payload.learningDuration,
          expertiseDomain: payload.expertiseDomain,
          tags: payload.tags,
        };
        const reviewQueueId = payload.reviewQueueId;

        log.info({ topic: input.topic, reviewQueueId }, 'Request received');

        const emitter = new PipelineEmitter();
        let progressCount = 0;

        emitter.on('stage_complete', ({ stage, progress }) => {
          progressCount += 1;
          log.info(
            { reviewQueueId, stage, progress, stageNumber: progressCount },
            'Stage complete'
          );
        });

        const result = await runCoursePipeline(input, { emitter });

        if (!result.valid) {
          log.error(
            { reviewQueueId, errors: result.errors },
            'Course generation failed'
          );
          // Notify backend of failure
          await notifyBackend(reviewQueueId, false, {
            error: result.errors?.join('; ') || 'Course generation failed',
          });

          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              valid: false,
              errors: result.errors?.map((e) => String(e)),
              partialCourse: result.partialCourse,
            })
          );
          return;
        }

        log.info(
          { reviewQueueId, title: result.course.course.title },
          'Course generation successful'
        );

        // Notify backend of success
        await notifyBackend(reviewQueueId, true, result.course);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify(
            {
              valid: true,
              course: result.course,
              reviewQueueId,
            },
            null,
            2
          )
        );
      } catch (err) {
        log.error({ err }, 'Request failed');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: err instanceof Error ? err.message : String(err),
          })
        );
      }
    });
  });

  server.listen(PORT, () => {
    log.info({ port: PORT }, 'Server listening');
    console.log(`\n🚀 AI Pipeline HTTP Server`);
    console.log(`📡 Listening on http://localhost:${PORT}/generate\n`);
    console.log(`Test with curl:\n`);
    console.log(`curl -X POST http://localhost:${PORT}/generate \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{`);
    console.log(`    "topic": "Building Web Apps with React",`);
    console.log(`    "difficulty": "Intermediate",`);
    console.log(`    "expertiseDomain": "software engineering",`);
    console.log(`    "learningDuration": "1w",`);
    console.log(`    "tags": ["React", "JavaScript", "Web Development"]`);
    console.log(`  }' | jq .\n`);
  });

  server.on('error', (err: Error) => {
    log.error({ err }, 'Server error');
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    log.info('SIGTERM received — shutting down');
    server.close(() => process.exit(0));
  });
})();
