import type { ComponentType } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import type { LucideProps } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";

export interface ActionSheetOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: ComponentType<LucideProps>;
  isDestructive?: boolean;
  onPress: () => void;
}

export interface ActionSheetProps {
  visible: boolean;
  title?: string;
  options: ActionSheetOption[];
  onClose: () => void;
  showCancel?: boolean;
}

export function ActionSheet({
  visible,
  title,
  options,
  onClose,
  showCancel = true,
}: ActionSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = theme.colors;

  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 90 || event.velocityY > 500) {
        translateY.value = withTiming(350, { duration: 180 }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, 250],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surfaceContainer,
                paddingBottom: Math.max(insets.bottom, 16),
              },
              sheetAnimatedStyle,
            ]}
          >
            <View style={styles.handleWrap}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: colors.outlineVariant },
                ]}
              />
            </View>

            {title && (
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.onSurfaceVariant,
                    borderBottomColor: colors.outlineVariant,
                  },
                ]}
              >
                {title}
              </Text>
            )}

          <ScrollView style={styles.optionsList} bounces={false}>
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    onClose();
                    option.onPress();
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    pressed && { backgroundColor: colors.surfaceContainerHigh },
                  ]}
                >
                  {Icon && (
                    <View style={styles.iconWrap}>
                      <Icon
                        size={20}
                        color={
                          option.isDestructive
                            ? colors.error
                            : colors.onSurface
                        }
                        strokeWidth={2}
                      />
                    </View>
                  )}
                  <View style={styles.textWrap}>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: option.isDestructive
                            ? colors.error
                            : colors.onSurface,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.sublabel && (
                      <Text
                        style={[
                          styles.optionSublabel,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        {option.sublabel}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

            {showCancel && (
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.cancelButton,
                  { backgroundColor: colors.surfaceContainerHigh },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.cancelText, { color: colors.onSurface }]}>
                  Cancel
                </Text>
              </Pressable>
            )}
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 16,
    maxHeight: "80%",
  },
  handleWrap: {
    alignItems: "center",
    paddingBottom: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
  },
  optionsList: {
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  iconWrap: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionSublabel: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
});
