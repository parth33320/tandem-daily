import {
  type Word,
  WORDS,
} from "./words";
import { dealRound, dealWord } from "./content";
import type { RoundContent, Direction } from "@/shared/api";

export const EPOCH_START = new Date("2025-01-01T00:00:00Z");

export function getPuzzleNumber(date: Date = new Date()): number {
  const diff = date.getTime() - EPOCH_START.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function getDailySeed(date: Date = new Date()): string {
  return date.toISOString().split("T")[0]!;
}

function isFalseFriend(word: Word): boolean {
  return word.relation === "false";
}

export function dealDailyCards(
  puzzleNum: number,
  _direction: Direction,
  pool: Word[] = WORDS
): RoundContent[] {
  const cards: RoundContent[] = [];
  const usedIds = new Set<number>();

  for (let i = 0; i < 5; i++) {
    let n = puzzleNum * 5 + i;
    let card: RoundContent;

    if (i === 0) {
      const nonFalsePool = pool.filter((w) => !isFalseFriend(w));
      let idx = n % nonFalsePool.length;
      for (let t = 0; t < nonFalsePool.length && usedIds.has(nonFalsePool[idx]!.id); t++) {
        idx = (idx + 1) % nonFalsePool.length;
      }
      card = dealWord(nonFalsePool[idx]!, nonFalsePool, n);
    } else {
      card = dealRound(n, Array.from(usedIds), pool);
    }

    usedIds.add(card.word.id);
    cards.push(card);
  }

  return cards;
}

export function getTodaysPuzzleNumber(): number {
  return getPuzzleNumber(new Date());
}

export function getTodaysSeed(): string {
  return getDailySeed(new Date());
}