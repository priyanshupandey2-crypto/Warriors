'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-gutter">
      <div className="text-center space-y-lg max-w-md">
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">⚠️</h1>
        <h2 className="text-headline-md text-on-surface">Something went wrong!</h2>
        <p className="text-body-md text-on-surface-variant">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-md justify-center">
          <Button variant="primary" size="lg" onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
