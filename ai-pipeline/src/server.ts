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
const USE_MOCK_DATA = process.env['USE_MOCK_DATA'] === 'true';

function getMockCourse(input: UserInput): any {
  return {
    meta: {
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      models: {
        outline: 'llama-3.3-70b-versatile',
        content: 'llama-3.3-70b-versatile',
        quizzes: 'llama-3.3-70b-versatile',
        capstone: 'llama-3.3-70b-versatile',
      },
      tavilySources: [],
      generationDurationMs: 5000,
    },
    course: {
      title: `Master ${input.topic}`,
      subtitle: `A comprehensive ${input.difficulty} level course on ${input.topic}`,
      description: `Learn ${input.topic} with hands-on examples, real-world applications, and practical projects. This course is designed for ${input.difficulty} learners who want to master ${input.topic}.`,
      difficulty: input.difficulty,
      estimatedHours: 20,
      tags: input.tags,
      learningOutcomes: [
        `Understand the fundamental concepts of ${input.topic}`,
        `Apply ${input.topic} principles to real-world scenarios`,
        `Build projects using ${input.topic}`,
        `Master advanced techniques in ${input.topic}`,
      ],
      modules: [
        {
          id: 'm1',
          title: `Module 1: Introduction to ${input.topic}`,
          description: `Get started with the basics of ${input.topic}`,
          lessons: [
            {
              id: 'm1l1',
              title: 'What is ' + input.topic,
              type: 'concept',
              content: `# What is ${input.topic}?\n\n${input.topic} is a fundamental concept in modern software development. In this lesson, we'll explore what ${input.topic} is, why it matters, and how it can help you build better applications.\n\n## Key Concepts\n\n- **Definition**: ${input.topic} refers to a set of principles and practices...\n- **History**: The concept has evolved over time to meet modern needs\n- **Applications**: Used across various industries and domains\n\n## Real-World Example\n\n${input.topic} is used in production systems at companies like Google, Facebook, and Amazon to handle massive scale and complexity.\n\n## Code Example\n\n\`\`\`python\n# Example of ${input.topic} in action\nprint("Learning ${input.topic}")\n\`\`\`\n\n## Common Pitfalls\n\n- Mistake 1: Not understanding the core principles\n- Mistake 2: Overcomplicating the implementation\n- Mistake 3: Ignoring edge cases\n\n## Key Takeaways\n\n- ${input.topic} is essential for modern development\n- Understanding the basics is crucial\n- Practice with real examples to master it`,
              estimatedReadMinutes: 15,
            },
            {
              id: 'm1l2',
              title: 'Core Principles',
              type: 'concept',
              content: `# Core Principles of ${input.topic}\n\nUnderstanding the core principles is the foundation for mastering ${input.topic}. Let's dive deep into the key principles.\n\n## The Five Core Principles\n\n1. **Principle One**: The first fundamental principle that guides ${input.topic}\n2. **Principle Two**: How this principle builds on the first\n3. **Principle Three**: Integration of multiple principles\n4. **Principle Four**: Advanced application of principles\n5. **Principle Five**: Real-world considerations\n\n## Real-World Example\n\nLet's look at how Netflix applies these principles in their streaming platform to serve millions of users.\n\n## Code Example\n\n\`\`\`javascript\n// Implementing core principles\nconst implement = () => {\n  console.log('Applying ${input.topic} principles');\n};\n\`\`\`\n\n## Common Pitfalls\n\n- Not following the principles consistently\n- Misinterpreting what each principle means\n- Applying principles in the wrong context\n\n## Key Takeaways\n\n- Consistency is key\n- Context matters\n- Keep principles simple`,
              estimatedReadMinutes: 20,
            },
          ],
          quiz: {
            moduleId: 'm1',
            questions: [
              {
                question: `What is the primary purpose of ${input.topic}?`,
                options: ['To improve code quality', 'To reduce development time', 'To scale applications efficiently', 'To eliminate all bugs'],
                correctIndex: 2,
                explanation: 'The primary purpose is to help systems scale efficiently under load. While it may help with other aspects, scalability is the main goal.',
              },
              {
                question: `Which of the following is a core principle of ${input.topic}?`,
                options: ['Maximize complexity', 'Minimize state', 'Increase dependencies', 'Reduce performance'],
                correctIndex: 1,
                explanation: 'Minimizing state is a fundamental principle. By reducing mutable state, systems become more predictable and easier to reason about.',
              },
              {
                question: `How does ${input.topic} relate to modern development?`,
                options: ['It is outdated', 'It is essential for building scalable systems', 'It only applies to large companies', 'It is optional'],
                correctIndex: 1,
                explanation: `${input.topic} is essential for modern development, especially when building systems that need to scale.`,
              },
              {
                question: `What is a common pitfall when implementing ${input.topic}?`,
                options: ['Following best practices', 'Understanding requirements first', 'Overcomplicating the solution', 'Testing thoroughly'],
                correctIndex: 2,
                explanation: 'A common mistake is overcomplicating the implementation. Start simple and add complexity only when needed.',
              },
            ],
          },
        },
        {
          id: 'm2',
          title: `Module 2: Practical Applications`,
          description: `Learn how to apply ${input.topic} in real projects`,
          lessons: [
            {
              id: 'm2l1',
              title: 'Building Your First Project',
              type: 'hands-on',
              content: `# Building Your First Project with ${input.topic}\n\nNow that you understand the basics, let's build something practical. This lesson guides you through creating a complete project.\n\n## Project Overview\n\nWe'll build a simple application that demonstrates the key concepts of ${input.topic}.\n\n## Step-by-Step Guide\n\n### Step 1: Setup\nSet up your development environment\n\n### Step 2: Implementation\nImplement the core functionality\n\n### Step 3: Testing\nTest your implementation thoroughly\n\n### Step 4: Deployment\nDeploy your project\n\n## Complete Example\n\n\`\`\`python\n# Complete working example\nclass ${input.topic.replace(/\\s+/g, '')}:\n    def __init__(self):\n        self.data = []\n    \n    def process(self, item):\n        self.data.append(item)\n        return len(self.data)\n\napp = ${input.topic.replace(/\\s+/g, '')}()\nresult = app.process('test')\nprint(f'Processed: {result}')\n\`\`\`\n\n## Troubleshooting\n\n- Issue 1: Common error and solution\n- Issue 2: How to debug\n- Issue 3: Performance optimization\n\n## Key Takeaways\n\n- Practice is essential\n- Start small and iterate\n- Test as you build`,
              estimatedReadMinutes: 25,
            },
          ],
          quiz: {
            moduleId: 'm2',
            questions: [
              {
                question: `What is the first step when building a project with ${input.topic}?`,
                options: ['Write tests', 'Setup your environment', 'Deploy to production', 'Write documentation'],
                correctIndex: 1,
                explanation: 'Setting up your development environment is always the first step. You need proper tools before you can begin coding.',
              },
              {
                question: `How should you approach building a complex project with ${input.topic}?`,
                options: ['Build everything at once', 'Start small and iterate', 'Copy existing code', 'Skip testing'],
                correctIndex: 1,
                explanation: 'Starting small and iterating is the best approach. This allows you to catch issues early and learn as you build.',
              },
              {
                question: `What is the purpose of testing in ${input.topic} projects?`,
                options: ['To waste time', 'To ensure quality and catch bugs early', 'To impress others', 'Testing is not important'],
                correctIndex: 1,
                explanation: 'Testing is crucial. It helps ensure your code works correctly and makes refactoring safer.',
              },
              {
                question: `When deploying a ${input.topic} project, what should you do first?`,
                options: ['Deploy directly to production', 'Test in staging environment', 'Notify all users', 'Delete backups'],
                correctIndex: 1,
                explanation: 'Always test in a staging environment first. This helps catch issues before they affect real users.',
              },
            ],
          },
        },
      ],
      capstone: {
        title: `${input.topic} Capstone Project`,
        overview: `Design and implement a complete ${input.topic} project that demonstrates your understanding of all course concepts. This capstone project will integrate everything you've learned into a cohesive, production-ready application.`,
        realWorldRelevance: `In real-world scenarios, companies use ${input.topic} to build scalable, maintainable systems. This project prepares you for production development where you'll encounter complex requirements and scale challenges.`,
        phases: [
          {
            phase: 'Phase 1: Design and Planning',
            description: 'Create detailed specifications, architecture diagrams, and implementation plan for your ${input.topic} project.',
            deliverable: 'Design document with architecture, data flow, and API specifications',
          },
          {
            phase: 'Phase 2: Core Implementation',
            description: 'Implement the core functionality applying all ${input.topic} principles learned in the course.',
            deliverable: 'Working application with core features fully implemented',
          },
          {
            phase: 'Phase 3: Testing and Optimization',
            description: 'Write comprehensive tests and optimize your implementation for performance and scalability.',
            deliverable: 'Test suite with >80% coverage and performance benchmarks',
          },
        ],
        techStack: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
        evaluationCriteria: [
          'Code quality and adherence to ${input.topic} principles',
          'Completeness of features and functionality',
          'Test coverage and reliability',
        ],
        stretchGoals: [
          'Add advanced features beyond requirements',
          'Implement performance optimizations',
          'Create comprehensive documentation',
        ],
      },
    },
  };
}

function transformCourseForBackend(courseJson: any, expertiseDomain: string = 'Computer Science') {
  // Transform CourseJSON format to backend-expected format
  // lesson.content is now a markdown string directly
  const course = courseJson.course || courseJson;

  return {
    title: course.title,
    description: course.description,
    difficulty: course.difficulty,
    duration_hours: course.estimatedHours || 30,
    category: expertiseDomain,
    modules: course.modules.map((module: any) => ({
      title: module.title,
      description: module.description,
      lessons: module.lessons.map((lesson: any) => ({
        title: lesson.title,
        content_markdown: lesson.content,
        duration_minutes: lesson.estimatedReadMinutes,
      })),
      quizzes: module.quiz ? [{
        title: `${module.title} Quiz`,
        description: `Assessment for ${module.title}`,
        passing_score: 70,
        total_points: 100,
        duration_minutes: 15,
        questions: module.quiz.questions || [],
      }] : [],
    })),
  };
}

async function notifyBackend(
  callbackUrl: string,
  success: boolean,
  data: any
) {
  try {
    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(success ? data : { error: data.error || 'Unknown error' }),
    });

    if (!response.ok) {
      log.warn({ callbackUrl, status: response.status }, 'Backend notification failed');
    }
  } catch (err) {
    log.error({ callbackUrl, err }, 'Failed to notify backend');
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
        const callbackUrl = payload.callback_url;
        const generationId = payload.id;

        log.info({ topic: input.topic, generationId, callbackUrl, useMockData: USE_MOCK_DATA }, 'Request received');

        let result;

        if (USE_MOCK_DATA) {
          log.info({ generationId }, 'Using mock data for course generation');
          await new Promise(resolve => setTimeout(resolve, 200));
          result = { valid: true, course: getMockCourse(input) };
        } else {
          // Use actual AI pipeline for course generation
          const emitter = new PipelineEmitter();
          let progressCount = 0;

          emitter.on('stage_complete', ({ stage, progress }) => {
            progressCount += 1;
            log.info(
              { generationId, stage, progress, stageNumber: progressCount },
              'Stage complete'
            );
          });

          result = await runCoursePipeline(input, { emitter });
        }

        if (!result.valid) {
          log.error(
            { generationId, errors: result.errors },
            'Course generation failed'
          );
          // Notify backend of failure
          if (callbackUrl) {
            await notifyBackend(callbackUrl.replace('process-generated', 'process-failed'), false, {
              error: result.errors?.join('; ') || 'Course generation failed',
            });
          }

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
          { generationId, title: (result.course as any).title },
          'Course generation successful'
        );

        // Notify backend of success - transform to backend format
        if (callbackUrl) {
          const transformedCourse = transformCourseForBackend(result.course, input.expertiseDomain);
          // Debug: Log module quiz info
          for (const mod of transformedCourse.modules) {
            log.info({ module: mod.title, quizCount: mod.quizzes.length }, 'Module quiz count');
            for (const quiz of mod.quizzes) {
              log.info({ quiz: quiz.title, questionCount: quiz.questions.length }, 'Quiz questions');
            }
          }
          await notifyBackend(callbackUrl, true, transformedCourse);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify(
            {
              valid: true,
              course: result.course,
              generationId,
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
    log.info({ port: PORT, useMockData: USE_MOCK_DATA }, 'Server listening');
    console.log(`\n🚀 AI Pipeline HTTP Server`);
    console.log(`📡 Listening on http://localhost:${PORT}/generate`);
    console.log(`${USE_MOCK_DATA ? '🎭 Using MOCK DATA (testing mode)' : '🤖 Using REAL AI PIPELINE'}\n`);
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
