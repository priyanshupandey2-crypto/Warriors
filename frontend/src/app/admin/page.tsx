"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useApiCall } from "@/hooks/useApiCall";

interface Course {
  id: number;
  title: string;
  category: string;
  difficulty_level: string;
  enrollments: number;
  completion: number;
  thumbnail_url?: string;
}

const sidebarLinks = [
  { label: "Course Manager", icon: "auto_stories", href: "/admin", active: true },
  { label: "Review Queue", icon: "rate_review", href: "/admin/reviews", active: false },
];

const getCategoryColor = (category: string | null) => {
  const categoryMap: Record<string, { catColor: string; icon: string; iconBg: string; iconColor: string; barColor: string }> = {
    "Computer Science": { catColor: "bg-primary-fixed/20 text-primary", icon: "data_object", iconBg: "bg-primary-fixed", iconColor: "text-primary", barColor: "bg-primary" },
    "Design": { catColor: "bg-secondary-fixed/30 text-secondary", icon: "palette", iconBg: "bg-secondary-fixed", iconColor: "text-secondary", barColor: "bg-secondary" },
    "Business & Strategy": { catColor: "bg-primary-fixed/20 text-primary", icon: "finance", iconBg: "bg-primary-fixed", iconColor: "text-primary", barColor: "bg-primary" },
    "Creative Design": { catColor: "bg-secondary-fixed/30 text-secondary", icon: "palette", iconBg: "bg-secondary-fixed", iconColor: "text-secondary", barColor: "bg-secondary" },
    "Marketing": { catColor: "bg-tertiary-fixed/30 text-tertiary", icon: "trending_up", iconBg: "bg-tertiary-fixed", iconColor: "text-tertiary", barColor: "bg-tertiary-container" },
  };
  return categoryMap[category || ""] || { catColor: "bg-primary-fixed/20 text-primary", icon: "school", iconBg: "bg-primary-fixed", iconColor: "text-primary", barColor: "bg-primary" };
};

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const apiCall = useApiCall();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({ total_courses: 0, total_enrollments: 0, avg_completion: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const itemsPerPage = 9;
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Redirect non-admin users to home with toast
    if (user && user.role !== "admin") {
      showToast("Not allowed", "error");
      router.push("/");
    }
  }, [user, router, showToast]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch dashboard stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsResponse = await apiCall<any>("/api/admin/dashboard-stats");
        if (statsResponse) {
          setStats(statsResponse);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [apiCall]);

  // Fetch courses when page, search, or filters change
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const skip = (currentPage - 1) * itemsPerPage;
        let url = `/api/admin/courses?skip=${skip}&limit=${itemsPerPage}`;

        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        if (selectedDifficulty) {
          url += `&difficulty=${encodeURIComponent(selectedDifficulty)}`;
        }
        if (selectedCategory) {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }

        const coursesResponse = await apiCall<any>(url);

        if (coursesResponse && coursesResponse.courses) {
          setCourses(coursesResponse.courses);
          setTotalCourses(coursesResponse.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [apiCall, currentPage, search, selectedDifficulty, selectedCategory]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    if ((search || selectedDifficulty || selectedCategory) && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [search, selectedDifficulty, selectedCategory, currentPage]);

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
      </aside>

      {/* Main Wrapper */}
      <div className="ml-64 min-h-screen">
        {/* Top Nav Bar */}
        <header className="fixed top-0 right-0 left-64 bg-surface-container-lowest py-4 px-6 z-40 border-b border-outline-variant/30">
          <div className="flex justify-between items-center w-full">
            <div className="relative max-w-2xl group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full pl-12 pr-6 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-base shadow-sm"
                placeholder="Search courses, instructors, emails, or user IDs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-outline-variant/20">
                      <p className="text-sm font-bold text-on-surface">{user?.name}</p>
                      <p className="text-xs text-on-surface-variant">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[20px]">dashboard</span>
                      Dashboard
                    </Link>
                    <Link
                      href="/generate"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                      Create Course
                    </Link>
                    <div className="border-t border-outline-variant/20 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); router.push("/"); setMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error hover:bg-error-container/20 transition-colors rounded-lg"
                      >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-20 px-6 pb-12 max-w-[1280px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-on-surface mb-1">Course Manager</h2>
              <p className="text-base text-on-surface-variant">Organize, track, and manage all learning content across the platform.</p>
            </div>
            <div className="flex gap-4 relative">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant text-on-surface-variant text-sm font-medium px-6 py-4 rounded-lg hover:bg-surface-container transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                  Filters
                </button>

                {showFilters && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-4 z-50">
                    <div className="px-4 space-y-4">
                      {/* Difficulty Filter */}
                      <div>
                        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
                          Difficulty
                        </label>
                        <div className="space-y-2">
                          {["", "Beginner", "Intermediate", "Advanced"].map((diff) => (
                            <label key={diff} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="difficulty"
                                value={diff}
                                checked={selectedDifficulty === diff}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-4 h-4 text-primary accent-primary"
                              />
                              <span className="text-sm text-on-surface">{diff || "All"}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div className="pt-4 border-t border-outline-variant/20">
                        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
                          Category
                        </label>
                        <div className="space-y-2">
                          {["", "Computer Science", "Business & Strategy", "Creative Design", "Marketing"].map((cat) => (
                            <label key={cat} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="category"
                                value={cat}
                                checked={selectedCategory === cat}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-4 h-4 text-primary accent-primary"
                              />
                              <span className="text-sm text-on-surface">{cat || "All"}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Clear Filters Button */}
                      {(selectedDifficulty || selectedCategory) && (
                        <button
                          onClick={() => {
                            setSelectedDifficulty("");
                            setSelectedCategory("");
                          }}
                          className="w-full mt-4 pt-4 border-t border-outline-variant/20 text-sm text-primary font-medium hover:bg-primary-fixed/10 py-2 rounded transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow border border-surface-variant/50">
              <p className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Total Courses</p>
              <h3 className="text-[32px] font-bold text-primary">{stats.total_courses}</h3>
              <div className="flex items-center gap-1 mt-2 text-on-surface-variant">
                <span className="text-xs font-semibold">Across all categories</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow border border-surface-variant/50">
              <p className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Total Enrollments</p>
              <h3 className="text-[32px] font-bold text-primary">{stats.total_enrollments.toLocaleString()}</h3>
              <div className="flex items-center gap-1 mt-2 text-on-surface-variant">
                <span className="text-xs font-semibold">Active enrollments</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow border border-surface-variant/50">
              <p className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Avg. Completion</p>
              <h3 className="text-[32px] font-bold text-primary">{stats.avg_completion}%</h3>
              <div className="flex items-center gap-1 mt-2 text-tertiary">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span className="text-xs font-semibold">Platform average</span>
              </div>
            </div>
          </div>

          {/* Course Table */}
          <div className="bg-surface-container-lowest rounded-xl ambient-shadow border border-surface-variant/50 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-on-surface-variant">No courses found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant/30">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Course Title</th>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Difficulty</th>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Category</th>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase text-center">Enrollments</th>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Completion Rate</th>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {courses.map((course, i) => {
                      const categoryConfig = getCategoryColor(course.category);
                      return (
                        <tr key={course.id} className={`row-hover ${i % 2 === 1 ? "bg-surface-container-low/20" : ""}`}>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg ${categoryConfig.iconBg} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined ${categoryConfig.iconColor}`}>{categoryConfig.icon}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-on-surface">{course.title}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-sm font-medium text-on-surface">{course.difficulty_level}</td>
                          <td className="px-6 py-6">
                            <span className={`${categoryConfig.catColor} px-2 py-1 rounded text-xs font-semibold`}>{course.category}</span>
                          </td>
                          <td className="px-6 py-6 text-center text-sm font-medium text-on-surface">{course.enrollments}</td>
                          <td className="px-6 py-6">
                            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-1">
                              <div className={`${categoryConfig.barColor} h-full`} style={{ width: `${course.completion}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-on-surface">{course.completion}%</span>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && courses.length > 0 && (
              <div className="px-6 py-4 bg-surface-container border-t border-outline-variant/30 flex items-center justify-between">
                <p className="text-xs text-on-surface-variant">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCourses)} of {totalCourses} courses
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>

                  {(() => {
                    const totalPages = Math.ceil(totalCourses / itemsPerPage);
                    const pages: number[] = [];

                    if (totalPages <= 5) {
                      // Show all pages if 5 or fewer
                      pages.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
                    } else {
                      // Show pages around current page
                      let start = Math.max(1, currentPage - 2);
                      let end = Math.min(totalPages, currentPage + 2);

                      if (end - start < 4) {
                        if (start === 1) end = Math.min(totalPages, 5);
                        else start = Math.max(1, end - 4);
                      }

                      pages.push(...Array.from({ length: end - start + 1 }, (_, i) => start + i));
                    }

                    return pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                          currentPage === page
                            ? "bg-primary text-on-primary"
                            : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest"
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalCourses / itemsPerPage)}
                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
