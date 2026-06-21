'use client';

import { User } from '@/types/user';
import { StatsCard } from '@/components/domain';

interface WelcomeSectionProps {
  user: User | null;
  stats: {
    enrolled: number;
    completed: number;
    learningHours: number;
    streak: number;
  };
}

export function WelcomeSection({ user, stats }: WelcomeSectionProps) {
  if (!user) return null;

  // Get user initials for avatar fallback
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-lg">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-lg">
        <div className="flex items-center gap-md">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-container flex items-center justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-headline-md font-bold text-on-primary">
                {initials}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-headline-lg text-on-background">
              Hello, {user.name.split(' ')[0]}
            </h1>
            <p className="text-body-md text-on-surface-variant">
              You're making great progress! Keep up the momentum.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <StatsCard
          icon="BookOpen"
          label="Enrolled"
          value={`${stats.enrolled} Courses`}
          iconColor="primary"
        />
        <StatsCard
          icon="CheckCircle"
          label="Completed"
          value={`${stats.completed} Courses`}
          iconColor="tertiary"
        />
        <StatsCard
          icon="Clock"
          label="Learning Hours"
          value={`${stats.learningHours} hrs`}
          iconColor="secondary"
        />
        <StatsCard
          icon="Flame"
          label="Streak"
          value={`${stats.streak} Days`}
          iconColor="error"
        />
      </div>
    </div>
  );
}
