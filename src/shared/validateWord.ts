export function validateWord(input: Record<string, unknown>, partial = false): Record<string, string> {
  const errors: Record<string, string> = {};
  const CJK = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々〆ー]{1,8}$/u;
  const LATIN = /^[\p{Script=Latin}\p{M}\s'’\-·.]{1,40}$/u;
  const check = (key: string, ok: (v: string) => boolean, msg: string, optional = false) => {
    const v = input[key];
    if (v === undefined || v === null || v === "") { if (!partial && !optional) errors[key] = "Required."; return; }
    if (typeof v !== "string" || !ok(v.trim())) errors[key] = msg;
  };
  check("form", (v) => CJK.test(v), "Use 1-8 Chinese characters or kana, e.g. 手紙.");
  check("zh_form", (v) => /^\p{Script=Han}{1,8}$/u.test(v), "Use 1-8 Chinese characters, e.g. 汽车.", true);
  check("reading", (v) => LATIN.test(v), "Write the Japanese reading in romaji, e.g. tegami.");
  check("pinyin", (v) => LATIN.test(v), "Write the pinyin, e.g. shǒuzhǐ.");
  check("meaning_ja", (v) => v.length >= 2 && v.length <= 60, "2-60 characters.");
  check("meaning_zh", (v) => v.length >= 2 && v.length <= 60, "2-60 characters.");
  check("relation", (v) => ["true", "false", "partial"].includes(v), "Pick true, false or half friend.");
  check("note", (v) => v.length <= 280, "Keep the fun fact under 280 characters.", true);
  const ja = String(input["meaning_ja"] ?? "").trim().toLowerCase(), zh = String(input["meaning_zh"] ?? "").trim().toLowerCase();
  if (!errors["meaning_ja"] && !errors["meaning_zh"] && ja && zh) {
    if (input["relation"] === "true" && ja !== zh) errors["meaning_zh"] = "True friends mean the same thing: use the same meaning in both.";
    if (input["relation"] === "false" && ja === zh) errors["meaning_zh"] = "False friends need different meanings in each language.";
  }
  return errors;
}