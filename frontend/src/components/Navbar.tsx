"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    showToast("Logout successful", "success");
    router.push("/login");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="flex justify-between items-center w-full px-6 md:px-8 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold aura-gradient-text tracking-tight">
            AuraLearn
          </Link>
          <div className="hidden md:flex gap-6">
            <Link
              href="/courses"
              className={`text-base transition-all duration-200 ${
                isActive("/courses")
                  ? "nav-link-active"
                  : "text-[#3d3d3d] hover:text-[#f59e0b] font-medium"
              }`}
            >
              Browse Courses
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-base text-[#3d3d3d] hover:text-[#f59e0b] transition-colors duration-200 px-4 py-2 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-sm px-6 py-2.5 rounded-xl inline-flex items-center gap-1.5"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #c084fc)', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-3 py-2 rounded-2xl animate-in fade-in slide-in-from-top-2 overflow-hidden"
                  style={{ width: '224px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.60)', boxShadow: '0 16px 48px rgba(0,0,0,0.10), 0 4px 12px rgba(245,158,11,0.08)' }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(245,158,11,0.12)' }}>
                    <p className="text-sm font-bold text-[#1a1a1a]">{user.name}</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3d3d3d] hover:text-[#f59e0b] transition-colors"
                    style={{} as React.CSSProperties}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    Dashboard
                  </Link>
                  <Link
                    href="/generate"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3d3d3d] hover:text-[#f59e0b] transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    Create Course
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3d3d3d] hover:text-[#f59e0b] transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                      Admin Panel
                    </Link>
                  )}
                  <div className="border-t mt-1 pt-1" style={{ borderColor: 'rgba(245,158,11,0.12)' }}>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#dc2626] transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
