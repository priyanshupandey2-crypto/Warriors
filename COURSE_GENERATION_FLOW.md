# Course Generation Flow

## Overview
This document describes the complete flow of AI-powered course generation in AuraLearn:

1. User submits course request with details
2. Request stored in database (pending review)
3. Admin reviews and processes generation
4. Mock AI generates course structure
5. Admin approves/rejects generated course
6. If approved, course is published to platform

## Data Models

### CourseGeneration (New)
```
id: Primary Key
user_id: User who submitted the request
topic: Course topic/title
difficulty_level: Beginner, Intermediate, Advanced
learning_duration: 1 Week, 2 Weeks, 1 Month, Custom
expertise_domain: Domain/field of expertise
relevant_tags: Related tags
status: pending → generating → generated → published/rejected
generated_course_data: JSON with full course structure
created_course_id: ID of published course (if approved)
error_message: Error details if generation fails
created_at, updated_at: Timestamps
generation_started_at, generation_completed_at: Processing timestamps
```

## API Endpoints

### 1. POST /api/course-generation/create
**User endpoint** - Submit course generation request

Request:
```json
{
  "topic": "Machine Learning Basics",
  "difficulty_level": "Beginner",
  "learning_duration": "1 Month",
  "expertise_domain": "Data Science",
  "relevant_tags": "ML, Python, Statistics"
}
```

Response:
```json
{
  "status": true,
  "message": "Course generation request submitted successfully",
  "generation_id": 1
}
```

Status after: `pending`

---

### 2. POST /api/course-generation/process/{generation_id}
**Admin endpoint** - Trigger AI generation for a pending request

Response:
```json
{
  "status": true,
  "message": "Course generation processed successfully",
  "generation_id": 1,
  "course_data": {
    "title": "Machine Learning Basics",
    "description": "A Beginner level course on Machine Learning Basics",
    "modules": [
      {
        "title": "Module 1: Introduction to Machine Learning",
        "lessons": [...],
        "quizzes": [...]
      }
    ]
  }
}
```

Status transitions: `pending` → `generating` → `generated`

---

### 3. GET /api/course-generation/pending
**Admin endpoint** - Get all pending/generated requests for review

Query Parameters:
- `skip`: Pagination offset (default: 0)
- `limit`: Records per page (default: 10)

Response:
```json
{
  "generations": [
    {
      "id": 1,
      "user_email": "user@example.com",
      "user_name": "John Doe",
      "topic": "Machine Learning Basics",
      "difficulty_level": "Beginner",
      "learning_duration": "1 Month",
      "expertise_domain": "Data Science",
      "relevant_tags": "ML, Python",
      "status": "generated",
      "created_at": "2026-06-25T10:30:00",
      "course_data": { ... }
    }
  ],
  "total": 5,
  "skip": 0,
  "limit": 10
}
```

---

### 4. PUT /api/course-generation/publish/{generation_id}
**Admin endpoint** - Publish (approve) or reject a generated course

Request:
```json
{
  "status": "published",
  "feedback": ""
}
```

Response (on approval):
```json
{
  "status": true,
  "message": "Course generation published successfully",
  "generation_id": 1,
  "created_course_id": 15
}
```

On publish:
- New Course created with all modules, lessons, and quizzes
- Status changes to `published`
- Audit log created

On reject:
```json
{
  "status": true,
  "message": "Course generation rejected successfully",
  "generation_id": 1
}
```

Status changes to `rejected`

---

## Frontend Flow

### Step 1: User Generates Course
**Page:** `/generate`

User fills form with:
- Topic (required)
- Difficulty Level (Beginner, Intermediate, Advanced)
- Learning Duration (1 Week, 2 Weeks, 1 Month, Custom)
- Expertise Domain
- Relevant Tags

Clicks "Generate My Course" button.

### Step 2: Submit to Backend
Frontend calls:
```
POST /api/course-generation/create
```

With course parameters. Backend stores as `pending` request.

### Step 3: Success Notification
- Toast shows "Course generation submitted successfully"
- Simulates generation steps (4 animation steps)
- Redirects to `/dashboard` after completion

User can now see pending request in their dashboard.

---

## Admin Dashboard Flow

### Step 1: View Pending Generations
Admin navigates to a new "Course Generations" section.

Fetches:
```
GET /api/course-generation/pending
```

Shows list of all pending/generated requests.

### Step 2: Process Generation
Admin clicks "Process" button on a pending request.

Calls:
```
POST /api/course-generation/process/{generation_id}
```

Status changes: `pending` → `generating` → `generated`

Generated course structure (with modules, lessons, quizzes) is returned.

### Step 3: Review Generated Course
Admin views the complete course structure:
- Title, description
- Module breakdown
- Lessons with content
- Quizzes with details

### Step 4: Approve or Reject
Admin clicks:
- **Approve** → Creates course in database
- **Reject** → Rejects with feedback

Calls:
```
PUT /api/course-generation/publish/{generation_id}
```

If approved:
- New Course record created
- All modules, lessons, quizzes created
- Status: `published`
- Course appears in /courses section

If rejected:
- Status: `rejected`
- Feedback stored
- Course not published

---

## Database Schema

### course_generations table
```
id (PK)
user_id (FK to users)
topic
difficulty_level
learning_duration
expertise_domain
relevant_tags
status (pending, generating, generated, published, rejected)
generated_course_data (JSON)
created_course_id (FK to courses, nullable)
created_at
updated_at
generation_started_at
generation_completed_at
error_message
```

Indexes:
- `idx_user_status` on (user_id, status)
- `idx_status_created` on (status, created_at)

---

## Status Transitions

```
User submits request
        ↓
   [pending]
        ↓
Admin clicks "Process"
        ↓
  [generating] → Mock AI generates course
        ↓
[generated] - Ready for admin review
        ↓
     ↙   ↘
  [published]  [rejected]
    (approved)  (rejected)
        ↓
   Course live
   on platform
```

---

## Error Handling

If generation fails:
- Status: `failed`
- `error_message` field populated
- Admin can retry by processing again

If publishing fails:
- Transaction rolled back
- Error returned to admin
- Status remains `generated`

---

## Audit Logging

Every action is logged:
- User submits generation request
- Admin processes generation
- Admin publishes course → Creates audit log with action "PUBLISH"
- Admin rejects course → Creates audit log with action "REJECT"

---

## Next Steps (AI Integration)

Currently, `generate_mock_course_data()` in `/api/course-generation/process` simulates AI generation.

To integrate real AI:
1. Replace mock function with actual AI API call
2. Call AI layer with course parameters
3. Parse AI response into course structure
4. Store in `generated_course_data` field
5. Update status to `generated`

The rest of the flow remains unchanged.
