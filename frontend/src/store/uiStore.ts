'use client';

import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;

  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeModal: null,

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  openModal: (modalId: string) =>
    set({
      activeModal: modalId,
    }),

  closeModal: () =>
    set({
      activeModal: null,
    }),
}));
