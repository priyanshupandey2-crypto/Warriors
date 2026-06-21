'use client';

import { Card, Icon } from '@/components/ui';

interface GenerationFeature {
  icon: string;
  title: string;
  description: string;
}

const generationFeatures: GenerationFeature[] = [
  {
    icon: 'ListChecks',
    title: 'Learning Objectives',
    description: '5-7 clear, measurable goals for what students will learn',
  },
  {
    icon: 'BookOpen',
    title: 'Structured Modules',
    description: '3-5 organized sections covering all key topics',
  },
  {
    icon: 'FileText',
    title: 'Comprehensive Lessons',
    description: '15-20 lesson units with detailed explanations and examples',
  },
  {
    icon: 'CheckCircle',
    title: 'Quiz Questions',
    description: 'Assessment questions to test understanding throughout the course',
  },
  {
    icon: 'Trophy',
    title: 'Capstone Project',
    description: 'Real-world application project to demonstrate mastery',
  },
];

export function AIGenerationPanel() {
  return (
    <Card variant="elevated" className="space-y-lg">
      {/* Header */}
      <div className="space-y-sm">
        <div className="p-md bg-primary-container rounded-lg w-fit">
          <Icon name="Sparkles" size={32} className="text-primary" />
        </div>
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
              <div className="flex-shrink-0 text-primary">
                <Icon name={feature.icon as any} size={20} />
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
            <Icon name="Zap" size={16} className="flex-shrink-0 text-primary mt-0.5" />
            <span>Generate complete courses in minutes, not days</span>
          </li>
          <li className="flex gap-sm">
            <Icon name="Target" size={16} className="flex-shrink-0 text-primary mt-0.5" />
            <span>Personalized content for your specific audience</span>
          </li>
          <li className="flex gap-sm">
            <Icon name="BarChart3" size={16} className="flex-shrink-0 text-primary mt-0.5" />
            <span>Professional structure based on learning science</span>
          </li>
          <li className="flex gap-sm">
            <Icon name="PenTool" size={16} className="flex-shrink-0 text-primary mt-0.5" />
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
