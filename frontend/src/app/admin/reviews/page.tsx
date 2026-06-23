"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const reviewStats = [
  { label: "Pending Reviews", value: "128", trend: "+12 today" }
];

const reviews = [
  {
    id: 1,
    name: "Dr. Elena Vance",
    role: "Senior Researcher",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvT4rVfh-Ox2NlyZ4WDNzoVoS8E_bg_PioHypvfGU89fmxvdfDn5uOsbaK1K-O0D1EoZ5hlgYqs2Jcl1tc1p04OKBWpoWa2Fy9X3rNYY1sjQrDOJ9Nq-oW8GEPAeWhMG6PukfWbCR0Zd6zL-xi0oZBFe20vvX6unX2nFUOzBndzAxpXb49v76FA4UPUjDNUAn1A2trIMuKodCtZhCiP9NOLky2YFH9UhelxVkn8XV49kpOxdKJIWsJNge6uPstd4Z7OpGDoxA-cg0H",
    topic: "Quantum Cryptography Fundamentals",
    date: "Oct 24, 2024, 14:20",
    type: "AI-Generated",
    typeColor: "bg-primary-container/10 text-primary border-primary/20",
    rating: "4.8/5",
    comment: "Excellent depth on RSA. The AI explained quantum concepts surprisingly well, though Module 3 was a bit dense.",
    details: "A high-level overview of quantum entanglement and its applications in modern cybersecurity architectures. Focuses on RSA vulnerabilities and post-quantum algorithms.",
    reason: "User requested this because current enterprise security modules are outdated for the 2025 landscape."
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Product Lead",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6bEL8_j-7PwQhKIkyAVGqr2cqac2H9CZ_VpLtr8jFAFz7kYKRM1-BKNpIQvlHl1xJQ2194qBVDMBGEWwehPuJYZTiXVzBfwgP8FIMDsnQGneOfRGA0ZBT4CAhK8aGZM6UZh3zej0F2Tv6RYAxpVlt88w9-RRrtD4hAcN27pVLrwnCDFJKsrSxGe6aC_xMN0BRrpK_sbULqvqfVkNaNRpNtXBZOs7--uI94zdfsZ0u8uNW8ep0AA5YaoTIeM_parTJduACcKDhrNbu",
    topic: "Ethical AI Frameworks for UI/UX",
    date: "Oct 24, 2024, 11:45",
    type: "User-Tailored",
    typeColor: "bg-secondary-container/10 text-secondary border-secondary/20",
    rating: "4.2/5",
    comment: "Very practical framework. The user is a lead designer seeking to standardize ethical frameworks across their 200-person team.",
    details: "Collaborative course on UI/UX principles regarding dark patterns and user autonomy. Includes case studies from social media giants.",
    reason: "The user is a lead designer seeking to standardize ethical frameworks across their 200-person team."
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    role: "Sustainability Officer",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfAXNmztY1AB-KDIN4hyycG2zdFQlbsa163IoABfL-jwgO576YEr5X8QQss7HKID2UGJyv359GEfo0ndnMI4iiXwv3N3I91QY0joXPAtobZZuPc0oXL0iCDs_PHxe6D1LwstmBup1Rjy4bMPE9VuQ5APsqKEOo2ORhd6mNwqXOYmY6GNupPdgiFpWL_Fn89T6NoFYnOEQ88wmOmln1AOfUMjbFEEvzEkWug-HJKA_6AEsFcNAca6GlD6FtkXbjbCOPzVWmEvpUf0ra",
    topic: "Biomimetic Architecture & Net Zero",
    date: "Oct 23, 2024, 16:10",
    type: "AI-Generated",
    typeColor: "bg-primary-container/10 text-primary border-primary/20",
    rating: "4.5/5",
    comment: "Great visuals on net zero. Department-wide request for the Green Initiative 2025 program.",
    details: "Sustainable building materials and biomimetic structures. Integrating renewable energy directly into skyscraper envelopes.",
    reason: "Department-wide request for the Green Initiative 2025 program."
  }
];

const sidebarLinks = [
  { label: "Course Manager", icon: "dashboard", href: "/admin", active: false },
  { label: "Review Queue", icon: "fact_check", href: "/admin/reviews", active: true },
  { label: "Audit Logs", icon: "history", href: "#", active: false },
];

export default function ReviewQueuePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<typeof reviews[0] | null>(null);

  const filteredReviews = reviews.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant/20 py-6 px-4 flex flex-col z-50">
        <div className="flex items-center gap-4 mb-8 px-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>school</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-primary">AuraLearn</h1>
            <p className="text-sm font-medium text-on-surface-variant">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-4 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                link.active
                  ? "text-primary font-bold bg-primary-container/10 translate-x-1"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={link.active ? { fontVariationSettings: '"FILL" 1' } : {}}
              >
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-4 w-full px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-all rounded-lg"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="ml-64 min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="flex justify-between items-center px-6 w-full h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-sm">
          <div className="flex items-center gap-8 flex-1">
            <div className="relative w-full max-w-md group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full bg-surface-container-low border-none rounded-full pl-12 pr-4 py-2 text-base focus:ring-2 focus:ring-primary transition-all outline-none"
                placeholder="Search by user or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
            <div className="h-8 w-[1px] bg-outline-variant mx-2" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-bold text-on-surface">{user?.name || "Admin_Aura"}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex gap-6 flex-1 overflow-hidden">
          {/* Left Content */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <section>
              <h2 className="text-3xl font-semibold text-on-surface">Review Queue</h2>
              <p className="text-base text-on-surface-variant">Moderate and approve course submissions from AI generation and user requests.</p>
            </section>

            {/* Summary Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviewStats.map(stat => (
                <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col gap-1">
                  <span className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">{stat.label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl text-primary font-bold">{stat.value}</span>
                    <span className="text-tertiary font-bold text-xs">{stat.trend}</span>
                  </div>
                </div>
              ))}
            </section>

            {/* Filters */}
            <section className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex bg-surface-container-low p-1 rounded-lg">
                  <button className="px-4 py-2 bg-surface-container-lowest rounded-md shadow-sm text-sm font-bold text-primary">All Submissions</button>
                </div>
              </div>
              <div className="text-xs font-semibold text-on-surface-variant">
                Showing 1-{filteredReviews.length} of {reviews.length} results
              </div>
            </section>

            {/* Review Table */}
            <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 flex-1 flex flex-col overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Topic / Title</th>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Submission Date</th>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider">Feedback</th>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 overflow-y-auto custom-scrollbar">
                  {filteredReviews.map((review) => (
                    <tr
                      key={review.id}
                      className={`hover:bg-surface-container-low transition-colors cursor-pointer group ${
                        selectedReview?.id === review.id ? "bg-primary/5 border-l-4 border-primary" : "border-l-4 border-transparent"
                      }`}
                      onClick={() => setSelectedReview(review)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className="w-8 h-8 rounded-full object-cover" src={review.avatar} alt={review.name} />
                          <div>
                            <div className="text-sm font-bold text-on-surface">{review.name}</div>
                            <div className="text-xs font-semibold text-on-surface-variant">{review.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-base font-medium text-on-surface">{review.topic}</td>
                      <td className="px-6 py-4 text-base text-on-surface-variant">{review.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${review.typeColor}`}>
                          {review.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="flex items-center gap-1 px-4 py-2 text-primary hover:bg-primary-container/10 font-bold text-xs rounded-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReview(review);
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                          View Feedback
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-primary hover:bg-primary-container/10 transition-colors" title="Preview">
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button className="flex items-center gap-1 px-4 py-2 bg-tertiary-container text-on-tertiary font-bold text-xs rounded-lg hover:shadow-md transition-all active:scale-95">
                            <span className="material-symbols-outlined text-[18px]">add_task</span>
                            Add to Catalogue
                          </button>
                          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-error hover:bg-error-container/20 transition-colors" title="Delete">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          {/* Right Sidebar: Quick Preview / Feedback Panel */}
          {selectedReview && (
            <aside className="w-80 bg-surface-container-lowest border-l border-outline-variant/20 shadow-xl flex flex-col z-50 animate-in slide-in-from-right rounded-xl">
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="text-2xl font-semibold text-on-surface">User Feedback</h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">User</span>
                  <p className="font-bold text-on-surface">{selectedReview.name}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Rating</span>
                  <div className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                    <span className="font-bold text-base">{selectedReview.rating}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Comment</span>
                  <p className="text-base text-on-surface-variant italic">&quot;{selectedReview.comment}&quot;</p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
