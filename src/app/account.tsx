import type { JSX } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Platform, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Button, Card, Typography } from "heroui-native";

import { useEmailPasswordAuth } from "@/auth/useEmailPasswordAuth";
import { useNativeAppleSignIn } from "@/auth/useNativeAppleSignIn";
import { APPLE_SIGN_IN_ENABLED, useSocialSignIn } from "@/auth/useSocialSignIn";
import { signInMethodLabel, validatePasswordChange, validateProfileName } from "@/features/account/accountProfile";
import { useAccountModel } from "@/features/account/useAccountModel";
import { NativePage } from "@/ui/NativePage";

function GoogleMark() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" aria-hidden>
      <Path fill="#4285f4" d="M21.6 12.23c0-.71-.06-1.24-.2-1.79H12v3.42h5.52a4.72 4.72 0 0 1-2.05 3.02l2.98 2.31c1.91-1.77 2.96-4.37 2.96-7.09Z" />
      <Path fill="#34a853" d="M12 22c2.74 0 5.04-.9 6.72-2.46l-3.2-2.48c-.86.58-2.02.99-3.52.99-2.64 0-4.88-1.78-5.68-4.25l-3.25 2.51A10.15 10.15 0 0 0 12 22Z" />
      <Path fill="#fbbc05" d="M6.32 13.8A6.1 6.1 0 0 1 6 11.87c0-.67.12-1.31.31-1.92L3.07 7.43A10.06 10.06 0 0 0 2 11.87c0 1.61.39 3.13 1.07 4.44l3.25-2.51Z" />
      <Path fill="#ea4335" d="M12 5.7c1.91 0 3.2.83 3.94 1.52l2.85-2.79A9.58 9.58 0 0 0 12 1.75a10.15 10.15 0 0 0-8.93 5.68l3.24 2.52C7.12 7.48 9.36 5.7 12 5.7Z" />
    </Svg>
  );
}

function dateLabel(value: string | null): string {
  return value ? new Date(value).toLocaleString("zh-TW") : "尚未建立";
}

const INPUT_CLASS = "rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-base text-white";

function AuthField({ children, label }: { children: JSX.Element; label: string }): JSX.Element {
  return (
    <View className="gap-2">
      <Typography className="text-sm text-white/80">{label}</Typography>
      {children}
    </View>
  );
}

function SignedOutAuthCard(): JSX.Element {
  const emailAuth = useEmailPasswordAuth();
  const socialAuth = useSocialSignIn();
  const appleAuth = useNativeAppleSignIn();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const busy = emailAuth.submitting || socialAuth.submitting !== null || appleAuth.submitting;

  function validateEmailAddress(): string | null {
    if (!email.trim()) return "請輸入 Email。";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "請輸入有效的 Email。";
    return null;
  }

  async function submitCredentials() {
    setFormError(null);
    const emailError = validateEmailAddress();
    if (emailError) return setFormError(emailError);
    if (password.length < 15) return setFormError("密碼至少需要 15 碼。");

    if (emailAuth.mode === "sign-up") {
      if (password !== passwordConfirmation) return setFormError("兩次輸入的密碼不一致。");
      await emailAuth.startSignUp({
        emailAddress: email.trim().toLowerCase(),
        firstName: name.trim() || undefined,
        password,
      });
      return;
    }
    await emailAuth.startSignIn(email.trim().toLowerCase(), password);
  }

  async function submitCode() {
    setFormError(null);
    if (!/^\d{6}$/.test(code)) return setFormError("請輸入 6 位數驗證碼。");
    if (emailAuth.step === "verify-sign-up") await emailAuth.verifySignUp(code);
    else if (emailAuth.step === "verify-client-trust") await emailAuth.verifyClientTrust(code);
    else await emailAuth.verifyResetCode(code);
  }

  async function beginPasswordReset() {
    setFormError(null);
    const emailError = validateEmailAddress();
    if (emailError) return setFormError(emailError);
    await emailAuth.startPasswordReset(email.trim().toLowerCase());
  }

  async function saveNewPassword() {
    setFormError(null);
    if (password.length < 15) return setFormError("新密碼至少需要 15 碼。");
    if (password !== passwordConfirmation) return setFormError("兩次輸入的密碼不一致。");
    await emailAuth.submitNewPassword(password);
  }

  async function switchMode(mode: "sign-in" | "sign-up") {
    setFormError(null);
    setPassword("");
    setPasswordConfirmation("");
    await emailAuth.setMode(mode);
  }

  async function returnToForm() {
    setCode("");
    setPassword("");
    setPasswordConfirmation("");
    setFormError(null);
    await emailAuth.returnToForm();
  }

  const displayedError = formError ?? emailAuth.error ?? socialAuth.error ?? appleAuth.error;

  return (
    <Card className="gap-4 border border-white/50 bg-glass/70 p-5">
      {emailAuth.step === "form" ? (
        <>
          <View className="gap-1">
            <Typography className="text-xs uppercase tracking-[2px] text-white/60">會員帳號</Typography>
            <Typography.Heading className="text-xl text-white">{emailAuth.mode === "sign-in" ? "歡迎回來" : "建立深空省省帳號"}</Typography.Heading>
          </View>

          <View className="flex-row gap-2 rounded-2xl border border-white/20 bg-white/5 p-1">
            <Button className="flex-1" size="sm" variant={emailAuth.mode === "sign-in" ? "secondary" : "ghost"} isDisabled={busy} onPress={() => void switchMode("sign-in")} accessibilityRole="tab" accessibilityState={{ selected: emailAuth.mode === "sign-in" }}>登入</Button>
            <Button className="flex-1" size="sm" variant={emailAuth.mode === "sign-up" ? "secondary" : "ghost"} isDisabled={busy} onPress={() => void switchMode("sign-up")} accessibilityRole="tab" accessibilityState={{ selected: emailAuth.mode === "sign-up" }}>註冊</Button>
          </View>

          {emailAuth.mode === "sign-up" ? (
            <AuthField label="顯示名稱（選填）">
              <TextInput accessibilityLabel="顯示名稱" autoComplete="name" className={INPUT_CLASS} placeholder="怎麼稱呼你？" placeholderTextColor="rgba(255,255,255,.42)" value={name} onChangeText={setName} />
            </AuthField>
          ) : null}

          <AuthField label="Email">
            <TextInput accessibilityLabel="Email" autoCapitalize="none" autoComplete="email" className={INPUT_CLASS} keyboardType="email-address" placeholder="name@example.com" placeholderTextColor="rgba(255,255,255,.42)" value={email} onChangeText={setEmail} />
          </AuthField>
          <AuthField label="密碼">
            <TextInput accessibilityLabel="密碼" autoCapitalize="none" autoComplete={emailAuth.mode === "sign-up" ? "new-password" : "current-password"} className={INPUT_CLASS} placeholder="至少 15 碼" placeholderTextColor="rgba(255,255,255,.42)" secureTextEntry value={password} onChangeText={setPassword} />
          </AuthField>
          {emailAuth.mode === "sign-up" ? (
            <AuthField label="再次輸入密碼">
              <TextInput accessibilityLabel="再次輸入密碼" autoCapitalize="none" autoComplete="new-password" className={INPUT_CLASS} placeholder="再輸入一次" placeholderTextColor="rgba(255,255,255,.42)" secureTextEntry value={passwordConfirmation} onChangeText={setPasswordConfirmation} />
            </AuthField>
          ) : null}

          {emailAuth.mode === "sign-up" ? <View nativeID="clerk-captcha" /> : null}

          <Button variant="secondary" size="lg" isDisabled={busy} onPress={() => void submitCredentials()}>{emailAuth.submitting ? "處理中…" : emailAuth.mode === "sign-in" ? "登入" : "建立帳號"}</Button>

          {emailAuth.mode === "sign-in" ? <Button variant="ghost" size="sm" isDisabled={busy} onPress={() => void beginPasswordReset()}>忘記密碼？</Button> : null}

          <View className="flex-row items-center gap-3"><View className="h-px flex-1 bg-white/20" /><Typography className="text-xs text-white/50">或</Typography><View className="h-px flex-1 bg-white/20" /></View>

          <Button variant="outline" size="lg" isDisabled={busy} onPress={() => void socialAuth.signIn("oauth_google")}><GoogleMark /><Button.Label>{socialAuth.submitting === "oauth_google" ? "正在開啟 Google…" : "使用 Google 繼續"}</Button.Label></Button>
          {APPLE_SIGN_IN_ENABLED && Platform.OS === "ios" ? (
            <View pointerEvents={busy ? "none" : "auto"} style={{ opacity: busy ? 0.55 : 1 }}>
              <AppleAuthentication.AppleAuthenticationButton
                accessibilityLabel={appleAuth.submitting ? "正在使用 Apple 登入" : "使用 Apple 繼續"}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                cornerRadius={12}
                onPress={() => void appleAuth.signIn()}
                style={{ width: "100%", height: 48 }}
              />
            </View>
          ) : null}
        </>
      ) : emailAuth.step === "reset-password" ? (
        <>
          <View className="gap-2"><Typography className="text-xs uppercase tracking-[2px] text-white/60">重設密碼</Typography><Typography.Heading className="text-xl text-white">設定新的密碼</Typography.Heading><Typography className="text-sm text-white/70">已完成 Email 驗證。新密碼至少需要 15 碼。</Typography></View>
          <AuthField label="新密碼"><TextInput accessibilityLabel="新密碼" autoComplete="new-password" className={INPUT_CLASS} secureTextEntry value={password} onChangeText={setPassword} /></AuthField>
          <AuthField label="再次輸入新密碼"><TextInput accessibilityLabel="再次輸入新密碼" autoComplete="new-password" className={INPUT_CLASS} secureTextEntry value={passwordConfirmation} onChangeText={setPasswordConfirmation} /></AuthField>
          <Button variant="secondary" size="lg" isDisabled={busy} onPress={() => void saveNewPassword()}>{busy ? "更新中…" : "更新密碼並登入"}</Button>
          <Button variant="ghost" size="sm" isDisabled={busy} onPress={() => void returnToForm()}>返回登入</Button>
        </>
      ) : (
        <>
          <View className="gap-2">
            <Typography className="text-xs uppercase tracking-[2px] text-white/60">Email 驗證</Typography>
            <Typography.Heading className="text-xl text-white">{emailAuth.step === "verify-sign-up" ? "完成會員註冊" : emailAuth.step === "verify-client-trust" ? "確認這台新裝置" : "重設你的密碼"}</Typography.Heading>
            <Typography className="text-sm leading-5 text-white/70">請輸入寄到 {emailAuth.emailAddress} 的 6 位數驗證碼。</Typography>
          </View>
          <AuthField label="驗證碼"><TextInput accessibilityLabel="6 位數驗證碼" autoComplete="one-time-code" className={`${INPUT_CLASS} text-center text-xl tracking-[8px]`} keyboardType="number-pad" maxLength={6} placeholder="000000" placeholderTextColor="rgba(255,255,255,.42)" value={code} onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))} /></AuthField>
          <Button variant="secondary" size="lg" isDisabled={busy} onPress={() => void submitCode()}>{busy ? "驗證中…" : "確認驗證碼"}</Button>
          <View className="flex-row justify-center gap-2"><Button variant="ghost" size="sm" isDisabled={busy} onPress={() => void emailAuth.resendCode()}>重新寄送</Button><Button variant="ghost" size="sm" isDisabled={busy} onPress={() => void returnToForm()}>更換 Email</Button></View>
        </>
      )}

      {emailAuth.notice ? <Typography className="rounded-xl border border-emerald-200/30 bg-emerald-950/20 p-3 text-sm text-emerald-100" accessibilityRole="text">{emailAuth.notice}</Typography> : null}
      {displayedError ? <Typography className="rounded-xl border border-red-200/30 bg-red-950/20 p-3 text-sm text-red-100" accessibilityRole="alert">{displayedError}</Typography> : null}
      <Typography className="text-xs leading-5 text-white/60">登入服務與 Email 驗證由 Clerk 提供；會員資料與 Neon 私人備份不會公開。未登入時仍可繼續使用本機資料。</Typography>
      <Typography className="text-xs leading-5 text-white/60">建立帳號或登入即表示你已閱讀<Link href="/privacy" className="text-white underline">隱私政策</Link>；所有主要功能都可以不登入使用。</Typography>
    </Card>
  );
}

type AccountModel = ReturnType<typeof useAccountModel>;

function SecurityRow({ detail, label, state, positive = false }: { detail: string; label: string; state: string; positive?: boolean }): JSX.Element {
  return (
    <View className="flex-row items-center justify-between gap-3 border-b border-white/15 py-3">
      <View className="min-w-0 flex-1 gap-0.5">
        <Typography className="text-sm font-medium text-white">{label}</Typography>
        <Typography className="text-xs leading-5 text-white/60">{detail}</Typography>
      </View>
      <View className={positive ? "shrink-0 rounded-full border border-emerald-200/40 bg-emerald-950/20 px-2.5 py-1" : "shrink-0 rounded-full border border-white/25 bg-white/5 px-2.5 py-1"}>
        <Typography className={positive ? "text-xs text-emerald-100" : "text-xs text-white/70"}>{state}</Typography>
      </View>
    </View>
  );
}

function SignedInMemberCards({ model }: { model: AccountModel }): JSX.Element {
  const [editingProfile, setEditingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [firstName, setFirstName] = useState(model.user?.firstName ?? "");
  const [lastName, setLastName] = useState(model.user?.lastName ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const user = model.user;
  const disabled = model.busy !== null;

  if (!user) return <Card className="border border-white/50 bg-glass/70 p-5"><Typography className="text-white/80">正在載入會員資料…</Typography></Card>;

  const email = user.primaryEmailAddress?.emailAddress ?? "尚未設定 Email";
  const emailVerified = user.primaryEmailAddress?.verification?.status === "verified";
  const providers = Array.from(new Set(user.externalAccounts.map((account) => signInMethodLabel(account.provider))));
  const methods = [user.passwordEnabled ? "Email 密碼" : null, ...providers].filter(Boolean).join("、") || "Email 驗證碼";

  async function saveProfile() {
    const error = validateProfileName({ firstName, lastName });
    setFormError(error);
    if (error) return;
    if (await model.updateProfile(firstName, lastName)) setEditingProfile(false);
  }

  async function savePassword() {
    const error = validatePasswordChange({ currentPassword, newPassword, confirmation: passwordConfirmation });
    setFormError(error);
    if (error) return;
    if (await model.updatePassword(currentPassword, newPassword)) {
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirmation("");
      setShowPasswordForm(false);
    }
  }

  function cancelProfileEdit() {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setFormError(null);
    setEditingProfile(false);
  }

  return (
    <>
      <Card className="gap-4 border border-white/50 bg-glass/70 p-5">
        <View className="flex-row items-center gap-3">
          {user.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} className="size-14 shrink-0 rounded-full border border-white/60" accessibilityIgnoresInvertColors />
          ) : (
            <View className="size-14 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/10"><Typography className="text-xl text-white">✦</Typography></View>
          )}
          <View className="min-w-0 flex-1">
            <Typography className="text-xs uppercase tracking-[2px] text-white/60">會員中心</Typography>
            <Typography.Heading className="text-xl text-white" numberOfLines={1}>{user.fullName ?? email}</Typography.Heading>
            <Typography className="text-xs text-white/65" numberOfLines={1}>{email}</Typography>
          </View>
          <View className="shrink-0 flex-row items-center gap-1.5 rounded-full border border-emerald-200/40 bg-emerald-950/20 px-2.5 py-1">
            <View className="size-1.5 rounded-full bg-emerald-200" />
            <Typography className="text-xs text-emerald-100">已登入</Typography>
          </View>
        </View>

        <View className="flex-row gap-2">
          <View className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/5 p-3"><Typography className="text-xs text-white/55">Email 狀態</Typography><Typography className="text-sm text-white">{emailVerified ? "已驗證" : "等待驗證"}</Typography></View>
          <View className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/5 p-3"><Typography className="text-xs text-white/55">登入方式</Typography><Typography className="text-sm text-white" numberOfLines={2}>{methods}</Typography></View>
        </View>

        <View className="gap-2">
          <Button size="sm" variant="secondary" isDisabled={disabled} onPress={() => { setFormError(null); setEditingProfile((value) => !value); }}>{editingProfile ? "收起編輯" : "編輯個人資料"}</Button>
          <Button size="sm" variant="outline" isDisabled={disabled} onPress={() => void model.logOut()}>{model.busy === "signout" ? "登出中…" : "登出這台裝置"}</Button>
        </View>

        {editingProfile ? (
          <View className="gap-3 border-t border-white/15 pt-4">
            <AuthField label="名字"><TextInput accessibilityLabel="名字" autoComplete="name-given" className={INPUT_CLASS} maxLength={64} value={firstName} onChangeText={setFirstName} /></AuthField>
            <AuthField label="姓氏（選填）"><TextInput accessibilityLabel="姓氏" autoComplete="name-family" className={INPUT_CLASS} maxLength={64} value={lastName} onChangeText={setLastName} /></AuthField>
            <View className="flex-row gap-2"><Button className="flex-1" size="sm" variant="secondary" isDisabled={disabled} onPress={() => void saveProfile()}>{model.busy === "profile" ? "儲存中…" : "儲存個人資料"}</Button><Button size="sm" variant="ghost" isDisabled={disabled} onPress={cancelProfileEdit}>取消</Button></View>
          </View>
        ) : null}
      </Card>

      <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
        <View className="gap-1"><Typography className="text-xs uppercase tracking-[2px] text-white/60">登入與安全性</Typography><Typography.Heading className="text-xl text-white">保護你的會員帳號</Typography.Heading></View>
        <View>
          <SecurityRow label="主要 Email" detail={email} state={emailVerified ? "已驗證" : "待驗證"} positive={emailVerified} />
          <SecurityRow label="兩步驟驗證" detail="登入新裝置時提高帳號安全性" state={user.twoFactorEnabled ? "已啟用" : "未啟用"} positive={user.twoFactorEnabled} />
          <SecurityRow label="密碼登入" detail={user.passwordEnabled ? "可以在這裡更新密碼" : "目前由 Google 或 Apple 管理登入"} state={user.passwordEnabled ? "已設定" : "未使用"} positive={user.passwordEnabled} />
        </View>

        {user.passwordEnabled ? (
          <>
            <Button size="sm" variant="outline" isDisabled={disabled} onPress={() => { setFormError(null); setShowPasswordForm((value) => !value); }}>{showPasswordForm ? "收起密碼設定" : "更新登入密碼"}</Button>
            {showPasswordForm ? (
              <View className="gap-3 border-t border-white/15 pt-4">
                <AuthField label="目前密碼"><TextInput accessibilityLabel="目前密碼" autoComplete="password" className={INPUT_CLASS} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} /></AuthField>
                <AuthField label="新密碼"><TextInput accessibilityLabel="新密碼" autoComplete="new-password" className={INPUT_CLASS} placeholder="至少 15 碼" placeholderTextColor="rgba(255,255,255,.42)" secureTextEntry value={newPassword} onChangeText={setNewPassword} /></AuthField>
                <AuthField label="再次輸入新密碼"><TextInput accessibilityLabel="再次輸入新密碼" autoComplete="new-password" className={INPUT_CLASS} secureTextEntry value={passwordConfirmation} onChangeText={setPasswordConfirmation} /></AuthField>
                <Typography className="text-xs leading-5 text-white/60">更新後會自動登出其他裝置，這台裝置會保持登入。</Typography>
                <Button size="sm" variant="secondary" isDisabled={disabled} onPress={() => void savePassword()}>{model.busy === "password" ? "更新中…" : "更新密碼"}</Button>
              </View>
            ) : null}
          </>
        ) : null}

        {formError ? <Typography className="rounded-xl border border-red-200/30 bg-red-950/20 p-3 text-sm text-red-100" accessibilityRole="alert">{formError}</Typography> : null}
        {model.profileStatus ? <Typography className={model.profileStatus.tone === "error" ? "rounded-xl border border-red-200/30 bg-red-950/20 p-3 text-sm text-red-100" : "rounded-xl border border-emerald-200/30 bg-emerald-950/20 p-3 text-sm text-emerald-100"} accessibilityRole={model.profileStatus.tone === "error" ? "alert" : "text"}>{model.profileStatus.message}</Typography> : null}
      </Card>
    </>
  );
}

export default function AccountScreen(): JSX.Element {
  const router = useRouter();
  const model = useAccountModel();
  const disabled = model.busy !== null;

  function confirmPull() {
    Alert.alert("下載雲端備份？", "會覆蓋這台裝置目前的預算、花費、換算設定、抽卡規劃、五星紀錄與排期篩選。", [
      { text: "取消", style: "cancel" },
      { text: "確定下載", onPress: () => void model.pull() },
    ]);
  }

  function confirmPush() {
    if (!model.snapshot?.revision) return void model.push();
    Alert.alert("更新雲端備份？", "會以這台裝置的資料覆蓋目前雲端版本。", [
      { text: "取消", style: "cancel" },
      { text: "確定更新", onPress: () => void model.push() },
    ]);
  }

  function confirmDelete() {
    Alert.alert("永久刪除會員帳號？", "Clerk 帳號與 Neon 雲端備份都會刪除；這台裝置的本機資料會保留。", [
      { text: "取消", style: "cancel" },
      {
        text: "永久刪除",
        style: "destructive",
        onPress: () => void (async () => {
          const result = await model.deleteAccount();
          if (!result) return;
          if (result.appleAuthorization === "manual_required") {
            Alert.alert(
              "帳號與雲端資料已刪除",
              "Apple 授權無法自動撤銷。請到 iOS「設定」>「你的名字」>「使用 Apple 登入」>「深空省省」>「停止使用 Apple ID」完成撤銷。",
            );
          } else {
            Alert.alert("帳號已刪除", "會員帳號與雲端備份已永久刪除；這台裝置的本機資料仍會保留。");
          }
        })(),
      },
    ]);
  }

  function confirmCloudDeletion() {
    Alert.alert("刪除雲端備份？", "只會刪除 Neon 上的私人備份；會員帳號與這台裝置的資料都會保留。", [
      { text: "取消", style: "cancel" },
      { text: "刪除備份", style: "destructive", onPress: () => void model.removeCloudBackup() },
    ]);
  }

  return (
    <NativePage eyebrow="Account & Cloud" title="會員中心" description="管理個人資料、登入安全性與私人雲端備份。" showAccountEntry={false} showAboutLink={false}>
      <View className="items-start"><Button variant="outline" size="sm" onPress={() => router.back()}>← 返回</Button></View>

      <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
        <Typography className="text-xs uppercase tracking-[2px] text-white/60">Clerk × Neon</Typography>
        <Typography.Heading className="text-2xl text-white">{model.isSignedIn ? `嗨，${model.user?.firstName ?? "深空旅人"}` : "登入後，換裝置也能帶走紀錄"}</Typography.Heading>
        <Typography.Paragraph className="leading-6 text-white/80">未登入時仍會保存在本機；登入只會增加私人雲端備份。</Typography.Paragraph>
      </Card>

      {!model.isLoaded ? (
        <Card className="border border-white/50 bg-glass/70 p-5"><Typography className="text-white/80">正在確認登入狀態…</Typography></Card>
      ) : !model.isSignedIn ? (
        <SignedOutAuthCard />
      ) : (
        <>
          <SignedInMemberCards model={model} />

          <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
            <Typography className="text-xs uppercase tracking-[2px] text-white/60">私人雲端備份</Typography>
            <Typography.Heading className="text-xl text-white">{model.snapshot?.data ? `版本 ${model.snapshot.revision}` : "尚無雲端備份"}</Typography.Heading>
            <Typography className="text-sm text-white/70">最後更新：{dateLabel(model.snapshot?.updatedAt ?? null)}</Typography>
            <Button variant="secondary" isDisabled={disabled} onPress={confirmPush}>{model.busy === "push" ? "上傳中…" : "以這台裝置更新雲端"}</Button>
            <Button variant="outline" isDisabled={disabled || !model.snapshot?.data} onPress={confirmPull}>{model.busy === "pull" ? "下載中…" : "下載雲端備份到這台裝置"}</Button>
            <Button variant="ghost" size="sm" isDisabled={disabled || !model.snapshot?.data} onPress={confirmCloudDeletion}>{model.busy === "delete-cloud" ? "刪除中…" : "只刪除雲端備份"}</Button>
            <Button variant="ghost" size="sm" isDisabled={disabled} onPress={() => void model.refresh()}>重新整理雲端狀態</Button>
            {model.status ? <Typography className={model.status.tone === "error" ? "text-sm text-red-200" : "text-sm text-emerald-200"}>{model.status.message}</Typography> : null}
            <Typography className="text-xs leading-5 text-white/60">為避免衝突，系統不會在另一台裝置靜默覆寫資料。</Typography>
          </Card>

          <Card className="gap-3 border border-red-200/50 bg-red-950/20 p-5">
            <Typography.Heading className="text-xl text-white">刪除會員帳號</Typography.Heading>
            <Typography className="text-sm leading-5 text-white/70">永久移除 Clerk 帳號與 Neon 雲端備份；本機資料會保留。</Typography>
            <Button variant="danger" isDisabled={disabled} onPress={confirmDelete}>{model.busy === "delete" ? "刪除中…" : "永久刪除帳號"}</Button>
          </Card>
        </>
      )}
    </NativePage>
  );
}
