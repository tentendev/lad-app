import { formatCurrency } from "@/domain/format";
import type { BudgetSummaryProps } from "./BudgetSummary";

export function BudgetSummary({ budget, spent, remaining, percentage, currency }: BudgetSummaryProps) {
  const circumference = 2 * Math.PI * 86;
  const ratio = budget > 0 ? Math.max(0, Math.min(1, remaining / budget)) : 0;
  return <div className="wallet-budget-layout">
    <div className="wallet-budget-facts">
      <div><span>本月預算</span><strong>{formatCurrency(budget, currency)}</strong></div>
      <div><span>已花</span><strong>{formatCurrency(spent, currency)}</strong></div>
    </div>
    <div className="budget-orbit" role="progressbar" aria-label="當月預算使用率" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, percentage)} aria-valuetext={budget > 0 ? `已使用 ${percentage}%，${remaining < 0 ? "超支" : "剩餘"} ${formatCurrency(Math.abs(remaining), currency)}` : "尚未設定預算"}>
      <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="86" fill="none" stroke="#e8e1f0" strokeWidth="11"/><circle cx="100" cy="100" r="86" fill="none" stroke={remaining < 0 ? "var(--bad)" : "#a68ac2"} strokeWidth="11" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - ratio)}/></svg>
      <div className="budget-orbit-copy"><small>{remaining < 0 ? "已超支" : "剩餘可花"}</small><strong>{formatCurrency(Math.abs(remaining), currency)}</strong><span>{budget > 0 ? `已使用 ${percentage}%` : "尚未設定預算"}</span></div>
    </div>
  </div>;
}
