import { View, useWindowDimensions } from "react-native";
import { Button, Card, Typography } from "@/ui/NativeComponents";
import { NativeInput } from "@/ui/NativeInput";
import { ResourceIcon } from "@/ui/ResourceIcon";
import { PearlSurface } from "@/ui/PearlSurface";
import { formatNumber } from "@/domain/format";
import type { CalculatorDraft } from "@/domain/types";
import type { ResourcePlan } from "@/domain/calculator";
import { NATIVE_FONTS } from "@/theme/native";
export type CalculatorOverviewProps = {
  draft: CalculatorDraft;
  resource: ResourcePlan;
  onChange: (key: "cur" | "tickets", value: number) => void;
  onPlan: () => void;
};
export function CalculatorOverview({
  draft,
  resource,
  onChange,
  onPlan,
}: CalculatorOverviewProps) {
  const { fontScale } = useWindowDimensions();
  const stacked = fontScale > 1.3;
  const target = resource.totalPulls;
  const percentage =
    target > 0
      ? Math.min(
          100,
          Math.round((resource.availablePulls / target) * 1000) / 10,
        )
      : 0;
  return (
    <View style={{ gap: 16 }}>
      <Card style={{ padding: 16, gap: 10 }}>
        {(
          [
            ["diamond", "鑽石", "cur", draft.cur, "目前持有鑽石"],
            ["ticket", "限定券", "tickets", draft.tickets, "原有金券"],
          ] as const
        ).map(([kind, label, key, value, aria], index) => (
          <View
            key={key}
            style={{
              flexDirection: stacked ? "column" : "row",
              alignItems: stacked ? "stretch" : "center",
              gap: 12,
              ...(index
                ? {
                    borderTopWidth: 1,
                    borderTopColor: "#e3d9ed",
                    paddingTop: 10,
                  }
                : {}),
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <ResourceIcon kind={kind} />
              <Typography style={{ fontSize: 20 }}>{label}</Typography>
            </View>
            <NativeInput
              accessibilityLabel={aria}
              keyboardType="number-pad"
              value={value ? String(value) : ""}
              placeholder="0"
              onChangeText={(text) => onChange(key, Number(text))}
              style={{
                width: stacked ? "100%" : "57%",
                fontFamily: NATIVE_FONTS.number,
                fontSize: 25,
                textAlign: "center",
              }}
            />
          </View>
        ))}
      </Card>
      <Card
        style={{
          flexDirection: stacked ? "column" : "row",
          paddingVertical: 17,
          paddingHorizontal: 28,
          gap: 20,
        }}
      >
        <PearlSurface tone="lavender" />
        {(
          [
            ["可抽", resource.availablePulls],
            ["目標", target],
          ] as const
        ).map(([label, value], index) => (
          <View
            key={label}
            style={{
              flex: 1,
              ...(index && !stacked
                ? {
                    borderLeftWidth: 1,
                    borderLeftColor: "#cebfdf",
                    paddingLeft: 24,
                  }
                : {}),
            }}
          >
            <Typography style={{ fontSize: 19 }}>{label}</Typography>
            <Typography
              style={{
                fontFamily: NATIVE_FONTS.number,
                fontSize: index ? 39 : 55,
                lineHeight: 64,
                color: "#57406e",
              }}
            >
              {formatNumber(value)}
              <Typography style={{ fontSize: 21 }}> 抽</Typography>
            </Typography>
          </View>
        ))}
      </Card>
      <View style={{ gap: 5 }}>
        <Typography style={{ textAlign: "right", fontSize: 14 }}>
          {formatNumber(resource.availablePulls)} / {formatNumber(target)} 抽（
          {percentage}%）
        </Typography>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="抽卡目標達成率"
          accessibilityValue={{ min: 0, max: 100, now: percentage }}
          style={{
            height: 15,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#e8e2ee",
            boxShadow: "inset 0px 2px 3px rgba(115,86,146,0.09)",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${percentage}%`,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <PearlSurface tone="primary" />
          </View>
        </View>
      </View>
      <Card
        style={{
          flexDirection: stacked ? "column" : "row",
          padding: 18,
          gap: 16,
          alignItems: "center",
        }}
      >
        <PearlSurface tone="lavender" />
        <Typography style={{ flex: 1, fontSize: 22 }}>
          ✦ 還差{" "}
          <Typography
            style={{
              fontFamily: NATIVE_FONTS.number,
              fontSize: 34,
              color: "#80639f",
            }}
          >
            {formatNumber(resource.paidPulls)}
          </Typography>{" "}
          抽
        </Typography>
        <View
          style={{
            flex: 1,
            minWidth: 0,
            borderLeftWidth: stacked ? 0 : 1,
            borderLeftColor: "#cebfdf",
            paddingLeft: 16,
          }}
        >
          <Typography style={{ fontSize: 15 }}>需再準備</Typography>
          <Typography style={{ fontSize: 20 }}>
            <Typography
              style={{ fontFamily: NATIVE_FONTS.number, fontSize: 25 }}
            >
              {formatNumber(resource.gapDia)}
            </Typography>{" "}
            鑽石
          </Typography>
        </View>
      </Card>
      <Button onPress={onPlan}>⟳ 更新規劃</Button>
      {resource.officialTickets > 0 || resource.reservePulls > 0 ? (
        <Typography className="type-label text-muted">
          {resource.officialTickets > 0
            ? `含官方券 ${resource.officialTickets} 張；`
            : ""}
          {resource.reservePulls > 0
            ? `目標含預留 ${formatNumber(resource.reservePulls)} 抽。`
            : ""}
          可在換算設定調整。
        </Typography>
      ) : null}
    </View>
  );
}
