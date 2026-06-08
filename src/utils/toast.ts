import Toast from "react-native-toast-message";

export type ToastType = "success" | "error" | "info";

export function showToast(
  type: ToastType,
  message: string,
  duration: number = 3000,
) {
  Toast.show({
    type,
    text1: message,
    visibilityTime: duration,
    autoHide: true,
  });
}

export const showSuccessToast = (msg: string) => showToast("success", msg);

export const showErrorToast = (msg: string) => showToast("error", msg);

export const showInfoToast = (msg: string) => showToast("info", msg);
