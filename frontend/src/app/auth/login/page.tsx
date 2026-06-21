'use client';

import { AuthLayout, LoginForm } from '@/components/auth';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your learning journey"
      footerLink={{
        text: "Don't have an account? Sign up",
        href: '/auth/signup',
      }}
      heroSection={
        <div className="space-y-lg text-center">
          <div className="text-5xl">🚀</div>
          <div className="space-y-sm">
            <h2 className="text-headline-lg text-on-background font-bold">
              Continue Learning
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Pick up where you left off and unlock new course opportunities
            </p>
          </div>
          <ul className="space-y-sm text-left">
            <li className="flex items-center gap-sm text-body-sm text-on-surface-variant">
              <span className="text-primary">✓</span>
              <span>Access your personalized dashboard</span>
            </li>
            <li className="flex items-center gap-sm text-body-sm text-on-surface-variant">
              <span className="text-primary">✓</span>
              <span>Track your learning progress</span>
            </li>
            <li className="flex items-center gap-sm text-body-sm text-on-surface-variant">
              <span className="text-primary">✓</span>
              <span>Get AI-powered course recommendations</span>
            </li>
          </ul>
        </div>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
