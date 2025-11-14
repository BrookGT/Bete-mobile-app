import React from "react";
import { View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";

export default function GradientText({
  text = "",
  fontSize = 24,
  fontFamily,
  startColor = "#3B82F6",
  endColor = "#8B5CF6",
  style,
}) {
  const [width, setWidth] = React.useState(0);
  const height = Math.ceil(fontSize * 1.3);

  return (
    <View
      style={style}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <Svg height={height} width={width}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={startColor} />
              <Stop offset="1" stopColor={endColor} />
            </LinearGradient>
          </Defs>
          <SvgText
            fill="url(#grad)"
            fontSize={fontSize}
            fontWeight="700"
            fontFamily={fontFamily}
            x={0}
            y={Math.round(fontSize)}
          >
            {text}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}
