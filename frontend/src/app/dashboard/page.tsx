"use client";
import { useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const stats = [
  { label: "Enrolled", value: "12 Courses", icon: "school", bg: "bg-primary-container/10", iconColor: "text-primary" },
  { label: "Completed", value: "4 Courses", icon: "check_circle", bg: "bg-tertiary-container/10", iconColor: "text-tertiary" },
  { label: "Learning Hours", value: "84.5 hrs", icon: "schedule", bg: "bg-secondary-container/10", iconColor: "text-secondary" },
  { label: "Streak", value: "7 Days", icon: "local_fire_department", bg: "bg-error-container/20", iconColor: "text-error" },
];

const weeklyData = [
  { day: "Mon", mins: 45, pct: 40 },
  { day: "Tue", mins: 72, pct: 65 },
  { day: "Wed", mins: 110, pct: 90 },
  { day: "Thu", mins: 32, pct: 30 },
  { day: "Fri", mins: 55, pct: 50 },
  { day: "Sat", mins: 18, pct: 20 },
  { day: "Sun", mins: 5, pct: 10 },
];

const enrolledCourses = [
  { title: "Mastering UX Psychology", module: "Module 4: Cognitive Biases", progress: 65, lessons: "12/18", level: "Advanced", levelColor: "bg-primary-container/10 text-primary", barColor: "bg-primary", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9qNGZbFT3550PGcEtRKuUepXYq6K78j5FkNHDKqOwp2yvCRlAbCLBk27Zn_C_uw7yUABnZiKwz2bDAELrHzd7b7gKCtZQGZB1RP7Vu1T-Snm-AGKCSjRtG7g6MCcTQkMxgQONLRhhmEw3cFfV8ium-2QAJ2epsAXX0U0BfCDDdyuBpLvm_thCzUNqAFLU_t8H6KFjT4-0KXRoBfK2HqUvRRxgtf0mfE5K_r98R5Z7nAaVvYPb7wIKBRdpeU9HzkEbl9XxPdFsdLSL" },
  { title: "Python for Data Science", module: "Module 2: Pandas & NumPy", progress: 32, lessons: "4/12", level: "Intermediate", levelColor: "bg-secondary-container/10 text-secondary", barColor: "bg-secondary", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWt8pqLg2BPwdQTWwjmwfvoP6pl8GgheIcFs1XrlZ2eeLiEzID0gp4PYgYsc-JNJaVifOCLczlDBqzD-NeLw5Soggxdm15GHkScRpaY-7QFfnp-0YrK7qRLYzuVrBz8SfeRghGEHQ3taf51O03FaSI73Suj8hQF3_TF2fv0oIIjnukZ9-hXVMom0WK2XhZEfZRvTM1w5p8JPvwvOzYpVD6MYLXZsvjFf3pi2Nu-74jZD2sAamMpNXktPFY66oZiR6udorModdh0VCf" },
  { title: "Digital Brand Identity", module: "Module 6: Color Theory", progress: 88, lessons: "15/17", level: "Beginner", levelColor: "bg-tertiary-container/10 text-tertiary", barColor: "bg-tertiary", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmEH0pmSlaXgIZ_67QQJBn4OCaEpUiktap3BR2nD5sb8K5vmGrxvN9nFZfsHDwa6QHO6vocUGiV66ZTqHHmTvqx8OKwcKP-Ik6kbhU38I90Om_zLEC0twb3QCF13HJRyiP3vN5k7TUDCGbnDtJRXmTXhhTstSkd_Q8nuvwSVf8yOQlh3NUaVk0rXhTWkFRz3tonevm6sqOC0zytz07CRFLaitEq9BYHiD5sUWEU4fT6FzBCQOapEmZQgOv-A4-dnXgGV--LKO72wBC" },
];

const completedCourses = [
  { title: "AI Foundations" },
  { title: "Modern Typography" },
  { title: "Public Speaking 101" },
];

const milestones = [
  { title: "UX Design Sprint", due: "Due in 2 days", icon: "auto_awesome", color: "border-secondary", iconBg: "bg-secondary/10 text-secondary" },
  { title: "Python Basics Final", due: "Due tomorrow", icon: "quiz", color: "border-tertiary", iconBg: "bg-tertiary/10 text-tertiary" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.name || "Alex Chen";

  const heatmapCells = useMemo(() => {
    const colors = ["bg-surface-container", "bg-primary-container/30", "bg-primary-container/60", "bg-primary"];
    return Array.from({ length: 28 }, (_, i) => colors[Math.floor(Math.random() * 4)] + `-${i}`);
  }, []);

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
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-on-surface">Weekly Activity</h2>
                <select className="text-sm border-outline-variant rounded-lg bg-surface focus:ring-primary focus:border-primary">
                  <option>This Week</option>
                  <option>Last Week</option>
                </select>
              </div>
              <div className="h-64 flex items-end justify-between gap-2 px-4">
                {weeklyData.map((d, i) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                      className={`w-full rounded-t-lg transition-all relative ${
                        i === 2 ? "bg-primary" : "bg-primary-container/20 group-hover:bg-primary-container"
                      }`}
                      style={{ height: `${d.pct}%` }}
                    >
                      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-on-background text-white text-xs py-1 px-2 rounded transition-opacity ${
                        i === 2 ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}>
                        {d.mins}m
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${i === 2 ? "text-primary font-bold" : "text-outline"}`}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Consistency Heatmap */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-on-surface">Monthly Consistency</h2>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-outline">Less</span>
                  <div className="flex gap-[2px]">
                    <div className="w-3 h-3 bg-surface-container rounded-sm" />
                    <div className="w-3 h-3 bg-primary-container/30 rounded-sm" />
                    <div className="w-3 h-3 bg-primary-container/60 rounded-sm" />
                    <div className="w-3 h-3 bg-primary rounded-sm" />
                  </div>
                  <span className="text-xs font-semibold text-outline">More</span>
                </div>
              </div>
              <div className="grid grid-cols-7 md:grid-cols-14 gap-2">
                {heatmapCells.map((c) => {
                  const color = c.substring(0, c.lastIndexOf("-"));
                  return (
                    <div
                      key={c}
                      className={`heatmap-cell ${color} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Weekly Goal */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container text-center relative overflow-hidden">
              <h2 className="text-2xl font-semibold text-on-surface mb-8 relative z-10">Weekly Goal</h2>
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-surface-container" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="8" />
                  <circle className="text-primary transition-all duration-1000" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeDasharray="282.7" strokeDashoffset="56.5" strokeWidth="8" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-primary leading-none">12</span>
                  <span className="text-sm text-outline">/ 15 hours</span>
                </div>
              </div>
              <p className="text-base text-on-surface-variant relative z-10">80% of your target reached! Just 3 more hours to go.</p>
              <Link href="/courses" className="mt-8 w-full bg-primary text-on-primary py-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all active:scale-[0.98] block text-center">
                Boost Your Momentum
              </Link>
            </div>

            {/* Upcoming Milestones */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container">
              <h2 className="text-2xl font-semibold text-on-surface mb-4">Upcoming Milestones</h2>
              <div className="space-y-4">
                {milestones.map((m) => (
                  <div key={m.title} className={`flex gap-4 p-2 hover:bg-surface-container-low rounded-lg transition-colors border-l-4 ${m.color}`}>
                    <div className={`flex-shrink-0 ${m.iconBg} p-2 rounded`}>
                      <span className="material-symbols-outlined">{m.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{m.title}</p>
                      <p className="text-xs text-outline">{m.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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
            {enrolledCourses.map((course) => (
              <Link href="/course/1" key={course.title} className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover" src={course.img} alt={course.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="bg-white text-on-background px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined">play_arrow</span> Resume
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-on-surface">{course.title}</h3>
                    <span className={`${course.levelColor} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}>{course.level}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">{course.module}</p>
                  <div className="w-full bg-surface-container h-2 rounded-full mb-1 overflow-hidden">
                    <div className={`${course.barColor} h-full rounded-full`} style={{ width: `${course.progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-outline">
                    <span>{course.progress}% Complete</span>
                    <span>{course.lessons} Lessons</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recently Completed */}
        <section className="mt-12">
          <h2 className="text-3xl font-semibold text-on-background mb-6">Recently Completed</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {completedCourses.map((c) => (
              <div key={c.title} className="flex-shrink-0 w-64 bg-surface-container-low p-4 rounded-xl border border-surface-container flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary border border-outline-variant">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface truncate w-40">{c.title}</p>
                  <span className="text-[10px] text-primary font-bold bg-primary-container/10 px-2 py-0.5 rounded">CERTIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
