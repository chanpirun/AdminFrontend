'use client';

import { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Clock, Globe, Lock, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AssistantSidebar, { type AssistantSidebarItemId } from '@/components/assistant-sidebar';
import DirectorSidebar, { type DirectorSidebarItemId } from '@/components/director-sidebar';
import AssistantSubmissions from '@/(dashboard)/assistant/submissions';
import AssistantAllProject from '@/(dashboard)/assistant/allproject';
import DirectorSubmissions from '@/(dashboard)/director/submissions';
import DirectorAllProject from '@/(dashboard)/director/allproject';
import RoleManagement from '@/(dashboard)/director/rolemanagement';
import { RecruitMemberForm } from '@/components/recruit-member-form';
import { MembersTable } from '@/components/members-table';
import { users } from '@/data/users';
import { fetchProjectsFromApi, getAuthToken } from '@/lib/submissions';
import type { Project } from '@/data/projects';

function AssistantDashboard({ projects }: { projects: Project[] }) {
  const total = projects.length;
  const pending = projects.filter((p) => p.status === 'pending').length;
  const approved = projects.filter((p) => p.status === 'approved').length;
  const rejected = projects.filter((p) => p.status === 'rejected').length;

  return (
    <section className="w-full">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Overview</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <BarChart3 className="text-indigo-900" size={22} />
          <p className="mt-4 text-2xl font-bold text-slate-950">{total}</p>
          <p className="text-sm text-slate-500">Total submissions</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Clock className="text-amber-500" size={22} />
          <p className="mt-4 text-2xl font-bold text-slate-950">{pending}</p>
          <p className="text-sm text-slate-500">Pending review</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <CheckCircle2 className="text-emerald-600" size={22} />
          <p className="mt-4 text-2xl font-bold text-slate-950">{approved}</p>
          <p className="text-sm text-slate-500">Approved</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <XCircle className="text-red-500" size={22} />
          <p className="mt-4 text-2xl font-bold text-slate-950">{rejected}</p>
          <p className="text-sm text-slate-500">Rejected</p>
        </div>
      </div>
    </section>
  );
}

function DirectorDashboard({ projects }: { projects: Project[] }) {
  const totalProjects = projects.length;
  const published = projects.filter((p) => p.visibility === 'public').length;
  const privateCount = projects.filter((p) => p.visibility === 'private').length;
  const totalUsers = users.length;

  return (
    <section className="w-full">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <BarChart3 className="text-indigo-900" size={22} />
          <p className="mt-4 text-2xl font-bold text-slate-950">{totalProjects}</p>
          <p className="text-sm text-slate-500">Total projects</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Globe className="text-indigo-600" size={22} />
          <p className="mt-4 text-2xl font-bold text-slate-950">{published}</p>
          <p className="text-sm text-slate-500">Published</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Lock className="text-slate-500" size={22} />
          <p className="mt-4 text-2xl font-bold text-slate-950">{privateCount}</p>
          <p className="text-sm text-slate-500">Private</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ShieldCheck className="text-violet-600" size={22} />
          <p className="mt-4 text-2xl font-bold text-slate-950">{totalUsers}</p>
          <p className="text-sm text-slate-500">Total users</p>
        </div>
      </div>
    </section>
  );
}

function RecruitmentContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showRecruitForm, setShowRecruitForm] = useState(false);

  const handleRecruitSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setShowRecruitForm(false);
  };

  return (
    <section className="w-full">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">Team Management</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Recruit Members</h1>
        <p className="mt-2 text-slate-600">Add new team members to your organization</p>
      </div>

      <div className="space-y-5">
        <MembersTable
          refreshTrigger={refreshTrigger}
          onAddClick={() => setShowRecruitForm((prev) => !prev)}
        />
      </div>

      {showRecruitForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onClick={() => setShowRecruitForm(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_28px_70px_-28px_rgba(15,23,42,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <RecruitMemberForm
              onSuccess={handleRecruitSuccess}
              onCancel={() => setShowRecruitForm(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [assistantActiveItem, setAssistantActiveItem] = useState<AssistantSidebarItemId>('dashboard');
  const [directorActiveItem, setDirectorActiveItem] = useState<DirectorSidebarItemId>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function load() {
      const token = getAuthToken();
      if (!token) return;

      try {
        const rows = await fetchProjectsFromApi(token);
        setProjects(rows);
      } catch {
        // Keep dashboard render stable even if API is temporarily unavailable.
      }
    }

    load();
  }, []);

  const content = user?.role === 'director'
    ? (
      <>
        {directorActiveItem === 'dashboard' && <DirectorDashboard projects={projects} />}
        {directorActiveItem === 'submissions' && <DirectorSubmissions />}
        {directorActiveItem === 'repository' && <DirectorAllProject />}
        {directorActiveItem === 'recruit' && <RecruitmentContent />}
        {directorActiveItem === 'roles' && <RoleManagement />}
      </>
    )
    : (
      <>
        {assistantActiveItem === 'dashboard' && <AssistantDashboard projects={projects} />}
        {assistantActiveItem === 'submissions' && <AssistantSubmissions />}
        {assistantActiveItem === 'repository' && <AssistantAllProject />}
      </>
    );

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-slate-100">
      {user?.role === 'director' ? (
        <DirectorSidebar activeItem={directorActiveItem} onItemSelect={setDirectorActiveItem} />
      ) : (
        <AssistantSidebar activeItem={assistantActiveItem} onItemSelect={setAssistantActiveItem} />
      )}

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="w-full h-full">
          <div className="min-h-full rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6 md:p-8">{content}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['assistant', 'director']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}



