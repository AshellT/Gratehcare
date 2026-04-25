import React, { useState } from "react";
import { Send, Search, Phone, Video } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";

const conversations = [
  { name: "Priya Raman", last: "I'll cover Eleanor's evening shift, no worries.", time: "3m", unread: 2, color: "from-indigo-500 to-sky-500" },
  { name: "Daniel Wu", last: "Care notes uploaded for today.", time: "1h", unread: 0, color: "from-rose-500 to-pink-500" },
  { name: "Family · Eleanor R.", last: "Thank you for the update yesterday.", time: "3h", unread: 0, color: "from-fuchsia-500 to-purple-500" },
  { name: "Dr. Raj Patel", last: "Physio review scheduled for Friday.", time: "1d", unread: 0, color: "from-teal-500 to-emerald-500" },
  { name: "Operations team", last: "Weekly roster published.", time: "2d", unread: 0, color: "from-slate-600 to-slate-800" },
];

const messages = [
  { from: "Priya Raman", time: "10:14", text: "Hi! Quick question — am I covering Eleanor's evening shift today?", me: false },
  { from: "Me", time: "10:16", text: "Hi Priya — yes please, 19:00 onwards. Thanks for stepping in!", me: true },
  { from: "Priya Raman", time: "10:18", text: "All good. Will swing by the office to grab the keys.", me: false },
  { from: "Priya Raman", time: "10:18", text: "I'll cover Eleanor's evening shift, no worries.", me: false },
  { from: "Me", time: "10:21", text: "Perfect. Have a great day 💛", me: true },
];

const MessagesPage: React.FC = () => {
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Messages"
        description="Coordinate with staff, families and practitioners — without leaving Lumina."
      />

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
                <li key={c.name}>
                  <button
                    onClick={() => setActive(i)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-slate-100 transition-colors ${
                      active === i ? "bg-indigo-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${c.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                      {c.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-900 truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-500 flex-shrink-0">{c.time}</div>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{c.last}</div>
                    </div>
                    {c.unread > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold px-1.5">
                        {c.unread}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Conversation */}
          <div className="flex flex-col">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${conversations[active].color} text-white text-xs font-bold flex items-center justify-center`}>
                  {conversations[active].name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{conversations[active].name}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">● Online</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
                  <Video className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-5 space-y-3 overflow-y-auto bg-slate-50/40">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.me ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.me
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                    <div
                      className={`mt-1 text-[10px] ${
                        m.me ? "text-indigo-200" : "text-slate-400"
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
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
    </div>
  );
};

export default MessagesPage;
