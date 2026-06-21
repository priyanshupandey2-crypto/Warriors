'use client';

import { useState } from 'react';
import { Course } from '@/types/course';
import { Button, Card, ConfirmationDialog } from '@/components/ui';
import {
  CourseHeader,
  LearningObjectives,
  ModulesSection,
  QuizSummary,
} from '@/components/course-detail';

interface CourseReviewPanelProps {
  course: Course;
  isLoading?: boolean;
  onApprove: (courseId: string) => void;
  onReject: (courseId: string, reason?: string) => void;
  onClose: () => void;
}

type Tab = 'overview' | 'objectives' | 'modules' | 'quizzes';

export function CourseReviewPanel({
  course,
  isLoading = false,
  onApprove,
  onReject,
  onClose,
}: CourseReviewPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const handleApprove = async () => {
    onApprove(course.id);
    setShowApproveConfirm(false);
  };

  const handleRejectSubmit = async () => {
    setRejectLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      onReject(course.id, rejectReason);
    } finally {
      setRejectLoading(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'objectives', label: 'Objectives' },
    { id: 'modules', label: 'Modules' },
    { id: 'quizzes', label: 'Quizzes' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-40 lg:static lg:bg-transparent flex items-center justify-center lg:items-stretch">
      <Card
        variant="elevated"
        className="w-full max-w-3xl max-h-[90vh] lg:max-h-none overflow-y-auto lg:rounded-none flex flex-col space-y-lg p-lg m-md lg:m-0"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-md sticky top-0 bg-surface z-10 pb-lg border-b border-surface-container">
          <h2 className="text-headline-lg text-on-background font-bold">
            Course Review
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface text-2xl"
            aria-label="Close review panel"
          >
            ✕
          </button>
        </div>

        {/* Course Info */}
        <div className="space-y-md">
          <CourseHeader course={course} />
        </div>

        {/* Tabs */}
        <div className="flex gap-xs border-b border-surface-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-md py-sm font-medium text-label-md transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 space-y-lg">
          {activeTab === 'overview' && (
            <div className="space-y-md">
              <div className="space-y-sm">
                <h3 className="text-headline-md text-on-surface font-bold">
                  Target Audience
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  {course.targetAudience}
                </p>
              </div>
              <div className="space-y-sm">
                <h3 className="text-headline-md text-on-surface font-bold">
                  Course Topic
                </h3>
                <p className="text-body-md text-on-surface-variant">{course.topic}</p>
              </div>
            </div>
          )}

          {activeTab === 'objectives' && (
            <LearningObjectives
              objectives={[
                'Understand core principles',
                'Apply concepts in practice',
                'Master advanced techniques',
                'Complete real-world projects',
              ]}
            />
          )}

          {activeTab === 'modules' && course.modules.length > 0 && (
            <ModulesSection modules={course.modules} />
          )}

          {activeTab === 'quizzes' && (course as any).quizzes?.length > 0 && (
            <QuizSummary quizzes={(course as any).quizzes} />
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-surface-container pt-lg" />

        {/* Actions */}
        {!showRejectForm ? (
          <div className="space-y-md">
            <div className="grid grid-cols-2 gap-md">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setShowApproveConfirm(true)}
                disabled={isLoading}
              >
                ✅ Approve
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => setShowRejectForm(true)}
                disabled={isLoading}
              >
                ❌ Reject
              </Button>
            </div>
            <p className="text-label-sm text-on-surface-variant text-center">
              Review the course content above before taking action
            </p>
          </div>
        ) : (
          <div className="space-y-md bg-error-container/10 p-lg rounded-lg border border-error-container">
            <div className="space-y-sm">
              <h3 className="text-headline-md text-error font-bold">
                Reason for Rejection
              </h3>
              <p className="text-body-md text-on-surface-variant">
                Please provide feedback for the course creator
              </p>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this course cannot be approved (required)"
              className="w-full p-md border border-outline rounded-lg bg-surface text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-error focus:outline-none resize-none"
              rows={4}
            />

            <div className="grid grid-cols-2 gap-md">
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
                disabled={rejectLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim() || rejectLoading}
                loading={rejectLoading}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}

        {/* Approval Confirmation */}
        <ConfirmationDialog
          isOpen={showApproveConfirm}
          title="Approve This Course?"
          message="This course will be published to the global catalog and available for all learners."
          confirmLabel="Yes, Approve"
          cancelLabel="Cancel"
          isLoading={isLoading}
          onConfirm={handleApprove}
          onCancel={() => setShowApproveConfirm(false)}
        />
      </Card>
    </div>
  );
}
