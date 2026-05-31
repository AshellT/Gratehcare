import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Modal from "@/components/dashboard/Modal";
import FormField from "@/components/dashboard/FormField";
import { useActionQuery } from "@/hooks/useActionQuery";
import { knowledgeApi, type KnowledgeArticle } from "@/lib/api/knowledge";
import { useToast } from "@/context/ToastContext";

const KnowledgeBasePage: React.FC = () => {
  const toast = useToast();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", category: "General", body: "" });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await knowledgeApi.list({ limit: 50 });
      setArticles(res.data ?? []);
    } catch {
      toast.error("Failed to load articles", "Could not fetch knowledge base.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useActionQuery("create", () => setShowCreate(true));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q),
    );
  }, [articles, query]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.warning("Title and body required");
      return;
    }
    setSaving(true);
    try {
      await knowledgeApi.create({
        title: form.title.trim(),
        category: form.category.trim() || "General",
        body: form.body.trim(),
      });
      toast.success("Article created");
      setShowCreate(false);
      setForm({ title: "", category: "General", body: "" });
      await load();
    } catch {
      toast.error("Create failed", "Could not save the article.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Support"
        title="Knowledge base"
        description="Macros, articles and runbooks for support agents."
        actions={[
          {
            label: "New article",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setShowCreate(true),
          },
        ]}
      />

      <Card title="Articles" description="Search and browse support knowledge.">
        <div className="relative mb-5 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading articles…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="font-display text-lg font-bold text-slate-900">No articles yet</div>
            <p className="mt-1 text-sm text-slate-500">Create your first support article to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((article) => (
              <li key={article.id} className="py-4">
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-600">{article.category}</div>
                <div className="mt-1 font-display text-lg font-bold text-slate-900">{article.title}</div>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{article.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New article">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Title">
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </FormField>
          <FormField label="Category">
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </FormField>
          <FormField label="Body">
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={6}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </FormField>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Publish article"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default KnowledgeBasePage;
