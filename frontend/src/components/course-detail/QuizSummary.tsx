'use client';

import { QuizSummary as Quiz } from '@/types/course';
import { Card, Badge } from '@/components/ui';

interface QuizSummaryProps {
  quizzes?: Quiz[];
}

export function QuizSummary({ quizzes = [] }: QuizSummaryProps) {
  if (!quizzes || quizzes.length === 0) {
    return null;
  }

  return (
    <section className="space-y-md">
      <h2 className="text-headline-lg text-on-background">Assessments</h2>

      <div className="space-y-sm">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} variant="outlined" className="p-lg">
            <div className="space-y-sm">
              <div className="flex items-start justify-between gap-md">
                <h3 className="text-headline-md text-on-surface font-bold">
                  {quiz.title}
                </h3>
                <Badge variant="secondary">{quiz.passingScore}% to pass</Badge>
              </div>

              <div className="flex flex-wrap gap-lg text-label-md text-on-surface-variant">
                <div>
                  <span className="font-medium text-on-surface">{quiz.questionCount}</span> question
                  {quiz.questionCount !== 1 ? 's' : ''}
                </div>
                {quiz.moduleId && (
                  <div>
                    <span className="font-medium text-on-surface">Module:</span> {quiz.moduleId}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
