# Production build 5 native QA — pending

App: 深空省省 1.0.0 (5). Apple build ID: `9778f835-2bfb-4130-bf03-da8749612aec`.

The latest check after the owner's reconnection confirms `Erik-iPhone15` (iPhone 15 Pro) is **connected**, running iOS **27.0.1 (24A446)** with Developer Mode **enabled**, USB transport **wired**, pairing **paired** and tunnel **connected**. Both device details and installed-app queries succeeded. 深空省省 remains **1.0.0 (4)**. Mac iPhone Mirroring still reports `iCloud Signed Out`; interactive phone UI control is not established. Screen capture was verified earlier but was not repeated during this connection check. No native Apple QA pass is recorded.

An earlier readiness refresh failed with CoreDevice error **4016** and reported the device **unavailable** after a successful iOS 26.7.1 connection. That connection issue is resolved in the latest check. Earlier observations remain in the device receipt's history. Update the app to build 5 before native production QA.

Core QA contains build 5 but has zero testers. The owner's external TestFlight installation was build 4. Build 5 has now been added to the existing two-person Maggie & Erik group; its Beta Review flow completed and Apple shows **Testing**. Automatic tester notification is enabled. See [external availability](testflight-external-release.json) and [device access](device-access.json). Build 5 remains selected in the App Store version; final App Store Review has not been submitted.

For agent-operated UI, the owner must finish iPhone Mirroring setup with the same Apple Account on Mac and iPhone, then leave the iPhone locked nearby. Alternatively, the owner can update build 5 in TestFlight and perform the checks below directly, with USB screen capture available for scoped verification. A signed XCTest runner is not available on this Mac: the local code-signing identity query reports zero valid identities. USB pairing and Developer Mode alone are not evidence that any of these tests passed. No global Mac account setting was changed.

Use the actual build-5 TestFlight installation for the following checks. Keep reviewer credentials in App Store Connect and their restricted local file. For permanent deletion, use a newly created QA app account so the dedicated reviewer account remains available.

| Step | Expected result | Result |
| --- | --- | --- |
| Confirm TestFlight shows 1.0.0 (5), then open the App | Local features open without sign-in | Pending |
| Open 會員中心 and choose 使用 Apple 繼續; cancel once | Apple system sheet opens and cancellation returns to the usable sign-in form | Pending |
| Sign in with Apple and choose 隱藏我的電子郵件 | App returns to 會員中心 and shows the signed-in account; record that a private relay address is used without publishing the address | Pending |
| Add a small local QA entry, choose 以這台裝置更新雲端, then download | Upload and confirmed download complete successfully | Pending |
| Sign out, restart the App and sign in with Apple again | Authentication completes; local records remain | Pending |
| In 帳號管理 choose 永久刪除帳號 and confirm | App returns to signed-out state; the QA Clerk user and Neon snapshot are deleted, local records remain | Pending |
| Check Apple authorization after deletion | Server returns `appleAuthorization: revoked`; independently verify the App authorization is revoked. A `manual_required` alert is evidence that automatic revocation has not passed | Pending |

The production Clerk key was retrieved from the intended production instance and validated against the dedicated reviewer account. The production Neon credential was retrieved from project `frosty-shape-90805190`, branch `br-shy-violet-b38lzywc`, database `lad_app`, role `lad_app_owner`, and passed a read-only connection check. These values and the existing Apple private key are stored only in the restricted, gitignored `credentials/production-preflight.json` (0600). The full submission preflight now reports **one remaining issue: native Apple QA**. See [preflight receipt](submission-preflight.json).

Once actual results are available, record the device, iOS version, build number and outcomes here. Confirm backend deletion without saving tokens, relay addresses or other secrets in artifacts. Set `CLERK_APPLE_OAUTH_CONFIGURED=true` only after the required native checks pass; complete the production submission preflight using the actual server values in the restricted JSON file, then use the already-authorized App Store Connect submission flow. Follow the review result and release the approved version, confirming public App Store availability.
