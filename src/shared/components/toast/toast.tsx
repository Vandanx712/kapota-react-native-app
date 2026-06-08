import Toast, { BaseToastProps } from "react-native-toast-message";
import { Check, AlertCircle, Info } from "lucide-react-native";
import { BaseToast } from "./BaseToast";

export type ToastType = "success" | "error" | "info";

const iconMap = {
  success: <Check size={24} color="#fff" strokeWidth={2.5} />,
  error: <AlertCircle size={24} color="#fff" strokeWidth={2.5} />,
  info: <Info size={24} color="#fff" strokeWidth={2.5} />,
};

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      text1={props.text1}
      icon={iconMap.success}
      type="success"
    />
  ),

  error: (props: BaseToastProps) => (
    <BaseToast
      text1={props.text1}
      icon={iconMap.error}
      type="error"
    />
  ),

  info: (props: BaseToastProps) => (
    <BaseToast
      text1={props.text1}
      icon={iconMap.info}
      type="info"
    />
  ),
};