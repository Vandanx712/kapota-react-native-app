import type { LucideIcon } from "lucide-react-native";
import {
  CircleHelp,
  Key,
  MessageCircle,
  Settings2,
} from "lucide-react-native";

import type { SettingsSectionId } from "../types/settings.types";

export const SETTINGS_SECTION_ICONS: Record<SettingsSectionId, LucideIcon> = {
  account: Key,
  post: Settings2,
  chats: MessageCircle,
  help: CircleHelp,
};
