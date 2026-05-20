import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api/config";

// ─── Types ──────────────────────────────────────────────────────────────────

export type NotificationSeverity = "critical" | "warning" | "info" | "success";

export type NotificationType =
  | "shift_update"
  | "incident_alert"
  | "missed_visit"
  | "compliance_alert"
  | "messaging_update"
  | "general";

export interface LiveNotification {
  id: string;
  tenantId?: string;
  type: NotificationType;
  title: string;
  body?: string;
  severity: NotificationSeverity;
  createdAt: string;
  read: boolean;
}

// ─── Mock seed (used when SSE backend is unavailable) ───────────────────────

const MOCK_NOTIFICATIONS: LiveNotification[] = [
  {
    id: "n-001",
    type: "shift_update",
    title: "3 night shifts uncovered tomorrow",
    body: "No worker assigned for Eleanor R., Marcus T., Henry P.",
    severity: "warning",
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    read: false,
  },
  {
    id: "n-002",
    type: "incident_alert",
    title: "Incident INC-482 logged by James O.",
    body: "Fall incident at home visit – client Henry P.",
    severity: "critical",
    createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
    read: false,
  },
  {
    id: "n-003",
    type: "missed_visit",
    title: "Missed visit – Eleanor R. (09:00 slot)",
    body: "Worker did not check in within the 15-min window.",
    severity: "critical",
    createdAt: new Date(Date.now() - 35 * 60_000).toISOString(),
    read: false,
  },
  {
    id: "n-004",
    type: "compliance_alert",
    title: "Police check expiring in 3 days – James M.",
    body: "Renewal not yet submitted. Action required.",
    severity: "warning",
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    read: false,
  },
  {
    id: "n-005",
    type: "messaging_update",
    title: "New message from Eleanor's family",
    body: "Re: Thursday morning visit schedule.",
    severity: "info",
    createdAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    read: true,
  },
  {
    id: "n-006",
    type: "general",
    title: "Claim CL-2189 approved · $1,420",
    body: "Allianz payment confirmed.",
    severity: "success",
    createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    read: true,
  },
];

// ─── SSE URL ─────────────────────────────────────────────────────────────────

const SSE_URL = `${API_BASE}/notifications/stream`;
const RECONNECT_DELAY_MS = 5_000;
const MAX_RECONNECT_ATTEMPTS = 3;

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseNotificationsResult {
  notifications: LiveNotification[];
  unreadCount: number;
  connected: boolean;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
}

/**
 * Connects to the SSE endpoint for real-time notifications.
 * Falls back gracefully to mock data when the backend is unreachable.
 *
 * To wire in a real backend:
 *   1. Ensure `/api/v1/notifications/stream` streams JSON events of shape LiveNotification.
 *   2. Pass a valid JWT in the request – this hook sends `credentials: "include"`.
 */
export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] =
    useState<LiveNotification[]>(MOCK_NOTIFICATIONS);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    // Clean up any existing connection
    esRef.current?.close();
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

    // EventSource cannot send Authorization headers; skip until a session exists.
    let hasToken = false;
    try {
      hasToken = Boolean(sessionStorage.getItem("gratehcare.api.access_token"));
    } catch {
      hasToken = false;
    }
    if (!hasToken) {
      setConnected(false);
      return;
    }

    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      setConnected(false);
      return;
    }

    try {
      const es = new EventSource(SSE_URL, { withCredentials: true });
      esRef.current = es;

      es.onopen = () => {
        reconnectAttempts.current = 0;
        setConnected(true);
      };

      es.onmessage = (event: MessageEvent) => {
        try {
          const notification: LiveNotification = JSON.parse(
            event.data as string,
          );
          setNotifications((prev) => [
            { ...notification, read: false },
            ...prev.filter((n) => n.id !== notification.id),
          ]);
        } catch {
          // Ignore malformed events
        }
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        esRef.current = null;
        reconnectAttempts.current += 1;
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    } catch {
      // EventSource not supported or blocked – stay with mock data
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    connected,
    markAllRead,
    markRead,
    dismiss,
  };
}
