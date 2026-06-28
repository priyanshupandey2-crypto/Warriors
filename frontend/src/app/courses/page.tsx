"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

const categories = ["All Categories", "Computer Science", "Business & Strategy", "Creative Design", "Marketing"];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedDiff, setSelectedDiff] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const itemsPerPage = 9;
  const apiCall = useApiCall();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await apiCall<any>("/api/progress/my-courses");
        if (response && response.courses) {
          const enrolledIds = new Set<string>(response.courses.map((c: any) => c.course_id.toString()));
          setEnrolledCourseIds(enrolledIds);
        }
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error);
      }
    };

    fetchEnrolledCourses();
  }, [apiCall]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const skip = (currentPage - 1) * itemsPerPage;
        let url = `/api/courses/?skip=${skip}&limit=${itemsPerPage}`;


        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        if (selectedDiff) {
          url += `&difficulty=${encodeURIComponent(selectedDiff)}`;
        }
        if (selectedCats.length > 0) {
          const encodedCats = selectedCats.map(c => encodeURIComponent(c)).join(",");
          url += `&categories=${encodedCats}`;
        }
        if (sortBy) {
          url += `&sort_by=${sortBy}`;
        }

        const response = await apiCall<any>(url);

        if (response && typeof response === 'object' && 'data' in response && 'total' in response) {
          setCourses(response.data || []);
          setTotalCourses(response.total || 0);
        } else if (Array.isArray(response)) {
          setCourses(response);
          setTotalCourses(response.length);
        } else {
          setCourses([]);
          setTotalCourses(0);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCourses([]);
        setTotalCourses(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, search, selectedDiff, selectedCats, sortBy, apiCall, itemsPerPage]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // The useEffect will automatically run after search state updates
    }, 500);
  };

  const filtered = courses;

  const totalPages = Math.ceil(totalCourses / itemsPerPage);

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-20">
        {/* Hero Search */}
        <section className="bg-surface-container-low pt-12 pb-8 px-4">
          <div className="max-w-[1280px] mx-auto text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-on-surface">Expand Your Knowledge</h1>
            <p className="text-lg text-on-surface-variant mb-8 max-w-2xl">
              Discover high-quality courses taught by industry experts across Design, Business, and Computer Science.
            </p>
            <div className="relative max-w-2xl group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full pl-12 pr-6 py-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-base shadow-sm"
                placeholder="Search for courses, skills, or authors..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Filters & Grid */}
        <section className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
              <div>
                <h3 className="text-sm font-medium text-primary mb-4 uppercase tracking-wider">Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const isAll = cat === "All Categories";
                    const isChecked = isAll ? selectedCats.length === 0 : selectedCats.includes(cat);

                    return (
                      <label key={cat} className="flex items-center gap-2 group cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary accent-primary"
                          checked={isChecked}
                          onChange={() => {
                            if (isAll) {
                              setSelectedCats([]);
                              setCurrentPage(1);
                            } else {
                              let newCats: string[];
                              if (selectedCats.includes(cat)) {
                                newCats = selectedCats.filter(c => c !== cat);
                              } else {
                                newCats = [...selectedCats, cat];
                              }
                              setSelectedCats(newCats);
                              setCurrentPage(1);
                            }
                          }}
                        />
                        <span className="text-base text-on-surface group-hover:text-primary transition-colors">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="pt-4 border-t border-outline-variant">
                <h3 className="text-sm font-medium text-primary mb-4 uppercase tracking-wider">Difficulty</h3>
                <div className="space-y-2">
                  {["All", "Beginner", "Intermediate", "Advanced"].map((diff) => {
                    const isAll = diff === "All";
                    const isChecked = isAll ? selectedDiff === "" : selectedDiff === diff;
                    return (
                      <label key={diff} className="flex items-center gap-2 group cursor-pointer">
                        <input
                          type="radio" name="difficulty"
                          className="w-5 h-5 border-outline-variant text-primary focus:ring-primary accent-primary"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedDiff(isAll ? "" : diff);
                            setCurrentPage(1);
                          }}
                        />
                        <span className="text-base text-on-surface">{diff}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Course Grid */}
            <div className="flex-grow">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="mb-8 flex justify-between items-center">
                    <p className="text-sm font-medium text-on-surface-variant">
                      Total <span className="font-bold text-on-surface">{totalCourses}</span> courses • Showing <span className="font-bold text-on-surface">{filtered.length}</span> courses
                    </p>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    >
                      <option value="newest">Newest</option>
                      <option value="popular">Most Popular</option>
                      <option value="duration">Course Duration</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.length > 0 ? (
                      filtered.map((course) => {
                        const isEnrolled = enrolledCourseIds.has(course.id);
                        return (
                          <div key={course.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm course-card-hover flex flex-col relative">
                            {isEnrolled && (
                              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-tertiary text-on-primary px-3 py-1 rounded-full text-xs font-semibold">
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  check_circle
                                </span>
                                Enrolled
                              </div>
                            )}
                            <div className="relative h-48 overflow-hidden bg-surface-container">
                              {course.thumbnail_url && !failedImages.has(course.id) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  className="w-full h-full object-cover"
                                  src={course.thumbnail_url}
                                  alt={course.title}
                                  onError={() => setFailedImages(prev => new Set([...prev, course.id]))}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface-container">
                                  <div className="text-center">
                                    <span className="material-symbols-outlined text-5xl text-outline-variant mb-2 block">image_not_supported</span>
                                    <p className="text-sm text-on-surface-variant">No image available</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-bold text-on-surface line-clamp-2 flex-1">{course.title}</h3>
                                {course.category && (
                                  <span className="ml-2 px-3 py-1 bg-primary text-on-primary text-xs font-medium rounded whitespace-nowrap">
                                    {course.category}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{course.description}</p>
                              <div className="flex items-center gap-4 mb-6 text-on-surface-variant text-sm">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                                  {course.difficulty_level}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                                  {course.duration_weeks === 0 ? "1w" : `${course.duration_weeks}w`}
                                </span>
                              </div>
                              <div className="mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                                  <span className="material-symbols-outlined text-[18px]">group</span>
                                  {course.enrollments} enrolled
                                </div>
                                <Link href={`/course/${course.id}`} className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                                  View Course
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <p className="text-on-surface-variant">No courses found matching your criteria</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>

                  {/* Generate page numbers with smart pagination */}
                  {(() => {
                    const pagesToShow = 9;
                    let pages: number[] = [];

                    if (totalPages <= pagesToShow) {
                      // Show all pages if 9 or fewer
                      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                    } else {
                      // Show 9 pages centered around current page
                      let start = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
                      let end = start + pagesToShow - 1;

                      if (end > totalPages) {
                        end = totalPages;
                        start = Math.max(1, end - pagesToShow + 1);
                      }

                      pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
                    }

                    return pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === page
                            ? "bg-primary text-on-primary"
                            : "border border-outline-variant text-on-surface hover:bg-surface-container"
                          }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}

                  {/* Show last page with ellipsis if needed */}
                  {totalPages > 9 && (() => {
                    const start = Math.max(1, currentPage - 4);
                    const end = Math.min(totalPages, start + 8);
                    return end < totalPages;
                  })() && (
                      <>
                        <span className="text-outline">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-outline-variant text-on-surface hover:bg-surface-container"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
