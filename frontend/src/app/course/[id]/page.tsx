"use client";
import { useState } from "react";
import Link from "next/link";

const sidebarData = [
  {
    title: "Module 1: Cognitive Foundations",
    lessons: [
      { name: "The Designer's Brain", status: "completed" },
      { name: "Understanding Mental Models", status: "current" },
      { name: "Cognitive Load Theory", status: "locked" },
      { name: "Practice: User Flow Audit", status: "locked", badge: true },
    ],
  },
  {
    title: "Module 2: Behavioral Patterns",
    lessons: [
      { name: "Hick's Law in Action", status: "locked" },
      { name: "Fitts's Law Demystified", status: "locked" },
      { name: "Mid-term Assessment", status: "locked" },
    ],
  },
];

export default function CourseLearningPage() {
  const [activeLesson, setActiveLesson] = useState("Understanding Mental Models");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <nav className="bg-surface-container-lowest fixed top-0 w-full z-50 shadow-[0_12px_16px_rgba(0,0,0,0.04)] h-16">
        <div className="flex justify-between items-center w-full px-6 max-w-[1280px] mx-auto h-full">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-semibold text-primary tracking-tight">AuraLearn</Link>
            <div className="hidden md:flex items-center gap-4 ml-8">
              <Link href="/dashboard" className="text-base text-primary border-b-2 border-primary pb-1">My Learning</Link>
              <Link href="/courses" className="text-base text-on-surface-variant hover:text-primary transition-colors">Courses</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-all">notifications</button>
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold border border-outline-variant">AC</div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="pt-16 h-screen flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 bg-surface-container-lowest border-r border-surface-container shadow-sm overflow-y-auto custom-scrollbar flex flex-col hidden md:flex">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-on-surface mb-2">Mastering UX Psychology</h1>
            <div className="w-full bg-surface-container rounded-full h-2 mb-6 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "35%" }} />
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-on-surface-variant">
              <span>Progress</span>
              <span className="text-primary font-bold">35% Complete</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 pb-8">
            {sidebarData.map((mod, mi) => (
              <div key={mi} className="px-6 mb-4">
                <div className="flex items-center justify-between py-2 cursor-pointer group">
                  <h2 className="text-sm font-medium text-on-surface uppercase tracking-wider">{mod.title}</h2>
                  {mi > 0 && <span className="material-symbols-outlined text-outline">lock</span>}
                </div>
                <div className={`space-y-1 mt-2 ${mi > 0 ? "opacity-60" : ""}`}>
                  {mod.lessons.map((lesson, li) => (
                    <button
                      key={li}
                      className={`flex items-center gap-2 p-2 rounded-lg w-full text-left transition-all ${
                        lesson.name === activeLesson
                          ? "bg-primary-container text-on-primary-container shadow-sm border border-primary/10"
                          : lesson.status === "locked" && mi > 0
                          ? "pointer-events-none text-on-surface-variant"
                          : "hover:bg-surface-container-low text-on-surface-variant"
                      }`}
                      onClick={() => lesson.status !== "locked" && setActiveLesson(lesson.name)}
                    >
                      <span
                        className={`material-symbols-outlined ${
                          lesson.status === "completed" ? "text-tertiary-container" : lesson.name === activeLesson ? "text-on-primary-container" : "text-outline"
                        }`}
                        style={{ fontVariationSettings: lesson.status === "completed" ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {lesson.status === "completed" ? "check_circle" : lesson.name === activeLesson ? "play_circle" : "radio_button_unchecked"}
                      </span>
                      <span className={`text-base ${lesson.name === activeLesson ? "font-semibold" : ""}`}>{lesson.name}</span>
                      {lesson.badge && <span className="ml-auto material-symbols-outlined text-tertiary-container text-[18px]">verified</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {/* Marked to revisit */}
            <div className="px-6 mt-12 border-t border-surface-container pt-8">
              <h2 className="text-sm font-medium text-on-surface-variant mb-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">bookmark_border</span>
                Marked to Revisit
              </h2>
              <div className="p-2 bg-surface-container-high rounded-lg flex items-center gap-2 border border-primary/5">
                <span className="material-symbols-outlined text-[#F59E0B] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <span className="text-sm font-medium text-on-surface">Gestalt Principles</span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <section className="flex-1 flex flex-col bg-background relative overflow-y-auto">
          {/* Top Bar */}
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-container flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-on-surface-variant">Module 1 • Lesson 2</span>
              <h3 className="text-2xl font-semibold text-on-surface hidden md:block">{activeLesson}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-all active:scale-95">
                <span className="material-symbols-outlined text-[18px]">bookmark</span>Mark to Revisit
              </button>
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-tertiary text-on-primary text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">check</span>Complete &amp; Next
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full space-y-8 pb-12">
            <div className="space-y-6">
              <header>
                <h2 className="text-3xl font-semibold text-on-surface mb-2">What are Mental Models?</h2>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  A mental model is what the user believes about the system at hand. These models are based on belief, not facts: that is, it&apos;s a model of what users know (or think they know) about a system.
                </p>
              </header>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-6 bg-surface-container-low rounded-xl border border-surface-container">
                  <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary">psychology</span>
                  </div>
                  <h4 className="text-2xl font-semibold text-on-surface mb-1">Jakob&apos;s Law</h4>
                  <p className="text-base text-on-surface-variant">
                    Users spend most of their time on other sites. This means they prefer your site to work the same way as all the other sites they already know.
                  </p>
                </div>
                <div className="p-6 bg-surface-container-low rounded-xl border border-surface-container">
                  <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-tertiary">schema</span>
                  </div>
                  <h4 className="text-2xl font-semibold text-on-surface mb-1">Consistency is Key</h4>
                  <p className="text-base text-on-surface-variant">
                    By leveraging existing mental models, we can create superior experiences in which the users can focus on their tasks rather than learning new models.
                  </p>
                </div>
              </div>

              {/* Additional content */}
              <div className="space-y-4">
                <p className="text-base text-on-surface-variant">
                  The most common mistake designers make is assuming that their users have the same mental model as they do. This is often called the &quot;False-Consensus Effect.&quot; To avoid this, we must:
                </p>
                <ul className="space-y-2">
                  {[
                    "Conduct thorough user research before defining architectures.",
                    "Use card sorting to understand how users categorize information.",
                    "Maintain internal consistency across the entire product ecosystem.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary mt-1">trending_flat</span>
                      <span className="text-base text-on-surface-variant">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-12 border-t border-surface-container flex flex-col md:flex-row items-center justify-between gap-6">
              <button className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_back</span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase">Previous Lesson</p>
                  <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">The Designer&apos;s Brain</p>
                </div>
              </button>
              <button className="flex items-center gap-4 group text-right">
                <div className="text-right">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase">Next Lesson</p>
                  <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">Cognitive Load Theory</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-on-primary">arrow_forward</span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-surface-container-low py-8 mt-auto">
            <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 max-w-[1280px] mx-auto gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <span className="text-lg font-semibold text-on-surface">AuraLearn AI</span>
                <span className="text-sm text-on-surface-variant">© {new Date().getFullYear()} AuraLearn AI. All rights reserved.</span>
              </div>
              <div className="flex gap-6">
                <a className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
                <a className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
              </div>
            </div>
          </footer>
        </section>
      </main>

      {/* FAB */}
      <button className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-secondary text-on-secondary shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group">
        <span className="material-symbols-outlined text-[28px]">edit_note</span>
        <span className="absolute right-full mr-4 bg-on-background text-white px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Take Notes</span>
      </button>
    </div>
  );
}
