'use client';

import { Card, Badge, SectionHeader } from '@/components/ui';

interface Capstone {
  title: string;
  description: string;
  complexity: string;
  objectives?: string[];
}

interface CapstoneSummaryProps {
  capstone?: Capstone;
}

export function CapstoneSummary({ capstone }: CapstoneSummaryProps) {
  if (!capstone) {
    return null;
  }

  return (
    <section className="space-y-lg">
      <SectionHeader title="Capstone Project" />

      <Card variant="elevated" className="space-y-md">
        <div className="flex items-start justify-between gap-md">
          <h3 className="text-headline-md text-on-surface font-bold flex-1">
            {capstone.title}
          </h3>
          <Badge variant="tertiary">{capstone.complexity} Level</Badge>
        </div>

        <p className="text-body-md text-on-surface">
          {capstone.description}
        </p>

        {capstone.objectives && capstone.objectives.length > 0 && (
          <div className="space-y-sm border-t border-surface-container pt-md">
            <h4 className="text-label-md font-bold text-on-surface">
              Learning Objectives Covered:
            </h4>
            <ul className="space-y-xs text-body-md text-on-surface">
              {capstone.objectives.map((obj, index) => (
                <li key={index} className="flex gap-sm">
                  <span className="flex-shrink-0">→</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </section>
  );
}
