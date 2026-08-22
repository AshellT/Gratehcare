import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getAppHomePath } from "@/lib/appHome";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Roles", href: "#roles" },
  { label: "Pricing", href: "#pricing" },
];

const Header: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const appHome = user ? getAppHomePath(user.role) : "/app";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_1px_0_0_rgba(15,23,42,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2 group">
          <img
            src="/logo-mark.svg"
            alt=""
            className="h-9 w-9 rounded-xl shadow-md shadow-indigo-500/20"
          />
          <span className="font-display text-xl font-bold tracking-tight text-slate-900">
            GRATEHCARE
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/app/plans"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Plan & billing
              </Link>
              <Link
                to={appHome}
                data-testid="header-cta-button"
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                Open workspace
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                data-testid="header-signin-link"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                data-testid="header-cta-button"
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                Start free trial
              </Link>
            </>
          )}
        </div>

        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-slate-200 bg-white"
        >
          <div className="px-4 py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-slate-700 py-2"
              >
                {l.label}
              </a>
            ))}
            {user ? (
              <Link
                to={appHome}
                data-testid="mobile-cta-button"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Open workspace
              </Link>
            ) : (
              <Link
                to="/register"
                data-testid="mobile-cta-button"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Start free trial
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
