import { useState } from "react";
import { Link } from "expo-router";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { isLocalPreview } from "@/auth/localPreview";
import type { ManagedMember } from "@/data/membershipApi";
import { useMembersModel } from "@/features/admin/useMembersModel";
import { Button, Card, Typography } from "@/ui/NativeComponents";
import { NativeInput } from "@/ui/NativeInput";
import { NativePage } from "@/ui/NativePage";

function date(value: string | number | null) { return value === null ? "尚無紀錄" : new Date(value).toLocaleString("zh-TW"); }

function ConnectedAdmin() {
  const model = useMembersModel();
  const [selection, setSelection] = useState<{ viewerId: string; member: ManagedMember } | null>(null);
  const selected = model.page && selection?.viewerId === model.page.viewerId ? selection.member : null;
  function setSelected(member: ManagedMember | null) {
    setSelection(member && model.page ? { viewerId: model.page.viewerId, member } : null);
  }
  const [reason, setReason] = useState("");
  const [invalid, setInvalid] = useState(false);
  return <NativePage title="會員管理" eyebrow="Member Administration" description="管理會員帳號與備份狀態。">
    <Typography.Heading className="type-headline text-ink">會員管理</Typography.Heading>
    <Link href="/account"><Typography className="type-body text-orbit">返回會員中心</Typography></Link>
    {!model.isLoaded ? <Typography className="type-body text-muted">正在確認登入狀態…</Typography>
      : !model.isSignedIn ? <Card className="gap-3 p-5"><Typography className="type-body text-ink">請先登入管理者帳號。</Typography><Link href="/account"><Typography className="type-body text-orbit">前往登入</Typography></Link></Card>
        : model.forbidden ? <Typography accessibilityRole="alert" className="type-body text-danger">{model.error}</Typography>
          : <>
            <Card className="gap-3 p-5"><Typography className="type-body text-muted">搜尋會員</Typography><NativeInput accessibilityLabel="搜尋會員" placeholder="Email、名稱或會員 ID" maxLength={120} autoCapitalize="none" value={model.query} onChangeText={model.setQuery} returnKeyType="search" onSubmitEditing={() => void model.submitSearch()} /><View className="flex-row flex-wrap gap-2"><Button isDisabled={model.busy} onPress={() => void model.submitSearch()}>搜尋</Button><Button variant="secondary" isDisabled={model.busy} onPress={() => void model.refresh()}>重新整理</Button></View>
              <Typography className="type-label text-muted">{model.busy ? "正在載入…" : model.page ? `符合條件 ${model.page.totalCount} 位 · 第 ${Math.floor(model.page.offset / model.page.limit) + 1} 頁` : "準備載入會員清單"}</Typography>
              {model.notice ? <Typography accessibilityRole="alert" className="type-body text-success">{model.notice}</Typography> : null}{model.error ? <Typography accessibilityRole="alert" className="type-body text-danger">{model.error}</Typography> : null}
            </Card>
            {model.page?.members.map(member => <Card key={member.id} className="gap-3 p-5"><Typography.Heading className="type-title text-ink">{member.name} · {member.isAdmin ? "管理者" : member.banned ? "已停權" : "正常"}</Typography.Heading><Typography className="type-body text-ink">{member.email ?? "未設定 Email"}</Typography><Typography className="type-label text-muted">{member.emailVerified ? "Email 已驗證" : "Email 未驗證"}</Typography><Typography className="type-label text-muted">加入時間：{date(member.createdAt)}{"\n"}最近登入：{date(member.lastSignInAt)}{"\n"}私人備份：{member.backup ? `第 ${member.backup.revision} 版 · ${date(member.backup.updatedAt)}` : "尚未建立"}</Typography><Typography className="type-label text-muted">{member.id}</Typography><Button variant="secondary" isDisabled={model.busy || member.isAdmin || member.id === model.page?.viewerId} onPress={() => { setReason(""); setInvalid(false); setSelected(member); }}>{member.isAdmin ? "管理者帳號受保護" : member.banned ? "恢復帳號" : "停權帳號"}</Button></Card>)}
            {model.page ? <><View className="flex-row flex-wrap gap-3"><Button variant="ghost" isDisabled={model.busy || model.page.offset === 0} onPress={() => void model.previous()}>上一頁</Button><Button variant="ghost" isDisabled={model.busy || model.page.offset + model.page.limit >= model.page.totalCount} onPress={() => void model.next()}>下一頁</Button></View><Card className="gap-3 p-5"><Typography.Heading className="type-title text-ink">最近管理紀錄</Typography.Heading>{model.page.audit.length ? model.page.audit.map(item => <View key={item.id} className="gap-1 border-t border-line pt-3"><Typography className="type-body text-ink">{item.action === "ban" ? "停權" : "恢復"} · {item.result === "succeeded" ? "已完成" : item.result === "failed" ? "未完成" : "待確認"}</Typography><Typography className="type-body text-ink">{item.reason}</Typography><Typography className="type-label text-muted">{date(item.createdAt)}{"\n"}管理者 {item.actorId}{"\n"}會員 {item.targetId}</Typography></View>) : <Typography className="type-body text-muted">尚無管理操作。</Typography>}</Card></> : null}
          </>}
    <Modal visible={selected !== null} transparent animationType="slide" onRequestClose={() => { if (!model.busy) setSelected(null); }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><View className="flex-1 justify-end bg-black/40"><SafeAreaView className="rounded-t-3xl bg-starlight" style={{ maxHeight: "95%" }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 16, padding: 24 }}>
        <Typography.Heading className="type-title text-ink">{selected?.banned ? "恢復會員帳號" : "停權會員帳號"}</Typography.Heading><Typography className="type-body text-ink">{selected?.name} · {selected?.email}</Typography><Typography className="type-body text-muted">{selected?.banned ? "恢復後可以重新登入。" : "停權將撤銷登入並禁止再次登入，原有備份仍會保留。"}</Typography><NativeInput accessibilityLabel="會員管理操作原因" placeholder="操作原因（2–240 字）" multiline maxLength={240} value={reason} onChangeText={value => { setReason(value); setInvalid(false); }} />
        {invalid ? <Typography accessibilityRole="alert" className="type-body text-danger">請填寫至少 2 個字的原因。</Typography> : null}{model.error ? <Typography accessibilityRole="alert" className="type-body text-danger">{model.error}</Typography> : null}
        <Button isDisabled={model.busy} onPress={() => { if (reason.trim().length < 2) return setInvalid(true); if (selected) void model.changeStatus(selected, reason).then(saved => { if (saved) setSelected(null); }); }}>{model.busy ? "處理中…" : selected?.banned ? "確認恢復" : "確認停權"}</Button><Button variant="ghost" isDisabled={model.busy} onPress={() => setSelected(null)}>取消</Button>
      </ScrollView></SafeAreaView></View></KeyboardAvoidingView>
    </Modal>
  </NativePage>;
}

export default function AdminScreen() {
  if (isLocalPreview()) return <NativePage title="會員管理" eyebrow="Member Administration" description="會員管理需要登入。"><Typography className="type-body text-ink">目前是僅供本機功能的預覽，會員管理需要管理者登入。</Typography></NativePage>;
  return <ConnectedAdmin />;
}
