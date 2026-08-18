# 2026 GitHub Agent Skills 深度篩選：Web App → 社群 → iOS / Android

截至 **2026 年 8 月 13 日**，Agent Skills 生態已經從單純的 Claude Code prompts，演變成一套跨 Codex、Claude Code、Cursor、GitHub Copilot、OpenCode 等 coding agents 的可攜式開發規範。`agentskills/agentskills` 已將其定義成開放格式，核心就是 `SKILL.md + scripts + references + assets`，讓 agent 按需求載入專門能力。([GitHub][1])

對你的情境，**不應直接依 GitHub Stars 排名安裝**。你的產品會經歷：

**Web 工具 → 使用者帳號 / DB → 社群 → Realtime → Production → iOS / Android → 付費 / 訂閱**

所以真正有價值的是建立一套涵蓋整個產品生命週期的 Skill Stack。

## 第一層：目前最值得關注的 GitHub Agent Skills Repositories

| 排名 | GitHub Repo                                                                         |              GitHub 熱度 | 主要能力                                                                                   |                對你的適配度 | 判定               |
| -- | ----------------------------------------------------------------------------------- | ---------------------: | -------------------------------------------------------------------------------------- | --------------------: | ---------------- |
| 1  | [obra/superpowers](https://github.com/obra/superpowers)                             |       約 **255k Stars** | Brainstorming、planning、TDD、debugging、subagent workflow、code review                     |                 10/10 | **P0**           |
| 2  | [anthropics/skills](https://github.com/anthropics/skills)                           |             超大型官方 repo | Anthropic 官方 Agent Skills reference implementation、frontend、testing、MCP、skill creation |                  8/10 | P1               |
| 3  | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)               |                     極高 | Spec → Plan → Build → Test → Review → Security → Ship 完整 SDLC                          |                 10/10 | **P0**           |
| 4  | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)             |        大型官方 collection | React、Next.js、React Native、Web UI、UX、performance                                       |                 10/10 | **P0**           |
| 5  | [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) |        **28.2k Stars** | 精選 1000+ Skills，涵蓋 Vercel、Expo、Stripe、Cloudflare、Sentry 等                              |                  9/10 | **P0 Discovery** |
| 6  | [openai/plugins](https://github.com/openai/plugins)                                 |              OpenAI 官方 | Codex 新版 plugin / skills 架構；Web、Expo、Figma、Supabase、Stripe 等                           |                 10/10 | **P0，Codex 用戶**  |
| 7  | [openai/skills](https://github.com/openai/skills)                                   |        **24.3k Stars** | Codex 舊版 Skills Catalog、skill-creator                                                  |                  6/10 | 僅參考              |
| 8  | [github/awesome-copilot](https://github.com/github/awesome-copilot)                 | GitHub 官方大型 collection | Playwright、security review、Postgres、web testing、code review                            |                  9/10 | **P0/P1**        |
| 9  | [android/skills](https://github.com/android/skills)                                 |         **5.5k Stars** | Google Android 官方 Compose、Navigation、testing、Play、profiling                            |                  7/10 | P2               |
| 10 | [trailofbits/skills](https://github.com/trailofbits/skills)                         |                  約 5k+ | Security audit、GitHub Actions security、insecure defaults、Semgrep 等                     |                  9/10 | **P1**           |
| 11 | [expo/skills](https://github.com/expo/skills)                                       |                  約 2k+ | Expo、React Native、Web → Native、Router、EAS、Native UI                                    |             **10/10** | **P0/P1**        |
| 12 | [supabase/agent-skills](https://github.com/supabase/agent-skills)                   |         **2.2k Stars** | Auth、DB、RLS、Realtime、Storage、Postgres、migration                                        | **10/10** 若用 Supabase | **P0**           |
| 13 | [cloudflare/skills](https://github.com/cloudflare/skills)                           |         **1.6k Stars** | Workers、Durable Objects、Realtime、WebSockets、web performance                            |                  8/10 | P1/P2            |
| 14 | [stripe/ai](https://github.com/stripe/ai)                                           |                     官方 | Checkout、Billing、Subscription、Connect、Tax、Webhooks、安全                                  |                  8/10 | P2               |
| 15 | [getsentry/sentry-for-ai](https://github.com/getsentry/sentry-for-ai)               |                     官方 | Production monitoring、error debugging、tracing、replay、alerts                            |                  9/10 | **P1**           |

Superpowers 已經發展成完整的 agentic software-development methodology，支援多種 coding agents；其 GitHub 頁面近期約 255k Stars。([GitHub][2]) Anthropic 的 `skills` 則更適合當「官方 Skill 設計範本」而不是整包塞進產品 repo。([GitHub][3])

Addy Osmani 的 collection 特別適合 AI-heavy development，因為它直接把工程流程編碼成 DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP，而不是單純提供 framework knowledge。([GitHub][4])

VoltAgent 的 collection 已整理超過 1000 個 skills，來源包括 Anthropic、Vercel、Stripe、Cloudflare、Sentry、Expo、Trail of Bits 等，而且明確排除大量 AI 自動生成的低品質 skill；但作者也特別聲明 collection 本身**沒有替每個 skill 做 security audit**。([GitHub][5])

另外，現在不要再把 `openai/skills` 當 Codex 的主要官方入口。該 repository 已經標示 deprecated，OpenAI 現在將新版範例放到 [`openai/plugins`](https://github.com/openai/plugins)，其中甚至已經有 `build-web-apps`、`expo`、`figma` 等專門 plugin。([GitHub][6])

---

# 第二層：我會實際裝進你這個專案的 Skills

這張表比單純的 GitHub Stars 排名重要。

| 優先度 | Skill                                                                                                                          | 來源            | 解決什麼問題                                       | 為什麼適合你的 App                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ------------- | -------------------------------------------- | ------------------------------ |
| P0  | [spec-driven-development](https://github.com/addyosmani/agent-skills/tree/main/skills/spec-driven-development)                 | Addy Osmani   | Feature 開始前先產生 spec、acceptance criteria      | 防止 Agent 自己腦補產品需求              |
| P0  | [planning-and-task-breakdown](https://github.com/addyosmani/agent-skills/tree/main/skills/planning-and-task-breakdown)         | Addy Osmani   | Spec → 小型可驗證 tasks                           | 特別適合長時間 Agentic Coding         |
| P0  | [incremental-implementation](https://github.com/addyosmani/agent-skills/tree/main/skills/incremental-implementation)           | Addy Osmani   | Thin vertical slices                         | 避免 Agent 一次改十幾個系統              |
| P0  | [test-driven-development](https://github.com/addyosmani/agent-skills/tree/main/skills/test-driven-development)                 | Addy Osmani   | Red → Green → Refactor                       | 降低 AI 改壞舊功能                    |
| P0  | [vercel-react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)               | Vercel        | React / Next.js performance                  | Web App 若採 React 系最值得裝         |
| P0  | [web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)                    | Vercel        | Accessibility、UX、forms、animation、performance | Agent 寫 UI 時非常實用               |
| P0  | [webapp-testing](https://github.com/github/awesome-copilot/tree/main/skills/webapp-testing)                                    | GitHub        | Playwright 瀏覽器測試                             | 真正操作 App，而不是只看程式碼              |
| P0  | [security-review](https://github.com/github/awesome-copilot/tree/main/skills/security-review)                                  | GitHub        | XSS、SQLi、Auth、secrets、dependencies           | 社群與登入功能上線前必要                   |
| P0* | [supabase](https://github.com/supabase/agent-skills/tree/main/skills/supabase)                                                 | Supabase      | DB、Auth、Realtime、Storage、RLS                 | 若 backend 用 Supabase，直接列必裝     |
| P0* | [supabase-postgres-best-practices](https://github.com/supabase/agent-skills/tree/main/skills/supabase-postgres-best-practices) | Supabase      | Schema、index、query、RLS、pooling               | 防止 Agent 寫出能跑但不 scalable 的 DB  |
| P1  | [security-and-hardening](https://github.com/addyosmani/agent-skills/tree/main/skills/security-and-hardening)                   | Addy Osmani   | OWASP / least privilege / validation         | Feature 開發完成後的第二道安全檢查          |
| P1  | [Trail of Bits Skills](https://github.com/trailofbits/skills)                                                                  | Trail of Bits | Deep security audit                          | Production 前做更強的 security gate |
| P1  | [sentry-instrument](https://github.com/getsentry/sentry-for-ai)                                                                | Sentry        | Error、trace、logs、metrics、replay              | 上 Production 後讓 Agent 能看到真實問題  |
| P1  | [sentry-debug-issue](https://github.com/getsentry/sentry-for-ai)                                                               | Sentry        | 從 production error 找原因並修復                    | 很適合 Agent 自動 debugging         |
| P1  | [expo-web-to-native](https://github.com/expo/skills)                                                                           | Expo          | 現有 React Web → iOS / Android                 | **與你的 roadmap 高度吻合**           |
| P1  | [expo-router](https://github.com/expo/skills)                                                                                  | Expo          | Native routing/navigation                    | App 化時必要                       |
| P1  | [expo-native-ui](https://github.com/expo/skills)                                                                               | Expo          | Native-feeling UI                            | 避免只是「網站包成 App」                 |
| P1  | [expo-data-fetching](https://github.com/expo/skills)                                                                           | Expo          | React Query、SWR、cache、offline                | Mobile network condition 很重要   |
| P1  | [eas-app-stores](https://github.com/expo/skills)                                                                               | Expo          | App Store / Google Play                      | 發布 native app                  |
| P1  | [eas-workflows](https://github.com/expo/skills)                                                                                | Expo          | Mobile CI/CD                                 | Build / release automation     |
| P2  | [durable-objects](https://github.com/cloudflare/skills)                                                                        | Cloudflare    | Realtime state、WebSocket、rooms               | 未來社群、presence、chat 很有價值        |
| P2  | [web-perf](https://github.com/cloudflare/skills)                                                                               | Cloudflare    | Core Web Vitals                              | Web 流量起來後使用                    |
| P2  | [stripe-best-practices](https://github.com/stripe/ai/tree/main/skills/stripe-best-practices)                                   | Stripe        | Payments / subscriptions                     | 未來做 Pro / Premium tier         |
| P2  | [android/skills](https://github.com/android/skills)                                                                            | Android       | 原生 Android implementation                    | Expo 不夠、開始寫 Kotlin 時才需要        |

Addy 官方自己其實就建議最小配置從 `spec-driven-development + test-driven-development + code-review-and-quality` 開始，而不是一次塞入全部 skills。([GitHub][7])

`spec-driven-development` 對 Agentic Coding 尤其重要：它明確要求在重大 feature、跨 module 變更、architecture decision 前先定義 spec 與可測試 success criteria。([GitHub][8])

Vercel 的 React Skill 現在包含 **70 條、8 大類** performance rules，涵蓋 waterfalls、bundle size、server rendering、client fetching、rerender、rendering 與 JavaScript performance。([GitHub][9]) `web-design-guidelines` 則包含超過 100 條 accessibility、UX 與 performance 規則。([GitHub][10])

GitHub 自己的 `webapp-testing` 能透過 Playwright 實際開 Browser、click、fill form、讀 console、截圖、驗證 responsive behavior；這比要求 Agent「看一下這段 React code 有沒有 bug」可靠很多。([GitHub][11])

---

# 第三層：Expo 是你這個專案特別值得提前導入的 Skill

即使目前只有 Web App，我仍然會現在就把 [`expo/skills`](https://github.com/expo/skills) 納入專案的 Skills registry。

原因不是現在就改用 Expo，而是 Expo 官方已經特別做了一個：

**`expo-web-to-native`**

它的使用情境就是：

> 現有 Next.js / Vite / CRA / React Web application → native iOS / Android Expo app。

官方 collection 同時提供 `expo-dom`，可以讓部分既有 Web code 漸進式存在 native app 裡，而不是所有東西一次重寫。([GitHub][12])

Expo 官方目前還提供 Router、Native UI、data fetching、Tailwind、native modules、dev client、SDK upgrades，以及 EAS App Store / hosting / workflows / simulator 等 Skills。([GitHub][12])

這意味著你的 architecture 應該從一開始就思考：

```text
packages/
  core/
  api-client/
  game-domain/
  validation/
  types/

apps/
  web/
  mobile/
```

而不是：

```text
web-app/
  everything-is-coupled-to-nextjs/
```

這不是要求現在就做 monorepo，而是要讓 **game logic、domain model、API client、validation、types 不與 DOM / Next.js 強耦合**。這會直接決定未來 Web → Native 是 migration 還是 rewrite。Expo 的 Web-to-Native Skill 本質上就是在處理這個問題。([GitHub][12])

---

# 第四層：如果未來會變成「遊戲社群」，Supabase Skills 的價值會快速上升

如果後續加入：

```text
User
Profile
Game account
Build / Loadout
Like
Comment
Follow
Favorite
Post
Notification
Chat
Presence
Leaderboard
Report
Block
```

Agent 面對的問題會從「寫 UI」轉成：

```text
Auth
Authorization
RLS
DB schema
indexes
fan-out
pagination
realtime
moderation
multi-tenant data access
```

Supabase 官方 Skill 已經覆蓋 Database、Auth、Realtime、Storage、Vectors、Edge Functions、Cron、Queues、schema migration、RLS 與 security audit。([GitHub][13])

其中 `supabase-postgres-best-practices` 將 rules 分成八大類，包括 Query Performance、Connection Management、Schema Design、Concurrency、Security/RLS、Data Access、Monitoring 等。([GitHub][13])

尤其社群 App 最容易犯的就是：

```text
SELECT * FROM posts WHERE user_id = ...
```

只在 Application Layer 做 authorization。

Supabase Skill 明確要求 multi-user data 用 database-level RLS 做隔離。([GitHub][14])

---

# 第五層：Realtime 社群不一定全部丟給 Supabase

如果未來出現：

* 即時聊天室
* Guild / Party room
* Live presence
* 即時遊戲活動
* synchronized room state
* notification fan-out
* WebSockets
* collaborative features

[`cloudflare/skills`](https://github.com/cloudflare/skills) 裡的 **Durable Objects** Skill 很值得加入。

Cloudflare 官方直接把 Durable Objects 使用案例定義為：

**chat rooms、games、booking、stateful coordination、WebSockets。** ([GitHub][15])

因此比較合理的未來 architecture 可能變成：

```text
Supabase
├── Users
├── Auth
├── Profiles
├── Posts
├── Comments
├── Likes
└── Persistent relational data

Cloudflare
├── Edge API
├── Cache
├── Realtime room state
├── Presence
├── WebSocket
└── High-frequency transient state
```

Cloudflare 自己的 Skill decision tree 也把「stateful coordination / realtime」直接導向 Durable Objects。([GitHub][16])

---

# 第六層：我認為最被低估的是 Sentry Skills

Agentic Coding 最大的盲點之一是：

> Agent 可以看 source code，但不知道 production 到底發生什麼事情。

[`getsentry/sentry-for-ai`](https://github.com/getsentry/sentry-for-ai) 解決的就是這件事。

它目前有：

| Skill                                                                    | 功能                                                   |
| ------------------------------------------------------------------------ | ---------------------------------------------------- |
| [sentry-instrument](https://github.com/getsentry/sentry-for-ai)          | Errors、tracing、logs、metrics、profiling、session replay |
| [sentry-debug-issue](https://github.com/getsentry/sentry-for-ai)         | 從 production issue 找 root cause                      |
| [sentry-sdk-upgrade](https://github.com/getsentry/sentry-for-ai)         | SDK migration                                        |
| [sentry-setup-ai-monitoring](https://github.com/getsentry/sentry-for-ai) | AI / LLM monitoring                                  |

Sentry 官方現在支援 Claude Code、Cursor、Codex、Grok，並把 production issue retrieval → root cause → fix 納入 Agent workflow。([GitHub][17])

這會形成一個非常重要的 loop：

```text
Develop
   ↓
Test
   ↓
Deploy
   ↓
Real users
   ↓
Sentry
   ↓
Agent reads issue
   ↓
Reproduce
   ↓
Fix
   ↓
Regression test
```

這比單純增加另一個「React Expert Skill」有價值得多。

---

# 第七層：Security Skills 要當 Gate，而不是偶爾叫 Agent 看一下

[`github/awesome-copilot/security-review`](https://github.com/github/awesome-copilot/tree/main/skills/security-review) 會處理：

* SQL injection
* XSS
* Command injection
* authentication
* authorization
* IDOR / BOLA
* hardcoded secrets
* API keys
* dependency vulnerabilities
* cryptography
* business logic

而且會跨 file 追 data flow，不只是 regex scanner。([GitHub][18])

再加上 [`trailofbits/skills`](https://github.com/trailofbits/skills)，可以針對 GitHub Actions、insecure defaults、security diff、Semgrep 等做更進階 audit。([GitHub][19])

所以 Production pipeline 比較合理的是：

```text
PR
 ↓
TDD
 ↓
Playwright
 ↓
Code Review Skill
 ↓
Security Review Skill
 ↓
Trail of Bits Audit（重大 feature）
 ↓
Deploy
 ↓
Sentry
```

---

# 最重要的洞察：不要安裝 1000 個 Skills

這是目前 Agent Skills 生態很容易踩的坑。

Skill 雖然採 progressive disclosure，但每個 Skill 的 **metadata / description 仍必須先讓 Agent 看見**，它才知道什麼時候 trigger。

Supabase 的 Skill authoring guide甚至明確指出：

```text
Level 1  Metadata        ~100 tokens
Level 2  SKILL.md        <5k tokens recommended
Level 3  References      on demand
```

並要求作者對每一段內容思考：「它是否值得消耗 context token？」([GitHub][20])

所以：

```text
1000 Skills
× metadata
× overlapping triggers
× similar descriptions
```

最終會產生兩個問題：

**Context pollution**

以及：

**Skill selection ambiguity**

因此 `VoltAgent/awesome-agent-skills` 的正確用途是：

**Skill 搜尋引擎 / curated index**

而不是：

**install all**。([GitHub][5])

---

# 我會給這個專案的最終 Skill Architecture

```text
.agent-skills/

CORE ENGINEERING
├── spec-driven-development
├── planning-and-task-breakdown
├── incremental-implementation
├── test-driven-development
├── debugging-and-error-recovery
├── code-review-and-quality
└── security-and-hardening

WEB
├── vercel-react-best-practices
├── web-design-guidelines
├── webapp-testing
└── web-perf

DATABASE
├── supabase
└── supabase-postgres-best-practices

SECURITY
├── security-review
└── selected Trail of Bits skills

OBSERVABILITY
├── sentry-instrument
└── sentry-debug-issue

MOBILE — inactive until needed
├── expo-web-to-native
├── expo-router
├── expo-native-ui
├── expo-data-fetching
├── eas-app-stores
└── eas-workflows

REALTIME — inactive until needed
└── cloudflare durable-objects

MONETIZATION — inactive until needed
└── stripe-best-practices

PROJECT-SPECIFIC
├── game-domain
├── game-data-validation
├── community-data-model
├── moderation-rules
├── analytics-events
└── release-gates
```

其中前 **10–15 個才應該是 Active Skills**。

其餘放在 repository 裡，需要時才啟用。

---

## 最後一個真正重要的方向：開始建立自己的 Skills

公開 GitHub Skills 解決的是：

> 「React 應該怎麼寫？」

但幾個月後真正拖慢 Agent 的通常是：

> 「我們這個產品到底應該怎麼寫？」

例如你的 Agent 未來應該知道：

```text
什麼是這款遊戲的 Item
什麼是 Build
什麼是角色
什麼欄位是 authoritative
Game API 如何 cache
資料多久 refresh
使用者可以編輯哪些資料
Community Post schema
Moderation policy
Analytics event naming
Web / Mobile shared domain rules
哪些 migration 不允許自動做
Production DB 哪些 action 禁止 Agent 執行
```

這些資訊 GitHub 永遠不會有。

OpenAI 的 `skill-creator` 將 Skill 定義成「讓通用 Agent 取得特定 domain procedural knowledge」的模組，而這正是 project-specific skills 最有價值的地方。([GitHub][21])

因此你的最佳配置不是：

**找 100 個最熱門 Skill。**

而是：

**10–15 個高品質官方 / 社群 Skills + 5–10 個屬於你產品自己的 Project Skills。**

對這個 Web Game Tool 專案，我會把優先順序定成：

**`Addy Osmani engineering lifecycle → Vercel React → Playwright → Security → Supabase → Sentry → Expo → Cloudflare Realtime → Stripe`**

其中最值得現在就進 repo 的是 **Addy Osmani、Vercel、Playwright/Security、Supabase（若採用）**；Expo 現在先納入 registry，不需要立即讓它介入 Web 開發。這個組合比單純安裝 GitHub 上 Star 數最高的 Skills 更適合你未來從單純遊戲工具一路演化成跨平台社群產品。([GitHub][7])

[1]: https://github.com/agentskills/agentskills?utm_source=chatgpt.com "GitHub - agentskills/agentskills: Specification and documentation for Agent Skills · GitHub"
[2]: https://github.com/obra/superpowers?utm_source=chatgpt.com "GitHub - obra/superpowers: An agentic skills framework & software development methodology that works. · GitHub"
[3]: https://github.com/anthropics/skills?utm_source=chatgpt.com "GitHub - anthropics/skills: Public repository for Agent Skills · GitHub"
[4]: https://github.com/addyosmani//agent-skills?utm_source=chatgpt.com "GitHub - addyosmani/agent-skills: Production-grade engineering skills for AI coding agents. · GitHub"
[5]: https://github.com/VoltAgent/awesome-agent-skills?utm_source=chatgpt.com "GitHub - VoltAgent/awesome-agent-skills: A curated collection of 1000+ agent skills from official dev teams and the community, compatible with Claude Code, Codex, Gemini CLI, Cursor, and more. · GitHub"
[6]: https://github.com/openai/skills?utm_source=chatgpt.com "GitHub - openai/skills: Skills Catalog for Codex · GitHub"
[7]: https://github.com/addyosmani/agent-skills/blob/main/docs/getting-started.md?utm_source=chatgpt.com "agent-skills/docs/getting-started.md at main · addyosmani/agent-skills · GitHub"
[8]: https://github.com/addyosmani/agent-skills/blob/main/skills/spec-driven-development/SKILL.md?utm_source=chatgpt.com "agent-skills/skills/spec-driven-development/SKILL.md at main · addyosmani/agent-skills · GitHub"
[9]: https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md?plain=1&utm_source=chatgpt.com "agent-skills/skills/react-best-practices/SKILL.md at main · vercel-labs/agent-skills · GitHub"
[10]: https://github.com/vercel-labs/agent-skills?utm_source=chatgpt.com "GitHub - vercel-labs/agent-skills: Vercel's official collection of agent skills · GitHub"
[11]: https://github.com/github/awesome-copilot/blob/main/skills/webapp-testing/SKILL.md?utm_source=chatgpt.com "awesome-copilot/skills/webapp-testing/SKILL.md at main · github/awesome-copilot · GitHub"
[12]: https://github.com/expo/skills?utm_source=chatgpt.com "GitHub - expo/skills: A collection of AI agent skills for working with Expo projects and Expo Application Services · GitHub"
[13]: https://github.com/supabase/agent-skills/blob/main/README.md?utm_source=chatgpt.com "agent-skills/README.md at main · supabase/agent-skills · GitHub"
[14]: https://github.com/supabase/agent-skills/blob/main/skills/supabase-postgres-best-practices/references/security-rls-basics.md?utm_source=chatgpt.com "agent-skills/skills/supabase-postgres-best-practices/references/security-rls-basics.md at main · supabase/agent-skills · GitHub"
[15]: https://github.com/cloudflare/skills?utm_source=chatgpt.com "GitHub - cloudflare/skills: Skills for teaching agents how to build on Cloudflare. · GitHub"
[16]: https://github.com/cloudflare/skills/blob/main/skills/cloudflare/SKILL.md?utm_source=chatgpt.com "skills/skills/cloudflare/SKILL.md at main · cloudflare/skills · GitHub"
[17]: https://github.com/getsentry/sentry-for-ai?utm_source=chatgpt.com "GitHub - getsentry/sentry-for-ai: Teach your AI coding assistant how to use Sentry - setup, debugging, alerts, and more · GitHub"
[18]: https://github.com/github/awesome-copilot/blob/main/skills/security-review/SKILL.md?utm_source=chatgpt.com "awesome-copilot/skills/security-review/SKILL.md at main · github/awesome-copilot · GitHub"
[19]: https://github.com/trailofbits/skills?utm_source=chatgpt.com "GitHub - trailofbits/skills: Trail of Bits Claude Code skills for security research, vulnerability detection, and audit workflows · GitHub"
[20]: https://github.com/supabase/agent-skills/blob/main/AGENTS.md?utm_source=chatgpt.com "agent-skills/AGENTS.md at main · supabase/agent-skills · GitHub"
[21]: https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md?utm_source=chatgpt.com "skills/skills/.system/skill-creator/SKILL.md at main · openai/skills · GitHub"
