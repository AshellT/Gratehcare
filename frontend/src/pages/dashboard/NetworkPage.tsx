import React, { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import { tenantsApi } from "@/lib/api/tenants";

type RegionData = {
  region: string;
  tenants: number;
  users: number;
  growth: string;
  tone: string;
};

const NetworkPage: React.FC = () => {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTenants, setTotalTenants] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await tenantsApi.list();
        console.log('NetworkPage - API response:', res);
        if (!mounted) return;

        if (res.data && res.data.length > 0) {
          // Group tenants by region
          const regionMap = new Map<string, number>();
          res.data.forEach((tenant: any) => {
            const region = tenant.region || "Unknown";
            regionMap.set(region, (regionMap.get(region) || 0) + 1);
          });

          // Convert to array and sort by tenant count
          const regionData: RegionData[] = Array.from(regionMap.entries())
            .map(([region, count], index) => ({
              region,
              tenants: count,
              users: 0, // Would need user count API
              growth: "+0%",
              tone: ["indigo", "sky", "emerald", "amber", "rose"][index % 5],
            }))
            .sort((a, b) => b.tenants - a.tenants);

          console.log('NetworkPage - Regions grouped:', regionData);
          setRegions(regionData);
          setTotalTenants(res.data.length);
        } else {
          console.log('NetworkPage - No tenant data received');
          setRegions([]);
          setTotalTenants(0);
        }
      } catch (error) {
        console.error("NetworkPage - Failed to load network data:", error);
        setRegions([]);
        setTotalTenants(0);
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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform"
        title="Network"
        description="Where GRATEHCARE is delivering care today."
      />

      <Card>
        {loading ? (
          <div className="text-center py-12 text-sm text-slate-500">
            Loading network data...
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Stylised globe */}
            <div className="relative h-72 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-56 w-56 rounded-full border border-white/20">
                  <div className="absolute inset-4 rounded-full border border-white/10" />
                  <div className="absolute inset-10 rounded-full border border-white/10" />
                  {regions.slice(0, 5).map((r, i) => {
                    const positions = [
                      { x: 75, y: 30 },
                      { x: 70, y: 28 },
                      { x: 30, y: 30 },
                      { x: 25, y: 38 },
                      { x: 22, y: 30 },
                    ];
                    const pos = positions[i] || { x: 50, y: 50 };
                    return (
                      <div
                        key={r.region}
                        className="absolute h-3 w-3 rounded-full bg-indigo-400 ring-4 ring-indigo-400/30 animate-pulse"
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                  GRATEHCARE network
                </div>
                <div className="font-display text-2xl font-bold">
                  {totalTenants} {totalTenants === 1 ? "tenant" : "tenants"}
                </div>
                <div className="text-xs text-slate-300">
                  across {regions.length} {regions.length === 1 ? "region" : "regions"}
                </div>
              </div>
            </div>

            <div>
              {regions.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-500">
                  No regional data available
                </div>
              ) : (
                <ul className="space-y-3">
                  {regions.map((r) => (
                    <li
                      key={r.region}
                      className="rounded-xl border border-slate-200 p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{r.region}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {r.tenants} {r.tenants === 1 ? "tenant" : "tenants"}
                          {r.users > 0 && ` · ${r.users.toLocaleString()} users`}
                        </div>
                      </div>
                      {r.growth !== "+0%" && (
                        <div
                          className={`text-xs font-bold ${
                            r.tone === "indigo"
                              ? "text-indigo-700"
                              : r.tone === "sky"
                                ? "text-sky-700"
                                : r.tone === "emerald"
                                  ? "text-emerald-700"
                                  : r.tone === "amber"
                                    ? "text-amber-700"
                                    : "text-rose-700"
                          }`}
                        >
                          {r.growth}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NetworkPage;
