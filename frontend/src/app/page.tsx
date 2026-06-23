import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const courses = [
  {
    title: "Fundamentals of Quantum Computing",
    desc: "Dive deep into qubits, superposition, and entanglement with industry-leading quantum researchers.",
    category: "Science",
    level: "Advanced",
    hours: "24 Hours",
    rating: "4.9",
    catColor: "bg-tertiary-container/90 text-on-tertiary-container",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVIpcZ7P4nEx5jRPrQZ5XCyMKUV_wYAziZrPdU1HetJUI_ySo9SDfy-T7ZWKfottLBdKHGxTKjFm9Qtv5_X4-W-0vwuowBUpdFRaNsX6xpBNSlDmfuJF6y4fppKx5MHHthJVkAOgpYDgmg83lc8PTqNqclb-VkNBig7FGzA7PPUtUhPIUdXsKm2dwImDIFEIQspvqgH-R73j81ouuNcw3yqauzr78bH-BPW0M2hObOnTt8U6brOMJ2-WNAw_dYL52Md-VTNEHuVcrE",
  },
  {
    title: "Mastering UX Psychology",
    desc: "Understand the cognitive patterns that drive user behavior and build more intuitive digital products.",
    category: "Design",
    level: "Beginner",
    hours: "18 Hours",
    rating: "5.0",
    catColor: "bg-secondary-container/90 text-on-secondary-container",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBom5oENSak0ClDXERNQ1jPy8yOCcJQdfhyOVm_Ld8Zwu6HWQp5bPfMx2YfEF213SSZCA57GrjgoDeZsBOuZlx-gKeildd8UtpVViUBIJfRucF6Ol22nqMhm2B9-QbeqrcrG-YsRd5pBlU14rFV-7zN9oTYttlvLa1D5ogTTDSynwq3lp5nCQcvE037WY7yowRBa1U3miVLpb547Sl3O8EzH2FjKsqCZISar03LtM-H-PDbJrj0gfNLWyHzt2iv6rlcBB4JZlo9xZz2",
  },
  {
    title: "Modern Architecture Principles",
    desc: "Analyze sustainable design, material innovation, and the future of urban environments in the 21st century.",
    category: "Architecture",
    level: "Intermediate",
    hours: "32 Hours",
    rating: "4.8",
    catColor: "bg-primary-container/90 text-on-primary-container",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPmQ71wm-AbcrMhCzxpntwD4cdM3QU4Ga5fmgFiPTmQe8FnhKswnXeEEQPZ3b8OQwb9pUbQYqDy-bUf3iaUH5L1gmUqKJUUP_tH8YJOqd0BPVaIx-jI09JTNLuQBj5Prosr_19oiAQYIqabto-6YAcwoAV5ctjHmdgwc4O_I-1-B3BKALBi96M9lAiXB08UpLkwIiDs48QblDlwU5fx1IAz75dc_AljuhV_7ntbh-Der3oxqLT2ohWOENkK_QzJ6sxntDv5fs9ElMV",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 md:px-8 py-12 md:py-[120px] max-w-[1280px] mx-auto">
          <div className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-primary-container/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[100px]" />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 bg-surface-container text-primary px-4 py-1 rounded-full border border-primary-container/30">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span className="text-sm font-medium">Personalized AI-Driven Education</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-on-surface leading-tight tracking-tight">
                The Future of Learning, <br className="hidden md:block" />
                <span className="text-primary italic">Tailored for You</span>
              </h1>
              <p className="text-lg text-on-surface-variant max-w-[600px]">
                Harness the power of adaptive curriculum and world-class expertise. AuraLearn transforms
                high-impact education into an accessible, energetic experience designed to help you thrive in
                the modern economy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/generate"
                  className="bg-primary text-on-primary text-sm font-medium px-8 py-4 rounded-lg shadow-md hover:shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  Start Learning Now
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href="/courses"
                  className="border-2 border-outline-variant text-on-surface text-sm font-medium px-8 py-4 rounded-lg hover:bg-surface-container transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                  Browse Courses
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-6 border-t border-outline-variant/20">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">
                    50k+
                  </div>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant">
                  Joined by <span className="font-bold text-on-surface underline decoration-primary/30">50,000+ students</span> worldwide
                </p>
              </div>
            </div>
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative z-10 w-full aspect-square rounded-xl overflow-hidden shadow-2xl hover-lift">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtQdEAMUG-pLpGSwqQwiKz9Nj8jfvA3Lfp0AdRUqfgA0cM9eDPHOO0nuK4QGPl6mRbtERfbovzx9cXL5Ukil0UzywyTaoZmDGPydURMJipBfpU2kQBYyR4hARWydMHz172rbstw_BZG7yGjSK_n0L41qPW2LcfKo1XjUphuNCV5b5N2f6eqL2e2-qQvhmG6KaVEY-DOiZ94-CKonMpKcP3CzWiBd54mF5SHtNk4l5sorROB6UuLVFez192O-OPZ6bKJev8qs67ni5m"
                  alt="Learning workspace"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 p-4 glass-card rounded-lg border border-white/20 shadow-lg max-w-[280px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-tertiary rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-on-surface">Live Now</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface">Modern Architecture Principles</p>
                  <p className="text-xs text-on-surface-variant">2.4k viewers participating</p>
                </div>
              </div>
              <div className="absolute -z-10 -bottom-8 -right-8 w-64 h-64 border-4 border-primary-container/20 rounded-xl" />
            </div>
          </div>
        </section>

        {/* Browse Courses */}
        <section className="py-12 px-4 md:px-8 max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-on-surface">Browse Courses</h2>
              <p className="text-base text-on-surface-variant">
                Explore our curated selection of high-momentum learning paths.
              </p>
            </div>
            <Link
              href="/courses"
              className="group flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all"
            >
              View All Courses
              <span className="material-symbols-outlined">trending_flat</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <Link
                href={`/course/${i + 1}`}
                key={i}
                className="group bg-surface shadow-sm hover:shadow-xl rounded-xl overflow-hidden border border-surface-container-high transition-all duration-300 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={course.img}
                    alt={course.title}
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`${course.catColor} backdrop-blur-sm text-xs font-semibold px-4 py-1 rounded-full`}>
                      {course.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 text-primary mb-2">
                    <span className="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
                    <span className="text-xs uppercase tracking-wider font-bold">{course.level}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-on-surface mb-2 leading-tight">{course.title}</h3>
                  <p className="text-base text-on-surface-variant line-clamp-2 mb-6">{course.desc}</p>
                  <div className="mt-auto pt-6 border-t border-surface-variant flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-outline text-[20px]">schedule</span>
                      <span className="text-sm text-on-surface-variant">{course.hours}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-[#FFC107] text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-sm font-bold text-on-surface">{course.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
