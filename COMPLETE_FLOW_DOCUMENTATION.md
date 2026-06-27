# Complete Course Generation Flow - Implementation Guide

## Overview

This document describes the complete course generation flow from user request to admin approval and course publication.

## Architecture

### Three-Service Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │◀────────▶│ AI Pipeline │
│  (Next.js)  │         │  (FastAPI)   │         │ (Node.js)   │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │  PostgreSQL  │
                        │  Database    │
                        └──────────────┘
```

## Database Schema

### ReviewQueue Table

Main tracking table for course generation requests through the entire lifecycle.

**Status Values:**
- `Awaiting Generation` - Initial state, waiting to be sent to AI
- `Generating` - Sent to AI pipeline, waiting for response
- `Awaiting Approval` - AI finished, ready for admin review
- `Approved` - Admin approved, course published
- `Rejected` - Admin rejected

**Key Fields:**
- `id` - Primary key
- `user_id` - User who requested (FK to users)
- `topic, difficulty_level, learning_duration, expertise_domain, relevant_tags` - User input
- `status` - Current status in workflow
- `generated_course_data` - Full generated course JSON (after AI processing)
- `created_course_id` - ID of created course (if approved)
- `retry_count` - Number of retry attempts
- `last_error` - Last error message if generation failed
- `submitted_at, generation_started_at, generation_completed_at, approved_at` - Timestamps

### CourseQueue Table

Processing queue for sending pending courses to AI pipeline.

**Status Values:**
- `Pending` - Waiting to be sent to AI
- `Sent` - Sent to AI pipeline
- `Processing` - AI is processing
- `Completed` - AI finished
- `Failed` - Failed, will retry

**Key Fields:**
- `id` - Primary key
- `review_queue_id` - Link to review_queue entry
- `status` - Processing status
- `attempt_number` - Which retry attempt (1, 2, 3...)
- `max_attempts` - Max retries (default: 3)
- `next_retry_at` - When to retry if failed
- `ai_job_id` - BullMQ job ID from AI pipeline
- `user_input` - Original user input sent to AI
- `sent_at, response_received_at` - Timestamps

## Complete Flow

### 1. User Submits Course Request (Frontend → Backend)

**Endpoint:** `POST /api/course-generation/create`

**Frontend:**
```typescript
const response = await apiCall("/api/course-generation/create", {
  method: "POST",
  body: JSON.stringify({
    topic: "Machine Learning Basics",
    difficulty_level: "Beginner",
    learning_duration: "1 Week",
    expertise_domain: "Computer Science",
    relevant_tags: "Python, AI, ML",
  }),
});
```

**Backend:**
- Creates entry in `review_queue` table with status `"Awaiting Generation"`
- Returns `generation_id` to frontend
- User is redirected to /dashboard

**Database Change:**
```
review_queue INSERT:
{
  id: 1,
  user_id: 123,
  topic: "Machine Learning Basics",
  difficulty_level: "Beginner",
  learning_duration: "1 Week",
  expertise_domain: "Computer Science",
  relevant_tags: "Python, AI, ML",
  status: "Awaiting Generation",
  submitted_at: NOW(),
  retry_count: 0
}
```

### 2. Frontend Polls for Status

**Endpoint:** `GET /api/course-generation/status/{generation_id}`

**Frequency:** Every 2 seconds

**Response:**
```json
{
  "status": true,
  "data": {
    "id": 1,
    "topic": "Machine Learning Basics",
    "queue_status": "Awaiting Generation",
    "submitted_at": "2026-06-25T10:00:00",
    "error": null,
    "retry_count": 0,
    "created_course_id": null
  }
}
```

### 3. Backend Queue Processor Sends to AI

**Service:** `app/services/queue_processor.py` (runs in background)

**Process:**
1. Polls database every 10 seconds for courses with status `"Awaiting Generation"`
2. For each pending course:
   - Creates entry in `course_queue` table with status `"Pending"`
   - Calls `send_to_ai_pipeline()` function
   - Updates `review_queue` status to `"Generating"`
   - Updates `generation_started_at` timestamp

**Request to AI Pipeline:**
```
POST http://localhost:3001/generate
{
  "topic": "Machine Learning Basics",
  "difficulty": "Beginner",
  "learningDuration": "1 Week",
  "expertiseDomain": "Computer Science",
  "tags": ["Python", "AI", "ML"],
  "reviewQueueId": 1
}
```

**Database Changes:**
```
course_queue INSERT:
{
  id: 1,
  review_queue_id: 1,
  status: "Processing",
  attempt_number: 1,
  user_input: "{...}",
  sent_at: NOW()
}

review_queue UPDATE:
{
  id: 1,
  status: "Generating",
  generation_started_at: NOW()
}
```

### 4. AI Pipeline Processes Course

**AI Pipeline (Node.js):**
1. Receives course request at `POST /generate`
2. Extracts `reviewQueueId` from payload
3. Runs course through 5-stage generation pipeline
4. On success: calls backend `POST /api/queue/process-generated/{reviewQueueId}` with generated course
5. On failure: calls backend `POST /api/queue/process-failed/{reviewQueueId}` with error

**Success Response to Backend:**
```
POST http://localhost:8000/api/queue/process-generated/1
{
  "course": {
    "course": {
      "title": "Introduction to Machine Learning",
      "description": "...",
      "category": "Computer Science",
      "difficulty": "Beginner",
      "duration_hours": 20,
      "modules": [...]
    },
    ...
  }
}
```

**Failure Response to Backend:**
```
POST http://localhost:8000/api/queue/process-failed/1
{
  "error": "Failed to generate module content: API error"
}
```

### 5. Backend Receives Generated Course

**Endpoint:** `POST /api/queue/process-generated/{review_queue_id}`

**Backend Process:**
- Receives generated course JSON from AI pipeline
- Stores in `review_queue.generated_course_data`
- Updates `review_queue.status` to `"Awaiting Approval"`
- Updates `review_queue.generation_completed_at`
- Updates `course_queue.status` to `"Completed"`
- Course is now ready for admin review

**Database Changes:**
```
review_queue UPDATE:
{
  id: 1,
  status: "Awaiting Approval",
  generated_course_data: "{...full course JSON...}",
  generation_completed_at: NOW()
}

course_queue UPDATE:
{
  id: 1,
  status: "Completed",
  response_received_at: NOW()
}
```

### 6. Frontend Shows Status Update

Frontend polling continues and detects status change to `"Awaiting Approval"`:
- Updates UI to show "Course generated! Awaiting admin approval."
- Redirects user to /dashboard

### 7. Admin Reviews Pending Courses

**Endpoint:** `GET /api/course-generation/pending`

**Admin Dashboard:**
- Shows all courses with status `"Awaiting Approval"`
- Displays course details and generated content
- Shows approve/reject buttons

### 8. Admin Approves Course

**Endpoint:** `PUT /api/course-generation/publish/{review_queue_id}`

**Admin Request:**
```json
{
  "status": "published",
  "feedback": "Course looks great!"
}
```

**Backend Process:**
1. Validates course has status `"Awaiting Approval"`
2. Parses `generated_course_data` JSON
3. Creates new `Course` entry
4. For each module in generated data:
   - Creates `Module` entry
   - Creates `Lesson` entries for each lesson
   - Creates `Quiz` entries for each quiz
5. Updates `review_queue`:
   - Sets `status` to `"Approved"`
   - Sets `created_course_id` to new course ID
   - Sets `approved_at` timestamp
   - Sets `approved_by` to admin user ID
6. Logs audit entry
7. Course is now public and visible to all users

**Database Changes:**
```
courses INSERT:
{
  id: 100,
  title: "Introduction to Machine Learning",
  description: "...",
  category: "Computer Science",
  difficulty: "Beginner",
  duration_hours: 20,
  thumbnail_url: "..."
}

modules INSERT (for each module):
{
  id: 1001,
  course_id: 100,
  title: "Module 1: Fundamentals",
  description: "...",
  order: 1
}

lessons INSERT (for each lesson):
{
  id: 10001,
  course_id: 100,
  module_id: 1001,
  title: "Lesson 1: What is ML?",
  content_markdown: "...",
  duration_minutes: 30,
  order: 1
}

quizzes INSERT (for each quiz):
{
  id: 100001,
  course_id: 100,
  module_id: 1001,
  title: "Quiz 1: Fundamentals",
  description: "...",
  passing_score: 70
}

review_queue UPDATE:
{
  id: 1,
  status: "Approved",
  created_course_id: 100,
  approved_at: NOW(),
  approved_by: 456 (admin ID)
}
```

## Error Handling & Retries

### Failure Scenario

If AI generation fails:

1. **First Attempt (Failure):**
   - AI pipeline calls `POST /api/queue/process-failed/1`
   - Backend increments retry count
   - Schedules retry for 60 seconds (1 minute)
   - Status remains `"Generating"`

2. **Retry Schedule (Exponential Backoff):**
   - Attempt 1 failure → Retry after 60s (1 minute)
   - Attempt 2 failure → Retry after 120s (2 minutes)
   - Attempt 3 failure → Retry after 240s (4 minutes)
   - Attempt 4 failure → Marked as `"Rejected"` with error message

3. **Frontend Behavior:**
   - Continues polling status
   - On retry, status shows as `"Generating"` again
   - If all retries fail, status becomes `"Rejected"` with error message
   - User shown error notification

### Manual Admin Fallback

If auto-retry fails, admin can:
1. View course in pending list
2. See error message and retry count
3. Approve course as-is or reject it
4. Provide feedback to user

## API Endpoints Summary

### User Endpoints

- `POST /api/course-generation/create` - Submit course generation request
- `GET /api/course-generation/status/{review_queue_id}` - Check course status

### Admin Endpoints

- `GET /api/course-generation/pending` - List courses awaiting approval
- `PUT /api/course-generation/publish/{review_queue_id}` - Approve/reject course

### Internal Endpoints

- `GET /api/queue/pending` - Get pending courses (for queue processor)
- `POST /api/queue/send-to-ai/{review_queue_id}` - Send course to AI pipeline
- `POST /api/queue/process-generated/{review_queue_id}` - Receive generated course from AI
- `POST /api/queue/process-failed/{review_queue_id}` - Handle generation failure from AI
- `GET /api/queue/status/{review_queue_id}` - Check queue status

## Services

### Queue Processor (`app/services/queue_processor.py`)

Runs in background as separate thread:
- Polls database every 10 seconds
- Sends pending courses to AI pipeline
- Schedules retries for failed courses
- Updates database status

### AI Pipeline Service (`app/services/ai_pipeline_service.py`)

HTTP client functions:
- `send_to_ai_pipeline()` - Send course to AI, handle timeout/errors
- `notify_generation_complete()` - Store generated course in DB
- `notify_generation_failed()` - Handle failure and schedule retry

### AI Pipeline Server (`ai-pipeline/src/server.ts`)

Node.js HTTP server:
- Receives course requests at `POST /generate`
- Runs course through generation pipeline
- Notifies backend of success/failure
- Can auto-restart on error

## Configuration

### Backend

**Environment Variables:**
```
AI_PIPELINE_URL=http://localhost:3001
QUEUE_POLL_INTERVAL=10  # seconds
MAX_RETRIES=3
RETRY_DELAYS=[60, 120, 240]  # seconds
```

### AI Pipeline

**Environment Variables:**
```
BACKEND_URL=http://localhost:8000
PORT=3001
```

## Testing the Flow

### Prerequisites

1. Backend running: `python -m uvicorn app.main:app --reload`
2. AI Pipeline server running: `npm run server` (in ai-pipeline directory)
3. PostgreSQL database running and initialized
4. Frontend running: `npm run dev` (in frontend directory)

### Test Steps

1. **Create Course Request:**
   ```bash
   curl -X POST http://localhost:8000/api/course-generation/create \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "topic": "Python Basics",
       "difficulty_level": "Beginner",
       "learning_duration": "1 Week",
       "expertise_domain": "Computer Science",
       "relevant_tags": "Python, Programming"
     }'
   ```

2. **Check Status:**
   ```bash
   curl http://localhost:8000/api/course-generation/status/1 \
     -H "Authorization: Bearer <token>"
   ```

3. **Monitor Queue Processor Logs:**
   Watch backend logs for:
   - "Sent course X to AI pipeline"
   - "Course X generation complete"

4. **Admin Review:**
   ```bash
   curl http://localhost:8000/api/course-generation/pending \
     -H "Authorization: Bearer <admin_token>"
   ```

5. **Approve Course:**
   ```bash
   curl -X PUT http://localhost:8000/api/course-generation/publish/1 \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "published",
       "feedback": "Looks good!"
     }'
   ```

6. **Verify Course Created:**
   ```bash
   curl http://localhost:8000/api/courses \
     -H "Authorization: Bearer <token>"
   ```

## Troubleshooting

### Queue Processor Not Starting

- Check if backend is running
- Check logs for threading errors
- Verify database connection

### AI Pipeline Not Responding

- Verify `npm run server` is running in ai-pipeline directory
- Check if `http://localhost:3001/generate` is accessible
- Check AI pipeline logs for errors

### Generation Timeout

- AI generation defaults to 120s timeout
- Check AI pipeline logs for stuck stages
- Adjust `TIMEOUT` in `ai_pipeline_service.py` if needed

### Retries Not Firing

- Check if `next_retry_at` is in the past
- Verify queue processor is running
- Check database for stale entries

### Course Not Appearing After Approval

- Verify `created_course_id` is set in review_queue
- Check courses table for new entry
- Verify modules/lessons/quizzes were created
- Check audit logs for errors
