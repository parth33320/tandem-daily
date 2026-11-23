import { useState } from "react";
import { motion } from "framer-motion";
import { similarity } from "../../shared/game/content";

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'var(--scene)' }}>
      <div className="glass rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center space-y-8">
        {/* Victory/Defeat - Gold gradient Cormorant */}
        <h1 className="font-display text-4xl sm:text-5xl font-bold gold-text">
          {score === 500 ? "Perfect!" : score >= 300 ? "Good Job!" : "Keep Learning!"}
        </h1>

        {/* Similarity Meter - glass progress bar */}
        <motion.div className="glass rounded-xl p-6 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <p className="font-sans text-xs uppercase tracking-wide text-gold/60">Similarity</p>
          
          <div className="relative h-3 bg-paper-ink/10 rounded-full overflow-hidden">
            <motion.div
              className="similarity-fill"
              initial={{ width: 0 }}
              animate={{ width: `${sim.pct}%` }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          
          {/* Breakdown sentence from existing similarity() helper */}
          <p className="font-sans text-sm text-paper-ink/80 leading-relaxed">
            {score === 500
              ? "Perfect harmony — every meaning aligned across both languages."
              : score >= 300
                ? "Strong resonance — most meanings bridged the gap."
                : "Faint echo — the languages drifted apart this round."}
          </p>
        </motion.div>

        {/* Scorecard Box */}
        <motion.div className="glass rounded-xl p-4 space-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <div className="flex justify-between font-sans text-sm">
            <span className="text-paper-ink/60">Score</span>
            <span className="font-bold text-gold">{score}/500</span>
          </div>
          <div className="flex justify-between font-sans text-sm">
            <span className="text-paper-ink/60">Streak</span>
            <span className="font-bold text-gold">{streak} day{streak !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex justify-between font-sans text-sm">
            <span className="text-paper-ink/60">Emoji</span>
            <span className="font-mono text-base">{emoji}</span>
          </div>
        </motion.div>

        {/* Gold Share Button */}
        <motion.button
          onClick={handleShare}
          disabled={shareStatus !== "idle"}
          className="w-full bg-primary text-primary-foreground font-sans font-semibold py-3.5 rounded-full text-base shadow-[0_4px_20px_-4px_oklch(0.78_0.13_80/0.5)] hover:shadow-[0_6px_30px_-6px_oklch(0.78_0.13_80/0.7)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {shareStatus === "loading" && "Posting..."}
          {shareStatus === "success" && "✅ Shared to Comments!"}
          {shareStatus === "error" && "❌ Failed — Tap to Retry"}
          {shareStatus === "idle" && "Share Score to Comments"}
        </motion.button>
        
        {shareStatus === "error" && (
          <p className="text-xs text-rose-500 text-center">{shareError}</p>
        )}

{/* Gold Play Again Button */}
        <motion.button
          onClick={onPlayAgain}
          className="w-full border-2 border-primary text-primary font-sans font-semibold py-3.5 rounded-full text-base hover:bg-primary/10 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          data-testid="play-again-button"
        >
          Play Again
        </motion.button>
      </div>
    </div>
  );
}

export default EndScreen;