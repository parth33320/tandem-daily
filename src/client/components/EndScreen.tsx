import { useState } from "react";
import { similarity } from "@/lib/content";

interface EndScreenProps {
  score: number;
  streak: number;
  answers: { cardIdx: number; choiceIdx: number; correct: boolean }[];
  daily: { puzzleNumber: number; cards: { word: { relation: string } }[] };
  onShare: (onStatus: (status: "loading" | "success" | "error", error?: string) => void) => void;
  onPlayAgain: () => void;
}

export function EndScreen({ score, streak, answers, daily, onShare, onPlayAgain }: EndScreenProps) {
  const sim = similarity(daily.cards.map((c) => c.word));
  const emoji = answers.map((a) => (a.correct ? "🟩" : "🟥")).join("");
  const correctCount = answers.filter((a) => a.correct).length;

  const [shareStatus, setShareStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [shareError, setShareError] = useState<string>("");

  const handleShare = () => {
    setShareStatus("loading");
    setShareError("");
    onShare((status, error) => {
      setShareStatus(status);
      if (error) setShareError(error);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-2.5 sm:p-4 gap-2.5 sm:gap-4 text-center">
      <div className="w-full max-w-md space-y-3 sm:space-y-4">
        <div className="animate-in">
          <h1 className="text-xl sm:text-2xl font-bold text-paper mb-1 font-serif">
            {score === 500 ? "🎉 Perfect!" : score >= 300 ? "👍 Well Done!" : "📚 Keep Learning!"}
          </h1>
          <p className="text-base sm:text-lg text-gold-light mb-1 font-mono">
            {score} pts · {correctCount}/5 Correct
          </p>
        </div>

        {/* Similarity Meter */}
        <div className="game-card p-3 sm:p-4 animate-slide-up">
          <div className="text-xs sm:text-sm text-border-light mb-1.5">Similarity Meter</div>
          <div className="w-full h-3 sm:h-4 bg-ink-light/50 rounded-full overflow-hidden">
            <div
              className="h-full progress-bar-fill"
              style={{ width: `${sim.pct}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] sm:text-xs text-border-light mt-1">
            <span>0%</span>
            <span className="font-semibold text-gold-light">{sim.pct}%</span>
            <span>100%</span>
          </div>
          <p className="text-[10px] sm:text-xs text-border-light mt-1.5 text-center">
            {sim.same} true friend{sim.same !== 1 ? "s" : ""}, {sim.partial} half friend{sim.partial !== 1 ? "s" : ""}, {sim.different} false friend{sim.different !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Streak */}
        <div className="game-card p-3 sm:p-4 animate-slide-up">
          <div className="text-xs sm:text-sm text-border-light mb-1.5">Current Streak</div>
          <div className="text-2xl sm:text-3xl font-bold text-gold">🔥 {streak} day{streak !== 1 ? "s" : ""}</div>
        </div>

        {/* Shareable scorecard */}
        <div className="game-card p-2.5 sm:p-3 animate-slide-up">
          <div className="font-mono text-xs sm:text-sm text-paper break-all bg-ink-light/30 rounded p-1.5 sm:p-2">
            Tandem Daily #{daily.puzzleNumber} · {correctCount}/5 {emoji} · 🔥 {streak}-day streak
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 animate-in">
          <button
            onClick={handleShare}
            disabled={shareStatus !== "idle"}
            className="w-full py-2.5 sm:py-3 px-4 sm:px-6 btn-primary text-sm sm:text-base transition-all"
          >
            {shareStatus === "loading" && "Posting..."}
            {shareStatus === "success" && "✅ Shared to Comments!"}
            {shareStatus === "error" && `❌ Failed — Tap to Retry`}
            {shareStatus === "idle" && "Share Score to Comments"}
          </button>
          {shareStatus === "error" && (
            <div className="text-[10px] sm:text-xs text-crimson-light text-center">
              {shareError}
            </div>
          )}
          <button
            onClick={onPlayAgain}
            className="w-full py-2.5 sm:py-3 px-4 sm:px-6 btn-secondary text-sm sm:text-base"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}