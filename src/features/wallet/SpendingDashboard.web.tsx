import { useEffect, useId, useRef, useState } from "react";

import { storage } from "@/data/repositories/storage";
import { spendingRangeError, summarizeSpendingRange } from "@/domain/budget";
import { formatCurrency, monthLabel, moveMonth } from "@/domain/format";
import type { Expense } from "@/domain/types";

type Range = { mode: "6" | "12" | "custom"; start: string; end: string };

export function SpendingDashboard({ expenses, month, onSelectMonth }: { expenses: Expense[]; month: string; onSelectMonth: (month: string) => void }) {
  const [range, setRange] = useState<Range>({ mode: "6", start: moveMonth(month, -5), end: month });
  const [start, setStart] = useState(range.start);
  const [end, setEnd] = useState(range.end);
  const [error, setError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [persist, setPersist] = useState(false);
  const initialMonth = useRef(month);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const startInput = useRef<HTMLInputElement>(null);
  const id = useId();
  useEffect(() => {
    let active = true;
    void Promise.all([
      storage.get<Range | null>("expense_chart", null),
      storage.get<unknown>("expenseChartRangeMode", "6"),
      storage.get<unknown>("expenseChartStart", null),
      storage.get<unknown>("expenseChartEnd", null),
    ]).then(([saved, mode, from, to]) => {
      if (!active) return;
      const fallback = { mode: "6" as const, start: moveMonth(initialMonth.current, -5), end: initialMonth.current };
      const candidate = saved ?? { mode, start: from, end: to };
      const next: Range = {
        mode: candidate.mode === "12" || candidate.mode === "custom" ? candidate.mode : "6",
        start: typeof candidate.start === "string" ? candidate.start : fallback.start,
        end: typeof candidate.end === "string" ? candidate.end : fallback.end,
      };
      if (spendingRangeError(next.start, next.end)) { next.start = fallback.start; next.end = fallback.end; }
      setRange(next); setStart(next.start); setEnd(next.end); setPersist(true);
    }).catch(() => { if (active) setStorageError("無法讀取統計期間設定；仍可比較月份，本次不會覆蓋原設定。"); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!persist) return;
    let active = true;
    queue.current = queue.current.catch(() => undefined).then(() => storage.set("expense_chart", range));
    void queue.current.then(() => { if (active) setStorageError(null); }).catch(() => { if (active) setStorageError("統計期間尚未儲存，請確認裝置儲存空間。"); });
    return () => { active = false; };
  }, [persist, range]);
  const from = range.mode === "custom" ? range.start : moveMonth(month, -Number(range.mode) + 1);
  const to = range.mode === "custom" ? range.end : month;
  const data = summarizeSpendingRange(expenses, from, to);
  const maximum = Math.max(1, ...data.months.map((item) => item.amount));
  const compact = (amount: number) => amount >= 10000 ? `NT$${new Intl.NumberFormat("zh-TW", { notation: "compact", maximumFractionDigits: 1 }).format(amount)}` : formatCurrency(amount);
  function applyRange() {
    const invalid = spendingRangeError(start, end);
    setError(invalid);
    if (invalid) startInput.current?.focus();
    else setRange({ mode: "custom", start, end });
  }
  return (
    <details className="product-card card spending-dashboard">
      <summary><span><strong>每月花費統計</strong><small>需要時再展開比較不同月份</small></span><span aria-hidden="true">⌄</span></summary>
      <div className="spending-dashboard-content">
        <div className="dashboard-heading">
          <div className="section-meta">統計期間<br />{from.replace("-", "/")} — {to.replace("-", "/")}</div>
          <div className="dashboard-range-options" role="group" aria-label="比較期間">
            {(["6", "12", "custom"] as const).map((mode) => <button key={mode} type="button" aria-pressed={range.mode === mode} onClick={() => { setRange((value) => ({ ...value, mode })); setError(null); }}>{mode === "custom" ? "自訂" : `近 ${mode} 月`}</button>)}
          </div>
        </div>
        {range.mode === "custom" ? <div className="custom-month-range">
          <div className="form-grid">
            <label className="field-wrap"><span className="field-label">開始月份</span><span className="date-control"><input ref={startInput} name="chartStart" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} type="month" value={start} onChange={(event) => { setStart(event.target.value); setError(null); }} /></span></label>
            <label className="field-wrap"><span className="field-label">結束月份</span><span className="date-control"><input name="chartEnd" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} type="month" value={end} onChange={(event) => { setEnd(event.target.value); setError(null); }} /></span></label>
          </div>
          <button className="dashboard-apply" type="button" onClick={applyRange}>套用期間</button>
          {error ? <p className="field-error" id={`${id}-error`} role="alert">{error}</p> : null}
        </div> : null}
        {storageError ? <p className="field-error" role="status">{storageError}</p> : null}
        <div className="metric-grid dashboard-metrics" aria-live="polite">
          <div className="metric"><div className="metric-value" title={formatCurrency(data.total)}>{compact(data.total)}</div><div className="metric-label">期間總花費</div></div>
          <div className="metric"><div className="metric-value" title={formatCurrency(data.average)}>{compact(data.average)}</div><div className="metric-label">每月平均</div></div>
          <div className="metric"><div className="metric-value" title={formatCurrency(data.highest.amount)}>{compact(data.highest.amount)}</div><div className="metric-label">{data.total ? `最高 · ${data.highest.month.replace("-", "/")}` : "最高月份"}</div></div>
        </div>
        <div className="monthly-chart-scroll" tabIndex={0} role="group" aria-label="每月花費長條圖，可左右捲動並選取月份查看明細">
          <div className="monthly-chart" style={{ minWidth: `${data.months.length * 44}px` }}>
            {data.months.map((item) => <button type="button" className="monthly-chart-column" key={item.month} aria-pressed={item.month === month} aria-label={`${monthLabel(item.month)}花費 ${formatCurrency(item.amount)}，查看明細`} onClick={() => onSelectMonth(item.month)}>
              <span className="monthly-chart-value" aria-hidden="true">{item.amount ? new Intl.NumberFormat("zh-TW", { notation: "compact", maximumFractionDigits: 1 }).format(item.amount) : "0"}</span>
              <span className="monthly-chart-rail" aria-hidden="true"><i style={{ height: `${Math.max(item.amount ? 2 : 0, item.amount / maximum * 100)}%` }} /></span>
              <span aria-hidden="true">{data.months.length > 12 ? item.month.slice(2).replace("-", "/") : `${Number(item.month.slice(5))}月`}</span>
            </button>)}
          </div>
        </div>
        {data.total === 0 ? <p className="empty-state">這段期間還沒有花費紀錄，可在上方新增第一筆花費。</p> : null}
        <p className="section-meta">點一下月份，可查看該月明細；金額單位為新臺幣。</p>
      </div>
    </details>
  );
}
