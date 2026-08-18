export function DeviceDataLoading({ label = "正在讀取裝置資料…" }: { label?: string }) {
  return (
    <div className="device-loading" role="status" aria-live="polite" aria-busy="true">
      <span>{label}</span>
      <div className="device-loading-grid" aria-hidden="true">
        <div className="device-loading-card device-loading-card--hero">
          <i />
          <i />
          <i />
        </div>
        <div className="device-loading-card">
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}
