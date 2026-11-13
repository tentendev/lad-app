import { ResourceIcon } from "./ResourceIcon.web";
import { formatNumber } from "@/domain/format";
import type { WalletResourcesProps } from "./WalletResources";
export function WalletResources({ cur, tickets }: WalletResourcesProps) {
  return (
    <a
      href="/calculator"
      className="wallet-resources"
      aria-label="查看鑽石與限定券，前往換算"
    >
      {(
        [
          ["diamond", "鑽石", cur],
          ["ticket", "限定券", tickets],
        ] as const
      ).map(([kind, label, value]) => (
        <div key={kind}>
          <ResourceIcon kind={kind} />
          <span>
            <small>{label}</small>
            <strong>{value === null ? "—" : formatNumber(value)}</strong>
          </span>
        </div>
      ))}
    </a>
  );
}
