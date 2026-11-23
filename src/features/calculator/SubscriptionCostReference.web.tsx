import { getSubscriptionCosts, SUBSCRIPTION_COST_NOTE } from "@/data/subscriptionCosts";
import { CURRENCY_LABELS, CURRENCY_SYMBOLS, formatCurrency } from "@/domain/format";
import type { Currency } from "@/domain/types";

export function SubscriptionCostReference({ currency = "TWD" }: { currency?: Currency }) {
  return (
    <details className="subscription-cost-reference pearl-details">
      <summary>月卡／週卡每抽成本</summary>
      <div className="subscription-cost-body">
        <span className="subscription-currency">{CURRENCY_LABELS[currency]} {CURRENCY_SYMBOLS[currency]}</span>
        <dl className="subscription-cost-grid">
          {getSubscriptionCosts(currency).map(pass => (
            <div className="subscription-cost-item" key={pass.name}>
              <dt>{pass.name}</dt>
              <dd className="subscription-cost-value">
                <strong>{formatCurrency(pass.perPull, currency)}</strong>{pass.perPull != null ? <span>／抽</span> : null}
              </dd>
              <dd className="subscription-cost-detail">售價 {formatCurrency(pass.price, currency)} · {pass.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="section-meta subscription-cost-note">{SUBSCRIPTION_COST_NOTE}</p>
      </div>
    </details>
  );
}
