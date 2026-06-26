"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useApiCall } from "@/hooks/useApiCall";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const steps = [
  { label: "Analyzing requirements...", successMessage: "Requirements Validated" },
  { label: "Waiting in Course Generation Queue...", successMessage: "Sent the requirements to AI" },
  { label: "Generating Course...", successMessage: "Course Generated" },
  { label: "Ready for Your Review", successMessage: "Review & Submit to Admin" },
];

export default function GeneratePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const apiCall = useApiCall();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("1w");
  const [audience, setAudience] = useState("");
  const [tags, setTags] = useState("");
  const [phase, setPhase] = useState<"form" | "generating" | "approval" | "done">("form");
  const [currentStep, setCurrentStep] = useState(0);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Duration options mapping display text to API format
  const durationOptions = [
    { label: "2 Hours", value: "2h" },
    { label: "1 Day", value: "1d" },
    { label: "1 Week", value: "1w" },
    { label: "2 Weeks", value: "2w" },
    { label: "4 Weeks", value: "4w" },
    { label: "1 Month", value: "1m" },
    { label: "3 Months", value: "3m" },
  ];

  const pollStatus = async (id: number) => {
    try {
      console.log(`[POLL] 🔄 Polling course generation status for ID: ${id} at ${new Date().toLocaleTimeString()}`);

      const response = await apiCall<any>(`/api/course-generation/status/${id}`, {
        method: "GET",
      });

      if (response?.status && response.data) {
        const queueStatus = response.data.queue_status;
        console.log(`[POLL] ✅ Response received:`, {
          generationId: id,
          queueStatus: queueStatus,
          timestamp: new Date().toLocaleTimeString(),
          fullResponse: response.data,
        });

        setStatus(queueStatus);

        if (queueStatus === "pending" || queueStatus === "Awaiting Generation") {
          console.log(`[POLL] ⏳ Status: PENDING - Waiting for AI pipeline to start generation`);
          // Keep current step, don't reset to 0
          // Step already set to 1 when request was accepted
        } else if (queueStatus === "generating" || queueStatus === "Generating") {
          console.log(`[POLL] ⚙️  Status: GENERATING - AI is actively generating course content`);
          // Move to step 2: "Generating Course..."
          setCurrentStep(2);
        } else if (queueStatus === "generated" || queueStatus === "Generated") {
          console.log(`[POLL] ✨ Status: GENERATED - Course generation complete! Moving to approval phase`);
          setCurrentStep(steps.length - 1);
          setPhase("approval");
        } else if (queueStatus === "published") {
          console.log(`[POLL] 🎉 Status: PUBLISHED - Course has been approved and published!`);
          showToast("Course approved and published!", "success");
          setTimeout(() => router.push("/dashboard"), 2000);
        } else if (queueStatus === "failed") {
          console.error(`[POLL] ❌ Status: FAILED - Course generation failed with error:`, response.data.error);
          showToast(`Course generation failed: ${response.data.error || "No reason provided"}`, "error");
          setPhase("form");
        } else {
          console.warn(`[POLL] ⚠️  Unknown status received: ${queueStatus}`);
        }
      } else {
        console.warn(`[POLL] ⚠️  No response data or status error:`, response);
      }
    } catch (error) {
      console.error(`[POLL] 💥 Error polling status for ID ${id}:`, error);
    }
  };

  // Setup polling when generation starts
  useEffect(() => {
    if (generationId && phase === "generating") {
      console.log(`[INIT] 🚀 Starting polling for generation ID: ${generationId}`);
      console.log(`[INIT] ⏱️  Polling interval: 3000ms (every 3 seconds)`);

      // Poll immediately on first load
      pollStatus(generationId);

      const pollInterval = setInterval(() => {
        pollStatus(generationId);
      }, 3000); // Poll every 3 seconds

      return () => {
        console.log(`[CLEANUP] 🛑 Stopping polling for generation ID: ${generationId}`);
        clearInterval(pollInterval);
      };
    } else if (phase === "approval") {
      console.log(`[STOP] ⏸️  Polling stopped - phase changed to "approval"`);
    }
  }, [generationId, phase, apiCall, router, showToast]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    try {
      console.log(`[START] 📝 Starting course generation request`);
      console.log(`[START] 📋 Course Details:`, {
        topic,
        difficulty,
        duration,
        audience,
        tags,
        timestamp: new Date().toLocaleTimeString(),
      });

      setPhase("generating");
      setCurrentStep(0);

      // Send course generation request to backend
      console.log(`[REQUEST] 🌐 Sending POST request to /api/course-generation/create`);
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
        console.log(`[SUCCESS] ✅ Course generation request accepted!`, {
          generationId: response.generation_id,
          queueStatus: response.queue_status,
          timestamp: new Date().toLocaleTimeString(),
        });

        setGenerationId(response.generation_id);
        setStatus(response.queue_status);
        setCurrentStep(1); // Move to next step: "Waiting in Course Generation Queue..."
        showToast("Course generation submitted successfully", "success");
        console.log(`[STEP] 📍 Step progression: "Requirements Validated" ✓ → "Waiting in Course Generation Queue..." ⏳`);
        // Polling will be handled by useEffect
      } else {
        console.error(`[ERROR] ❌ Course generation request failed:`, response?.error);
        showToast(response?.error || "Failed to submit course generation", "error");
        setPhase("form");
      }
    } catch (error) {
      console.error(`[ERROR] 💥 Exception in handleGenerate:`, error);
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
                      {durationOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
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
                  <span className="font-bold text-primary">{durationOptions.find(d => d.value === duration)?.label || duration}</span>
                  {tags && <> with <span className="font-bold text-primary">{tags}</span></>}.
                </p>
                <div className="flex flex-col gap-6 text-left max-w-md mx-auto">
                  {steps.map((step, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center gap-4">
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
                          {step.label}
                        </span>
                      </div>
                      {i < currentStep && (
                        <div className="flex items-center gap-4 ml-12">
                          <span className="text-sm text-primary font-medium">{step.successMessage}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t border-outline-variant/30">
                  <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <span className="text-sm font-medium">{steps[Math.min(currentStep, steps.length - 1)].label}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant opacity-60 mt-4">
                AuraLearn AI can make mistakes. Verify important information.
              </p>
            </div>
          )}

          {/* Approval Waiting State */}
          {phase === "approval" && (
            <div className="w-full py-12 flex flex-col items-center text-center flex-grow justify-center">
              <div className="glass-card rounded-2xl border border-outline-variant/50 shadow-xl p-8 max-w-2xl w-full">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-secondary-container/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-secondary text-4xl animate-pulse">rate_review</span>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-on-surface mb-4">Your Course is Ready for Review</h3>
                <p className="text-lg text-on-surface-variant mb-8">
                  Great! The AI has generated your course. Now it's your turn to review and make any edits before submitting it to our admin team for final approval.
                </p>
                <div className="bg-secondary-container/10 border border-secondary-container/30 rounded-lg p-6 mb-8">
                  <p className="text-base text-on-surface mb-3">
                    <span className="font-semibold">Next Step:</span> Review Your Course
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    You can view, edit, and customize your course before submitting it for admin approval. Once you're satisfied, submit it and our team will review it.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push("/my-courses")}
                    className="bg-primary text-on-primary text-sm font-medium px-8 py-4 rounded-lg shadow-md hover:shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">rate_review</span>
                    Go to My Courses
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="border-2 border-primary text-primary text-sm font-medium px-8 py-4 rounded-lg hover:bg-primary/5 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">arrow_forward</span>
                    Go to Dashboard
                  </button>
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
