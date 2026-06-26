"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useApiCall } from "@/hooks/useApiCall";

interface EnrolledCourse {
  id: number;
  course_id: number;
  course_title: string;
  status: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  enrolled_at: string;
  last_accessed_at: string;
  thumbnail_url?: string;
}

// Default fallback data (last 7 days format)
const getDefaultWeeklyData = () => {
  const today = new Date();
  const days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      day: dayNames[date.getDay()],
      mins: 0,
      pct: 0,
    });
  }
  return days;
};

const levelConfig = {
  Beginner: { color: "bg-tertiary-container/10 text-tertiary", barColor: "bg-tertiary" },
  Intermediate: { color: "bg-secondary-container/10 text-secondary", barColor: "bg-secondary" },
  Advanced: { color: "bg-primary-container/10 text-primary", barColor: "bg-primary" },
};


export default function DashboardPage() {
  const { user } = useAuth();
  const apiCall = useApiCall();
  const userName = user?.name || "Alex Chen";

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [learningHours, setLearningHours] = useState(0);
  const [streak, setStreak] = useState(0);
  const [upcomingSections, setUpcomingSections] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: "Enrolled", value: "0 Courses", icon: "school", bg: "bg-primary-container/10", iconColor: "text-primary" },
    { label: "Completed", value: "0 Courses", icon: "check_circle", bg: "bg-tertiary-container/10", iconColor: "text-tertiary" },
    { label: "Learning Hours", value: "0 hrs", icon: "schedule", bg: "bg-secondary-container/10", iconColor: "text-secondary" },
    { label: "Streak", value: "0 Days", icon: "local_fire_department", bg: "bg-error-container/20", iconColor: "text-error" },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [courseResponse, activityResponse, hoursResponse, streakResponse, upcomingResponse] = await Promise.all([
          apiCall<any>("/api/progress/my-courses"),
          apiCall<any>("/api/progress/activity/last-7-days"),
          apiCall<any>("/api/progress/total-learning-hours"),
          apiCall<any>("/api/progress/streak"),
          apiCall<any>("/api/progress/upcoming-sections"),
        ]);

        if (courseResponse) {
          const learningHrsValue = hoursResponse?.total_hours || 0;
          const streakValue = streakResponse?.streak || 0;
          setLearningHours(learningHrsValue);
          setStreak(streakValue);
          setStats([
            { label: "Enrolled", value: `${courseResponse.enrolled_count} Courses`, icon: "school", bg: "bg-primary-container/10", iconColor: "text-primary" },
            { label: "Completed", value: `${courseResponse.completed_count} Courses`, icon: "check_circle", bg: "bg-tertiary-container/10", iconColor: "text-tertiary" },
            { label: "Learning Hours", value: `${learningHrsValue} hrs`, icon: "schedule", bg: "bg-secondary-container/10", iconColor: "text-secondary" },
            { label: "Streak", value: `${streakValue} ${streakValue === 1 ? "Day" : "Days"}`, icon: "local_fire_department", bg: "bg-error-container/20", iconColor: "text-error" },
          ]);

          const inProgress = courseResponse.courses.filter((c: EnrolledCourse) => c.status === "IN_PROGRESS" || c.status === "ENROLLED");
          const completed = courseResponse.courses.filter((c: EnrolledCourse) => c.status === "COMPLETED");

          setEnrolledCourses(inProgress);
          setCompletedCourses(completed);
        }

        if (activityResponse) {
          setActivityData(activityResponse);
        }

        if (upcomingResponse) {
          setUpcomingSections(upcomingResponse);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [apiCall]);


  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 max-w-[1280px] mx-auto">
        {/* Welcome */}
        <section className="mb-8">
          <h1 className="text-3xl font-semibold text-on-background">Hello, {userName}</h1>
          <p className="text-base text-on-surface-variant mt-1">You&apos;re making great progress! Your next lesson is ready.</p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex items-center gap-4 border border-surface-container">
              <div className={`${s.bg} p-4 rounded-lg`}>
                <span className={`material-symbols-outlined ${s.iconColor} text-[32px]`}>{s.icon}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-outline uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-on-surface">{s.value}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Activity */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-on-surface">Last 7 Days Activity</h2>
              </div>
              <div className="w-full h-64">
                <svg viewBox="0 -5 900 220" className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid lines and Y-axis labels */}
                  {[0, 25, 50, 75, 100].map((pct) => {
                    const mins = (pct / 100) * 240;
                    return (
                      <g key={`grid-${pct}`}>
                        <line
                          x1="50"
                          y1={200 - (pct * 2)}
                          x2="850"
                          y2={200 - (pct * 2)}
                          stroke="currentColor"
                          strokeWidth="1"
                          opacity="0.1"
                          className="text-on-surface"
                        />
                        <text
                          x="40"
                          y={200 - (pct * 2) + 4}
                          textAnchor="end"
                          className="text-xs font-semibold fill-on-surface-variant"
                          fontSize="12"
                        >
                          {Math.round(mins)}m
                        </text>
                      </g>
                    );
                  })}

                  {/* Line chart */}
                  <polyline
                    points={(() => {
                      const data = activityData.length > 0 ? activityData : getDefaultWeeklyData();
                      return data
                        .map((d, i) => {
                          const x = 50 + (i / (data.length - 1)) * 800;
                          const y = 200 - (d.pct * 2);
                          return `${x},${y}`;
                        })
                        .join(" ");
                    })()}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary"
                  />

                  {/* Data points */}
                  {(() => {
                    const data = activityData.length > 0 ? activityData : getDefaultWeeklyData();
                    return data.map((d, i) => {
                      const x = 50 + (i / (data.length - 1)) * 800;
                      const y = 200 - (d.pct * 2);
                      const isToday = i === data.length - 1;
                      return (
                        <g key={`point-${i}`}>
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            className={`${isToday ? "text-primary" : "text-primary-container"}`}
                            fill="currentColor"
                          />
                          {/* Tooltip on hover */}
                          <g className="opacity-0 hover:opacity-100 transition-opacity">
                            <rect
                              x={x - 20}
                              y={y - 35}
                              width="40"
                              height="24"
                              rx="4"
                              className="fill-on-background"
                            />
                            <text
                              x={x}
                              y={y - 15}
                              textAnchor="middle"
                              className="fill-background text-xs font-semibold"
                              fontSize="12"
                            >
                              {d.mins}m
                            </text>
                          </g>
                        </g>
                      );
                    });
                  })()}

                  {/* X-axis labels */}
                  {(() => {
                    const data = activityData.length > 0 ? activityData : getDefaultWeeklyData();
                    return data.map((d, i) => {
                      const x = 50 + (i / (data.length - 1)) * 800;
                      const isToday = i === data.length - 1;
                      return (
                        <text
                          key={`label-${i}`}
                          x={x}
                          y="215"
                          textAnchor="middle"
                          className={`text-xs font-semibold ${isToday ? "fill-primary" : "fill-on-surface-variant"}`}
                          fontSize="12"
                        >
                          {d.day}
                        </text>
                      );
                    });
                  })()}
                </svg>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-8">

            {/* Upcoming Milestones */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container">
              <h2 className="text-2xl font-semibold text-on-surface mb-4">Upcoming Milestones</h2>
              <div className="space-y-4">
                {upcomingSections.length > 0 ? (
                  upcomingSections.map((section, idx) => {
                    const colorMap = {
                      lesson: { color: "border-secondary", iconBg: "bg-secondary/10 text-secondary" },
                      quiz: { color: "border-tertiary", iconBg: "bg-tertiary/10 text-tertiary" },
                    };
                    const colors = colorMap[section.type as keyof typeof colorMap] || colorMap.lesson;
                    return (
                      <div key={`${section.type}-${section.id}`} className={`flex gap-4 p-2 hover:bg-surface-container-low rounded-lg transition-colors border-l-4 ${colors.color}`}>
                        <div className={`flex-shrink-0 ${colors.iconBg} p-2 rounded`}>
                          <span className="material-symbols-outlined">{section.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{section.title}</p>
                          <p className="text-xs text-on-surface-variant">{section.courseName}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-on-surface-variant">No pending sections</p>
                    <p className="text-xs text-outline mt-2">You&apos;re all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="mt-12 mb-12">
          <h2 className="text-xl font-semibold text-on-background mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/generate" className="bg-gradient-to-br from-primary-container to-primary/20 border border-primary/30 rounded-xl p-6 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">auto_awesome</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Generate New Course</h3>
              <p className="text-sm text-on-surface-variant">Create a new course using our AI-powered generator</p>
            </Link>

            <Link href="/my-courses" className="bg-gradient-to-br from-secondary-container to-secondary/20 border border-secondary/30 rounded-xl p-6 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <span className="material-symbols-outlined text-4xl text-secondary group-hover:scale-110 transition-transform">rate_review</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">My Course Generations</h3>
              <p className="text-sm text-on-surface-variant">Review, edit, and submit your generated courses</p>
            </Link>

            <Link href="/courses" className="bg-gradient-to-br from-tertiary-container to-tertiary/20 border border-tertiary/30 rounded-xl p-6 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <span className="material-symbols-outlined text-4xl text-tertiary group-hover:scale-110 transition-transform">explore</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Browse All Courses</h3>
              <p className="text-sm text-on-surface-variant">Explore published courses available on the platform</p>
            </Link>
          </div>
        </section>

        {/* Enrolled Courses */}
        <section className="mt-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-semibold text-on-background">Enrolled Courses</h2>
              <p className="text-base text-on-surface-variant">Continue where you left off</p>
            </div>
            <Link href="/courses" className="text-primary text-sm font-medium hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => {
                const level = course.progress_percentage >= 75 ? "Advanced" : course.progress_percentage >= 50 ? "Intermediate" : "Beginner";
                const config = levelConfig[level as keyof typeof levelConfig];
                return (
                  <Link href={`/course/${course.course_id}`} key={course.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative h-48 bg-gradient-to-br from-primary-container/30 to-secondary-container/30 flex items-center justify-center overflow-hidden">
                      {course.thumbnail_url ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className="w-full h-full object-cover" src={course.thumbnail_url} alt={course.course_title} onError={(e) => console.log("Image failed to load:", course.thumbnail_url)} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <span className="bg-white text-on-background px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined">play_arrow</span> Resume
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <span className="material-symbols-outlined text-[80px] text-primary/30">school</span>
                          <p className="text-xs text-outline mt-2">No image</p>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-on-surface">{course.course_title}</h3>
                        <span className={`${config.color} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}>{level}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4">
                        {course.completed_lessons}/{course.total_lessons} sections completed
                      </p>
                      <div className="w-full bg-surface-container h-2 rounded-full mb-1 overflow-hidden">
                        <div className={`${config.barColor} h-full rounded-full`} style={{ width: `${course.progress_percentage}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-outline">
                        <span>{course.progress_percentage}% Complete</span>
                        <span>{course.completed_lessons}/{course.total_lessons} Sections</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-on-surface-variant">No courses in progress. Start learning today!</p>
                <Link href="/courses" className="text-primary text-sm font-medium hover:underline mt-4 inline-block">Browse Courses</Link>
              </div>
            )}
          </div>
        </section>

        {/* Recently Completed */}
        {completedCourses.length > 0 && (
          <section className="mt-12">
            <h2 className="text-3xl font-semibold text-on-background mb-6">Recently Completed</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {completedCourses.map((c) => (
                <div key={c.id} className="flex-shrink-0 w-64 bg-surface-container-low p-4 rounded-xl border border-surface-container flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary border border-outline-variant">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface truncate w-40">{c.course_title}</p>
                    <span className="text-[10px] text-primary font-bold bg-primary-container/10 px-2 py-0.5 rounded">CERTIFIED</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
