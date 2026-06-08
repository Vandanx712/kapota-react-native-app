import { Stack } from "expo-router";

import { ThemeProvider } from "@/theme/ThemeProvider";
import { colors } from "@/theme/tokens";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/shared/components/toast/toast";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      />
      <Toast config={toastConfig}/>
    </ThemeProvider>
  );
}
