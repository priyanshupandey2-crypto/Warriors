# Complete Course Generation Flow - Implementation Summary

## What Was Implemented

A complete three-service architecture for course generation with async queue processing:

### 1. Database Models
- **ReviewQueue** - Main tracking table for course generation lifecycle
- **CourseQueue** - Processing queue for AI pipeline integration

### 2. Backend Services

**Queue Router** (`app/routers/queue.py`):
- `GET /api/queue/pending` - Get courses awaiting generation
- `POST /api/queue/send-to-ai/{id}` - Send course to AI
- `POST /api/queue/process-generated/{id}` - Receive generated course from AI
- `POST /api/queue/process-failed/{id}` - Handle generation failure + retry
- `GET /api/queue/status/{id}` - Check queue status

**Course Generation Router** (updated `app/routers/course_generation.py`):
- `POST /api/course-generation/create` - User submits course (now writes to ReviewQueue)
- `GET /api/course-generation/status/{id}` - User checks progress
- `GET /api/course-generation/pending` - Admin views pending approval
- `PUT /api/course-generation/publish/{id}` - Admin approves/rejects

**Queue Processor Service** (`app/services/queue_processor.py`):
- Runs in background thread on backend startup
- Polls every 10 seconds for pending courses
- Sends to AI pipeline and handles retries
- Exponential backoff: 60s, 120s, 240s

**AI Pipeline Service** (`app/services/ai_pipeline_service.py`):
- HTTP client functions for AI communication
- Handles timeouts and errors
- Manages retry scheduling

### 3. Frontend Updates

**Generate Page** (`frontend/src/app/generate/page.tsx`):
- Submits course request to backend
- Polls status every 2 seconds
- Shows real-time status updates
- Auto-redirects to dashboard when ready for admin review

### 4. AI Pipeline Updates

**Server** (`ai-pipeline/src/server.ts`):
- Accepts `reviewQueueId` in request payload
- Notifies backend on success/failure
- Calls `/api/queue/process-generated/{id}` on success
- Calls `/api/queue/process-failed/{id}` on failure

## Complete Flow

```
USER SUBMITS
    ↓
Backend: Create ReviewQueue entry with status "Awaiting Generation"
Return: generation_id to frontend
    ↓
Frontend: Start polling status every 2 seconds
    ↓
Queue Processor: Every 10 seconds, find "Awaiting Generation" courses
    ↓
Queue Processor: Create CourseQueue entry, send to AI pipeline
Backend: Update ReviewQueue status to "Generating"
    ↓
AI Pipeline: Receive course request
    ↓
AI Pipeline: Run through 5-stage generation (outline, content, quizzes, capstone, assembly)
    ↓
AI Pipeline: On success → POST /api/queue/process-generated/{id}
Backend: Store generated_course_data, update status to "Awaiting Approval"
    ↓
Frontend: Detect status change, show "Awaiting admin approval"
    ↓
ADMIN REVIEWS
    ↓
Admin: GET /api/course-generation/pending → see all pending courses
    ↓
Admin: PUT /api/course-generation/publish/{id} with status="published"
    ↓
Backend: Create Course, Modules, Lessons, Quizzes from generated data
Update ReviewQueue: status="Approved", created_course_id=X
    ↓
COURSE PUBLISHED
    ↓
User: Course now appears in courses list
```

## Error Handling

If AI generation fails:

```
AI Pipeline: Generation error
    ↓
AI Pipeline: POST /api/queue/process-failed/{id}
    ↓
Backend: Increment retry_count, schedule retry with exponential backoff
First failure → retry after 60s
Second failure → retry after 120s
Third failure → retry after 240s
Max retries exceeded → Mark as "Rejected"
    ↓
Frontend: Shows error to user
Admin: Can still manually approve/reject the course
```

## Key Features

✅ **Real-time Status Updates** - Frontend polls backend every 2 seconds
✅ **Automatic Retry Logic** - Exponential backoff for failed generations
✅ **Background Processing** - Queue processor runs in separate thread
✅ **Admin Override** - Manual approval even if auto-retry fails
✅ **Course Creation** - Auto-creates Course/Modules/Lessons/Quizzes on approval
✅ **Error Tracking** - Stores error messages and retry counts
✅ **Database Transaction Safety** - All updates committed atomically

## Files Created/Modified

### Created Files
- `backend/app/models/review_queue.py` - Main tracking table
- `backend/app/models/course_queue.py` - Processing queue
- `backend/app/routers/queue.py` - Queue management API
- `backend/app/services/queue_processor.py` - Background queue processor
- `backend/app/services/ai_pipeline_service.py` - AI integration functions
- `backend/app/services/__init__.py` - Services package

### Modified Files
- `backend/app/routers/course_generation.py` - Updated to use ReviewQueue
- `backend/app/main.py` - Added queue router, started queue processor
- `backend/app/models/__init__.py` - Exported new models
- `frontend/src/app/generate/page.tsx` - Added real-time status polling
- `ai-pipeline/src/server.ts` - Added backend notification logic

## Database Tables

### review_queue
```
id (PK)
user_id (FK users)
created_course_id (FK courses)
approved_by (FK users)

topic, difficulty_level, learning_duration, expertise_domain, relevant_tags
status: "Awaiting Generation" | "Generating" | "Awaiting Approval" | "Approved" | "Rejected"
generated_course_data (JSON)
retry_count, last_error

submitted_at, generation_started_at, generation_completed_at, approved_at
reviewed_feedback
```

### course_queue
```
id (PK)
review_queue_id (FK review_queue)

status: "Pending" | "Sent" | "Processing" | "Completed" | "Failed"
attempt_number, max_attempts
next_retry_at

ai_job_id
user_input (JSON)

created_at, sent_at, response_received_at
error_message
```

## Testing

Run tests:
```bash
cd backend
pytest tests/test_complete_flow.py -v
```

Tests cover:
- Creating review queue entries
- Creating course queue entries
- Status transitions
- Receiving generated courses
- Admin approval flow
- Error handling & retries
- Database queries

## Environment Setup

Backend:
```bash
export DATABASE_URL=postgresql://user:pass@localhost:5432/db
export AI_PIPELINE_URL=http://localhost:3001
```

AI Pipeline:
```bash
export BACKEND_URL=http://localhost:8000
export PORT=3001
```

## Performance

- Queue processor: Polls every 10 seconds, processes up to 5 pending courses per poll
- Frontend: Polls status every 2 seconds
- AI Pipeline: Processes courses sequentially or in parallel (configurable concurrency)
- Retry delays: 60s, 120s, 240s (exponential backoff)

## What Works End-to-End

1. ✅ User creates course via frontend form
2. ✅ Backend stores in ReviewQueue with "Awaiting Generation"
3. ✅ Queue processor picks up and sends to AI pipeline
4. ✅ Frontend polls and shows status updates
5. ✅ AI generates course, notifies backend
6. ✅ Backend updates to "Awaiting Approval"
7. ✅ Admin reviews and approves
8. ✅ Backend creates Course/Modules/Lessons/Quizzes
9. ✅ Course published and visible to users
10. ✅ Error handling with automatic retries
11. ✅ Admin can manually approve/reject at any time

## Next Steps (Optional)

- WebSocket for real-time updates (instead of polling)
- Redis-based queue instead of database polling
- Course generation progress streaming
- Email notifications to users/admins
- Analytics dashboard for generation metrics
