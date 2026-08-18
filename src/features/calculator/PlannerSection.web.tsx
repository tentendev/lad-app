import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Input } from "@heroui/react/input";
import { useEffect, useMemo, useState } from "react";

import { recommendPacksForGap, type GapPackRecommendation } from "@/domain/calculator";
import { formatCurrency, formatNumber, todayKey } from "@/domain/format";
import { pullPlanToText } from "@/domain/planner";
import { POOLS, type Pool, type PullGoal, type ResourceCheckIn } from "@/domain/types";
import { DeviceDataLoading } from "@/ui/DeviceDataLoading.web";
import { RetryableError } from "@/ui/RetryableError.web";
import { usePlannerModel } from "./usePlannerModel";

function PlannerGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}

function focusControl(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}

function signedNumber(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}

export function PlannerSectionWeb({
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
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [recordingGoalId, setRecordingGoalId] = useState<number | null>(null);

  useEffect(() => {
    if (!model.ready || !model.goalDraft.sourceEvent) return;
    const timeout = window.setTimeout(() => {
      const heading = document.getElementById("pull-plan-title");
      heading?.scrollIntoView({ behavior: "smooth", block: "start" });
      heading?.focus({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(timeout);
  }, [model.goalDraft.sourceEvent, model.ready]);

  async function removeGoal(goal: PullGoal) {
    if (await model.deleteGoal(goal.id)) setDeletedGoal(goal);
  }

  async function undoDelete() {
    if (!deletedGoal) return;
    if (await model.restoreGoal(deletedGoal)) setDeletedGoal(null);
  }

  async function saveCheckIn() {
    const saved = await model.saveCheckIn({
      date: checkInDate,
      diamonds: Number(checkInDiamonds),
      tickets: Number(checkInTickets),
      note: checkInNote,
    });
    if (saved) setCheckInNote("");
    else focusControl("planner-checkin-date");
  }

  async function saveIncome() {
    const saved = await model.saveMonthlyIncome();
    if (!saved) focusControl("planner-income");
  }

  async function saveGoal() {
    const saved = await model.saveGoal();
    if (!saved) focusControl("planner-goal-title");
  }

  function applyCalculatorTarget() {
    model.updateGoalDraft("pool", calculatorPool);
    model.updateGoalDraft("targetPulls", calculatorTargetPulls);
    focusControl("planner-goal-title");
  }

  async function removeCheckIn(checkIn: ResourceCheckIn) {
    if (await model.deleteCheckIn(checkIn.id)) setDeletedCheckIn(checkIn);
  }

  async function undoCheckInDelete() {
    if (!deletedCheckIn) return;
    if (await model.restoreCheckIn(deletedCheckIn)) setDeletedCheckIn(null);
  }

  async function copyPlan() {
    const text = pullPlanToText(model.forecast);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const input = document.createElement("textarea");
      input.value = text;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setShareStatus("規劃摘要已複製");
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
    return <DeviceDataLoading label="正在讀取活動規劃…" />;
  }

  return (
    <section className="planner-section" id="pull-plan" aria-labelledby="pull-plan-title" aria-busy={model.busy}>
      <Card className="product-card planner-editor-card">
        <div className="section-heading">
          <div>
            <p className="card-kicker heading-with-icon"><PlannerGlyph />Multi-event Planner</p>
            <h2 className="section-title" id="pull-plan-title" tabIndex={-1}>活動抽卡規劃</h2>
          </div>
          <span className="section-meta">自動依截止日排序</span>
        </div>
        <p className="page-description">
          以目前 {formatNumber(currentDia)} 鑽、{formatNumber(currentTickets)} 張金券為起點；金券只計入一次，再把每月可存鑽石依時間分配到每個活動。
        </p>

        {model.storageError ? <RetryableError>{model.storageError}</RetryableError> : null}
        {model.handoffNotice ? <div className="status-note healthy" role="status">{model.handoffNotice}</div> : null}
        {deletedGoal ? (
          <div className="status-note undo-note" role="status">
            <span>已移除「{deletedGoal.title}」。</span>
            <button type="button" disabled={model.busy || model.writeProtected} onClick={() => void undoDelete()}>復原</button>
          </div>
        ) : null}

        <div className="planner-income-row">
          <label className="field-wrap">
            <span className="field-label">每月可存鑽石</span>
            <Input
              id="planner-income"
              aria-label="每月可存鑽石"
              aria-invalid={Boolean(model.formError)}
              aria-describedby={model.formError ? "planner-form-error" : undefined}
              type="number"
              min="0"
              disabled={model.writeProtected || model.busy}
              value={model.incomeDraft}
              onChange={(event) => model.setIncomeDraft(event.target.value)}
            />
          </label>
          <Button isDisabled={model.writeProtected || model.busy} onPress={() => void saveIncome()}>{model.busy ? "儲存中…" : "更新預測"}</Button>
        </div>

        <div className="planner-form" role="group" aria-label={model.editingId === null ? "新增抽卡目標" : "編輯抽卡目標"}>
          <div className="form-grid">
            <label className="field-wrap full">
              <span className="field-label">規劃名稱</span>
              <Input
                id="planner-goal-title"
                aria-label="規劃名稱"
                aria-invalid={Boolean(model.formError)}
                aria-describedby={model.formError ? "planner-form-error" : undefined}
                maxLength={120}
                disabled={model.writeProtected || model.busy}
                placeholder="例如：黎深生日池"
                value={model.goalDraft.title}
                onChange={(event) => model.updateGoalDraft("title", event.target.value)}
              />
            </label>
            <label className="field-wrap">
              <span className="field-label">卡池類型</span>
              <select
                className="native-select"
                aria-label="規劃卡池類型"
                aria-invalid={Boolean(model.formError)}
                aria-describedby={model.formError ? "planner-form-error" : undefined}
                disabled={model.writeProtected || model.busy}
                value={model.goalDraft.pool}
                onChange={(event) => model.updateGoalDraft("pool", event.target.value as Pool)}
              >
                {POOLS.map((pool) => <option key={pool}>{pool}</option>)}
              </select>
            </label>
            <label className="field-wrap">
              <span className="field-label">目標抽數</span>
              <Input
                aria-label="規劃目標抽數"
                aria-invalid={Boolean(model.formError)}
                aria-describedby={model.formError ? "planner-form-error" : undefined}
                type="number"
                min="1"
                disabled={model.writeProtected || model.busy}
                placeholder="70"
                value={model.goalDraft.targetPulls ? String(model.goalDraft.targetPulls) : ""}
                onChange={(event) => model.updateGoalDraft("targetPulls", Number(event.target.value))}
              />
            </label>
            <label className="field-wrap">
              <span className="field-label">活動截止日</span>
              <Input
                aria-label="活動截止日"
                aria-invalid={Boolean(model.formError)}
                aria-describedby={model.formError ? "planner-form-error" : undefined}
                type="date"
                disabled={model.writeProtected || model.busy}
                value={model.goalDraft.deadline}
                onChange={(event) => model.updateGoalDraft("deadline", event.target.value)}
              />
            </label>
            <label className="planner-check field-wrap">
              <span className="field-label">日期狀態</span>
              <span className="planner-check-control">
                <input
                  type="checkbox"
                  checked={model.goalDraft.tentative}
                  disabled={model.writeProtected || model.busy}
                  onChange={(event) => model.updateGoalDraft("tentative", event.target.checked)}
                />
                這是預測日期
              </span>
            </label>
          </div>
          {model.goalDraft.sourceEvent ? <p className="planner-source-note">已從排期帶入名稱、卡池與截止日；請填目標抽數後儲存。</p> : null}
          {model.formError ? <p className="field-error" id="planner-form-error" role="alert">{model.formError}</p> : null}
          <div className="form-actions">
            <Button isDisabled={model.writeProtected || model.busy} onPress={() => void saveGoal()}>
              {model.busy ? "儲存中…" : model.editingId === null ? "加入規劃" : "儲存修改"}
            </Button>
            {calculatorTargetPulls > 0 ? (
              <Button variant="ghost" isDisabled={model.writeProtected || model.busy} onPress={applyCalculatorTarget}>
                套用上方 {formatNumber(calculatorTargetPulls)} 抽 · {calculatorPool}
              </Button>
            ) : null}
            {model.editingId !== null ? <Button variant="ghost" isDisabled={model.busy} onPress={model.cancelEditing}>取消編輯</Button> : null}
          </div>
        </div>
      </Card>

      <Card className="product-card planner-checkin-card">
        <div className="section-heading">
          <div><p className="card-kicker">Progress Check-in</p><h2 className="section-title">資源進度</h2></div>
          <span className="section-meta">同日儲存會更新</span>
        </div>
        <p className="page-description">定期記下實際鑽石與金券，回頭查看進度變化；一鍵套用最新紀錄後，活動預測會立即重算。</p>
        {deletedCheckIn ? (
          <div className="status-note undo-note" role="status"><span>已移除 {deletedCheckIn.date} 的進度。</span><button type="button" disabled={model.busy || model.writeProtected} onClick={() => void undoCheckInDelete()}>復原</button></div>
        ) : null}
        <div className="checkin-form" role="group" aria-label="記錄資源進度">
          <label className="field-wrap"><span className="field-label">日期</span><Input id="planner-checkin-date" aria-label="資源進度日期" aria-invalid={Boolean(model.checkInError)} aria-describedby={model.checkInError ? "planner-checkin-error" : undefined} type="date" disabled={model.busy || model.writeProtected} value={checkInDate} onChange={(event) => { model.clearCheckInError(); setCheckInDate(event.target.value); }} /></label>
          <label className="field-wrap"><span className="field-label">目前鑽石</span><Input aria-label="資源進度鑽石" aria-invalid={Boolean(model.checkInError)} aria-describedby={model.checkInError ? "planner-checkin-error" : undefined} type="number" min="0" disabled={model.busy || model.writeProtected} value={checkInDiamonds} onChange={(event) => { model.clearCheckInError(); setCheckInDiamonds(event.target.value); }} /></label>
          <label className="field-wrap"><span className="field-label">目前金券</span><Input aria-label="資源進度金券" aria-invalid={Boolean(model.checkInError)} aria-describedby={model.checkInError ? "planner-checkin-error" : undefined} type="number" min="0" disabled={model.busy || model.writeProtected} value={checkInTickets} onChange={(event) => { model.clearCheckInError(); setCheckInTickets(event.target.value); }} /></label>
          <label className="field-wrap"><span className="field-label">備註（選填）</span><Input aria-label="資源進度備註" aria-invalid={Boolean(model.checkInError)} aria-describedby={model.checkInError ? "planner-checkin-error" : undefined} maxLength={120} disabled={model.busy || model.writeProtected} placeholder="例如：活動獎勵已領" value={checkInNote} onChange={(event) => { model.clearCheckInError(); setCheckInNote(event.target.value); }} /></label>
        </div>
        {model.checkInError ? <p className="field-error" id="planner-checkin-error" role="alert">{model.checkInError}</p> : null}
        <div className="form-actions"><Button fullWidth isDisabled={model.writeProtected || model.busy} onPress={() => void saveCheckIn()}>{model.busy ? "儲存中…" : "儲存這天進度"}</Button></div>

        {model.checkInSummary.latest ? (
          <div className="checkin-latest">
            <div><span>最新 · {model.checkInSummary.latest.date}</span><strong>{formatNumber(model.checkInSummary.latest.diamonds)} 鑽＋{formatNumber(model.checkInSummary.latest.tickets)} 券</strong></div>
            <div><span>折合資源</span><strong>{formatNumber(model.checkInSummary.latestEquivalentDia)} 鑽</strong></div>
            <div><span>比上次</span><strong>{model.checkInSummary.changeEquivalentDia === null ? "尚無比較" : `${model.checkInSummary.changeEquivalentDia >= 0 ? "+" : ""}${formatNumber(model.checkInSummary.changeEquivalentDia)} 鑽`}</strong></div>
            <Button size="sm" variant="ghost" onPress={() => onApplyResources(model.checkInSummary.latest!.diamonds, model.checkInSummary.latest!.tickets)}>套用到換算</Button>
          </div>
        ) : <div className="empty-state">尚無資源進度</div>}

        <div className={`planner-pace-note ${model.pace.status}`} role="status">
          <span>{model.pace.status === "safe" ? "目前節奏" : model.pace.target?.goal.title ?? "下一項目標"}</span>
          <strong>
            {model.pace.status === "safe"
              ? "目前目標不需額外追趕，維持現有規劃即可。"
              : model.pace.status === "unknown"
                ? `依這份規劃，資源每天需淨增 ${formatNumber(model.pace.requiredDailyDia)} 鑽；再記一筆不同日期的進度，就能比較實際速度。`
                : model.pace.status === "on-track"
                  ? `實際日均 ${signedNumber(model.pace.actualDailyDia ?? 0)} 鑽，達到規劃所需 ${formatNumber(model.pace.requiredDailyDia)} 鑽／日。`
                  : `實際日均 ${signedNumber(model.pace.actualDailyDia ?? 0)} 鑽，距規劃所需 ${formatNumber(model.pace.requiredDailyDia)} 鑽／日仍少 ${formatNumber(Math.abs(model.pace.dailyDelta ?? 0))} 鑽。`}
          </strong>
        </div>

        {recentCheckIns.length ? (
          <div className="checkin-history" role="list" aria-label="最近資源進度">
            {recentCheckIns.map((checkIn) => (
              <div className="checkin-row" role="listitem" key={checkIn.id}>
                <div className="row-main"><div className="row-title">{checkIn.date}</div><div className="row-subtitle">{formatNumber(checkIn.diamonds)} 鑽 · {formatNumber(checkIn.tickets)} 券{checkIn.note ? ` · ${checkIn.note}` : ""}</div></div>
                <button type="button" disabled={model.busy || model.writeProtected} onClick={() => void removeCheckIn(checkIn)}>移除</button>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <Card className="product-card planner-forecast-card">
        <div className="section-heading">
          <div>
            <p className="card-kicker">Forecast</p>
            <h2 className="section-title">資源時間線</h2>
          </div>
          <div className="planner-forecast-actions">
            <button type="button" disabled={!model.forecast.goals.length} onClick={() => void copyPlan()}>複製摘要</button>
            <span className={`planner-balance ${model.forecast.peakShortfallDia > 0 ? "short" : "safe"}`}>
              {model.forecast.goals.length === 0
                ? "尚無目標"
                : model.forecast.peakShortfallDia > 0
                  ? `全程差 ${formatNumber(model.forecast.peakShortfallDia)} 鑽`
                  : `最後剩 ${formatNumber(model.forecast.endingDia)} 鑽`}
            </span>
          </div>
        </div>
        {shareStatus ? <p className="section-meta planner-share-status" role="status">{shareStatus}</p> : null}

        {model.forecast.goals.length === 0 ? (
          <div className="empty-state planner-empty">先新增目標，或從排期點「加入規劃」，就能看到跨活動的鑽石餘額。</div>
        ) : (
          <ol className="planner-timeline">
            {model.forecast.goals.map((item) => {
              const gapPlan = recommendPacksForGap(item.goal.pool, item.shortfallDia);
              return (
              <li className={`planner-goal ${item.status}`} key={item.goal.id}>
                <div className="planner-goal-marker" aria-hidden="true" />
                <div className="planner-goal-body">
                  <div className="planner-goal-head">
                    <div>
                      <h3>{item.goal.title}</h3>
                      <p>{item.goal.deadline}{item.goal.tentative ? " · 預測" : ""} · {item.goal.pool}</p>
                    </div>
                    <span className={`planner-status ${item.status}`}>
                      {item.status === "past" ? "已結束" : item.status === "skipped" ? "情境暫停" : item.status === "short" ? "需要調整" : "可達成"}
                    </span>
                  </div>
                  <div className="planner-goal-metrics">
                    <span><strong>{formatNumber(item.goal.targetPulls)}</strong> 目標抽數</span>
                    <span><strong>{formatNumber(item.officialTickets)}</strong> 官方金券</span>
                    <span><strong>{formatNumber(item.incomeBeforeGoal)}</strong> 期間存鑽</span>
                  </div>
                  <p className={`planner-outcome ${item.status}`}>
                    {item.status === "past"
                      ? "活動已結束，不再影響後續預測。"
                      : item.status === "skipped"
                        ? "這項目標暫不扣除資源；期間存鑽仍會留給後續活動。"
                      : item.status === "short"
                        ? `到期後仍差 ${formatNumber(item.shortfallDia)} 鑽；若不調整目標，平均每天需再多存 ${formatNumber(item.additionalDailyDia)} 鑽。`
                        : `完成後預計剩 ${formatNumber(item.balanceAfterGoal)} 鑽。`}
                  </p>
                  {item.status === "short" ? (
                    <div className="planner-gap-plan">
                      <span>截至這項活動的補足估算</span>
                      {gapPlan.status === "recommended" ? (
                        <>
                          <strong>
                            約 NT${formatNumber(gapPlan.planCost ?? 0)} · {formatNumber(gapPlan.planPulls ?? 0)} 抽 · 買到第 {gapPlan.tier?.tier} 階
                          </strong>
                          <button type="button" disabled={recordingGoalId !== null} onClick={() => void recordGap(item.goal, gapPlan)}>
                            {recordingGoalId === item.goal.id ? "帶入中…" : "帶入錢包記帳"}
                          </button>
                        </>
                      ) : (
                        <strong>一輪限購最多補 {formatNumber(gapPlan.planPulls ?? 0)} 抽（{formatCurrency(gapPlan.planCost ?? 0)}）；其餘 {formatNumber(Math.max(0, gapPlan.gapPulls - (gapPlan.planPulls ?? 0)))} 抽需搭配存鑽、其他有效資源或調整目標。</strong>
                      )}
                    </div>
                  ) : null}
                  <div className="planner-goal-actions">
                    <button type="button" disabled={model.busy || model.writeProtected} onClick={() => void model.toggleGoal(item.goal.id)}>{item.goal.enabled ? "暫停情境" : "重新納入"}</button>
                    <button type="button" disabled={model.busy} onClick={() => model.startEditing(item.goal)}>編輯</button>
                    <button type="button" disabled={model.busy || model.writeProtected} onClick={() => void removeGoal(item.goal)}>移除</button>
                  </div>
                </div>
              </li>
              );
            })}
          </ol>
        )}
        <p className="planner-method">預測將每月可存鑽石換算為每日平均，依截止日累加；每個活動的官方金券只用於該活動。補足估算依目前禮包階梯由前往後購買，不重複計算官方金券；各目標獨立呈現，未假設前一項估算已實際購買。結果供規劃參考，實際獲取、價格與卡池規則仍以遊戲公告為準。</p>
      </Card>
    </section>
  );
}
