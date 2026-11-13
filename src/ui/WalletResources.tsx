import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import { Card, Typography } from "./NativeComponents";
import { ResourceIcon } from "./ResourceIcon";
import { NATIVE_FONTS } from "@/theme/native";
import { formatNumber } from "@/domain/format";
export type WalletResourcesProps = {
  cur: number | null;
  tickets: number | null;
};
export function WalletResources({ cur, tickets }: WalletResourcesProps) {
  return (
    <Link href="/calculator" asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="查看鑽石與限定券，前往換算"
      >
        <Card
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          {(
            [
              ["diamond", "鑽石", cur],
              ["ticket", "限定券", tickets],
            ] as const
          ).map(([kind, label, value], index) => (
            <View
              key={kind}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                ...(index
                  ? {
                      borderLeftWidth: 1,
                      borderLeftColor: "#d9cde5",
                      paddingLeft: 22,
                    }
                  : {}),
              }}
            >
              <ResourceIcon kind={kind} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Typography style={{ fontSize: 14 }}>{label}</Typography>
                <Typography
                  style={{
                    fontFamily: NATIVE_FONTS.number,
                    fontSize: 23,
                    lineHeight: 26,
                  }}
                >
                  {value === null ? "—" : formatNumber(value)}
                </Typography>
              </View>
            </View>
          ))}
        </Card>
      </Pressable>
    </Link>
  );
}
