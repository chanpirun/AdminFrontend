import type { Project } from "@/data/projects";

type SubmissionApiRecord = {
  id: number;
  title: string;
  tags: string[];
  owner_type: "individual" | "team";
  owner_name: string;
  description: string;
  cover_image_path: string;
  cover_image_url?: string | null;
  document_path: string | null;
  document_url?: string | null;
  document_paths: string[] | null;
  document_urls?: string[] | null;
  source_code_path: string | null;
  source_code_url?: string | null;
  source_code_paths: string[] | null;
  source_code_urls?: string[] | null;
  dataset_path: string | null;
  dataset_url?: string | null;
  dataset_paths: string[] | null;
  dataset_urls?: string[] | null;
  project_image_paths: string[] | null;
  project_image_urls?: string[] | null;
  demo_link: string | null;
  status: "pending" | "approved" | "rejected";
  review_comment: string | null;
  reviewed_by_role: "assistant" | "director" | null;
  reviewed_at: string | null;
  visibility: "public" | "private";
  created_at: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY: getAuthToken() has been removed.
// The Sanctum token is now stored in an HttpOnly cookie and is NEVER accessible
// to JavaScript. All API functions call Next.js proxy routes or rewrites which
// read the cookie server-side and inject the Authorization header automatically.
// ─────────────────────────────────────────────────────────────────────────────

export function mapSubmissionToProject(item: SubmissionApiRecord): Project {
  const pdfs = item.document_urls ?? [];
  const sourceZips = item.source_code_urls ?? [];
  const datasets = item.dataset_urls ?? [];
  const finalDocuments = item.project_image_urls ?? [];
  const fallbackPdf = item.document_url;
  const fallbackSourceZip = item.source_code_url;
  const fallbackDataset = item.dataset_url;

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
      item.cover_image_url ??
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
    description: item.description,
    demoLink: item.demo_link ?? undefined,
    pdf: pdfs[0] ?? fallbackPdf ?? undefined,
    pdfs: pdfs.length > 0 ? pdfs : fallbackPdf ? [fallbackPdf] : [],
    sourceZip: sourceZips[0] ?? fallbackSourceZip ?? undefined,
    sourceZips:
      sourceZips.length > 0 ? sourceZips : fallbackSourceZip ? [fallbackSourceZip] : [],
    dataset: datasets[0] ?? fallbackDataset ?? undefined,
    datasets: datasets.length > 0 ? datasets : fallbackDataset ? [fallbackDataset] : [],
    finalDocuments,
    projectImages: finalDocuments,
    status: item.status,
    reviewComment: item.review_comment ?? undefined,
    visibility: item.visibility,
  };
}

export async function fetchProjectsFromApi(): Promise<Project[]> {
  const response = await fetch("/api/submissions", {
    credentials: "include",
    cache: "no-store",
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.message ?? "Failed to fetch submissions.");
  }

  const rows: SubmissionApiRecord[] = json?.data ?? [];
  return rows.map(mapSubmissionToProject);
}
