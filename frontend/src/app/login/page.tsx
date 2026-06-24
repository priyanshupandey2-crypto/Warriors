"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { login, error, user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    if (user) {
      showToast("You are already logged in", "info", 3000);
      router.push("/");
    }
  }, [user, router, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push("/");
    } else {
      setLocalError(result.error || "Login failed");
    }
  };

  return (
    <main className="min-h-screen flex items-stretch">
      {/* Left: Visual */}
      <div className="hidden lg:flex flex-1 relative luminous-bg items-center justify-center p-12">
        <div className="relative z-10 glass-panel p-8 rounded-xl max-w-lg text-white">
          <h1 className="text-3xl font-semibold mb-4">Master Tomorrow&apos;s Skills Today</h1>
          <p className="text-lg opacity-90 mb-8">
            Join over 2 million learners worldwide and accelerate your momentum with AuraLearn&apos;s AI-powered
            education engine.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-primary-container/60 flex items-center justify-center text-xs font-bold text-white">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm font-medium">+14k joined this week</span>
          </div>
        </div>
        <div className="absolute bottom-8 left-8 z-10">
          <div className="text-2xl font-bold text-white tracking-tight">AuraLearn</div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col justify-center bg-surface-container-lowest px-4 md:px-12 py-12">
        <div className="max-w-[440px] mx-auto w-full space-y-8">
          <div className="space-y-2">
            <div className="lg:hidden mb-6">
              <span className="text-2xl font-extrabold text-primary">AuraLearn</span>
            </div>
            <h2 className="text-3xl font-semibold text-on-surface">Welcome back, Learner!</h2>
            <p className="text-base text-on-surface-variant">
              Log in to pick up right where you left off in your learning journey.
            </p>
          </div>

          {(localError || error) && (
            <div className="p-4 bg-error/10 border border-error rounded-lg">
              <p className="text-sm font-medium text-error">{localError || error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="login-email">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-white border border-outline-variant rounded-lg text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  id="login-email" placeholder="name@company.com" required type="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-on-surface-variant" htmlFor="login-password">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-xs font-semibold text-primary hover:underline transition-all"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                <input
                  className="w-full pl-12 pr-12 py-4 bg-white border border-outline-variant rounded-lg text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  id="login-password" placeholder="••••••••" required type={showPw ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button" onClick={() => setShowPw(!showPw)}>
                  <span className="material-symbols-outlined">{showPw ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            <button
              className="w-full bg-primary text-white text-sm font-medium py-4 rounded-lg shadow-sm hover:shadow-md hover:bg-primary-container transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              type="submit" disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-base text-on-surface-variant">
              Don&apos;t have an account?{" "}
              <Link className="text-primary font-semibold hover:underline decoration-2 underline-offset-4" href="/signup">Sign Up</Link>
            </p>
          </div>

          <footer className="mt-12 pt-8 border-t border-outline-variant">
            <button
              onClick={() => setShowSupportModal(true)}
              className="text-outline text-xs font-semibold hover:text-primary transition-colors"
            >
              Support
            </button>
          </footer>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-8 max-w-sm mx-4 border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-warning text-2xl">lock_reset</span>
              <h2 className="text-2xl font-semibold text-on-surface">Password Reset</h2>
            </div>

            <p className="text-base text-on-surface-variant mb-6">
              To reset your password, please contact our admin team. They'll help you regain access to your account.
            </p>

            <div className="bg-primary-container/10 border border-primary-container/30 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-on-surface mb-2">Admin Contact:</p>
              <p className="text-base text-primary font-semibold">mirza.b.baig@globallogic.com</p>
            </div>

            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="w-full bg-primary text-on-primary py-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-8 max-w-sm mx-4 border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">help</span>
              <h2 className="text-2xl font-semibold text-on-surface">Support</h2>
            </div>

            <p className="text-base text-on-surface-variant mb-6">
              For any support or assistance, please contact:
            </p>

            <div className="bg-primary-container/10 border border-primary-container/30 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-on-surface mb-2">Contact:</p>
              <p className="text-base text-primary font-semibold">mirza.b.baig@globallogic.com</p>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full bg-primary text-on-primary py-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
