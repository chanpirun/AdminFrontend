"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { type Project, type ProjectStatus } from "@/data/projects";
import SubmissionReviewModal from "@/components/submission-review-modal";
import { useAuth } from "@/context/AuthContext";
import {
  fetchProjectsFromApi,
  getAuthToken,
  mapSubmissionToProject,
} from "@/lib/submissions";

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-600",
  };
  const labels: Record<ProjectStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

type FilterTab = "all" | ProjectStatus;

const tabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function Submissions() {
  const [list, setList] = useState<Project[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token] = useState<string | null>(() => getAuthToken());
  const { clearSession } = useAuth();

  useEffect(() => {
    async function load() {
      if (!token) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchProjectsFromApi(token);
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
  }, [token]);

  const counts: Record<FilterTab, number> = {
    all: list.length,
    pending: list.filter((p) => p.status === "pending").length,
    approved: list.filter((p) => p.status === "approved").length,
    rejected: list.filter((p) => p.status === "rejected").length,
  };

  const filtered =
    filter === "all" ? list : list.filter((p) => p.status === filter);

  async function handleUpdate(
    id: string,
    status: ProjectStatus,
    comment: string,
  ) {
    if (!token) {
      setError("Please sign in again to update submissions.");
      return;
    }

    const response = await fetch(`/api/submissions/${id}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        review_comment: comment,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.message ?? "Failed to update submission.");
      return;
    }

    setList((prev) =>
      prev.map((p) => (p.id === id ? mapSubmissionToProject(payload.data) : p)),
    );
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this project submission? This cannot be undone.",
    );
    if (!confirmed) return;

    if (!token) {
      setError("Please sign in again to delete submissions.");
      return;
    }

    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
          Submission Review
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

      <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${filter === key
              ? "bg-indigo-900 text-white shadow-sm"
              : "text-slate-600 hover:text-indigo-700"
              }`}
          >
            {label}
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${filter === key
                ? "bg-indigo-700 text-indigo-100"
                : "bg-slate-100 text-slate-500"
                }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="w-8 px-4 py-3">#</th>
              <th className="px-4 py-3">Title</th>
              <th className="hidden px-4 py-3 md:table-cell">Owner</th>
              <th className="hidden px-4 py-3 lg:table-cell">Date</th>
              <th className="hidden px-4 py-3 lg:table-cell">Tags</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-slate-400"
                >
                  No submissions found.
                </td>
              </tr>
            )}
            {filtered.map((p, index) => (
              <tr key={p.id} className="transition-colors hover:bg-indigo-50/40">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <p className="line-clamp-2 max-w-xs font-semibold leading-snug text-slate-900">
                    {p.title}
                  </p>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-slate-600 md:table-cell">
                  {p.owner}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-slate-500 lg:table-cell">
                  {p.date}
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                    {p.tags.length > 2 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                        +{p.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelected(p)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 size={12} />
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
          onStatusChange={handleUpdate}
        />
      )}
    </section>
  );
}
