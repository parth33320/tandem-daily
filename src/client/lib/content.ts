import {
  WORDS,
  WORD_ROWS,
  fromRow,
  validateWord,
  hash,
  type Word,
} from "./words";

export type OptionSet = {
  options: string[];
  correct: number;
  drop: number[];
};

export type RoundContent = OptionSet & {
  word: Word;
  zh: OptionSet;
};

export type Direction = "zh2ja" | "ja2zh";

export const setFor = (
  c: Pick<RoundContent, "options" | "correct" | "drop" | "zh">,
  dir: Direction
): OptionSet => (dir === "ja2zh" ? c.zh : { options: c.options, correct: c.correct, drop: c.drop });

function pickDrop(correct: number, n: number): number[] {
  const wrong = [0, 1, 2, 3].filter((i) => i !== correct);
  const keep = wrong[n % 3]!;
  return wrong.filter((i) => i !== keep);
}

export function optionSet(
  answer: string,
  trap: string | null,
  pool: string[],
  n: number,
  salt: string
): OptionSet {
  const norm = (x: string) => x.trim().toLowerCase();
  const picks: string[] = [];
  if (trap && norm(trap) !== norm(answer)) picks.push(trap);
  let k = hash(`${n}-${salt}-d`);
  for (let tries = 0; picks.length < 3 && tries < 500; tries++) {
    const o = pool[k % pool.length]!;
    if (norm(o) !== norm(answer) && !picks.some((p) => norm(p) === norm(o))) picks.push(o);
    k = (Math.imul(k, 31) + 7) >>> 0;
  }
  const correct = hash(`${n}-${salt}-c`) % 4;
  const options = [...picks];
  options.splice(correct, 0, answer);
  return { options, correct, drop: pickDrop(correct, hash(`${n}-${salt}-e`)) };
}

export function dealRound(
  n: number,
  avoid: number[] = [],
  pool: Word[] = WORDS
): RoundContent {
  let idx = n % pool.length;
  for (let t = 0; t < pool.length && avoid.includes(pool[idx]!.id); t++) idx = (idx + 1) % pool.length;
  return dealWord(pool[idx]!, pool, n);
}

export function dealWord(w: Word, pool: Word[], n: number): RoundContent {
  const others = pool.filter((x) => x.id !== w.id);
  const trapJa = w.relation === "true" ? null : w.zh;
  const trapZh = w.relation === "true" ? null : w.ja;
  const ja = optionSet(w.ja, trapJa, others.map((x) => x.ja), n, "ja");
  const zh = optionSet(w.zh, trapZh, others.map((x) => x.zh), n, "zh");
  return { word: { ...w, kind: "falseFriend" }, ...ja, zh };
}

export function similaritySentence(m: {
  total: number;
  same: number;
  partial: number;
  different: number;
}): string {
  const kind = (n: number, one: string, many: string) => (n === 1 ? `1 was ${one}` : `${n} were ${many}`);
  return (
    `Of the ${m.total} word${m.total === 1 ? "" : "s"} you saw, ${m.same} meant the same in Chinese and Japanese, ` +
    `${kind(m.partial, "a half friend", "half friends")} and ${kind(m.different, "a false friend", "false friends")}.`
  );
}

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

export { WORDS, WORD_ROWS, fromRow, validateWord, hash };