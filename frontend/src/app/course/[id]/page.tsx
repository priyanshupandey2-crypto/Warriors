"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import { useApiCall } from "@/hooks/useApiCall";

interface Lesson {
  id: number;
  title: string;
  duration_minutes: number;
  content_markdown?: string;
  order: number;
}

interface Module {
  id?: number;
  title: string;
  description?: string;
  lessons?: Lesson[];
}

interface CoursePreview {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  total_duration_hours: number;
  modules: Module[];
  lesson_sequence: Lesson[];
}

export default function CourseLearningPage() {
  const params = useParams();
  const courseId = params.id;
  const apiCall = useApiCall();

  const [course, setCourse] = useState<CoursePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set());
  const [markedLessonIds, setMarkedLessonIds] = useState<Set<number>>(new Set());
  const [markedToRevisit, setMarkedToRevisit] = useState(false);
  const [revisitToggling, setRevisitToggling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await apiCall<CoursePreview>(
          `/api/courses/${courseId}/preview`
        );
        if (response) {
          setCourse(response);
          // Will set active lesson after enrollment status is checked
          // Default to first lesson for now
          if (response.modules && response.modules.length > 0) {
            setActiveModule(response.modules[0]);
            if (response.modules[0].lessons && response.modules[0].lessons.length > 0) {
              setActiveLesson(response.modules[0].lessons[0]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
      checkEnrollmentStatus();
    }
  }, [courseId, apiCall]);

  const setFirstUncompletedLesson = (course: CoursePreview, completedLessonIds: Set<number>) => {
    // Find first lesson that is NOT completed
    if (course.lesson_sequence && course.lesson_sequence.length > 0) {
      const firstIncomplete = course.lesson_sequence.find(
        (lesson) => !completedLessonIds.has(lesson.id)
      );

      if (firstIncomplete) {
        // Find the module containing this lesson
        const moduleWithLesson = course.modules?.find((mod) =>
          mod.lessons?.some((l) => l.id === firstIncomplete.id)
        );
        if (moduleWithLesson) {
          setActiveModule(moduleWithLesson);
          setActiveLesson(firstIncomplete);
        }
      }
    }
  };

  useEffect(() => {
    if (activeLesson) {
      checkLessonRevisitStatus(activeLesson.id);
    }
  }, [activeLesson]);

  useEffect(() => {
    // When both course and completed lessons are loaded, set first uncompleted lesson
    if (course && enrolled && completedLessonIds.size >= 0) {
      setFirstUncompletedLesson(course, completedLessonIds);
    }
  }, [course, enrolled, completedLessonIds]);

  const checkEnrollmentStatus = async () => {
    try {
      const response = await apiCall<any>(`/api/progress/course/${courseId}`);
      if (response) {
        setEnrolled(true);
        setProgressPercentage(response.progress_percentage || 0);
        setCompletedLessons(response.completed_lessons || 0);

        // Mark completed lessons and marked lessons
        if (response.lesson_progress && Array.isArray(response.lesson_progress)) {
          const completedIds = new Set(
            response.lesson_progress
              .filter((lp: any) => lp.is_completed)
              .map((lp: any) => lp.lesson_id)
          );
          const markedIds = new Set(
            response.lesson_progress
              .filter((lp: any) => lp.marked_to_revisit)
              .map((lp: any) => lp.lesson_id)
          );
          setCompletedLessonIds(completedIds);
          setMarkedLessonIds(markedIds);
        }
      }
    } catch (error) {
      setEnrolled(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const response = await apiCall("/api/progress/enroll", {
        method: "POST",
        body: JSON.stringify({ course_id: parseInt(courseId as string) }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response) {
        setEnrolled(true);
        setProgressPercentage(0);
        setCompletedLessons(0);
      }
    } catch (error) {
      console.error("Failed to enroll:", error);
    } finally {
      setEnrolling(false);
    }
  };

  const totalLessons = course?.lesson_sequence?.length || 0;

  const handleLessonClick = (lesson: Lesson, module: Module) => {
    setActiveLesson(lesson);
    setActiveModule(module);
    checkLessonRevisitStatus(lesson.id);
  };

  const checkLessonRevisitStatus = async (lessonId: number) => {
    try {
      const response = await apiCall<any>(`/api/progress/lesson/${lessonId}/progress`);
      if (response) {
        setMarkedToRevisit(response.marked_to_revisit || false);
      }
    } catch (error) {
      setMarkedToRevisit(false);
    }
  };

  const updateMarkedLessonsSet = (lessonId: number, isMarked: boolean) => {
    setMarkedLessonIds(prev => {
      const newSet = new Set(prev);
      if (isMarked) {
        newSet.add(lessonId);
      } else {
        newSet.delete(lessonId);
      }
      return newSet;
    });
  };

  const handleToggleRevisit = async () => {
    if (!activeLesson) return;

    try {
      setRevisitToggling(true);
      const response = await apiCall("/api/progress/lesson/revisit", {
        method: "POST",
        body: JSON.stringify({
          lesson_id: activeLesson.id,
          marked_to_revisit: !markedToRevisit,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response) {
        const newMarkedStatus = !markedToRevisit;
        setMarkedToRevisit(newMarkedStatus);
        updateMarkedLessonsSet(activeLesson.id, newMarkedStatus);
      }
    } catch (error) {
      console.error("Failed to toggle revisit mark:", error);
    } finally {
      setRevisitToggling(false);
    }
  };

  const handlePreviousLesson = () => {
    if (!activeLesson || !course) return;

    const currentIndex = course.lesson_sequence.findIndex(
      (l) => l.id === activeLesson.id
    );

    if (currentIndex > 0) {
      const previousLesson = course.lesson_sequence[currentIndex - 1];
      // Find the module that contains this lesson
      const moduleWithLesson = course.modules?.find((mod) =>
        mod.lessons?.some((l) => l.id === previousLesson.id)
      );
      if (moduleWithLesson) {
        handleLessonClick(previousLesson, moduleWithLesson);
      }
    }
  };

  const handleNextLesson = () => {
    if (!activeLesson || !course) return;

    const currentIndex = course.lesson_sequence.findIndex(
      (l) => l.id === activeLesson.id
    );

    if (currentIndex < course.lesson_sequence.length - 1) {
      const nextLesson = course.lesson_sequence[currentIndex + 1];
      // Find the module that contains this lesson
      const moduleWithLesson = course.modules?.find((mod) =>
        mod.lessons?.some((l) => l.id === nextLesson.id)
      );
      if (moduleWithLesson) {
        handleLessonClick(nextLesson, moduleWithLesson);
      }
    }
  };

  const isPreviousDisabled = !activeLesson || course?.lesson_sequence?.findIndex((l) => l.id === activeLesson.id) === 0;
  const isNextDisabled = !activeLesson || course?.lesson_sequence?.findIndex((l) => l.id === activeLesson.id) === (totalLessons - 1);

  const handleCompleteLesson = async () => {
    if (!activeLesson) return;

    try {
      const response = await apiCall("/api/progress/lesson/complete", {
        method: "POST",
        body: JSON.stringify({
          lesson_id: activeLesson.id,
          time_spent_minutes: activeLesson.duration_minutes,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // Update progress bar
        setProgressPercentage(response.progress_percentage || 0);
        setCompletedLessons(response.completed_lessons || 0);
        setCompletedLessonIds(prev => new Set([...prev, activeLesson.id]));

        // Mark lesson as completed and move to next
        if (!isNextDisabled) {
          handleNextLesson();
        }
      }
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main */}
      <main className="pt-20 h-screen flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 bg-surface-container-lowest border-r border-surface-container shadow-sm overflow-y-auto custom-scrollbar flex flex-col hidden md:flex">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-on-surface mb-2">
              {course?.title}
            </h1>
            {enrolled ? (
              <>
                <div className="w-full bg-surface-container rounded-full h-2 mb-6 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-on-surface-variant">
                  <span>Progress</span>
                  <span className="text-primary font-bold">{progressPercentage}% Complete</span>
                </div>
              </>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-primary text-on-primary font-semibold py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {enrolling ? "Enrolling..." : "Enroll in Course"}
              </button>
            )}
          </div>

          <nav className="flex-1 space-y-1 pb-8">
            {course?.modules && course.modules.map((module, moduleIdx) => (
              <div key={moduleIdx} className="px-6 mb-4">
                <div className="flex items-center justify-between py-2 cursor-pointer group">
                  <h2 className="text-sm font-medium text-on-surface uppercase tracking-wider">{module.title}</h2>
                </div>
                <div className="space-y-1 mt-2">
                  {module.lessons && module.lessons.map((lesson, lessonIdx) => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    const isMarked = markedLessonIds.has(lesson.id);
                    return (
                      <button
                        key={lessonIdx}
                        onClick={() => handleLessonClick(lesson, module)}
                        className={`flex items-center gap-2 p-2 rounded-lg w-full text-left transition-all ${
                          activeLesson?.id === lesson.id
                            ? "bg-primary-container text-on-primary-container shadow-sm border border-primary/10"
                            : "hover:bg-surface-container-low text-on-surface-variant"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined ${
                            activeLesson?.id === lesson.id ? "text-on-primary-container" : isCompleted ? "text-tertiary" : "text-outline"
                          }`}
                          style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {isCompleted ? "check_circle" : "play_circle"}
                        </span>
                        <span className={`flex-1 text-base ${activeLesson?.id === lesson.id ? "font-semibold" : ""}`}>
                          {lesson.title}
                        </span>
                        {isMarked && (
                          <span
                            className={`material-symbols-outlined text-sm ${
                              activeLesson?.id === lesson.id ? "text-on-primary-container" : "text-tertiary"
                            }`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            bookmark
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <section className="flex-1 flex flex-col bg-background relative overflow-y-auto">
          {/* Top Bar */}
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-container flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-on-surface-variant">
                {activeModule?.title} • {activeLesson?.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleRevisit}
                disabled={revisitToggling}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium transition-all active:scale-95 ${
                  markedToRevisit
                    ? "border-tertiary bg-tertiary-container text-on-tertiary-container"
                    : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: markedToRevisit ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                {markedToRevisit ? "Marked" : "Mark to Revisit"}
              </button>
              <button
                onClick={handleCompleteLesson}
                disabled={isNextDisabled && activeLesson?.order === totalLessons}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-tertiary text-on-primary text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                {activeLesson?.order === totalLessons ? "Course Complete!" : "Complete & Next"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full space-y-8 pb-12 overflow-y-auto">
            {activeLesson ? (
              <div className="space-y-6">
                {/* Lesson Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-surface-container-low rounded-lg border border-surface-container">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    <div>
                      <p className="text-sm text-on-surface-variant">Duration</p>
                      <p className="font-semibold text-on-surface">{activeLesson.duration_minutes} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-tertiary">check_circle</span>
                    <div>
                      <p className="text-sm text-on-surface-variant">Lesson Progress</p>
                      <p className="font-semibold text-on-surface">{activeLesson.order} of {totalLessons}</p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-4xl font-bold text-on-surface mt-6 mb-4 first:mt-0" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-3xl font-semibold text-on-surface mt-5 mb-3" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-2xl font-semibold text-on-surface mt-4 mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="text-base text-on-surface-variant leading-relaxed mb-3" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 mb-4 text-on-surface-variant" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-6 space-y-2 mb-4 text-on-surface-variant" {...props} />,
                      li: ({ node, ...props }) => <li className="text-base text-on-surface-variant" {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code className="bg-surface-container px-2 py-1 rounded text-sm font-mono text-primary" {...props} />
                        ) : (
                          <code className="block bg-surface-container p-4 rounded-lg overflow-x-auto text-sm font-mono text-primary mb-4" {...props} />
                        ),
                      pre: ({ node, ...props }) => <pre className="bg-surface-container p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                      blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic text-on-surface-variant mb-4" {...props} />,
                      hr: ({ node, ...props }) => <hr className="border-t border-outline-variant my-6" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-on-surface" {...props} />,
                      em: ({ node, ...props }) => <em className="italic text-on-surface-variant" {...props} />,
                    }}
                  >
                    {activeLesson.content_markdown || "Lesson content goes here. This is a placeholder for the actual lesson material."}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-on-surface-variant">Select a lesson to start learning</p>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-surface-container bg-white/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
            <button
              onClick={handlePreviousLesson}
              disabled={isPreviousDisabled}
              className={`flex items-center gap-1 transition-colors ${
                isPreviousDisabled
                  ? "text-outline-variant cursor-not-allowed opacity-50"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Previous Lesson
            </button>
            <span className="text-sm text-on-surface-variant">
              Lesson {activeLesson?.order} of {totalLessons}
            </span>
            <button
              onClick={handleNextLesson}
              disabled={isNextDisabled}
              className={`flex items-center gap-1 transition-colors ${
                isNextDisabled
                  ? "text-outline-variant cursor-not-allowed opacity-50"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Next Lesson
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
