import { View } from "react-native";

import { SUBSCRIPTION_COST_NOTE, SUBSCRIPTION_COSTS } from "@/data/subscriptionCosts";
import { formatCurrency } from "@/domain/format";
import { Card, Typography } from "@/ui/NativeComponents";
import { NativeMetricGrid } from "@/ui/NativeMetricGrid";

export function SubscriptionCostReference() {
  return (
    <Card className="gap-3 border border-line bg-glass p-4">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <Typography.Heading type="h4" className="type-title text-ink">月卡／週卡每抽成本</Typography.Heading>
        <Typography className="type-label text-muted">台幣 NT$</Typography>
      </View>
      <NativeMetricGrid>
        {SUBSCRIPTION_COSTS.map(pass => (
          <View className="gap-2 rounded-xl border border-line bg-white/70 p-3" key={pass.name}>
            <Typography className="type-title-sm text-ink">{pass.name}</Typography>
            <Typography className="type-title text-orbit">
              {formatCurrency(pass.perPull)}／抽
            </Typography>
            <Typography className="type-label text-muted">售價 {formatCurrency(pass.price)} · {pass.detail}</Typography>
          </View>
        ))}
      </NativeMetricGrid>
      <Typography className="type-label text-muted">{SUBSCRIPTION_COST_NOTE}</Typography>
    </Card>
  );
}
