'use client';

import { SectionHeader, Icon } from '@/components/ui';

interface LearningObjectivesProps {
  objectives: string[];
}

export function LearningObjectives({ objectives }: LearningObjectivesProps) {
  return (
    <section className="space-y-lg">
      <SectionHeader title="Learning Objectives" />

      <div className="space-y-sm">
        {objectives.map((objective, index) => (
          <div key={index} className="flex gap-md">
            {/* Checkmark */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-tertiary-container flex items-center justify-center text-tertiary flex-shrink-0">
              <Icon name="Check" size={16} />
            </div>

            {/* Objective Text */}
            <p className="text-body-md text-on-surface pt-xs flex-1">
              {objective}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
