'use client';

import { useRouter } from 'next/navigation';
import { DraftCourse } from '@/types/course';
import { Button, Card, Badge, SectionHeader } from '@/components/ui';

interface DraftCoursesSectionProps {
  drafts: DraftCourse[];
}

export function DraftCoursesSection({ drafts }: DraftCoursesSectionProps) {
  const router = useRouter();

  if (!drafts || drafts.length === 0) {
    return null;
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <section className="space-y-lg">
      <SectionHeader
        title="My Draft Courses"
        action={
          <span className="text-label-md text-on-surface-variant">
            {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {drafts.map((draft) => (
          <Card key={draft.id} variant="elevated" className="flex flex-col hover-lift">
            <div className="p-md space-y-md flex-1">
              {/* Title and Badge */}
              <div className="space-y-sm">
                <div className="flex items-start justify-between gap-sm">
                  <h3 className="text-headline-sm text-on-surface font-headline-md flex-1 line-clamp-2">
                    {draft.title || 'Untitled Course'}
                  </h3>
                  <Badge variant="primary">{draft.difficulty}</Badge>
                </div>

                {/* Topic */}
                <p className="text-body-md text-on-surface-variant">{draft.topic}</p>
              </div>

              {/* Details */}
              <div className="space-y-xs text-label-md text-on-surface-variant">
                <p>Duration: {draft.duration} hours</p>
                <p>Audience: {draft.targetAudience}</p>
                {draft.tags && draft.tags.length > 0 && (
                  <div className="flex flex-wrap gap-sm pt-xs">
                    {draft.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {draft.tags.length > 2 && (
                      <Badge variant="secondary">+{draft.tags.length - 2}</Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Last saved */}
              <p className="text-label-sm text-on-surface-variant pt-md">
                Saved {formatDate(draft.savedAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="px-md pb-md pt-md border-t border-outline-variant flex gap-sm">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => router.push(`/create-course?draft=${draft.id}`)}
              >
                Continue
              </Button>
              <Button variant="outline" size="sm" fullWidth>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
