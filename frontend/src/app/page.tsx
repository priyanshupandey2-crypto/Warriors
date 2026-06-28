"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useApiCall } from "@/hooks/useApiCall";

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  duration_weeks: number;
  thumbnail_url: string | null;
  rating: number | null;
  enrollments: number;
  category?: string;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Computer Science": "bg-primary-container/90 text-on-primary-container",
    "Creative Design": "bg-secondary-container/90 text-on-secondary-container",
    "Business & Strategy": "bg-tertiary-container/90 text-on-tertiary-container",
    "Marketing": "bg-primary-container/90 text-on-primary-container",
  };
  return colors[category] || "bg-primary-container/90 text-on-primary-container";
};

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const apiCall = useApiCall();

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setLoading(true);
        const response = await apiCall<any>(
          `/api/courses/?skip=0&limit=3&sort_by=popular`
        );

        if (response && typeof response === "object" && "data" in response) {
          setCourses(response.data || []);
        } else if (Array.isArray(response)) {
          setCourses(response.slice(0, 3));
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCourses();
  }, [apiCall]);
  return (
    <>
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="relative px-4 md:px-8 py-12 md:py-[100px] max-w-[1280px] mx-auto">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(196,181,253,0.12))',
                  border: '1px solid rgba(245,158,11,0.25)',
                  color: '#b45309',
                }}
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span className="text-sm font-semibold">Personalized AI-Driven Education</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight" style={{ color: '#1a1a1a', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                The Future of Learning,{' '}<br className="hidden md:block" />
                <span style={{ background: 'linear-gradient(135deg, #92400e, #f59e0b, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>Tailored for You</span>
              </h1>
              <p className="text-lg max-w-[560px]" style={{ color: '#3d3d3d', lineHeight: 1.8 }}>
                Harness the power of adaptive curriculum and world-class expertise. AuraLearn transforms
                high-impact education into an accessible, energetic experience designed to help you thrive in
                the modern economy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/generate"
                  className="btn-primary text-sm px-8 py-4 rounded-xl flex items-center justify-center gap-2 group"
                >
                  Generate Course
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[20px]">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href="/courses"
                  className="text-sm font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{
                    background: 'rgba(255,255,255,0.70)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(245,158,11,0.25)',
                    color: '#92400e',
                    boxShadow: '0 4px 16px rgba(245,158,11,0.10)'
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                  Browse Courses
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-6" style={{ borderTop: '1px solid rgba(245,158,11,0.15)' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #c084fc)', boxShadow: '0 4px 12px rgba(245,158,11,0.35)', border: '2px solid rgba(255,255,255,0.80)' }}
                >
                  10+
                </div>
                <p className="text-sm" style={{ color: '#3d3d3d' }}>
                  Joined by{' '}
                  <span className="font-bold" style={{ color: '#1a1a1a' }}>10+ learners</span>{' '}
                  worldwide
                </p>
              </div>
            </div>
            <div className="lg:col-span-5 relative hidden lg:block">
              {/* Ambient glow rings behind image */}
              <div
                className="absolute -inset-8 rounded-full opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.35) 0%, rgba(196,181,253,0.20) 60%, transparent 80%)' }}
              />
              {/* Image container — no overflow:hidden so transparent bg shows through */}
              <div className="relative z-10 w-full hover-lift">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  style={{ borderRadius: '24px', maxHeight: '520px' }}
                  src="/hero-workspace.png"
                  alt="AuraLearn premium learning workspace with floating course modules"
                />
                {/* Live pill — positioned at bottom-right of image */}
                <div
                  className="absolute bottom-6 right-4 p-3 rounded-2xl flex items-center gap-2.5"
                  style={{
                    background: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.60)',
                    boxShadow: '0 8px 24px rgba(245,158,11,0.12), 0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.60)' }} />
                  <div>
                    <p className="text-[10px] font-semibold" style={{ color: '#9ca3af' }}>Live Now</p>
                    <p className="text-xs font-bold" style={{ color: '#1a1a1a', lineHeight: 1.3 }}>Forward Deployed Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Browse Courses */}
        <section className="py-12 px-4 md:px-8 max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-on-surface">Browse Courses</h2>
              <p className="text-base text-on-surface-variant">
                Explore our curated selection of high-momentum learning paths.
              </p>
            </div>
            <Link
              href="/courses"
              className="group flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all"
            >
              View All Courses
              <span className="material-symbols-outlined">trending_flat</span>
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link
                  href={`/course/${course.id}`}
                  key={course.id}
                  className="group bg-surface shadow-sm hover:shadow-xl rounded-xl overflow-hidden border border-surface-container-high transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden bg-surface-container">
                    {course.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src={course.thumbnail_url}
                        alt={course.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-outline">image</span>
                      </div>
                    )}
                    {course.category && (
                      <div className="absolute top-4 right-4">
                        <span
                          className={`${getCategoryColor(
                            course.category
                          )} backdrop-blur-sm text-xs font-semibold px-4 py-1 rounded-full`}
                        >
                          {course.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 text-primary mb-2">
                      <span className="material-symbols-outlined text-[18px]">
                        signal_cellular_alt
                      </span>
                      <span className="text-xs uppercase tracking-wider font-bold">
                        {course.difficulty_level}
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold text-on-surface mb-2 leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-base text-on-surface-variant line-clamp-2 mb-6">
                      {course.description}
                    </p>
                    <div className="mt-auto pt-6 border-t border-surface-variant flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-outline text-[20px]">
                          schedule
                        </span>
                        <span className="text-sm text-on-surface-variant">
                          {course.duration_weeks}w
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-outline text-[20px]">group</span>
                        <span className="text-sm text-on-surface-variant">{course.enrollments}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
