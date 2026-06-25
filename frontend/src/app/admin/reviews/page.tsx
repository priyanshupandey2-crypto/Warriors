"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useApiCall } from "@/hooks/useApiCall";

interface Submission {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  title: string;
  description: string;
  submission_date: string;
  status: string;
  difficulty_level?: string;
  learning_duration?: string;
  expertise_domain?: string;
  relevant_tags?: string;
  course_data?: any;
}

const sidebarLinks = [
  { label: "Course Manager", icon: "auto_stories", href: "/admin", active: false },
  { label: "Review Queue", icon: "rate_review", href: "/admin/reviews", active: true },
  { label: "Audit Logs", icon: "history", href: "/admin/audit-logs", active: false },
];

const getTypeColor = (type: string) => {
  if (type === "AI-Generated") {
    return "bg-primary-container/10 text-primary border-primary/20";
  }
  return "bg-secondary-container/10 text-secondary border-secondary/20";
};

const getStatusLabel = (status: string) => {
  if (status === "pending") {
    return "Awaiting Course Generation";
  } else if (status === "generating") {
    return "Generating Course";
  } else if (status === "generated") {
    return "Awaiting for Approval";
  }
  return status;
};

const getStatusColor = (status: string) => {
  if (status === "pending") {
    return "bg-warning-container/20 text-warning border-warning/20";
  } else if (status === "generating") {
    return "bg-tertiary-container/20 text-tertiary border-tertiary/20";
  } else if (status === "generated") {
    return "bg-primary-container/20 text-primary border-primary/20";
  }
  return "bg-surface-container-low text-on-surface-variant border-outline-variant/20";
};

export default function ReviewQueuePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const apiCall = useApiCall();
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<Submission | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editModal, setEditModal] = useState<{ show: boolean; courseData?: any }>({ show: false });
  const [editFormData, setEditFormData] = useState<any>({});
  const [editTab, setEditTab] = useState<"details" | "content">("details");
  const [courseContent, setCourseContent] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const itemsPerPage = 10;
  const menuRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const skip = (currentPage - 1) * itemsPerPage;
        let url = `/api/admin/submissions?skip=${skip}&limit=${itemsPerPage}&status=pending`;

        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await apiCall<any>(url);

        if (response && response.submissions) {
          setSubmissions(response.submissions);
          setTotalSubmissions(response.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
        showToast("Failed to load submissions", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [search, currentPage, apiCall, showToast, refreshTrigger]);

  const handleOpenEditModal = async (courseData: any) => {
    try {
      const parsedData = typeof courseData === "string" ? JSON.parse(courseData) : courseData;
      setEditModal({ show: true, courseData: parsedData });
      setEditFormData({
        title: parsedData.title || "",
        description: parsedData.description || "",
        difficulty: parsedData.difficulty || "Beginner",
        duration_hours: parsedData.duration_hours || 10,
        category: parsedData.category || "",
      });
      setCourseContent(parsedData);
    } catch (error) {
      console.error("Failed to load course data:", error);
      showToast("Failed to load course data", "error");
    }
  };

  const handleSaveCourseEdits = async () => {
    if (!selectedReview || selectedReview.status !== "generated") return;

    try {
      setEditLoading(true);

      // Merge any pending edits back into courseContent before saving
      let updatedModules = courseContent?.modules || [];

      // If there's an edited lesson, update it in the modules
      if (editingLesson && updatedModules.length > 0) {
        updatedModules = updatedModules.map((module: any) => ({
          ...module,
          lessons: (module.lessons || []).map((lesson: any) =>
            lesson.title === editingLesson.title ? editingLesson : lesson
          ),
        }));
      }

      // If there's an edited quiz, update it in the modules
      if (editingQuiz && updatedModules.length > 0) {
        updatedModules = updatedModules.map((module: any) => ({
          ...module,
          quizzes: (module.quizzes || []).map((quiz: any) =>
            quiz.title === editingQuiz.title ? editingQuiz : quiz
          ),
        }));
      }

      // Prepare updated course data
      const updatedCourseData = {
        title: editFormData.title || "",
        description: editFormData.description || "",
        difficulty: editFormData.difficulty || "Beginner",
        duration_hours: editFormData.duration_hours || 10,
        category: editFormData.category || "",
        modules: updatedModules,
      };

      const response = await apiCall<any>(`/api/admin/submissions/${selectedReview.id}/update-course`, {
        method: "PUT",
        body: JSON.stringify(updatedCourseData),
      });

      if (response && response.status) {
        showToast("Course saved successfully", "success");

        // Update local state with new data
        const updatedSubmission = {
          ...selectedReview,
          title: editFormData.title,
          description: editFormData.description,
          course_data: updatedCourseData,
        };
        setSelectedReview(updatedSubmission);

        // Update submissions list
        setSubmissions(submissions.map(s =>
          s.id === selectedReview.id ? updatedSubmission : s
        ));

        setEditModal({ show: false });

        // Trigger refresh to fetch fresh data from server
        setRefreshTrigger(prev => prev + 1);
      } else {
        showToast(response?.error || "Failed to save course", "error");
      }
    } catch (error) {
      console.error("Failed to save course:", error);
      showToast("Failed to save course", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedReview || !reviewAction) return;

    try {
      setReviewing(true);

      // Handle deletion for pending or generated courses
      if ((selectedReview.status === "pending" || selectedReview.status === "generated") && reviewAction === "reject") {
        const response = await apiCall<any>(`/api/admin/submissions/${selectedReview.id}`, {
          method: "DELETE",
          body: JSON.stringify({
            feedback: reviewFeedback,
          }),
        });

        if (response && response.status) {
          showToast("Course generation deleted successfully", "success");
          setSelectedReview(null);
          setReviewAction(null);
          setReviewFeedback("");
          setRefreshTrigger(prev => prev + 1);
        } else {
          showToast(response?.error || "Failed to delete course generation", "error");
        }
      } else {
        // Handle approval/rejection for generated courses
        const response = await apiCall<any>(`/api/admin/submissions/${selectedReview.id}/review`, {
          method: "PUT",
          body: JSON.stringify({
            status: reviewAction === "approve" ? "approved" : "rejected",
            feedback: reviewFeedback,
          }),
        });

        if (response && response.status) {
          showToast(
            `Course ${reviewAction === "approve" ? "approved" : "rejected"} successfully`,
            "success"
          );
          setSelectedReview(null);
          setReviewAction(null);
          setReviewFeedback("");
          setRefreshTrigger(prev => prev + 1);
        } else {
          showToast(response?.error || "Failed to review course", "error");
        }
      }
    } catch (error) {
      console.error("Failed to process course:", error);
      showToast("Failed to process course", "error");
    } finally {
      setReviewing(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) =>
    s.user_name.toLowerCase().includes(search.toLowerCase()) ||
    s.user_email.toLowerCase().includes(search.toLowerCase()) ||
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(totalSubmissions / itemsPerPage);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Side Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest shadow-sm flex flex-col py-6 px-4 z-50">
        <div className="mb-8 px-2">
          <Link href="/" className="text-2xl font-semibold font-bold text-primary">
            AuraLearn
          </Link>
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

      {/* Main Canvas */}
      <main className="ml-64 min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="flex justify-between items-center px-6 w-full sticky top-0 z-40 bg-surface-container-lowest py-4 border-b border-outline-variant/30">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="w-full bg-surface-container-low border-none rounded-full pl-12 pr-4 py-2 text-base focus:ring-2 focus:ring-primary transition-all outline-none"
              placeholder="Search by user, email, or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 ml-auto">
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
        </header>

        {/* Page Content */}
        <div className="p-6 flex gap-6 flex-1 overflow-hidden">
          {/* Left Content */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <section>
              <h2 className="text-3xl font-semibold text-on-surface">Review Queue</h2>
              <p className="text-base text-on-surface-variant">Moderate and approve course submissions from AI generation and user requests.</p>
            </section>

            {/* Summary Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col gap-1">
                <span className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Pending Reviews</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl text-primary font-bold">{totalSubmissions}</span>
                </div>
              </div>
            </section>

            {/* Filters */}
            <section className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex bg-surface-container-low p-1 rounded-lg">
                  <button className="px-4 py-2 bg-surface-container-lowest rounded-md shadow-sm text-sm font-bold text-primary">Pending Submissions</button>
                </div>
              </div>
              <div className="text-xs font-semibold text-on-surface-variant">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalSubmissions)}-{Math.min(currentPage * itemsPerPage, totalSubmissions)} of {totalSubmissions} results
              </div>
            </section>

            {/* Review Table */}
            <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 flex-1 flex flex-col overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-on-surface-variant">No pending submissions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Topic</th>
                        <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Difficulty</th>
                        <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Domain</th>
                        <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Tags</th>
                        <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Requester</th>
                        <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 overflow-y-auto custom-scrollbar">
                      {filteredSubmissions.map((submission) => (
                        <tr
                          key={submission.id}
                          className={`hover:bg-surface-container-low transition-colors cursor-pointer group ${
                            selectedReview?.id === submission.id ? "bg-primary/5 border-l-4 border-primary" : "border-l-4 border-transparent"
                          }`}
                          onClick={() => setSelectedReview(submission)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {submission.status === "pending" ? (
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-warning-container/30">
                                  <span className="material-symbols-outlined text-sm text-warning">schedule</span>
                                </div>
                              ) : submission.status === "generating" ? (
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-tertiary-container/30 animate-spin">
                                  <span className="material-symbols-outlined text-sm text-tertiary">smart_toy</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-container/30">
                                  <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
                                </div>
                              )}
                              <span className="text-sm font-medium text-on-surface">{submission.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{submission.difficulty_level}</td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{submission.learning_duration}</td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{submission.expertise_domain}</td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">
                            <span className="line-clamp-1">{submission.relevant_tags}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-bold text-on-surface">{submission.user_name}</div>
                              <div className="text-xs font-semibold text-on-surface-variant">{submission.user_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">
                            {new Date(submission.submission_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              className="flex items-center gap-1 px-4 py-2 text-primary hover:bg-primary-container/10 font-bold text-xs rounded-lg transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReview(submission);
                              }}
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && totalSubmissions > 0 && (
                <div className="px-6 py-4 bg-surface-container border-t border-outline-variant/30 flex items-center justify-between">
                  <p className="text-xs text-on-surface-variant">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalSubmissions)}-{Math.min(currentPage * itemsPerPage, totalSubmissions)} of {totalSubmissions} submissions
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
                      const pages: number[] = [];
                      if (totalPages <= 5) {
                        pages.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
                      } else {
                        if (currentPage <= 3) {
                          pages.push(1, 2, 3, 4, 5);
                        } else if (currentPage >= totalPages - 2) {
                          pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                        } else {
                          pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
                        }
                      }

                      return pages.map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded border transition-colors text-sm font-medium ${
                            currentPage === page
                              ? "bg-primary text-on-primary border-primary"
                              : "border-outline-variant text-on-surface-variant hover:bg-surface-container-highest"
                          }`}
                        >
                          {page}
                        </button>
                      ));
                    })()}

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar: Review Panel */}
          {selectedReview && (
            <aside className="w-96 bg-surface-container-lowest border-l border-outline-variant/20 shadow-xl flex flex-col z-50 animate-in slide-in-from-right rounded-xl">
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="text-2xl font-semibold text-on-surface">Review Details</h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Requester</span>
                  <p className="font-bold text-on-surface">{selectedReview.user_name}</p>
                  <p className="text-sm text-on-surface-variant">{selectedReview.user_email}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Course Title</span>
                  <p className="font-bold text-on-surface">{selectedReview.title}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</span>
                  <span className={`w-fit px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedReview.status)}`}>
                    {getStatusLabel(selectedReview.status)}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Difficulty Level</span>
                  <p className="text-sm text-on-surface">{selectedReview.difficulty_level}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Expertise Domain</span>
                  <p className="text-sm text-on-surface">{selectedReview.expertise_domain}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tags</span>
                  <p className="text-sm text-on-surface">{selectedReview.relevant_tags}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Description</span>
                  <p className="text-sm text-on-surface-variant">{selectedReview.description}</p>
                </div>

                <div className="border-t border-outline-variant/20 pt-4">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-3">Review Action</span>
                  <div className="flex flex-col gap-2">
                    {selectedReview.status === "generated" && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(selectedReview.course_data)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all bg-surface-container-low text-on-surface-variant hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          View & Edit Course
                        </button>
                        <button
                          onClick={() => {
                            setReviewAction("approve");
                            setReviewFeedback("");
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                            reviewAction === "approve"
                              ? "bg-tertiary-container text-on-tertiary"
                              : "bg-surface-container-low text-on-surface-variant hover:text-tertiary"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">add_task</span>
                          Approve & Add to Catalogue
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setReviewAction("reject");
                        setReviewFeedback("");
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                        reviewAction === "reject"
                          ? "bg-error-container text-on-error"
                          : "bg-surface-container-low text-on-surface-variant hover:text-error"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      {selectedReview.status === "pending" ? "Delete" : "Reject"}
                    </button>
                  </div>
                </div>

                {reviewAction && (
                  <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-3">
                    {selectedReview.status === "generated" && (
                      <>
                        <label className="text-xs font-semibold text-on-surface-variant uppercase">Feedback</label>
                        <textarea
                          value={reviewFeedback}
                          onChange={(e) => setReviewFeedback(e.target.value)}
                          placeholder={reviewAction === "approve" ? "Approval message..." : "Rejection reason..."}
                          className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          rows={3}
                        />
                      </>
                    )}
                    {selectedReview.status === "pending" && reviewAction === "reject" && (
                      <>
                        <label className="text-xs font-semibold text-on-surface-variant uppercase">Deletion Reason</label>
                        <textarea
                          value={reviewFeedback}
                          onChange={(e) => setReviewFeedback(e.target.value)}
                          placeholder="Please provide a reason for deleting this course generation request..."
                          className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          rows={3}
                        />
                      </>
                    )}
                    <button
                      onClick={handleReview}
                      disabled={reviewing || !reviewFeedback.trim()}
                      className="w-full py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {reviewing ? "Processing..." : (selectedReview.status === "pending" ? "Confirm Delete" : "Submit Review")}
                    </button>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Edit Course Modal */}
      {editModal.show && editFormData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 min-h-screen md:min-h-auto md:max-w-4xl md:my-8 w-full md:rounded-2xl flex flex-col max-h-[95vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-outline-variant/10 bg-surface-container">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">Edit Course</h2>
                <p className="text-xs text-on-surface-variant mt-1">View and edit the generated course before approval</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg">
                  <button
                    onClick={() => setEditTab("details")}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                      editTab === "details"
                        ? "bg-surface-container-lowest text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setEditTab("content");
                      if (!courseContent?.modules) {
                        setCourseContent(editModal.courseData);
                      }
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                      editTab === "content"
                        ? "bg-surface-container-lowest text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    Content
                  </button>
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
            </div>

            {/* Content */}
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
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

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setEditModal({ show: false });
                        setCourseContent(null);
                        setEditingLesson(null);
                        setEditingQuiz(null);
                      }}
                      disabled={editLoading}
                      className="flex-1 bg-surface-container text-on-surface py-3 rounded-lg text-sm font-medium hover:bg-surface-container-high transition-all disabled:opacity-50"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveCourseEdits}
                      disabled={editLoading}
                      className="flex-1 bg-primary text-on-primary py-3 rounded-lg text-sm font-medium hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {editLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                          Saving...
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
                  {courseContent && courseContent.modules ? (
                    <div className="space-y-6">
                      {courseContent.modules.map((module: any) => (
                        <div key={module.title} className="bg-surface-container rounded-lg p-6 border border-outline-variant/30">
                          <h3 className="text-lg font-semibold text-on-surface mb-4">{module.title}</h3>

                          {/* Lessons */}
                          {module.lessons && module.lessons.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-on-surface-variant mb-3 uppercase tracking-wider">Lessons</h4>
                              <div className="space-y-2">
                                {module.lessons.map((lesson: any) => (
                                  <div
                                    key={lesson.title}
                                    onClick={() => {
                                      if (editingLesson?.title === lesson.title) {
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
                                        {editingLesson?.title === lesson.title ? "expand_less" : "expand_more"}
                                      </span>
                                    </div>

                                    {editingLesson?.title === lesson.title && (
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
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quizzes */}
                          {module.quizzes && module.quizzes.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-on-surface-variant mb-3 uppercase tracking-wider">Quizzes</h4>
                              <div className="space-y-2">
                                {module.quizzes.map((quiz: any) => (
                                  <div
                                    key={quiz.title}
                                    onClick={() => {
                                      if (editingQuiz?.title === quiz.title) {
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
                                        {editingQuiz?.title === quiz.title ? "expand_less" : "expand_more"}
                                      </span>
                                    </div>

                                    {editingQuiz?.title === quiz.title && (
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

                  {/* Save Button for Content Tab */}
                  <div className="border-t border-outline-variant/10 bg-surface-container mt-8 p-6 flex gap-3 -mx-8 -mb-8">
                    <button
                      onClick={() => {
                        setEditModal({ show: false });
                        setCourseContent(null);
                        setEditingLesson(null);
                        setEditingQuiz(null);
                      }}
                      disabled={editLoading}
                      className="flex-1 bg-surface-container-lowest text-on-surface py-3 rounded-lg text-sm font-medium hover:bg-surface-container-low transition-all disabled:opacity-50"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveCourseEdits}
                      disabled={editLoading}
                      className="flex-1 bg-primary text-on-primary py-3 rounded-lg text-sm font-medium hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {editLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                          Saving...
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
