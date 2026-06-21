'use client';

import { AuthLayout, SignupForm } from '@/components/auth';

export default function SignupPage() {
  return (
    <AuthLayout
      title="Join AuraLearn"
      subtitle="Create your account to start learning today"
      footerLink={{
        text: 'Already have an account? Sign in',
        href: '/auth/login',
      }}
      heroSection={
        <div className="space-y-lg text-center">
          <div className="text-5xl">✨</div>
          <div className="space-y-sm">
            <h2 className="text-headline-md text-on-background font-bold">
              Start Your Journey
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Join thousands of learners using AI-powered personalized education
            </p>
          </div>
          <ul className="space-y-sm text-left">
            <li className="flex items-center gap-sm text-body-sm text-on-surface-variant">
              <span className="text-primary">✓</span>
              <span>AI-generated personalized courses</span>
            </li>
            <li className="flex items-center gap-sm text-body-sm text-on-surface-variant">
              <span className="text-primary">✓</span>
              <span>Learn at your own pace</span>
            </li>
            <li className="flex items-center gap-sm text-body-sm text-on-surface-variant">
              <span className="text-primary">✓</span>
              <span>Get certified in your areas of interest</span>
            </li>
          </ul>
        </div>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
