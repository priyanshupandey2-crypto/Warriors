# AuraLearn - AI-Powered Course Generation Platform

> **Warriors** - A comprehensive, production-ready learning platform with AI-driven course generation, real-time progress tracking, and admin management systems.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen) ![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Quick Start](#quick-start)
6. [System Flows](#system-flows)
7. [API Documentation](#api-documentation)
8. [Database Schema](#database-schema)
9. [Authentication & Security](#authentication--security)
10. [Configuration](#configuration)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)
13. [Development Guide](#development-guide)

---

## Overview

**AuraLearn Warriors** is a full-stack learning management system (LMS) that combines artificial intelligence with educational technology. It enables users to generate AI-powered courses on any topic, take personalized quizzes, track their learning progress, and empowers administrators to review and publish quality courses.

### What Makes This Unique

- **AI-Powered Course Generation**: Uses multi-stage LLM pipeline (Groq, Mistral, Google Generative AI) to generate complete courses from a simple prompt
- **Real-Time Progress Tracking**: Dashboard with activity charts, learning hours, streak counters, and milestone tracking
- **Multi-Stage Validation**: Admin review queue ensures quality before publication
- **Production-Grade Infrastructure**: JWT authentication, PostgreSQL database, async job queues with Redis
- **Comprehensive Content**: Each course includes outline, structured lessons, interactive quizzes, and capstone projects

---

## Key Features

### For Learners

✅ **Course Discovery & Enrollment**
- Browse featured and trending courses
- Course previews with full descriptions
- One-click enrollment
- Track progress percentage per course

✅ **Personalized Learning**
- Interactive lesson interface with markdown content
- Module-based structure with sequential unlocking
- Code examples and practical takeaways
- Real-time progress saving

✅ **Quiz & Assessment**
- Multiple-choice quizzes with instant feedback
- Question explanations and learning insights
- Module-based testing (must pass to advance)
- Score tracking and review

✅ **Analytics Dashboard**
- Enrolled courses overview
- Weekly activity heatmap (7-day view)
- Monthly consistency tracker (22-day heatmap)
- Learning streak counter
- Total hours tracked
- Upcoming milestones and deadlines
- Recently completed certificates

✅ **Course Generation**
- Request custom course generation by topic
- Specify difficulty level, duration, and expertise domain
- Real-time status tracking with stage indicators
- Admin approval workflow
- User-friendly course editor before submission

### For Administrators

✅ **Course Management**
- View all courses in database
- Create, edit, and delete courses manually
- Manage modules and lessons
- Configure quiz passing scores

✅ **Review Queue**
- Review pending user-generated courses
- Preview complete course structure
- Leave feedback for course creators
- Approve for publication or request revisions
- Bulk actions and filtering

✅ **Analytics & Insights**
- Track total courses and enrollments
- Monitor generation success rates
- View user activity patterns
- Audit logs for all administrative actions

✅ **User Management**
- View registered users
- Monitor user activity
- Manage user roles and permissions
- Track course enrollments per user

### For Content Creators

✅ **AI Course Generation**
- Describe any course topic in natural language
- Specify learning outcomes and target audience
- AI generates complete course structure:
  - **5-Stage Pipeline**:
    1. Outline generation (modules, lessons, learning outcomes)
    2. Content creation (full markdown with examples)
    3. Quiz generation (multiple-choice assessments)
    4. Capstone project (real-world application)
    5. Final assembly (validation and metadata)
  
✅ **Course Editing & Customization**
- Review AI-generated content
- Edit module titles and descriptions
- Modify lesson content
- Adjust quiz questions and answers
- Customize difficulty levels

✅ **Quality Control**
- Submit courses for admin review
- Receive feedback from administrators
- Iterate before final publication
- View published courses in platform

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER DEVICES                              │
│                  (Browser - Next.js Frontend)                    │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP/REST
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────────┐    ┌────────▼─────────┐
    │  Frontend    │    │    Backend       │
    │ (Next.js)    │◄──►│   (FastAPI)      │
    │ Port 3000    │    │ Port 8000        │
    └─────────────┘    │ PostgreSQL       │
                       │ LangSmith        │
                       │ JWT Auth         │
                       └────────┬─────────┘
                                │
                       ┌────────┴────────┐
                       │                 │
                  ┌────▼────────┐  ┌────▼──────────┐
                  │ AI Pipeline  │  │    Queue      │
                  │ (Node.js)    │  │   Processor   │
                  │ Port 3001    │  │   (Background │
                  │              │  │    Thread)    │
                  │ - Groq       │  └──────────────┘
                  │ - Mistral    │
                  │ - Google     │
                  │ - Tavily Web │
                  │   Search     │
                  └──────────────┘
```

### Service Architecture

#### **Frontend Layer** (Next.js + React)
- Modern TypeScript/React components
- Context-based state management (AuthContext, ToastContext)
- Custom hooks for API calls and token management
- Tailwind CSS for responsive design
- Runs on `localhost:3000`

**Key Pages:**
- `/` - Home (hero, featured courses)
- `/login`, `/signup` - Authentication
- `/generate` - Course generation form
- `/courses` - Course browse & discovery
- `/course/[id]` - Learning interface
- `/dashboard` - User analytics
- `/admin/*` - Admin management
- `/my-courses` - Enrolled courses

#### **Backend Layer** (FastAPI + Python)
- RESTful API with 11+ routers
- JWT token-based authentication
- SQLAlchemy ORM with PostgreSQL
- Alembic migrations for schema versioning
- LangSmith integration for observability
- Runs on `localhost:8000`

**Core Routers:**
- `/api/auth/*` - Login, signup, token verification
- `/api/courses/*` - Course discovery and enrollment
- `/api/quiz/*` - Quiz retrieval and submission
- `/api/progress/*` - Learning analytics
- `/api/course-generation/*` - Generation workflow
- `/api/course-generation/callback/*` - AI pipeline callbacks
- `/api/v1/dashboard` - Dashboard aggregation
- `/api/admin/*` - Administrative functions
- `/api/classroom/*` - Classroom management

#### **AI Pipeline Layer** (Node.js TypeScript)
- Multi-stage course generation orchestrator
- Redis-based job queue (BullMQ)
- Support for 3 LLM providers (failover capability)
- Web search integration via Tavily
- Produces structured CourseJSON output
- Runs on `localhost:3001`

**Pipeline Stages:**
1. **Stage 1: Outline** - Module structure, learning outcomes
2. **Stage 2: Content** - Full lesson markdown with examples
3. **Stage 3a: Quizzes** - 4+ questions per module
4. **Stage 3b: Capstone** - Real-world project assignment
5. **Stage 3c: Organization Module** - Optional org-specific content
6. **Stage 4: Personalization** - Difficulty flags, prerequisite suggestions
7. **Stage 5: Assembly** - Final CourseJSON with metadata

#### **Queue Processing** (Background Service)
- Runs in separate thread on backend
- Polls database every 10 seconds
- Picks up pending courses, sends to AI
- Handles async generation workflow
- Implements exponential backoff on failures
- Auto-retry up to 3 times before manual review

#### **Database Layer** (PostgreSQL)
- 15+ tables with proper relationships
- ACID transactions
- Connection pooling (20 connections)
- Alembic migrations for schema evolution
- Audit logs for compliance

---

## Tech Stack

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.2.9 |
| Runtime | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| HTTP Client | Fetch API | Native |
| Icons | Material Symbols | Google |
| State Mgmt | React Context API | Native |

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | FastAPI | 0.100+ |
| Language | Python | 3.10+ |
| ORM | SQLAlchemy | 2.x |
| Database | PostgreSQL | 14+ |
| Migrations | Alembic | Latest |
| Auth | PyJWT | Latest |
| Validation | Pydantic | 2.x |
| Observability | LangSmith | Latest |
| Logging | Python logging | Native |

### AI Pipeline
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 20+ |
| Language | TypeScript | 5.4+ |
| LLM Provider 1 | Groq | llama-3.3-70b |
| LLM Provider 2 | Mistral | mistral-7b |
| LLM Provider 3 | Google | Gemini API |
| Job Queue | BullMQ | 5.7+ |
| Cache/Queue | Redis | 6+ |
| Web Search | Tavily | 2.0+ |
| Validation | Zod | 3.23+ |
| Logging | Pino | 9.1+ |

### Infrastructure
| Component | Technology | Details |
|-----------|-----------|---------|
| Container Orchestration | Docker/Docker Compose | Optional |
| Database | PostgreSQL | 14+ with psycopg2 |
| Cache/Queue | Redis | Required for AI pipeline |
| Monitoring | LangSmith | Optional but recommended |
| Logging | Structured JSON | Pino + Python logging |

---

## Quick Start

### Prerequisites

- **Node.js** 20+ (for frontend and AI pipeline)
- **Python** 3.10+ (for backend)
- **PostgreSQL** 14+ (database)
- **Redis** 6+ (job queue)
- **API Keys**: 
  - Groq API key (free)
  - Mistral API key (optional)
  - Google Generative AI key (optional)
  - Tavily API key (for web search)

### Installation

#### 1. Clone Repository
```bash
git clone <repository-url>
cd Warriors
```

#### 2. Backend Setup
```bash
cd backend

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/auralearn
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
TOKEN_EXPIRE_HOURS=24
DEBUG=True
LANGSMITH_API_KEY=<your-key>
LANGSMITH_PROJECT=auralearn
EOF

# Run migrations
alembic upgrade head

# Start backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend running on `http://localhost:8000`
✅ API docs available at `http://localhost:8000/docs`

#### 3. AI Pipeline Setup
```bash
cd ../ai-pipeline

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
GROQ_API_KEY=<your-groq-key>
MISTRAL_API_KEY=<your-mistral-key>
GOOGLE_API_KEY=<your-google-key>
TAVILY_API_KEY=<your-tavily-key>
REDIS_URL=redis://localhost:6379
BACKEND_URL=http://localhost:8000
PORT=3001
LOG_LEVEL=info
USE_MOCK_DATA=false
EOF

# Start HTTP server
npm run server
```

✅ AI Pipeline running on `http://localhost:3001`

**In another terminal, start the worker:**
```bash
npm run worker
```

#### 4. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

# Start dev server
npm run dev
```

✅ Frontend running on `http://localhost:3000`

### Test the Complete Flow

#### 1. Create User Account
```bash
# Via Frontend
Navigate to http://localhost:3000/signup
Fill form and create account

# Via API
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### 2. Login
```bash
# Via Frontend
http://localhost:3000/login

# Via API
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Response includes token
# {
#   "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "token_type": "bearer",
#   "user": { "id": 1, "email": "john@example.com", "role": "learner" }
# }
```

#### 3. Generate a Course
```bash
# Via Frontend
Navigate to http://localhost:3000/generate
Fill form:
  - Topic: "Advanced TypeScript"
  - Difficulty: "Advanced"
  - Duration: 8 hours
  - Domain: "Software Development"
  - Tags: ["typescript", "advanced", "web"]
Click "Generate My Course"

# Watch real-time status updates
# See progress through stages:
# Analyzing → Queue → Generating → Ready for review

# Via API
curl -X POST http://localhost:8000/api/course-generation/create \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Advanced TypeScript",
    "difficulty_level": "Advanced",
    "learning_duration": 8,
    "expertise_domain": "Software Development",
    "relevant_tags": ["typescript", "advanced", "web"]
  }'

# Returns: { "generation_id": 1, "status": "pending" }
```

#### 4. Check Generation Status
```bash
# Frontend automatically polls every 3 seconds
# Or manually check via API

curl http://localhost:8000/api/course-generation/status/1 \
  -H "Authorization: Bearer <your-token>"

# Response shows status progression
```

#### 5. Admin Reviews Course
```bash
# Login with admin account (or create one with role="admin")

# View pending courses
curl http://localhost:8000/api/course-generation/pending \
  -H "Authorization: Bearer <admin-token>"

# Approve course
curl -X PUT http://localhost:8000/api/course-generation/publish/1 \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published",
    "feedback": "Great course! Published."
  }'
```

#### 6. Enroll and Take Course
```bash
# Frontend
Navigate to http://localhost:3000/courses
Find your published course
Click "Enroll"
Browse modules and lessons
Take quiz when ready

# View progress on dashboard
http://localhost:3000/dashboard
```

---

## System Flows

### Flow 1: User Authentication & Authorization

```
┌─────────────────┐
│ User visits     │
│ /login or       │
│ /signup         │
└────────┬────────┘
         │
    ┌────▼─────────────────────────┐
    │ Frontend: Input email/password│
    └────────┬─────────────────────┘
             │
    ┌────────▼──────────────────────────────────────┐
    │ POST /api/auth/login or /api/auth/signup      │
    └────────┬─────────────────────────────────────┘
             │
    ┌────────▼──────────────────────────────────────┐
    │ Backend: Validate credentials                  │
    │ Hash password (bcrypt) and store in database   │
    │ OR verify password against stored hash         │
    └────────┬─────────────────────────────────────┘
             │
    ┌────────▼──────────────────────────────────────┐
    │ Generate JWT token (24-hour expiry)            │
    │ Payload: { sub: user_id, email, role, exp }  │
    └────────┬─────────────────────────────────────┘
             │
    ┌────────▼──────────────────────────────────────┐
    │ Return token + user info to frontend           │
    └────────┬─────────────────────────────────────┘
             │
    ┌────────▼──────────────────────────────────────┐
    │ Frontend: Store token in localStorage          │
    │ Update AuthContext with user state             │
    │ Redirect to dashboard                          │
    └──────────────────────────────────────────────┘

TOKEN USAGE:
┌──────────────────────────────────────────────────┐
│ All subsequent requests include:                  │
│ Authorization: Bearer {token}                     │
└──────────────────┬───────────────────────────────┘
                   │
         ┌─────────▼─────────────┐
         │ Backend checks token  │
         │ in AuthMiddleware     │
         └─────────┬─────────────┘
                   │
         ┌─────────▼──────────────────────┐
         │ Valid: Execute endpoint logic   │
         │ Invalid: Return 401 Unauthorized│
         └────────────────────────────────┘

TOKEN EXPIRY:
┌──────────────────────────────────────────────────┐
│ Frontend hook monitors token expiry:              │
│ useTokenRefresh hook checks every 5 minutes       │
│ If expiring soon: Auto-refresh (if available)     │
│ If expired: Prompt user to login again            │
└──────────────────────────────────────────────────┘
```

### Flow 2: Course Generation (Complete End-to-End)

```
STAGE 1: USER REQUEST
┌──────────────────────────────────────────────────┐
│ 1. User fills form on /generate page             │
│    - Topic: "Advanced TypeScript"                │
│    - Difficulty: Advanced                        │
│    - Duration: 8 hours                           │
│    - Domain: Software Development                │
│    - Tags: [typescript, advanced]                │
└───────────┬────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────┐
│ 2. Frontend POST /api/course-generation/create │
│    (includes Authorization header)              │
└───────────┬────────────────────────────────────┘
            │
STAGE 2: BACKEND QUEUEING
┌───────────▼────────────────────────────────────┐
│ 3. Backend creates CourseGeneration record     │
│    status: "pending"                           │
│    Stores in database                          │
│    Returns generation_id to frontend           │
└───────────┬────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────┐
│ 4. Frontend receives generation_id             │
│    Starts polling /api/course-generation/      │
│    status/{id} every 3 seconds                 │
└───────────┬────────────────────────────────────┘
            │
STAGE 3: QUEUE PROCESSOR (runs every 10s)
┌───────────▼────────────────────────────────────┐
│ 5. Backend Queue Processor finds pending       │
│    courses (status="pending")                  │
│    Prepares request for AI pipeline            │
└───────────┬────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────┐
│ 6. HTTP POST to AI Pipeline (port 3001)        │
│    /generate endpoint                          │
│    Payload: {                                  │
│      id: generation_id,                        │
│      topic, difficulty, duration,              │
│      domain, tags,                             │
│      callback_url: backend URL                 │
│    }                                           │
│    Update status: "generating"                 │
└───────────┬────────────────────────────────────┘
            │
STAGE 4: AI PIPELINE PROCESSING
┌───────────▼────────────────────────────────────┐
│ 7. AI Pipeline HTTP Server receives request    │
│    Validates input (Zod schemas)               │
│    Creates BullMQ job                          │
│    Returns 200 OK immediately                  │
└───────────┬────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────┐
│ 8. BullMQ Worker picks up job                  │
│    (concurrency: 2, rate: 5/min)               │
│    Calls runCoursePipeline()                   │
└───────────┬────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────┐
│ 9. Execute 5-Stage Pipeline:                   │
│    Stage 1: Generate course outline            │
│             - Modules structure                │
│             - Learning outcomes                │
│             - Module descriptions              │
│    ↓                                           │
│    Stage 2: Generate lesson content            │
│             - Full markdown with code          │
│             - Examples and takeaways           │
│    ↓                                           │
│    Stage 3a: Generate quizzes                  │
│              - 4 questions per module          │
│              - Multiple choice format          │
│    ↓                                           │
│    Stage 3b: Generate capstone project         │
│              - Real-world scenario             │
│              - Phases and deliverables         │
│    ↓                                           │
│    Stage 4: Generate personalization           │
│             - Difficulty flags                 │
│             - Prerequisite suggestions         │
│    ↓                                           │
│    Stage 5: Assemble final CourseJSON          │
│             - Validate all sections            │
│             - Add metadata (models, duration)  │
│             - Return structured output         │
└───────────┬────────────────────────────────────┘
            │
STAGE 5: CALLBACK & BACKEND PROCESSING
┌───────────▼────────────────────────────────────┐
│ 10. On SUCCESS:                                 │
│     AI Pipeline HTTP POST to backend callback   │
│     /api/course-generation/callback/            │
│     process-generated/{id}                      │
│     Payload: { course_data: CourseJSON }        │
└───────────┬────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────┐
│ 11. Backend receives generated course           │
│     Stores CourseJSON in database               │
│     Update CourseGeneration:                    │
│     status: "awaiting_approval"                 │
└───────────┬────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────┐
│ 12. Frontend detects status change              │
│     Polls and sees "awaiting_approval"          │
│     Shows "Ready for admin review" message      │
│     Offers option to edit or submit             │
└───────────┬────────────────────────────────────┘
            │
STAGE 6: ADMIN APPROVAL
┌───────────▼────────────────────────────────────┐
│ 13. Admin navigates to /admin/reviews           │
│     Views pending courses                       │
│     Previews generated course structure         │
│     Can provide feedback                        │
└───────────┬────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────┐
│ 14. Admin clicks "Publish" or "Reject"          │
│     PUT /api/course-generation/publish/{id}     │
│     Payload: { status: "published", feedback }  │
└───────────┬────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────┐
│ 15. Backend creates full Course structure:      │
│     - Course table entry                        │
│     - Module entries (for each module)          │
│     - Lesson entries (for each lesson)          │
│     - Quiz entries (for each module quiz)       │
│     - QuizQuestion entries (for each question)  │
│     - QuestionOption entries (for each answer)  │
│     Update CourseGeneration:                    │
│     status: "published"                         │
│     created_course_id: <id>                     │
└───────────┬────────────────────────────────────┘
            │
STAGE 7: COURSE PUBLISHED
┌───────────▼────────────────────────────────────┐
│ 16. Course is now LIVE                          │
│     Visible in /courses browse page             │
│     Users can enroll immediately                │
│     Creator can see in /my-courses               │
└──────────────────────────────────────────────────┘

ERROR HANDLING:
┌──────────────────────────────────────────────────┐
│ If AI Pipeline fails:                            │
│ - POST /api/course-generation/callback/          │
│   process-failed/{id}                            │
│ - Backend increments retry_count                 │
│ - Schedules retry with exponential backoff:      │
│   1st failure: retry after 60s                   │
│   2nd failure: retry after 120s                  │
│   3rd failure: retry after 240s                  │
│ - After 3 failed retries → status: "rejected"    │
│ - Admin can still manually approve               │
└──────────────────────────────────────────────────┘
```

### Flow 3: Learning Path (Enroll & Take Course)

```
BROWSE & ENROLL
┌──────────────────────────┐
│ 1. User on /courses page │
│    Sees published courses│
└──────────┬───────────────┘
           │
    ┌──────▼──────────────────────────┐
    │ 2. Clicks course, views preview  │
    │    GET /api/courses/{id}/preview │
    │    Shows title, description,     │
    │    modules, duration, rating     │
    └──────┬───────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │ 3. Clicks "Enroll"               │
    │    POST /api/courses/{id}/enroll │
    │    Backend creates UserCourse    │
    │    record (enrollment_date,      │
    │    progress_percentage=0%)       │
    └──────┬───────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │ 4. Redirects to course page      │
    │    /course/{id}                  │
    │    Displays modules in order     │
    │    First module unlocked         │
    │    Rest locked (greyed out)      │
    └─────────────────────────────────┘

LEARNING INTERFACE
┌──────────────────────────────────────┐
│ 5. User clicks on lesson within       │
│    first module                       │
│    GET /api/lessons/{lesson_id}       │
│    Returns markdown content           │
│    Frontend renders with react-md     │
└──────┬───────────────────────────────┘
       │
┌──────▼───────────────────────────────┐
│ 6. User reads lesson                  │
│    Content includes:                  │
│    - Explanation paragraphs           │
│    - Code examples (highlighted)      │
│    - Key takeaways (summary)          │
│    - Related concepts (links)         │
└──────┬───────────────────────────────┘
       │
┌──────▼───────────────────────────────┐
│ 7. User clicks "Mark Complete"        │
│    POST /api/progress/               │
│    lesson-complete                    │
│    Backend creates UserLessonProgress │
│    record (completed=true,            │
│    completion_date=now)               │
│    Updates UserCourse.progress_%      │
│    (progress = completed/total)       │
└──────┬───────────────────────────────┘
       │
QUIZ & ASSESSMENT
┌──────▼────────────────────────────────┐
│ 8. After all lessons in module,       │
│    user sees "Take Quiz" button        │
│    GET /api/quiz/{quiz_id}             │
│    Returns quiz metadata + questions   │
└──────┬───────────────────────────────┘
       │
┌──────▼────────────────────────────────┐
│ 9. Quiz interface displays:            │
│    - Question text                     │
│    - 4 answer options (A,B,C,D)        │
│    - Progress indicator (Q 1 of 4)     │
│    - Time remaining (optional)         │
└──────┬───────────────────────────────┘
       │
┌──────▼────────────────────────────────┐
│ 10. User selects answer, clicks next   │
│     Validates selection                │
│     Moves to next question             │
└──────┬───────────────────────────────┘
       │
┌──────▼────────────────────────────────┐
│ 11. After all questions:               │
│     User clicks "Submit Quiz"          │
│     POST /api/quiz/submit              │
│     Payload: {                         │
│       quiz_id,                         │
│       answers: [                       │
│         { question_id, selected_option}│
│       ]                                │
│     }                                  │
└──────┬───────────────────────────────┘
       │
┌──────▼────────────────────────────────┐
│ 12. Backend grades quiz:               │
│     - Compare answers to correct       │
│     - Calculate score (points)         │
│     - Check if >= passing_score        │
│     - Create QuizSubmission record     │
│     - Return score + feedback          │
└──────┬───────────────────────────────┘
       │
┌──────▼────────────────────────────────┐
│ 13. If PASSED:                         │
│     - Show success message             │
│     - Unlock next module               │
│     - Save score in database           │
└──────┬───────────────────────────────┘
       │
┌──────▼────────────────────────────────┐
│ 14. If FAILED:                         │
│     - Show failure message             │
│     - Offer to retake (some courses)   │
│     - Suggest review materials         │
└──────┬───────────────────────────────┘
       │
COURSE COMPLETION
┌──────▼────────────────────────────────┐
│ 15. When all modules passed:           │
│     - Mark UserCourse.status="completed"│
│     - Calculate final course score     │
│     - Award certificate                │
│     - Update progress to 100%          │
│     - Show completion screen           │
│     - Add to "Recently Completed"      │
│     - Update streak counter            │
└──────────────────────────────────────┘

DASHBOARD TRACKING
┌──────────────────────────────────────┐
│ 16. User views dashboard               │
│     GET /api/v1/dashboard              │
│     Shows:                             │
│     - Enrolled courses (count)         │
│     - Completed courses (count)        │
│     - Learning hours (sum of duration) │
│     - Streak days (consecutive days)   │
│     - Weekly activity (7-day chart)    │
│     - Monthly consistency (heatmap)    │
│     - Upcoming milestones              │
│     - Recently completed courses       │
└──────────────────────────────────────┘
```

---

## API Documentation

### Authentication Endpoints

#### **POST /api/auth/signup**
Create new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "learner"
}
```

#### **POST /api/auth/login**
Login and receive JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "role": "learner"
  }
}
```

#### **POST /api/auth/verify-token**
Verify token validity.

**Request:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user_id": 1,
  "email": "john@example.com"
}
```

### Course Management

#### **GET /api/courses**
Browse all courses (paginated).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `difficulty`: Filter by difficulty

**Response (200 OK):**
```json
{
  "total": 25,
  "page": 1,
  "limit": 10,
  "courses": [
    {
      "id": 1,
      "title": "Advanced TypeScript",
      "description": "Master TypeScript...",
      "difficulty": "Advanced",
      "estimated_hours": 8,
      "category": "Software Development",
      "thumbnail_url": "https://...",
      "avg_rating": 4.5,
      "total_enrollments": 150
    }
  ]
}
```

#### **GET /api/courses/{id}/preview**
Get course preview without enrolling.

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Advanced TypeScript",
  "description": "...",
  "modules": [
    {
      "id": 101,
      "title": "Type System Fundamentals",
      "description": "...",
      "lessons": [
        {
          "id": 1001,
          "title": "Basic Types",
          "duration_minutes": 45
        }
      ]
    }
  ],
  "estimated_hours": 8,
  "total_lessons": 24,
  "capstone": { "title": "...", "overview": "..." }
}
```

#### **POST /api/courses/{id}/enroll**
Enroll in a course.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (201 Created):**
```json
{
  "enrollment_id": 5,
  "course_id": 1,
  "user_id": 1,
  "enrollment_date": "2026-06-28T10:30:00Z",
  "progress_percentage": 0,
  "status": "active"
}
```

### Course Generation

#### **POST /api/course-generation/create**
Request AI course generation.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "topic": "Advanced TypeScript",
  "difficulty_level": "Advanced",
  "learning_duration": 8,
  "expertise_domain": "Software Development",
  "relevant_tags": ["typescript", "advanced", "web"]
}
```

**Response (201 Created):**
```json
{
  "generation_id": 1,
  "topic": "Advanced TypeScript",
  "status": "pending",
  "created_at": "2026-06-28T10:30:00Z"
}
```

#### **GET /api/course-generation/status/{id}**
Check generation status.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "generation_id": 1,
  "status": "generating",
  "current_stage": "Stage 2: Generating lesson content",
  "progress_percentage": 40,
  "estimated_completion": "2026-06-28T11:15:00Z",
  "message": "Creating content for lessons..."
}
```

#### **GET /api/course-generation/pending**
Get pending courses for admin review (ADMIN ONLY).

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Response (200 OK):**
```json
{
  "pending_courses": [
    {
      "generation_id": 1,
      "topic": "Advanced TypeScript",
      "created_by": "john@example.com",
      "submitted_at": "2026-06-28T11:30:00Z",
      "course_preview": { ... }
    }
  ]
}
```

#### **PUT /api/course-generation/publish/{id}**
Approve/reject course (ADMIN ONLY).

**Headers:**
```
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "published",
  "feedback": "Excellent course structure! Published."
}
```

**Response (200 OK):**
```json
{
  "generation_id": 1,
  "status": "published",
  "created_course_id": 42,
  "course_url": "/course/42"
}
```

### Quiz & Assessments

#### **GET /api/quiz/{quiz_id}**
Get quiz questions.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "quiz_id": 201,
  "course_id": 1,
  "module_id": 101,
  "title": "Module 1 Assessment",
  "description": "Test your knowledge...",
  "passing_score": 70,
  "questions": [
    {
      "question_id": 2001,
      "question_text": "What is TypeScript?",
      "question_type": "multiple_choice",
      "difficulty": "easy",
      "options": [
        {
          "option_id": 1,
          "text": "A superset of JavaScript",
          "option_letter": "A"
        }
      ]
    }
  ]
}
```

#### **POST /api/quiz/submit**
Submit quiz answers.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "quiz_id": 201,
  "answers": [
    {
      "question_id": 2001,
      "selected_option": 1
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "submission_id": 5001,
  "score": 85,
  "passed": true,
  "feedback": "Great job!"
}
```

### Progress & Analytics

#### **GET /api/v1/dashboard**
Get complete dashboard data (no auth required).

**Response (200 OK):**
```json
{
  "stats": {
    "enrolled_courses": 12,
    "completed_courses": 4,
    "learning_hours": 84.5,
    "streak_days": 7
  },
  "weekly_activity": {
    "week_data": [
      { "day": "Mon", "minutes": 45 }
    ]
  }
}
```

---

## Database Schema

Core tables include: `users`, `courses`, `modules`, `lessons`, `quizzes`, `quiz_questions`, `question_options`, `quiz_submissions`, `user_courses`, `user_lesson_progress`, `course_generations`, `learning_activities`, `audit_logs`.

All tables use serial primary keys and proper foreign key relationships with cascade deletes where appropriate.

---

## Authentication & Security

- **JWT tokens** with 24-hour expiry
- **bcrypt password hashing**
- **CORS protection** with configurable origins
- **Role-based access control** (learner, admin)
- **Protected routes** with token validation
- **Audit logging** of all admin actions
- **Public endpoints** for auth and course browsing

---

## Configuration

Environment variables for backend, frontend, and AI pipeline are documented in the Quick Start section above.

---

## Deployment

Docker Compose configuration provided for local development. Production deployment instructions for backend (Gunicorn), frontend (Vercel), and AI pipeline (Lambda/Container Services) included.

---

## Troubleshooting

Common issues and solutions documented for:
- Database connection failures
- CORS errors
- JWT secret configuration
- API token issues
- Redis connection problems
- API key validation
- Database schema issues

---

## Development Guide

Comprehensive guide for:
- Project structure overview
- Adding new features (database, backend, frontend)
- Testing and debugging
- Code standards and best practices
- Pull request process

---

## Conclusion

**AuraLearn Warriors** is a production-ready AI-powered learning platform with complete course generation, progress tracking, and admin management capabilities. The system combines modern web technologies with AI services to create a comprehensive educational experience.

### Key Achievements

✅ **Complete AI Pipeline** - 5-stage course generation with multi-LLM support  
✅ **Full-Stack Implementation** - Frontend, backend, AI integrated seamlessly  
✅ **Production Infrastructure** - JWT auth, PostgreSQL, Redis, async queues  
✅ **Admin Dashboard** - Course management, approval queue, analytics  
✅ **User Analytics** - Progress tracking, activity heatmaps, streak counters  
✅ **Comprehensive Documentation** - Multiple guides and API references  

**Status**: 🚀 **PRODUCTION READY**
