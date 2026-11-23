import { View } from "react-native";

import { getSubscriptionCosts, SUBSCRIPTION_COST_NOTE } from "@/data/subscriptionCosts";
import { CURRENCY_LABELS, CURRENCY_SYMBOLS, formatCurrency } from "@/domain/format";
import type { Currency } from "@/domain/types";
import { Typography } from "@/ui/NativeComponents";
import { NativeDisclosure } from "@/ui/NativeDisclosure";
import { NativeMetricGrid } from "@/ui/NativeMetricGrid";

export function SubscriptionCostReference({ currency = "TWD" }: { currency?: Currency }) {
  return (
    <NativeDisclosure title="月卡／週卡每抽成本">
      <Typography className="type-label text-muted">{CURRENCY_LABELS[currency]} {CURRENCY_SYMBOLS[currency]}</Typography>
      <NativeMetricGrid>
        {getSubscriptionCosts(currency).map(pass => (
          <View className="gap-2 rounded-xl border border-line bg-white/70 p-3" key={pass.name}>
            <Typography className="type-title-sm text-ink">{pass.name}</Typography>
            <Typography className="type-title text-orbit">
              {formatCurrency(pass.perPull, currency)}{pass.perPull != null ? "／抽" : ""}
            </Typography>
            <Typography className="type-label text-muted">售價 {formatCurrency(pass.price, currency)} · {pass.detail}</Typography>
          </View>
        ))}
      </NativeMetricGrid>
      <Typography className="type-label text-muted">{SUBSCRIPTION_COST_NOTE}</Typography>
    </NativeDisclosure>
  );
}
