# Setup and Testing Guide

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL database running
- FastAPI backend environment setup
- Next.js frontend environment setup

## Initial Setup

### 1. Database Setup

The database tables are automatically created on backend startup via `init_db()`.

**To manually initialize:**

```bash
# From backend directory
python -c "from app.database import init_db; init_db()"
```

This creates:
- `review_queue` table
- `course_queue` table
- All other existing tables

### 2. Backend Setup

```bash
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://user:password@localhost:5432/coursedb
export AI_PIPELINE_URL=http://localhost:3001

# Run backend
python -m uvicorn app.main:app --reload --port 8000
```

Backend should start with:
```
✓ Database initialized
✓ Queue processor started in background
✓ Server listening on http://localhost:8000
```

### 3. AI Pipeline Setup

```bash
cd ai-pipeline

# Install dependencies
npm install

# Set environment variables
export BACKEND_URL=http://localhost:8000
export PORT=3001

# Run AI pipeline server
npm run server
```

AI Pipeline should start with:
```
🚀 AI Pipeline HTTP Server
📡 Listening on http://localhost:3001/generate
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Run development server
npm run dev
```

Frontend should start on `http://localhost:3000`

## Testing the Complete Flow

### Manual Testing

#### Step 1: Create Course Request

**Option A: Using Frontend**
1. Go to `http://localhost:3000/generate`
2. Fill in course details:
   - Topic: "Machine Learning Basics"
   - Difficulty: "Beginner"
   - Duration: "1 Week"
   - Domain: "Computer Science"
   - Tags: "Python, AI, ML"
3. Click "Generate My Course"
4. Watch status updates in real-time

**Option B: Using cURL**
```bash
curl -X POST http://localhost:8000/api/course-generation/create \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python Basics",
    "difficulty_level": "Beginner",
    "learning_duration": "1 Week",
    "expertise_domain": "Computer Science",
    "relevant_tags": "Python, Programming"
  }'
```

Expected response:
```json
{
  "status": true,
  "message": "Course generation request submitted successfully",
  "generation_id": 1,
  "queue_status": "Awaiting Generation"
}
```

#### Step 2: Monitor Queue Processor

Watch backend logs for:
```
INFO: Sent course 1 to AI pipeline, job ID: 1
```

This means the queue processor picked up your request and sent it to the AI pipeline.

#### Step 3: Monitor AI Pipeline

The AI pipeline will:
1. Receive request at `POST /generate`
2. Run through 5 generation stages
3. Return generated course to backend at `POST /api/queue/process-generated/1`

Watch logs for:
```
Stage complete: outline (20%)
Stage complete: content (40%)
Stage complete: quizzes (60%)
Stage complete: capstone (80%)
Stage complete: assembly (100%)
Course generation successful
```

#### Step 4: Check Course Status

```bash
curl http://localhost:8000/api/course-generation/status/1 \
  -H "Authorization: Bearer <your_token>"
```

Expected progression:
```json
{
  "status": true,
  "data": {
    "queue_status": "Generating"
  }
}
↓
{
  "status": true,
  "data": {
    "queue_status": "Awaiting Approval"
  }
}
```

#### Step 5: Admin Reviews Course

```bash
curl http://localhost:8000/api/course-generation/pending \
  -H "Authorization: Bearer <admin_token>"
```

Response shows courses awaiting approval:
```json
{
  "generations": [
    {
      "id": 1,
      "topic": "Python Basics",
      "status": "Awaiting Approval",
      "course_data": {
        "title": "Python Basics",
        "modules": [...]
      }
    }
  ]
}
```

#### Step 6: Admin Approves Course

```bash
curl -X PUT http://localhost:8000/api/course-generation/publish/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published",
    "feedback": "Course looks great!"
  }'
```

Expected response:
```json
{
  "status": true,
  "message": "Course published successfully",
  "review_queue_id": 1,
  "created_course_id": 100
}
```

#### Step 7: Verify Course Published

```bash
curl http://localhost:8000/api/courses \
  -H "Authorization: Bearer <your_token>"
```

New course should appear in the list with ID 100.

### Automated Testing

Run the test suite:

```bash
cd backend
pytest tests/test_complete_flow.py -v
```

This runs comprehensive tests for:
- Creating review queue entries
- Creating course queue entries
- Status transitions
- Receiving generated courses
- Admin approval flow
- Error handling and retries
- Database queries

Expected output:
```
test_01_create_review_queue_entry PASSED
test_02_create_course_queue_entry PASSED
test_03_update_status_to_generating PASSED
test_04_receive_generated_course PASSED
test_05_admin_approves_course PASSED
test_06_handle_generation_failure_with_retry PASSED
test_07_max_retries_exceeded PASSED
test_08_query_pending_courses PASSED
test_09_user_can_check_own_course_status PASSED

=================== 9 passed in 2.34s ===================
```

## Debugging

### Check Database State

```sql
-- See all pending courses
SELECT id, topic, status, submitted_at FROM review_queue 
WHERE status = 'Awaiting Generation';

-- See all in-progress courses
SELECT id, topic, status, generation_started_at FROM review_queue 
WHERE status = 'Generating';

-- See courses awaiting approval
SELECT id, topic, status, generation_completed_at FROM review_queue 
WHERE status = 'Awaiting Approval';

-- See course queue entries
SELECT id, review_queue_id, status, attempt_number, next_retry_at 
FROM course_queue;

-- See failed courses with retries scheduled
SELECT id, topic, retry_count, last_error, status FROM review_queue 
WHERE status = 'Generating' AND retry_count > 0;
```

### Common Issues

#### Queue Processor Not Starting

**Symptom:** Course remains in "Awaiting Generation" for > 10 seconds

**Solution:**
1. Check backend logs for errors
2. Verify database connection
3. Check if `app/services/queue_processor.py` is accessible
4. Verify asyncio event loop in main.py

#### AI Pipeline Not Responding

**Symptom:** Course stuck in "Generating" status

**Solution:**
```bash
# Test AI pipeline directly
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test",
    "difficulty": "Beginner",
    "learningDuration": "1 Week",
    "expertiseDomain": "Test",
    "tags": [],
    "reviewQueueId": 1
  }'
```

If connection refused:
1. Ensure `npm run server` is running in ai-pipeline directory
2. Check port 3001 is not in use: `lsof -i :3001`
3. Check AI pipeline logs for startup errors

#### Backend Not Notifying on Success

**Symptom:** AI pipeline finishes but backend status doesn't update

**Solution:**
1. Check AI pipeline logs for "Failed to notify backend"
2. Verify `BACKEND_URL` environment variable in AI pipeline
3. Test backend endpoint: `curl http://localhost:8000/api/queue/process-generated/1`
4. Check backend firewall/CORS settings

#### Retries Not Firing

**Symptom:** Failed courses not retrying

**Solution:**
1. Check course_queue.next_retry_at is in past
2. Verify queue processor is running
3. Check if DB transaction committed
4. Monitor queue processor logs for retry attempts

## Performance Testing

### Test High Volume

```bash
# Create 10 concurrent course requests
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/course-generation/create \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d "{\"topic\": \"Course $i\", ...}" &
done
wait
```

Queue processor should handle all:
- Distribute across AI pipeline
- Respect rate limits
- Update database correctly

### Monitor Performance

```bash
# Check queue processor responsiveness
watch -n 1 "psql -c \"SELECT COUNT(*) FROM review_queue WHERE status='Awaiting Generation';\""

# Check AI pipeline backlog
watch -n 1 "psql -c \"SELECT COUNT(*) FROM course_queue WHERE status='Processing';\""
```

## Cleanup

### Reset Database

```bash
# Drop all tables and recreate
psql -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Reinitialize
python -c "from app.database import init_db; init_db()"
```

### Clear Queue

```bash
# Clear pending courses
psql -c "DELETE FROM course_queue; DELETE FROM review_queue WHERE status IN ('Awaiting Generation', 'Generating');"
```

## Logs

### Backend Logs

Check console output of:
```
python -m uvicorn app.main:app --reload
```

Key log lines:
- "Queue processor started in background"
- "Sent course X to AI pipeline"
- "Course X generation complete"
- "Admin X approved course Y"

### AI Pipeline Logs

Check console output of:
```
npm run server
```

Key log lines:
- "Request received"
- "Stage complete"
- "Course generation successful"
- "Failed to notify backend"

### Database Logs

Monitor database queries:
```sql
-- Enable query logging (PostgreSQL)
SET log_statement = 'all';

-- View slow queries
SELECT query, calls, mean_time FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

## Summary

The complete flow:

1. **User submits** → Course added to `review_queue` (Awaiting Generation)
2. **Queue processor sends** → Course moved to `course_queue`, status → Generating
3. **AI pipeline processes** → Course generation runs through 5 stages
4. **AI notifies backend** → Generated course stored, status → Awaiting Approval
5. **Admin reviews** → Admin sees pending course in dashboard
6. **Admin approves** → Course created (course/modules/lessons/quizzes), status → Approved
7. **User sees course** → New course appears in courses list

**Error Flow:**
- Generation fails → Retry scheduled with exponential backoff (60s, 120s, 240s)
- Max retries exceeded → Course marked as Rejected
- Admin can manually approve or reject → Course created or rejected

**Total Time:**
- From submit to Awaiting Approval: ~1-2 minutes (depends on AI generation speed)
- From Awaiting Approval to Published: Instant (admin approval)
