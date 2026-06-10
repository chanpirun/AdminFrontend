"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Folders,
  PanelLeft,
  PanelRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "submissions",
    label: "Submissions",
    icon: ClipboardList,
  },
  {
    id: "repository",
    label: "Repository",
    icon: Folders,
  },
] as const;

export type AssistantSidebarItemId = (typeof navItems)[number]["id"];

type SidebarProps = {
  activeItem: AssistantSidebarItemId;
  onItemSelect: (item: AssistantSidebarItemId) => void;
};

export default function AssistantSidebar({
  activeItem,
  onItemSelect,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  return (
    <aside
      className={`
        ${collapsed ? "w-16" : "w-64"} h-full min-h-0
        bg-white border-r border-slate-200
        flex flex-col
        transition-all duration-300 ease-in-out
      `}
    >
      {/* Header */}
      <div
        className={`
          flex items-center border-b border-slate-100 px-3 py-4
          ${collapsed ? "justify-center" : "justify-between"}
        `}
      >
        {!collapsed && (
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 select-none">
            Assistant
          </p>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelRight size={17} /> : <PanelLeft size={17} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeItem === id;
          const itemClass = `
            flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            transition-all duration-200 whitespace-nowrap
            ${
              active
                ? "bg-indigo-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
            }
            ${collapsed ? "justify-center" : ""}
          `;

          return (
            <button
              key={id}
              type="button"
              title={collapsed ? label : undefined}
              className={itemClass}
              onClick={() => onItemSelect(id)}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="mt-auto px-2 py-3 border-t border-slate-200">
        <div
          className={`flex items-center bg-slate-50 ${
            collapsed ? "justify-center px-0 py-2" : "gap-3 px-2 py-2"
          }`}
          title={collapsed ? user?.name : undefined}
        >
          <div className="w-7 h-7 shrink-0 bg-black text-white flex items-center justify-center text-[10px] font-black">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name ?? "User"}</p>
              <p className="text-[10px] text-slate-500 truncate">
                Assistant
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={logout}
          className={`mt-2 w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 ${
            collapsed ? "flex items-center justify-center" : ""
          }`}
          title={collapsed ? "Log Out" : undefined}
        >
          {collapsed ? <LogOut size={16} /> : "Log Out"}
        </button>
      </div>
    </aside>
  );
}

