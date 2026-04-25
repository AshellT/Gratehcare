import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ChevronsLeft, LogOut } from "lucide-react";
import { NAV_BY_ROLE } from "@/lib/nav";
import { ROLE_LABELS } from "@/lib/roles";
import { useAuth } from "@/context/AuthContext";

type Props = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const Sidebar: React.FC<Props> = ({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [hovering, setHovering] = useState(false);
  const sections = user ? NAV_BY_ROLE[user.role] : [];

  // When collapsed but hovering, expand visually
  const visuallyCollapsed = collapsed && !hovering;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        data-testid="sidebar"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen flex-shrink-0 border-r border-slate-200 bg-white transition-all duration-300 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${visuallyCollapsed ? "lg:w-[76px]" : "lg:w-[260px]"} w-[260px]`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
            <NavLink to="/app" className="flex items-center gap-2">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
                <Sparkles className="h-5 w-5" strokeWidth={2.2} />
              </span>
              {!visuallyCollapsed && (
                <span className="font-display text-lg font-bold tracking-tight text-slate-900">
                  Lumina
                </span>
              )}
            </NavLink>
            <button
              onClick={onToggleCollapsed}
              className="hidden lg:inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Toggle sidebar"
              data-testid="sidebar-collapse-toggle"
            >
              <ChevronsLeft
                className={`h-4 w-4 transition-transform ${
                  visuallyCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Org switcher */}
          {!visuallyCollapsed && user && (
            <div className="px-4 py-4 border-b border-slate-100">
              <button
                className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 hover:bg-slate-100 transition-colors text-left"
                data-testid="org-switcher"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.organization
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {user.organization}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {ROLE_LABELS[user.role]}
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {sections.map((section) => (
              <div key={section.label}>
                {!visuallyCollapsed && (
                  <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {section.label}
                  </div>
                )}
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      location.pathname === item.to ||
                      (item.to !== "/app" && location.pathname.startsWith(item.to));
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.to === "/app"}
                          onClick={onCloseMobile}
                          data-testid={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                          className={`relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors ${
                            active
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="sidebar-active"
                              className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-indigo-600"
                            />
                          )}
                          <Icon className="h-4.5 w-4.5 h-[18px] w-[18px] flex-shrink-0" />
                          {!visuallyCollapsed && <span className="truncate">{item.label}</span>}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* User footer */}
          {user && (
            <div className="border-t border-slate-100 p-3">
              <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: user.avatarColor }}
                >
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                {!visuallyCollapsed && (
                  <>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {user.email}
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Sign out"
                      data-testid="sidebar-logout-button"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
