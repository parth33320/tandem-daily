import { useState, useEffect, useCallback, useRef } from "react";
import type { DailyResponse, Direction, ScoreResponse, ShareResponse } from "@/shared/api";
import { dealDailyCards } from "@/lib/daily";
import { WORDS } from "@/lib/words";

interface LifelinesUsed {
  fiftyFifty: boolean;
  xray: boolean;
  twentyQuestions: number;
  askSubreddit: boolean;
}

interface UseDailyGameState {
  loading: boolean;
  error: string | null;
  daily: DailyResponse | null;
  currentCard: number;
  score: number;
  answers: { cardIdx: number; choiceIdx: number; correct: boolean }[];
  usedHints: string[];
  revealed: boolean;
  eliminatedIndices: number[];
  phase: "start" | "playing" | "revealed" | "ended";
  timer: number;
  timerPaused: boolean;
  timerPausedUntil: number;
  timerEnabled: boolean;
  lifelinesUsed: LifelinesUsed;
  showRadicalOverlay: boolean;
  showClues: string[];
  showCommunityStats: boolean;
  practiceMode: boolean;
  _practiceSeed: number | undefined;
  pendingStartGame: boolean;
  pendingPractice: boolean;
}

const BASE_POINTS = 100;
const HINT_COSTS: Record<string, number> = { eliminate: 20 };
const LIFELINE_COSTS: Record<keyof LifelinesUsed, number> = { fiftyFifty: 20, xray: 20, twentyQuestions: 15, askSubreddit: 20 };
const MAX_TWENTY_QUESTIONS = 2;
const TIMER_DURATION = 15;
const LIFELINE_PAUSE_MS = 2000;

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
    eliminatedIndices: [],
    phase: "start",
    timer: TIMER_DURATION,
    timerPaused: false,
    timerPausedUntil: 0,
    timerEnabled: true,
    lifelinesUsed: { fiftyFifty: false, xray: false, twentyQuestions: 0, askSubreddit: false },
    showRadicalOverlay: false,
    showClues: [],
    showCommunityStats: false,
    practiceMode: false,
    _practiceSeed: undefined,
    pendingStartGame: false,
    pendingPractice: false,
  });

  const timerRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...s, timer: TIMER_DURATION, timerPaused: false, timerPausedUntil: 0 }));
    if (!state.timerEnabled) return;
    timerRef.current = window.setInterval(() => {
      setState((s) => {
        if (s.timerPaused || s.revealed || s.phase !== "playing" || !s.timerEnabled) return s;
        const next = s.timer - 1;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...s, timer: 0, revealed: true };
        }
        return { ...s, timer: next };
      });
    }, 1000);
  }, [clearTimers]);

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

  // Start game automatically when daily data loads and there's a pending start
  useEffect(() => {
    if (state.pendingStartGame && state.daily) {
      const seed = state._practiceSeed;
      const practice = state.pendingPractice;
      setState((s) => ({
        ...s,
        phase: "playing",
        currentCard: 0,
        score: 0,
        answers: [],
        usedHints: [],
        revealed: false,
        eliminatedIndices: [],
        lifelinesUsed: { fiftyFifty: false, xray: false, twentyQuestions: 0, askSubreddit: false },
        showRadicalOverlay: false,
        showClues: [],
        showCommunityStats: false,
        practiceMode: practice,
        _practiceSeed: seed,
        pendingStartGame: false,
        pendingPractice: false,
      }));
      setTimeout(startTimer, 300);
    }
  }, [state.daily, state.pendingStartGame, state.pendingPractice, state._practiceSeed, startTimer]);

  const pauseTimer = useCallback((duration = LIFELINE_PAUSE_MS) => {
    setState((s) => ({ ...s, timerPaused: true, timerPausedUntil: Date.now() + duration }));
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = window.setTimeout(() => {
      setState((s) => ({ ...s, timerPaused: false, timerPausedUntil: 0 }));
    }, duration);
  }, []);

  const startGame = useCallback((practice = false) => {
    clearTimers();
    const seed = practice ? Date.now() : undefined;
    setState((s) => {
      // If daily is already loaded, start immediately; otherwise queue the start
      if (s.daily) {
        let newCards = s.daily.cards;
        if (practice) {
          newCards = dealDailyCards(s.daily.puzzleNumber, direction, WORDS, Date.now());
        }
        return {
          ...s,
          phase: "playing",
          currentCard: 0,
          score: 0,
          answers: [],
          usedHints: [],
          revealed: false,
          eliminatedIndices: [],
          lifelinesUsed: { fiftyFifty: false, xray: false, twentyQuestions: 0, askSubreddit: false },
          showRadicalOverlay: false,
          showClues: [],
          showCommunityStats: false,
          practiceMode: practice,
          _practiceSeed: seed,
          pendingStartGame: false,
          pendingPractice: false,
          daily: { ...s.daily, cards: newCards },
        };
      }
      return {
        ...s,
        pendingStartGame: true,
        pendingPractice: practice,
        _practiceSeed: seed,
      };
    });
    setTimeout(startTimer, 300);
  }, [clearTimers, startTimer, direction]);

  const calculateRoundPoints = useCallback((correct: boolean, usedHints: string[], lifelinesUsed: LifelinesUsed) => {
    if (!correct) return 0;
    let points = BASE_POINTS;
    for (const h of usedHints) points -= HINT_COSTS[h] || 0;
    for (const [key, count] of Object.entries(lifelinesUsed)) {
      if (key === "twentyQuestions") {
        points -= (count as number) * LIFELINE_COSTS.twentyQuestions;
      } else if (lifelinesUsed[key as keyof LifelinesUsed]) {
        points -= LIFELINE_COSTS[key as keyof LifelinesUsed];
      }
    }
    return Math.max(0, points);
  }, []);

  const selectAnswer = useCallback(async (choiceIdx: number) => {
    const { daily, currentCard, usedHints, lifelinesUsed } = state;
    if (!daily || state.revealed) return;

    clearTimers();
    const card = daily.cards[currentCard];
    if (!card) return;
    const correct = choiceIdx === card.correct;
    const points = calculateRoundPoints(correct, usedHints, lifelinesUsed);

    setState((s) => ({
      ...s,
      revealed: true,
      score: s.score + points,
      answers: [...s.answers, { cardIdx: s.currentCard, choiceIdx, correct }],
    }));
  }, [state, clearTimers, calculateRoundPoints]);

  const useHint = useCallback((hint: "eliminate") => {
    const { daily, currentCard, usedHints } = state;
    if (!daily || usedHints.includes(hint)) return;

    const card = daily.cards[currentCard];
    if (!card) return;
    if (hint === "eliminate") {
      const wrong = [0, 1, 2, 3].filter((i) => i !== card.correct);
      const keep = wrong[Math.floor(Math.random() * wrong.length)];
      const newEliminated = wrong.filter((i) => i !== keep);
      setState((s) => ({
        ...s,
        usedHints: [...s.usedHints, hint],
        eliminatedIndices: newEliminated,
      }));
    }
  }, [state]);

  const useLifeline = useCallback((type: "fiftyFifty" | "xray" | "twentyQuestions" | "askSubreddit") => {
    const { daily, currentCard, lifelinesUsed } = state;
    if (!daily) return;

    const card = daily.cards[currentCard];
    if (!card) return;

    if (type === "fiftyFifty") {
      if (lifelinesUsed.fiftyFifty) return;
      const wrong = [0, 1, 2, 3].filter((i) => i !== card.correct);
      const keep = wrong[Math.floor(Math.random() * wrong.length)];
      const newEliminated = wrong.filter((i) => i !== keep);
      setState((s) => ({
        ...s,
        lifelinesUsed: { ...s.lifelinesUsed, fiftyFifty: true },
        eliminatedIndices: newEliminated,
      }));
      pauseTimer();
    } else if (type === "xray") {
      if (lifelinesUsed.xray || !card.word.radical) return;
      setState((s) => ({
        ...s,
        lifelinesUsed: { ...s.lifelinesUsed, xray: true },
        showRadicalOverlay: true,
      }));
      pauseTimer();
    } else if (type === "twentyQuestions") {
      if (lifelinesUsed.twentyQuestions >= MAX_TWENTY_QUESTIONS) return;
      const nextCount = lifelinesUsed.twentyQuestions + 1;
      setState((s) => ({
        ...s,
        lifelinesUsed: { ...s.lifelinesUsed, twentyQuestions: nextCount },
        showClues: [...s.showClues, card.word.clues?.[nextCount - 1] || ""],
      }));
      pauseTimer();
    } else if (type === "askSubreddit") {
      if (lifelinesUsed.askSubreddit) return;
      setState((s) => ({
        ...s,
        lifelinesUsed: { ...s.lifelinesUsed, askSubreddit: true },
        showCommunityStats: true,
      }));
      pauseTimer();
    }
  }, [state, pauseTimer]);

  const toggleTimer = useCallback(() => {
    setState((s) => ({ ...s, timerEnabled: !s.timerEnabled }));
    if (state.timerEnabled) {
      clearTimers();
    } else {
      setTimeout(startTimer, 0);
    }
  }, [state.timerEnabled, clearTimers, startTimer]);

  const submitScore = useCallback(async () => {
    const { daily, score, answers } = state;
    if (!daily || state.practiceMode) return;

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

  const shareScore = useCallback(async (onStatus?: (status: "loading" | "success" | "error", error?: string) => void) => {
    const { daily, score } = state;
    const streak = daily?.streak ?? 0;
    if (!daily) return;

    onStatus?.("loading");
    const emoji = state.answers.map((a) => (a.correct ? "🟩" : "🟥")).join("");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puzzleNumber: daily.puzzleNumber, score, maxScore: 5, streak, emoji }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ShareResponse = await res.json();
      if (data.ok) {
        onStatus?.("success");
      } else {
        onStatus?.("error", data.error || "Share failed");
      }
    } catch (err) {
      console.error("Failed to share score", err);
      onStatus?.("error", err instanceof Error ? err.message : "Share failed");
    }
  }, [state]);

  const resetGame = useCallback(() => {
    clearTimers();
    setState((s) => ({
      ...s,
      phase: "start",
      currentCard: 0,
      score: 0,
      answers: [],
      usedHints: [],
      revealed: false,
      eliminatedIndices: [],
      timer: TIMER_DURATION,
      timerPaused: false,
      timerPausedUntil: 0,
      timerEnabled: true,
      lifelinesUsed: { fiftyFifty: false, xray: false, twentyQuestions: 0, askSubreddit: false },
      showRadicalOverlay: false,
      showClues: [],
      showCommunityStats: false,
      practiceMode: false,
    }));
  }, [clearTimers]);

  const nextCard = useCallback(() => {
    clearTimers();
    setState((s) => {
      const next = s.currentCard + 1;
      if (next >= 5) {
        return { ...s, phase: "ended", revealed: false };
      }
      return {
        ...s,
        currentCard: next,
        revealed: false,
        usedHints: [],
        eliminatedIndices: [],
        lifelinesUsed: { fiftyFifty: false, xray: false, twentyQuestions: 0, askSubreddit: false },
        showRadicalOverlay: false,
        showClues: [],
        showCommunityStats: false,
      };
    });
    startTimer();
  }, [clearTimers]);

  useEffect(() => {
    if (state.daily) {
      fetchDaily();
    }
  }, [direction, fetchDaily]);

  useEffect(() => {
    if (state.phase === "playing" && !state.revealed) {
      startTimer();
    } else {
      clearTimers();
    }
    return clearTimers;
  }, [state.phase, state.revealed, startTimer, clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  return {
    ...state,
    fetchDaily,
    startGame,
    selectAnswer,
    useHint,
    useLifeline,
    toggleTimer,
    submitScore,
    shareScore,
    resetGame,
    nextCard,
  };
}