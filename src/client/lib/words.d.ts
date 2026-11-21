import { type PoolWord } from "@/data/wordPool";
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
}
export declare function splitMeaning(m: string): {
    ja: string;
    zh: string;
};
export declare function toWord(p: PoolWord): Word;
export declare const WORDS: Word[];
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
export declare const WORD_ROWS: WordRow[];
export declare function fromRow(r: WordRow): Word;
export declare function validateWord(input: Record<string, unknown>, partial?: boolean): Record<string, string>;
export declare const RELATION_LABEL: Record<Relation, string>;
export declare function hash(s: string): number;
export declare function personalFact(word: Word, player: string, round: number): string;
