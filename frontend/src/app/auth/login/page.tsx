'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store';
import { mockUser } from '@/lib/mockData';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const visualRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!visualRef.current) return;
    const x = (window.innerWidth - e.pageX * 2) / 100;
    const y = (window.innerHeight - e.pageY * 2) / 100;
    visualRef.current.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
  };

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const user = {
        ...mockUser,
        email,
        id: `user-${Math.random().toString(36).slice(2, 11)}`,
      };

      setUser(user);
      setToken('mock-token-' + Date.now());
      router.push('/dashboard');
    } catch {
      setError('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-stretch">
      {/* Left Column: Visual Brand Canvas */}
      <div
        className="hidden lg:flex flex-1 relative items-center justify-center p-xxl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0061a7 0%, #772cd8 100%)' }}
        onMouseMove={handleMouseMove}
      >
        <div className="absolute inset-0 z-0">
          <div
            ref={visualRef}
            className="w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-100 ease-out"
            style={{
              backgroundImage:
                'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAavsPrnosT5aHQ3jJVvxpzGroMy7tsi9IKL_hvV-MkZnGI2m-f5kKDrs0H4j9Q0RkTeg75pI0TJvQyMASf0xIp5Ep3KeSNU2MVK3F4RMTSId8LWaI31hW_olIi8_M3-I9byw6hKrAauE5-cJF8NEk6WVanC2Ng-AcleFbpSi3p8zBFH_q_KhtiQIl08VYuFT3xq6kEb4xqSeydRJaZbFuyB_k2JQs8eKHir4xb-1I56dEHysmJEIDLMUpKg43-r9TP6eUA57c2KsUn)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: 'scale(1.1)',
            }}
          />
        </div>
        <div
          className="relative z-10 p-xl rounded-xl max-w-lg text-white"
          style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)',
          }}
        >
          <h1 className="font-headline-lg text-headline-lg mb-md">
            Master Tomorrow&apos;s Skills Today
          </h1>
          <p className="font-body-lg text-body-lg opacity-90 mb-xl">
            Join over 2 million learners worldwide and accelerate your momentum with
            AuraLearn&apos;s AI-powered education engine.
          </p>
          <div className="flex items-center gap-md">
            <div className="flex -space-x-sm">
              {[
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ86Npr44Dqlq7cQc0HN6QagytzkLxnBsXdsrRqgGWf8jBEYrRyMTI62bbZjHdjMt72ACB5jdVPIMNahsJnhCLRScUd0SPxF2gyuJKmCCtqU6t8ijBMcsYGYxsJmSlPo79pSpSbZvWEzFLN-sVPfp6OkpwwRS7IYeztHygD9-M8-fj2zZrAGikKiZjxrKvUXur-tcSBZynRi-_2JRDFoIiO_dLOzV0MgB-i3ju0oEDinjlhpG10KKACZaDbWDYe0YBlQj9blruNXMB',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuB_FjFgzdVuRlOdSywvw0w_fY-T4FUfpdzYU9zZvtgIlNpYV8DB2JLsET_ClMC5Cbx4LaUr22Dhz4JrwyQabWnpAbcuRRGYkPxXjaU_mjEX6JOQ-qKRhZmsEYxcsHunRWNYtTCoTf3z_92WLVtlDx4edGT9fSoNFImnenJusymhiET93XqhSiXx87FayNLoGCENz_RQyUz5rSK0fV49sEkfTB1eqLJW8p4Jbtwu0blq3zcc2Q-nBfs9FZyguB75HvEBQ2pV_Hc040Yt',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAAL8joCHEQf9-0FEhdEsa04rQXzVuWtBW-USdjSmtoEy6D9VIxTFov8tHWWUJhAao34_-J1wUzb28Slnv6nCqP3DWcushUBo5_V6I6K2nzLy7vGwX4-cwRAUqVad2j6etpBd6HfgpbrLrvZBhny5dHtqLYwr8xkrWv7_C4ZXFD-YbRBooHU6qJiODlP2qwIseP9r5vlrLeiSnddSZmyQGuB6zpDUszqaFHoau-Mws-KBO9zC5oE6Evpvc7MC-EG6nqzf4l3ZCOTMSj',
              ].map((src, i) => (
                <img
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  src={src}
                  alt="Learner"
                />
              ))}
            </div>
            <span className="font-label-md text-label-md">+14k joined this week</span>
          </div>
        </div>
        <div className="absolute bottom-xl left-xl z-10">
          <div className="font-headline-md text-headline-md font-bold text-white tracking-tight">
            AuraLearn
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex-1 flex flex-col justify-center bg-surface-container-lowest px-margin-mobile md:px-xxl py-xxl">
        <div className="max-w-[440px] mx-auto w-full space-y-xl">
          <div className="space-y-sm">
            <div className="lg:hidden mb-lg">
              <Link href="/" className="font-headline-md text-headline-md font-extrabold text-primary">
                AuraLearn
              </Link>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Welcome back, Learner!</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Log in to pick up right where you left off in your learning journey.
            </p>
          </div>

          {error && (
            <div className="bg-error-container/20 border border-error rounded-lg p-md">
              <p className="text-label-md text-error font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-lg" onSubmit={handleSubmit}>
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-md top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  className="w-full pl-[48px] pr-md py-md bg-white border border-outline-variant rounded-lg font-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  id="email"
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="font-label-sm text-label-sm text-primary hover:underline transition-all">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-md top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  className="w-full pl-[48px] pr-md py-md bg-white border border-outline-variant rounded-lg font-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  id="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-sm">
              <input
                className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary cursor-pointer transition-all"
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label className="font-label-md text-label-md text-on-surface-variant cursor-pointer" htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>

            <button
              className="w-full bg-primary text-white font-label-md text-label-md py-md rounded-lg shadow-sm hover:shadow-md hover:bg-primary-container transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <div className="text-center pt-md">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don&apos;t have an account?{' '}
              <Link
                className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
                href="/auth/signup"
              >
                Sign Up
              </Link>
            </p>
          </div>

          <footer className="mt-xxl pt-xl border-t border-outline-variant max-w-[440px] mx-auto w-full">
            <div className="flex flex-wrap justify-between gap-md text-outline font-label-sm text-label-sm">
              <span>© 2024 AuraLearn AI</span>
              <div className="flex gap-lg">
                <a className="hover:text-primary transition-colors" href="#">Privacy</a>
                <a className="hover:text-primary transition-colors" href="#">Terms</a>
                <a className="hover:text-primary transition-colors" href="#">Support</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
