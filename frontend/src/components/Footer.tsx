"use client";
import { useState } from "react";

export default function Footer() {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <footer className="bg-surface-container-low mt-auto">
        <div className="w-full px-6 md:px-8 py-12 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="text-2xl font-bold text-primary">AuraLearn</span>
            <p className="text-sm text-on-surface-variant max-w-[300px] text-center md:text-left opacity-80 hover:opacity-100 transition-opacity">
              Empowering the next generation of thinkers, designers, and engineers through energetic,
              human-centric education.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <button
              onClick={() => setShowSupportModal(true)}
              className="text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Contact Us
            </button>
          </div>
        </div>
      </footer>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-8 max-w-sm mx-4 border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">help</span>
              <h2 className="text-2xl font-semibold text-on-surface">Support</h2>
            </div>

            <p className="text-base text-on-surface-variant mb-6">
              For any support or assistance, please contact:
            </p>

            <div className="bg-primary-container/10 border border-primary-container/30 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-on-surface mb-2">Contact:</p>
              <p className="text-base text-primary font-semibold">mirza.b.baig@globallogic.com</p>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full bg-primary text-on-primary py-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
