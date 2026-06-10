'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { CircleUserRound, Mail, Lock, EyeOff, UserPlus2, X, CheckCircle2 } from 'lucide-react';

interface RecruitMemberFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function RecruitMemberForm({
  onSuccess,
  onError,
  onCancel,
}: RecruitMemberFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:8000/api';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/members`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage(response.data.message);
      setFormData({ name: '', email: '', password: '' });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        'Failed to recruit member';
      setError(errorMsg);

      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-7">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UserPlus2 size={24} />
          </div>
          <div>
            <h3 className="text-[2rem] font-semibold leading-none text-slate-900">Add New Member</h3>
            <p className="mt-2 text-sm text-slate-500">Enter the details of the new team member.</p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close recruit form"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Full Name
          </label>
          <div className="relative">
            <CircleUserRound
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <EyeOff
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password (min 8 characters)"
            />
          </div>
        </div>

        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={18} />
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </div>
  );
}
