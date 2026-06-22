'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, TrendingUp, BookOpen, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store';

interface FormData {
  name: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const user = {
        id: `user-${Math.random().toString(36).slice(2, 11)}`,
        email: formData.email,
        name: formData.name,
        role: 'LEARNER' as const,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        createdAt: new Date(),
      };

      setUser(user);
      setToken('mock-token-' + Date.now());

      setShowToast(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 900);
    } catch {
      setError('Sign up failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-x-hidden bg-surface">
      <main className="flex min-h-screen w-full">
        {/* Left Side: Visual/Abstract Graphic */}
        <section className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-center justify-center p-xl">
          <div className="relative z-10 text-on-primary max-w-lg">
            <div className="mb-lg">
              <span className="inline-flex items-center gap-sm bg-primary-container/20 px-md py-xs rounded-full border border-primary-container/30">
                <Sparkles className="w-5 h-5" />
                <span className="font-label-md text-label-md">Unlock Your Potential</span>
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg mb-md leading-tight">
              Master the skills of tomorrow, today.
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary/80 mb-xl">
              Join 500,000+ learners who are accelerating their careers with AI-driven
              personalized paths and hands-on projects.
            </p>
            <div
              className="rounded-xl p-lg border border-white/20 shadow-xl max-w-sm"
              style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center gap-md mb-md">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Momentum Gained</p>
                  <p className="font-headline-md text-headline-md text-primary">+84% Proficiency</p>
                </div>
              </div>
              <div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: '84%', boxShadow: '0 0 8px rgba(0,97,167,0.4)' }}
                />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/30 rounded-full blur-3xl" />
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-tertiary/20 rounded-full blur-3xl" />
        </section>

        {/* Right Side: Sign Up Form */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-margin-mobile md:p-xxl bg-surface">
          <div className="w-full max-w-[480px]">
            <div className="lg:hidden mb-xl">
              <Link href="/" className="flex items-center gap-sm mb-md">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-headline-md font-headline-md font-bold text-primary">AuraLearn</span>
              </Link>
            </div>

            <div className="mb-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
                Join the future of learning
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Create your account to start your personalized learning journey.
              </p>
            </div>

            {error && (
              <div className="bg-error-container/20 border border-error rounded-lg p-md mb-lg">
                <p className="text-label-md text-error font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-lg" onSubmit={handleSubmit}>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-sm" htmlFor="full-name">
                  Full Name
                </label>
                <input
                  className="w-full px-md py-[14px] rounded-lg border border-outline-variant bg-white font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  id="full-name"
                  name="name"
                  placeholder="Alex Rivera"
                  required
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-sm" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="w-full px-md py-[14px] rounded-lg border border-outline-variant bg-white font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  id="email"
                  name="email"
                  placeholder="alex@example.com"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <label className="block font-label-md text-label-md text-on-surface mb-sm" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full px-md py-[14px] pr-12 rounded-lg border border-outline-variant bg-white font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    id="password"
                    name="password"
                    placeholder="Min. 8 characters"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-xs"
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-md pt-sm">
                <input
                  className="mt-1 w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary/20"
                  id="terms"
                  name="agreeToTerms"
                  required
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="terms">
                  I agree to the{' '}
                  <a className="text-primary hover:underline font-bold" href="#">Terms of Service</a> and{' '}
                  <a className="text-primary hover:underline font-bold" href="#">Privacy Policy</a>.
                </label>
              </div>

              <button
                className="w-full bg-primary text-on-primary py-lg rounded-lg font-label-md text-label-md shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-md disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account…' : 'Create My Account'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="mt-xl text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?{' '}
                <Link className="text-primary font-bold hover:underline ml-xs" href="/auth/login">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Feedback Toast */}
      <div
        className={`fixed bottom-lg right-lg bg-surface-container-highest border border-primary/20 p-lg rounded-xl shadow-2xl flex items-center gap-md transition-all duration-300 z-50 ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}
      >
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="font-label-md text-label-md text-on-surface">Account created!</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Welcome to AuraLearn, {formData.name || 'there'}.
          </p>
        </div>
      </div>
    </div>
  );
}
