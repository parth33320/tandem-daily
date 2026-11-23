export type Direction = "zh2ja" | "ja2zh" | "en";

export type OptionSet = {
  options: string[];
  correct: number;
  drop: number[];
};

export interface Word {
  id: number;
  form: string;
  zhForm: string;
  reading: string;
  pinyin: string;
  ja: string;
  zh: string;
  relation: "true" | "false" | "partial";
  kind?: "falseFriend";
  category: string;
  example: string;
  facts: string[];
  by?: string;
  trap?: boolean;
  clues?: [string, string];
  radical?: {
    charIndex: number;
    glyph: string;
    icon: string;
    name: string;
    position: "left" | "top" | "whole";
    breakdown: string;
  };
}

export type RoundContent = OptionSet & {
  word: Word;
  zh: OptionSet;
};

export function similarity(seen: { relation: string }[]): {
  total: number;
  same: number;
  partial: number;
  different: number;
  pct: number;
} {
  const counts: Record<string, number> = { true: 0, partial: 0, false: 0 };
  for (const w of seen) counts[w.relation] = (counts[w.relation] ?? 0) + 1;
  const same = counts["true"] ?? 0;
  return {
    total: seen.length,
    same,
    partial: counts["partial"] ?? 0,
    different: counts["false"] ?? 0,
    pct: seen.length ? Math.round((same / seen.length) * 100) : 0,
  };
}