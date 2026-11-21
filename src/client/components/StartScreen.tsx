import { useState } from "react";
import type { Direction } from "@/lib/content";

interface StartScreenProps {
  puzzleNumber: number;
  onStart: (direction: Direction) => void;
  disabled?: boolean;
}

export function StartScreen({ puzzleNumber, onStart, disabled }: StartScreenProps) {
  const [direction, setDirection] = useState<Direction>("zh2ja");

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Tandem Daily</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Puzzle #{puzzleNumber}</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <label className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-orange-500 transition-colors">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">I know Chinese → guess Japanese</span>
          <input
            type="radio"
            name="direction"
            value="zh2ja"
            checked={direction === "zh2ja"}
            onChange={() => setDirection("zh2ja")}
            className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500"
          />
        </label>
        <label className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-orange-500 transition-colors">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">I know Japanese → guess Chinese</span>
          <input
            type="radio"
            name="direction"
            value="ja2zh"
            checked={direction === "ja2zh"}
            onChange={() => setDirection("ja2zh")}
            className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500"
          />
        </label>
      </div>

      <button
        onClick={() => onStart(direction)}
        disabled={disabled}
        className="w-full max-w-sm py-3 px-6 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Play Today's 5 Cards
      </button>
    </div>
  );
}