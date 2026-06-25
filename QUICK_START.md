# Quick Start - Course Generation Flow

## What Was Built

Complete end-to-end course generation system:
- User submits course request → Backend stores in queue → AI generates → Admin approves → Course published

## Files Added/Changed

### Database
- `backend/app/models/review_queue.py` - Track entire course lifecycle
- `backend/app/models/course_queue.py` - Queue for AI processing

### Backend Services
- `backend/app/routers/queue.py` - Queue management API
- `backend/app/services/queue_processor.py` - Background worker
- `backend/app/services/ai_pipeline_service.py` - AI communication

### Updated
- `backend/app/routers/course_generation.py` - Now uses ReviewQueue
- `backend/app/main.py` - Starts queue processor
- `frontend/src/app/generate/page.tsx` - Real-time status polling
- `ai-pipeline/src/server.ts` - Notifies backend of completion

## Start Everything

### 1. Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```

Output should show:
```
✓ Database initialized successfully
✓ Queue processor started in background
✓ Application startup complete
```

### 2. AI Pipeline
```bash
cd ai-pipeline
npm run server
```

Output should show:
```
🚀 AI Pipeline HTTP Server
📡 Listening on http://localhost:3001/generate
```

### 3. Frontend
```bash
cd frontend
npm run dev
```

## Test the Flow

### Via Frontend
1. Go to http://localhost:3000/generate
2. Fill form and click "Generate My Course"
3. Watch real-time status updates
4. Wait for "Awaiting admin approval" message

### Via API
```bash
# Create course
curl -X POST http://localhost:8000/api/course-generation/create \
  -H "Authorization: Bearer <token>" \
  -d '{...}'

# Check status
curl http://localhost:8000/api/course-generation/status/1 \
  -H "Authorization: Bearer <token>"

# Admin views pending
curl http://localhost:8000/api/course-generation/pending \
  -H "Authorization: Bearer <admin_token>"

# Admin approves
curl -X PUT http://localhost:8000/api/course-generation/publish/1 \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"status":"published","feedback":"Great!"}'
```

## Key Status Values

- `Awaiting Generation` - Waiting to send to AI
- `Generating` - AI is processing
- `Awaiting Approval` - Ready for admin review
- `Approved` - Admin approved, course published
- `Rejected` - Admin or system rejected

## Error Handling

If AI generation fails:
1. Auto-retry with exponential backoff (60s, 120s, 240s)
2. Max 3 retries
3. If all fail → Status = "Rejected"
4. Admin can still manually approve

## Database Tables

```
review_queue
├─ id, user_id, topic, difficulty_level, learning_duration, expertise_domain
├─ relevant_tags, status, generated_course_data, created_course_id
├─ retry_count, last_error, approved_by, reviewed_feedback
└─ submitted_at, generation_started_at, generation_completed_at, approved_at

course_queue
├─ id, review_queue_id, status, attempt_number, max_attempts
├─ next_retry_at, ai_job_id, user_input
└─ created_at, sent_at, response_received_at, error_message
```

## Debug

### Check Logs
- Backend: Watch console for "Sent course X to AI pipeline"
- AI Pipeline: Watch console for "Stage complete"
- Frontend: Check browser console for status polling

### Check Database
```sql
-- Pending courses
SELECT id, topic, status FROM review_queue WHERE status='Awaiting Generation';

-- In progress
SELECT id, topic, status FROM review_queue WHERE status='Generating';

-- Awaiting approval
SELECT id, topic, status FROM review_queue WHERE status='Awaiting Approval';

-- Failed with retries
SELECT id, topic, retry_count, last_error FROM review_queue WHERE retry_count > 0;
```

### Queue Processor Issues
1. Check backend logs for errors
2. Verify database connection
3. Restart backend if needed

### AI Pipeline Issues
1. Test directly: `curl -X POST http://localhost:3001/generate -d '{...}'`
2. Check if port 3001 is in use: `lsof -i :3001`
3. Check npm run server logs

## Performance

- Queue polls every 10 seconds
- Frontend updates every 2 seconds
- AI generation typically takes 60-120 seconds
- Retries with exponential backoff

## One-Line Summary

**User submits → Backend queues → AI generates → Admin approves → Course published, with auto-retry on failure**
