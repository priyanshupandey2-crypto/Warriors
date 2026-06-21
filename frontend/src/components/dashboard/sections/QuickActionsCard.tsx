'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, Icon } from '@/components/ui';

export function QuickActionsCard() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
      {/* Create Course Card */}
      <Card variant="elevated" className="flex flex-col items-start justify-between p-lg">
        <div className="space-y-sm mb-lg">
          <div className="p-md bg-primary-container rounded-lg w-fit">
            <Icon name="Plus" size={32} className="text-primary" />
          </div>
          <h3 className="text-headline-md text-on-surface font-bold">Create New Course</h3>
          <p className="text-body-md text-on-surface-variant">
            Use AI to generate a personalized course tailored to your needs
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => router.push('/create-course')}
        >
          Start Creating
        </Button>
      </Card>

      {/* Browse Courses Card */}
      <Card variant="elevated" className="flex flex-col items-start justify-between p-lg">
        <div className="space-y-sm mb-lg">
          <div className="p-md bg-secondary-container rounded-lg w-fit">
            <Icon name="Globe" size={32} className="text-secondary" />
          </div>
          <h3 className="text-headline-md text-on-surface font-bold">Browse Courses</h3>
          <p className="text-body-md text-on-surface-variant">
            Explore hundreds of published courses from expert instructors
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => router.push('/published-courses')}
        >
          Browse Now
        </Button>
      </Card>
    </div>
  );
}
