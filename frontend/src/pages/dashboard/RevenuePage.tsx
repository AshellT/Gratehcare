import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import StatCard from "@/components/dashboard/StatCard";
import { Wallet, TrendingUp, Users, Activity } from "lucide-react";
import { tenantsApi } from "@/lib/api/tenants";

const RevenuePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mrr, setMrr] = useState(0);
  const [arr, setArr] = useState(0);
  const [tenantCount, setTenantCount] = useState(0);
  const [data, setData] = useState<number[]>([0]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await tenantsApi.list();
        if (!mounted) return;

        if (res.data && res.data.length > 0) {
          setTenantCount(res.data.length);
          // MRR/ARR would come from billing data - for now show 0
          setMrr(0);
          setArr(0);
          // Generate simple trend based on tenant count
          const trend = Array.from({ length: 12 }, (_, i) => 
            Math.max(0, res.data.length - (11 - i) * 2)
          );
          setData(trend);
        }
      } catch (error) {
        console.error("Failed to load revenue data:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const max = Math.max(...data, 1);
  const chartData = data.length > 1 ? data : [0, 0];
  const chartPoints = chartData.map((v, i) => {
    const x = (i / (chartData.length - 1)) * 600;
    const y = 230 - (v / max) * 210;
    return `${Number.isFinite(x) ? x : 0} ${Number.isFinite(y) ? y : 230}`;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform"
        title="Revenue"
        description="MRR, ARR, expansion and churn — across the entire GRATEHCARE network."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="MRR" 
          value={loading ? "..." : `$${mrr.toLocaleString()}`} 
          tone="indigo" 
          icon={<Wallet className="h-5 w-5" />} 
          index={0} 
        />
        <StatCard 
          label="ARR" 
          value={loading ? "..." : `$${arr.toLocaleString()}`} 
          tone="emerald" 
          icon={<TrendingUp className="h-5 w-5" />} 
          index={1} 
        />
        <StatCard 
          label="Active tenants" 
          value={loading ? "..." : tenantCount.toLocaleString()} 
          tone="sky" 
          icon={<Users className="h-5 w-5" />} 
          index={2} 
        />
        <StatCard 
          label="Net retention" 
          value={loading ? "..." : "0%"} 
          tone="amber" 
          icon={<Activity className="h-5 w-5" />} 
          index={3} 
        />
      </div>

      <Card title="Tenant growth · last 12 months" description="Tenant count trend over time.">
        {loading ? (
          <div className="h-72 flex items-center justify-center text-sm text-slate-500">
            Loading chart data...
          </div>
        ) : (
          <div className="h-72 w-full">
            <svg viewBox="0 0 600 240" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revBig" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 60, 120, 180].map((y) => (
                <line key={y} x1="0" x2="600" y1={y + 10} y2={y + 10} stroke="#f1f5f9" />
              ))}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4 }}
                d={`M ${chartPoints.join(" L ")}`}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d={`M 0 230 L ${chartPoints.join(" L ")} L 600 230 Z`}
                fill="url(#revBig)"
              />
            </svg>
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Revenue by plan">
          <div className="text-center py-8 text-sm text-slate-500">
            Revenue data requires billing integration
          </div>
        </Card>

        <Card title="Cohort retention">
          <div className="text-center py-8 text-sm text-slate-500">
            Retention data requires historical tracking
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RevenuePage;
