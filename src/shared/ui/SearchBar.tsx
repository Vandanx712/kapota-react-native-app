import { useRef } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Platform,
} from "react-native";
import { Search, X } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onClear?: () => void;
  onSubmitEditing?: () => void;
  containerStyle?: object;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  autoFocus = false,
  onClear,
  onSubmitEditing,
  containerStyle,
}: SearchBarProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onChangeText("");
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceContainerHigh,
          borderColor: colors.outlineVariant,
        },
        containerStyle,
      ]}
    >
      <Search size={18} color={colors.onSurfaceVariant} strokeWidth={2.2} />
      <TextInput
        ref={inputRef}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        returnKeyType="search"
        style={[styles.input, { color: colors.onSurface }]}
        value={value}
      />
      {value.length > 0 && (
        <Pressable
          hitSlop={8}
          onPress={handleClear}
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
        >
          <View
            style={[
              styles.clearIconWrap,
              { backgroundColor: colors.surfaceContainerHighest },
            ]}
          >
            <X size={14} color={colors.onSurfaceVariant} strokeWidth={2.4} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 42,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
  },
  clearButton: {
    padding: 2,
  },
  clearIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
  },
});
