'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Button } from '@/components/ui';
import { useAuthStore } from '@/store';
import { mockUser } from '@/lib/mockData';

export function LoginForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock authentication - accept any email/password combination
      const user = {
        ...mockUser,
        email,
        id: `user-${Math.random().toString(36).slice(2, 11)}`,
      };

      // Update auth store
      setUser(user);
      setToken('mock-token-' + Date.now());

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      {/* Error Message */}
      {error && (
        <div className="bg-error-container/20 border border-error rounded-lg p-md">
          <p className="text-label-md text-error font-medium">{error}</p>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-sm">
        <label className="text-label-md font-semibold text-on-surface block">
          Email Address
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={isLoading}
          className="w-full"
        />
      </div>

      {/* Password Input */}
      <div className="space-y-sm">
        <div className="flex items-center justify-between">
          <label className="text-label-md font-semibold text-on-surface block">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-label-sm text-primary hover:underline"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <Input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          className="w-full"
        />
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link
          href="#"
          className="text-label-sm text-primary hover:underline font-medium"
        >
          Forgot password?
        </Link>
      </div>

      {/* Sign In Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={isLoading || !email || !password}
        loading={isLoading}
      >
        Sign In
      </Button>

      {/* Demo Credentials */}
      <div className="bg-surface-container-low rounded-lg p-md text-center">
        <p className="text-label-xs text-on-surface-variant">Demo credentials:</p>
        <p className="text-label-sm text-on-surface font-mono mt-xs">
          any email / any password
        </p>
      </div>
    </form>
  );
}
