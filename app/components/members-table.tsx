'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, Plus, Trash2, Search, Filter, Loader2, Users, ShieldAlert, Calendar } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface MembersTableProps {
  refreshTrigger?: number;
  onAddClick?: () => void;
}

export function MembersTable({
  refreshTrigger = 0,
  onAddClick,
}: MembersTableProps) {
  const { token, clearSession } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  const API_URL = rawApiUrl.replace(/\/$/, '') + (rawApiUrl.endsWith('/api') || rawApiUrl.endsWith('/api/') ? '' : '/api');

  const fetchMembers = async () => {
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

      const filteredList = (response.data.members || []).filter(
        (u: any) => u.role !== 'director'
      );
      setMembers(filteredList);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch members';
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
    if (!token) return; // wait for AuthContext to populate the token
    fetchMembers();
  }, [refreshTrigger, token]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(
        `${API_URL}/members/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMembers(members.filter((member) => member.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        'Failed to delete member';
      setError(errorMsg);
    }
  };

  const formatDate = (dateString: string) => {
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

  // Filter members based on search and role selections
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase() === roleFilter.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  // Calculate quick stats
  const totalCount = members.length;
  const memberCount = members.filter((m) => m.role === 'member').length;
  const assistantCount = members.filter((m) => m.role === 'assistant').length;

  return (
    <div className="space-y-6">
      {/* Stats Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-50/50" />
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={22} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Recruited</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{loading ? '...' : totalCount}</p>
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
              <p className="mt-1 text-2xl font-black text-slate-900">{loading ? '...' : memberCount}</p>
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
              <p className="mt-1 text-2xl font-black text-slate-900">{loading ? '...' : assistantCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Card Header & Controls */}
        <div className="border-b border-slate-100 bg-slate-50/40 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Team Members List</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Manage and recruit members of your department</p>
            </div>
            
            <button
              type="button"
              onClick={onAddClick}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-indigo-100 active:scale-95"
            >
              <Plus size={18} />
              Recruit Member
            </button>
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
        <div className="p-6 pt-0">
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
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <Users size={24} />
              </div>
              <h4 className="mt-4 text-base font-bold text-slate-800">No members found</h4>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your search query or role filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pt-4">User</th>
                    <th className="pb-3 pt-4">Role</th>
                    <th className="pb-3 pt-4">Joined Date</th>
                    <th className="pb-3 pt-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => {
                    const isMember = member.role === 'member';
                    const isAssistant = member.role === 'assistant';
                    const isDirector = member.role === 'director';

                    let roleBadgeClass = 'bg-slate-50 text-slate-600 border-slate-100';
                    let roleDotClass = 'bg-slate-400';
                    if (isMember) {
                      roleBadgeClass = 'bg-indigo-50/60 text-indigo-700 border-indigo-100/60';
                      roleDotClass = 'bg-indigo-500';
                    } else if (isAssistant) {
                      roleBadgeClass = 'bg-sky-50/60 text-sky-700 border-sky-100/60';
                      roleDotClass = 'bg-sky-500';
                    } else if (isDirector) {
                      roleBadgeClass = 'bg-purple-50/60 text-purple-700 border-purple-100/60';
                      roleDotClass = 'bg-purple-500';
                    }

                    return (
                      <tr key={member.id} className="group hover:bg-slate-50/40 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3.5">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${getAvatarGradient(member.name)} text-sm font-bold shadow-sm`}>
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{member.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${roleBadgeClass}`}>
                            {member.role}
                          </span>
                        </td>

                        <td className="py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{formatDate(member.created_at)}</span>
                          </div>
                        </td>

                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {deleteConfirm === member.id ? (
                              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-1 border border-red-100 animate-in fade-in slide-in-from-right-2 duration-150">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(member.id)}
                                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                                >
                                  Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirm(null)}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm(member.id)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                title={`Remove ${member.name}`}
                              >
                                <Trash2 size={15} />
                              </button>
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
    </div>
  );
}
