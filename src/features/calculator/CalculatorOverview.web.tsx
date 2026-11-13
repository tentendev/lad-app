import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { ResourceIcon } from "@/ui/ResourceIcon.web";
import { formatNumber } from "@/domain/format";
import type { CalculatorOverviewProps } from "./CalculatorOverview";
export function CalculatorOverview({
  draft,
  resource,
  onChange,
  onPlan,
}: CalculatorOverviewProps) {
  const target = resource.totalPulls;
  const percentage =
    target > 0
      ? Math.min(
          100,
          Math.round((resource.availablePulls / target) * 1000) / 10,
        )
      : 0;
  return (
    <section className="calculator-overview" aria-label="心願換算摘要">
      <div className="pearl-resource-inputs">
        {(
          [
            ["diamond", "鑽石", "cur", draft.cur, "目前持有鑽石"],
            ["ticket", "限定券", "tickets", draft.tickets, "原有金券"],
          ] as const
        ).map(([kind, label, key, value, aria]) => (
          <label key={key}>
            <span>
              <ResourceIcon kind={kind} />
              {label}
            </span>
            <Input
              aria-label={aria}
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={value ? String(value) : ""}
              onChange={(e) => onChange(key, Number(e.target.value))}
            />
          </label>
        ))}
      </div>
      <div className="pearl-pull-summary">
        <div>
          <span>可抽</span>
          <strong>
            {formatNumber(resource.availablePulls)}
            <small>抽</small>
          </strong>
        </div>
        <div>
          <span>目標</span>
          <strong>
            {target ? formatNumber(target) : "—"}
            <small>抽</small>
          </strong>
        </div>
      </div>
      <div className="pearl-pull-progress">
        <span>
          {formatNumber(resource.availablePulls)} / {formatNumber(target)} 抽（
          {percentage}%）
        </span>
        <div
          role="progressbar"
          aria-label="抽卡目標達成率"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <i style={{ width: `${percentage}%` }} />
        </div>
      </div>
      <div className="pearl-pull-gap">
        <div>
          <span aria-hidden="true">✦</span>
          <p>
            還差 <strong>{formatNumber(resource.paidPulls)}</strong> 抽
          </p>
        </div>
        <div>
          <small>需再準備</small>
          <p>
            <strong>{formatNumber(resource.gapDia)}</strong> 鑽石
          </p>
        </div>
      </div>
      <Button fullWidth className="pearl-plan-button" onPress={onPlan}>
        ⟳ 更新規劃
      </Button>
      {resource.officialTickets > 0 || resource.reservePulls > 0 ? (
        <p className="calculator-resource-note">
          {resource.officialTickets > 0
            ? `含官方券 ${resource.officialTickets} 張；`
            : ""}
          {resource.reservePulls > 0
            ? `目標含預留 ${formatNumber(resource.reservePulls)} 抽。`
            : ""}
          可在換算設定調整。
        </p>
      ) : null}
    </section>
  );
}
