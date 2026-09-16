import { SpendingDashboardNative } from "./SpendingDashboard.native";
import { NativeDateField } from "@/ui/NativeDateField";
import { Pressable, ScrollView, Share, TextInput, View } from "react-native";
import { Button, Card, Typography } from "heroui-native";
import { useEffect, useState } from "react";
import Svg, { Path, Rect } from "react-native-svg";

import { expensesToCsv } from "@/domain/budget";
import { formatCurrency, isValidDateKey, monthLabel, todayKey } from "@/domain/format";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from "@/domain/types";
import { NativePage } from "@/ui/NativePage";
import { useWalletModel } from "./useWalletModel";

function WalletGlyph({ type }: { type: "wallet" | "plus" | "list" }) {
  if (type === "plus") {
    return <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round"><Path d="M12 5v14M5 12h14" /></Svg>;
  }
  if (type === "list") {
    return <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round"><Path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></Svg>;
  }
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={6} width={18} height={13} rx={2} />
      <Path d="M3 10h18M16 15h2" />
    </Svg>
  );
}

export function WalletScreenNative() {
  const model = useWalletModel();
  const [budget, setBudget] = useState("");
  const [threshold, setThreshold] = useState("80");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("抽卡禮包");
  const [date, setDate] = useState(todayKey());
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletedExpense, setDeletedExpense] = useState<Expense | null>(null);
  const [expenseFilter, setExpenseFilter] = useState<ExpenseCategory | "全部">("全部");
  const [submitting, setSubmitting] = useState(false);
  const pendingExpense = model.pendingExpense;
  const consumePendingExpense = model.consumePendingExpense;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setBudget(model.config.amount ? String(model.config.amount) : "");
      setThreshold(String(model.config.threshold || 80));
    });
    return () => cancelAnimationFrame(frame);
  }, [model.config.amount, model.config.threshold, model.month]);

  useEffect(() => {
    if (!pendingExpense) return;
    const frame = requestAnimationFrame(() => {
      setAmount(String(pendingExpense.amt));
      setCategory(pendingExpense.cat);
      setDate(pendingExpense.date);
      setNote(pendingExpense.note);
      void consumePendingExpense();
    });
    return () => cancelAnimationFrame(frame);
  }, [consumePendingExpense, pendingExpense]);

  async function submitExpense() {
    const nextAmount = Number(amount);
    if (!Number.isFinite(nextAmount) || nextAmount <= 0 || nextAmount > Number.MAX_SAFE_INTEGER) {
      setFormError("請輸入大於 0 且在安全範圍內的花費金額。");
      return;
    }
    if (!isValidDateKey(date)) {
      setFormError("請輸入有效日期，格式為 YYYY-MM-DD。");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    const saved = await model.addExpense({ amt: nextAmount, cat: category, date, note: note.trim() });
    setSubmitting(false);
    if (saved) {
      setAmount("");
      setNote("");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    if (!Number.isFinite(editing.amt) || editing.amt <= 0 || editing.amt > Number.MAX_SAFE_INTEGER) {
      setEditError("請輸入大於 0 且在安全範圍內的花費金額。");
      return;
    }
    if (!isValidDateKey(editing.date)) {
      setEditError("請輸入有效日期，格式為 YYYY-MM-DD。");
      return;
    }
    setEditError(null);
    setSubmitting(true);
    const saved = await model.updateExpense(editing);
    setSubmitting(false);
    if (saved) setEditing(null);
  }

  async function saveBudget() {
    const nextBudget = Number(budget);
    const nextThreshold = Number(threshold);
    if (!Number.isFinite(nextBudget) || nextBudget < 0 || nextBudget > Number.MAX_SAFE_INTEGER) {
      setBudgetError("預算需為 0 或安全範圍內的正數。");
      return;
    }
    if (!Number.isFinite(nextThreshold) || nextThreshold < 1 || nextThreshold > 100) {
      setBudgetError("提醒門檻請輸入 1 到 100 之間的數字。");
      return;
    }
    setBudgetError(null);
    setSubmitting(true);
    await model.saveBudget({ amount: nextBudget, threshold: nextThreshold });
    setSubmitting(false);
  }

  async function removeExpense(expense: Expense) {
    setSubmitting(true);
    const deleted = await model.deleteExpense(expense.id);
    setSubmitting(false);
    if (deleted) setDeletedExpense(expense);
  }

  async function undoDelete() {
    if (!deletedExpense) return;
    setSubmitting(true);
    const restored = await model.restoreExpense(deletedExpense);
    setSubmitting(false);
    if (restored) setDeletedExpense(null);
  }

  const visibleExpenses = model.expenses.filter((expense) => expenseFilter === "全部" || expense.cat === expenseFilter);
  const comparisonCopy = model.insights.previousSpent === 0
    ? model.summary.spent > 0 ? "上月沒有支出可比較" : "尚無支出變化"
    : `${model.insights.changeAmount >= 0 ? "比上月多" : "比上月少"} ${formatCurrency(Math.abs(model.insights.changeAmount))}（${Math.abs(model.insights.changePercentage ?? 0)}%）`;
  const paceCopy = model.pace.status === "unavailable"
    ? null
    : model.pace.status === "over"
      ? `已超出當月預算；接下來 ${model.pace.daysRemaining} 天的彈性額度先以 NT$0 計。`
      : model.pace.status === "projected-over"
        ? `接下來 ${model.pace.daysRemaining} 天每日可彈性支出 ${formatCurrency(model.pace.dailyFlexibleSpend ?? 0)}；照目前速度月底仍可能超出 ${formatCurrency(Math.abs(model.pace.projectedVariance ?? 0))}。`
        : `接下來 ${model.pace.daysRemaining} 天每日可彈性支出 ${formatCurrency(model.pace.dailyFlexibleSpend ?? 0)}；照目前速度月底預計保留 ${formatCurrency(model.pace.projectedVariance ?? 0)}。`;

  if (!model.ready) {
    return (
      <NativePage eyebrow="Deep Space Ledger" title="錢包" description="記下每次支出，讓預算提醒在真正需要時出現。資料只留在你的裝置。">
        <Card className="gap-4 border border-white/40 bg-[#493b70]/70 p-4" accessibilityRole="progressbar">
          <Typography className="text-sm text-white/70">正在讀取預算與花費…</Typography>
          <View className="h-12 rounded-xl bg-white/10" />
          <View className="h-40 rounded-2xl bg-white/10" />
        </Card>
      </NativePage>
    );
  }

  return (
    <NativePage eyebrow="Deep Space Ledger" title="錢包" description="記下每次支出，讓預算提醒在真正需要時出現。資料只留在你的裝置。">
      <View className="flex-row items-center justify-between">
        <Button accessibilityLabel="上一個月" size="sm" variant="ghost" className="border border-white/45" onPress={model.previousMonth}>←</Button>
        <Typography.Heading className="text-2xl text-white">{monthLabel(model.month)}</Typography.Heading>
        <Button accessibilityLabel="下一個月" size="sm" variant="ghost" className="border border-white/45" onPress={model.nextMonth}>→</Button>
      </View>
      {!model.isCurrentMonth ? <Button size="sm" variant="ghost" className="self-center border border-white/35" onPress={model.goToCurrentMonth}>回到當月</Button> : null}

      {model.storageError ? <View accessibilityRole="alert" className="rounded-xl border border-[#ffafbd] bg-[#ff6675]/20 p-3"><Typography className="text-sm text-white">{model.storageError}</Typography></View> : null}
      {deletedExpense ? (
        <View accessibilityRole="alert" className="flex-row items-center justify-between rounded-xl border border-[#9cf0dc] bg-[#65d6c4]/20 p-3">
          <Typography className="flex-1 text-sm text-white">已刪除「{deletedExpense.note || deletedExpense.cat}」</Typography>
          <Button size="sm" variant="ghost" onPress={() => void undoDelete()}>復原</Button>
        </View>
      ) : null}

      <Card className="gap-4 border border-white/55 bg-[#493b70]/75 p-5">
        <View className="flex-row items-center gap-2"><WalletGlyph type="wallet" /><Typography className="text-white/70">當月剩餘可花</Typography></View>
        <Typography.Heading className="text-4xl text-white">{formatCurrency(model.summary.remaining)}</Typography.Heading>
        <Typography.Paragraph className="text-white/70">
          已花 {formatCurrency(model.summary.spent)} · 預算 {formatCurrency(model.summary.budget)} · {model.summary.percentage}%
        </Typography.Paragraph>
        <View className="h-2 overflow-hidden rounded-full bg-black/20">
          <View className="h-full rounded-full bg-[#65d6c4]" style={{ width: `${Math.min(100, model.summary.percentage)}%` }} />
        </View>
      </Card>

      <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="flex-row items-center justify-between">
          <Typography.Heading className="text-xl text-white">支出洞察</Typography.Heading>

        </View>
        <View className="gap-1 rounded-xl border border-white/20 bg-white/10 p-3">
          <Typography className="text-xs text-white/55">與上月相比</Typography>
          <Typography className="font-semibold text-white">{comparisonCopy}</Typography>
          <Typography className="mt-2 text-xs text-white/55">月底預估</Typography>
          <Typography className="font-semibold text-white">{model.insights.projectedMonthEnd === null ? "僅當月提供" : formatCurrency(model.insights.projectedMonthEnd)}</Typography>
        </View>
        {paceCopy ? (
          <View accessibilityRole="summary" className={`rounded-xl border p-3 ${model.pace.status === "on-track" ? "border-[#9cf0dc] bg-[#65d6c4]/15" : model.pace.status === "over" ? "border-[#ffafbd] bg-[#ff6675]/20" : "border-[#ffd991] bg-[#f0b95e]/15"}`}>
            <Typography className="text-sm leading-5 text-white">{paceCopy}</Typography>
          </View>
        ) : null}
        {model.insights.categories.length === 0 ? (
          <Typography.Paragraph className="py-4 text-center text-white/60">記下一筆花費後，這裡會顯示類別占比與月度趨勢。</Typography.Paragraph>
        ) : model.insights.categories.map((item) => (
          <View className="gap-2" key={item.category} accessibilityLabel={`${item.category} ${formatCurrency(item.amount)}，占 ${item.percentage}%`}>
            <View className="flex-row justify-between gap-3">
              <Typography className="text-sm text-white">{item.category}</Typography>
              <Typography className="text-sm font-semibold text-white">{formatCurrency(item.amount)} · {item.percentage}%</Typography>
            </View>
            <View className="h-1.5 overflow-hidden rounded-full bg-black/20">
              <View className="h-full rounded-full bg-[#a78bfa]" style={{ width: `${item.percentage}%` }} />
            </View>
          </View>
        ))}

      </Card>

      <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
        <Typography.Heading className="text-xl text-white">預算設定</Typography.Heading>
        <TextInput accessibilityLabel="每月預算" className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white" keyboardType="numeric" placeholder="每月預算" placeholderTextColor="rgba(255,255,255,.5)" value={budget} onChangeText={(value) => { setBudgetError(null); setBudget(value); }} />
        <TextInput accessibilityLabel="提醒門檻" className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white" keyboardType="numeric" placeholder="提醒門檻（%）" placeholderTextColor="rgba(255,255,255,.5)" value={threshold} onChangeText={(value) => { setBudgetError(null); setThreshold(value); }} />
        {budgetError ? <Typography accessibilityRole="alert" className="text-sm text-[#ffc2cb]">{budgetError}</Typography> : null}
        <Button isDisabled={submitting || model.writeProtected} onPress={() => void saveBudget()}>儲存當月設定</Button>
        {model.previousConfig ? <Button variant="ghost" isDisabled={submitting || model.writeProtected} onPress={() => void model.copyPreviousBudget()}>沿用上月 {formatCurrency(model.previousConfig.amount)}／{model.previousConfig.threshold}% 提醒</Button> : null}
      </Card>

      <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="flex-row items-center gap-2"><WalletGlyph type="plus" /><Typography.Heading className="text-xl text-white">新增花費</Typography.Heading></View>
        <TextInput accessibilityLabel="花費金額" className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white" keyboardType="numeric" placeholder="金額（NT$）" placeholderTextColor="rgba(255,255,255,.5)" value={amount} onChangeText={(value) => { setFormError(null); setAmount(value); }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {EXPENSE_CATEGORIES.map((item) => (
            <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: item === category }} className={`min-h-11 justify-center rounded-full border px-3 py-2 ${item === category ? "border-[#a78bfa] bg-[#a78bfa]/25" : "border-white/30 bg-white/5"}`} onPress={() => { setFormError(null); setCategory(item); }}><Typography className="text-xs font-semibold text-white">{item}</Typography></Pressable>
          ))}
        </ScrollView>
        <NativeDateField label="消費日期" value={date} onChange={(value) => { setFormError(null); setDate(value); }} />
        <TextInput accessibilityLabel="花費備註" className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white" placeholder="備註（選填）" placeholderTextColor="rgba(255,255,255,.5)" value={note} onChangeText={(value) => { setFormError(null); setNote(value); }} />
        {formError ? <Typography accessibilityRole="alert" className="text-sm text-[#ffc2cb]">{formError}</Typography> : null}
        <Button isDisabled={submitting || model.writeProtected} onPress={() => void submitExpense()}>加入花費</Button>
      </Card>

      <Card className="gap-3 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2"><WalletGlyph type="list" /><Typography.Heading className="text-xl text-white">花費紀錄</Typography.Heading></View>
          <View className="items-end gap-1">
            <Typography className="text-xs text-white/60">{visibleExpenses.length} 筆</Typography>
            <Button size="sm" variant="ghost" isDisabled={!visibleExpenses.length} onPress={() => void Share.share({ message: expensesToCsv(visibleExpenses), title: `${monthLabel(model.month)}支出` })}>分享 CSV</Button>
          </View>
        </View>
        <View className="gap-2">
          <Typography className="text-xs text-white/55">紀錄與匯出範圍</Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            {(["全部", ...EXPENSE_CATEGORIES] as const).map((item) => (
              <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: item === expenseFilter }} className={`min-h-11 justify-center rounded-full border px-3 py-2 ${item === expenseFilter ? "border-[#a78bfa] bg-[#a78bfa]/25" : "border-white/30 bg-white/5"}`} onPress={() => setExpenseFilter(item)}><Typography className="text-xs font-semibold text-white">{item}</Typography></Pressable>
            ))}
          </ScrollView>
        </View>
        {visibleExpenses.length === 0 ? <Typography.Paragraph className="py-8 text-center text-white/60">{model.expenses.length === 0 ? "這個月還沒有花費紀錄" : "這個類別目前沒有花費紀錄"}</Typography.Paragraph> : null}
        {visibleExpenses.map((expense) => (
          <View key={expense.id} className="gap-2 rounded-xl border border-white/20 bg-white/10 p-3">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Typography.Paragraph className="font-semibold text-white">{expense.note || expense.cat}</Typography.Paragraph>
                <Typography className="text-white/55">{expense.cat} · {expense.date}</Typography>
              </View>
              <Typography.Paragraph className="font-bold text-white">{formatCurrency(expense.amt)}</Typography.Paragraph>
            </View>
            <View className="flex-row gap-2">
              <Button size="sm" variant="secondary" onPress={() => setEditing({ ...expense })}>編輯</Button>
              <Button
                size="sm"
                variant="danger-soft"
                isDisabled={submitting || model.writeProtected}
                onPress={() => void removeExpense(expense)}
              >
                刪除
              </Button>
            </View>
          </View>
        ))}
      </Card>

      <SpendingDashboardNative expenses={model.allExpenses} month={model.month} onSelectMonth={model.selectMonth} />

      {editing ? (
        <Card className="gap-4 border border-white/50 bg-[#493b70]/85 p-4">
          <View className="flex-row items-center justify-between">
            <Typography.Heading className="text-xl text-white">編輯花費</Typography.Heading>
            <Button size="sm" variant="ghost" onPress={() => setEditing(null)}>取消</Button>
          </View>
          <TextInput
            accessibilityLabel="編輯花費金額"
            className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white"
            keyboardType="numeric"
            placeholder="金額（NT$）"
            placeholderTextColor="rgba(255,255,255,.5)"
            value={String(editing.amt)}
            onChangeText={(value) => { setEditError(null); setEditing({ ...editing, amt: Number(value) }); }}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            {EXPENSE_CATEGORIES.map((item) => (
              <Button key={item} size="sm" variant={item === editing.cat ? "primary" : "secondary"} onPress={() => { setEditError(null); setEditing({ ...editing, cat: item }); }}>{item}</Button>
            ))}
          </ScrollView>
          <NativeDateField label="編輯消費日期" value={editing.date} onChange={(value) => { setEditError(null); setEditing({ ...editing, date: value }); }} />
          <TextInput accessibilityLabel="編輯花費備註" className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white" value={editing.note} onChangeText={(value) => { setEditError(null); setEditing({ ...editing, note: value }); }} />
          {editError ? <Typography accessibilityRole="alert" className="text-sm text-[#ffc2cb]">{editError}</Typography> : null}
          <Button isDisabled={submitting || model.writeProtected} onPress={() => void saveEdit()}>儲存修改</Button>
        </Card>
      ) : null}
    </NativePage>
  );
}
