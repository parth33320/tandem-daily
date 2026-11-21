import { useState } from "react";
import type { Direction } from "@/shared/api";

interface StartScreenProps {
  puzzleNumber: number;
  onStart: (direction: Direction, practiceMode?: boolean) => void;
  alreadyPlayed?: boolean;
}

export function StartScreen({ puzzleNumber, onStart, alreadyPlayed }: StartScreenProps) {
  const [direction, setDirection] = useState<Direction>("zh2ja");

  return (
    <div className="flex flex-col items-center justify-center h-full p-2.5 sm:p-4 gap-3 sm:gap-5">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-paper mb-1 font-serif">Tandem Daily</h1>
        <p className="text-xs sm:text-sm text-gold-light">Puzzle #{puzzleNumber}</p>
      </div>

      {alreadyPlayed && (
        <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-emerald-light mb-1 animate-in">
          <span>✓</span>
          <span>Today's streak saved</span>
        </div>
      )}

      <div className="w-full max-w-sm space-y-1.5 sm:space-y-2">
        <label className="flex items-center justify-between p-2.5 sm:p-3 bg-ink-light/50 rounded-lg border border-border cursor-pointer hover:border-gold transition-colors">
          <span className="text-[10px] sm:text-xs font-medium text-paper">I know Chinese → guess Japanese</span>
          <input
            type="radio"
            name="direction"
            value="zh2ja"
            checked={direction === "zh2ja"}
            onChange={() => setDirection("zh2ja")}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold border-border focus:ring-gold"
          />
        </label>
        <label className="flex items-center justify-between p-2.5 sm:p-3 bg-ink-light/50 rounded-lg border border-border cursor-pointer hover:border-gold transition-colors">
          <span className="text-[10px] sm:text-xs font-medium text-paper">I know Japanese → guess Chinese</span>
          <input
            type="radio"
            name="direction"
            value="ja2zh"
            checked={direction === "ja2zh"}
            onChange={() => setDirection("ja2zh")}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold border-border focus:ring-gold"
          />
        </label>
        <label className="flex items-center justify-between p-2.5 sm:p-3 bg-ink-light/50 rounded-lg border border-border cursor-pointer hover:border-gold transition-colors">
          <span className="text-[10px] sm:text-xs font-medium text-paper">I know neither — Visual Detective</span>
          <input
            type="radio"
            name="direction"
            value="en"
            checked={direction === "en"}
            onChange={() => setDirection("en")}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold border-border focus:ring-gold"
          />
        </label>
      </div>

      <button
        onClick={() => onStart(direction, alreadyPlayed)}
        className="w-full max-w-sm py-2.5 sm:py-3 px-4 sm:px-6 btn-primary text-sm sm:text-base"
      >
        {alreadyPlayed ? "Play Again (Practice Mode)" : "Play Today's 5 Cards"}
      </button>
    </div>
  );
}