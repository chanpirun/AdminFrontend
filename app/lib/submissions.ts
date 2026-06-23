import type { Project } from "@/data/projects";

type SubmissionApiRecord = {
  id: number;
  title: string;
  tags: string[];
  owner_type: "individual" | "team";
  owner_name: string;
  description: string;
  cover_image_path: string;
  document_path: string | null;
  document_paths: string[] | null;
  source_code_path: string | null;
  source_code_paths: string[] | null;
  dataset_path: string | null;
  dataset_paths: string[] | null;
  project_image_paths: string[] | null;
  demo_link: string | null;
  status: "pending" | "approved" | "rejected";
  review_comment: string | null;
  reviewed_by_role: "assistant" | "director" | null;
  reviewed_at: string | null;
  visibility: "public" | "private";
  created_at: string;
};

/**
 * Read the auth token synchronously from localStorage.
 * This is safe to call anywhere (hook or non-hook context).
 * Returns null on the server (SSR) or if no token is stored.
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function toAbsoluteFileUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";
  return `${backendBaseUrl}/storage/${path}`;
}

function toAbsoluteFileUrls(
  paths: (string | null | undefined)[] | null | undefined,
): string[] {
  return (paths ?? [])
    .map((path) => toAbsoluteFileUrl(path))
    .filter((path): path is string => Boolean(path));
}

export function mapSubmissionToProject(item: SubmissionApiRecord): Project {
  const pdfs = toAbsoluteFileUrls(item.document_paths);
  const sourceZips = toAbsoluteFileUrls(item.source_code_paths);
  const datasets = toAbsoluteFileUrls(item.dataset_paths);
  const finalDocuments = toAbsoluteFileUrls(item.project_image_paths);
  const fallbackPdf = toAbsoluteFileUrl(item.document_path);
  const fallbackSourceZip = toAbsoluteFileUrl(item.source_code_path);
  const fallbackDataset = toAbsoluteFileUrl(item.dataset_path);

  return {
    id: String(item.id),
    title: item.title,
    tags: item.tags ?? [],
    owner: item.owner_name,
    ownerType: item.owner_type,
    date: new Date(item.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    coverImage:
      toAbsoluteFileUrl(item.cover_image_path) ??
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
    description: item.description,
    demoLink: item.demo_link ?? undefined,
    pdf: pdfs[0] ?? fallbackPdf,
    pdfs: pdfs.length > 0 ? pdfs : fallbackPdf ? [fallbackPdf] : [],
    sourceZip: sourceZips[0] ?? fallbackSourceZip,
    sourceZips:
      sourceZips.length > 0 ? sourceZips : fallbackSourceZip ? [fallbackSourceZip] : [],
    dataset: datasets[0] ?? fallbackDataset,
    datasets: datasets.length > 0 ? datasets : fallbackDataset ? [fallbackDataset] : [],
    finalDocuments,
    projectImages: finalDocuments,
    status: item.status,
    reviewComment: item.review_comment ?? undefined,
    visibility: item.visibility,
  };
}

export async function fetchProjectsFromApi(token: string): Promise<Project[]> {
  const response = await fetch("/api/submissions", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.message ?? "Failed to fetch submissions.");
  }

  const rows: SubmissionApiRecord[] = json?.data ?? [];
  return rows.map(mapSubmissionToProject);
}
