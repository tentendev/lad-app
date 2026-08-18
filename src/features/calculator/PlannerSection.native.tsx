import { useMemo, useState } from "react";
import { ScrollView, Share, Switch, TextInput, View } from "react-native";
import { Button, Card, Typography } from "heroui-native";

import { recommendPacksForGap, type GapPackRecommendation } from "@/domain/calculator";
import { formatCurrency, formatNumber, todayKey } from "@/domain/format";
import { pullPlanToText } from "@/domain/planner";
import { POOLS, type Pool, type PullGoal, type ResourceCheckIn } from "@/domain/types";
import { usePlannerModel } from "./usePlannerModel";

function PlannerField({
  label,
  value,
  onChange,
  keyboardType = "default",
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  keyboardType?: "default" | "numeric";
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <View className="gap-1.5">
      <Typography className="text-xs text-white/65">{label}</Typography>
      <TextInput
        accessibilityLabel={label}
        className="min-h-12 rounded-xl border border-white/35 bg-white/10 px-4 py-3 text-white"
        editable={!disabled}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,.5)"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

function signedNumber(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}

export function PlannerSectionNative({
  calculatorPool,
  calculatorTargetPulls,
  currentDia,
  currentTickets,
  onApplyResources,
  onRecordGap,
}: {
  calculatorPool: Pool;
  calculatorTargetPulls: number;
  currentDia: number;
  currentTickets: number;
  onApplyResources: (diamonds: number, tickets: number) => void;
  onRecordGap: (goal: PullGoal, plan: GapPackRecommendation) => Promise<boolean>;
}) {
  const resources = useMemo(() => ({ currentDia, currentTickets }), [currentDia, currentTickets]);
  const model = usePlannerModel(resources);
  const [deletedGoal, setDeletedGoal] = useState<PullGoal | null>(null);
  const [deletedCheckIn, setDeletedCheckIn] = useState<ResourceCheckIn | null>(null);
  const [checkInDate, setCheckInDate] = useState(todayKey());
  const [checkInDiamonds, setCheckInDiamonds] = useState(String(currentDia));
  const [checkInTickets, setCheckInTickets] = useState(String(currentTickets));
  const [checkInNote, setCheckInNote] = useState("");
  const [recordingGoalId, setRecordingGoalId] = useState<number | null>(null);

  async function removeGoal(goal: PullGoal) {
    if (await model.deleteGoal(goal.id)) setDeletedGoal(goal);
  }

  async function undoDelete() {
    if (!deletedGoal) return;
    if (await model.restoreGoal(deletedGoal)) setDeletedGoal(null);
  }

  async function saveCheckIn() {
    const saved = await model.saveCheckIn({ date: checkInDate, diamonds: Number(checkInDiamonds), tickets: Number(checkInTickets), note: checkInNote });
    if (saved) setCheckInNote("");
  }

  async function removeCheckIn(checkIn: ResourceCheckIn) {
    if (await model.deleteCheckIn(checkIn.id)) setDeletedCheckIn(checkIn);
  }

  async function undoCheckInDelete() {
    if (!deletedCheckIn) return;
    if (await model.restoreCheckIn(deletedCheckIn)) setDeletedCheckIn(null);
  }

  async function recordGap(goal: PullGoal, plan: GapPackRecommendation) {
    setRecordingGoalId(goal.id);
    try {
      await onRecordGap(goal, plan);
    } finally {
      setRecordingGoalId(null);
    }
  }

  const recentCheckIns = [...model.planner.checkIns]
    .sort((left, right) => right.date.localeCompare(left.date) || right.id - left.id)
    .slice(0, 5);

  if (!model.ready) {
    return (
      <Card className="gap-4 border border-white/40 bg-[#493b70]/70 p-4" accessibilityRole="progressbar">
        <Typography className="text-sm text-white/70">正在讀取活動規劃…</Typography>
        <View className="h-12 rounded-xl bg-white/10" />
        <View className="h-32 rounded-2xl bg-white/10" />
      </Card>
    );
  }

  return (
    <View className="gap-4">
      <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="gap-1">
          <Typography className="text-xs uppercase tracking-[2px] text-white/55">Multi-event planner</Typography>
          <Typography.Heading className="text-xl text-white">活動抽卡規劃</Typography.Heading>
          <Typography.Paragraph className="text-sm leading-6 text-white/70">
            以目前 {formatNumber(currentDia)} 鑽、{formatNumber(currentTickets)} 張金券為起點；金券只計入一次，再依活動截止日分配存鑽。
          </Typography.Paragraph>
        </View>

        {model.storageError ? <View accessibilityRole="alert" className="rounded-xl border border-[#ffafbd] bg-[#ff6675]/20 p-3"><Typography className="text-sm text-white">{model.storageError}</Typography></View> : null}
        {model.handoffNotice ? <View accessibilityRole="alert" className="rounded-xl border border-[#9cf0dc] bg-[#65d6c4]/20 p-3"><Typography className="text-sm text-white">{model.handoffNotice}</Typography></View> : null}
        {deletedGoal ? (
          <View accessibilityRole="alert" className="flex-row items-center justify-between gap-3 rounded-xl border border-white/35 bg-white/10 p-3">
            <Typography className="flex-1 text-sm text-white">已移除「{deletedGoal.title}」。</Typography>
            <Button size="sm" variant="ghost" isDisabled={model.writeProtected || model.busy} onPress={() => void undoDelete()}>復原</Button>
          </View>
        ) : null}

        <View className="gap-2 rounded-2xl border border-white/25 bg-white/10 p-3">
          <PlannerField
            label="每月可存鑽石"
            keyboardType="numeric"
            disabled={model.writeProtected || model.busy}
            value={model.incomeDraft}
            onChange={model.setIncomeDraft}
          />
          <Button isDisabled={model.writeProtected || model.busy} variant="secondary" onPress={() => void model.saveMonthlyIncome()}>{model.busy ? "儲存中…" : "更新預測"}</Button>
        </View>

        <View className="gap-3 border-t border-white/20 pt-4">
          <PlannerField
            label="規劃名稱"
            placeholder="例如：黎深生日池"
            disabled={model.writeProtected || model.busy}
            value={model.goalDraft.title}
            onChange={(value) => model.updateGoalDraft("title", value)}
          />
          <View className="gap-1.5">
            <Typography className="text-xs text-white/65">卡池類型</Typography>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
              {POOLS.map((pool) => (
                <Button
                  key={pool}
                  size="sm"
                  isDisabled={model.writeProtected || model.busy}
                  variant={model.goalDraft.pool === pool ? "primary" : "secondary"}
                  onPress={() => model.updateGoalDraft("pool", pool)}
                >
                  {pool}
                </Button>
              ))}
            </ScrollView>
          </View>
          <PlannerField
            label="目標抽數"
            keyboardType="numeric"
            placeholder="70"
            disabled={model.writeProtected || model.busy}
            value={model.goalDraft.targetPulls ? String(model.goalDraft.targetPulls) : ""}
            onChange={(value) => model.updateGoalDraft("targetPulls", Number(value))}
          />
          <PlannerField
            label="活動截止日（YYYY-MM-DD）"
            placeholder="2026-09-07"
            disabled={model.writeProtected || model.busy}
            value={model.goalDraft.deadline}
            onChange={(value) => model.updateGoalDraft("deadline", value)}
          />
          <View className="min-h-12 flex-row items-center justify-between rounded-xl border border-white/30 bg-white/10 px-3">
            <Typography className="text-sm text-white/75">這是預測日期</Typography>
            <Switch
              accessibilityLabel="這是預測日期"
              disabled={model.writeProtected || model.busy}
              value={model.goalDraft.tentative}
              onValueChange={(value) => model.updateGoalDraft("tentative", value)}
            />
          </View>
          {model.goalDraft.sourceEvent ? <Typography className="text-xs leading-5 text-white/60">已從排期帶入名稱、卡池與截止日；請填目標抽數後儲存。</Typography> : null}
          {model.formError ? <Typography accessibilityRole="alert" className="text-sm text-[#fff0c4]">{model.formError}</Typography> : null}
          <View className="flex-row gap-2">
            <Button className="flex-1" isDisabled={model.writeProtected || model.busy} onPress={() => void model.saveGoal()}>
              {model.busy ? "儲存中…" : model.editingId === null ? "加入規劃" : "儲存修改"}
            </Button>
            {model.editingId !== null ? <Button variant="ghost" isDisabled={model.busy} onPress={model.cancelEditing}>取消</Button> : null}
          </View>
          {calculatorTargetPulls > 0 ? (
            <Button
              variant="secondary"
              isDisabled={model.writeProtected || model.busy}
              onPress={() => {
                model.updateGoalDraft("pool", calculatorPool);
                model.updateGoalDraft("targetPulls", calculatorTargetPulls);
              }}
            >
              套用上方 {formatNumber(calculatorTargetPulls)} 抽 · {calculatorPool}
            </Button>
          ) : null}
        </View>
      </Card>

      <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="gap-1"><Typography className="text-xs uppercase tracking-[2px] text-white/55">Progress Check-in</Typography><Typography.Heading className="text-xl text-white">資源進度</Typography.Heading></View>
        <Typography.Paragraph className="text-sm leading-6 text-white/70">定期記下實際鑽石與金券，回頭查看進度變化；套用最新紀錄後，活動預測會立即重算。</Typography.Paragraph>
        {deletedCheckIn ? <View accessibilityRole="alert" className="flex-row items-center justify-between gap-3 rounded-xl border border-white/35 bg-white/10 p-3"><Typography className="flex-1 text-sm text-white">已移除 {deletedCheckIn.date} 的進度。</Typography><Button size="sm" variant="ghost" isDisabled={model.writeProtected || model.busy} onPress={() => void undoCheckInDelete()}>復原</Button></View> : null}
        <PlannerField label="資源進度日期（YYYY-MM-DD）" value={checkInDate} onChange={(value) => { model.clearCheckInError(); setCheckInDate(value); }} disabled={model.writeProtected || model.busy} />
        <PlannerField label="資源進度鑽石" value={checkInDiamonds} onChange={(value) => { model.clearCheckInError(); setCheckInDiamonds(value); }} keyboardType="numeric" disabled={model.writeProtected || model.busy} />
        <PlannerField label="資源進度金券" value={checkInTickets} onChange={(value) => { model.clearCheckInError(); setCheckInTickets(value); }} keyboardType="numeric" disabled={model.writeProtected || model.busy} />
        <PlannerField label="資源進度備註（選填）" value={checkInNote} onChange={(value) => { model.clearCheckInError(); setCheckInNote(value); }} placeholder="例如：活動獎勵已領" disabled={model.writeProtected || model.busy} />
        {model.checkInError ? <Typography accessibilityRole="alert" className="text-sm text-[#fff0c4]">{model.checkInError}</Typography> : null}
        <Button isDisabled={model.writeProtected || model.busy} onPress={() => void saveCheckIn()}>{model.busy ? "儲存中…" : "儲存這天進度"}</Button>
        {model.checkInSummary.latest ? (
          <View className="gap-3 rounded-2xl border border-white/25 bg-white/10 p-3">
            <View className="flex-row gap-2">
              <View className="flex-1"><Typography className="text-[10px] text-white/50">最新 · {model.checkInSummary.latest.date}</Typography><Typography className="text-sm font-semibold text-white">{formatNumber(model.checkInSummary.latest.diamonds)} 鑽＋{formatNumber(model.checkInSummary.latest.tickets)} 券</Typography></View>
              <View className="flex-1"><Typography className="text-[10px] text-white/50">比上次</Typography><Typography className="text-sm font-semibold text-white">{model.checkInSummary.changeEquivalentDia === null ? "尚無比較" : `${model.checkInSummary.changeEquivalentDia >= 0 ? "+" : ""}${formatNumber(model.checkInSummary.changeEquivalentDia)} 鑽`}</Typography></View>
            </View>
            <Button size="sm" variant="secondary" onPress={() => onApplyResources(model.checkInSummary.latest!.diamonds, model.checkInSummary.latest!.tickets)}>套用到換算</Button>
          </View>
        ) : <Typography.Paragraph className="py-4 text-center text-white/60">尚無資源進度</Typography.Paragraph>}
        <View className={`gap-1 rounded-xl border p-3 ${model.pace.status === "behind" ? "border-[#ffe08a]/60 bg-[#ffe08a]/10" : "border-white/25 bg-white/10"}`} accessibilityRole="summary">
          <Typography className="text-[10px] text-white/50">{model.pace.status === "safe" ? "目前節奏" : model.pace.target?.goal.title ?? "下一項目標"}</Typography>
          <Typography className="text-xs font-semibold leading-5 text-white">
            {model.pace.status === "safe"
              ? "目前目標不需額外追趕，維持現有規劃即可。"
              : model.pace.status === "unknown"
                ? `依這份規劃，資源每天需淨增 ${formatNumber(model.pace.requiredDailyDia)} 鑽；再記一筆不同日期的進度，就能比較實際速度。`
                : model.pace.status === "on-track"
                  ? `實際日均 ${signedNumber(model.pace.actualDailyDia ?? 0)} 鑽，達到規劃所需 ${formatNumber(model.pace.requiredDailyDia)} 鑽／日。`
                  : `實際日均 ${signedNumber(model.pace.actualDailyDia ?? 0)} 鑽，距規劃所需 ${formatNumber(model.pace.requiredDailyDia)} 鑽／日仍少 ${formatNumber(Math.abs(model.pace.dailyDelta ?? 0))} 鑽。`}
          </Typography>
        </View>
        {recentCheckIns.map((checkIn) => (
          <View key={checkIn.id} className="flex-row items-center gap-3 border-t border-white/15 pt-3">
            <View className="flex-1"><Typography className="text-sm text-white">{checkIn.date}</Typography><Typography className="text-xs text-white/55">{formatNumber(checkIn.diamonds)} 鑽 · {formatNumber(checkIn.tickets)} 券{checkIn.note ? ` · ${checkIn.note}` : ""}</Typography></View>
            <Button size="sm" variant="ghost" isDisabled={model.writeProtected || model.busy} onPress={() => void removeCheckIn(checkIn)}>移除</Button>
          </View>
        ))}
      </Card>

      <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View>
            <Typography className="text-xs uppercase tracking-[2px] text-white/55">Forecast</Typography>
            <Typography.Heading className="text-xl text-white">資源時間線</Typography.Heading>
          </View>
          <View className={`rounded-full border px-2 py-1 ${model.forecast.peakShortfallDia > 0 ? "border-[#ffe08a]" : "border-[#7af0c8]"}`}>
            <Typography className="text-[10px] text-white">
              {model.forecast.goals.length === 0 ? "尚無目標" : model.forecast.peakShortfallDia > 0 ? `全程差 ${formatNumber(model.forecast.peakShortfallDia)} 鑽` : `最後剩 ${formatNumber(model.forecast.endingDia)} 鑽`}
            </Typography>
          </View>
        </View>
        <Button size="sm" variant="secondary" isDisabled={!model.forecast.goals.length} onPress={() => void Share.share({ message: pullPlanToText(model.forecast), title: "深空省省活動抽卡規劃" })}>分享規劃摘要</Button>

        {model.forecast.goals.length === 0 ? (
          <Typography.Paragraph className="py-6 text-center leading-6 text-white/60">先新增目標，或從排期點「加入規劃」，就能看到跨活動的鑽石餘額。</Typography.Paragraph>
        ) : null}

        {model.forecast.goals.map((item) => {
          const gapPlan = recommendPacksForGap(item.goal.pool, item.shortfallDia);
          return (
          <View key={item.goal.id} className="gap-3 rounded-2xl border border-white/25 bg-white/10 p-3">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1">
                <Typography.Paragraph className="font-semibold text-white">{item.goal.title}</Typography.Paragraph>
                <Typography className="text-xs text-white/55">{item.goal.deadline}{item.goal.tentative ? " · 預測" : ""} · {item.goal.pool}</Typography>
              </View>
              <View className={`rounded-full border px-2 py-1 ${item.status === "short" ? "border-[#ffe08a]" : item.status === "safe" ? "border-[#7af0c8]" : "border-white/25"}`}>
                <Typography className="text-[10px] text-white">{item.status === "past" ? "已結束" : item.status === "skipped" ? "情境暫停" : item.status === "short" ? "需要調整" : "可達成"}</Typography>
              </View>
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1 rounded-xl bg-white/10 p-2"><Typography.Heading className="text-lg text-white">{formatNumber(item.goal.targetPulls)}</Typography.Heading><Typography className="text-[10px] text-white/50">目標抽數</Typography></View>
              <View className="flex-1 rounded-xl bg-white/10 p-2"><Typography.Heading className="text-lg text-white">{formatNumber(item.officialTickets)}</Typography.Heading><Typography className="text-[10px] text-white/50">官方金券</Typography></View>
              <View className="flex-1 rounded-xl bg-white/10 p-2"><Typography.Heading className="text-lg text-white">{formatNumber(item.incomeBeforeGoal)}</Typography.Heading><Typography className="text-[10px] text-white/50">期間存鑽</Typography></View>
            </View>
            <Typography className={`text-xs leading-5 ${item.status === "short" ? "text-[#fff0c4]" : "text-white/70"}`}>
              {item.status === "past" ? "活動已結束，不再影響後續預測。" : item.status === "skipped" ? "這項目標暫不扣除資源；期間存鑽仍會留給後續活動。" : item.status === "short" ? `到期後仍差 ${formatNumber(item.shortfallDia)} 鑽；若不調整目標，平均每天需再多存 ${formatNumber(item.additionalDailyDia)} 鑽。` : `完成後預計剩 ${formatNumber(item.balanceAfterGoal)} 鑽。`}
            </Typography>
            {item.status === "short" ? (
              <View className="gap-1 rounded-xl border border-[#ffe08a]/50 bg-[#ffe08a]/10 p-3">
                <Typography className="text-[10px] uppercase tracking-[1.5px] text-[#fff0c4]">截至這項活動的補足估算</Typography>
                <Typography className="text-xs font-semibold leading-5 text-white">
                  {gapPlan.status === "recommended"
                    ? `約 NT$${formatNumber(gapPlan.planCost ?? 0)} · ${formatNumber(gapPlan.planPulls ?? 0)} 抽 · 買到第 ${gapPlan.tier?.tier} 階`
                    : `一輪限購最多補 ${formatNumber(gapPlan.planPulls ?? 0)} 抽（${formatCurrency(gapPlan.planCost ?? 0)}）；其餘 ${formatNumber(Math.max(0, gapPlan.gapPulls - (gapPlan.planPulls ?? 0)))} 抽需搭配存鑽、其他有效資源或調整目標。`}
                </Typography>
                {gapPlan.status === "recommended" ? (
                  <Button size="sm" variant="secondary" isDisabled={recordingGoalId !== null} onPress={() => void recordGap(item.goal, gapPlan)}>
                    {recordingGoalId === item.goal.id ? "帶入中…" : "帶入錢包記帳"}
                  </Button>
                ) : null}
              </View>
            ) : null}
            <View className="flex-row justify-end gap-2">
              <Button size="sm" variant="ghost" isDisabled={model.writeProtected || model.busy} onPress={() => void model.toggleGoal(item.goal.id)}>{item.goal.enabled ? "暫停情境" : "重新納入"}</Button>
              <Button size="sm" variant="ghost" isDisabled={model.busy} onPress={() => model.startEditing(item.goal)}>編輯</Button>
              <Button size="sm" variant="ghost" isDisabled={model.writeProtected || model.busy} onPress={() => void removeGoal(item.goal)}>移除</Button>
            </View>
          </View>
          );
        })}
        <Typography className="text-xs leading-5 text-white/55">預測將每月可存鑽石換算為每日平均，依截止日累加；每個活動的官方金券只用於該活動。補足估算依目前禮包階梯由前往後購買，不重複計算官方金券；各目標獨立呈現，未假設前一項估算已實際購買。結果供規劃參考，實際獲取、價格與卡池規則仍以遊戲公告為準。</Typography>
      </Card>
    </View>
  );
}
