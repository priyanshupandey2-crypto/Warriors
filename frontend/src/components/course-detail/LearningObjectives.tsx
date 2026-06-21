'use client';

interface LearningObjectivesProps {
  objectives: string[];
}

export function LearningObjectives({ objectives }: LearningObjectivesProps) {
  return (
    <section className="space-y-md">
      <h2 className="text-headline-lg text-on-background">Learning Objectives</h2>

      <div className="space-y-sm">
        {objectives.map((objective, index) => (
          <div key={index} className="flex gap-md">
            {/* Checkmark */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container font-bold">
              ✓
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
