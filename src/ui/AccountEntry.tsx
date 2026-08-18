import { useAuth, useUser } from "@clerk/expo";
import { Link } from "expo-router";
import type { JSX } from "react";
import { Image, Pressable, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Typography } from "heroui-native";

function MemberIcon(): JSX.Element {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={8} r={3.5} />
      <Path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
    </Svg>
  );
}

export function AccountEntry(): JSX.Element {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const name = user?.firstName?.trim() || "會員中心";
  const label = !isLoaded ? "會員中心" : isSignedIn ? name : "登入／註冊";

  return (
    <View className="items-end">
      <Link href="/account" asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={!isLoaded ? "會員中心" : isSignedIn ? `會員 ${name}` : "會員 登入／註冊"}
          className="min-h-12 flex-row items-center gap-2 rounded-full border border-white/45 bg-[#3f315f]/70 py-1.5 pl-1.5 pr-3"
        >
          <View className="size-9 items-center justify-center overflow-hidden rounded-full border border-white/55 bg-white/10">
            {isSignedIn && user?.imageUrl ? <Image source={{ uri: user.imageUrl }} className="size-full" accessibilityIgnoresInvertColors /> : <MemberIcon />}
          </View>
          <View className="min-w-0">
            <Typography className="text-[10px] leading-3 text-white/60">{isSignedIn ? "已登入" : "會員"}</Typography>
            <Typography className="max-w-28 text-sm leading-5 text-white" numberOfLines={1}>{label}</Typography>
          </View>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <Path d="m9 18 6-6-6-6" />
          </Svg>
        </Pressable>
      </Link>
    </View>
  );
}
