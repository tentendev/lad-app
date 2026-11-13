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
      placeholderTextColor="#887d94"
      {...props}
      style={[{
        fontSize: 16, lineHeight: 24, minHeight: 48, paddingVertical: 11, paddingHorizontal: 13,
        color: APP_COLORS.text, borderRadius: 12, borderWidth: 1, borderColor: "#e4daed", backgroundColor: APP_COLORS.input,
        boxShadow: "0px 3px 5px -3px rgba(79,57,108,0.14), inset 0px 2px 4px rgba(122,91,151,0.06), inset 0px 1px 0px #ffffff",
      }, style]}
    />;
  },
);
