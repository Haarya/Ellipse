import { create } from "zustand";

export type NotificationType =
  | "COMPLAINT_NEW"
  | "SLA_BREACH"
  | "DISPATCH_CONFIRMED"
  | "DEDUP_DISPUTE"
  | "SYSTEM_ANNOUNCEMENT"
  | "AI_TRIAGE_COMPLETE";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

// Simulated backend delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    type: "SLA_BREACH",
    title: "SLA Breach Warning",
    message: "Complaint #comp-004 has exceeded the 48-hour SLA without resolution.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    link: "/triage?id=comp-004",
  },
  {
    id: "notif-002",
    type: "COMPLAINT_NEW",
    title: "New High Severity Complaint",
    message: "A new critical complaint has been logged in Ward 42.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    link: "/triage?id=comp-001",
  },
  {
    id: "notif-003",
    type: "DEDUP_DISPUTE",
    title: "Merge Disputed by Citizen",
    message: "A citizen disputed the auto-merge of complaint #comp-007-dispute. Manual review required.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    link: "/dedup?id=comp-007-dispute",
  },
  {
    id: "notif-004",
    type: "DISPATCH_CONFIRMED",
    title: "Crew Deployed",
    message: "Team Bravo has acknowledged dispatch for #comp-005.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: true,
    link: "/crews?id=crew-002",
  },
  {
    id: "notif-005",
    type: "SYSTEM_ANNOUNCEMENT",
    title: "System Maintenance",
    message: "Scheduled downtime for AI model updates tonight at 02:00 AM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
];

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: MOCK_NOTIFICATIONS,
  isLoading: false,
  error: null,
  
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      await delay(500); // Simulate network
      // In a real app: const data = await api.get('/notifications');
      set({ notifications: MOCK_NOTIFICATIONS, isLoading: false });
    } catch {
      set({ error: "Failed to fetch notifications", isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await delay(300); // Simulate network
      // In a real app: await api.post(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      }));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  },

  markAllAsRead: async () => {
    try {
      await delay(600); // Simulate network
      // In a real app: await api.post(`/notifications/read-all`);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  },
}));
