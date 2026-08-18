import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Input } from "@heroui/react/input";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, JSX } from "react";

import { isCurrentWebAuthOffline, OFFLINE_AUTH_MESSAGE } from "@/auth/networkAvailability";
import { useEmailPasswordAuth } from "@/auth/useEmailPasswordAuth";
import { APPLE_SIGN_IN_ENABLED, useSocialSignIn } from "@/auth/useSocialSignIn";
import { signInMethodLabel, validatePasswordChange, validateProfileName } from "@/features/account/accountProfile";
import { useAccountModel } from "@/features/account/useAccountModel";
import { WebPage } from "@/ui/WebPage.web";

function GoogleMark() {
  return (
    <svg className="provider-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285f4" d="M21.6 12.23c0-.71-.06-1.24-.2-1.79H12v3.42h5.52a4.72 4.72 0 0 1-2.05 3.02l-.02.11 2.98 2.31.21.02c1.91-1.77 2.96-4.37 2.96-7.09Z" />
      <path fill="#34a853" d="M12 22c2.74 0 5.04-.9 6.72-2.46l-3.2-2.48c-.86.58-2.02.99-3.52.99-2.64 0-4.88-1.78-5.68-4.25l-.11.01-3.1 2.4-.04.1A10.15 10.15 0 0 0 12 22Z" />
      <path fill="#fbbc05" d="M6.32 13.8A6.1 6.1 0 0 1 6 11.87c0-.67.12-1.31.31-1.92v-.13L3.17 7.38l-.1.05A10.06 10.06 0 0 0 2 11.87c0 1.61.39 3.13 1.07 4.44l3.25-2.51Z" />
      <path fill="#ea4335" d="M12 5.7c1.91 0 3.2.83 3.94 1.52l2.85-2.79A9.58 9.58 0 0 0 12 1.75a10.15 10.15 0 0 0-8.93 5.68l3.24 2.52C7.12 7.48 9.36 5.7 12 5.7Z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg className="provider-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.03-3.02 2.47-4.49 2.58-4.56a5.52 5.52 0 0 0-4.35-2.35c-1.83-.19-3.61 1.1-4.54 1.1-.95 0-2.38-1.08-3.93-1.05a5.77 5.77 0 0 0-4.85 2.96c-2.11 3.66-.54 9.04 1.49 12 1.02 1.46 2.2 3.08 3.75 3.02 1.52-.06 2.09-.97 3.92-.97 1.81 0 2.35.97 3.94.93 1.63-.02 2.66-1.46 3.64-2.93a12.1 12.1 0 0 0 1.66-3.38 5.2 5.2 0 0 1-3.31-4.77ZM14.08 3.69A5.28 5.28 0 0 0 15.29 0a5.37 5.37 0 0 0-3.47 1.75 5.03 5.03 0 0 0-1.24 3.55 4.43 4.43 0 0 0 3.5-1.61Z" />
    </svg>
  );
}

function displayDate(value: string | null): string {
  if (!value) return "尚未建立";
  return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function useBrowserOffline(): boolean {
  const [offline, setOffline] = useState(() => isCurrentWebAuthOffline("web"));

  useEffect(() => {
    const update = () => setOffline(isCurrentWebAuthOffline("web"));
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return offline;
}

function OfflineAccountCard(): JSX.Element {
  return (
    <Card className="product-card card account-card" role="status">
      <div>
        <p className="card-kicker">離線模式</p>
        <h2>本機資料仍可照常使用</h2>
      </div>
      <p>{OFFLINE_AUTH_MESSAGE}</p>
      <p className="account-fine-print">會員登入、帳號設定與 Neon 雲端備份需要網路；重新連線後，這個頁面會自動確認登入狀態。</p>
    </Card>
  );
}

function SignedOutAuthCard({ offline }: { offline: boolean }): JSX.Element {
  const emailAuth = useEmailPasswordAuth();
  const socialAuth = useSocialSignIn();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const busy = offline || emailAuth.submitting || socialAuth.submitting !== null;

  function validateEmailAddress(): string | null {
    if (!email.trim()) return "請輸入 Email。";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "請輸入有效的 Email。";
    return null;
  }

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  async function saveNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  const displayedError = formError ?? emailAuth.error ?? socialAuth.error;

  return (
    <Card className="product-card card account-card auth-card">
      {emailAuth.step === "form" ? (
        <>
          <div>
            <p className="card-kicker">會員帳號</p>
            <h2>{emailAuth.mode === "sign-in" ? "歡迎回來" : "建立深空省省帳號"}</h2>
          </div>

          <div className="auth-switch" role="group" aria-label="登入或註冊">
            <Button
              size="sm"
              variant={emailAuth.mode === "sign-in" ? "secondary" : "ghost"}
              aria-pressed={emailAuth.mode === "sign-in"}
              isDisabled={busy}
              onPress={() => void switchMode("sign-in")}
            >登入</Button>
            <Button
              size="sm"
              variant={emailAuth.mode === "sign-up" ? "secondary" : "ghost"}
              aria-pressed={emailAuth.mode === "sign-up"}
              isDisabled={busy}
              onPress={() => void switchMode("sign-up")}
            >註冊</Button>
          </div>

          <form className="auth-form" onSubmit={(event) => void submitCredentials(event)} noValidate>
            {emailAuth.mode === "sign-up" ? (
              <label className="field-wrap">
                <span className="field-label">顯示名稱（選填）</span>
                <Input
                  name="displayName"
                  aria-label="顯示名稱"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="怎麼稱呼你？"
                />
              </label>
            ) : null}
            <label className="field-wrap">
              <span className="field-label">Email</span>
              <Input
                name="email"
                aria-label="Email"
                aria-invalid={Boolean(formError)}
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </label>
            <label className="field-wrap">
              <span className="field-label">密碼</span>
              <Input
                name="password"
                aria-label="密碼"
                aria-invalid={Boolean(formError)}
                autoComplete={emailAuth.mode === "sign-up" ? "new-password" : "current-password"}
                minLength={15}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 15 碼"
              />
            </label>
            {emailAuth.mode === "sign-up" ? (
              <label className="field-wrap">
                <span className="field-label">再次輸入密碼</span>
                <Input
                  name="passwordConfirmation"
                  aria-label="再次輸入密碼"
                  aria-invalid={Boolean(formError)}
                  autoComplete="new-password"
                  minLength={15}
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  placeholder="再輸入一次"
                />
              </label>
            ) : null}

            {emailAuth.mode === "sign-up" ? (
              <div id="clerk-captcha" data-cl-theme="dark" data-cl-size="flexible" data-cl-language="zh-tw" />
            ) : null}

            <Button fullWidth size="lg" type="submit" variant="secondary" isDisabled={busy}>
              {emailAuth.submitting
                ? "處理中…"
                : emailAuth.mode === "sign-in" ? "登入" : "建立帳號"}
            </Button>
          </form>

          {emailAuth.mode === "sign-in" ? (
            <button className="auth-text-button" type="button" disabled={busy} onClick={() => void beginPasswordReset()}>
              忘記密碼？
            </button>
          ) : null}

          <div className="auth-divider"><span>或</span></div>

          <Button fullWidth size="lg" variant="outline" isDisabled={busy} onPress={() => void socialAuth.signIn("oauth_google")}>
            <GoogleMark />{socialAuth.submitting === "oauth_google" ? "正在開啟 Google…" : "使用 Google 繼續"}
          </Button>
          {APPLE_SIGN_IN_ENABLED ? (
            <Button fullWidth size="lg" variant="outline" isDisabled={busy} onPress={() => void socialAuth.signIn("oauth_apple")}>
              <AppleMark />{socialAuth.submitting === "oauth_apple" ? "正在開啟 Apple…" : "使用 Apple 繼續"}
            </Button>
          ) : null}
        </>
      ) : emailAuth.step === "reset-password" ? (
        <>
          <div>
            <p className="card-kicker">重設密碼</p>
            <h2>設定新的密碼</h2>
            <p className="auth-intro">已完成 Email 驗證。新密碼至少需要 15 碼。</p>
          </div>
          <form className="auth-form" onSubmit={(event) => void saveNewPassword(event)}>
            <label className="field-wrap">
              <span className="field-label">新密碼</span>
              <Input name="newPassword" aria-label="新密碼" autoComplete="new-password" minLength={15} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <label className="field-wrap">
              <span className="field-label">再次輸入新密碼</span>
              <Input name="newPasswordConfirmation" aria-label="再次輸入新密碼" autoComplete="new-password" minLength={15} type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} />
            </label>
            <Button fullWidth size="lg" type="submit" variant="secondary" isDisabled={busy}>{busy ? "更新中…" : "更新密碼並登入"}</Button>
          </form>
          <button className="auth-text-button" type="button" disabled={busy} onClick={() => void returnToForm()}>返回登入</button>
        </>
      ) : (
        <>
          <div>
            <p className="card-kicker">Email 驗證</p>
            <h2>{emailAuth.step === "verify-sign-up" ? "完成會員註冊" : emailAuth.step === "verify-client-trust" ? "確認這台新裝置" : "重設你的密碼"}</h2>
            <p className="auth-intro">請輸入寄到 <strong>{emailAuth.emailAddress}</strong> 的 6 位數驗證碼。</p>
          </div>
          <form className="auth-form" onSubmit={(event) => void submitCode(event)}>
            <label className="field-wrap">
              <span className="field-label">驗證碼</span>
              <Input
                name="verificationCode"
                aria-label="6 位數驗證碼"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
              />
            </label>
            <Button fullWidth size="lg" type="submit" variant="secondary" isDisabled={busy}>{busy ? "驗證中…" : "確認驗證碼"}</Button>
          </form>
          <div className="auth-secondary-actions">
            <button className="auth-text-button" type="button" disabled={busy} onClick={() => void emailAuth.resendCode()}>重新寄送</button>
            <button className="auth-text-button" type="button" disabled={busy} onClick={() => void returnToForm()}>更換 Email</button>
          </div>
        </>
      )}

      {emailAuth.notice ? <p className="account-status ok" role="status">{emailAuth.notice}</p> : null}
      {displayedError ? <p className="account-status error" role="alert">{displayedError}</p> : null}
      <p className="account-fine-print">登入服務與 Email 驗證由 Clerk 提供；會員資料與 Neon 私人備份不會公開。未登入時仍可繼續使用本機資料。</p>
      <p className="account-fine-print">建立帳號或登入即表示你已閱讀<a href="/privacy">隱私政策</a>；所有主要功能都可以不登入使用。</p>
    </Card>
  );
}

type AccountModel = ReturnType<typeof useAccountModel>;

function SignedInMemberCards({ model, offline }: { model: AccountModel; offline: boolean }): JSX.Element {
  const [editingProfile, setEditingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [firstName, setFirstName] = useState(model.user?.firstName ?? "");
  const [lastName, setLastName] = useState(model.user?.lastName ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const disabled = offline || model.busy !== null;
  const user = model.user;

  if (!user) return <Card className="product-card card account-card" aria-busy="true"><p>正在載入會員資料…</p></Card>;

  const email = user.primaryEmailAddress?.emailAddress ?? "尚未設定 Email";
  const emailVerified = user.primaryEmailAddress?.verification?.status === "verified";
  const providers = Array.from(new Set(user.externalAccounts.map((account) => signInMethodLabel(account.provider))));
  const methods = [user.passwordEnabled ? "Email 密碼" : null, ...providers].filter(Boolean).join("、") || "Email 驗證碼";

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateProfileName({ firstName, lastName });
    setFormError(error);
    if (error) return;
    if (await model.updateProfile(firstName, lastName)) setEditingProfile(false);
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      <Card className="product-card card account-card member-card">
        <div className="member-card-head">
          <div className="account-profile">
            {user.imageUrl ? <img src={user.imageUrl} alt="" /> : <span aria-hidden="true">✦</span>}
            <div>
              <p className="card-kicker">會員中心</p>
              <h2>{user.fullName ?? email}</h2>
              <p>{email}</p>
            </div>
          </div>
          <span className="member-status-badge"><span aria-hidden="true" />已登入</span>
        </div>

        <dl className="member-summary">
          <div><dt>Email 狀態</dt><dd>{emailVerified ? "已驗證" : "等待驗證"}</dd></div>
          <div><dt>登入方式</dt><dd>{methods}</dd></div>
        </dl>

        <div className="member-actions">
          <Button size="sm" variant="secondary" isDisabled={disabled} onPress={() => { setFormError(null); setEditingProfile((value) => !value); }}>
            {editingProfile ? "收起編輯" : "編輯個人資料"}
          </Button>
          <Button size="sm" variant="outline" isDisabled={disabled} onPress={() => void model.logOut()}>
            {model.busy === "signout" ? "登出中…" : "登出這台裝置"}
          </Button>
        </div>

        {editingProfile ? (
          <form className="profile-form" onSubmit={(event) => void saveProfile(event)} noValidate>
            <div className="profile-fields">
              <label className="field-wrap">
                <span className="field-label">名字</span>
                <Input name="firstName" aria-label="名字" autoComplete="given-name" maxLength={64} value={firstName} onChange={(event) => setFirstName(event.target.value)} />
              </label>
              <label className="field-wrap">
                <span className="field-label">姓氏（選填）</span>
                <Input name="lastName" aria-label="姓氏" autoComplete="family-name" maxLength={64} value={lastName} onChange={(event) => setLastName(event.target.value)} />
              </label>
            </div>
            <div className="profile-form-actions">
              <Button size="sm" type="submit" variant="secondary" isDisabled={disabled}>{model.busy === "profile" ? "儲存中…" : "儲存個人資料"}</Button>
              <Button size="sm" type="button" variant="ghost" isDisabled={disabled} onPress={cancelProfileEdit}>取消</Button>
            </div>
          </form>
        ) : null}
      </Card>

      <Card className="product-card card account-card security-card">
        <div>
          <p className="card-kicker">登入與安全性</p>
          <h2>保護你的會員帳號</h2>
        </div>
        <div className="security-list" role="list">
          <div className="security-row" role="listitem"><div><strong>主要 Email</strong><span>{email}</span></div><span className={emailVerified ? "security-state good" : "security-state"}>{emailVerified ? "已驗證" : "待驗證"}</span></div>
          <div className="security-row" role="listitem"><div><strong>兩步驟驗證</strong><span>登入新裝置時提高帳號安全性</span></div><span className={user.twoFactorEnabled ? "security-state good" : "security-state"}>{user.twoFactorEnabled ? "已啟用" : "未啟用"}</span></div>
          <div className="security-row" role="listitem"><div><strong>密碼登入</strong><span>{user.passwordEnabled ? "可以在這裡更新密碼" : "目前由 Google 或 Apple 管理登入"}</span></div><span className={user.passwordEnabled ? "security-state good" : "security-state"}>{user.passwordEnabled ? "已設定" : "未使用"}</span></div>
        </div>

        {user.passwordEnabled ? (
          <>
            <Button size="sm" variant="outline" isDisabled={disabled} onPress={() => { setFormError(null); setShowPasswordForm((value) => !value); }}>
              {showPasswordForm ? "收起密碼設定" : "更新登入密碼"}
            </Button>
            {showPasswordForm ? (
              <form className="profile-form" onSubmit={(event) => void savePassword(event)} noValidate>
                <label className="field-wrap"><span className="field-label">目前密碼</span><Input name="currentPassword" aria-label="目前密碼" autoComplete="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
                <label className="field-wrap"><span className="field-label">新密碼</span><Input name="newPassword" aria-label="新密碼" autoComplete="new-password" minLength={15} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="至少 15 碼" /></label>
                <label className="field-wrap"><span className="field-label">再次輸入新密碼</span><Input name="passwordConfirmation" aria-label="再次輸入新密碼" autoComplete="new-password" minLength={15} type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} /></label>
                <p className="account-fine-print">更新後會自動登出其他裝置，這台裝置會保持登入。</p>
                <Button size="sm" type="submit" variant="secondary" isDisabled={disabled}>{model.busy === "password" ? "更新中…" : "更新密碼"}</Button>
              </form>
            ) : null}
          </>
        ) : null}

        {formError ? <p className="account-status error" role="alert">{formError}</p> : null}
        {model.profileStatus ? <p className={`account-status ${model.profileStatus.tone}`} role={model.profileStatus.tone === "error" ? "alert" : "status"}>{model.profileStatus.message}</p> : null}
      </Card>
    </>
  );
}

export default function AccountScreen(): JSX.Element {
  const model = useAccountModel();
  const browserOffline = useBrowserOffline();
  const shouldRecoverClerkRef = useRef(browserOffline);
  const disabled = browserOffline || model.busy !== null;

  useEffect(() => {
    if (browserOffline) {
      shouldRecoverClerkRef.current = true;
      return;
    }
    const shouldReload = shouldRecoverClerkRef.current && !model.isLoaded;
    shouldRecoverClerkRef.current = false;
    if (shouldReload) window.location.reload();
  }, [browserOffline, model.isLoaded]);

  async function downloadCloud() {
    if (!window.confirm("下載會覆蓋這台裝置目前的預算、花費、換算設定、抽卡規劃、五星紀錄與排期篩選。確定繼續嗎？")) return;
    await model.pull();
  }

  async function uploadLocal() {
    if (model.snapshot?.revision && !window.confirm("這會以這台裝置的資料更新目前雲端版本。確定繼續嗎？")) return;
    await model.push();
  }

  async function removeAccount() {
    if (!window.confirm("刪除會員帳號會永久刪除 Clerk 帳號與雲端備份；這台裝置的本機資料會保留。確定刪除嗎？")) return;
    const result = await model.deleteAccount();
    if (!result) return;
    if (result.appleAuthorization === "manual_required") {
      window.alert("帳號與雲端資料已刪除。Apple 授權無法自動撤銷，請到 Apple ID 的「使用 Apple 登入」設定中停止使用「深空省省」。");
    } else {
      window.alert("會員帳號與雲端備份已永久刪除；這台裝置的本機資料仍會保留。");
    }
  }

  async function removeCloudBackup() {
    if (!window.confirm("只刪除 Neon 上的私人備份；會員帳號與這台裝置的資料都會保留。確定刪除嗎？")) return;
    await model.removeCloudBackup();
  }

  return (
    <div className="web-app standalone-page">
      <main className="web-main">
        <WebPage
          eyebrow="Account & Cloud"
          title="會員中心"
          description="管理個人資料、登入安全性與私人雲端備份。"
          showAccountEntry={false}
          showAboutLink={false}
          action={<a className="back-link" href="/schedule"><span aria-hidden="true">‹</span>返回排期</a>}
        >
          <Card className="product-card card account-hero">
            <p className="card-kicker">Clerk × Neon</p>
            <h2>{model.isSignedIn ? `嗨，${model.user?.firstName ?? "深空旅人"}` : "登入後，換裝置也能帶走紀錄"}</h2>
            <p>未登入時仍會照常保存在本機；登入只會增加私人雲端備份，不影響原本使用方式。</p>
          </Card>

          {browserOffline ? <OfflineAccountCard /> : null}

          {!model.isLoaded ? (
            browserOffline ? null :
            <Card className="product-card card account-card" aria-busy="true"><p>正在確認登入狀態…</p></Card>
          ) : !model.isSignedIn ? (
            <SignedOutAuthCard offline={browserOffline} />
          ) : (
            <>
              <SignedInMemberCards model={model} offline={browserOffline} />

              <Card className="product-card card account-card">
                <div className="cloud-heading">
                  <div><p className="card-kicker">私人雲端備份</p><h2>{model.snapshot?.data ? `版本 ${model.snapshot.revision}` : "尚無雲端備份"}</h2></div>
                  <Button size="sm" variant="ghost" isDisabled={disabled} onPress={() => void model.refresh()}>重新整理</Button>
                </div>
                <dl className="cloud-meta"><div><dt>最後更新</dt><dd>{displayDate(model.snapshot?.updatedAt ?? null)}</dd></div><div><dt>同步方式</dt><dd>明確上傳／下載</dd></div></dl>
                <div className="cloud-actions">
                  <Button fullWidth variant="secondary" isDisabled={disabled} onPress={() => void uploadLocal()}>{model.busy === "push" ? "上傳中…" : "以這台裝置更新雲端"}</Button>
                  <Button fullWidth variant="outline" isDisabled={disabled || !model.snapshot?.data} onPress={() => void downloadCloud()}>{model.busy === "pull" ? "下載中…" : "下載雲端備份到這台裝置"}</Button>
                  <Button fullWidth variant="ghost" isDisabled={disabled || !model.snapshot?.data} onPress={() => void removeCloudBackup()}>{model.busy === "delete-cloud" ? "刪除中…" : "只刪除雲端備份"}</Button>
                </div>
                {model.status ? <p className={`account-status ${model.status.tone}`} role={model.status.tone === "error" ? "alert" : "status"}>{model.status.message}</p> : null}
                <p className="account-fine-print">為避免跨裝置衝突，系統不會靜默覆寫。若雲端版本已更新，會要求先重新整理。</p>
              </Card>

              <Card className="product-card card account-card danger-zone">
                <div><p className="card-kicker">帳號管理</p><h2>刪除會員帳號</h2></div>
                <p>會永久移除 Clerk 帳號與 Neon 雲端備份。本機資料會保留，方便你先匯出或繼續離線使用。</p>
                <Button variant="danger" isDisabled={disabled} onPress={() => void removeAccount()}>{model.busy === "delete" ? "刪除中…" : "永久刪除帳號"}</Button>
              </Card>
            </>
          )}

          <footer className="legal-footer"><a href="/about">關於</a><span aria-hidden="true">·</span><a href="/privacy">隱私政策</a><span aria-hidden="true">·</span><a href="/support">支援</a></footer>
        </WebPage>
      </main>
    </div>
  );
}
