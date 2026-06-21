'use client';

import { useState } from 'react';
import { CourseModule } from '@/types/course';
import { Icon, SectionHeader } from '@/components/ui';

interface ModulesSectionProps {
  modules: CourseModule[];
}

export function ModulesSection({ modules }: ModulesSectionProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(
    modules.length > 0 ? modules[0].id : null
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <section className="space-y-lg">
      <SectionHeader title="Course Modules" />

      <div className="space-y-sm">
        {modules.map((module) => (
          <div key={module.id} className="border border-surface-container rounded-lg overflow-hidden">
            {/* Module Header (Clickable) */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full p-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-left"
            >
              <div className="flex-1">
                <h3 className="text-headline-md text-on-surface font-bold">
                  {module.title}
                </h3>
                {module.description && (
                  <p className="text-label-md text-on-surface-variant mt-xs">
                    {module.description}
                  </p>
                )}
                <p className="text-label-sm text-on-surface-variant mt-xs">
                  {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Toggle Icon */}
              <div className="ml-lg flex-shrink-0">
                <Icon
                  name={expandedModule === module.id ? 'ChevronDown' : 'ChevronRight'}
                  size={20}
                  className="text-on-surface-variant"
                />
              </div>
            </button>

            {/* Lessons (Expandable) */}
            {expandedModule === module.id && (
              <div className="bg-surface p-lg space-y-sm border-t border-surface-container">
                {module.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex gap-md p-sm rounded-lg hover:bg-surface-container-low transition-colors">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center text-primary">
                      <Icon name="FileText" size={16} />
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-body-md font-medium text-on-surface">
                        {lesson.title}
                      </h4>
                      {lesson.duration && (
                        <p className="text-label-sm text-on-surface-variant mt-xs flex items-center gap-xs">
                          <Icon name="Clock" size={14} />
                          {lesson.duration} minutes
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
