import { Link } from "expo-router";
import { Typography } from "@/ui/NativeComponents";
import { Pressable } from "react-native";
import type { ComponentProps, PropsWithChildren } from "react";

export function NativeLink({ href, children, className }: PropsWithChildren<{
  href: ComponentProps<typeof Link>["href"];
  className?: string;
}>) {
  return <Link href={href} asChild><Pressable className="min-h-12 min-w-12 justify-center">
    <Typography className={className}>{children}</Typography>
  </Pressable></Link>;
}
