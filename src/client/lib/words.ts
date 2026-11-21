import { wordPool, type PoolWord, type PoolRelation } from "@/shared/wordPool";

export type Relation = "true" | "false" | "partial";

export interface Word {
  id: number;
  form: string;
  zhForm: string;
  reading: string;
  pinyin: string;
  ja: string;
  zh: string;
  relation: Relation;
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

const REL: Record<PoolRelation, Relation> = {
  true_friend: "true",
  false_friend: "false",
  half_friend: "partial",
};

const CATEGORY: Record<Relation, string> = {
  true: "a true friend — trust your instinct",
  false: "a false friend — your instinct is a trap",
  partial: "a half friend — related, but shifted",
};

export function splitMeaning(m: string): { ja: string; zh: string } {
  const hit = /JP:\s*(.+?)\s*;\s*ZH:\s*(.+)$/i.exec(m.trim());
  if (hit) {
    return {
      ja: hit[1]!.trim(),
      zh: hit[2]!.trim().replace(/[.;]+$/, ""),
    };
  }
  const same = m.trim().replace(/[.;]+$/, "");
  return { ja: same, zh: same };
}

export function toWord(p: PoolWord): Word {
  const { ja, zh } = splitMeaning(p.meaning_en);
  const relation = REL[p.relation] as Relation;
  const result: Word = {
    id: p.id,
    form: p.kanji,
    zhForm: p.kanji,
    reading: p.jp_reading,
    pinyin: p.zh_pinyin,
    ja,
    zh,
    relation,
    category: CATEGORY[relation],
    example: `Japanese: ${p.jp_reading} · Chinese: ${p.zh_pinyin}`,
    facts: [p.fun_fact],
    clues: p.clues,
  };
  if (p.radical) {
    result.radical = p.radical;
  }
  return result;
}

export const WORDS: Word[] = wordPool.map(toWord);

export interface WordRow {
  id: number;
  form: string;
  zh_form: string;
  reading: string;
  pinyin: string;
  meaning_ja: string;
  meaning_zh: string;
  relation: Relation;
  note: string | null;
}

export const WORD_ROWS: WordRow[] = WORDS.map((w) => ({
  id: w.id,
  form: w.form,
  zh_form: w.zhForm || w.form,
  reading: w.reading,
  pinyin: w.pinyin,
  meaning_ja: w.ja,
  meaning_zh: w.zh,
  relation: w.relation,
  note: w.facts[0] ?? null,
}));

export function fromRow(r: WordRow): Word {
  return {
    id: r.id,
    form: r.form,
    zhForm: r.zh_form || r.form,
    reading: r.reading,
    pinyin: r.pinyin,
    ja: r.meaning_ja,
    zh: r.meaning_zh,
    relation: r.relation,
    category: CATEGORY[r.relation] as string,
    example: `Japanese: ${r.reading} · Chinese: ${r.pinyin}`,
    facts: [r.note || `${r.form} was added to the table by the Tandem community.`],
  };
}

export function validateWord(
  input: Record<string, unknown>,
  partial = false
): Record<string, string> {
  const errors: Record<string, string> = {};
  const CJK = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々〆ー]{1,8}$/u;
  const LATIN = /^[\p{Script=Latin}\p{M}\s'’\-·.]{1,40}$/u;
  const check = (
    key: string,
    ok: (v: string) => boolean,
    msg: string,
    optional = false
  ) => {
    const v = input[key];
    if (v === undefined || v === null || v === "") {
      if (!partial && !optional) errors[key] = "Required.";
      return;
    }
    if (typeof v !== "string" || !ok(v.trim())) errors[key] = msg;
  };
  check("form", (v) => CJK.test(v), "Use 1–8 Chinese characters or kana, e.g. 手紙.");
  check("zh_form", (v) => /^\p{Script=Han}{1,8}$/u.test(v), "Use 1–8 Chinese characters, e.g. 汽车.", true);
  check("reading", (v) => LATIN.test(v), "Write the Japanese reading in romaji, e.g. tegami.");
  check("pinyin", (v) => LATIN.test(v), "Write the pinyin, e.g. shǒuzhǐ.");
  check("meaning_ja", (v) => v.length >= 2 && v.length <= 60, "2–60 characters.");
  check("meaning_zh", (v) => v.length >= 2 && v.length <= 60, "2–60 characters.");
  check("relation", (v) => ["true", "false", "partial"].includes(v), "Pick true, false or half friend.");
  check("note", (v) => v.length <= 280, "Keep the fun fact under 280 characters.", true);
  const ja = String(input["meaning_ja"] ?? "").trim().toLowerCase();
  const zh = String(input["meaning_zh"] ?? "").trim().toLowerCase();
  if (!errors["meaning_ja"] && !errors["meaning_zh"] && ja && zh) {
    if (input["relation"] === "true" && ja !== zh)
      errors["meaning_zh"] = "True friends mean the same thing: use the same meaning in both.";
    if (input["relation"] === "false" && ja === zh)
      errors["meaning_zh"] = "False friends need different meanings in each language.";
  }
  return errors;
}

export const RELATION_LABEL: Record<Relation, string> = {
  true: "True friend",
  false: "False friend",
  partial: "Half friend",
};

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

export function personalFact(word: Word, player: string, round: number): string {
  return word.facts[hash(`${player}:${round}`) % word.facts.length]!;
}