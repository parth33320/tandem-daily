import { useEffect } from "react";
import { similarity } from "@/lib/content";

interface EndScreenProps {
  score: number;
  streak: number;
  answers: { cardIdx: number; choiceIdx: number; correct: boolean }[];
  daily: { puzzleNumber: number; cards: { word: { relation: string } }[] };
  onShare: () => void;
  onPlayAgain: () => void;
}

export function EndScreen({ score, streak, answers, daily, onShare, onPlayAgain }: EndScreenProps) {
  const sim = similarity(daily.cards.map((c) => c.word));
  const emoji = answers.map((a) => (a.correct ? "🟩" : "🟥")).join("");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "share-success") {
        // Optional: show toast
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-4 text-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {score === 5 ? "🎉 Perfect!" : score >= 3 ? "👍 Good Job!" : "📚 Keep Learning!"}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">Score: {score}/5</p>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Similarity Meter</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${sim.pct}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0%</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{sim.pct}%</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            {sim.same} true friend{sim.same !== 1 ? "s" : ""}, {sim.partial} half friend{sim.partial !== 1 ? "s" : ""}, {sim.different} false friend{sim.different !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Streak</div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">🔥 {streak} day{streak !== 1 ? "s" : ""}</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 font-mono text-sm text-gray-700 dark:text-gray-300 mb-4 break-all">
          Tandem Daily #{daily.puzzleNumber} · {score}/5 {emoji} · 🔥 {streak}-day streak
        </div>

        <div className="space-y-2">
          <button
            onClick={onShare}
            className="w-full py-3 px-6 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Share Score to Comments
          </button>
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}