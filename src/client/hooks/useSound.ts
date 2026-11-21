import { useCallback } from "react";
import { playSwoosh, playTick, playCorrect, playWrong, setSfxMuted } from "@/utils/soundEffects";

export function useSound() {
  const playCardSwoosh = useCallback(() => playSwoosh(), []);
  const playTickSound = useCallback(() => playTick(), []);
  const playCorrectSound = useCallback(() => playCorrect(), []);
  const playWrongSound = useCallback(() => playWrong(), []);
  const setMuted = useCallback((m: boolean) => setSfxMuted(m), []);

  return { playCardSwoosh, playTickSound, playCorrectSound, playWrongSound, setMuted };
}