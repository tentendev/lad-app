import { ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Typography } from "heroui-native";
import Svg, { Path, Rect } from "react-native-svg";

import { DIA_PER_PULL, PACK_DATA } from "@/data/packs";
import type { GapPackRecommendation } from "@/domain/calculator";
import { formatCurrency, formatNumber } from "@/domain/format";
import { POOLS, type PullGoal } from "@/domain/types";
import { NativePage } from "@/ui/NativePage";
import { useCalculatorModel } from "./useCalculatorModel";
import { PlannerSectionNative } from "./PlannerSection.native";

function CalculatorGlyph({ type }: { type: "diamond" | "gift" | "steps" }) {
  if (type === "gift") {
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={3} y={9} width={18} height={12} rx={2} />
        <Path d="M12 9v12M3 13h18M12 9H7.5A2.5 2.5 0 0 1 10 5.5c1.1 0 2 1.6 2 3.5Zm0 0h4.5A2.5 2.5 0 0 0 14 5.5c-1.1 0-2 1.6-2 3.5Z" />
      </Svg>
    );
  }
  if (type === "steps") {
    return <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><Path d="M5 18h4v-4h4v-4h4V6h3" /></Svg>;
  }
  return <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><Path d="m12 3 7 6-7 12L5 9l7-6Zm-7 6h14M9 9l3 12 3-12M9 3l3 6 3-6" /></Svg>;
}

function NumberField({ placeholder, value, onChange }: { placeholder: string; value: number; onChange: (value: number) => void }) {
  return (
    <TextInput
      accessibilityLabel={placeholder}
      className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white"
      keyboardType="numeric"
      placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,.5)"
      value={value ? String(value) : ""}
      onChangeText={(text) => onChange(Number(text))}
    />
  );
}

export function CalculatorScreenNative() {
  const model = useCalculatorModel();
  const router = useRouter();
  const { draft, resource, recommendation } = model;

  async function recordRecommendation() {
    const saved = await model.saveRecommendationAsExpense();
    if (saved) router.push("/wallet");
  }

  async function recordGoalGap(goal: PullGoal, plan: GapPackRecommendation) {
    if (plan.status !== "recommended" || !plan.tier || !plan.planCost) return false;
    const saved = await model.savePackPlanAsExpense(goal.pool, plan.tier.tier, plan.planCost, goal.title);
    if (saved) router.push("/wallet");
    return saved;
  }

  if (!model.ready) {
    return (
      <NativePage eyebrow="Pull Planner" title="換算" description={`把鑽石、金券、官方返券與預留資源一起算清楚。每抽 ${DIA_PER_PULL} 鑽。`}>
        <Card className="gap-4 border border-white/40 bg-[#493b70]/70 p-4" accessibilityRole="progressbar">
          <Typography className="text-sm text-white/70">正在讀取換算設定…</Typography>
          <View className="h-12 rounded-xl bg-white/10" />
          <View className="h-40 rounded-2xl bg-white/10" />
        </Card>
      </NativePage>
    );
  }

  return (
    <NativePage eyebrow="Pull Planner" title="換算" description={`把鑽石、金券、官方返券與預留資源一起算清楚。每抽 ${DIA_PER_PULL} 鑽。`}>
      {model.storageError ? <View accessibilityRole="alert" className="rounded-xl border border-[#ffafbd] bg-[#ff6675]/20 p-3"><Typography className="text-sm text-white">{model.storageError}</Typography></View> : null}
      {model.targetHandoff ? (
        <View accessibilityRole="alert" className="gap-2 rounded-xl border border-[#9cf0dc] bg-[#65d6c4]/15 p-3">
          <Typography className="text-sm leading-5 text-white">已從追蹤帶入：{model.targetHandoff}。請確認卡池類型與現有資源後再採用建議。</Typography>
          <Button size="sm" variant="ghost" onPress={model.clearTargetHandoff}>知道了</Button>
        </View>
      ) : null}

      <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="flex-row items-center gap-2"><CalculatorGlyph type="diamond" /><Typography.Heading className="text-xl text-white">目標設定</Typography.Heading></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {POOLS.map((pool) => (
            <Button key={pool} size="sm" variant={pool === draft.pool ? "primary" : "secondary"} onPress={() => model.setPool(pool)}>{pool}</Button>
          ))}
        </ScrollView>
        <NumberField placeholder="目前持有（鑽）" value={draft.cur} onChange={(value) => model.updateNumber("cur", value)} />
        <NumberField placeholder="目標抽數" value={draft.pulls} onChange={(value) => model.updateNumber("pulls", value)} />
        <NumberField placeholder="原本剩餘金券（張）" value={draft.tickets} onChange={(value) => model.updateNumber("tickets", value)} />
        <View className="rounded-xl border border-white/20 bg-white/10 p-3">
          <Typography className="text-white/60">官方金券（自動）</Typography>
          <Typography.Heading className="text-white">{resource.officialTickets} 張</Typography.Heading>
          <Typography className="text-white/55">開池 {resource.initialTickets} 張 · 目標內返還 {resource.milestoneTickets} 張</Typography>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1"><NumberField placeholder={`預留資源（${draft.reserveUnit === "dia" ? "鑽" : "抽"}）`} value={draft.reserve} onChange={(value) => model.updateNumber("reserve", value)} /></View>
          <Button accessibilityLabel="預留資源使用抽數" size="sm" variant={draft.reserveUnit === "pulls" ? "primary" : "secondary"} onPress={() => model.setReserveUnit("pulls")}>抽</Button>
          <Button accessibilityLabel="預留資源使用鑽石" size="sm" variant={draft.reserveUnit === "dia" ? "primary" : "secondary"} onPress={() => model.setReserveUnit("dia")}>鑽</Button>
        </View>
        <Typography className="text-white/60">相當於 {formatNumber(resource.reservePulls)} 抽 · {formatNumber(resource.reserveDia)} 鑽</Typography>
      </Card>

      <View className="flex-row gap-2">
        <Card className="flex-1 gap-1 border border-white/40 bg-[#493b70]/70 p-3"><Typography.Heading className="text-white">{formatNumber(resource.gapDia)}</Typography.Heading><Typography className="text-xs text-white/55">還差鑽石</Typography></Card>
        <Card className="flex-1 gap-1 border border-white/40 bg-[#493b70]/70 p-3"><Typography.Heading className="text-white">{resource.paidPulls}</Typography.Heading><Typography className="text-xs text-white/55">需課金抽</Typography></Card>
        <Card className="flex-1 gap-1 border border-white/40 bg-[#493b70]/70 p-3"><Typography.Heading className="text-white">{draft.pulls ? formatNumber(recommendation.remainingDiaAfterTarget ?? resource.remainingDiaAfterTarget) : "—"}</Typography.Heading><Typography className="text-xs text-white/55">剩餘鑽</Typography></Card>
      </View>

      <Card className="gap-3 border border-white/55 bg-[#493b70]/85 p-5">
        <View className="flex-row items-center gap-2"><CalculatorGlyph type="gift" /><Typography className="text-white/70">禮包建議 · {draft.pool}</Typography></View>
        <Typography.Heading className="text-3xl text-white">
          {recommendation.status === "recommended" ? `買到第 ${recommendation.tier?.tier} 階` : recommendation.status === "enough" ? "無需課金" : recommendation.status === "overflow" ? "超過單輪上限" : "等待目標"}
        </Typography.Heading>
        {recommendation.status === "recommended" ? (
          <>
            <Typography.Heading className="text-4xl text-white">{formatCurrency(recommendation.planCost ?? 0)}</Typography.Heading>
            <Typography.Paragraph className="text-white/70">最後一階買 {recommendation.packsAtTier} 包，共取得 {formatNumber(recommendation.planPulls ?? 0)} 抽。</Typography.Paragraph>
            <Button variant="secondary" onPress={() => void recordRecommendation()}>帶入錢包記帳</Button>
          </>
        ) : (
          <Typography.Paragraph className="text-white/70">
            {recommendation.status === "enough" ? "現有資源已達成目標。" : recommendation.status === "overflow" ? `還需 ${recommendation.gapPulls} 抽；一輪限購最多補 ${formatNumber(recommendation.planPulls ?? 0)} 抽（${formatCurrency(recommendation.planCost ?? 0)}），其餘 ${formatNumber(Math.max(0, recommendation.gapPulls - (recommendation.planPulls ?? 0)))} 抽需搭配存鑽、其他有效資源或下輪禮包。` : "填入目標後顯示建議。"}
          </Typography.Paragraph>
        )}
      </Card>

      <Card className="gap-3 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="flex-row items-center gap-2"><CalculatorGlyph type="steps" /><Typography.Heading className="text-xl text-white">階梯明細</Typography.Heading></View>
        {PACK_DATA[draft.pool].map((tier) => (
          <View key={tier.tier} className={`gap-1 rounded-xl border p-3 ${recommendation.tier?.tier === tier.tier ? "border-[#a78bfa] bg-[#a78bfa]/25" : "border-white/20 bg-white/10"}`}>
            <View className="flex-row items-center justify-between">
              <Typography.Paragraph className="font-semibold text-white">第 {tier.tier} 階 · {formatCurrency(tier.price)}／包</Typography.Paragraph>
              {recommendation.tier?.tier === tier.tier ? <Typography className="text-[#cdbdff]">推薦</Typography> : null}
            </View>
            <Typography className="text-white/55">{tier.packPulls != null ? `${tier.packPulls} 抽／包` : "抽數未固定"}{tier.qty ? ` · 限購 ${tier.qty} 包` : ""} · 買滿 {formatCurrency(tier.cumCost)}</Typography>
          </View>
        ))}
      </Card>

      <PlannerSectionNative
        calculatorPool={draft.pool}
        calculatorTargetPulls={draft.pulls}
        currentDia={draft.cur}
        currentTickets={draft.tickets}
        onRecordGap={recordGoalGap}
        onApplyResources={(diamonds, tickets) => {
          model.updateNumber("cur", diamonds);
          model.updateNumber("tickets", tickets);
        }}
      />
    </NativePage>
  );
}
