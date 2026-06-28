import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import TokenExpirationHandler from "@/components/TokenExpirationHandler";
import ToastContainer from "@/components/ToastContainer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AuraLearn | The Future of Learning",
  description:
    "AI-powered personalized education platform. Master the skills of tomorrow with tailored courses, adaptive learning paths, and hands-on projects.",
};

import AuraBot from "@/components/AuraBot";
import NotesPopup from "@/components/NotesPopup";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased scroll-smooth`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {/* Fixed full-viewport gradient background */}
        <div className="ambient-bg-layer" aria-hidden="true" />

        {/* Organic ambient pebble blobs — ambient light layer */}
        <div className="ambient-pebble ambient-pebble-amber animate-pulse-soft" aria-hidden="true" style={{ animationDelay: '0s' }} />
        <div className="ambient-pebble ambient-pebble-sky animate-pulse-soft" aria-hidden="true" style={{ animationDelay: '2s' }} />
        <div className="ambient-pebble ambient-pebble-violet animate-pulse-soft" aria-hidden="true" style={{ animationDelay: '4s' }} />
        <div className="ambient-pebble ambient-pebble-peach animate-pulse-soft" aria-hidden="true" style={{ animationDelay: '1s' }} />
        <div className="ambient-pebble ambient-pebble-mint animate-pulse-soft" aria-hidden="true" style={{ animationDelay: '3s' }} />

        {/* All content above the pebble layer */}
        <div className="content-layer min-h-full flex flex-col">
          <AuthProvider>
            <ToastProvider>
              <TokenExpirationHandler />
              <ToastContainer />
              {children}
              <AuraBot />
              <NotesPopup />
            </ToastProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
