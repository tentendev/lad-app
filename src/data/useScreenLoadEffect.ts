import { useEffect, type EffectCallback } from "react";

// Web routes remount; native tabs remain mounted and use the focus-aware variant.
// Pass a stable callback so data is not reloaded while editing a form.
export function useScreenLoadEffect(effect: EffectCallback) {
  useEffect(() => effect(), [effect]);
}
