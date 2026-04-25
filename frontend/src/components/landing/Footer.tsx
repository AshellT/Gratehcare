import React from "react";
import { Sparkles, Twitter, Linkedin, Github } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      "Scheduling",
      "Billing & Claims",
      "Compliance",
      "Care Management",
      "AI Insights",
      "Family portal",
    ],
  },
  {
    title: "Solutions",
    links: [
      "Home care",
      "Disability support",
      "Aged care",
      "Allied health",
      "Multi-site providers",
    ],
  },
  {
    title: "Resources",
    links: [
      "Blog",
      "Customer stories",
      "Help centre",
      "API docs",
      "Status",
      "Changelog",
    ],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact", "Partners"],
  },
];

const Footer: React.FC = () => {
  return (
    <footer
      data-testid="site-footer"
      className="bg-slate-50 border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <a href="#" className="flex items-center gap-2">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-slate-900">
                Lumina
              </span>
            </a>
            <p className="mt-4 text-sm text-slate-600 max-w-sm leading-relaxed">
              The all-in-one care management platform for modern providers.
              Smarter scheduling, faster billing, calmer compliance.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Twitter"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                data-testid="footer-twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                data-testid="footer-linkedin"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                data-testid="footer-github"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {columns.map((c) => (
              <div key={c.title}>
                <div className="font-display text-sm font-bold text-slate-900">
                  {c.title}
                </div>
                <ul className="mt-4 space-y-3">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} Lumina Care, Inc. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Security
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              HIPAA
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
