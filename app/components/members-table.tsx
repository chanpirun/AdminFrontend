'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

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
  const { token } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:8000/api';

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

      setMembers(response.data.members);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        'Failed to fetch members';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    return date.toLocaleDateString();
  };

  if (loading && members.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center py-8">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-3xl font-semibold text-slate-900">
            Recruited Members ({members.length})
          </h3>
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500 text-blue-600 transition hover:bg-blue-50"
            aria-label="Open recruit member form"
          >
            <Plus size={22} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {members.length === 0 ? (
          <p className="py-8 text-center text-gray-600">
            No members recruited yet
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="hidden grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 md:grid">
              <p className="col-span-3">Name</p>
              <p className="col-span-3">Email</p>
              <p className="col-span-2">Role</p>
              <p className="col-span-2">Date</p>
              <p className="col-span-2 text-right">Actions</p>
            </div>

            <div>
              {members.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-1 gap-3 border-b border-slate-200 px-4 py-4 transition last:border-b-0 hover:bg-slate-50 md:grid-cols-12 md:items-center"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-semibold text-slate-900">{member.name}</p>
                  </div>

                  <p className="col-span-3 text-slate-600">{member.email}</p>

                  <div className="col-span-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {member.role}
                    </span>
                  </div>

                  <p className="col-span-2 text-slate-600">{formatDate(member.created_at)}</p>

                  <div className="col-span-2 flex items-center justify-end gap-3">
                    {deleteConfirm === member.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setDeleteConfirm(member.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-300 text-red-500 transition hover:bg-red-50"
                          aria-label={`Remove ${member.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                          aria-label="Expand member row"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
