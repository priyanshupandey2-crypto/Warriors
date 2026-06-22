'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import { X, Zap, CheckCircle2, ChevronDown } from 'lucide-react';

interface CourseFormData {
  topic: string;
  difficulty: string;
  duration: string;
  tags: string[];
}

interface FormErrors {
  topic?: string;
  difficulty?: string;
  duration?: string;
  tags?: string;
}

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const DURATION_OPTIONS = ['1 week', '2 weeks', '4 weeks', '6 weeks', '8 weeks', '12 weeks'];

export default function CreatePage() {
  const [formData, setFormData] = useState<CourseFormData>({
    topic: '',
    difficulty: '',
    duration: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
      if (errors.tags) {
        setErrors((prev) => ({
          ...prev,
          tags: '',
        }));
      }
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.topic.trim()) {
      newErrors.topic = 'Please enter a course topic';
    } else if (formData.topic.trim().length < 3) {
      newErrors.topic = 'Topic must be at least 3 characters';
    }
    if (!formData.difficulty) {
      newErrors.difficulty = 'Please select a difficulty level';
    }
    if (!formData.duration) {
      newErrors.duration = 'Please select a course duration';
    }
    if (formData.tags.length === 0) {
      newErrors.tags = 'Add at least one tag to help personalize your course';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const steps = [10, 30, 60, 85, 100];
    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setGenerationProgress(step);
    }

    setIsSubmitting(false);
    setIsGenerating(false);

    // Show success and reset after 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGenerationProgress(0);
    alert(`Course "${formData.topic}" generated successfully!`);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-surface-container/20"></div>
        {/* Subtle orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 blur-[120px] rounded-full opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/8 blur-[100px] rounded-full opacity-15"></div>
      </div>

      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center py-xxl px-md md:px-lg relative w-full">
        <div className="w-full max-w-3xl">
          {/* Welcome Section */}
          {!isGenerating && (
            <div className="mb-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-2xl md:text-3xl font-bold text-on-background mb-sm leading-tight">
                Build Your Custom Course
              </h1>
              <p className="text-body-md text-on-surface-variant leading-relaxed max-w-2xl">
                Let our AI architect structure your learning path. Describe what you want to learn, and we'll create a comprehensive syllabus, lessons, and timeline.
              </p>
            </div>
          )}

          {/* Form Card */}
          {!isGenerating && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="w-full bg-surface-container-lowest rounded-lg border border-outline-variant/25 shadow-md overflow-hidden">
                {/* Card Header */}
                <div className="bg-surface-container/40 border-b border-outline-variant/20 px-lg md:px-xl py-md md:py-lg">
                  <h2 className="text-lg font-semibold text-on-surface">Course Details</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-lg md:p-xl space-y-lg">
                  {/* Topic */}
                  <div className="flex flex-col gap-md">
                    <div className="flex items-baseline justify-between">
                      <label htmlFor="topic" className="font-label-lg font-semibold text-on-surface">
                        What do you want to learn?
                      </label>
                      <span className="text-label-sm text-on-surface-variant opacity-70">
                        {formData.topic.length}/150
                      </span>
                    </div>
                    <input
                      id="topic"
                      type="text"
                      name="topic"
                      maxLength={150}
                      value={formData.topic}
                      onChange={handleInputChange}
                      placeholder="e.g. Climate Change Policy or Advanced JavaScript"
                      className={`w-full bg-surface rounded-lg px-md py-md font-body-md transition-all duration-200 placeholder:text-on-surface-variant/40 ${
                        errors.topic
                          ? 'border-2 border-error focus:ring-4 focus:ring-error/20'
                          : 'border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15'
                      } outline-none`}
                    />
                    {errors.topic && (
                      <p className="text-label-sm text-error font-medium flex items-center gap-xs">
                        <span className="w-1 h-1 bg-error rounded-full"></span>
                        {errors.topic}
                      </p>
                    )}
                  </div>

                  {/* Difficulty & Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    {/* Difficulty */}
                    <div className="flex flex-col gap-md">
                      <label htmlFor="difficulty" className="font-label-lg font-semibold text-on-surface">
                        Difficulty Level
                      </label>
                      <div className="relative">
                        <select
                          id="difficulty"
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleInputChange}
                          className={`w-full bg-surface rounded-lg px-md py-md font-body-md transition-all duration-200 cursor-pointer appearance-none pr-xl ${
                            errors.difficulty
                              ? 'border-2 border-error focus:ring-4 focus:ring-error/20'
                              : 'border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15'
                          } outline-none`}
                        >
                          <option value="">Choose a level</option>
                          {DIFFICULTY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-md top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none opacity-60" />
                      </div>
                      {errors.difficulty && (
                        <p className="text-label-sm text-error font-medium flex items-center gap-xs">
                          <span className="w-1 h-1 bg-error rounded-full"></span>
                          {errors.difficulty}
                        </p>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="flex flex-col gap-md">
                      <label htmlFor="duration" className="font-label-lg font-semibold text-on-surface">
                        Learning Duration
                      </label>
                      <div className="relative">
                        <select
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className={`w-full bg-surface rounded-lg px-md py-md font-body-md transition-all duration-200 cursor-pointer appearance-none pr-xl ${
                            errors.duration
                              ? 'border-2 border-error focus:ring-4 focus:ring-error/20'
                              : 'border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15'
                          } outline-none`}
                        >
                          <option value="">Choose duration</option>
                          {DURATION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-md top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none opacity-60" />
                      </div>
                      {errors.duration && (
                        <p className="text-label-sm text-error font-medium flex items-center gap-xs">
                          <span className="w-1 h-1 bg-error rounded-full"></span>
                          {errors.duration}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags Divider */}
                  <div className="border-t border-outline-variant/20 pt-lg"></div>

                  {/* Tags */}
                  <div className="flex flex-col gap-md">
                    <div className="flex items-baseline justify-between">
                      <label htmlFor="tags" className="font-label-lg font-semibold text-on-surface">
                        Relevant Topics & Skills
                      </label>
                      <span className="text-label-sm text-on-surface-variant opacity-70">
                        {formData.tags.length}/5
                      </span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant">
                      Help us personalize your course with specific topics
                    </p>
                    <div className="flex gap-sm">
                      <input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. ESG, Finance, Ethics"
                        disabled={formData.tags.length >= 5}
                        className={`flex-grow bg-surface rounded-lg px-md py-md font-body-md transition-all duration-200 placeholder:text-on-surface-variant/40 disabled:opacity-50 disabled:cursor-not-allowed ${
                          errors.tags && formData.tags.length === 0
                            ? 'border-2 border-error focus:ring-4 focus:ring-error/20'
                            : 'border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15'
                        } outline-none`}
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim() || formData.tags.length >= 5}
                        className="px-lg py-md rounded-lg bg-primary text-on-primary font-label-md font-semibold border border-primary hover:shadow-md hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-primary transition-all duration-200 active:scale-95"
                      >
                        Add
                      </button>
                    </div>
                    {errors.tags && (
                      <p className="text-label-sm text-error font-medium flex items-center gap-xs">
                        <span className="w-1 h-1 bg-error rounded-full"></span>
                        {errors.tags}
                      </p>
                    )}

                    {/* Tag Chips */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-md mt-md pt-md border-t border-outline-variant/20">
                        {formData.tags.map((tag, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-sm px-md py-sm rounded-lg bg-primary-container/25 text-primary border border-primary/40 font-label-sm font-medium animate-in fade-in scale-in duration-200"
                          >
                            <span className="font-medium">{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(idx)}
                              className="flex items-center justify-center hover:opacity-60 transition-opacity duration-150 active:scale-90"
                              aria-label={`Remove ${tag}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Section */}
                  <div className="border-t border-outline-variant/20 pt-lg flex flex-col items-center gap-md">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-on-primary font-label-lg font-bold text-label-lg px-lg py-md rounded-lg shadow-md hover:shadow-lg hover:bg-primary/95 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-sm disabled:hover:shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-md"
                    >
                      <Zap className="w-5 h-5" />
                      {isSubmitting ? (
                        <>
                          <span className="inline-block animate-spin">⚡</span>
                          Generating Your Course
                        </>
                      ) : (
                        'Generate My Course'
                      )}
                    </button>

                    <p className="text-label-sm text-on-surface-variant opacity-70 text-center">
                      Takes about 2-3 minutes. AuraLearn AI can make mistakes—always verify important information.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Generation State */}
          {isGenerating && (
            <div className="w-full animate-in fade-in duration-500">
              <div className="w-full bg-surface-container-lowest rounded-lg border border-outline-variant/25 shadow-md p-lg md:p-xl">
                {/* Summary */}
                <div className="mb-lg">
                  <p className="text-body-md text-on-surface-variant mb-md text-center">Building your personalized course:</p>
                  <div className="flex flex-wrap gap-sm justify-center mb-lg">
                    <span className="px-lg py-sm rounded-lg bg-primary/10 text-primary font-label-md font-bold border border-primary/30">
                      {formData.topic}
                    </span>
                    <span className="px-lg py-sm rounded-lg bg-secondary/10 text-secondary font-label-md font-bold border border-secondary/30">
                      {formData.difficulty}
                    </span>
                    <span className="px-lg py-sm rounded-lg bg-tertiary/10 text-tertiary font-label-md font-bold border border-tertiary/30">
                      {formData.duration}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-xs justify-center">
                    {formData.tags.map((tag, i) => (
                      <span key={i} className="px-sm py-xs rounded text-label-sm text-on-surface-variant bg-surface-container">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-lg">
                  <div className="relative h-2 bg-surface-container rounded-lg overflow-hidden mb-md">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out rounded-lg"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-label-sm font-semibold text-on-surface text-center">
                    {generationProgress}% Complete
                  </p>
                </div>

                {/* Status Steps */}
                <div className="space-y-sm mb-lg max-w-md mx-auto">
                  {[
                    { label: 'Analyzing your inputs', step: 'Step 1' },
                    { label: 'Building course structure', step: 'Step 2' },
                    { label: 'Creating lessons', step: 'Step 3' },
                    { label: 'Generating assessments', step: 'Step 4' },
                  ].map((item, idx) => {
                    const stepProgress = Math.ceil(((idx + 1) / 4) * 100);
                    const isCompleted = generationProgress >= stepProgress;
                    const isCurrent = !isCompleted && generationProgress > (idx === 0 ? 0 : Math.ceil(idx / 4) * 100);

                    return (
                      <div key={idx} className="flex items-center gap-md">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 flex-shrink-0 ${
                            isCompleted
                              ? 'bg-tertiary text-on-tertiary'
                              : isCurrent
                                ? 'bg-primary text-on-primary scale-110'
                                : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`text-label-md font-medium transition-colors duration-200 ${
                              isCompleted || isCurrent ? 'text-on-surface' : 'text-on-surface-variant opacity-60'
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className={`text-label-sm ${isCompleted || isCurrent ? 'text-on-surface-variant' : 'text-on-surface-variant/50'}`}>
                            {item.step}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-label-md text-on-surface-variant text-center">
                  Your AI course architect is working its magic...
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline-variant/10 mt-auto">
        <div className="w-full px-lg md:px-xl py-lg flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto gap-md">
          <div className="flex flex-col items-center md:items-start gap-xs">
            <span className="font-headline-md font-bold text-primary">AuraLearn</span>
            <p className="font-label-sm text-on-surface-variant">© 2024 AuraLearn. Elevating education with AI.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-lg">
            <a className="font-label-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">
              Privacy Policy
            </a>
            <a className="font-label-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">
              Terms of Service
            </a>
            <a className="font-label-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
