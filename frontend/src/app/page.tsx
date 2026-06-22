'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Sparkles, Play } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import CourseCard from '@/components/shared/CourseCard';
import { DEMO_COURSES, HOME_PAGE_STATS } from '@/lib/demo-data';

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-md md:px-lg py-xl md:py-xxl max-w-container-max mx-auto w-full">
          {/* Background decorative elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-xl items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-sm bg-surface-container text-primary px-md py-xs rounded-full border border-primary-container/30 w-fit">
                <Sparkles className="w-[18px] h-[18px]" />
                <span className="font-label-md text-label-md">Personalized AI-Driven Education</span>
              </div>

              {/* Heading */}
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-tight tracking-tight">
                The Future of Learning, <br className="hidden md:block" />
                <span className="text-primary italic">Tailored for You</span>
              </h1>

              {/* Description */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[600px]">
                Harness the power of adaptive curriculum and world-class expertise. AuraLearn transforms high-impact education into an accessible, energetic experience designed to help you thrive in the modern economy.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-md pt-md">
                <Link
                  href="/create"
                  className="bg-primary text-on-primary font-label-md text-label-md px-[32px] py-[16px] rounded-lg shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-sm group"
                >
                  Start Learning Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/courses" className="border-2 border-outline-variant text-on-surface font-label-md text-label-md px-[32px] py-[16px] rounded-lg hover:bg-surface-container transition-all flex items-center justify-center gap-sm active:scale-95">
                  <Play className="w-4 h-4 fill-current" />
                  Browse Courses
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-xl pt-lg border-t border-outline-variant/20">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden bg-primary-container">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7JFbodFx8HZ-Oi3VkPNdAf4alTpiPl7uu3A0aPgt6oYTczIrxXeI8m-Wt3skogF-M2VnGvl8SzCxjl3Z9VPpW07R7M7lQHE-new8KIb-Eku6dbWKDmtUA-FaJy0B7g-653baw9r_jxOH8j6X15i0ypHwajAvos-touamcAFnGMfYojoK3OrZjbXEzRhTEjRpmV0OlPEUJukze8galmBVhbKdhglE5FPSuil5Ih7ROCsET8EYSwXxSNjPTUC1I1XHNLIZjTAG7tDpW"
                      alt="Student"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden bg-secondary-container">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLnQwUG8EYxUxHRmePpmm0OP5IHL2RjNhhs0iohvirmQF2wYd14jWPrKDQyz1mWQzGi9EFMYzSVTBAMr5bSC8lt3U0buboFmDZWTWDPD1cX_AIJKcDIgS1ksRYJxcUOmQyCiWVZbJm5-w3tfzQoFgzQJfIzKCRuDyEkrrcZYi6-2TnjN4pdoR2pklcJSk3wH36kuMT5PuYgZHSPcigCTEv0j7z0pDOXUBjnUv8EJm6wgykBF_I8gHkxia0K7i1UH3K8hhbHz8DyNOI"
                      alt="Student"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">
                    50k+
                  </div>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Joined by <span className="font-bold text-on-surface underline decoration-primary/30">50,000+ students</span> worldwide
                </p>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative z-10 w-full aspect-square rounded-xl overflow-hidden shadow-2xl">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtQdEAMUG-pLpGSwqQwiKz9Nj8jfvA3Lfp0AdRUqfgA0cM9eDPHOO0nuK4QGPl6mRbtERfbovzx9cXL5Ukil0UzywyTaoZmDGPydURMJipBfpU2kQBYyR4hARWydMHz172rbstw_BZG7yGjSK_n0L41qPW2LcfKo1XjUphuNCV5b5N2f6eqL2e2-qQvhmG6KaVEY-DOiZ94-CKonMpKcP3CzWiBd54mF5SHtNk4l5sorROB6UuLVFez192O-OPZ6bKJev8qs67ni5m"
                  alt="Learning dashboard"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-lg left-lg p-lg glass-card rounded-lg border border-white/20 shadow-lg max-w-[280px]">
                  <div className="flex items-center gap-sm mb-xs">
                    <div className="w-2 h-2 bg-tertiary rounded-full animate-pulse"></div>
                    <span className="font-label-sm text-label-sm text-on-surface">Live Now</span>
                  </div>
                  <p className="font-label-md text-label-md font-bold text-on-surface">Modern Architecture Principles</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">2.4k viewers participating</p>
                </div>
              </div>
              <div className="absolute -z-10 -bottom-8 -right-8 w-64 h-64 border-4 border-primary-container/20 rounded-xl"></div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-surface-container-low py-xl">
          <div className="max-w-container-max mx-auto px-md md:px-lg grid grid-cols-2 md:grid-cols-4 gap-lg text-center">
            {HOME_PAGE_STATS.map((stat, i) => (
              <div key={i}>
                <p className="font-headline-lg text-headline-lg text-primary">{stat.value}</p>
                <p className="font-label-md text-label-md text-on-surface-variant">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Browse Courses Section */}
        <section className="py-xxl px-md md:px-lg max-w-container-max mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
            <div className="space-y-sm">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Browse Courses</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Explore our curated selection of high-momentum learning paths.</p>
            </div>
            <Link href="/courses" className="group flex items-center gap-xs font-label-md text-label-md text-primary font-bold hover:gap-sm transition-all w-fit">
              View All Courses
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {DEMO_COURSES.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-xxl px-md md:px-lg max-w-container-max mx-auto w-full">
          <div className="bg-inverse-surface text-inverse-on-surface rounded-2xl p-lg md:p-xxl flex flex-col lg:flex-row items-center gap-xxl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              ></div>
            </div>

            <div className="flex-1 space-y-lg relative z-10 text-center lg:text-left">
              <h2 className="font-display-lg-mobile md:font-headline-lg text-display-lg-mobile md:text-headline-lg">
                Ready to transform your trajectory?
              </h2>
              <p className="font-body-lg text-body-lg opacity-80 max-w-[600px]">
                Our learning platform adapts to your pace, identifying your strengths and reinforcing your growth areas in real-time. Join AuraLearn and start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center lg:justify-start pt-md">
                <Link
                  href="/auth/signup"
                  className="bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  Get Started for Free
                </Link>
                <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-label-md text-label-md px-xl py-md rounded-lg hover:bg-white/20 active:scale-95 transition-all">
                  Explore Pricing
                </button>
              </div>
            </div>

            <div className="flex-1 w-full lg:w-auto relative z-10">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-lg space-y-md shadow-2xl">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">verified</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-bold">Certificate Included</p>
                    <p className="font-label-sm text-label-sm opacity-60">Verified by industry giants</p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary">group</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-bold">1-on-1 Mentorship</p>
                    <p className="font-label-sm text-label-sm opacity-60">From top-tier professionals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant mt-auto">
        <div className="w-full px-md md:px-lg py-xxl flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto gap-xl">
          <div className="flex flex-col items-center md:items-start gap-md">
            <span className="font-headline-md text-headline-md font-bold text-primary">AuraLearn</span>
            <p className="font-label-md text-label-md text-on-surface-variant max-w-[300px] text-center md:text-left opacity-80">
              Empowering the next generation of thinkers, designers, and engineers through energetic, human-centric education.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-lg md:gap-xl">
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200" href="#">
              Privacy Policy
            </a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200" href="#">
              Terms of Service
            </a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200" href="#">
              Cookie Policy
            </a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200" href="#">
              Contact Us
            </a>
          </div>
        </div>
        <div className="w-full max-w-container-max mx-auto px-md md:px-lg pb-lg">
          <div className="border-t border-surface-variant pt-lg text-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 AuraLearn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
