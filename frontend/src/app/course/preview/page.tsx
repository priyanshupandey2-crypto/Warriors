"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useApiCall } from "@/hooks/useApiCall";

interface Module {
  title: string;
  description?: string;
  lessons_count?: number;
}

interface CoursePreview {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  total_duration_hours: number;
  learning_objectives: string[];
  overview: string;
  modules: Module[];
  lesson_sequence: any[];
}

export default function CoursePreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id") || "1";

  const [course, setCourse] = useState<CoursePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const apiCall = useApiCall();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await apiCall<CoursePreview>(
          `/api/courses/${courseId}/preview`
        );
        if (response) {
          setCourse(response);
          if (response.modules && response.modules.length > 0) {
            setOpenModules({ [response.modules[0].title]: true });
          }
        }
      } catch (error) {
        console.error("Failed to fetch course preview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, apiCall]);

  const toggle = (title: string) => {
    setOpenModules((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const response = await apiCall("/api/progress/enroll", {
        method: "POST",
        body: JSON.stringify({ course_id: parseInt(courseId) }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response) {
        setEnrolled(true);
        // Redirect to course learning page after a short delay
        setTimeout(() => {
          router.push(`/course/${courseId}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to enroll:", error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <p className="text-on-surface-variant">Course not found</p>
        </main>
        <Footer />
      </>
    );
  }

  const totalLessons = course.lesson_sequence?.length || 0;

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden pt-12 pb-8 px-4">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="flex-1 text-center md:text-left">
              <span className="bg-tertiary-container text-on-tertiary-container text-xs font-semibold px-4 py-2 rounded-full mb-4 inline-block">
                AI-Tailored Learning
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-on-background mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-on-surface-variant mb-8 max-w-2xl">
                {course.description}
              </p>
            </div>
            <div className="flex-1 w-full max-w-md animate-float">
              <div className="aspect-video rounded-xl shadow-2xl overflow-hidden relative group bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-outline">
                  play_circle
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Success Message */}
        <section className="bg-surface-container-low py-8 px-4">
          <div className="max-w-[1280px] mx-auto">
            <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-sm border border-primary/10 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-tertiary-container/20 rounded-full flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  celebration
                </span>
              </div>
              <h2 className="text-3xl font-semibold text-primary">Course Tailored Successfully</h2>
              <p className="text-lg text-on-surface-variant max-w-xl">
                {course.overview || "Our AI engine has analyzed your learning goals and professional background to build a roadmap perfectly aligned with your career trajectory."}
              </p>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-semibold text-on-background">Curriculum Overview</h3>
              <span className="text-sm text-on-surface-variant">
                {course.modules?.length || 0} Modules • {totalLessons} Lessons • {course.total_duration_hours}h Total
              </span>
            </div>
            <div className="space-y-4">
              {course.modules && course.modules.map((mod) => (
                <div
                  key={mod.title}
                  className="group border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest hover:border-primary transition-all duration-300"
                >
                  <button
                    className="w-full flex items-center justify-between p-6 text-left"
                    onClick={() => toggle(mod.title)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined">school</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold">{mod.title}</h4>
                        <p className="text-xs text-on-surface-variant">
                          {mod.lessons_count || 0} Lessons
                        </p>
                      </div>
                    </div>
                    <span
                      className="material-symbols-outlined transition-transform duration-300"
                      style={{ transform: openModules[mod.title] ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      expand_more
                    </span>
                  </button>
                  {openModules[mod.title] && (
                    <div className="p-6 pt-0 border-t border-outline-variant bg-surface/30">
                      <p className="text-on-surface-variant py-4">
                        {mod.description || "Module details"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Objectives */}
        {course.learning_objectives && course.learning_objectives.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-[1280px] mx-auto">
              <h3 className="text-2xl font-semibold text-on-background mb-8">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {course.learning_objectives.map((obj, i) => (
                  <div key={i} className="flex gap-4 p-6 bg-surface-container-lowest rounded-xl border border-outline-variant">
                    <span className="material-symbols-outlined text-primary flex-shrink-0">
                      check_circle
                    </span>
                    <span className="text-on-surface">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-12 px-4 bg-primary-container/5 border-t border-primary/10">
          <div className="max-w-[1280px] mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-on-background mb-4">Ready to start your journey?</h2>
            <p className="text-lg text-on-surface-variant mb-8 max-w-2xl mx-auto">
              Enroll now and begin your learning path with our AI-tailored curriculum.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                disabled={enrolling || enrolled}
                className={`text-2xl font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 w-full sm:w-auto ${
                  enrolled
                    ? "bg-tertiary text-on-primary hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-primary text-on-primary hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
                onClick={handleEnroll}
              >
                {enrolling ? "Enrolling..." : enrolled ? "Enrolled! Redirecting..." : "Enroll in Course"}
              </button>
              <button
                className="flex items-center justify-center gap-2 border border-outline text-on-surface text-2xl font-semibold px-8 py-4 rounded-xl hover:bg-surface-container transition-all w-full sm:w-auto"
                onClick={() => router.push("/generate")}
              >
                Create a New Course
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
