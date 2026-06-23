"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const { signup, error } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setLocalError("");
    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);
    if (result.success) {
      setToast(true);
      setTimeout(() => {
        setToast(false);
        router.push("/");
      }, 1500);
    } else {
      setLocalError(result.error || "Signup failed");
    }
  };

  return (
    <main className="flex min-h-screen w-full">
      {/* Left Side */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-center justify-center p-8">
        <div className="relative z-10 text-on-primary max-w-lg">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 bg-primary-container/20 px-4 py-1 rounded-full border border-primary-container/30">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="text-sm font-medium">Unlock Your Potential</span>
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-4 leading-tight">Master the skills of tomorrow, today.</h1>
          <p className="text-lg text-on-primary/80 mb-8">
            Join 500,000+ learners who are accelerating their careers with AI-driven personalized paths and
            hands-on projects.
          </p>
          <div className="glass-effect rounded-xl p-6 border border-white/20 shadow-xl max-w-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-white">trending_up</span>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">Momentum Gained</p>
                <p className="text-2xl font-semibold text-primary">+84% Proficiency</p>
              </div>
            </div>
            <div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[84%] rounded-full shadow-[0_0_8px_rgba(0,97,167,0.4)]" />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/30 rounded-full blur-3xl" />
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-tertiary/20 rounded-full blur-3xl" />
      </section>

      {/* Right Side */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-12 bg-surface">
        <div className="w-full max-w-[480px]">
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <span className="text-2xl font-bold text-primary">AuraLearn</span>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-on-surface mb-1">Join the future of learning</h2>
            <p className="text-base text-on-surface-variant">
              Create your account to start your personalized learning journey.
            </p>
          </div>
          {(localError || error) && (
            <div className="p-4 bg-error/10 border border-error rounded-lg mb-6">
              <p className="text-sm font-medium text-error">{localError || error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="full-name">Full Name</label>
              <input
                className="w-full px-4 py-3.5 rounded-lg border border-outline-variant bg-white text-base text-on-surface focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
                id="full-name" placeholder="Alex Rivera" required type="text"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="signup-email">Email Address</label>
              <input
                className="w-full px-4 py-3.5 rounded-lg border border-outline-variant bg-white text-base text-on-surface focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
                id="signup-email" placeholder="alex@example.com" required type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="signup-password">Password</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3.5 pr-12 rounded-lg border border-outline-variant bg-white text-base text-on-surface focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
                  id="signup-password" placeholder="Min. 8 characters" required type={showPw ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)} minLength={8}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1"
                  onClick={() => setShowPw(!showPw)} type="button"
                >
                  <span className="material-symbols-outlined">{showPw ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            <div className="flex items-start gap-4 pt-2">
              <input
                className="mt-1 w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary/20 accent-primary"
                id="terms" required type="checkbox"
                checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              />
              <label className="text-xs font-semibold text-on-surface-variant" htmlFor="terms">
                I agree to the <a className="text-primary hover:underline font-bold" href="#">Terms of Service</a> and{" "}
                <a className="text-primary hover:underline font-bold" href="#">Privacy Policy</a>.
              </label>
            </div>
            <button
              className="w-full bg-primary text-on-primary py-6 rounded-lg text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50"
              type="submit" disabled={loading || !agreed}
            >
              {loading ? "Creating Account..." : "Create My Account"}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-base text-on-surface-variant">
              Already have an account?{" "}
              <Link className="text-primary font-bold hover:underline ml-1" href="/login">Log In</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 bg-surface-container-highest border border-primary/20 p-4 rounded-xl shadow-2xl flex items-center gap-4 z-50 transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
        }`}
      >
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">check_circle</span>
        </div>
        <div>
          <p className="text-sm font-medium text-on-surface">Account created!</p>
          <p className="text-xs text-on-surface-variant">Welcome to AuraLearn, {name || "User"}.</p>
        </div>
      </div>
    </main>
  );
}
