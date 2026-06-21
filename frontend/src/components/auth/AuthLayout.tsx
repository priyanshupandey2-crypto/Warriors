'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Card } from '@/components/ui';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footerLink: {
    text: string;
    href: string;
  };
  heroSection?: ReactNode;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerLink,
  heroSection,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Logo Header */}
      <div className="py-lg px-md border-b border-surface-container">
        <Link href="/" className="inline-flex items-center gap-sm">
          <span className="text-headline-md font-bold text-primary">✨ AuraLearn</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-md py-lg">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-xl">
          {/* Form Section */}
          <div className="flex items-center justify-center">
            <Card variant="elevated" className="w-full max-w-md p-lg lg:p-xl space-y-lg">
              {/* Header */}
              <div className="space-y-sm">
                <h1 className="text-headline-sm text-on-background font-semibold">
                  {title}
                </h1>
                <p className="text-body-md text-on-surface-variant">{subtitle}</p>
              </div>

              {/* Form */}
              <div>{children}</div>

              {/* Footer Link */}
              <div className="text-center pt-md border-t border-surface-container">
                <p className="text-body-sm text-on-surface-variant">
                  {footerLink.text.split('?')[0]}?{' '}
                  <Link
                    href={footerLink.href}
                    className="font-semibold text-primary hover:underline"
                  >
                    {footerLink.text.split('?')[1]}
                  </Link>
                </p>
              </div>
            </Card>
          </div>

          {/* Hero Section - Desktop Only */}
          {heroSection && (
            <div className="hidden lg:flex flex-col items-center justify-center space-y-lg p-lg bg-gradient-to-br from-primary-container/20 to-secondary-container/20 rounded-lg">
              {heroSection}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
