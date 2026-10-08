import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  type: "created" | "updated" | "commented" | "system";
  complaintId?: number;
}

interface NotificationState {
  items: AppNotification[];
}

const getStorageKey = (userId?: number) => (userId ? `scm_notifications_${userId}` : "scm_notifications_guest");

const loadFromStorage = (userId?: number): AppNotification[] => {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore storage parse error
  }
  return [];
};

const saveToStorage = (userId: number | undefined, items: AppNotification[]) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(items.slice(0, 50))); // Keep last 50
  } catch {
    // ignore storage write error
  }
};

const initialState: NotificationState = {
  items: [],
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    initializeNotifications: (state, action: PayloadAction<{ userId?: number }>) => {
      state.items = loadFromStorage(action.payload.userId);
    },
    addNotification: (
      state,
      action: PayloadAction<{
        notification: Omit<AppNotification, "id" | "timestamp" | "read">;
        userId?: number;
      }>
    ) => {
      const newNotif: AppNotification = {
        ...action.payload.notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      // Prevent exact duplicate notifications within 2 seconds
      const isDuplicate = state.items.some(
        (n) => n.title === newNotif.title && n.message === newNotif.message && Date.now() - new Date(n.timestamp).getTime() < 2000
      );
      if (!isDuplicate) {
        state.items = [newNotif, ...state.items].slice(0, 50);
        saveToStorage(action.payload.userId, state.items);
      }
    },
    markAsRead: (state, action: PayloadAction<{ id: string; userId?: number }>) => {
      const item = state.items.find((n) => n.id === action.payload.id);
      if (item) {
        item.read = true;
        saveToStorage(action.payload.userId, state.items);
      }
    },
    markAllAsRead: (state, action: PayloadAction<{ userId?: number }>) => {
      state.items.forEach((n) => {
        n.read = true;
      });
      saveToStorage(action.payload.userId, state.items);
    },
    clearNotifications: (state, action: PayloadAction<{ userId?: number }>) => {
      state.items = [];
      saveToStorage(action.payload.userId, []);
    },
  },
});

export const {
  initializeNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
