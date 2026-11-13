import { WalletResources } from "@/ui/WalletResources.web";
import { BudgetSummary } from "@/ui/BudgetSummary.web";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Input } from "@heroui/react/input";
import { useEffect, useState } from "react";

import { expensesToCsv } from "@/domain/budget";
import { CURRENCY_LABELS, CURRENCY_SYMBOLS, formatCurrency as formatMoney, isValidDateKey, monthLabel, todayKey } from "@/domain/format";
import { CURRENCIES, EXPENSE_CATEGORIES, type Currency, type Expense, type ExpenseCategory } from "@/domain/types";
import { DeviceDataLoading } from "@/ui/DeviceDataLoading.web";
import { RetryableError } from "@/ui/RetryableError.web";
import { WebPage } from "@/ui/WebPage.web";
import { useWalletModel } from "./useWalletModel";
import { SpendingDashboard } from "./SpendingDashboard.web";

type ExpenseForm = {
  amt: string;
  cat: ExpenseCategory;
  date: string;
  note: string;
};

const EMPTY_FORM: ExpenseForm = { amt: "", cat: "抽卡禮包", date: todayKey(), note: "" };

function focusControl(id: string) {
  requestAnimationFrame(() => { const control = document.getElementById(id); control?.scrollIntoView({ block: "center", behavior: "smooth" }); control?.focus({ preventScroll: true }); });
}

function WalletGlyph({ type }: { type: "wallet" | "plus" | "list" }) {
  if (type === "plus") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>;
  }
  if (type === "list") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>;
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18M16 15h2" />
    </svg>
  );
}

function statusCopy(state: string, remaining: number, percentage: number, currency: Currency): string {
  const formatCurrency = (value: number) => formatMoney(value, currency);
  if (state === "unset") return "還沒設定當月預算，先建立一條舒服的消費界線。";
  if (state === "over") return `已超支 ${formatCurrency(Math.abs(remaining))}，建議先暫停新增非必要支出。`;
  if (state === "warning") return `已使用 ${percentage}%，目前還有 ${formatCurrency(remaining)} 可花。`;
  return `控制得不錯，目前還有 ${formatCurrency(remaining)} 的彈性。`;
}

export function WalletScreenWeb() {
  const model = useWalletModel();
  const formatCurrency = (value: number | null) => formatMoney(value, model.currency);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [threshold, setThreshold] = useState("80");
  const [form, setForm] = useState<ExpenseForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletedExpense, setDeletedExpense] = useState<Expense | null>(null);
  const [expenseFilter, setExpenseFilter] = useState<ExpenseCategory | "全部">("全部");
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pendingExpense = model.pendingExpense;
  const consumePendingExpense = model.consumePendingExpense;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setBudgetAmount(model.config.amount ? String(model.config.amount) : "");
      setThreshold(String(model.config.threshold || 80));
    });
    return () => cancelAnimationFrame(frame);
  }, [model.config.amount, model.config.threshold, model.month, model.currency]);

  useEffect(() => {
    if (!pendingExpense) return;
    const frame = requestAnimationFrame(() => {
      setExpenseFormOpen(true);
      focusControl("wallet-expense-amount");
      setForm({
        amt: String(pendingExpense.amt),
        cat: pendingExpense.cat,
        date: pendingExpense.date,
        note: pendingExpense.note,
      });
      void consumePendingExpense();
    });
    return () => cancelAnimationFrame(frame);
  }, [consumePendingExpense, pendingExpense]);

  async function submitExpense() {
    const amount = Number(form.amt);
    if (!Number.isFinite(amount) || amount <= 0 || amount > Number.MAX_SAFE_INTEGER) {
      setFormError("請輸入大於 0 且在安全範圍內的花費金額。");
      focusControl("wallet-expense-amount");
      return;
    }
    if (!isValidDateKey(form.date)) {
      setFormError("請選擇有效的消費日期。");
      focusControl("wallet-expense-date");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    const saved = await model.addExpense({ amt: amount, cat: form.cat, date: form.date, note: form.note.trim() });
    setSubmitting(false);
    if (saved) { setForm({ ...EMPTY_FORM, date: form.date }); setExpenseFormOpen(false); }
  }

  async function saveEdit() {
    if (!editing) return;
    if (!Number.isFinite(editing.amt) || editing.amt <= 0 || editing.amt > Number.MAX_SAFE_INTEGER) {
      setEditError("請輸入大於 0 且在安全範圍內的花費金額。");
      focusControl("wallet-edit-amount");
      return;
    }
    if (!isValidDateKey(editing.date)) {
      setEditError("請選擇有效的消費日期。");
      focusControl("wallet-edit-date");
      return;
    }
    setEditError(null);
    setSubmitting(true);
    const saved = await model.updateExpense(editing);
    setSubmitting(false);
    if (saved) setEditing(null);
  }

  async function saveBudget() {
    const amount = Number(budgetAmount);
    const nextThreshold = Number(threshold);
    if (!Number.isFinite(amount) || amount < 0 || amount > Number.MAX_SAFE_INTEGER) {
      setBudgetError("預算需為 0 或安全範圍內的正數。");
      focusControl("wallet-budget-amount");
      return;
    }
    if (!Number.isFinite(nextThreshold) || nextThreshold < 1 || nextThreshold > 100) {
      setBudgetError("提醒門檻請輸入 1 到 100 之間的數字。");
      focusControl("wallet-budget-threshold");
      return;
    }
    setBudgetError(null);
    setSubmitting(true);
    await model.saveBudget({ amount, threshold: nextThreshold });
    setSubmitting(false);
  }

  async function removeExpense(expense: Expense) {
    setSubmitting(true);
    const deleted = await model.deleteExpense(expense.id);
    setSubmitting(false);
    if (deleted) setDeletedExpense(expense);
  }

  async function undoDelete() {
    if (!deletedExpense) return;
    setSubmitting(true);
    const restored = await model.restoreExpense(deletedExpense);
    setSubmitting(false);
    if (restored) setDeletedExpense(null);
  }

  function downloadExpensesCsv() {
    const url = URL.createObjectURL(new Blob([`\uFEFF${expensesToCsv(visibleExpenses)}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `deep-space-ledger-expenses-${model.month}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const visibleExpenses = model.expenses.filter((expense) => expenseFilter === "全部" || expense.cat === expenseFilter);
  const comparisonCopy = model.insights.previousSpent === 0
    ? model.summary.spent > 0 ? "上月沒有支出可比較" : "尚無支出變化"
    : `${model.insights.changeAmount >= 0 ? "比上月多" : "比上月少"} ${formatCurrency(Math.abs(model.insights.changeAmount))}（${Math.abs(model.insights.changePercentage ?? 0)}%）`;
  const paceCopy = model.pace.status === "unavailable"
    ? null
    : model.pace.status === "over"
      ? `已超出當月預算；接下來 ${model.pace.daysRemaining} 天的彈性額度先以 ${formatCurrency(0)} 計。`
      : model.pace.status === "projected-over"
        ? `接下來 ${model.pace.daysRemaining} 天每日可彈性支出 ${formatCurrency(model.pace.dailyFlexibleSpend ?? 0)}；照目前速度月底仍可能超出 ${formatCurrency(Math.abs(model.pace.projectedVariance ?? 0))}。`
        : `接下來 ${model.pace.daysRemaining} 天每日可彈性支出 ${formatCurrency(model.pace.dailyFlexibleSpend ?? 0)}；照目前速度月底預計保留 ${formatCurrency(model.pace.projectedVariance ?? 0)}。`;
  const pageAction = (
    <details className="wallet-month-picker"><summary>{model.month.replace("-", " / ")} <span aria-hidden="true">▾</span></summary><div className="month-action-stack">
      <div className="month-switcher">
        <Button isIconOnly variant="ghost" aria-label="上一個月" onPress={model.previousMonth}>←</Button>
        <strong>{monthLabel(model.month)}</strong>
        <Button isIconOnly variant="ghost" aria-label="下一個月" onPress={model.nextMonth}>→</Button>
      </div>
      {!model.isCurrentMonth ? <button className="text-button" type="button" onClick={model.goToCurrentMonth}>回到當月</button> : null}
    </div></details>
  );

  if (!model.ready) {
    return (
      <WebPage
        eyebrow="Deep Space Ledger"
        title="錢包"
        description="把每次心動都留下紀錄，也讓預算提醒在真正需要時出現。資料只儲存在你的裝置。"
        action={pageAction}
      >
        <DeviceDataLoading label="正在讀取預算與花費…" />
      </WebPage>
    );
  }

  return (
    <WebPage
      eyebrow="Deep Space Ledger"
      title="錢包"
      description="把每次心動都留下紀錄，也讓預算提醒在真正需要時出現。資料只儲存在你的裝置。"
      action={pageAction}
    >
      <div className="page-grid">
        {model.storageError ? <RetryableError>{model.storageError}</RetryableError> : null}
        {deletedExpense ? (
          <div className="status-note undo-note" role="status">
            <span>已刪除「{deletedExpense.note || deletedExpense.cat}」</span>
            <button type="button" disabled={submitting} onClick={() => void undoDelete()}>復原</button>
          </div>
        ) : null}
        <div className="stack">
          <Card className="hero-card wallet-balance-card"><BudgetSummary {...model.summary} currency={model.currency} /></Card>
          <WalletResources {...model.resources}/>
          <Button fullWidth className="wallet-add-button" aria-expanded={expenseFormOpen} onPress={() => { setExpenseFormOpen(!expenseFormOpen); if (!expenseFormOpen) focusControl("wallet-expense-amount"); }}>＋ 新增花費</Button>
          {expenseFormOpen ? (
          <Card className="product-card">
            <div className="section-heading">
              <h2 className="section-title heading-with-icon"><WalletGlyph type="plus" />記一筆花費</h2>
            </div>
            <div className="form-grid" style={{ marginTop: 3 }}>
              <label className="field-wrap">
                <span className="field-label">金額（{CURRENCY_SYMBOLS[model.currency]}）</span>
                <Input id="wallet-expense-amount" aria-label="花費金額" aria-invalid={Boolean(formError)} aria-describedby={formError ? "wallet-expense-error" : undefined} type="number" min="0" placeholder="170" value={form.amt} onChange={(event) => { setFormError(null); setForm({ ...form, amt: event.target.value }); }} />
              </label>
              <label className="field-wrap">
                <span className="field-label">類別</span>
                <select className="native-select" value={form.cat} onChange={(event) => { setFormError(null); setForm({ ...form, cat: event.target.value as ExpenseCategory }); }}>
                  {EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="field-wrap full">
                <span className="field-label">消費日期</span>
                <span className="date-control"><Input id="wallet-expense-date" aria-label="消費日期" aria-invalid={Boolean(formError)} aria-describedby={formError ? "wallet-expense-error" : undefined} type="date" value={form.date} onChange={(event) => { setFormError(null); setForm({ ...form, date: event.target.value }); }} /></span>
              </label>
              <label className="field-wrap full">
                <span className="field-label">備註（選填）</span>
                <Input aria-label="花費備註" placeholder="例如：沈星回生日卡池" value={form.note} onChange={(event) => { setFormError(null); setForm({ ...form, note: event.target.value }); }} />
              </label>
            </div>
            {formError ? <p className="field-error" id="wallet-expense-error" role="alert">{formError}</p> : null}
            <div className="form-actions">
              <Button fullWidth isDisabled={submitting || model.writeProtected} onPress={() => void submitExpense()}>{submitting ? "儲存中…" : "加入花費"}</Button>
            </div>
          </Card>
          ) : null}
          <section className="wallet-recent" aria-label="最近花費"><div className="section-heading"><h2>最近花費</h2><button type="button" aria-expanded={historyOpen} onClick={() => { setHistoryOpen(!historyOpen); if (!historyOpen) focusControl("wallet-history"); }}>查看全部 ›</button></div>{model.expenses.length ? model.expenses.slice(0, 3).map(expense => <div className="wallet-recent-row" key={expense.id}><time dateTime={expense.date}>{expense.date.slice(5).replace("-", " / ")}</time><WalletGlyph type="wallet"/><span>{expense.note || expense.cat}</span><strong>− {formatCurrency(expense.amt)}</strong></div>) : <p className="empty-state">這個月還沒有花費紀錄</p>}</section>


        </div>

        <div className="stack">


          {historyOpen ? (
          <Card id="wallet-history" tabIndex={-1} className="product-card">
            <div className="section-heading">
              <h2 className="section-title heading-with-icon"><WalletGlyph type="list" />花費紀錄</h2>
              <div className="section-inline-actions">
                <span className="section-meta">{visibleExpenses.length} 筆</span>
                <Button size="sm" variant="ghost" isDisabled={!visibleExpenses.length} onPress={downloadExpensesCsv}>匯出 CSV</Button>
              </div>
            </div>
            <label className="field-wrap">
              <span className="field-label">紀錄與匯出範圍</span>
              <select className="native-select" value={expenseFilter} onChange={(event) => setExpenseFilter(event.target.value as ExpenseCategory | "全部")}>
                <option>全部</option>
                {EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <div className="expense-list" role={visibleExpenses.length ? "list" : undefined}>
              {visibleExpenses.length === 0 ? (
                <div className="empty-state">{model.expenses.length === 0 ? "這個月還沒有花費紀錄" : "這個類別目前沒有花費紀錄"}</div>
              ) : (
                visibleExpenses.map((expense) => (
                  <div className="expense-row" role="listitem" key={expense.id}>
                    <div className="row-main">
                      <div className="row-title">{expense.note || expense.cat}</div>
                      <div className="row-subtitle">{expense.cat} · {expense.date}</div>
                    </div>
                    <div className="row-amount">{formatCurrency(expense.amt)}</div>
                    <div className="row-actions">
                      <Button size="sm" variant="ghost" onPress={() => { setEditing({ ...expense }); focusControl("wallet-edit-amount"); }}>編輯</Button>
                      <Button
                        size="sm"
                        variant="danger-soft"
                        isDisabled={submitting || model.writeProtected}
                        onPress={() => void removeExpense(expense)}
                      >
                        刪除
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
          ) : null}
          <details className="wallet-settings pearl-details"><summary>預算與幣別設定</summary><div className="wallet-settings-body">
            <div className="card-title-row">
              <h2 className="section-title heading-with-icon"><WalletGlyph type="wallet" />本月預算</h2>
              <label className="currency-choice"><span>幣別</span><select className="native-select" aria-label="記帳幣別" value={model.currency} onChange={event => { setForm({ ...EMPTY_FORM, date: form.date }); void model.setCurrency(event.target.value as Currency); }}>{CURRENCIES.map(currency => <option key={currency} value={currency}>{CURRENCY_LABELS[currency]} · {CURRENCY_SYMBOLS[currency]}</option>)}</select></label>
            </div>
            <p className="currency-note">預算與花費依幣別分開記錄，不合併換算。</p>

            <div className={`status-note ${model.summary.state}`} role="status">
              {statusCopy(model.summary.state, model.summary.remaining, model.summary.percentage, model.currency)}
            </div>
            <details className="budget-details">
              <summary>設定預算與提醒門檻</summary>
              <div className="form-grid">
                <label className="field-wrap">
                  <span className="field-label">每月預算（{CURRENCY_SYMBOLS[model.currency]}）</span>
                  <Input
                    id="wallet-budget-amount"
                    aria-label="每月預算"
                    aria-invalid={Boolean(budgetError)}
                    aria-describedby={budgetError ? "wallet-budget-error" : undefined}
                    type="number"
                    min="0"
                    placeholder="3000"
                    value={budgetAmount}
                    onChange={(event) => { setBudgetError(null); setBudgetAmount(event.target.value); }}
                  />
                </label>
                <label className="field-wrap">
                  <span className="field-label">提醒門檻（%）</span>
                  <Input
                    id="wallet-budget-threshold"
                    aria-label="提醒門檻"
                    aria-invalid={Boolean(budgetError)}
                    aria-describedby={budgetError ? "wallet-budget-error" : undefined}
                    type="number"
                    min="1"
                    max="100"
                    value={threshold}
                    onChange={(event) => { setBudgetError(null); setThreshold(event.target.value); }}
                  />
                </label>
              </div>
              {budgetError ? <p className="field-error" id="wallet-budget-error" role="alert">{budgetError}</p> : null}
              <div className="form-actions">
                <Button fullWidth isDisabled={submitting || model.writeProtected} onPress={() => void saveBudget()}>
                  {submitting ? "儲存中…" : "儲存當月設定"}
                </Button>
                {model.previousConfig ? (
                  <Button
                    fullWidth
                    variant="ghost"
                    isDisabled={submitting || model.writeProtected}
                    onPress={() => void model.copyPreviousBudget()}
                  >
                    沿用上月 {formatCurrency(model.previousConfig.amount)}／{model.previousConfig.threshold}% 提醒
                  </Button>
                ) : null}
              </div>
            </details>
</div></details>

          <details className="product-card card spending-insights-card">
            <summary>當月支出洞察與預估</summary>
            <div className="insight-summary" role="group" aria-label="當月支出摘要">
              <div><span>與上月相比</span><strong>{comparisonCopy}</strong></div>
              <div><span>月底預估</span><strong>{model.insights.projectedMonthEnd === null ? "僅當月提供" : formatCurrency(model.insights.projectedMonthEnd)}</strong></div>
            </div>
            {paceCopy ? <div className={`status-note ${model.pace.status === "on-track" ? "healthy" : model.pace.status === "over" ? "over" : "warning"}`} role="status">{paceCopy}</div> : null}
            {model.insights.categories.length === 0 ? (
              <div className="empty-state">記下一筆花費後，這裡會顯示類別占比與月度趨勢。</div>
            ) : (
              <div className="category-breakdown" role="group" aria-label="當月各類支出占比">
                {model.insights.categories.map((item) => (
                  <div className="category-insight" key={item.category}>
                    <div><span>{item.category}</span><strong>{formatCurrency(item.amount)} · {item.percentage}%</strong></div>
                    <div className="insight-track" aria-hidden="true"><span style={{ width: `${item.percentage}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </details>

          <SpendingDashboard expenses={model.allExpenses} month={model.month} currency={model.currency} onSelectMonth={model.selectMonth} />

          {editing ? (
            <Card className="product-card">
              <div className="section-heading">
                <h2 className="section-title">編輯花費</h2>
                <Button size="sm" variant="ghost" onPress={() => { setEditError(null); setEditing(null); }}>取消</Button>
              </div>
              <div className="form-grid" style={{ marginTop: 3 }}>
                <label className="field-wrap">
                  <span className="field-label">金額（{CURRENCY_SYMBOLS[model.currency]}）</span>
                  <Input id="wallet-edit-amount" aria-label="編輯金額" aria-invalid={Boolean(editError)} aria-describedby={editError ? "wallet-edit-error" : undefined} type="number" value={String(editing.amt)} onChange={(event) => { setEditError(null); setEditing({ ...editing, amt: Number(event.target.value) }); }} />
                </label>
                <label className="field-wrap">
                  <span className="field-label">類別</span>
                  <select className="native-select" value={editing.cat} onChange={(event) => { setEditError(null); setEditing({ ...editing, cat: event.target.value as ExpenseCategory }); }}>
                    {EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
                <label className="field-wrap">
                  <span className="field-label">消費日期</span>
                  <span className="date-control"><Input id="wallet-edit-date" aria-label="編輯日期" aria-invalid={Boolean(editError)} aria-describedby={editError ? "wallet-edit-error" : undefined} type="date" value={editing.date} onChange={(event) => { setEditError(null); setEditing({ ...editing, date: event.target.value }); }} /></span>
                </label>
                <label className="field-wrap">
                  <span className="field-label">備註</span>
                  <Input aria-label="編輯備註" value={editing.note} onChange={(event) => { setEditError(null); setEditing({ ...editing, note: event.target.value }); }} />
                </label>
              </div>
              {editError ? <p className="field-error" id="wallet-edit-error" role="alert">{editError}</p> : null}
              <div className="form-actions"><Button fullWidth isDisabled={submitting || model.writeProtected} onPress={() => void saveEdit()}>{submitting ? "儲存中…" : "儲存修改"}</Button></div>
            </Card>
          ) : null}
        </div>
      </div>
    </WebPage>
  );
}
