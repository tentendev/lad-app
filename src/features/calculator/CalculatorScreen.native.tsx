import { NativeDisclosure } from "@/ui/NativeDisclosure";
import { NativeMetricGrid } from "@/ui/NativeMetricGrid";
import { NativeInput as TextInput } from "@/ui/NativeInput";
import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Typography } from "@/ui/NativeComponents";
import Svg, { Path, Rect } from "react-native-svg";

import { DIA_PER_PULL, MONTHLY_DIA, PACK_OTHER } from "@/data/packs";
import { bestTierPrice, type GapPackRecommendation } from "@/domain/calculator";
import { CURRENCY_LABELS, CURRENCY_SYMBOLS, formatCurrency as formatMoney, formatNumber } from "@/domain/format";
import { CURRENCIES, CALCULATOR_POOLS, type PullGoal } from "@/domain/types";
import { NativePage } from "@/ui/NativePage";
import { NativeSelect } from "@/ui/NativeSelect";
import { NativeColumns } from "@/ui/NativeColumns";
import { useCalculatorModel } from "./useCalculatorModel";
import { PlannerSectionNative } from "./PlannerSection.native";
import { SubscriptionCostReference } from "./SubscriptionCostReference";

function CalculatorGlyph({ type }: { type: "diamond" | "gift" | "steps" }) {
  if (type === "gift") {
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#80639f" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={3} y={9} width={18} height={12} rx={2} />
        <Path d="M12 9v12M3 13h18M12 9H7.5A2.5 2.5 0 0 1 10 5.5c1.1 0 2 1.6 2 3.5Zm0 0h4.5A2.5 2.5 0 0 0 14 5.5c-1.1 0-2 1.6-2 3.5Z" />
      </Svg>
    );
  }
  if (type === "steps") {
    return <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#80639f" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><Path d="M5 18h4v-4h4v-4h4V6h3" /></Svg>;
  }
  return <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#80639f" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><Path d="m12 3 7 6-7 12L5 9l7-6Zm-7 6h14M9 9l3 12 3-12M9 3l3 6 3-6" /></Svg>;
}

function NumberField({ placeholder, value, onChange, showZero = false, decimal = false }: { placeholder: string; value: number; showZero?: boolean; decimal?: boolean; onChange: (value: number) => void }) {
  const [input, setInput] = useState({ value, text: value || showZero ? String(value) : "" });
  if (input.value !== value) setInput({ value, text: value || showZero ? String(value) : "" });
  return (
    <View className="gap-2"><Typography className="type-label text-muted">{placeholder}</Typography><TextInput
      accessibilityLabel={placeholder}
      className="rounded-xl border border-line bg-white/70 px-4 py-3 text-ink"
      keyboardType={decimal ? "decimal-pad" : "number-pad"}
      placeholder={placeholder}
      placeholderTextColor="#887d94"
      value={input.text}
      onChangeText={next => { const number = Number(next); setInput({ value: number, text: next }); onChange(number); }}
    /></View>
  );
}

export function CalculatorScreenNative() {
  const model = useCalculatorModel();
  const router = useRouter();
  const { draft, resource, recommendation, selectedPacks } = model;
  const formatCurrency = (value: number | null) => formatMoney(value, draft.currency);
  const [rulesOpen, setRulesOpen] = useState(false);
  const bestPer = bestTierPrice(draft.pool, draft.currency);

  async function recordRecommendation() {
    const saved = await model.saveSelectedPacksAsExpense();
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
      <NativePage workspace eyebrow="Pull Planner" title="換算" description={`把鑽石、金券、官方返券與預留資源一起算清楚。每抽 ${DIA_PER_PULL} 鑽。`}>
        <Card className="gap-4 border border-line bg-glass p-4" accessibilityRole="progressbar">
          <Typography className="type-body text-muted">正在讀取換算設定…</Typography>
          <View className="h-12 rounded-xl bg-white/70" />
          <View className="h-40 rounded-2xl bg-white/70" />
        </Card>
      </NativePage>
    );
  }

  return (
    <NativePage workspace eyebrow="Pull Planner" title="換算" description={`把鑽石、金券、官方返券與預留資源一起算清楚。每抽 ${DIA_PER_PULL} 鑽。`}>
      {model.storageError ? <View accessibilityRole="alert" className="rounded-xl border border-[#ffafbd] bg-[#ff6675]/20 p-3"><Typography className="type-body text-ink">{model.storageError}</Typography></View> : null}
      {model.targetHandoff ? (
        <View accessibilityRole="alert" className="gap-2 rounded-xl border border-[#9cf0dc] bg-[#65d6c4]/15 p-3">
          <Typography className="type-body text-ink">已從追蹤帶入：{model.targetHandoff}。請確認卡池類型與現有資源後再採用建議。</Typography>
          <Button size="sm" variant="ghost" onPress={model.clearTargetHandoff}>知道了</Button>
        </View>
      ) : null}

      <NativeColumns>
      <View className="gap-3">
      <Card className="gap-4 border border-line bg-glass p-4">
        <View className="flex-row flex-wrap items-center justify-between gap-2"><View className="flex-row items-center gap-2"><CalculatorGlyph type="diamond" /><Typography.Heading type="h4" className="type-title text-ink">抽卡目標換算</Typography.Heading></View><Button size="sm" variant="ghost" onPress={() => void model.reset()}>重設換算</Button></View>
        <NativeSelect label="① 先選擇卡池類型" value={draft.pool} options={CALCULATOR_POOLS} onChange={model.setPool} />
        <Typography className="type-label text-muted">② 再輸入持有資源與抽卡目標</Typography>
        <NumberField placeholder="目前持有（鑽）" value={draft.cur} onChange={value => model.updateNumber("cur", value)} />
        <NumberField placeholder="目標抽數" value={draft.pulls} onChange={(value) => model.updateNumber("pulls", value)} />
        <Button variant="ghost" accessibilityState={{ expanded: rulesOpen }} onPress={() => setRulesOpen(!rulesOpen)}>保底與繼承規則 {rulesOpen ? "⌃" : "⌄"}</Button>
        {rulesOpen ? <View className="gap-2 rounded-xl bg-white/70 p-3"><Typography className="type-body text-muted">日卡池以外的活動池：140 抽內必得當期活動五星卡。日卡池：140 抽可得活動五星卡；累計 150 抽會送自選盒，選一張當期日卡。一般活動池之間會繼承抽數；復刻池只繼承同一復刻池的抽數。</Typography><Typography className="type-label text-muted">沿用原始版整理，實際規則以當期遊戲內公告為準。</Typography></View> : null}
        <NumberField placeholder="原本剩餘金券（張）" value={draft.tickets} onChange={value => model.updateNumber("tickets", value)} />
        <View className="rounded-xl border border-line bg-white/70 p-3">
          <NumberField showZero placeholder="官方金券（張）" value={resource.officialTickets} onChange={model.setOfficialTickets} />
          <Button size="sm" variant="ghost" onPress={model.restoreOfficialTickets}>恢復自動</Button>
          {Object.hasOwn(draft.officialTicketsByPool ?? {}, draft.pool) ? <Typography className="text-muted">手動設定 {resource.officialTickets} 張 · 規則估算 {resource.initialTickets + resource.milestoneTickets} 張，可按「恢復自動」還原</Typography> : null}
          <Typography className="text-muted">免費贈送 {resource.initialTickets} 張 · 目標前可折抵累抽返還 {resource.milestoneTickets} 張</Typography>
        </View>
        <View className="flex-row flex-wrap items-end gap-2">
          <View className="w-full"><NumberField decimal={draft.reserveUnit === "pulls"} placeholder={`預留資源（${draft.reserveUnit === "dia" ? "鑽" : "抽"}）`} value={draft.reserve} onChange={(value) => model.updateNumber("reserve", value)} /></View>
          <Button accessibilityLabel="預留資源使用抽數" size="sm" variant={draft.reserveUnit === "pulls" ? "primary" : "secondary"} onPress={() => model.setReserveUnit("pulls")}>抽</Button>
          <Button accessibilityLabel="預留資源使用鑽石" size="sm" variant={draft.reserveUnit === "dia" ? "primary" : "secondary"} onPress={() => model.setReserveUnit("dia")}>鑽</Button>
        </View>
        <Typography className="text-muted">相當於 {formatNumber(resource.reservePulls)} 抽 · {formatNumber(resource.reserveDia)} 鑽</Typography>
        <NativeMetricGrid>
          <View className="flex-1 items-center gap-1 rounded-[15px] border border-line bg-white/70 p-3"><Typography.Heading type="h4" className="type-headline text-ink">{formatNumber(resource.gapDia)}</Typography.Heading><Typography className="type-label text-muted">還差幾鑽</Typography></View>
          <View className="flex-1 items-center gap-1 rounded-[15px] border border-line bg-white/70 p-3"><Typography.Heading type="h4" className="type-headline text-ink">{resource.paidPulls}</Typography.Heading><Typography className="type-label text-muted">換算需課金幾抽</Typography></View>
          <View className="flex-1 items-center gap-1 rounded-[15px] border border-line bg-white/70 p-3"><Typography.Heading type="h4" className="type-headline text-ink">{formatNumber(selectedPacks.remainingDiaAfterTarget)}</Typography.Heading><Typography className="type-label text-muted">目標後剩餘鑽</Typography></View>
        </NativeMetricGrid>
        <Typography accessibilityRole="summary" accessibilityLiveRegion="polite" className="type-body text-ink">{resource.totalPulls <= 0 ? "填入目標抽數，開始試算。" : resource.gapDia === 0 ? `鑽石充足！現有資源可抽 ${formatNumber(resource.availablePulls)} 抽，已達成 ${formatNumber(resource.totalPulls)} 抽目標。` : `還差 ${formatNumber(resource.gapDia)} 鑽，換算需課金 ${resource.paidPulls} 抽。`}</Typography>
        <NativeDisclosure title="查看計算明細">
          <Typography className="type-body text-muted">目標 {formatNumber(resource.targetPulls)} 抽＋預留 {formatNumber(resource.reservePulls)} 抽＝共 {formatNumber(resource.totalPulls)} 抽</Typography>
          <Typography className="type-body text-muted">原有金券 {formatNumber(draft.tickets)} 張＋官方可用金券 {formatNumber(resource.officialTickets)} 張</Typography>
          <Typography className="type-body text-muted">扣除金券後需 {formatNumber(resource.requiredDia)} 鑽；目前持有 {formatNumber(draft.cur)} 鑽</Typography>
          <Typography className="type-body text-muted">現有資源合計可抽 {formatNumber(resource.availablePulls)} 抽（每抽 {DIA_PER_PULL} 鑽）</Typography>
          <Typography className="type-body text-muted">課金抽數＝還差鑽石 ÷ {DIA_PER_PULL}，無條件進位</Typography>
          {resource.savingMonths > 0 ? <Typography className="type-body text-muted">月卡黨每月約 {formatNumber(MONTHLY_DIA)} 鑽 · 純存約還需 {resource.savingMonths} 個月達標</Typography> : null}
        </NativeDisclosure>
      </Card>
      </View>

      <Card className="gap-3 border border-line bg-glass p-5">
        <View className="flex-row items-center gap-2"><CalculatorGlyph type="gift" /><Typography className="text-muted">課金禮包試算 · {draft.pool}</Typography></View>
        <NativeSelect label="禮包幣別" value={draft.currency ?? "TWD"} options={CURRENCIES} formatOption={currency => `${CURRENCY_LABELS[currency]} · ${CURRENCY_SYMBOLS[currency]}`} onChange={model.setCurrency} />
        <Typography.Heading type="h4" className="type-headline text-ink">
          {recommendation.status === "recommended" ? `買到第 ${recommendation.tier?.tier} 階` : recommendation.status === "enough" ? "無需課金" : recommendation.status === "overflow" ? "超過單輪上限" : recommendation.status === "missing-price" ? "地區售價待確認" : "等待目標"}
        </Typography.Heading>
        {recommendation.status === "recommended" ? (
          <>
            <Typography.Heading type="h4" className="type-display text-ink">{formatCurrency(recommendation.planCost ?? 0)}</Typography.Heading>
            <Typography.Paragraph className="text-muted">還需課金 {recommendation.gapPulls} 抽；最後一階買 {recommendation.packsAtTier} 包，共取得 {formatNumber(recommendation.planPulls ?? 0)} 抽。</Typography.Paragraph>

          </>
        ) : (
          <Typography.Paragraph className="text-muted">
            {recommendation.status === "enough" ? "現有資源已達成目標。" : recommendation.status === "overflow" ? `還需 ${recommendation.gapPulls} 抽；一輪限購最多補 ${formatNumber(recommendation.planPulls ?? 0)} 抽（${formatCurrency(recommendation.planCost ?? 0)}），其餘 ${formatNumber(Math.max(0, recommendation.gapPulls - (recommendation.planPulls ?? 0)))} 抽需搭配存鑽、其他有效資源或下輪禮包。` : recommendation.status === "missing-price" ? "缺少地區售價，請先確認價格後再記帳。" : "填入目標後顯示建議。"}
          </Typography.Paragraph>
        )}
        {model.tiers.some(tier => tier.priceStatus === "estimated") ? <Typography accessibilityRole="alert" className="type-label text-muted">標示「推估」的價格尚待確認，購買前請以遊戲內售價為準。</Typography> : null}
        <SubscriptionCostReference currency={draft.currency} />
      </Card>

      </NativeColumns>

      <NativeColumns>
      <Card className="gap-3 border border-line bg-glass p-4">
        <View className="flex-row items-center gap-2"><CalculatorGlyph type="steps" /><Typography.Heading type="h4" className="type-title text-ink">階梯明細</Typography.Heading></View>
        <Button variant="secondary" onPress={model.applyRecommendedPacks}>套用建議包數</Button>
        {draft.pool === "其他" ? <View className="gap-2"><Typography className="text-muted">定期禮包以台灣原始售價列示，海外價格待確認。</Typography>{PACK_OTHER.map(pack => <Typography className="text-muted" key={pack.name}>{pack.name} · {formatMoney(pack.price)} · 每抽 {formatMoney(pack.per)}</Typography>)}</View> : null}
        {model.tiers.map((tier, index) => (
          <View key={tier.tier} className={`gap-1 rounded-xl border p-3 ${recommendation.tier?.tier === tier.tier ? "border-[#a78bfa] bg-[#a78bfa]/25" : "border-line bg-white/70"}`}>
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <Typography.Paragraph className="font-semibold text-ink">第 {tier.tier} 階 · {formatCurrency(tier.price)}／包{tier.priceStatus === "estimated" ? "（推估）" : ""}</Typography.Paragraph>
              {recommendation.tier?.tier === tier.tier ? <Typography className="text-orbit">推薦</Typography> : null}
            </View>
            <Typography className="type-label text-muted">{tier.per != null ? `${tier.per === bestPer ? "單抽最低 " : ""}${formatCurrency(tier.per)}／抽` : "每抽成本待確認"}</Typography>
            <NativeSelect label={`第${tier.tier}階購買包數`} value={String(selectedPacks.quantities[index] ?? 0)} options={Array.from({ length: (tier.qty ?? 1) + 1 }, (_, quantity) => String(quantity))} formatOption={quantity => `${quantity} 包`} onChange={quantity => model.setPackQuantity(index, Number(quantity))} />
            <NativeDisclosure title={`第${tier.tier}階禮包明細`}>
              <Typography className="type-body text-muted">{tier.packPulls != null ? `${tier.packPulls} 抽／包` : "抽數未固定"} · 限購 {tier.qty ?? 1} 包</Typography>
              <Typography className="type-body text-muted">買滿本階後，{tier.packPulls != null ? `累計 ${tier.cumPulls} 抽｜` : ""}共 {formatCurrency(tier.cumCost)}</Typography>
            </NativeDisclosure>
          </View>
        ))}
      </Card>

      <Card className="gap-3 border border-line bg-glass p-4">
        <Typography className="type-label text-muted">表內「累計」以第一階起依序買滿計算，手動調整包數後會保留選擇。</Typography>
        <Typography className="text-muted">已選購買禮包 · {selectedPacks.count} 包{selectedPacks.estimatedPrices ? " · 地區售價推估" : ""}</Typography>
        <Typography.Heading type="h4" className="type-headline text-ink">{formatCurrency(selectedPacks.cost)}</Typography.Heading>
        <Typography className="text-muted">已知 {formatNumber(selectedPacks.pulls)} 抽 · 尚差 {formatNumber(selectedPacks.missingPulls)} 抽</Typography>
        {selectedPacks.unknownPulls ? <Typography className="type-body text-warning">含抽數未固定的禮包，未計入抽數合計。</Typography> : null}
        <Button isDisabled={!selectedPacks.count || selectedPacks.missingPrices} onPress={() => void recordRecommendation()}>帶入錢包記帳</Button>
      </Card>

      </NativeColumns>

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
