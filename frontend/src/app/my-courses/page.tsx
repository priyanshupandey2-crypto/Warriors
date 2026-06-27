"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useApiCall } from "@/hooks/useApiCall";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Generation {
  id: number;
  topic: string;
  difficulty_level: string;
  learning_duration: string;
  expertise_domain: string;
  relevant_tags: string;
  status: string;
  created_at: string;
  generation_completed_at: string;
  user_submitted_at: string;
  created_course_id: number | null;
  course_data?: any;
}

const getStatusLabel = (status: string) => {
  if (status === "pending") {
    return "Awaiting Generation";
  } else if (status === "generating") {
    return "Generating Course";
  } else if (status === "generated") {
    return "Ready for Your Review";
  } else if (status === "user_submitted") {
    return "Submitted to Admin";
  } else if (status === "user_review") {
    return "Under Your Review";
  } else if (status === "published") {
    return "Published";
  } else if (status === "failed") {
    return "Generation Failed";
  }
  return status;
};

const getStatusColor = (status: string) => {
  if (status === "pending" || status === "generating") {
    return "bg-warning-container/20 text-warning border-warning/20";
  } else if (status === "generated" || status === "user_review") {
    return "bg-primary-container/20 text-primary border-primary/20";
  } else if (status === "user_submitted") {
    return "bg-secondary-container/20 text-secondary border-secondary/20";
  } else if (status === "published") {
    return "bg-tertiary-container/20 text-tertiary border-tertiary/20";
  } else if (status === "failed") {
    return "bg-error-container/20 text-error border-error/20";
  }
  return "bg-surface-container-low text-on-surface-variant border-outline-variant/20";
};

const getStatusIcon = (status: string) => {
  if (status === "pending" || status === "generating") return "schedule";
  if (status === "generated" || status === "user_review") return "rate_review";
  if (status === "user_submitted") return "send";
  if (status === "published") return "check_circle";
  if (status === "failed") return "error";
  return "help";
};

export default function MyCoursesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const apiCall = useApiCall();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [editModal, setEditModal] = useState<{ show: boolean; courseData?: any }>({ show: false });
  const [editFormData, setEditFormData] = useState<any>({});
  const [editTab, setEditTab] = useState<"details" | "content">("details");
  const [courseContent, setCourseContent] = useState<any>(null);
  const [editingLessonKey, setEditingLessonKey] = useState<string | null>(null);
  const [editingQuizKey, setEditingQuizKey] = useState<string | null>(null);
  const [editingLessonData, setEditingLessonData] = useState<any>(null);
  const [editingQuizData, setEditingQuizData] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        setLoading(true);
        const skip = (currentPage - 1) * itemsPerPage;
        const response = await apiCall<any>(`/api/course-generation/my-generations?skip=${skip}&limit=${itemsPerPage}`);

        if (response && response.status && response.generations) {
          setGenerations(response.generations);
          setTotalGenerations(response.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch generations:", error);
        showToast("Failed to load your course generations", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchGenerations();
  }, [currentPage, apiCall, showToast]);

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
      setEditingLessonKey(null);
      setEditingLessonData(null);
      setEditingQuizKey(null);
      setEditingQuizData(null);
    } catch (error) {
      console.error("Failed to load course data:", error);
      showToast("Failed to load course data", "error");
    }
  };

  const handleSaveCourseEdits = async () => {
    if (!selectedGeneration) return;

    try {
      setEditLoading(true);

      // Merge any pending edits back into courseContent before saving
      let updatedModules = courseContent?.modules || [];

      // If there's an edited lesson, update it in the modules
      if (editingLessonData && editingLessonKey && updatedModules.length > 0) {
        const [moduleIdx, lessonIdx] = editingLessonKey.split('-').map(Number);
        updatedModules = updatedModules.map((module: any, mIdx: number) =>
          mIdx === moduleIdx
            ? {
                ...module,
                lessons: (module.lessons || []).map((lesson: any, lIdx: number) =>
                  lIdx === lessonIdx ? editingLessonData : lesson
                ),
              }
            : module
        );
      }

      // If there's an edited quiz, update it in the modules
      if (editingQuizData && editingQuizKey && updatedModules.length > 0) {
        const [moduleIdx, quizIdx] = editingQuizKey.split('-').map(Number);
        updatedModules = updatedModules.map((module: any, mIdx: number) =>
          mIdx === moduleIdx
            ? {
                ...module,
                quizzes: (module.quizzes || []).map((quiz: any, qIdx: number) =>
                  qIdx === quizIdx ? editingQuizData : quiz
                ),
              }
            : module
        );
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

      // Send to backend to save
      const response = await apiCall<any>(`/api/course-generation/user-save/${selectedGeneration.id}`, {
        method: "PUT",
        body: JSON.stringify({
          course_data: updatedCourseData,
        }),
      });

      if (response && response.status) {
        // Update the selected generation with new data
        const updatedGeneration = {
          ...selectedGeneration,
          topic: editFormData.title,
          title: editFormData.title,
          description: editFormData.description,
          course_data: updatedCourseData,
          status: "user_review",
        };

        setSelectedGeneration(updatedGeneration);
        setGenerations(generations.map(g =>
          g.id === selectedGeneration.id ? updatedGeneration : g
        ));

        setCourseContent(updatedCourseData);
        setEditingLessonKey(null);
        setEditingLessonData(null);
        setEditingQuizKey(null);
        setEditingQuizData(null);
        setEditModal({ show: false });
        showToast("Course updated successfully", "success");
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

  const handleDeleteCourse = async (generationId: number) => {
    try {
      setSubmitting(true);

      const response = await apiCall<any>(`/api/course-generation/${generationId}`, {
        method: "DELETE",
      });

      if (response && response.status) {
        showToast("Course deleted successfully", "success");
        setSelectedGeneration(null);
        // Refresh the list
        const skip = (currentPage - 1) * itemsPerPage;
        const refreshResponse = await apiCall<any>(`/api/course-generation/my-generations?skip=${skip}&limit=${itemsPerPage}`);
        if (refreshResponse && refreshResponse.status && refreshResponse.generations) {
          setGenerations(refreshResponse.generations);
          setTotalGenerations(refreshResponse.total || 0);
        }
      } else {
        showToast(response?.error || "Failed to delete course", "error");
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
      showToast("Failed to delete course", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCourse = async () => {
    if (!selectedGeneration) return;

    try {
      setSubmitting(true);

      const response = await apiCall<any>(`/api/course-generation/user-submit/${selectedGeneration.id}`, {
        method: "PUT",
        body: JSON.stringify({
          course_data: selectedGeneration.course_data,
          feedback: "",
        }),
      });

      if (response && response.status) {
        showToast("Course submitted to admin for approval", "success");
        setSelectedGeneration(null);
        // Refresh the list
        const skip = (currentPage - 1) * itemsPerPage;
        const refreshResponse = await apiCall<any>(`/api/course-generation/my-generations?skip=${skip}&limit=${itemsPerPage}`);
        if (refreshResponse && refreshResponse.status && refreshResponse.generations) {
          setGenerations(refreshResponse.generations);
        }
      } else {
        showToast(response?.error || "Failed to submit course", "error");
      }
    } catch (error) {
      console.error("Failed to submit course:", error);
      showToast("Failed to submit course", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalGenerations / itemsPerPage);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-8 w-full">
        {/* Header */}
        <section className="mb-8 max-w-[1600px] mx-auto">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-4xl font-bold text-on-background">My Course Generations</h1>
              <p className="text-base text-on-surface-variant mt-2">View, edit, and submit your generated courses</p>
            </div>
            <Link
              href="/generate"
              className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-medium hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined">add</span>
              Generate New Course
            </Link>
          </div>
        </section>

        {/* Courses Grid/List */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-8 max-w-[1600px] mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : generations.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">school</span>
              <p className="text-on-surface-variant text-lg mb-2">No course generations yet</p>
              <p className="text-on-surface-variant/60 mb-6">Create a new course to get started</p>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-medium hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined">magic_button</span>
                Generate My First Course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  onClick={() => setSelectedGeneration(gen)}
                  className="bg-surface-container-lowest border border-surface-container rounded-2xl p-8 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group min-h-[320px] flex flex-col"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-on-surface line-clamp-2">{gen.topic}</h3>
                      <p className="text-sm text-on-surface-variant mt-2">
                        {new Date(gen.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`material-symbols-outlined text-4xl ${gen.status === "published" ? "text-tertiary" : "text-on-surface-variant/40"} group-hover:text-primary transition-colors flex-shrink-0 ml-4`}>
                      {getStatusIcon(gen.status)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant font-medium">Level:</span>
                      <span className="text-on-surface font-bold">{gen.difficulty_level}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant font-medium">Duration:</span>
                      <span className="text-on-surface font-bold">{gen.learning_duration}</span>
                    </div>
                    {gen.expertise_domain && (
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant font-medium">Domain:</span>
                        <span className="text-on-surface font-bold text-right">{gen.expertise_domain}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(gen.status)}`}>
                      {getStatusLabel(gen.status)}
                    </span>
                  </div>

                  {(gen.status === "generated" || gen.status === "user_review") && (
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGeneration(gen);
                          handleOpenEditModal(gen.course_data);
                        }}
                        className="flex-1 text-sm font-bold px-4 py-3 rounded-lg bg-primary-container/20 text-primary hover:bg-primary-container/40 transition-all"
                      >
                        Review & Edit
                      </button>
                    </div>
                  )}

                  {gen.status === "published" && (
                    <Link
                      href={`/course/${gen.created_course_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="block w-full text-sm font-bold px-4 py-3 rounded-lg bg-tertiary-container/20 text-tertiary hover:bg-tertiary-container/40 transition-all text-center mt-auto"
                    >
                      View Course
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalGenerations > 0 && (
            <div className="mt-8 flex items-center justify-between border-t border-outline-variant/20 pt-6">
              <p className="text-xs text-on-surface-variant">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalGenerations)}-{Math.min(currentPage * itemsPerPage, totalGenerations)} of {totalGenerations} courses
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Review Panel - Right Sidebar */}
      {selectedGeneration && (
        <div className="fixed inset-0 z-50 bg-black/30">
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-surface-container-lowest shadow-2xl border-l border-outline-variant/20 flex flex-col animate-in slide-in-from-right">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-on-surface">Course Details</h3>
              <button
                onClick={() => setSelectedGeneration(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Topic</span>
                <p className="font-bold text-on-surface">{selectedGeneration.topic}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</span>
                <span className={`w-fit px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedGeneration.status)}`}>
                  {getStatusLabel(selectedGeneration.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Difficulty</span>
                  <p className="text-sm text-on-surface">{selectedGeneration.difficulty_level}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Duration</span>
                  <p className="text-sm text-on-surface">{selectedGeneration.learning_duration}</p>
                </div>
              </div>

              {selectedGeneration.expertise_domain && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Domain</span>
                  <p className="text-sm text-on-surface">{selectedGeneration.expertise_domain}</p>
                </div>
              )}

              {selectedGeneration.relevant_tags && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tags</span>
                  <p className="text-sm text-on-surface-variant">{selectedGeneration.relevant_tags}</p>
                </div>
              )}

              <div className="border-t border-outline-variant/20 pt-4">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-3">Actions</span>
                <div className="flex flex-col gap-3">
                  {(selectedGeneration.status === "pending" || selectedGeneration.status === "generating") && (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning-container/30 mx-auto mb-3 animate-spin">
                        <span className="material-symbols-outlined text-warning text-2xl">smart_toy</span>
                      </div>
                      <p className="text-sm font-medium text-on-surface mb-1">Generating Your Course</p>
                      <p className="text-xs text-on-surface-variant">AI is processing your course structure. Please wait...</p>
                    </div>
                  )}
                  {(selectedGeneration.status === "generated" || selectedGeneration.status === "user_review") && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(selectedGeneration.course_data)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-xs transition-all bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        View & Edit Course
                      </button>
                      <button
                        onClick={handleSubmitCourse}
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-xs transition-all bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="w-3 h-3 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">send</span>
                            Submit for Admin Approval
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
                            handleDeleteCourse(selectedGeneration.id);
                          }
                        }}
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-xs transition-all bg-error text-on-error hover:shadow-lg hover:shadow-error/30 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Delete Course
                      </button>
                    </>
                  )}
                  {selectedGeneration.status === "user_submitted" && (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary-container/30 mx-auto mb-3">
                        <span className="material-symbols-outlined text-secondary text-2xl">send</span>
                      </div>
                      <p className="text-sm font-medium text-on-surface mb-1">Awaiting Admin Review</p>
                      <p className="text-xs text-on-surface-variant">Your course has been submitted for admin approval</p>
                    </div>
                  )}
                  {selectedGeneration.status === "published" && (
                    <Link
                      href={`/course/${selectedGeneration.created_course_id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all bg-tertiary-container text-on-tertiary hover:opacity-90"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      View Published Course
                    </Link>
                  )}
                  {selectedGeneration.status === "failed" && (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error-container/30 mx-auto mb-3">
                        <span className="material-symbols-outlined text-error text-2xl">error</span>
                      </div>
                      <p className="text-sm font-medium text-on-surface mb-1">Generation Failed</p>
                      <p className="text-xs text-on-surface-variant">There was an error generating your course. Please try again.</p>
                      <button
                        onClick={() => {
                          if (confirm("Delete this failed generation and try again?")) {
                            handleDeleteCourse(selectedGeneration.id);
                          }
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all bg-error text-on-error hover:shadow-lg hover:shadow-error/30"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Delete & Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editModal.show && editFormData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 min-h-screen md:min-h-auto md:max-w-4xl md:my-8 w-full md:rounded-2xl flex flex-col max-h-[95vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-outline-variant/10 bg-surface-container">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">Edit Course</h2>
                <p className="text-xs text-on-surface-variant mt-1">Review and edit your generated course before submitting to admin</p>
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
                    setEditingLessonKey(null);
                    setEditingQuizKey(null);
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
                      {courseContent.modules.map((module: any, moduleIdx: number) => (
                        <div key={`module-${moduleIdx}`} className="bg-surface-container rounded-lg p-6 border border-outline-variant/30">
                          <h3 className="text-lg font-semibold text-on-surface mb-4">{module.title}</h3>

                          {/* Lessons */}
                          {module.lessons && module.lessons.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-on-surface-variant mb-3 uppercase tracking-wider">Lessons</h4>
                              <div className="space-y-2">
                                {module.lessons && module.lessons.map((lesson: any, lessonIdx: number) => {
                                  const lessonKey = `${moduleIdx}-${lessonIdx}`;
                                  const isEditing = editingLessonKey === lessonKey;
                                  return (
                                    <div
                                      key={lessonKey}
                                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 transition-colors"
                                    >
                                      <div
                                        className="flex items-start justify-between cursor-pointer hover:bg-surface-container-low rounded transition-colors -mx-4 -mt-4 -mb-0 px-4 pt-4 pb-2"
                                        onClick={() => {
                                          if (isEditing) {
                                            setEditingLessonKey(null);
                                            setEditingLessonData(null);
                                          } else {
                                            setEditingLessonKey(lessonKey);
                                            setEditingLessonData({ ...lesson });
                                          }
                                        }}
                                      >
                                        <div className="flex-1">
                                          <p className="font-medium text-on-surface">{isEditing ? editingLessonData?.title : lesson.title}</p>
                                          <p className="text-xs text-on-surface-variant mt-1">Duration: {isEditing ? editingLessonData?.duration_minutes : lesson.duration_minutes} min</p>
                                        </div>
                                        <span className="material-symbols-outlined text-on-surface-variant">
                                          {isEditing ? "expand_less" : "expand_more"}
                                        </span>
                                      </div>

                                      {isEditing && editingLessonData && (
                                        <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-3">
                                          <div>
                                            <label className="text-xs font-medium text-on-surface-variant mb-1 block">Title</label>
                                            <input
                                              type="text"
                                              value={editingLessonData.title || ""}
                                              onChange={(e) => { e.stopPropagation(); setEditingLessonData({ ...editingLessonData, title: e.target.value }); }}
                                              className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary"
                                              placeholder="Lesson title"
                                              onClick={(e) => e.stopPropagation()}
                                              onKeyDown={(e) => e.stopPropagation()}
                                              onMouseDown={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-on-surface-variant mb-1 block">Content</label>
                                            <textarea
                                              value={editingLessonData.content_markdown || ""}
                                              onChange={(e) => { e.stopPropagation(); setEditingLessonData({ ...editingLessonData, content_markdown: e.target.value }); }}
                                              className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
                                              rows={3}
                                              placeholder="Content (markdown)"
                                              onClick={(e) => e.stopPropagation()}
                                              onKeyDown={(e) => e.stopPropagation()}
                                              onMouseDown={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-on-surface-variant mb-1 block">Duration (minutes)</label>
                                            <input
                                              type="number"
                                              value={editingLessonData.duration_minutes || 0}
                                              onChange={(e) => { e.stopPropagation(); setEditingLessonData({ ...editingLessonData, duration_minutes: parseInt(e.target.value) || 0 }); }}
                                              className="w-full px-3 py-2 rounded border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:ring-1 focus:ring-primary"
                                              placeholder="Duration (minutes)"
                                              min="1"
                                              onClick={(e) => e.stopPropagation()}
                                              onKeyDown={(e) => e.stopPropagation()}
                                              onMouseDown={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Quizzes */}
                          {module.quizzes && module.quizzes.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-on-surface-variant mb-3 uppercase tracking-wider">Quizzes</h4>
                              <div className="space-y-2">
                                {module.quizzes && module.quizzes.map((quiz: any, quizIdx: number) => {
                                  const quizKey = `${moduleIdx}-${quizIdx}`;
                                  const isEditing = editingQuizKey === quizKey;
                                  return (
                                    <div
                                      key={quizKey}
                                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 transition-colors"
                                    >
                                      <div
                                        className="flex items-start justify-between cursor-pointer hover:bg-surface-container-low rounded transition-colors -mx-4 -mt-4 -mb-0 px-4 pt-4 pb-2"
                                        onClick={() => {
                                          if (isEditing) {
                                            setEditingQuizKey(null);
                                            setEditingQuizData(null);
                                          } else {
                                            setEditingQuizKey(quizKey);
                                            setEditingQuizData({ ...quiz });
                                          }
                                        }}
                                      >
                                        <div className="flex-1">
                                          <p className="font-medium text-on-surface">{isEditing ? editingQuizData?.title : quiz.title}</p>
                                          <p className="text-xs text-on-surface-variant mt-1">
                                            Passing: {isEditing ? editingQuizData?.passing_score : quiz.passing_score}% | Duration: {isEditing ? editingQuizData?.duration_minutes : quiz.duration_minutes} min
                                          </p>
                                        </div>
                                        <span className="material-symbols-outlined text-on-surface-variant">
                                          {isEditing ? "expand_less" : "expand_more"}
                                        </span>
                                      </div>

                                      {isEditing && editingQuizData && (
                                        <div className="border-t border-outline-variant/20 mt-3 pt-4 space-y-3">
                                          <div>
                                            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">Title</label>
                                            <input
                                              type="text"
                                              value={editingQuizData.title || ""}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                setEditingQuizData({ ...editingQuizData, title: e.target.value });
                                              }}
                                              onMouseDown={(e) => e.stopPropagation()}
                                              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                                            />
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">Passing Score (%)</label>
                                              <input
                                                type="number"
                                                value={editingQuizData.passing_score || ""}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  setEditingQuizData({ ...editingQuizData, passing_score: parseInt(e.target.value) || 0 });
                                                }}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">Duration (minutes)</label>
                                              <input
                                                type="number"
                                                value={editingQuizData.duration_minutes || ""}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  setEditingQuizData({ ...editingQuizData, duration_minutes: parseInt(e.target.value) || 0 });
                                                }}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">Description</label>
                                            <textarea
                                              value={editingQuizData.description || ""}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                setEditingQuizData({ ...editingQuizData, description: e.target.value });
                                              }}
                                              onMouseDown={(e) => e.stopPropagation()}
                                              rows={3}
                                              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors resize-none"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
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
                        setEditingLessonKey(null);
                        setEditingLessonData(null);
                        setEditingQuizKey(null);
                        setEditingQuizData(null);
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

      <Footer />
    </>
  );
}
