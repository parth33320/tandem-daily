export type HostLang = "en" | "zh" | "ja" | "es" | "ar" | "fr";

export const HOST_LANGS: { id: HostLang; label: string; bcp47: string }[] = [
  { id: "en", label: "English", bcp47: "en-US" },
  { id: "zh", label: "中文", bcp47: "zh-CN" },
  { id: "ja", label: "日本語", bcp47: "ja-JP" },
  { id: "es", label: "Español", bcp47: "es-ES" },
  { id: "ar", label: "العربية", bcp47: "ar-SA" },
  { id: "fr", label: "Français", bcp47: "fr-FR" },
];

export interface VoiceLines {
  question: (word: string, targetLang: string) => string;
  correct: (answer: string) => string;
  wrong: (answer: string, correct: string) => string;
  timeUp: () => string;
  won: () => string;
  lost: () => string;
}

export const LINES: Record<HostLang, VoiceLines> = {
  en: {
    question: (word, _lang) => `The word is ${word}. Is it A, B, C, or D?`,
    correct: (answer) => `Correct! ${answer}.`,
    wrong: (_answer, correct) => `Wrong. The answer is ${correct}.`,
    timeUp: () => `Time's up!`,
    won: () => `Victory! Well done!`,
    lost: () => `Defeat. Keep learning!`,
  },
  zh: {
    question: (word, _lang) => `这个词是${word}。是A、B、C还是D？`,
    correct: (answer) => `正确！${answer}。`,
    wrong: (_answer, correct) => `错误。正确答案是${correct}。`,
    timeUp: () => `时间到！`,
    won: () => `胜利！做得好！`,
    lost: () => `失败。继续学习！`,
  },
  ja: {
    question: (word, _lang) => `この単語は${word}です。A、B、C、Dのどれですか？`,
    correct: (answer) => `正解！${answer}。`,
    wrong: (_answer, correct) => `不正解。正解は${correct}です。`,
    timeUp: () => `時間切れ！`,
    won: () => `勝利！おめでとう！`,
    lost: () => `敗北。学習を続けよう！`,
  },
  es: {
    question: (word, _lang) => `La palabra es ${word}. ¿Es A, B, C o D?`,
    correct: (answer) => `¡Correcto! ${answer}.`,
    wrong: (_answer, correct) => `Incorrecto. La respuesta es ${correct}.`,
    timeUp: () => `¡Se acabó el tiempo!`,
    won: () => `¡Victoria! ¡Bien hecho!`,
    lost: () => `Derrota. ¡Sigue aprendiendo!`,
  },
  ar: {
    question: (word, _lang) => `الكلمة هي ${word}. هل هي A أو B أو C أو D؟`,
    correct: (answer) => `صحيح! ${answer}.`,
    wrong: (_answer, correct) => `خطأ. الإجابة هي ${correct}.`,
    timeUp: () => `انتهى الوقت!`,
    won: () => `انتصار! أحسنت!`,
    lost: () => `هزيمة. استمر في التعلم!`,
  },
  fr: {
    question: (word, _lang) => `Le mot est ${word}. Est-ce A, B, C ou D ?`,
    correct: (answer) => `Correct ! ${answer}.`,
    wrong: (_answer, correct) => `Faux. La réponse est ${correct}.`,
    timeUp: () => `Temps écoulé !`,
    won: () => `Victoire ! Bien joué !`,
    lost: () => `Défaite. Continuez à apprendre !`,
  },
};