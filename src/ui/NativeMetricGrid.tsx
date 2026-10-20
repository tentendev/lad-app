import { Children, cloneElement, isValidElement, useState, type PropsWithChildren } from "react";
import { View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";

export function NativeMetricGrid({ children }: PropsWithChildren) {
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const stacked = fontScale > 1.3 || width < 360;
  return <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ flexDirection: stacked ? "column" : "row", gap: 8 }}>
    {Children.map(children, child => isValidElement<{ style?: StyleProp<ViewStyle> }>(child)
      ? cloneElement(child, { style: [child.props.style, { flex: stacked ? 0 : 1, minWidth: 0 }] })
      : child)}
  </View>;
}
