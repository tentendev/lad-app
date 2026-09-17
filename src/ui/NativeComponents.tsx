import type { ComponentProps } from "react";
import { useWindowDimensions } from "react-native";
import { Button as HeroButton, Typography as HeroTypography } from "heroui-native";

export { Card } from "heroui-native";

// RN 0.86 Fabric can retain stale measurements after a runtime Dynamic Type
// change (react-native#57512). Remount only text/control leaves, preserving
// screen state, navigation, form values and open dialogs.
function Text(props: ComponentProps<typeof HeroTypography>) {
  const { fontScale } = useWindowDimensions();
  return <HeroTypography key={fontScale} {...props} />;
}
function Heading(props: ComponentProps<typeof HeroTypography.Heading>) {
  const { fontScale } = useWindowDimensions();
  return <HeroTypography.Heading key={fontScale} {...props} />;
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
