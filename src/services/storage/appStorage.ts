import { createMMKV, type MMKV } from "react-native-mmkv";

export const mmkv: MMKV = createMMKV({
  id: "kapota-app-preferences",
});

const THEME_KEY = "theme";
const SUGGESTED_PLACES_KEY = "suggested_places";
const CONVERSATIONS_KEY = "cached_conversations";
const MESSAGES_PREFIX = "cached_messages_";
const OUTBOX_KEY = "pending_outbox_messages";

export type OutboxMessageItem = {
  tempId: string;
  conversationId: string;
  data: {
    text?: string;
    image?: string;
    imageUri?: string;
    replyTo?: string;
    postId?: string;
    mediaId?: string;
  };
  createdAt: string;
};

export const appStorage = {
  // Theme
  setTheme: (theme: string) => {
    mmkv.set(THEME_KEY, theme);
  },
  getTheme: (): string | null => {
    return mmkv.getString(THEME_KEY) ?? null;
  },
  deleteTheme: () => {
    mmkv.remove(THEME_KEY);
  },

  // Suggested Places Cache
  setSuggestedPlaces: (places: unknown) => {
    mmkv.set(SUGGESTED_PLACES_KEY, JSON.stringify(places));
  },
  getSuggestedPlaces: <T = unknown>(): T | null => {
    try {
      const raw = mmkv.getString(SUGGESTED_PLACES_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  deleteSuggestedPlaces: () => {
    mmkv.remove(SUGGESTED_PLACES_KEY);
  },

  // Conversations Cache
  setCachedConversations: (conversations: unknown) => {
    mmkv.set(CONVERSATIONS_KEY, JSON.stringify(conversations));
  },
  getCachedConversations: <T = unknown>(): T | null => {
    try {
      const raw = mmkv.getString(CONVERSATIONS_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  deleteCachedConversations: () => {
    mmkv.remove(CONVERSATIONS_KEY);
  },

  // Messages Cache
  setCachedMessages: (conversationId: string, messages: unknown) => {
    mmkv.set(`${MESSAGES_PREFIX}${conversationId}`, JSON.stringify(messages));
  },
  getCachedMessages: <T = unknown>(conversationId: string): T | null => {
    try {
      const raw = mmkv.getString(`${MESSAGES_PREFIX}${conversationId}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  deleteCachedMessages: (conversationId: string) => {
    mmkv.remove(`${MESSAGES_PREFIX}${conversationId}`);
  },

  // WhatsApp-style Outbox Queue
  getOutbox: (): OutboxMessageItem[] => {
    try {
      const raw = mmkv.getString(OUTBOX_KEY);
      return raw ? (JSON.parse(raw) as OutboxMessageItem[]) : [];
    } catch {
      return [];
    }
  },
  addToOutbox: (item: OutboxMessageItem) => {
    try {
      const current = appStorage.getOutbox();
      const updated = [
        ...current.filter((msg) => msg.tempId !== item.tempId),
        item,
      ];
      mmkv.set(OUTBOX_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to add message to outbox:", e);
    }
  },
  removeFromOutbox: (tempId: string) => {
    try {
      const current = appStorage.getOutbox();
      const updated = current.filter((msg) => msg.tempId !== tempId);
      mmkv.set(OUTBOX_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to remove message from outbox:", e);
    }
  },
  clearOutbox: () => {
    mmkv.remove(OUTBOX_KEY);
  },

  // Generic helpers
  getString: (key: string) => mmkv.getString(key) ?? null,
  setString: (key: string, value: string) => mmkv.set(key, value),
  getBoolean: (key: string) => mmkv.getBoolean(key) ?? false,
  setBoolean: (key: string, value: boolean) => mmkv.set(key, value),
  getNumber: (key: string) => mmkv.getNumber(key) ?? null,
  setNumber: (key: string, value: number) => mmkv.set(key, value),
  remove: (key: string) => mmkv.remove(key),
  clearAll: () => mmkv.clearAll(),
};

