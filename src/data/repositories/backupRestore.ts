import type { LocalBackupData } from "@/domain/backup";
import type { StorageRepository } from "./storage.types";
import { STORAGE_KEYS } from "./storage.types";

type Snapshot = Record<(typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS], string | null>;

async function writeValue(storage: StorageRepository, key: string, value: unknown | undefined) {
  if (value === undefined) await storage.remove(key);
  else await storage.set(key, value);
}

export async function restoreLocalBackup(
  storage: StorageRepository,
  backup: LocalBackupData,
): Promise<void> {
  const entries = Object.values(STORAGE_KEYS);
  const values = await Promise.all(entries.map((key) => storage.getRaw(key)));
  const before = Object.fromEntries(entries.map((key, index) => [key, values[index]])) as Snapshot;

  try {
    await storage.set(STORAGE_KEYS.budgets, backup.budgets);
    await storage.set(STORAGE_KEYS.expenses, backup.expenses);
    await writeValue(storage, STORAGE_KEYS.calculator, backup.calculator ?? undefined);
    await storage.set(STORAGE_KEYS.planner, backup.planner);
    await storage.set(STORAGE_KEYS.wishTracker, backup.wishTracker);
    if (backup.schedulePreferences !== null) {
      await storage.set(STORAGE_KEYS.schedulePreferences, backup.schedulePreferences);
    }
    await storage.remove(STORAGE_KEYS.legacyBudget);
    await storage.remove(STORAGE_KEYS.pendingExpense);
    await storage.remove(STORAGE_KEYS.pendingPullGoal);
    await storage.remove(STORAGE_KEYS.pendingCalculatorTarget);
  } catch {
    const rollback = await Promise.allSettled(entries.map((key) => storage.setRaw(key, before[key])));
    const rollbackFailed = rollback.some((result) => result.status === "rejected");
    throw new Error(
      rollbackFailed
        ? "備份還原失敗，且部分原資料無法自動復原。請先不要關閉頁面，並重新下載備份確認。"
        : "備份還原失敗，原本的資料已保留，請確認裝置儲存空間後再試一次。",
    );
  }
}
