import { Card } from "@heroui/react/card";

import { SUBSCRIPTION_COST_NOTE, SUBSCRIPTION_COSTS } from "@/data/subscriptionCosts";
import { formatCurrency } from "@/domain/format";

export function SubscriptionCostReference() {
  return (
    <section aria-labelledby="subscription-cost-title">
      <Card className="product-card subscription-cost-reference">
        <div className="section-heading">
          <h2 id="subscription-cost-title" className="section-title">月卡／週卡每抽成本</h2>
          <span className="subscription-currency">台幣 NT$</span>
        </div>
        <dl className="subscription-cost-grid">
          {SUBSCRIPTION_COSTS.map(pass => (
            <div className="subscription-cost-item" key={pass.name}>
              <dt>{pass.name}</dt>
              <dd className="subscription-cost-value">
                <strong>{formatCurrency(pass.perPull)}</strong><span>／抽</span>
              </dd>
              <dd className="subscription-cost-detail">售價 {formatCurrency(pass.price)} · {pass.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="section-meta subscription-cost-note">{SUBSCRIPTION_COST_NOTE}</p>
      </Card>
    </section>
  );
}
