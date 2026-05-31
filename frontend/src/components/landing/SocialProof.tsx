import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Loader2 } from "lucide-react";
import { publicApi, type MarketingContent } from "@/lib/api/public";

const fallbackStats = [
  { value: "2,400+", label: "Care teams" },
  { value: "4.9/5", label: "Customer rating" },
  { value: "11 days", label: "Faster claim payouts" },
  { value: "98%", label: "Roster fill rate" },
];

const SocialProof: React.FC = () => {
  const [content, setContent] = useState<MarketingContent>({
    testimonials: [],
    stats: fallbackStats,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await publicApi.getMarketing();
        if (!mounted) return;
        setContent({
          testimonials: data.testimonials ?? [],
          stats: data.stats?.length ? data.stats : fallbackStats,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section data-testid="social-proof-section" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Loved by care leaders
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Care teams sleep better with GRATEHCARE.
          </h2>
        </motion.div>

        {loading ? (
          <div className="mt-14 flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading testimonials…
          </div>
        ) : content.testimonials.length === 0 ? (
          <p className="mt-14 text-slate-500">Customer stories will appear here soon.</p>
        ) : (
          <div className="mt-14 grid lg:grid-cols-3 gap-6">
            {content.testimonials.map((t, i) => (
              <motion.figure
                key={`${t.name}-${i}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                data-testid={`testimonial-${i}`}
                className="rounded-3xl border border-slate-200 bg-white p-7 lg:p-8 shadow-sm hover:shadow-lg transition-all relative"
              >
                <Quote className="h-8 w-8 text-indigo-100 absolute top-6 right-6" />
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-slate-800 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                      {t.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 rounded-3xl border border-slate-200 bg-slate-50/60 p-8 lg:p-10"
          data-testid="stats-strip"
        >
          {content.stats.map((s) => (
            <div key={s.label} className="text-center lg:text-left">
              <div className="font-display text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
