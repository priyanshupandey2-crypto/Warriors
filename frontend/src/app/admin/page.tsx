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
  { label: "Audit Logs", icon: "history", href: "/admin/audit-logs", active: false },
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
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; courseId?: number; courseTitle?: string }>({ show: false });
  const [deleting, setDeleting] = useState(false);
  const [editModal, setEditModal] = useState<{ show: boolean; courseId?: number }>({ show: false });
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editTab, setEditTab] = useState<"details" | "content">("details");
  const [courseContent, setCourseContent] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
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

  const handleOpenEditModal = async (courseId: number) => {
    try {
      setEditLoading(true);
      setEditTab("details");
      setEditModal({ show: true, courseId });

      const response = await apiCall<any>(`/api/admin/courses/${courseId}/edit`);

      if (response && response.status && response.course) {
        setEditingCourse(response.course);
        setEditFormData(response.course);
      } else {
        showToast("Failed to load course details", "error");
        setEditModal({ show: false });
      }
    } catch (error) {
      console.error("Failed to load course:", error);
      showToast("Failed to load course details", "error");
      setEditModal({ show: false });
    } finally {
      setEditLoading(false);
    }
  };

  const handleLoadCourseContent = async (courseId: number) => {
    try {
      setContentLoading(true);
      const response = await apiCall<any>(`/api/admin/courses/${courseId}/content`);

      if (response && response.status && response.modules) {
        setCourseContent(response);
      } else {
        showToast("Failed to load course content", "error");
      }
    } catch (error) {
      console.error("Failed to load content:", error);
      showToast("Failed to load course content", "error");
    } finally {
      setContentLoading(false);
    }
  };

  const handleUpdateLesson = async (lessonId: number) => {
    if (!editingLesson) return;

    try {
      const lessonData = {
        title: editingLesson.title || "",
        content_markdown: editingLesson.content_markdown || "",
        duration_minutes: editingLesson.duration_minutes || 0,
        learning_objectives: editingLesson.learning_objectives || "",
        key_concepts: editingLesson.key_concepts || "",
      };

      const response = await apiCall<any>(`/api/admin/lessons/${lessonId}`, {
        method: "PUT",
        body: JSON.stringify(lessonData),
      });

      if (response && response.status) {
        showToast("Lesson updated successfully", "success");
        setEditingLesson(null);
        // Refresh content
        if (editModal.courseId) {
          await handleLoadCourseContent(editModal.courseId);
        }
      } else {
        showToast(response?.error || "Failed to update lesson", "error");
      }
    } catch (error) {
      console.error("Failed to update lesson:", error);
      showToast("Failed to update lesson", "error");
    }
  };

  const handleUpdateQuiz = async (quizId: number) => {
    if (!editingQuiz) return;

    try {
      const quizData = {
        title: editingQuiz.title || "",
        description: editingQuiz.description || "",
        passing_score: editingQuiz.passing_score || 70,
        total_points: editingQuiz.total_points || 100,
        duration_minutes: editingQuiz.duration_minutes || 30,
      };

      const response = await apiCall<any>(`/api/admin/quizzes/${quizId}`, {
        method: "PUT",
        body: JSON.stringify(quizData),
      });

      if (response && response.status) {
        showToast("Quiz updated successfully", "success");
        setEditingQuiz(null);
        // Refresh content
        if (editModal.courseId) {
          await handleLoadCourseContent(editModal.courseId);
        }
      } else {
        showToast(response?.error || "Failed to update quiz", "error");
      }
    } catch (error) {
      console.error("Failed to update quiz:", error);
      showToast("Failed to update quiz", "error");
    }
  };

  const handleUpdateCourse = async () => {
    if (!editModal.courseId || !editFormData) return;

    try {
      setEditLoading(true);
      const { id, ...courseDataToSend } = editFormData;
      // Ensure all required fields are present
      const payload = {
        title: courseDataToSend.title || "",
        description: courseDataToSend.description || "",
        difficulty: courseDataToSend.difficulty || "Beginner",
        duration_hours: courseDataToSend.duration_hours || 0,
        category: courseDataToSend.category || "",
        thumbnail_url: courseDataToSend.thumbnail_url || "",
        modules: courseDataToSend.modules || []
      };
      console.log("Sending course update:", payload);
      const response = await apiCall<any>(`/api/admin/courses/${editModal.courseId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (response && response.status) {
        showToast("Course updated successfully", "success");
        setEditModal({ show: false });

        // Refresh courses
        const skip = (currentPage - 1) * itemsPerPage;
        let url = `/api/admin/courses?skip=${skip}&limit=${itemsPerPage}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (selectedDifficulty) url += `&difficulty=${encodeURIComponent(selectedDifficulty)}`;
        if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;

        const coursesResponse = await apiCall<any>(url);
        if (coursesResponse && coursesResponse.courses) {
          setCourses(coursesResponse.courses);
          setTotalCourses(coursesResponse.total || 0);
        }
      } else {
        showToast(response?.error || "Failed to update course", "error");
      }
    } catch (error) {
      console.error("Failed to update course:", error);
      showToast("Failed to update course", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteModal.courseId) return;

    try {
      setDeleting(true);
      const response = await apiCall<any>(`/api/admin/courses/${deleteModal.courseId}`, {
        method: "DELETE",
      });

      if (response && response.status) {
        showToast(`Course deleted successfully`, "success");
        setDeleteModal({ show: false });

        // Refresh courses
        const skip = (currentPage - 1) * itemsPerPage;
        let url = `/api/admin/courses?skip=${skip}&limit=${itemsPerPage}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (selectedDifficulty) url += `&difficulty=${encodeURIComponent(selectedDifficulty)}`;
        if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;

        const coursesResponse = await apiCall<any>(url);
        if (coursesResponse && coursesResponse.courses) {
          setCourses(coursesResponse.courses);
          setTotalCourses(coursesResponse.total || 0);
        }
      } else {
        showToast(response?.error || "Failed to delete course", "error");
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
      showToast("Failed to delete course", "error");
    } finally {
      setDeleting(false);
    }
  };

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
                              <button
                                onClick={() => handleOpenEditModal(course.id)}
                                className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed/20 rounded transition-all"
                              >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteModal({
                                    show: true,
                                    courseId: course.id,
                                    courseTitle: course.title,
                                  })
                                }
                                className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded transition-all"
                              >
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

      {/* Edit Course Modal */}
      {editModal.show && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/30 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface mb-2">Edit Course</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setEditTab("details")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      editTab === "details"
                        ? "bg-primary text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setEditTab("content");
                      if (editModal.courseId && !courseContent) {
                        handleLoadCourseContent(editModal.courseId);
                      }
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      editTab === "content"
                        ? "bg-primary text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Content
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditModal({ show: false });
                  setCourseContent(null);
                  setEditingLesson(null);
                  setEditingQuiz(null);
                }}
                className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="p-8 space-y-6">
              {editTab === "details" ? (
                <>
                  {/* Title */}
                  <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Course Title</label>
                <input
                  type="text"
                  value={editFormData.title || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="Enter course title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Description</label>
                <textarea
                  value={editFormData.description || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none"
                  rows={4}
                  placeholder="Enter course description"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Difficulty</label>
                  <select
                    value={editFormData.difficulty || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  >
                    <option value="">Select difficulty</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    value={editFormData.duration_hours || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, duration_hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    min="1"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Category</label>
                <select
                  value={editFormData.category || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                >
                  <option value="">Select category</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Business & Strategy">Business & Strategy</option>
                  <option value="Creative Design">Creative Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={editFormData.thumbnail_url || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditModal({ show: false })}
                  disabled={editLoading}
                  className="flex-1 bg-surface-container text-on-surface py-3 rounded-lg text-sm font-medium hover:bg-surface-container-high transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCourse}
                  disabled={editLoading}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-lg text-sm font-medium hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">save</span>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
                </>
              ) : (
                <>
                  {/* Content Tab */}
                  {contentLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : courseContent && courseContent.modules ? (
                    <div className="space-y-6">
                      {courseContent.modules.map((module: any) => (
                        <div key={module.id} className="bg-surface-container rounded-lg p-6 border border-outline-variant/30">
                          <h3 className="text-lg font-semibold text-on-surface mb-4">{module.title}</h3>

                          {/* Lessons */}
                          {module.lessons.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-on-surface-variant mb-3 uppercase tracking-wider">
                                Lessons
                              </h4>
                              <div className="space-y-2">
                                {module.lessons.map((lesson: any) => (
                                  <div
                                    key={lesson.id}
                                    onClick={() => {
                                      if (editingLesson?.id === lesson.id) {
                                        setEditingLesson(null);
                                      } else {
                                        setEditingLesson({ ...lesson });
                                      }
                                    }}
                                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 cursor-pointer hover:bg-surface-container-low transition-colors"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="font-medium text-on-surface">{lesson.title}</p>
                                        <p className="text-xs text-on-surface-variant mt-1">Duration: {lesson.duration_minutes} min</p>
                                      </div>
                                      <span className="material-symbols-outlined text-on-surface-variant">
                                        {editingLesson?.id === lesson.id ? "expand_less" : "expand_more"}
                                      </span>
                                    </div>

                                    {editingLesson?.id === lesson.id && (
                                      <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-3" onClick={(e) => e.stopPropagation()}>
                                        <div>
                                          <label className="text-xs font-medium text-on-surface-variant mb-1 block">Title</label>
                                          <input
                                            type="text"
                                            value={editingLesson.title || ""}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                            className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Lesson title"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-on-surface-variant mb-1 block">Content</label>
                                          <textarea
                                            value={editingLesson.content_markdown || ""}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, content_markdown: e.target.value })}
                                            className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
                                            rows={3}
                                            placeholder="Content (markdown)"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-on-surface-variant mb-1 block">Duration (minutes)</label>
                                          <input
                                            type="number"
                                            value={editingLesson.duration_minutes || 0}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, duration_minutes: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Duration (minutes)"
                                            min="1"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-on-surface-variant mb-1 block">Learning Objectives</label>
                                          <textarea
                                            value={editingLesson.learning_objectives || ""}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, learning_objectives: e.target.value })}
                                            className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
                                            rows={2}
                                            placeholder="Learning objectives"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-on-surface-variant mb-1 block">Key Concepts</label>
                                          <textarea
                                            value={editingLesson.key_concepts || ""}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, key_concepts: e.target.value })}
                                            className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
                                            rows={2}
                                            placeholder="Key concepts"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateLesson(lesson.id);
                                          }}
                                          className="w-full bg-primary text-on-primary px-3 py-2 rounded text-sm font-medium hover:brightness-110 transition-all"
                                        >
                                          Save Lesson
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quizzes */}
                          {module.quizzes.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-on-surface-variant mb-3 uppercase tracking-wider">
                                Quizzes
                              </h4>
                              <div className="space-y-2">
                                {module.quizzes.map((quiz: any) => (
                                  <div
                                    key={quiz.id}
                                    onClick={() => {
                                      if (editingQuiz?.id === quiz.id) {
                                        setEditingQuiz(null);
                                      } else {
                                        setEditingQuiz({ ...quiz });
                                      }
                                    }}
                                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 cursor-pointer hover:bg-surface-container-low transition-colors"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="font-medium text-on-surface">{quiz.title}</p>
                                        <p className="text-xs text-on-surface-variant mt-1">
                                          Passing: {quiz.passing_score}% | Duration: {quiz.duration_minutes} min
                                        </p>
                                      </div>
                                      <span className="material-symbols-outlined text-on-surface-variant">
                                        {editingQuiz?.id === quiz.id ? "expand_less" : "expand_more"}
                                      </span>
                                    </div>

                                    {editingQuiz?.id === quiz.id && (
                                      <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-3" onClick={(e) => e.stopPropagation()}>
                                        <div>
                                          <label className="text-xs font-medium text-on-surface-variant mb-1 block">Title</label>
                                          <input
                                            type="text"
                                            value={editingQuiz.title || ""}
                                            onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                                            className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Quiz title"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-on-surface-variant mb-1 block">Description</label>
                                          <textarea
                                            value={editingQuiz.description || ""}
                                            onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                                            className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
                                            rows={2}
                                            placeholder="Description"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                                          <div>
                                            <label className="text-xs font-medium text-on-surface-variant mb-1 block">Passing Score (%)</label>
                                            <input
                                              type="number"
                                              value={editingQuiz.passing_score || 70}
                                              onChange={(e) => setEditingQuiz({ ...editingQuiz, passing_score: parseInt(e.target.value) || 70 })}
                                              className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary"
                                              placeholder="Passing score"
                                              min="0"
                                              max="100"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-on-surface-variant mb-1 block">Duration (min)</label>
                                            <input
                                              type="number"
                                              value={editingQuiz.duration_minutes || 30}
                                              onChange={(e) => setEditingQuiz({ ...editingQuiz, duration_minutes: parseInt(e.target.value) || 30 })}
                                              className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary"
                                              placeholder="Duration"
                                              min="1"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-on-surface-variant mb-1 block">Total Points</label>
                                          <input
                                            type="number"
                                            value={editingQuiz.total_points || 100}
                                            onChange={(e) => setEditingQuiz({ ...editingQuiz, total_points: parseInt(e.target.value) || 100 })}
                                            className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Total points"
                                            min="1"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateQuiz(quiz.id);
                                          }}
                                          className="w-full bg-primary text-on-primary px-3 py-2 rounded text-sm font-medium hover:brightness-110 transition-all"
                                        >
                                          Save Quiz
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-on-surface-variant">No modules found</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-8 max-w-sm mx-4 border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              </div>
              <h2 className="text-2xl font-semibold text-on-surface">Delete Course?</h2>
            </div>

            <p className="text-base text-on-surface-variant mb-6">
              Are you sure you want to delete <span className="font-semibold text-on-surface">"{deleteModal.courseTitle}"</span>? This action cannot be undone.
            </p>

            <div className="bg-error-container/10 border border-error/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-error">
                <span className="font-semibold">Warning:</span> All associated modules, lessons, quizzes, and user enrollments will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false })}
                disabled={deleting}
                className="flex-1 bg-surface-container text-on-surface py-3 rounded-lg text-sm font-medium hover:bg-surface-container-high transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                disabled={deleting}
                className="flex-1 bg-error text-on-error py-3 rounded-lg text-sm font-medium hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-error border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                    Delete Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
