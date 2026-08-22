import Card from "@/components/dashboard/Card";
import FormField from "@/components/dashboard/FormField";
import PageHeader from "@/components/dashboard/PageHeader";
import { useToast } from "@/context/ToastContext";
import { useConversations, useMessages } from "@/hooks/useMessages";
import { Phone, Plus, Search, Send, Video, X } from "lucide-react";
import React, { useState } from "react";

const AVATAR_COLORS = [
  "from-indigo-500 to-sky-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-500",
  "from-teal-500 to-emerald-500",
  "from-slate-600 to-slate-800",
];

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s`;
  if (diff < 3600) return `${Math.round(diff / 60)}m`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h`;
  return `${Math.round(diff / 86400)}d`;
};

const MessagesPage: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [draft, setDraft] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [threadForm, setThreadForm] = useState({ subject: "", content: "" });
  const toast = useToast();
  const notify = (text: string) => {
    setNotification(text);
    window.setTimeout(() => setNotification(null), 2400);
  };

  const { data: convData, create: createConversation } = useConversations();
  const conversations = convData?.data ?? [];
  const activeConv = conversations[activeIdx] ?? null;

  const { data: msgData, send: sendMessage } = useMessages(
    activeConv?.id ?? null,
  );
  const messages = msgData?.data ?? [];

  const handleCallRequest = async () => {
    if (!activeConv) return;
    const name = activeConv.participantNames[0] ?? "participant";
    await sendMessage(
      `Voice call requested with ${name}. Please reply when you are available.`,
    );
    notify(`Call request sent to ${name}.`);
  };

  const handleVideoRequest = async () => {
    if (!activeConv) return;
    const name = activeConv.participantNames[0] ?? "participant";
    await sendMessage(
      `Video meeting requested with ${name}. Please share availability.`,
    );
    notify(`Video request sent to ${name}.`);
  };

  const handleCreateThread = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!threadForm.subject.trim() || !threadForm.content.trim()) {
      toast.warning("Message required", "Enter a subject and the first message.");
      return;
    }
    setSaving(true);
    try {
      await createConversation(threadForm.subject.trim(), threadForm.content.trim());
      setCreateOpen(false);
      setThreadForm({ subject: "", content: "" });
      setActiveIdx(0);
      notify("Conversation started.");
    } catch {
      toast.error("Could not start conversation", "Try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Messages"
        description="Coordinate with staff, families and practitioners — without leaving GRATEHCARE."
        actions={[
          {
            label: "New conversation",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setCreateOpen(true),
          },
        ]}
      />

      {notification && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">
          {notification}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[320px_1fr] gap-0 -m-5 min-h-[600px]">
          {/* Conversation list */}
          <div className="border-r border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  placeholder="Search messages..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:outline-none"
                />
              </div>
            </div>
            <ul>
              {conversations.map((c, i) => (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveIdx(i)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-slate-100 transition-colors ${
                      activeIdx === i ? "bg-indigo-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}
                    >
                      {(c.participantNames[0] ?? "?")
                        .split(" ")
                        .map((p: string) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {c.participantNames[0]}
                        </div>
                        <div className="text-[10px] text-slate-500 flex-shrink-0">
                          {c.lastMessageAt ? timeAgo(c.lastMessageAt) : ""}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {c.lastMessage}
                      </div>
                    </div>
                    {(c.unreadCount ?? 0) > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold px-1.5">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Conversation */}
          <div className="flex flex-col">
            {activeConv && (
              <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[activeIdx % AVATAR_COLORS.length]} text-white text-xs font-bold flex items-center justify-center`}
                  >
                    {(activeConv.participantNames[0] ?? "?")
                      .split(" ")
                      .map((p: string) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {activeConv.participantNames[0]}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      ● Online
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => void handleCallRequest()}
                    aria-label={`Call ${activeConv.participantNames[0]}`}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => void handleVideoRequest()}
                    aria-label={`Video call ${activeConv.participantNames[0]}`}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 p-5 space-y-3 overflow-y-auto bg-slate-50/40">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.isOwn
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                    <div
                      className={`mt-1 text-[10px] ${
                        m.isOwn ? "text-indigo-200" : "text-slate-400"
                      }`}
                    >
                      {new Date(m.sentAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (draft.trim()) {
                  await sendMessage(draft.trim());
                  notify("Message sent.");
                }
                setDraft("");
              }}
              className="p-4 border-t border-slate-200 flex items-center gap-2"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                data-testid="message-input"
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-300 focus:outline-none"
              />
              <button
                type="submit"
                data-testid="message-send"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </Card>

      {createOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  New conversation
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Start a thread with a subject and first message.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateThread} className="mt-5 space-y-4">
              <FormField
                label="Subject"
                value={threadForm.subject}
                onChange={(e) =>
                  setThreadForm((f) => ({ ...f, subject: e.target.value }))
                }
                required
              />
              <label className="block text-sm font-semibold text-slate-700">
                First message
                <textarea
                  value={threadForm.content}
                  onChange={(e) =>
                    setThreadForm((f) => ({ ...f, content: e.target.value }))
                  }
                  required
                  rows={4}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Starting…" : "Start conversation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
