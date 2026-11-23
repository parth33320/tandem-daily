import { useState, useCallback, useRef } from "react";
import { LINES, HOST_LANGS, type HostLang } from "../lib/host";

export function useVoiceHost() {
  const [muted, setMuted] = useState(false);
  const [lang, setLang] = useState<HostLang>("en");
  const mutedRef = useRef(false);
  const langRef = useRef<HostLang>("en");

  const unlockVoice = useCallback(() => {
    // Resume Web Audio AudioContext
    try {
      if (typeof globalThis.AudioContext !== "undefined") {
        const ctx = new AudioContext();
        if (ctx.state === "suspended") {
          void ctx.resume();
        }
      }
    } catch {
      // AudioContext not available
    }

    // Speak empty utterance to unlock speechSynthesis in iframe
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // speechSynthesis not available
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (mutedRef.current) return;
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const langInfo = HOST_LANGS.find((l) => l.id === langRef.current);
        utterance.lang = langInfo?.bcp47 || "en-US";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // speechSynthesis not available
    }
  }, []);

  const speakQuestion = useCallback((word: string, targetLang: string) => {
    speak(LINES[langRef.current].question(word, targetLang));
  }, [speak]);

  const speakCorrect = useCallback((answer: string) => {
    speak(LINES[langRef.current].correct(answer));
  }, [speak]);

  const speakWrong = useCallback((answer: string, correct: string) => {
    speak(LINES[langRef.current].wrong(answer, correct));
  }, [speak]);

  const speakTimeUp = useCallback(() => {
    speak(LINES[langRef.current].timeUp());
  }, [speak]);

  const speakWon = useCallback(() => {
    speak(LINES[langRef.current].won());
  }, [speak]);

  const speakLost = useCallback(() => {
    speak(LINES[langRef.current].lost());
  }, [speak]);

  const cancelSpeech = useCallback(() => {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // speechSynthesis not available
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      mutedRef.current = !prev;
      return !prev;
    });
    if (!mutedRef.current) {
      cancelSpeech();
    }
  }, [cancelSpeech]);

  const changeLang = useCallback((newLang: HostLang) => {
    langRef.current = newLang;
    setLang(newLang);
  }, []);

  return {
    muted,
    lang,
    unlockVoice,
    speakQuestion,
    speakCorrect,
    speakWrong,
    speakTimeUp,
    speakWon,
    speakLost,
    cancelSpeech,
    toggleMute,
    changeLang,
  };
}