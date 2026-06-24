"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useApiCall } from "@/hooks/useApiCall";

interface AuditLog {
  id: number;
  admin_id: number;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id: number;
  resource_name: string;
  timestamp: string;
  status: string;
  details: string;
  ip_address: string | null;
}

const sidebarLinks = [
  { label: "Course Manager", icon: "auto_stories", href: "/admin", active: false },
  { label: "Review Queue", icon: "rate_review", href: "/admin/reviews", active: false },
  { label: "Audit Logs", icon: "history", href: "/admin/audit-logs", active: true },
];

const getActionColor = (action: string) => {
  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    CREATE: { bg: "bg-tertiary-container/20", text: "text-tertiary", icon: "add_circle" },
    UPDATE: { bg: "bg-primary-container/20", text: "text-primary", icon: "edit" },
    DELETE: { bg: "bg-error-container/20", text: "text-error", icon: "delete" },
    APPROVE: { bg: "bg-tertiary-container/20", text: "text-tertiary", icon: "add_task" },
    REJECT: { bg: "bg-error-container/20", text: "text-error", icon: "block" },
  };
  return colorMap[action] || { bg: "bg-surface-container", text: "text-on-surface-variant", icon: "info" };
};

const getResourceIcon = (resourceType: string) => {
  const iconMap: Record<string, string> = {
    Course: "auto_stories",
    Lesson: "subject",
    Quiz: "quiz",
    Submission: "inbox",
    Module: "folder",
    User: "person",
  };
  return iconMap[resourceType] || "folder";
};

export default function AuditLogsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const apiCall = useApiCall();
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filterAction, setFilterAction] = useState<string>("");
  const itemsPerPage = 10;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Redirect non-admin users to home with toast
    if (user && user.role !== "admin") {
      showToast("Not allowed", "error");
      router.push("/");
    }
  }, [user, router, showToast]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const skip = (currentPage - 1) * itemsPerPage;
        let url = `/api/admin/audit-logs?skip=${skip}&limit=${itemsPerPage}`;

        if (filterAction) {
          url += `&action=${encodeURIComponent(filterAction)}`;
        }

        const response = await apiCall<any>(url);

        if (response && response.logs) {
          setAuditLogs(response.logs);
          setTotalLogs(response.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        showToast("Failed to load audit logs", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [filterAction, currentPage, apiCall, showToast]);

  const totalPages = Math.ceil(totalLogs / itemsPerPage);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Side Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest shadow-sm flex flex-col py-6 px-4 z-50">
        <div className="mb-8 px-2">
          <Link href="/" className="text-2xl font-semibold font-bold text-primary">
            AuraLearn
          </Link>
          <p className="text-xs font-semibold text-outline uppercase tracking-wider">Admin Console</p>
        </div>
        <nav className="flex-1 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all text-sm font-medium ${
                link.active
                  ? "text-primary font-bold border-r-4 border-primary bg-primary-fixed/10"
                  : "text-on-surface-variant hover:bg-surface-container group"
              }`}
            >
              <span
                className={`material-symbols-outlined ${link.active ? "" : "text-outline group-hover:text-primary"}`}
                style={link.active ? { fontVariationSettings: '"FILL" 1' } : {}}
              >
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Canvas */}
      <main className="ml-64 min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="flex justify-between items-center px-6 w-full sticky top-0 z-40 bg-surface-container-lowest py-4 border-b border-outline-variant/30">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="w-full bg-surface-container-low border-none rounded-full pl-12 pr-4 py-2 text-base focus:ring-2 focus:ring-primary transition-all outline-none"
              placeholder="Search by admin, resource, or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-outline-variant/20">
                    <p className="text-sm font-bold text-on-surface">{user?.name}</p>
                    <p className="text-xs text-on-surface-variant">{user?.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    Dashboard
                  </Link>
                  <Link
                    href="/generate"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    Create Course
                  </Link>
                  <div className="border-t border-outline-variant/20 mt-1 pt-1">
                    <button
                      onClick={() => { logout(); router.push("/"); setMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error hover:bg-error-container/20 transition-colors rounded-lg"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex flex-col gap-6 flex-1">
          {/* Header */}
          <section>
            <h2 className="text-3xl font-semibold text-on-surface">Audit Logs</h2>
            <p className="text-base text-on-surface-variant">View and monitor all admin activities and changes in the system.</p>
          </section>

          {/* Filters */}
          <section className="flex items-center gap-4">
            <div className="flex bg-surface-container-low p-1 rounded-lg">
              <button
                onClick={() => setFilterAction("")}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  filterAction === ""
                    ? "bg-surface-container-lowest shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                All Actions
              </button>
              <button
                onClick={() => setFilterAction("CREATE")}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  filterAction === "CREATE"
                    ? "bg-surface-container-lowest shadow-sm text-tertiary"
                    : "text-on-surface-variant hover:text-tertiary"
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setFilterAction("UPDATE")}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  filterAction === "UPDATE"
                    ? "bg-surface-container-lowest shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Update
              </button>
              <button
                onClick={() => setFilterAction("DELETE")}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  filterAction === "DELETE"
                    ? "bg-surface-container-lowest shadow-sm text-error"
                    : "text-on-surface-variant hover:text-error"
                }`}
              >
                Delete
              </button>
              <button
                onClick={() => setFilterAction("APPROVE")}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  filterAction === "APPROVE"
                    ? "bg-surface-container-lowest shadow-sm text-tertiary"
                    : "text-on-surface-variant hover:text-tertiary"
                }`}
              >
                Approve
              </button>
              <button
                onClick={() => setFilterAction("REJECT")}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  filterAction === "REJECT"
                    ? "bg-surface-container-lowest shadow-sm text-error"
                    : "text-on-surface-variant hover:text-error"
                }`}
              >
                Reject
              </button>
            </div>
          </section>

          {/* Audit Logs Table */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 flex-1 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-on-surface-variant">No audit logs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Timestamp</th>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Admin</th>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Action</th>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Resource</th>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {auditLogs.map((log, i) => {
                      const actionColor = getActionColor(log.action);
                      return (
                        <tr
                          key={log.id}
                          className={`hover:bg-surface-container-low transition-colors cursor-pointer ${
                            i % 2 === 1 ? "bg-surface-container-low/20" : ""
                          }`}
                          onClick={() => setSelectedLog(log)}
                        >
                          <td className="px-6 py-4 text-sm text-on-surface-variant">
                            {new Date(log.timestamp).toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface">{log.admin_email}</td>
                          <td className="px-6 py-4">
                            <div className={`flex items-center gap-2 ${actionColor.text}`}>
                              <span className="material-symbols-outlined text-[18px]">{actionColor.icon}</span>
                              <span className="text-sm font-semibold">{log.action}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px] text-primary">{getResourceIcon(log.resource_type)}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-on-surface">{log.resource_name}</p>
                                <p className="text-xs text-on-surface-variant">{log.resource_type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-tertiary-container/30 text-tertiary">{log.status}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{log.details}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && auditLogs.length > 0 && (
              <div className="px-6 py-4 bg-surface-container border-t border-outline-variant/30 flex items-center justify-between">
                <p className="text-xs text-on-surface-variant">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalLogs)}-{Math.min(currentPage * itemsPerPage, totalLogs)} of {totalLogs} logs
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>

                  {(() => {
                    const pages: number[] = [];
                    if (totalPages <= 5) {
                      pages.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
                    } else {
                      if (currentPage <= 3) {
                        pages.push(1, 2, 3, 4, 5);
                      } else if (currentPage >= totalPages - 2) {
                        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                      } else {
                        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
                      }
                    }

                    return pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded border transition-colors text-sm font-medium ${
                          currentPage === page
                            ? "bg-primary text-on-primary border-primary"
                            : "border-outline-variant text-on-surface-variant hover:bg-surface-container-highest"
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Detail Panel */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-8 max-w-xl mx-4 border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-on-surface">Audit Log Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase mb-2">Timestamp</p>
                <p className="text-base text-on-surface">
                  {new Date(selectedLog.timestamp).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase mb-2">Admin</p>
                <p className="text-base text-on-surface">{selectedLog.admin_email}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase mb-2">Action</p>
                <div className={`flex items-center gap-2 ${getActionColor(selectedLog.action).text}`}>
                  <span className="material-symbols-outlined text-[20px]">{getActionColor(selectedLog.action).icon}</span>
                  <span className="text-base font-semibold">{selectedLog.action}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase mb-2">Resource</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{getResourceIcon(selectedLog.resource_type)}</span>
                  </div>
                  <div>
                    <p className="text-base font-medium text-on-surface">{selectedLog.resource_name}</p>
                    <p className="text-sm text-on-surface-variant">{selectedLog.resource_type} (ID: {selectedLog.resource_id})</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase mb-2">Status</p>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-tertiary-container/30 text-tertiary">{selectedLog.status}</span>
              </div>

              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase mb-2">Details</p>
                <p className="text-base text-on-surface-variant">{selectedLog.details}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full mt-8 bg-primary text-on-primary py-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
