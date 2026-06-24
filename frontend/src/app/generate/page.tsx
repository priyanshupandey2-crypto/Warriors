"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useApiCall } from "@/hooks/useApiCall";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const steps = [
  "Analyzing requirements...",
  "Architecting syllabus structure...",
  "Sourcing relevant resources and case studies...",
  "Finalizing schedule and learning path...",
];

export default function GeneratePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const apiCall = useApiCall();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("1 Week");
  const [audience, setAudience] = useState("");
  const [tags, setTags] = useState("");
  const [phase, setPhase] = useState<"form" | "generating" | "done">("form");
  const [currentStep, setCurrentStep] = useState(0);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    try {
      setPhase("generating");
      setCurrentStep(0);

      // Send course generation request to backend
      const response = await apiCall<any>("/api/course-generation/create", {
        method: "POST",
        body: JSON.stringify({
          topic,
          difficulty_level: difficulty,
          learning_duration: duration,
          expertise_domain: audience,
          relevant_tags: tags,
        }),
      });

      if (response && response.status) {
        setGenerationId(response.generation_id);
        showToast("Course generation submitted successfully", "success");

        // Simulate generation steps
        const interval = setInterval(() => {
          setCurrentStep((prev) => {
            if (prev >= steps.length - 1) {
              clearInterval(interval);
              setTimeout(() => router.push("/dashboard"), 1200);
              return prev;
            }
            return prev + 1;
          });
        }, 1800);
      } else {
        showToast(response?.error || "Failed to submit course generation", "error");
        setPhase("form");
      }
    } catch (error) {
      console.error("Failed to generate course:", error);
      showToast("Failed to submit course generation", "error");
      setPhase("form");
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow relative flex flex-col items-center overflow-hidden pt-20">
        {/* Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full" />
        </div>

        <div className="w-full max-w-4xl px-4 md:px-6 flex flex-col min-h-[calc(100vh-180px)]">
          {/* Welcome Section */}
          {phase === "form" && (
            <div className="flex flex-col items-center justify-center pt-12 pb-8 text-center">
              <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold aura-gradient-text mb-2">
                Hello! Ready to build your custom course?
              </h1>
              <p className="text-lg text-on-surface-variant max-w-2xl">
                Our AI architect uses advanced technology to structure your learning path. Describe what you want to learn, and we&apos;ll handle the syllabus, resources, and schedule.
              </p>
            </div>
          )}

          {/* Course Creation Form */}
          {phase === "form" && (
            <div className="w-full pb-8 mt-auto">
              <div className="glass-card rounded-2xl border border-outline-variant/50 shadow-xl p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-on-surface mb-6">Course Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-sm font-medium text-on-surface-variant">Topic</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      placeholder="e.g. Sustainable Investing or Greek Mythology"
                      value={topic} onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-on-surface-variant">Difficulty Level</label>
                    <select className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-on-surface-variant">Learning Duration</label>
                    <select className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" value={duration} onChange={(e) => setDuration(e.target.value)}>
                      <option>1 Week</option>
                      <option>2 Weeks</option>
                      <option>1 Month</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-on-surface-variant">Expertise Domain</label>
                    <select className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" value={audience} onChange={(e) => setAudience(e.target.value)}>
                      <option value="">Select a domain</option>
                      <option>Computer Science</option>
                      <option>Business & Strategy</option>
                      <option>Creative Design</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-on-surface-variant">Relevant Tags</label>
                    <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" placeholder="e.g. ESG, Finance, Ethics" value={tags} onChange={(e) => setTags(e.target.value)} />
                  </div>
                </div>
                <div className="mt-8 flex justify-center">
                  <button
                    className="bg-primary text-on-primary text-sm font-medium px-12 py-4 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40"
                    onClick={handleGenerate} disabled={!topic.trim()}
                  >
                    <span className="material-symbols-outlined">magic_button</span>
                    Generate My Course
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Generation State */}
          {phase === "generating" && (
            <div className="w-full py-12 flex flex-col items-center text-center flex-grow justify-center">
              <div className="glass-card rounded-2xl border border-outline-variant/50 shadow-xl p-8 max-w-2xl w-full">
                <h3 className="text-2xl font-semibold text-on-surface mb-4">Generating Your Course</h3>
                <p className="text-lg text-on-surface mb-8">
                  I understand that you need a course on <span className="font-bold text-primary">{topic}</span> with{" "}
                  <span className="font-bold text-primary">{difficulty}</span> level of a duration of{" "}
                  <span className="font-bold text-primary">{duration}</span>
                  {tags && <> with <span className="font-bold text-primary">{tags}</span></>}.
                </p>
                <div className="flex flex-col gap-6 text-left max-w-md mx-auto">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      {i < currentStep ? (
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-on-primary-container text-xl">check</span>
                        </div>
                      ) : i === currentStep ? (
                        <div className="w-8 h-8 rounded-full border-2 border-primary-container flex items-center justify-center flex-shrink-0 animate-pulse">
                          <div className="w-3 h-3 bg-primary-container rounded-full" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-outline-variant flex items-center justify-center flex-shrink-0 opacity-40">
                          <div className="w-3 h-3 bg-outline-variant rounded-full" />
                        </div>
                      )}
                      <span className={`text-base ${i === currentStep ? "text-primary font-bold" : i < currentStep ? "text-on-surface" : "text-on-surface-variant opacity-40"}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t border-outline-variant/30">
                  <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <span className="text-sm font-medium">Architecting your syllabus...</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant opacity-60 mt-4">
                AuraLearn AI can make mistakes. Verify important information.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
