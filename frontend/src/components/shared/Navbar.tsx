'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/signin') || pathname?.startsWith('/signup');

  const handleSignOut = () => {
    router.push('/auth/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-surface-container-lowest shadow-sm border-b border-outline-variant/20">
      <div className="flex justify-between items-center w-full px-md md:px-lg py-md max-w-container-max mx-auto">
        <Link href="/" className="flex items-center gap-sm">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-headline-md text-headline-md font-bold text-primary">AuraLearn</span>
        </Link>

        {!isAuthPage && (
          <div className="hidden md:flex items-center gap-xl">
            <Link href="/" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/courses" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
              Courses
            </Link>
            <Link href="/dashboard" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
              Dashboard
            </Link>
          </div>
        )}

        {isAuthPage ? (
          <div className="flex items-center gap-md">
            <Link href="/auth/signin" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors px-md py-sm">
              Sign In
            </Link>
            <Link href="/auth/signup" className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg shadow-sm hover:opacity-90 transition-all">
              Get Started
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-md">
            <Link href="/create" className="font-body-md text-body-md text-primary hover:text-primary-container transition-colors px-md py-sm hidden sm:block">
              Create Course
            </Link>
            <button onClick={handleSignOut} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors px-md py-sm">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
