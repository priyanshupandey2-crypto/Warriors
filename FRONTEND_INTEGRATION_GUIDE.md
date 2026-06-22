# Frontend Integration Guide - Dashboard API

**Status**: ✅ Backend MVP Ready  
**Date**: 2026-06-22  
**Endpoint**: `http://localhost:8000/api/v1/dashboard`

---

## 🚀 Quick Start

### 1. Verify Backend is Running

```bash
# You should see the dashboard JSON
curl http://localhost:8000/api/v1/dashboard
```

Or visit in browser: `http://localhost:8000/api/v1/dashboard`

### 2. Interactive API Docs

Open in browser: `http://localhost:8000/docs`

This shows:
- Complete API specification
- Response schema documentation
- Try-it-out button (no Postman needed)

---

## 📡 API Endpoint

### URL
```
GET http://localhost:8000/api/v1/dashboard
```

### No Input Required
This is a simple GET request with no parameters or request body.

### Response
Complete JSON with 7 dashboard sections (see below).

---

## 📋 Response Structure

```json
{
  "stats": { ... },
  "weekly_activity": { ... },
  "weekly_goal": { ... },
  "monthly_consistency": { ... },
  "milestones": { ... },
  "enrolled_courses": { ... },
  "recently_completed": { ... }
}
```

---

## 🔌 Integration Examples

### React with Fetch API

```jsx
import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/dashboard')
      .then(response => {
        if (!response.ok) throw new Error('Network error');
        return response.json();
      })
      .then(dashboardData => {
        setData(dashboardData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard">
      {/* Stats Section */}
      <div className="stats">
        <div className="stat-card">
          <h3>{data.stats.enrolled_courses}</h3>
          <p>Enrolled Courses</p>
        </div>
        <div className="stat-card">
          <h3>{data.stats.completed_courses}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{data.stats.learning_hours}</h3>
          <p>Learning Hours</p>
        </div>
        <div className="stat-card">
          <h3>{data.stats.streak_days}</h3>
          <p>Streak Days</p>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="weekly-activity">
        <h2>Weekly Activity</h2>
        {/* Use Chart library (e.g., Chart.js, D3, Recharts) */}
        {/* data.weekly_activity.week_data contains 7 days */}
      </div>

      {/* Weekly Goal */}
      <div className="weekly-goal">
        <h2>Weekly Goal</h2>
        <p>{data.weekly_goal.completed_hours} / {data.weekly_goal.target_hours} hours</p>
        <div className="progress-bar">
          <div style={{ width: `${data.weekly_goal.percentage}%` }}></div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="courses">
        <h2>Enrolled Courses</h2>
        {data.enrolled_courses.courses_list.map(course => (
          <div key={course.id} className="course-card">
            <img src={course.thumbnail_url} alt={course.title} />
            <h3>{course.title}</h3>
            <p>{course.difficulty}</p>
            <p>{course.current_module}</p>
            <div className="progress">
              {course.progress_percentage}% complete
            </div>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="milestones">
        <h2>Upcoming Milestones</h2>
        {data.milestones.milestones_list.map(milestone => (
          <div key={milestone.id} className="milestone">
            <h4>{milestone.title}</h4>
            <p>Due: {milestone.due_date}</p>
          </div>
        ))}
      </div>

      {/* Recently Completed */}
      <div className="completed">
        <h2>Recently Completed</h2>
        {data.recently_completed.completed_list.map(course => (
          <div key={course.id} className="completed-badge">
            <span>{course.course_name}</span>
            {course.certificate_earned && <span className="badge">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
```

### React with Axios

```jsx
import axios from 'axios';

useEffect(() => {
  axios.get('http://localhost:8000/api/v1/dashboard')
    .then(response => setData(response.data))
    .catch(error => console.error('Error:', error));
}, []);
```

### React with TanStack Query

```jsx
import { useQuery } from '@tanstack/react-query';

function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('http://localhost:8000/api/v1/dashboard').then(r => r.json())
  });

  // ... rest of component
}
```

---

## 📊 Data Section Details

### Stats (4 cards at top)
```javascript
data.stats = {
  enrolled_courses: 12,      // Total courses enrolled
  completed_courses: 4,      // Completed courses
  learning_hours: 84.5,      // Total learning hours
  streak_days: 7             // Current streak
}
```

### Weekly Activity (Bar chart)
```javascript
data.weekly_activity.week_data = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 60 },
  { day: "Wed", minutes: 10 },
  // ... Sunday
]
```

**For Chart.js:**
```javascript
const chartData = {
  labels: data.weekly_activity.week_data.map(d => d.day),
  datasets: [{
    label: 'Minutes Studied',
    data: data.weekly_activity.week_data.map(d => d.minutes)
  }]
};
```

### Weekly Goal (Circular progress)
```javascript
data.weekly_goal = {
  completed_hours: 12.0,     // Hours studied this week
  target_hours: 15.0,        // Weekly target
  percentage: 80             // 0-100
}
```

**For Progress Circle:**
```jsx
<CircularProgress 
  value={data.weekly_goal.percentage}
  text={`${data.weekly_goal.completed_hours}/${data.weekly_goal.target_hours}`}
/>
```

### Monthly Consistency (Heatmap)
```javascript
data.monthly_consistency.consistency_data = [
  { date: "2026-06-01", minutes: 0 },
  { date: "2026-06-02", minutes: 120 },
  // ... all days of month
]
```

**For Heatmap:**
- Intensity based on `minutes` value
- Light blue (0) to dark blue (high)

### Milestones (Deadline list)
```javascript
data.milestones.milestones_list = [
  {
    id: 1,
    title: "UX Design Sprint",
    due_date: "2026-06-25",
    status: "pending"
  }
]
```

### Enrolled Courses (Course cards)
```javascript
data.enrolled_courses.courses_list = [
  {
    id: 1,
    title: "Mastering UX Psychology",
    difficulty: "Advanced",
    thumbnail_url: "https://...",
    current_module: "Module 4: Cognitive Biases",
    progress_percentage: 65,
    completed_lessons: 12,
    total_lessons: 18,
    status: "in_progress"
  }
]
```

### Recently Completed (Certificate badges)
```javascript
data.recently_completed.completed_list = [
  {
    id: 1,
    course_name: "AI Foundations",
    certificate_earned: true,
    completion_date: "2026-06-20"
  }
]
```

---

## 📈 Recommended Chart Libraries

For visualizing dashboard data:

### Weekly Activity (Bar Chart)
- **Chart.js** - Simple, lightweight
- **Recharts** - React-native
- **D3.js** - Advanced, complex

```bash
npm install chart.js react-chartjs-2
# or
npm install recharts
```

### Monthly Consistency (Heatmap)
- **react-calendar-heatmap** - Purpose-built
- **Plotly.js** - Full-featured
- **Custom CSS Grid** - Simple DIY

```bash
npm install react-calendar-heatmap
```

### Progress Indicators
- **react-circular-progressbar** - Circular progress
- **react-progress-bar** - Linear progress
- **Native CSS** - No dependencies

---

## 🧪 Testing

### 1. Test in Browser
```
http://localhost:8000/api/v1/dashboard
```
Should display full JSON response.

### 2. Test with cURL
```bash
curl http://localhost:8000/api/v1/dashboard | jq .
```

### 3. Test with Swagger UI
```
http://localhost:8000/docs
```
Click "Try it out" → "Execute" button.

---

## ⚙️ Environment Configuration

### Development
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### Production (Future)
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL;
```

Update `.env`:
```
REACT_APP_API_URL=https://api.production.com
```

---

## 🔄 CORS Configuration

Currently, backend allows all origins (`*`). For production:

```python
# In backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

---

## 🚨 Error Handling

```javascript
fetch('http://localhost:8000/api/v1/dashboard')
  .then(response => {
    if (response.status === 500) {
      throw new Error('Server error - mock data file not found');
    }
    return response.json();
  })
  .catch(error => {
    console.error('Dashboard loading failed:', error);
    // Show error state in UI
  });
```

---

## 📝 TypeScript Types (Optional)

```typescript
interface Stats {
  enrolled_courses: number;
  completed_courses: number;
  learning_hours: number;
  streak_days: number;
}

interface DayActivity {
  day: string;
  minutes: number;
}

interface WeeklyGoal {
  completed_hours: number;
  target_hours: number;
  percentage: number;
}

interface DashboardData {
  stats: Stats;
  weekly_activity: { week_data: DayActivity[] };
  weekly_goal: WeeklyGoal;
  // ... etc
}
```

---

## 🆘 Troubleshooting

### "Cannot GET /api/v1/dashboard"
- Backend is not running
- URL is wrong
- Port is not 8000

**Fix**: Start backend with `python main.py` in backend directory

### CORS Error
- Frontend and backend not on same origin
- CORS not configured in backend

**Fix**: Backend already has `allow_origins=["*"]`

### Blank Response or Null Data
- Backend returned error (500)
- JSON parsing failed

**Fix**: Check browser console and backend logs

---

## 📚 Additional Resources

- **API Docs**: `http://localhost:8000/docs`
- **Backend Code**: `backend/context.md`
- **Implementation Tracker**: `IMPLEMENTATION_TRACKER.md`
- **Requirements**: `dashboard_requirements.md`

---

## ✅ Checklist Before Going Live

- [ ] Backend is running on `localhost:8000`
- [ ] `/api/v1/dashboard` returns data
- [ ] `/docs` shows Swagger UI
- [ ] Frontend fetches and displays all sections
- [ ] Charts render correctly
- [ ] Progress bars update
- [ ] Course cards display properly
- [ ] Milestone dates format correctly
- [ ] Responsive design works on mobile
- [ ] Error handling is implemented

---

## 🎯 Next Steps

1. **Integrate endpoint in React** - Use examples above
2. **Style dashboard components** - Use existing design system
3. **Add data refresh** - Implement polling or WebSocket later
4. **Test with mock data** - Verify all sections render
5. **Prepare for authentication** - Plan user_id routing

---

**Ready to integrate? Copy the code snippets and start building!**

For questions, see `backend/context.md` or check Swagger UI at `/docs`
