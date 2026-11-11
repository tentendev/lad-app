import { forwardRef } from "react";
import { TextInput, useWindowDimensions, type TextInputProps } from "react-native";
import { APP_COLORS } from "@/theme/tokens";

// Keep the native ref API (focus/blur) while sharing readable field defaults.
export type NativeInputRef = TextInput;
export const NativeInput = forwardRef<TextInput, TextInputProps & { className?: string }>(
  function NativeInput({ style, ...props }, ref) {
    const { fontScale } = useWindowDimensions();
    return <TextInput
      key={fontScale}
      ref={ref}
      allowFontScaling
      maxFontSizeMultiplier={0}
      placeholderTextColor="#ded7ed"
      {...props}
      style={[{
        fontSize: 16, lineHeight: 24, minHeight: 48, paddingVertical: 11, paddingHorizontal: 13,
        borderRadius: 13, borderWidth: 1, borderColor: APP_COLORS.line, backgroundColor: APP_COLORS.input,
      }, style]}
    />;
  },
);
