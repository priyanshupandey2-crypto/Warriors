'use client';

import { Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-gutter">
      <div className="text-center space-y-lg max-w-md">
        <h1 className="text-display-lg text-on-background">⚠️</h1>
        <h2 className="text-headline-lg text-on-surface">Course Error</h2>
        <p className="text-body-md text-on-surface-variant">{error.message || 'An error occurred'}</p>
        <Button variant="primary" size="lg" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
