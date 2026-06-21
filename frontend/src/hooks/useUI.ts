import { useUIStore } from '@/store';

export function useUI() {
  const { sidebarOpen, toggleSidebar, activeModal, openModal, closeModal } = useUIStore();

  return {
    sidebarOpen,
    toggleSidebar,
    activeModal,
    openModal,
    closeModal,
  };
}
