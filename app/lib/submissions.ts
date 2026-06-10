import type { Project } from "@/data/projects";

type SubmissionApiRecord = {
  id: number;
  title: string;
  tags: string[];
  owner_type: "individual" | "team";
  owner_name: string;
  description: string;
  cover_image_path: string;
  document_path: string;
  source_code_path: string;
  dataset_path: string;
  project_image_paths: string[] | null;
  demo_link: string | null;
  status: "pending" | "approved" | "rejected";
  review_comment: string | null;
  visibility: "public" | "private";
  created_at: string;
};

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("auth_token");
}

function toAbsoluteFileUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";
  return `${backendBaseUrl}/storage/${path}`;
}

export function mapSubmissionToProject(item: SubmissionApiRecord): Project {
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
    pdf: toAbsoluteFileUrl(item.document_path),
    sourceZip: toAbsoluteFileUrl(item.source_code_path),
    dataset: toAbsoluteFileUrl(item.dataset_path),
    projectImages: (item.project_image_paths ?? [])
      .map((p) => toAbsoluteFileUrl(p))
      .filter((p): p is string => Boolean(p)),
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
