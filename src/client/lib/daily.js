import { WORDS, } from "./words";
import { dealRound, dealWord } from "./content";
export const EPOCH_START = new Date("2025-01-01T00:00:00Z");
export function getPuzzleNumber(date = new Date()) {
    const diff = date.getTime() - EPOCH_START.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}
export function getDailySeed(date = new Date()) {
    return date.toISOString().split("T")[0];
}
function isFalseFriend(word) {
    return word.relation === "false";
}
export function dealDailyCards(puzzleNum, direction, pool = WORDS) {
    const cards = [];
    const usedIds = new Set();
    for (let i = 0; i < 5; i++) {
        let n = puzzleNum * 5 + i;
        let card;
        if (i === 0) {
            const nonFalsePool = pool.filter((w) => !isFalseFriend(w));
            let idx = n % nonFalsePool.length;
            for (let t = 0; t < nonFalsePool.length && usedIds.has(nonFalsePool[idx].id); t++) {
                idx = (idx + 1) % nonFalsePool.length;
            }
            card = dealWord(nonFalsePool[idx], nonFalsePool, n);
        }
        else {
            card = dealRound(n, Array.from(usedIds), pool);
        }
        usedIds.add(card.word.id);
        cards.push(card);
    }
    return cards;
}
export function getTodaysPuzzleNumber() {
    return getPuzzleNumber(new Date());
}
export function getTodaysSeed() {
    return getDailySeed(new Date());
}
//# sourceMappingURL=daily.js.map