import { useState, useEffect, useCallback } from "react";
import type { DailyResponse, Direction, ScoreResponse } from "@/shared/api";

interface UseDailyGameState {
  loading: boolean;
  error: string | null;
  daily: DailyResponse | null;
  currentCard: number;
  score: number;
  answers: { cardIdx: number; choiceIdx: number; correct: boolean }[];
  usedHints: string[];
  revealed: boolean;
  eliminated: number[];
  showReading: boolean;
  phase: "start" | "playing" | "revealed" | "ended";
}

export function useDailyGame(direction: Direction) {
  const [state, setState] = useState<UseDailyGameState>({
    loading: true,
    error: null,
    daily: null,
    currentCard: 0,
    score: 0,
    answers: [],
    usedHints: [],
    revealed: false,
    eliminated: [],
    showReading: false,
    phase: "start",
  });

  const fetchDaily = useCallback(async () => {
    try {
      const res = await fetch("/api/daily");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DailyResponse = await res.json();
      if (data.type !== "daily") throw new Error("Unexpected response");
      setState((s) => ({ ...s, daily: data, loading: false, error: null }));
    } catch (err) {
      console.error("Failed to fetch daily", err);
      setState((s) => ({ ...s, loading: false, error: "Failed to load today's puzzle" }));
    }
  }, []);

  useEffect(() => {
    fetchDaily();
  }, [fetchDaily]);

  const startGame = useCallback(() => {
    setState((s) => ({ ...s, phase: "playing", currentCard: 0, score: 0, answers: [] }));
  }, []);

  const selectAnswer = useCallback(async (choiceIdx: number) => {
    const { daily, currentCard, usedHints } = state;
    if (!daily || state.revealed) return;

    const card = daily.cards[currentCard];
    if (!card) return;
    const correct = choiceIdx === card.correct;
    const points = correct ? 100 - usedHints.reduce((s, h) => s + (h === "eliminate" ? 20 : h === "example" ? 30 : 50), 0) : 0;

    setState((s) => ({
      ...s,
      revealed: true,
      score: s.score + Math.max(0, points),
      answers: [...s.answers, { cardIdx: s.currentCard, choiceIdx, correct }],
    }));

    await new Promise((r) => setTimeout(r, 1500));

    const nextCard = currentCard + 1;
    if (nextCard >= 5) {
      setState((s) => ({ ...s, phase: "ended", revealed: false }));
    } else {
      setState((s) => ({
        ...s,
        currentCard: nextCard,
        revealed: false,
        usedHints: [],
        eliminated: [],
        showReading: false,
      }));
    }
  }, [state]);

  const useHint = useCallback((hint: "eliminate" | "example" | "category") => {
    const { daily, currentCard, usedHints } = state;
    if (!daily || usedHints.includes(hint)) return;

    const card = daily.cards[currentCard];
    if (!card) return;
    let newEliminated = state.eliminated;
    if (hint === "eliminate") {
      const wrong = [0, 1, 2, 3].filter((i) => i !== card.correct);
      const keep = wrong[Math.floor(Math.random() * wrong.length)];
      newEliminated = wrong.filter((i) => i !== keep);
    }

    setState((s) => ({
      ...s,
      usedHints: [...s.usedHints, hint],
      eliminated: newEliminated,
      showReading: hint === "example" ? true : s.showReading,
    }));
  }, [state]);

  const submitScore = useCallback(async () => {
    const { daily, score, answers } = state;
    if (!daily) return;

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puzzleNumber: daily.puzzleNumber, score, answers, direction }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ScoreResponse = await res.json();
      if (data.type === "score") {
        setState((s) => ({ ...s, score: data.score }));
      }
    } catch (err) {
      console.error("Failed to submit score", err);
    }
  }, [state]);

  const shareScore = useCallback(async () => {
    const { daily, score } = state;
    const streak = daily?.streak ?? 0;
    if (!daily) return;

    const emoji = state.answers.map((a) => (a.correct ? "🟩" : "🟥")).join("");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puzzleNumber: daily.puzzleNumber, score, maxScore: 5, streak, emoji }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error("Failed to share score", err);
    }
  }, [state]);

  return {
    ...state,
    fetchDaily,
    startGame,
    selectAnswer,
    useHint,
    submitScore,
    shareScore,
  };
}