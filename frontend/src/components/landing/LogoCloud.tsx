import React from "react";
import { motion } from "framer-motion";

const logos = [
  "MERIDIAN HEALTH",
  "NORTHWIND CARE",
  "AURORA HOMES",
  "BRIGHTPATH",
  "CARETIDE",
  "HAVENWELL",
];

const LogoCloud: React.FC = () => {
  return (
    <section
      data-testid="logo-cloud"
      className="border-y border-slate-200 bg-slate-50/60 py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"
        >
          Trusted by 2,400+ care teams across 12 countries
        </motion.p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-6 items-center">
          {logos.map((logo, i) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center font-display text-sm font-bold tracking-[0.18em] text-slate-400"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCloud;
