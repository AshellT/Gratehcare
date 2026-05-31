import { useAuth } from "@/context/AuthContext";
import {
  useNotifications,
  type NotificationSeverity,
} from "@/hooks/useNotifications";
import { canAccessPath } from "@/lib/permissions";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  Command,
  LogOut,
  Menu,
  RotateCcw,
  Search,
  Settings,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = { onOpenMobile: () => void };

const SEVERITY_DOT: Record<NotificationSeverity, string> = {
  critical: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-indigo-500",
  success: "bg-emerald-500",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

const Topbar: React.FC<Props> = ({ onOpenMobile }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, connected, markAllRead, markRead } =
    useNotifications();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K focuses search bar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const resetDemo = () => {
    // Clear all demo-related localStorage keys and reload
    Object.keys(localStorage)
      .filter(
        (k) =>
          k.startsWith("gratehcare.") ||
          k.startsWith("gratehcare_") ||
          k.startsWith("lumina_"),
      )
      .forEach((k) => localStorage.removeItem(k));
    setMenuOpen(false);
    window.location.href = "/app";
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      )
        setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  const go = (path: string) => {
    if (canAccessPath(user.role, path)) navigate(path);
  };

  const runSearch = () => {
    const q = search.trim().toLowerCase();
    if (!q) return;
    if (q.includes("claim")) go("/app/claim-tracking");
    else if (q.includes("invoice") || q.includes("billing")) go("/app/invoices");
    else if (q.includes("client") || q.includes("patient")) go("/app/clients");
    else if (q.includes("open shift")) go("/app/open-shifts");
    else if (q.includes("conflict")) go("/app/shift-conflicts");
    else if (q.includes("shift") || q.includes("schedule") || q.includes("roster"))
      go("/app/rostering");
    else if (q.includes("note")) go("/app/care-notes");
    else if (q.includes("risk")) go("/app/risk-alerts");
    else if (q.includes("credential")) go("/app/staff-credentials");
    else if (q.includes("training")) go("/app/training-records");
    else if (q.includes("expiry")) go("/app/expiry-tracking");
    else if (q.includes("audit")) go("/app/audit-logs");
    else if (q.includes("policy")) go("/app/policy-tracking");
    else if (q.includes("corrective")) go("/app/corrective-actions");
    else if (q.includes("alert")) go("/app/risk-alerts");
    else if (q.includes("family")) go("/app/family-overview");
    else if (q.includes("clinical")) go("/app/practitioner-clinical-notes");
    else if (q.includes("evaluation")) go("/app/practitioner-evaluations");
    else if (q.includes("ticket")) go("/app/tickets");
    else if (q.includes("user")) go("/app/users");
    else if (canAccessPath(user.role, "/app/live-activity")) go("/app/live-activity");
    else if (canAccessPath(user.role, "/app/activity")) go("/app/activity");
  };

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

        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search"
              onKeyDown={(event) => {
                if (event.key === "Enter") runSearch();
              }}
              placeholder="Search clients, shifts, claims..."
              data-testid="topbar-search"
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-12 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition"
            />
            <button
              onClick={runSearch}
              className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-50"
            >
              <Command className="h-2.5 w-2.5" />K
            </button>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            data-testid="topbar-notifications-button"
            className="relative inline-flex items-center justify-center h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 ring-2 ring-white text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 mt-2 w-96 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-slate-900">
                      Notifications
                    </span>
                    {connected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <Wifi className="h-3 w-3" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <WifiOff className="h-3 w-3" /> Offline
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <ul className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 && (
                    <li className="px-4 py-8 text-center text-xs font-medium text-slate-500">
                      All caught up – no notifications.
                    </li>
                  )}
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        setNotifOpen(false);
                      }}
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? "bg-indigo-50/40" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[n.severity]}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs leading-snug ${!n.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}
                          >
                            {n.title}
                          </div>
                          {n.body && (
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {n.body}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {timeAgo(n.createdAt)}
                          </div>
                        </div>
                        {!n.read && (
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
                  <div className="text-xs text-slate-500 truncate">
                    {user.email}
                  </div>
                </div>
                <div className="p-1.5">
                  <MenuItem
                    icon={<User className="h-4 w-4" />}
                    label="Profile"
                    onClick={() => navigate("/app/profile")}
                  />
                  <MenuItem
                    icon={<Settings className="h-4 w-4" />}
                    label="Settings"
                    onClick={() => navigate("/app/settings")}
                  />
                  <MenuItem
                    icon={<RotateCcw className="h-4 w-4" />}
                    label="Reset demo data"
                    onClick={resetDemo}
                  />
                  <div className="my-1 h-px bg-slate-100" />
                  <MenuItem
                    icon={<LogOut className="h-4 w-4" />}
                    label="Sign out"
                    onClick={async () => {
                      await logout();
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
