'use client';

import Link from 'next/link';

export default function MyCoursesPage() {
  const enrolledCourses = [
    { id: '1', title: 'UX Design Fundamentals', progress: 65, duration: '4 weeks', difficulty: 'Intermediate' },
    { id: '2', title: 'Python for Beginners', progress: 32, duration: '6 weeks', difficulty: 'Beginner' },
    { id: '3', title: 'Web Design Essentials', progress: 88, duration: '5 weeks', difficulty: 'Beginner' },
  ];

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-surface border-b border-outline-variant">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">AuraLearn</Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/courses" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">Courses</Link>
            <button className="text-body-md text-on-surface-variant hover:text-primary transition-colors">Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="flex-grow py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-on-background mb-2">My Courses</h1>
            <p className="text-body-md text-on-surface-variant">Manage your enrolled courses and track progress</p>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-body-md text-on-surface-variant mb-4">You haven't enrolled in any courses yet</p>
                <Link href="/courses" className="inline-block bg-primary text-on-primary px-6 py-3 rounded-lg text-label-md font-medium hover:opacity-90 transition-all">
                  Browse Courses
                </Link>
              </div>
            ) : (
              enrolledCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="block">
                  <div className="rounded-lg border border-outline-variant bg-surface-container-lowest hover:border-primary transition-colors h-full flex flex-col overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-primary-container/20 to-secondary-container/20"></div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-on-background mb-3">{course.title}</h3>

                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-label-sm text-on-surface-variant">Progress</span>
                            <span className="text-label-sm font-medium text-primary">{course.progress}%</span>
                          </div>
                          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className="bg-primary h-full transition-all" style={{ width: `${course.progress}%` }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <span className="px-2 py-1 bg-primary-container/15 text-primary rounded text-label-sm font-medium">{course.difficulty}</span>
                        <span className="px-2 py-1 bg-surface-container rounded text-on-surface-variant text-label-sm">{course.duration}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-on-surface-variant text-label-md">
          © 2024 AuraLearn
        </div>
      </footer>
    </div>
  );
}
