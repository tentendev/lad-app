import type { ComponentProps } from "react";
import { useWindowDimensions } from "react-native";
import { Button as HeroButton, Card as HeroCard, Typography as HeroTypography } from "heroui-native";
import { APP_COLORS } from "@/theme/tokens";
import { NATIVE_FONTS } from "@/theme/native";
import { PearlSurface } from "./PearlSurface";

function CardRoot({ style, children, variant = "transparent", ...props }: ComponentProps<typeof HeroCard>) {
  return <HeroCard {...props} variant={variant} style={[{
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e7dfef",
    backgroundColor: APP_COLORS.glass,
    overflow: "visible",
    boxShadow: "0px 7px 16px -7px rgba(76,49,104,0.22), 0px 2px 4px rgba(76,49,104,0.05), inset 0px 2px 1px rgba(255,255,255,0.95), inset 0px -1px 1px rgba(194,174,214,0.15)",
  }, style]}><PearlSurface />{children}</HeroCard>;
}

export const Card = Object.assign(CardRoot, {
  Header: HeroCard.Header,
  Body: HeroCard.Body,
  Footer: HeroCard.Footer,
  Title: HeroCard.Title,
  Description: HeroCard.Description,
});

// RN 0.86 Fabric can retain stale measurements after a runtime Dynamic Type
// change (react-native#57512). Remount only text/control leaves, preserving
// screen state, navigation, form values and open dialogs.
function Text({ style, ...props }: ComponentProps<typeof HeroTypography>) {
  const { fontScale } = useWindowDimensions();
  return <HeroTypography key={fontScale} {...props} style={[{ fontFamily: NATIVE_FONTS.heading }, style]} />;
}
function Heading({ style, ...props }: ComponentProps<typeof HeroTypography.Heading>) {
  const { fontScale } = useWindowDimensions();
  return <HeroTypography.Heading key={fontScale} {...props} style={[{ fontFamily: NATIVE_FONTS.heading }, style]} />;
}
function Paragraph(props: ComponentProps<typeof HeroTypography.Paragraph>) {
  const { fontScale } = useWindowDimensions();
  return <HeroTypography.Paragraph key={fontScale} {...props} />;
}
function Code(props: ComponentProps<typeof HeroTypography.Code>) {
  const { fontScale } = useWindowDimensions();
  return <HeroTypography.Code key={fontScale} {...props} />;
}
function ButtonRoot({ style, background, children, variant = "primary", ...props }: ComponentProps<typeof HeroButton>) {
  const { fontScale } = useWindowDimensions();
  const filled = variant === "primary" || variant === "secondary" || variant === "tertiary";
  return <HeroButton key={fontScale} {...props} variant={variant} background={background ?? (filled ? <HeroButton.Background><PearlSurface tone={variant === "primary" ? "primary" : "glass"}/></HeroButton.Background> : undefined)} style={[filled ? { borderWidth: 1, borderColor: variant === "primary" ? "#b7a0cc" : "#e2d8ec", boxShadow: "0px 5px 10px -4px rgba(106,74,138,0.27), inset 0px 1px 1px rgba(255,255,255,0.7)", borderRadius: 22 } : undefined, style]}>{typeof children === "string" ? <HeroButton.Label style={{ fontFamily: NATIVE_FONTS.heading, fontSize: 20, fontWeight: "700" }}>{children}</HeroButton.Label> : children}</HeroButton>;
}

export const Typography = Object.assign(Text, { Heading, Paragraph, Code });
export const Button = Object.assign(ButtonRoot, {
  Label: HeroButton.Label,
  Background: HeroButton.Background,
});
