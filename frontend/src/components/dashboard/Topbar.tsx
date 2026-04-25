import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Sparkles,
  Plus,
  Command,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, ROLE_GROUPS, type Role } from "@/lib/roles";

type Props = { onOpenMobile: () => void };

const Topbar: React.FC<Props> = ({ onOpenMobile }) => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node))
        setRoleSwitcherOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  return (
    <header
      data-testid="app-topbar"
      className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl"
    >
      <div className="h-full px-4 sm:px-6 flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg text-slate-700 hover:bg-slate-100"
          aria-label="Open menu"
          data-testid="topbar-mobile-toggle"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients, shifts, claims..."
              data-testid="topbar-search"
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-12 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition"
            />
            <span className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
              <Command className="h-2.5 w-2.5" />K
            </span>
          </div>
        </div>

        {/* Quick create */}
        <button
          className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          data-testid="topbar-create-button"
        >
          <Plus className="h-3.5 w-3.5" />
          Create
        </button>

        {/* Demo role switcher */}
        <div ref={roleRef} className="relative">
          <button
            onClick={() => setRoleSwitcherOpen((v) => !v)}
            data-testid="topbar-role-switcher"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            title="Switch role (demo)"
          >
            <Sparkles className="h-3 w-3 text-indigo-600" />
            {ROLE_LABELS[user.role]}
            <ChevronDown className="h-3 w-3" />
          </button>
          <AnimatePresence>
            {roleSwitcherOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 p-2 z-50 max-h-[480px] overflow-y-auto"
              >
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Switch role (demo)
                </div>
                {ROLE_GROUPS.map((g) => (
                  <div key={g.label} className="px-1 mb-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {g.label}
                    </div>
                    {g.roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r as Role);
                          setRoleSwitcherOpen(false);
                          navigate("/app");
                        }}
                        data-testid={`role-switch-${r}`}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors flex items-center justify-between ${
                          user.role === r ? "text-indigo-700 bg-indigo-50" : "text-slate-700"
                        }`}
                      >
                        {ROLE_LABELS[r as Role]}
                        {user.role === r && (
                          <span className="text-[10px] font-bold text-indigo-600">
                            Current
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            data-testid="topbar-notifications-button"
            className="relative inline-flex items-center justify-center h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="font-display text-sm font-bold text-slate-900">
                    Notifications
                  </div>
                  <button className="text-[11px] font-semibold text-indigo-600">
                    Mark all read
                  </button>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {[
                    {
                      title: "3 shifts at risk for tomorrow",
                      time: "5m ago",
                      tone: "amber",
                    },
                    {
                      title: "Claim CL-2189 approved · $1,420",
                      time: "1h ago",
                      tone: "emerald",
                    },
                    {
                      title: "Police check expires in 7 days for James M.",
                      time: "3h ago",
                      tone: "rose",
                    },
                    {
                      title: "Care plan updated for Eleanor R.",
                      time: "Yesterday",
                      tone: "indigo",
                    },
                  ].map((n) => (
                    <li
                      key={n.title}
                      className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                            n.tone === "amber"
                              ? "bg-amber-500"
                              : n.tone === "emerald"
                                ? "bg-emerald-500"
                                : n.tone === "rose"
                                  ? "bg-rose-500"
                                  : "bg-indigo-500"
                          }`}
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-800">
                            {n.title}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {n.time}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            data-testid="topbar-user-menu"
            className="flex items-center gap-2 rounded-full hover:bg-slate-100 pl-1 pr-2 py-1 transition-colors"
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: user.avatarColor }}
            >
              {user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-500" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="font-semibold text-sm text-slate-900">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[10px] font-bold">
                    {ROLE_LABELS[user.role]}
                  </div>
                </div>
                <div className="p-1.5">
                  <MenuItem
                    icon={<User className="h-4 w-4" />}
                    label="Profile"
                    onClick={() => navigate("/app/settings")}
                  />
                  <MenuItem
                    icon={<Settings className="h-4 w-4" />}
                    label="Settings"
                    onClick={() => navigate("/app/settings")}
                  />
                  <MenuItem
                    icon={<LogOut className="h-4 w-4" />}
                    label="Sign out"
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    danger
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}> = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
      danger
        ? "text-rose-600 hover:bg-rose-50"
        : "text-slate-700 hover:bg-slate-50"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Topbar;
