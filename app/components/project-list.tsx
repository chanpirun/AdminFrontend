import { Calendar, Globe, Lock, Search, User } from "lucide-react";
import type { Project } from "@/data/projects";

const tagColors = [
  "bg-indigo-50 text-indigo-700 border border-indigo-100",
  "bg-violet-50 text-violet-700 border border-violet-100",
  "bg-emerald-50 text-emerald-700 border border-emerald-100",
  "bg-amber-50 text-amber-700 border border-amber-100",
  "bg-sky-50 text-sky-700 border border-sky-100",
  "bg-rose-50 text-rose-700 border border-rose-100",
];

type ProjectListProps = {
  projects: Project[];
  title?: string;
  countLabel?: string;
  searchPlaceholder?: string;
  actionLabel?: string;
  showSearch?: boolean;
  showVisibility?: boolean;
};

export default function ProjectList({
  projects,
  title = "Latest Publications",
  countLabel = "Projects",
  searchPlaceholder = "Search research, projects, or authors...",
  actionLabel = "Open Publication",
  showSearch = true,
  showVisibility = false,
}: ProjectListProps) {
  return (
    <div>
      {showSearch && (
        <div className="mb-16">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 px-6 py-5 shadow-[0_15px_50px_rgba(15,23,42,.06)] backdrop-blur-xl transition hover:shadow-[0_20px_60px_rgba(15,23,42,.09)]">
            <Search className="h-6 w-6 text-slate-500" />
            <input
              className="flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
              placeholder={searchPlaceholder}
              type="text"
            />
            <button className="rounded-xl bg-indigo-900 px-5 py-2 text-sm font-medium text-white transition hover:scale-105">
              Search
            </button>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
        <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-slate-600">
          {projects.length} {countLabel}
        </span>
      </div>

      <div className="space-y-8">
        {projects.map((project) => (
          <ProjectCard
            actionLabel={actionLabel}
            key={project.id}
            project={project}
            showVisibility={showVisibility}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({
  actionLabel,
  project,
  showVisibility,
}: {
  actionLabel: string;
  project: Project;
  showVisibility: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_90px_rgba(15,23,42,.12)]">
      <div className="absolute left-0 top-0 h-40 w-full bg-linear-to-r from-indigo-500/5 via-violet-500/5 to-transparent" />

      <div className="relative z-10 grid gap-8 p-7 md:grid-cols-[320px_1fr]">
        <div className="relative h-60 overflow-hidden rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={project.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            src={project.coverImage}
          />
          {showVisibility && (
            <span
              className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                project.visibility === "public"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/90 text-slate-600"
              }`}
            >
              {project.visibility === "public" ? (
                <Globe size={10} />
              ) : (
                <Lock size={10} />
              )}
              {project.visibility === "public" ? "Public" : "Private"}
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-5 flex flex-wrap gap-3">
            {project.tags.map((tag, index) => (
              <span
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${
                  tagColors[index % tagColors.length]
                }`}
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>

          <h4 className="text-3xl font-semibold tracking-tight text-slate-900 transition group-hover:text-indigo-700">
            {project.title}
          </h4>

          <p className="mt-5 leading-8 text-slate-600">{project.description}</p>

          <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              {project.owner}
            </span>
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              {project.date}
            </span>
          </div>

          <div className="mt-8">
            <button className="group/link inline-flex items-center gap-3 font-medium text-indigo-700">
              {actionLabel}
              <span className="transition group-hover/link:translate-x-2">
                -&gt;
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
