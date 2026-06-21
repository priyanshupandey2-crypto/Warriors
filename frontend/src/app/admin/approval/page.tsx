'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout';
import { Card, PageHeader, EmptyState, Badge } from '@/components/ui';
import { SubmittedCourseCard, CourseReviewPanel } from '@/components/admin-approval';
import { mockSubmittedCourses } from '@/lib/mockData';
import { Course } from '@/types/course';

export default function AdminApprovalPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Simulate loading submitted courses
    setCourses(mockSubmittedCourses);
  }, []);

  const handleReviewCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleApprove = async (courseId: string) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Course approved:', courseId);

      // Remove course from list
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setSelectedCourse(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (courseId: string, reason?: string) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Course rejected:', courseId, 'Reason:', reason);

      // Remove course from list
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setSelectedCourse(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClosePanel = () => {
    setSelectedCourse(null);
  };

  return (
    <AppShell>
      <main className="max-w-6xl mx-auto space-y-lg py-lg px-md">
        {/* Header */}
        <PageHeader
          title="Course Approvals"
          subtitle="Review and approve courses submitted for global publication"
          badge={
            <Badge variant="primary">
              {courses.length} pending review{courses.length !== 1 ? 's' : ''}
            </Badge>
          }
        />

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Courses List */}
          <div className="lg:col-span-2">
            {courses.length === 0 ? (
              <EmptyState
                icon="✓"
                title="All Caught Up!"
                message="No courses are currently pending review. All submissions have been processed."
              />
            ) : (
              <div className="space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {courses.map((course) => (
                    <SubmittedCourseCard
                      key={course.id}
                      course={course}
                      isSelected={selectedCourse?.id === course.id}
                      onReview={handleReviewCourse}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Review Panel - Desktop */}
          <div className="hidden lg:block">
            {selectedCourse ? (
              <div className="sticky top-lg">
                <CourseReviewPanel
                  course={selectedCourse}
                  isLoading={isProcessing}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onClose={handleClosePanel}
                />
              </div>
            ) : (
              <Card variant="outlined" className="p-lg text-center space-y-sm">
                <p className="text-headline-md text-on-surface-variant font-medium">
                  Select a course to review
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Click "Review Course" on any course card to get started
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Review Panel - Mobile Modal */}
        {selectedCourse && (
          <CourseReviewPanel
            course={selectedCourse}
            isLoading={isProcessing}
            onApprove={handleApprove}
            onReject={handleReject}
            onClose={handleClosePanel}
          />
        )}
      </main>
    </AppShell>
  );
}
