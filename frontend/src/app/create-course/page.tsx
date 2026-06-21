'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { CourseForm, AIGenerationPanel } from '@/components/course-creation';
import { useCourseStore, useGenerationStore } from '@/store';
import { Button } from '@/components/ui';

interface FormData {
  topic: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | '';
  targetAudience: string;
  duration: number | '';
  tags: string[];
}

const progressMessages = [
  'Initializing AI engine...',
  'Analyzing your topic...',
  'Generating learning objectives...',
  'Creating course modules...',
  'Designing lessons and content...',
  'Setting up assessment questions...',
  'Finalizing capstone project...',
  'Polishing course structure...',
];

export default function CreateCoursePage() {
  const router = useRouter();
  const { setDraftCourse } = useCourseStore();
  const { setGenerationStatus, setCurrentStep, setJobId } = useGenerationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const simulateGeneration = async () => {
    // Show progress through messages
    let messageIndex = 0;

    const messageInterval = setInterval(() => {
      if (messageIndex < progressMessages.length - 1) {
        messageIndex++;
        setCurrentMessageIndex(messageIndex);
        setCurrentStep(progressMessages[messageIndex]);
      }
    }, 700); // Change message every 700ms

    // Simulate generation time (5-7 seconds)
    await new Promise((resolve) => setTimeout(resolve, 5500));

    clearInterval(messageInterval);
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setGenerationStatus('running');
    setCurrentStep(progressMessages[0]);
    setCurrentMessageIndex(0);

    // Generate mock job ID
    const jobId = `job-${Date.now()}`;
    setJobId(jobId);

    try {
      // Simulate API call
      await simulateGeneration();

      // Save draft course
      const draftCourse = {
        id: jobId,
        title: formData.topic,
        topic: formData.topic,
        difficulty: formData.difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        targetAudience: formData.targetAudience,
        duration: formData.duration as number,
        tags: formData.tags,
        description: `AI-generated course on ${formData.topic} for ${formData.targetAudience}`,
        savedAt: new Date(),
      };

      setDraftCourse(draftCourse);
      setGenerationStatus('completed');
      setCurrentStep('Course generated successfully!');

      // Simulate delay before redirect
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to dashboard to see the generated course preview
      router.push('/dashboard');
    } catch (error) {
      setGenerationStatus('failed');
      setCurrentStep('Generation failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AppShell
      headerProps={{
        brand: 'AuraLearn',
        navigation: [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/create-course', label: 'Create Course', active: true },
        ],
        actions: (
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            Back
          </Button>
        ),
      }}
      sidebarProps={{
        items: [
          {
            href: '/dashboard',
            label: 'Dashboard',
            icon: 'LayoutDashboard',
          },
          {
            href: '/my-courses',
            label: 'My Courses',
            icon: 'BookMarked',
          },
          {
            href: '/create-course',
            label: 'Create Course',
            icon: 'Plus',
            active: true,
          },
          {
            href: '/published-courses',
            label: 'Browse',
            icon: 'BookOpen',
          },
        ],
      }}
    >
      <div className="w-full space-y-lg">
        <div className="max-w-7xl mx-auto space-y-lg w-full">
          {/* Page Header */}
          <div>
            <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">
              Create Your Course
            </h1>
            <p className="text-body-lg text-on-surface-variant mt-sm max-w-2xl">
              Describe your course idea and let our AI generate a complete, professional
              curriculum in minutes.
            </p>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
          {/* Form (Left) */}
          <div className="lg:col-span-1">
            <CourseForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Info Panel (Right) */}
          <div className="lg:col-span-1">
            {/* Desktop: Sticky panel */}
            <div className="lg:sticky lg:top-24">
              <AIGenerationPanel />
            </div>
          </div>
        </div>
        </div>

        {/* Generation Progress Modal (shown during generation) */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-md">
            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-xl max-w-md w-full space-y-lg">
              <div className="text-center space-y-sm">
                <div className="inline-flex">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
                <h3 className="text-headline-md text-on-background font-bold">
                  Generating Your Course
                </h3>
              </div>

              {/* Progress Messages */}
              <div className="space-y-sm">
                {progressMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`text-label-md p-sm rounded transition-all ${
                      index === currentMessageIndex
                        ? 'text-primary bg-primary-container/20 font-medium'
                        : index < currentMessageIndex
                          ? 'text-tertiary opacity-60'
                          : 'text-on-surface-variant opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-sm">
                      <span className="text-xs">
                        {index < currentMessageIndex
                          ? '✓'
                          : index === currentMessageIndex
                            ? '●'
                            : '○'}
                      </span>
                      <span>{message}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-label-sm text-on-surface-variant text-center">
                This usually takes 5-10 seconds...
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
