import { Children, cloneElement, isValidElement, type PropsWithChildren } from "react";
import { View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";

/** Keep entire values readable when the system font or compact screen needs more space. */
export function NativeMetricGrid({ children }: PropsWithChildren) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = fontScale > 1.3 || width < 360;
  return <View style={{ flexDirection: stacked ? "column" : "row", gap: 8 }}>
    {Children.map(children, child => isValidElement<{ style?: StyleProp<ViewStyle> }>(child)
      ? cloneElement(child, { style: [child.props.style, { flex: stacked ? 0 : 1, minWidth: 0 }] })
      : child)}
  </View>;
}
