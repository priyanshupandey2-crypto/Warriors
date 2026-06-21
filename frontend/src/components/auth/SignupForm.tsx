'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Button } from '@/components/ui';
import { useAuthStore } from '@/store';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export function SignupForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return 'none';
    if (password.length < 8) return 'weak';
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (strength >= 3) return 'strong';
    if (strength >= 2) return 'fair';
    return 'weak';
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColor =
    passwordStrength === 'strong'
      ? 'text-tertiary'
      : passwordStrength === 'fair'
        ? 'text-secondary'
        : passwordStrength === 'weak'
          ? 'text-error'
          : 'text-on-surface-variant';

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

    // Validation
    if (!formData.name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create user object
      const user = {
        id: `user-${Math.random().toString(36).slice(2, 11)}`,
        email: formData.email,
        name: formData.name,
        role: 'LEARNER' as const,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        createdAt: new Date(),
      };

      // Update auth store
      setUser(user);
      setToken('mock-token-' + Date.now());

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Sign up failed. Please try again.');
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

      {/* Full Name Input */}
      <div className="space-y-sm">
        <label className="text-label-md font-semibold text-on-surface block">
          Full Name
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          disabled={isLoading}
          className="w-full"
        />
      </div>

      {/* Email Input */}
      <div className="space-y-sm">
        <label className="text-label-md font-semibold text-on-surface block">
          Email Address
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
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
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={isLoading}
          className="w-full"
        />
        {formData.password && (
          <div className="flex items-center gap-sm pt-xs">
            <span className="text-label-xs text-on-surface-variant">Strength:</span>
            <span className={`text-label-xs font-semibold ${strengthColor}`}>
              {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-sm">
        <div className="flex items-center justify-between">
          <label className="text-label-md font-semibold text-on-surface block">
            Confirm Password
          </label>
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-label-sm text-primary hover:underline"
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={isLoading}
          className="w-full"
        />
        {formData.confirmPassword &&
          formData.password === formData.confirmPassword && (
            <p className="text-label-xs text-tertiary font-medium">✓ Passwords match</p>
          )}
        {formData.confirmPassword &&
          formData.password !== formData.confirmPassword && (
            <p className="text-label-xs text-error font-medium">✗ Passwords do not match</p>
          )}
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-sm pt-md">
        <input
          type="checkbox"
          name="agreeToTerms"
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          disabled={isLoading}
          className="w-5 h-5 mt-0.5 cursor-pointer"
        />
        <label htmlFor="agreeToTerms" className="text-label-sm text-on-surface-variant">
          I agree to the{' '}
          <Link href="#" className="text-primary hover:underline font-semibold">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="text-primary hover:underline font-semibold">
            Privacy Policy
          </Link>
        </label>
      </div>

      {/* Sign Up Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={
          isLoading ||
          !formData.name ||
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword ||
          !formData.agreeToTerms
        }
        loading={isLoading}
        className="mt-md"
      >
        Create Account
      </Button>
    </form>
  );
}
