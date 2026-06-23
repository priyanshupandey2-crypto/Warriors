"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const allCourses = [
  { id: 1, title: "UI/UX Design Fundamentals for Modern Products", cat: "Design", catColor: "bg-secondary text-on-secondary", level: "Intermediate", hours: "12h 30m", price: "$89.99", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBooGc5QJtuxOHshZMexrY_wyFLz5LL9N39tiT-WVVMw7tRNpDoIX-YPgEY8a4-5CtBAj8qP269EtqjgczzbuGyHyj6_j4hlRQrga8DATDrpH_2k4JKmA52zrXQPVm_j6AQMULxRvDytBsK46ch-osXUYV5WZAOBqy-Y4NyTQPekqTvDD2y9mvCLAfHpTrf4RQxv2raIMSxCucXzgpTj94hYbDUx_nN6rdkx-CJ-DlV6LamPvCwjduk8FguF_uCk4XUsBIJK4A3fWAI" },
  { id: 2, title: "Advanced Python Algorithms & Data Structures", cat: "CS", catColor: "bg-tertiary-container text-on-tertiary-container", level: "Advanced", hours: "24h 15m", price: "$124.99", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyAFTx27UIQBf_RCR806ZHhhswqxc9rOI6DOh8EOJ7cHYCZFy6wiOdsuTcdoIK0mqya4CoLm9SH_og-h1cThwFvFJ13qSYPBTO3-xLs02GPCSvhQ3FUrqrRVzzDmdXCOG_oxLT37mRiwbe6eqPXCUTxwS_QK7H3EbbQ71_0Mzs8LuEQlkfBYD3VG4uurnTE16l-6a2mD310h26NztRriTdaNXqkp-qBn0srJnOXRnO76NtxXZPajBOmdjd0ogI65avPvdtBdIN5VP2" },
  { id: 3, title: "Mastering Digital Marketing & Growth Hacking", cat: "Business", catColor: "bg-primary-container text-on-primary-container", level: "Beginner", hours: "8h 45m", price: "Free", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIrhWYbr5QO_CXNNRaUMqEVlbY6EBtzr7gsC5QGPOHPyFoJZ7T7T8G25Ga_HGlfNjgILFCq7gON9Cv5GU3f0FAw8oXLaqpLjnnF6pgfeI4yzlaOlkxwm4DAgxJUFER7sNM5Ks-QGqSbib5MzNqLt15BXyx7bKB1eg6JmRAJ1PbfCICbAo7OTSC2WKT2mAWYaqG-oILoyLHjuUe8NTOA4Kxh3Zir5Oz7qSNRXDL_4LW9x4n6KaH8ZmFMWS653b3SHCX33baDWnKMPOe" },
  { id: 4, title: "Intro to Artificial Intelligence & Neural Networks", cat: "CS", catColor: "bg-tertiary-container text-on-tertiary-container", level: "Beginner", hours: "15h 00m", price: "$99.99", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKkp4xkRkQ9Kn9mQ6RqsXSpK0niIqTzpE4spE1nVKFsoESnBL_tCqnPNWbezhx9SfiWy5GRBuK0g-lLH3J0mo_Ih9evuiJ4_sq8VwFO-ychH2CTYuu0CNe59ZuD40WVXuhgGu-D39QFk3APggYK1G5Iq0qdamPsKcYzdu8Ga1kKxOpc2ILmc0YfqwNH9yBDbL8k0IyKdoKFbBQiB3JGiOQIv2dBA-hbuvJl_Qb88Dcu8ZMoY1Way2KTh8mSzO1VakP16lQFEEaQtql" },
  { id: 5, title: "Professional Brand Identity Design", cat: "Design", catColor: "bg-secondary text-on-secondary", level: "Intermediate", hours: "18h 20m", price: "$74.99", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVCTfV0hAVREREPUKkUe5O8TBOP-zbWT_htIvnRphm9VgneJpWnLPgskc-zxDjeevBAotRVzYzEdFfnuvm6brwD7K5ZBDA4RhXAk-06rXBkUcSUDyeYC9qkG6VifREUCepyiVPyKsCXStXz_YqDHxJG0SUw-WeKM2j_wSsoIrVSia7RkrT7J_eH_XT4Fg-8oUmcUpJRHogpkQIRRkEFhpj20DnMgrM-OuzZiwV1UQ2z23Cu3dbwHzsd9Ovs12X39yf8Ks9A6Wmy5LW" },
  { id: 6, title: "Strategic Leadership & Management 2024", cat: "Business", catColor: "bg-primary-container text-on-primary-container", level: "Advanced", hours: "10h 45m", price: "$149.99", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWIBBBaUgZf421HNntuZMFNmuvQmYMTSasF_D73n8E3548iLzcGgHyQhHBPgSDZOHagL24uO1biXLt0EIAm_gw5xP4c_0wt0frCFZGWR1jCX4DQlEqfG3NUV6_Qtji1vLNMPUouTWlq5WO2TP6eYy_3k-l88I86YvfGIHb2o5xjc49focncXa-PREBO8I862SuHasH7ZxKTgPuNhxJmJAWZ2-I6kXAYtqQt6KY_ngx2oSnG9gZOrx1Ifggawyta82tze-EThvwyNTb" },
];

const categories = ["All Categories", "Computer Science", "Business & Strategy", "Creative Design", "Marketing"];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All Categories");
  const [selectedDiff, setSelectedDiff] = useState("");

  const filtered = allCourses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = !selectedDiff || c.level === selectedDiff;
    return matchSearch && matchDiff;
  });

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-20">
        {/* Hero Search */}
        <section className="bg-surface-container-low pt-12 pb-8 px-4">
          <div className="max-w-[1280px] mx-auto text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-on-surface">Expand Your Knowledge</h1>
            <p className="text-lg text-on-surface-variant mb-8 max-w-2xl">
              Discover high-quality courses taught by industry experts across Design, Business, and Computer Science.
            </p>
            <div className="relative max-w-2xl group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full pl-12 pr-6 py-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-base shadow-sm"
                placeholder="Search for courses, skills, or authors..."
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Filters & Grid */}
        <section className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
              <div>
                <h3 className="text-sm font-medium text-primary mb-4 uppercase tracking-wider">Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 group cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary accent-primary"
                        checked={selectedCat === cat}
                        onChange={() => setSelectedCat(cat)}
                      />
                      <span className="text-base text-on-surface group-hover:text-primary transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-outline-variant">
                <h3 className="text-sm font-medium text-primary mb-4 uppercase tracking-wider">Difficulty</h3>
                <div className="space-y-2">
                  {["Beginner", "Intermediate", "Advanced"].map((diff) => (
                    <label key={diff} className="flex items-center gap-2 group cursor-pointer">
                      <input
                        type="radio" name="difficulty"
                        className="w-5 h-5 border-outline-variant text-primary focus:ring-primary accent-primary"
                        checked={selectedDiff === diff}
                        onChange={() => setSelectedDiff(selectedDiff === diff ? "" : diff)}
                      />
                      <span className="text-base text-on-surface">{diff}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Course Grid */}
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-8">
                <p className="text-sm font-medium text-on-surface-variant">
                  Showing <span className="font-bold text-on-surface">{filtered.length}</span> courses
                </p>
                <select className="bg-transparent border-none text-sm font-medium text-primary focus:ring-0 cursor-pointer">
                  <option>Newest First</option>
                  <option>Most Popular</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((course) => (
                  <div key={course.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm course-card-hover flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="w-full h-full object-cover" src={course.img} alt={course.title} />
                      <span className={`absolute top-4 left-4 ${course.catColor} px-2 py-1 rounded text-xs font-bold`}>{course.cat}</span>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-lg font-bold text-on-surface line-clamp-2 mb-2">{course.title}</h3>
                      <div className="flex items-center gap-4 mb-6 text-on-surface-variant text-sm">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">bar_chart</span> {course.level}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">schedule</span> {course.hours}</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-2xl font-semibold text-primary">{course.price}</span>
                        <Link href={`/course/${course.id}`} className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                          {course.price === "Free" ? "Enroll Now" : "View Course"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center items-center gap-4">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold">1</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">2</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">3</button>
                <span className="text-outline">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">12</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
