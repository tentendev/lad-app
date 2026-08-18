import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Share, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Typography } from "heroui-native";

import { isValidDateKey, todayKey } from "@/domain/format";
import {
  FIVE_STAR_OUTCOMES,
  WISH_TRACKS,
  type FiveStarOutcome,
  type FiveStarRecord,
  type WishTrack,
} from "@/domain/types";
import { wishRecordsToCsv } from "@/domain/wishTracker";
import { NativePage } from "@/ui/NativePage";
import { useWishTrackerModel } from "./useWishTrackerModel";

type RecordForm = { track: WishTrack; pity: string; date: string; memory: string; outcome: FiveStarOutcome };
const EMPTY_FORM: RecordForm = { track: "限定新池", pity: "", date: todayKey(), memory: "", outcome: "未標記" };
const INPUT_CLASS = "rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white";
const GUARANTEE_CHOICES = ["依最新紀錄自動", "下張活動五星保證", "目前非保證"] as const;
const RECORD_FILTERS = ["全部", ...WISH_TRACKS] as const;
type GuaranteeChoice = (typeof GUARANTEE_CHOICES)[number];

function ChoiceRow<T extends string>({ options, value, onChange, disabled = false }: { options: readonly T[]; value: T; onChange: (value: T) => void; disabled?: boolean }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
      {options.map((item) => (
        <Pressable key={item} accessibilityRole="button" accessibilityState={{ disabled, selected: item === value }} className={`min-h-11 justify-center rounded-full border px-3 py-2 ${item === value ? "border-[#a78bfa] bg-[#a78bfa]/25" : "border-white/30 bg-white/5"} ${disabled ? "opacity-45" : ""}`} disabled={disabled} onPress={() => onChange(item)}>
          <Typography className="text-xs font-semibold text-white">{item}</Typography>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function guaranteeChoice(value: true | false | null): GuaranteeChoice {
  return value === null ? "依最新紀錄自動" : value ? "下張活動五星保證" : "目前非保證";
}

function guaranteeOverride(value: GuaranteeChoice): true | false | null {
  return value === "下張活動五星保證" ? true : value === "目前非保證" ? false : null;
}

export function WishTrackerScreenNative() {
  const model = useWishTrackerModel();
  const router = useRouter();
  const [pityDraft, setPityDraft] = useState<Record<WishTrack, string>>({ 限定新池: "0", 復刻池: "0", 常駐池: "0" });
  const [form, setForm] = useState<RecordForm>(EMPTY_FORM);
  const [resetCounter, setResetCounter] = useState(true);
  const [editing, setEditing] = useState<FiveStarRecord | null>(null);
  const [pityError, setPityError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletedRecord, setDeletedRecord] = useState<FiveStarRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!model.ready) return;
    const frame = requestAnimationFrame(() => {
      setPityDraft(Object.fromEntries(WISH_TRACKS.map((track) => [track, String(model.tracker.currentPity[track])])) as Record<WishTrack, string>);
    });
    return () => cancelAnimationFrame(frame);
  }, [model.ready, model.tracker.currentPity]);

  const records = useMemo(
    () => model.tracker.records
      .filter((record) => model.recordFilter === "全部" || record.track === model.recordFilter)
      .sort((left, right) => right.date.localeCompare(left.date) || right.id - left.id),
    [model.recordFilter, model.tracker.records],
  );

  function validateRecord(value: RecordForm | FiveStarRecord): string | null {
    const pity = Number(value.pity);
    if (!Number.isSafeInteger(pity) || pity < 1 || pity > 999) return "請輸入這張五星出現於第幾抽（1 到 999）。";
    if (!isValidDateKey(value.date)) return "請輸入有效日期，格式為 YYYY-MM-DD。";
    if (value.memory.trim().length > 120) return "思念名稱不可超過 120 字。";
    return null;
  }

  async function savePity() {
    const values = Object.fromEntries(WISH_TRACKS.map((track) => [track, Number(pityDraft[track])])) as Record<WishTrack, number>;
    if (Object.values(values).some((value) => !Number.isSafeInteger(value) || value < 0 || value > 999)) return setPityError("目前累計請輸入 0 到 999 的整數。");
    setPityError(null);
    setSubmitting(true);
    await model.saveCurrentPity(values);
    setSubmitting(false);
  }

  async function stepPity(track: WishTrack, delta: number) {
    setPityError(null);
    setSubmitting(true);
    await model.adjustCurrentPity(track, delta);
    setSubmitting(false);
  }

  async function updateGuaranteeOverride(track: WishTrack, value: GuaranteeChoice) {
    setSubmitting(true);
    await model.setGuaranteeOverride(track, guaranteeOverride(value));
    setSubmitting(false);
  }

  async function openCalculatorTarget(track: WishTrack) {
    setSubmitting(true);
    const prepared = await model.prepareCalculatorTarget(track);
    setSubmitting(false);
    if (prepared) router.push("/calculator");
  }

  async function addRecord() {
    const validation = validateRecord(form);
    if (validation) return setFormError(validation);
    setFormError(null);
    setSubmitting(true);
    const saved = await model.addRecord({ ...form, pity: Number(form.pity), memory: form.memory.trim() }, resetCounter);
    setSubmitting(false);
    if (saved) setForm({ ...EMPTY_FORM, track: form.track, date: form.date });
  }

  async function saveEdit() {
    if (!editing) return;
    const validation = validateRecord(editing);
    if (validation) return setEditError(validation);
    setEditError(null);
    setSubmitting(true);
    const saved = await model.updateRecord({ ...editing, memory: editing.memory.trim() });
    setSubmitting(false);
    if (saved) setEditing(null);
  }

  async function removeRecord(record: FiveStarRecord) {
    setSubmitting(true);
    const removed = await model.deleteRecord(record.id);
    setSubmitting(false);
    if (removed) setDeletedRecord(record);
  }

  async function undoDelete() {
    if (!deletedRecord) return;
    setSubmitting(true);
    const restored = await model.restoreRecord(deletedRecord);
    setSubmitting(false);
    if (restored) setDeletedRecord(null);
  }

  if (!model.ready) {
    return (
      <NativePage eyebrow="Wish Tracker" title="追蹤" description="手動保存各計數線目前累計與五星紀錄，不需要遊戲帳號或授權 Token。">
        <Card className="gap-4 border border-white/40 bg-[#493b70]/70 p-4" accessibilityRole="progressbar">
          <Typography className="text-sm text-white/70">正在讀取抽卡計數與紀錄…</Typography>
          <View className="h-12 rounded-xl bg-white/10" />
          <View className="h-40 rounded-2xl bg-white/10" />
        </Card>
      </NativePage>
    );
  }

  return (
    <NativePage eyebrow="Wish Tracker" title="追蹤" description="手動保存各計數線目前累計與五星紀錄，不需要遊戲帳號或授權 Token。">
      {model.storageError ? <View accessibilityRole="alert" className="rounded-xl border border-[#ffafbd] bg-[#ff6675]/20 p-3"><Typography className="text-sm text-white">{model.storageError}</Typography></View> : null}
      {deletedRecord ? <View accessibilityRole="alert" className="flex-row items-center justify-between rounded-xl border border-[#9cf0dc] bg-[#65d6c4]/20 p-3"><Typography className="flex-1 text-sm text-white">已移除 {deletedRecord.date} 的五星紀錄。</Typography><Button size="sm" variant="ghost" onPress={() => void undoDelete()}>復原</Button></View> : null}

      <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
        <View><Typography className="text-xs uppercase tracking-[2px] text-white/55">Pity Counter</Typography><Typography.Heading className="mt-1 text-xl text-white">目前累計</Typography.Heading></View>
        <Typography.Paragraph className="text-sm leading-5 text-white/65">請照遊戲內顯示的計數線填寫；不同類型不會在本工具中互相合併。</Typography.Paragraph>
        {WISH_TRACKS.map((track) => (
          <View className="gap-2" key={track}>
            <Typography className="text-sm text-white/75">{track} · 抽未出五星</Typography>
            <TextInput accessibilityLabel={`${track}目前累計`} className={INPUT_CLASS} keyboardType="number-pad" value={pityDraft[track]} onChangeText={(value) => { setPityError(null); setPityDraft({ ...pityDraft, [track]: value }); }} />
            <View className="flex-row gap-2">
              <Button size="sm" variant="secondary" isDisabled={submitting || model.writeProtected || model.tracker.currentPity[track] === 0} onPress={() => void stepPity(track, -1)}>−1 抽</Button>
              <Button size="sm" variant="secondary" isDisabled={submitting || model.writeProtected} onPress={() => void stepPity(track, 1)}>＋1 抽</Button>
              <Button size="sm" variant="secondary" isDisabled={submitting || model.writeProtected} onPress={() => void stepPity(track, 10)}>＋10 抽</Button>
            </View>
            <Typography className="text-xs text-white/50">{track === "常駐池" ? "依遊戲常駐規則" : model.guarantees[track] === true ? "下張活動五星保證" : model.guarantees[track] === false ? "目前非保證" : "保證狀態未標記"}</Typography>
            {track !== "常駐池" ? (
              <View className="gap-1.5">
                <Typography className="text-[10px] text-white/50">保證狀態校正</Typography>
                <ChoiceRow
                  options={GUARANTEE_CHOICES}
                  value={guaranteeChoice(model.tracker.guaranteeOverrides[track])}
                  disabled={submitting || model.writeProtected}
                  onChange={(value) => void updateGuaranteeOverride(track, value)}
                />
                <View className="gap-1 rounded-xl border border-white/20 bg-white/5 p-3">
                  <Typography className="text-[10px] text-white/50">下一張五星最晚 {model.targets[track].nextFiveStarPulls} 抽</Typography>
                  <Typography className="text-xs font-semibold text-white">{model.targets[track].conservative ? "活動五星保守目標" : "已保證活動五星目標"} {model.targets[track].featuredPulls} 抽</Typography>
                </View>
                <Button size="sm" variant="secondary" isDisabled={submitting || model.writeProtected || !model.targets[track].featuredPulls} onPress={() => void openCalculatorTarget(track)}>
                  用 {model.targets[track].featuredPulls} 抽帶入換算
                </Button>
              </View>
            ) : null}
          </View>
        ))}
        <Typography className="text-xs leading-5 text-white/55">保底目標以目前常見的 70 抽五星上限估算；未確認保證時採最壞兩輪。特殊池、精準許願與當期規則仍以遊戲公告為準。</Typography>
        {pityError ? <Typography accessibilityRole="alert" className="text-sm text-[#ffc2cb]">{pityError}</Typography> : null}
        <Button isDisabled={submitting || model.writeProtected} onPress={() => void savePity()}>儲存目前計數</Button>
      </Card>

      <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
        <Typography.Heading className="text-xl text-white">新增五星紀錄</Typography.Heading>
        <ChoiceRow options={WISH_TRACKS} value={form.track} onChange={(track) => { setFormError(null); setForm({ ...form, track }); }} />
        <TextInput accessibilityLabel="五星出現抽數" className={INPUT_CLASS} keyboardType="number-pad" placeholder="五星出現抽數，例如 63" placeholderTextColor="rgba(255,255,255,.5)" value={form.pity} onChangeText={(pity) => { setFormError(null); setForm({ ...form, pity }); }} />
        <TextInput accessibilityLabel="五星紀錄日期" className={INPUT_CLASS} placeholder="日期 YYYY-MM-DD" placeholderTextColor="rgba(255,255,255,.5)" value={form.date} onChangeText={(date) => { setFormError(null); setForm({ ...form, date }); }} />
        <ChoiceRow options={FIVE_STAR_OUTCOMES} value={form.outcome} onChange={(outcome) => { setFormError(null); setForm({ ...form, outcome }); }} />
        <TextInput accessibilityLabel="五星思念名稱" className={INPUT_CLASS} maxLength={120} placeholder="思念名稱（選填）" placeholderTextColor="rgba(255,255,255,.5)" value={form.memory} onChangeText={(memory) => { setFormError(null); setForm({ ...form, memory }); }} />
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: resetCounter }} className="flex-row items-center gap-3 rounded-xl border border-white/20 bg-white/5 p-3" onPress={() => setResetCounter((value) => !value)}><View className={`h-5 w-5 rounded border ${resetCounter ? "border-[#a78bfa] bg-[#a78bfa]" : "border-white/40"}`} /><Typography className="flex-1 text-sm text-white">新增後把這條目前累計重設為 0</Typography></Pressable>
        {formError ? <Typography accessibilityRole="alert" className="text-sm text-[#ffc2cb]">{formError}</Typography> : null}
        <Button isDisabled={submitting || model.writeProtected} onPress={() => void addRecord()}>儲存五星紀錄</Button>
      </Card>

      <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="flex-row items-center justify-between"><Typography.Heading className="text-xl text-white">五星統計</Typography.Heading><Button size="sm" variant="ghost" isDisabled={!records.length} onPress={() => void Share.share({ message: wishRecordsToCsv(records), title: "深空省省五星紀錄" })}>分享 CSV</Button></View>
        <View className="gap-2">
          <Typography className="text-xs text-white/55">統計與歷史範圍</Typography>
          <ChoiceRow options={RECORD_FILTERS} value={model.recordFilter} onChange={model.setRecordFilter} />
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1 items-center rounded-xl border border-white/20 bg-white/10 p-3"><Typography.Heading className="text-2xl text-white">{model.statistics.count}</Typography.Heading><Typography className="text-xs text-white/55">五星紀錄</Typography></View>
          <View className="flex-1 items-center rounded-xl border border-white/20 bg-white/10 p-3"><Typography.Heading className="text-2xl text-white">{model.statistics.averagePity ?? "—"}</Typography.Heading><Typography className="text-xs text-white/55">平均抽數</Typography></View>
          <View className="flex-1 items-center rounded-xl border border-white/20 bg-white/10 p-3"><Typography.Heading className="text-2xl text-white">{model.statistics.featuredRate === null ? "—" : `${model.statistics.featuredRate}%`}</Typography.Heading><Typography className="text-xs text-white/55">當期 UP 率</Typography></View>
        </View>
        <Typography className="text-xs leading-5 text-white/55">{model.statistics.count ? `出金區間：${model.statistics.earliestPity}–${model.statistics.latestPity} 抽 · 已標記結果 ${model.statistics.knownOutcomes}/${model.statistics.count} 筆。` : "目前範圍尚無可統計紀錄。"} UP 率只計算已標記結果的紀錄；所有統計都來自你手動輸入的資料。</Typography>
      </Card>

      <Card className="gap-3 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="flex-row justify-between"><Typography.Heading className="text-xl text-white">五星歷史</Typography.Heading><Typography className="text-white/55">{records.length} 筆</Typography></View>
        {records.length === 0 ? <Typography.Paragraph className="py-8 text-center text-white/60">{model.recordFilter === "全部" ? "尚無五星紀錄" : "此計數線尚無五星紀錄"}</Typography.Paragraph> : records.map((record) => (
          <View className="gap-3 rounded-xl border border-white/20 bg-white/10 p-3" key={record.id}>
            <View className="flex-row items-center gap-3"><View className="h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/10"><Typography.Heading className="text-xl text-white">{record.pity}</Typography.Heading><Typography className="text-[10px] text-white/55">抽</Typography></View><View className="flex-1"><Typography className="font-semibold text-white">{record.memory || "未填思念名稱"}</Typography><Typography className="text-xs text-white/55">{record.track} · {record.outcome} · {record.date}</Typography></View></View>
            <View className="flex-row gap-2"><Button size="sm" variant="secondary" onPress={() => setEditing({ ...record })}>編輯</Button><Button size="sm" variant="danger-soft" isDisabled={submitting || model.writeProtected} onPress={() => void removeRecord(record)}>刪除</Button></View>
          </View>
        ))}
      </Card>

      {editing ? (
        <Card className="gap-4 border border-white/50 bg-[#493b70]/85 p-4">
          <View className="flex-row items-center justify-between"><Typography.Heading className="text-xl text-white">編輯五星紀錄</Typography.Heading><Button size="sm" variant="ghost" onPress={() => setEditing(null)}>取消</Button></View>
          <ChoiceRow options={WISH_TRACKS} value={editing.track} onChange={(track) => { setEditError(null); setEditing({ ...editing, track }); }} />
          <TextInput accessibilityLabel="編輯五星出現抽數" className={INPUT_CLASS} keyboardType="number-pad" value={String(editing.pity)} onChangeText={(value) => { setEditError(null); setEditing({ ...editing, pity: Number(value) }); }} />
          <TextInput accessibilityLabel="編輯五星日期" className={INPUT_CLASS} value={editing.date} onChangeText={(date) => { setEditError(null); setEditing({ ...editing, date }); }} />
          <ChoiceRow options={FIVE_STAR_OUTCOMES} value={editing.outcome} onChange={(outcome) => { setEditError(null); setEditing({ ...editing, outcome }); }} />
          <TextInput accessibilityLabel="編輯思念名稱" className={INPUT_CLASS} maxLength={120} value={editing.memory} onChangeText={(memory) => { setEditError(null); setEditing({ ...editing, memory }); }} />
          {editError ? <Typography accessibilityRole="alert" className="text-sm text-[#ffc2cb]">{editError}</Typography> : null}
          <Button isDisabled={submitting || model.writeProtected} onPress={() => void saveEdit()}>儲存修改</Button>
        </Card>
      ) : null}
    </NativePage>
  );
}
