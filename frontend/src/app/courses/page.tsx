'use client';

import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import CourseCard from '@/components/shared/CourseCard';
import { DEMO_COURSES } from '@/lib/demo-data';

export default function CoursesPage() {
  const [difficulty, setDifficulty] = useState<string>('');

  const filtered = difficulty ? DEMO_COURSES.filter((c) => c.level === difficulty) : DEMO_COURSES;

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <Navbar />

      <main className="flex-grow py-xl px-md md:px-lg">
        <div className="max-w-container-max mx-auto">
          {/* Header */}
          <div className="mb-xl">
            <div className="flex items-center gap-sm mb-md">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="font-label-sm font-bold text-primary uppercase tracking-wide">Live Catalog</p>
            </div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-sm">
              Browse {filtered.length} Courses
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Join {(DEMO_COURSES.reduce((sum, c) => sum + parseInt(c.students || '0'), 0) / 1000).toFixed(1)}k+ students learning right now
            </p>
          </div>

          <div className="flex gap-lg lg:gap-xl">
            {/* Sidebar Filters */}
            <aside className="w-48 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24 space-y-lg bg-surface-container-lowest rounded-lg p-lg border border-surface-container-high">
                <div>
                  <h3 className="font-label-lg font-bold text-on-background mb-md">Filter by Level</h3>
                  <div className="space-y-sm">
                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                      <label key={level} className="flex items-center gap-sm cursor-pointer group">
                        <input
                          type="radio"
                          name="difficulty"
                          value={level}
                          checked={difficulty === level}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="w-4 h-4 cursor-pointer accent-primary"
                        />
                        <span className="font-body-md text-on-surface-variant group-hover:text-primary transition-colors">
                          {level}
                        </span>
                        <span className="font-label-sm text-on-surface-variant ml-auto">
                          {DEMO_COURSES.filter((c) => c.level === level).length}
                        </span>
                      </label>
                    ))}
                  </div>
                  {difficulty && (
                    <button
                      onClick={() => setDifficulty('')}
                      className="font-label-sm font-bold text-primary hover:underline pt-md w-full text-left"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-label-lg font-bold text-on-background mb-md">Categories</h3>
                  <div className="space-y-sm">
                    {Array.from(new Set(DEMO_COURSES.map((c) => c.category))).map((cat) => (
                      <div key={cat} className="font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                        {cat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Course Grid */}
            <div className="flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {filtered.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    image={course.image}
                    category={course.category}
                    level={course.level}
                    duration={course.duration}
                    rating={course.rating}
                    students={course.students}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant py-lg px-md md:px-lg mt-auto">
        <div className="max-w-container-max mx-auto text-center font-label-md text-on-surface-variant">
          © 2024 AuraLearn
        </div>
      </footer>
    </div>
  );
}
