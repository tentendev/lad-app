import type { JSX } from "react";
import { Stack } from "expo-router";
import Head from "expo-router/head";

import { ClerkAppProvider } from "@/auth/ClerkAppProvider";
import "../web.css";

export default function WebRootLayout(): JSX.Element {
  return (
    <>
      <Head>
        <title>深空省省</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="description" content="深空省省：抽卡課金規劃工具，支援《戀與深空》的排期、預算與資源換算。" />
        <meta name="theme-color" content="#7765a7" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="zh_TW" />
        <meta property="og:site_name" content="深空省省" />
        <meta property="og:title" content="深空省省｜抽卡與課金規劃好幫手" />
        <meta property="og:description" content="整理排期、控制預算、換算抽卡資源；資料預設只留在你的裝置。" />
        <meta name="application-name" content="深空省省" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="深空省省" />
      </Head>
      <ClerkAppProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
      </ClerkAppProvider>
    </>
  );
}
