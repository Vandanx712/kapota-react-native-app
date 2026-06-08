import { Dimensions, StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { splash } from "@/theme/tokens";

const { width, height } = Dimensions.get("window");

const SplashBackground = () => {
  return (
    <Svg
      height={height}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width={width}
    >
      <Defs>
        <LinearGradient id="base" x1="0.5" x2="0.5" y1="0" y2="1">
          <Stop offset="0" stopColor={splash.background.top} />
          <Stop offset="0.42" stopColor={splash.background.middle} />
          <Stop offset="0.76" stopColor={splash.background.lower} />
          <Stop offset="1" stopColor={splash.background.bottom} />
        </LinearGradient>

        <RadialGradient
          id="sphereGlow"
          cx="50%"
          cy="50%"
          fx="50%"
          fy="50%"
          rx="60%"
          ry="60%"
        >
          <Stop offset="0" stopColor={splash.glow.primary} stopOpacity="0.28" />
          <Stop
            offset="0.6"
            stopColor={splash.glow.secondary}
            stopOpacity="0.12"
          />
          <Stop offset="1" stopColor={splash.glow.base} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect fill="url(#base)" height={height} width={width} x="0" y="0" />
      <Rect fill="url(#sphereGlow)" height={height} width={width} x="0" y="0" />
    </Svg>
  );
};

export default SplashBackground;
