# One-Shot Build Prompt — 深空省省 v2 (Expo + Supabase + Cloudflare Worker)

> Paste this whole file as the opening message to Claude Code in an empty repository.
> It covers Phase 0 through Phase 2. Stop and report at each phase gate.

---

## Mission

Rebuild an existing single-page PWA (a gacha planning and spend-budgeting tool for the
mobile game *Love and Deepspace* / 《戀與深空》, Traditional Chinese, Taiwan audience) as a
universal Expo app targeting **web first, then Android, then iOS**, backed by Supabase,
and add a shareable "plan object" that drives growth through off-platform sharing.

The existing app is live at `https://lad-app.vercel.app/`. Fetch it and read its DOM to
recover exact labels, categories, pool types, and calculation semantics before writing
code. Preserve its Traditional Chinese copy verbatim wherever a feature is unchanged —
the wording is already tuned for this audience.

The product's moat is the **structured plan object**, not the community, not the schedule
data, and not calculation precision. Every implementation decision should make that
object more usable, more trustworthy, and more worth posting publicly.

---

## Non-negotiable constraints

Violating any of these is a build failure, not a style disagreement.

### IP and asset rules

1. **Zero game art.** No character portraits, no card art, no game UI screenshots, no
   logos — not in the app, not in `assets/`, not in store listings. Characters appear as
   plain text names only. Write this rule into `CLAUDE.md` so it survives later sessions.
2. **The tool is the subject, the game is the object.** All user-facing copy uses the
   shape "抽卡課金規劃工具，支援《戀與深空》" — never "《戀與深空》抽卡工具".
3. Keep the app name 深空省省. Do not introduce the game's trademark into the app name,
   package identifier, or bundle identifier.
4. `banners` carries a `game_id` column from day one. Populate every row with the same
   value. This is a cheap option on repositioning later, not a multi-game feature now.

### Auth and privacy rules

5. **Anonymous-first.** Call `signInAnonymously()` silently on first launch. No login UI
   appears until the user tries to publish a plan or sync across devices. There is no
   separate code path for anonymous vs. registered users — both go through RLS with a real
   `auth.uid()`.
6. **Never let `anon` select `plans` directly.** Public pages read the `public_plans` view
   only. RLS is row-level, not column-level; the view is what protects `budget_twd` and
   `owner_id`.
7. `show_amount` defaults to `false` and is independent of `is_public`. Publishing a plan
   never publishes money.
8. No ad SDKs, no analytics that track across apps, no ATT prompt. Keep the privacy policy
   short enough to fit on one screen.
9. Anonymous session loss is unrecoverable. Surface it honestly in Settings
   ("未備份 · 資料只存在這台裝置"), do not hide it.

### Product rules

10. No streak rewards, no missed-day penalties. Display the streak count as information.
    Gamifying it contradicts the product's purpose, which is to help players *control*
    spending.
11. No in-app feed, no follow graph, no comments, no gacha-result uploads. If a task seems
    to require these, stop and ask.

---

## Stack (pinned — do not substitute)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Expo SDK (latest stable) + Expo Router | file-based routing, `app/` directory |
| Web output | `web.output: "static"`, `web.bundler: "metro"` | static export, no SSR |
| Styling | `StyleSheet.create` | **no NativeWind, no Tamagui** — smaller web bundle, narrower dependency surface |
| Language | TypeScript, strict mode | `experiments.typedRoutes: true` |
| Backend | Supabase (Postgres + Auth + RLS) | `@supabase/supabase-js` |
| Share layer | Cloudflare Worker + KV + R2 | OG meta injection and card rendering |
| Card rendering | `satori` + `@resvg/resvg-wasm` in the Worker | outputs PNG to R2 |
| Native builds | EAS Build | Phase 3, Android only |

Before you start, run `npx create-expo-app@latest` with the tabs template and check the
actual SDK version and Expo Router API surface in `node_modules`. Do not write code from
memory of an older SDK. If any API in this prompt has moved, follow the installed version
and note the deviation in your report.

---

## Repository layout

```
.
├── app/                          # Expo Router
│   ├── _layout.tsx               # root: session bootstrap, theme, fonts
│   ├── (tabs)/
│   │   ├── _layout.tsx           # bottom tabs: 規劃 / 排期 / 錢包
│   │   ├── index.tsx             # 我的規劃 + 每日打卡 (Journey B)
│   │   ├── schedule.tsx          # 排期
│   │   └── wallet.tsx            # 錢包
│   ├── plan/
│   │   ├── new.tsx               # 抽卡目標換算 → 儲存成規劃
│   │   └── [id].tsx              # edit an owned plan
│   ├── p/
│   │   └── [shortId].tsx         # PUBLIC plan page (Journey A)
│   ├── explore.tsx               # 熱門規劃牆
│   ├── about.tsx                 # 免責聲明 + 隱私政策
│   ├── settings.tsx
│   └── admin/
│       └── banners.tsx           # allowlist-gated schedule CRUD
├── src/
│   ├── lib/
│   │   ├── supabase.ts           # client + anonymous bootstrap
│   │   ├── session.ts            # anon → upgrade flow
│   │   └── migrate-local.ts      # one-time localStorage → Supabase
│   ├── domain/
│   │   ├── config.ts             # DIAMONDS_PER_PULL etc. — see below
│   │   ├── pulls.ts              # target → diamond gap
│   │   ├── packages.ts           # cheapest cumulative tier
│   │   ├── pace.ts               # daily rate → projected完成日
│   │   └── __tests__/
│   ├── components/
│   └── theme/
│       └── tokens.ts             # colors, type scale, spacing
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql
│       ├── 0002_rls.sql
│       ├── 0003_public_view.sql
│       └── 0004_seed_banners.sql
├── workers/
│   └── share/                    # Cloudflare Worker (separate wrangler project)
│       ├── src/index.ts
│       ├── src/card.tsx          # satori template
│       └── wrangler.toml
├── CLAUDE.md
└── README.md
```

---

## Domain logic — recover it, don't invent it

The gacha math is the one part you must not guess. Fetch the live app and read its
JavaScript to extract:

- diamonds per pull
- gold-ticket → pull conversion, and the "官方金券（自動換算）" rule
- the package tier ladder (price, diamonds, and whether tiers are cumulative)
- how "預留資源（抽）" is subtracted
- what "還差幾鑽", "換算需課金幾抽", "目標後剩餘鑽" each compute

Put every constant in `src/domain/config.ts` as a named export with a comment citing where
you recovered it. **If you cannot recover a value with confidence, stop and ask rather than
substituting a plausible number** — a wrong constant here silently produces wrong spending
advice, which is the worst possible failure for this product.

Write unit tests for `pulls.ts` and `packages.ts` that reproduce at least three worked
examples taken from the live app's own output.

---

## Phase 0 — Expo skeleton and feature parity (gate 1)

Goal: everything the current PWA does, running on Expo web, behaving identically. **No new
features.**

- Scaffold the Expo app with the layout above.
- Apply migrations `0001`–`0003`. Schema and RLS are specified in the accompanying PRD —
  reproduce them exactly, including the `public_plans` view with `security_invoker = true`.
- Supabase client with silent anonymous sign-in in `app/_layout.tsx`.
- Port the three tabs. Bottom tab labels: 規劃 / 排期 / 錢包.
- Port budget setting, expense entry (categories: 抽卡禮包 / 月卡週卡 / 密約 / 周邊 / 其他),
  monthly detail list, expense edit and delete.
- Port the target converter and package calculator, including the "帶入錢包記帳" action —
  this single button is the product's most important interaction; do not drop it.
- Schedule tab reads from a local seed for now (Phase 1 moves it to Supabase).
- `src/lib/migrate-local.ts`: on first run, detect the old PWA's `localStorage` keys,
  import them into Supabase, then write a completion marker. Idempotent.

**Gate 1 acceptance** — verify by clicking, not by reading code:

- [ ] Complete 設預算 → 記一筆花費 → 換算一次目標 → 看禮包建議 → 帶入錢包 on web
- [ ] Hard refresh: all data still present
- [ ] Clear `localStorage`, reload: data comes back from Supabase
- [ ] `pnpm test` passes; converter output matches the live app on three worked examples
- [ ] `npx expo export -p web` succeeds and the export serves correctly

Report and wait.

---

## Phase 1 — Schedule to the database, plus daily check-in (gate 2)

- Move all banner data into Supabase (`0004_seed_banners.sql`). Every row needs a stable
  slug id of the form `YYYY-MM-DD-<character-slug>-<pool_type>`, a `status` of
  `official` | `predicted` | `rumored`, and a `source_url` for anything marked `official`.
  Preserve the live app's distinction between confirmed and predicted entries — the current
  disclaimer text tells you which is which.
- Schedule tab reads Supabase. **Generate the disclaimer from data**, not from a hardcoded
  string: compose it from the status distribution of the visible month, and render a
  tappable source link on each `official` banner.
- `/admin/banners`: single-route CRUD gated by the `admin_users` table. Non-allowlisted
  users get a 404, not a permission error. Setting `status` to `official` requires
  `source_url`. Auto-generate the id from date + character + pool type, but allow manual
  override, because the id is part of a permanent public URL.
- Daily check-in (`checkins` table, unique on `owner_id, checkin_date`): amount input with
  quick-pick chips, progress bar update, and the projection line
  「還差 N 鑽 · 照這個速度還要 X 天 · 卡池還有 Y 天」.
- When the projection says the target is unreachable in time, show one calm line offering
  the cheapest package tier that closes the gap, linking to the calculator with values
  prefilled. One line, no urgency language, no red.
- A Postgres trigger or Edge Function that, when a banner's date changes or its status
  moves `predicted` → `official`, flags every plan referencing it as needing recalculation.

**Gate 2 acceptance:**

- [ ] Change a banner in `/admin/banners` from `predicted` to `official` with a new date —
      the schedule tab reflects it within 30 seconds and the source link is tappable
- [ ] Non-allowlisted account gets 404 at `/admin/banners`
- [ ] Three consecutive check-ins produce a correct progress bar and projection
- [ ] Disclaimer text changes when banner statuses change

Report and wait.

---

## Phase 2 — Plan object and the sharing engine (gate 3)

### App side

- `plans` CRUD. The converter screen gains 「儲存成規劃」; auto-generate a default title
  like 「沈星回生日池 80 抽計畫」 from the selected banner and target.
- Two independent switches on each plan: 公開這份規劃 (`is_public`) and
  顯示預算金額 (`show_amount`). Copy must make clear that publishing does not publish money.
- Store the calculation snapshot into `plans.computed` (jsonb) on every save, so the public
  page never recomputes on read.
- `app/p/[shortId].tsx` — the public plan page:
  - **No login wall, no modal, no app-download prompt.**
  - Renders progress bar, target banner and dates, gap, reserved pulls, and (only if
    `show_amount`) budget.
  - Handles an ended or cancelled banner gracefully — the page must still be meaningful
    three months later.
  - One primary action: 「用這個規劃當範本」 → silently creates an anonymous session if
    needed, clones the plan as the visitor's draft, and lands them in the converter with
    fields prefilled. **Not** "註冊", **not** "下載 App".
- `app/explore.tsx` — 熱門規劃牆, public plans ordered by `view_count`. See the open
  question about ranking below.
- Account upgrade flow (`src/lib/session.ts`): Google, Apple, and email magic link.
  Use `updateUser` / `linkIdentity` so `user.id` is preserved and existing rows carry over.
  - On identity collision with an existing account: show an explicit choice. Sign into the
    existing account (after showing exactly what will be lost) or use another provider.
    **Never silently merge.**
  - Upgrade prompts appear only on: publish, cross-device sync request, and once at a
    7-day check-in streak (dismissible, never shown again).

### Worker side (`workers/share`)

Expo's static export renders routes at build time, so it cannot produce per-plan
`og:image` and `og:title`. A Cloudflare Worker fronts `/p/*` and `/og/*`:

- `GET /p/:shortId` — read `public_plans` via the anon key, cache in KV for 300s.
  - Crawler user agents (facebookexternalhit, Twitterbot, threadsbot, Discordbot, Slackbot,
    WhatsApp, LinkedInBot, TelegramBot, bingbot, Googlebot, xiaohongshu, Line) get a
    meta-only HTML document.
  - Humans get the Expo static shell with meta tags injected at a `<!--META-->` placeholder;
    the client then fetches full data.
  - Unknown `shortId` → a real 404 page, not a redirect to home.
- `GET /og/:shortId.png` — render with satori + resvg, write to R2, serve from R2 on
  subsequent hits. Cache key is `shortId + updated_at`, so a plan edit invalidates
  naturally with no manual purge.
- Card spec: 1200×630 (also emit 1080×1080 for Instagram). Hero element is the diamond
  savings progress bar plus 「距離目標還差 N 天」. Secondary: banner name and date, target
  pulls, reserved pulls. Bottom-right: 深空省省 · 你的抽卡規劃 and the short URL.
  **Never render NT$ amounts, player UID, or any game art.**
- Admin saves in Phase 1 should purge the relevant KV entries.

**Gate 3 acceptance:**

- [ ] Paste a plan URL into Threads and into Discord — both expand with the correct card
      and title
- [ ] Open the same URL in a private window: full page renders, no login prompt, and
      「用這個規劃當範本」 lands in a prefilled converter without registration
- [ ] Edit one number in the plan; the next share shows a regenerated card
- [ ] A plan with `show_amount = false` returns `budget_twd: null` when queried as `anon`
      — verify with a raw request, not through the UI
- [ ] `/p/nonexistent` returns 404

---

## Conventions

- Traditional Chinese (Taiwan) for all UI copy. English for code, identifiers, comments,
  commit messages, and file names.
- Sentence case, active voice, no filler. A button says what happens: 「儲存成規劃」, not
  「送出」. The same action keeps the same verb across the whole flow.
- Empty states are invitations to act, not mood pieces. Errors say what happened and what
  to do, and never apologize.
- Accessibility floor, unannounced: responsive to 360px, visible keyboard focus,
  `prefers-reduced-motion` respected, minimum 44×44 touch targets.
- Every API-touching module handles the offline case. This app gets used on trains.
- Secrets in `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) and in
  wrangler secrets for the Worker. The service-role key never appears in client code.

---

## Stop and ask

Do not resolve these yourself:

1. Any domain constant you cannot recover from the live app with confidence.
2. Whether `/explore` should down-weight high-budget plans. Ranking purely by `view_count`
   may float the biggest spenders to the top and turn the wall into a spending contest.
   This is an ethical stance, not an algorithm choice.
3. Anything that would require a feed, follows, comments, or user-uploaded screenshots.
4. Any request to add game artwork, however small.

---

## Definition of done for this prompt

Three phase gates passed with their checklists verified by actual interaction, plus:

- `CLAUDE.md` written, containing the IP rules, the anon-first auth invariant, the
  `public_plans` view invariant, and the recovered domain constants with their sources.
- `README.md` with local setup, migration commands, and Worker deployment steps.
- `supabase/migrations/` applies cleanly to a fresh project.
- `npx expo export -p web` produces a working static build.
- Unit tests cover the gacha math with worked examples from the live app.
