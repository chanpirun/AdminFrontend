"use client";

import {
  CalendarDays,
  CheckCircle2,
  Code2,
  Database,
  Download,
  ExternalLink,
  FileText,
  Hourglass,
  IdCard,
  Lock,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  type Project,
  type ProjectStatus,
  type ProjectVisibility,
} from "@/data/projects";

type PreviewFile = {
  name: string;
  url: string;
  type: string;
};

type PreviewCollection = {
  label: string;
  files: PreviewFile[];
};

type SubmissionReviewModalProps = {
  project: Project;
  onClose: () => void;
  onStatusChange: (id: string, status: ProjectStatus, comment: string) => void;
  onToggleVisibility?: (id: string, visibility: ProjectVisibility) => void;
};

function firstUrl(field: string | string[] | undefined): string | null {
  if (!field) return null;
  if (Array.isArray(field)) return field[0] ?? null;
  return field;
}

function urls(field: string | string[] | undefined): string[] {
  if (!field) return [];
  return Array.isArray(field) ? field : [field];
}

function fileNameFromUrl(url: string | null, fallback: string) {
  if (!url) return fallback;
  const path = url.split("?")[0].split("#")[0];
  const name = path.split("/").pop();
  return name ? decodeURIComponent(name) : fallback;
}

function fileTypeFromUrl(url: string | null, fallback: string) {
  if (!url) return fallback;
  const name = fileNameFromUrl(url, fallback);
  const extension = name.split(".").pop();
  return extension ? extension.toUpperCase() : fallback;
}

function previewType(url: string) {
  const extension = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension ?? "")) {
    return "image";
  }
  return "document";
}

function isFileTypePreviewable(url: string): boolean {
  const extension = url.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
  if (!extension) return false;
  const previewableExtensions = [
    "pdf", "txt", "png", "jpg", "jpeg", "webp", "gif", "svg"
  ];
  return previewableExtensions.includes(extension);
}

function previewFilesFromUrls(fileUrls: string[], fallback: string): PreviewFile[] {
  return fileUrls.map((url, index) => ({
    name: fileNameFromUrl(url, `${fallback} ${index + 1}`),
    url,
    type: previewType(url),
  }));
}

async function forceDownload(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback: open in new tab if fetch fails
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function StatusPill({ status }: { status: ProjectStatus }) {
  const labels: Record<ProjectStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  const styles: Record<ProjectStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };
  const Icon =
    status === "pending" ? Hourglass : status === "approved" ? CheckCircle2 : XCircle;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${styles[status]}`}
    >
      <Icon size={18} />
      {labels[status]}
    </span>
  );
}

function PreviewModal({
  collection,
  onClose,
}: {
  collection: PreviewCollection;
  onClose: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const file = collection.files[selectedIndex] ?? collection.files[0];
  if (!file) return null;

  const isImage = file.type === "image";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {collection.label}
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {collection.files.length} file{collection.files.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-100 hover:text-red-600"
            type="button"
            onClick={onClose}
            title="Close preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-[60vh] bg-slate-100 lg:grid-cols-[280px_1fr]">
          <div className="border-b border-slate-200 bg-white p-3 lg:border-b-0 lg:border-r">
            <div className="max-h-52 space-y-2 overflow-auto lg:max-h-[72vh]">
              {collection.files.map((item, index) => (
                <button
                  key={`${item.url}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${selectedIndex === index
                      ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <FileText size={18} className="shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {item.name}
                    </span>
                    <span className="text-xs font-medium uppercase text-slate-400">
                      {fileTypeFromUrl(item.url, "FILE")}
                    </span>
                  </span>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(event) => { event.stopPropagation(); forceDownload(item.url, item.name); }}
                    onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.stopPropagation(); forceDownload(item.url, item.name); } }}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-indigo-700 cursor-pointer"
                    title={`Download ${item.name}`}
                  >
                    <Download size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-auto p-4 flex items-center justify-center">
            {!isFileTypePreviewable(file.url) ? (
              <div className="flex min-h-[50vh] w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-100 shadow-sm">
                  <FileText size={28} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-800">
                  Preview Unavailable
                </h3>
                <p className="mt-2 max-w-sm text-xs font-medium text-slate-500 leading-relaxed">
                  This file type ({fileTypeFromUrl(file.url, "Unknown")}) cannot be previewed directly in the browser. Please download it to view its content.
                </p>
                <a
                  href={file.url}
                  download={file.name}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-900 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-800 cursor-pointer"
                >
                  <Download size={14} />
                  Download {file.name}
                </a>
              </div>
            ) : isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.url}
                alt={file.name}
                className="mx-auto max-h-[72vh] max-w-full rounded-lg bg-white object-contain shadow-sm"
              />
            ) : (
              <iframe
                className="h-[72vh] w-full rounded-lg border border-slate-200 bg-white"
                src={file.url}
                title={file.name}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FileCard({
  icon: Icon,
  label,
  field,
  fallbackType,
  onPreview,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  field: string | string[] | undefined;
  fallbackType: string;
  onPreview: (collection: PreviewCollection) => void;
}) {
  const allUrls = urls(field);
  const url = firstUrl(field);
  const disabled = !url;
  const typeLabel =
    allUrls.length > 1 ? `${allUrls.length} files` : fileTypeFromUrl(url, fallbackType);

  const getTheme = () => {
    const l = label.toLowerCase();
    if (l.includes("manual")) {
      return {
        bg: "bg-rose-50 text-rose-600 border-rose-100",
        border: "hover:border-rose-300 hover:bg-rose-50/10",
        icon: "bg-rose-50 text-rose-600",
      };
    }
    if (l.includes("source")) {
      return {
        bg: "bg-amber-50 text-amber-600 border-amber-100",
        border: "hover:border-amber-300 hover:bg-amber-50/10",
        icon: "bg-amber-50 text-amber-600",
      };
    }
    if (l.includes("database")) {
      return {
        bg: "bg-sky-50 text-sky-600 border-sky-100",
        border: "hover:border-sky-300 hover:bg-sky-50/10",
        icon: "bg-sky-50 text-sky-600",
      };
    }
    return {
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      border: "hover:border-emerald-300 hover:bg-emerald-50/10",
      icon: "bg-emerald-50 text-emerald-600",
    };
  };

  const theme = getTheme();

  return (
    <div
      onClick={() => {
        if (disabled || allUrls.length === 0) return;
        onPreview({
          label,
          files: previewFilesFromUrls(allUrls, label),
        });
      }}
      className={`group relative flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ${disabled
          ? "opacity-45 cursor-not-allowed"
          : `cursor-pointer ${theme.border} hover:shadow-md`
        }`}
      title={url ? `Preview ${label}` : `${label} unavailable`}
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${theme.icon} transition-transform group-hover:scale-105 duration-200`}>
        <Icon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className="mt-0.5 block text-sm font-bold text-slate-800 truncate">
          {typeLabel}
        </span>
      </span>
      {url && (
        <a
          href={url}
          download
          onClick={(event) => event.stopPropagation()}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600 z-10"
          title={`Download ${label}`}
        >
          <Download size={15} />
        </a>
      )}
    </div>
  );
}

export default function SubmissionReviewModal({
  project,
  onClose,
  onStatusChange,
  onToggleVisibility,
}: SubmissionReviewModalProps) {
  const [comment, setComment] = useState(project.reviewComment ?? "");
  const [saving, setSaving] = useState(false);
  const [previewCollection, setPreviewCollection] =
    useState<PreviewCollection | null>(null);
  const [imageError, setImageError] = useState(false);
  const initial = project.title.trim().charAt(0).toUpperCase() || "P";

  // Reset image error state whenever the project changes
  useEffect(() => {
    setImageError(false);
  }, [project.id]);

  function handleStatus(status: ProjectStatus) {
    setSaving(true);
    onStatusChange(project.id, status, comment);
    setSaving(false);
    onClose();
  }

  function handleVisibilityToggle() {
    if (!onToggleVisibility) return;
    const next = project.visibility === "public" ? "private" : "public";
    onToggleVisibility(project.id, next);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-8"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      {previewCollection && (
        <PreviewModal
          collection={previewCollection}
          onClose={() => setPreviewCollection(null)}
        />
      )}

      <div className="relative my-auto max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-100 hover:text-red-600 md:right-8 md:top-8"
          type="button"
          title="Close"
        >
          <X size={30} />
        </button>

        <div className="relative h-64 overflow-hidden border-b border-slate-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
          {project.coverImage && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.coverImage}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none">
              <div className="text-[120px] font-black text-white tracking-widest">
                {initial}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/35 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col items-start justify-between gap-4 md:left-10 md:right-10 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-200">
                Cover Image
              </p>
              <p className="mt-1 max-w-2xl text-2xl font-bold text-white md:text-3xl tracking-tight leading-tight">
                {project.title}
              </p>
            </div>
            <StatusPill status={project.status} />
          </div>
        </div>

        <div className="px-6 py-7 md:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-5xl font-bold text-indigo-700">
              {initial}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-3xl font-bold text-slate-950">
                {project.title}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 rounded-xl border border-slate-100 bg-slate-50/50 p-5 md:grid-cols-3 shadow-inner">
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <UserRound size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Owner
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                  {project.owner}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <IdCard size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Type
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-slate-800 capitalize">
                  {project.ownerType}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <CalendarDays size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Submitted
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                  {project.date}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-lg font-bold uppercase tracking-wide text-slate-600">
              Description
            </p>
            <p className="mt-3 text-lg leading-relaxed text-slate-950">
              {project.description}
            </p>
          </div>

          <div className="mt-7">
            <p className="text-lg font-bold uppercase tracking-wide text-slate-600">
              Submitted Files
            </p>
            <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <FileCard
                icon={FileText}
                label="Manual Documentation"
                field={project.pdfs ?? project.pdf}
                fallbackType="PDF"
                onPreview={setPreviewCollection}
              />
              <FileCard
                icon={Code2}
                label="Source Code"
                field={project.sourceZips ?? project.sourceZip}
                fallbackType="ZIP"
                onPreview={setPreviewCollection}
              />
              <FileCard
                icon={Database}
                label="Database"
                field={project.datasets ?? project.dataset}
                fallbackType="SQL"
                onPreview={setPreviewCollection}
              />
              <FileCard
                icon={FileText}
                label="Finalized Documentation"
                field={project.finalDocuments ?? project.projectImages}
                fallbackType="PDF"
                onPreview={setPreviewCollection}
              />
            </div>
          </div>

          <hr className="mt-7 border-slate-200" />

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-lg font-bold uppercase tracking-wide text-slate-600">
                Review Comment
              </p>
              <span className="text-sm font-medium text-slate-500">
                {comment.length} / 1000
              </span>
            </div>
            <textarea
              className="min-h-36 w-full resize-y rounded-lg border border-slate-200 bg-white px-5 py-4 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              maxLength={1000}
              placeholder="Add feedback or notes for the submitter..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-6">
            {onToggleVisibility && (
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                disabled={saving}
                onClick={handleVisibilityToggle}
                type="button"
              >
                <Lock size={15} />
                {project.visibility === "public" ? "Make Private" : "Publish to Gallery"}
              </button>
            )}
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-100 disabled:opacity-50 cursor-pointer"
              disabled={saving}
              onClick={() => handleStatus("rejected")}
              type="button"
            >
              <XCircle size={15} />
              Reject Project
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800 disabled:opacity-50 cursor-pointer"
              disabled={saving}
              onClick={() => handleStatus("approved")}
              type="button"
            >
              <CheckCircle2 size={15} />
              Approve & Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
