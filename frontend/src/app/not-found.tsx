import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-md">
      <div className="text-center space-y-lg max-w-md">
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">404</h1>
        <h2 className="text-headline-md text-on-surface">Page not found</h2>
        <p className="text-body-md text-on-surface-variant">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="inline-block bg-primary text-on-primary font-label-md px-xl py-md rounded-lg hover:opacity-90 transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
