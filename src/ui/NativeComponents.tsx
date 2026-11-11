import type { ComponentProps } from "react";
import { useWindowDimensions } from "react-native";
import { Button as HeroButton, Card as HeroCard, Typography as HeroTypography } from "heroui-native";
import { APP_COLORS } from "@/theme/tokens";
import { NATIVE_FONTS } from "@/theme/native";

function CardRoot({ style, variant = "transparent", ...props }: ComponentProps<typeof HeroCard>) {
  return <HeroCard {...props} variant={variant} style={[{
    borderRadius: 20,
    borderWidth: 1,
    borderColor: APP_COLORS.line,
    backgroundColor: APP_COLORS.glass,
  }, style]} />;
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
function Text(props: ComponentProps<typeof HeroTypography>) {
  const { fontScale } = useWindowDimensions();
  return <HeroTypography key={fontScale} {...props} />;
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
function ButtonRoot(props: ComponentProps<typeof HeroButton>) {
  const { fontScale } = useWindowDimensions();
  return <HeroButton key={fontScale} {...props} />;
}

export const Typography = Object.assign(Text, { Heading, Paragraph, Code });
export const Button = Object.assign(ButtonRoot, {
  Label: HeroButton.Label,
  Background: HeroButton.Background,
});
