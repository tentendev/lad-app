import { Children, useState, type PropsWithChildren } from "react";
import { View, useWindowDimensions } from "react-native";
import { nativeColumnWidth } from "./nativeLayout";

export function NativeColumns({ children, minimum = 340 }: PropsWithChildren<{ minimum?: number }>) {
  const [width, setWidth] = useState(0);
  const { fontScale } = useWindowDimensions();
  const columnWidth = nativeColumnWidth(width, fontScale, minimum);

  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 16 }}>
      {Children.toArray(children).map(child => (
        <View key={typeof child === "object" && "key" in child ? child.key : String(child)} style={{ width: width ? columnWidth : "100%", minWidth: 0, gap: 16 }}>
          {child}
        </View>
      ))}
    </View>
  );
}
