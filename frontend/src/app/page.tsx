'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-background text-on-background">
      {/* Top Navigation Bar */}
      <nav className="w-full sticky top-0 z-50 bg-surface shadow-sm">
        <div className="flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>
              auto_awesome
            </span>
            <span className="text-headline-md font-bold text-primary">AuraLearn</span>
          </div>
          <div className="hidden md:flex items-center gap-xl">
            <Link href="/published-courses" className="text-body-md text-primary font-bold border-b-2 border-primary pb-1">
              Browse Courses
            </Link>
            <div className="flex items-center gap-md">
              <button
                onClick={() => router.push('/auth/login')}
                className="text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/auth/signup')}
                className="bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
          <button className="md:hidden p-sm rounded-full hover:bg-surface-container-lowest">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-xxl px-gutter max-w-container-max mx-auto">
          <div className="grid lg:grid-cols-2 gap-xxl items-center">
            {/* Left Content */}
            <div className="z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-xs px-md py-xs bg-primary-fixed text-on-primary-fixed rounded-full mb-lg">
                <span className="material-symbols-outlined text-base" style={{fontVariationSettings: "'FILL' 1"}}>
                  bolt
                </span>
                <span className="text-label-md">Powered by Advanced AI</span>
              </div>

              <h1 className="text-display-lg-mobile md:text-display-lg text-on-background mb-md leading-tight">
                The Future of Learning, <br/>
                <span className="text-primary">Tailored for You</span>
              </h1>

              <p className="text-body-lg text-on-surface-variant mb-xl max-w-xl mx-auto lg:mx-0">
                Stop following rigid curriculums. Use AI to generate personalized, deep-dive courses on any topic in seconds, optimized for your schedule and expertise level.
              </p>

              <div className="flex flex-col sm:flex-row gap-md justify-center lg:justify-start">
                <button
                  onClick={() => router.push('/create-course')}
                  className="bg-primary text-on-primary px-xl py-md rounded-xl text-headline-md hover:bg-primary-container hover:text-on-primary-container shadow-lg active:scale-95 transition-all"
                >
                  Start Learning Now
                </button>
                <button className="bg-surface-container text-primary px-xl py-md rounded-xl text-headline-md hover:bg-surface-container-high active:scale-95 transition-all border border-primary-fixed">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Side - Decorative Image */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-container opacity-20 blur-3xl rounded-full"></div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary-container opacity-20 blur-3xl rounded-full"></div>
              <div className="relative glass border border-white p-lg rounded-2xl custom-shadow">
                <img
                  className="w-full h-auto rounded-xl"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUlnYuqAsHd6li0kSpURxB2PdY9YYjfQl_dsOOl4Lo7ZnWfPYib4EunwKOXn9ioV1XbhWz7BOKqe6R0EcqhKBGOr6-IWskZunb3XRX2gxzWRWM0u6ijhtLG8lETyIj7LTO2GiDe8bDrl_m4yNOUjsWGM2QLNi0vi7nd-hKuLxWcXne11AIdplCqvKeFAlsiZ6yy6F7w8SezJBxq0kvO5sImNohCwu4oH7K_mhtdDFo3G0nR543OWxEtnl9hAyCaFSFkC9zobLHDyh9"
                  alt="Educational illustration"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Chat Section */}
        <section className="bg-surface-container-low py-xxl">
          <div className="px-gutter max-w-container-max mx-auto">
            <div className="text-center mb-xl">
              <h2 className="text-headline-lg text-on-background mb-sm">What would you like to master today?</h2>
              <p className="text-body-md text-on-surface-variant">Your AI tutor is ready to build your custom syllabus.</p>
            </div>

            <div className="max-w-3xl mx-auto glass border border-white rounded-2xl custom-shadow overflow-hidden">
              {/* Chat Header */}
              <div className="bg-primary p-md flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>
                      smart_toy
                    </span>
                  </div>
                  <div className="text-white">
                    <p className="text-label-md font-bold">Aura AI Tutor</p>
                    <p className="text-xs opacity-80">Online & Ready</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-white">more_vert</span>
              </div>

              {/* Chat Body */}
              <div className="p-lg space-y-lg h-96 overflow-y-auto bg-white/40">
                <div className="flex items-start gap-md">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-sm" style={{fontVariationSettings: "'FILL' 1"}}>
                      smart_toy
                    </span>
                  </div>
                  <div className="bg-surface-container-high p-md rounded-xl rounded-tl-none max-w-xs text-on-surface">
                    <p className="text-body-md">Tell me what you want to learn! To get the best results, include the topic, difficulty, target audience, and duration.</p>
                  </div>
                </div>

                {/* Prompt Suggestions */}
                <div className="space-y-sm">
                  <p className="text-label-sm text-on-surface-variant ml-10">Try these prompts:</p>
                  <div className="flex flex-wrap gap-sm ml-10">
                    <button className="bg-white border border-outline-variant px-md py-sm rounded-full text-label-md text-on-surface hover:border-primary hover:text-primary transition-all text-left max-w-xs">
                      "Create a 4-week advanced course on Sustainable Investing for Finance Professionals."
                    </button>
                    <button className="bg-white border border-outline-variant px-md py-sm rounded-full text-label-md text-on-surface hover:border-primary hover:text-primary transition-all text-left max-w-xs">
                      "Build a beginner's guide to Greek Mythology for middle school students."
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-lg border-t border-surface-container bg-white">
                <div className="relative flex items-center gap-md">
                  <input
                    className="w-full pl-md pr-32 py-md rounded-xl border border-surface-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-low transition-all outline-none"
                    placeholder="Explain the concept of..."
                    type="text"
                  />
                  <button
                    onClick={() => router.push('/create-course')}
                    className="absolute right-2 top-2 bottom-2 bg-primary text-on-primary px-lg rounded-lg text-label-md flex items-center gap-sm hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95"
                  >
                    <span>Tailor My Course</span>
                    <span className="material-symbols-outlined text-base">auto_fix</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Courses Section */}
        <section className="py-xxl px-gutter max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-xl gap-md">
            <div>
              <h2 className="text-headline-lg text-on-background mb-sm">Sample Courses</h2>
              <p className="text-body-md text-on-surface-variant max-w-lg">Explore high-quality courses generated by our community using Aura AI.</p>
            </div>
            <Link href="/published-courses" className="text-primary font-bold text-body-md flex items-center gap-sm group">
              View all courses
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {/* Course Card 1 */}
            <div className="bg-surface rounded-2xl overflow-hidden custom-shadow hover-lift border border-surface-container">
              <div className="relative h-48">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuASVem1NvD130fYZRvTo2uvteNmHKKvtkRoJofGTt_asSa8NjpUK6ZxS_9OlGlh_vvp5l3bs_njftaH5jzwvQ_iRmdn779WHqSCrir9sKf90Xu_5tvuZKcwbGUVQrQWQoPYW2Zr9f6nO-KL5Kht4lhazvO2zKJUTXTb6zrFixnK3Ve2ALjb9pXCr9D-4JHwTpmVfDDTFvuQCkN0ml-67qlWl1VEt6cqrH6ah_xfUcjArWELFXw8JZez53tUUZcW_XGvZ56Q327XziG2"
                  alt="Quantum Computing"
                />
                <div className="absolute top-md right-md bg-tertiary-container text-on-tertiary-container px-md py-xs rounded-full text-label-sm">
                  Advanced
                </div>
              </div>
              <div className="p-lg">
                <h3 className="text-headline-md text-on-background mb-sm leading-tight">Fundamentals of Quantum Computing</h3>
                <p className="text-body-md text-on-surface-variant mb-lg line-clamp-2">Master qubits, superposition, and entanglement through our AI-curated interactive path.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm text-on-surface-variant">
                    <span className="material-symbols-outlined">schedule</span>
                    <span className="text-label-md">8 Weeks</span>
                  </div>
                  <button className="text-primary font-bold hover:underline text-label-md">Preview Course</button>
                </div>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="bg-surface rounded-2xl overflow-hidden custom-shadow hover-lift border border-surface-container">
              <div className="relative h-48">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTlfxhGTKL2LCWDaIsKiB7TllGBe-M1cGLCPaLJarX32Dp6Vxd_52c04iyOEWMQQWt8_BTfrkPAaecQ7N4z3mlpImy4M7W3amG8iko_ZgagiQncQDql3LkJGW3VjQW9U55WE5-lyPNdE01SOQbJn7CXOkduB1ZBv4x5OUmXip3ZJH9KrpHP9cRjVME_lyGS6cOQZEWuJ5CPZaLdTTyAGVQzSSsfBeSCTNi0bB6rpTqW1YIw_-u-DbFNJYmQCskIHsy95Wz7P_1H06G"
                  alt="UX Psychology"
                />
                <div className="absolute top-md right-md bg-secondary-container text-on-secondary-container px-md py-xs rounded-full text-label-sm">
                  Intermediate
                </div>
              </div>
              <div className="p-lg">
                <h3 className="text-headline-md text-on-background mb-sm leading-tight">Mastering UX Psychology</h3>
                <p className="text-body-md text-on-surface-variant mb-lg line-clamp-2">Understand the cognitive principles behind high-conversion designs and user satisfaction.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm text-on-surface-variant">
                    <span className="material-symbols-outlined">schedule</span>
                    <span className="text-label-md">4 Weeks</span>
                  </div>
                  <button className="text-primary font-bold hover:underline text-label-md">Preview Course</button>
                </div>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="bg-surface rounded-2xl overflow-hidden custom-shadow hover-lift border border-surface-container">
              <div className="relative h-48">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX1TILlW1gzXxqjGhvg4FvX-6MG6s15OHVOkJwrP_Dy_2bTF3Yyb7bVXVMdM5yQPLJG7S8ryArDwHYKm6jKy-5GKEf_yxJwWBfDdHWV0tJwvT-z8Hd-3LZv91h0cGY1z6UKzMMPSKW0F9XrDt7LVxGTOXQFCKJpGCvWQlQFwWJz8PAvKfCLkKJjpzBVrqBdnI6gYtWUq6UOQY8hWv8j0KcnPUOcHqMDvOKADR3qTlzMD5b7A9J72tN0CsYgz3JFyZL1yT5Yg0g"
                  alt="AI Ethics"
                />
                <div className="absolute top-md right-md bg-primary-container text-on-primary-container px-md py-xs rounded-full text-label-sm">
                  Beginner
                </div>
              </div>
              <div className="p-lg">
                <h3 className="text-headline-md text-on-background mb-sm leading-tight">AI Ethics & Responsible AI</h3>
                <p className="text-body-md text-on-surface-variant mb-lg line-clamp-2">Learn how to build and deploy AI systems that are fair, transparent, and accountable.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm text-on-surface-variant">
                    <span className="material-symbols-outlined">schedule</span>
                    <span className="text-label-md">6 Weeks</span>
                  </div>
                  <button className="text-primary font-bold hover:underline text-label-md">Preview Course</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-surface-container-low py-xxl px-gutter">
          <div className="max-w-container-max mx-auto text-center space-y-lg">
            <h2 className="text-headline-lg text-on-background">Ready to transform your learning?</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">Join thousands of learners who are mastering new skills with AI-powered personalized courses.</p>
            <button
              onClick={() => router.push('/auth/signup')}
              className="bg-primary text-on-primary px-xl py-md rounded-xl text-headline-md hover:bg-primary-container hover:text-on-primary-container shadow-lg active:scale-95 transition-all"
            >
              Get Started Today
            </button>
          </div>
        </section>
      </main>

      {/* Add Stitch styles */}
      <style>{`
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .custom-shadow {
          box-shadow: 0 12px 16px -4px rgba(0, 97, 167, 0.06);
        }
        .hover-lift {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 97, 167, 0.1);
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          display: inline-block;
          line-height: 1;
          text-transform: none;
          letter-spacing: normal;
          word-wrap: normal;
          white-space: nowrap;
          direction: ltr;
        }
      `}</style>
    </div>
  );
}
