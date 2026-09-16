import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Input } from "@heroui/react/input";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { isValidDateKey, todayKey } from "@/domain/format";
import {
  FIVE_STAR_OUTCOMES,
  WISH_TRACKS,
  type FiveStarOutcome,
  type FiveStarRecord,
  type WishTrack,
} from "@/domain/types";
import { wishRecordsToCsv } from "@/domain/wishTracker";
import { DeviceDataLoading } from "@/ui/DeviceDataLoading.web";
import { RetryableError } from "@/ui/RetryableError.web";
import { WebPage } from "@/ui/WebPage.web";
import { useWishTrackerModel } from "./useWishTrackerModel";

type RecordForm = {
  track: WishTrack;
  pity: string;
  date: string;
  memory: string;
  outcome: FiveStarOutcome;
};

const EMPTY_FORM: RecordForm = { track: "限定新池", pity: "", date: todayKey(), memory: "", outcome: "未標記" };

function guaranteeChoice(value: true | false | null): "auto" | "guaranteed" | "not-guaranteed" {
  return value === null ? "auto" : value ? "guaranteed" : "not-guaranteed";
}

function guaranteeOverride(value: string): true | false | null {
  return value === "guaranteed" ? true : value === "not-guaranteed" ? false : null;
}

function focusControl(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}

export function WishTrackerScreenWeb() {
  const model = useWishTrackerModel();
  const router = useRouter();
  const [pityDraft, setPityDraft] = useState<Record<WishTrack, string>>({ 限定新池: "0", 復刻池: "0", 常駐池: "0" });
  const [form, setForm] = useState<RecordForm>(EMPTY_FORM);
  const [resetCounter, setResetCounter] = useState(true);
  const [editing, setEditing] = useState<FiveStarRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pityError, setPityError] = useState<string | null>(null);
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

  async function savePity() {
    const values = Object.fromEntries(WISH_TRACKS.map((track) => [track, Number(pityDraft[track])])) as Record<WishTrack, number>;
    if (Object.values(values).some((value) => !Number.isSafeInteger(value) || value < 0 || value > 999)) {
      setPityError("目前累計請輸入 0 到 999 的整數。");
      focusControl("tracker-pity-0");
      return;
    }
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

  async function updateGuaranteeOverride(track: WishTrack, value: string) {
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

  function validateRecord(value: RecordForm | FiveStarRecord): string | null {
    const pity = Number(value.pity);
    if (!Number.isSafeInteger(pity) || pity < 1 || pity > 999) return "請輸入這張五星出現於第幾抽（1 到 999）。";
    if (!isValidDateKey(value.date)) return "請選擇有效日期。";
    if (value.memory.trim().length > 120) return "思念名稱不可超過 120 字。";
    return null;
  }

  async function addRecord() {
    const error = validateRecord(form);
    if (error) {
      setFormError(error);
      focusControl(error.includes("第幾抽") ? "tracker-record-pity" : error.includes("日期") ? "tracker-record-date" : "tracker-record-memory");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    const saved = await model.addRecord({ ...form, pity: Number(form.pity), memory: form.memory.trim() }, resetCounter);
    setSubmitting(false);
    if (saved) setForm({ ...EMPTY_FORM, track: form.track, date: form.date });
  }

  async function saveEdit() {
    if (!editing) return;
    const error = validateRecord(editing);
    if (error) {
      setEditError(error);
      focusControl(error.includes("第幾抽") ? "tracker-edit-pity" : error.includes("日期") ? "tracker-edit-date" : "tracker-edit-memory");
      return;
    }
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

  function downloadCsv() {
    const url = URL.createObjectURL(new Blob([`\uFEFF${wishRecordsToCsv(records)}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `deep-space-ledger-five-stars-${todayKey()}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  if (!model.ready) {
    return (
      <WebPage
        eyebrow="Wish Tracker"
        title="追蹤"
        description="手動保存各計數線目前累計與五星紀錄，不需要遊戲帳號或授權 Token。"
      >
        <DeviceDataLoading label="正在讀取抽卡計數與紀錄…" />
      </WebPage>
    );
  }

  return (
    <WebPage
      eyebrow="Wish Tracker"
      title="追蹤"
      description="手動保存各計數線目前累計與五星紀錄，不需要遊戲帳號或授權 Token。"
    >
      {model.storageError ? <RetryableError>{model.storageError}</RetryableError> : null}
      {deletedRecord ? (
        <div className="status-note undo-note" role="status">
          <span>已移除 {deletedRecord.date} 的五星紀錄。</span>
          <button type="button" onClick={() => void undoDelete()}>復原</button>
        </div>
      ) : null}

      <div className="page-grid wish-tracker-page">
        <div className="stack">
          <Card className="product-card pity-card">
            <div className="section-heading">
              <div><p className="card-kicker">Pity Counter</p><h2 className="section-title">目前累計</h2></div>
              <span className="section-meta">手動更新</span>
            </div>
            <p className="page-description">請照遊戲內顯示的計數線填寫；不同類型不會在本工具中互相合併。</p>
            <div className="pity-counter-grid">
              {WISH_TRACKS.map((track, index) => (
                <div className="pity-counter" key={track}>
                  <span>{track}</span>
                  <Input
                    id={`tracker-pity-${index}`}
                    aria-label={`${track}目前累計`}
                    aria-invalid={Boolean(pityError)}
                    aria-describedby={pityError ? "tracker-pity-error" : undefined}
                    type="number"
                    min="0"
                    max="999"
                    disabled={model.writeProtected}
                    value={pityDraft[track]}
                    onChange={(event) => { setPityError(null); setPityDraft({ ...pityDraft, [track]: event.target.value }); }}
                  />
                  <small>抽未出五星</small>
                  <div className="pity-step-actions" role="group" aria-label={`${track}快速調整`}>
                    <button type="button" disabled={submitting || model.writeProtected || model.tracker.currentPity[track] === 0} onClick={() => void stepPity(track, -1)}>−1</button>
                    <button type="button" disabled={submitting || model.writeProtected} onClick={() => void stepPity(track, 1)}>＋1</button>
                    <button type="button" disabled={submitting || model.writeProtected} onClick={() => void stepPity(track, 10)}>＋10</button>
                  </div>
                  <small className="pity-guarantee">{track === "常駐池" ? "依遊戲常駐規則" : model.guarantees[track] === true ? "下張活動五星保證" : model.guarantees[track] === false ? "目前非保證" : "保證狀態未標記"}</small>
                  {track !== "常駐池" ? (
                    <>
                      <label className="guarantee-control">
                        <span>保證狀態校正</span>
                        <select
                          className="native-select"
                          aria-label={`${track}保證狀態校正`}
                          disabled={submitting || model.writeProtected}
                          value={guaranteeChoice(model.tracker.guaranteeOverrides[track])}
                          onChange={(event) => void updateGuaranteeOverride(track, event.target.value)}
                        >
                          <option value="auto">依最新紀錄自動</option>
                          <option value="guaranteed">下張活動五星保證</option>
                          <option value="not-guaranteed">目前非保證</option>
                        </select>
                      </label>
                      <div className="pity-target-summary">
                        <span>下一張五星最晚 {model.targets[track].nextFiveStarPulls} 抽</span>
                        <strong>{model.targets[track].conservative ? "活動五星保守目標" : "已保證活動五星目標"} {model.targets[track].featuredPulls} 抽</strong>
                      </div>
                      <button
                        className="pity-calc-action"
                        type="button"
                        disabled={submitting || model.writeProtected || !model.targets[track].featuredPulls}
                        onClick={() => void openCalculatorTarget(track)}
                      >
                        用 {model.targets[track].featuredPulls} 抽帶入換算
                      </button>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="planner-method">保底目標以目前常見的 70 抽五星上限估算；未確認保證時採最壞兩輪。特殊池、精準許願與當期規則仍以遊戲公告為準。</p>
            {pityError ? <p className="field-error" id="tracker-pity-error" role="alert">{pityError}</p> : null}
            <div className="form-actions"><Button fullWidth isDisabled={submitting || model.writeProtected} onPress={() => void savePity()}>儲存目前計數</Button></div>
          </Card>

          <Card className="product-card">
            <div className="section-heading">
              <div><p className="card-kicker">Manual Log</p><h2 className="section-title">新增五星紀錄</h2></div>
            </div>
            <div className="form-grid" role="group" aria-label="新增五星紀錄">
              <label className="field-wrap">
                <span className="field-label">計數線</span>
                <select className="native-select" value={form.track} onChange={(event) => { setFormError(null); setForm({ ...form, track: event.target.value as WishTrack }); }}>
                  {WISH_TRACKS.map((track) => <option key={track}>{track}</option>)}
                </select>
              </label>
              <label className="field-wrap">
                <span className="field-label">五星出現抽數</span>
                <Input id="tracker-record-pity" aria-label="五星出現抽數" aria-invalid={Boolean(formError)} aria-describedby={formError ? "tracker-record-error" : undefined} type="number" min="1" max="999" placeholder="例如 63" value={form.pity} onChange={(event) => { setFormError(null); setForm({ ...form, pity: event.target.value }); }} />
              </label>
              <label className="field-wrap">
                <span className="field-label">日期</span>
                <span className="date-control"><Input id="tracker-record-date" aria-label="五星紀錄日期" aria-invalid={Boolean(formError)} aria-describedby={formError ? "tracker-record-error" : undefined} type="date" value={form.date} onChange={(event) => { setFormError(null); setForm({ ...form, date: event.target.value }); }} /></span>
              </label>
              <label className="field-wrap">
                <span className="field-label">結果</span>
                <select className="native-select" value={form.outcome} onChange={(event) => { setFormError(null); setForm({ ...form, outcome: event.target.value as FiveStarOutcome }); }}>
                  {FIVE_STAR_OUTCOMES.map((outcome) => <option key={outcome}>{outcome}</option>)}
                </select>
              </label>
              <label className="field-wrap full">
                <span className="field-label">思念名稱（選填）</span>
                <Input id="tracker-record-memory" aria-label="五星思念名稱" aria-invalid={Boolean(formError)} aria-describedby={formError ? "tracker-record-error" : undefined} maxLength={120} placeholder="例如：限定思念名稱" value={form.memory} onChange={(event) => { setFormError(null); setForm({ ...form, memory: event.target.value }); }} />
              </label>
              <label className="planner-check field-wrap full">
                <span className="planner-check-control"><input type="checkbox" checked={resetCounter} onChange={(event) => setResetCounter(event.target.checked)} />新增後把這條目前累計重設為 0</span>
              </label>
            </div>
            {formError ? <p className="field-error" id="tracker-record-error" role="alert">{formError}</p> : null}
            <div className="form-actions"><Button fullWidth isDisabled={submitting || model.writeProtected} onPress={() => void addRecord()}>儲存五星紀錄</Button></div>
          </Card>
        </div>

        <div className="stack">
          <Card className="product-card wish-stat-card">
            <div className="section-heading">
              <h2 className="section-title">五星統計</h2>
              <Button size="sm" variant="ghost" isDisabled={!records.length} onPress={downloadCsv}>匯出 CSV</Button>
            </div>
            <label className="field-wrap">
              <span className="field-label">統計與歷史範圍</span>
              <select
                className="native-select"
                value={model.recordFilter}
                onChange={(event) => model.setRecordFilter(event.target.value as WishTrack | "全部")}
              >
                <option>全部</option>
                {WISH_TRACKS.map((track) => <option key={track}>{track}</option>)}
              </select>
            </label>
            <div className="metric-grid">
              <div className="metric"><div className="metric-value">{model.statistics.count}</div><div className="metric-label">五星紀錄</div></div>
              <div className="metric"><div className="metric-value">{model.statistics.averagePity ?? "—"}</div><div className="metric-label">平均出金抽數</div></div>
              <div className="metric"><div className="metric-value">{model.statistics.featuredRate === null ? "—" : `${model.statistics.featuredRate}%`}</div><div className="metric-label">當期 UP 率</div></div>
            </div>
            <p className="planner-method">
              {model.statistics.count
                ? `出金區間：${model.statistics.earliestPity}–${model.statistics.latestPity} 抽 · 已標記結果 ${model.statistics.knownOutcomes}/${model.statistics.count} 筆。`
                : "目前範圍尚無可統計紀錄。"} UP 率只計算已標記「當期UP」或「非當期」的紀錄；所有統計都來自你手動輸入的資料。
            </p>
          </Card>

          <Card className="product-card">
            <div className="section-heading"><h2 className="section-title">五星歷史</h2><span className="section-meta">{records.length} 筆</span></div>
            <div className="wish-record-list" role={records.length ? "list" : undefined}>
              {records.length === 0 ? <div className="empty-state">{model.recordFilter === "全部" ? "尚無五星紀錄" : "此計數線尚無五星紀錄"}</div> : records.map((record) => (
                <div className="wish-record" role="listitem" key={record.id}>
                  <div className="wish-record-pity"><strong>{record.pity}</strong><span>抽</span></div>
                  <div className="row-main"><div className="row-title">{record.memory || "未填思念名稱"}</div><div className="row-subtitle">{record.track} · {record.outcome} · {record.date}</div></div>
                  <div className="row-actions">
                    <Button size="sm" variant="ghost" onPress={() => setEditing({ ...record })}>編輯</Button>
                    <Button size="sm" variant="danger-soft" isDisabled={submitting || model.writeProtected} onPress={() => void removeRecord(record)}>刪除</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {editing ? (
            <Card className="product-card">
              <div className="section-heading"><h2 className="section-title">編輯五星紀錄</h2><Button size="sm" variant="ghost" onPress={() => setEditing(null)}>取消</Button></div>
              <div className="form-grid">
                <label className="field-wrap"><span className="field-label">計數線</span><select className="native-select" value={editing.track} onChange={(event) => { setEditError(null); setEditing({ ...editing, track: event.target.value as WishTrack }); }}>{WISH_TRACKS.map((track) => <option key={track}>{track}</option>)}</select></label>
                <label className="field-wrap"><span className="field-label">五星出現抽數</span><Input id="tracker-edit-pity" aria-label="編輯五星出現抽數" aria-invalid={Boolean(editError)} aria-describedby={editError ? "tracker-edit-error" : undefined} type="number" value={String(editing.pity)} onChange={(event) => { setEditError(null); setEditing({ ...editing, pity: Number(event.target.value) }); }} /></label>
                <label className="field-wrap"><span className="field-label">日期</span><span className="date-control"><Input id="tracker-edit-date" aria-label="編輯五星日期" aria-invalid={Boolean(editError)} aria-describedby={editError ? "tracker-edit-error" : undefined} type="date" value={editing.date} onChange={(event) => { setEditError(null); setEditing({ ...editing, date: event.target.value }); }} /></span></label>
                <label className="field-wrap"><span className="field-label">結果</span><select className="native-select" value={editing.outcome} onChange={(event) => { setEditError(null); setEditing({ ...editing, outcome: event.target.value as FiveStarOutcome }); }}>{FIVE_STAR_OUTCOMES.map((outcome) => <option key={outcome}>{outcome}</option>)}</select></label>
                <label className="field-wrap full"><span className="field-label">思念名稱</span><Input id="tracker-edit-memory" aria-label="編輯思念名稱" aria-invalid={Boolean(editError)} aria-describedby={editError ? "tracker-edit-error" : undefined} maxLength={120} value={editing.memory} onChange={(event) => { setEditError(null); setEditing({ ...editing, memory: event.target.value }); }} /></label>
              </div>
              {editError ? <p className="field-error" id="tracker-edit-error" role="alert">{editError}</p> : null}
              <div className="form-actions"><Button fullWidth isDisabled={submitting || model.writeProtected} onPress={() => void saveEdit()}>儲存修改</Button></div>
            </Card>
          ) : null}
        </div>
      </div>
    </WebPage>
  );
}
