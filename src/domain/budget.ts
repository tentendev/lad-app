import type { BudgetConfig, Expense, ExpenseCategory, PendingExpense } from "@/domain/types";
import { EXPENSE_CATEGORIES } from "@/domain/types";
import { csvCell, currentMonthKey, isValidDateKey, isValidMonthKey, moveMonth, toDateKey } from "@/domain/format";

const CATEGORY_MIGRATION: Record<string, ExpenseCategory> = {
  抽卡: "抽卡禮包",
  禮包: "抽卡禮包",
  月卡: "月卡/週卡",
};

export type BudgetState = "unset" | "healthy" | "warning" | "over";

export type BudgetSummary = {
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  threshold: number;
  state: BudgetState;
};

export type CategorySpending = {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
};

export type MonthlySpending = {
  month: string;
  amount: number;
};

export type SpendingInsights = {
  categories: CategorySpending[];
  months: MonthlySpending[];
  previousSpent: number;
  changeAmount: number;
  changePercentage: number | null;
  projectedMonthEnd: number | null;
};

export type BudgetPace = {
  status: "unavailable" | "on-track" | "projected-over" | "over";
  daysRemaining: number | null;
  dailyFlexibleSpend: number | null;
  projectedVariance: number | null;
};

export function nextExpenseId(expenses: Expense[], lastIssued = 0, now = Date.now()): number {
  const largestStored = expenses.reduce(
    (largest, expense) => Math.max(largest, Number.isFinite(expense.id) ? Math.floor(expense.id) : 0),
    0,
  );
  return Math.max(Math.floor(now), Math.floor(lastIssued) + 1, largestStored + 1);
}

export function migrateExpense(expense: Expense): Expense {
  return {
    ...expense,
    cat: CATEGORY_MIGRATION[expense.cat] ?? expense.cat,
    note: expense.note ?? "",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeAmount(value: unknown, allowZero = true): value is number {
  return typeof value === "number"
    && Number.isFinite(value)
    && value >= (allowZero ? 0 : Number.MIN_VALUE)
    && value <= Number.MAX_SAFE_INTEGER;
}

export function normalizeBudgetMap(value: unknown): Record<string, BudgetConfig> {
  if (!isRecord(value)) throw new Error("stored budget map is invalid");
  return Object.fromEntries(Object.entries(value).map(([month, config]) => {
    if (!isValidMonthKey(month) || !isRecord(config)) throw new Error("stored budget entry is invalid");
    const amount = config.amount;
    const threshold = config.threshold;
    if (!isSafeAmount(amount)) throw new Error("stored budget amount is invalid");
    if (typeof threshold !== "number" || !Number.isFinite(threshold) || threshold < 1 || threshold > 100) throw new Error("stored budget threshold is invalid");
    return [month, { amount, threshold }];
  }));
}

export function normalizeBudgetConfig(value: unknown, fallback: BudgetConfig): BudgetConfig {
  if (!isRecord(value)) return fallback;
  const amount = value.amount;
  const threshold = value.threshold;
  if (!isSafeAmount(amount)) return fallback;
  if (typeof threshold !== "number" || !Number.isFinite(threshold) || threshold < 1 || threshold > 100) return fallback;
  return { amount, threshold };
}

export function normalizeStoredExpenses(value: unknown): Expense[] {
  if (!Array.isArray(value)) throw new Error("stored expenses are invalid");
  const ids = new Set<number>();
  return value.map((entry) => {
    if (!isRecord(entry) || typeof entry.id !== "number" || !Number.isSafeInteger(entry.id) || entry.id <= 0 || ids.has(entry.id)) {
      throw new Error("stored expense id is invalid");
    }
    if (!isSafeAmount(entry.amt) || !isValidDateKey(entry.date)) {
      throw new Error("stored expense value is invalid");
    }
    const migratedCategory = typeof entry.cat === "string" ? CATEGORY_MIGRATION[entry.cat] ?? entry.cat : "";
    if (!EXPENSE_CATEGORIES.includes(migratedCategory as ExpenseCategory)) throw new Error("stored expense category is invalid");
    ids.add(entry.id);
    return {
      id: entry.id,
      amt: entry.amt,
      cat: migratedCategory as ExpenseCategory,
      note: typeof entry.note === "string" ? entry.note.trim() : "",
      date: entry.date,
    };
  });
}

export function normalizePendingExpense(value: unknown): PendingExpense | null {
  if (!isRecord(value) || !isSafeAmount(value.amt, false)) return null;
  const migratedCategory = typeof value.cat === "string" ? CATEGORY_MIGRATION[value.cat] ?? value.cat : "";
  if (!EXPENSE_CATEGORIES.includes(migratedCategory as ExpenseCategory) || !isValidDateKey(value.date)) return null;
  return {
    amt: value.amt,
    cat: migratedCategory as ExpenseCategory,
    note: typeof value.note === "string" ? value.note.trim() : "",
    date: value.date,
  };
}

export function normalizeExpenseDraft(value: unknown): Omit<Expense, "id"> | null {
  if (!isRecord(value) || !isSafeAmount(value.amt, false)) return null;
  const migratedCategory = typeof value.cat === "string" ? CATEGORY_MIGRATION[value.cat] ?? value.cat : "";
  if (!EXPENSE_CATEGORIES.includes(migratedCategory as ExpenseCategory) || !isValidDateKey(value.date)) return null;
  if (typeof value.note !== "string") return null;
  return {
    amt: value.amt,
    cat: migratedCategory as ExpenseCategory,
    note: value.note.trim(),
    date: value.date,
  };
}

export function expensesForMonth(expenses: Expense[], month: string): Expense[] {
  return expenses
    .filter((expense) => expense.date.slice(0, 7) === month)
    .sort((left, right) => right.date.localeCompare(left.date) || right.id - left.id);
}

export function expensesToCsv(expenses: Expense[]): string {
  return [
    ["date", "amount_twd", "category", "note"].map(csvCell).join(","),
    ...[...expenses]
      .sort((left, right) => right.date.localeCompare(left.date) || right.id - left.id)
      .map((expense) => [expense.date, expense.amt, expense.cat, expense.note].map(csvCell).join(",")),
  ].join("\n");
}

export function summarizeBudget(config: BudgetConfig | undefined, expenses: Expense[]): BudgetSummary {
  const budget = Math.max(0, Number(config?.amount) || 0);
  const threshold = Math.min(100, Math.max(1, Number(config?.threshold) || 80));
  const spent = expenses.reduce((total, expense) => total + Math.max(0, Number(expense.amt) || 0), 0);
  const remaining = budget - spent;
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const state: BudgetState =
    budget <= 0 ? "unset" : percentage >= 100 ? "over" : percentage >= threshold ? "warning" : "healthy";

  return { budget, spent, remaining, percentage, threshold, state };
}

/**
 * Converts a month-end projection into a decision for the remainder of the
 * current month. Future-dated commitments are already included in `summary`,
 * so the daily allowance is genuinely flexible money after known expenses.
 */
export function summarizeBudgetPace(
  summary: BudgetSummary,
  projectedMonthEnd: number | null,
  selectedMonth: string,
  now = new Date(),
): BudgetPace {
  if (selectedMonth !== currentMonthKey(now) || summary.budget <= 0 || projectedMonthEnd === null) {
    return { status: "unavailable", daysRemaining: null, dailyFlexibleSpend: null, projectedVariance: null };
  }

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1);
  const dailyFlexibleSpend = Math.floor(Math.max(0, summary.remaining) / daysRemaining);
  const projectedVariance = summary.budget - projectedMonthEnd;
  const status = summary.remaining < 0
    ? "over"
    : projectedVariance < 0
      ? "projected-over"
      : "on-track";

  return { status, daysRemaining, dailyFlexibleSpend, projectedVariance };
}

export function summarizeSpendingInsights(
  expenses: Expense[],
  selectedMonth: string,
  now = new Date(),
): SpendingInsights {
  const selectedExpenses = expensesForMonth(expenses, selectedMonth);
  const spent = selectedExpenses.reduce((total, expense) => total + Math.max(0, expense.amt), 0);
  const categories = EXPENSE_CATEGORIES
    .map((category) => ({
      category,
      amount: selectedExpenses
        .filter((expense) => expense.cat === category)
        .reduce((total, expense) => total + Math.max(0, expense.amt), 0),
    }))
    .filter((item) => item.amount > 0)
    .sort((left, right) => right.amount - left.amount || left.category.localeCompare(right.category, "zh-TW"))
    .map((item) => ({
      ...item,
      percentage: spent > 0 ? Math.round((item.amount / spent) * 100) : 0,
    }));

  const previousMonth = moveMonth(selectedMonth, -1);
  const previousSpent = expensesForMonth(expenses, previousMonth)
    .reduce((total, expense) => total + Math.max(0, expense.amt), 0);
  const changeAmount = spent - previousSpent;
  const changePercentage = previousSpent > 0 ? Math.round((changeAmount / previousSpent) * 100) : null;
  const months = Array.from({ length: 6 }, (_, index) => moveMonth(selectedMonth, index - 5)).map((month) => ({
    month,
    amount: expensesForMonth(expenses, month).reduce((total, expense) => total + Math.max(0, expense.amt), 0),
  }));

  let projectedMonthEnd: number | null = null;
  if (selectedMonth === currentMonthKey(now)) {
    const elapsedDays = Math.max(1, now.getDate());
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const today = toDateKey(now);
    const spentThroughToday = selectedExpenses
      .filter((expense) => expense.date <= today)
      .reduce((total, expense) => total + Math.max(0, expense.amt), 0);
    projectedMonthEnd = Math.max(spent, Math.round((spentThroughToday / elapsedDays) * daysInMonth));
  }

  return {
    categories,
    months,
    previousSpent,
    changeAmount,
    changePercentage,
    projectedMonthEnd,
  };
}
