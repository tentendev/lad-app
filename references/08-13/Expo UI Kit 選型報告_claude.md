# Expo UI Kit 選型報告：把「深空省省」轉成 iOS / Android 原生 App

## 一、先講結論

**沒有任何一個維護良好、熱門的「遊戲風格 Expo UI Kit」存在。** 這是搜尋後最重要的發現，而不是我沒找到。GitHub 上叫得出名字的遊戲 UI 套件（[react-native-gameui](https://github.com/holasebas/react-native-gameui)、[react-native-game-engine](https://github.com/bberak/react-native-game-engine)、[react-game-kit](https://github.com/FormidableLabs/react-game-kit)）都是多年未更新，或根本是遊戲引擎而非 UI 元件庫。

因此正確的做法是**兩層拆開選**：

| 層級 | 選擇 | 理由 |
|---|---|---|
| **基礎元件層** | [HeroUI Native](https://github.com/heroui-inc/heroui-native) (官方文件: https://heroui.com/en/docs/native/getting-started) | 唯一內建「視覺特效類」元件（Surface / ScrollShadow / DropShadowView），mobile-first，每個元件自帶動畫 |
| **樣式引擎** | [Uniwind](https://github.com/uni-stack/uniwind) (官方文件: https://docs.uniwind.dev/) | Tailwind v4、比 NativeWind 快 2–3.2 倍，HeroUI Native 的原生依賴 |
| **遊戲感層（真正的關鍵）** | [react-native-skia](https://github.com/Shopify/react-native-skia) + [Reanimated 4](https://github.com/software-mansion/react-native-reanimated) + [Rive](https://github.com/rive-app/rive-nitro-react-native) | 發光、漸層、shader、粒子、卡池動畫——UI Kit 給不了這些 |

**遊戲感 90% 來自動效與繪圖層，不來自 UI Kit。** 這是選型時最常犯的錯：以為換一個 UI Kit 就會有遊戲感。

---

## 二、關鍵誤區：「Expo UI」有兩個完全不同的意思

你說「Expo UI framework」，這個詞在 2026 年有歧義，而且選錯方向會直接毀掉遊戲感：

### 意思 A：`@expo/ui`（官方套件，**不要用在你的情境**）

自 SDK 56 起，Expo UI 的 Jetpack Compose (Android) 與 SwiftUI (iOS) API 已進入 stable，並被加入預設的 create-expo-app 模板。從 SDK 56 開始，`@expo/ui` 讓你在 iOS 用 SwiftUI、Android 用 Jetpack Compose——是真正的原生 primitives，不是 JavaScript 重新實作。

**這正好是遊戲感的反面。** `@expo/ui` 的價值在於「長得像系統原生 UI」——iOS 像 iOS、Android 像 Android。你要的是一套跨平台一致、辨識度高、帶發光與動態的自訂視覺語言。用 `@expo/ui` 做這件事，等於逆著工具的設計意圖硬幹。

Universal components 是平台原生 UI toolkit 之上的單一 API 層，Android 委派給 jetpack-compose、iOS 委派給 swift-ui，因此保留了各平台的原生外觀與手感——這句話本身就說明了它不適合你。

**唯一例外**：設定頁（預算設定、提醒門檻）這種純表單畫面，用 `@expo/ui` 的 `FieldGroup` / `Switch` / `Slider` 反而快又順手，且符合使用者對系統設定的直覺。可以混用。

### 意思 B：第三方 Expo UI Kit（你真正要選的）

以下正式比較。

---

## 三、主流候選比較

| UI Kit | 官方 URL | Stars | 樣式引擎 | 遊戲感適配度 | 備註 |
|---|---|---|---|---|---|
| [HeroUI Native](https://github.com/heroui-inc/heroui-native) | https://heroui.com/en/docs/native/ | ~3.4k | Uniwind (Tailwind v4) | **★★★★☆** | Apache 2.0，mobile-first，內建視覺特效元件 |
| [react-native-reusables](https://github.com/founded-labs/react-native-reusables) | https://reactnativereusables.com/ | ~8.5k | NativeWind / Uniwind | ★★★★☆ | MIT，copy-paste 模式，程式碼完全歸你 |
| [Tamagui](https://github.com/tamagui/tamagui) | https://tamagui.dev/ | ~14k | 自有 compiler | ★★★☆☆ | 最多 stars，唯一真正 universal (web+native)，但複雜度高 |
| [gluestack-ui](https://github.com/gluestack/gluestack-ui) | https://gluestack.io/ui/docs | ~4.9k | NativeWind v5 | ★★★☆☆ | **v5 已放棄 Next.js 支援**，轉為 native-first |
| [@expo/ui](https://github.com/expo/expo/tree/main/packages/expo-ui) | https://docs.expo.dev/versions/latest/sdk/ui/ | (expo monorepo) | 無（原生） | ★☆☆☆☆ | 官方、穩定，但刻意長得像系統原生 |
| [react-native-ui-lib](https://github.com/wix/react-native-ui-lib) | https://wix.github.io/react-native-ui-lib/ | — | 自有 | ★★☆☆☆ | 仍在升級以支援 New Architecture，目前支援 RN 0.73，版本落後太多 |

### 各家元件覆蓋度（來自 GitHub gist 實測比對）

有人做過三家的元件逐項比對，結論值得引用：

| 面向 | 最強者 | 原因 |
|---|---|---|
| Layout primitives | gluestack-ui | 有 Box、Grid、Stack、Center |
| **視覺特效** | **HeroUI Native** | **獨家有 Surface、ScrollShadow、DropShadowView** |
| Dialog / Menu 系統 | gluestack-ui / Reusables | overlay 系統完整 |
| 快速原型 | Reusables | API 簡潔、設定最少 |
| 跨平台一致性 | gluestack-ui | web + mobile 都能跑 |

HeroUI Native 聚焦 mobile-first 設計，強調精緻視覺，有獨特元件 Chip、Surface、ScrollShadow、DropShadowView、ErrorView；缺點是 layout 層較簡單，沒有 grid/box primitives。（此比對建立於 2025 年 11 月，元件清單可能已變動，實作前請核對官方文件。）

---

## 四、為什麼首選 HeroUI Native

### 1. 唯一把「視覺打磨」寫進元件 API 的一家

`Surface`、`DropShadowView`、`ScrollShadow` 這三個元件，直接對應到 gacha 手遊 UI 的核心視覺語彙：**分層、發光邊緣、卡片浮起、滾動邊界漸隱**。其他家你都得自己刻。

### 2. 動畫是內建的，不是附加的

HeroUI Native 建構在 Tailwind v4（透過 Uniwind）之上，每個元件都自帶平滑動畫、精緻細節與內建 accessibility；完全免費開源，採 Apache License 2.0。它把 `react-native-reanimated` 列為 peer dependency——安裝時需一併安裝 react-native-reanimated、react-native-gesture-handler、react-native-safe-area-context、@gorhom/bottom-sheet、react-native-svg、react-native-worklets、tailwind-merge、tailwind-variants。

這意味著它預設就在你需要的技術棧上，不必額外接線。

### 3. Uniwind 的效能優勢對動畫密集的 App 是實質差異

在 iOS 上 Uniwind 渲染 2,000+ 個原生 view 需 81ms，NativeWind 4 需 197ms（慢 2.4 倍）、NativeWind 5 需 258ms（慢 3.2 倍）；Android 上差距類似，94ms 對比 227ms 與 270ms。測試在實機 release build 執行，非模擬器。此外 NativeWind 需要在 Babel config 加入 nativewind/babel，為每次建置增加一道 transform；Uniwind 完全走 Metro bundler plugin，不改 Babel，cold build 更快。

你的 App 有排期日曆（一次渲染 30+ 格子 × 多層卡池標記），這正是 style resolution 成本會累積的場景。

### 4. 風險提醒（務必先驗證）

HeroUI Native 版本仍是 `1.0.x` 系列，很年輕。GitHub 上曾有 Expo SDK 55 下 Avatar 元件因 Reanimated 報錯「Perhaps you are trying to pass an animated style to a non-animated component」的 issue（#280，已由 #315 關閉）。

**建議動作**：開一個空專案，用你的目標 SDK 版本（見下節）跑一次官方 example app，確認無誤再投入。

### 備選：react-native-reusables

如果你打算**把視覺推得離預設值非常遠**（很可能，因為遊戲感就是要脫離預設），copy-paste 模式反而更合理——因為你反正要改掉九成樣式，不如一開始就擁有原始碼。react-native-reusables 把 shadcn/ui 帶到 React Native，元件用 Nativewind/Uniwind 打造，目前約 8.5K stars，是三家中 stars 最高的純 native 選項。

它也已經支援 Uniwind：社群提出的 Uniwind 支援請求指出，RNR 的 copy-paste 架構本來就完美適合這件事，因為使用者擁有程式碼。

---

## 五、遊戲感真正的來源：動效與繪圖層

這一節比 UI Kit 選擇重要得多。

| 套件 | 官方 URL | 用途 | 在你的 App 上的具體位置 |
|---|---|---|---|
| [react-native-skia](https://github.com/Shopify/react-native-skia) | https://shopify.github.io/react-native-skia/ | GPU 2D 繪圖、shader、發光、漸層 | 卡池類型徽章發光、預算圓環進度、抽數換算的動態數字背景 |
| [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) | https://docs.swmansion.com/react-native-reanimated/ | 手勢驅動動畫、彈簧物理 | 月份切換的滑動、Bottom Sheet、記帳彈窗 |
| [react-native-ease](https://github.com/AppAndFlow/react-native-ease) | — | 平台原生動畫，零 JS 開銷 | 背景漂浮光暈、按下回饋、卡片 enter/exit |
| [rive-nitro-react-native](https://github.com/rive-app/rive-nitro-react-native) | https://help.rive.app/runtimes/overview/react-native | 互動式向量動畫 + state machine | 抽卡結果演出、達標慶祝動畫、切頁角色反應 |
| [dotlottie-react-native](https://github.com/LottieFiles/dotlottie-react-native) | https://www.npmjs.com/package/@lottiefiles/dotlottie-react-native | Lottie / dotLottie 播放 | 較簡單的一次性特效（存夠鑽、預算警示） |
| [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler) | https://docs.swmansion.com/react-native-gesture-handler/ | 手勢 | 日曆橫滑、卡池卡片拖曳 |
| [expo-haptics](https://github.com/expo/expo/tree/main/packages/expo-haptics) | https://docs.expo.dev/versions/latest/sdk/haptics/ | 觸覺回饋 | 遊戲感最便宜的來源，每個按鍵都該有 |

### Skia 的版本要求（會影響你的 SDK 選擇）

需要 react-native@>=0.79 與 react@>=19；在原生平台上要與 Reanimated 搭配，需 react-native-reanimated@>=4.0.0（且 react-native-worklets@>=0.7.0）。目前版本 2.11.0。Skia 原生二進位檔會為 App 增加約 3–5 MB（依平台與架構而異）。

Graphite backend 目前僅在 @next 頻道作為實驗性預覽提供，不建議用於 production——用預設的 Ganesh 就好。

### react-native-ease：被低估的選擇

這是 2026 年較新的選項，值得認識。react-native-ease 是一個宣告式動畫庫，透過平台 API 驅動一切（iOS 的 Core Animation、Android 的 ObjectAnimator），沒有 JS loop、沒有 worklets、也沒有每幀的 shadow tree commit。

有第三方實機 benchmark 做出了明確的分工建議：沒有絕對的贏家，依你的畫面實際付出的成本來選：由手勢驅動的動畫（拖曳、縮放、滑動）→ Reanimated，它是唯一能把連續輸入留在 JS thread 之外的；宣告式狀態 / enter-exit / 循環 / 觸控回饋，且你在意記憶體、CPU 與電池 → react-native-ease，在這些情境下最輕、CPU 最低、掉幀最少，並讓 JS thread 幾乎閒置。

**對你的意義**：遊戲感 UI 通常有很多「一直在動」的裝飾性動畫（背景光暈流動、徽章呼吸、粒子飄浮）。這些全丟給 Reanimated 會吃掉 UI thread 預算；改用 ease 幾乎免費。手勢互動仍用 Reanimated。

該套件由 App & Flow（蒙特婁的 React Native 工程顧問公司，Expo 官方推薦）維護，且 專案內附一個 Agent Skill，會掃描你的 codebase 找出可以改用 react-native-ease 的動畫並自動遷移——這對你的 agentic workflow 特別合用。

### Rive vs Lottie：抽卡演出選哪個

**選 Rive。** 你的 App 有「抽數換算」、「達標」、「預算超標」這些狀態轉換，Rive 的 state machine 正是為此設計。Rive React Native v2 已用 Nitro 重寫；官方建議使用 data binding 而非舊式的 state machine inputs、text runs 與 events，因為 data binding 在編輯期與 runtime 都更好維護。

Lottie 適合「播一次就結束」的特效。注意部署限制：Expo 專案必須先納入原生 binary 才能渲染動畫；官方提供 withDotLottie config plugin 讓 Expo 開發者以最少設定準備 build，且 Expo Go 不含 DotLottie 原生模組，若必須停留在 Expo Go，可退回套件內附的 web 實作。

---

## 六、SDK 版本與環境決策

| 項目 | 現況 | 建議 |
|---|---|---|
| 最新 Expo SDK | SDK 57 於 2026-06-30 發布，將 React Native 從 0.85 升至 0.86，React 維持 19.2 | 用 **SDK 57** |
| 升級難度 | Expo 表示這是刻意小而聚焦的版本，意圖成為最容易的一次升級 | 低風險 |
| Reanimated | Reanimated 4.x 與 Worklets 僅支援 New Architecture 與最近三個 RN 版本 | 確保 New Architecture 開啟 |
| 建置模式 | Skia 基本用法免 config plugin；Rive / dotLottie 需 dev build | **直接放棄 Expo Go**，一開始就用 EAS dev build |

**放棄 Expo Go 這件事要一開始就決定。** 你的技術棧（Skia + Rive + Uniwind Pro 若採用）注定要 dev build，中途才切換會浪費時間。

---

## 七、Web 版怎麼辦：一個必須先決定的分叉

你現在的 App 在 Vercel 上跑，是可用的 web 版。**要不要保留？** 這個答案會反向決定 UI Kit：

| 決策 | 建議 UI Kit | 代價 |
|---|---|---|
| **只做 iOS + Android**，web 版凍結或另外維護 | HeroUI Native 或 react-native-reusables | 兩份程式碼，但 native 體驗最好 |
| **web + native 共用一套 codebase** | [Tamagui](https://github.com/tamagui/tamagui) | 唯一成熟的 universal 選項，但 compiler 增加複雜度 |

注意 gluestack 的重大轉向：因為 NativeWind v5 目前不支援 Next.js，且社群調查顯示開發者強烈偏好將此庫用於原生行動體驗而非純 web 框架，gluestack-ui 已正式放棄 Next.js 支援；universal（Next.js + Expo）monorepo 模板也隨之移除。

Tamagui 仍健康：最新版本 2.3.1，依 npm 發版節奏與 repo 活躍度分析，維護狀態為 Healthy，GitHub 約 14k stars。

**我的看法**：你的 App 是重視覺、重觸覺的工具型 App，且核心使用場景是「開手遊前後在手機上查排期、記帳」。Web 版的策略價值主要是 SEO 與零安裝試用。建議**分開**——native 走 HeroUI Native 追求體驗，web 版維持現有實作當作導流入口。硬要共用會為了 web 犧牲 native 的動效品質。

---

## 八、針對「深空省省」四個核心畫面的具體技術對應

以你的 App 實際結構（錢包 / 排期 / 換算 / 禮包試算）逐一對應：

| 畫面 | 主要挑戰 | 技術方案 |
|---|---|---|
| **本月預算 / 錢包** | 進度感、超標警示要有壓迫感 | Skia 繪製環形進度 + shader 漸層；接近門檻時用 ease 做呼吸光暈；`expo-haptics` 在超標時給 warning 震動 |
| **排期日曆** | 一格內要疊多種卡池標記，渲染量大 | Uniwind（style 成本最低）+ [FlashList](https://github.com/Shopify/flash-list) 或 [Legend List](https://github.com/LegendApp/legend-list) 做橫向月份分頁；卡池徽章用 Skia 統一繪製而非多層 View |
| **抽卡目標換算** | 數字滾動要有「機台感」 | Reanimated 數字插值 + Skia 文字繪製；達標瞬間播 Rive state machine |
| **禮包試算** | 對照表需清楚又不無聊 | HeroUI Native 的 `Surface` + `DropShadowView` 做階層卡片；「最省」那階用 Skia 描邊發光 |
| **資料儲存** | 花費記錄需離線持久化 | [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) 存設定，[expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) 存交易記錄 |

---

## 九、學習與抄襲來源（品質標註：一手 GitHub / 作者本人）

做遊戲感 UI，看範例比讀文件有效：

| 資源 | URL | 說明 |
|---|---|---|
| [enzomanuelmangano/demos](https://github.com/enzomanuelmangano/demos) | https://reactiive.io/demos | 持續累積的 React Native 動畫集合，以 Reanimated、Gesture Handler 與 Skia 打造，是 Expo 專案可直接跑 |
| [Make It Animated](https://makeitanimated.dev/) | — | 用 Reanimated、Gesture Handler、Animated API 與 Skia 打造的 React Native 動畫集，附程式碼 |
| [awesome-rive](https://github.com/rive-app/awesome-rive) | https://help.rive.app/ | Rive 官方策展的範例與教學清單，含 React Native |
| [Expo 動畫效能實測](https://expo.dev/blog/the-real-cost-of-react-native-animations-benchmarking-every-approach) | — | Expo 官方部落格，實機比較 Ease / Reanimated / Animated 的每幀成本 |

一個實用警告來自該篇實測：Reanimated 效能最大的變數不是你選哪個 animation API，而是你在 debug 還是 release build 測試。在 debug 模式下，僅 50 個 view 就會突破 60fps 的 16.67ms 幀預算並實際掉幀；同一個動畫在 release build 只花 11ms。Debug build 會騙你——若在開發時看到動畫卡頓，先在 release build 重現再驚慌。

---

## 十、明確不建議的做法

1. **不要用 `@expo/ui` 當主要 UI 層**。它的設計目標（原生外觀）與你的目標（自訂遊戲視覺）相反。當成表單頁的補充工具即可。
2. **不要用 [react-native-ui-lib](https://github.com/wix/react-native-ui-lib)**。目前支援 RN 0.73，New Architecture 支援仍在 roadmap 上且無時程——落後你的目標 SDK 太多。
3. **不要為了「找一個遊戲 UI Kit」繼續搜下去**。這個空缺是真實的，繼續找只會遇到 2019 年的殭屍 repo 或 affiliate 導流文。
4. **不要一開始就上 Uniwind Pro**。Pro 版本提供 C++ 引擎與零 re-render，但免費 OSS 版使用高度優化的 JS 引擎，效能與 Unistyles 3.0 相當，涵蓋所有標準樣式需求並完整支援 Tailwind CSS v4——先驗證瓶頸真的在樣式層再付費。

---

## 十一、來源品質說明

- **一手（GitHub / 官方文件 / 官方部落格）**：Expo 官方 changelog 與 blog、HeroUI 官方文件與 GitHub issue、Uniwind 官方 benchmark、Shopify Skia 安裝文件、Rive 官方 runtime 文件、LottieFiles 官方 repo、AppAndFlow ease repo。這些構成本報告的主要依據。
- **社群一手討論**：GitHub gist 的三家元件比對（2025-11 建立，可能已過時）、react-native-reusables issue #483 的 Uniwind 討論、Andrei Calazans 的自建 benchmark harness（附可重現 repo）。
- **次要來源**：star 數部分來自 alternativeto.net 與 react-weekly.dev 的快照，可能與當下實際數字有落差，僅供量級參考。
- **未採用**：多篇「2026 最佳 UI 庫」類型文章明顯帶 affiliate 或 AI 生成聲明，未列入判斷依據。

依照你的搜尋規範，本報告已排除所有中文來源；此主題的英文一手資料充足，無需放寬。