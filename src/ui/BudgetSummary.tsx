import { View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Typography } from "./NativeComponents";
import { formatCurrency } from "@/domain/format";
import type { Currency } from "@/domain/types";
import { APP_COLORS } from "@/theme/tokens";
import { NATIVE_FONTS } from "@/theme/native";

export type BudgetSummaryProps = { budget: number; spent: number; remaining: number; percentage: number; currency: Currency };

export function BudgetSummary({ budget, spent, remaining, currency }: BudgetSummaryProps) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = fontScale > 1.3 || width < 350;
  const size = stacked ? 200 : 176;
  const ratio = budget > 0 ? Math.max(0, Math.min(1, remaining / budget)) : 0;
  const circumference = 2 * Math.PI * 86;
  return <View style={{ flexDirection: stacked ? "column" : "row", alignItems: "center", gap: 16 }}>
    <View style={{ flex: stacked ? undefined : 1, width: stacked ? "100%" : undefined, gap: 18 }}>
      {([["本月預算", budget], ["已花", spent]] as const).map(([label, amount], index) => <View key={label} style={index ? { paddingTop: 14, borderTopWidth: 1, borderTopColor: APP_COLORS.line } : undefined}>
        <Typography className="type-label text-muted">{label}</Typography>
        <Typography className="text-ink" style={{ fontFamily: NATIVE_FONTS.number, fontSize: 24, lineHeight: 34 }}>{formatCurrency(amount, currency)}</Typography>
      </View>)}
    </View>
    <View style={{ width: size, minHeight: size, alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Svg accessible={false} pointerEvents="none" width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute" }}>
        <Defs><LinearGradient id="budget-arc" x1="0" y1="0" x2="1" y2="1"><Stop stopColor="#baa5d0"/><Stop offset="1" stopColor="#a58ac2"/></LinearGradient></Defs>
        <Circle cx={100} cy={100} r={86} stroke="#e8e1f0" strokeWidth={11} fill="none" />
        <Circle cx={100} cy={100} r={86} stroke={remaining < 0 ? APP_COLORS.danger : "url(#budget-arc)"} strokeWidth={11} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - ratio)} rotation={-90} origin="100,100" fill="none" />
      </Svg>
      <Typography className="type-label text-muted">{remaining < 0 ? "已超支" : "剩餘"}</Typography>
      <Typography className="text-ink" style={{ fontFamily: NATIVE_FONTS.number, fontSize: 29, lineHeight: 38, textAlign: "center" }}>{formatCurrency(Math.abs(remaining), currency)}</Typography>
      <Typography className="type-label text-muted" style={{ textAlign: "center" }}>{budget > 0 ? `(${Math.round(ratio * 1000) / 10}%)` : "尚未設定預算"}</Typography>
    </View>
  </View>;
}
