'use client';

import { create } from 'zustand';

type GenerationStatus = 'idle' | 'running' | 'completed' | 'failed';

interface GenerationState {
  generationJobId: string | null;
  generationStatus: GenerationStatus;
  currentStep: string;
  error: string | null;

  setJobId: (jobId: string | null) => void;
  setGenerationStatus: (status: GenerationStatus) => void;
  setCurrentStep: (step: string) => void;
  setError: (error: string | null) => void;
  resetGeneration: () => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  generationJobId: null,
  generationStatus: 'idle',
  currentStep: '',
  error: null,

  setJobId: (generationJobId: string | null) => set({ generationJobId }),

  setGenerationStatus: (generationStatus: GenerationStatus) =>
    set({ generationStatus }),

  setCurrentStep: (currentStep: string) => set({ currentStep }),

  setError: (error: string | null) => set({ error }),

  resetGeneration: () =>
    set({
      generationJobId: null,
      generationStatus: 'idle',
      currentStep: '',
      error: null,
    }),
}));
