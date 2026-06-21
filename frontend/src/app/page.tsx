'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-background min-h-screen">
      <Header
        brand="AuraLearn"
        navigation={[{ href: '/published-courses', label: 'Browse Courses' }]}
        actions={
          <div className="flex gap-md">
            <button
              onClick={() => router.push('/auth/login')}
              className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-fast active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-ring text-on-surface hover:bg-surface-container-low px-md py-sm text-label-md"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-fast active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-ring bg-primary hover:bg-primary-container hover:text-on-primary-container px-md py-sm text-label-md"
            >
              Get Started
            </button>
          </div>
        }
      />

      <main className="pt-16 px-gutter py-xxl max-w-container-max mx-auto">
        {/* Hero Section */}
        <section className="space-y-lg mb-xxl">
          <h1 className="text-display-lg-mobile md:text-display-lg text-on-background leading-tight">
            The Future of Learning, <span className="text-primary italic">Tailored for You</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            Harness the power of adaptive curriculum and AI-driven personalization. AuraLearn
            transforms high-impact education into an accessible, energetic experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-md">
            <button
              onClick={() => router.push('/auth/signup')}
              className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-fast active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-ring bg-primary hover:bg-primary-container hover:text-on-primary-container px-lg py-md text-body-md"
            >
              Start Learning Now →
            </button>
            <button className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-fast active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-ring border-2 border-outline-variant text-on-surface hover:border-primary hover:text-primary px-lg py-md text-body-md">
              Watch Demo
            </button>
          </div>
        </section>

        {/* Placeholder for future sections */}
        <section className="py-xxl border-t border-surface-container">
          <h2 className="text-headline-md text-on-background mb-lg">
            More content coming soon...
          </h2>
          <p className="text-body-md text-on-surface-variant">
            This is the foundation. Additional pages and features will be built on top of this
            solid architecture.
          </p>
        </section>
      </main>
    </div>
  );
}
