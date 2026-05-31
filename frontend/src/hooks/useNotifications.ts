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
 * Falls back to an empty list when the backend is unreachable.
 *
 * To wire in a real backend:
 *   1. Ensure `/api/v1/notifications/stream` streams JSON events of shape LiveNotification.
 *   2. Pass a valid JWT in the request – this hook sends `credentials: "include"`.
 */
export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] =
    useState<LiveNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    // Clean up any existing connection
    esRef.current?.close();
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

    // EventSource cannot send Authorization headers; skip until a session exists.
    let token: string | null = null;
    try {
      token = sessionStorage.getItem("gratehcare.api.access_token");
    } catch {
      token = null;
    }
    if (!token) {
      setConnected(false);
      return;
    }

    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      setConnected(false);
      return;
    }

    try {
      const url = new URL(SSE_URL);
      url.searchParams.set("access_token", token);
      const es = new EventSource(url.toString(), { withCredentials: true });
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
