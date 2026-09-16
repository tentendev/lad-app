import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Button, Card, Typography } from "heroui-native";
import { storage } from "@/data/repositories/storage";
import { spendingRangeError, summarizeSpendingRange } from "@/domain/budget";
import { formatCurrency, monthLabel, moveMonth } from "@/domain/format";
import type { Expense } from "@/domain/types";

type Range = { mode: "6" | "12" | "custom"; start: string; end: string };

export function SpendingDashboardNative({ expenses, month, onSelectMonth }: { expenses: Expense[]; month: string; onSelectMonth: (month: string) => void }) {
  const initial = useRef<Range>({ mode: "6", start: moveMonth(month, -5), end: month });
  const [range, setRange] = useState<Range>({ mode: "6", start: moveMonth(month, -5), end: month });
  const [start, setStart] = useState(range.start);
  const [end, setEnd] = useState(range.end);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const queue = useRef(Promise.resolve());
  const startInput = useRef<TextInput>(null);
  useEffect(() => {
    let active = true;
    void storage.get<Range | null>("expense_chart", null).then(saved => {
      if (!active) return;
      const valid = saved && ["6", "12", "custom"].includes(saved.mode) && !spendingRangeError(saved.start, saved.end);
      const next = valid ? saved : initial.current;
      setRange(next); setStart(next.start); setEnd(next.end); setReady(true);
    }).catch(() => { if (active) setSaveError("無法讀取統計設定；仍可比較月份，本次不會覆蓋原設定。"); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    queue.current = queue.current.catch(() => undefined).then(() => storage.set("expense_chart", range));
    void queue.current.then(() => { if (active) setSaveError(null); }).catch(() => { if (active) setSaveError("統計期間尚未儲存，請確認裝置儲存空間。"); });
    return () => { active = false; };
  }, [ready, range]);
  const from = range.mode === "custom" ? range.start : moveMonth(month, -Number(range.mode) + 1);
  const to = range.mode === "custom" ? range.end : month;
  const data = summarizeSpendingRange(expenses, from, to);
  const maximum = Math.max(1, ...data.months.map(item => item.amount));
  return <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} className="min-h-11 flex-row items-center justify-between" onPress={() => setOpen(!open)}><Typography.Heading className="text-xl text-white">每月花費統計</Typography.Heading><Typography className="text-white">{open ? "⌃" : "⌄"}</Typography></Pressable>
    {open ? <View className="gap-4">
      <Typography className="text-sm text-white/65">{from} — {to}</Typography>
      <View className="flex-row flex-wrap gap-2">{(["6", "12", "custom"] as const).map(mode => <Button key={mode} size="sm" variant={range.mode === mode ? "primary" : "secondary"} accessibilityState={{ selected: range.mode === mode }} onPress={() => { setRange(current => ({ ...current, mode })); setError(null); }}>{mode === "custom" ? "自訂" : `近 ${mode} 月`}</Button>)}</View>
      {range.mode === "custom" ? <View className="gap-3">
        <Typography className="text-sm text-white/75">開始月份（YYYY-MM）</Typography>
        <TextInput ref={startInput} accessibilityLabel="統計開始月份，YYYY-MM" className="min-h-12 rounded-xl border border-white/30 bg-white/10 px-4 text-base text-white" value={start} autoCorrect={false} maxLength={7} placeholder="2026-01" placeholderTextColor="#c6bfd6" onChangeText={value => { setStart(value); setError(null); }} />
        <Typography className="text-sm text-white/75">結束月份（YYYY-MM）</Typography>
        <TextInput accessibilityLabel="統計結束月份，YYYY-MM" className="min-h-12 rounded-xl border border-white/30 bg-white/10 px-4 text-base text-white" value={end} autoCorrect={false} maxLength={7} placeholder="2026-09" placeholderTextColor="#c6bfd6" onChangeText={value => { setEnd(value); setError(null); }} />
        <Button variant="secondary" onPress={() => { const invalid = spendingRangeError(start, end); setError(invalid); if (invalid) startInput.current?.focus(); else { setRange({ mode: "custom", start, end }); startInput.current?.blur(); } }}>套用期間</Button>
        {error ? <Typography accessibilityRole="alert" className="text-sm text-[#ffc2cb]">{error}</Typography> : null}
      </View> : null}
      {saveError ? <Typography accessibilityRole="alert" className="text-sm text-[#ffc2cb]">{saveError}</Typography> : null}
      <View className="gap-2 rounded-xl bg-white/10 p-3">{[["期間總花費", data.total], ["每月平均", data.average], [data.total ? `最高 · ${data.highest.month}` : "最高月份", data.highest.amount]].map(([label, value]) => <View key={label} className="flex-row flex-wrap justify-between gap-2"><Typography className="text-white/65">{label}</Typography><Typography className="font-semibold text-white">{formatCurrency(Number(value))}</Typography></View>)}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerClassName="gap-2 pb-3">{data.months.map(item => <Pressable key={item.month} accessibilityRole="button" accessibilityLabel={`${monthLabel(item.month)}花費 ${formatCurrency(item.amount)}，查看明細`} accessibilityState={{ selected: item.month === month }} onPress={() => onSelectMonth(item.month)} className="w-14 items-center gap-2">
        <Typography className="text-xs text-white/70">{new Intl.NumberFormat("zh-TW", { notation: "compact", maximumFractionDigits: 1 }).format(item.amount)}</Typography>
        <View className="h-28 w-full justify-end rounded-lg bg-black/15"><View className={`w-full rounded-lg ${item.month === month ? "bg-[#cdbdff]" : "bg-[#65d6c4]"}`} style={{ height: `${Math.max(item.amount ? 2 : 0, item.amount / maximum * 100)}%` }} /></View>
        <Typography className="text-xs text-white/75">{item.month.slice(2).replace("-", "/")}</Typography>
      </Pressable>)}</ScrollView>
      <Typography className="text-xs leading-5 text-white/65">{data.total ? "點月份可查看明細，左右滑動可比較更多月份。金額單位為新臺幣。" : "這段期間還沒有花費紀錄，可在上方新增第一筆花費。"}</Typography>
    </View> : <Typography className="text-sm text-white/60">比較近 6、12 個月或自訂期間</Typography>}
  </Card>;
}
