"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function CourseCompletePage() {
  const router = useRouter();
  const { user } = useAuth();
  const userName = user?.name || "Jane Doe";
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [recommend, setRecommend] = useState<"yes" | "no" | null>("yes");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Top Navigation */}
      <header className="w-full top-0 sticky z-50 bg-surface shadow-sm transition-colors duration-200">
        <div className="flex justify-between items-center h-16 px-6 max-w-[1280px] mx-auto">
          <Link href="/" className="text-2xl font-semibold font-bold text-primary">
            AuraLearn
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/courses" className="text-base text-on-surface-variant hover:text-primary transition-colors">
              Browse Courses
            </Link>
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
              {userName.split(" ").map(n => n[0]).join("").toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center py-8 px-4 md:px-6 max-w-[800px] mx-auto w-full relative">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 -z-10 opacity-30 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-secondary/10 blur-[100px] rounded-full" />
        </div>

        {/* Celebration Section */}
        <section className="text-center mb-12 w-full pt-8">
          <div className="relative inline-block mb-6 animate-float">
            <div className="absolute -inset-4 bg-primary-container/20 blur-xl rounded-full" />
            <div className="relative bg-surface-container-highest p-6 rounded-full border-4 border-white shadow-lg">
              <span
                className="material-symbols-outlined text-primary text-[80px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                workspace_premium
              </span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
            Congratulations, {userName}!
          </h1>
          <p className="text-lg text-on-surface-variant max-w-lg mx-auto">
            You&apos;ve successfully completed the{" "}
            <span className="font-bold text-on-surface">Advanced AI Ethics &amp; Strategy</span> course.
            Your digital badge has been minted and added to your profile.
          </p>
        </section>

        {/* Success Feedback Grid */}
        <div className="w-full grid grid-cols-1 gap-6">
          {/* Share Success Section */}
          <section className="glass-card rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-on-surface">Share Your Success</h2>
              {/* Star Rating */}
              <div className="flex gap-1 mt-4 md:mt-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-125"
                  >
                    <span
                      className={`material-symbols-outlined text-[28px] transition-colors ${
                        star <= (hoverRating || rating)
                          ? "star-active"
                          : "text-outline"
                      }`}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-on-surface-variant">
                Write a course review (Optional)
              </label>
              <textarea
                className="w-full min-h-[120px] p-4 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none text-base"
                placeholder="How did this course impact your learning journey?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>

            {/* Recommendation Toggle */}
            <div className="mt-6 p-4 bg-primary-fixed/20 rounded-lg border border-primary-fixed flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-md">
                <h3 className="text-sm font-medium text-on-primary-fixed mb-1">
                  Recommend to Public Catalog?
                </h3>
                <p className="text-xs leading-tight text-on-primary-fixed-variant">
                  If yes, your review and rating will be sent to our curators for the community catalog
                  to help other learners.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all active:scale-95 ${
                    recommend === "no"
                      ? "bg-primary text-white border-primary"
                      : "border-primary text-primary hover:bg-primary/5"
                  }`}
                  onClick={() => setRecommend("no")}
                >
                  No
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                    recommend === "yes"
                      ? "bg-primary text-white shadow-md border-2 border-primary"
                      : "border-2 border-primary text-primary hover:bg-primary/5"
                  }`}
                  onClick={() => setRecommend("yes")}
                >
                  Yes
                </button>
              </div>
            </div>
          </section>

          {/* Achievement Proof Card */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 glass-card rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="h-48 relative overflow-hidden bg-gradient-to-br from-primary to-secondary">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-white/20 text-[120px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    workspace_premium
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                    Credential ID: AL-9821-X
                  </span>
                  <p className="text-lg font-bold">Advanced AI Ethics</p>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span className="text-sm font-medium text-on-surface">
                    Verified Certificate
                  </span>
                </div>
                <button className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {!submitted ? (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleSubmit}
                className="bg-primary text-on-primary px-12 py-4 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Submit Review & Continue
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 py-4 text-tertiary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="text-lg font-semibold">Review submitted! Redirecting...</span>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="w-full mt-8 flex flex-col md:flex-row items-center justify-center gap-6 border-t border-outline-variant/30 pt-8">
            <Link
              href="/dashboard"
              className="w-full md:w-auto px-8 h-14 flex items-center justify-center rounded-lg border-2 border-outline text-outline text-sm font-medium hover:bg-surface-container-high hover:text-primary hover:border-primary transition-all active:scale-95"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/generate"
              className="w-full md:w-auto px-8 h-14 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-95"
            >
              Create Another Course
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-12 bg-surface-container-low">
        <div className="flex flex-col md:flex-row justify-between items-center py-8 px-6 max-w-[1280px] mx-auto text-sm text-on-surface-variant">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <span className="text-lg font-bold text-primary">AuraLearn</span>
            <p className="mt-1 text-on-surface-variant opacity-70">
              © {new Date().getFullYear()} AuraLearn. Empowering minds through AI.
            </p>
          </div>
          <div className="flex gap-6">
            <a className="hover:underline hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:underline hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:underline hover:text-primary transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
