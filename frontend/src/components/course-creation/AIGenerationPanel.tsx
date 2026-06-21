'use client';

import { Card } from '@/components/ui';

interface GenerationFeature {
  icon: string;
  title: string;
  description: string;
}

const generationFeatures: GenerationFeature[] = [
  {
    icon: '📋',
    title: 'Learning Objectives',
    description: '5-7 clear, measurable goals for what students will learn',
  },
  {
    icon: '📚',
    title: 'Structured Modules',
    description: '3-5 organized sections covering all key topics',
  },
  {
    icon: '📝',
    title: 'Comprehensive Lessons',
    description: '15-20 lesson units with detailed explanations and examples',
  },
  {
    icon: '✅',
    title: 'Quiz Questions',
    description: 'Assessment questions to test understanding throughout the course',
  },
  {
    icon: '🏆',
    title: 'Capstone Project',
    description: 'Real-world application project to demonstrate mastery',
  },
];

export function AIGenerationPanel() {
  return (
    <Card variant="elevated" className="space-y-lg">
      {/* Header */}
      <div className="space-y-sm">
        <div className="text-4xl">✨</div>
        <h3 className="text-headline-lg text-on-background font-bold">
          AI Course Generation
        </h3>
        <p className="text-body-md text-on-surface-variant">
          Our advanced AI will create a personalized, professional course curriculum
          tailored to your exact specifications.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-surface-container" />

      {/* Features List */}
      <div className="space-y-md">
        <h4 className="text-headline-md text-on-surface">What We Generate:</h4>

        <div className="space-y-sm">
          {generationFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex gap-md p-sm rounded-lg hover:bg-surface-container-low transition-colors"
            >
              {/* Icon */}
              <div className="text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {feature.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h5 className="text-label-md font-bold text-on-surface">
                  {feature.title}
                </h5>
                <p className="text-label-sm text-on-surface-variant mt-xs">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-surface-container" />

      {/* Benefits */}
      <div className="space-y-sm bg-surface-container-low p-md rounded-lg">
        <h4 className="text-label-md font-bold text-on-surface">Why Use AI?</h4>
        <ul className="space-y-xs text-label-sm text-on-surface-variant">
          <li className="flex gap-sm">
            <span className="flex-shrink-0">⚡</span>
            <span>Generate complete courses in minutes, not days</span>
          </li>
          <li className="flex gap-sm">
            <span className="flex-shrink-0">🎯</span>
            <span>Personalized content for your specific audience</span>
          </li>
          <li className="flex gap-sm">
            <span className="flex-shrink-0">📊</span>
            <span>Professional structure based on learning science</span>
          </li>
          <li className="flex gap-sm">
            <span className="flex-shrink-0">✏️</span>
            <span>Easy to edit and refine after generation</span>
          </li>
        </ul>
      </div>

      {/* Footer Note */}
      <p className="text-label-sm text-on-surface-variant text-center">
        After generation, you can review, edit, and customize every aspect of your course.
      </p>
    </Card>
  );
}
