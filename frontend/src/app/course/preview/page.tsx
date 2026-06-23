"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const modules = [
  {
    title: "Module 1: Cognitive Foundations",
    icon: "psychology",
    color: "bg-primary-container/20 text-primary",
    lessons: [
      { name: "Understanding Mental Models", duration: "15 min", icon: "play_circle" },
      { name: "Hick's Law in Action", duration: "22 min", icon: "play_circle" },
      { name: "Knowledge Check: Cognitive Load", duration: "5 min", icon: "quiz" },
    ],
  },
  {
    title: "Module 2: Behavioral Patterns",
    icon: "analytics",
    color: "bg-secondary-container/20 text-secondary",
    desc: "Explore how users make decisions and the biases that influence digital interactions. Includes a deep dive into social proof and loss aversion.",
  },
  {
    title: "Module 3: Information Architecture",
    icon: "architecture",
    color: "bg-tertiary-container/20 text-tertiary",
    desc: "Learn the psychology behind card sorting, navigation patterns, and how human memory affects menu structures.",
  },
];

const capstone = {
  title: "Final Capstone Project",
  subtitle: "End-to-End UX Psychology Audit",
  tasks: [
    "Conduct a behavioral audit of a live application.",
    "Propose changes based on 5+ cognitive principles.",
    "Present a Figma prototype showing before/after metrics.",
  ],
};

export default function CoursePreviewPage() {
  const router = useRouter();
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({ "Module 1: Cognitive Foundations": true });

  const toggle = (title: string) => {
    setOpenModules((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden pt-12 pb-8 px-4">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="flex-1 text-center md:text-left">
              <span className="bg-tertiary-container text-on-tertiary-container text-xs font-semibold px-4 py-2 rounded-full mb-4 inline-block">
                AI-Tailored Learning
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-on-background mb-4">
                Mastering UX Psychology
              </h1>
              <p className="text-lg text-on-surface-variant mb-8 max-w-2xl">
                Dive deep into the human mind. Learn to craft digital experiences that resonate emotionally and
                cognitively through behavioral design principles and scientific research methodologies.
              </p>
            </div>
            <div className="flex-1 w-full max-w-md animate-float">
              <div className="aspect-video rounded-xl shadow-2xl overflow-hidden relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE7fXp5aGtEk-6biFOaMxxAOufWudKgnGujOcvo01TLwkkPjE37Ecn2PNKBYooqPDjKyxLgoXk5epZfi2ODQHnDFpbyGX_jDnJMPDh9FeQwpIgp6C91YmIod1sdK4jCXzMU7_6BPGDnVvR-ITg1BAgwfHYHVc3LRRoIV43mUwImJg3QiAuWZ6ytfsJ9xN4K5oJGDel5Q7x_b0BxjCf20AADlwgcEFpkZ6WnXNVqUX5kw1oX08p8w1wKAc6BVhm1rfBrMwGsukdGz4e"
                  alt="UX Psychology"
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Success Message */}
        <section className="bg-surface-container-low py-8 px-4">
          <div className="max-w-[1280px] mx-auto">
            <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-sm border border-primary/10 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-tertiary-container/20 rounded-full flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  celebration
                </span>
              </div>
              <h2 className="text-3xl font-semibold text-primary">Course Tailored Successfully</h2>
              <p className="text-lg text-on-surface-variant max-w-xl">
                Our AI engine has analyzed your learning goals and professional background to build a roadmap
                perfectly aligned with your career trajectory.
              </p>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-semibold text-on-background">Curriculum Overview</h3>
              <span className="text-sm text-on-surface-variant">8 Modules • 32 Lessons • 12h Total</span>
            </div>
            <div className="space-y-4">
              {modules.map((mod) => (
                <div
                  key={mod.title}
                  className="group border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest hover:border-primary transition-all duration-300"
                >
                  <button
                    className="w-full flex items-center justify-between p-6 text-left"
                    onClick={() => toggle(mod.title)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${mod.color} flex items-center justify-center`}>
                        <span className="material-symbols-outlined">{mod.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold">{mod.title}</h4>
                        <p className="text-xs text-on-surface-variant">
                          {mod.lessons ? `${mod.lessons.length} Lessons • 1 Quiz` : "5 Lessons • Assessment"}
                        </p>
                      </div>
                    </div>
                    <span
                      className="material-symbols-outlined transition-transform duration-300"
                      style={{ transform: openModules[mod.title] ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      expand_more
                    </span>
                  </button>
                  {openModules[mod.title] && (
                    <div className="p-6 pt-0 border-t border-outline-variant bg-surface/30">
                      {mod.lessons ? (
                        <ul className="space-y-4">
                          {mod.lessons.map((l) => (
                            <li key={l.name} className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">{l.icon}</span>
                                <span className="text-base">{l.name}</span>
                              </div>
                              <span className="text-xs text-on-surface-variant">{l.duration}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-on-surface-variant py-4">{mod.desc}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Capstone */}
              <div className="group border border-primary rounded-xl overflow-hidden bg-primary-container/5 hover:bg-primary-container/10 transition-all duration-300">
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => toggle("capstone")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">workspace_premium</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{capstone.title}</h4>
                      <p className="text-xs text-primary font-bold">{capstone.subtitle}</p>
                    </div>
                  </div>
                  <span
                    className="material-symbols-outlined transition-transform duration-300"
                    style={{ transform: openModules["capstone"] ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    expand_more
                  </span>
                </button>
                {openModules["capstone"] && (
                  <div className="p-6 pt-0 border-t border-primary/20">
                    <div className="py-4 space-y-2">
                      <p className="text-on-surface">Apply everything you&apos;ve learned to a real-world product. You will:</p>
                      <ul className="list-disc pl-4 text-on-surface-variant space-y-1">
                        {capstone.tasks.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 px-4 bg-primary-container/5 border-t border-primary/10">
          <div className="max-w-[1280px] mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-on-background mb-4">Ready to start your journey?</h2>
            <p className="text-lg text-on-surface-variant mb-8 max-w-2xl mx-auto">
              Join thousands of designers mastering the science of user behavior with our AI-tailored curriculum.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                className="bg-primary text-on-primary text-2xl font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
                onClick={() => router.push("/course/1")}
              >
                Enroll in Course
              </button>
              <button
                className="flex items-center justify-center gap-2 border border-outline text-on-surface text-2xl font-semibold px-8 py-4 rounded-xl hover:bg-surface-container transition-all w-full sm:w-auto"
                onClick={() => router.push("/generate")}
              >
                Create a New Course
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
