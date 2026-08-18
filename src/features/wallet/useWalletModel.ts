import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { expensesForMonth, nextExpenseId, normalizeBudgetConfig, normalizeBudgetMap, normalizeExpenseDraft, normalizePendingExpense, normalizeStoredExpenses, summarizeBudget, summarizeBudgetPace, summarizeSpendingInsights } from "@/domain/budget";
import { currentMonthKey, moveMonth } from "@/domain/format";
import type { BudgetConfig, BudgetMap, Expense, PendingExpense } from "@/domain/types";
import { storage } from "@/data/repositories/storage";
import { STORAGE_KEYS } from "@/data/repositories/storage.types";

const DEFAULT_BUDGET: BudgetConfig = { amount: 0, threshold: 80 };

export function useWalletModel() {
  const currentMonth = currentMonthKey();
  const [month, setMonth] = useState(currentMonthKey());
  const [budgets, setBudgets] = useState<BudgetMap>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pendingExpense, setPendingExpense] = useState<PendingExpense | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [writeProtected, setWriteProtected] = useState(false);
  const lastExpenseId = useRef(0);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [storedBudgets, legacyBudget, storedExpenses, pending] = await Promise.all([
          storage.get<unknown>(STORAGE_KEYS.budgets, {}),
          storage.get<unknown>(STORAGE_KEYS.legacyBudget, DEFAULT_BUDGET),
          storage.get<unknown>(STORAGE_KEYS.expenses, []),
          storage.get<unknown>(STORAGE_KEYS.pendingExpense, null),
        ]);
        if (!active) return;
        const migratedBudgets = normalizeBudgetMap(storedBudgets);
        const migratedLegacyBudget = normalizeBudgetConfig(legacyBudget, DEFAULT_BUDGET);
        const migratedPendingExpense = normalizePendingExpense(pending);
        const current = currentMonthKey();
        if (!migratedBudgets[current] && migratedLegacyBudget.amount) migratedBudgets[current] = migratedLegacyBudget;
        const migratedExpenses = normalizeStoredExpenses(storedExpenses);
        lastExpenseId.current = migratedExpenses.reduce((largest, expense) => Math.max(largest, expense.id), 0);
        if (!active) return;
        setBudgets(migratedBudgets);
        setExpenses(migratedExpenses);
        setPendingExpense(migratedPendingExpense);
        setWriteProtected(false);
        setStorageError(null);
        await Promise.all([
          storage.set(STORAGE_KEYS.budgets, migratedBudgets),
          storage.set(STORAGE_KEYS.expenses, migratedExpenses),
        ]);
      } catch (error) {
        if (active) {
          setWriteProtected(true);
          setStorageError(
            error instanceof Error && error.message.startsWith("stored ")
              ? "裝置內的既有資料格式異常。為避免覆蓋，原資料已保留且本頁暫停載入；Web 請先從關於頁下載原始救援檔，iOS 請勿移除 App。"
              : "無法讀寫這台裝置的資料。請確認裝置仍有可用儲存空間，再重試；現有輸入不會被清除。",
          );
        }
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const monthExpenses = useMemo(() => expensesForMonth(expenses, month), [expenses, month]);
  const config = budgets[month] ?? DEFAULT_BUDGET;
  const previousConfig = budgets[moveMonth(month, -1)] ?? null;
  const summary = useMemo(() => summarizeBudget(config, monthExpenses), [config, monthExpenses]);
  const insights = useMemo(() => summarizeSpendingInsights(expenses, month), [expenses, month]);
  const pace = useMemo(
    () => summarizeBudgetPace(summary, insights.projectedMonthEnd, month),
    [insights.projectedMonthEnd, month, summary],
  );

  const saveBudget = useCallback(
    async (next: BudgetConfig): Promise<boolean> => {
      if (writeProtected) return false;
      if (!Number.isFinite(next.amount) || next.amount < 0 || next.amount > Number.MAX_SAFE_INTEGER) return false;
      const normalized = {
        amount: next.amount,
        threshold: Math.min(100, Math.max(1, Number(next.threshold) || 80)),
      };
      const updated = { ...budgets, [month]: normalized };
      try {
        await storage.set(STORAGE_KEYS.budgets, updated);
        setBudgets(updated);
        setStorageError(null);
        return true;
      } catch {
        setStorageError("預算無法儲存到這台裝置。請確認裝置仍有可用儲存空間後再試一次。");
        return false;
      }
    },
    [budgets, month, writeProtected],
  );

  const copyPreviousBudget = useCallback(async (): Promise<boolean> => {
    if (!previousConfig) return false;
    return saveBudget(previousConfig);
  }, [previousConfig, saveBudget]);

  const addExpense = useCallback(
    async (input: Omit<Expense, "id">): Promise<boolean> => {
      if (writeProtected) return false;
      const normalized = normalizeExpenseDraft(input);
      if (!normalized) return false;
      const id = nextExpenseId(expenses, lastExpenseId.current);
      lastExpenseId.current = id;
      const expense = { ...normalized, id };
      const updated = [expense, ...expenses];
      try {
        await storage.set(STORAGE_KEYS.expenses, updated);
        setExpenses(updated);
        setMonth(expense.date.slice(0, 7));
        setStorageError(null);
        return true;
      } catch {
        setStorageError("這筆花費尚未儲存。請確認裝置仍有可用儲存空間後再試一次；表單內容仍保留在畫面上。");
        return false;
      }
    },
    [expenses, writeProtected],
  );

  const updateExpense = useCallback(
    async (next: Expense): Promise<boolean> => {
      if (writeProtected) return false;
      const draft = normalizeExpenseDraft(next);
      if (!draft || !expenses.some((expense) => expense.id === next.id)) return false;
      const normalized = { ...draft, id: next.id };
      const updated = expenses.map((expense) => (expense.id === next.id ? normalized : expense));
      try {
        await storage.set(STORAGE_KEYS.expenses, updated);
        setExpenses(updated);
        setMonth(normalized.date.slice(0, 7));
        setStorageError(null);
        return true;
      } catch {
        setStorageError("修改尚未儲存，原本的花費紀錄沒有改變。請確認裝置儲存空間後再試一次。");
        return false;
      }
    },
    [expenses, writeProtected],
  );

  const deleteExpense = useCallback(
    async (id: number): Promise<boolean> => {
      if (writeProtected) return false;
      const updated = expenses.filter((expense) => expense.id !== id);
      try {
        await storage.set(STORAGE_KEYS.expenses, updated);
        setExpenses(updated);
        setStorageError(null);
        return true;
      } catch {
        setStorageError("刪除失敗，這筆花費仍然保留。請確認裝置儲存空間後再試一次。");
        return false;
      }
    },
    [expenses, writeProtected],
  );

  const restoreExpense = useCallback(
    async (expense: Expense): Promise<boolean> => {
      if (writeProtected) return false;
      const updated = [expense, ...expenses.filter((item) => item.id !== expense.id)];
      try {
        await storage.set(STORAGE_KEYS.expenses, updated);
        setExpenses(updated);
        setMonth(expense.date.slice(0, 7));
        setStorageError(null);
        return true;
      } catch {
        setStorageError("復原失敗，這筆花費尚未重新加入。請確認裝置儲存空間後再試一次。");
        return false;
      }
    },
    [expenses, writeProtected],
  );

  const consumePendingExpense = useCallback(async () => {
    setPendingExpense(null);
    try {
      await storage.remove(STORAGE_KEYS.pendingExpense);
      setStorageError(null);
    } catch {
      setStorageError("已帶入禮包建議，但暫存狀態無法清除；重新整理後可能再次出現同一筆建議。");
    }
  }, []);

  return {
    ready,
    writeProtected,
    month,
    isCurrentMonth: month === currentMonth,
    config,
    previousConfig,
    summary,
    insights,
    pace,
    expenses: monthExpenses,
    pendingExpense,
    storageError,
    previousMonth: () => setMonth((value) => moveMonth(value, -1)),
    nextMonth: () => setMonth((value) => moveMonth(value, 1)),
    goToCurrentMonth: () => setMonth(currentMonth),
    saveBudget,
    copyPreviousBudget,
    addExpense,
    updateExpense,
    deleteExpense,
    restoreExpense,
    consumePendingExpense,
  };
}
