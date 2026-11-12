import { isLocalPreview } from "@/auth/localPreview";
import { useAuth, useUser } from "@clerk/expo";
import { Link } from "expo-router";
import type { JSX } from "react";
import { Image, Pressable, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

function MemberIcon(): JSX.Element {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#80639f" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={8} r={3.5} />
      <Path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
    </Svg>
  );
}

function ConnectedAccountEntry(): JSX.Element {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const name = user?.firstName?.trim() || "會員中心";
  return (
      <Link href="/account" asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={!isLoaded ? "會員中心" : isSignedIn ? `會員 ${name}` : "會員 登入／註冊"}
          className="size-12 items-center justify-center overflow-hidden rounded-full border border-line bg-[#fbf9fe]/30"
        >
          <View className="size-8 items-center justify-center overflow-hidden rounded-full">
            {isSignedIn && user?.imageUrl ? <Image source={{ uri: user.imageUrl }} className="size-full" accessibilityIgnoresInvertColors /> : <MemberIcon />}
          </View>
        </Pressable>
      </Link>
  );
}

export function AccountEntry(): JSX.Element {
  if (isLocalPreview()) return <Link href="/account" asChild><Pressable accessibilityRole="link" accessibilityLabel="本機預覽說明" className="size-12 items-center justify-center rounded-full border border-line bg-[#fbf9fe]/30"><MemberIcon /></Pressable></Link>;
  return <ConnectedAccountEntry />;
}
