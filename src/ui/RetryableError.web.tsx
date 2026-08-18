import type { ReactNode } from "react";

export function RetryableError({ children }: { children: ReactNode }) {
  return (
    <div className="status-note over retryable-error" role="alert">
      <span>{children}</span>
      <button type="button" onClick={() => window.location.reload()}>重新載入</button>
    </div>
  );
}
