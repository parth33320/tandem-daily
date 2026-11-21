import { type Word, type RoundContent, type Direction } from "./words";
export declare const EPOCH_START: Date;
export declare function getPuzzleNumber(date?: Date): number;
export declare function getDailySeed(date?: Date): string;
export declare function dealDailyCards(puzzleNum: number, direction: Direction, pool?: Word[]): RoundContent[];
export declare function getTodaysPuzzleNumber(): number;
export declare function getTodaysSeed(): string;
