import React, { useEffect, useState } from "react";
import { Check, X, Settings, ExternalLink, Activity, AlertCircle, Loader2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import Modal from "@/components/dashboard/Modal";
import FormField from "@/components/dashboard/FormField";
import { integrationsApi } from "@/lib/api/integrations";
import { useToast } from "@/context/ToastContext";
import type { Integration } from "@/lib/api/types";

type IntegrationCard = {
  id: string;
  name: string;
  description: string;
  category: "payment" | "compliance" | "auth" | "analytics" | "communication";
  icon: string;
  enabled: boolean;
  configured: boolean;
  status: "active" | "error" | "disabled";
};

const INTEGRATION_CATALOG: Omit<IntegrationCard, "id" | "enabled" | "configured" | "status">[] = [
  {
    name: "Stripe",
    description: "Payment processing and subscription management",
    category: "payment",
    icon: "💳",
  },
  {
    name: "NDIS",
    description: "National Disability Insurance Scheme integration",
    category: "compliance",
    icon: "🏥",
  },
  {
    name: "Xero",
    description: "Accounting and financial management",
    category: "payment",
    icon: "📊",
  },
  {
    name: "Auth0",
    description: "Single sign-on and identity management",
    category: "auth",
    icon: "🔐",
  },
  {
    name: "Twilio",
    description: "SMS and communication services",
    category: "communication",
    icon: "📱",
  },
  {
    name: "Segment",
    description: "Customer data platform and analytics",
    category: "analytics",
    icon: "📈",
  },
  {
    name: "Slack",
    description: "Team notifications and alerts",
    category: "communication",
    icon: "💬",
  },
  {
    name: "Intercom",
    description: "Customer support and messaging",
    category: "communication",
    icon: "💭",
  },
];

const IntegrationsPage: React.FC = () => {
  const toast = useToast();
  const [integrations, setIntegrations] = useState<IntegrationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationCard | null>(null);
  const [configModal, setConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const response = await integrationsApi.list();
      const backendIntegrations = response.data || [];
      
      const merged = INTEGRATION_CATALOG.map((catalog) => {
        const existing = backendIntegrations.find(
          (b: Integration) => b.name.toLowerCase() === catalog.name.toLowerCase()
        );
        return {
          id: existing?.id || `catalog-${catalog.name}`,
          ...catalog,
          enabled: existing?.enabled || false,
          configured: existing?.config ? Object.keys(existing.config as object).length > 0 : false,
          status: existing?.enabled ? (existing?.status || "active") : "disabled",
        } as IntegrationCard;
      });
      
      setIntegrations(merged);
    } catch (error) {
      console.error("Failed to load integrations:", error);
      const fallback = INTEGRATION_CATALOG.map((catalog, index) => ({
        id: `fallback-${index}`,
        ...catalog,
        enabled: false,
        configured: false,
        status: "disabled" as const,
      }));
      setIntegrations(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (integration: IntegrationCard) => {
    if (!integration.enabled && !integration.configured) {
      setSelectedIntegration(integration);
      setConfigModal(true);
      return;
    }

    setSaving(true);
    try {
      if (integration.enabled) {
        await integrationsApi.disable(integration.id);
        toast.success("Integration disabled", `${integration.name} has been disabled.`);
      } else {
        await integrationsApi.enable(integration.id);
        toast.success("Integration enabled", `${integration.name} is now active.`);
      }
      await loadIntegrations();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update integration";
      toast.error("Update failed", message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfigure = (integration: IntegrationCard) => {
    setSelectedIntegration(integration);
    setConfigForm({
      apiKey: "",
      apiSecret: "",
      webhookUrl: "",
    });
    setConfigModal(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration) return;

    setSaving(true);
    try {
      if (selectedIntegration.id.startsWith("catalog-") || selectedIntegration.id.startsWith("fallback-")) {
        const created = await integrationsApi.create({
          name: selectedIntegration.name,
          type: selectedIntegration.category,
          enabled: true,
          config: configForm,
        });
        toast.success("Integration configured", `${selectedIntegration.name} is now active.`);
      } else {
        await integrationsApi.updateConfig(selectedIntegration.id, configForm);
        toast.success("Configuration updated", `${selectedIntegration.name} settings saved.`);
      }
      setConfigModal(false);
      setSelectedIntegration(null);
      await loadIntegrations();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save configuration";
      toast.error("Configuration failed", message);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "payment": return "emerald";
      case "compliance": return "indigo";
      case "auth": return "violet";
      case "analytics": return "sky";
      case "communication": return "amber";
      default: return "slate";
    }
  };

  const activeCount = integrations.filter((i) => i.enabled).length;
  const errorCount = integrations.filter((i) => i.status === "error").length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform"
        title="Integrations"
        description="Connect GRATEHCARE with your essential tools and services."
      />

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Check className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{activeCount}</div>
              <div className="text-xs text-slate-500">Active integrations</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <Activity className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{integrations.length}</div>
              <div className="text-xs text-slate-500">Available integrations</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{errorCount}</div>
              <div className="text-xs text-slate-500">Errors detected</div>
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading integrations...</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{integration.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{integration.description}</p>
                  </div>
                </div>
                <Badge tone={getCategoryColor(integration.category)}>
                  {integration.category}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {integration.enabled ? (
                    <Badge tone="emerald" dot>Active</Badge>
                  ) : (
                    <Badge tone="slate" dot>Disabled</Badge>
                  )}
                  {integration.status === "error" && (
                    <Badge tone="rose" dot>Error</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {integration.configured && (
                    <button
                      type="button"
                      onClick={() => handleConfigure(integration)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Configure
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggle(integration)}
                    disabled={saving}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      integration.enabled
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    } disabled:opacity-60`}
                  >
                    {integration.enabled ? (
                      <>
                        <X className="h-3.5 w-3.5" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Enable
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={configModal}
        onClose={() => {
          setConfigModal(false);
          setSelectedIntegration(null);
        }}
        title={`Configure ${selectedIntegration?.name || "Integration"}`}
        description="Enter your API credentials and configuration details."
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setConfigModal(false);
                setSelectedIntegration(null);
              }}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="config-form"
              disabled={saving}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save & Enable"}
            </button>
          </>
        }
      >
        <form id="config-form" onSubmit={handleSaveConfig} className="space-y-4">
          <FormField
            label="API Key"
            required
            value={configForm.apiKey || ""}
            onChange={(e) => setConfigForm((f) => ({ ...f, apiKey: e.target.value }))}
            placeholder="Enter your API key"
          />
          <FormField
            label="API Secret"
            type="password"
            value={configForm.apiSecret || ""}
            onChange={(e) => setConfigForm((f) => ({ ...f, apiSecret: e.target.value }))}
            placeholder="Enter your API secret (optional)"
          />
          <FormField
            label="Webhook URL"
            value={configForm.webhookUrl || ""}
            onChange={(e) => setConfigForm((f) => ({ ...f, webhookUrl: e.target.value }))}
            placeholder="https://your-domain.com/webhooks"
            hint="URL to receive webhook notifications"
          />
        </form>
      </Modal>
    </div>
  );
};

export default IntegrationsPage;
