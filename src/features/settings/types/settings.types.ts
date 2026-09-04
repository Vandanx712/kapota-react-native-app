export type SettingsSectionId = "account" | "post" | "chats" | "help";

export interface SettingsItem {
  id: SettingsSectionId;
  label: string;
  description: string;
}

export interface ActiveSession {
  _id: string;
  deviceName?: string;
  isCurrent?: boolean;
  isPrimaryDevice?: boolean;
  lastSeenAt?: string;
  createdAt?: string;
  ipAddress?: string;
}

export interface PostSummary {
  total: number;
  archived: number;
  hiddenLikes: number;
  shareDisabled: number;
}

export interface UserPost {
  _id: string;
  caption?: string;
  image?: { url: string; key: string };
  location?: { name?: string };
  createdAt: string;
  hideLike: boolean;
  disableShare: boolean;
  isArchived: boolean;
  likesCount?: number;
  sharesCount?: number;
}

export interface HelpTopic {
  title: string;
  description: string;
}

export interface ChatThemePalette {
  incoming: string;
  outgoing: string;
  accent: string;
  background: string;
}
