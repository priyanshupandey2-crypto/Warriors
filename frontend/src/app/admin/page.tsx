"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const adminStats = [
  { label: "Total Courses", value: "124", trend: "+4 this month", trendIcon: "trending_up", trendColor: "text-tertiary" },
  { label: "Avg. Completion", value: "68.4%", trend: "+2.1% improvement", trendIcon: "trending_up", trendColor: "text-tertiary" },
  { label: "Total Enrollments", value: "42.1k", trend: "Across all categories", trendIcon: "", trendColor: "text-on-surface-variant" },
  { label: "Avg. Rating", value: "4.8", trend: "System high", trendIcon: "star", trendColor: "text-on-surface-variant" },
];

const courses = [
  { title: "Modern Web Development", lead: "Sarah Jenkins", id: "#WD-2024-001", cat: "Engineering", catColor: "bg-primary-fixed/20 text-primary", enrollments: "1,402", completion: 82, rating: "4.9", iconBg: "bg-primary-fixed", icon: "data_object", iconColor: "text-primary", barColor: "bg-primary" },
  { title: "UX/UI Fundamentals", lead: "David Chen", id: "#DS-2024-004", cat: "Design", catColor: "bg-secondary-fixed/30 text-secondary", enrollments: "0", completion: 0, rating: "N/A", iconBg: "bg-secondary-fixed", icon: "palette", iconColor: "text-secondary", barColor: "bg-secondary" },
  { title: "Intro to Machine Learning", lead: "Dr. Aris Thorne", id: "#AI-2024-009", cat: "AI & Data", catColor: "bg-tertiary-fixed/30 text-tertiary", enrollments: "45", completion: 54, rating: "4.7", iconBg: "bg-tertiary-fixed", icon: "psychology", iconColor: "text-tertiary", barColor: "bg-tertiary-container" },
  { title: "Business Strategy 101", lead: "Marcus Aurelio", id: "#BS-2023-112", cat: "Management", catColor: "bg-primary-fixed/20 text-primary", enrollments: "3,291", completion: 94, rating: "4.8", iconBg: "bg-primary-fixed", icon: "finance", iconColor: "text-primary", barColor: "bg-primary" },
];

const sidebarLinks = [
  { label: "Course Manager", icon: "auto_stories", href: "/admin", active: true },
  { label: "Review Queue", icon: "rate_review", href: "/admin/reviews", active: false },
];

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredCourses = courses.filter(
    (c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Side Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest shadow-sm flex flex-col py-6 px-4 z-50">
        <div className="mb-8 px-2">
          <Link href="/" className="text-2xl font-semibold font-bold text-primary">AuraLearn</Link>
          <p className="text-xs font-semibold text-outline uppercase tracking-wider">Admin Console</p>
        </div>
        <nav className="flex-1 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all text-sm font-medium ${
                link.active
                  ? "text-primary font-bold border-r-4 border-primary bg-primary-fixed/10"
                  : "text-on-surface-variant hover:bg-surface-container group"
              }`}
            >
              <span
                className={`material-symbols-outlined ${link.active ? "" : "text-outline group-hover:text-primary"}`}
                style={link.active ? { fontVariationSettings: '"FILL" 1' } : {}}
              >
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-outline-variant">
          <Link
            href="/generate"
            className="w-full bg-primary text-on-primary text-sm font-medium py-4 px-6 rounded-lg mb-6 hover:brightness-110 active:scale-95 transition-all block text-center"
          >
            New Course
          </Link>
          <div className="space-y-1">
            <a className="flex items-center gap-4 p-4 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors group text-sm font-medium" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary">help</span>
              <span>Support</span>
            </a>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="flex items-center gap-4 p-4 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors group w-full text-sm font-medium"
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="ml-64 min-h-screen">
        {/* Top Nav Bar */}
        <header className="fixed top-0 right-0 left-64 h-16 bg-surface border-b border-outline-variant/30 flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-6">
            <div className="relative w-96">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full bg-surface-container-low border-none rounded-full pl-12 pr-4 py-2 focus:ring-2 focus:ring-primary text-base outline-none"
                placeholder="Search courses, IDs, or instructors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
            <div className="flex items-center gap-4 ml-4 border-l border-outline-variant pl-6">
              <div className="text-right">
                <p className="text-sm font-bold text-on-surface">{user?.name || "Admin"}</p>
                <p className="text-xs text-on-surface-variant">Platform Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold border-2 border-primary-container">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 px-6 pb-12 max-w-[1280px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-on-surface mb-1">Course Manager</h2>
              <p className="text-base text-on-surface-variant">Organize, track, and manage all learning content across the platform.</p>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant text-on-surface-variant text-sm font-medium px-6 py-4 rounded-lg hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                Filters
              </button>
              <Link
                href="/generate"
                className="flex items-center gap-2 bg-primary text-on-primary text-sm font-medium px-6 py-4 rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Create New Course
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {adminStats.map((stat) => (
              <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow border border-surface-variant/50">
                <p className="text-xs font-semibold text-on-surface-variant uppercase mb-1">{stat.label}</p>
                <h3 className="text-[32px] font-bold text-primary">{stat.value}</h3>
                <div className={`flex items-center gap-1 mt-2 ${stat.trendColor}`}>
                  {stat.trendIcon && (
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={stat.trendIcon === "star" ? { fontVariationSettings: '"FILL" 1' } : {}}
                    >
                      {stat.trendIcon}
                    </span>
                  )}
                  <span className="text-xs font-semibold">{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Course Table */}
          <div className="bg-surface-container-lowest rounded-xl ambient-shadow border border-surface-variant/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant/30">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Course Title</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase text-center">Enrollments</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Completion Rate</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Avg. Rating</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredCourses.map((course, i) => (
                    <tr key={course.id} className={`row-hover ${i % 2 === 1 ? "bg-surface-container-low/20" : ""}`}>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg ${course.iconBg} flex items-center justify-center`}>
                            <span className={`material-symbols-outlined ${course.iconColor}`}>{course.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-on-surface">{course.title}</p>
                            <p className="text-xs text-outline">Lead: {course.lead}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm font-medium text-outline">{course.id}</td>
                      <td className="px-6 py-6">
                        <span className={`${course.catColor} px-2 py-1 rounded text-xs font-semibold`}>{course.cat}</span>
                      </td>
                      <td className="px-6 py-6 text-center text-sm font-medium text-on-surface">{course.enrollments}</td>
                      <td className="px-6 py-6">
                        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-1">
                          <div className={`${course.barColor} h-full`} style={{ width: `${course.completion}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-on-surface">{course.completion}%</span>
                      </td>
                      <td className="px-6 py-6">
                        {course.rating === "N/A" ? (
                          <span className="text-sm font-medium text-outline">N/A</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span
                              className="material-symbols-outlined text-tertiary text-[18px]"
                              style={{ fontVariationSettings: '"FILL" 1' }}
                            >
                              star
                            </span>
                            <span className="text-sm font-medium text-on-surface">{course.rating}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed/20 rounded transition-all">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded transition-all">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="px-6 py-4 bg-surface-container border-t border-outline-variant/30 flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">Showing 1-{filteredCourses.length} of {courses.length} courses</p>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary text-xs font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors text-xs">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Optimization Tip */}
          <div className="mt-12 bg-primary-fixed/5 border border-primary/10 p-8 rounded-2xl flex items-center gap-6">
            <div className="bg-primary-container p-4 rounded-full text-on-primary-container flex-shrink-0">
              <span className="material-symbols-outlined text-[32px]">tips_and_updates</span>
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-semibold text-primary mb-1">Optimization Tip</h4>
              <p className="text-base text-on-surface-variant max-w-2xl">
                Courses with completion rates under 60% are highlighted in your dashboard. Consider reviewing the
                assessment difficulty for &quot;UX/UI Fundamentals&quot; to improve student outcomes.
              </p>
            </div>
            <button className="ml-auto text-primary font-bold text-sm underline hover:text-on-primary-fixed-variant transition-colors flex-shrink-0">
              Run Analysis
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
