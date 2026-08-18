import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Input } from "@heroui/react/input";
import { useRouter } from "expo-router";

import { DIA_PER_PULL, PACK_DATA } from "@/data/packs";
import { bestTierPrice, type GapPackRecommendation } from "@/domain/calculator";
import { formatCurrency, formatNumber } from "@/domain/format";
import { POOLS, type Pool, type PullGoal } from "@/domain/types";
import { DeviceDataLoading } from "@/ui/DeviceDataLoading.web";
import { RetryableError } from "@/ui/RetryableError.web";
import { WebPage } from "@/ui/WebPage.web";
import { useCalculatorModel } from "./useCalculatorModel";
import { PlannerSectionWeb } from "./PlannerSection.web";

function CalculatorGlyph({ type }: { type: "diamond" | "gift" | "steps" }) {
  if (type === "gift") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="3" y="9" width="18" height="12" rx="2" />
        <path d="M12 9v12M3 13h18M12 9H7.5A2.5 2.5 0 0 1 10 5.5c1.1 0 2 1.6 2 3.5Zm0 0h4.5A2.5 2.5 0 0 0 14 5.5c-1.1 0-2 1.6-2 3.5Z" />
      </svg>
    );
  }
  if (type === "steps") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 18h4v-4h4v-4h4V6h3" /></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m12 3 7 6-7 12L5 9l7-6Zm-7 6h14M9 9l3 12 3-12M9 3l3 6 3-6" /></svg>;
}

export function CalculatorScreenWeb() {
  const model = useCalculatorModel();
  const router = useRouter();
  const { draft, resource, recommendation } = model;
  const bestPer = bestTierPrice(draft.pool);

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

  const resultTone = resource.totalPulls <= 0 ? "" : resource.gapDia === 0 ? "healthy" : "warning";
  const resultCopy =
    resource.totalPulls <= 0
      ? "填入目標抽數，開始試算。"
      : resource.gapDia === 0
        ? `現有資源可抽 ${formatNumber(resource.availablePulls)} 抽，已達成目標。`
        : `還差 ${formatNumber(resource.gapDia)} 鑽，換算需課金 ${resource.paidPulls} 抽。`;

  if (!model.ready) {
    return (
      <WebPage
        eyebrow="Pull Planner"
        title="換算"
        description="把鑽石、金券、官方返券與預留資源一起算清楚，再依卡池階梯給出可執行的禮包建議。"
        action={<span className="event-badge">每抽 {DIA_PER_PULL} 鑽</span>}
      >
        <DeviceDataLoading label="正在讀取換算設定…" />
      </WebPage>
    );
  }

  return (
    <WebPage
      eyebrow="Pull Planner"
      title="換算"
      description="把鑽石、金券、官方返券與預留資源一起算清楚，再依卡池階梯給出可執行的禮包建議。"
      action={<span className="event-badge">每抽 {DIA_PER_PULL} 鑽</span>}
    >
      <div className="page-grid">
        {model.storageError ? <RetryableError>{model.storageError}</RetryableError> : null}
        {model.targetHandoff ? (
          <div className="status-note calculator-handoff" role="status">
            <span>已從追蹤帶入：{model.targetHandoff}。請確認卡池類型與現有資源後再採用建議。</span>
            <button type="button" onClick={model.clearTargetHandoff}>知道了</button>
          </div>
        ) : null}
        <div className="stack">
          <Card className="product-card">
            <div className="section-heading">
              <h2 className="section-title heading-with-icon"><CalculatorGlyph type="diamond" />目標設定</h2>
              <span className="section-meta">自動儲存在裝置</span>
            </div>
            <div className="form-grid" style={{ marginTop: 18 }}>
              <label className="field-wrap full">
                <span className="field-label">卡池類型</span>
                <select className="native-select" value={draft.pool} onChange={(event) => model.setPool(event.target.value as Pool)}>
                  {POOLS.map((pool) => <option key={pool}>{pool}</option>)}
                </select>
              </label>
              <label className="field-wrap">
                <span className="field-label">目前持有（鑽）</span>
                <Input aria-label="目前持有鑽石" type="number" min="0" placeholder="0" value={draft.cur ? String(draft.cur) : ""} onChange={(event) => model.updateNumber("cur", Number(event.target.value))} />
              </label>
              <label className="field-wrap">
                <span className="field-label">目標抽數</span>
                <Input aria-label="目標抽數" type="number" min="0" placeholder="70" value={draft.pulls ? String(draft.pulls) : ""} onChange={(event) => model.updateNumber("pulls", Number(event.target.value))} />
              </label>
              <label className="field-wrap">
                <span className="field-label">原本剩餘金券（張）</span>
                <Input aria-label="原有金券" type="number" min="0" placeholder="0" value={draft.tickets ? String(draft.tickets) : ""} onChange={(event) => model.updateNumber("tickets", Number(event.target.value))} />
              </label>
              <div className="field-wrap">
                <span className="field-label">官方金券（自動）</span>
                <Input aria-label="官方金券" readOnly value={String(resource.officialTickets)} />
                <span className="section-meta">開池 {resource.initialTickets} 張 · 目標內返還 {resource.milestoneTickets} 張</span>
              </div>
              <label className="field-wrap full">
                <span className="field-label">預留資源（{draft.reserveUnit === "dia" ? "鑽" : "抽"}）</span>
                <div className="form-row" style={{ gap: 10 }}>
                  <Input
                    aria-label="預留資源"
                    type="number"
                    min="0"
                    value={draft.reserve ? String(draft.reserve) : ""}
                    onChange={(event) => model.updateNumber("reserve", Number(event.target.value))}
                  />
                  <div className="unit-switch">
                    <Button size="sm" variant={draft.reserveUnit === "pulls" ? "primary" : "ghost"} onPress={() => model.setReserveUnit("pulls")}>抽數</Button>
                    <Button size="sm" variant={draft.reserveUnit === "dia" ? "primary" : "ghost"} onPress={() => model.setReserveUnit("dia")}>鑽石</Button>
                  </div>
                </div>
                <span className="section-meta">
                  相當於 {formatNumber(resource.reservePulls)} 抽 · {formatNumber(resource.reserveDia)} 鑽
                </span>
              </label>
            </div>
          </Card>

          <Card className="product-card">
            <div className={`status-note calculation-status ${resultTone}`} role="status">{resultCopy}</div>
            <div className="metric-grid">
              <div className="metric"><div className="metric-value">{formatNumber(resource.gapDia)}</div><div className="metric-label">還差幾鑽</div></div>
              <div className="metric"><div className="metric-value">{resource.paidPulls}</div><div className="metric-label">換算需課金幾抽</div></div>
              <div className="metric"><div className="metric-value">{draft.pulls > 0 ? formatNumber(recommendation.remainingDiaAfterTarget ?? resource.remainingDiaAfterTarget) : "—"}</div><div className="metric-label">目標後剩餘鑽</div></div>
            </div>
            <div className="calculation-detail" role="group" aria-label={`目標 ${formatNumber(resource.targetPulls)} 抽，扣除金券後需 ${formatNumber(resource.requiredDia)} 鑽`}>
              <span>目標 {formatNumber(resource.targetPulls)} 抽{resource.reservePulls > 0 ? `＋預留 ${formatNumber(resource.reservePulls)} 抽` : ""}</span>
              <span>扣除金券後需 {formatNumber(resource.requiredDia)} 鑽</span>
              {resource.savingMonths > 0 ? <span>純存約需 {resource.savingMonths} 個月</span> : null}
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card className="recommendation-card product-card">
            <div className="recommendation-head">
              <div>
                <span className="card-kicker heading-with-icon"><CalculatorGlyph type="gift" />禮包建議 · {draft.pool}</span>
                <h2 className="section-title" style={{ marginTop: 6 }}>
                  {recommendation.status === "recommended" ? `買到第 ${recommendation.tier?.tier} 階` : recommendation.status === "enough" ? "無需課金" : recommendation.status === "overflow" ? "超過單輪上限" : "等待目標"}
                </h2>
              </div>
              {recommendation.status === "recommended" ? <span className="tier-badge">推薦</span> : null}
            </div>
            {recommendation.status === "recommended" ? (
              <>
                <div className="recommendation-value">{formatCurrency(recommendation.planCost ?? 0)}</div>
                <p className="page-description">
                  還需 {recommendation.gapPulls} 抽；最後一階買 {recommendation.packsAtTier} 包，共取得 {formatNumber(recommendation.planPulls ?? 0)} 抽。
                </p>
                <div className="form-actions"><Button fullWidth onPress={() => void recordRecommendation()}>帶入錢包記帳</Button></div>
              </>
            ) : (
              <p className="page-description">
                {recommendation.status === "enough" ? `現有資源可抽 ${formatNumber(recommendation.ownedPulls)} 抽。` : recommendation.status === "overflow" ? `還需 ${recommendation.gapPulls} 抽；一輪限購最多補 ${formatNumber(recommendation.planPulls ?? 0)} 抽（${formatCurrency(recommendation.planCost ?? 0)}），其餘 ${formatNumber(Math.max(0, recommendation.gapPulls - (recommendation.planPulls ?? 0)))} 抽需搭配存鑽、其他有效資源或下輪禮包。` : "填入目標後會顯示建議購買階級。"}
              </p>
            )}
          </Card>

          <Card className="product-card">
            <div className="section-heading">
              <h2 className="section-title heading-with-icon"><CalculatorGlyph type="steps" />階梯明細</h2>
              <span className="section-meta">依序購買</span>
            </div>
            <div className="tier-list" role="list">
              {PACK_DATA[draft.pool].map((tier) => {
                const isRecommended = recommendation.tier?.tier === tier.tier;
                const isBest = tier.per != null && tier.per === bestPer;
                return (
                  <div className={`tier-row ${isRecommended ? "recommended" : ""}`} role="listitem" key={tier.tier}>
                    <div className="tier-index">{tier.tier}</div>
                    <div className="row-main">
                      <div className="row-title">第 {tier.tier} 階 · {formatCurrency(tier.price)}／包</div>
                      <div className="row-subtitle">
                        {tier.packPulls != null ? `${tier.packPulls} 抽／包` : "抽數未固定"}{tier.qty ? ` · 限購 ${tier.qty} 包` : ""} · 買滿 {formatCurrency(tier.cumCost)}
                      </div>
                    </div>
                    {isRecommended || isBest ? <span className="tier-badge">{isRecommended ? "推薦" : "最低單抽"}</span> : null}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
      <PlannerSectionWeb
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
    </WebPage>
  );
}
