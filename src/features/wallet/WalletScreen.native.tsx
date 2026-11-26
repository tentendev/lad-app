import { WalletResources } from "@/ui/WalletResources";
import { NativeDialog } from "@/ui/NativeDialog";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { BudgetSummary } from "@/ui/BudgetSummary";
import { NativeInput as TextInput, type NativeInputRef } from "@/ui/NativeInput";
import { SpendingDashboardNative } from "./SpendingDashboard.native";
import { NativeDateField } from "@/ui/NativeDateField";
import { Alert, Pressable, Share, View } from "react-native";
import { Button, Card, Typography } from "@/ui/NativeComponents";
import { useEffect, useRef, useState } from "react";
import Svg, { Path, Rect } from "react-native-svg";

import { expensesToCsv } from "@/domain/budget";
import { CURRENCY_LABELS, CURRENCY_SYMBOLS, formatCurrency as formatMoney, isValidDateKey, monthLabel, todayKey } from "@/domain/format";
import { CURRENCIES, EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from "@/domain/types";
import { NativePage } from "@/ui/NativePage";
import { NativeSelect } from "@/ui/NativeSelect";
import { NativeColumns } from "@/ui/NativeColumns";
import { NativeDisclosure } from "@/ui/NativeDisclosure";
import { useWalletModel } from "./useWalletModel";

function WalletGlyph({ type }: { type: "wallet" | "plus" | "list" }) {
  if (type === "plus") {
    return <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#80639f" strokeWidth={1.5} strokeLinecap="round"><Path d="M12 5v14M5 12h14" /></Svg>;
  }
  if (type === "list") {
    return <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#80639f" strokeWidth={1.5} strokeLinecap="round"><Path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></Svg>;
  }
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#80639f" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={6} width={18} height={13} rx={2} />
      <Path d="M3 10h18M16 15h2" />
    </Svg>
  );
}

export function WalletScreenNative() {
  const model = useWalletModel();
  const formatCurrency = (value: number | null) => formatMoney(value, model.currency);
  const [budget, setBudget] = useState("");
  const [threshold, setThreshold] = useState("80");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("抽卡禮包");
  const [date, setDate] = useState(todayKey());
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletedExpense, setDeletedExpense] = useState<Expense | null>(null);
  const [expenseFilter, setExpenseFilter] = useState<ExpenseCategory | "全部">("全部");
  const [exportError, setExportError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [handoffNotice, setHandoffNotice] = useState(false);
  const amountInput = useRef<NativeInputRef>(null);
  const pendingExpense = model.pendingExpense;
  const consumePendingExpense = model.consumePendingExpense;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setBudget(model.config.amount ? String(model.config.amount) : "");
      setThreshold(String(model.config.threshold || 80));
    });
    return () => cancelAnimationFrame(frame);
  }, [model.config.amount, model.config.threshold, model.month, model.currency]);

  useEffect(() => {
    if (!pendingExpense) return;
    const frame = requestAnimationFrame(() => {
      setAmount(String(pendingExpense.amt));
      setCategory(pendingExpense.cat);
      setDate(pendingExpense.date);
      setNote(pendingExpense.note);
      setFormError(null);
      setHandoffNotice(true);
      requestAnimationFrame(() => amountInput.current?.focus());
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
      setHandoffNotice(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    const nextAmount = Number(editAmount);
    if (!Number.isFinite(nextAmount) || nextAmount <= 0 || nextAmount > Number.MAX_SAFE_INTEGER) {
      setEditError("請輸入大於 0 且在安全範圍內的花費金額。");
      return;
    }
    if (!isValidDateKey(editing.date)) {
      setEditError("請輸入有效日期，格式為 YYYY-MM-DD。");
      return;
    }
    setEditError(null);
    setSubmitting(true);
    const saved = await model.updateExpense({ ...editing, amt: nextAmount });
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
    const confirmed = await new Promise<boolean>(resolve => Alert.alert("刪除花費", "確定要刪除這筆花費嗎？", [
      { text: "取消", style: "cancel", onPress: () => resolve(false) },
      { text: "刪除", style: "destructive", onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) }));
    if (!confirmed) return;
    setSubmitting(true);
    const deleted = await model.deleteExpense(expense.id);
    setSubmitting(false);
    if (deleted) { setDeletedExpense(expense); setEditing(current => current?.id === expense.id ? null : current); }
  }

  async function undoDelete() {
    if (!deletedExpense) return;
    setSubmitting(true);
    const restored = await model.restoreExpense(deletedExpense);
    setSubmitting(false);
    if (restored) setDeletedExpense(null);
  }

  async function shareCsv() {
    setExportError(null);
    try {
      const csv = "\uFEFF" + expensesToCsv(visibleExpenses);
      if (FileSystem.cacheDirectory && await Sharing.isAvailableAsync()) {
        const uri = `${FileSystem.cacheDirectory}deep-space-ledger-expenses-${model.currency}-${model.month}.csv`;
        await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(uri, { mimeType: "text/csv", UTI: "public.comma-separated-values-text", dialogTitle: "匯出花費 CSV" });
      } else await Share.share({ message: csv, title: `${monthLabel(model.month)}支出` });
    } catch { setExportError("無法匯出 CSV，請稍後再試。原有花費紀錄仍保留。"); }
  }

  const visibleExpenses = model.expenses.filter((expense) => expenseFilter === "全部" || expense.cat === expenseFilter);
  const comparisonCopy = model.insights.previousSpent === 0
    ? model.summary.spent > 0 ? "上月沒有支出可比較" : "尚無支出變化"
    : `${model.insights.changeAmount >= 0 ? "比上月多" : "比上月少"} ${formatCurrency(Math.abs(model.insights.changeAmount))}（${Math.abs(model.insights.changePercentage ?? 0)}%）`;
  const paceCopy = model.pace.status === "unavailable"
    ? null
    : model.pace.status === "over"
      ? `已超出當月預算；接下來 ${model.pace.daysRemaining} 天的彈性額度先以 ${formatCurrency(0)} 計。`
      : model.pace.status === "projected-over"
        ? `接下來 ${model.pace.daysRemaining} 天每日可彈性支出 ${formatCurrency(model.pace.dailyFlexibleSpend ?? 0)}；照目前速度月底仍可能超出 ${formatCurrency(Math.abs(model.pace.projectedVariance ?? 0))}。`
        : `接下來 ${model.pace.daysRemaining} 天每日可彈性支出 ${formatCurrency(model.pace.dailyFlexibleSpend ?? 0)}；照目前速度月底預計保留 ${formatCurrency(model.pace.projectedVariance ?? 0)}。`;

  if (!model.ready) {
    return (
      <NativePage workspace eyebrow="Deep Space Ledger" title="錢包" description="記下每次支出，讓預算提醒在真正需要時出現。資料只留在你的裝置。">
        <Card className="gap-4 border border-line bg-glass p-4" accessibilityRole="progressbar">
          <Typography className="type-body text-muted">正在讀取預算與花費…</Typography>
          <View className="h-12 rounded-xl bg-white/70" />
          <View className="h-40 rounded-2xl bg-white/70" />
        </Card>
      </NativePage>
    );
  }

  return (
    <NativePage workspace eyebrow="Deep Space Ledger" title="錢包" description="記下每次支出，讓預算提醒在真正需要時出現。資料只留在你的裝置。" action={<View className="gap-2"><View className="flex-row items-center justify-between gap-2">
        <Button accessibilityLabel="上一個月" variant="ghost" onPress={model.previousMonth}>←</Button>
        <Typography.Heading className="type-title text-ink">{monthLabel(model.month)}</Typography.Heading>
        <Button accessibilityLabel="下一個月" variant="ghost" onPress={model.nextMonth}>→</Button>
      </View>{!model.isCurrentMonth ? <Button variant="ghost" onPress={model.goToCurrentMonth}>回到當月</Button> : null}</View>}>
      {model.storageError ? <View accessibilityRole="alert" className="rounded-xl border border-[#ffafbd] bg-[#ff6675]/20 p-3"><Typography className="type-body text-ink">{model.storageError}</Typography></View> : null}
      {exportError ? <Typography accessibilityRole="alert" className="type-body text-danger">{exportError}</Typography> : null}
      {deletedExpense ? (
        <View accessibilityRole="alert" className="flex-row items-center justify-between rounded-xl border border-[#9cf0dc] bg-[#65d6c4]/20 p-3">
          <Typography className="flex-1 type-body text-ink">已刪除「{deletedExpense.note || deletedExpense.cat}」</Typography>
          <Button size="sm" variant="ghost" onPress={() => void undoDelete()}>復原</Button>
        </View>
      ) : null}

      <NativeColumns>
      <View className="gap-3">      <Card className="gap-3 p-4">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <View className="flex-row items-center gap-2"><WalletGlyph type="wallet" /><Typography.Heading type="h4" className="type-title text-ink">本月預算</Typography.Heading></View>
          <View style={{ width: 190, maxWidth: "100%" }}><NativeSelect compact label="幣別" value={model.currency} options={CURRENCIES} formatOption={currency => `${CURRENCY_LABELS[currency]} · ${CURRENCY_SYMBOLS[currency]}`} disabled={submitting || model.writeProtected} onChange={currency => { setAmount(""); setNote(""); setFormError(null); void model.setCurrency(currency); }} /></View>
        </View>
        <Typography className="type-label text-muted">預算與花費依幣別分開記錄，不合併換算。</Typography>

        <BudgetSummary {...model.summary} currency={model.currency} />
        <View accessibilityRole="alert" style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: model.summary.state === "over" ? "#c27891" : model.summary.state === "warning" ? "#c2a46c" : "#b3a1c8", backgroundColor: model.summary.state === "over" ? "#f8e9ee" : model.summary.state === "warning" ? "#fbf4e5" : "#f1ecf7" }}><Typography accessibilityLiveRegion="polite" className="type-body text-ink">{model.summary.state === "unset" ? "尚未設定當月預算" : model.summary.state === "over" ? `已超支 ${formatCurrency(Math.abs(model.summary.remaining))}` : `已使用 ${model.summary.percentage}%，剩餘可花 ${formatCurrency(model.summary.remaining)}`}</Typography></View>
        <NativeDisclosure title="設定預算與提醒門檻">
          <Typography className="type-body text-muted">每月預算（{CURRENCY_SYMBOLS[model.currency]}）</Typography>
          <TextInput accessibilityLabel="每月預算" className="rounded-xl border border-line bg-white/70 px-4 py-3 text-ink" keyboardType="decimal-pad" placeholder="每月預算" placeholderTextColor="#887d94" value={budget} onChangeText={(value) => { setBudgetError(null); setBudget(value); }} />
          <Typography className="type-body text-muted">提醒門檻（%）</Typography>
          <TextInput accessibilityLabel="提醒門檻" className="rounded-xl border border-line bg-white/70 px-4 py-3 text-ink" keyboardType="numeric" placeholder="提醒門檻（%）" placeholderTextColor="#887d94" value={threshold} onChangeText={(value) => { setBudgetError(null); setThreshold(value); }} />
          {budgetError ? <Typography accessibilityRole="alert" className="type-body text-danger">{budgetError}</Typography> : null}
          <Button isDisabled={submitting || model.writeProtected} onPress={() => void saveBudget()}>儲存設定</Button>
          {model.previousConfig ? <Button variant="ghost" isDisabled={submitting || model.writeProtected} onPress={() => void model.copyPreviousBudget()}>沿用上月 {formatCurrency(model.previousConfig.amount)}／{model.previousConfig.threshold}% 提醒</Button> : null}
        </NativeDisclosure>
</Card>
        <WalletResources {...model.resources}/>
      <Card className="gap-4 border border-line bg-glass p-4">
        <View className="flex-row items-center gap-2"><WalletGlyph type="plus" /><Typography.Heading type="h4" className="type-title text-ink">記一筆花費</Typography.Heading></View>
        {handoffNotice ? <Typography accessibilityRole="alert" className="type-body text-success">已帶入換算選擇，請確認金額與日期後再加入花費。</Typography> : null}
        <Typography className="type-body text-muted">花費金額（{CURRENCY_SYMBOLS[model.currency]}）</Typography>
        <TextInput ref={amountInput} accessibilityLabel="花費金額" className="rounded-xl border border-line bg-white/70 px-4 py-3 text-ink" keyboardType="decimal-pad" placeholder={`金額（${CURRENCY_SYMBOLS[model.currency]}）`} placeholderTextColor="#887d94" value={amount} onChangeText={(value) => { setFormError(null); setAmount(value); }} />
        <NativeSelect label="類別" value={category} options={EXPENSE_CATEGORIES} disabled={submitting || model.writeProtected} onChange={value => { setFormError(null); setCategory(value); }} />
        <NativeDateField label="消費日期" value={date} onChange={(value) => { setFormError(null); setDate(value); }} />
        <Typography className="type-body text-muted">花費備註（選填）</Typography>
        <TextInput accessibilityLabel="花費備註" className="rounded-xl border border-line bg-white/70 px-4 py-3 text-ink" placeholder="備註（選填）" placeholderTextColor="#887d94" value={note} onChangeText={(value) => { setFormError(null); setNote(value); }} />
        {formError ? <Typography accessibilityRole="alert" className="type-body text-danger">{formError}</Typography> : null}
        <Button isDisabled={submitting || model.writeProtected} onPress={() => void submitExpense()}>新增花費</Button>
      </Card>
      </View>




      </NativeColumns>

      <NativeColumns>
      <Card className="gap-3 border border-line bg-glass p-4">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <View className="flex-row items-center gap-2"><WalletGlyph type="list" /><Typography.Heading type="h4" className="type-title text-ink">月份明細</Typography.Heading></View>
          <View className="items-end gap-1">
            <Typography className="type-label text-muted">{visibleExpenses.length} 筆</Typography>
            <Button size="sm" variant="ghost" isDisabled={!visibleExpenses.length} onPress={() => void shareCsv()}>匯出 CSV</Button>
          </View>
        </View>
        <View className="gap-2">
          <Typography className="type-label text-muted">紀錄與匯出範圍</Typography>
          <View className="flex-row flex-wrap gap-2">
            {(["全部", ...EXPENSE_CATEGORIES] as const).map((item) => (
              <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: item === expenseFilter }} className={`min-h-12 max-w-full justify-center rounded-full border px-3 py-2 ${item === expenseFilter ? "border-[#a78bfa] bg-[#a78bfa]/25" : "border-line bg-white/60"}`} onPress={() => setExpenseFilter(item)}><Typography className="type-label font-semibold text-ink">{item}</Typography></Pressable>
            ))}
          </View>
        </View>
        {visibleExpenses.length === 0 ? <Typography.Paragraph className="py-8 text-center text-muted">{model.expenses.length === 0 ? "這個月還沒有花費紀錄" : "這個類別目前沒有花費紀錄"}</Typography.Paragraph> : null}
        {visibleExpenses.map((expense) => (
          <View key={expense.id} className="gap-2 rounded-xl border border-line bg-white/70 p-3">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Typography.Paragraph className="font-semibold text-ink">{expense.note || expense.cat}</Typography.Paragraph>
                <Typography className="text-muted">{expense.cat} · {expense.date}</Typography>
              </View>
              <Typography.Paragraph className="font-semibold text-ink">{formatCurrency(expense.amt)}</Typography.Paragraph>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Button size="sm" variant="secondary" onPress={() => { setEditError(null); setEditAmount(String(expense.amt)); setEditing({ ...expense }); }}>編輯</Button>
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



      <View style={{ gap: 16 }}>
      <Card className="gap-4 border border-line bg-glass p-4">
        <NativeDisclosure title="當月支出洞察與預估">
          <View className="gap-1 rounded-xl border border-line bg-white/70 p-3">
            <Typography className="type-label text-muted">與上月相比</Typography>
            <Typography className="font-semibold text-ink">{comparisonCopy}</Typography>
            <Typography className="mt-2 type-label text-muted">月底預估</Typography>
            <Typography className="font-semibold text-ink">{model.insights.projectedMonthEnd === null ? "僅當月提供" : formatCurrency(model.insights.projectedMonthEnd)}</Typography>
          </View>
          {paceCopy ? (
            <View accessibilityRole="summary" className={`rounded-xl border p-3 ${model.pace.status === "on-track" ? "border-[#9cf0dc] bg-[#65d6c4]/15" : model.pace.status === "over" ? "border-[#ffafbd] bg-[#ff6675]/20" : "border-[#ffd991] bg-[#f0b95e]/15"}`}>
              <Typography className="type-body text-ink">{paceCopy}</Typography>
            </View>
          ) : null}
          {model.insights.categories.length === 0 ? (
            <Typography.Paragraph className="py-4 text-center text-muted">記下一筆花費後，這裡會顯示類別占比與月度趨勢。</Typography.Paragraph>
          ) : model.insights.categories.map((item) => (
            <View className="gap-2" key={item.category} accessibilityLabel={`${item.category} ${formatCurrency(item.amount)}，占 ${item.percentage}%`}>
              <View className="flex-row flex-wrap justify-between gap-3">
                <Typography className="type-body text-ink">{item.category}</Typography>
                <Typography className="type-body font-semibold text-ink">{formatCurrency(item.amount)} · {item.percentage}%</Typography>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-black/20">
                <View className="h-full rounded-full bg-[#a78bfa]" style={{ width: `${item.percentage}%` }} />
              </View>
            </View>
          ))}

        </NativeDisclosure>
      </Card>

      <SpendingDashboardNative expenses={model.allExpenses} month={model.month} currency={model.currency} onSelectMonth={model.selectMonth} />

      </View>
      </NativeColumns>

      {editing ? (
        <NativeDialog label="編輯花費" onClose={() => { setEditError(null); setEditing(null); }}>
        <Card className="gap-4 border border-line bg-glass p-4">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <Typography.Heading type="h4" className="type-title text-ink">編輯花費</Typography.Heading>
            <Button size="sm" variant="ghost" onPress={() => setEditing(null)}>取消</Button>
          </View>
          <TextInput
            autoFocus
            accessibilityLabel="編輯花費金額"
            className="rounded-xl border border-line bg-white/70 px-4 py-3 text-ink"
            keyboardType="decimal-pad"
            placeholder={`金額（${CURRENCY_SYMBOLS[model.currency]}）`}
            placeholderTextColor="#887d94"
            value={editAmount}
            onChangeText={(value) => { setEditError(null); setEditAmount(value); }}
          />
          <NativeSelect label="編輯花費類別" value={editing.cat} options={EXPENSE_CATEGORIES} onChange={cat => { setEditError(null); setEditing({ ...editing, cat }); }} />
          <NativeDateField label="編輯消費日期" value={editing.date} onChange={(value) => { setEditError(null); setEditing({ ...editing, date: value }); }} />
          <TextInput accessibilityLabel="編輯花費備註" className="rounded-xl border border-line bg-white/70 px-4 py-3 text-ink" value={editing.note} onChangeText={(value) => { setEditError(null); setEditing({ ...editing, note: value }); }} />
          {editError ? <Typography accessibilityRole="alert" className="type-body text-danger">{editError}</Typography> : null}
          <Button isDisabled={submitting || model.writeProtected} onPress={() => void saveEdit()}>儲存修改</Button>
          <Button variant="danger-soft" isDisabled={submitting || model.writeProtected} onPress={() => void removeExpense(editing)}>刪除這筆</Button>
        </Card>
        </NativeDialog>
      ) : null}
    </NativePage>
  );
}
