# Dashboard Requirements Analysis - Phase 1

**User**: Alex Chen  
**Last Updated**: 2026-06-22  
**Purpose**: Define exact data contract for AuraLearn Dashboard

---

## 📊 Section 1: User Summary Stats (Top Cards)

### Visual
Four stat cards displayed horizontally at the top of the dashboard.

### Data Requirements

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `enrolled_courses` | int | 12 | Total number of courses user is enrolled in |
| `completed_courses` | int | 4 | Number of courses fully completed |
| `learning_hours` | float | 84.5 | Total cumulative learning hours |
| `streak_days` | int | 7 | Current consecutive days learning streak |

### API Response
```json
{
  "stats": {
    "enrolled_courses": 12,
    "completed_courses": 4,
    "learning_hours": 84.5,
    "streak_days": 7
  }
}
```

### Questions for Product
- [ ] How is streak calculated? (consecutive days with activity > X minutes?)
- [ ] Is learning_hours cumulative all-time or this month?
- [ ] What defines "completed course"? (100% lessons + quiz?)

---

## 📈 Section 2: Weekly Activity Chart

### Visual
Bar chart showing learning minutes per day for current week.

**Current Week**: Has a dropdown selector (showing "This Week")

**Chart Data**:
- Monday: ~45 min (inferred)
- Tuesday: ~60 min (inferred)
- Wednesday: 10 min (visible on chart)
- Thursday: ~75 min (inferred)
- Friday: ~50 min (inferred)
- Saturday: ~40 min (inferred)
- Sunday: ~30 min (inferred)

### Data Requirements

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `day` | string | "Wed" | Day of week (Mon-Sun) |
| `minutes` | int | 10 | Learning minutes on that day |

### API Response
```json
{
  "weekly_activity": [
    { "day": "Mon", "minutes": 45 },
    { "day": "Tue", "minutes": 60 },
    { "day": "Wed", "minutes": 10 },
    { "day": "Thu", "minutes": 75 },
    { "day": "Fri", "minutes": 50 },
    { "day": "Sat", "minutes": 40 },
    { "day": "Sun", "minutes": 30 }
  ]
}
```

### Questions for Product
- [ ] Should the endpoint support week selection (past weeks)?
- [ ] Is this the current calendar week or rolling 7 days?
- [ ] Minimum activity threshold to show a day as "active"?

---

## 🎯 Section 3: Weekly Goal Progress

### Visual
- Text showing: "12 / 15 hours"
- Circular progress indicator showing 80% completion
- Motivational message: "80% of your target reached! Just 3 more hours to go."

### Data Requirements

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `completed_hours` | float | 12.0 | Hours learned this week so far |
| `target_hours` | float | 15.0 | Weekly learning goal in hours |
| `percentage` | int | 80 | Progress percentage (calculated: completed/target*100) |

### API Response
```json
{
  "weekly_goal": {
    "completed_hours": 12.0,
    "target_hours": 15.0,
    "percentage": 80
  }
}
```

### Questions for Product
- [ ] Can users have custom weekly goals?
- [ ] Is this a hard reset every Monday or rolling window?
- [ ] Should percentage be sent or calculated by frontend?

---

## 📅 Section 4: Monthly Consistency Heatmap

### Visual
Grid showing activity patterns throughout the month:
- **Rows**: Weeks of the month (4-5 weeks)
- **Columns**: Days of the week (Mon-Sun)
- **Color Intensity**: Light blue (no activity) → Dark blue (high activity)
- **Legend**: "Less ← → More"

### Data Requirements

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `date` | string (ISO8601) | "2026-06-01" | Date in YYYY-MM-DD format |
| `minutes` | int | 120 | Learning minutes on that day (0 = no activity) |

### API Response
```json
{
  "monthly_consistency": [
    { "date": "2026-06-01", "minutes": 0 },
    { "date": "2026-06-02", "minutes": 120 },
    { "date": "2026-06-03", "minutes": 85 },
    ...
    { "date": "2026-06-30", "minutes": 45 }
  ]
}
```

### Notes
- Frontend determines color intensity based on minutes value
- Should include all days of current month (even if 0 minutes)
- Used to show consistency patterns

### Questions for Product
- [ ] Should this show current month or user-selectable month?
- [ ] How many minutes = "fully colored" (darkest)?

---

## 🏆 Section 5: Upcoming Milestones

### Visual
- List of upcoming deadlines/goals
- Shows 2 items visible in dashboard
- Each milestone shows: title, days/time until due

**Visible Examples**:
- "UX Design Sprint" - Due in 2 days
- "Python Basics Final" - Due tomorrow

### Data Requirements

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | int | 1 | Unique milestone identifier |
| `title` | string | "UX Design Sprint" | Milestone name |
| `due_date` | string (ISO8601) | "2026-06-25" | Due date in YYYY-MM-DD format |
| `status` | string | "pending" | Status: pending, completed, overdue |

### API Response
```json
{
  "milestones": [
    {
      "id": 1,
      "title": "UX Design Sprint",
      "due_date": "2026-06-25",
      "status": "pending"
    },
    {
      "id": 2,
      "title": "Python Basics Final",
      "due_date": "2026-06-23",
      "status": "pending"
    }
  ]
}
```

### Notes
- Frontend calculates "in X days" from due_date and current date
- Should be sorted by due_date (nearest first)
- Only show non-completed milestones on dashboard

### Questions for Product
- [ ] How many milestones to show? (limit to 5?)
- [ ] Include completed milestones?
- [ ] Separate by category (course, personal, etc.)?

---

## 📚 Section 6: Enrolled Courses

### Visual
Horizontal scrollable card list showing 3 courses visible. Each card shows:
- Course thumbnail image
- Course title
- Difficulty badge (Advanced, Intermediate, Beginner)
- Current module/module name
- Progress bar showing percentage
- Lessons completion (e.g., "4/12 Lessons")

**Visible Courses**:
1. **Mastering UX Psychology**
   - Difficulty: Advanced
   - Module: "Module 4: Cognitive Biases"
   - Progress: 65%
   - Lessons: 12/18

2. **Python for Data Science**
   - Difficulty: Intermediate
   - Module: "Module 2: Pandas & NumPy"
   - Progress: 32%
   - Lessons: 4/12

3. **Digital Brand Identity**
   - Difficulty: Beginner
   - Module: "Module 6: Color Theory"
   - Progress: 68%
   - Lessons: 50/77

### Data Requirements

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | int | 1 | Course ID |
| `title` | string | "Python for Data Science" | Course name |
| `difficulty` | string | "Intermediate" | Level: Beginner, Intermediate, Advanced |
| `thumbnail_url` | string | "https://..." | Course card image URL |
| `current_module` | string | "Module 2: Pandas & NumPy" | Current module name |
| `progress_percentage` | int | 32 | Overall course progress (0-100) |
| `completed_lessons` | int | 4 | Lessons completed in course |
| `total_lessons` | int | 12 | Total lessons in course |
| `status` | string | "in_progress" | Status: not_started, in_progress, completed |

### API Response
```json
{
  "enrolled_courses": [
    {
      "id": 1,
      "title": "Mastering UX Psychology",
      "difficulty": "Advanced",
      "thumbnail_url": "https://...",
      "current_module": "Module 4: Cognitive Biases",
      "progress_percentage": 65,
      "completed_lessons": 12,
      "total_lessons": 18,
      "status": "in_progress"
    },
    {
      "id": 2,
      "title": "Python for Data Science",
      "difficulty": "Intermediate",
      "thumbnail_url": "https://...",
      "current_module": "Module 2: Pandas & NumPy",
      "progress_percentage": 32,
      "completed_lessons": 4,
      "total_lessons": 12,
      "status": "in_progress"
    },
    {
      "id": 3,
      "title": "Digital Brand Identity",
      "difficulty": "Beginner",
      "thumbnail_url": "https://...",
      "current_module": "Module 6: Color Theory",
      "progress_percentage": 68,
      "completed_lessons": 50,
      "total_lessons": 77,
      "status": "in_progress"
    }
  ]
}
```

### Notes
- Only show courses with status != "completed"
- Limit to 3-4 courses on dashboard (show all with "View all" link)
- Ordered by most recent activity or progress

### Questions for Product
- [ ] Should courses be ordered by progress, recent activity, or enrollment date?
- [ ] How many to show on dashboard? (limit to 3?)
- [ ] Should completed courses appear elsewhere?

---

## ✅ Section 7: Recently Completed

### Visual
Badge/icon list showing recently completed courses.

**Visible Examples**:
- "AI Foundations" - Certified
- "Modern Typography" - Certified
- "Public Speaking 101" - Certified

Each shows a certified badge.

### Data Requirements

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | int | 1 | Course ID |
| `course_name` | string | "AI Foundations" | Title of completed course |
| `certificate_earned` | bool | true | Whether user earned certificate |
| `completion_date` | string (ISO8601) | "2026-06-20" | Date course was completed |

### API Response
```json
{
  "recently_completed": [
    {
      "id": 1,
      "course_name": "AI Foundations",
      "certificate_earned": true,
      "completion_date": "2026-06-20"
    },
    {
      "id": 2,
      "course_name": "Modern Typography",
      "certificate_earned": true,
      "completion_date": "2026-06-19"
    },
    {
      "id": 3,
      "course_name": "Public Speaking 101",
      "certificate_earned": true,
      "completion_date": "2026-06-18"
    }
  ]
}
```

### Notes
- Show only last 3-5 completed courses
- Sort by completion_date (most recent first)
- Filter only courses with status = "completed"

### Questions for Product
- [ ] How many to show?
- [ ] Should users without certificates still appear?

---

## 📡 Complete API Response Contract

### Endpoint
```http
GET /api/v1/dashboard
```

### Full Response Structure
```json
{
  "stats": {
    "enrolled_courses": 12,
    "completed_courses": 4,
    "learning_hours": 84.5,
    "streak_days": 7
  },
  "weekly_activity": [
    { "day": "Mon", "minutes": 45 },
    { "day": "Tue", "minutes": 60 },
    { "day": "Wed", "minutes": 10 },
    { "day": "Thu", "minutes": 75 },
    { "day": "Fri", "minutes": 50 },
    { "day": "Sat", "minutes": 40 },
    { "day": "Sun", "minutes": 30 }
  ],
  "weekly_goal": {
    "completed_hours": 12.0,
    "target_hours": 15.0,
    "percentage": 80
  },
  "monthly_consistency": [
    { "date": "2026-06-01", "minutes": 0 },
    { "date": "2026-06-02", "minutes": 120 },
    { "date": "2026-06-03", "minutes": 85 }
  ],
  "milestones": [
    {
      "id": 1,
      "title": "UX Design Sprint",
      "due_date": "2026-06-25",
      "status": "pending"
    }
  ],
  "enrolled_courses": [
    {
      "id": 1,
      "title": "Mastering UX Psychology",
      "difficulty": "Advanced",
      "thumbnail_url": "https://...",
      "current_module": "Module 4: Cognitive Biases",
      "progress_percentage": 65,
      "completed_lessons": 12,
      "total_lessons": 18,
      "status": "in_progress"
    }
  ],
  "recently_completed": [
    {
      "id": 1,
      "course_name": "AI Foundations",
      "certificate_earned": true,
      "completion_date": "2026-06-20"
    }
  ]
}
```

---

## 🔄 Cross-Verification Summary

| Section | PlanMain.txt | Image Analysis | Status |
|---------|--------------|-----------------|--------|
| Stats | ✅ Documented | ✅ 4 cards visible | **Match** |
| Weekly Activity | ✅ Documented | ✅ Bar chart visible | **Match** |
| Weekly Goal | ✅ Documented | ✅ 12/15 hrs shown | **Match** |
| Monthly Consistency | ✅ Documented | ✅ Heatmap visible | **Match** |
| Milestones | ✅ Documented | ✅ 2 items shown | **Match** |
| Enrolled Courses | ✅ Documented | ✅ 3 courses visible | **Match** |
| Recently Completed | ✅ Documented | ✅ 3 courses shown | **Match** |

---

## 🎬 Next Steps

Phase 2: Define API Contract (Pydantic schemas)
