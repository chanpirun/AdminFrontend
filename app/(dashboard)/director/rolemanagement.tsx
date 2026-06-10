"use client";

import { useState } from "react";
import { ShieldCheck, User, Users } from "lucide-react";
import { users as initialUsers, type User as UserType, type UserRole } from "@/data/users";

const roleConfig: Record<
  UserRole,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  member: {
    label: "Member",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: User,
  },
  assistant: {
    label: "Assistant",
    bg: "bg-violet-100",
    text: "text-violet-700",
    icon: Users,
  },
  director: {
    label: "Director",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    icon: ShieldCheck,
  },
};

const allRoles: UserRole[] = ["member", "assistant", "director"];

function RoleBadge({ role }: { role: UserRole }) {
  const { label, bg, text } = roleConfig[role];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${text}`}
    >
      {label}
    </span>
  );
}

export default function RoleManagement() {
  const [list, setList] = useState<UserType[]>(initialUsers);
  const [pending, setPending] = useState<Record<string, UserRole>>({});

  function stagePendingRole(userId: string, role: UserRole) {
    setPending((prev) => ({ ...prev, [userId]: role }));
  }

  function commitRole(userId: string) {
    const newRole = pending[userId];
    if (!newRole) return;
    setList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
    setPending((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }

  function cancelPending(userId: string) {
    setPending((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }

  const roleCounts: Record<UserRole, number> = {
    member: list.filter((u) => u.role === "member").length,
    assistant: list.filter((u) => u.role === "assistant").length,
    director: list.filter((u) => u.role === "director").length,
  };

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
          User Role & Status
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Role Management
        </h1>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {allRoles.map((role) => {
          const { label, bg, text, icon: Icon } = roleConfig[role];
          return (
            <div
              key={role}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className={`inline-flex rounded-lg p-2 ${bg}`}>
                <Icon size={18} className={text} />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-950">
                {roleCounts[role]}
              </p>
              <p className="text-sm text-slate-500">{label}s</p>
            </div>
          );
        })}
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 w-8">#</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3 hidden md:table-cell">Email</th>
              <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3">Current Role</th>
              <th className="px-4 py-3">Assign Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((user, index) => {
              const stagedRole = pending[user.id];
              const displayRole = stagedRole ?? user.role;
              const isDirty = !!stagedRole && stagedRole !== user.role;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-indigo-50/40 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 shrink-0 bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-black rounded-sm">
                        {user.initials}
                      </div>
                      <p className="font-semibold text-slate-900">
                        {user.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-500">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-500 whitespace-nowrap">
                    {user.joinedDate}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Role picker */}
                      <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        {allRoles.map((role) => {
                          const active = displayRole === role;
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => stagePendingRole(user.id, role)}
                              className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                active
                                  ? "bg-indigo-900 text-white"
                                  : "bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                              }`}
                            >
                              {roleConfig[role].label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Save / Cancel only when changed */}
                      {isDirty && (
                        <>
                          <button
                            onClick={() => commitRole(user.id)}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => cancelPending(user.id)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
