import { WORDS, WORD_ROWS, fromRow, validateWord, hash, type Word } from "./words";
export type OptionSet = {
    options: string[];
    correct: number;
    drop: number[];
};
export type RoundContent = OptionSet & {
    word: Word;
    zh: OptionSet;
};
export type Direction = "zh2ja" | "ja2zh" | "en";
export declare const setFor: (c: Pick<RoundContent, "options" | "correct" | "drop" | "zh">, dir: Direction) => OptionSet;
export declare function optionSet(answer: string, trap: string | null, pool: string[], n: number, salt: string): OptionSet;
export declare function dealRound(n: number, avoid?: number[], pool?: Word[]): RoundContent;
export declare function dealWord(w: Word, pool: Word[], n: number): RoundContent;
export declare function similaritySentence(m: {
    total: number;
    same: number;
    partial: number;
    different: number;
}): string;
export declare function similarity(seen: {
    relation: string;
}[]): {
    total: number;
    same: number;
    partial: number;
    different: number;
    pct: number;
};
export { WORDS, WORD_ROWS, fromRow, validateWord, hash };
