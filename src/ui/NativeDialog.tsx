import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";

export function NativeDialog({ label, onClose, children }: PropsWithChildren<{ label: string; onClose: () => void }>) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  return <Modal transparent visible animationType={reducedMotion ? "none" : "fade"} onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "center", paddingHorizontal: 16, paddingTop: Math.max(20, insets.top), paddingBottom: Math.max(20, insets.bottom), backgroundColor: "rgba(28,18,40,0.45)" }}>
      <Pressable accessible={false} onPress={onClose} style={{ position: "absolute", inset: 0 }} />
      <View accessibilityViewIsModal accessibilityLabel={label} style={{ alignSelf: "center", width: "100%", maxWidth: 520, maxHeight: height * 0.84, borderRadius: 18, backgroundColor: "#fbf9fe" }}>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" bounces={false}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
