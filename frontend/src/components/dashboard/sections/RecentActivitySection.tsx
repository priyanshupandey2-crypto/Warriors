'use client';

import { Card } from '@/components/ui';

interface Activity {
  id: string;
  type: 'course_completion' | 'milestone' | 'course_start';
  title: string;
  timestamp: Date;
  icon: string;
}

interface RecentActivitySectionProps {
  activities: Activity[];
}

export function RecentActivitySection({ activities }: RecentActivitySectionProps) {
  if (!activities || activities.length === 0) {
    return null;
  }

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <section className="space-y-md">
      <h2 className="text-headline-lg text-on-background">Recent Activity</h2>

      <div className="space-y-sm">
        {activities.map((activity, index) => (
          <Card key={activity.id} variant="outlined" className="p-md">
            <div className="flex items-start gap-md">
              {/* Icon */}
              <div className="text-2xl flex-shrink-0">{activity.icon}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-body-md text-on-surface font-medium">
                  {activity.title}
                </p>
                <p className="text-label-sm text-on-surface-variant mt-xs">
                  {formatTime(activity.timestamp)}
                </p>
              </div>

              {/* Divider between items (except last) */}
              {index < activities.length - 1 && (
                <div className="absolute left-0 right-0 bottom-0 h-px bg-surface-container" />
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
