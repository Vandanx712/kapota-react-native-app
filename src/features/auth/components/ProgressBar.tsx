import { StyleSheet, View } from "react-native";

type Props = {
  width?: number;
};

export function ProgressBar({ width = 260 }: Props) {
  return <View style={[styles.track, { width }]} />;
}

const styles = StyleSheet.create({
  track: {
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(162, 166, 210, 0.52)",
  },
});
