"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Globe, Lock, Search, Trash2, XCircle } from "lucide-react";
import {
  type Project,
  type ProjectStatus,
  type ProjectVisibility,
} from "@/data/projects";
import SubmissionReviewModal from "@/components/submission-review-modal";
import { useAuth } from "@/context/AuthContext";
import {
  fetchProjectsFromApi,
  mapSubmissionToProject,
} from "@/lib/submissions";


function ReviewBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, { bg: string; text: string; border: string; icon: any }> = {
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200/60",
      icon: Clock,
    },
    approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200/60",
      icon: CheckCircle2,
    },
    rejected: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200/60",
      icon: XCircle,
    },
  };

  const config = styles[status] || styles.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon size={12} />
      <span className="capitalize">{status}</span>
    </span>
  );
}

function VisibilityBadge({ visibility }: { visibility: ProjectVisibility }) {
  return visibility === "public" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
      <Globe size={12} />
      Public
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
      <Lock size={12} />
      Private
    </span>
  );
}

type FilterTab = "all" | ProjectVisibility | ProjectStatus;

const tabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "public", label: "Published" },
  { key: "private", label: "Private" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
];

export default function DirectorSubmissions() {
  const [list, setList] = useState<Project[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, clearSession } = useAuth();

  useEffect(() => {
    async function load() {
      if (!user) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchProjectsFromApi();
        setList(rows);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load submissions.";
        if (msg.toLowerCase().includes('unauthenticated') || msg.toLowerCase().includes('unauthorized')) {
          clearSession();
          return;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);


  const counts: Record<FilterTab, number> = {
    all: list.length,
    public: list.filter((p) => p.visibility === "public").length,
    private: list.filter((p) => p.visibility === "private").length,
    approved: list.filter((p) => p.status === "approved").length,
    pending: list.filter((p) => p.status === "pending").length,
    rejected: list.filter((p) => p.status === "rejected").length,
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filtered = list.filter((p) => {
    const matchesTab =
      filter === "all"
        ? true
        : filter === "public" || filter === "private"
          ? p.visibility === filter
          : p.status === filter;

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.owner.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  async function handleToggleVisibility(
    id: string,
    visibility: ProjectVisibility,
  ) {
    if (!user) {
      setError("Please sign in again to update submissions.");
      return;
    }

    const response = await fetch(`/next-api/submissions/${id}/visibility`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visibility,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.message ?? "Failed to update visibility.");
      return;
    }

    setList((prev) =>
      prev.map((p) => (p.id === id ? mapSubmissionToProject(payload.data) : p)),
    );
  }

  async function handleStatusChange(
    id: string,
    status: ProjectStatus,
    comment?: string,
  ) {
    if (!user) {
      setError("Please sign in again to update submissions.");
      return;
    }

    try {
      const response = await fetch(`/next-api/submissions/${id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          review_comment: comment || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.message ?? "Failed to update submission status.");
        return;
      }

      setList((prev) =>
        prev.map((p) => (p.id === id ? mapSubmissionToProject(payload.data) : p)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update submission status.");
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this project submission? This cannot be undone.",
    );
    if (!confirmed) return;

    if (!user) {
      setError("Please sign in again to delete submissions.");
      return;
    }

    try {
      const response = await fetch(`/next-api/submissions/${id}`, {
        method: "DELETE",
      });

      let payload: { message?: string } = {};
      try {
        payload = await response.json();
      } catch {
        // response may have no body on success
      }

      if (!response.ok) {
        setError(payload?.message ?? `Failed to delete submission (status ${response.status}).`);
        return;
      }

      setList((prev) => prev.filter((p) => p.id !== id));
      setSelected((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error — could not delete submission.");
    }
  }

  return (
    <section className="w-full">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
          Project Management
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Submissions</h1>
      </div>

      {loading && (
        <p className="mb-4 text-sm text-slate-500">Loading submissions...</p>
      )}
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200/80 bg-slate-50 p-1 shadow-sm w-fit">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === key
                  ? "bg-white text-indigo-950 shadow-sm border border-slate-200/40"
                  : "text-slate-500 hover:text-indigo-700"
              }`}
            >
              {label}
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
                  filter === key
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-slate-200/60 text-slate-600"
                }`}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 text-slate-900"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
              <th className="w-8 px-5 py-3.5">#</th>
              <th className="px-5 py-3.5">Title</th>
              <th className="hidden px-5 py-3.5 md:table-cell">Owner</th>
              <th className="hidden px-5 py-3.5 lg:table-cell">Review</th>
              <th className="px-5 py-3.5">Visibility</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-slate-400"
                >
                  No projects found.
                </td>
              </tr>
            )}
            {filtered.map((p, index) => (
              <tr key={p.id} className="transition-colors hover:bg-indigo-50/20 group/row">
                <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                  {index + 1}
                </td>
                <td className="px-5 py-4">
                  <p className="line-clamp-2 max-w-sm font-bold leading-snug text-slate-800 transition-colors group-hover/row:text-indigo-950">
                    {p.title}
                  </p>
                </td>
                <td className="hidden whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-600 md:table-cell">
                  {p.owner}
                </td>
                <td className="hidden px-5 py-4 lg:table-cell">
                  <ReviewBadge status={p.status} />
                </td>
                <td className="px-5 py-4">
                  <VisibilityBadge visibility={p.visibility} />
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2.5 opacity-90 group-hover/row:opacity-100 transition-opacity">
                    {p.visibility === "private" ? (
                      <button
                        onClick={() => handleToggleVisibility(p.id, "public")}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-700 hover:border-indigo-200 cursor-pointer"
                      >
                        <Globe size={11} />
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleVisibility(p.id, "private")}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-700 hover:border-indigo-200 cursor-pointer"
                      >
                        <Lock size={11} />
                        Privatize
                      </button>
                    )}
                    <button
                      onClick={() => setSelected(p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-100 cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-700 transition hover:bg-red-100 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <SubmissionReviewModal
          project={list.find((p) => p.id === selected.id) ?? selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onToggleVisibility={handleToggleVisibility}
        />
      )}
    </section>
  );
}
