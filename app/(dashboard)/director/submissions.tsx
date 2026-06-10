"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Database,
  Download,
  ExternalLink,
  FileArchive,
  FileText,
  Globe,
  ImageIcon,
  Lock,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { type Project, type ProjectStatus, type ProjectVisibility } from "@/data/projects";
import {
  fetchProjectsFromApi,
  getAuthToken,
  mapSubmissionToProject,
} from "@/lib/submissions";

// ── helpers ──────────────────────────────────────────────────────────────────

function ReviewBadge({ status }: { status: ProjectStatus }) {
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

function VisibilityBadge({ visibility }: { visibility: ProjectVisibility }) {
  return visibility === "public" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
      <Globe size={11} />
      Public
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
      <Lock size={11} />
      Private
    </span>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

type ModalProps = {
  project: Project;
  onClose: () => void;
  onToggleVisibility: (id: string, visibility: ProjectVisibility) => void;
  onStatusChange?: (id: string, status: ProjectStatus, comment?: string) => void;
};

function DetailModal({ project, onClose, onToggleVisibility, onStatusChange }: ModalProps) {
  const [busy, setBusy] = useState(false);
  const [reviewComment, setReviewComment] = useState(project.reviewComment || "");
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  function handleToggle() {
    const next: ProjectVisibility =
      project.visibility === "public" ? "private" : "public";
    setBusy(true);
    setTimeout(() => {
      onToggleVisibility(project.id, next);
      setBusy(false);
      onClose();
    }, 350);
  }

  function handleApprove() {
    if (onStatusChange) {
      onStatusChange(project.id, "approved", reviewComment);
      onClose();
    }
  }

  function handleReject() {
    if (onStatusChange) {
      onStatusChange(project.id, "rejected", reviewComment);
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
        {/* Close - RED */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
        >
          <X size={18} />
        </button>

        {/* Cover */}
        <div className="h-52 w-full overflow-hidden rounded-t-2xl">
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6">
          {/* Title + badges */}
          <div className="flex items-start gap-3 flex-wrap">
            <h2 className="flex-1 text-xl font-bold text-slate-950 leading-snug">
              {project.title}
            </h2>
            <ReviewBadge status={project.status} />
            <VisibilityBadge visibility={project.visibility} />
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Owner
              </p>
              <p className="mt-0.5 text-slate-700">{project.owner}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Type
              </p>
              <p className="mt-0.5 capitalize text-slate-700">
                {project.ownerType}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Date
              </p>
              <p className="mt-0.5 text-slate-700">{project.date}</p>
            </div>
            {project.demoLink && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Demo
                </p>
                <a
                  href={project.demoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-indigo-600 hover:underline text-sm"
                >
                  View Demo <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Review comment */}
          {project.reviewComment && (
            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Assistant Review
              </p>
              <p className="text-sm text-slate-600 italic">
                &ldquo;{project.reviewComment}&rdquo;
              </p>
            </div>
          )}

          {/* Files */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Submitted Files
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { icon: FileText, label: "Paper", field: project.pdf },
                  { icon: FileArchive, label: "Source Code", field: project.sourceZip },
                  { icon: Database, label: "Database", field: project.dataset },
                  { icon: ImageIcon, label: "Finalized Documentation", field: project.projectImages },
                ] as const
              ).map(({ icon: Icon, label, field }) => (
                <button
                  key={label}
                  type="button"
                  disabled={!field}
                  onClick={() => {
                    if (field && typeof field === "string") {
                      window.open(field, "_blank");
                    } else if (Array.isArray(field) && field.length > 0) {
                      window.open(field[0], "_blank");
                    }
                  }}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon size={14} />
                  {label}
                  <Download size={12} className="ml-auto opacity-60" />
                </button>
              ))}
            </div>
          </div>

          <hr className="mt-6 border-slate-100" />

          {/* Director Review Section */}
          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Director Review & Approval
            </p>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Review Comment (Optional)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add a review comment for the member..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleReject}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition disabled:opacity-50"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                Approve
              </button>
            </div>
          </div>

          <hr className="mt-6 border-slate-100" />

          {/* Visibility control */}
          <div className="mt-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Visibility Control
            </p>
            <p className="text-xs text-slate-500 mb-3">
              {project.visibility === "public"
                ? "This project is publicly visible to all users."
                : "This project is private — only the owner, assistants, and directors can see it."}
            </p>
            <div className="flex gap-3 justify-end">
              {project.visibility === "public" ? (
                <button
                  onClick={handleToggle}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  <Lock size={15} />
                  Make Private
                </button>
              ) : (
                <button
                  onClick={handleToggle}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-900 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 transition disabled:opacity-50"
                >
                  <Globe size={15} />
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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

  useEffect(() => {
    async function load() {
      const token = getAuthToken();
      if (!token) {
        setError("Please sign in to view submissions.");
        setLoading(false);
        return;
      }

      try {
        const rows = await fetchProjectsFromApi(token);
        setList(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const counts: Record<FilterTab, number> = {
    all: list.length,
    public: list.filter((p) => p.visibility === "public").length,
    private: list.filter((p) => p.visibility === "private").length,
    approved: list.filter((p) => p.status === "approved").length,
    pending: list.filter((p) => p.status === "pending").length,
    rejected: list.filter((p) => p.status === "rejected").length,
  };

  const filtered =
    filter === "all"
      ? list
      : filter === "public" || filter === "private"
        ? list.filter((p) => p.visibility === filter)
        : list.filter((p) => p.status === filter);

  async function handleToggleVisibility(id: string, visibility: ProjectVisibility) {
    const token = getAuthToken();
    if (!token) {
      setError("Please sign in again to update submissions.");
      return;
    }

    const response = await fetch(`/api/submissions/${id}/visibility`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

  async function handleStatusChange(id: string, status: ProjectStatus, comment?: string) {
    const token = getAuthToken();
    if (!token) {
      setError("Please sign in again to update submissions.");
      return;
    }

    try {
      const response = await fetch(`/api/submissions/${id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    const confirmed = window.confirm("Delete this project submission? This cannot be undone.");
    if (!confirmed) return;

    const token = getAuthToken();
    if (!token) {
      setError("Please sign in again to delete submissions.");
      return;
    }

    const response = await fetch(`/api/submissions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.message ?? "Failed to delete submission.");
      return;
    }

    setList((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => (prev?.id === id ? null : prev));
  }

  return (
    <section className="w-full">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
          Project Management
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Submissions</h1>
      </div>
      {loading && <p className="mb-4 text-sm text-slate-500">Loading submissions...</p>}
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-white border border-slate-200 p-1 w-fit shadow-sm">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === key
                ? "bg-indigo-900 text-white shadow-sm"
                : "text-slate-600 hover:text-indigo-700"
            }`}
          >
            {label}
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                filter === key
                  ? "bg-indigo-700 text-indigo-100"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 w-8">#</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 hidden md:table-cell">Owner</th>
              <th className="px-4 py-3 hidden lg:table-cell">Review</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-slate-400 text-sm"
                >
                  No projects found.
                </td>
              </tr>
            )}
            {filtered.map((p, index) => (
              <tr key={p.id} className="hover:bg-indigo-50/40 transition-colors">
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900 leading-snug line-clamp-2 max-w-xs">
                    {p.title}
                  </p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-600 whitespace-nowrap">
                  {p.owner}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <ReviewBadge status={p.status} />
                </td>
                <td className="px-4 py-3">
                  <VisibilityBadge visibility={p.visibility} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {p.visibility === "private" ? (
                      <button
                        onClick={() => handleToggleVisibility(p.id, "public")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-800 transition"
                      >
                        <Globe size={12} />
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleVisibility(p.id, "private")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        <Lock size={12} />
                        Privatize
                      </button>
                    )}
                    <button
                      onClick={() => setSelected(p)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
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
        <DetailModal
          project={list.find((p) => p.id === selected.id) ?? selected}
          onClose={() => setSelected(null)}
          onToggleVisibility={handleToggleVisibility}
          onStatusChange={handleStatusChange}
        />
      )}
    </section>
  );
}
