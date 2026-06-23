"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, User, Users, Search, ChevronDown, Check, X, Calendar, Filter, Loader2, ShieldAlert } from "lucide-react";
import { type UserRole } from "@/data/users";

const roleConfig: Record<
  UserRole,
  { label: string; bg: string; text: string; dot: string; bgGradient: string; icon: React.ElementType }
> = {
  member: {
    label: "Member",
    bg: "bg-indigo-50/60 text-indigo-700 border-indigo-100/60",
    dot: "bg-indigo-500",
    bgGradient: "from-indigo-500 to-purple-500",
    text: "text-indigo-700",
    icon: User,
  },
  assistant: {
    label: "Assistant",
    bg: "bg-sky-50/60 text-sky-700 border-sky-100/60",
    dot: "bg-sky-500",
    bgGradient: "from-blue-500 to-cyan-500",
    text: "text-sky-700",
    icon: Users,
  },
  director: {
    label: "Director",
    bg: "bg-purple-50/60 text-purple-700 border-purple-100/60",
    dot: "bg-purple-500",
    bgGradient: "from-pink-500 to-rose-500",
    text: "text-purple-700",
    icon: ShieldCheck,
  },
};

const allRoles: UserRole[] = ["member", "assistant"];

function RoleBadge({ role }: { role: UserRole }) {
  const { label, bg } = roleConfig[role];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${bg}`}
    >
      {label}
    </span>
  );
}

export default function RoleManagement() {
  const { token, clearSession } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Record<string, UserRole>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:8000/api';

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `${API_URL}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // Filter out directors
      const filtered = (response.data.members || []).filter(
        (u: any) => u.role !== 'director'
      );
      setList(filtered);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch users';
      if (errorMsg.toLowerCase().includes('unauthenticated') || errorMsg.toLowerCase().includes('unauthorized')) {
        clearSession();
        return;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  function stagePendingRole(userId: string, role: UserRole) {
    setPending((prev) => ({ ...prev, [userId]: role }));
  }

  const commitRole = async (userId: string) => {
    const newRole = pending[userId];
    if (!newRole) return;
    
    setError('');
    try {
      await axios.put(
        `${API_URL}/members/${userId}`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Update local state
      setList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      
      // Clear pending
      setPending((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  function cancelPending(userId: string) {
    setPending((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }

  // Calculate dynamic stats
  const roleCounts: Record<UserRole, number> = {
    member: list.filter((u) => u.role === "member").length,
    assistant: list.filter((u) => u.role === "assistant").length,
    director: list.filter((u) => u.role === "director").length,
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Avatar gradient generator
  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-blue-500 to-cyan-500',
    ];
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = charCodeSum % gradients.length;
    return gradients[index];
  };

  // Filter list by search query and role filter
  const filteredUsers = list.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <section className="w-full space-y-6">
      {/* Header aligned with Recruit Members */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
          User Role & Status
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Role Management
        </h1>
        <p className="mt-2 text-slate-600">Assign roles and permissions to users in your organization</p>
      </div>

      {/* Summary cards aligned with Recruit Members */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-50/50" />
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <User size={22} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{loading ? '...' : list.length}</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-50/50" />
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users size={22} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Members / Researchers</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{loading ? '...' : roleCounts.member}</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sky-50/50" />
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Users size={22} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Assistants</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{loading ? '...' : roleCounts.assistant}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card aligned with Recruit Members */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Card Header & Controls */}
        <div className="border-b border-slate-100 bg-slate-50/40 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">User Privileges List</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Configure individual roles and stage changes before saving</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50"
              />
            </div>

            <div className="relative min-w-[150px]">
              <Filter
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50"
              >
                <option value="all">All Roles</option>
                <option value="member">Members</option>
                <option value="assistant">Assistants</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm text-red-700">
            <ShieldAlert size={18} className="shrink-0 text-red-500" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {loading ? (
            /* Skeleton Loading rows */
            <div className="divide-y divide-slate-100">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex animate-pulse items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-slate-100" />
                      <div className="h-3 w-48 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="h-6 w-20 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <Users size={24} />
              </div>
              <h4 className="mt-4 text-base font-bold text-slate-800">No users found</h4>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your search query or role filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 w-10">#</th>
                    <th className="pb-3">User</th>
                    <th className="pb-3 hidden md:table-cell">Email</th>
                    <th className="pb-3 hidden lg:table-cell">Joined</th>
                    <th className="pb-3">Current Role</th>
                    <th className="pb-3 text-right">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user, index) => {
                    const stagedRole = pending[user.id];
                    const displayRole = stagedRole ?? user.role;
                    const isDirty = !!stagedRole && stagedRole !== user.role;

                    return (
                      <tr
                        key={user.id}
                        className="group hover:bg-slate-50/40 transition-colors"
                      >
                        <td className="py-4 text-slate-400 font-mono text-xs">
                          {index + 1}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3.5">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${getAvatarGradient(user.name)} text-sm font-bold shadow-sm`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 md:hidden truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 hidden md:table-cell text-slate-500">
                          {user.email}
                        </td>
                        <td className="py-4 hidden lg:table-cell text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{formatDate(user.created_at)}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-3 flex-wrap">
                            {/* Dropdown Role Picker */}
                            <div className="relative">
                              <select
                                value={displayRole}
                                onChange={(e) => stagePendingRole(user.id, e.target.value as UserRole)}
                                className={`appearance-none rounded-xl border py-2 pl-4 pr-9 text-sm font-semibold outline-none transition focus:ring-2 cursor-pointer ${
                                  isDirty
                                    ? "border-amber-300 bg-amber-50 text-amber-800 focus:ring-amber-100"
                                    : displayRole === "member"
                                    ? "border-indigo-200 bg-indigo-50 text-indigo-700 focus:ring-indigo-100"
                                    : "border-sky-200 bg-sky-50 text-sky-700 focus:ring-sky-100"
                                }`}
                              >
                                {allRoles.map((role) => (
                                  <option key={role} value={role}>
                                    {roleConfig[role].label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                size={14}
                                className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
                                  isDirty ? "text-amber-600" : displayRole === "member" ? "text-indigo-400" : "text-sky-400"
                                }`}
                              />
                            </div>

                            {/* Save / Cancel controls */}
                            {isDirty && (
                              <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 p-1 border border-amber-100 animate-in fade-in slide-in-from-right-2 duration-150">
                                <button
                                  type="button"
                                  onClick={() => commitRole(user.id)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                                  title="Save Role Change"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => cancelPending(user.id)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
                                  title="Cancel Change"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
